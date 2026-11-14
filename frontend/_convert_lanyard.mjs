import fs from 'fs';

let src = fs.readFileSync(new URL('./_team-lanyard-raw.tsx', import.meta.url), 'utf8');

src = src.replace(/^"use client";\r?\n\r?\n/, '');

// dark: → dark-theme values
src = src.replace(/\bopacity-70 dark:opacity-35\b/g, 'opacity-35');
src = src.replace(/\bbg-black\/15 dark:bg-black\/45\b/g, 'bg-black/45');
src = src.replace(/\bbg-black\/25 dark:bg-black\/70\b/g, 'bg-black/70');
src = src.replace(/\s*dark:[a-zA-Z0-9_./\[\]%-]+/g, '');

src = src.replace(/focus-visible:outline-ring/g, 'focus-visible:outline-primary');
src = src.replace(/focus-visible:ring-ring/g, 'focus-visible:ring-primary');

const jsdocHeader = `import * as React from "react";

/**
 * @typedef {{ label: string, href: string }} LanyardLink
 */

/**
 * @typedef {Object} LanyardMember
 * @property {string} id
 * @property {string} name Accessible name, printed on both faces of the badge.
 * @property {string} role
 * @property {string} [team] Company or team line under the role.
 * @property {string} image Portrait URL (square works best).
 * @property {string} [bio] One or two sentences on the back.
 * @property {string[]} [tags] Short chips on the back.
 * @property {LanyardLink[]} [links] Contact links on the back.
 * @property {1|2|3|4|5} [tone] Chart colour token for ribbon/band.
 * @property {number} [drop] Extra lanyard length in px at a 124px badge.
 */

/**
 * @typedef {Object} TeamLanyardRailLabels
 * @property {string} flip Hint while badge faces front.
 * @property {string} back Hint while badge shows back.
 * @property {string} show Prefix for carousel dots.
 */

/**
 * @typedef {Object} TeamLanyardRailProps
 * @property {LanyardMember[]} items
 * @property {string} [eyebrow]
 * @property {string} [heading]
 * @property {string} [caption]
 * @property {React.ReactNode} [action]
 * @property {boolean} [autoplay]
 * @property {number} [interval]
 * @property {number|null} [active]
 * @property {(index: number|null) => void} [onActiveChange]
 * @property {number|null} [flipped]
 * @property {(index: number|null) => void} [onFlippedChange]
 * @property {TeamLanyardRailLabels} [labels]
 * @property {string} [className]
 */

`;

// Drop import + all interfaces through TeamLanyardRailProps
const ifaceEnd = src.indexOf('const RATIO = 96 / 62;');
if (ifaceEnd < 0) throw new Error('RATIO not found');
src = jsdocHeader + src.slice(ifaceEnd);

// Remove type Sim / EdgeGeometry blocks
src = src.replace(/\ntype Sim = \{[\s\S]*?\};\n\n/, '\n');
src = src.replace(/\ntype EdgeGeometry = \{[\s\S]*?\};\n\n/, '\n');

src = src.replace(/ as const/g, '');
src = src.replace(/ as string/g, '');
src = src.replace(/ as number/g, '');
src = src.replace(/ as boolean/g, '');
src = src.replace(/ as Sim/g, '');
src = src.replace(/ as EdgeGeometry/g, '');

// null as Foo | null → null
src = src.replace(/null as [A-Za-z0-9_<>|"\s]+/g, 'null');
src = src.replace(/\[\] as \([^)]+\)\[\]/g, '[]');

// Strip `: Type` from function/params — iterative safe patterns
const typeAnn =
  /:\s*(?:ReadonlyArray<[^>]+>|Array<[^>]+>|[A-Za-z_][\w.]*(?:\s*\|\s*[A-Za-z_][\w.]*)*(?:\s*\|\s*null)*(?:\s*\|\s*undefined)*|\{\s*[^}]*\}|\([^)]*\)\s*=>\s*[^,)=]+)(\[\])?/g;

function stripParams(sig) {
  // Remove TypeScript parameter / return type annotations inside (...): Ret
  let out = '';
  let i = 0;
  while (i < sig.length) {
    out += sig[i];
    if (sig[i] === '(') {
      // find matching )
      let depth = 1;
      let j = i + 1;
      let param = '';
      while (j < sig.length && depth > 0) {
        const ch = sig[j];
        if (ch === '(') depth++;
        else if (ch === ')') depth--;
        if (depth > 0) param += ch;
        j++;
      }
      // strip types from param list
      const cleaned = param
        .split(',')
        .map((p) => {
          let s = p;
          // destructuring with type: ({ a }: { a: string }) → ({ a })
          s = s.replace(/^(\s*\{[^}]*\})\s*:\s*\{[^}]*\}/, '$1');
          // name?: type or name: type
          s = s.replace(/^(\s*[.…]?\s*[A-Za-z_$][\w$]*)\??\s*:[^=]+(=.*)?$/, (_, name, def) => name + (def || ''));
          return s;
        })
        .join(',');
      out += cleaned + ')';
      i = j;
      // optional return type
      const rest = sig.slice(i).match(/^\s*:\s*[^{={]+(?=\s*\{)/);
      if (rest) {
        i += rest[0].length;
      }
      continue;
    }
    i++;
  }
  return out;
}

// Apply stripParams to function/const arrow declarations lines spanning signatures
src = src.replace(
  /((?:export\s+)?(?:function|const)\s+[A-Za-z0-9_]+\s*=?\s*(?:React\.memo\()?function\s*[A-Za-z0-9_]*\s*\([^;{]*)\{/g,
  (m) => {
    const bodyStart = m.lastIndexOf('{');
    return stripParams(m.slice(0, bodyStart)) + '{';
  },
);

src = src.replace(
  /((?:export\s+)?function\s+[A-Za-z0-9_]+\s*\([^;{]*)\{/g,
  (m) => {
    const bodyStart = m.lastIndexOf('{');
    return stripParams(m.slice(0, bodyStart)) + '{';
  },
);

// Arrow / callback common forms: (x: number) =>  and (x: number, y: boolean) =>
src = src.replace(/\(([A-Za-z_$][\w$]*)\??:\s*[^)=]+\)\s*=>/g, '($1) =>');
src = src.replace(
  /\(([A-Za-z_$][\w$]*)\??:\s*[^,)]+,\s*([A-Za-z_$][\w$]*)\??:\s*[^)=]+\)\s*=>/g,
  '($1, $2) =>',
);
src = src.replace(
  /\(([A-Za-z_$][\w$]*)\??:\s*[^,)]+,\s*([A-Za-z_$][\w$]*)\??:\s*[^,)]+,\s*([A-Za-z_$][\w$]*)\??:\s*[^)=]+\)\s*=>/g,
  '($1, $2, $3) =>',
);

// useCallback((i: number) =>
src = src.replace(/React\.useCallback\(\(([A-Za-z_$][\w$]*)\):\s*[^)]+\)\s*=>/g, 'React.useCallback(($1) =>');
src = src.replace(
  /React\.useCallback\(\(([A-Za-z_$][\w$]*):\s*[^,)]+,\s*([A-Za-z_$][\w$]*):\s*[^)]+\)\s*=>/g,
  'React.useCallback(($1, $2) =>',
);

