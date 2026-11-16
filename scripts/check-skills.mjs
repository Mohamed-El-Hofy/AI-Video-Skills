import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
export const names=['ai-video-producer','environment-doctor','script-writer','image-director','voice-director','camera-animator','video-editor','quality-inspector','export-manager'];
export function checkSkill(name){
 const dir=path.join(root,'skills',name),file=path.join(dir,'SKILL.md');if(!fs.existsSync(file))throw new Error(`${name}: missing SKILL.md`);
 const content=fs.readFileSync(file,'utf8'),front=content.match(/^---\r?\n([\s\S]+?)\r?\n---\r?\n/);if(!front)throw new Error('Missing frontmatter');
 const metadata=Object.fromEntries(front[1].split(/\r?\n/).map(l=>{const i=l.indexOf(':');return [l.slice(0,i),l.slice(i+1).trim()]}));
 if(metadata.name!==name||!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name)||name.length>64)throw new Error('Invalid skill name');
 if(!metadata.description?.startsWith('Use when')||metadata.description.length>1024)throw new Error('Invalid skill description');
 if(!content.includes('scripts/aiv.mjs')||!content.includes('## Deliverable')||!content.includes('## Common mistakes'))throw new Error('Missing operational guidance');
 if(content.split(/\r?\n/).length>250)throw new Error('Skill is too long');
 for(const match of content.matchAll(/\]\(([^)]+)\)/g)){if(!/^https?:/.test(match[1])&&!fs.existsSync(path.resolve(dir,match[1])))throw new Error(`Broken reference ${match[1]}`);}
 if(/[A-Z]:[\\/]|mekov|Bearer\s+[A-Za-z0-9_-]{10}/.test(content))throw new Error('Machine-specific or secret-looking content');
 return {name,valid:true};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{const selected=process.argv[2]?[process.argv[2]]:names;console.log(JSON.stringify(selected.map(checkSkill),null,2));}catch(e){console.error(e.message);process.exitCode=1;}
}
