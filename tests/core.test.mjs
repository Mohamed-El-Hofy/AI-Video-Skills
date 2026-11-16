import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { validateProject, assetPath, digest, atomicJson } from '../engine/core.mjs';

export const fixture = () => ({schemaVersion:1, id:'demo', title:'Demo', width:320, height:240, fps:24, scenes:[{id:'one',duration:1,color:'#174963',camera:'zoom-in', narration:''}], subtitles:[]});
test('valid project returns precise frame timeline',()=>assert.equal(validateProject(fixture()).frames,24));
test('rejects malformed timeline, identifiers and unsupported settings',()=>{
 for (const change of [p=>p.scenes[0].duration=0,p=>p.width=321,p=>p.fps=0,p=>p.id='../escape',p=>p.scenes.push({...p.scenes[0]}),p=>p.scenes[0].camera='unknown',p=>p.subtitles=[{start:1,end:0,text:'bad'}],p=>p.unknown=true,p=>p.scenes[0].duration=1.01]) {
  const p=fixture();change(p);assert.throws(()=>validateProject(p));
 }
});
test('cue range and subtitle content must fit project',()=>{
 for (const cue of [{start:0,end:2,text:'long'},{start:0,end:1,text:''},{start:NaN,end:1,text:'bad'}]) {const p=fixture();p.subtitles=[cue];assert.throws(()=>validateProject(p));}
});
test('project needs real images unless explicit demo color provided',()=>{const p=fixture();delete p.scenes[0].color;assert.throws(()=>validateProject(p));});
test('asset confinement handles traversal, absolute paths and symlink escapes',t=>{
 const dir=fs.mkdtempSync(path.join(process.cwd(),'.test-core-'));t.after(()=>fs.rmSync(dir,{recursive:true,force:true}));
 fs.writeFileSync(path.join(dir,'صورة test.txt'),'x');assert.equal(assetPath(dir,'صورة test.txt'),path.join(dir,'صورة test.txt'));
 for(const p of ['../other','/etc/passwd','https://example.com/a','C:\\private\\file']) assert.throws(()=>assetPath(dir,p));
 try {fs.symlinkSync(os.tmpdir(),path.join(dir,'link'),'junction');assert.throws(()=>assetPath(dir,'link'));} catch(e){if(!['EPERM','EACCES'].includes(e.code))throw e;}
});
test('digest changes with contents; atomic JSON is readable',t=>{
 const dir=fs.mkdtempSync(path.join(process.cwd(),'.test-json-'));t.after(()=>fs.rmSync(dir,{recursive:true,force:true}));
 atomicJson(path.join(dir,'state.json'),{ok:true});assert.deepEqual(JSON.parse(fs.readFileSync(path.join(dir,'state.json'))),{ok:true});assert.notEqual(digest('a'),digest('b'));
});
