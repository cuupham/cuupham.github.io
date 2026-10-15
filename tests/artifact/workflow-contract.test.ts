import { describe, it, expect } from 'vitest';
import fs from 'node:fs/promises';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';
import { createWorkspace } from '../../scripts/acceptance-fixture.mjs';

const repository = fileURLToPath(new URL('../../', import.meta.url));
const execute = promisify(execFile);
describe('release authorization boundaries', () => {
  it('keeps unaccepted PR jobs read-only and deployment manual with a separate privileged job', async () => {
    const checks = parse(await fs.readFile(path.join(repository, '.github/workflows/check.yml'), 'utf8'));
    const release = parse(await fs.readFile(path.join(repository, '.github/workflows/deploy.yml'), 'utf8'));
    expect(checks.on.pull_request).toBeNull();
    expect(checks.on.pull_request_target).toBeUndefined();
    expect(checks.permissions).toEqual({contents: 'read'});
    expect(Object.keys(release.on)).toEqual(['workflow_dispatch']);
    expect(release.permissions).toEqual({});
    expect(release.concurrency['cancel-in-progress']).toBe(false);
    for (const [name, job] of Object.entries(release.jobs) as [string, {permissions: Record<string, string>; steps: {uses?: string; with?: Record<string, unknown>}[]}][]) {
      if (name !== 'deploy') {
        expect(job.permissions.pages).toBeUndefined();
        expect(job.permissions['id-token']).toBeUndefined();
      }
      for (const step of job.steps) if (step.uses) {
        expect(step.uses).toMatch(/@[a-f0-9]{40}$/);
        if (step.uses.startsWith('actions/checkout@')) expect(step.with?.['persist-credentials']).toBe(false);
      }
    }
    expect(release.jobs.deploy.environment.name).toBe('github-pages');
    expect(release.jobs.deploy.concurrency['cancel-in-progress']).toBe(false);
    expect(release.jobs.deploy.steps.some((step: {uses?: string}) => step.uses?.startsWith('actions/checkout@'))).toBe(false);
  });
  it('stops verify on a real failing unit test before artifact tests and the final clean build', async () => {
    const f = await createWorkspace();
    try {
      await fs.cp(path.join(repository, 'tests'), path.join(f.root, 'tests'), {recursive: true});
      await fs.copyFile(path.join(repository, 'vitest.config.ts'), path.join(f.root, 'vitest.config.ts'));
      await f.write('tests/unit/intentional-failure.test.ts', "import {it,expect} from 'vitest'; it('proves required verification propagates failure',()=>expect(true).toBe(false));");
      await f.write('dist/build-must-not-run.txt', 'retained until unit checks pass');
      const npm = process.env.npm_execpath;
      if (!npm) throw new Error('Run this integration check through npm run test:artifact');
      let failure: {code?: number; stdout?: string; stderr?: string} | undefined;
      try { await execute(process.execPath, [npm, 'run', 'verify'], {cwd: f.root, timeout: 120000, maxBuffer: 8 * 1024 * 1024}); }
      catch (error) { failure = error as typeof failure; }
      expect(failure?.code).toBe(1);
      expect(failure?.stdout).toContain('test:unit');
      expect(failure?.stdout).not.toContain('> vitest run tests/artifact');
      expect(await fs.readFile(path.join(f.root, 'dist/build-must-not-run.txt'), 'utf8')).toBe('retained until unit checks pass');
    } finally { await f.cleanup(); }
  }, 150000);
});
