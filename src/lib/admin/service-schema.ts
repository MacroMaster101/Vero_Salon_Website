import { isSafeImageUrl } from './image-url';
// Zod schema + slug helper for the admin "service" create/edit form. Validates
// admin input server-side before it reaches the DB.
import { z } from 'zod';

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const numberFromForm = z.coerce.number();

export const serviceInputSchema = z
  .object({
    name: z.string().trim().min(1, 'Name is required'),
    slug: z.string().trim().default(''),
    description: z.string().trim().max(280).default(''),
    category: z.string().trim().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Pick a category'),
    price_lkr: numberFromForm.int().min(0, 'Price cannot be negative'),
    duration_min: numberFromForm.int().positive('Duration must be greater than 0'),
    icon: z.string().trim().min(1).default('scissors'),
    image_url: z.string().trim().default('').refine((v) => v === '' || isSafeImageUrl(v), 'Use an uploaded image'),
    bookable: z.coerce.boolean().default(true),
    is_active: z.coerce.boolean().default(true),
    is_featured: z.coerce.boolean().default(false),
    sort_order: numberFromForm.int().default(0),
  })
  .transform((v) => ({ ...v, slug: v.slug ? slugify(v.slug) : slugify(v.name) }));

/** icons a category may use (all exist in components/ui/icon) */
export const CATEGORY_ICONS = ['scissors', 'user', 'star', 'people', 'tag', 'clock', 'eye', 'calendar', 'check', 'grid', 'pin'] as const;

export const categoryInputSchema = z
  .object({
    name: z.string().trim().min(1, 'Name is required').max(60),
    slug: z.string().trim().default(''),
    note: z.string().trim().max(140).default(''),
    icon: z.enum(CATEGORY_ICONS).catch('scissors'),
    image_url: z.string().trim().default('').refine((v) => v === '' || isSafeImageUrl(v), 'Use an uploaded image'),
    is_active: z.coerce.boolean().default(true),
    sort_order: numberFromForm.int().default(0),
  })
  .transform((v) => ({ ...v, slug: v.slug ? slugify(v.slug) : slugify(v.name) }))
  .refine((v) => v.slug.length > 0, { message: 'Name needs a letter or number', path: ['name'] });
