import * as React from 'react';

const BAR = {
  1: 'bg-chart-1',
  2: 'bg-chart-2',
  3: 'bg-chart-3',
  4: 'bg-chart-4',
  5: 'bg-chart-5',
};
const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';
const defaultFormat = (value) =>
  new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value);

function useReducedMotion() {
  const [reduced, setReduced] = React.useState(true);
  React.useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  return reduced;
}

function useRollingNumber(target, duration, reduced) {
  const [shown, setShown] = React.useState(target);
  const current = React.useRef(target);
  React.useEffect(() => {
    if (reduced || duration <= 0) {
      current.current = target;
      setShown(target);
      return undefined;
    }
    const start = performance.now();
    const begin = current.current;
    let frame = requestAnimationFrame(function tick(now) {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - t) ** 3;
      current.current = begin + (target - begin) * eased;
      setShown(current.current);
      if (t < 1) frame = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(frame);
  }, [target, duration, reduced]);
  return shown;
}

function Row({
  datum,
  rank,
  previousRank,
  width,
  previousWidth,
  topN,
  rowHeight,
  duration,
  reduced,
  tone,
  format,
  showRankChange,
}) {
  const rowRef = React.useRef(null);
  const barRef = React.useRef(null);
  const visible = rank < topN;
  const wasVisible = previousRank !== null && previousRank < topN;
  const shown = useRollingNumber(datum.value, visible ? duration : 0, reduced);
  const [chip, setChip] = React.useState(null);
  const y = (visible ? rank : topN) * rowHeight;

  React.useLayoutEffect(() => {
    const row = rowRef.current;
    const bar = barRef.current;
    if (!row || !bar || reduced || typeof row.animate !== 'function') return;
    const fromY =
      previousRank === null ? topN * rowHeight : (previousRank < topN ? previousRank : topN) * rowHeight;
    const entering = visible && !wasVisible;
    const leaving = !visible && wasVisible;
    if (fromY !== y || entering || leaving) {
      row.animate(
        [
          { transform: `translateY(${fromY}px)`, opacity: entering ? 0 : 1 },
          { transform: `translateY(${y}px)`, opacity: visible ? 1 : 0 },
        ],
        { duration, easing: EASE },
      );
    }
    if (previousWidth !== null && previousWidth !== width && (visible || leaving)) {
      bar.animate([{ width: `${previousWidth}%` }, { width: `${width}%` }], {
        duration,
        easing: EASE,
      });
    }
  }, [rank, width, visible, previousRank, previousWidth, topN, rowHeight, duration, reduced, wasVisible, y]);

  React.useEffect(() => {
    if (!showRankChange || previousRank === null || !visible) return undefined;
    const kind = !wasVisible ? 'new' : previousRank > rank ? 'up' : previousRank < rank ? 'down' : null;
    if (!kind) return undefined;
    setChip({ kind, places: Math.abs(previousRank - rank) });
    const timer = window.setTimeout(() => setChip(null), Math.max(900, duration * 2));
    return () => window.clearTimeout(timer);
  }, [rank, visible, previousRank, wasVisible, showRankChange, duration]);

  return (
    <div
      ref={rowRef}
      data-row={datum.id}
      data-rank={rank}
      data-visible={visible ? 'true' : 'false'}
      aria-hidden="true"
      style={{ height: rowHeight, transform: `translateY(${y}px)`, opacity: visible ? 1 : 0 }}
      className="absolute inset-x-0 top-0 flex items-center gap-3 will-change-transform"
    >
      <span className="w-5 shrink-0 text-right font-mono text-xs tabular-nums text-muted-foreground">
        {rank + 1}
      </span>
      <span className="flex w-32 shrink-0 items-center gap-2 text-sm">
        {datum.icon}
        <span className="truncate font-medium">{datum.label}</span>
      </span>
      <div className="relative mr-16 h-7 min-w-0 flex-1">
        <div ref={barRef} data-bar style={{ width: `${width}%` }} className="relative h-full">
          <div className={`h-full rounded-md ${BAR[tone]} opacity-90`} />
          <span className="absolute top-1/2 left-full ml-2 -translate-y-1/2 whitespace-nowrap font-mono text-xs tabular-nums">
            {format(shown)}
          </span>
        </div>
        {chip && (
          <span
            data-rank-chip={chip.kind}
            className={`absolute top-1/2 right-0 -translate-y-1/2 translate-x-14 rounded-full px-1.5 py-0.5 font-mono text-[10px] font-medium leading-none ${
              chip.kind === 'down' ? 'bg-chart-5/15 text-foreground' : 'bg-chart-2/15 text-foreground'
            }`}
          >
            {chip.kind === 'new' ? 'new' : `${chip.kind === 'up' ? '▲' : '▼'}${chip.places}`}
          </span>
        )}
      </div>
    </div>
  );
}

function PeriodLabel({ period, reduced }) {
  const ref = React.useRef(null);
  const text = typeof period === 'string' || typeof period === 'number' ? String(period) : null;
  React.useLayoutEffect(() => {
    const node = ref.current;
    if (!node || reduced || typeof node.animate !== 'function') return;
    node.animate(
      [
        { opacity: 0, transform: 'translateY(3px)' },
        { opacity: 1, transform: 'translateY(0)' },
      ],
      { duration: 300, easing: 'ease-out' },
    );
  }, [text, reduced]);
  return (
    <span ref={ref} data-period className="font-mono text-xs tabular-nums text-muted-foreground">
      {period}
    </span>
  );
}

export function BarRaceChart({
  data,
  topN = 6,
  duration = 600,
  rowHeight = 44,
  sort = 'desc',
  max,
  formatValue = defaultFormat,
  caption,
  period,
  showRankChange = true,
  className = '',
  ref,
}) {
  const reduced = useReducedMotion();
  const previous = React.useRef({});
  const tones = React.useRef({});
  const sorted = [...data].sort(
    (a, b) => (sort === 'desc' ? b.value - a.value : a.value - b.value) || a.id.localeCompare(b.id),
  );
  const visible = sorted.slice(0, topN);
  const scale = max ?? Math.max(1, ...visible.map((d) => d.value));
  const rows = sorted.map((datum, rank) => {
    if (!tones.current[datum.id]) {
      tones.current[datum.id] = datum.color ?? (((Object.keys(tones.current).length % 5) + 1));
    }
    return {
      datum,
      rank,
      width: Math.max(0, Math.min(100, (datum.value / scale) * 100)),
      tone: datum.color ?? tones.current[datum.id],
    };
  });
  const snapshot = previous.current;

  React.useLayoutEffect(() => {
    const next = {};
    for (const row of rows) next[row.datum.id] = { rank: row.rank, width: row.width };
    previous.current = next;
  });

  return (
    <figure
      ref={ref}
      data-slot="bar-race-chart"
      data-rows={visible.length}
      className={`relative w-full ${className}`}
    >
      {(caption || period) && (
        <figcaption className="mb-3 flex items-baseline justify-between gap-3">
          <span className="text-sm font-medium">{caption}</span>
          {period !== undefined && <PeriodLabel period={period} reduced={reduced} />}
        </figcaption>
      )}
      <div className="relative" style={{ height: topN * rowHeight }}>
        {rows.map((row) => (
          <Row
            key={row.datum.id}
            datum={row.datum}
            rank={row.rank}
            previousRank={snapshot[row.datum.id]?.rank ?? null}
            width={row.width}
            previousWidth={snapshot[row.datum.id]?.width ?? null}
            topN={topN}
            rowHeight={rowHeight}
            duration={duration}
            reduced={reduced}
            tone={row.tone}
            format={formatValue}
            showRankChange={showRankChange}
          />
        ))}
      </div>
      <div className="sr-only">
        <table>
          <caption>
            {typeof caption === 'string' ? caption : 'Ranked values'}
            {typeof period === 'string' ? ` · ${period}` : ''}
          </caption>
          <thead>
            <tr>
              <th scope="col">Rank</th>
              <th scope="col">Name</th>
              <th scope="col">Value</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((datum, index) => (
              <tr key={datum.id}>
                <td>{index + 1}</td>
                <td>{datum.label}</td>
                <td>{formatValue(datum.value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </figure>
  );
}

export default BarRaceChart;
