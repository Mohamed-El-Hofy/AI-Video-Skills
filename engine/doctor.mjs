import os from 'node:os';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { run, digest } from './core.mjs';

export async function probeTool(tool,{ffmpeg='ffmpeg',ffprobe='ffprobe',config={}}={}){
 try{
  if(tool==='ffmpeg'){
   const v=await run(ffmpeg,['-version'],{timeout:10000});
   const [filters,encoders]=await Promise.all([run(ffmpeg,['-filters'],{timeout:10000}),run(ffmpeg,['-encoders'],{timeout:10000})]);
   const capabilities=['zoompan','scale','crop','fade','amix','loudnorm','sidechaincompress'].every(x=>filters.stdout.includes(x))&&encoders.stdout.includes('libx264')&&/\baac\b/.test(encoders.stdout);
   return {ok:capabilities,version:v.stdout.split('\n')[0],capabilities,subtitles:filters.stdout.includes(' subtitles ')};
  }
  if(tool==='ffprobe'){const r=await run(ffprobe,['-version'],{timeout:10000});return {ok:true,version:r.stdout.split('\n')[0]};}
  if(tool==='whisper'){
   const c=config.whisper;if(!c?.python||!c.modelPath||!fs.existsSync(c.modelPath))return {ok:false,reason:'Configure a Python interpreter and existing local faster-whisper model; no automatic model download'};
   await run(c.python,['-c','import faster_whisper'],{timeout:10000});return {ok:true,version:'faster-whisper import verified; local model path exists'};
  }
  const c=config[tool];if(!c)return {ok:false,reason:'Not configured; local assets remain available'};
  if(tool==='remotion'&&c.moduleRoot){
   const resolve=createRequire(path.join(path.resolve(c.moduleRoot),'package.json'));resolve.resolve('@remotion/bundler');resolve.resolve('@remotion/renderer');
   if(!c.browserExecutable||!fs.existsSync(c.browserExecutable))return {ok:false,configured:true,reason:'Remotion modules found; configure an existing browserExecutable; no browser downloads performed'};
   return {ok:true,configured:true,version:'Local Remotion modules and browser exist; render not yet verified'};
  }
  if(c.command){await run(c.command,[...(c.args??[]),'--probe'],{timeout:10000});return {ok:true,version:'Bridge probe succeeded; live generation not verified'};}
  if((tool==='voicetut'||tool==='images')&&c.url)return {ok:false,configured:true,reason:'Endpoint configured; service/model readiness not probed by read-only offline doctor'};
  return {ok:false,reason:'No executable bridge configured'};
 }catch{return {ok:false,reason:'Tool missing, incompatible, or probe failed'};}
}
export async function doctor({probe,platform=process.platform,config={},ffmpeg,ffprobe}={}){
 const inspect=probe??(tool=>probeTool(tool,{ffmpeg,ffprobe,config}));
 const names=['ffmpeg','ffprobe','remotion','whisper','voicetut','concat','images'];
 const tools=Object.fromEntries(await Promise.all(names.map(async n=>[n,await inspect(n)])));
 const blocked=!tools.ffmpeg.ok||!tools.ffprobe.ok||Number(process.versions.node.split('.')[0])<22;
 let freeBytes=null;try{const s=fs.statfsSync(process.cwd());freeBytes=Number(s.bavail)*Number(s.bsize);}catch{}
 return {schemaVersion:1,status:blocked?'BLOCKED':names.some(n=>!tools[n].ok)?'DEGRADED':'READY',platform,arch:os.arch(),node:process.versions.node,hardware:{cpu:os.cpus()[0]?.model,threads:os.availableParallelism(),memoryBytes:os.totalmem(),freeMemoryBytes:os.freemem(),freeBytes},tools,installationPolicy:'ask',notes:['No installations or model downloads performed','DEGRADED permits FFmpeg render with supplied assets','GPU and model performance are not inferred from CPU detection']};
}
export function installationPlan(tool,platform=process.platform){
 if(tool!=='ffmpeg')throw new Error('Automatic setup supports FFmpeg only; use reviewed isolated provider setup instructions for other tools');
 const options={win32:['winget',['install','--id','Gyan.FFmpeg','--exact']],darwin:['brew',['install','ffmpeg']],linux:['sudo',['apt-get','install','ffmpeg']]};
 const chosen=options[platform];if(!chosen)throw new Error('Unsupported OS; install FFmpeg manually');
 const plan={tool,platform,command:[chosen[0],...chosen[1]],scope:'system package manager; may need administrator access',source:'OS package manager',note:platform==='linux'?'Debian/Ubuntu only; other distributions require manual setup':'Review package manager and package license before approval'};
 return {...plan,id:digest(JSON.stringify(plan))};
}
export async function executeInstallation(plan,{approve=async()=>false,run:execute=run}={}){
 const expected=installationPlan(plan.tool,plan.platform);
 if(JSON.stringify(plan)!==JSON.stringify(expected))throw new Error('Installation plan modified');
 if(!await approve(plan))return {status:'DECLINED',executed:false};
 await execute(plan.command[0],plan.command.slice(1),{timeout:600000});return {status:'INSTALLED',executed:true,recheckRequired:true};
}
