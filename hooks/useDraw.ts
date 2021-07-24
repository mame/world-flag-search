import { RefObject, useCallback, useEffect, useState } from 'react';

interface DrawEvent {
  drawing: boolean;
  x: number;
  y: number;
}

export function useDraw(
  ref: RefObject<HTMLElement>,
  handler: (prev_ev: DrawEvent, ev: DrawEvent) => boolean
): void {
  const [, setPrevEvent] = useState({ drawing: false, x: 0, y: 0 });

  const eventHandler = useCallback(
    (
      prevEv: DrawEvent,
      drawing: boolean,
      ev: MouseEvent | TouchEvent
    ): DrawEvent => {
      if (!ref.current) return prevEv;
      if (ev.cancelable) ev.preventDefault();
      let x = 0;
      let y = 0;
      if (ev instanceof MouseEvent) {
        x = ev.clientX;
        y = ev.clientY;
      } else {
        if (ev.touches.length == 0) {
          const newState = { ...prevEv, drawing: false };
          newState.drawing = handler(prevEv, newState);
          return newState;
        }
        x = ev.touches[0].clientX;
        y = ev.touches[0].clientY;
        for (let i = 1; i < ev.touches.length; i++) {
          x += ev.touches[i].clientX;
          y += ev.touches[i].clientY;
        }
        x /= ev.touches.length;
        y /= ev.touches.length;
      }
      const rect = ref.current.getBoundingClientRect();
      x = (x - rect.left) / rect.width;
      y = (y - rect.top) / rect.height;
      const newState = { drawing, x, y };
      newState.drawing = handler(prevEv, newState);
      return newState;
    },
    [ref, handler]
  );

  useEffect(() => {
    const start = (ev: MouseEvent | TouchEvent) => {
      setPrevEvent((prevEv) => eventHandler(prevEv, true, ev));
    };
    const move = (ev: MouseEvent | TouchEvent) => {
      setPrevEvent((prevEv) => eventHandler(prevEv, prevEv.drawing, ev));
    };
    const end = (ev: MouseEvent | TouchEvent) => {
      setPrevEvent((prevEv) => eventHandler(prevEv, false, ev));
    };

    const target = ref.current;

    if (target) {
      target.addEventListener('mousedown', start);
      target.addEventListener('mousemove', move);
      window.addEventListener('mouseup', end);
      target.addEventListener('touchstart', start);
      target.addEventListener('touchmove', move);
      target.addEventListener('touchend', end);

      return () => {
        target.removeEventListener('mousedown', start);
        target.removeEventListener('mousemove', move);
        window.removeEventListener('mouseup', end);
        target.removeEventListener('touchstart', start);
        target.removeEventListener('touchmove', move);
        target.removeEventListener('touchend', end);
      };
    }
  }, [ref, eventHandler]);
}
