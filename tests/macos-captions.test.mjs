import test from 'node:test';
import assert from 'node:assert/strict';
import * as doctor from '../engine/doctor.mjs';
const {installationPlan}=doctor;
test('macOS installation selects the full formula and explains keg-only PATH',()=>{
 const plan=installationPlan('ffmpeg','darwin');assert.deepEqual(plan.command,['brew','install','ffmpeg-full']);assert.match(plan.note,/keg-only/);assert.match(plan.note,/PATH/);
});
test('burn captions fail early without libass; sidecars remain usable',()=>{
 const cues=[{start:0,end:1,text:'عربي'}];assert.equal(typeof doctor.assertCaptionSupport,'function');const {assertCaptionSupport}=doctor;assert.throws(()=>assertCaptionSupport({captionMode:'burn',subtitles:cues},{subtitles:false}),/subtitles.*libass/);
 assert.doesNotThrow(()=>assertCaptionSupport({captionMode:'sidecar',subtitles:cues},{subtitles:false}));assert.doesNotThrow(()=>assertCaptionSupport({captionMode:'burn',subtitles:[]},{subtitles:false}));assert.doesNotThrow(()=>assertCaptionSupport({captionMode:'burn',subtitles:cues},{subtitles:true}));
});
