import I18n from '../../src/I18n.js';
import Appearance from '../../src/Appearance.js';
import ProfileText from '../../src/ProfileText.js';
import ProfileFields from '../../src/ProfileFields.js';
import ActivityView from '../../src/ActivityView.js';
import LayoutView from '../../src/LayoutView.js';
import ProfileHeaderView from '../../src/ProfileHeaderView.js';
import ProfileSections from '../../src/ProfileSections.js';
/** PerfilWiki installation model. These pure functions never request or publish anything. */
export const RELEASE_VERSION = '1.20.0';
export const INSTALLER_VERSION = `${RELEASE_VERSION}-local-candidate`;
export const STYLES_PAGE = 'Usuário:Daniel G Rego/RitmoPU-estilos';
export const DOCUMENTATION_PAGE = 'Usuário:Daniel G Rego/PerfilWiki';
export const PROGRAM_PAGE = 'Usuário:Daniel G Rego/PerfilWiki.js';
export const METRICS = Object.freeze([
  { id: 'tenure', label: 'Anos na Wikipédia', value: '18 anos' },
  { id: 'bestStreak', label: 'Melhor sequência', value: '68 dias' },
  { id: 'thanks', label: 'Agradecimentos recebidos', value: '246' },
  { id: 'edits', label: 'Edições', value: '24.368' },
  { id: 'reverts', label: 'Reversões', value: '1.204' },
  { id: 'edited', label: 'Artigos editados', value: '3.690' },
  { id: 'articles', label: 'Artigos criados', value: '183' },
  { id: 'technicalCreated', label: 'Predefinições, módulos e scripts criados', value: '42' },
  { id: 'mostEditedArticle', label: 'Artigo mais editado', value: 'Brasil' },
  { id: 'bytesAdded', label: 'Bytes acrescentados', value: '2,4 MiB' },
  { id: 'bytesRemoved', label: 'Bytes removidos', value: '820 KiB' },
  { id: 'activeDays', label: 'Dias com edições', value: '118' },
  { id: 'articleEdits', label: 'Edições em artigos', value: '18.420' },
  { id: 'talkEdits', label: 'Edições em discussões', value: '1.204' },
  { id: 'activeMonths', label: 'Meses com edições', value: '86' },
  { id: 'busiestDay', label: 'Dia com mais edições', value: '03/09/2026' },
  { id: 'edits30', label: 'Edições nos últimos 30 dias', value: '766' },
  { id: 'averagePerActiveDay', label: 'Média por dia ativo', value: '24,6' },
  { id: 'activeYears', label: 'Anos com edições', value: '12' },
  { id: 'busiestMonth', label: 'Mês com mais edições', value: 'setembro de 2026' },
  { id: 'thanksSent', label: 'Agradecimentos enviados', value: '128' },
  { id: 'averageBytesPerEdit', label: 'Média de bytes acrescentados por edição', value: '365,2 B' },
  { id: 'largestAddition', label: 'Maior acréscimo em uma edição', value: '24 KiB' },
  { id: 'largestRemoval', label: 'Maior remoção em uma edição', value: '12 KiB' },
].map(Object.freeze));

export const THEMES = Object.freeze([
  { id: 'blue', label: 'Azul', accent: '#3366cc' },
  { id: 'forest', label: 'Verde', accent: '#246342' },
  { id: 'violet', label: 'Violeta', accent: '#6854a4' },
].map(Object.freeze));

export const PERIODS = Object.freeze([
  { id: '30d', label: '30 dias' },
  { id: '90d', label: '90 dias' },
  { id: '12m', label: '12 meses' },
  { id: 'since', label: 'Total acumulado' },
  { id: 'custom', label: 'Personalizado' },
].map(Object.freeze));

export const DEFAULT_APPEARANCE = Object.freeze({
  theme: 'blue',
  language:'pt-BR',
  accent: '#3366cc',
  density: 'comfortable',
  cardColumns: 'auto',
  layout: 'integrated',
  metrics: Object.freeze(METRICS.slice(0, 8).map(({ id }) => id)),
  showCards: true,
  showActivity: true,
  initialPeriod: '30d',
  alignment: 'right',
  nameAlignment: 'left',
  photoAlignment: 'left',
  photoSize: 96,
  photoShape: 'square',
  nameFontSize: 24,
  nameColor: '',
  labelColor: '',
  informationColor: '',
  showAccountCreated: false,
  showLocalTime: false,
  showUserGroups: false,
  profilePlacement: 'top',
  profilePlacements: Object.freeze({name:'inherit',location:'inherit',accountCreated:'inherit',photo:'top',localTime:'top',userGroups:'inherit'}),
  profileDetailsLayout: 'stacked',
  customRange: null,
  blockOrder: 'cards-first',
  highlightedMetrics: Object.freeze(['tenure']),
  highlightColor: '#faf7ef',
  topBackground: '#ffffff',
  coverSource: 'manual',
});

