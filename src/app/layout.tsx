
import type {Metadata} from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: "Heavenkeys Booking",
    template: `%s | Heavenkeys Booking`,
  },
  description: 'Book your space with Heavenkeys.',
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
