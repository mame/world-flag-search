import Feature from './Feature';

export const WIDTH = 36;
export const HEIGHT = 24;
const SUBWIDTH = WIDTH / 3;
const SUBHEIGHT = HEIGHT / 3;
const DEFAULT_COLOR = 1; // black

export const PEN: [number, number, number][][] = [1, 1.4, 3.5].map((radius) => {
  const ary: [number, number, number][] = [];
  for (let y = -3; y <= 3; y++) {
    for (let x = -3; x <= 3; x++) {
      if (Math.hypot(x, y) < radius) {
        ary.push([x, y, -x * 2 + 1]);
        break;
      }
    }
  }
  return ary;
});

type Segment = [number, number];
type RGB = [number, number, number];

export default class Sketch {
  segments: Segment[][];
  feature: Feature;

  constructor(segments?: Segment[][], feature?: Feature) {
    if (segments && feature) {
      this.segments = segments;
      this.feature = feature;
    } else {
      this.segments = new Array(HEIGHT).fill([[WIDTH, DEFAULT_COLOR]]);
      this.feature = Feature.initialCanvasFeature(
        WIDTH * HEIGHT,
        DEFAULT_COLOR
      );
    }
  }

  copy(): Sketch {
    return new Sketch(this.segments, this.feature);
  }

  draw(penX: number, penY: number, penType: number, penColor: number): void {
    penX = Math.floor(penX);
    penY = Math.floor(penY);
    PEN[penType].forEach(([dx, dy, w]) => {
      const y = penY + dy;
      if (y < 0 || HEIGHT <= y) return;

      const x = penX + dx;
      const left = x < 0 ? 0 : x;
      const right = x + w >= WIDTH ? WIDTH : x + w;
      if (left >= right) return;

      const segments = this.segments[y];
      let i1 = -1;
      let w1 = -1;
      let c1 = -1;
      let x1 = -1;
      let i2 = -1;
      let w2 = -1;
      let c2 = -1;
      let oldX = 0;
      segments.forEach(([width, color], i) => {
        if (oldX <= right) {
          i2 = i;
          w2 = oldX + width - right;
          c2 = color;
        }
        oldX += width;
        if (i1 == -1 && left <= oldX) {
          i1 = i;
          w1 = left - (oldX - width);
          c1 = color;
          x1 = oldX - width;
        }
      });

      const newSubseq: Segment[] = [];
      let seg: Segment = [w1, c1];
      if (c1 == penColor) {
        seg[0] += right - left;
      } else {
        if (seg[0] > 0) newSubseq.push(seg);
        seg = [right - left, penColor];
      }
      if (penColor == c2) {
        seg[0] += w2;
      } else {
        if (seg[0] > 0) newSubseq.push(seg);
        seg = [w2, c2];
      }
      if (seg[0] > 0) newSubseq.push(seg);

      const newSegments = [...segments];
      const oldSubseq = newSegments.splice(i1, i2 - i1 + 1, ...newSubseq);
      this.segments[y] = newSegments;

      w1 = w2 = 0;
      while (w1 > 0 || oldSubseq.length > 0) {
        if (w1 == 0) [w1, c1] = oldSubseq.shift() as Segment;
        if (w2 == 0) [w2, c2] = newSubseq.shift() as Segment;
        const w3 = (Math.floor(x1 / SUBWIDTH) + 1) * SUBWIDTH - x1;
        const w = Math.min(w1, w2, w3);
        if (c1 != c2) {
          this.feature.updatePixels(
            c1,
            c2,
            Math.floor(x1 / SUBWIDTH),
            Math.floor(y / SUBHEIGHT),
            w
          );
        }
        x1 += w;
        w1 -= w;
        w2 -= w;
      }
    });
  }

  forEachColor(handler: (segs: RGB[], color: number) => void): void {
    const allSegs: RGB[][] = [[], [], [], [], [], [], [], []];
    for (let y = 0; y < HEIGHT; y++) {
      let x = 0;
      this.segments[y].forEach(([width, color]) => {
        allSegs[color].push([x, x + width, y + 0.5]);
        x += width;
      });
    }
    allSegs.forEach(handler);
  }
}
