#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';
const folder=fileURLToPath(new URL('../',import.meta.url));
let home=process.env.AIV_HOME;
const locator=path.join(folder,'.runtime.json');
if(!home&&fs.existsSync(locator))home=JSON.parse(fs.readFileSync(locator,'utf8')).home;
if(!home){let current=folder;while(true){const p=path.join(current,'package.json');if(fs.existsSync(p)&&JSON.parse(fs.readFileSync(p,'utf8')).name==='ai-video-skills'){home=current;break;}const parent=path.dirname(current);if(parent===current)break;current=parent;}}
if(!home||!fs.existsSync(path.join(home,'cli','aiv.mjs'))){console.error('Runtime missing. Set AIV_HOME to the AI Video Skills repository or reinstall these project skills. No software was installed.');process.exitCode=2;}else{
 const child=spawn(process.execPath,[path.join(home,'cli','aiv.mjs'),...process.argv.slice(2)],{stdio:'inherit',shell:false,windowsHide:true});child.on('error',()=>{console.error('Unable to launch runtime');process.exitCode=1;});child.on('exit',code=>{process.exitCode=code??1;});
}
