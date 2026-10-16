import test from 'node:test';
import assert from 'node:assert/strict';
import {COLOR_FAMILIES,hexToHsv,hsvToHex,planeColor,hexToHsl,hslToHex,spectrumColor,spectrumKey} from '../src/color.mjs';

test('color picker preserves exact RGB values across HSV conversion',()=>{
 const samples=['#3366cc','#faf7ef','#000000','#ffffff','#ff0000','#00ff00','#0000ff'];
 for(let r=0;r<=255;r+=17)for(let g=0;g<=255;g+=17)for(let b=0;b<=255;b+=17)samples.push('#'+[r,g,b].map(c=>c.toString(16).padStart(2,'0')).join(''));
 for(const hex of samples)assert.equal(hsvToHex(hexToHsv(hex)),hex);
});
test('picker handles circular hue and clamps saturation and brightness',()=>{
 assert.equal(hsvToHex({h:360,s:100,v:100}),'#ff0000');
 assert.equal(hsvToHex({h:-120,s:100,v:100}),'#0000ff');
 assert.equal(hsvToHex({h:120,s:120,v:120}),'#00ff00');
 assert.equal(hsvToHex({h:120,s:-1,v:100}),'#ffffff');
 for(const hex of ['red','#fff','#3366cc\n',null])assert.throws(()=>hexToHsv(hex),TypeError);
 assert.throws(()=>hsvToHex({h:NaN,s:100,v:100}),TypeError);
});
test('color plane pointer coordinates map to white, hue and black within bounds',()=>{
 assert.equal(planeColor(120,0,0,100,100),'#ffffff');
 assert.equal(planeColor(120,100,0,100,100),'#00ff00');
 assert.equal(planeColor(120,50,100,100,100),'#000000');
 assert.equal(planeColor(120,-10,-10,100,100),'#ffffff');
 assert.equal(planeColor(120,200,200,100,100),'#000000');
 assert.equal(planeColor(120,0,0,0,100),null);
});
test('the visible spectrum covers every family and fades toward neutral gray without a hue slider',()=>{
 for(const [x,hex]of[[0,'#ff0000'],[100,'#ffff00'],[200,'#00ff00'],[300,'#00ffff'],[400,'#0000ff'],[500,'#ff00ff'],[600,'#ff0000']]){
  assert.equal(spectrumColor(x,0,600,100),hex);
  assert.equal(spectrumColor(x,100,600,100),'#808080');
 }
 assert.equal(spectrumColor(400,50,600,100),'#4040bf');
 assert.equal(spectrumColor(-50,-50,600,100),'#ff0000');
 assert.equal(spectrumColor(1000,150,600,100),'#808080');
 for(const values of [[0,0,0,100],[0,0,100,0],[NaN,0,100,100],[0,0,Infinity,100]])assert.equal(spectrumColor(...values),null);
});
test('color lightness can cover black to white and preserves exact existing RGB values',()=>{
 const samples=['#3366cc','#faf7ef','#000000','#ffffff','#012345','#fedcba'];
 for(let r=0;r<=255;r+=17)for(let g=0;g<=255;g+=17)for(let b=0;b<=255;b+=17)samples.push('#'+[r,g,b].map(c=>c.toString(16).padStart(2,'0')).join(''));
 for(const hex of samples)assert.equal(hslToHex(hexToHsl(hex)),hex);
 assert.equal(hslToHex({h:120,s:100,l:0}),'#000000');
 assert.equal(hslToHex({h:120,s:100,l:100}),'#ffffff');
 assert.equal(hslToHex({h:-120,s:100,l:50}),'#0000ff');
 assert.equal(hslToHex({h:120,s:120,l:150}),'#ffffff');
 assert.throws(()=>hslToHex({h:NaN,s:100,l:50}),TypeError);
});
test('named swatches provide frozen light, medium and dark choices with exact hex colors',()=>{
 assert.equal(COLOR_FAMILIES.length,6);
 assert.equal(new Set(COLOR_FAMILIES.flatMap(f=>f.colors)).size,18);
 for(const family of COLOR_FAMILIES){
  assert.ok(family.name);assert.equal(family.colors.length,3);
  assert.ok(Object.isFrozen(family));assert.ok(Object.isFrozen(family.colors));
  for(const hex of family.colors)assert.match(hex,/^#[0-9a-f]{6}$/);
  const values=family.colors.map(hex=>hexToHsl(hex).l);
  assert.ok(values[0]>values[1]&&values[1]>values[2]);
 }
});
test('the spectrum keyboard traverses color families and intensity in small or large steps',()=>{
 const start={h:0,s:50,l:95};
 assert.deepEqual(spectrumKey(start,'ArrowLeft'),{h:358,s:50,l:50});
 assert.deepEqual(spectrumKey(start,'ArrowRight',true),{h:10,s:50,l:50});
 assert.deepEqual(spectrumKey(start,'ArrowUp'),{h:0,s:52,l:50});
 assert.deepEqual(spectrumKey(start,'ArrowDown',true),{h:0,s:40,l:50});
 assert.equal(spectrumKey({...start,s:99},'ArrowUp',true).s,100);
 assert.equal(spectrumKey({...start,s:1},'ArrowDown',true).s,0);
 assert.equal(spectrumKey(start,'Enter'),null);
 assert.deepEqual(start,{h:0,s:50,l:95});
});