const METRIC_IDS = new Set(METRICS.map(({ id }) => id));
const PERIOD_IDS = new Set(PERIODS.map(({ id }) => id));
const THEME_IDS = new Set([...THEMES.map(({ id }) => id), 'custom']);
const INVALID_TITLE_CHARACTERS = /[:/#<>\[\]{}|\u0000-\u001f\u007f-\u009f]/u;
const CONTROL_CHARACTERS = /[\u0000-\u001f\u007f-\u009f]/u;
const MARKERS = Object.freeze({
  activation: {
    start: '// PERFILWIKI-ACTIVATION-BEGIN',
    end: '// PERFILWIKI-ACTIVATION-END',
  },
  profile: {
    start: '<!-- PERFILWIKI-PROFILE-BEGIN -->',
    end: '<!-- PERFILWIKI-PROFILE-END -->',
  },
  cards: { start: '<!-- PERFILWIKI-CARDS-BEGIN -->', end: '<!-- PERFILWIKI-CARDS-END -->' },
  activity: { start: '<!-- PERFILWIKI-ACTIVITY-BEGIN -->', end: '<!-- PERFILWIKI-ACTIVITY-END -->' },
});

export function normalizeUser(value) {
  return typeof value === 'string' ? value.replaceAll('_', ' ').trim().normalize('NFC') : '';
}

export function normalizeDisplayName(value) {
  return typeof value === 'string' ? value.trim().normalize('NFC') : '';
}

function profileFields(value) { return ProfileFields.normalize(value); }

export function displayNameFor(config) {
  return normalizeDisplayName(config?.displayName) || normalizeUser(config?.user);
}

/** Read only the existing same-page ptwiki context. Never request a session. */
export function detectWikiAccount(host) {
  try {
    if (host?.location?.hostname !== 'pt.wikipedia.org' || host?.mw?.config?.get?.('wgDBname') !== 'ptwiki') return '';
    const raw = host.mw.config.get('wgUserName');
    const user = normalizeUser(raw);
    return user && user.length <= 255 && !CONTROL_CHARACTERS.test(raw) && !INVALID_TITLE_CHARACTERS.test(user) && !['.', '..'].includes(user) ? user : '';
  } catch { return ''; }
}

export const DEFAULT_TIME_ZONE = 'America/Sao_Paulo';

function timeZoneValid(value) {
  if (typeof value !== 'string' || !value || value !== value.trim() || value.length > 100) return false;
  try {
    new Intl.DateTimeFormat('pt-BR', { timeZone: value }).format(0);
    return true;
  } catch {
    return false;
  }
}

export function createInitialConfig(host = typeof window === 'object' ? window : undefined) {
  return {
    user: detectWikiAccount(host),
    displayName: '',
    location: '',
    photo: '',
    coverImage: '',
    customFields: [],
    contentSections: [],
    timeZone: DEFAULT_TIME_ZONE,
    destination: 'main',
    subpage: 'PU',
    appearance: { ...DEFAULT_APPEARANCE, profilePlacements:{...DEFAULT_APPEARANCE.profilePlacements}, metrics: [...DEFAULT_APPEARANCE.metrics], highlightedMetrics: [...DEFAULT_APPEARANCE.highlightedMetrics] },
  };
}

export function hexColorValid(value) {
  return typeof value === 'string' && /^#[0-9a-f]{6}$/iu.test(value);
}

/** WCAG relative luminance, using the sRGB transfer function. */
function luminance(hex) {
  if (!hexColorValid(hex)) throw new TypeError('Use uma cor no formato #3366cc.');
  const channels = [1, 3, 5].map((index) => parseInt(hex.slice(index, index + 2), 16) / 255);
  const linear = channels.map((channel) => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4);
  return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
}

export function contrastRatio(first, second) {
  const values = [luminance(first), luminance(second)].sort((a, b) => b - a);
  return (values[0] + 0.05) / (values[1] + 0.05);
}

export function readableForeground(accent) {
  return contrastRatio(accent, '#ffffff') >= contrastRatio(accent, '#000000') ? '#ffffff' : '#000000';
}

export function validateConfig(config) {
  const errors = {};
  if (!config || typeof config !== 'object' || Array.isArray(config)) {
    return { valid: false, errors: { user: 'Digite o nome da conta.', timeZone: 'Escolha um fuso horário.', appearance: 'Confira as opções de aparência.' } };
  }
  const user = normalizeUser(config.user);
  if (!user) errors.user = 'Digite o nome da conta, sem o prefixo Usuário:.';
  else if (user.length > 255 || CONTROL_CHARACTERS.test(config.user) || INVALID_TITLE_CHARACTERS.test(user) || user === '.' || user === '..') {
    errors.user = 'Use apenas o nome da conta, sem prefixo, barras ou caracteres de código.';
  }
  if (config.displayName !== undefined && (typeof config.displayName !== 'string' || CONTROL_CHARACTERS.test(config.displayName) || /[<>\[\]{}|]/u.test(config.displayName) || [...normalizeDisplayName(config.displayName)].length > 100)) errors.displayName = 'Use até 100 caracteres, sem código ou quebras de linha.';
  try { if (config.location !== undefined) ProfileText.normalize(config.location, 120); } catch (error) { errors.location = error.message; }
  try { if (config.photo !== undefined) ProfileText.normalizePhoto(config.photo); } catch (error) { errors.photo = error.message; }
  try { if (config.coverImage !== undefined) ProfileText.normalizePhoto(config.coverImage); } catch (error) { errors.coverImage = error.message; }
  try { profileFields(config.customFields); } catch (error) { errors.customFields = error.message; }
  try { ProfileSections.normalize(config.contentSections); } catch (error) { errors.contentSections = error.message; }
  if (!timeZoneValid(config.timeZone)) errors.timeZone = 'Escolha um fuso horário válido, como America/Sao_Paulo.';
  if (!['main', 'subpage'].includes(config.destination)) errors.subpage = 'Escolha a página de usuário ou uma subpágina.';
  if (config.destination === 'subpage') {
    const subpage = typeof config.subpage === 'string' ? config.subpage.trim().normalize('NFC') : '';
    if (!subpage || subpage.length > 255 || CONTROL_CHARACTERS.test(config.subpage) || INVALID_TITLE_CHARACTERS.test(subpage) || subpage.includes('..') || subpage === '.') {
      errors.subpage = 'Dê um nome à subpágina, sem barras, pontos de navegação ou caracteres de código.';
    }
  }
  const appearance = config.appearance;
  if (!appearance || typeof appearance !== 'object' || Array.isArray(appearance)) {
    errors.appearance = 'Confira as opções de aparência.';
  } else if (
    !['cards-first', 'activity-first'].includes(appearance.blockOrder) || !hexColorValid(appearance.highlightColor) || !Array.isArray(appearance.highlightedMetrics) || appearance.highlightedMetrics.some(id => !METRIC_IDS.has(id)) || new Set(appearance.highlightedMetrics).size !== appearance.highlightedMetrics.length ||
    !THEME_IDS.has(appearance.theme) || !hexColorValid(appearance.accent) ||
    !['comfortable', 'compact', 'roomy'].includes(appearance.density) || !['auto','2','3','4','5'].includes(appearance.cardColumns) ||
    !['integrated', 'together', 'separate'].includes(appearance.layout) ||
    !['right', 'left', 'center'].includes(appearance.alignment) ||
    (appearance.nameAlignment !== undefined && !['left', 'center', 'right'].includes(appearance.nameAlignment)) ||
    (appearance.photoAlignment !== undefined && !['left', 'center', 'right'].includes(appearance.photoAlignment)) ||
    (appearance.coverSource !== undefined && !['manual', 'daily', 'wiki-daily'].includes(appearance.coverSource)) ||
    (appearance.showAccountCreated !== undefined && typeof appearance.showAccountCreated !== 'boolean') ||
    typeof appearance.showCards !== 'boolean' || typeof appearance.showActivity !== 'boolean' ||
    !PERIOD_IDS.has(appearance.initialPeriod) || !Array.isArray(appearance.metrics) ||
    appearance.metrics.some((metric) => !METRIC_IDS.has(metric)) ||
    new Set(appearance.metrics).size !== appearance.metrics.length
  ) {
    errors.appearance = 'Confira a cor e as opções de aparência.';
  } else if (!appearance.showCards && !appearance.showActivity) {
    errors.appearance = 'Mantenha pelo menos um bloco visível.';
  } else if (appearance.showCards && appearance.metrics.length === 0) {
    errors.appearance = 'Escolha pelo menos um contador para o bloco de estatísticas.';
  }
  try { Appearance.normalize(appearance); } catch (error) { errors.appearance = error.message; }
  return { valid: Object.keys(errors).length === 0, errors };
}

function checkedConfig(config) {
  const result = validateConfig(config);
  if (!result.valid) throw new TypeError(Object.values(result.errors).join(' '));
  return {
    user: normalizeUser(config.user),
    displayName: normalizeDisplayName(config.displayName),
    location: config.location === undefined ? '' : ProfileText.normalize(config.location, 120),
    customFields: profileFields(config.customFields),
    contentSections: ProfileSections.normalize(config.contentSections),
    photo: config.photo === undefined ? '' : ProfileText.normalizePhoto(config.photo),
    coverImage: config.coverImage === undefined ? '' : ProfileText.normalizePhoto(config.coverImage),
    timeZone: config.timeZone,
    destination: config.destination,
    subpage: typeof config.subpage === 'string' ? config.subpage.trim().normalize('NFC') : 'PU',
    appearance: {
      theme: config.appearance.theme,
      language:config.appearance.language ?? DEFAULT_APPEARANCE.language,
      accent: config.appearance.accent.toLowerCase(),
      density: config.appearance.density,
      cardColumns: config.appearance.cardColumns,
      layout: config.appearance.layout,
      metrics: [...config.appearance.metrics],
      showCards: config.appearance.showCards,
      showActivity: config.appearance.showActivity,
      initialPeriod: config.appearance.initialPeriod,
      alignment: config.appearance.alignment,
      nameAlignment: config.appearance.nameAlignment ?? DEFAULT_APPEARANCE.nameAlignment,
      photoAlignment: config.appearance.photoAlignment ?? DEFAULT_APPEARANCE.photoAlignment,
      photoSize: config.appearance.photoSize ?? DEFAULT_APPEARANCE.photoSize,
      photoShape: config.appearance.photoShape ?? DEFAULT_APPEARANCE.photoShape,
      nameFontSize: config.appearance.nameFontSize ?? DEFAULT_APPEARANCE.nameFontSize,
      nameColor: (config.appearance.nameColor ?? DEFAULT_APPEARANCE.nameColor).toLowerCase(),
      labelColor: (config.appearance.labelColor ?? DEFAULT_APPEARANCE.labelColor).toLowerCase(),
      informationColor: (config.appearance.informationColor ?? DEFAULT_APPEARANCE.informationColor).toLowerCase(),
      showAccountCreated: config.appearance.showAccountCreated ?? DEFAULT_APPEARANCE.showAccountCreated,
      showLocalTime: config.appearance.showLocalTime ?? DEFAULT_APPEARANCE.showLocalTime,
      showUserGroups: config.appearance.showUserGroups ?? DEFAULT_APPEARANCE.showUserGroups,
      profilePlacement: config.appearance.profilePlacement ?? DEFAULT_APPEARANCE.profilePlacement,
      profilePlacements: {...DEFAULT_APPEARANCE.profilePlacements,...config.appearance.profilePlacements},
      profileDetailsLayout: config.appearance.profileDetailsLayout ?? DEFAULT_APPEARANCE.profileDetailsLayout,
      customRange: Appearance.normalizeRange(config.appearance.customRange),
      blockOrder: config.appearance.blockOrder,
      highlightColor: config.appearance.highlightColor.toLowerCase(),
      topBackground: (config.appearance.topBackground ?? DEFAULT_APPEARANCE.topBackground).toLowerCase(),
      coverSource: config.appearance.coverSource ?? DEFAULT_APPEARANCE.coverSource,
      highlightedMetrics: [...config.appearance.highlightedMetrics],
    },
  };
}

/** Restore only a bounded JSON configuration. No pasted code is executed. */
export function importChoices(text) {
  if (typeof text !== 'string' || new TextEncoder().encode(text).length > 1048576) throw new TypeError('Cole um arquivo JSON de escolhas com até 1 MiB.');
  let parsed;
  try { parsed = JSON.parse(text); } catch { throw new TypeError('Cole o conteúdo do arquivo PerfilWiki_escolhas.json, sem código JavaScript.'); }
  const allowed = new Set(['version','user','displayName','location','photo','coverImage','customFields','contentSections','timeZone','destination','subpage','appearance']);
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed) || Object.keys(parsed).some(key=>!allowed.has(key))) throw new TypeError('O arquivo contém uma opção desconhecida.');
  function assertSafe(value, depth = 0) {
    if (depth > 20) throw new TypeError('O arquivo contém uma estrutura muito longa.');
    if (!value || typeof value !== 'object') return;
    if (Object.keys(value).some(key=>['__proto__','prototype','constructor'].includes(key))) throw new TypeError('O arquivo contém uma chave inválida.');
    for (const item of Object.values(value)) assertSafe(item, depth + 1);
  }
  assertSafe(parsed);
  if (parsed.version !== undefined && (typeof parsed.version !== 'string' || !/^1\.\d+\.\d+(?:-local-candidate)?$/u.test(parsed.version))) throw new TypeError('Use um arquivo de escolhas do PerfilWiki 1.x.');
  if (parsed.appearance !== undefined && (!parsed.appearance || typeof parsed.appearance !== 'object' || Array.isArray(parsed.appearance) || Object.keys(parsed.appearance).some(key=>!Object.hasOwn(DEFAULT_APPEARANCE,key)))) throw new TypeError('O arquivo contém uma opção de aparência desconhecida.');
  const {version, ...fields} = parsed;
  const defaults = createInitialConfig();
  const selected = {...defaults,...fields,appearance:{...defaults.appearance,...fields.appearance}};
  if (fields.appearance?.profilePlacements) selected.appearance.profilePlacements={...defaults.appearance.profilePlacements,...fields.appearance.profilePlacements};
  return checkedConfig(selected);
}

