'use client';
import { useRef, useState, useTransition } from 'react';
import { uploadImage } from '@/lib/admin/upload';

// Only preview typed values that are a site-relative path or an http(s) URL.
function previewSrc(value: string): string | null {
  const v = value.trim();
  if (!v) return null;
  if (v.startsWith('/') && !v.startsWith('//')) return encodeURI(v);
  try {
    const u = new URL(v);
    return u.protocol === 'http:' || u.protocol === 'https:' ? u.href : null;
  } catch {
    return null;
  }
}

export function ImageField({ name, label = 'Image', defaultValue = '' }: { name: string; label?: string; defaultValue?: string | null }) {
  const [url, setUrl] = useState(defaultValue ?? '');
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  function onPick() {
    const file = fileRef.current?.files?.[0];
    if (!file) return;
    setError(null);
    const fd = new FormData();
    fd.set('file', file);
    start(async () => {
      const res = await uploadImage(fd);
      if ('error' in res) setError(res.error);
      else setUrl(res.url);
    });
  }

  const preview = previewSrc(url);

  return (
    <div className="afield">
      <span className="alabel">{label}</span>
      <input className="ainput" name={name} value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://… or upload below" />
      <div className="afield--row" style={{ marginTop: 6 }}>
        <input ref={fileRef} type="file" accept="image/*" onChange={onPick} style={{ fontSize: 12 }} />
        {pending && <span className="arow__meta">Uploading…</span>}
      </div>
      {error && <p className="astatus astatus--err">{error}</p>}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {preview && <img src={preview} alt="preview" className="athumb" />}
    </div>
  );
}
