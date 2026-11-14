import { DIALOGS } from '../content/dialogs.ru';
import { LEVELS, DIRS } from '../content/levels';
import { ENEMIES, ITEMS, SPELLS, XP_THRESHOLDS, SHOP } from '../content/items';
import { contextFeature, distance, features, lineOfSight, occupied, pathStep, reveal, solid, zoneState } from './grid';
import { random } from './rng';
import type { Enemy, Intent, Result, State, Status } from './types';
export function createGame(difficulty:'normal'|'story'='normal'):State {
 const s:State={version:1,seed:91731,zone:0,zones:LEVELS.map(l=>({enemies:l.enemies.map((e,i)=>({...e,id:`${l.id}:${i}`,hp:ENEMIES[e.kind].hp,maxHp:ENEMIES[e.kind].hp,alert:false,statuses:[],cooldown:0,phase:1})),opened:[],known:[],visited:[],runeInput:[],bridge:0})),player:{id:'georges_feanor_tikho',name:'Жорж Феанор Тихо',...LEVELS[0].start,facing:0,hp:80,maxHp:80,focus:35,maxFocus:35,armor:2,level:1,xp:0,gold:25,inventory:{sword:1,focus:1,heal:3,focusTonic:1,cleanse:1},equipped:'sword',statuses:[]},flags:{},turns:0,cycles:0,hasteQueue:0,kills:0,secrets:[],notes:[],mode:'playing',difficulty,log:['Искрик: W — шаг. Q/E — поворот. F — действие. Всё остальное подождёт.'],purchases:{},played:0};reveal(s);return s;
}
export function message(s:State,text:string):void {s.log=[...s.log.slice(-7),text];}
export const hasStatus=(statuses:Status[],id:Status['id'])=>statuses.some(v=>v.id===id&&v.remaining>0);
export function addStatus(statuses:Status[],id:Status['id'],remaining:number):void {const found=statuses.find(v=>v.id===id);if(found)found.remaining=Math.max(found.remaining,remaining);else statuses.push({id,remaining});}
export function target(s:State,range=5):Enemy|undefined {
 const d=DIRS[s.player.facing];for(let i=1;i<=range;i++){const x=s.player.x+d.x*i,y=s.player.y+d.y*i;if(solid(s,x,y))return;
 const e=zoneState(s).enemies.find(e=>e.hp>0&&e.x===x&&e.y===y);if(e)return e;
 }return;
}
export function alertEnemies(s:State):Enemy[]{return zoneState(s).enemies.filter(e=>e.hp>0&&(e.alert||distance(e,s.player)<=5&&lineOfSight(s,e,s.player)));}
function rewardKill(s:State,e:Enemy):void {
 if(e.hp>0||s.flags[`dead:${e.id}`])return;s.flags[`dead:${e.id}`]=true;s.kills++;s.player.xp+=ENEMIES[e.kind].xp;s.player.gold+=ENEMIES[e.kind].gold;message(s,`${ENEMIES[e.kind].name} повержен. +${ENEMIES[e.kind].xp} опыта, +${ENEMIES[e.kind].gold} монет.`);
 if(e.kind==='boss'){s.flags.bossDefeated=true;s.mode='victory';message(s,'Печать восстановлена. Стирание прекратилось.');}
 while(s.player.level<4&&s.player.xp>=XP_THRESHOLDS[s.player.level]){s.player.level++;s.player.maxHp+=12;s.player.hp=Math.min(s.player.maxHp,s.player.hp+28);s.player.maxFocus+=5;s.player.focus=s.player.maxFocus;message(s,`Уровень ${s.player.level}: +12 здоровья, +3 к урону, +5 фокуса.`);}
}
function hit(s:State,e:Enemy,base:number,element?:string):number {
 const roll=Math.floor(random(s)*5)-2,critical=random(s)<0.1;const armor=element?0:Math.max(0,ENEMIES[e.kind].armor-(s.player.equipped==='heavy'?3:0));
 const resist=element?(ENEMIES[e.kind].resist as Record<string,number>)[element]??1:1;
 const damage=Math.max(1,Math.round((base+(s.player.level-1)*3+(hasStatus(s.player.statuses,'strength')?5:0)+roll-armor)*resist*(critical?1.5:1)));
 e.hp=Math.max(0,e.hp-damage);e.alert=true;message(s,`${critical?'Критический удар! ':''}${ENEMIES[e.kind].name}: −${damage}${resist>1?' · уязвимость':resist<1?' · сопротивление':''}.`);rewardKill(s,e);return damage;
}
function hurt(s:State,amount:number,name:string,magic=false):void {
 const n=Math.max(1,Math.round((amount-(magic?0:s.player.armor))*(s.difficulty==='story'?0.6:1)));s.player.hp=Math.max(0,s.player.hp-n);message(s,`${name}: −${n} здоровья.`);
}
function enemyTick(s:State):void {
 const p=s.player;s.cycles++;
 for(const e of zoneState(s).enemies){if(e.hp<=0)continue;
  if(hasStatus(e.statuses,'burn')){e.hp=Math.max(0,e.hp-4);rewardKill(s,e);}
  const stunned=hasStatus(e.statuses,'stun');e.statuses=e.statuses.map(v=>({...v,remaining:v.remaining-1})).filter(v=>v.remaining>0);if(e.cooldown>0)e.cooldown--;
  if(e.hp<=0||stunned||s.mode!=='playing')continue;
  const n=distance(e,p),los=lineOfSight(s,e,p);if(n<=6&&los){if(e.kind==='boss'&&!e.alert)for(const line of DIALOGS.boss)message(s,line);e.alert=true;}if(!e.alert||n>12)continue;
  if(e.kind==='guard'&&s.cycles%2===1)continue;
  if(e.kind==='boss'){
   e.aoeCooldown=Math.max(0,(e.aoeCooldown??0)-1);
   if(e.hp<=e.maxHp/2&&e.phase===1){e.phase=2;message(s,'Регент раскалывается: ФАЗА II. Радиус печати вырос до 1 клетки.');}
   if(e.tell){if((e.windup??1)>1){e.windup!--;message(s,'Разлом расширяется. Ещё один ход, чтобы выйти за красное кольцо.');continue;}if(distance(p,e.tell)<=(e.phase===2?1:0))hurt(s,22,'Разлом Регента',true);else message(s,'Разлом ударил по пустому камню.');e.tell=undefined;e.aoeCooldown=4;continue;}
   if(los&&n<=5&&s.cycles%3===0&&e.aoeCooldown===0){e.tell={x:p.x,y:p.y};e.windup=e.phase===2?2:1;message(s,'Регент метит землю. На следующем ходу отойдите от красной печати!');continue;}
  }
  if(e.kind==='archer'&&los&&n<=5){if(e.tell){hurt(s,ENEMIES[e.kind].attack,'Рунный выстрел');e.tell=undefined;}else{e.tell={x:p.x,y:p.y};message(s,'Стрелок целится. Укройтесь за углом или оглушите его.');}continue;}
  if(e.kind==='archer')e.tell=undefined;
  if(e.kind==='scribe'&&n<=3&&los){hurt(s,7,'Стёртая строка',true);p.focus=Math.max(0,p.focus-4);addStatus(p.statuses,'weaken',3);
   if(n<3){const step=DIRS.map(d=>({x:e.x+d.x,y:e.y+d.y})).find(q=>distance(q,p)>n&&!solid(s,q.x,q.y)&&!occupied(s,q.x,q.y)&&distance(q,p)>0);if(step)Object.assign(e,step);}continue;}
  if(n===1){hurt(s,ENEMIES[e.kind].attack,ENEMIES[e.kind].name);continue;}
  const step=pathStep(s,e,p,e.id);if(step&&distance(step,p)>0)Object.assign(e,step);
 }
 if(s.zone===1&&s.cycles%4===2)message(s,'Вентиль шипит: следующая волна пара пройдёт через рельс у (9, 8).');
 if(s.zone===1&&s.cycles%4===3&&p.x===9&&p.y===8)hurt(s,10,'Горячий пар',true);
 if(hasStatus(p.statuses,'burn'))hurt(s,4,'Горение',true);
 p.focus=Math.min(p.maxFocus,p.focus+(hasStatus(p.statuses,'weaken')?0:2));p.statuses=p.statuses.map(v=>({...v,remaining:v.remaining-1})).filter(v=>v.remaining>0);
 if(p.hp<=0){s.mode='defeat';message(s,'Астэрна запомнила ещё одно имя. Вернитесь к последнему привалу.');}
}
function consume(s:State,item:string):Result {
 const p=s.player;if(!p.inventory[item]||!ITEMS[item]||ITEMS[item].type!=='consumable'||item==='bolts')return {ok:false,costTurn:false,message:'Нет подходящего предмета.'};
 if((item==='heal'||item==='full')&&p.hp===p.maxHp)return {ok:false,costTurn:false,message:'Здоровье уже полное.'};
 if(item==='focusTonic'&&p.focus===p.maxFocus)return {ok:false,costTurn:false,message:'Фокус уже полон.'};
 if(item==='cleanse'&&!p.statuses.some(v=>v.id==='burn'||v.id==='weaken'))return {ok:false,costTurn:false,message:'Нечего очищать.'};
 p.inventory[item]--;if(item==='heal')p.hp=Math.min(p.maxHp,p.hp+35);if(item==='full')p.hp=p.maxHp;if(item==='focusTonic')p.focus=Math.min(p.maxFocus,p.focus+20);
 if(item==='strength')addStatus(p.statuses,'strength',9);if(item==='haste'){addStatus(p.statuses,'haste',6);s.hasteQueue=1;}
 if(item==='cleanse')p.statuses=p.statuses.filter(v=>v.id!=='weaken'&&v.id!=='burn');
 return {ok:true,costTurn:true,message:`${ITEMS[item].name} использован.`,effect:'heal'};
}
function loot(s:State,f:ReturnType<typeof features>[number]):void {
 const p=s.player;if(f.items)for(const [id,n] of Object.entries(f.items)){p.inventory[id]=(p.inventory[id]??0)+n;if(id==='ring'){p.maxFocus+=10;p.focus=p.maxFocus;}}
 p.gold+=f.gold??0;zoneState(s).opened.push(f.id);
 if(f.kind==='rune')s.flags.forgottenRuneFound=true;
}
function interact(s:State,choice?:number|string):Result {
 const f=contextFeature(s),z=zoneState(s);if(!f)return {ok:false,costTurn:false,message:'Здесь не с чем взаимодействовать. Посмотрите на объект перед собой.'};
 const result:Result={ok:true,costTurn:true,message:f.name};
 if(f.kind==='exit'||f.kind==='back'){
  const next=f.to!;s.zone=next;const pos=f.kind==='back'?LEVELS[next].arrival:LEVELS[next].start;Object.assign(s.player,pos);s.player.facing=f.kind==='back'?2:0;s.hasteQueue=0;reveal(s);result.message=LEVELS[next].name;result.checkpoint=true;result.costTurn=false;return result;
 }
 if(f.kind==='door'){
  if(!s.player.inventory[f.requires!]&&!s.flags[f.requires!])return {ok:false,costTurn:false,message:`Нужно: ${ITEMS[f.requires!]?.name??(f.requires==='catPuzzle'?'три руны':f.requires==='sealSolved'?'восстановить печать':'совместить мост')}.`};
  z.opened.push(f.id);return {...result,message:`${f.name}: открыто.`,checkpoint:true};
 }
 if(f.kind==='secret'){
  if(f.requires&&!s.flags[f.requires])return {ok:false,costTurn:false,message:'Руна не отвечает. Антарион должен её расшифровать.'};
  loot(s,f);if(!s.secrets.includes(f.id))s.secrets.push(f.id);return {...result,message:'Искрик: Стена наконец решила сказать правду. Секрет открыт!',checkpoint:true,effect:'secret'};
 }
 if(f.kind==='chest'||f.kind==='key'||f.kind==='rune'){loot(s,f);return {...result,message:`${f.name}: ${Object.entries(f.items??{}).map(([id,n])=>`${ITEMS[id]?.name} ×${n}`).join(', ')}${f.gold?` · ${f.gold} монет`:''}.`,checkpoint:true,effect:'loot'};}
 if(f.kind==='note'){if(!s.notes.includes(f.id))s.notes.push(f.id);return {...result,message:f.text??'',costTurn:false,panel:'note'};}
 if(f.kind==='spring'){if(z.opened.includes(f.id))return {ok:false,costTurn:false,message:'Источник иссяк.'};z.opened.push(f.id);s.player.hp=s.player.maxHp;s.player.focus=s.player.maxFocus;return {...result,message:'Каменная чаша вернула силы. Больше воды нет.',checkpoint:true,effect:'heal'};}
 if(f.kind==='merchant')return {...result,message:'Бесса: Раз дошёл живым, значит, у тебя есть чем платить.',costTurn:false,panel:'shop'};
 if(f.kind==='antarion'){
  const first=!s.flags.antarionMet;s.flags.antarionMet=true;s.flags.antarionQuestAccepted=true;
  if(s.player.inventory.rune&&!s.flags.antarionQuestCompleted){s.flags.antarionQuestCompleted=true;s.flags.antarionSecretOpened=true;s.player.gold+=25;return {...result,message:'Антарион Музраэль: Руна прочитана. Проход в восточной стене библиотеки открыт.',panel:'antarion',checkpoint:true};}
  return {...result,message:first?'Антарион Музраэль: Солнце, древо, луна. А пропавшую руну ищи в синей книге соседнего зала.':'Антарион Музраэль: Печать ждёт. Я пока присмотрю за книгами.',panel:'antarion',costTurn:first,checkpoint:first};
 }
 if(f.kind==='runes'||f.kind==='seal'){
  const flag=f.kind==='runes'?'catPuzzle':'sealSolved';if(s.flags[flag])return {ok:false,costTurn:false,message:'Руны уже горят в верном порядке.'};
  if(typeof choice!=='number')return {...result,costTurn:false,panel:f.kind==='runes'?'runes':'seal',message:'Выберите знак. Подсказка записана неподалёку.'};
  z.runeInput.push(choice);if(z.runeInput[z.runeInput.length-1]!==[0,1,2][z.runeInput.length-1]){z.runeInput=[];return {...result,panel:f.kind==='runes'?'runes':'seal',message:'Неверный порядок. Печати погасли: попробуйте снова.'};}
  if(z.runeInput.length===3){s.flags[flag]=true;z.runeInput=[];return {...result,message:'Три печати вспыхнули. Путь открыт.',checkpoint:true,effect:'secret'};}
  return {...result,panel:f.kind==='runes'?'runes':'seal',message:`Верно. Горит печатей: ${z.runeInput.length}/3.`};
 }
 if(f.kind==='bridgeSwitch'){
  if(choice!=='rotate')return {...result,costTurn:false,panel:'bridge',message:'Северный рельс отмечен двумя засечками. Совместите мост с ним.'};
  z.bridge=(z.bridge+1)%3;if(z.bridge===2)s.flags.bridgeSolved=true;return {...result,panel:'bridge',message:z.bridge===2?'Мост совпал с северным рельсом. Шлюз короткого пути разблокирован.':`Мост в положении ${['0','I','II'][z.bridge]}.`,checkpoint:z.bridge===2};
 }
 if(f.kind==='pillar'){
  if(z.opened.includes(f.id))return {ok:false,costTurn:false,message:'Колонна уже связала часть силы Регента.'};z.opened.push(f.id);const boss=z.enemies.find(e=>e.kind==='boss');if(boss&&boss.hp>0){boss.hp=Math.max(1,boss.hp-18);boss.tell=undefined;addStatus(boss.statuses,'stun',1);}return {...result,message:'Колонна вспыхнула. Регент потерял 18 здоровья и сбился с удара.',effect:'spark'};
 }
 return {ok:false,costTurn:false,message:'Механизм спокоен.'};
}
export function act(s:State,a:Intent):Result {
 if(s.mode!=='playing')return {ok:false,costTurn:false,message:'Путь завершён.'};const p=s.player;let r:Result={ok:true,costTurn:true,message:''};
 if(a.type==='turn'){p.facing=(p.facing+a.delta+4)%4;r.costTurn=alertEnemies(s).length>0;}
 if(a.type==='move'){const d=DIRS[(p.facing+a.relative+4)%4],x=p.x+d.x,y=p.y+d.y;if(solid(s,x,y)||occupied(s,x,y))r={ok:false,costTurn:false,message:'Путь закрыт. F — осмотреть дверь или объект.'};else{p.x=x;p.y=y;}}
 if(a.type==='wait')r.message='Вы выжидаете. Фокус восстанавливается.';
 if(a.type==='equip'){if(!p.inventory[a.item]||ITEMS[a.item]?.type!=='weapon')r={ok:false,costTurn:false,message:'Такого оружия нет.'};else{p.equipped=a.item;r={ok:true,costTurn:false,message:`В руках: ${ITEMS[a.item].name}.`};}}
 if(a.type==='attack'||a.type==='cast'){
  const spell=a.type==='cast'?a.spell:p.equipped==='focus'?'spark':undefined;const def=spell?SPELLS[spell]:undefined;const ranged=p.equipped==='crossbow';const e=target(s,def?.range??(ranged?5:1));
  if(!e)r={ok:false,costTurn:false,message:'Нет цели в пределах прямой видимости и дальности.'};
  else if(def&&p.focus<def.cost)r={ok:false,costTurn:false,message:`Нужно ${def.cost} фокуса. R — выждать.`};
  else if(!def&&ranged&&!p.inventory.bolts)r={ok:false,costTurn:false,message:'Болты закончились. Выберите меч.'};
  else if(a.type==='cast'&&!def)r={ok:false,costTurn:false,message:'Неизвестное заклинание.'};
  else if(def){p.focus-=def.cost;const targets=spell==='fire'?zoneState(s).enemies.filter(q=>q.hp>0&&distance(q,e)<=1&&lineOfSight(s,e,q)):[e];for(const q of targets){r.damage=hit(s,q,def.damage,spell);if(spell==='fire')addStatus(q.statuses,'burn',3);if(spell==='echo'&&q.cooldown===0){addStatus(q.statuses,'stun',1);q.cooldown=3;q.tell=undefined;const d=DIRS[p.facing],x=q.x+d.x,y=q.y+d.y;if(!solid(s,x,y)&&!occupied(s,x,y))Object.assign(q,{x,y});}}r.effect=spell;}
  else{if(ranged)p.inventory.bolts--;r.damage=hit(s,e,ranged?12:p.equipped==='heavy'?23:p.equipped==='iron'?17:11);if(!ranged)p.focus=Math.min(p.maxFocus,p.focus+3);r.effect=ranged?'bolt':'sword';}
 }
 if(a.type==='use')r=consume(s,a.item);
 if(a.type==='interact')r=interact(s,a.choice);
 if(a.type==='buy'){
  const f=features(s).find(f=>f.kind==='merchant');const item=ITEMS[a.item],price=Math.ceil((item?.price??0)*(s.flags.discount?0.9:1));
  if(!f||distance(p,f)>1||!SHOP.includes(a.item)||!item)r={ok:false,costTurn:false,message:'Бесса слишком далеко.'};
  else if((item.type==='weapon'||item.type==='upgrade')&&p.inventory[a.item])r={ok:false,costTurn:false,message:'Уже куплено.'};
  else if(p.gold<price)r={ok:false,costTurn:false,message:'Недостаточно монет.'};
  else{p.gold-=price;p.inventory[a.item]=(p.inventory[a.item]??0)+(a.item==='bolts'?12:1);s.purchases[a.item]=(s.purchases[a.item]??0)+1;if(a.item==='armor')p.armor=5;r={ok:true,costTurn:true,message:`Куплено: ${item.name}.`,checkpoint:true,effect:'loot'};}
 }
 if(a.type==='negotiate'){
  if(!features(s).some(f=>f.kind==='merchant'&&distance(p,f)<=1))r={ok:false,costTurn:false,message:'Бесса слишком далеко.'};
  else if(s.flags.negotiated)r={ok:false,costTurn:false,message:'Бесса: Мы уже договорились.'};
  else{s.flags.negotiated=true;s.flags.discount=a.choice===1&&s.notes.includes('tradeNote');r={ok:true,costTurn:true,message:s.flags.discount?'Бесса: Уважаешь труд? Тогда скидка 10%.':'Бесса: Цена и так честная.',checkpoint:true};}
 }
 if(r.message)message(s,r.message);
 if(r.ok&&r.costTurn){s.turns++;const h=hasStatus(p.statuses,'haste');if(h&&s.hasteQueue===0){s.hasteQueue=1;}else{s.hasteQueue=0;if(s.mode==='playing')enemyTick(s);}}
 reveal(s);if(p.hp<=0)s.mode='defeat';if(s.flags.bossDefeated)r.checkpoint=true;return r;
}
