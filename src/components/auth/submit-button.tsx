'use client';
import type { ReactNode } from 'react';
import { useFormStatus } from 'react-dom';

/** Submit button for the auth forms. While its form's server action runs it
    disables itself (no double submits), shows an inline spinner and swaps the
    label for `pendingLabel`. Must be rendered inside the <form>. */
export function SubmitButton({
  className,
  disabled,
  pendingLabel,
  children,
}: {
  className: string;
  disabled?: boolean;
  pendingLabel: string;
  children: ReactNode;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      className={`${className} vauth-submit`}
      style={{ width: '100%' }}
      type="submit"
      disabled={disabled || pending}
      aria-busy={pending || undefined}
      data-pending={pending || undefined}
    >
      {pending ? (
        <>
          <span className="vauth-spinner" aria-hidden="true" />
          <span>{pendingLabel}</span>
        </>
      ) : children}
    </button>
  );
}
