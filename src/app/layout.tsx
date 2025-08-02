
import type {Metadata} from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Lauft Locations',
  description: 'Find your next workspace with Lauft.',
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
