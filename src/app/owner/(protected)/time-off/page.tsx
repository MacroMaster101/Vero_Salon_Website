import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { requireRole } from '@/lib/supabase/auth';
import { getStylists } from '@/lib/queries';
import type { Holiday, BlockedSlot } from '@/lib/supabase/types';
import { HolidayForms } from '@/components/admin/holiday-form';
import { BlockForm } from '@/components/admin/block-form';
import { DeleteForm } from '@/components/admin/form-kit';
import { LoadError } from '@/components/admin/load-error';
import { deleteHoliday } from '@/app/admin/(protected)/holidays/holiday-actions';
import { deleteBlock } from '@/app/admin/(protected)/blocked-slots/block-actions';
import { salonDayKey } from '@/lib/booking-rows';
import { Icon } from '@/components/ui/icon';
import { AdminTitle, AdminEmpty } from '@/components/admin/admin-title';

const TZ = 'Asia/Colombo';
const fullFmt = new Intl.DateTimeFormat('en-LK', { timeZone: TZ, weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
const timeFmt = new Intl.DateTimeFormat('en-LK', { timeZone: TZ, hour: 'numeric', minute: '2-digit', hour12: true });
const dayFmt = new Intl.DateTimeFormat('en-LK', { timeZone: TZ, day: 'numeric' });
const monFmt = new Intl.DateTimeFormat('en-LK', { timeZone: TZ, month: 'short' });
const wdFmt = new Intl.DateTimeFormat('en-LK', { timeZone: TZ, weekday: 'long' });
const ymdFmt = new Intl.DateTimeFormat('en-CA', { timeZone: TZ });

function holidayParts(ymd: string) {
  const [y, m, d] = ymd.split('-').map(Number) as [number, number, number];
  const dt = new Date(y, m - 1, d);
  return { day: String(d), mon: dt.toLocaleString('en-LK', { month: 'short' }), full: fullFmt.format(dt) };
}

type BlockRow = BlockedSlot & { stylists: { name: string } | null };

export default async function OwnerTimeOffPage() {
  await requireRole(['owner'], '/owner/time-off');
  const sb = await createClient();
  // Salon-local "today" — toISOString() is UTC (5:30 behind Colombo) and would
  // drop today's holiday from the list between midnight and 5:30 AM.
  const today = salonDayKey(new Date());
  const [{ data: holidayData, error: holidayErr }, { data: blockData, error: blockErr }, stylists] = await Promise.all([
    sb.from('holidays').select('*').gte('date', today).order('date'),
    sb.from('blocked_slots').select('*, stylists(name)').gt('ends_at', new Date().toISOString()).order('starts_at'),
    getStylists(),
  ]);
  const holidays = (holidayData ?? []) as Holiday[];
  const blocks = (blockData ?? []) as unknown as BlockRow[];

  return (
    <div className="apage">
      <Link href="/owner" className="oback"><Icon name="arrowLeft" className="ic" /> Home</Link>
      <div className="ahead"><AdminTitle icon="ban" eyebrow="Schedule" title="Days off & blocks" /></div>
      <p className="lead apage__lead">Close whole days (holidays) or block part of a day for one stylist or the whole shop.</p>

      <section className="asec">
        <div className="asec-head">
          <h2 className="asec-title">Closed days{!holidayErr && <span className="asec-count">{holidays.length}</span>}</h2>
          <HolidayForms fab={false} />
        </div>
        <LoadError what="holidays" error={holidayErr} />
        {holidayErr ? null : holidays.length === 0 ? (
          <AdminEmpty icon="sun" title="No holidays yet — sync from Google or add one above." />
        ) : (
          <ul className="adlist">
            {holidays.map((h) => {
              const d = holidayParts(h.date);
              return (
                <li key={h.date} className="adrow">
                  <span className="adrow__date"><b>{d.day}</b><small>{d.mon}</small></span>
                  <div className="adrow__main">
                    <b className="adrow__name">{h.name}</b>
                    <span className="adrow__meta">
                      <span>{d.full}</span>
                      <span className={`adrow__src${h.source === 'google' ? ' is-google' : ''}`}>{h.source === 'google' ? 'From Google' : 'Added manually'}</span>
                    </span>
                  </div>
                  <DeleteForm action={deleteHoliday} id={h.date} name="date" label="Remove" iconOnly confirm="Remove this closed day?" />
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="asec" style={{ marginTop: 36 }}>
        <div className="asec-head">
          <h2 className="asec-title">Blocked times{!blockErr && <span className="asec-count">{blocks.length}</span>}</h2>
          <BlockForm stylists={stylists} fab={false} />
        </div>
        <LoadError what="blocked slots" error={blockErr} />
        {blockErr ? null : blocks.length === 0 ? (
          <AdminEmpty icon="ban" title="No upcoming blocks.">Use Add block to close off time for a stylist or the whole salon.</AdminEmpty>
        ) : (
          <ul className="adlist">
            {blocks.map((b) => {
              const start = new Date(b.starts_at); const end = new Date(b.ends_at);
              const sameDay = ymdFmt.format(start) === ymdFmt.format(end);
              return (
                <li key={b.id} className="adrow">
                  <span className="adrow__date"><b>{dayFmt.format(start)}</b><small>{monFmt.format(start)}</small></span>
                  <div className="adrow__main">
                    <b className="adrow__name">{b.stylists?.name ?? 'Whole salon'}</b>
                    <span className="adrow__meta">
                      <span>{wdFmt.format(start)}</span>
                      <span>{timeFmt.format(start)} – {sameDay ? timeFmt.format(end) : `${dayFmt.format(end)} ${monFmt.format(end)}, ${timeFmt.format(end)}`}</span>
                      {b.reason && <span>{b.reason}</span>}
                    </span>
                  </div>
                  <DeleteForm action={deleteBlock} id={b.id} label="Remove" iconOnly confirm="Remove this block?" />
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