export function profileTitle(config) {
  const user = normalizeUser(config?.user);
  const subpage = typeof config?.subpage === 'string' ? config.subpage.trim().normalize('NFC') : '';
  return `Usuário:${user}${config?.destination === 'subpage' ? `/${subpage}` : ''}`;
}

export function moveMetric(metrics, id, direction) {
  if (!Array.isArray(metrics)) throw new TypeError('A ordem dos contadores precisa ser uma lista.');
  const next = [...metrics];
  const position = next.indexOf(id);
  if (position === -1 || ![-1, 1].includes(direction)) return next;
  const target = position + direction;
  if (target < 0 || target >= next.length) return next;
  [next[position], next[target]] = [next[target], next[position]];
  return next;
}

export function moveMetricTo(metrics, id, target) {
  if (!Array.isArray(metrics)) throw new TypeError('A ordem dos contadores precisa ser uma lista.');
  const previous = metrics.indexOf(id);
  if (previous < 0 || !Number.isInteger(target) || target < 0 || target >= metrics.length) return [...metrics];
  const next = metrics.filter(metric => metric !== id);
  next.splice(target, 0, id);
  return next;
}

export function footerOwner(settings) {
  return Appearance.footerOwner(settings);
}

function invitation(language) {
  const t=(source,params)=>I18n.t(language,source,params);
  return '<div id="dan-pu-ritmo-install" style="grid-column:1/-1;margin-top:18px;padding-top:14px;border-top:1px solid #eaecf0;color:#54595d;font-size:12px;">'+t('Gostou deste painel?')+' [[:' + DOCUMENTATION_PAGE + '|'+t('Veja como adicionar à sua página de usuário.')+']]</div>';
}

