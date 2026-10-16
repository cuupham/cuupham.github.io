import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { checkArtifact, fixtureMode } from './check-artifact.mjs';
import { inside } from '../src/lib/asset-graph.ts';

const { values } = parseArgs({options: {root: {type: 'string'}}});
if (!values.root) throw new Error('Pass --root with the isolated acceptance workspace');
const root = await fs.realpath(values.root);
if (!await fixtureMode(root)) throw new Error('Acceptance preview requires a valid OS-temp fixture marker');
await checkArtifact(root);
const output = await fs.realpath(path.join(root, 'dist'));
const types = {'.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml', '.wav': 'audio/wav', '.mp4': 'video/mp4', '.mp3': 'audio/mpeg', '.json': 'application/json'};
const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url, 'http://127.0.0.1:4321');
    const pathname = decodeURIComponent(url.pathname);
    const file = path.resolve(output, `.${pathname.endsWith('/') ? `${pathname}index.html` : pathname}`);
    if (!inside(output, file)) { response.writeHead(403); response.end(); return; }
    let data;
    let status = 200;
    let extension = path.extname(file);
    try { data = await fs.readFile(file); }
    catch (error) {
      if (!['ENOENT', 'EISDIR'].includes(error.code)) throw error;
      data = await fs.readFile(path.join(output, '404.html')); extension = '.html'; status = 404;
    }
    response.writeHead(status, {'Content-Type': types[extension] ?? 'application/octet-stream', 'Content-Length': data.length});
    response.end(request.method === 'HEAD' ? undefined : data);
  } catch { response.writeHead(400); response.end('Bad request'); }
});
server.on('error', (error) => { console.error(error); process.exitCode = 1; });
server.listen(4321, '127.0.0.1', () => console.log(JSON.stringify({command: 'preview:acceptance', pid: process.pid, port: 4321, root, output})));
function stop() {
  server.close(() => process.exit(0));
  server.closeAllConnections();
}
process.on('SIGINT', stop); process.on('SIGTERM', stop);
process.stdin.setEncoding('utf8'); process.stdin.on('data', (value) => { if (value.includes('\u0003')) stop(); });
