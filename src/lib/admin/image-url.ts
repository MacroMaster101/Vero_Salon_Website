// Image URLs the admin forms may store: a site-relative path (/images/...)
// or a public object in our Supabase storage. Anything else (javascript:,
// data:, other hosts) is rejected — next/image would refuse it anyway.
export function isSafeImageUrl(v: string): boolean {
  if (v.startsWith('/') && !v.startsWith('//')) return !/[\s\\]/.test(v);
  try {
    const u = new URL(v);
    return u.protocol === 'https:'
      && u.hostname.endsWith('.supabase.co')
      && u.pathname.startsWith('/storage/v1/object/public/');
  } catch {
    return false;
  }
}
