import Appearance from '../../src/Appearance.js';
import ProfileText from '../../src/ProfileText.js';
import ActivityView from '../../src/ActivityView.js';
import ProfileHeaderView from '../../src/ProfileHeaderView.js';
import ProfileClock from '../../src/ProfileClock.js';
import UserGroups from '../../src/UserGroups.js';
import DailyCover from '../../src/DailyCover.js';
import { activationSnippet, cardsSnippet, dashboardConfig, DEFAULT_APPEARANCE, displayNameFor, normalizeUser, profileTitle, PROGRAM_PAGE, RELEASE_VERSION, STYLES_PAGE, validateConfig } from './model.mjs';

const API = 'https://pt.wikipedia.org/w/api.php';
const LIMIT = 8 * 1024 * 1024;
const clean = text => text.replace(/\r\n?/g, '\n').trim();
const stable = value => JSON.stringify(value, (_key, entry) => entry && typeof entry === 'object' && !Array.isArray(entry) ? Object.fromEntries(Object.keys(entry).sort().map(key => [key, entry[key]])) : entry);
const decode = value => value.replace(/&(?:#(\d+)|#x([\da-f]+)|quot|apos|amp|lt|gt);/gi, (whole, decimal, hex) => {
  if (decimal || hex) { const point = parseInt(decimal || hex, hex ? 16 : 10); return point > 0 && point <= 0x10ffff && !(point >= 0xd800 && point <= 0xdfff) ? String.fromCodePoint(point) : whole; }
  return { '&quot;':'"', '&apos;':"'", '&amp;':'&', '&lt;':'<', '&gt;':'>' }[whole.toLowerCase()] || whole;
});
function tags(text, names = 'div|span|p|templatestyles') {
  return [...text.matchAll(new RegExp('<(' + names + ')\\b[^<>]*>', 'gi'))].map(match => {
    const attributes = new Map(); let duplicate = false;
    for (const part of match[0].matchAll(/([a-z_:][\w:.-]*)\s*=\s*(?:"([^"]*)"|'([^']*)')/gi)) {
      const key = part[1].toLowerCase(); if (attributes.has(key)) duplicate = true;
      attributes.set(key, decode(part[2] ?? part[3]));
    }
    return { name:match[1].toLowerCase(), attributes, duplicate, index:match.index, end:match.index + match[0].length };
  });
}
function row(id, title, destination, status, detail) { return {id, title, destination, status, detail}; }

/** Keep offsets while removing examples that MediaWiki renders as literal text. */
function activeWikitext(text) {
  const opening = /<!--|<(nowiki|pre|source|syntaxhighlight)\b[^<>]*>/gi;
  const pieces = []; let previous = 0, match;
  while ((match = opening.exec(text))) {
    let end;
    if (match[0] === '<!--') {
      const close = text.indexOf('-->', opening.lastIndex);
      end = close < 0 ? text.length : close + 3;
    } else if (/\/\s*>$/.test(match[0])) end = opening.lastIndex;
    else {
      const closing = new RegExp('</\\s*' + match[1] + '\\s*>', 'gi');
      closing.lastIndex = opening.lastIndex;
      const close = closing.exec(text); end = close ? closing.lastIndex : text.length;
    }
    pieces.push(text.slice(previous,match.index),text.slice(match.index,end).replace(/[^\r\n]/g,' '));
    previous = end; opening.lastIndex = end;
  }
  return pieces.join('') + text.slice(previous);
}

/** Classify the surrounding source without evaluating or importing it.
 * This deliberately recognizes a limited lexical subset. Ambiguous regex,
 * interpolation or statement boundaries require a manual check. The exact
 * prepared loader is already known, so it is skipped as one closed statement. */