function safeJson(value, spacing) {
  return JSON.stringify(value, null, spacing).replaceAll('<', '\\u003c').replaceAll('>', '\\u003e').replaceAll('&', '\\u0026').replaceAll('\u2028', '\\u2028').replaceAll('\u2029', '\\u2029');
}

function htmlEscape(value) {
  return String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
}

/** Configuration accepted by the dashboard, without installer-only destination fields. */
export function dashboardConfig(config) {
  const prepared = checkedConfig(config);
  return {
    user: prepared.user,
    ...(prepared.displayName ? { displayName: prepared.displayName } : {}),
    ...(prepared.location ? { location: prepared.location } : {}),
    ...(prepared.customFields.length ? { customFields: prepared.customFields } : {}),
    ...(prepared.photo ? {photo:prepared.photo} : {}),
    ...(prepared.coverImage ? {coverImage:prepared.coverImage} : {}),
    timeZone: prepared.timeZone,
    stylesPage: STYLES_PAGE,
    documentationPage: DOCUMENTATION_PAGE,
    appearance: prepared.appearance,
  };
}

export function activationSnippet(config) {
  const prepared = dashboardConfig(config);
  return [
    `/* PerfilWiki ${INSTALLER_VERSION}. Candidato local, ainda não publicado. */`,
    MARKERS.activation.start,
    '// Acrescente este bloco uma única vez, preservando os seus outros scripts.',
    `window.PerfilWikiConfig = ${safeJson(prepared, 2)};`,
    '(function () {',
    "    'use strict';",
    "    if (typeof mw === 'undefined' || !mw.config || mw.config.get('wgDBname') !== 'ptwiki' ||",
    "        mw.config.get('wgAction') !== 'view' || mw.config.get('wgNamespaceNumber') !== 2) { return; }",
    '    function normalize(value) { return typeof value === \'string\' ? value.replace(/_/g, \' \').trim().normalize(\'NFC\') : \'\'; }',
    "    var user = normalize(mw.config.get('wgUserName'));",
    "    var owner = normalize(mw.config.get('wgRelevantUserName') || String(mw.config.get('wgTitle') || '').split('/')[0]);",
    "    if (!user || owner !== user || user !== window.PerfilWikiConfig.user || window.PerfilWiki ||",
    "        window.PerfilWikiLoaderRequested || typeof importScript !== 'function') { return; }",
    '    window.PerfilWikiLoaderRequested = true;',
    `    importScript(${safeJson(PROGRAM_PAGE)});`,
    '}());',
    MARKERS.activation.end,
  ].join('\n');
}

