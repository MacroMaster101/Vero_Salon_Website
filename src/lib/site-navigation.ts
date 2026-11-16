/** Full navigation remains available on every public page, including the mobile More menu. */
export const SITE_NAVIGATION = [
  { id: 'about', label: 'Story', href: '/about' },
  { id: 'how', label: 'How it works', href: '/your-visit' },
  { id: 'services', label: 'Services', href: '/services' },
  { id: 'looks', label: 'Lookbook', href: '/lookbook' },
  { id: 'team', label: 'Stylists', href: '/stylists' },
  { id: 'reviews', label: 'Reviews', href: '/#reviews' },
  { id: 'faq', label: 'FAQ', href: '/#faq' },
  { id: 'visit', label: 'Visit', href: '/visit' },
] as const;

export function navigationHref(item: { id: string; href: string }) {
  return item.href;
}

