'use client';
import { useState } from 'react';
import { ListToolbar, type FilterChip } from '@/components/admin/list-toolbar';
import { Field, TextInput, TextArea, Switch, DeleteForm } from '@/components/admin/form-kit';
import { FormModal } from '@/components/admin/form-modal';
import { AdminEmpty } from '@/components/admin/admin-title';
import { ImageField } from '@/components/admin/image-field';
import { MediaCard, CardImg } from '@/components/admin/media-card';
import { useViewMode } from '@/components/admin/use-view-mode';
import { ViewToggle } from '@/components/admin/view-toggle';
import { createService, updateService, deleteService, createCategory, updateCategory, deleteCategory } from './actions';
import { CATEGORY_ICONS } from '@/lib/admin/service-schema';
import { Icon } from '@/components/ui/icon';
import { money } from '@/lib/format';
import { servicePhoto } from '@/lib/service-photo';
import type { Service, ServiceCategoryRow } from '@/lib/supabase/types';
import { useT } from '@/lib/i18n/locale-context';

type Cat = Pick<ServiceCategoryRow, 'slug' | 'name'>;

function durationLabel(min: number): string {
  const h = Math.floor(min / 60); const m = min % 60;
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
}

function ServiceFields({ s, categories, category }: { s?: Service; categories: Cat[]; category?: string }) {
  const tr = useT();
  return (
    <>
      <Field label="Name" required><TextInput name="name" defaultValue={s?.name ?? ''} required placeholder={tr('e.g. Hair cut & blow dry')} /></Field>
      <Field label="Slug" optional hint="Used in links. Leave blank to make it from the name."><TextInput name="slug" defaultValue={s?.slug ?? ''} placeholder={tr('auto from name')} /></Field>
      <Field label="Description" optional><TextArea name="description" defaultValue={s?.description ?? ''} rows={2} placeholder={tr('One line customers see under the name.')} /></Field>
      <Field label="Category" required>
        <select className="ainput" name="category" defaultValue={s?.category ?? category ?? categories[0]?.slug ?? 'hair'} required>
          {categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
        </select>
      </Field>
      <div className="atwo">
        <Field label="Price (LKR)" required><TextInput name="price_lkr" type="number" min={0} defaultValue={s?.price_lkr ?? 0} required /></Field>
        <Field label="Duration (min)" required><TextInput name="duration_min" type="number" min={1} defaultValue={s?.duration_min ?? 30} required /></Field>
      </div>
      <div className="atwo">
        <Field label="Icon" optional><TextInput name="icon" defaultValue={s?.icon ?? 'scissors'} /></Field>
        <Field label="Sort order" optional><TextInput name="sort_order" type="number" defaultValue={s?.sort_order ?? 0} /></Field>
      </div>
      <ImageField name="image_url" label="Service photo" defaultValue={s?.image_url ?? ''} />
      <div className="aswitches">
      <Switch name="bookable" label="Bookable" defaultChecked={s?.bookable ?? true} />
      <Switch name="is_active" label="Active (shown on site)" defaultChecked={s?.is_active ?? true} />
      <Switch name="is_featured" label="Featured (highlighted in the app)" defaultChecked={s?.is_featured ?? false} />
      </div>
    </>
  );
}

function AddServiceButton({ categories, category }: { categories: Cat[]; category?: string }) {
  return (
    <FormModal trigger={{ label: 'Add service', icon: 'plus', variant: 'fab' }} title="New service" icon="scissors"
      subtitle={categories.find((c) => c.slug === category)?.name}
      action={createService} submitLabel="Add service" pendingLabel="Adding…" okToast="Service added." wide>
      <ServiceFields categories={categories} category={category} />
    </FormModal>
  );
}

/** Edit popup + Delete — one instance per item, shared by row and card views. */
function ServiceActions({ s, categories }: { s: Service; categories: Cat[] }) {
  const tr = useT();
  return (
    <>
      <FormModal trigger={{ label: 'Edit', icon: 'pen' }} title="Edit service" subtitle={s.name} icon="scissors" action={updateService} wide>
        <input type="hidden" name="id" value={s.id} />
        <ServiceFields s={s} categories={categories} />
      </FormModal>
      <DeleteForm action={deleteService} id={s.id} iconOnly confirm={`${tr('Delete')} "${s.name}"?`} />
    </>
  );
}

function EditRow({ s, categories }: { s: Service; categories: Cat[] }) {
  const tr = useT();
  const photo = servicePhoto(s);
  return (
    <li className="arow">
      {photo.type === 'img' && <span className="arow__thumb"><CardImg src={photo.src} fallbackSrc={photo.fallbackSrc} /></span>}
      <div className="arow__head">
        <span className="arow__name">{s.name}</span>
        <span className="arow__meta">{money(s.price_lkr)} · {durationLabel(s.duration_min)}{s.is_featured ? ` · ${tr('featured')}` : ''}{s.is_active ? '' : ` · ${tr('hidden')}`}</span>
      </div>
      <div className="arow__actions">
        <ServiceActions s={s} categories={categories} />
      </div>
    </li>
  );
}

function ServiceCard({ s, categories }: { s: Service; categories: Cat[] }) {
  const photo = servicePhoto(s);
  return (
    <MediaCard
      media={{ src: photo.type === 'img' ? photo.src : '', fallbackSrc: photo.type === 'img' ? photo.fallbackSrc : undefined }}
      title={s.name}
      price={money(s.price_lkr)}
      meta={s.description || undefined}
      dur={durationLabel(s.duration_min)}
      badges={[
        ...(s.is_featured ? [{ label: 'Featured', tone: 'featured' as const }] : []),
        ...(s.is_active ? [] : [{ label: 'Hidden', tone: 'hidden' as const }]),
      ]}
    >
      <ServiceActions s={s} categories={categories} />
    </MediaCard>
  );
}

/** The services inside one category. */
export function ServicesList({ services, categories, category }: { services: Service[]; categories: Cat[]; category?: string }) {
  const [mode, setMode] = useViewMode('services');
  const chips: FilterChip<Service>[] = [
    { id: 'all', label: 'All', match: () => true },
    { id: 'featured', label: 'Featured', match: (s) => s.is_featured },
    { id: 'hidden', label: 'Hidden', match: (s) => !s.is_active },
  ];
  return (
    <div className="acrud acrud--full">
        <ListToolbar
          items={services}
          placeholder="Search services…"
          searchText={(s) => `${s.name} ${s.slug}`}
          chips={chips}
          emptyLabel="No services match your filters."
          right={<ViewToggle mode={mode} onChange={setMode} />}
          add={<AddServiceButton categories={categories} category={category} key={category} />}
          empty={{ icon: 'scissors', title: 'No services in this category yet', text: 'Add the first one with the Add service button.' }}
          render={(rows) =>
            mode === 'cards'
              ? <ul className="mgrid">{rows.map((s) => <ServiceCard key={s.id} s={s} categories={categories} />)}</ul>
              : <ul className="alist">{rows.map((s) => <EditRow key={s.id} s={s} categories={categories} />)}</ul>
          }
        />
    </div>
  );
}

// ── categories ─────────────────────────────────────────────────

type CatIcon = (typeof CATEGORY_ICONS)[number];
const ICON_LABELS: Record<CatIcon, string> = {
  scissors: 'Scissors', user: 'Person', star: 'Star', people: 'People', tag: 'Tag', clock: 'Clock',
  eye: 'Eye', calendar: 'Calendar', check: 'Tick', grid: 'Grid', pin: 'Pin',
};
const safeIcon = (i: string): CatIcon => ((CATEGORY_ICONS as readonly string[]).includes(i) ? i as CatIcon : 'scissors');

function CategoryFields({ c }: { c?: ServiceCategoryRow }) {
  const tr = useT();
  return (
    <>
      <Field label="Name" required><TextInput name="name" defaultValue={c?.name ?? ''} placeholder={tr('e.g. Nails & spa')} required maxLength={60} /></Field>
      {c && <input type="hidden" name="slug" value={c.slug} />}
      <Field label="Short line" optional hint="Shown under the name on the Services page."><TextInput name="note" defaultValue={c?.note ?? ''} placeholder={tr('e.g. Clean, polished hands and feet.')} maxLength={140} /></Field>
      <div className="atwo">
        <Field label="Icon">
          <select className="ainput" name="icon" defaultValue={safeIcon(c?.icon ?? 'scissors')}>
            {CATEGORY_ICONS.map((i) => <option key={i} value={i}>{tr(ICON_LABELS[i])}</option>)}
          </select>
        </Field>
        <Field label="Sort order" optional><TextInput name="sort_order" type="number" defaultValue={c?.sort_order ?? 0} /></Field>
      </div>
      <ImageField name="image_url" label="Banner photo" defaultValue={c?.image_url ?? ''} />
      <Switch name="is_active" label="Show on the website" defaultChecked={c?.is_active ?? true} />
    </>
  );
}

// Floating "+" on the category list (the service list has its own "Add service").
function AddCategoryButton() {
  return (
    <FormModal trigger={{ label: 'Add category', icon: 'plus', variant: 'fab' }} title="New category" icon="grid"
      action={createCategory} submitLabel="Add category" pendingLabel="Adding…" okToast="Category added.">
      <CategoryFields />
    </FormModal>
  );
}

function CategoryEdit({ c, count }: { c: ServiceCategoryRow; count: number }) {
  const tr = useT();
  return (
    <>
      <FormModal trigger={{ label: 'Edit', icon: 'pen', variant: 'icon' }} title="Edit category" subtitle={c.name} icon="grid" action={updateCategory}>
        <CategoryFields c={c} />
      </FormModal>
      <DeleteForm action={deleteCategory} id={c.slug} name="slug" iconOnly
        confirm={count ? `"${c.name}" · ${count} ${tr(count === 1 ? 'service' : 'services')} — ${tr("It can't be deleted until they're moved. Try anyway?")}` : `${tr('Delete this category?')} "${c.name}"`} />
    </>
  );
}

/**
 * Services admin: first the categories as cards (add, edit, remove);
 * opening one shows the services inside it, where new services are added.
 */
export function ServicesManager({ services, categories }: { services: Service[]; categories: ServiceCategoryRow[] }) {
  const tr = useT();
  const [open, setOpen] = useState<string | null>(null);
  const current = categories.find((c) => c.slug === open);
  const countOf = (slug: string) => services.filter((s) => s.category === slug).length;
  const orphans = services.filter((s) => !categories.some((c) => c.slug === s.category));

  if (current) {
    const n = countOf(current.slug);
    return (
      <div className="acat-open">
        <div className="acat-hero">
          <CardImg src={current.image_url || '/images/services/hair.png'} fallbackSrc="/images/services/hair.png" className="acat-hero__img" />
          <div className="acat-hero__shade" />
          <button type="button" className="acat-hero__back" onClick={() => setOpen(null)}>
            <Icon name="arrowLeft" size={16} /> {tr('All categories')}
          </button>
          <div className="acat-hero__copy">
            <span className="acat-hero__icon"><Icon name={safeIcon(current.icon)} size={20} /></span>
            <div>
              <h2>{current.name}</h2>
              <p>{current.note || tr('No short line yet.')}</p>
            </div>
            <span className="acat-hero__count">{n} {tr(n === 1 ? 'service' : 'services')}{current.is_active ? '' : ` · ${tr('hidden')}`}</span>
          </div>
        </div>
        <ServicesList services={services.filter((s) => s.category === current.slug)} categories={categories} category={current.slug} />
      </div>
    );
  }

  return (
    <div className="acrud acrud--full">
        <div className="atool atool--bar">
          <p className="acat-hint">{tr('Pick a category to see and edit its services. Customers see these as the tabs on the Services page.')}</p>
          <span className="atool__end"><AddCategoryButton /></span>
        </div>
        {categories.length === 0 && (
          <AdminEmpty icon="grid" title="No categories yet">{tr('Add a category, then add services inside it.')}</AdminEmpty>
        )}
        <ul className="acat-grid">
          {categories.map((c) => {
            const n = countOf(c.slug);
            return (
              <li key={c.slug} className={`acat-card${c.is_active ? '' : ' is-hidden'}`}>
                <button type="button" className="acat-card__media" onClick={() => setOpen(c.slug)} aria-label={`${tr('Open')} ${c.name}`}>
                  <CardImg src={c.image_url || '/images/services/hair.png'} fallbackSrc="/images/services/hair.png" className="acat-card__img" />
                  <span className="acat-card__shade" />
                  <span className="acat-card__icon"><Icon name={safeIcon(c.icon)} size={18} /></span>
                  {!c.is_active && <span className="acat-card__flag">{tr('Hidden')}</span>}
                  <span className="acat-card__title">
                    <b>{c.name}</b>
                    <small>{n} {tr(n === 1 ? 'service' : 'services')}</small>
                  </span>
                </button>
                <div className="acat-card__body">
                  {c.note && <p>{c.note}</p>}
                  <div className="acat-card__actions">
                    <button type="button" className="btn btn--primary acat-openbtn" onClick={() => setOpen(c.slug)}>
                      {tr('Open services')} <Icon name="arrowLeft" size={15} className="acat-card__arrow" />
                    </button>
                    <CategoryEdit c={c} count={n} />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
        {orphans.length > 0 && (
          <p className="astatus astatus--err">{tr('These services use a category that no longer exists:')} {orphans.map((s) => s.name).join(', ')}.</p>
        )}
    </div>
  );
}
