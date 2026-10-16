import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const localRequire = createRequire(new URL('../package.json', import.meta.url));
const esbuild = createRequire(localRequire.resolve('vite/package.json'))('esbuild');
const result = await esbuild.build({entryPoints:[new URL('../src/App.jsx',import.meta.url).pathname],bundle:true,write:false,platform:'node',format:'cjs',packages:'external',loader:{'.css':'empty'},define:{'import.meta.env.BASE_URL':'"./"'},logLevel:'silent'});
function screen(desktop) {
  const module={exports:{}};
  vm.runInNewContext(result.outputFiles[0].text,{module,exports:module.exports,require:localRequire,window:{matchMedia:()=>({matches:desktop}),location:{hostname:'localhost'}},console,Intl,Date,URL,Set,Map});
  return renderToStaticMarkup(React.createElement(module.exports.App));
}

test('the first of two steps opens customization with all account controls in the profile accordion',()=>{
  const html=screen(true);
  assert.match(html,/ETAPA 1 DE 2/);
  assert.doesNotMatch(html,/ETAPA [123] DE 3|class="account-screen"|Personalizar meu painel/);
  const sidebar=html.split('<aside id="appearance-settings"')[1].split('</aside>')[0];
  for(const id of ['username','display-name','profile-location','timezone','profile-placement','name-placement','location-placement','account-created-placement','profile-photo','photo-placement']) assert.ok(sidebar.includes('id="'+id+'"'),id);
  assert.match(sidebar,/aria-controls="settings-profile"[^>]*><span>Seu perfil<\/span>/);
  assert.match(sidebar,/aria-expanded="true" aria-controls="settings-profile"/);
  assert.doesNotMatch(sidebar,/<div class="settings-group-panel" id="settings-profile" hidden/);
  assert.match(sidebar,/\[\[Belo Horizonte\]\]/);
  assert.match(sidebar,/\[\[História do Brasil\|História\]\]/);
  assert.match(html,/Preparar instalação/);
  const nav=html.split('<nav class="stepper"')[1].split('</nav>')[0];
  assert.equal((nav.match(/class="step-number"/g)||[]).length,2);
});

test('mobile starts with the compact profile accordion closed while keeping the real preview visible',()=>{
  const html=screen(false);
  assert.match(html,/aria-expanded="false" aria-controls="settings-profile"/);
  assert.match(html,/<div class="settings-group-panel" id="settings-profile" hidden=""/);
  assert.match(html,/<iframe[^>]+local-preview\/frame.html/);
  assert.match(html,/Alinhamento do nome de exibição/);
});


test('profile controls place each field independently and offer the inline layout and five columns',()=>{
  const html=screen(true);
  for(const id of ['name-placement','location-placement','account-created-placement']) {
    const select=html.split('id="'+id+'"')[1].split('</select>')[0];
    for(const value of ['inherit','activity','cards','both','hidden','top','top-activity','top-cards','all']) assert.ok(select.includes('value="'+value+'"'),id+': '+value);
  }
  assert.doesNotMatch(html,/id="profile-details-layout"/);
  assert.match(html,/value="5">5 colunas/);
  assert.match(html,/prévia é ilustrativa/);
  assert.match(html,/Posição padrão das informações/);
});

test('the shared per-field selector reports the chosen placement through its actual handler',()=>{
  const module={exports:{}};
  vm.runInNewContext(result.outputFiles[0].text,{module,exports:module.exports,require:name=>name==='react'?{...React,useContext:context=>context._currentValue}:localRequire(name),window:{matchMedia:()=>({matches:true}),location:{hostname:'localhost'}},console,Intl,Date,URL,Set,Map});
  const changes=[];
  const field=module.exports.PlacementSelect({id:'row-placement',label:'Mostrar informação 1',onChange:value=>changes.push(value)});
  const select=field.props.children[1];
  assert.equal(select.props.value,'inherit');
  for(const value of ['cards','activity','both','hidden','inherit']) select.props.onChange({target:{value}});
  assert.deepEqual(changes,['cards','activity','both','hidden','inherit']);
});


test('integrated is the default layout while prior grouped and separate layouts remain available',()=>{
  const html=screen(true);
  assert.match(html,/Caixas na atividade/);
  assert.match(html,/Blocos juntos/);
  assert.match(html,/Separados/);
  assert.match(html,/type="radio" name="layout" checked=""/);
  assert.doesNotMatch(html,/<legend>Ordem dos blocos<\/legend>/);
  assert.match(html,/Na atividade/);
  assert.doesNotMatch(html,/cabeçalho/i);
  assert.match(html,/Em todas as áreas/);
});


