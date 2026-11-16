import type { ReactNode } from 'react';
import { PublicSiteShell } from '@/components/site/public-site-shell';

export default function SiteLayout({ children }: { children: ReactNode }) {
  return <PublicSiteShell>{children}</PublicSiteShell>;
}
