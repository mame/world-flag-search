import Feature from './Feature';
import json from '../flags.json';
import { WIDTH, HEIGHT } from '../lib/Sketch';
import createPartialSorter from './createPartialSorter';

export interface ItemInfo {
  iso_a2: string;
  info: string;
  score: number;
  img: HTMLImageElement | null;
  name: string;
  url: string;
}

export class Item {
  iso_a2: string;
  info: string;
  names: { [key: string]: string };
  img: HTMLImageElement | null;

  score: number;
  feature: Feature;

  constructor(
    iso_a2: string,
    iso_a3: string,
    names: { [key: string]: string },
    feature: Feature
  ) {
    this.iso_a2 = iso_a2;
    this.info = `ISO: ${iso_a2} / ${iso_a3}`;
    this.names = names;
    this.score = 0;
    this.feature = feature;
    this.img = null;
  }

  updateScore(feature: Feature): void {
    this.score = this.feature.calculateScore(feature);
  }

  getInfo(locale: string): ItemInfo {
    const normalized_score = (this.score * 3) / WIDTH / HEIGHT / 256 / 8 / 8;
    const percentage = Math.min(100, Math.max(0, normalized_score * 100));

    if (!this.names[locale]) locale = 'en';

    return {
      iso_a2: this.iso_a2,
      score: percentage,
      info: this.info,
      img: this.img,
      name: this.names[locale],
      url: `https://${locale}.wikipedia.org/wiki/${encodeURIComponent(
        this.names[locale]
      )}`,
    };
  }
}

class FlagDB {
  flagItems: Item[];
  partialSorter: (start: number, length: number) => void;

  constructor() {
    this.flagItems = json.map(
      ({ a2, a3, names, feature }) =>
        new Item(a2, a3, names, new Feature(feature))
    );
    this.partialSorter = createPartialSorter(this.flagItems);
  }

  async loadImages(progress: (percentage: number) => void) {
    const loadImage = (src: string): Promise<HTMLImageElement> => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = (err) => reject(err);
        img.src = src;
      });
    };

    for (let i = 0; i < this.flagItems.length; i++) {
      progress((i / this.flagItems.length) * 100);
      const item = this.flagItems[i];
      item.img = await loadImage(
        `${process.env.BASE_PATH}/images/flags/${item.iso_a2.toLowerCase()}.png`
      );
    }
  }

  updateRanking(
    feature: Feature,
    start: number,
    length: number
  ): [Item[], boolean] {
    this.flagItems.forEach((item) => {
      item.score = item.feature.calculateScore(feature);
    });

    if (start + length > this.flagItems.length)
      length = this.flagItems.length - start;

    this.partialSorter(start, length);

    return [
      this.flagItems.slice(0, start + length),
      this.flagItems.length == start + length,
    ];
  }
}

export default new FlagDB();
