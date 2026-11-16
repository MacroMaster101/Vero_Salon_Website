import { Fragment } from 'react';

/** Splits a heading into word spans so MotionEffects can reveal them one by one
    (Magic UI "text-animate" blur-in). The last word gets a highlighter mark.
    Plain spans with real spaces between them, so screen readers and copy/paste
    read the heading normally. Works in server and client components. */
export function Words({ text, mark = true }: { text: string; mark?: boolean }) {
  const parts = text.split(/\s+/).filter(Boolean);
  return <>{parts.map((word, i) => {
    const marked = mark && parts.length > 1 && i === parts.length - 1;
    return <Fragment key={i}>{i > 0 && ' '}<span className={marked ? 'fx-w fx-w--mark' : 'fx-w'}>{word}</span></Fragment>;
  })}</>;
}
