import './style.css';
import { act, createGame, target } from './game/engine';
import { contextFeature, zoneState } from './game/grid';
import { LEVELS } from './content/levels';
import type { Intent, State } from './game/types';
import { DungeonView } from './render/scene';
import { UI } from './ui/hud';
import type { UICommand, Panel } from './ui/hud';
import { Sound } from './audio/effects';
import { load, readSettings, save, writeSettings } from './save/storage';
const app=document.querySelector<HTMLDivElement>('#app')!;app.innerHTML='<main id="scene" aria-label="Подземелья Астэрны — вид от первого лица"></main><div id="ui"></div>';
let state=createGame(),busyUntil=0,sessionStarted=false;const settings=readSettings(),sound=new Sound();let view:DungeonView;
try{view=new DungeonView(document.querySelector('#scene')!);}catch{app.innerHTML='<div class="fatal"><h1>Не удалось запустить игру</h1><p>Для игры нужен WebGL. Включите аппаратное ускорение или откройте игру в актуальном Chrome / Firefox. Ваши сохранения останутся в браузере.</p></div>';throw new Error('WebGL initialization failed');}
const ui=new UI(document.querySelector('#ui')!,settings,command);ui.hasSave=!!(load()??load(true));
function applySettings(){sound.enabled=settings.sound;sound.volume=settings.volume;sound.update();view.setQuality(settings.low);view.setFast(settings.fast);}
function refresh(snap=false){view.sync(state,snap);view.setOverlay(ui.panel==='start');ui.render(state);}
function beginNew(){state=createGame(ui.difficulty);ui.panel='intro';sessionStarted=false;ui.sessionActive=false;refresh(true);}
function command(a:UICommand){
 if(a.type==='panel'){
  if(state.mode!=='playing'&&a.panel!=='newConfirm')return;const previous=ui.panel;ui.panel=previous===a.panel?'':a.panel;
  if(!sessionStarted&&ui.panel==='')ui.panel='start';refresh();return;
 }
 if(a.type==='difficulty'){ui.difficulty=ui.difficulty==='normal'?'story':'normal';ui.render(state);return;}
 if(a.type==='start'){if(ui.hasSave){ui.panel='newConfirm';ui.render(state);}else beginNew();return;}
 if(a.type==='new'){beginNew();return;}
 if(a.type==='begin'){sound.unlock();sessionStarted=true;ui.sessionActive=true;ui.panel='';save(state,true);ui.hasSave=true;refresh(true);return;}
 if(a.type==='continue'||a.type==='load'||a.type==='retry'){
  const stored=a.type==='retry'?load(true):load()??load(true);if(stored){state=stored;sessionStarted=true;ui.sessionActive=true;ui.panel='';sound.unlock();busyUntil=0;refresh(true);}else ui.notify('Не удалось загрузить сохранение: оно отсутствует или повреждено. Можно начать новую игру.');return;
 }
 if(a.type==='save'){const ok=save(state);ui.hasSave=ok||ui.hasSave;ui.notify(ok?'Игра сохранена.':'Не удалось сохранить игру. Хранилище браузера недоступно или заполнено.');return;}
 if(a.type==='setting'){if(a.setting==='sound')settings.sound=!settings.sound;if(a.setting==='low')settings.low=!settings.low;if(a.setting==='fast')settings.fast=!settings.fast;writeSettings(settings);applySettings();ui.render(state);return;}
 if(!sessionStarted||performance.now()<busyUntil||state.mode!=='playing')return;
 const allowedInPanel=['use','equip','buy','negotiate','interact'].includes(a.type);if(ui.panel&&!allowedInPanel)return;
 sound.unlock();const impact=target(state);const impactPoint=impact?{x:impact.x,y:impact.y}:undefined;const hp=state.player.hp,prevZone=state.zone;const result=act(state,a as Intent);
 if(result.ok&&(result.costTurn||a.type==='turn'))busyUntil=performance.now()+(settings.fast?45:150);
 if(result.panel){ui.panel=result.panel;if(result.panel==='note')ui.note=result.message;}
 else if(a.type==='interact'&&['runes','seal'].includes(ui.panel))ui.panel='';
 if(state.zone!==prevZone)ui.panel='';
 if(result.checkpoint&&state.player.hp>0){save(state,true);ui.hasSave=true;}
 refresh();
 if(result.effect){view.effect(result.effect,impactPoint);sound.play(result.effect);const w=document.querySelector('#held-weapon');w?.classList.add(result.effect==='sword'||result.effect==='bolt'?'swing':'cast-fx');}
 else if(result.ok&&a.type==='move')sound.play('step');
 if(state.player.hp<hp){sound.play('hurt');document.querySelector('#hit-flash')?.classList.add('active');}
 if(result.damage){const el=document.createElement('div');el.className='damage-number';el.textContent=`−${result.damage}`;document.querySelector('#ui')?.append(el);setTimeout(()=>el.remove(),750);}
}
const keys:Record<string,UICommand>={w:{type:'move',relative:0},arrowup:{type:'move',relative:0},s:{type:'move',relative:2},arrowdown:{type:'move',relative:2},a:{type:'move',relative:3},d:{type:'move',relative:1},q:{type:'turn',delta:-1},e:{type:'turn',delta:1},f:{type:'interact'},r:{type:'wait'},' ':{type:'attack'},h:{type:'use',item:'heal'},'1':{type:'equip',item:'sword'},'2':{type:'equip',item:'crossbow'},'3':{type:'cast',spell:'spark'},'4':{type:'cast',spell:'fire'},'5':{type:'cast',spell:'echo'},tab:{type:'panel',panel:'inventory'},m:{type:'panel',panel:'map'},j:{type:'panel',panel:'journal'}};
window.addEventListener('keydown',e=>{const k=e.key.toLowerCase();if(e.ctrlKey||e.metaKey||e.altKey)return;if(k==='escape'){e.preventDefault();command({type:'panel',panel:ui.panel&&ui.panel!=='start'?'':'pause'});return;}
 const a=keys[k];if(!a)return;e.preventDefault();if(e.repeat)return;
 if(k==='1')command({type:'equip',item:state.player.inventory.heavy?'heavy':state.player.inventory.iron?'iron':'sword'});else command(a);
});
document.querySelector('#scene')!.addEventListener('click',()=>{if(ui.panel)return;command(target(state)?{type:'attack'}:contextFeature(state)?{type:'interact'}:{type:'attack'});});
let last=performance.now();setInterval(()=>{const now=performance.now();if(sessionStarted&&!ui.panel&&state.mode==='playing')state.played+=Math.min(now-last,2000);last=now;},1000);
applySettings();refresh(true);
// Read-only runtime inspection. Time never advances the turn engine.
const debug={get state(){return state;},get panel(){return ui.panel;},stats:()=>view.stats()};
Object.assign(window,{__GAME__:debug,render_game_to_text:()=>JSON.stringify({coords:'origin top-left, x east, y south; facing 0=N 1=E 2=S 3=W',mode:ui.panel||state.mode,zone:LEVELS[state.zone].name,player:state.player,turns:state.turns,cycles:state.cycles,hasteQueue:state.hasteQueue,enemies:zoneState(state).enemies.filter(e=>e.hp>0),flags:state.flags,secrets:state.secrets,context:contextFeature(state)?.name,log:state.log.slice(-2)}),advanceTime:(ms:number)=>new Promise(resolve=>setTimeout(resolve,Math.max(0,ms)))});
// Mutating QA hooks are compiled out of production.
if(import.meta.env.DEV)Object.assign(window,{__QA__:{dispatch:command,replace:(s:State,panel:Panel='')=>{state=s;sessionStarted=true;ui.sessionActive=true;ui.panel=panel;busyUntil=0;refresh(true);}}});