const CARD_FIELDS = Object.freeze({
  tenure: { id: 'perfilwiki-anos', label: 'Na Wikipédia', icon: '🌱', className: 'dan-pu-stat-tenure' },
  bestStreak: { id: 'dan-pu-ritmo-melhor-sequencia', label: 'Melhor sequência', icon: '🔥' },
  thanks: { id: 'dan-pu-agradecimentos', label: 'Agradecimentos recebidos', icon: '💛' },
  edits: { id: 'dan-pu-edicoes', label: 'Contribuições', icon: '✍️', className: 'dan-pu-stat-primary' },
  reverts: { id: 'dan-pu-reversoes', label: 'Reversões', icon: '🛡️' },
  edited: { id: 'dan-pu-editados', label: 'Artigos diferentes editados', icon: '🛠️' },
  articles: { id: 'dan-pu-artigos', label: 'Artigos criados', icon: '📚' },
  technicalCreated: { id: 'dan-pu-criados-tecnicos', label: 'Predefinições, módulos e scripts criados', icon: '🧩' },
  mostEditedArticle: { id: 'dan-pu-artigo-mais-editado', label: 'Artigo mais editado', icon: '📖' },
  bytesAdded: { id: 'dan-pu-bytes-acrescentados', label: 'Bytes acrescentados', icon: '➕' },
  bytesRemoved: { id: 'dan-pu-bytes-removidos', label: 'Bytes removidos', icon: '➖' },
  activeDays: { id: 'dan-pu-dias-com-edicoes', label: 'Dias com edições', icon: '📅' },
  articleEdits: { id: 'dan-pu-edicoes-em-artigos', label: 'Edições em artigos', icon: '' },
  talkEdits: { id: 'dan-pu-edicoes-em-discussoes', label: 'Edições em discussões', icon: '' },
  activeMonths: { id: 'dan-pu-meses-com-edicoes', label: 'Meses com edições', icon: '' },
  busiestDay: { id: 'dan-pu-dia-com-mais-edicoes', label: 'Dia com mais edições', icon: '' },
  edits30: { id: 'dan-pu-edicoes-30-dias', label: 'Edições nos últimos 30 dias', icon: '' },
  averagePerActiveDay: { id: 'dan-pu-media-por-dia-ativo', label: 'Média por dia ativo', icon: '' },
  activeYears: { id: 'dan-pu-anos-com-edicoes', label: 'Anos com edições', icon: '' },
  busiestMonth: { id: 'dan-pu-mes-com-mais-edicoes', label: 'Mês com mais edições', icon: '' },
  thanksSent: { id: 'dan-pu-agradecimentos-enviados', label: 'Agradecimentos enviados', icon: '' },
  averageBytesPerEdit: { id: 'dan-pu-media-bytes-por-edicao', label: 'Média de bytes acrescentados por edição', icon: '' },
  largestAddition: { id: 'dan-pu-maior-acrescimo', label: 'Maior acréscimo em uma edição', icon: '' },
  largestRemoval: { id: 'dan-pu-maior-remocao', label: 'Maior remoção em uma edição', icon: '' },
});

