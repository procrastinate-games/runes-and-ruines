import {mkdirSync,writeFileSync} from 'node:fs';
import {it,expect} from 'vitest';
import {act,createGame} from '../src/game/engine';
import {DIRS,LEVELS} from '../src/content/levels';
import {distance,features,lineOfSight,occupied,solid,zoneState} from '../src/game/grid';
import type {Intent,Point,State} from '../src/game/types';
let recorded:Intent[]=[];
function step(s:State,a:Intent){recorded.push(a);const r=act(s,a);if(s.mode==='defeat')throw Error(`Death at zone ${s.zone} ${JSON.stringify(s.player)} log ${s.log.join(' | ')}`);return r;}
function face(s:State,dir:number){let guard=0;while(s.player.facing!==dir&&guard++<3)step(s,{type:'turn',delta:(dir-s.player.facing+4)%4===3?-1:1});}
function health(s:State){const p=s.player;if(p.hp<p.maxHp-32){const id=p.inventory.heal?'heal':p.inventory.full?'full':'';if(id)step(s,{type:'use',item:id});}}
function route(s:State,dest:Point):Point|undefined{
 const p=s.player;const seen=new Set([`${p.x},${p.y}`]);const q=[{x:p.x,y:p.y,first:undefined as Point|undefined}];
 for(let i=0;i<q.length;i++){const cur=q[i];for(const d of DIRS){const next={x:cur.x+d.x,y:cur.y+d.y};const k=`${next.x},${next.y}`;
  const f=features(s).find(f=>f.x===next.x&&f.y===next.y);const canOpen=f?.kind==='door'&&(s.player.inventory[f.requires!]||s.flags[f.requires!]);
  if(seen.has(k)||solid(s,next.x,next.y)&&!canOpen||f?.kind==='antarion'||f?.kind==='merchant')continue;const first=cur.first??next;
  if(next.x===dest.x&&next.y===dest.y)return first;seen.add(k);q.push({...next,first});
 }}return;
}
function moveToward(s:State,dest:Point){const next=route(s,dest);if(!next)throw Error(`No path z${s.zone} ${s.player.x},${s.player.y} -> ${dest.x},${dest.y}`);const dir=DIRS.findIndex(d=>s.player.x+d.x===next.x&&s.player.y+d.y===next.y);
 if(solid(s,next.x,next.y)){face(s,dir);const r=step(s,{type:'interact'});if(!r.ok)throw Error(`Cannot open ${r.message}`);return;}
 if(occupied(s,next.x,next.y)){face(s,dir);step(s,{type:'attack'});return;}
 step(s,{type:'move',relative:(dir-s.player.facing+4)%4});
}
function encounter(s:State):boolean{
 const p=s.player,enemies=zoneState(s).enemies.filter(e=>e.hp>0&&distance(e,p)<=6&&lineOfSight(s,p,e)).sort((a,b)=>distance(a,p)-distance(b,p));const e=enemies[0];if(!e)return false;
 if(e.kind==='boss'&&e.tell&&distance(p,e.tell)<=(e.phase===2?1:0)){
  const safe=DIRS.map(d=>({x:p.x+d.x,y:p.y+d.y})).filter(n=>!solid(s,n.x,n.y)&&!occupied(s,n.x,n.y)).sort((a,b)=>distance(b,e.tell!)-distance(a,e.tell!))[0];if(safe){moveToward(s,safe);return true;}
 }
 const aligned=p.x===e.x||p.y===e.y,n=distance(p,e);
 if(aligned){const dir=p.x===e.x?(e.y<p.y?0:2):(e.x>p.x?1:3);face(s,dir);if(e.hp<=0)return true;
  if((e.kind==='scribe'||e.kind==='mold')&&p.focus>=12&&n<=4){step(s,{type:'cast',spell:'fire'});return true;}
  if((e.kind==='guard'||e.kind==='boss'||e.kind==='archer')&&p.focus>=8&&n<=4){step(s,{type:'cast',spell:'spark'});return true;}
  if(n===1){step(s,{type:'equip',item:p.inventory.heavy?'heavy':p.inventory.iron?'iron':'sword'});step(s,{type:'attack'});return true;}
  if(p.inventory.crossbow&&p.inventory.bolts&&n<=5){step(s,{type:'equip',item:'crossbow'});step(s,{type:'attack'});return true;}
 }
 const next=route(s,e);if(next){moveToward(s,e);return true;}return false;
}
function go(s:State,id:string,interact=true){const f=features(s).find(f=>f.id===id);if(!f)throw Error(`Missing ${id}`);let safety=0;
 while(safety++<1000){health(s);if(encounter(s))continue;if(distance(s.player,f)<=1){if(distance(s.player,f)===1)face(s,DIRS.findIndex(d=>s.player.x+d.x===f.x&&s.player.y+d.y===f.y));if(interact){const r=step(s,{type:'interact'});if(!r.ok)throw Error(`${id} failed: ${r.message}`);}return;}
  const options=DIRS.map(d=>({x:f.x+d.x,y:f.y+d.y})).filter(p=>!solid(s,p.x,p.y)&&!occupied(s,p.x,p.y));if(!options.length)throw Error(`No adjacent cell to ${id}`);
  const dest=options.sort((a,b)=>distance(a,s.player)-distance(b,s.player)).find(p=>route(s,p));if(!dest)throw Error(`Unreachable ${id}`);moveToward(s,dest);
 }throw Error(`Route loop ${id} at ${s.player.x},${s.player.y} log ${s.log.join('|')}`);
}
function campaign(optional:boolean){recorded=[];const s=createGame();
 go(s,'supplies');go(s,'introNote');go(s,'copper');if(optional){go(s,'catSecret');go(s,'catTreasure');}go(s,'runeHint');go(s,'runeLock');for(const choice of [0,1,2])step(s,{type:'interact',choice});go(s,'runeGate');go(s,'toMines');expect(s.zone).toBe(1);
 go(s,'tradeNote');go(s,'bessa');step(s,{type:'negotiate',choice:1});step(s,{type:'buy',item:'iron'});step(s,{type:'buy',item:'armor'});go(s,'mineKey');if(optional)go(s,'mineSecret');go(s,'bridgeHint');go(s,'bridgeSwitch');step(s,{type:'interact',choice:'rotate'});step(s,{type:'interact',choice:'rotate'});expect(s.flags.bridgeSolved).toBe(true);go(s,'mineCache');go(s,'mineLoot');go(s,'toArchive');expect(s.zone).toBe(2);
 go(s,'archiveChest');if(optional){go(s,'forgottenRune');go(s,'antarion_muzrael');expect(s.flags.antarionQuestCompleted).toBe(true);go(s,'archiveSecret');go(s,'memoryChest');}else go(s,'antarion_muzrael');go(s,'sealHint');go(s,'mainSeal');for(const choice of [0,1,2])step(s,{type:'interact',choice});go(s,'sealGate');
 let guard=0;while(s.mode==='playing'&&guard++<150){health(s);if(!encounter(s))moveToward(s,{x:11,y:2});}
 if(s.mode!=='victory')console.log('STUCK',s.player,zoneState(s).enemies,s.log);expect(s.mode).toBe('victory');expect(s.flags.bossDefeated).toBe(true);expect(s.player.level).toBe(4);expect(s.secrets.length).toBe(optional?3:0);expect(!!s.flags.antarionQuestCompleted).toBe(optional);mkdirSync('output',{recursive:true});writeFileSync(`output/campaign-${optional?'all':'main'}.json`,JSON.stringify({actions:recorded,state:s}));return s;
}
it('full authored campaign completes on normal using earned resources, all secrets and early rune hand-in',()=>{campaign(true)});
it('main route and boss ending are reachable without collecting any optional secret or rune',()=>{campaign(false)});
