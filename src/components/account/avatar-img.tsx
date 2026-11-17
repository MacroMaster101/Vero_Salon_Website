'use client';
import { useEffect, useRef, useState } from 'react';
import { dicebearUrl } from '@/lib/avatar';

/**
 * Avatar <img> that falls back to the generated DiceBear face when the real
 * photo fails (Google's lh3 avatars sometimes refuse hot-linking or rate-limit).
 */
export function AvatarImg({ src, seed, className }: { src: string; seed: string; className?: string }) {
  const [failed, setFailed] = useState<string | null>(null);
  const ref = useRef<HTMLImageElement>(null);
  const shown = failed === src ? dicebearUrl(seed) : src;

  // A server-rendered <img> can fail before React hydrates and attaches
  // onError, so check once after mount too.
  useEffect(() => {
    const img = ref.current;
    if (img && img.complete && img.naturalWidth === 0 && img.getAttribute('src') === src) setFailed(src);
  }, [src]);

  return (
    // eslint-disable-next-line @next/next/no-img-element -- remote DiceBear/Google avatars aren't whitelisted for next/image
    <img ref={ref} src={shown} alt="" className={className} referrerPolicy="no-referrer"
      onError={() => { if (shown === src) setFailed(src); }} />
  );
}
