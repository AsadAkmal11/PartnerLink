import fs from 'fs';

const path =
  'C:/Users/HP/.cursor/projects/c-Users-HP-OneDrive-Documents-Desktop-software/agent-transcripts/26ebc1b4-ea13-42b4-8194-db1ee7f2aaef/26ebc1b4-ea13-42b4-8194-db1ee7f2aaef.jsonl';
const lines = fs.readFileSync(path, 'utf8').split(/\n/);
const line = lines.find((l) => l.includes('export interface LanyardLink'));
if (!line) {
  console.error('not found');
  process.exit(1);
}
const obj = JSON.parse(line);
const text = obj.message.content[0].text;
const start = text.indexOf(
  '"use client";\n\nimport * as React from "react";\n\nexport interface LanyardLink',
);
const endMarker = '\n\nexport default TeamLanyardRail;\n. and also';
const end = text.indexOf(endMarker, start);
if (start < 0 || end < 0) {
  console.error('fail', start, end);
  process.exit(1);
}
const src = text.slice(start, end + '\n\nexport default TeamLanyardRail;'.length);
fs.writeFileSync(new URL('./_team-lanyard-raw.tsx', import.meta.url), src);
console.log('extracted', src.split(/\n/).length, 'lines', src.length, 'chars');
