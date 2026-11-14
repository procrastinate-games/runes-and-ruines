import type { State } from '../game/types';
import { LEVELS } from '../content/levels';
export const SAVE_KEY='pg:runes-and-ruines:save:v1';
export const AUTO_KEY='pg:runes-and-ruines:checkpoint:v1';
export const SETTINGS_KEY='pg:runes-and-ruines:settings:v1';
const finite=(n:unknown)=>typeof n==='number'&&Number.isFinite(n);
const ints=(n:unknown)=>finite(n)&&Number.isInteger(n);
export function decode(raw:string|null):State|null {
 if(!raw)return null;try{
 const s=JSON.parse(raw) as State;const p=s?.player;
 if(s.version!==1||!p||p.id!=='georges_feanor_tikho'||p.name!=='Жорж Феанор Тихо'||!ints(s.zone)||s.zone<0||s.zone>=LEVELS.length||!Array.isArray(s.zones)||s.zones.length!==3)return null;
 if(!ints(p.x)||!ints(p.y)||LEVELS[s.zone].map[p.y]?.[p.x]!=='.'||!ints(p.facing)||p.facing<0||p.facing>3||!finite(p.hp)||p.hp<0||!finite(p.maxHp)||p.maxHp<1||p.hp>p.maxHp||!finite(p.focus)||!finite(p.maxFocus)||p.focus<0||p.focus>p.maxFocus||!finite(p.gold)||p.gold<0||!ints(p.level)||p.level<1||p.level>4||!finite(p.xp)||!finite(p.armor))return null;
 if(!p.inventory||typeof p.inventory!=='object'||Object.values(p.inventory).some(n=>!ints(n)||n<0)||!Array.isArray(p.statuses)||!s.flags||typeof s.flags!=='object'||!Array.isArray(s.secrets)||!Array.isArray(s.notes)||!Array.isArray(s.log)||!s.purchases||!finite(s.seed)||!finite(s.turns)||!finite(s.cycles)||![0,1].includes(s.hasteQueue)||!['playing','defeat','victory'].includes(s.mode))return null;
 if(!s.zones.every(z=>Array.isArray(z.enemies)&&Array.isArray(z.opened)&&Array.isArray(z.known)&&Array.isArray(z.visited)&&Array.isArray(z.runeInput)&&ints(z.bridge)&&z.enemies.every(e=>ints(e.x)&&ints(e.y)&&finite(e.hp)&&finite(e.maxHp)&&Array.isArray(e.statuses)&&['mold','goblin','guard','archer','scribe','boss'].includes(e.kind))))return null;
 if(!p.statuses.every(v=>typeof v.id==='string'&&ints(v.remaining)&&v.remaining>0))return null;
 return s;
 }catch{return null;}
}
export function save(s:State,checkpoint=false):boolean {if(s.mode==='defeat')return false;try{localStorage.setItem(checkpoint?AUTO_KEY:SAVE_KEY,JSON.stringify(s));return true;}catch{return false;}}
export function load(checkpoint=false):State|null {try{return decode(localStorage.getItem(checkpoint?AUTO_KEY:SAVE_KEY));}catch{return null;}}
export interface Settings {sound:boolean; low:boolean; fast:boolean; volume:number}
export function readSettings():Settings {try{const s=JSON.parse(localStorage.getItem(SETTINGS_KEY)??'{}');return {sound:s.sound!==false,low:!!s.low,fast:!!s.fast,volume:typeof s.volume==='number'?Math.max(0,Math.min(1,s.volume)):0.35};}catch{return {sound:true,low:false,fast:false,volume:0.35};}}
export function writeSettings(s:Settings):void {try{localStorage.setItem(SETTINGS_KEY,JSON.stringify(s));}catch{/* Storage may be unavailable in private/embedded contexts. */}}