function activationContext(text,start,end) {
  let context = 'code', quote = '', boundary = true, found = false;
  const stack = [], closing = {')':'(',']':'[','}':'{'};
  for (let index = 0; index < text.length;) {
    if (index === start) {
      if (context !== 'code') return 'different';
      if (stack.length) return stack.some(char=>char !== '{') ? 'unknown' : 'different';
      if (!boundary) return 'unknown';
      found = true; index = end; context = 'line'; boundary = true; continue;
    }
    const char = text[index], next = text[index + 1];
    if (context === 'line') {
      if (/[\r\n\u2028\u2029]/.test(char)) context = 'code';
      index += 1; continue;
    }
    if (context === 'block') {
      if (char === '*' && next === '/') { context = 'code'; index += 2; } else index += 1;
      continue;
    }
    if (context === 'string') {
      if (char === '\\') { index += 2; continue; }
      if (quote === '`' && char === '$' && next === '{') return 'unknown';
      if (char === quote) { context = 'code'; index += 1; continue; }
      if (quote !== '`' && /[\r\n\u2028\u2029]/.test(char)) return 'unknown';
      index += 1; continue;
    }
    if (/\s/.test(char)) { index += 1; continue; }
    if (char === '/' && next === '/') { context = 'line'; index += 2; continue; }
    if (char === '/' && next === '*') { context = 'block'; index += 2; continue; }
    if (char === '/' || char === '\\') return 'unknown';
    if (char === '"' || char === "'" || char === '`') { context = 'string'; quote = char; boundary = false; index += 1; continue; }
    if (/[A-Za-z_$]/.test(char)) {
      let last = index + 1;
      while (last < text.length && /[\w$]/.test(text[last])) last += 1;
      if (!stack.length && /^(?:return|throw|break|continue|yield|await|try|catch|finally|with|do|class|import|export)$/.test(text.slice(index,last))) return 'unknown';
      boundary = false; index = last; continue;
    }
    if ('([{'.includes(char)) { stack.push(char); boundary = false; index += 1; continue; }
    if (Object.hasOwn(closing,char)) {
      if (stack.pop() !== closing[char]) return 'unknown';
      boundary = char === '}' && stack.length === 0; index += 1; continue;
    }
    if (char === ';') { boundary = stack.length === 0; index += 1; continue; }
    if (/[0-9.,=+*%&|!?<>:~^\-]/.test(char)) { boundary = false; index += 1; continue; }
    return 'unknown';
  }
  return found && (context === 'code' || context === 'line') && !stack.length ? 'ok' : 'unknown';
}

function activationCheck(config,text) {
  const expected = activationSnippet(config);
  const start = '// PERFILWIKI-ACTIVATION-BEGIN', end = '// PERFILWIKI-ACTIVATION-END';
  const exact = clean(expected.slice(expected.indexOf(start)));
  if (text.split(start).length !== 2 || text.split(end).length !== 2) return 'different';
  const from = text.indexOf(start), to = text.indexOf(end) + end.length;
  if (to < from || clean(text.slice(from,to)) !== exact) return 'different';
  return activationContext(text,from,to);
}

export function installationPlan(config) {
  if (!validateConfig(config).valid) throw new TypeError('Confira a conta e as opções antes de verificar.');
  return { config, user:normalizeUser(config.user), activationTitle:'Usuário:' + normalizeUser(config.user) + '/common.js', profileTitle:profileTitle(config), programTitle:PROGRAM_PAGE, stylesTitle:STYLES_PAGE };
}

function content(page) {
  if (!page) return {status:'unknown'};
  if (page.missing === true) return {status:'missing'};
  if (page.invalid || page.redirect || !Array.isArray(page.revisions) || page.revisions.length !== 1) return {status:'unknown'};
  const revision = page.revisions[0], slot = revision?.slots?.main;
  if (!revision || revision.texthidden || revision.suppressed || !slot || slot.texthidden || typeof slot.content !== 'string' || slot.content.length > LIMIT) return {status:'unknown'};
  return {status:'available', text:slot.content, model:page.contentmodel};
}

function elementRange(text, root) {
  const boundary = new RegExp('<\\/?'+root.name+'\\b[^<>]*>', 'gi');
  boundary.lastIndex = root.end;
  let depth = 1, match;
  while ((match = boundary.exec(text))) {
    depth += /^<\//.test(match[0]) ? -1 : /\/\s*>$/.test(match[0]) ? 0 : 1;
    if (!depth) return {start:root.index, end:match.index, after:boundary.lastIndex};
  }
  return null;
}
function divRange(text,root) { return elementRange(text,root); }

