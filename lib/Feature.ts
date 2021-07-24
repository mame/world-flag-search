// This handles a flag feature as a 64-dimensional vector.
//
// A flag is separated 3x3 cells.
//
//   +--+-+--+
//   |nw|n|ne|
//   +--+-+--+
//   | w|c| e|
//   +--+-+--+
//   |sw|s|se|
//   +--+-+--+
//
// Region 1: nw + n + ne
// Region 2:  w + c +  e
// Region 3: sw + s + se
// Region 4: nw + w + sw
// Region 5: n  + c + s
// Region 6: ne + e + se
// Region 7: nw + c + se
// Region 8: sw + c + ne
//
// Each region has a histogram of the reduced eight colors.

const COLOR_DIM = 8;
const REGION_DIM = 8;

const SQRT: number[][] = [];
for (let j = 0; j < 300; j++) {
  SQRT.push([]);
  for (let i = 0; i < 300; i++) {
    SQRT[j][i] = Math.sqrt(j * i);
  }
}

export default class Feature {
  values: number[];

  static initialCanvasFeature(
    pixel_count: number,
    init_color: number
  ): Feature {
    const values = [];
    for (let i = 0; i < COLOR_DIM * REGION_DIM; i++) {
      values[i] = i % COLOR_DIM == init_color ? pixel_count / 3 : 0;
    }
    return new Feature(values);
  }

  constructor(values: number[]) {
    this.values = values;
  }

  updatePixels(c1: number, c2: number, x: number, y: number, n: number): void {
    this.values[y * COLOR_DIM + c1] -= n;
    this.values[y * COLOR_DIM + c2] += n;
    this.values[REGION_DIM * 3 + x * COLOR_DIM + c1] -= n;
    this.values[REGION_DIM * 3 + x * COLOR_DIM + c2] += n;

    if (x == y) {
      this.values[REGION_DIM * 6 + c1] -= n;
      this.values[REGION_DIM * 6 + c2] += n;
    }

    if (x == 2 - y) {
      this.values[REGION_DIM * 7 + c1] -= n;
      this.values[REGION_DIM * 7 + c2] += n;
    }
  }

  calculateScore(other: Feature): number {
    const otherValues = other.values;
    let score = 0;

    // Bhattacharyya coefficient
    for (let v = 0; v < 2; v++) {
      for (let j = v * 3; j < v * 3 + 3; j++) {
        let num = 0;
        for (let i = v * 3; i < v * 3 + 3; i++) {
          let n = 0;
          let ii = i * COLOR_DIM;
          let jj = j * COLOR_DIM;
          for (let c = 0; c < COLOR_DIM; c++) {
            n += SQRT[this.values[jj++]][otherValues[ii++]];
          }
          if (i != j) n *= 0.7;
          if (num < n) num = n;
        }
        score += num;
      }
    }
    for (let i = 6 * COLOR_DIM; i < 8 * COLOR_DIM; i++) {
      score += SQRT[this.values[i]][otherValues[i]];
    }

    return score * score;
  }
}
