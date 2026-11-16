import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {run} from '../engine/core.mjs';
import { bridge, synthesizeVoice, generateImage, exportConcat, transcribe, renderRemotion, providerFingerprint } from '../engine/adapters/index.mjs';
test('unconfigured optional adapters fail explicitly',async()=>{
 await assert.rejects(generateImage({},{}),/configured/);await assert.rejects(transcribe({},{}),/configured/);await assert.rejects(renderRemotion({},{}),/configured/);
});
test('command bridge preserves arguments without shell interpretation and requires artifact',async t=>{
 const root=fs.mkdtempSync(path.join(process.cwd(),'.test-bridge-'));t.after(()=>fs.rmSync(root,{recursive:true,force:true}));
 const script=path.join(root,'bridge.mjs');fs.writeFileSync(script,`import fs from 'node:fs';const request=JSON.parse(fs.readFileSync(process.argv[2]));fs.writeFileSync(request.output,request.prompt);`);
 const output=path.join(root,'result.txt'),prompt='$(echo danger) & spaces عربي';
 await bridge({command:process.execPath,args:[script]},{output,prompt},{root});assert.equal(fs.readFileSync(output,'utf8'),prompt);
 await assert.rejects(bridge({command:process.execPath,args:['-e','']},{output:path.join(root,'absent')},{root}),/artifact/);
});
test('VoiceTuT bounded job polling uses explicit env token and copies returned WAV',async t=>{
 const root=fs.mkdtempSync(path.join(process.cwd(),'.test-voice-'));t.after(()=>fs.rmSync(root,{recursive:true,force:true}));const wav=path.join(root,'voice.wav');await run('ffmpeg',['-v','error','-f','lavfi','-i','sine=duration=0.1',wav]);
 const requests=[];const server=http.createServer((req,res)=>{requests.push({url:req.url,auth:req.headers.authorization});res.setHeader('Content-Type','application/json');res.end(JSON.stringify(req.method==='POST'?{id:'job-1'}:{status:'completed',wavPath:wav}));});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));t.after(()=>server.close());process.env.AIV_TEST_TOKEN='fake-test-token';t.after(()=>delete process.env.AIV_TEST_TOKEN);
 const output=path.join(root,'result.wav');await synthesizeVoice({text:'اختبار',output},{url:`http://127.0.0.1:${server.address().port}`,tokenEnv:'AIV_TEST_TOKEN'},{pollMs:1,timeout:1000});assert.deepEqual(fs.readFileSync(output),fs.readFileSync(wav));assert.equal(requests[0].auth,'Bearer fake-test-token');
 fs.writeFileSync(wav,'RIFFfixture');await assert.rejects(synthesizeVoice({text:'bad',output:path.join(root,'bad.wav')},{url:`http://127.0.0.1:${server.address().port}`},{pollMs:1,timeout:1000}));
});
test('Concat export is labeled interchange and does not claim native import',t=>{
 const dir=fs.mkdtempSync(path.join(process.cwd(),'.test-concat-'));t.after(()=>fs.rmSync(dir,{recursive:true,force:true}));
 const p={id:'x',title:'X',fps:24,width:320,height:240,scenes:[{id:'a',duration:2,color:'#123456'}]};const file=path.join(dir,'timeline.json');const r=exportConcat(p,file);assert.equal(r.status,'EXPORTED_INTERCHANGE');assert.equal(JSON.parse(fs.readFileSync(file)).nativeImportVerified,false);
});
test('A1111 saves real PNG bytes and rejects unexpected image payloads',async t=>{
 const root=fs.mkdtempSync(path.join(process.cwd(),'.test-images-'));t.after(()=>fs.rmSync(root,{recursive:true,force:true}));
 let bad=false;await run('ffmpeg',['-v','error','-f','lavfi','-i','color=blue:s=32x32','-frames:v','1',path.join(root,'source.png')]);const png=fs.readFileSync(path.join(root,'source.png'));
 const server=http.createServer((req,res)=>{res.setHeader('Content-Type','application/json');res.end(JSON.stringify({images:[bad==='truncated'?Buffer.from('89504e470d0a1a0a00000000','hex').toString('base64'):bad?'bm90IGEgcG5n':png.toString('base64')]}));});await new Promise(r=>server.listen(0,'127.0.0.1',r));t.after(()=>server.close());
 const config={kind:'a1111',url:`http://127.0.0.1:${server.address().port}`};const output=path.join(root,'image.png');await generateImage({prompt:'test',output},config);assert.deepEqual(fs.readFileSync(output),png);
 bad=true;await assert.rejects(generateImage({prompt:'test',output:path.join(root,'bad.png')},config),/PNG/);
 bad='truncated';await assert.rejects(generateImage({prompt:'test',output:path.join(root,'truncated.png')},config),/decodable/);assert.equal(fs.existsSync(path.join(root,'truncated.png')),false);
 await assert.rejects(generateImage({prompt:'test',output:path.join(root,'remote.png')},{kind:'a1111',url:'https://example.com'}),/Remote provider/);
});
test('provider fingerprint changes when configured bridge contents change',t=>{
 const root=fs.mkdtempSync(path.join(process.cwd(),'.test-fingerprint-'));t.after(()=>fs.rmSync(root,{recursive:true,force:true}));const script=path.join(root,'bridge.mjs');fs.writeFileSync(script,'first');const config={command:process.execPath,args:[script]};const first=providerFingerprint(config,root);fs.writeFileSync(script,'second');assert.notEqual(providerFingerprint(config,root),first);
});