function profileChecks(plan, text) {
  text = activeWikitext(text);
  const all = tags(text), prepared = dashboardConfig(plan.config), expected = prepared.appearance;
  const topExpected = !!ProfileHeaderView.wikitext({config:{user:plan.user,timeZone:prepared.timeZone}},prepared);
  const wanted = [topExpected && 'dan-pu-profile-header', expected.showCards && 'dan-pu-estatisticas', expected.showActivity && 'dan-pu-ritmo'].filter(Boolean);
  const unwanted = [!topExpected && 'dan-pu-profile-header', !expected.showCards && 'dan-pu-estatisticas', !expected.showActivity && 'dan-pu-ritmo'].filter(Boolean);
  if (unwanted.some(id => all.some(tag => tag.attributes.get('id') === id))) return false;
  for (const id of wanted) {
    const matches = all.filter(tag => tag.attributes.get('id') === id);
    if (matches.length !== 1 || matches[0].duplicate || matches[0].attributes.get('data-perfilwiki-user') !== plan.user) return false;
    try {
      const actual = JSON.parse(matches[0].attributes.get('data-perfilwiki-appearance') || 'null');
      if (!actual || Array.isArray(actual) || Object.keys(actual).some(key => !Object.hasOwn(DEFAULT_APPEARANCE, key))) return false;
      const normalized = {...DEFAULT_APPEARANCE, ...actual};
      if (!validateConfig({...plan.config, appearance:normalized}).valid || stable(normalized) !== stable(expected)) return false;
    } catch (_) { return false; }
  }
  const roots = Object.fromEntries(wanted.map(id => [id, all.find(tag => tag.attributes.get('id') === id)]));
  const ranges = Object.fromEntries(wanted.map(id => [id, divRange(text, roots[id])]));
  if (Object.values(ranges).some(range => !range)) return false;
  const cardsRange = ranges['dan-pu-estatisticas'], activityRange = ranges['dan-pu-ritmo'];
  const headerRange = ranges['dan-pu-profile-header'];
  if (headerRange && (roots['dan-pu-profile-header'].attributes.get('data-perfilwiki-profile-top') !== 'true' || [cardsRange,activityRange].filter(Boolean).some(range=>headerRange.after > range.start))) return false;
  if (headerRange && roots['dan-pu-profile-header'].attributes.get('style') !== ProfileHeaderView.rootStyle(expected)) return false;
  const covers = all.filter(tag => (tag.attributes.get('class') || '').split(/\s+/).includes('dan-pu-profile-cover'));
  if (prepared.coverImage || ['daily','wiki-daily'].includes(expected.coverSource)) {
    const cover = covers[0], coverRange = cover && divRange(text,cover);
    const topSlots = all.filter(tag => headerRange && tag.index > headerRange.start && tag.index < headerRange.end && (tag.attributes.get('class') || '').split(/\s+/).includes('dan-pu-top-profile-slot'));
    if (covers.length !== 1 || !headerRange || !coverRange || cover.duplicate || topSlots.length !== 1 || topSlots[0].duplicate || cover.index <= headerRange.start || coverRange.after > topSlots[0].index) return false;
    let presentation = prepared;
    if (expected.coverSource === 'wiki-daily') {
      if (cover.attributes.get('data-perfilwiki-cover-source') !== 'wiki-daily' || cover.attributes.get('data-perfilwiki-cover') !== '' || cover.attributes.has('data-perfilwiki-daily-cover')) return false;
    } else if (expected.coverSource === 'daily') {
      if (cover.attributes.get('data-perfilwiki-cover-source') !== 'daily') return false;
      let proof = null;
      const now = new Date().toISOString();
      if (cover.attributes.has('data-perfilwiki-daily-cover')) {
        try { proof = DailyCover.normalize(JSON.parse(cover.attributes.get('data-perfilwiki-daily-cover')),now); } catch (_) { return false; }
        if (!proof) return false;
      }
      if (cover.attributes.get('data-perfilwiki-cover') !== (proof?.filename || '')) return false;
      presentation = {...prepared,dailyCover:proof,now};
    } else if (cover.attributes.get('data-perfilwiki-cover') !== prepared.coverImage) return false;
    if (text.slice(cover.index,coverRange.after) !== ProfileText.coverMarkup(presentation,true)) return false;
  } else if (covers.length) return false;
  const slots = all.filter(tag => tag.attributes.get('id') === 'dan-pu-integrated-cards');
  if (expected.layout === 'integrated' && cardsRange && activityRange) {
    if (slots.length !== 1 || slots[0].duplicate || slots[0].attributes.get('data-perfilwiki-cards-slot') !== 'true' || !(slots[0].attributes.get('class') || '').split(/\s+/).includes('dan-pu-integrated-cards-slot')) return false;
    const slotRange = divRange(text, slots[0]);
    if (!slotRange || !(activityRange.start < slotRange.start && slotRange.start < cardsRange.start && cardsRange.after <= slotRange.end && slotRange.after <= activityRange.end)) return false;
  } else if (slots.length || cardsRange && activityRange && (cardsRange.start < activityRange.start && activityRange.start < cardsRange.end || activityRange.start < cardsRange.start && cardsRange.start < activityRange.end)) return false;
  if (!all.some(tag => tag.name === 'templatestyles' && tag.attributes.get('src') === plan.stylesTitle)) return false;
  if (expected.showCards) {
    const ids = tags(cardsSnippet(plan.config), 'span').map(tag => tag.attributes.get('id')).filter(Boolean);
    let previous = -1;
    for (const id of ids) {
      const matches = all.filter(tag => tag.attributes.get('id') === id);
      if (matches.length !== 1 || matches[0].index <= previous) return false;
      previous = matches[0].index;
    }
  }
  // Check each block separately so metadata cannot migrate to the wrong owner.
  for (const [id, block] of [['dan-pu-profile-header','top'],['dan-pu-estatisticas','cards'],['dan-pu-ritmo','activity']]) {
    const root = all.find(tag => tag.attributes.get('id') === id);
    if (!root) continue;
    const end = ranges[id].end;
    const local = all.filter(tag => tag.index > root.index && tag.index < end && !(block === 'activity' && cardsRange && tag.index >= cardsRange.start && tag.index < cardsRange.after));
    const nodes = name => local.filter(tag => (tag.attributes.get('class') || '').split(/\s+/).includes(name));
    const plain = tag => decode((text.slice(tag.end).split('</'+tag.name+'>')[0] || '').replace(/<[^>]*>/g,'')).trim();
    const show = Appearance.profileIn(expected,block,prepared.customFields);
    const labels = nodes('dan-pu-profile-label');
    if (!show) {
      if (labels.length || nodes('dan-pu-profile-details').length || nodes('dan-pu-profile-photo').length) return false;
      continue;
    }
    const profileContents = nodes('dan-pu-profile-content');
    if (profileContents.some(node => node.duplicate || node.attributes.get('data-photo-align') !== expected.photoAlignment)) return false;
    const nameVisible = Appearance.fieldIn(expected,block,'name');
    if (nameVisible ? labels.length !== 1 || plain(labels[0]) !== displayNameFor(plan.config) : labels.length) return false;
    const automaticColor = block === 'top' ? Appearance.topColors(expected).foreground : '#54595d';
    const hasColor = (tag,color) => !!tag && new RegExp('(?:^|;)\\s*color\\s*:\\s*'+color+'\\s*(?:;|$)','i').test(tag.attributes.get('style') || '');
    if (nameVisible && !hasColor(labels[0],expected.nameColor || automaticColor)) return false;
    const places = nodes('dan-pu-profile-location');
    if (prepared.location && Appearance.fieldIn(expected,block,'location')) {
      const placeRange=places.length===1&&elementRange(text,places[0]);
      if (!placeRange || text.slice(places[0].end,placeRange.end)!==ProfileText.wikitext(prepared.location,expected.informationColor)) return false;
    } else if (places.length) return false;
    const fields = nodes('dan-pu-profile-field'), expectedFields = (prepared.customFields || []).filter(field=>Appearance.fieldIn(expected,block,field.placement));
    if (fields.length !== expectedFields.length || fields.some((tag,index)=>{ const range=divRange(text,tag); return !range || text.slice(tag.index,range.after)!==ActivityView.customFieldMarkup(expectedFields[index],true,expected,block); })) return false;
    const createdRows = nodes('dan-pu-account-created');
    if (createdRows.length !== (expected.showAccountCreated && Appearance.fieldIn(expected,block,'accountCreated') ? 1 : 0)) return false;
    if (createdRows.length) {
      const created = createdRows[0], range = divRange(text,created);
      if (created.duplicate || !range) return false;
      const source = text.slice(created.index,range.after);
      if (created.attributes.has('data-perfilwiki-account-created')) {
        const markup = ActivityView.profileMarkup({config:{user:plan.user}}, {...prepared, savedAccountCreated:created.attributes.get('data-perfilwiki-account-created')}, true, block);
        const matching = tags(markup).find(tag=>(tag.attributes.get('class') || '').split(/\s+/).includes('dan-pu-account-created'));
        const expectedRange = matching && divRange(markup,matching);
        if (!expectedRange || source !== markup.slice(expectedRange.start,expectedRange.after)) return false;
      } else {
        const pending=ActivityView.profileMarkup({config:{user:plan.user}},prepared,true,block);
        const matching=tags(pending).find(tag=>(tag.attributes.get('class') || '').split(/\s+/).includes('dan-pu-account-created'));
        const pendingRange=matching&&divRange(pending,matching);
        const legacy=expected.language==='pt-BR'&&!expected.labelColor&&!expected.informationColor&&source==='<div class="dan-pu-account-created"><strong style="font-weight:600;">Conta criada em:</strong> Aguardando dados</div>';
        if (!legacy&&(!pendingRange||source!==pending.slice(pendingRange.start,pendingRange.after))) return false;
      }
    }
    const clocks = nodes('dan-pu-local-time');
    const clockVisible = expected.showLocalTime && Appearance.fieldIn(expected,block,'localTime');
    if (clockVisible ? clocks.length !== 1 : clocks.length) return false;
    if (clockVisible) {
      const clock = clocks[0], timestamp = clock.attributes.get('data-perfilwiki-clock-at');
      const value = ProfileClock.details(timestamp, prepared.timeZone, true, expected.language);
      if (clock.duplicate || !value.timestamp || value.timestamp !== timestamp || clock.attributes.get('data-perfilwiki-timezone') !== prepared.timeZone || plain(clock) !== value.text || clock.attributes.get('title') !== value.title) return false;
    }
    const locationTimes = nodes('dan-pu-profile-location-time');
    if (clockVisible && places.length) {
      const group = locationTimes[0], range = group && divRange(text,group);
      const separators = nodes('dan-pu-location-time-separator');
      if (locationTimes.length !== 1 || !range || separators.length !== 1 || !(range.start < places[0].index && places[0].index < separators[0].index && separators[0].index < clocks[0].index && clocks[0].index < range.end)) return false;
    } else if (locationTimes.length) return false;
    const groups = nodes('dan-pu-user-groups');
    const groupsVisible = expected.showUserGroups && Appearance.fieldIn(expected,block,'userGroups');
    if (groupsVisible ? groups.length !== 1 : groups.length) return false;
    if (groupsVisible) {
      if (groups[0].duplicate) return false;
      const proofText = groups[0].attributes.get('data-perfilwiki-user-groups');
      let proof = null;
      if (groups[0].attributes.has('data-perfilwiki-user-groups')) {
        try { proof = JSON.parse(proofText); } catch (_) { return false; }
        if (!UserGroups.fromProof(proof,plan.user,new Date())) return false;
      }
      // Use the real renderer for localized labels, proof text and escaped titles.
      // This retains exact color/owner checks instead of accepting translated text
      // by substring or treating a different language as equivalent markup.
      const groupState = {config:{user:plan.user},...(proof?{statistics:{user:plan.user,userGroups:proof}}:{})};
      const markup = ActivityView.profileMarkup(groupState,prepared,true,block);
      const matching = tags(markup).find(tag=>(tag.attributes.get('class') || '').split(/\s+/).includes('dan-pu-user-groups'));
      const expectedRange = matching && divRange(markup,matching), actualRange = divRange(text,groups[0]);
      if (!expectedRange || !actualRange || text.slice(actualRange.start,actualRange.after) !== markup.slice(expectedRange.start,expectedRange.after)) return false;
    }
    // These two rows close the metadata in every scope, including snapshots.
    // Require adjacency when both exist so custom information cannot split them.
    const details = nodes('dan-pu-profile-details');
    if (details.some(tag=>!hasColor(tag,expected.informationColor || automaticColor))) return false;
    if (groups.length || createdRows.length) {
      const detailsRange = details.length === 1 && divRange(text,details[0]);
      const tail = [...groups, ...createdRows], tailRanges = tail.map(node=>divRange(text,node));
      if (!detailsRange || tailRanges.some(range=>!range || range.start <= detailsRange.start || range.after > detailsRange.end)) return false;
      if (tail.length === 2 && text.slice(tailRanges[0].after,tailRanges[1].start).trim()) return false;
      if (text.slice(tailRanges[tailRanges.length-1].after,detailsRange.end).trim()) return false;
    }
    const photos = nodes('dan-pu-profile-photo'), photoVisible = prepared.photo && Appearance.fieldIn(expected,block,'photo');
    if (photoVisible ? photos.length !== 1 : photos.length) return false;
    if (photoVisible && (photos[0].attributes.get('data-perfilwiki-photo') !== prepared.photo || !text.slice(photos[0].index,end).startsWith(ProfileText.photoMarkup({...prepared,displayName:displayNameFor(plan.config)},true)))) return false;
    if (profileContents.length > 1 || (labels.length || places.length || fields.length || createdRows.length || clocks.length || groups.length || photos.length) && profileContents.length !== 1) return false;
  }
  return true;
}

