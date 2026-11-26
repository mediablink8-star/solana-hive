import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const apiBase = process.env.VITE_API_BASE_URL || 'http://localhost:4000';
const wsBase = process.env.VITE_WS_BASE_URL || 'ws://localhost:4000';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const inputPath = path.join(__dirname, 'index.html');
const outputPath = path.join(__dirname, 'index.html');

let html = fs.readFileSync(inputPath, 'utf-8');
html = html.replace('__API_BASE_URL__', apiBase);
html = html.replace('__WS_BASE_URL__', wsBase);

fs.writeFileSync(outputPath, html);
console.log('Build complete. API:', apiBase, 'WS:', wsBase);