import React from 'react';

/**
 * Formats inline Markdown patterns: **bold**, *italic*, `code`
 */
export function formatInlineText(text) {
  if (!text) return null;
  const tokens = [];
  const regex = /(\*\*.*?\*\*|`.*?`|\*.*?\*)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      tokens.push(text.substring(lastIndex, match.index));
    }
    const chunk = match[0];
    if (chunk.startsWith('**') && chunk.endsWith('**') && chunk.length >= 4) {
      tokens.push(
        <strong key={match.index} className="font-extrabold text-white">
          {chunk.slice(2, -2)}
        </strong>
      );
    } else if (chunk.startsWith('`') && chunk.endsWith('`') && chunk.length >= 2) {
      tokens.push(
        <code key={match.index} className="px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 font-mono text-[11px] border border-slate-700">
          {chunk.slice(1, -1)}
        </code>
      );
    } else if (chunk.startsWith('*') && chunk.endsWith('*') && chunk.length >= 2) {
      tokens.push(
        <em key={match.index} className="italic text-slate-300">
          {chunk.slice(1, -1)}
        </em>
      );
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    tokens.push(text.substring(lastIndex));
  }

  return tokens.length > 0 ? tokens : text;
}

/**
 * Parses multi-line Markdown with headings (###), unordered lists (-), ordered lists (1.), and formatted paragraphs.
 */
export default function FormattedMarkdown({ content, isCompact = false }) {
  if (!content) return null;

  const lines = content.split('\n');
  const elements = [];
  let currentList = [];
  let listType = null; // 'ul' | 'ol'

  const flushList = () => {
    if (currentList.length === 0) return;
    if (listType === 'ul') {
      elements.push(
        <ul key={`ul-${elements.length}`} className={`${isCompact ? 'my-1 space-y-1' : 'my-2 space-y-1.5'} pl-0.5`}>
          {currentList.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2 text-slate-200">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 mt-1.5 shadow-2xs" />
              <span className="flex-1 leading-relaxed">{formatInlineText(item)}</span>
            </li>
          ))}
        </ul>
      );
    } else if (listType === 'ol') {
      elements.push(
        <ol key={`ol-${elements.length}`} className={`${isCompact ? 'my-1 space-y-1' : 'my-2 space-y-1.5'} pl-0.5`}>
          {currentList.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2 text-slate-200">
              <span className="w-4.5 h-4.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-300 font-black text-[9px] flex items-center justify-center shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <span className="flex-1 leading-relaxed">{formatInlineText(item)}</span>
            </li>
          ))}
        </ol>
      );
    }
    currentList = [];
    listType = null;
  };

  lines.forEach((line, idx) => {
    const trimmed = line.trim();

    if (!trimmed) {
      flushList();
      return;
    }

    // Heading 3: ### Title
    if (trimmed.startsWith('### ')) {
      flushList();
      elements.push(
        <h3 key={idx} className={`${isCompact ? 'text-xs mt-2 mb-1' : 'text-sm mt-3 mb-1.5'} font-black text-amber-400 flex items-center gap-1.5 tracking-tight border-b border-slate-800/80 pb-1`}>
          {formatInlineText(trimmed.replace(/^###\s+/, ''))}
        </h3>
      );
      return;
    }

    // Heading 2: ## Title
    if (trimmed.startsWith('## ')) {
      flushList();
      elements.push(
        <h2 key={idx} className={`${isCompact ? 'text-xs mt-2 mb-1' : 'text-sm sm:text-base mt-3 mb-1.5'} font-black text-amber-300 tracking-tight border-b border-slate-800 pb-1`}>
          {formatInlineText(trimmed.replace(/^##\s+/, ''))}
        </h2>
      );
      return;
    }

    // Heading 1: # Title
    if (trimmed.startsWith('# ')) {
      flushList();
      elements.push(
        <h1 key={idx} className={`${isCompact ? 'text-sm mt-2 mb-1' : 'text-base font-black mt-3 mb-1.5'} text-amber-400 tracking-tight`}>
          {formatInlineText(trimmed.replace(/^#\s+/, ''))}
        </h1>
      );
      return;
    }

    // Unordered List item (- or *)
    const ulMatch = trimmed.match(/^[-*]\s+(.*)$/);
    if (ulMatch) {
      if (listType && listType !== 'ul') flushList();
      listType = 'ul';
      currentList.push(ulMatch[1]);
      return;
    }

    // Ordered List item (1. 2. etc.)
    const olMatch = trimmed.match(/^\d+\.\s+(.*)$/);
    if (olMatch) {
      if (listType && listType !== 'ol') flushList();
      listType = 'ol';
      currentList.push(olMatch[1]);
      return;
    }

    // Regular paragraph
    flushList();
    elements.push(
      <p key={idx} className="text-slate-200 my-1 leading-relaxed">
        {formatInlineText(trimmed)}
      </p>
    );
  });

  flushList();

  return <div className="space-y-0.5">{elements}</div>;
}
