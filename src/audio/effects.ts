export class Sound {
 private ctx?:AudioContext;private ambient?:GainNode;enabled=true;volume=0.35;
 unlock(){if(!this.ctx){this.ctx=new AudioContext();this.ambient=this.ctx.createGain();this.ambient.gain.value=0;this.ambient.connect(this.ctx.destination);
  for(const frequency of [55,82.41,110.2]){const o=this.ctx.createOscillator();o.type='sine';o.frequency.value=frequency;const g=this.ctx.createGain();g.gain.value=0.035;o.connect(g);g.connect(this.ambient);o.start();}
 }void this.ctx.resume();this.update();}
 update(){if(this.ctx&&this.ambient)this.ambient.gain.setTargetAtTime(this.enabled?this.volume*0.35:0,this.ctx.currentTime,0.2);}
 play(kind:string){if(!this.ctx||!this.enabled)return;const c=this.ctx,t=c.currentTime,o=c.createOscillator(),g=c.createGain();const freq:Record<string,number>={sword:125,bolt:220,spark:650,fire:90,echo:160,heal:440,loot:750,secret:330,step:65,hurt:60};
 o.type=['spark','sword','fire','hurt'].includes(kind)?'sawtooth':'sine';o.frequency.setValueAtTime(freq[kind]??100,t);o.frequency.exponentialRampToValueAtTime((freq[kind]??100)*(kind==='heal'||kind==='secret'?2:0.4),t+0.18);g.gain.setValueAtTime(this.volume*0.13,t);g.gain.exponentialRampToValueAtTime(0.001,t+0.23);o.connect(g);g.connect(c.destination);o.start(t);o.stop(t+0.25);}
}
