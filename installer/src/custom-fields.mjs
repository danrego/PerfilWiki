/** Local draft operations. Values are validated by the shared ProfileFields module before export. */
export function customFieldItems(field) {
  return Array.isArray(field.values) ? field.values : [typeof field.value === 'string' ? field.value : ''];
}
export function customFieldItemColors(field) {
  return Array.isArray(field.values)
    ? field.values.map((_value,index)=>Array.isArray(field.valueColors) ? field.valueColors[index] || '' : '')
    : [field.valueColor || ''];
}
export function changeCustomItemColor(field,index,color) {
  const items=customFieldItems(field);
  if(!Number.isInteger(index)||index<0||index>=items.length||typeof color!=='string'||(color!==''&&!/^#[0-9a-f]{6}$/i.test(color)))return field;
  const chosen=color.toLowerCase();
  if(!Array.isArray(field.values))return {...field,valueColor:chosen};
  return {...field,valueColors:customFieldItemColors(field).map((current,currentIndex)=>currentIndex===index?chosen:current)};
}
function groupedField(field) {
  const {value,valueColor,valueColors,...group}=field;
  const colors=Array.isArray(field.valueColors)||Object.hasOwn(field,'valueColor') ? {valueColors:customFieldItemColors(field)} : {};
  return {...group,values:[...customFieldItems(field)],...colors};
}
export function changeCustomItem(field, index, value) {
  const items=customFieldItems(field);
  if (!Number.isInteger(index) || index<0 || index>=items.length || typeof value!=='string') return field;
  if (!Array.isArray(field.values)) return {...field,value};
  return {...field,values:items.map((item,current)=>current===index?value:item)};
}
export function changeCustomLayout(field, layout) {
  if (!['inline', 'lines', 'bullets'].includes(layout)) return field;
  return {...groupedField(field),layout,separator:field.separator || 'pipe'};
}
export function addCustomItem(field) {
  const items=customFieldItems(field);
  if(items.length>=8)return field;
  const group=groupedField(field);
  return {...group,values:[...items,''],...(group.valueColors ? {valueColors:[...group.valueColors,'']} : {}),layout:field.layout || 'inline',separator:field.separator || 'pipe'};
}
export function removeCustomItem(field,index) {
  const items=customFieldItems(field);
  if(!Array.isArray(field.values)||items.length<=1||!Number.isInteger(index)||index<0||index>=items.length)return field;
  return {...field,values:items.filter((_item,current)=>current!==index),...(Array.isArray(field.valueColors) ? {valueColors:customFieldItemColors(field).filter((_color,current)=>current!==index)} : {})};
}
