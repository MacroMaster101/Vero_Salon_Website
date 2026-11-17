'use client';
import { useRef, useState, useTransition } from 'react';
import { uploadImage } from '@/lib/admin/upload';
import { useT } from '@/lib/i18n/locale-context';
import { Icon } from '@/components/ui/icon';

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

export function ImageField({ name, label = 'Image', defaultValue = '', required = false }: { name: string; label?: string; defaultValue?: string | null; required?: boolean }) {
  const tr = useT();
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
    <div className="afield aimg">
      <span className="alabel">{tr(label)}{required ? <span className="areq" aria-hidden="true" /> : <span className="aopt">{tr('Optional')}</span>}</span>
      <div className="aimg__row">
        <span className={`aimg__preview${preview ? '' : ' is-empty'}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {preview ? <img src={preview} alt="" /> : <Icon name="image" size={22} />}
          {pending && <span className="aimg__busy" aria-hidden="true" />}
        </span>
        <div className="aimg__ctl">
          <div className="aimg__btns">
            <label className="afm-soft aimg__pick">
              <Icon name="image" size={15} />
              <span>{pending ? tr('Uploading…') : tr(preview ? 'Replace photo' : 'Upload photo')}</span>
              <input ref={fileRef} type="file" accept="image/*" onChange={onPick} disabled={pending} />
            </label>
            {url && (
              <button type="button" className="afm-icon afm-icon--danger" onClick={() => { setUrl(''); if (fileRef.current) fileRef.current.value = ''; }}
                aria-label={tr('Remove photo')} title={tr('Remove photo')}>
                <Icon name="trash" size={15} />
              </button>
            )}
          </div>
          <input className="ainput aimg__url" name={name} value={url} onChange={(e) => setUrl(e.target.value)} placeholder={tr('or paste an image link (https://…)')} />
        </div>
      </div>
      {error && <p className="astatus astatus--err">{error}</p>}
    </div>
  );
}
