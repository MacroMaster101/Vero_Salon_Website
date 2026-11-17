'use client';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import Image from 'next/image';

export type HowStep = { title: string; text: string; img: string; alt: string };
export type HowPath = { id: string; label: string; note: string; steps: HowStep[] };

const AUTO_MS = 5200;
/* after a click, tap or swipe, hold the chosen step this long, then play on */
const HOLD_MS = 8000;

/* Homepage "How it works": an image-led walkthrough of a visit, with a switch
   between the two ways to come in: booking ahead, or walking in (we are open
   all day and any free stylist takes you).
   PC/tablet: the steps are a list on the left and a large photo stage on the
   right that cross-fades (with a slow zoom) to the active step's photo.
   Phones: each step is a swipeable photo card with dots.
   On every size the steps advance on their own while the section is on screen
   (a bar / dot fills for the active step). Hovering does not stop them. Clicking a step
   (or a tap / swipe on a phone) shows that step and holds it for a few
   seconds, then they play on; they also wait while the keyboard is in them.
   Styles: section-polish.css §21. Reduced motion: no autoplay, no zoom. */
export function HowSteps({ paths, stepLabel, intro }: { paths: HowPath[]; stepLabel: string; intro?: ReactNode }) {
  const [pathIndex, setPathIndex] = useState(0);
  const path = paths[pathIndex] ?? paths[0]!;
  const steps = path.steps;
  const [active, setActive] = useState(0);
  const [focused, setFocused] = useState(false);
  const [touched, setTouched] = useState(false);
  const [inView, setInView] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLOListElement>(null);
  const touchTimer = useRef(0);
  const auto = useRef(false);

  // only run the autoplay while the section is visible
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setInView(!!entry?.isIntersecting), { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const [reduced, setReduced] = useState(false);
  const [wide, setWide] = useState(false);
  useEffect(() => {
    const rm = window.matchMedia('(prefers-reduced-motion: reduce)');
    const mq = window.matchMedia('(min-width: 900px)');
    const sync = () => { setReduced(rm.matches); setWide(mq.matches); };
    sync();
    rm.addEventListener('change', sync);
    mq.addEventListener('change', sync);
    return () => { rm.removeEventListener('change', sync); mq.removeEventListener('change', sync); };
  }, []);
  useEffect(() => () => window.clearTimeout(touchTimer.current), []);

  const scrollToCard = (i: number, smooth: boolean) => {
    const el = track.current;
    const card = el?.children[i] as HTMLElement | undefined;
    if (!el || !card) return;
    const pad = parseFloat(getComputedStyle(el).scrollPaddingLeft || '0');
    el.scrollTo({ left: card.offsetLeft - pad, behavior: smooth && !reduced ? 'smooth' : 'auto' });
  };
  const goTo = (i: number) => {
    setActive(i);
    if (!wide) scrollToCard(i, true);
  };

  const playing = inView && !focused && !touched && !reduced;
  useEffect(() => {
    if (!playing) return;
    const id = window.setTimeout(() => {
      const next = (active + 1) % steps.length;
      auto.current = true;          // ignore the scroll events this move causes
      setActive(next);
      if (!wide) scrollToCard(next, true);
      window.setTimeout(() => { auto.current = false; }, 900);
    }, AUTO_MS);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, active, steps.length, wide, pathIndex]);

  // phones: the dots follow the swipe position
  const onTrackScroll = () => {
    const el = track.current;
    if (!el || wide || auto.current) return;
    if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 4) { setActive(steps.length - 1); return; }
    if (el.scrollLeft <= 4) { setActive(0); return; }
    const mid = el.scrollLeft + el.clientWidth / 2;
    let best = 0;
    let dist = Infinity;
    Array.from(el.children).forEach((child, i) => {
      const c = child as HTMLElement;
      const d = Math.abs(c.offsetLeft + c.offsetWidth / 2 - mid);
      if (d < dist) { dist = d; best = i; }
    });
    setActive(best);
  };

  const pickPath = (i: number) => {
    if (i === pathIndex) return;
    setPathIndex(i);
    setActive(0);
    const el = track.current;
    if (el) el.scrollTo({ left: 0, behavior: 'auto' });
  };

  const onTouch = () => {
    setTouched(true);
    window.clearTimeout(touchTimer.current);
    touchTimer.current = window.setTimeout(() => setTouched(false), HOLD_MS);
  };

  return (
    <div
      ref={root}
      className={`how-steps${playing ? ' is-playing' : ''}`}
      style={{ ['--how-ms' as string]: `${AUTO_MS}ms` }}
      onTouchStart={onTouch}
      onFocus={e => { if ((e.target as HTMLElement).matches(':focus-visible')) setFocused(true); }}
      onBlur={() => setFocused(false)}
    >
      <div className="how-steps__side">
        {intro}
        <div className="how__switch" role="tablist" aria-label={paths.map(p => p.label).join(' / ')}>
          {paths.map((p, i) => (
            <button
              key={p.id}
              type="button"
              role="tab"
              aria-selected={i === pathIndex}
              className={`how__tab${i === pathIndex ? ' is-active' : ''}`}
              onClick={() => pickPath(i)}
            >{p.label}</button>
          ))}
        </div>
        <p className="how__note" key={`note-${path.id}`}>{path.note}</p>
        <ol className="how-steps__list" ref={track} onScroll={onTrackScroll} key={`list-${path.id}`}>
          {steps.map((step, i) => (
            <li key={step.title} className={`how-step${i === active ? ' is-active' : ''}`}>
              <span className="how-step__media" aria-hidden="true">
                <Image src={step.img} alt="" fill sizes="(max-width: 899px) 82vw, 1px" quality={75} />
              </span>
              <button type="button" className="how-step__btn" aria-current={i === active ? 'step' : undefined} onClick={() => { onTouch(); goTo(i); }}>
                <span className="how-step__num">{String(i + 1).padStart(2, '0')}</span>
                <span className="how-step__body">
                  <span className="how-step__title">{step.title}</span>
                  <span className="how-step__text"><span>{step.text}</span></span>
                </span>
              </button>
              <span className="how-step__bar" aria-hidden="true"><span key={`${i}-${active}-${playing}`} /></span>
            </li>
          ))}
        </ol>
      </div>

        <div className="how-steps__stage" aria-hidden={!wide} key={`stage-${path.id}`}>
          {steps.map((step, i) => (
            <figure key={step.img} className={`how-stage__slide${i === active ? ' is-active' : ''}`}>
              <Image src={step.img} alt={step.alt} fill sizes="(max-width: 899px) 1px, 50vw" quality={85} />
            </figure>
          ))}
          <span className="how-stage__chip" key={active}>
            <b>{stepLabel} {active + 1}/{steps.length}</b>
            <span>{steps[active]?.title}</span>
          </span>
        </div>

        <div className="how-steps__dots" aria-hidden="true">
          {steps.map((step, i) => <span key={step.title} className={i === active ? 'is-active' : undefined}><i key={`${active}-${playing}`} /></span>)}
        </div>
    </div>
  );
}
