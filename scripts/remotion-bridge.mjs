import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { readJson, assetPath, validateProject } from '../engine/core.mjs';

async function modules(moduleRoot){
 const require=createRequire(path.join(path.resolve(moduleRoot),'package.json'));
 return {bundler:await import(pathToFileURL(require.resolve('@remotion/bundler')).href),renderer:await import(pathToFileURL(require.resolve('@remotion/renderer')).href)};
}
if(process.argv[2]==='--probe'){
 if(!process.argv[3])throw new Error('Provide moduleRoot after --probe');await modules(process.argv[3]);console.log('Remotion bundler and renderer imports available');
}else{
 const request=readJson(process.argv[2]);if(!request.browserExecutable||!fs.existsSync(request.browserExecutable))throw new Error('Remotion requires an existing browserExecutable; approve browser installation separately');
 const root=fs.realpathSync(request.projectRoot),p=structuredClone(request.project);validateProject(p,{root,requireAssets:true});
 // Inline only the selected, explicitly referenced scene assets; never package the source project's directory.
 const dataUrl=(relative,type)=>`data:${type};base64,${fs.readFileSync(assetPath(root,relative)).toString('base64')}`;
 for(const s of p.scenes){if(s.image){const ext=path.extname(s.image).toLowerCase();s.image=dataUrl(s.image,ext==='.jpg'||ext==='.jpeg'?'image/jpeg':ext==='.webp'?'image/webp':'image/png');}if(s.audio)s.audio=dataUrl(s.audio,'audio/wav');}
 const {bundler,renderer}=await modules(request.moduleRoot),entry=fileURLToPath(new URL('../templates/remotion/index.tsx',import.meta.url));
 const serveUrl=await bundler.bundle({entryPoint:entry,outDir:path.join(path.dirname(process.argv[2]),'bundle'),onProgress:()=>{},webpackOverride:config=>({...config,cache:false,resolve:{...config.resolve,modules:[path.join(request.moduleRoot,'node_modules'),'node_modules']}})});
 const inputProps={project:p},composition=await renderer.selectComposition({serveUrl,id:'PortableVideo',inputProps,browserExecutable:request.browserExecutable});
 // Browser acquisition is disabled. Supply a previously installed Chrome/Chromium executable.
 await renderer.renderMedia({serveUrl,composition,inputProps,codec:'h264',audioCodec:'aac',outputLocation:request.output,browserExecutable:request.browserExecutable,concurrency:request.concurrency??1,logLevel:'error'});
}