function appExports() {
  const module={exports:{}};
  vm.runInNewContext(result.outputFiles[0].text,{module,exports:module.exports,require:name=>name==='react'?{...React,useContext:context=>context._currentValue}:localRequire(name),window:{matchMedia:()=>({matches:true}),location:{hostname:'localhost'}},console,Intl,Date,URL,Set,Map});
  return module.exports;
}
function elements(value) {
  if(Array.isArray(value))return value.flatMap(elements);
  if(!React.isValidElement(value))return [];
  return [value,...elements(value.props.children)];
}

test('the actual custom-field handlers add linked items, change their layout and remove items independently',()=>{
  const {CustomFieldEditor}=appExports();
  let field={label:'Alma mater',value:'[[Universidade George Washington|GWU]]',placement:'top'};
  const render=()=>CustomFieldEditor({field,index:0,invalid:false,onChange:next=>{field=next;},onRemove:()=>{}});
  const find=predicate=>elements(render()).find(predicate);
  find(node=>node.type==='button'&&node.props.children==='+ Adicionar item').props.onClick();
  assert.deepEqual(JSON.parse(JSON.stringify(field.values)),['[[Universidade George Washington|GWU]]','']);
  assert.equal(Object.hasOwn(field,'value'),false);assert.equal(field.placement,'top');
  find(node=>node.type==='input'&&node.props.id==='custom-field-value-0-1').props.onChange({target:{value:'[[Instituto de Tecnologia de Massachusetts|MIT]]'}});
  find(node=>node.type==='select'&&node.props.id==='custom-field-layout-0').props.onChange({target:{value:'bullets'}});
  assert.equal(field.layout,'bullets');assert.equal(field.values[1],'[[Instituto de Tecnologia de Massachusetts|MIT]]');
  assert.equal(find(node=>node.type==='select'&&node.props.id==='custom-field-separator-0'),undefined);
  find(node=>node.type==='button'&&node.props['aria-label']==='Remover item 1 da informação 1').props.onClick();
  assert.deepEqual(JSON.parse(JSON.stringify(field.values)),['[[Instituto de Tecnologia de Massachusetts|MIT]]']);
  assert.equal(field.layout,'bullets');
  assert.equal(find(node=>node.type==='button'&&node.props['aria-label']==='Remover item 1 da informação 1').props.disabled,true);
});

test('the profile sidebar offers name size and an explicit optional local clock without the old ambiguous caption',()=>{
  const html=screen(true);
  const select=html.split('id="name-font-size"')[1].split('</select>')[0];
  for(const size of [16,20,24,28,32,36])assert.ok(select.includes('value="'+size+'"'));
  assert.match(select,/value="24" selected=""/);
  assert.match(html,/Mostrar hora local/);assert.doesNotMatch(html,/id="local-time-placement"/);
  const toolbar=html.split('<div class="preview-toolbar">')[1].split('</div>')[0];
  assert.equal(toolbar,'<span>PRÉVIA DO SEU PERFIL</span>');
});

test('name formatting and information layout stay beside their profile fields instead of panel layout',()=>{
  const html=screen(true);
  const profile=html.split('id="settings-profile"')[1].split('<section class="settings-group"')[0];
  const layout=html.split('id="settings-layout"')[1].split('<section class="settings-group"')[0];
  for(const id of ['display-name','name-font-size','profile-location']) assert.ok(profile.includes('id="'+id+'"'),id);
  assert.match(profile,/Alinhamento do nome de exibição/);
  assert.doesNotMatch(layout,/name-font-size|profile-details-layout|name-alignment/);
  assert.match(layout,/Alinhamento dos contadores/);
  assert.ok(profile.indexOf('id="name-font-size"')<profile.indexOf('id="name-placement"'));
  assert.doesNotMatch(profile,/id="profile-details-layout"/);
});

