import test from 'node:test';
import assert from 'node:assert/strict';
import {names,checkSkill} from '../scripts/check-skills.mjs';
for(const name of names)test(`skill ${name}: discoverable format, relative links and operational contract`,()=>assert.equal(checkSkill(name).valid,true));
