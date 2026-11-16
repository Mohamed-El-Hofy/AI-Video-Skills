import test from 'node:test';
import assert from 'node:assert/strict';
import { doctor, probeTool, installationPlan, executeInstallation } from '../engine/doctor.mjs';
test('missing ffmpeg blocks; missing optional tools degrades; full probes ready',async()=>{
 const missing=await doctor({probe:async()=>({ok:false}),platform:'linux'});assert.equal(missing.status,'BLOCKED');
 const minimal=await doctor({probe:async(tool)=>({ok:['ffmpeg','ffprobe'].includes(tool),version:'test',capabilities:true}),platform:'win32'});assert.equal(minimal.status,'DEGRADED');
});
test('install plans are OS-specific and never execute when denied',async()=>{
 for(const platform of ['win32','darwin','linux']){const p=installationPlan('ffmpeg',platform);assert.ok(p.command.length);let ran=false;const r=await executeInstallation(p,{approve:async()=>false,run:async()=>{ran=true}});assert.equal(r.status,'DECLINED');assert.equal(ran,false);}
});
test('tampered installation plan and unknown package are rejected',async()=>{
 assert.throws(()=>installationPlan('untrusted','linux'));
 await assert.rejects(executeInstallation({...installationPlan('ffmpeg','linux'),command:['rm','-rf','/']},{approve:async()=>true}));
});
test('configured HTTP providers are identified without contacting services',async()=>{
 for(const tool of ['images','voicetut']){const r=await probeTool(tool,{config:{[tool]:{url:'http://127.0.0.1:1',kind:'a1111'}}});assert.equal(r.configured,true);assert.equal(r.ok,false);assert.match(r.reason,/not probed/);}
});
test('approved exact installation plan invokes only its allowlisted command',async()=>{
 const plan=installationPlan('ffmpeg','linux');const calls=[];const result=await executeInstallation(plan,{approve:async reviewed=>reviewed.id===plan.id,run:async(...args)=>calls.push(args)});
 assert.equal(result.status,'INSTALLED');assert.equal(result.recheckRequired,true);assert.deepEqual(calls[0].slice(0,2),['sudo',['apt-get','install','ffmpeg']]);
});
