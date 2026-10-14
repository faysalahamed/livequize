'use client';

import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Copy, Check, ExternalLink } from 'lucide-react';

interface QrModalProps {
  pin: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function QrModal({ pin, isOpen, onClose }: QrModalProps) {
  const [copied, setCopied] = React.useState(false);
  if (!isOpen) return null;

  const joinUrl = typeof window !== 'undefined' ? `${window.location.origin}/join?pin=${pin}` : `/join?pin=${pin}`;

  const copyLink = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(joinUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 text-center relative shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/80 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-2xl font-black text-white mb-1">Join the Live Quiz</h3>
        <p className="text-slate-400 text-sm mb-6">Scan with phone camera or visit the URL</p>

        <div className="bg-white p-5 rounded-2xl inline-block shadow-inner mx-auto mb-6">
          <QRCodeSVG value={joinUrl} size={220} level="M" />
        </div>

        <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/80 mb-4">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-1">
            Game PIN
          </span>
          <span className="text-4xl font-black text-brand-400 tracking-widest font-mono">
            {pin}
          </span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={copyLink}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm transition border border-slate-700"
          >
            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied Link!' : 'Copy Direct Link'}
          </button>
          <a
            href={joinUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center p-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white transition"
            title="Open in new tab"
          >
            <ExternalLink className="w-5 h-5" />
          </a>
        </div>
      </div>
    </div>
  );
}
