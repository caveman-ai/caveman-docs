import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import test from 'node:test';

const sync = resolve('scripts/sync-capabilities.mjs');
function fixture(visibility, run) {
  const dir = mkdtempSync(join(tmpdir(), 'docs-capabilities-'));
  try {
    mkdirSync(join(dir, 'content'));
    writeFileSync(join(dir, 'content/external-capabilities.json'), JSON.stringify({ public: [
      { id: 'agent-sdk', path: 'external:caveman-ai/agent-sdk', license: 'Apache-2.0' },
    ] }));
    writeFileSync(join(dir, 'registry.yaml'), `capabilities:\n  - id: agent-sdk\n    visibility: ${visibility}\n`);
    run(dir);
  } finally { rmSync(dir, { recursive: true, force: true }); }
}

test('external source metadata updates an already-public capability', () => {
  fixture('public', dir => {
    execFileSync(process.execPath, [sync, 'registry.yaml'], { cwd: dir });
    const result = JSON.parse(readFileSync(join(dir, 'content/capabilities.public.json')));
    assert.equal(result.public.length, 1);
    assert.equal(result.public[0].license, 'Apache-2.0');
  });
});

test('external source metadata cannot override private registry classification', () => {
  fixture('private', dir => {
    const result = spawnSync(process.execPath, [sync, 'registry.yaml'], { cwd: dir, encoding: 'utf8' });
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /is private in the registry/);
  });
});
