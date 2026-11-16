import test from 'node:test';
import assert from 'node:assert/strict';
import {ass} from '../engine/captions.mjs';
import {validateProject} from '../engine/core.mjs';
test('ASS selects the requested family and preserves Arabic logical text',()=>{
 const content=ass([{start:0,end:1,text:'اختبار عربي'}],640,360,'Noto Sans Arabic');assert.match(content,/Style: Default,Noto Sans Arabic,/);assert.ok(content.includes('اختبار عربي'));
});
test('font family cannot inject ASS style fields',()=>{
 const p={schemaVersion:1,id:'font',title:'Font',width:320,height:240,fps:24,fontFamily:'Arial,12\nStyle: Evil',scenes:[{id:'a',duration:1,color:'#123456'}]};assert.throws(()=>validateProject(p));
});
