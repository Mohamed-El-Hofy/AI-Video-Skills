import {doctor,assertCaptionSupport} from '../engine/doctor.mjs';
const result=await doctor();
if(result.status==='BLOCKED')throw new Error('CI requires FFmpeg/FFprobe with baseline render capabilities');
assertCaptionSupport({captionMode:'burn',subtitles:[{start:0,end:1,text:'CI'}]},result.tools.ffmpeg);
console.log(JSON.stringify({status:'READY_FOR_SMOKE',ffmpeg:result.tools.ffmpeg.version,subtitles:result.tools.ffmpeg.subtitles}));
