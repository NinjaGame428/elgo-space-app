
import createNextIntlPlugin from 'next-intl/plugin';
import type {NextConfig} from 'next';
 
const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'https',
        hostname: 'firebasestudio.googleapis.com',
      },
    ],
  },
};

export default withNextIntl(nextConfig);
