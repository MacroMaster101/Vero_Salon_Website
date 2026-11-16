// Self-hosted modern sans pairing for Vero's softer studio identity.
import { Geist, Manrope, Noto_Sans_Sinhala } from 'next/font/google';

export const geist = Geist({
  subsets: ['latin'],
  variable: '--font-poppins',
  display: 'swap',
});

export const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
});

export const sinhala = Noto_Sans_Sinhala({
  subsets: ['sinhala', 'latin'],
  variable: '--font-sinhala',
  display: 'swap',
});
