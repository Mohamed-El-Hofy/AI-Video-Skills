import React from 'react';
import {AbsoluteFill, Audio, Composition, Img, Sequence, registerRoot, useCurrentFrame, useVideoConfig} from 'remotion';

type Scene={id:string;duration:number;image?:string;color?:string;camera?:string;transition?:string;audio?:string};
type Project={width:number;height:number;fps:number;scenes:Scene[]};
const SceneView:React.FC<{scene:Scene}>=({scene})=>{
 const f=useCurrentFrame(),{fps}=useVideoConfig(),n=Math.round(scene.duration*fps),t=Math.min(1,f/Math.max(1,n-1)),ease=t*t*(3-2*t);
 const camera=scene.camera??'static',scale=camera==='zoom-in'?1+.08*ease:camera==='zoom-out'?1.08-.08*ease:camera.startsWith('pan-')?1.08:1;
 const x=camera==='pan-right'?-3+6*ease:camera==='pan-left'?3-6*ease:0;
 const opacity=scene.transition==='fade'?Math.min(1,f/(fps*.25),(n-1-f)/(fps*.25)):1;
 return <AbsoluteFill style={{backgroundColor:'black'}}><AbsoluteFill style={{overflow:'hidden',opacity:Math.max(0,opacity)}}>{scene.image?<Img src={scene.image} style={{width:'100%',height:'100%',objectFit:'cover',transform:`translateX(${x}%) scale(${scale})`}}/>:<AbsoluteFill style={{backgroundColor:scene.color}}/>}</AbsoluteFill>{scene.audio?<Audio src={scene.audio}/>:<Audio src="data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAgLsAAAB3AQACABAAZGF0YQIAAAAAAA==" loop/>}</AbsoluteFill>;
};
const Video:React.FC<{project:Project}>=({project})=>{let start=0;return <AbsoluteFill style={{background:'black'}}>{project.scenes.map(scene=>{const from=start,durationInFrames=Math.round(scene.duration*project.fps);start+=durationInFrames;return <Sequence key={scene.id} from={from} durationInFrames={durationInFrames}><SceneView scene={scene}/></Sequence>;})}</AbsoluteFill>;};
const Root=()=> <Composition id="PortableVideo" component={Video} width={1280} height={720} fps={30} durationInFrames={30} defaultProps={{project:{width:1280,height:720,fps:30,scenes:[]}}} calculateMetadata={({props})=>({width:props.project.width,height:props.project.height,fps:props.project.fps,durationInFrames:props.project.scenes.reduce((n,s)=>n+Math.round(s.duration*props.project.fps),0)})}/>;
registerRoot(Root);
