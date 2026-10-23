import { Atkinson_Hyperlegible } from 'next/font/google';
import './globals.css';

// Designed for legibility at a glance, which suits phones in bright polling-day conditions.
const font = Atkinson_Hyperlegible({ subsets: ['latin'], weight: ['400', '700'] });

export const metadata = { title: 'ElectWatch 2027', description: 'Election incident reporting, Nasarawa State pilot' };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={font.className}>{children}</body>
    </html>
  );
}