function stylesheet() {
  return `<templatestyles src="${htmlEscape(STYLES_PAGE)}" />`;
}

function rootAttributes(prepared) {
  return `data-perfilwiki-user="${htmlEscape(prepared.user)}" data-perfilwiki-project="pt.wikipedia.org" data-perfilwiki-appearance="${htmlEscape(safeJson(prepared.appearance))}" data-perfilwiki-rendered="pending" lang="${prepared.appearance.language}"`;
}

function appearanceClasses(appearance) {
  return `dan-pu-density-${appearance.density} dan-pu-align-${appearance.alignment} dan-pu-layout-${appearance.layout} dan-pu-initial-${appearance.initialPeriod} dan-pu-columns-${appearance.cardColumns}`;
}

function cardsBlock(prepared) {
  const appearance = prepared.appearance;
  const t=(source,params)=>I18n.t(appearance.language,source,params);
  const rows = [
    MARKERS.cards.start,
    `<div id="dan-pu-estatisticas" class="dan-pu-stats ${appearanceClasses(appearance)}" ${rootAttributes(prepared)} style="text-align:${appearance.alignment};border-top:3px solid ${appearance.accent};">`,
  ];
  const profile = profileMarkup(prepared, 'cards');
  if (profile) rows.push(`<div class="dan-pu-cards-profile" style="grid-column:1/-1;margin-bottom:8px;padding-bottom:12px;${appearance.profileDetailsLayout === 'inline' ? '' : 'border-bottom:1px solid #eaecf0;'}text-align:${appearance.nameAlignment};">${profile}</div>`);
  for (const id of appearance.metrics) {
    const field = CARD_FIELDS[id];
    const highlighted = appearance.highlightedMetrics.includes(id);
    const cardInk = highlighted ? readableForeground(appearance.highlightColor) : '#202122';
    const cardStyle = `background:${highlighted ? appearance.highlightColor : '#ffffff'};color:${cardInk};text-align:${appearance.alignment};${appearance.density === 'compact' ? 'padding:12px 14px;' : appearance.density === 'roomy' ? 'padding:24px 22px;' : ''}`;
    rows.push(`<div class="dan-pu-stat-card${field.className ? ` ${field.className}` : ''}" data-perfilwiki-metric="${id}" style="${cardStyle}"><div class="dan-pu-stat-icon" aria-hidden="true">${field.icon}</div><div class="dan-pu-stat-value" style="color:${cardInk};${appearance.density === 'compact' ? 'font-size:24px;' : appearance.density === 'roomy' ? 'font-size:32px;' : ''}"><span id="${field.id}">${t('Aguardando dados')}</span></div><div class="dan-pu-stat-label" style="color:${highlighted ? cardInk : '#54595d'};">${t(field.label)}</div></div>`);
  }
  if (footerOwner(appearance) === 'cards') rows.push(invitation(appearance.language));
  rows.push('</div>', MARKERS.cards.end);
  return rows.join('\n');
}