/** Inspect source text only. Public JavaScript and wikitext are never executed. */
export function inspectInstallation(plan, pages, release) {
  const items = [
    ['activation','Ativação no common.js',plan.activationTitle],
    ['profile','Blocos no perfil',plan.profileTitle],
    ['program','Programa do PerfilWiki',plan.programTitle],
    ['styles','Estilos do painel',plan.stylesTitle],
  ];
  return items.map(([id, title, destination]) => {
    const source = content(pages.get(destination));
    if (source.status === 'missing') return row(id,title,destination,'missing','A página ainda não existe.');
    if (source.status !== 'available') return row(id,title,destination,'unknown','Não foi possível conferir o conteúdo público desta página.');
    let matches = false;
    if (id === 'activation') {
      const status = source.model === 'javascript' ? activationCheck(plan.config,source.text) : 'different';
      if (status === 'unknown') return row(id,title,destination,status,'O trecho preparado foi encontrado, mas o código ao redor precisa de conferência manual.');
      if (status === 'ok') return row(id,title,destination,status,'O trecho preparado está no nível principal do common.js. A conferência não executa o programa.');
    } else if (id === 'profile') matches = source.model === 'wikitext' && profileChecks(plan, source.text);
    else {
      const file = release.files.find(file => file.destination === destination);
      matches = source.model === (id === 'styles' ? 'sanitized-css' : 'javascript') && file && clean(source.text) === clean(file.text);
      if (id === 'styles' && source.model !== 'sanitized-css') return row(id,title,destination,'different','A folha precisa ter o modelo CSS higienizado.');
    }
    return row(id,title,destination,matches?'ok':'different',matches?'Confere com os arquivos e as escolhas preparados.':id==='profile'?'Os blocos publicados não correspondem às escolhas preparadas.':id==='activation'?'O carregador está diferente, incompleto ou repetido.':'O arquivo compartilhado é diferente desta distribuição.');
  });
}

