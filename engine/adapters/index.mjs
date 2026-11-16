import fs from 'node:fs';
import path from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';
import { run, atomicJson, digest, fileDigest } from '../core.mjs';
const packageRoot=fileURLToPath(new URL('../../',import.meta.url));
export function providerFingerprint(config={},root=process.cwd()){
 const files=[path.join(packageRoot,'scripts','remotion-bridge.mjs'),path.join(packageRoot,'templates','remotion','index.tsx')];
 for(const arg of [config.command,...(config.args??[])])if(typeof arg==='string'&&arg&&!arg.startsWith('-')){const file=path.resolve(root,arg);if(fs.existsSync(file)&&fs.statSync(file).isFile())files.push(file);}
 if(config.moduleRoot)for(const name of ['remotion','@remotion/renderer','@remotion/bundler','react']){const file=path.join(config.moduleRoot,'node_modules',name,'package.json');if(fs.existsSync(file))files.push(file);}
 return digest(JSON.stringify({config,contents:files.filter(fs.existsSync).map(file=>[path.basename(file),fileDigest(file)])}));
}
export async function verifyMedia(file,type,{ffmpeg='ffmpeg',ffprobe='ffprobe'}={}){
 try{
  const raw=JSON.parse((await run(ffprobe,['-v','error','-show_streams','-of','json',file],{timeout:30000})).stdout);
  const stream=raw.streams?.find(s=>s.codec_type===(type==='audio'?'audio':'video'));
  if(!stream||type==='image'&&!['png','mjpeg','webp','bmp','ppm','gif','svg','tiff'].includes(stream.codec_name))throw new Error('Wrong media type');
  await run(ffmpeg,['-v','error','-xerror','-err_detect','explode','-i',file,'-map',type==='audio'?'0:a:0':'0:v:0','-f','null','-'],{timeout:120000});
  return {valid:true,type};
 }catch{throw new Error(`Provider artifact is not valid decodable ${type} media`);}
}
async function checked(result,type,tools){try{await verifyMedia(result.output,type,tools);return {...result,status:'CREATED',validated:true};}catch(error){fs.unlinkSync(result.output);throw error;}}

