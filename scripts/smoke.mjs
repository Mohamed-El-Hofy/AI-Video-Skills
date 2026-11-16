import fs from 'node:fs';
import path from 'node:path';
import { run, atomicJson, readJson } from '../engine/core.mjs';
import { render, inspectVideo } from '../engine/render.mjs';
const root=path.resolve('work/smoke');fs.mkdirSync(root,{recursive:true});
const image=path.join(root,'ocean-test.ppm');const pixels=Buffer.alloc(640*360*3);
for(let y=0;y<360;y++)for(let x=0;x<640;x++){const i=(y*640+x)*3;pixels[i]=Math.round(12+20*x/640);pixels[i+1]=Math.round(45+70*y/360);pixels[i+2]=Math.round(75+70*(Math.sin(x/32)*.5+.5));}
fs.writeFileSync(image,Buffer.concat([Buffer.from('P6\n640 360\n255\n'),pixels]));
for(const [file,frequency,duration] of [['test-tone.wav',440,2],['music-tone.wav',180,4]])if(!fs.existsSync(path.join(root,file)))await run('ffmpeg',['-v','error','-f','lavfi','-i',`sine=frequency=${frequency}:duration=${duration}`,path.join(root,file)]);
const p={schemaVersion:1,id:'smoke',title:'Synthetic fixture — not an AI documentary',width:640,height:360,fps:24,language:'ar-EG',captionMode:'burn',scenes:[{id:'in',duration:2,image:'ocean-test.ppm',audio:'test-tone.wav',camera:'zoom-in',transition:'fade'},{id:'pan',duration:2,image:'ocean-test.ppm',camera:'pan-left'}],audio:{music:'music-tone.wav',musicDb:-30,voiceDb:-6},subtitles:[{start:.25,end:1.75,text:'اختبار عربي — صوت تجريبي'},{start:2.25,end:3.75,text:'حركة وكاميرا وترجمة'}],provenance:[{path:'ocean-test.ppm',source:'Original deterministic test gradient',license:'Apache-2.0'}]};
const file=path.join(root,'project.json');atomicJson(file,p);const out=path.join(root,'output');
const first=await render(file,{out}),second=await render(file,{out});if(second.reused!==2)throw new Error('Smoke resume did not reuse both scenes');
await run('ffmpeg',['-v','error','-i',path.join(out,'final.mp4'),'-f','null','-']);
const result={first,second,media:await inspectVideo(path.join(out,'final.mp4'),p),fixture:'Deterministic gradient and sine tones; no image or speech generation claimed',checkpoint:readJson(path.join(out,'checkpoint.json')).status};
atomicJson(path.join(root,'smoke-result.json'),result);console.log(JSON.stringify(result,null,2));
