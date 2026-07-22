import React from 'react';
// Simple markdown → JSX for the subset Tide uses: **bold**, *italic*, links, - bullets, line breaks
export function Markdown({ children }: { children: string }) {
  const text = children || '';
  const lines = text.split('\n');
  const blocks: React.ReactNode[] = [];
  let listBuffer: string[] = [];
  const flushList = () => {
    if (listBuffer.length) {
      blocks.push(
        <ul key={`ul-${blocks.length}`} style={{ margin: '4px 0', paddingLeft: 18 }}>
          {listBuffer.map((item, i) => (
            <li key={i} style={{ margin: '2px 0' }}>{renderInline(item)}</li>
          ))}
        </ul>
      );
      listBuffer = [];
    }
  };
  lines.forEach((line, i) => {
    const trimmed = line.trim();
    const bullet = trimmed.match(/^[-*]\s+(.*)/);
    if (bullet) {
      listBuffer.push(bullet[1]);
    } else if (trimmed === '') {
      flushList();
      blocks.push(<div key={`br-${i}`} style={{ height: 6 }} />);
    } else {
      flushList();
      blocks.push(<div key={`p-${i}`} style={{ margin: '2px 0' }}>{renderInline(trimmed)}</div>);
    }
  });
  flushList();
  return <>{blocks}</>;
}
function renderInline(text: string): React.ReactNode[] {
  // Order matters: process links first, then bold, then italic
  const nodes: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;
  while (remaining.length > 0) {
    // [label](url)
    const linkMatch = remaining.match(/^\[([^\]]+)\]\(([^)]+)\)/);
    if (linkMatch) {
      nodes.push(
        <a key={key++} href={linkMatch[2]} target="_blank" rel="noopener noreferrer" style={{ color: '#0A6E76', textDecoration: 'underline' }}>
          {linkMatch[1]}
        </a>
      );
      remaining = remaining.slice(linkMatch[0].length);
      continue;
    }
    // bare URL
    const urlMatch = remaining.match(/^(https?:\/\/[^\s)]+)/);
    if (urlMatch) {
      nodes.push(
        <a key={key++} href={urlMatch[1]} target="_blank" rel="noopener noreferrer" style={{ color: '#0A6E76', textDecoration: 'underline' }}>
          {urlMatch[1]}
        </a>
      );
      remaining = remaining.slice(urlMatch[0].length);
      continue;
    }
    // **bold**
    const boldMatch = remaining.match(/^\*\*([^*]+)\*\*/);
    if (boldMatch) {
      nodes.push(<strong key={key++} style={{ fontWeight: 600 }}>{boldMatch[1]}</strong>);
      remaining = remaining.slice(boldMatch[0].length);
      continue;
    }
    // *italic*
    const italicMatch = remaining.match(/^\*([^*]+)\*/);
    if (italicMatch) {
      nodes.push(<em key={key++}>{italicMatch[1]}</em>);
      remaining = remaining.slice(italicMatch[0].length);
      continue;
    }
    // Plain char: consume up to next special
    const nextSpecial = remaining.search(/(\*|\[|https?:\/\/)/);
    if (nextSpecial === -1) {
      nodes.push(<span key={key++}>{remaining}</span>);
      break;
    }
    if (nextSpecial === 0) {
      // Special that didn't match a pattern — consume one char to avoid infinite loop
      nodes.push(<span key={key++}>{remaining[0]}</span>);
      remaining = remaining.slice(1);
    } else {
      nodes.push(<span key={key++}>{remaining.slice(0, nextSpecial)}</span>);
      remaining = remaining.slice(nextSpecial);
    }
  }
  return nodes;
}
