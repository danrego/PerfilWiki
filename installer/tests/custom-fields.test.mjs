import test from 'node:test';
import assert from 'node:assert/strict';
import {customFieldItems,changeCustomItem,changeCustomLayout,addCustomItem,removeCustomItem} from '../src/custom-fields.mjs';

test('editing one legacy value preserves its shape and independent placement',()=>{
 const field={label:'Alma mater',value:'[[Universidade George Washington]]',placement:'top'};
 const next=changeCustomItem(field,0,'[[Instituto de Tecnologia de Massachusetts|MIT]]');
 assert.deepEqual(next,{...field,value:'[[Instituto de Tecnologia de Massachusetts|MIT]]'});
 assert.equal(Object.hasOwn(next,'values'),false);assert.equal(field.value,'[[Universidade George Washington]]');
});

test('adding an item converts the legacy row once while keeping every prior value and choice',()=>{
 const field={label:'Alma mater',value:'[[Universidade George Washington|GWU]]',placement:'cards'};
 const group=addCustomItem(field);
 assert.deepEqual(group,{label:'Alma mater',values:['[[Universidade George Washington|GWU]]',''],layout:'inline',separator:'pipe',placement:'cards'});
 assert.equal(Object.hasOwn(group,'value'),false);
 const edited=changeCustomItem(group,1,'[[Instituto de Tecnologia de Massachusetts|MIT]]');
 assert.deepEqual(customFieldItems(edited),['[[Universidade George Washington|GWU]]','[[Instituto de Tecnologia de Massachusetts|MIT]]']);
 assert.deepEqual(group.values,['[[Universidade George Washington|GWU]]','']);
});

test('eight draft items are the limit even when some inputs are still blank',()=>{
 const field={label:'Formação',values:Array.from({length:8},()=>''),layout:'bullets',separator:'dot'};
 assert.equal(addCustomItem(field),field);
 for(const index of [-1,8,1.5]) {assert.equal(changeCustomItem(field,index,'X'),field);assert.equal(removeCustomItem(field,index),field);}
});

test('removing an item keeps grouped layout and separator while preserving the final input',()=>{
 const field={label:'Alma mater',values:['GWU','MIT'],layout:'lines',separator:'space',placement:'top-cards'};
 const next=removeCustomItem(field,0);
 assert.deepEqual(next,{...field,values:['MIT']});assert.equal(removeCustomItem(next,0),next);
 assert.deepEqual(field.values,['GWU','MIT']);assert.equal(changeCustomItem(field,0,null),field);
});

test('each label can select its layout before adding a value or a second item',()=>{
 const label={label:'Pesquisadora',placement:'top'};
 assert.deepEqual(changeCustomLayout(label,'bullets'),{...label,values:[''],layout:'bullets',separator:'pipe'});
 const legacy={label:'Alma mater',value:'[[GWU]]',placement:'top'};
 const grouped=changeCustomLayout(legacy,'lines');
 assert.deepEqual(grouped,{label:'Alma mater',values:['[[GWU]]'],placement:'top',layout:'lines',separator:'pipe'});
 assert.deepEqual(legacy,{label:'Alma mater',value:'[[GWU]]',placement:'top'});
 const withSeparator={...grouped,separator:'dot'};
 assert.deepEqual(changeCustomLayout(withSeparator,'inline'),{...withSeparator,layout:'inline'});
 assert.equal(changeCustomLayout(label,'columns'),label);
});
