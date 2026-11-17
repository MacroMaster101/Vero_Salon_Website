'use client';
import { ListToolbar, type FilterChip } from '@/components/admin/list-toolbar';
import { Field, TextInput, Switch, DeleteForm } from '@/components/admin/form-kit';
import { FormModal } from '@/components/admin/form-modal';
import { ImageField } from '@/components/admin/image-field';
import { MediaCard, CardImg } from '@/components/admin/media-card';
import { useViewMode } from '@/components/admin/use-view-mode';
import { ViewToggle } from '@/components/admin/view-toggle';
import { createGalleryItem, updateGalleryItem, deleteGalleryItem } from './actions';
import type { GalleryItem } from '@/lib/supabase/types';
import { useT } from '@/lib/i18n/locale-context';

function GalleryFields({ g }: { g?: GalleryItem }) {
  return (
    <>
      <Field label="Title" required><TextInput name="title" defaultValue={g?.title ?? ''} required placeholder="e.g. Soft balayage" /></Field>
      <div className="atwo">
        <Field label="Tag" optional><TextInput name="tag" defaultValue={g?.tag ?? ''} placeholder="e.g. Colour" /></Field>
        <Field label="Sort order" optional><TextInput name="sort_order" type="number" defaultValue={g?.sort_order ?? 0} /></Field>
      </div>
      <Field label="Category / caption" optional><TextInput name="category" defaultValue={g?.category ?? ''} placeholder="e.g. Hair · Colour" /></Field>
      <ImageField name="image_url" label="Image" defaultValue={g?.image_url ?? ''} required />
      <Switch name="is_active" label="Active (shown on site)" defaultChecked={g?.is_active ?? true} />
    </>
  );
}

function AddButton() {
  return (
    <FormModal trigger={{ label: 'Add photo', icon: 'plus', variant: 'fab' }} title="New lookbook photo" icon="image"
      action={createGalleryItem} submitLabel="Add photo" pendingLabel="Adding…" okToast="Photo added.">
      <GalleryFields />
    </FormModal>
  );
}

/** Edit popup + Delete — one instance per item, shared by row and card views. */
function GalleryActions({ g }: { g: GalleryItem }) {
  const tr = useT();
  return (
    <>
      <FormModal trigger={{ label: 'Edit', icon: 'pen' }} title="Edit photo" subtitle={g.title} icon="image"
        action={updateGalleryItem}>
        <input type="hidden" name="id" value={g.id} />
        <GalleryFields g={g} />
      </FormModal>
      <DeleteForm action={deleteGalleryItem} id={g.id} iconOnly confirm={`${tr('Delete')} "${g.title}"?`} />
    </>
  );
}

function EditRow({ g }: { g: GalleryItem }) {
  const tr = useT();
  return (
    <li className="arow">
      <span className="arow__thumb"><CardImg src={g.image_url || '/images/services/hair.png'} fallbackSrc="/images/services/hair.png" /></span>
      <div className="arow__head">
        <span className="arow__name">{g.title}</span>
        <span className="arow__meta">{g.tag}{g.is_active ? '' : ` · ${tr('hidden')}`}</span>
      </div>
      <div className="arow__actions">
        <GalleryActions g={g} />
      </div>
    </li>
  );
}

function GalleryCard({ g }: { g: GalleryItem }) {
  return (
    <MediaCard
      media={{ src: g.image_url || '/images/services/hair.png', fallbackSrc: '/images/services/hair.png' }}
      title={g.title}
      meta={[g.tag, g.category].filter(Boolean).join(' · ')}
      badges={g.is_active ? [] : [{ label: 'Hidden', tone: 'hidden' as const }]}
    >
      <GalleryActions g={g} />
    </MediaCard>
  );
}

export function GalleryList({ items }: { items: GalleryItem[] }) {
  const [mode, setMode] = useViewMode('gallery');
  const chips: FilterChip<GalleryItem>[] = [
    { id: 'all', label: 'All', match: () => true },
    { id: 'active', label: 'Active', match: (g) => g.is_active },
    { id: 'hidden', label: 'Hidden', match: (g) => !g.is_active },
  ];
  return (
    <div className="acrud acrud--full">
        <ListToolbar
          items={items}
          placeholder="Search gallery…"
          searchText={(g) => `${g.title} ${g.tag} ${g.category}`}
          chips={chips}
          emptyLabel="No gallery items match your filters."
          right={<ViewToggle mode={mode} onChange={setMode} />}
          add={<AddButton />}
          empty={{ icon: 'image', title: 'No photos yet', text: 'Add the first photo to show it in the Lookbook.' }}
          render={(rows) =>
            mode === 'cards'
              ? <ul className="mgrid">{rows.map((g) => <GalleryCard key={g.id} g={g} />)}</ul>
              : <ul className="alist">{rows.map((g) => <EditRow key={g.id} g={g} />)}</ul>
          }
        />
    </div>
  );
}