// Inner function declarations: function front(index: number)
src = src.replace(/function\s+([A-Za-z_$][\w$]*)\(([^)]*)\)/g, (_, name, params) => {
  const cleaned = params
    .split(',')
    .map((p) => {
      const s = p.trim();
      if (!s) return '';
      if (s.startsWith('{')) {
        return s.replace(/^(\{[^}]*\})\s*:\s*\{[^}]*\}/, '$1');
      }
      return s.replace(/^([A-Za-z_$][\w$]*)\??\s*:[^=]+(=.*)?$/, (_, n, d) => n + (d || ''));
    })
    .filter(Boolean)
    .join(', ');
  return `function ${name}(${cleaned})`;
});

// const foo = (width: number) =>
src = src.replace(
  /const\s+([A-Za-z_$][\w$]*)\s*=\s*\(([A-Za-z_$][\w$]*)\):\s*[^=]+=>/g,
  'const $1 = ($2) =>',
);
src = src.replace(
  /const\s+([A-Za-z_$][\w$]*)\s*=\s*\(([A-Za-z_$][\w$]*):\s*[^,)]+,\s*([A-Za-z_$][\w$]*):\s*[^=]+\)\s*=>/g,
  'const $1 = ($2, $3) =>',
);

// TeamLanyardRail props type ending
src = src.replace(/\n\}: TeamLanyardRailProps\) \{/g, '\n}) {');

// let on: boolean;
src = src.replace(/let on: boolean;/g, 'let on;');

// BadgeFaces memo typed props leftover
src = src.replace(
  /React\.memo\(function BadgeFaces\(\{ item, tone \}: \{ item; tone: string \}\)/,
  'React.memo(function BadgeFaces({ item, tone })',
);
src = src.replace(
  /React\.memo\(function BadgeFaces\(\{ item, tone \}: \{ item: LanyardMember; tone: string \}\)/,
  'React.memo(function BadgeFaces({ item, tone })',
);

// LinkIcon / Band typed props
src = src.replace(/function LinkIcon\(\{ label \}: \{ label: string \}\)/, 'function LinkIcon({ label })');
src = src.replace(
  /function Band\(\{ tone, tall \}: \{ tone: string; tall\?: boolean \}\)/,
  'function Band({ tone, tall })',
);

// emptySim(): Sim
src = src.replace(/function emptySim\(\): Sim/, 'function emptySim()');

// Add JSDoc above export function
if (!src.includes('Interactive team section')) {
  src = src.replace(
    /export function TeamLanyardRail\(/,
    `/**
 * Interactive team section: lanyard ID badges hang from a brushed rail with spring physics.
 * @param {TeamLanyardRailProps & React.ComponentProps<"section">} props
 */
export function TeamLanyardRail(`,
  );
}

// Collapse className whitespace
src = src.replace(/className="([^"]*)"/g, (_, c) => `className="${c.replace(/\s{2,}/g, ' ').trim()}"`);

const outPath = new URL('./src/components/viz/TeamLanyardRail.jsx', import.meta.url);
fs.writeFileSync(outPath, src);

const lines = src.split(/\n/);
console.log('wrote', lines.length, 'lines');

const bad = [];
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (/^\s*export interface\b/.test(line) || /^\s*type [A-Z]/.test(line)) bad.push(`${i + 1}: ${line.trim()}`);
  if (/:\s*(number|string|boolean|Sim)\b/.test(line) && !line.trim().startsWith('*') && !line.includes('@')) {
    bad.push(`${i + 1}: ${line.trim().slice(0, 140)}`);
  }
  if (/\bdark:/.test(line)) bad.push(`${i + 1}: dark ${line.trim().slice(0, 100)}`);
  if (/use client/.test(line)) bad.push(`${i + 1}: use client`);
  if (/ring-ring|outline-ring/.test(line)) bad.push(`${i + 1}: ring ${line.trim().slice(0, 100)}`);
}
console.log('issues', bad.length);
bad.slice(0, 50).forEach((b) => console.log(b));
