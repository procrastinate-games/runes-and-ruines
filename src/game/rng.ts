import type { State } from './types';
export function random(s:State):number {s.seed=(Math.imul(1664525,s.seed)+1013904223)>>>0;return s.seed/4294967296;}
