import {chromium} from '@playwright/test';
import fs from 'node:fs/promises';
const recording=JSON.parse(await fs.readFile('output/campaign-all.json','utf8'));
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader']});const page=await browser.newPage({viewport:{width:1366,height:768}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.addInitScript(()=>localStorage.setItem('pg:runes-and-ruines:settings:v1',JSON.stringify({sound:false,fast:true,low:true})));await page.goto('http://127.0.0.1:5173');await page.getByRole('button',{name:/Войти в Астэрну/}).click();await page.getByRole('button',{name:/Пусть стены/}).click();let prevZone=0,bossShot=false;
for(let i=0;i<recording.actions.length;i++){
 const a=recording.actions[i];await page.evaluate(a=>{const panel=window.__GAME__.panel;if(panel&&!['use','equip','buy','negotiate','interact'].includes(a.type))window.__QA__.dispatch({type:'panel',panel:''});window.__QA__.dispatch(a);},a);await page.waitForTimeout(65);
 const snap=await page.evaluate(()=>({zone:window.__GAME__.state.zone,mode:window.__GAME__.state.mode,boss:window.__GAME__.state.zones[2].enemies.find(e=>e.kind==='boss')}));
 if(snap.zone!==prevZone){await page.screenshot({path:`output/level-${snap.zone+1}.png`});prevZone=snap.zone;}
 if(snap.boss.alert&&!bossShot){await page.screenshot({path:'output/boss.png'});bossShot=true;}
 if(i%100===0)console.log('REPLAY',i,'/',recording.actions.length);
}
const actual=await page.evaluate(()=>structuredClone(window.__GAME__.state));if(actual.mode!=='victory')throw Error(`Replay did not win: ${JSON.stringify(actual.log)}`);
for(const field of ['turns','cycles','kills','seed','secrets','flags','player','purchases'])if(JSON.stringify(actual[field])!==JSON.stringify(recording.state[field]))throw Error(`Deterministic browser divergence: ${field}`);
await page.screenshot({path:'output/victory.png'});console.log(JSON.stringify({outcome:actual.mode,turns:actual.turns,kills:actual.kills,secrets:actual.secrets,quests:actual.flags.antarionQuestCompleted,errors,stats:await page.evaluate(()=>window.__GAME__.stats())}));await browser.close();
