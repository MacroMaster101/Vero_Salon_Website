'use client';
import { ListToolbar, type FilterChip } from '@/components/admin/list-toolbar';
import { Field, TextInput, Switch, DeleteForm } from '@/components/admin/form-kit';
import { FormModal } from '@/components/admin/form-modal';
import { ImageField } from '@/components/admin/image-field';
import { MediaCard, CardImg } from '@/components/admin/media-card';
import { useViewMode } from '@/components/admin/use-view-mode';
import { ViewToggle } from '@/components/admin/view-toggle';
import { createStylist, updateStylist, deleteStylist } from './actions';
import { stylistAvatarSrc } from '@/lib/stylist-card';
import { dicebearUrl } from '@/lib/avatar';
import type { Stylist } from '@/lib/supabase/types';
import { useT } from '@/lib/i18n/locale-context';

function StylistFields({ s }: { s?: Stylist }) {
  return (
    <>
      <Field label="Name" required><TextInput name="name" defaultValue={s?.name ?? ''} required placeholder="e.g. Nadeesha Perera" /></Field>
      <Field label="Slug" optional hint="Used in links. Leave blank to make it from the name."><TextInput name="slug" defaultValue={s?.slug ?? ''} placeholder="auto from name" /></Field>
      <div className="atwo">
        <Field label="Role" optional><TextInput name="role" defaultValue={s?.role ?? ''} placeholder="e.g. Senior stylist" /></Field>
        <Field label="Sort order" optional><TextInput name="sort_order" type="number" defaultValue={s?.sort_order ?? 0} /></Field>
      </div>
      <Field label="Tags" optional hint="Comma separated, e.g. Colour, Bridal"><TextInput name="tags" defaultValue={(s?.tags ?? []).join(', ')} placeholder="Colour, Cuts" /></Field>
      <ImageField name="avatar_url" label="Avatar" defaultValue={s?.avatar_url ?? ''} />
      <Switch name="is_active" label="Active (shown on site)" defaultChecked={s?.is_active ?? true} />
    </>
  );
}

function AddButton() {
  return (
    <FormModal trigger={{ label: 'Add stylist', icon: 'plus', variant: 'fab' }} title="New stylist" icon="user"
      action={createStylist} submitLabel="Add stylist" pendingLabel="Adding…" okToast="Stylist added.">
      <StylistFields />
    </FormModal>
  );
}

/** Edit popup + Delete — one instance per item, shared by row and card views. */
function StylistActions({ s }: { s: Stylist }) {
  const tr = useT();
  return (
    <>
      <FormModal trigger={{ label: 'Edit', icon: 'pen' }} title="Edit stylist" subtitle={s.name} icon="user"
        action={updateStylist}>
        <input type="hidden" name="id" value={s.id} />
        <StylistFields s={s} />
      </FormModal>
      <DeleteForm action={deleteStylist} id={s.id} iconOnly confirm={`${tr('Delete')} "${s.name}"?`} />
    </>
  );
}

function EditRow({ s }: { s: Stylist }) {
  const tr = useT();
  return (
    <li className="arow">
      <span className="arow__thumb arow__thumb--round"><CardImg src={stylistAvatarSrc(s)} fallbackSrc={dicebearUrl(s.slug || s.name)} /></span>
      <div className="arow__head">
        <span className="arow__name">{s.name}</span>
        <span className="arow__meta">{s.role}{s.is_active ? '' : ` · ${tr('hidden')}`}</span>
      </div>
      <div className="arow__actions">
        <StylistActions s={s} />
      </div>
    </li>
  );
}

function StylistCard({ s }: { s: Stylist }) {
  const tr = useT();
  const tags = (s.tags ?? []).slice(0, 3).join(' · ');
  return (
    <MediaCard
      media={{ src: stylistAvatarSrc(s), fallbackSrc: dicebearUrl(s.slug || s.name), shape: 'avatar' }}
      title={s.name}
      meta={[s.role, tags].filter(Boolean).join(' — ') || tr('Stylist')}
      badges={s.is_active ? [] : [{ label: 'Hidden', tone: 'hidden' as const }]}
    >
      <StylistActions s={s} />
    </MediaCard>
  );
}

export function StylistsList({ stylists }: { stylists: Stylist[] }) {
  const [mode, setMode] = useViewMode('stylists');
  const chips: FilterChip<Stylist>[] = [
    { id: 'all', label: 'All', match: () => true },
    { id: 'active', label: 'Active', match: (s) => s.is_active },
    { id: 'hidden', label: 'Hidden', match: (s) => !s.is_active },
  ];
  return (
    <div className="acrud acrud--full">
        <ListToolbar
          items={stylists}
          placeholder="Search stylists…"
          searchText={(s) => `${s.name} ${s.role} ${(s.tags ?? []).join(' ')}`}
          chips={chips}
          emptyLabel="No stylists match your filters."
          right={<ViewToggle mode={mode} onChange={setMode} />}
          add={<AddButton />}
          empty={{ icon: 'user', title: 'No stylists yet', text: 'Add your first stylist so customers can pick who they book with.' }}
          render={(rows) =>
            mode === 'cards'
              ? <ul className="mgrid">{rows.map((s) => <StylistCard key={s.id} s={s} />)}</ul>
              : <ul className="alist">{rows.map((s) => <EditRow key={s.id} s={s} />)}</ul>
          }
        />
    </div>
  );
}
