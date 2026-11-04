import { Fragment, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { isInternalHref, isSafeExternalHref } from '../lib/url';

function inline(text: string, keyPrefix: string): ReactNode[] {
  const pattern = /(\[([^\]]+)\]\(([^)\s]+)\)|\*\*([^*]+)\*\*|_([^_]+)_|`([^`]+)`)/g;
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let index = 0;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) nodes.push(text.slice(lastIndex, match.index));
    const key = `${keyPrefix}-i${index++}`;
    if (match[2] && match[3]) {
      const label = match[2];
      const href = match[3];
      if (isInternalHref(href)) {
        nodes.push(<Link key={key} to={href} className="link-underline">{label}</Link>);
      } else if (isSafeExternalHref(href)) {
        nodes.push(
          <a key={key} href={href} target="_blank" rel="noopener noreferrer" className="link-underline">
            {label}
          </a>,
        );
      } else {
        // Unsafe or malformed scheme: show the text without making it clickable.
        nodes.push(<span key={key}>{label}</span>);
      }
    } else if (match[4]) {
      nodes.push(<strong key={key} className="font-semibold text-ink-900">{match[4]}</strong>);
    } else if (match[5]) {
      nodes.push(<em key={key}>{match[5]}</em>);
    } else if (match[6]) {
      nodes.push(<code key={key} className="rounded bg-paper-100 px-1.5 py-0.5 text-[0.9em] text-ink-800">{match[6]}</code>);
    }
    lastIndex = pattern.lastIndex;
  }
  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
  return nodes.length ? nodes : [text];
}

interface MarkdownProps {
  content: string;
  className?: string;
}

export function Markdown({ content, className = '' }: MarkdownProps) {
  const lines = content.replace(/\r\n/g, '\n').split('\n');
  const blocks: ReactNode[] = [];
  let index = 0;
  let key = 0;

  while (index < lines.length) {
    const line = lines[index];

    if (!line.trim()) {
      index += 1;
      continue;
    }

    if (line.trim() === '---') {
      blocks.push(<hr key={key++} className="my-8 border-paper-200" />);
      index += 1;
      continue;
    }

    if (line.startsWith('### ')) {
      blocks.push(
        <h3 key={key++} className="mt-7 mb-2 font-display text-2xl text-ink-950">
          {inline(line.slice(4), `h3-${key}`)}
        </h3>,
      );
      index += 1;
      continue;
    }

    if (line.startsWith('## ')) {
      blocks.push(
        <h2 key={key++} className="mt-9 mb-3 font-display text-3xl text-ink-950">
          {inline(line.slice(3), `h2-${key}`)}
        </h2>,
      );
      index += 1;
      continue;
    }

    if (line.startsWith('# ')) {
      blocks.push(
        <h1 key={key++} className="mt-9 mb-3 font-display text-4xl text-ink-950">
          {inline(line.slice(2), `h1-${key}`)}
        </h1>,
      );
      index += 1;
      continue;
    }

    if (line.startsWith('> ')) {
      const quote: string[] = [];
      while (index < lines.length && lines[index].startsWith('> ')) {
        quote.push(lines[index].slice(2));
        index += 1;
      }
      blocks.push(
        <blockquote key={key++} className="my-6 border-l-2 border-brand-400 bg-brand-50 px-4 py-3 text-sm leading-relaxed text-ink-700">
          {inline(quote.join(' '), `quote-${key}`)}
        </blockquote>,
      );
      continue;
    }

    if (/^- /.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^- /.test(lines[index])) {
        items.push(lines[index].slice(2));
        index += 1;
      }
      blocks.push(
        <ul key={key++} className="my-4 space-y-2 pl-5">
          {items.map((item, itemIndex) => (
            <li key={itemIndex} className="list-disc text-[15px] leading-relaxed text-ink-700 marker:text-brand-500">
              {inline(item, `ul-${key}-${itemIndex}`)}
            </li>
          ))}
        </ul>,
      );
      continue;
    }

    if (/^\d+\.\s/.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^\d+\.\s/.test(lines[index])) {
        items.push(lines[index].replace(/^\d+\.\s/, ''));
        index += 1;
      }
      blocks.push(
        <ol key={key++} className="my-4 space-y-2 pl-5">
          {items.map((item, itemIndex) => (
            <li key={itemIndex} className="list-decimal text-[15px] leading-relaxed text-ink-700 marker:font-semibold marker:text-brand-700">
              {inline(item, `ol-${key}-${itemIndex}`)}
            </li>
          ))}
        </ol>,
      );
      continue;
    }

    const paragraph: string[] = [line];
    index += 1;
    while (
      index < lines.length &&
      lines[index].trim() &&
      !/^(#{1,3}\s|>\s|- |\d+\.\s|---)/.test(lines[index])
    ) {
      paragraph.push(lines[index]);
      index += 1;
    }
    blocks.push(
      <p key={key++} className="my-3 text-[15px] leading-7 text-ink-700">
        {inline(paragraph.join(' '), `p-${key}`)}
      </p>,
    );
  }

  return <Fragment><div className={className}>{blocks}</div></Fragment>;
}
