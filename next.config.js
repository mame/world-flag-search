/* eslint-disable
   @typescript-eslint/no-var-requires
 */

const withPWA = require('next-pwa');
const { PHASE_PRODUCTION_BUILD } = require("next/constants");

module.exports = (phase) => {
  const basePath = phase == PHASE_PRODUCTION_BUILD ? "/world-flag-search" : "";
  return withPWA({
    env: {
      BASE_PATH: basePath,
    },
    assetPrefix: basePath,
    pwa: {
      dest: 'public',
    },
    i18n: {
      locales: ['en', 'ja'],
      defaultLocale: 'en',
    },
    basePath: basePath,
    trailingSlash: true,
  });
};
