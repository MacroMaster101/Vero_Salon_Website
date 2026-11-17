'use client';
import type { ReactNode } from 'react';
import { saveBlock } from './actions';
import { saveHours } from './hours-actions';
import { Field, TextInput, TextArea, Switch } from '@/components/admin/form-kit';
import { FormModal, type ActionResult } from '@/components/admin/form-modal';
import { Icon, type IconName } from '@/components/ui/icon';
import type { QuoteContent, CtaContent, StoryContent, HeroContent, StatsContent, ContactContent } from '@/lib/content/blocks';
import type { BusinessHour } from '@/lib/supabase/types';
import { minutesToLabel } from '@/lib/format';
import { useT } from '@/lib/i18n/locale-context';

/**
 * One homepage section: a preview of what's live now, and an Edit button that
 * opens the fields in a popup.
 */
function SectionCard({ icon, title, where, preview, action, blockKey, wide, children }: {
  icon: IconName;
  title: string;
  where: string;
  preview: ReactNode;
  action?: (fd: FormData) => Promise<ActionResult>;
  blockKey?: string;
  wide?: boolean;
  children: ReactNode;
}) {
  const tr = useT();
  return (
    <section className="acsec">
      <header className="acsec__head">
        <span className="acsec__icon" aria-hidden="true"><Icon name={icon} size={18} /></span>
        <div className="acsec__titles">
          <h2>{tr(title)}</h2>
          <span>{tr(where)}</span>
        </div>
        <FormModal trigger={{ label: 'Edit', icon: 'pen' }} title={title} subtitle={where} icon={icon}
          action={action ?? saveBlock} wide={wide}>
          {blockKey && <input type="hidden" name="key" value={blockKey} />}
          {children}
        </FormModal>
      </header>
      <div className="acsec__preview">{preview}</div>
    </section>
  );
}

const Empty = ({ v }: { v: string }) => {
  const tr = useT();
  return v ? <>{v}</> : <em className="acsec__blank">{tr('Not set')}</em>;
};

export function HeroForm({ content }: { content: HeroContent }) {
  return (
    <SectionCard icon="home" title="Hero" where="Top of the homepage" blockKey="hero" wide
      preview={
        <>
          <span className="acsec__eyebrow"><Empty v={content.eyebrow} /></span>
          <p className="acsec__display">{content.line1} <em>{content.line2Em}</em> {content.line3}</p>
          <p className="acsec__text">{content.lead}</p>
        </>
      }>
      <Field label="Eyebrow" optional><TextInput name="eyebrow" defaultValue={content.eyebrow} /></Field>
      <Field label="Display line 1"><TextInput name="line1" defaultValue={content.line1} /></Field>
      <Field label="Display line 2 (emphasized)"><TextInput name="line2Em" defaultValue={content.line2Em} /></Field>
      <Field label="Display line 3"><TextInput name="line3" defaultValue={content.line3} /></Field>
      <Field label="Lead paragraph"><TextArea name="lead" defaultValue={content.lead} rows={3} /></Field>
    </SectionCard>
  );
}

export function StatsForm({ content }: { content: StatsContent }) {
  const tr = useT();
  const cards = [0, 1, 2, 3].map((i) => content.cards[i] ?? { value: '', label: '' });
  return (
    <SectionCard icon="grid" title="Stats (4 cards)" where="Under the hero" blockKey="stats" wide
      preview={
        <div className="acsec__stats">
          {cards.map((c, i) => (
            <span key={i}><b>{c.value || '—'}</b><small>{c.label || tr('Not set')}</small></span>
          ))}
        </div>
      }>
      {cards.map((c, i) => (
        <div key={i} className="atwo">
          <Field label={`${tr('Value')} ${i + 1}`}><TextInput name={`value${i}`} defaultValue={c.value} placeholder="12+" /></Field>
          <Field label={`${tr('Label')} ${i + 1}`}><TextInput name={`label${i}`} defaultValue={c.label} /></Field>
        </div>
      ))}
    </SectionCard>
  );
}

export function QuoteForm({ content }: { content: QuoteContent }) {
  return (
    <SectionCard icon="star" title="Testimonial quote" where="Homepage quote band" blockKey="quote"
      preview={
        <>
          <span className="acsec__stars">{content.stars}</span>
          <p className="acsec__quote">“{content.text}”</p>
          <span className="acsec__by">— <Empty v={content.by} /></span>
        </>
      }>
      <Field label="Stars"><TextInput name="stars" defaultValue={content.stars} /></Field>
      <Field label="Quote"><TextArea name="text" defaultValue={content.text} rows={3} /></Field>
      <Field label="Attribution" optional><TextInput name="by" defaultValue={content.by} /></Field>
    </SectionCard>
  );
}

export function CtaForm({ content }: { content: CtaContent }) {
  return (
    <SectionCard icon="phone" title="Call to action" where="Bottom of the homepage" blockKey="cta"
      preview={
        <>
          <p className="acsec__h">{content.title}</p>
          <p className="acsec__text">{content.sub}</p>
          <span className="acsec__chip"><Icon name="phone" size={13} />{content.phoneLabel}</span>
        </>
      }>
      <Field label="Title"><TextInput name="title" defaultValue={content.title} /></Field>
      <Field label="Subtext" optional><TextArea name="sub" defaultValue={content.sub} rows={3} /></Field>
      <div className="atwo">
        <Field label="Phone button label"><TextInput name="phoneLabel" defaultValue={content.phoneLabel} /></Field>
        <Field label="Phone link (tel:…)"><TextInput name="phoneHref" defaultValue={content.phoneHref} placeholder="tel:+94…" /></Field>
      </div>
    </SectionCard>
  );
}

