#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { names, checkSkill } from './check-skills.mjs';
import { atomicJson, within } from '../engine/core.mjs';
const home=fileURLToPath(new URL('../',import.meta.url));
try{
 const args=process.argv.slice(2),options={};for(let i=0;i<args.length;i++){const key=args[i];if(!['--agent','--project','--user'].includes(key)||key in options)throw new Error('Usage: --agent codex|claude|antigravity --project <path>, or --user for explicit user-scope install');options[key]=key==='--user'?true:args[++i];}
 const agent=options['--agent'];if(!['codex','claude','antigravity'].includes(agent)||Boolean(options['--project'])===Boolean(options['--user']))throw new Error('Choose one supported agent and exactly one project/user scope');
 const project=path.resolve(options['--project']??os.homedir());fs.mkdirSync(project,{recursive:true});
 const sub=options['--user']?({codex:'.agents/skills',claude:'.claude/skills',antigravity:'.gemini/config/skills'}[agent]):({codex:'.agents/skills',claude:'.claude/skills',antigravity:'.agents/skills'}[agent]);
 const destination=path.join(project,sub);let ancestor=destination;while(!fs.existsSync(ancestor))ancestor=path.dirname(ancestor);if(!within(fs.realpathSync(project),fs.realpathSync(ancestor)))throw new Error('Skill destination escapes project through symlink');
 for(const name of names){checkSkill(name);if(fs.existsSync(path.join(destination,name)))throw new Error(`Skill already exists: ${name}. Review/remove or choose another project; installer never overwrites.`);}
 fs.mkdirSync(destination,{recursive:true});const created=[];
 try{for(const name of names){const target=path.join(destination,name);created.push(target);fs.cpSync(path.join(home,'skills',name),target,{recursive:true,errorOnExist:true,force:false});atomicJson(path.join(target,'.runtime.json'),{home});}}
 catch(error){for(const target of created)fs.rmSync(target,{recursive:true,force:true});throw error;}
 console.log(JSON.stringify({status:'INSTALLED',agent,scope:options['--user']?'user':'project',count:names.length,destination,runtime:home,note:'Restart/refresh the host skill inventory. Native host discovery still needs a live check.'},null,2));
}catch(error){console.error(error.message);process.exitCode=1;}
