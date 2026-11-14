import {describe,it,expect} from 'vitest';
import {createGame,act} from '../src/game/engine';
describe('deterministic action contract',()=>{
 it('starts with Georges, 80 HP, three zones and a stable seed',()=>{const s=createGame(); expect(s.player.name).toBe('Жорж Феанор Тихо');expect(s.player.hp).toBe(80);expect(s.zones).toHaveLength(3);expect(s.seed).toBe(createGame().seed)});
 it('solid wall does not consume a turn',()=>{const s=createGame();s.player.x=2;s.player.y=14;s.player.facing=3;const before=s.turns;expect(act(s,{type:'move',relative:0}).ok).toBe(false);expect(s.turns).toBe(before);expect(s.player.x).toBe(2)});
 it('four free safe rotations restore facing without enemy updates',()=>{const s=createGame();s.zones[0].enemies=[];for(let i=0;i<4;i++)act(s,{type:'turn',delta:1});expect(s.player.facing).toBe(0);expect(s.cycles).toBe(0)});
 it('invalid ranged attacks spend neither ammunition nor focus',()=>{const s=createGame();s.player.equipped='crossbow';s.player.facing=3;s.player.inventory.bolts=9;const f=s.player.focus;expect(act(s,{type:'attack'}).ok).toBe(false);expect(s.player.inventory.bolts).toBe(9);expect(act(s,{type:'cast',spell:'spark'}).ok).toBe(false);expect(s.player.focus).toBe(f);expect(s.turns).toBe(0)});
 it('haste never exceeds two actions per enemy update',()=>{const s=createGame();s.zones[0].enemies=[];s.player.statuses=[{id:'haste',remaining:3}];for(let i=0;i<6;i++)act(s,{type:'wait'});expect(s.cycles).toBe(3);expect(s.player.statuses).toEqual([])});
 it('identical actions reproduce all game state',()=>{const a=createGame(),b=createGame();for(let i=0;i<10;i++){act(a,{type:'wait'});act(b,{type:'wait'})}expect(a).toEqual(b)});
});
