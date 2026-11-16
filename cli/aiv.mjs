#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { createInterface } from 'node:readline/promises';
import { readJson, atomicJson, validateProject, assetPath, within, run } from '../engine/core.mjs';
import { doctor, installationPlan, executeInstallation } from '../engine/doctor.mjs';
import { render, inspectVideo } from '../engine/render.mjs';
import { generateImage, synthesizeVoice, transcribe, exportConcat, verifyMedia } from '../engine/adapters/index.mjs';

const help=`AI Video Skills 0.1.0 (Node 22+)\nUsage: node cli/aiv.mjs <command> [file] [options]\n doctor [--config providers.local.json]\n init project.json\n validate project.json [--assets]\n prepare project.json --config providers.local.json\n render|resume project.json [--out directory] [--config file] [--renderer ffmpeg|remotion]\n status project.json [--out directory]\n inspect video.mp4\n image|voice|transcribe request.json --config providers.local.json\n concat project.json --out timeline.json\n setup ffmpeg\nEvery dependency/model installation needs separate approval. No automatic publishing.`;
function parse(argv){
 const result={pos:[],flags:{}};const values=new Set(['out','config','renderer']);
 for(let i=0;i<argv.length;i++){const arg=argv[i];if(arg.startsWith('--')){const key=arg.slice(2);if(!values.has(key)&&key!=='assets')throw new Error(`Unknown option ${arg}`);if(key in result.flags)throw new Error('Duplicate option');if(values.has(key)){if(!argv[i+1]||argv[i+1].startsWith('--'))throw new Error(`${arg} needs a value`);result.flags[key]=argv[++i];}else result.flags[key]=true;}else result.pos.push(arg);}
 return result;
}
const output=v=>console.log(JSON.stringify(v,null,2));
function newOutput(root,relative){
 if(typeof relative!=='string'||relative.includes('\\')||relative.includes('\0')||path.posix.isAbsolute(relative)||path.win32.isAbsolute(relative)||/^[a-z]+:/i.test(relative))throw new Error('Output must be relative to request/project');
 const file=path.resolve(root,relative);if(!within(root,file)||file===root)throw new Error('Output escapes request/project');let ancestor=path.dirname(file);while(!fs.existsSync(ancestor))ancestor=path.dirname(ancestor);if(!within(fs.realpathSync(root),fs.realpathSync(ancestor)))throw new Error('Output symlink escapes project');return file;
}
async function main(){
 if(Number(process.versions.node.split('.')[0])<22)throw new Error('Node 22+ required');
 const {pos,flags}=parse(process.argv.slice(2));const [command,file]=pos;if(pos.length>2)throw new Error('Too many arguments');
 if(!command||['help','-h'].includes(command)){console.log(help);return;}
 const config=flags.config?readJson(path.resolve(flags.config)):{};
 if(command==='doctor'){const r=await doctor({config,ffmpeg:config.ffmpeg,ffprobe:config.ffprobe});output(r);if(r.status==='BLOCKED')process.exitCode=2;return;}
 if(command==='setup'){
  const plan=installationPlan(file);console.error(JSON.stringify({status:'APPROVAL_REQUIRED',plan},null,2));
  const result=await executeInstallation(plan,{approve:async p=>{if(!process.stdin.isTTY)return false;const ui=createInterface({input:process.stdin,output:process.stderr});try{return (await ui.question(`Install ${p.tool} using exactly ${p.command.join(' ')}? Type INSTALL to approve: `))==='INSTALL';}finally{ui.close();}}});
  // Last line is stable machine-readable result. Noninteractive callers get only denial.
  if(!process.stdin.isTTY){output(result);return;}output(result);if(result.executed)output(await doctor({config}));return;
 }
 if(!file)throw new Error('A project/media/request path is required');
 const absolute=path.resolve(file),root=path.dirname(absolute);
 if(command==='init'){
  if(fs.existsSync(absolute))throw new Error('Project already exists');fs.mkdirSync(root,{recursive:true});
  atomicJson(absolute,{schemaVersion:1,id:'my-video',title:'My video',width:1280,height:720,fps:30,language:'ar-EG',scenes:[{id:'intro',duration:3,color:'#174963',camera:'static',narration:''}],captionMode:'sidecar',subtitles:[{start:0,end:3,text:'فيديو تجريبي — استبدل اللون بصورة حقيقية'}]});output({created:absolute,demo:true});return;
 }
 if(command==='inspect'){const result=await inspectVideo(absolute,{},config.ffprobe);output(result);if(!result.ok)process.exitCode=2;return;}
 if(['image','voice','transcribe'].includes(command)){
  const request=readJson(absolute);request.output=newOutput(root,request.output);if(request.audio)request.audio=assetPath(root,request.audio);
  const adapter=command==='image'?generateImage:command==='voice'?synthesizeVoice:transcribe;
  output(await adapter(request,config[command==='image'?'images':command==='voice'?'voicetut':'whisper'],{root,ffmpeg:config.ffmpeg,ffprobe:config.ffprobe}));return;
 }
 const p=readJson(absolute);
 if(command==='validate'){output({valid:true,...validateProject(p,{root,requireAssets:Boolean(flags.assets)})});return;}
 if(command==='status'){const f=path.join(path.resolve(flags.out??path.join(root,'.aiv-output')),'checkpoint.json');output(fs.existsSync(f)?readJson(f):{status:'NOT_STARTED'});return;}
 if(command==='concat'){validateProject(p);const out=flags.out?path.resolve(flags.out):path.join(root,'concat-interchange.json');if(path.dirname(out)!==root)throw new Error('Concat interchange must be exported beside project.json so relative assets remain valid');if(out===absolute)throw new Error('Cannot replace project with interchange');output(exportConcat(p,out));return;}
 if(command==='prepare'){
  validateProject(p);let count=0;const tools={root,ffmpeg:config.ffmpeg,ffprobe:config.ffprobe};
  for(const s of p.scenes){
   if(s.image&&!fs.existsSync(newOutput(root,s.image))){if(!s.imagePrompt)throw new Error(`Scene ${s.id} missing imagePrompt and image`);await generateImage({prompt:s.imagePrompt,output:newOutput(root,s.image),width:p.width,height:p.height},config.images,tools);count++;}
   if(s.narration?.trim()&&!s.audio){const relative=`assets/voice-${s.id}.wav`;const target=newOutput(root,relative);if(fs.existsSync(target))throw new Error('Untracked voice artifact exists; review and set scene.audio explicitly');await synthesizeVoice({text:s.narration,output:target,language:p.language?.startsWith('ar')?'arz':p.language},config.voicetut,tools);s.audio=relative;atomicJson(absolute,p);count++;}
   if(s.image)await verifyMedia(assetPath(root,s.image),'image',tools);if(s.audio)await verifyMedia(assetPath(root,s.audio),'audio',tools);
  }
  validateProject(p,{root,requireAssets:true});output({status:'PREPARED',created:count});return;
 }
 if(['render','resume'].includes(command)){
  const env=await doctor({config,ffmpeg:config.ffmpeg,ffprobe:config.ffprobe});if(env.status==='BLOCKED')throw new Error('Environment BLOCKED; run doctor and approve missing requirements before rendering');
  output(await render(absolute,{out:flags.out,ffmpeg:config.ffmpeg,ffprobe:config.ffprobe,renderer:flags.renderer??'ffmpeg',providerConfig:config.remotion,onProgress:p=>console.error(`${p.scene}: ${p.status}`)}));return;
 }
 throw new Error(`Unknown command ${command}`);
}
main().catch(error=>{console.error(`AI Video Skills: ${error.message}`);process.exitCode=1;});
