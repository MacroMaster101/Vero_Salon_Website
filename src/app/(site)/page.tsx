import { LocationPreview } from "@/components/site/location-preview";
import { Words } from '@/components/site/words';
import { salonLocations } from "@/lib/salon-locations";
import Link from 'next/link';
import { t } from '@/lib/i18n/translations';
import { getPublicSite } from '@/lib/public-site';
import { FAQS } from '@/lib/salon-content';
import { BookButton } from '@/components/site/book-button';
import { Faq } from '@/components/home/faq';
import { ImgSlot } from '@/components/site/img-slot';
import { ServicePreview } from '@/components/home/services-tabs';
import { LookbookPreview } from '@/components/site/lookbook-preview';
import { HeroPortraits } from '@/components/home/hero-portraits';

const reviewDate = new Intl.DateTimeFormat('en-LK', { timeZone: 'Asia/Colombo', day: 'numeric', month: 'short', year: 'numeric' });

export default async function Home({ searchParams }: { searchParams: Promise<{ deleted?: string }> }) {
  const sp = await searchParams;
  const { services, gallery, reviews, hours, hero: storedHero, story: storedStory, contact: storedContact, locale } = await getPublicSite();
  const hero = { ...storedHero };
  if (hero.line1 === 'The art of') hero.line1 = 'Look good.';
  if (hero.line2Em === 'looking') hero.line2Em = 'Feel like';
  if (hero.line3 === 'remarkable.') hero.line3 = 'yourself.';
  if (['Est. — Pasyala · Sri Lanka', 'Men’s grooming in Pasyala', 'Your unisex salon in Pasyala'].includes(hero.eyebrow)) hero.eyebrow = 'Your unisex salons in Pasyala & Kaleliya';
  if (hero.lead.startsWith('A warm, unisex home') || hero.lead.startsWith('Precision cuts, fresh fades')) hero.lead = 'Fresh cuts, beautiful colour and a little time for yourself. Hair and beauty for women, men and children, all in one welcoming space.';
  for (const key of ['eyebrow', 'line1', 'line2Em', 'line3', 'lead'] as const) hero[key] = t(hero[key], locale);
  const story = { ...storedStory, heading: t(storedStory.heading, locale), eyebrow: t(storedStory.eyebrow, locale), paragraphs: storedStory.paragraphs.map(p => t(p, locale)), sign: t(storedStory.sign, locale) };
  const contact = { ...storedContact, address: t(storedContact.address, locale), plusCode: t(storedContact.plusCode, locale) };
  const translatedFaqs = FAQS.slice(0,3).map(f => ({ q: t(f.q, locale), a: t(f.a, locale) }));
  const looks = [...gallery].sort((a,b) => Number(/gents|beard/i.test(b.title)) - Number(/gents|beard/i.test(a.title))).slice(0,4);
  return <>
    {sp.deleted === '1' && <div className="salon-notice" role="status">{t('Your account and personal data have been deleted. Thank you for visiting Vero Salon.', locale)}</div>}

          {/* ── hero ── */}
          <section className="home-hero home-hero--portrait">
            <div className="home-wrap home-hero__grid">
              <div className="studio-hero-copy home-reveal">
                <span className="home-eyebrow">{hero.eyebrow}</span>
                <h1 className="home-hero__display">
                  <span className="ln">{hero.line1}</span>
                  <span className="ln">{hero.line2Em}</span>
                  {hero.line3 && <span className="ln ln--accent">{hero.line3}</span>}
                </h1>
                <p className="home-hero__lead">{hero.lead}</p>
                <div className="home-hero__actions">
                  <BookButton variant="primary">{t('Book a visit', locale)}</BookButton>
                  <a className="home-link" href="/services">{t('See our services', locale)}</a>
                </div>
              </div>
              <HeroPortraits locale={locale} />
            </div>
          </section>

          {/* ── story / about ── */}
          <section className="home-section home-story salon-home-story" id="about">
            <div className="home-wrap home-story__grid">
              <div className="home-story__art home-reveal">
                <ImgSlot src="/images/generated/salon-care.webp" alt={t('Personal hair care and styling',locale)} sizes="(max-width: 980px) 100vw, 50vw" />
              </div>
              <div className="home-reveal">
                <span className="home-eyebrow">{t('A space for everyone',locale)}</span>
                <h2 className="home-h"><Words text={t('Get to know Vero',locale)} /></h2>
                <p>{story.paragraphs[0]}</p>
                <Link className="salon-section-link" href="/about">{t('Get to know Vero', locale)}</Link>
              </div>
            </div>
          </section>

          {/* ── how it works ── */}
          <section className="home-section salon-home-guide" id="how"><div className="home-wrap"><div className="salon-home-guide__intro home-reveal"><div><span className="home-eyebrow">{t('How it works',locale)}</span><h2 className="home-h"><Words text={t('Your visit, made easy.',locale)} /></h2></div><Link href="/your-visit" className="salon-section-link">{t('The full visit guide',locale)}</Link></div><ol>{[
            {h:'Book a slot',p:'Choose your service and a time that suits you.'},
            {h:'Consultation',p:'Tell us your idea. We will help shape the look.'},
            {h:'Sit back',p:'Relax while we take care of the details.'},
            {h:'Style & finish',p:'Check the result and leave feeling refreshed.'},
          ].map((step,index)=><li className="home-reveal" key={step.h}><span aria-hidden="true">0{index+1}</span><h3>{t(step.h,locale)}</h3><p>{t(step.p,locale)}</p></li>)}</ol></div></section>

          {/* ── services / pricing ── */}
          <section className="home-section salon-home-services" id="services">
            <div className="home-wrap">
              <div className="home-head home-reveal">
                <span className="home-eyebrow">{t('The service edit', locale)}</span>
                <h2 className="home-h"><Words text={t('Services & pricing', locale)} /></h2>
                <div className="salon-section-intro"><p className="home-lead">{t('From a quick tidy-up to a whole new look, find the care that fits your day.', locale)}</p><Link className="salon-section-link" href="/services">{t('View all services', locale)}</Link></div>
              </div>
              <ServicePreview services={services} locale={locale} />
              <p className="salon-pricing-note">{t('Prices in LKR. Your stylist will confirm the final quote before starting.', locale)}</p>
            </div>
          </section>

          {/* ── lookbook ── */}
          {looks.length > 0 && (
            <section className="home-section" id="looks" style={{ background: 'transparent' }}>
              <div className="home-wrap">
                <LookbookPreview items={looks} locale={locale} />
              </div>
            </section>
          )}

          {/* ── reviews ── */}
            <section className="home-section salon-home-reviews" id="reviews">
              <div className="home-wrap">
                {reviews.length > 0 && <div className="home-head home-reveal">
                  <span className="home-eyebrow home-eyebrow--center">{t('Client voices', locale)}</span>
                  <h2 className="home-h"><Words text={t('What guests say', locale)} /></h2>
                </div>}
                <div className="home-reviews__grid home-car">
                  {reviews.length === 0 && <div className="salon-google-reviews home-reveal"><div><span className="home-eyebrow">{t('A little local love',locale)}</span><strong><b data-ticker="4.9">4.9</b> <span>/ 5</span></strong><span>{t('Google rating', locale)}</span></div><div><h2><Words text={t('Good company. Great hair.',locale)} /></h2><p>{t('Explore customer feedback and get to know the salon on Google.', locale)}</p></div><a className="home-link" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`Vero Salon ${contact.address}`)}`} target="_blank" rel="noopener noreferrer">{t('Read the reviews', locale)}</a></div>}
                  {reviews.slice(0, 3).map((r) => (
                    <article className="home-card home-review home-reveal" key={r.id}>
                      <div className="home-review__stars" aria-label={t('{rating} out of 5', locale).replace('{rating}', String(r.rating))}>{'★'.repeat(r.rating)}</div>
                      {r.comment && <p>&ldquo;{r.comment}&rdquo;</p>}
                      <div className="home-review__foot">
                        <div className="home-review__by">
                          <b>{r.customer_name}</b>
                          {r.stylist_name && <span>{t('with', locale)} {r.stylist_name}</span>}
                        </div>
                        <span className="home-review__date">{reviewDate.format(new Date(r.created_at))}</span>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </section>

          {/* ── faq ── */}
          <section className="home-section salon-home-faq" id="faq">
            <div className="home-wrap salon-faq-layout">
              <div className="salon-faq-intro home-reveal">
                <span className="home-eyebrow">{t('Before your visit', locale)}</span>
                <h2 className="home-h"><Words text={t('Frequently asked questions', locale)} /></h2>
                <Link href="/your-visit" className="salon-section-link">{t('More about your visit',locale)}</Link>
              </div>
              <div className="home-reveal">
                <Faq items={translatedFaqs} />
              </div>
            </div>
          </section>

          <LocationPreview locations={salonLocations(storedContact)} locale={locale} hours={hours} phoneOther={storedContact.phoneOther} facebookUrl={storedContact.facebookUrl} />


  </>;
}
