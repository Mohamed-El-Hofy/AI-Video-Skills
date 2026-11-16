import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { render, inspectVideo } from '../engine/render.mjs';
import { run } from '../engine/core.mjs';
const hasFF=await run('ffmpeg',['-version']).then(()=>true,()=>false);
test('real render: Arabic paths, audio, subtitles, resume, content invalidation and corruption recovery',{skip:!hasFF,timeout:120000},async t=>{
 const dir=fs.mkdtempSync(path.join(process.cwd(),'.test-render-'));t.after(()=>fs.rmSync(dir,{recursive:true,force:true}));
 const root=path.join(dir,"عربي space's");fs.mkdirSync(root);
 const pixels=Buffer.alloc(64*64*3);for(let i=0;i<pixels.length;i++)pixels[i]=i%251;
 fs.writeFileSync(path.join(root,'image.ppm'),Buffer.concat([Buffer.from('P6\n64 64\n255\n'),pixels]));
 await run('ffmpeg',['-v','error','-f','lavfi','-i','sine=frequency=440:duration=1','-y',path.join(root,'voice.wav')]);
 const p={schemaVersion:1,id:'demo',title:'Arabic test',width:320,height:240,fps:24,scenes:[{id:'one',duration:1,image:'image.ppm',camera:'pan-right',audio:'voice.wav',narration:'تجربة'},{id:'two',duration:1,color:'#254760',transition:'fade'}],subtitles:[{start:0,end:1,text:'اختبار عربي'}]};
 const project=path.join(root,'project.json');fs.writeFileSync(project,JSON.stringify(p));
 const out=path.join(dir,'render');await assert.rejects(render(project,{out,onProgress:event=>{if(event.scene==='one'&&event.status==='RENDERED')throw new Error('simulated interruption');}}),/simulated interruption/);
 assert.equal(JSON.parse(fs.readFileSync(path.join(out,'checkpoint.json'))).status,'FAILED');assert.equal(fs.existsSync(path.join(out,'render.lock')),false);
 let report=await render(project,{out});assert.equal(report.rendered,1);assert.equal(report.reused,1);assert.equal(report.status,'COMPLETE');assert.ok(fs.readFileSync(path.join(out,'captions.srt'),'utf8').includes('اختبار عربي'));
 const media=await inspectVideo(path.join(out,'final.mp4'),p);assert.equal(media.ok,true);assert.equal(media.audio,true);assert.equal(media.width,320);assert.ok(Math.abs(media.duration-2)<0.1);
 report=await render(project,{out});assert.equal(report.reused,2);assert.equal(report.rendered,0);
 pixels[0]^=255;fs.writeFileSync(path.join(root,'image.ppm'),Buffer.concat([Buffer.from('P6\n64 64\n255\n'),pixels]));report=await render(project,{out});assert.equal(report.rendered,1);assert.equal(report.reused,1);
 const state=JSON.parse(fs.readFileSync(path.join(out,'checkpoint.json')));fs.writeFileSync(path.join(out,state.scenes.two.file),'corrupt');report=await render(project,{out});assert.equal(report.rendered,1);
 fs.writeFileSync(path.join(out,'render.lock'),'occupied');await assert.rejects(render(project,{out}),/locked/);fs.unlinkSync(path.join(out,'render.lock'));
});
test('rejects overwrite of unowned directories and missing narration before rendering',{skip:!hasFF},async t=>{
 const dir=fs.mkdtempSync(path.join(process.cwd(),'.test-safe-'));t.after(()=>fs.rmSync(dir,{recursive:true,force:true}));
 const p={schemaVersion:1,id:'safe',title:'Safe',width:320,height:240,fps:24,scenes:[{id:'a',duration:1,color:'#123456',narration:'needs audio'}]};const file=path.join(dir,'project.json');fs.writeFileSync(file,JSON.stringify(p));
 await assert.rejects(render(file,{out:path.join(dir,'new')}),/narration audio/);
 p.scenes[0].narration='';fs.writeFileSync(file,JSON.stringify(p));const out=path.join(dir,'occupied');fs.mkdirSync(out);fs.writeFileSync(path.join(out,'keep.txt'),'original');await assert.rejects(render(file,{out}),/not owned/);assert.equal(fs.readFileSync(path.join(out,'keep.txt'),'utf8'),'original');
});
test('narration longer than scene is rejected instead of silently truncated',{skip:!hasFF},async t=>{
 const dir=fs.mkdtempSync(path.join(process.cwd(),'.test-long-audio-'));t.after(()=>fs.rmSync(dir,{recursive:true,force:true}));
 await run('ffmpeg',['-v','error','-f','lavfi','-i','sine=duration=2',path.join(dir,'long.wav')]);
 const p={schemaVersion:1,id:'long',title:'Audio',width:320,height:240,fps:24,scenes:[{id:'a',duration:1,color:'#123456',narration:'long',audio:'long.wav'}]};const file=path.join(dir,'project.json');fs.writeFileSync(file,JSON.stringify(p));await assert.rejects(render(file),/exceeds duration/);
});
