import React, { useState } from 'react';
import { Copy, Check, Terminal, ExternalLink, ChevronRight } from 'lucide-react';

export default function MarkdownMessage({ content }) {
  const [copiedIndex, setCopiedIndex] = useState(null);

  if (!content) return null;

  const handleCopy = (codeText, index) => {
    navigator.clipboard.writeText(codeText);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Split content by code blocks: ```lang\ncode\n```
  const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
  const parts = [];
  let lastIndex = 0;
  let match;
  let blockIndex = 0;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        value: content.substring(lastIndex, match.index)
      });
    }
    parts.push({
      type: 'code',
      lang: match[1] || 'bash',
      code: match[2].trim(),
      index: blockIndex++
    });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    parts.push({
      type: 'text',
      value: content.substring(lastIndex)
    });
  }

  const renderInlineFormatted = (text) => {
    // Process inline markdown: bold, inline code, italics, links
    // Split by inline code `...`
    const tokens = text.split(/(`[^`]+`)/g);

    return tokens.map((token, i) => {
      if (token.startsWith('`') && token.endsWith('`')) {
        const inner = token.slice(1, -1);
        return (
          <code
            key={i}
            className="px-1.5 py-0.5 mx-0.5 rounded-md text-xs font-mono font-semibold bg-slate-200/80 dark:bg-slate-800 text-brand-700 dark:text-cyan-300 border border-slate-300/60 dark:border-slate-700"
          >
            {inner}
          </code>
        );
      }

      // Process bold **text**
      const boldParts = token.split(/(\*\*[^*]+\*\*)/g);
      return boldParts.map((bToken, j) => {
        if (bToken.startsWith('**') && bToken.endsWith('**')) {
          return (
            <strong key={`${i}-${j}`} className="font-bold text-slate-900 dark:text-white">
              {bToken.slice(2, -2)}
            </strong>
          );
        }
        return bToken;
      });
    });
  };

  const renderTextSegment = (rawText, segIdx) => {
    const lines = rawText.split('\n');
    const elements = [];
    let listItems = [];
    let inList = false;

    const flushList = () => {
      if (listItems.length > 0) {
        elements.push(
          <ul key={`ul-${elements.length}`} className="space-y-1.5 my-2 pl-2">
            {listItems.map((item, liIdx) => (
              <li key={liIdx} className="flex items-start gap-2 text-sm text-slate-800 dark:text-slate-200">
                <ChevronRight className="w-3.5 h-3.5 text-cyan-500 flex-shrink-0 mt-1" />
                <span>{renderInlineFormatted(item)}</span>
              </li>
            ))}
          </ul>
        );
        listItems = [];
        inList = false;
      }
    };

    lines.forEach((line, lIdx) => {
      const trimmed = line.trim();

      // Heading 3: ### Heading
      if (trimmed.startsWith('### ')) {
        flushList();
        elements.push(
          <h3
            key={`h3-${lIdx}`}
            className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mt-4 mb-2 flex items-center gap-2 border-b border-slate-200 dark:border-slate-800/80 pb-1"
          >
            {renderInlineFormatted(trimmed.slice(4))}
          </h3>
        );
      }
      // Heading 4: #### Heading
      else if (trimmed.startsWith('#### ')) {
        flushList();
        elements.push(
          <h4
            key={`h4-${lIdx}`}
            className="text-xs sm:text-sm font-bold text-cyan-700 dark:text-cyan-400 mt-3 mb-1"
          >
            {renderInlineFormatted(trimmed.slice(5))}
          </h4>
        );
      }
      // Horizontal Rule: ---
      else if (trimmed === '---') {
        flushList();
        elements.push(
          <hr
            key={`hr-${lIdx}`}
            className="border-slate-200 dark:border-slate-800 my-3"
          />
        );
      }
      // Bullet list item: - item or * item
      else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        inList = true;
        listItems.push(trimmed.slice(2));
      }
      // Numbered list item: 1. item
      else if (/^\d+\.\s/.test(trimmed)) {
        inList = true;
        listItems.push(trimmed.replace(/^\d+\.\s/, ''));
      }
      // Blockquote: > text
      else if (trimmed.startsWith('> ')) {
        flushList();
        elements.push(
          <blockquote
            key={`bq-${lIdx}`}
            className="p-3 my-2 rounded-xl bg-cyan-500/10 border-l-4 border-cyan-500 text-xs sm:text-sm text-slate-800 dark:text-slate-200 italic"
          >
            {renderInlineFormatted(trimmed.slice(2))}
          </blockquote>
        );
      }
      // Normal paragraph
      else if (trimmed.length > 0) {
        flushList();
        elements.push(
          <p
            key={`p-${lIdx}`}
            className="text-sm leading-relaxed text-slate-800 dark:text-slate-200 my-1.5"
          >
            {renderInlineFormatted(line)}
          </p>
        );
      } else {
        flushList();
      }
    });

    flushList();
    return <div key={`seg-${segIdx}`}>{elements}</div>;
  };

  return (
    <div className="space-y-3 font-sans">
      {parts.map((part, pIdx) => {
        if (part.type === 'text') {
          return renderTextSegment(part.value, pIdx);
        }

        if (part.type === 'code') {
          const isCopied = copiedIndex === part.index;
          return (
            <div
              key={`code-${pIdx}`}
              className="my-3 rounded-2xl overflow-hidden border border-slate-700/80 bg-[#090d16] shadow-xl"
            >
              {/* Terminal Code Header Bar */}
              <div className="px-4 py-2 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-slate-300">
                    {part.lang || 'terminal'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(part.code, part.index)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all border border-slate-700"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-bold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              {/* Code Snippet Box with Crystal-Clear Contrast */}
              <div className="p-4 overflow-x-auto">
                <pre className="font-mono text-xs sm:text-sm text-cyan-300 leading-relaxed whitespace-pre selection:bg-cyan-500/30">
                  <code>{part.code}</code>
                </pre>
              </div>
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}
