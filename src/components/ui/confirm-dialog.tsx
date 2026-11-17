'use client';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { useT } from '@/lib/i18n/locale-context';

type Ask = { message: string; confirmLabel?: string; danger?: boolean };
type Pending = Ask & { resolve: (ok: boolean) => void };

/**
 * In-page replacement for window.confirm (which embedded browsers such as the
 * desktop app's pane silently block). `const [ask, dialog] = useConfirm();`
 * then `if (!(await ask({ message }))) return;` and render `{dialog}`.
 * The message must already be translated; button labels are translated here.
 */
export function useConfirm(): [(a: Ask) => Promise<boolean>, ReactNode] {
  const [req, setReq] = useState<Pending | null>(null);
  const ask = useCallback((a: Ask) => new Promise<boolean>((resolve) => setReq({ ...a, resolve })), []);
  const done = useCallback((ok: boolean) => {
    setReq((r) => { r?.resolve(ok); return null; });
  }, []);
  return [ask, req ? <ConfirmDialog key="confirm" {...req} onDone={done} /> : null];
}

function ConfirmDialog({ message, confirmLabel = 'Confirm', danger = true, onDone }: Ask & { onDone: (ok: boolean) => void }) {
  const tr = useT();
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (d && !d.open) {
      if (typeof d.showModal === 'function') d.showModal();
      else d.setAttribute('open', ''); // very old browsers / test DOMs
    }
    return () => { if (d?.open && typeof d.close === 'function') d.close(); };
  }, []);
  return (
    <dialog
      ref={ref}
      className="cdialog"
      aria-labelledby="cdialog-msg"
      onCancel={(e) => { e.preventDefault(); onDone(false); }}
      onClick={(e) => { if (e.target === e.currentTarget) onDone(false); }}
    >
      <div className="cdialog__card">
        <p id="cdialog-msg" className="cdialog__msg">{message}</p>
        <div className="cdialog__actions">
          <button type="button" className="cdialog__btn" onClick={() => onDone(false)}>{tr('Cancel')}</button>
          <button type="button" className={`cdialog__btn ${danger ? 'cdialog__btn--danger' : 'cdialog__btn--primary'}`} onClick={() => onDone(true)} autoFocus>
            {tr(confirmLabel)}
          </button>
        </div>
      </div>
    </dialog>
  );
}