function profileMarkup(prepared, scope) {
  const markup = ActivityView.profileMarkup({config:{user:prepared.user}}, {...prepared,displayName:displayNameFor(prepared)}, true, scope);
  return pendingCreated(markup,prepared.appearance.language);
}

function pendingCreated(markup,language) {
  if(language!=='pt-BR')return markup;
  return markup.replace(/(<div class="dan-pu-account-created"[^>]*>)<strong style="font-weight:600;">Data de criação<\/strong> indisponível(<\/div>)/g, '$1<strong style="font-weight:600;">Conta criada em:</strong> Aguardando dados$2');
}

function activityBlock(prepared) {
  const appearance=prepared.appearance,t=(source,params)=>I18n.t(appearance.language,source,params);
  return [
    MARKERS.activity.start,
    `<div id="dan-pu-ritmo" class="${appearanceClasses(prepared.appearance)}" ${rootAttributes(prepared)} style="clear:both;box-sizing:border-box;margin:2.1em 0;padding:${prepared.appearance.density === 'compact' ? '18px' : prepared.appearance.density === 'roomy' ? '32px' : '24px'};border:1px solid #c8ccd1;border-top:3px solid ${prepared.appearance.accent};border-radius:12px;background:#fff;color:#202122;font-size:14px;line-height:1.5;">`,
    '<h2 style="margin:0 0 12px;font-size:22px;">'+t('Atividade na Wikipédia em Português')+'</h2>',
    profileMarkup(prepared, 'activity'),
    LayoutView.slotMarkup(prepared.appearance),
    '<p>'+t('Aguardando dados. Abra esta página na sua conta para iniciar a consulta pública.')+'</p>',
    ...(footerOwner(prepared.appearance) === 'activity' ? [invitation(appearance.language)] : []),
    '</div>',
    MARKERS.activity.end,
  ].join('\n');
}

function headerMarkup(prepared) {
  return pendingCreated(ProfileHeaderView.wikitext({config:{user:prepared.user,timeZone:prepared.timeZone}}, {...prepared,displayName:displayNameFor(prepared)}),prepared.appearance.language);
}

export function cardsSnippet(config) {
  const prepared = checkedConfig(config);
  if (!prepared.appearance.showCards) return '';
  return [`<!-- PerfilWiki ${INSTALLER_VERSION}. Candidato local, ainda não publicado. -->`, stylesheet(), ...(!prepared.appearance.showActivity || prepared.appearance.layout !== 'integrated' && prepared.appearance.blockOrder === 'cards-first' ? [headerMarkup(prepared)] : []), cardsBlock(prepared)].join('\n');
}

export function activitySnippet(config) {
  const prepared = checkedConfig(config);
  if (!prepared.appearance.showActivity) return '';
  return [`<!-- PerfilWiki ${INSTALLER_VERSION}. Candidato local, ainda não publicado. -->`, stylesheet(), ...(!prepared.appearance.showCards || prepared.appearance.layout !== 'integrated' && prepared.appearance.blockOrder === 'activity-first' ? [headerMarkup(prepared)] : []), activityBlock(prepared)].join('\n');
}