export async function bridge(config,request,{root=process.cwd(),timeout=120000}={}){
 if(typeof config?.command!=='string'||!Array.isArray(config.args??[])||(config.args??[]).some(a=>typeof a!=='string'))throw new Error('Provider bridge is not configured correctly');
 if(!request.output)throw new Error('Provider output required');
 if(fs.existsSync(request.output))throw new Error('Provider output already exists; choose a new artifact path');
 fs.mkdirSync(path.dirname(request.output),{recursive:true});const temp=fs.mkdtempSync(path.join(root,'.aiv-request-'));
 try{
  const file=path.join(temp,'request.json');atomicJson(file,{schemaVersion:1,...request});
  await run(config.command,[...(config.args??[]),file],{cwd:root,timeout});
  if(!fs.existsSync(request.output)||!fs.statSync(request.output).isFile()||!fs.statSync(request.output).size)throw new Error('Provider produced no artifact');
  return {status:'CREATED_UNVERIFIED',output:request.output,provider:'command-bridge'};
 }finally{fs.rmSync(temp,{recursive:true,force:true});}
}
function service(config){
 if(!config?.url)throw new Error('Service is not configured');const url=new URL(config.url);
 if(!['http:','https:'].includes(url.protocol)||url.username||url.password)throw new Error('Invalid service URL');
 if(!['127.0.0.1','localhost','[::1]'].includes(url.hostname)&&!config.allowRemote)throw new Error('Remote provider requires explicit allowRemote configuration');
 return url.origin;
}
async function jsonRequest(url,{config,method='GET',body,timeout=10000}={}){
 const headers={'Content-Type':'application/json'};if(config?.tokenEnv){const token=process.env[config.tokenEnv];if(!token)throw new Error('Provider token environment variable missing');headers.Authorization=`Bearer ${token}`;}
 const res=await fetch(url,{method,headers,body:body===undefined?undefined:JSON.stringify(body),signal:AbortSignal.timeout(timeout),redirect:'error'});
 if(!res.ok)throw new Error(`Provider HTTP ${res.status}`);return res.json();
}
export async function synthesizeVoice(request,config,{pollMs=1000,timeout=900000,root=process.cwd(),ffmpeg,ffprobe}={}){
 const tools={ffmpeg,ffprobe};if(config?.command)return checked(await bridge(config,request,{root,timeout}),'audio',tools);
 const base=service(config);if(!request.text?.trim())throw new Error('Voice text required');if(fs.existsSync(request.output))throw new Error('Voice output already exists');
 const started=Date.now();const job=await jsonRequest(`${base}/api/jobs`,{config,method:'POST',body:{text:request.text,speaker:request.speaker??'Karim',preset:request.quality??'fast',speed:request.speed??1,language:request.language??'arz',autoInsert:false},timeout:Math.min(timeout,10000)});
 if(typeof job.id!=='string'||!job.id)throw new Error('VoiceTuT job id missing');
 while(Date.now()-started<timeout){
  const status=await jsonRequest(`${base}/api/jobs/${encodeURIComponent(job.id)}`,{config,timeout:Math.max(1,Math.min(10000,timeout-(Date.now()-started)))});
  if(status.status==='completed'){
   // VoiceTuT bridge is local; returned wavPath is read only and never logged.
   if(!status.wavPath||!fs.existsSync(status.wavPath))throw new Error('VoiceTuT completed without a local WAV artifact');
   fs.mkdirSync(path.dirname(request.output),{recursive:true});fs.copyFileSync(status.wavPath,request.output,fs.constants.COPYFILE_EXCL);return checked({provider:'voicetut',output:request.output},'audio',tools);
  }
  if(['failed','cancelled'].includes(status.status))throw new Error(`VoiceTuT job ${status.status}`);
  await sleep(Math.min(pollMs,Math.max(0,timeout-(Date.now()-started))));
 }
 throw new Error('VoiceTuT timed out; backend job may still be active; inspect it before retrying');
}
export async function generateImage(request,config,{root=process.cwd(),timeout=120000,ffmpeg,ffprobe}={}){
 const tools={ffmpeg,ffprobe};if(config?.command)return checked(await bridge(config,request,{root,timeout}),'image',tools);
 if(config?.kind!=='a1111')throw new Error('Image provider is not configured; supply local images or configure a bridge/A1111');
 if(fs.existsSync(request.output))throw new Error('Image output already exists');const base=service(config);
 const response=await jsonRequest(`${base}/sdapi/v1/txt2img`,{config,method:'POST',timeout,body:{prompt:request.prompt,negative_prompt:request.negativePrompt??'',width:request.width??512,height:request.height??512,steps:request.steps??20,seed:request.seed??-1}});
 if(!response.images?.[0])throw new Error('Image provider returned no image');const raw=Buffer.from(response.images[0].replace(/^data:[^;]+;base64,/,''),'base64');
 if(raw.length<8||raw.subarray(0,8).toString('hex')!=='89504e470d0a1a0a')throw new Error('Image provider did not return PNG');fs.mkdirSync(path.dirname(request.output),{recursive:true});fs.writeFileSync(request.output,raw,{flag:'wx'});return checked({provider:'a1111',output:request.output},'image',tools);
}
export async function transcribe(request,config,{root=process.cwd(),timeout=900000}={}){
 if(config?.command)return bridge(config,request,{root,timeout});
 if(!config?.python||!config.modelPath||!fs.existsSync(config.modelPath))throw new Error('Whisper is not configured with Python and an existing local model');
 return bridge({command:config.python,args:[path.join(packageRoot,'scripts','whisper-bridge.py')]},{...request,modelPath:path.resolve(config.modelPath),device:config.device??'cpu',computeType:config.computeType??'int8'},{root,timeout});
}
export async function renderRemotion(request,config,{root=process.cwd(),timeout=3600000}={}){
 if(config?.command)return bridge(config,request,{root,timeout});
 if(!config?.moduleRoot)throw new Error('Remotion is not configured; configure local moduleRoot or a render bridge');
 return bridge({command:process.execPath,args:[path.join(packageRoot,'scripts','remotion-bridge.mjs')]},{...request,moduleRoot:path.resolve(config.moduleRoot),browserExecutable:config.browserExecutable,concurrency:config.concurrency??1},{root,timeout});
}
export function exportConcat(project,output){
 let frame=0;const clips=project.scenes.map(s=>{const c={id:s.id,startFrame:frame,durationFrames:Math.round(s.duration*project.fps),image:s.image??null,audio:s.audio??null,camera:s.camera??'static'};frame+=c.durationFrames;return c;});
 if(fs.existsSync(output))throw new Error('Concat interchange already exists');atomicJson(output,{schemaVersion:1,kind:'ai-video-skills-timeline',assetBase:'.',nativeImportVerified:false,projectId:project.id,title:project.title,width:project.width,height:project.height,fps:project.fps,clips,subtitles:project.subtitles??[],note:'Place beside project.json. Provider-neutral interchange. Ask the host agent to map to the installed Concat MCP schema; this is not a claimed native Concat format.'});
 return {status:'EXPORTED_INTERCHANGE',output,nativeImportVerified:false};
}
