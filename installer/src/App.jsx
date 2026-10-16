import {LanguageProvider,useI18n,I18n} from './i18n.jsx';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ColorPicker } from './ColorPicker.jsx';
import { ProfilePreview } from './DashboardPreview.jsx';
import { InstallationCheck } from './InstallationCheck.jsx';
import { THEMES, PERIODS, DEFAULT_APPEARANCE, createInitialConfig, normalizeUser, validateConfig, profileTitle, moveMetricTo, hexColorValid, readableForeground, appendDemo, initialEditorText, editorUrl, installFiles, detectWikiAccount, RELEASE_VERSION, importChoices } from './model.mjs';

import { listCommonTimeZones, groupTimeZones } from './timezones.mjs';
import './sidebar-profile.css';
import { validPreviewRange } from './preview-actions.mjs';
import { customFieldItems, customFieldItemColors, changeCustomItem, changeCustomItemColor, changeCustomLayout, addCustomItem, removeCustomItem } from './custom-fields.mjs';
import { readPanelSession, writePanelSession, navigatePanelSession } from './panel-session.mjs';
import {receiveLivePanel,LiveEdit} from './live-edit.mjs';

const STEPS = ['Personalize', 'Instalação'];

const clone = value => JSON.parse(JSON.stringify(value));

function recentCustomRange(now = Date.now()) {
  const date = new Date(now), end = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) - 86400000;
  return { start: new Date(end - 29 * 86400000).toISOString().slice(0, 10), end: new Date(end).toISOString().slice(0, 10) };
}

export function PlacementSelect({ id, label, value = 'inherit', defaultPlacement = 'top', onChange }) {
  const {t}=useI18n();
  const inheritedLabel = {top:t("Padrão, no topo"),activity:t("Padrão, na atividade"),cards:t("Padrão, nas caixas"),both:t("Padrão, atividade e caixas"),all:t("Padrão, todas as áreas")}[defaultPlacement] || t("Padrão, no topo");
  return <div className="profile-placement-field"><label htmlFor={id}>{label}</label><select id={id} value={value} onChange={event => onChange(event.target.value)}><option value="inherit">{t(inheritedLabel)}</option><option value="top">{t("No topo")}</option><option value="activity">{t("Na atividade")}</option><option value="cards">{t("Nas caixas")}</option><option value="top-activity">{t("Topo e atividade")}</option><option value="top-cards">{t("Topo e caixas")}</option><option value="both">{t("Atividade e caixas")}</option><option value="all">{t("Em todas as áreas")}</option><option value="hidden">{t("Ocultar")}</option></select></div>;
}

export function PhotoPlacementSelect({ value = 'top', onChange }) {
  const {t}=useI18n();
  const selected = ['top','activity','top-activity','hidden'].includes(value) ? value : 'top';
  return <div className="profile-placement-field"><label htmlFor="photo-placement">{t("Mostrar foto")}</label><select id="photo-placement" value={selected} onChange={event=>onChange(event.target.value)}><option value="top">{t("No topo, padrão")}</option><option value="activity">{t("Na atividade")}</option><option value="top-activity">{t("Topo e atividade")}</option><option value="hidden">{t("Ocultar")}</option></select></div>;
}