export function profileSnippet(config) {
  const prepared = checkedConfig(config);
  const rows = [
    `<!-- PerfilWiki ${INSTALLER_VERSION}. Candidato local, ainda não publicado. -->`,
    MARKERS.profile.start,
    stylesheet(),
  ];
  const appearance = prepared.appearance;
  const grouped = appearance.layout !== 'separate';
  if (grouped) rows.push(`<div data-perfilwiki-group="true" data-perfilwiki-user="${htmlEscape(prepared.user)}">`);
  let cards = appearance.showCards ? cardsBlock(prepared) : '';
  let activity = appearance.showActivity ? activityBlock(prepared) : '';
  if (!grouped && cards && activity) {
    const placement = '\n<!-- Posição dos blocos: coloque as caixas e a atividade nos pontos desejados da página, preservando seus textos e categorias. -->';
    if (appearance.blockOrder === 'cards-first') cards += placement;
    else activity += placement;
  }
  rows.push(LayoutView.compose(cards, activity, appearance, headerMarkup(prepared)));
  if (grouped) rows.push('</div>');
  rows.push(MARKERS.profile.end);
  const personalSections = ProfileSections.wikitext(prepared.contentSections, {user:prepared.user});
  if (personalSections) rows.push(personalSections);
  return rows.join('\n');
}

/** Builds a destination only. It neither opens an editor nor sends a request. */
export function editorUrl(title) {
  if (typeof title !== 'string' || !title.trim() || /[<>\[\]{}|#\u0000-\u001f\u007f]/u.test(title)) {
    throw new TypeError('Informe um título de página válido.');
  }
  const url = new URL('https://pt.wikipedia.org/w/index.php');
  url.searchParams.set('title', title);
  url.searchParams.set('action', 'edit');
  return url.href;
}

/** Copy/download metadata only. Publication remains a separate manual operation. */
export function installFiles(config) {
  const prepared = checkedConfig(config);
  const profileDestination = profileTitle(prepared);
  const specs = [
    { id: 'activation', title: 'Carregador pessoal', filename: 'Carregador_PerfilWiki.js', text: activationSnippet(prepared), summary: 'Configurar o PerfilWiki e suas opções de aparência', destination: `Usuário:${prepared.user}/common.js` },
    { id: 'profile', title: 'Caixas e atividade', filename: 'PerfilWiki_inicial.wiki', text: profileSnippet(prepared), summary: 'Adicionar os blocos do PerfilWiki', destination: profileDestination },
  ];
  const integrated = prepared.appearance.layout === 'integrated' && prepared.appearance.showCards && prepared.appearance.showActivity;
  if (prepared.appearance.showCards && !integrated) specs.push({ id: 'cards', title: 'Caixas de estatísticas', filename: 'Caixas_iniciais.wiki', text: cardsSnippet(prepared), summary: 'Adicionar as caixas de estatísticas do PerfilWiki', destination: profileDestination });
  if (prepared.appearance.showActivity && !integrated) specs.push({ id: 'activity', title: 'Painel de atividade', filename: 'Atividade_inicial.wiki', text: activitySnippet(prepared), summary: 'Adicionar o painel de atividade do PerfilWiki', destination: profileDestination });
  return specs.map((file) => ({ ...file, editorUrl: editorUrl(file.destination) }));
}

function occurrences(text, value) {
  return text.split(value).length - 1;
}

export function appendDemo(existing, snippet) {
  if (typeof existing !== 'string' || typeof snippet !== 'string') throw new TypeError('O texto e o bloco precisam ser texto.');
  const marker = Object.values(MARKERS).find(({ start, end }) => occurrences(snippet, start) === 1 && occurrences(snippet, end) === 1);
  if (!marker) throw new TypeError('Use um bloco completo do PerfilWiki.');
  if (/PERFILWIKI-PROTOTYPE-(?:ACTIVATION|PROFILE)-(?:BEGIN|END)/u.test(existing)) throw new Error('Há um bloco antigo do protótipo neste texto. Confira o rascunho antes de continuar.');
  const startCount = occurrences(existing, marker.start);
  const endCount = occurrences(existing, marker.end);
  if (startCount > 0 || endCount > 0) {
    if (startCount === 1 && endCount === 1 && existing.includes(snippet)) return existing;
    throw new Error('Já existe um bloco do PerfilWiki diferente ou incompleto neste texto. Confira o rascunho antes de continuar.');
  }
  const separator = !existing ? '' : /\r?\n\r?\n$/u.test(existing) ? '' : /\r?\n$/u.test(existing) ? '\n' : '\n\n';
  return existing + separator + snippet;
}

export function initialEditorText(kind, config) {
  if (kind === 'activation') return '// Seus outros scripts continuam aqui.\n// Este é um editor de demonstração local.';
  if (kind === 'profile') {
    const user = normalizeUser(config?.user) || 'Exemplo';
    return `== Sobre mim ==\nOlá! Esta é a página de ${htmlEscape(user)}.\n\n== Meus projetos ==\n* Um projeto que já estava na página.`;
  }
  throw new TypeError('Escolha o editor de ativação ou o editor da página.');
}
