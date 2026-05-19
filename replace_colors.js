const fs = require('fs');
const file = './frontend/src/components/post/PostCard.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replacements
content = content.replace(/text-zinc-100/g, 'text-ig-text');
content = content.replace(/bg-zinc-950/g, 'bg-ig-background');
content = content.replace(/border-zinc-800/g, 'border-ig-border');
content = content.replace(/text-zinc-400/g, 'text-ig-secondary-text');
content = content.replace(/text-zinc-500/g, 'text-ig-secondary-text');
content = content.replace(/bg-zinc-800/g, 'bg-ig-secondary-bg');
content = content.replace(/border-zinc-700/g, 'border-ig-border');
content = content.replace(/border-zinc-900/g, 'border-ig-border');
content = content.replace(/hover:text-zinc-400/g, 'hover:text-ig-secondary-text');
content = content.replace(/hover:text-zinc-300/g, 'hover:text-ig-secondary-text');

fs.writeFileSync(file, content);
console.log("Done replacing colors in PostCard.tsx");
