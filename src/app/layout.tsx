
import type {Metadata} from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: "Elgo Space",
    template: `%s | Elgo Space`,
  },
  description: 'Book your space with Elgo Space.',
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
