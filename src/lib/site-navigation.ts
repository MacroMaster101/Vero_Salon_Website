/** Every public destination, in the same order as the homepage sections (the
    homepage scroll-spy lights them top to bottom). The footer lists all of these. */
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

/** Reviews and FAQ are homepage sections, not pages: on the homepage they scroll
    to the section, but from an inner page they would bounce the visitor back to
    the homepage, so inner pages only list the real pages. */
export function isHomeOnlyItem(item: { href: string }) {
  return item.href.startsWith('/#');
}

/** The links a page's header (and the mobile More sheet) should show. */
export function navigationFor(path: string) {
  return path === '/' ? SITE_NAVIGATION : SITE_NAVIGATION.filter(item => !isHomeOnlyItem(item));
}

export function navigationHref(item: { id: string; href: string }) {
  return item.href;
}
