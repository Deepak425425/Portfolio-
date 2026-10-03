'use client';
import { useState, useEffect } from 'react';

interface CmsTextProps {
  cmsId: string;
  fallback: React.ReactNode;
  as?: any;
  className?: string;
  isHtml?: boolean;
  [key: string]: any;
}

export default function CmsText({ cmsId, fallback, as: Component = 'span', className, isHtml, ...rest }: CmsTextProps) {
  const [text, setText] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/studio/cms-text', { cache: 'no-store' })
      .then(r => r.json())
      .then(data => {
        const item = data.find((i: any) => i.id === cmsId);
        if (item && item.publishedValue !== undefined && item.publishedValue !== null && item.publishedValue !== "") {
          setText(item.publishedValue);
        }
      })
      .catch(() => {});
  }, [cmsId]);

  if (text !== null) {
    if (isHtml) {
      return <Component className={className} dangerouslySetInnerHTML={{ __html: text }} {...rest} />;
    }
    return <Component className={className} {...rest}>{text}</Component>;
  }

  if (isHtml && typeof fallback === 'string') {
     return <Component className={className} dangerouslySetInnerHTML={{ __html: fallback }} {...rest} />;
  }
  return <Component className={className} {...rest}>{fallback}</Component>;
}
