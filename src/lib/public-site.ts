import 'server-only';
import { cache } from 'react';
import { cookies } from 'next/headers';
import { getBookableServices, getStylists, getGallery, getRecentReviews, getBusinessHours, getServiceCategories } from '@/lib/queries';
import { getSiteContent } from '@/lib/content/get';
import { getProfile } from '@/lib/supabase/auth';
import { createClient } from '@/lib/supabase/server';

/** A request-local snapshot shared by each public page and its booking/account shell. */
export const getPublicSite = cache(async () => {
  const [services, categories, stylists, gallery, reviews, hours, hero, story, stats, cta, contact, profile, cookieStore, sb] = await Promise.all([
    getBookableServices(), getServiceCategories(), getStylists(), getGallery(), getRecentReviews(), getBusinessHours(),
    getSiteContent('hero'), getSiteContent('story'), getSiteContent('stats'), getSiteContent('cta'), getSiteContent('contact'),
    getProfile(), cookies(), createClient(),
  ]);
  const { data: { user } } = await sb.auth.getUser();
  const locale = cookieStore.get('locale')?.value === 'si' ? 'si' : 'en';
  return {
    services, categories, stylists, gallery, reviews, hours, hero, story, stats, cta, contact, profile, locale,
    userMetadata: user?.user_metadata ?? null,
    hasPassword: (user?.identities ?? []).some(i => i.provider === 'email') || user?.user_metadata?.has_password === true,
  };
});
