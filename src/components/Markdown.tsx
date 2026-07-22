import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
export function Markdown({ children }: { children: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        a: ({ href, children }) => (
          <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: '#0A6E76', textDecoration: 'underline' }}>{children}</a>
        ),
        p: ({ children }) => <p style={{ margin: '0 0 6px' }}>{children}</p>,
        ul: ({ children }) => <ul style={{ margin: '4px 0', paddingLeft: 18 }}>{children}</ul>,
        li: ({ children }) => <li style={{ margin: '2px 0' }}>{children}</li>,
        strong: ({ children }) => <strong style={{ fontWeight: 600 }}>{children}</strong>,
      }}
    >
      {children}
    </ReactMarkdown>
  );
}
