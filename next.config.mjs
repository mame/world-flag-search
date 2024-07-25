import withPWAInit from '@ducanh2912/next-pwa';

const withPWA = withPWAInit({
  dest: 'public',
});

export default withPWA({
  assetPrefix: '/world-flag-search',
  i18n: {
    locales: ['en', 'ja'],
    defaultLocale: 'en',
  },
  images: {
    unoptimized: true,
  },
  basePath: '/world-flag-search',
  trailingSlash: true,
  output: 'export',
  distDir: 'docs',
});
