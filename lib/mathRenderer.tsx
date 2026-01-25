'use client';

import { useEffect, useRef } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface MathRendererProps {
  content: string;
  className?: string;
}

export function MathRenderer({ content, className = '' }: MathRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;

    // Replace LaTeX delimiters with rendered math
    const renderMath = (text: string) => {
      // Handle display math: $$...$$
      text = text.replace(/\$\$(.*?)\$\$/g, (match, formula) => {
        try {
          return katex.renderToString(formula, {
            displayMode: true,
            throwOnError: false,
          });
        } catch (e) {
          return match;
        }
      });

      // Handle inline math: $...$
      text = text.replace(/\$(.*?)\$/g, (match, formula) => {
        try {
          return katex.renderToString(formula, {
            displayMode: false,
            throwOnError: false,
          });
        } catch (e) {
          return match;
        }
      });

      return text;
    };

    container.innerHTML = renderMath(content);
  }, [content]);

  return <div ref={containerRef} className={className} />;
}
