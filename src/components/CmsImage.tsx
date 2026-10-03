'use client';
import { useState, useEffect } from 'react';
import Image, { ImageProps } from 'next/image';

interface CmsImageProps extends Omit<ImageProps, 'src'> {
  cmsId: string;
  fallbackSrc: string;
}

export default function CmsImage({ cmsId, fallbackSrc, ...props }: CmsImageProps) {
  const [src, setSrc] = useState(fallbackSrc);

  useEffect(() => {
    let isPreview = false;
    if (typeof window !== 'undefined') {
      if (window.location.search.includes('preview=true')) {
        sessionStorage.setItem('groton_preview', 'true');
        isPreview = true;
      } else if (sessionStorage.getItem('groton_preview') === 'true') {
        isPreview = true;
      }
    }
    const apiUrl = isPreview ? '/api/studio/cms?preview=true' : '/api/studio/cms';

    fetch(apiUrl, { cache: 'no-store' }).then(r => r.json()).then(data => {
      const img = data.find((i: any) => i.id === cmsId);
      if (img && img.src) setSrc(img.src);
    }).catch(() => {});
  }, [cmsId]);

  return <Image src={src} {...props} />;
}
