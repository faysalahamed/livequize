'use client';

import React, { useState, useEffect, useMemo } from 'react';

interface MathRendererProps {
  text?: string | null;
  className?: string;
  as?: 'span' | 'div' | 'p' | 'h1' | 'h2' | 'h3';
}

interface Segment {
  type: 'text' | 'math-inline' | 'math-block';
  content: string;
}

// Global cached instance so KaTeX is loaded dynamically at most once
let cachedKaTeX: any = null;
let katexLoadPromise: Promise<any> | null = null;

function loadKaTeX(): Promise<any> {
  if (cachedKaTeX) return Promise.resolve(cachedKaTeX);
  if (!katexLoadPromise) {
    katexLoadPromise = import('katex')
      .then((mod) => {
        cachedKaTeX = mod.default || mod;
        return cachedKaTeX;
      })
      .catch((err) => {
        console.warn('[MathRenderer] Failed to load KaTeX dynamically:', err);
        return null;
      });
  }
  return katexLoadPromise;
}

export default function MathRenderer({
  text = '',
  className = '',
  as: Component = 'span',
}: MathRendererProps) {
  const content = text ?? '';

  // Fast path: 98% of text in quizzes has no math delimiters.
  // Bypass all hooks, state, and KaTeX loading entirely!
  const hasMath = Boolean(
    content && (content.includes('$') || content.includes('\\(') || content.includes('\\['))
  );

  if (!hasMath || !content) {
    return <Component className={className}>{content}</Component>;
  }

  return <DynamicMathComponent text={content} className={className} as={Component} />;
}

// Separate component only mounted when math delimiters are detected
function DynamicMathComponent({
  text,
  className,
  as: Component,
}: {
  text: string;
  className: string;
  as: 'span' | 'div' | 'p' | 'h1' | 'h2' | 'h3';
}) {
  const [katexInstance, setKatexInstance] = useState<any>(cachedKaTeX);

  useEffect(() => {
    if (!katexInstance) {
      loadKaTeX().then((mod) => {
        if (mod) setKatexInstance(mod);
      });
    }
  }, [katexInstance]);

  const segments = useMemo<Segment[]>(() => {
    const result: Segment[] = [];
    const regex = /\$\$([\s\S]+?)\$\$|\\\[([\s\S]+?)\\\]|\$([^\$\n]+?)\$|\\\(([\s\S]+?)\\\)/g;

    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
      const matchIndex = match.index;

      if (matchIndex > lastIndex) {
        result.push({
          type: 'text',
          content: text.slice(lastIndex, matchIndex),
        });
      }

      const displayMath = match[1] || match[2];
      const inlineMath = match[3] || match[4];

      if (displayMath !== undefined) {
        result.push({
          type: 'math-block',
          content: displayMath.trim(),
        });
      } else if (inlineMath !== undefined) {
        result.push({
          type: 'math-inline',
          content: inlineMath.trim(),
        });
      }

      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      result.push({
        type: 'text',
        content: text.slice(lastIndex),
      });
    }

    return result;
  }, [text]);

  return (
    <Component className={className}>
      {segments.map((seg, idx) => {
        if (seg.type === 'text') {
          return <React.Fragment key={idx}>{seg.content}</React.Fragment>;
        }

        const isBlock = seg.type === 'math-block';

        if (!katexInstance) {
          // Fallback while KaTeX chunk is loading asynchronously
          return (
            <span key={idx} className="font-mono text-amber-300/90 text-sm">
              {seg.content}
            </span>
          );
        }

        let html = '';
        try {
          html = katexInstance.renderToString(seg.content, {
            displayMode: isBlock,
            throwOnError: false,
            output: 'htmlAndMathml',
          });
        } catch {
          return (
            <code key={idx} className="bg-slate-800 text-amber-300 px-1 py-0.5 rounded text-sm">
              {seg.content}
            </code>
          );
        }

        return (
          <span
            key={idx}
            className={isBlock ? 'block my-2 overflow-x-auto text-center' : 'inline-block mx-0.5'}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
      })}
    </Component>
  );
}
