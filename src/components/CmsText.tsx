'use client';
import React, { useState, useEffect } from 'react';

interface CmsTextProps {
  cmsId: string;
  fallback: React.ReactNode;
  as?: any;
  className?: string;
  isHtml?: boolean;
  brClassName?: string;
  [key: string]: any;
}

export default function CmsText({ cmsId, fallback, as: Component = 'span', className, isHtml, brClassName, ...rest }: CmsTextProps) {
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

  const renderContent = (content: string) => {
    if (isHtml) {
      return <Component className={className} dangerouslySetInnerHTML={{ __html: content }} {...rest} />;
    }
    if (brClassName !== undefined || content.includes('\n')) {
      return (
        <Component className={className} {...rest}>
          {content.split('\n').map((line, i, arr) => (
            <React.Fragment key={i}>
              {line}
              {i < arr.length - 1 && <br className={brClassName} />}
            </React.Fragment>
          ))}
        </Component>
      );
    }
    return <Component className={className} {...rest}>{content}</Component>;
  };

  if (text !== null) {
    return renderContent(text);
  }

  if (typeof fallback === 'string') {
    return renderContent(fallback);
  }
  
  return <Component className={className} {...rest}>{fallback}</Component>;
}
