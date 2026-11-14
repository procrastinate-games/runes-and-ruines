import {chromium} from '@playwright/test';
import fs from 'node:fs/promises';
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader']});
const page=await browser.newPage({viewport:{width:1366,height:768}});const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
await fs.mkdir('output/russian-review',{recursive:true});await page.goto('http://127.0.0.1:5173');await page.getByRole('button',{name:/Войти в Астэрну/}).click();await page.screenshot({path:'output/russian-review/intro.png'});await page.getByRole('button',{name:/Пусть стены/}).click();
const initial=await page.evaluate(()=>structuredClone(window.__GAME__.state));
async function show(panel,zone=0){await page.evaluate(({initial,panel,zone})=>{const s=structuredClone(initial);s.zone=zone;s.zones.forEach(z=>z.enemies=[]);s.player.gold=222;s.player.inventory={sword:1,iron:1,heavy:1,crossbow:1,focus:1,bolts:21,heal:2,full:1,strength:1,focusTonic:1,haste:1,cleanse:1,copper:1,mineKey:1,rune:1,ring:1};s.flags.forgottenRuneFound=true;if(zone===1){s.player.x=3;s.player.y=14;s.player.facing=1;}if(zone===2){s.player.x=9;s.player.y=5;s.player.facing=1;}window.__QA__.replace(s,panel);}, {initial,panel,zone});}
for(const panel of ['inventory','journal','help','shop','bridge','antarion']){
 await show(panel,panel==='shop'||panel==='bridge'?1:panel==='antarion'?2:0);await page.screenshot({path:`output/russian-review/desktop-${panel}.png`});
}
await show('');await page.getByRole('button',{name:/Огненная печать/}).count().then(n=>{if(n!==1)throw Error('Full spell name missing from accessible label')});
for(const width of [844,640]){await page.setViewportSize({width,height:width===844?390:360});for(const panel of ['','inventory','shop','help','journal']){await show(panel,panel==='shop'?1:0);await page.screenshot({path:`output/russian-review/mobile-${width}-${panel||'hud'}.png`});const overflow=await page.evaluate(()=>({page:document.documentElement.scrollWidth>innerWidth,panel:[...document.querySelectorAll('.panel')].some(p=>p.scrollWidth>p.clientWidth+2)}));if(overflow.page||overflow.panel)throw Error(`Horizontal overflow: ${width} ${panel} ${JSON.stringify(overflow)}`);}}
await page.setViewportSize({width:960,height:600});await page.reload();await page.screenshot({path:'output/russian-review/cover.png'});if(errors.length)throw Error(JSON.stringify(errors));console.log(JSON.stringify({screens:'desktop, 844x390, 640x360',errors,overflow:false}));await browser.close();
