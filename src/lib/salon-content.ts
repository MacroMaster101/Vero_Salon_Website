export const STEPS = [
  { h: 'Book a slot', p: process.env.NEXT_PUBLIC_COMING_SOON === 'true' ? 'Call or message us to arrange your service and time. Walk-ins welcome too.' : 'Pick a service, a stylist and a time online — in under a minute. Walk-ins welcome too.' },
  { h: 'Consultation', p: 'Show a photo or describe the look. We advise what suits your hair, face and budget.' },
  { h: 'Sit back', p: 'A relaxing wash and prep gets you comfortable before your stylist begins.' },
  { h: 'Style & finish', p: 'A final styling, a mirror check from every angle, and you walk out looking your best.' },
];

export const FAQS = [
  { q: 'Do you take walk-ins?', a: 'Yes — walk-ins are always welcome. Booking ahead just guarantees your preferred stylist and time.' },
  { q: 'Is a deposit required to book?', a: process.env.NEXT_PUBLIC_COMING_SOON === 'true' ? 'No deposit is needed. Call or message us to arrange your appointment.' : 'No deposit and no account needed. Just pick a service, a stylist and a time.' },
  { q: 'Where can I park?', a: 'Street parking is available right by the salon in Pasyala.' },
  { q: 'Do you do bridal and party makeup?', a: 'Yes — we offer full bridal hair and makeup as well as occasion styling. Ask at your consultation.' },
  { q: 'What are your opening hours?', a: 'We are open daily from 10 AM until midnight. See the Visit section for the full week.' },
];

export const DAYS = [
  { dow: 1, label: 'Monday' },
  { dow: 2, label: 'Tuesday' },
  { dow: 3, label: 'Wednesday' },
  { dow: 4, label: 'Thursday' },
  { dow: 5, label: 'Friday' },
  { dow: 6, label: 'Saturday' },
  { dow: 0, label: 'Sunday' },
];

