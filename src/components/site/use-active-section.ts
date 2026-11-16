'use client';
import { useEffect, useState } from 'react';

/** Discrete intersection updates keep both navs in sync without a scroll loop. */
export function useActiveSection(path: string) {
  const [current, setCurrent] = useState<{ path: string; id: string } | null>(null);
  useEffect(() => {
    if (path !== '/') return;
    const main = document.getElementById('main-content');
    if (!main) return;
    const sections = new Set<HTMLElement>();
    let observer: IntersectionObserver;
    let line = 0;
    const update = () => {
      const ordered = [...sections].sort((a,b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top);
      const active = ordered.filter(element => element.getBoundingClientRect().top <= line + 2).at(-1);
      const id = active?.classList.contains('home-hero') ? 'top' : active?.id ?? 'top';
      setCurrent(previous => previous?.path === path && previous.id === id ? previous : { path, id });
    };
    const connect = () => {
      observer?.disconnect();
      const header = document.querySelector('header')?.getBoundingClientRect().height ?? 95;
      line = Math.max(header + 24, window.innerHeight * .3);
      observer = new IntersectionObserver(update, { rootMargin: `-${header}px 0px -${Math.max(0, window.innerHeight - line)}px 0px`, threshold:0 });
      sections.forEach(element => observer.observe(element));
      update();
    };
    const register = () => {
      main.querySelectorAll<HTMLElement>('.home-hero, section[id]').forEach(element => {
        if (sections.has(element)) return;
        sections.add(element); observer?.observe(element);
      });
      update();
    };
    connect(); register();
    const streaming = new MutationObserver(register);
    streaming.observe(main, { childList:true, subtree:true });
    window.addEventListener('resize', connect);
    return () => { observer.disconnect(); streaming.disconnect(); window.removeEventListener('resize', connect); };
  }, [path]);
  return current?.path === path ? current.id : 'top';
}
