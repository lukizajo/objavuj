import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';

interface MarkdownContentProps {
  content: string;
  className?: string;
}

export function MarkdownContent({ content, className }: MarkdownContentProps) {
  return (
    <div
      className={cn(
        "prose prose-sm sm:prose-base max-w-none",
        "prose-headings:font-display prose-headings:font-bold prose-headings:text-foreground",
        "prose-h1:text-2xl prose-h1:mb-4 prose-h1:mt-6",
        "prose-h2:text-xl prose-h2:mb-3 prose-h2:mt-5",
        "prose-h3:text-lg prose-h3:mb-2 prose-h3:mt-4",
        "prose-p:text-foreground/90 prose-p:leading-relaxed prose-p:mb-4",
        "prose-strong:text-foreground prose-strong:font-semibold",
        "prose-em:text-foreground/80",
        "prose-ul:my-4 prose-ul:list-disc prose-ul:pl-6",
        "prose-ol:my-4 prose-ol:list-decimal prose-ol:pl-6",
        "prose-li:text-foreground/90 prose-li:mb-1",
        "prose-a:text-primary prose-a:underline prose-a:underline-offset-2 hover:prose-a:text-primary/80",
        "prose-blockquote:border-l-4 prose-blockquote:border-primary/40 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-muted-foreground",
        "prose-code:bg-secondary prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono",
        "prose-pre:bg-secondary prose-pre:p-4 prose-pre:rounded-lg prose-pre:overflow-x-auto",
        "dark:prose-invert",
        "dark:prose-headings:text-foreground",
        "dark:prose-p:text-foreground/85",
        "dark:prose-li:text-foreground/85",
        "dark:prose-code:bg-secondary/80",
        "dark:prose-pre:bg-secondary/80",
        className
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children, ...props }) => {
            const isExternal = href?.startsWith('http');
            return (
              <a 
                href={href} 
                target={isExternal ? "_blank" : undefined}
                rel={isExternal ? "noopener noreferrer" : undefined}
                {...props}
              >
                {children}
              </a>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
