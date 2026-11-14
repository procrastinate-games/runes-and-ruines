import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader']});
const page=await browser.newPage({viewport:{width:1366,height:768}});const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
await page.goto(process.argv[2]??'http://127.0.0.1:5173');await page.waitForTimeout(1000);await fs.mkdir('output',{recursive:true});await page.screenshot({path:'output/title.png'});console.log('TITLE',await page.evaluate(()=>JSON.parse(window.render_game_to_text()).mode));
await page.getByRole('button',{name:/Войти в Астэрну/}).click();await page.getByRole('button',{name:/Пусть стены/}).click();await page.waitForTimeout(300);await page.screenshot({path:'output/gameplay.png'});console.log('STATE',await page.evaluate(()=>window.render_game_to_text()));console.log('RENDER',await page.evaluate(()=>window.__GAME__.stats()));console.log('ERRORS',errors);
await page.keyboard.press('Tab');await page.screenshot({path:'output/inventory.png'});await page.keyboard.press('Escape');await page.setViewportSize({width:844,height:390});await page.screenshot({path:'output/mobile.png'});await page.setViewportSize({width:390,height:844});await page.screenshot({path:'output/portrait.png'});await browser.close();
