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
    fetch('/api/studio/cms').then(r => r.json()).then(data => {
      const img = data.find((i: any) => i.id === cmsId);
      if (img && img.src) setSrc(img.src);
    }).catch(() => {});
  }, [cmsId]);

  return <Image src={src} {...props} />;
}