test('alignment icons expose exclusive named choices and pass the selected value to the actual handler',()=>{
  const {AlignmentControl}=appExports();
  const changes=[];
  const control=AlignmentControl({name:'profile-align',label:'Alinhamento do nome',value:'center',onChange:value=>changes.push(value)});
  const nodes=elements(control),radios=nodes.filter(node=>node.type==='input');
  assert.deepEqual(radios.map(node=>node.props.value),['left','center','right']);
  assert.deepEqual(radios.map(node=>node.props.checked),[false,true,false]);
  assert.ok(radios.every(node=>node.props.type==='radio'&&node.props.name==='profile-align'));
  const html=renderToStaticMarkup(control);
  for(const label of ['À esquerda','Centralizado','À direita']) assert.ok(html.includes(label));
  assert.equal((html.match(/<svg[^>]*aria-hidden="true"/g)||[]).length,3);
  for(const radio of radios)radio.props.onChange();
  assert.deepEqual(changes,['left','center','right']);
});


test('local time and timezone stay with the location before additional information',()=>{
  const html=screen(true),location=html.indexOf('id="profile-location"'),clock=html.indexOf('class="field local-time-field"'),zone=html.indexOf('id="timezone"'),info=html.indexOf('id="custom-fields-title"');
  assert.ok(location<clock&&clock<zone&&zone<info);
  assert.equal((html.match(/id="timezone"/g)||[]).length,1);
  assert.doesNotMatch(html,/cabeçalho/i);
});

test('the profile photo offers only top, activity, both or hidden while its handler uses exact values',()=>{
  const {PhotoPlacementSelect}=appExports(),changes=[];
  const field=PhotoPlacementSelect({onChange:value=>changes.push(value)}),select=field.props.children[1];
  assert.equal(select.props.value,'top');
  assert.deepEqual(select.props.children.map(option=>option.props.value),['top','activity','top-activity','hidden']);
  for(const value of ['top','activity','top-activity','hidden'])select.props.onChange({target:{value}});
  assert.deepEqual(changes,['top','activity','top-activity','hidden']);
  const html=renderToStaticMarkup(field);
  assert.match(html,/No topo, padrão/);assert.match(html,/Topo e atividade/);assert.doesNotMatch(html,/Nas caixas|Em todas as áreas|value="all"/);
});

test('optional cover and background controls stay inside the top profile settings',()=>{
  const html=screen(true),top=html.split('class="profile-top-settings"')[1].split('<fieldset class="destination-field"')[0];
  assert.match(top,/id="profile-cover"/);assert.match(top,/Imagem de capa do Wikimedia Commons/);
  assert.match(top,/Cor de fundo do topo/);assert.match(top,/value="#ffffff"/);
});


test('each label has its own information layout even before values are typed',()=>{
 const {CustomFieldEditor}=appExports(),changes=[];
 const tree=CustomFieldEditor({field:{label:'Pesquisadora',value:''},index:1,onChange:field=>changes.push(field),onRemove:()=>{}});
 const select=elements(tree).find(node=>node.type==='select'&&node.props.id==='custom-field-layout-1');
 assert.ok(select);assert.equal(select.props['aria-label'],'Disposição da informação 2');
 select.props.onChange({target:{value:'lines'}});
 assert.deepEqual(JSON.parse(JSON.stringify(changes[0])),{label:'Pesquisadora',values:[''],layout:'lines',separator:'pipe'});
 const html=renderToStaticMarkup(tree);assert.match(html,/Disposição das informações/);assert.match(html,/opcional/);
});

test('the Commons photo provides a direct upload link without embedding an upload flow',()=>{
 const html=screen(true);
 assert.match(html,/<a href="https:\/\/commons\.wikimedia\.org\/wiki\/Special:UploadWizard\?uselang=pt-br" target="_blank" rel="noopener noreferrer">Envie uma foto<\/a>/);
 assert.match(html,/Ainda não tem uma foto no Commons/);
 assert.doesNotMatch(html,/type="file"/);
 assert.match(html,/Mostrar estatutos/);
});

test('photo alignment has its own icon group beside photo controls with left selected initially',()=>{
  const html=screen(true),photo=html.indexOf('id="profile-photo"'),alignment=html.indexOf('class="photo-format-controls"'),placement=html.indexOf('id="photo-placement"');
  assert.ok(photo<alignment&&alignment<placement);
  const group=html.slice(alignment,placement);
  assert.match(group,/Alinhamento da foto/);
  assert.equal((group.match(/type="radio" name="photo-alignment"/g)||[]).length,3);
  assert.match(group,/name="photo-alignment"[^>]*checked=""[^>]*value="left"/);
  assert.doesNotMatch(group,/name="name-alignment"|name="alignment"/);
});
