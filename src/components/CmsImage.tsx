'use client';
import { useState, useEffect } from 'react';
import Image, { ImageProps } from 'next/image';

interface CmsImageProps extends Omit<ImageProps, 'src'> {
  cmsId: string;
  fallbackSrc: string;
}

export default function CmsImage({ cmsId, fallbackSrc, ...props }: CmsImageProps) {
  const [src, setSrc] = useState(fallbackSrc);
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');

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
      if (img && img.src) {
        setSrc(img.src);
        setMediaType(img.mediaType || (img.src.match(/\.(mp4|webm|mov)$/i) ? 'video' : 'image'));
      }
    }).catch(() => {});
  }, [cmsId]);

  if (mediaType === 'video') {
    const { fill, sizes, priority, placeholder, blurDataURL, quality, alt, className, style, ...rest } = props as any;
    const videoStyle = fill ? { objectFit: 'cover', width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, ...style } : style;
    return (
      <video
        src={src}
        autoPlay
        muted
        loop
        playsInline
        className={className}
        style={videoStyle}
      />
    );
  }

  return <Image src={src} {...props} />;
}
