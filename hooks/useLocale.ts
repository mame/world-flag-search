import { useRouter } from 'next/router';

export interface T {
  LANGUAGE: string;
  LANGUAGE_NAME: string;
  TITLE: string;
  USAGE: string;
  ABOUT: string;
  USAGE_DESCRIPTION_1: string;
  USAGE_DESCRIPTION_2: string;
  USAGE_DESCRIPTION_3: string;
  USAGE_DESCRIPTION_4: string;
  ABOUT_DESCRIPTION_1: string;
  ABOUT_DESCRIPTION_2: string;
  CLOSE: string;
}

const en: T = {
  LANGUAGE: 'Language',
  LANGUAGE_NAME: 'English',
  TITLE: 'World Flag Search',
  USAGE: 'How to use',
  ABOUT: 'About',
  USAGE_DESCRIPTION_1: 'Search world flags by drawing a sketch!',
  USAGE_DESCRIPTION_2: 'Tips:',
  USAGE_DESCRIPTION_3: 'The color scheme is more important than the shape.',
  USAGE_DESCRIPTION_4:
    'If you cannot find your flag, change the colors. Orange may be recognized as red or yellow. Dark cyan may be blue or azure.',
  ABOUT_DESCRIPTION_1: 'Author:',
  ABOUT_DESCRIPTION_2: 'Source code:',
  CLOSE: 'Close',
};

const ja: T = {
  LANGUAGE: '言語',
  LANGUAGE_NAME: '日本語',
  TITLE: '手描き国旗検索',
  USAGE: '使いかた',
  ABOUT: 'このアプリについて',
  USAGE_DESCRIPTION_1:
    '手描きで国旗が検索できます。あの国旗、どこの国だっけ？というときに。',
  USAGE_DESCRIPTION_2: 'ヒント：',
  USAGE_DESCRIPTION_3: '細かい形より大まかな配色が重要です',
  USAGE_DESCRIPTION_4:
    'うまく出てこない時は、色を試行錯誤してみてください。橙は赤か黄色か、濃い水色は青か水色か。',
  ABOUT_DESCRIPTION_1: '作者：',
  ABOUT_DESCRIPTION_2: 'ソースコード： ',
  CLOSE: '閉じる',
};

const db = {
  en,
  ja,
};

type UseLocaleType = {
  locale: string;
  t: T;
  locales: [string, string][];
  changeLocale: (locale: string) => void;
};

export const useLocale = (): UseLocaleType => {
  const { locale, push } = useRouter();

  const t = db[locale as 'en' | 'ja'] || db['en'];

  const locales: [string, string][] = ['en', 'ja'].map((locale) => [
    locale,
    db[locale as 'en' | 'ja'].LANGUAGE_NAME,
  ]);

  const changeLocale = (locale: string) => {
    push('/', '/', { locale });
  };

  return { locale: locale as string, t, locales, changeLocale };
};