export function StoryForm({ content }: { content: StoryContent }) {
  const tr = useT();
  return (
    <SectionCard icon="pen" title="Story section" where="About the salon" blockKey="story" wide
      preview={
        <>
          <span className="acsec__eyebrow"><Empty v={content.eyebrow} /></span>
          <p className="acsec__h">{content.heading}</p>
          <p className="acsec__text acsec__clamp">{content.paragraphs[0] ?? ''}</p>
          <span className="acsec__by">{content.paragraphs.length} {tr(content.paragraphs.length === 1 ? 'paragraph' : 'paragraphs')} · {content.sign}</span>
        </>
      }>
      <Field label="Eyebrow" optional><TextInput name="eyebrow" defaultValue={content.eyebrow} /></Field>
      <Field label="Heading"><TextInput name="heading" defaultValue={content.heading} /></Field>
      <Field label="Paragraphs" hint="Leave a blank line between paragraphs."><TextArea name="paragraphs" defaultValue={content.paragraphs.join('\n\n')} rows={8} /></Field>
      <Field label="Sign-off" optional><TextInput name="sign" defaultValue={content.sign} /></Field>
    </SectionCard>
  );
}

export function ContactForm({ content }: { content: ContactContent }) {
  return (
    <SectionCard icon="pin" title="Contact & footer" where="Visit page and site footer" blockKey="contact" wide
      preview={
        <ul className="acsec__facts">
          <li><Icon name="pin" size={14} /><Empty v={content.address} /></li>
          <li><Icon name="phone" size={14} /><Empty v={[content.phonePrimary, content.phoneOther].filter(Boolean).join(' · ')} /></li>
          <li><Icon name="external" size={14} /><Empty v={content.facebookUrl} /></li>
        </ul>
      }>
      <Field label="Address"><TextInput name="address" defaultValue={content.address} /></Field>
      <div className="atwo">
        <Field label="Plus code" optional><TextInput name="plusCode" defaultValue={content.plusCode} /></Field>
        <Field label="Primary phone"><TextInput name="phonePrimary" defaultValue={content.phonePrimary} /></Field>
      </div>
      <Field label="Other phones" optional><TextInput name="phoneOther" defaultValue={content.phoneOther} /></Field>
      <Field label="Map embed URL" optional hint="Google Maps → Share → Embed a map, then paste the src link."><TextInput name="mapEmbedUrl" defaultValue={content.mapEmbedUrl} /></Field>
      <Field label="Facebook URL" optional><TextInput name="facebookUrl" defaultValue={content.facebookUrl} /></Field>
      <Field label="Footer blurb" optional><TextArea name="footerBlurb" defaultValue={content.footerBlurb} rows={2} /></Field>
    </SectionCard>
  );
}

const DAY_LABELS: { dow: number; label: string }[] = [
  { dow: 1, label: 'Monday' }, { dow: 2, label: 'Tuesday' }, { dow: 3, label: 'Wednesday' },
  { dow: 4, label: 'Thursday' }, { dow: 5, label: 'Friday' }, { dow: 6, label: 'Saturday' },
  { dow: 0, label: 'Sunday' },
];
const TIME_OPTIONS: number[] = (() => { const o: number[] = []; for (let m = 0; m <= 1440; m += 30) o.push(m); return o; })();

export function HoursForm({ hours }: { hours: BusinessHour[] }) {
  const tr = useT();
  const byDow = new Map(hours.map((h) => [h.day_of_week, h]));
  const today = new Date().getDay();
  return (
    <SectionCard icon="clock" title="Opening hours" where="Booking calendar and Visit page" action={saveHours} wide
      preview={
        <ul className="acsec__hours">
          {DAY_LABELS.map(({ dow, label }) => {
            const h = byDow.get(dow);
            return (
              <li key={dow} className={dow === today ? 'is-today' : undefined}>
                <span>{tr(label)}</span>
                {h?.is_closed ? <em>{tr('Closed')}</em> : <b>{minutesToLabel(h?.open_minute ?? 600)} – {minutesToLabel(h?.close_minute ?? 1440)}</b>}
              </li>
            );
          })}
        </ul>
      }>
      {DAY_LABELS.map(({ dow, label }) => {
        const h = byDow.get(dow);
        return (
          <div key={dow} className="ahours-row">
            <span className="ahours-row__day">{tr(label)}</span>
            <select className="ainput" name={`open_${dow}`} defaultValue={h?.open_minute ?? 600} aria-label={`${tr(label)} ${tr('opens')}`}>
              {TIME_OPTIONS.map((m) => <option key={m} value={m}>{minutesToLabel(m)}</option>)}
            </select>
            <select className="ainput" name={`close_${dow}`} defaultValue={h?.close_minute ?? 1440} aria-label={`${tr(label)} ${tr('closes')}`}>
              {TIME_OPTIONS.map((m) => <option key={m} value={m}>{minutesToLabel(m)}</option>)}
            </select>
            <Switch name={`closed_${dow}`} label="Closed" defaultChecked={h?.is_closed ?? false} />
          </div>
        );
      })}
    </SectionCard>
  );
}
