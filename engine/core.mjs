import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawn } from 'node:child_process';

export const ENGINE_VERSION='0.1.0';
export const digest=value=>crypto.createHash('sha256').update(value).digest('hex');
export const fileDigest=file=>digest(fs.readFileSync(file));
export function atomicJson(file,data){
 fs.mkdirSync(path.dirname(file),{recursive:true});const temp=`${file}.${crypto.randomUUID()}.tmp`;
 try{fs.writeFileSync(temp,JSON.stringify(data,null,2)+'\n',{flag:'wx'});fs.renameSync(temp,file);}finally{if(fs.existsSync(temp))fs.unlinkSync(temp);}
}
export function readJson(file){return JSON.parse(fs.readFileSync(file,'utf8').replace(/^\uFEFF/,''));}
export function within(root,target){const rel=path.relative(root,target);return rel===''||(!rel.startsWith('..'+path.sep)&&rel!=='..'&&!path.isAbsolute(rel));}
export function assetPath(root,relative){
 if(typeof relative!=='string'||!relative||relative.includes('\0')||relative.includes('\\')||path.posix.isAbsolute(relative)||path.win32.isAbsolute(relative)||/^[a-z]+:/i.test(relative))throw new Error('Asset path must be project-relative using forward slashes');
 const base=fs.realpathSync(root),candidate=path.resolve(base,relative);
 if(!within(base,candidate))throw new Error('Asset escapes project');
 const real=fs.realpathSync(candidate);if(!within(base,real))throw new Error('Asset symlink escapes project');return real;
}
const fail=message=>{throw new Error(message)};
const object=(v,where)=>{if(!v||typeof v!=='object'||Array.isArray(v))fail(`${where}: expected object`)};
const fields=(v,allowed,where)=>{object(v,where);for(const k of Object.keys(v))if(!allowed.includes(k))fail(`${where}: unsupported field ${k}`)};
const text=(v,where,max=10000)=>{if(typeof v!=='string'||!v.trim()||v.length>max)fail(`${where}: invalid text`)};
const number=(v,min,max,where)=>{if(typeof v!=='number'||!Number.isFinite(v)||v<min||v>max)fail(`${where}: invalid number`)};
const id=(v,where)=>{if(typeof v!=='string'||!/^[a-z0-9][a-z0-9-]{0,63}$/.test(v))fail(`${where}: invalid id`)};
const rel=(v,where)=>{text(v,where,1000);if(v.includes('\\')||v.includes('\0')||v.split('/').includes('..')||path.posix.isAbsolute(v)||path.win32.isAbsolute(v)||/^[a-z]+:/i.test(v))fail(`${where}: expected relative path`)};
export function validateProject(p,{root,requireAssets=false}={}){
 fields(p,['schemaVersion','id','title','width','height','fps','language','scenes','subtitles','audio','captionMode','font','fontFamily','provenance'],'project');
 if(p.schemaVersion!==1)fail('Unsupported schemaVersion');id(p.id,'project.id');text(p.title,'title',300);
 for(const k of ['width','height']){number(p[k],64,3840,k);if(!Number.isInteger(p[k])||p[k]%2)fail(`${k}: expected even integer`);}
 number(p.fps,15,60,'fps');if(!Number.isInteger(p.fps))fail('fps must be integer');
 if(p.language!==undefined)text(p.language,'language',30);
 if(!Array.isArray(p.scenes)||!p.scenes.length||p.scenes.length>2000)fail('Expected 1–2000 scenes');
 const ids=new Set();let frames=0;
 for(const s of p.scenes){
  fields(s,['id','duration','image','imagePrompt','color','camera','transition','narration','audio'],'scene');id(s.id,'scene.id');if(ids.has(s.id))fail('Duplicate scene id');ids.add(s.id);
  number(s.duration,1/p.fps,600,'duration');const n=s.duration*p.fps;if(Math.abs(n-Math.round(n))>1e-6)fail('Scene duration must align to a frame');frames+=Math.round(n);
  if((Boolean(s.image)?1:0)+(Boolean(s.color)?1:0)!==1)fail('Scene needs exactly one image or explicit demo color');
  if(s.color&&!/^#[0-9a-f]{6}$/i.test(s.color))fail('Invalid color');
  if(s.camera!==undefined&&!['static','zoom-in','zoom-out','pan-left','pan-right'].includes(s.camera))fail('Unsupported camera');
  if(s.transition!==undefined&&!['cut','fade'].includes(s.transition))fail('Unsupported transition');
  if(s.narration!==undefined&&typeof s.narration!=='string')fail('Narration must be text');
  if(s.imagePrompt!==undefined)text(s.imagePrompt,'imagePrompt');
  for(const k of ['image','audio'])if(s[k]){rel(s[k],k);if(requireAssets)assetPath(root,s[k]);}
  if(s.narration?.trim()&&!s.audio&&requireAssets)fail(`Scene ${s.id} needs recorded/generated narration audio; run prepare or provide audio`);
 }
 if(frames/p.fps>7200)fail('Project exceeds 2-hour bound');
 if(p.captionMode!==undefined&&!['sidecar','burn','none'].includes(p.captionMode))fail('Invalid captionMode');
 if(p.font){rel(p.font,'font');if(requireAssets)assetPath(root,p.font);}
 if(p.fontFamily!==undefined){text(p.fontFamily,'fontFamily',100);if(/[,\\{}\r\n]/.test(p.fontFamily))fail('fontFamily contains unsupported ASS delimiters');}
 const cues=p.subtitles??[];if(!Array.isArray(cues)||cues.length>100000)fail('Invalid subtitles');let previous=0;
 for(const c of cues){fields(c,['start','end','text'],'cue');text(c.text,'cue.text',1000);number(c.start,0,frames/p.fps,'cue.start');number(c.end,0,frames/p.fps,'cue.end');if(c.end<=c.start||c.start<previous)fail('Cues must be ordered and non-overlapping');previous=c.end;}
 if(p.audio){fields(p.audio,['music','musicDb','voiceDb'],'audio');if(p.audio.music){rel(p.audio.music,'music');if(requireAssets)assetPath(root,p.audio.music);}for(const k of ['musicDb','voiceDb'])if(p.audio[k]!==undefined)number(p.audio[k],-60,6,k);}
 if(p.provenance!==undefined){if(!Array.isArray(p.provenance))fail('Invalid provenance');for(const a of p.provenance){fields(a,['path','source','license','prompt'],'provenance');rel(a.path,'provenance.path');text(a.source,'provenance.source');if(a.license!==undefined)text(a.license,'license');if(a.prompt!==undefined)text(a.prompt,'prompt');}}
 return {frames,duration:frames/p.fps,sceneCount:p.scenes.length};
}
export function run(command,args=[],{cwd,timeout=120000,onOutput,env}={}){
 return new Promise((resolve,reject)=>{
  const child=spawn(command,args,{cwd,env:env??process.env,shell:false,windowsHide:true,stdio:['ignore','pipe','pipe']});let stdout='',stderr='',settled=false;
  const timer=setTimeout(()=>{child.kill();reject(new Error(`Tool timed out after ${timeout} ms`));settled=true;},timeout);timer.unref();
  child.stdout.on('data',b=>{stdout=(stdout+b).slice(-2_000_000);onOutput?.(String(b));});child.stderr.on('data',b=>{stderr=(stderr+b).slice(-2_000_000);});
  child.on('error',()=>{clearTimeout(timer);if(!settled)reject(new Error(`Unable to launch ${path.basename(command)}`));settled=true;});
  child.on('close',code=>{clearTimeout(timer);if(settled)return;settled=true;if(code!==0)reject(new Error(`${path.basename(command)} exited ${code}: ${stderr.slice(-6000)}`));else resolve({stdout,stderr});});
 });
}
