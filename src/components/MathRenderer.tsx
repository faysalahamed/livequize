import React, { useMemo } from 'react';
import katex from 'katex';

interface MathRendererProps {
  text?: string | null;
  className?: string;
  as?: 'span' | 'div' | 'p' | 'h1' | 'h2' | 'h3';
}

interface Segment {
  type: 'text' | 'math-inline' | 'math-block';
  content: string;
}

export default function MathRenderer({
  text = '',
  className = '',
  as: Component = 'span',
}: MathRendererProps) {
  const content = text ?? '';

  const segments = useMemo<Segment[]>(() => {
    if (!content) return [];

    // Fast check: if no math markers ($ or \), return plain text
    if (!content.includes('$') && !content.includes('\\(') && !content.includes('\\[')) {
      return [{ type: 'text', content }];
    }

    const result: Segment[] = [];
    // Regex matching:
    // 1. $$ ... $$ (display math)
    // 2. \[ ... \] (display math)
    // 3. $ ... $ (inline math)
    // 4. \( ... \) (inline math)
    const regex = /\$\$([\s\S]+?)\$\$|\\\[([\s\S]+?)\\\]|\$([^\$\n]+?)\$|\\\(([\s\S]+?)\\\)/g;

    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(content)) !== null) {
      const matchIndex = match.index;

      // Text before the match
      if (matchIndex > lastIndex) {
        result.push({
          type: 'text',
          content: content.slice(lastIndex, matchIndex),
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

    // Remaining text after last match
    if (lastIndex < content.length) {
      result.push({
        type: 'text',
        content: content.slice(lastIndex),
      });
    }

    return result;
  }, [content]);

  if (!content) return null;

  // If no math was parsed, return plain text
  if (segments.length === 1 && segments[0].type === 'text') {
    return <Component className={className}>{content}</Component>;
  }

  return (
    <Component className={className}>
      {segments.map((seg, idx) => {
        if (seg.type === 'text') {
          return <React.Fragment key={idx}>{seg.content}</React.Fragment>;
        }

        const isBlock = seg.type === 'math-block';

        let html = '';
        try {
          html = katex.renderToString(seg.content, {
            displayMode: isBlock,
            throwOnError: false,
            output: 'htmlAndMathml',
          });
        } catch {
          // Fallback to raw text if rendering fails
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
