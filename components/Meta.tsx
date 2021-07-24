import React, { FC } from 'react';
import Head from 'next/head';
import { useLocale } from '../hooks/useLocale';
import { useRouter } from 'next/router';

const Meta: FC = () => {
  const { t, locale } = useLocale();
  const { basePath } = useRouter();

  // manifest.json files
  let manifestLocale = locale;
  switch (locale) {
    case 'en':
      break;
    case 'ja':
      break;
    default:
      manifestLocale = 'en';
  }

  return (
    <Head>
      <title>{t.TITLE}</title>
      <meta name="description" content={t.USAGE_DESCRIPTION_1} />
      <meta property="og:type" content="website" />
      <meta property="og:title" content={t.TITLE} />
      <meta property="og:url" content={basePath} />
      <meta property="og:description" content={t.USAGE_DESCRIPTION_1} />
      <meta property="og:site_name" content={t.TITLE} />
      <meta
        property="og:image"
        content="https://mame.github.io/world-flag-search/ogp.png"
      />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="format-detection" content="telephone=no" />
      <link rel="apple-touch-icon" href={`${basePath}/apple-touch-icon.png`} />
      <link
        rel="icon"
        type="image/png"
        sizes="32x32"
        href={`${basePath}/favicon-32x32.png`}
      />
      <link
        rel="icon"
        type="image/png"
        sizes="16x16"
        href={`${basePath}/favicon-16x16.png`}
      />
      <link rel="icon" href={`${basePath}/favicon.ico`} />
      <link
        rel="mask-icon"
        href={`${basePath}/safari-pinned-tab.svg`}
        color="#03a9f4"
      />
      <link
        rel="manifest"
        href={`${basePath}/${manifestLocale}.manifest.json`}
      />
      <meta name="msapplication-TileColor" content="#84ea74" />
      <meta name="theme-color" content="#84ea74" />
      <script
        data-ad-client="ca-pub-6743566866644964"
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"
      ></script>
      <script
        async
        src="https://www.googletagmanager.com/gtag/js?id=G-MEE2RHP7T4"
      ></script>
      <script
        dangerouslySetInnerHTML={{
          __html: `
        window.dataLayer = window.dataLayer || [];
        function gtag(){window.dataLayer.push(arguments);}
        gtag('js', new Date());

        gtag('config', 'G-MEE2RHP7T4');`,
        }}
      />
    </Head>
  );
};

export default Meta;
