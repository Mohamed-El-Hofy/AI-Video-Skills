import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ENGINE_VERSION, validateProject, readJson, atomicJson, assetPath, within, digest, fileDigest, run } from './core.mjs';
import { srt, ass } from './captions.mjs';
import { renderRemotion, providerFingerprint } from './adapters/index.mjs';

export async function inspectVideo(file,expected={},ffprobe='ffprobe'){
 const {stdout}=await run(ffprobe,['-v','error','-show_streams','-show_format','-of','json',file],{timeout:30000});
 const raw=JSON.parse(stdout),v=raw.streams.find(s=>s.codec_type==='video'),a=raw.streams.find(s=>s.codec_type==='audio');
 const [n,d]=(v?.r_frame_rate??'0/1').split('/').map(Number),fps=n/d,duration=Number(raw.format.duration);
 const issues=[];if(!v)issues.push('Missing video');if(!a)issues.push('Missing audio');if(v?.codec_name!=='h264')issues.push('Expected H.264');if(a?.codec_name!=='aac')issues.push('Expected AAC');
 for(const k of ['width','height'])if(expected[k]&&v?.[k]!==expected[k])issues.push(`Wrong ${k}`);
 if(expected.fps&&Math.abs(fps-expected.fps)>.01)issues.push('Wrong fps');
 const target=expected.scenes?validateProject(expected).duration:expected.duration;if(target&&Math.abs(duration-target)>Math.max(.1,2/(expected.fps??24)))issues.push('Wrong duration');
 return {ok:issues.length===0,issues,width:v?.width,height:v?.height,fps,duration,audio:Boolean(a),videoCodec:v?.codec_name,audioCodec:a?.codec_name,bytes:Number(raw.format.size)};
}
function outputDirectory(out,projectFile){
 const resolved=path.resolve(out);let ancestor=resolved;while(!fs.existsSync(ancestor))ancestor=path.dirname(ancestor);
 if(fs.realpathSync(ancestor).toLowerCase()!==path.resolve(ancestor).toLowerCase())throw new Error('Output symlink paths are not supported');
 const source=path.dirname(projectFile);if(resolved===source||within(resolved,source))throw new Error('Output must be a dedicated directory, not a project ancestor');
 if(fs.existsSync(resolved)&&fs.readdirSync(resolved).length&&!fs.existsSync(path.join(resolved,'.aiv-owned.json')))throw new Error('Output directory is not owned by AI Video Skills');
 fs.mkdirSync(resolved,{recursive:true});return resolved;
}
function sceneFilter(scene,p){
 const {width:w,height:h,fps}=p,frames=Math.round(scene.duration*fps),den=Math.max(1,frames-1),camera=scene.camera??'static';
 let f=`scale=${w}:${h}:force_original_aspect_ratio=increase,crop=${w}:${h},setsar=1`;
 if(scene.image&&camera!=='static'){
  const z=camera==='zoom-in'?`1+0.08*on/${den}`:camera==='zoom-out'?`1.08-0.08*on/${den}`:'1.08';
  const x=camera==='pan-right'?`(iw-iw/zoom)*on/${den}`:camera==='pan-left'?`(iw-iw/zoom)*(1-on/${den})`:'iw/2-iw/zoom/2';
  f+=`,scale=iw*2:ih*2,zoompan=z='${z}':x='${x}':y='ih/2-ih/zoom/2':d=${frames}:s=${w}x${h}:fps=${fps}`;
 }
 if(scene.transition==='fade'){const fade=Math.min(.25,scene.duration/3);f+=`,fade=t=in:st=0:d=${fade},fade=t=out:st=${scene.duration-fade}:d=${fade}`;}
 return f+',format=yuv420p';
}
async function renderScene(scene,p,root,file,ffmpeg){
 const args=['-v','error','-nostdin','-y'];
 if(scene.image)args.push('-loop','1','-framerate',String(p.fps),'-i',assetPath(root,scene.image));
 else args.push('-f','lavfi','-i',`color=c=${scene.color}:s=${p.width}x${p.height}:r=${p.fps}`);
 if(scene.audio)args.push('-i',assetPath(root,scene.audio));else args.push('-f','lavfi','-i','anullsrc=r=48000:cl=stereo');
 args.push('-map','0:v:0','-map','1:a:0','-vf',sceneFilter(scene,p),'-af',`apad,atrim=duration=${scene.duration},asetpts=PTS-STARTPTS`,'-t',String(scene.duration),'-r',String(p.fps),'-c:v','libx264','-preset','veryfast','-crf','20','-pix_fmt','yuv420p','-c:a','aac','-ar','48000','-ac','2','-movflags','+faststart',file);
 await run(ffmpeg,args,{timeout:Math.max(120000,scene.duration*30000)});
}
export async function render(projectFile,{out,ffmpeg='ffmpeg',ffprobe='ffprobe',renderer='ffmpeg',providerConfig={},onProgress=()=>{}}={}){
 projectFile=fs.realpathSync(projectFile);const root=path.dirname(projectFile),p=readJson(projectFile),timeline=validateProject(p,{root,requireAssets:true});
 if(!['ffmpeg','remotion'].includes(renderer))throw new Error('Unsupported renderer');
 for(const scene of p.scenes)if(scene.audio){const meta=JSON.parse((await run(ffprobe,['-v','error','-show_entries','format=duration','-of','json',assetPath(root,scene.audio)])).stdout);if(Number(meta.format?.duration)>scene.duration+.05)throw new Error(`Scene ${scene.id} narration audio exceeds duration; adjust timing explicitly`);}
 out=outputDirectory(out??path.join(root,'.aiv-output'),projectFile);
 for(const s of p.scenes)for(const k of ['image','audio'])if(s[k]&&within(out,assetPath(root,s[k])))throw new Error('Input assets cannot live in output directory');
 for(const a of [p.audio?.music,p.font])if(a&&within(out,assetPath(root,a)))throw new Error('Input assets cannot live in output directory');
 const owner=path.join(out,'.aiv-owned.json');if(fs.existsSync(owner)&&readJson(owner).projectFile!==projectFile)throw new Error('Output belongs to another project');
 const lock=path.join(out,'render.lock');let handle;try{handle=fs.openSync(lock,'wx');}catch{throw new Error('Render is locked; verify no process is active before removing a stale render.lock');}
 fs.writeFileSync(handle,JSON.stringify({pid:process.pid,startedAt:new Date().toISOString()}));
 let state={schemaVersion:1,engine:ENGINE_VERSION,status:'RENDERING',projectFile,scenes:{}};const stateFile=path.join(out,'checkpoint.json');
 try{
  if(fs.existsSync(stateFile)){const previous=readJson(stateFile);if(previous.schemaVersion!==1||previous.projectFile!==projectFile)throw new Error('Incompatible checkpoint');state=previous;state.status='RENDERING';}
  atomicJson(owner,{projectFile,engine:ENGINE_VERSION});
  const version=(await run(ffmpeg,['-version'],{timeout:10000})).stdout.split('\n')[0];
  const implementation=fileDigest(fileURLToPath(import.meta.url)),providerRevision=renderer==='remotion'?providerFingerprint(providerConfig,root):null;
  state.projectHash=fileDigest(projectFile);atomicJson(stateFile,state);let reused=0,rendered=0;const chunks=[];
  for(const scene of p.scenes){
   const assets={};for(const k of ['image','audio'])if(scene[k])assets[k]=fileDigest(assetPath(root,scene[k]));
   const key=digest(JSON.stringify({engine:ENGINE_VERSION,implementation,version,renderer,providerRevision,scene,assets,width:p.width,height:p.height,fps:p.fps}));
   const name=`scene-${scene.id}-${key.slice(0,16)}.mp4`,file=path.join(out,name),old=state.scenes[scene.id];let valid=false;
   if(old?.key===key&&old.file===name&&fs.existsSync(file)&&old.sha256===fileDigest(file))valid=(await inspectVideo(file,{width:p.width,height:p.height,fps:p.fps,duration:scene.duration},ffprobe).catch(()=>({ok:false}))).ok;
   if(valid){reused++;onProgress({scene:scene.id,status:'REUSED'});}else{
    const temp=path.join(out,`partial-${scene.id}.mp4`);if(fs.existsSync(temp))fs.unlinkSync(temp);
    if(renderer==='remotion')await renderRemotion({project:{...p,scenes:[scene],subtitles:[],audio:undefined},projectRoot:root,output:temp},providerConfig,{root});else await renderScene(scene,p,root,temp,ffmpeg);
    const check=await inspectVideo(temp,{width:p.width,height:p.height,fps:p.fps,duration:scene.duration},ffprobe);if(!check.ok)throw new Error(`Invalid scene output: ${check.issues.join(', ')}`);
    fs.renameSync(temp,file);rendered++;state.scenes[scene.id]={key,file:name,sha256:fileDigest(file)};atomicJson(stateFile,state);onProgress({scene:scene.id,status:'RENDERED'});
   }chunks.push(name);
  }
  fs.writeFileSync(path.join(out,'scenes.ffconcat'),'ffconcat version 1.0\n'+chunks.map(f=>`file '${f}'`).join('\n')+'\n');
  const cues=p.subtitles??[];fs.writeFileSync(path.join(out,'captions.srt'),srt(cues),'utf8');fs.writeFileSync(path.join(out,'captions.ass'),ass(cues,p.width,p.height,p.fontFamily),'utf8');
  if(p.font)fs.copyFileSync(assetPath(root,p.font),path.join(out,'caption-font'+path.extname(p.font)));
  const args=['-v','error','-nostdin','-y','-f','concat','-safe','1','-i','scenes.ffconcat'];let mix;
  if(p.audio?.music){args.push('-stream_loop','-1','-i',assetPath(root,p.audio.music));mix=`[0:a]volume=${p.audio.voiceDb??0}dB,asplit=2[voice][side];[1:a]volume=${p.audio.musicDb??-22}dB[music];[music][side]sidechaincompress=threshold=0.04:ratio=8[ducked];[voice][ducked]amix=inputs=2:duration=first:normalize=0,loudnorm=I=-16:TP=-1.5:LRA=11[a]`;}
  else mix=`[0:a]volume=${p.audio?.voiceDb??0}dB,loudnorm=I=-16:TP=-1.5:LRA=11[a]`;
  args.push('-filter_complex',mix,'-map','0:v:0','-map','[a]');
  if(p.captionMode==='burn'&&cues.length){args.push('-vf','subtitles=filename=captions.ass:fontsdir=.','-c:v','libx264','-preset','veryfast','-crf','20');}else args.push('-c:v','copy');
  args.push('-c:a','aac','-ar','48000','-ac','2','-t',String(timeline.duration),'-movflags','+faststart','final.partial.mp4');
  await run(ffmpeg,args,{cwd:out,timeout:Math.max(120000,timeline.duration*30000)});
  const check=await inspectVideo(path.join(out,'final.partial.mp4'),p,ffprobe);if(!check.ok)throw new Error(`Final validation failed: ${check.issues.join(', ')}`);
  fs.renameSync(path.join(out,'final.partial.mp4'),path.join(out,'final.mp4'));
  const report={schemaVersion:1,engine:ENGINE_VERSION,status:'COMPLETE',renderer,rendered,reused,sceneCount:p.scenes.length,media:check,captionMode:p.captionMode??'sidecar',warnings:p.scenes.some(s=>s.color)?['Explicit demo color cards present; these are not AI-generated imagery']:[],completedAt:new Date().toISOString()};
  state.status='COMPLETE';state.finalSha256=fileDigest(path.join(out,'final.mp4'));atomicJson(stateFile,state);atomicJson(path.join(out,'production-report.json'),report);return report;
 }catch(error){state.status='FAILED';state.error='Production failed; inspect CLI error and retry after correcting inputs/tools';atomicJson(stateFile,state);throw error;}
 finally{fs.closeSync(handle);fs.unlinkSync(lock);}
}
