import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { run } from '../engine/core.mjs';
const installer=path.resolve('scripts/install-skills.mjs');
test('explicit project skill install includes runtime launcher, references and refuses conflicts',async t=>{
 const root=fs.mkdtempSync(path.join(process.cwd(),'.test-install-'));t.after(()=>fs.rmSync(root,{recursive:true,force:true}));
 for(const [agent,folder] of [['codex','.agents'],['claude','.claude'],['antigravity','.agents']]){
  const project=path.join(root,agent);await run(process.execPath,[installer,'--agent',agent,'--project',project]);
  const skill=path.join(project,folder,'skills','environment-doctor');assert.ok(fs.existsSync(path.join(skill,'references','runtime.md')));
  const r=await run(process.execPath,[path.join(skill,'scripts','aiv.mjs'),'help']);assert.match(r.stdout,/AI Video Skills/);
  await assert.rejects(run(process.execPath,[installer,'--agent',agent,'--project',project]),/already exists/);
 }
});