/** Two anonymous GET requests, initiated only by the explicit check button. */
export async function checkInstallation(config, {fetcher = fetch, baseUrl = document.baseURI, signal} = {}) {
  const plan = installationPlan(config);
  const canonical = address => {try {const url=new URL(address);url.searchParams.sort();return url.href;}catch {return null;}};
  const cancelBody = async response => {try {await response.body?.cancel?.();}catch {/* The original failure remains the result. */}};
  const sizeError = () => new Error('A resposta excedeu o limite da conferência.');
  const publicError = () => new Error('Consulta pública indisponível. Tente novamente.');
  const checkSignal = () => {if(signal?.aborted)throw publicError();};
  const read = async url => {
    checkSignal();
    const response = await fetcher(url, {method:'GET',credentials:'omit',cache:'no-store',redirect:'error',referrerPolicy:'no-referrer',signal});
    if(signal?.aborted){await cancelBody(response);throw publicError();}
    if (!response.ok || response.redirected || ['opaque','opaqueredirect'].includes(response.type) || response.url && canonical(response.url)!==canonical(url)) {await cancelBody(response);throw publicError();}
    const declared=response.headers?.get('content-length');
    if(declared!==null&&declared!==undefined&&/^\d+$/.test(declared)&&Number(declared)>LIMIT){await cancelBody(response);throw sizeError();}
    let text;
    if(response.body && typeof response.body.getReader==='function') {
      const reader=response.body.getReader(),decoder=new TextDecoder(),pieces=[];let size=0,finished=false;
      try {
        while(true) {
          checkSignal();const chunk=await reader.read();checkSignal();
          if(chunk.done){finished=true;break;}
          size+=chunk.value.byteLength;if(size>LIMIT)throw sizeError();
          pieces.push(decoder.decode(chunk.value,{stream:true}));
        }
        pieces.push(decoder.decode());text=pieces.join('');
      } finally {
        if(!finished){try{await reader.cancel();}catch {/* Retain the read or size failure. */}}
        reader.releaseLock?.();
      }
    } else {
      text=await response.text();
      if(typeof text!=='string'||text.length>LIMIT||new TextEncoder().encode(text).length>LIMIT)throw sizeError();
    }
    checkSignal();
    return JSON.parse(text);
  };
  const release = await read(new URL('release-files.json',baseUrl).href);
  if (release.version !== RELEASE_VERSION || !Array.isArray(release.files) || [plan.programTitle,plan.stylesTitle].some(title=>!release.files.some(file=>file.destination===title && typeof file.text==='string'))) throw new Error('Os arquivos locais não correspondem a esta versão.');
  const titles = [plan.activationTitle,plan.profileTitle,plan.programTitle,plan.stylesTitle];
  const url = new URL(API);
  for (const [key,value] of Object.entries({action:'query',format:'json',formatversion:'2',origin:'*',prop:'info|revisions',titles:titles.join('|'),rvslots:'main',rvprop:'content',maxlag:'5'})) url.searchParams.set(key,value);
  const data = await read(url.href);
  if (!data || data.error || data.warnings && Object.keys(data.warnings).length || data.batchcomplete !== true || data.continue || !Array.isArray(data.query?.pages)) throw new Error('A Wikipédia não devolveu uma resposta completa. Tente novamente.');
  const normalizations = new Map((data.query.normalized || []).map(item=>[item.from,item.to]));
  const pages = new Map();
  for (const title of titles) {
    const normalized = normalizations.get(title) || title;
    const found = data.query.pages.filter(page=>page && page.title===normalized);
    if (found.length === 1) pages.set(title,found[0]);
  }
  const results = inspectInstallation(plan,pages,release);
  return {results,complete:results.every(item=>item.status==='ok'),checkedAt:new Date().toISOString()};
}
