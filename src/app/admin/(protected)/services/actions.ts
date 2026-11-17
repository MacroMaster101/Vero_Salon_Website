'use server';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requireRole } from '@/lib/supabase/auth';
import { serviceInputSchema, categoryInputSchema } from '@/lib/admin/service-schema';

type Result = { ok: true } | { error: string };

const PATH = '/admin/services';

function parse(formData: FormData) {
  return serviceInputSchema.safeParse({
    name: formData.get('name') ?? '',
    slug: formData.get('slug') ?? '',
    description: formData.get('description') ?? '',
    category: formData.get('category') ?? 'hair',
    price_lkr: formData.get('price_lkr') ?? '0',
    duration_min: formData.get('duration_min') ?? '1',
    icon: formData.get('icon') ?? 'scissors',
    image_url: formData.get('image_url') ?? '',
    bookable: formData.get('bookable') ? 'true' : '',
    is_active: formData.get('is_active') ? 'true' : '',
    is_featured: formData.get('is_featured') ? 'true' : '',
    sort_order: formData.get('sort_order') ?? '0',
  });
}

function revalidate() {
  revalidatePath(PATH);
  revalidatePath('/owner/services');
  revalidatePath('/services');
  revalidatePath('/');
}

/** Postgres "undefined_column" — image_url exists in the schema/types but the
 *  0006 migration may not be applied yet. Strip it and retry so admin service
 *  edits keep working before the migration runs. */
function isMissingImageColumn(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  return error.code === '42703' || /image_url/.test(error.message ?? '');
}

export async function createService(formData: FormData): Promise<Result> {
  await requireRole(['owner'], PATH);
  const parsed = parse(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Invalid input' };
  const sb = await createClient();
  let { error } = await sb.from('services').insert(parsed.data);
  if (error && isMissingImageColumn(error)) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { image_url: _image_url, ...rest } = parsed.data;
    ({ error } = await sb.from('services').insert(rest));
  }
  if (error) return { error: error.message };
  revalidate();
  return { ok: true };
}

export async function updateService(formData: FormData): Promise<Result> {
  await requireRole(['owner'], PATH);
  const id = String(formData.get('id') ?? '');
  if (!id) return { error: 'Missing service id' };
  const parsed = parse(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Invalid input' };
  const sb = await createClient();
  let { error } = await sb.from('services').update(parsed.data).eq('id', id);
  if (error && isMissingImageColumn(error)) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { image_url: _image_url, ...rest } = parsed.data;
    ({ error } = await sb.from('services').update(rest).eq('id', id));
  }
  if (error) return { error: error.message };
  revalidate();
  return { ok: true };
}

export async function deleteService(formData: FormData): Promise<Result> {
  await requireRole(['owner'], PATH);
  const id = String(formData.get('id') ?? '');
  if (!id) return { error: 'Missing service id' };
  const sb = await createClient();
  const { error } = await sb.from('services').delete().eq('id', id);
  if (error) return { error: error.message };
  revalidate();
  return { ok: true };
}

// ── categories ─────────────────────────────────────────────────

function parseCategory(formData: FormData) {
  return categoryInputSchema.safeParse({
    name: formData.get('name') ?? '',
    slug: formData.get('slug') ?? '',
    note: formData.get('note') ?? '',
    icon: formData.get('icon') ?? 'scissors',
    image_url: formData.get('image_url') ?? '',
    is_active: formData.get('is_active') ? 'true' : '',
    sort_order: formData.get('sort_order') ?? '0',
  });
}

/** Postgres "undefined_table" — migration 0014 has not been applied yet */
function categoryError(error: { code?: string; message?: string }): string {
  if (error.code === '42P01' || (/service_categories/.test(error.message ?? '') && /does not exist|schema cache/.test(error.message ?? ''))) {
    return 'Categories are not set up in the database yet (migration 0014).';
  }
  if (error.code === '23505') return 'A category with that name already exists.';
  if (error.code === '23503') return 'This category still has services. Move or delete them first.';
  return error.message ?? 'Something went wrong';
}

export async function createCategory(formData: FormData): Promise<Result> {
  await requireRole(['owner'], PATH);
  const parsed = parseCategory(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Invalid input' };
  const { image_url, ...rest } = parsed.data;
  const sb = await createClient();
  const { error } = await sb.from('service_categories').insert({ ...rest, image_url: image_url || null });
  if (error) return { error: categoryError(error) };
  revalidate();
  return { ok: true };
}

export async function updateCategory(formData: FormData): Promise<Result> {
  await requireRole(['owner'], PATH);
  const slug = String(formData.get('slug') ?? '');
  if (!slug) return { error: 'Missing category' };
  const parsed = parseCategory(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Invalid input' };
  // the slug is the link from each service, so it stays as it was created
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { slug: _slug, image_url, ...rest } = parsed.data;
  const sb = await createClient();
  const { error } = await sb.from('service_categories').update({ ...rest, image_url: image_url || null }).eq('slug', slug);
  if (error) return { error: categoryError(error) };
  revalidate();
  return { ok: true };
}

export async function deleteCategory(formData: FormData): Promise<Result> {
  await requireRole(['owner'], PATH);
  const slug = String(formData.get('slug') ?? '');
  if (!slug) return { error: 'Missing category' };
  const sb = await createClient();
  const { count } = await sb.from('services').select('id', { count: 'exact', head: true }).eq('category', slug);
  if (count) return { error: 'This category still has services. Move or delete them first.' };
  const { error } = await sb.from('service_categories').delete().eq('slug', slug);
  if (error) return { error: categoryError(error) };
  revalidate();
  return { ok: true };
}