export function AlignmentControl({ name, label, value, onChange, compact = false }) {
  const {t}=useI18n();
  return <fieldset className={'alignment-control' + (compact ? ' alignment-compact' : '')}><legend>{label}</legend><div className="alignment-icons">{[['left',t("À esquerda")],['center',t("Centralizado")],['right',t("À direita")]].map(([choice,text]) => <label key={choice} title={t(text)}><input className="sr-only" type="radio" name={name} value={choice} checked={value === choice} onChange={() => onChange(choice)} /><span className="alignment-icon"><svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false">{[5,10,15,20].map((y,index) => <line key={y} x1={index % 2 === 0 || choice === 'left' ? 3 : choice === 'right' ? 9 : 6} y1={y} x2={index % 2 === 0 || choice === 'right' ? 21 : choice === 'left' ? 15 : 18} y2={y} />)}</svg><span className="sr-only">{t(text)}</span></span></label>)}</div></fieldset>;
}

function SettingsGroup({id,title,open,onToggle,children}) {
  const {t}=useI18n();
  return <section className="settings-group"><button type="button" className="settings-group-title" aria-expanded={open} aria-controls={'settings-'+id} onClick={onToggle}><span>{title}</span><span aria-hidden="true">{open ? '−' : '+'}</span></button><div className="settings-group-panel" id={'settings-'+id} hidden={!open}>{children}</div></section>;
}

export function TextColorControl({ id, label, value = '', fallback = '#202122', automaticLabel = 'Automática', onChange }) {
  const {t}=useI18n();
  const [draft, setDraft] = useState(value || fallback);
  useEffect(() => setDraft(value || fallback), [value, fallback]);
  function chooseColor(next) {
    setDraft(next);
    if (hexColorValid(next)) onChange(next.toLowerCase());
  }
  return <div className="profile-text-color-control">
    <label htmlFor={id + '-mode'}>{label}</label>
    <select id={id + '-mode'} value={value ? 'custom' : 'automatic'} onChange={event => onChange(event.target.value === 'custom' ? fallback : '')}>
      <option value="automatic">{t(automaticLabel)}</option><option value="custom">{t("Personalizada")}</option>
    </select>
    {value && <div className="profile-text-color-inputs">
      <ColorPicker id={id} label={label} value={value} onChange={chooseColor} compact />
      <input aria-label={t('Código da {label}',{label:label.toLowerCase()})} value={draft} maxLength={7} spellCheck="false" onChange={event => chooseColor(event.target.value)} onBlur={() => setDraft(value)} />
    </div>}
  </div>;
}

export function CustomFieldEditor({ field, index, integrated, defaultPlacement, invalid, labelColor = '#202122', informationColor = '#202122', onChange, onRemove }) {
  const {t}=useI18n();
  const items=customFieldItems(field), itemColors=customFieldItemColors(field), grouped=Array.isArray(field.values);
  return <div className="profile-custom-field profile-custom-group">
    <label htmlFor={'custom-field-label-' + index}>{t("Rótulo")}<input id={'custom-field-label-' + index} aria-label={t('Rótulo da informação {number}',{number:index+1})} value={field.label} placeholder={t("Ex.: Formação")} onChange={event => onChange({...field,label:event.target.value})} aria-invalid={invalid} /></label>
    <TextColorControl id={'custom-field-label-color-' + index} label={t('Cor do rótulo {number}',{number:index+1})} value={field.labelColor} fallback={labelColor} automaticLabel={t("Padrão do perfil")} onChange={value=>onChange({...field,labelColor:value})} />
    <div className="custom-field-items">{items.map((value,itemIndex)=><div className="custom-field-item" key={itemIndex}><div className="custom-field-item-input"><label htmlFor={'custom-field-value-' + index + '-' + itemIndex}>{grouped ? t('Item {number}',{number:itemIndex+1}) : <>{t("Informação")} <span className="optional-field">{t("opcional")}</span></>}<input id={'custom-field-value-' + index + '-' + itemIndex} aria-label={t('Item {item} da informação {number}',{item:itemIndex+1,number:index+1})} value={value} placeholder={t('Ex.: [[Universidade Federal de Minas Gerais|UFMG]]')} onChange={event=>onChange(changeCustomItem(field,itemIndex,event.target.value))} aria-invalid={invalid} /></label>{grouped&&<button type="button" className="text-button custom-item-remove" aria-label={t('Remover item {item} da informação {number}',{item:itemIndex+1,number:index+1})} disabled={items.length===1} onClick={()=>onChange(removeCustomItem(field,itemIndex))}>×</button>}</div><TextColorControl id={'custom-field-item-color-' + index + '-' + itemIndex} label={t('Cor do item {item} da informação {number}',{item:itemIndex+1,number:index+1})} value={itemColors[itemIndex]} fallback={informationColor} automaticLabel={t("Padrão do perfil")} onChange={color=>onChange(changeCustomItemColor(field,itemIndex,color))} /></div>)}<button type="button" className="text-button custom-item-add" onClick={()=>onChange(addCustomItem(field))} disabled={items.length>=8}>{t("+ Adicionar item")}</button></div>
    {<div className="custom-field-arrangement"><label htmlFor={'custom-field-layout-' + index}>{t("Disposição das informações")}<select aria-label={t('Disposição da informação {number}',{number:index+1})} id={'custom-field-layout-' + index} value={field.layout || 'inline'} onChange={event=>onChange(changeCustomLayout(field,event.target.value))}><option value="inline">{t("Na mesma linha")}</option><option value="lines">{t("Um por linha")}</option><option value="bullets">{t("Lista com marcadores")}</option></select></label>{(field.layout || 'inline')==='inline'&&<label htmlFor={'custom-field-separator-' + index}>{t("Separação")}<select id={'custom-field-separator-' + index} value={field.separator || 'pipe'} onChange={event=>onChange({...changeCustomLayout(field,field.layout || 'inline'),separator:event.target.value})}><option value="pipe">{t("Barra vertical |")}</option><option value="dot">{t("Ponto ·")}</option><option value="space">{t("Espaço")}</option></select></label>}</div>}
    <PlacementSelect defaultPlacement={defaultPlacement} integrated={integrated} id={'custom-field-placement-' + index} label={t('Mostrar informação {number}',{number:index+1})} value={field.placement} onChange={value=>onChange({...field,placement:value})} />
    <button type="button" className="secondary custom-group-remove" aria-label={t('Remover informação {number}',{number:index+1})} onClick={onRemove}>×</button>
  </div>;
}

export function App() {
  const [initialSession] = useState(() => readPanelSession(window));
  const [config, setConfig] = useState(() => initialSession?.config || createInitialConfig());
  const language=config.appearance.language || 'pt-BR';
  const t=(source,params)=>I18n.t(language,source,params);
  const [mode, setMode] = useState(() => initialSession?.config ? initialSession.mode : 'customize');
  const [zoneDate] = useState(() => new Date());
  const [accountFromSession] = useState(() => detectWikiAccount(window));
  const [liveSource,setLiveSource] = useState(() => initialSession?.liveSource || null);
  const [handoffPending,setHandoffPending] = useState(() => !!LiveEdit.nonceFromUrl(window.location.href));
  const identifiedAccount=accountFromSession || liveSource?.user || '';
  const hostedInstaller=window.location.hostname==='danrego.github.io'&&window.location.pathname.startsWith('/PerfilWiki/');
  const [step, setStep] = useState(1);
  const [furthest, setFurthest] = useState(1);
  const [rawErrors, setErrors] = useState({});
  const errors=Object.fromEntries(Object.entries(rawErrors).map(([key,value])=>[key,t(value)]));
  const [saved, setSaved] = useState({});
  const [toast, setToast] = useState(() => initialSession?.error || '');
  const [editor, setEditor] = useState(null);
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState('');
  const [draft, setDraft] = useState('');
  const [draftError, setDraftError] = useState('');
  const [draftPreview, setDraftPreview] = useState(false);
  const [draftPeriod, setDraftPeriod] = useState('30d');
  const [draftRange, setDraftRange] = useState(null);
  const [openCode, setOpenCode] = useState({});
  const [manualCopy, setManualCopy] = useState(null);
  const [colorText, setColorText] = useState(config.appearance.accent);
  const [highlightText, setHighlightText] = useState(config.appearance.highlightColor);
  const [topBackgroundText, setTopBackgroundText] = useState(config.appearance.topBackground || '#ffffff');
  const [customStart, setCustomStart] = useState(() => (config.appearance.customRange || recentCustomRange()).start);
  const [customEnd, setCustomEnd] = useState(() => (config.appearance.customRange || recentCustomRange()).end);
  const [customError, setCustomError] = useState('');
  const [settingsGroup, setSettingsGroup] = useState(() => window.matchMedia?.('(min-width: 701px)').matches ? 'profile' : null);
  const titleRef = useRef(null);
  const sessionToken = useRef(initialSession?.config ? initialSession.token : null);
  const currentConfig = useRef(config);
  currentConfig.current = config;
  const userRef = useRef(null);
  const dialogRef = useRef(null);
  const importRef = useRef(null);
  const importOpener = useRef(null);
  const editorOpener = useRef(null);
  const copyRefs = useRef({});
  const editorRef = useRef(null);
  const preparedFilesRef = useRef(null);
  const accent = config.appearance.accent;
  const fg = readableForeground(accent);
  const user = normalizeUser(config.user);
  const completed = !!saved.activation && !!saved.profile;
  const configKey = JSON.stringify(config);
  const zoneOptions = useMemo(() => listCommonTimeZones({ selectedTimeZone: config.timeZone, date: zoneDate,language }), [config.timeZone, zoneDate,language]);
  const zoneGroups = useMemo(() => groupTimeZones(zoneOptions), [zoneOptions]);
  const maxCustomDate = recentCustomRange().end;
  useEffect(()=>{document.documentElement.lang=language;document.title=t('PerfilWiki · instalação e personalização');},[language]);
  useEffect(()=>receiveLivePanel({host:window,onReceive:({config:received,liveSource:source})=>{
    setConfig(received);setLiveSource(source);setHandoffPending(false);setMode('customize');setStep(1);setFurthest(1);setSaved({});setErrors({});
    setColorText(received.appearance.accent);setHighlightText(received.appearance.highlightColor);setTopBackgroundText(received.appearance.topBackground);
    const range=received.appearance.customRange||recentCustomRange();setCustomStart(range.start);setCustomEnd(range.end);setCustomError('');setSettingsGroup('profile');
    const token=writePanelSession(received,window,null,{liveSource:source});
    if(token){sessionToken.current=token;navigatePanelSession('customize',token,window,{replace:true});}
    setToast(source.page ? 'Escolhas e texto público recebidos. Confira a prévia e salve as alterações manualmente na Wikipédia.' : 'Escolhas recebidas. O texto público não pôde ser recuperado. Preserve sua página ao copiar os novos trechos.');
  },onError:message=>{setHandoffPending(false);setToast(message);}}),[]);

  function update(next) {
    setConfig(prev => typeof next === 'function' ? next(prev) : { ...prev, ...next });
    setSaved(previous=>liveSource&&previous.profile?{profile:previous.profile}:{}); setToast(''); setErrors({});
  }
  function addContentSection(title = '') { update(previous=>({...previous,contentSections:previous.contentSections.length<8?[...previous.contentSections,{title,content:''}]:previous.contentSections})); setSettingsGroup('texts'); }
  function changeContentSection(index, patch) { update(previous=>({...previous,contentSections:previous.contentSections.map((section,position)=>position===index?{...section,...patch}:section)})); }
  function moveContentSection(index, direction) { update(previous=>{const sections=[...previous.contentSections],target=index+direction;if(target>=0&&target<sections.length)[sections[index],sections[target]]=[sections[target],sections[index]];return {...previous,contentSections:sections};}); }
  function editContentSection(index) { if(!Number.isInteger(index)||index<0||index>=config.contentSections.length)return; setSettingsGroup('texts'); requestAnimationFrame(()=>document.getElementById('content-section-body-'+index)?.focus()); }
  function openImport() { importOpener.current=document.activeElement; setImportText('');setImportError('');setImportOpen(true); }
  function closeImport() { importRef.current?.close();setImportOpen(false);requestAnimationFrame(()=>importOpener.current?.focus()); }
  function loadChoices() {
    try {
      const restored=importChoices(importText);if(identifiedAccount && restored.user!==identifiedAccount)throw new TypeError(t("As escolhas são de outra conta. Use um arquivo da conta identificada nesta página."));update(restored);setColorText(restored.appearance.accent);setHighlightText(restored.appearance.highlightColor);setTopBackgroundText(restored.appearance.topBackground);const range=restored.appearance.customRange||recentCustomRange();setCustomStart(range.start);setCustomEnd(range.end);setStep(1);setFurthest(1);setSettingsGroup('profile');closeImport();setToast(t("Escolhas carregadas nesta aba. Confira a prévia antes de preparar os novos trechos."));
    } catch(error) {setImportError(error.message);}
  }
  function addCustomField() { update(prev => ({ ...prev, customFields: prev.customFields.length < 3 ? [...prev.customFields, { label: '', value: '' }] : prev.customFields })); }
  function removeCustomField(index) { update(prev => ({ ...prev, customFields: prev.customFields.filter((_, current) => current !== index) })); }
  function appearance(patch) { update(prev => ({ ...prev, appearance: { ...prev.appearance, ...patch } })); }
  function profilePlacement(field, value) { update(prev => ({ ...prev, appearance: { ...prev.appearance, profilePlacements: { ...prev.appearance.profilePlacements, [field]: value } } })); }
  function chooseInitialPeriod(value) {
    if (value === 'custom') {
      const range = config.appearance.customRange || recentCustomRange();
      setCustomStart(range.start); setCustomEnd(range.end); setCustomError('');
      appearance({ initialPeriod: 'custom', customRange: range });
    } else appearance({ initialPeriod: value });
  }
  function applyCustomRange(range = { start: customStart, end: customEnd }) {
    if (!validPreviewRange(range)) { setCustomError(t("Escolha datas válidas entre 1 de julho de 2015 e ontem em UTC, com início até o fim.")); return; }
    setCustomStart(range.start); setCustomEnd(range.end); setCustomError('');
    appearance({ customRange: range, initialPeriod: 'custom' });
  }
  function go(next) {
    if (next > 1) {
      const check = validateConfig(config);
      if (!check.valid) { setErrors(check.errors); if(check.errors.contentSections){setStep(1);setSettingsGroup('texts');requestAnimationFrame(()=>document.getElementById('content-section-title-0')?.focus());return;} if (check.errors.user || check.errors.displayName || check.errors.location || check.errors.photo || check.errors.coverImage || check.errors.customFields || check.errors.timeZone || check.errors.subpage) { setStep(1); setSettingsGroup('profile'); requestAnimationFrame(() => { if (check.errors.user) userRef.current?.focus(); else document.getElementById(check.errors.displayName ? 'display-name' : check.errors.location ? 'profile-location' : check.errors.photo ? 'profile-photo' : check.errors.coverImage ? 'profile-cover' : check.errors.customFields ? 'custom-field-label-0' : check.errors.timeZone ? 'timezone' : 'subpage')?.focus(); }); } else { setSettingsGroup('content'); } return; }
    }
    setErrors({}); setStep(next); setFurthest(prev => Math.max(prev, next)); setToast('');
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
  function savePanelSession() {
    const token = writePanelSession(config, window, sessionToken.current,{liveSource:currentLiveSource()});
    if (token) sessionToken.current = token;
    return token;
  }
  function viewPanel() {
    if (!validateConfig(config).valid) { go(2); return; }
    closeColorPickers();
    const token = savePanelSession();
    const recoverable = token && navigatePanelSession('panel', token, window);
    setMode('panel');
    setToast(recoverable ? '' : t("O painel pode ser editado nesta aba. Não foi possível guardar as escolhas para recarregar a página."));
    window.scrollTo({ top: 0, behavior: 'instant' });
    requestAnimationFrame(() => titleRef.current?.focus({ preventScroll: true }));
  }
  function editPanel() {
    const token = savePanelSession();
    if (token) navigatePanelSession('customize', token, window);
    setMode('customize'); setStep(1); setSettingsGroup('profile');
    window.scrollTo({ top: 0, behavior: 'instant' });
    requestAnimationFrame(() => titleRef.current?.focus({ preventScroll: true }));
  }
  useEffect(() => { if (step > 1) titleRef.current?.focus({ preventScroll: true }); }, [step]);
  useEffect(() => {
    if (sessionToken.current && validateConfig(config).valid) writePanelSession(config, window, sessionToken.current,{liveSource:currentLiveSource()});
  }, [configKey,liveSource]);
  useEffect(() => {
    function restorePanelSession() {
      const restored = readPanelSession(window);
      if (!restored?.config) {
        setMode('customize'); setStep(1);
        if (restored?.error) setToast(restored.error);
        return;
      }
      if (restored.token === sessionToken.current) {
        const complete = validateConfig(currentConfig.current).valid;
        setMode(complete ? restored.mode : 'customize'); setStep(1);
        if (!complete) {
          navigatePanelSession('customize', restored.token, window, { replace: true });
          setToast(t("Há ajustes incompletos nesta aba. Suas alterações foram mantidas. Confira os campos antes de abrir o painel."));
        }
        return;
      }
      sessionToken.current = restored.token;
      setLiveSource(restored.liveSource || null);
      setConfig(restored.config); setMode(restored.mode); setStep(1); setSaved({}); setErrors({});
      setColorText(restored.config.appearance.accent); setHighlightText(restored.config.appearance.highlightColor); setTopBackgroundText(restored.config.appearance.topBackground);
      const range = restored.config.appearance.customRange || recentCustomRange();
      setCustomStart(range.start); setCustomEnd(range.end); setCustomError(''); setToast('');
    }
    window.addEventListener('popstate', restorePanelSession);
    return () => window.removeEventListener('popstate', restorePanelSession);
  }, []);
  useEffect(() => {
    const dialog = dialogRef.current;
    if (editor && dialog && !dialog.open) dialog.showModal();
    if (!editor && dialog?.open) dialog.close();
  }, [editor]);
  useEffect(() => {if(importOpen&&importRef.current&&!importRef.current.open)importRef.current.showModal();},[importOpen]);
  useEffect(() => {
    if (manualCopy) { copyRefs.current[manualCopy.kind]?.focus(); copyRefs.current[manualCopy.kind]?.select(); }
  }, [manualCopy]);

  function chooseTheme(theme) { setColorText(theme.accent); appearance({ theme: theme.id, accent: theme.accent }); }
  function customColor(value) {
    setColorText(value);
    if (hexColorValid(value)) appearance({ theme: 'custom', accent: value.toLowerCase() });
  }
  function toggleMetric(id) {
    const selected = config.appearance.metrics;
    if (selected.includes(id)) {
      if (selected.length === 1) { setToast(t('Mantenha ao menos um contador selecionado.')); return; }
      appearance({ metrics: selected.filter(item => item !== id) });
    } else appearance({ metrics: [...selected, id] });
  }
  function toggleHighlight(id) {
    const selected = config.appearance.highlightedMetrics;
    appearance({ highlightedMetrics: selected.includes(id) ? selected.filter(metric => metric !== id) : [...selected, id] });
  }
  function changeHighlightColor(value) {
    setHighlightText(value);
    if (hexColorValid(value)) appearance({ highlightColor: value.toLowerCase() });
  }
  function changeTopBackground(value) {
    setTopBackgroundText(value);
    if (hexColorValid(value)) appearance({ topBackground:value.toLowerCase() });
  }
  function moveCounter(id, target) {
    appearance({ metrics: moveMetricTo(config.appearance.metrics, id, target) });
    setToast(t('Contador movido para a posição {number}.',{number:target+1}));
  }
  function togglePanel(key) {
    const other = key === 'showCards' ? 'showActivity' : 'showCards';
    if (config.appearance[key] && !config.appearance[other]) { setToast(t("Mantenha ao menos um bloco na prévia.")); return; }
    appearance({ [key]: !config.appearance[key] });
  }
  function restoreAppearance() { const defaults = {...clone(DEFAULT_APPEARANCE),language}; update(prev => ({ ...prev, appearance: defaults })); setColorText(defaults.accent); setHighlightText(defaults.highlightColor); setTopBackgroundText(defaults.topBackground); setToast(t("Aparência padrão restaurada. Sua conta foi mantida.")); }
  function closeColorPickers() {
    document.querySelectorAll('.color-popover:popover-open').forEach(panel => panel.hidePopover());
  }
  function toggleSettingsGroup(id) {
    closeColorPickers();
    setSettingsGroup(current => current === id ? null : id);
  }
  function preparedFiles() {
    if (preparedFilesRef.current?.configKey !== configKey) preparedFilesRef.current = {configKey,files:installFiles(config)};
    return preparedFilesRef.current.files;
  }
  function snippet(kind) { return preparedFiles().find(file => file.id === kind).text; }
  function profileDelivery(){
    const prepared=snippet('profile');
    if(!liveSource)return {text:prepared,complete:false};
    const draft=saved.profile;
    if(draft){
      if(draft.destination!==profileTitle(config)||!LiveEdit.hasProfile(draft.text))return {text:prepared,complete:false,draftConflict:true};
      return {text:draft.configKey===configKey?draft.text:LiveEdit.replaceProfile(draft.text,prepared),complete:true};
    }
    const original=currentLiveSource()?.page?.content;
    if(typeof original==='string'&&LiveEdit.hasProfile(original))return {text:LiveEdit.replaceProfile(original,prepared),complete:true};
    return {text:prepared,complete:false};
  }
  function deliveryText(kind){return kind==='profile'?profileDelivery().text:snippet(kind);}
  async function copySnippet(kind) {
    const text = deliveryText(kind);
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(text); setToast(t("Código completo copiado. Confira o destino antes de colar."));
    } catch (_) { setOpenCode(prev => ({ ...prev, [kind]: true })); setManualCopy({ kind }); setToast(t("Texto completo selecionado. Copie pelo teclado e use no editor local.")); }
  }
  async function copySummary(kind) {
    const text = preparedFiles().find(file => file.id === kind).summary;
    try { await navigator.clipboard.writeText(text); setToast(t("Resumo de edição copiado.")); }
    catch (_) { setOpenCode(previous => ({ ...previous, [kind]: true })); setManualCopy({ kind: kind + '-summary' }); setToast(t("Resumo selecionado. Copie pelo teclado.")); }
  }
  function download(name, text, type = 'text/plain;charset=utf-8') {
    const url = URL.createObjectURL(new Blob([text], { type }));
    const link = document.createElement('a'); link.href = url; link.download = name; link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function currentLiveSource(){return liveSource?{...liveSource,page:liveSource.page?.title===profileTitle(config)?liveSource.page:null}:null;}
  function requiredSnippet(kind){return kind==='profile'&&liveSource?LiveEdit.managedBlock(snippet(kind)):snippet(kind);}
  function openEditor(kind) { editorOpener.current = document.activeElement; setDraft(saved[kind]?.text || (kind==='profile'&&currentLiveSource()?.page ? currentLiveSource().page.content : initialEditorText(kind, config))); setDraftError(''); setDraftPreview(false); setDraftPeriod(config.appearance.initialPeriod); setDraftRange(config.appearance.customRange); setEditor(kind); }
  function closeEditor() { dialogRef.current?.close(); setEditor(null); requestAnimationFrame(() => editorOpener.current?.focus()); }
  function insertDemo() {
    try { const text = editor==='profile'&&liveSource ? LiveEdit.replaceProfile(draft,snippet(editor)) : appendDemo(draft, snippet(editor)); setDraft(text); setDraftError(''); setDraftPreview(false); }
    catch (error) { setDraftError(error.message); }
  }
  function saveDraft() {
    if (!draft.includes(requiredSnippet(editor))) { setDraftError(t("Adicione o trecho preparado antes de salvar esta simulação.")); editorRef.current?.focus(); return; }
    if(editor==='profile'&&liveSource){try{if(LiveEdit.managedBlock(draft)!==requiredSnippet(editor))throw new TypeError('Há marcas incompletas ou repetidas do PerfilWiki. Confira o texto antes de substituir o painel.');}catch(error){setDraftError(error.message);return;}}
    setSaved(prev => ({ ...prev, [editor]: { text: draft, configKey,...(editor==='profile'&&liveSource?{destination:profileTitle(config)}:{}) } }));
    setToast(editor === 'activation' ? t("Ativação salva no editor local.") : t("Bloco salvo na página simulada.")); closeEditor();
  }

  return (
    <LanguageProvider language={language}><div className="app" lang={language} style={{ '--accent': accent, '--accent-fg': fg }}>
      <header className="site-header"><div className="header-inner"><a className="wordmark" href="#" onClick={event => { event.preventDefault(); mode === 'panel' ? editPanel() : go(1); }}>PerfilWiki<span>{t("Monte o seu painel")}</span></a><span className="local-label">PerfilWiki {RELEASE_VERSION} {hostedInstaller ? '' : t("· teste local")}</span><label className="interface-language">{t("Idioma")} <select aria-label={t("Idioma da interface")} value={language} onChange={event=>appearance({language:event.target.value})}>{I18n.languages.map(code=><option key={code} value={code}>{I18n.languageNames[code]}</option>)}</select></label></div></header>
      <main className="workspace">
        {handoffPending && <p role="status">{t('Aguardando as escolhas da página da Wikipédia. Mantenha a página original aberta.')}</p>}
        {mode === 'customize' && <nav className="stepper" aria-label={t("Etapas de configuração")}><ol>{STEPS.map((label, index) => { const number = index + 1; return <li key={label} className={step === number ? 'current' : step > number ? 'visited' : ''}><button type="button" aria-current={step === number ? 'step' : undefined} disabled={number > furthest} onClick={() => go(number)}><span className="step-number">{number}</span><span>{t(label)}</span></button></li>; })}</ol></nav>}

        {mode === 'panel' && <section className="local-panel-screen" aria-labelledby="local-panel-heading"><div className="screen-title"><div><p className="eyebrow">{t(hostedInstaller ? "Seu PerfilWiki" : "PAINEL LOCAL")}</p><h1 id="local-panel-heading" ref={titleRef} tabIndex={-1}>{t("Seu PerfilWiki")}</h1></div></div><ProfilePreview config={config} onEditPanel={editPanel} onPeriodChange={chooseInitialPeriod} onCustomRangeChange={applyCustomRange} /></section>}

        {mode === 'customize' && step === 1 && <section aria-labelledby="step-heading"><div className="screen-title"><div><p className="eyebrow">{t("ETAPA 1 DE 2")}</p><h1 id="step-heading" ref={titleRef} tabIndex={-1}>{t("Personalize seu painel")}</h1><p className="lead">{t("A prévia muda junto com as suas escolhas.")}</p></div><div className="screen-title-actions"><button className="secondary" onClick={viewPanel}>{t("Ver painel")}</button><button className="text-button" onClick={openImport}>{t("Carregar minhas escolhas")}</button><button className="text-button" onClick={restoreAppearance}>{t("Restaurar aparência padrão")}</button></div></div>
          <nav className="preview-jumps" aria-label={t("Navegação da personalização")}><a href="#appearance-settings">{t("Ajustes")}</a><a href="#profile-preview">{t("Ver prévia")}</a></nav><div className="customize-grid"><aside id="appearance-settings" className="settings settings-compact" aria-label={t("Personalização do painel")}><h2 className="settings-title">{t("Ajustes")}</h2>{errors.appearance && <p className="field-error" role="alert">{errors.appearance}</p>}
            <SettingsGroup id="profile" title={t("Seu perfil")} open={settingsGroup === 'profile'} onToggle={() => toggleSettingsGroup('profile')}><form className="profile-settings-form" noValidate onSubmit={event => { event.preventDefault(); go(2); }}>
              {identifiedAccount ? <div className="field detected-account"><span className="detected-account-label">{t("Conta da Wikipédia")}</span><strong id="detected-wiki-account">{identifiedAccount}</strong><p className="field-help">{t(liveSource ? "Conta recebida do painel da Wikipédia, sem consultar seu login." : "Conta identificada nesta página, sem consultar seu login.")}</p></div> : <div className="field"><label htmlFor="username">{t("Conta da Wikipédia")} <span className="required-field" aria-hidden="true">*</span><span className="sr-only">{t(", obrigatório")}</span></label><input ref={userRef} id="username" name="username" aria-label={t("Conta da Wikipédia")} required aria-required="true" autoComplete="off" spellCheck="false" value={config.user} placeholder={t('Ex.: Marina Exemplo')} onChange={event => update({ user: event.target.value })} aria-invalid={!!errors.user} aria-describedby={errors.user ? 'user-error' : 'user-help'} /><p className={errors.user ? 'field-error' : 'field-help'} id={errors.user ? 'user-error' : 'user-help'}>{errors.user || (accountFromSession ? t("Conta preenchida pela sessão da Wikipédia.") : t("Campo obrigatório. Informe o nome exato da conta, sem \"Usuário:\"."))}</p></div>}
              <div className="field"><label htmlFor="display-name">{t("Nome de exibição")} <span className="optional-field">{t("opcional")}</span></label><input id="display-name" name="displayName" autoComplete="off" value={config.displayName} placeholder={user || t("Como seu nome deve aparecer")} onChange={event => update({ displayName: event.target.value })} aria-invalid={!!errors.displayName} aria-describedby="display-name-help" /><p id="display-name-help" className={errors.displayName ? 'field-error' : 'field-help'}>{errors.displayName || t("Deixe em branco para usar o nome da conta. As estatísticas continuam sendo da conta informada acima.")}</p><div className="name-format-controls"><div className="name-size-control"><label htmlFor="name-font-size">{t("Tamanho do nome")}</label><select id="name-font-size" value={config.appearance.nameFontSize ?? 24} onChange={event=>appearance({nameFontSize:Number(event.target.value)})}>{[16,20,24,28,32,36].map(size=><option key={size} value={size}>{size} px</option>)}</select></div><AlignmentControl compact name="name-alignment" label={t("Alinhamento do nome de exibição")} value={config.appearance.nameAlignment} onChange={value=>appearance({nameAlignment:value})} /></div><TextColorControl id="name-color" label={t("Cor do nome")} value={config.appearance.nameColor} fallback={readableForeground(config.appearance.topBackground || '#ffffff')} onChange={value=>appearance({nameColor:value})} /><PlacementSelect defaultPlacement={config.appearance.profilePlacement} integrated={config.appearance.layout === 'integrated'} id="name-placement" label={t("Mostrar nome")} value={config.appearance.profilePlacements?.name} onChange={value => profilePlacement('name', value)} /></div>
              <div className="field"><label htmlFor="profile-location">{t("Localização")} <span className="optional-field">{t("opcional")}</span></label><input id="profile-location" name="location" autoComplete="off" value={config.location} placeholder={t("Ex.: Belo Horizonte")} onChange={event => update({ location: event.target.value })} aria-invalid={!!errors.location} aria-describedby="location-help" /><p id="location-help" className={errors.location ? 'field-error' : 'field-help'}>{errors.location || t("Pode usar [[Belo Horizonte]] ou [[Belo Horizonte|BH]].")}</p><PlacementSelect defaultPlacement={config.appearance.profilePlacement} integrated={config.appearance.layout === 'integrated'} id="location-placement" label={t("Mostrar localização")} value={config.appearance.profilePlacements?.location} onChange={value => profilePlacement('location', value)} /></div>
              <div className="location-time-controls">
              <div className="field local-time-field"><label className="check-line"><input type="checkbox" checked={config.appearance.showLocalTime === true} onChange={event=>appearance({showLocalTime:event.target.checked})} /><span>{t("Mostrar hora local")}</span></label><p className="field-help">{t("O horário segue o fuso escolhido abaixo.")}</p>{config.appearance.showLocalTime && <PlacementSelect defaultPlacement={config.appearance.profilePlacement} id="local-time-placement" label={t("Posição da hora")} value={config.appearance.profilePlacements?.localTime ?? 'top'} onChange={value=>profilePlacement('localTime',value)} />}</div>
              <div className="field timezone-field"><label htmlFor="timezone">{t("Fuso horário")}</label><select id="timezone" aria-describedby="timezone-help" aria-invalid={!!errors.timeZone} value={config.timeZone} onChange={event => update({ timeZone: event.target.value })}>{zoneGroups.map(group => <optgroup key={group.id} label={t(group.label)}>{group.options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</optgroup>)}</select><p id="timezone-help" className={errors.timeZone ? 'field-error' : 'field-help'}>{errors.timeZone || t("Começamos com o horário de Brasília. Você pode escolher outro fuso; os ajustes sazonais são automáticos.")}</p></div>
              </div>
              <div className="field"><label id="custom-fields-title">{t("Informações adicionais")} <span className="optional-field">{t("opcional")}</span></label>{config.customFields.map((field,index)=><CustomFieldEditor labelColor={config.appearance.labelColor || readableForeground(config.appearance.topBackground || '#ffffff')} informationColor={config.appearance.informationColor || readableForeground(config.appearance.topBackground || '#ffffff')} defaultPlacement={config.appearance.profilePlacement} key={index} field={field} index={index} integrated={config.appearance.layout === 'integrated'} invalid={!!errors.customFields} onChange={next=>update(previous=>({...previous,customFields:previous.customFields.map((current,currentIndex)=>currentIndex===index?next:current)}))} onRemove={()=>removeCustomField(index)} />)}<button type="button" className="text-button" onClick={addCustomField} disabled={config.customFields.length >= 3}>{t("+ Adicionar informação")}</button><p className={errors.customFields ? 'field-error' : 'field-help'}>{errors.customFields || t("Até três rótulos, com até oito itens em cada um. Os itens são opcionais e aceitam ligações como [[História do Brasil|História]].")}</p><div className="profile-field-colors"><TextColorControl id="label-color" label={t("Cor dos rótulos")} value={config.appearance.labelColor} fallback={readableForeground(config.appearance.topBackground || '#ffffff')} onChange={value=>appearance({labelColor:value})} /><TextColorControl id="information-color" label={t("Cor das informações")} value={config.appearance.informationColor} fallback={readableForeground(config.appearance.topBackground || '#ffffff')} onChange={value=>appearance({informationColor:value})} /><p className="field-help">{t("As cores valem para os campos do perfil, como localização, estatutos e data de criação.")}</p></div></div>
              <div className="field user-groups-field"><label className="check-line"><input type="checkbox" checked={config.appearance.showUserGroups === true} onChange={event=>appearance({showUserGroups:event.target.checked})} /><span>{t("Mostrar estatutos")}</span></label><p className="field-help">{t("Usa os estatutos públicos da conta na Wikipédia em português.")}</p>{config.appearance.showUserGroups && <PlacementSelect defaultPlacement={config.appearance.profilePlacement} id="user-groups-placement" label={t("Mostrar estatutos em")} value={config.appearance.profilePlacements?.userGroups} onChange={value=>profilePlacement('userGroups',value)} />}</div>
              <div className="field"><label className="check-line"><input type="checkbox" checked={config.appearance.showAccountCreated} onChange={event => appearance({ showAccountCreated:event.target.checked })} /><span>{t("Mostrar data de criação da conta")}</span></label><p className="field-help">{t("Usa a data mais antiga disponível nas contas vinculadas.")}</p><PlacementSelect defaultPlacement={config.appearance.profilePlacement} integrated={config.appearance.layout === 'integrated'} id="account-created-placement" label={t("Mostrar data de criação")} value={config.appearance.profilePlacements?.accountCreated} onChange={value => profilePlacement('accountCreated', value)} /></div>
              <div className="field"><label htmlFor="profile-photo">{t("Foto do Wikimedia Commons")} <span className="optional-field">{t("opcional")}</span></label><input id="profile-photo" name="photo" autoComplete="off" value={config.photo || ''} placeholder={t('Ex.: Example.jpg')} onChange={event => update({ photo:event.target.value })} aria-invalid={!!errors.photo} aria-describedby="profile-photo-help" /><p id="profile-photo-help" className={errors.photo ? 'field-error' : 'field-help'}>{errors.photo || t("Informe o nome do arquivo. A prévia é ilustrativa, e o arquivo do Commons entra no código preparado.")}</p><p className="field-help profile-photo-upload">{t("Ainda não tem uma foto no Commons?")} <a href="https://commons.wikimedia.org/wiki/Special:UploadWizard?uselang=pt-br" target="_blank" rel="noopener noreferrer">{t("Envie uma foto")}</a>.</p><div className="photo-size-shape"><label htmlFor="photo-size">{t("Tamanho da foto")}<select id="photo-size" value={config.appearance.photoSize ?? 96} onChange={event=>appearance({photoSize:Number(event.target.value)})}>{[64,96,128,160,200].map(size=><option key={size} value={size}>{size} px</option>)}</select></label><label htmlFor="photo-shape">{t("Formato da foto")}<select id="photo-shape" value={config.appearance.photoShape || 'square'} onChange={event=>appearance({photoShape:event.target.value})}><option value="square">{t("Quadrada")}</option><option value="round">{t("Redonda")}</option></select></label></div><div className="photo-format-controls"><AlignmentControl compact name="photo-alignment" label={t("Alinhamento da foto")} value={config.appearance.photoAlignment || 'left'} onChange={value=>appearance({photoAlignment:value})} /></div><PhotoPlacementSelect value={config.appearance.profilePlacements?.photo} onChange={value => profilePlacement('photo', value)} /></div>
              <fieldset className="profile-top-settings"><legend>{t("Topo do perfil")}</legend><div className="field"><label htmlFor="cover-source">{t("Imagem de capa")}</label><select id="cover-source" value={config.appearance.coverSource || 'manual'} onChange={event=>appearance({coverSource:event.target.value})}><option value="manual">{t("Escolher arquivo do Commons")}</option><option value="wiki-daily">{t("Imagem do dia da Wikipédia, para visitantes")}</option><option value="daily">{t("Imagem do dia do Commons, na sua sessão")}</option></select></div><div className="field"><label htmlFor="profile-cover">{t("Imagem de capa do Wikimedia Commons")} <span className="optional-field">{t("opcional")}</span></label><input id="profile-cover" name="coverImage" autoComplete="off" disabled={['wiki-daily','daily'].includes(config.appearance.coverSource)} value={config.coverImage || ''} placeholder={t('Ex.: Paisagem.jpg')} onChange={event=>update({coverImage:event.target.value})} aria-invalid={!!errors.coverImage} aria-describedby="profile-cover-help" /><p id="profile-cover-help" className={errors.coverImage ? 'field-error' : 'field-help'}>{errors.coverImage || (config.appearance.coverSource === 'wiki-daily' ? t("Atualiza para os visitantes pelo calendário da Wikipédia, conforme o cache da página. A prévia é ilustrativa.") : config.appearance.coverSource === 'daily' ? t("A prévia usa uma imagem ilustrativa. Na sua sessão ativa, a capa usa a imagem do dia do Commons, com recorte central.") : t("A capa fica acima das informações do topo. Informe o nome do arquivo. A prévia usa uma imagem ilustrativa."))}</p></div><div className="field top-background-controls"><label htmlFor="top-background-trigger">{t("Cor de fundo do topo")}</label><div className="top-background-inputs"><ColorPicker id="top-background" label={t("Cor de fundo do topo")} value={config.appearance.topBackground || '#ffffff'} onChange={changeTopBackground} compact /><input aria-label={t("Código da cor de fundo do topo")} value={topBackgroundText} maxLength={7} onChange={event=>changeTopBackground(event.target.value)} onBlur={()=>{if(!hexColorValid(topBackgroundText))setTopBackgroundText(config.appearance.topBackground || '#ffffff');}} spellCheck="false" /></div><p className="field-help">{t("As cores automáticas do texto acompanham o fundo escolhido.")}</p></div></fieldset>
              <fieldset className="destination-field"><legend>{t("Onde o painel vai aparecer?")}</legend><label className={'choice-row ' + (config.destination === 'main' ? 'chosen' : '')}><input type="radio" name="destination" value="main" checked={config.destination === 'main'} onChange={() => update({ destination: 'main' })} /><span><strong>{t("Na minha página de usuário")}</strong><small>{t("A opção mais simples para começar.")}</small></span></label><label className={'choice-row ' + (config.destination === 'subpage' ? 'chosen' : '')}><input type="radio" name="destination" value="subpage" checked={config.destination === 'subpage'} onChange={() => update({ destination: 'subpage' })} /><span><strong>{t("Em uma subpágina que eu uso")}</strong><small>{t("Por exemplo, /PU ou /Perfil.")}</small></span></label></fieldset>
              {config.destination === 'subpage' && <div className="field subpage-input"><label htmlFor="subpage">{t("Nome da subpágina")}</label><input id="subpage" value={config.subpage} onChange={event => update({ subpage: event.target.value })} aria-invalid={!!errors.subpage} aria-describedby="subpage-help" /><p id="subpage-help" className={errors.subpage ? 'field-error' : 'field-help'}>{errors.subpage || t("Use uma subpágina já exibida no seu perfil, ou experimente esse destino separadamente.")}</p></div>}
              <div className="field"><label htmlFor="profile-placement">{t("Posição padrão das informações")}</label><select id="profile-placement" value={config.appearance.profilePlacement} onChange={event=>appearance({profilePlacement:event.target.value})}><option value="top">{t("No topo, padrão")}</option><option value="activity">{t("Na atividade")}</option><option value="cards">{t("Nas caixas")}</option><option value="both">{t("Atividade e caixas")}</option><option value="all">{t("Em todas as áreas")}</option></select><p className="field-help">{t("Vale para os campos marcados como Padrão. Cada campo pode ter outra posição ou ficar oculto.")}</p></div>
            </form></SettingsGroup>
            <SettingsGroup id="texts" title={t("Textos e projetos")} open={settingsGroup === 'texts'} onToggle={()=>toggleSettingsGroup('texts')}><p className="field-help">{t("Acrescente textos depois das visualizações. Pode usar código wiki, listas, ligações e predefinições. Na Wikipédia, essas seções ficam separadas dos dados do painel e podem ser editadas pelo editor da página.")}</p><div className="content-section-starters"><button type="button" className="text-button" disabled={config.contentSections.length>=8} onClick={()=>addContentSection(t("Conflito de interesses"))}>{t("+ Conflito de interesses")}</button><button type="button" className="text-button" disabled={config.contentSections.length>=8} onClick={()=>addContentSection(t("Metas e projetos"))}>{t("+ Metas e projetos")}</button></div>{config.contentSections.map((section,index)=><fieldset className="content-section-editor" key={index}><legend>{t("Seção")} {index+1}</legend><div className="field"><label htmlFor={'content-section-title-'+index}>{t("Título")}</label><input id={'content-section-title-'+index} maxLength={100} value={section.title} onChange={event=>changeContentSection(index,{title:event.target.value})} placeholder={t('Ex.: Meu foco atual')} aria-invalid={!!errors.contentSections} /></div><div className="field"><label htmlFor={'content-section-body-'+index}>{t("Texto em código wiki")} <span className="optional-field">{t("opcional")}</span></label><textarea id={'content-section-body-'+index} value={section.content} maxLength={50000} spellCheck="false" rows={7} placeholder={t("Escreva seu texto ou cole um trecho da sua página.")} onChange={event=>changeContentSection(index,{content:event.target.value})} aria-invalid={!!errors.contentSections} /></div><div className="content-section-actions"><button type="button" className="secondary" disabled={index===0} aria-label={t('Mover seção {number} para cima',{number:index+1})} onClick={()=>moveContentSection(index,-1)}>↑</button><button type="button" className="secondary" disabled={index===config.contentSections.length-1} aria-label={t('Mover seção {number} para baixo',{number:index+1})} onClick={()=>moveContentSection(index,1)}>↓</button><button type="button" className="text-button" onClick={()=>update(previous=>({...previous,contentSections:previous.contentSections.filter((_,position)=>position!==index)}))}>{t("Remover seção")} {index+1}</button></div></fieldset>)}<button type="button" className="secondary" disabled={config.contentSections.length>=8} onClick={()=>addContentSection()}>{t("+ Adicionar seção")}</button><p className={errors.contentSections?'field-error':'field-help'} role={errors.contentSections?'alert':undefined}>{errors.contentSections||t("Até oito seções. A prévia local mostra uma aproximação do código wiki, sem carregar ou executar predefinições.")}</p></SettingsGroup>
            <SettingsGroup id="layout" title={t("Disposição")} open={settingsGroup === 'layout'} onToggle={() => toggleSettingsGroup('layout')}><fieldset className="setting-section"><legend>{t("Disposição")}</legend><div className="segmented layout-options"><label><input type="radio" name="layout" checked={config.appearance.layout === 'integrated'} onChange={() => appearance({ layout: 'integrated' })} /><span>{t("Caixas na atividade")}</span></label><label><input type="radio" name="layout" checked={config.appearance.layout === 'together'} onChange={() => appearance({ layout: 'together' })} /><span>{t("Blocos juntos")}</span></label><label><input type="radio" name="layout" checked={config.appearance.layout === 'separate'} onChange={() => appearance({ layout: 'separate' })} /><span>{t("Separados")}</span></label></div><p className="field-help">{config.appearance.layout === 'integrated' ? t("As caixas ficam dentro da atividade, entre a sequência e o gráfico. As posições dos campos distinguem a atividade e as caixas.") : t("Blocos juntos mantém as duas áreas no mesmo grupo. Em Separados, cabe texto do perfil entre elas.")}</p></fieldset>
            {config.appearance.layout !== 'integrated' && config.appearance.showCards && config.appearance.showActivity && <fieldset className="setting-section"><legend>{t("Ordem dos blocos")}</legend><div className="segmented"><label><input type="radio" name="block-order" checked={config.appearance.blockOrder === 'cards-first'} onChange={() => appearance({ blockOrder: 'cards-first' })} /><span>{t("Caixas primeiro")}</span></label><label><input type="radio" name="block-order" checked={config.appearance.blockOrder === 'activity-first'} onChange={() => appearance({ blockOrder: 'activity-first' })} /><span>{t("Atividade primeiro")}</span></label></div></fieldset>}
            <fieldset className="setting-section"><legend>{t("Cor do painel")}</legend><div className="theme-options">{THEMES.map(theme => <button key={theme.id} className={'theme-button ' + (config.appearance.theme === theme.id ? 'selected' : '')} type="button" aria-pressed={config.appearance.theme === theme.id} onClick={() => chooseTheme(theme)}><span className="color-swatch" style={{ background: theme.accent }} aria-hidden="true" />{t(theme.label)}</button>)}</div><div className="custom-color-controls"><ColorPicker id="custom-color" label={t('Escolher outra cor')} value={accent} onChange={customColor} /><label className="sr-only" htmlFor="color-hex">{t("Código hexadecimal da cor")}</label><input id="color-hex" aria-label={t("Código hexadecimal da cor")} value={colorText} maxLength={7} spellCheck="false" onChange={event => customColor(event.target.value)} onBlur={() => { if (!hexColorValid(colorText)) setColorText(accent); }} /></div><p className="field-help">{t("O texto dos botões se ajusta para continuar legível.")}</p></fieldset>
            <fieldset className="setting-section"><legend>{t("Espaçamento")}</legend><div className="segmented density-options">{[["compact",t("Compacto")],["comfortable",t("Confortável")],["roomy",t("Amplo")]].map(([value,label]) => <label key={value}><input type="radio" name="density" checked={config.appearance.density === value} onChange={() => appearance({ density:value })} /><span>{t(label)}</span></label>)}</div></fieldset>
            <fieldset className="setting-section field"><label htmlFor="card-columns">{t("Colunas das caixas")}</label><select id="card-columns" value={config.appearance.cardColumns} onChange={event => appearance({cardColumns:event.target.value})}><option value="auto">{t("Automático")}</option><option value="2">{t("2 colunas")}</option><option value="3">{t("3 colunas")}</option><option value="4">{t("4 colunas")}</option><option value="5">{t("5 colunas")}</option></select><p className="field-help">{t("O modo Compacto pode usar cinco colunas no automático. Em telas menores, as caixas se reorganizam para caber na página.")}</p></fieldset><div className="setting-section"><AlignmentControl name="alignment" label={t("Alinhamento dos contadores")} value={config.appearance.alignment} onChange={value=>appearance({alignment:value})} /><p className="field-help">{t("Vale para os números e os textos das caixas.")}</p></div>
            
            
            {config.appearance.showCards && <div className="highlight-color-controls"><label htmlFor="highlight-color-trigger">{t("Cor do destaque das caixas")}</label><div className="highlight-color-inputs"><ColorPicker id="highlight-color" label={t("Cor do destaque das caixas")} value={config.appearance.highlightColor} onChange={changeHighlightColor} compact /><input aria-label={t("Código da cor de destaque das caixas")} value={highlightText} maxLength={7} onChange={event => changeHighlightColor(event.target.value)} onBlur={() => { if (!hexColorValid(highlightText)) setHighlightText(config.appearance.highlightColor); }} spellCheck="false" /></div></div>}
            </SettingsGroup>
            <SettingsGroup id="content" title={t("Conteúdo")} open={settingsGroup === 'content'} onToggle={() => toggleSettingsGroup('content')}><fieldset className="setting-section panels-section"><legend>{t("O que aparece")}</legend><label className="check-line"><input type="checkbox" checked={config.appearance.showCards} onChange={() => togglePanel('showCards')} /><span>{t("Caixas de números")}</span></label><label className="check-line"><input type="checkbox" checked={config.appearance.showActivity} onChange={() => togglePanel('showActivity')} /><span>{t("Atividade e visualizações")}</span></label></fieldset>
            {config.appearance.showActivity && <div className="setting-section field"><label htmlFor="initial-period">{t("Período inicial das visualizações")}</label><select id="initial-period" value={config.appearance.initialPeriod} onChange={event => chooseInitialPeriod(event.target.value)}>{PERIODS.map(period => <option key={period.id} value={period.id}>{t(period.label)}</option>)}</select>{config.appearance.initialPeriod === 'custom' && <div className="custom-period-inputs"><label htmlFor="custom-period-start">{t("De")}<input id="custom-period-start" type="date" min="2015-07-01" max={maxCustomDate} value={customStart} onInput={event => { setCustomStart(event.target.value); setCustomError(''); }} onChange={event => { setCustomStart(event.target.value); setCustomError(''); }} /></label><label htmlFor="custom-period-end">{t("Até")}<input id="custom-period-end" type="date" min="2015-07-01" max={maxCustomDate} value={customEnd} onInput={event => { setCustomEnd(event.target.value); setCustomError(''); }} onChange={event => { setCustomEnd(event.target.value); setCustomError(''); }} /></label><button type="button" className="secondary" onClick={() => applyCustomRange()}>{t("Aplicar período")}</button>{customError && <p className="field-error" role="alert">{t(customError)}</p>}<p className="field-help">{t("Dias completos em UTC, a partir de julho de 2015.")}</p></div>}</div>}
          </SettingsGroup>
          </aside><div id="profile-preview" className="preview-area"><a className="preview-return" href="#appearance-settings">{t("Voltar aos ajustes")}</a><div className="preview-toolbar"><span>{t("PRÉVIA DO SEU PERFIL")}</span></div><ProfilePreview onEditSection={editContentSection} onInteraction={closeColorPickers} onMoveMetric={moveCounter} onToggleMetric={toggleMetric} onToggleHighlight={toggleHighlight} config={config} onPeriodChange={chooseInitialPeriod} onCustomRangeChange={applyCustomRange} /><p className="preview-footnote">{t("Prévia com o mesmo código que desenha o painel. Os números são de exemplo e não foram consultados para esta conta.")}</p></div></div>
          <div className="screen-actions"><span className="field-help">{t("Confira a prévia antes de preparar os trechos.")}</span><button className="primary" onClick={() => go(2)}>{t("Preparar instalação")}</button></div>
        </section>}

        {mode === 'customize' && step === 2 && <section aria-labelledby="step-heading"><div className="screen-title"><div><p className="eyebrow">{t("ETAPA 2 DE 2")}</p><h1 id="step-heading" ref={titleRef} tabIndex={-1}>{t("Instale seu PerfilWiki")}</h1><p className="lead">{t("Copie o carregador e os blocos preparados com as suas escolhas.")}</p></div><div className="screen-title-actions"><button className="secondary" onClick={viewPanel}>{t("Ver painel")}</button><button className="text-button" onClick={() => go(1)}>{t("Ajustar a aparência")}</button></div></div>
          <div className="prototype-notice" role="note"><strong>{t("Esta versão está em teste local.")}</strong><p>{t("Os trechos abaixo usam o código real desta versão. Os arquivos compartilhados da versão")} {RELEASE_VERSION} {t("precisam ser atualizados antes da instalação na Wikipédia. Você pode conferir tudo nos editores locais, sem enviar nenhuma edição.")}</p></div>
          <div className="installation-summary"><span><strong>{user}</strong><small>{profileTitle(config)}</small></span><span>{t(THEMES.find(theme => theme.id === config.appearance.theme)?.label || 'Cor personalizada')}<small>{accent.toUpperCase()} · {{compact:t("Compacto"),comfortable:t("Confortável"),roomy:t("Amplo")}[config.appearance.density]}</small></span><span>{config.appearance.showCards ? t(config.appearance.metrics.length === 1 ? '{number} contador' : '{number} contadores',{number:config.appearance.metrics.length}) : t('Sem contadores')}<small>{config.appearance.showActivity ? t("Com atividade e visualizações") : t('Somente as caixas')}</small></span></div>
          <div className="install-steps">{['activation', 'profile'].map((kind, index) => <article className={'install-card ' + (saved[kind] ? 'saved' : '')} key={kind}><div className="install-card-heading"><span className="install-number">{index + 1}</span><div><h2>{kind === 'activation' ? t('Ative no seu navegador') : t("Adicione ao seu perfil")}</h2><p className="destination">{kind === 'activation' ? 'Usuário:' + user + '/common.js' : profileTitle(config)}</p></div><span className="step-status">{saved[kind] ? t('Salvo localmente') : t('Para experimentar')}</span></div><p>{kind === 'activation' ? t("Acrescente o trecho ao final do rascunho, mantendo os scripts que já estão lá.") : config.appearance.layout === 'separate' ? t("Experimente colocar as caixas e a atividade em pontos diferentes, preservando o texto da página.") : t("Coloque o bloco no ponto do perfil em que deseja mostrar o painel.")}</p>{kind==='profile'&&liveSource&&<div className="live-installation-notice" role="note" style={{border:'1px solid #a2a9b1',borderLeft:'4px solid '+(profileDelivery().complete?accent:'#b32424'),padding:'12px 16px',margin:'12px 0',background:'#f8f9fa'}}>{profileDelivery().complete?<p>{t("A cópia e o download mantêm os textos e as categorias da página recebida, alterando somente o bloco do painel. Confira o código antes de salvar na Wikipédia.")}</p>:<><p><strong>{t("Este trecho é apenas o novo painel. Não substitua sua página inteira por ele.")}</strong></p>{profileDelivery().draftConflict&&<p>{t("O rascunho salvo precisa de revisão antes de copiar uma página completa. Abra o editor de conferência.")}</p>}<p>{t("Abra o editor de conferência para manter seus textos e substituir o painel manualmente. A página original não é alterada.")}</p><button type="button" className="primary" onClick={()=>openEditor('profile')}>{t("Revisar página completa antes de copiar")}</button></>}{config.contentSections.length>0&&<p>{t("Novos blocos de texto precisam ser acrescentados manualmente fora do painel. A atualização do painel preserva os textos que já estão na página.")}</p>}</div>}<div className="install-buttons"><button className="primary" onClick={() => copySnippet(kind)}>{kind==='profile'&&liveSource?t(profileDelivery().complete?"Copiar página preservada":"Copiar somente o novo bloco"):<>{t("Copiar")} {kind === 'activation' ? t("ativação") : t("bloco do perfil")}</>}</button><button className="secondary" data-testid={'editor-' + kind} onClick={() => openEditor(kind)}>{t("Abrir editor local")}</button><a className="editor-target" href={editorUrl(kind === 'activation' ? 'Usuário:' + user + '/common.js' : profileTitle(config))} target="_blank" rel="noopener noreferrer">{t("Abrir destino na Wikipédia")}</a></div><div className="code-actions"><details open={!!openCode[kind]} onToggle={event => { const open = event.currentTarget.open; setOpenCode(prev => prev[kind] === open ? prev : { ...prev, [kind]: open }); }}><summary>{t("Ver trecho completo ou copiar pelo teclado")}</summary><label className="sr-only" htmlFor={'snippet-' + kind}>{t("Código de")} {kind === 'activation' ? t("ativação") : 'perfil'}</label><textarea id={'snippet-' + kind} ref={element => { copyRefs.current[kind] = element; }} readOnly spellCheck="false" value={deliveryText(kind)} /><label className="summary-label" htmlFor={'summary-' + kind}>{t("Resumo de edição")}</label><textarea id={'summary-' + kind} className="summary-text" readOnly ref={element => { copyRefs.current[kind + '-summary'] = element; }} value={preparedFiles().find(file => file.id === kind).summary} /></details><button className="text-button" onClick={() => copySummary(kind)}>{t("Copiar resumo de edição")}</button>{kind === 'profile' && config.appearance.layout === 'separate' && <div className="separate-downloads">{config.appearance.showCards && <button className="text-button" onClick={() => download('PerfilWiki_contadores.wiki', snippet('cards'))}>{t("Baixar somente as caixas")}</button>}{config.appearance.showActivity && <button className="text-button" onClick={() => download('PerfilWiki_atividade.wiki', snippet('activity'))}>{t("Baixar somente a atividade")}</button>}</div>}<button className="text-button" onClick={() => download(kind === 'activation' ? 'PerfilWiki_carregador.js' : liveSource&&!profileDelivery().complete?'PerfilWiki_bloco.wiki':'PerfilWiki_perfil.wiki', deliveryText(kind))}>{kind==='profile'&&liveSource?t(profileDelivery().complete?"Baixar página preservada":"Baixar somente o novo bloco"):t("Baixar código completo")}</button></div></article>)}</div>
          <InstallationCheck config={config} />
          {completed && <div className="complete-state" role="status"><h2>{t("Conferência local concluída")}</h2><p>{t("O carregador e o perfil foram conferidos nos editores locais. Nenhuma página da Wikipédia foi alterada.")}</p><p className="public-note">{t("Na versão real, a consulta atualiza a tela do dono da página. Os visitantes veem a última cópia que ele salvou no perfil.")}</p><button className="secondary" onClick={() => go(1)}>{t("Rever minha prévia")}</button></div>}
          <div className="screen-actions"><button className="secondary" onClick={() => go(1)}>{t("Voltar à prévia")}</button><button className="text-button" onClick={() => download('PerfilWiki_escolhas.json', JSON.stringify({ version: RELEASE_VERSION, ...config }, null, 2), 'application/json')}>{t("Baixar minhas escolhas")}</button></div>
        </section>}
        <p className="global-status" role="status" aria-live="polite">{t(toast)}</p>
      </main>
      <footer className="site-footer"><span>{t("PerfilWiki · instalação e personalização")}</span><span>{t("Suas escolhas ficam nesta aba. Nenhuma edição na Wikipédia.")}</span></footer>
      {importOpen && <dialog ref={importRef} className="editor-dialog choices-dialog" aria-labelledby="choices-title" onCancel={event=>{event.preventDefault();closeImport();}}><div className="editor-heading"><h2 id="choices-title">{t("Carregar minhas escolhas")}</h2><button type="button" className="secondary" onClick={closeImport}>{t("Fechar")}</button></div><p>{t("Cole o conteúdo de PerfilWiki_escolhas.json. As escolhas carregadas substituem os ajustes desta aba e não alteram a Wikipédia. Os textos editados diretamente na sua página continuam nela.")}</p><label className="editor-label" htmlFor="choices-json">{t("Escolhas em JSON")}</label><textarea id="choices-json" className="editor-textarea choices-textarea" spellCheck="false" value={importText} onChange={event=>{setImportText(event.target.value);setImportError('');}} autoFocus />{importError&&<p className="field-error" role="alert">{t(importError)}</p>}<div className="editor-footer"><button type="button" className="primary" onClick={loadChoices}>{t("Carregar escolhas nesta aba")}</button></div></dialog>}
      {editor && <dialog ref={dialogRef} className="editor-dialog" aria-labelledby="editor-title" onCancel={event => { event.preventDefault(); closeEditor(); }}><div className="editor-heading"><div><p className="eyebrow">{t("EDITOR LOCAL · CONFERÊNCIA")}</p><h2 id="editor-title">{editor === 'activation' ? t("Seu common.js") : t("Sua página de usuário")}</h2></div><button className="secondary" onClick={closeEditor}>{t("Fechar")}</button></div><p className="destination editor-destination">{editor === 'activation' ? 'Usuário:' + user + '/common.js' : profileTitle(config)}</p><p>{t("Este editor permite conferir o código e preservar seus outros textos. Nada digitado aqui é executado ou enviado à Wikipédia.")}</p>{editor==='profile'&&liveSource&&<div className="live-editor-note"><p>{currentLiveSource()?.page ? t("Texto público da revisão {number}. Os textos fora do bloco do painel são preservados.",{number:currentLiveSource().page.revisionId}) : t("O texto público não foi recuperado. Cole sua página inteira no rascunho antes de substituir o painel.")}</p>{!LiveEdit.hasProfile(draft)&&<p>{t("Esta página ainda não tem um bloco PerfilWiki delimitado. Substitua o painel manualmente, preservando seus outros textos e categorias.")}</p>}{config.contentSections.length>0&&<p>{t("Novos blocos de texto precisam ser acrescentados manualmente fora do painel. A atualização do painel preserva os textos que já estão na página.")}</p>}<details><summary>{t("Novo bloco do painel para inserção manual")}</summary><textarea className="editor-textarea" aria-label={t("Novo bloco do painel para inserção manual")} readOnly value={snippet('profile')} /></details></div>}<div className="editor-tools"><button className="secondary" onClick={insertDemo}>{t(editor==='profile'&&liveSource ? "Atualizar somente o bloco do painel" : "Adicionar trecho preparado")}</button>{editor === 'profile' && <button className="text-button" onClick={() => { if (!draft.includes(requiredSnippet(editor))) { setDraftError(t("Adicione o trecho preparado para conferir a prévia.")); return; } setDraftError(''); setDraftPreview(prev => !prev); }}>{draftPreview ? t("Voltar ao código") : t("Conferir prévia local")}</button>}</div>{draftPreview ? <div className="editor-preview"><ProfilePreview onInteraction={closeColorPickers} config={{ ...config, appearance: { ...config.appearance, initialPeriod: draftPeriod, customRange:draftRange } }} onPeriodChange={period => { if (period === 'custom' && !draftRange) setDraftRange(recentCustomRange()); setDraftPeriod(period); }} onCustomRangeChange={range => { setDraftRange(range); setDraftPeriod('custom'); }} /></div> : <div><label className="editor-label" htmlFor="local-draft">{t("Conteúdo do rascunho local")}</label><textarea ref={editorRef} id="local-draft" className="editor-textarea" value={draft} spellCheck="false" onChange={event => { setDraft(event.target.value); setDraftError(''); }} /></div>}{draftError && <p className="field-error" role="alert">{t(draftError)}</p>}<div className="editor-footer"><span>{t("Salvar mantém este rascunho somente na simulação.")}</span><button className="primary" onClick={saveDraft}>{t("Salvar rascunho local")}</button></div></dialog>}
    </div></LanguageProvider>
  );
}
