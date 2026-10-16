/** RGB/HSV conversion for the local picker. No browser or network dependencies. */
export function hexToHsv(hex) {
  if (!/^#[0-9a-f]{6}$/i.test(hex)) throw new TypeError('Cor hexadecimal inválida.');
  const [r,g,b] = [1,3,5].map(i => parseInt(hex.slice(i,i+2),16)/255);
  const max = Math.max(r,g,b), min = Math.min(r,g,b), delta = max-min;
  let h = 0;
  if (delta) h = max === r ? ((g-b)/delta)%6 : max === g ? (b-r)/delta+2 : (r-g)/delta+4;
  return {h:(h*60+360)%360,s:max ? delta/max*100 : 0,v:max*100};
}
export function hsvToHex({h,s,v}) {
  if (![h,s,v].every(Number.isFinite)) throw new TypeError('Cor inválida.');
  h = ((h%360)+360)%360; s = Math.min(100,Math.max(0,s))/100; v = Math.min(100,Math.max(0,v))/100;
  const chroma=v*s, x=chroma*(1-Math.abs((h/60)%2-1)), m=v-chroma;
  const rgb=h<60?[chroma,x,0]:h<120?[x,chroma,0]:h<180?[0,chroma,x]:h<240?[0,x,chroma]:h<300?[x,0,chroma]:[chroma,0,x];
  return '#'+rgb.map(c=>Math.round((c+m)*255).toString(16).padStart(2,'0')).join('');
}
export function planeColor(hue,x,y,width,height) {
  if (![x,y,width,height].every(Number.isFinite) || width<=0 || height<=0) return null;
  return hsvToHex({h:hue,s:Math.min(1,Math.max(0,x/width))*100,v:(1-Math.min(1,Math.max(0,y/height)))*100});
}

/** Named choices keep the common light and dark colors one click away. */
export const COLOR_FAMILIES = Object.freeze([
  {name:'Cinza',colors:['#ffffff','#72777d','#000000']},
  {name:'Vermelho',colors:['#fbe5e5','#b32424','#761919']},
  {name:'Amarelo',colors:['#fff4b8','#f0c000','#705800']},
  {name:'Verde',colors:['#e1f2e7','#246342','#153f2a']},
  {name:'Azul',colors:['#eaf3ff','#3366cc','#1b3a78']},
  {name:'Violeta',colors:['#f0e9ff','#6854a4','#3f306b']}
].map(family=>Object.freeze({...family,colors:Object.freeze(family.colors)})));

export function hexToHsl(hex) {
  const {h}=hexToHsv(hex);
  const values=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255);
  const max=Math.max(...values),min=Math.min(...values),delta=max-min,l=(max+min)/2;
  return {h,s:delta?delta/(1-Math.abs(2*l-1))*100:0,l:l*100};
}

export function hslToHex({h,s,l}) {
  if (![h,s,l].every(Number.isFinite)) throw new TypeError('Cor inválida.');
  h=((h%360)+360)%360;s=Math.min(100,Math.max(0,s))/100;l=Math.min(100,Math.max(0,l))/100;
  const chroma=(1-Math.abs(2*l-1))*s,x=chroma*(1-Math.abs((h/60)%2-1)),m=l-chroma/2;
  const rgb=h<60?[chroma,x,0]:h<120?[x,chroma,0]:h<180?[0,chroma,x]:h<240?[0,x,chroma]:h<300?[x,0,chroma]:[chroma,0,x];
  return '#'+rgb.map(channel=>Math.round((channel+m)*255).toString(16).padStart(2,'0')).join('');
}

/** The spectrum shows every color family horizontally and fades to gray below.
 * Its colors have middle lightness. A separate light/dark control covers the
 * rest of the gamut without hiding any color family behind another slider. */
export function spectrumColor(x,y,width,height) {
  if (![x,y,width,height].every(Number.isFinite) || width<=0 || height<=0) return null;
  return hslToHex({h:Math.min(1,Math.max(0,x/width))*360,s:(1-Math.min(1,Math.max(0,y/height)))*100,l:50});
}

export function spectrumKey(hsl,key,largeStep=false) {
  const step=largeStep?10:2;
  if (key==='ArrowLeft') return {...hsl,h:(hsl.h-step+360)%360,l:50};
  if (key==='ArrowRight') return {...hsl,h:(hsl.h+step)%360,l:50};
  if (key==='ArrowUp') return {...hsl,s:Math.min(100,hsl.s+step),l:50};
  if (key==='ArrowDown') return {...hsl,s:Math.max(0,hsl.s-step),l:50};
  return null;
}
