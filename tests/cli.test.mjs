import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { run } from '../engine/core.mjs';
const cli=path.resolve('cli/aiv.mjs');
test('CLI creates project, validates JSON and refuses overwrite or unknown options',async t=>{
 const dir=fs.mkdtempSync(path.join(process.cwd(),'.test-cli-'));t.after(()=>fs.rmSync(dir,{recursive:true,force:true}));const file=path.join(dir,'project.json');
 await run(process.execPath,[cli,'init',file]);assert.equal(JSON.parse((await run(process.execPath,[cli,'validate',file])).stdout).valid,true);
 await assert.rejects(run(process.execPath,[cli,'init',file]));await assert.rejects(run(process.execPath,[cli,'validate',file,'--unknown']));
});
test('CLI setup refuses noninteractive installation and returns explicit denial',async()=>{
 const r=await run(process.execPath,[cli,'setup','ffmpeg']);assert.equal(JSON.parse(r.stdout).status,'DECLINED');
});
test('inspect returns failure status for a valid non-delivery audio-only file',async t=>{
 const dir=fs.mkdtempSync(path.join(process.cwd(),'.test-inspect-'));t.after(()=>fs.rmSync(dir,{recursive:true,force:true}));const file=path.join(dir,'only.wav');
 await run('ffmpeg',['-v','error','-f','lavfi','-i','sine=duration=0.1',file]);await assert.rejects(run(process.execPath,[cli,'inspect',file]));
});
