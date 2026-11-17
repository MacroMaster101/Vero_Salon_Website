'use client';
import { useEffect, useRef, useState } from 'react';

/* Number ticker (Magic UI number-ticker): counts up to `value` once it scrolls
   into view. It lives in its own client component so the count only starts
   after React has hydrated it; the old page-wide script could rewrite the
   number before hydration and cause a hydration mismatch. */
export function Ticker({ value, className }: { value: string; className?: string }) {
  const [shown, setShown] = useState(value);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    const target = Number(value);
    if (!el || !Number.isFinite(target)) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const decimals = (value.split('.')[1] ?? '').length;
    let frame = 0;
    const io = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting) return;
      io.disconnect();
      const start = performance.now();
      const tick = (now: number) => {
        const p = Math.min(1, (now - start) / 1400);
        setShown((target * (1 - Math.pow(1 - p, 4))).toFixed(decimals));
        if (p < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    }, { threshold: 0.6 });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(frame); };
  }, [value]);

  return <b ref={ref} className={className} data-ticker={value}>{shown}</b>;
}
