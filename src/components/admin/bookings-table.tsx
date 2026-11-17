'use client';

import { useEffect, useId, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { setBookingStatus, type BookingStatus } from '@/app/admin/(protected)/booking-actions';
import { ListToolbar, type FilterChip } from '@/components/admin/list-toolbar';
import { useT } from '@/lib/i18n/locale-context';

export interface BookingRow {
  id: string;
  reference: string;
  customerName: string;
  customerPhone: string;
  serviceName: string;
  stylistName: string;
  whenLabel: string;
  status: BookingStatus;
}

const STATUS_LABEL: Record<BookingStatus, string> = {
  confirmed: 'Confirmed', completed: 'Completed', no_show: 'No-show', cancelled: 'Cancelled',
};
const STATUS_CLASS: Record<BookingStatus, string> = {
  confirmed: 'tag--confirmed', completed: 'tag--completed', no_show: 'tag--no_show', cancelled: 'tag--cancelled',
};

const ACTIONS: Array<{ status: BookingStatus; label: string }> = [
  { status: 'completed', label: 'Complete' },
  { status: 'no_show', label: 'No-show' },
  { status: 'cancelled', label: 'Cancel' },
];

function StatusChip({ status }: { status: BookingStatus }) {
  const tr = useT();
  return <span className={`tag ${STATUS_CLASS[status]}`}>{tr(STATUS_LABEL[status])}</span>;
}

export function BookingsTable({ bookings }: { bookings: BookingRow[] }) {
  const tr = useT();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  // Unique per instance: the admin page mounts this table more than once
  // (Today + Upcoming). Supabase reuses a channel by name, so a shared name
  // makes the second mount call .on() after .subscribe() — which throws.
  const channelId = useId();

  useEffect(() => {
    const sb = createClient();
    const ch = sb
      .channel(`admin-bookings:${channelId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => router.refresh())
      .subscribe();
    return () => {
      sb.removeChannel(ch);
    };
  }, [router, channelId]);

  function onSet(id: string, status: BookingStatus) {
    startTransition(async () => {
      const res = await setBookingStatus(id, status);
      if ('error' in res) {
        alert(`${tr('Could not update booking')}: ${res.error}`);
        return;
      }
      router.refresh();
    });
  }

  const chips: FilterChip<BookingRow>[] = [
    { id: 'all', label: 'All', match: () => true },
    { id: 'confirmed', label: 'Confirmed', match: (b) => b.status === 'confirmed' },
    { id: 'completed', label: 'Completed', match: (b) => b.status === 'completed' },
    { id: 'no_show', label: 'No-show', match: (b) => b.status === 'no_show' },
    { id: 'cancelled', label: 'Cancelled', match: (b) => b.status === 'cancelled' },
  ];

  return (
    <ListToolbar
      items={bookings}
      placeholder="Search customer, phone or ref…"
      searchText={(b) => `${b.customerName} ${b.customerPhone} ${b.reference}`}
      chips={chips}
      emptyLabel="No bookings match your filters."
      render={(rows) => (
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>{tr('When')}</th><th>{tr('Customer')}</th><th>{tr('Service')}</th><th>{tr('Stylist')}</th><th>{tr('Ref')}</th><th>{tr('Status')}</th>
                <th style={{ textAlign: 'right' }}>{tr('Actions')}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((b) => (
                <tr key={b.id}>
                  <td data-label={tr('When')}>{b.whenLabel}</td>
                  <td data-label={tr('Customer')}>
                    <div style={{ fontWeight: 600 }}>{b.customerName}</div>
                    <div style={{ opacity: 0.65, fontSize: 12.5 }}>{b.customerPhone}</div>
                  </td>
                  <td data-label={tr('Service')}>{b.serviceName}</td>
                  <td data-label={tr('Stylist')}>{b.stylistName}</td>
                  <td className="ref" data-label={tr('Ref')}>{b.reference}</td>
                  <td data-label={tr('Status')}><StatusChip status={b.status} /></td>
                  <td className="data-table__actions" style={{ textAlign: 'right' }}>
                    {ACTIONS.filter((a) => a.status !== b.status).map((a) => (
                      <button
                        key={a.status}
                        className="btn btn--ghost"
                        style={{ padding: '6px 11px', fontSize: 12.5, marginLeft: 6 }}
                        disabled={pending}
                        onClick={() => onSet(b.id, a.status)}
                      >
                        {tr(a.label)}
                      </button>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    />
  );
}
