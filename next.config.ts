import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
  serverExternalPackages: ['satori', 'harfbuzzjs'],
};

const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);