/**
 * 슬롯 머신: 최초 최고속 회전 후 1→2→3번 릴이 서서히 멈춤, 멈출 때마다 포커스 효과
 */
import { useState, useEffect, useRef } from 'react';
import './SlotMachine.css';

const MENU_POOL = [
  { name: '한식', emoji: '🍚' },
  { name: '중식', emoji: '🥟' },
  { name: '일식', emoji: '🍣' },
  { name: '양식', emoji: '🍝' },
  { name: '분식', emoji: '🍢' },
  { name: '치킨', emoji: '🍗' },
  { name: '면요리', emoji: '🍜' },
  { name: '김치찌개', emoji: '🥘' },
  { name: '제육볶음', emoji: '🥢' },
  { name: '기타', emoji: '🍽️' }
];

function pickRandom() {
  return MENU_POOL[Math.floor(Math.random() * MENU_POOL.length)];
}

// 0.7배속: 0.5배속 대비 5/7 비율로 조금 빠르게
const TICK_FAST = 80;
const TICK_MID = 197;
const TICK_SLOW = 357;
const STOP_REEL_1_AT = 2143;
const STOP_REEL_2_AT = 4643;
const STOP_REEL_3_AT = 7500;

export default function SlotMachine({ oneInFiveMatch = false }) {
  const [reels, setReels] = useState([MENU_POOL[0], MENU_POOL[1], MENU_POOL[2]]);
  const [stopped, setStopped] = useState([false, false, false]);
  const ref = useRef({ stopped: [false, false, false], final: null, intervalId: null });

  useEffect(() => {
    let final;
    if (oneInFiveMatch && Math.random() < 0.2) {
      const one = pickRandom();
      final = [one, one, one];
    } else {
      final = [pickRandom(), pickRandom(), pickRandom()];
    }
    ref.current.final = final;

    const startTime = Date.now();

    const tick = (tickMs) => {
      const elapsed = Date.now() - startTime;
      const s = ref.current.stopped;

      if (elapsed >= STOP_REEL_3_AT) {
        if (ref.current.intervalId) clearInterval(ref.current.intervalId);
        ref.current.intervalId = null;
        setReels([final[0], final[1], final[2]]);
        setStopped([true, true, true]);
        ref.current.stopped = [true, true, true];
        return;
      }

      setReels((prev) =>
        prev.map((r, i) => {
          if (s[i]) return r;
          return MENU_POOL[Math.floor(Math.random() * MENU_POOL.length)];
        })
      );

      if (elapsed >= STOP_REEL_2_AT && !s[1]) {
        if (ref.current.intervalId) clearInterval(ref.current.intervalId);
        setReels((prev) => [prev[0], final[1], prev[2]]);
        setStopped((prev) => {
          const next = [prev[0], true, prev[2]];
          ref.current.stopped = next;
          return next;
        });
        ref.current.intervalId = setInterval(() => tick(TICK_SLOW), TICK_SLOW);
      } else if (elapsed >= STOP_REEL_1_AT && !s[0]) {
        if (ref.current.intervalId) clearInterval(ref.current.intervalId);
        setReels((prev) => [final[0], prev[1], prev[2]]);
        setStopped((prev) => {
          const next = [true, prev[1], prev[2]];
          ref.current.stopped = next;
          return next;
        });
        ref.current.intervalId = setInterval(() => tick(TICK_MID), TICK_MID);
      } else if (elapsed >= STOP_REEL_1_AT && !s[1]) {
        if (ref.current.intervalId) clearInterval(ref.current.intervalId);
        setReels((prev) => [prev[0], final[1], prev[2]]);
        setStopped((prev) => {
          const next = [prev[0], true, prev[2]];
          ref.current.stopped = next;
          return next;
        });
        ref.current.intervalId = setInterval(() => tick(TICK_MID), TICK_MID);
      }
    };

    ref.current.intervalId = setInterval(() => tick(TICK_FAST), TICK_FAST);

    return () => {
      if (ref.current.intervalId) clearInterval(ref.current.intervalId);
    };
  }, [oneInFiveMatch]);

  return (
    <div className="slot-machine">
      <div className="slot-machine__reels">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`slot-machine__reel ${stopped[i] ? 'reel-stopped' : ''}`}
          >
            <span className="slot-machine__emoji">{reels[i].emoji}</span>
            <span className="slot-machine__label">{reels[i].name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
