import React, {
  FC,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useDraw } from '../hooks/useDraw';
import Sketch, {
  WIDTH as SKETCH_WIDTH,
  HEIGHT as SKETCH_HEIGHT,
  PEN as SKETCH_PEN,
} from '../lib/Sketch';
import AppContext from './AppContext';

const WIDTH = SKETCH_WIDTH;
const HEIGHT = SKETCH_HEIGHT + 4;

import PALETTE from '../palette.json';

interface Props {
  canvasWidth: number;
  canvasHeight: number;
}

type Mode = 'first' | 'idle' | 'drawing' | 'penSelecting';

const Canvas: FC<Props> = ({ canvasWidth, canvasHeight }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const { dispatch } = useContext(AppContext);
  const [sketch, setSketch] = useState(new Sketch());
  const [currentPen, setCurrentPen] = useState(2);
  const [currentColor, setCurrentColor] = useState(2);
  const [mode, setMode] = useState<Mode>('first');

  useEffect(() => {
    const canvas = ref.current;
    if (canvas === null) return;
    const ctx = canvas.getContext('2d');
    if (ctx === null) return;

    ctx.save();
    ctx.scale(canvasWidth / WIDTH, canvasHeight / HEIGHT);
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    // sketch
    ctx.lineWidth = 1;
    sketch.forEachColor((segs, color) => {
      ctx.strokeStyle = PALETTE[color];
      ctx.beginPath();
      segs.forEach(([x0, x1, y]) => {
        ctx.moveTo(x0, y);
        ctx.lineTo(x1, y);
      });
      ctx.stroke();
    });

    // grid
    ctx.beginPath();
    for (let y = 0; y <= SKETCH_HEIGHT; y++) {
      ctx.moveTo(0, y);
      ctx.lineTo(SKETCH_WIDTH, y);
    }
    for (let x = 0; x <= SKETCH_WIDTH; x++) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, SKETCH_HEIGHT);
    }
    ctx.strokeStyle = '#909090';
    ctx.lineWidth = 0.05;
    ctx.stroke();

    // pallette
    ctx.lineWidth = 0.4;
    ctx.strokeStyle = '#cccccc';
    for (let c = 0; c < 8; c++) {
      ctx.beginPath();
      ctx.arc(2 + 4 * c, SKETCH_HEIGHT + 2, 1.5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = PALETTE[c];
      ctx.fill();
    }
    ctx.beginPath();
    ctx.strokeStyle = '#ff99cc';
    ctx.arc(2 + 4 * currentColor, SKETCH_HEIGHT + 2, 1.7, 0, Math.PI * 2);
    ctx.stroke();

    // pen
    ctx.beginPath();
    ctx.fillStyle = PALETTE[currentColor];
    ctx.moveTo(32 + 3.3, SKETCH_HEIGHT + 0.3);
    ctx.lineTo(32 + 3.7, SKETCH_HEIGHT + 0.7);
    ctx.lineTo(32 + 1.4, SKETCH_HEIGHT + 3.0);
    ctx.bezierCurveTo(
      32 + 1.4,
      SKETCH_HEIGHT + 3.0,
      32 + 1.4,
      SKETCH_HEIGHT + 3.8,
      32 + 0.0,
      SKETCH_HEIGHT + 3.8
    );
    ctx.bezierCurveTo(
      32 + 0.0,
      SKETCH_HEIGHT + 2.6,
      32 + 1.0,
      SKETCH_HEIGHT + 2.6,
      32 + 1.0,
      SKETCH_HEIGHT + 2.6
    );
    ctx.closePath();
    ctx.strokeStyle = '#cccccc';
    ctx.stroke();
    ctx.fill();

    // pen selector
    if (mode == 'penSelecting') {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.fillRect(0, 0, SKETCH_WIDTH, SKETCH_HEIGHT);
      for (let i = 0; i < 3; i++) {
        ctx.fillStyle = i == currentPen ? '#ff99cc' : '#999999';
        ctx.fillRect(i * 12 + 1.5, 8.5, 9, 9);
        ctx.lineWidth = 1;
        ctx.strokeStyle = PALETTE[currentColor];
        ctx.beginPath();
        SKETCH_PEN[i].forEach(([x, y, w]) => {
          ctx.moveTo(i * 12 + 5.5 + x, 13 + y);
          ctx.lineTo(i * 12 + 5.5 + x + w, 13 + y);
        });
        ctx.stroke();
      }
    }

    ctx.restore();
  }, [sketch, currentColor, currentPen, mode, canvasWidth, canvasHeight]);

  useEffect(() => {
    dispatch({ type: 'update', feature: sketch.feature });
  }, [sketch, dispatch]);

  useDraw(
    ref,
    useCallback(
      (prevEv, ev) => {
        if (!ev.drawing) {
          if (mode == 'drawing') setMode('idle');
          return false;
        }
        const x = ev.x * WIDTH;
        const y = ev.y * HEIGHT;
        if (mode == 'first' || mode == 'idle') {
          if (y < SKETCH_HEIGHT) {
            setSketch((oldSketch) => {
              const newSketch = oldSketch.copy();
              newSketch.draw(x, y, currentPen, currentColor);
              return newSketch;
            });
            setMode('drawing');
          } else if (!prevEv.drawing && 0 <= x && x < WIDTH) {
            const color = Math.floor(x / 4);
            if (0 <= color && color < 8) {
              setCurrentColor(color);
            } else if (color == 8) {
              setMode('penSelecting');
            }
            return false;
          }
        } else if (mode == 'drawing') {
          setSketch((oldSketch) => {
            const newSketch = oldSketch.copy();
            if (prevEv.drawing) {
              const dx = prevEv.x - ev.x;
              const dy = prevEv.y - ev.y;
              const dist = Math.floor(Math.hypot(dx * WIDTH, dy * HEIGHT));
              for (let i = 0; i < dist; i++) {
                newSketch.draw(
                  x + ((dx * i) / dist) * WIDTH,
                  y + ((dy * i) / dist) * HEIGHT,
                  currentPen,
                  currentColor
                );
              }
            }
            newSketch.draw(x, y, currentPen, currentColor);
            return newSketch;
          });
        } else if (mode == 'penSelecting') {
          if (1.5 <= x % 12 && x % 12 <= 10.5 && 8.5 <= y && y <= 17.5) {
            setCurrentPen(Math.floor(x / 12));
            setMode('idle');
          }
          return false;
        }
        return true;
      },
      [mode, currentPen, currentColor]
    )
  );

  return (
    <div className="canvas">
      <canvas
        className="query"
        width={canvasWidth}
        height={canvasHeight}
        ref={ref}
      />
      {mode == 'first' && <p className="hint">Touch here</p>}
    </div>
  );
};

export default Canvas;
