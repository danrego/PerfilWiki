import React, { useEffect, useId, useRef, useState } from 'react';

import {useI18n} from './i18n.jsx';
import { displayNameFor, METRICS } from './model.mjs';
import { previewAction, previewRangeAction } from './preview-actions.mjs';
import './preview-controls.css';

const PERIODS = new Set(['30d', '90d', '12m', 'since', 'custom']);

/** The actual dashboard renderers run in an isolated, offline local document. */
export function ProfilePreview({ config = {}, onPeriodChange, onCustomRangeChange, onInteraction, onMoveMetric, onToggleMetric, onToggleHighlight, onEditSection, onEditPanel, compact = false }) {
  const {t}=useI18n();
  const frameRef = useRef(null);
  const latestConfig = useRef(config);
  const periodCallback = useRef(onPeriodChange);
  const rangeCallback = useRef(onCustomRangeChange);
  const interactionCallback = useRef(onInteraction);
  const editCallbacks = useRef({ onMoveMetric, onToggleMetric, onToggleHighlight, onEditSection });
  const chooserRef = useRef(null);
  const chooserReturnToTile = useRef(false);
  const chooserId = useId();
  const [height, setHeight] = useState(1180);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  latestConfig.current = config;
  periodCallback.current = onPeriodChange;
  rangeCallback.current = onCustomRangeChange;
  interactionCallback.current = onInteraction;
  editCallbacks.current = { onMoveMetric, onToggleMetric, onToggleHighlight, onEditSection };
  const editable = [onMoveMetric, onToggleMetric, onToggleHighlight].every(callback => typeof callback === 'function') && config.appearance?.showCards === true;
  const latestEditable = useRef(editable);
  latestEditable.current = editable;
  const configKey = JSON.stringify(config);
  const user = displayNameFor(config) || t('Seu nome de usuário');

  function sendConfig() {
    frameRef.current?.contentWindow?.postMessage({ type: 'perfilwiki-preview-config', config: latestConfig.current, compact, editable: latestEditable.current, customRangeEditable: typeof rangeCallback.current === 'function', sectionEditable: typeof editCallbacks.current.onEditSection === 'function' }, window.location.origin);
  }

  function closeChooser() {
    if (chooserRef.current?.matches(':popover-open')) chooserRef.current.hidePopover();
  }

  function chooserToggled() {
    const chooser = chooserRef.current;
    if (!chooser || chooser.matches(':popover-open') || !chooserReturnToTile.current) return;
    chooserReturnToTile.current = false;
    const focused = document.activeElement;
    if (focused === document.body || focused === frameRef.current || chooser.contains(focused)) {
      frameRef.current?.contentWindow?.postMessage({ type: 'perfilwiki-preview-focus-add' }, window.location.origin);
    }
  }

  useEffect(() => {
    function receive(event) {
      if (event.origin !== window.location.origin || event.source !== frameRef.current?.contentWindow || !event.data || typeof event.data !== 'object') return;
      if(event.data.type === 'perfilwiki-preview-edit-section' && typeof editCallbacks.current.onEditSection === 'function' && Number.isInteger(event.data.index) && event.data.index >= 0 && event.data.index < (latestConfig.current.contentSections?.length || 0)) { interactionCallback.current?.();editCallbacks.current.onEditSection(event.data.index); }
      if (typeof rangeCallback.current === 'function') {
        const range = previewRangeAction(event, window.location.origin, frameRef.current?.contentWindow, latestConfig.current);
        if (range) { interactionCallback.current?.(); rangeCallback.current(range); }
      }
      if (latestEditable.current) {
        const action = previewAction(event, window.location.origin, frameRef.current?.contentWindow, latestConfig.current);
        if (action) {
          interactionCallback.current?.();
          if (action.kind === 'move') editCallbacks.current.onMoveMetric(action.id, action.targetIndex);
          if (action.kind === 'toggle') editCallbacks.current.onToggleMetric(action.id);
          if (action.kind === 'highlight') editCallbacks.current.onToggleHighlight(action.id);
          if (action.kind === 'add' && chooserRef.current) {
            chooserReturnToTile.current = true;
            const chooser = chooserRef.current;
            if (!chooser.matches(':popover-open')) chooser.showPopover();
            const choice = chooser.querySelector('input:not(:checked):not(:disabled)') || chooser.querySelector('button');
            choice?.focus({ preventScroll: true });
            if (choice) {
              const panelBounds = chooser.getBoundingClientRect(), choiceBounds = choice.getBoundingClientRect();
              if (choiceBounds.bottom > panelBounds.bottom - 12) chooser.scrollTop += choiceBounds.bottom - panelBounds.bottom + 12;
              else if (choiceBounds.top < panelBounds.top + 12) chooser.scrollTop -= panelBounds.top + 12 - choiceBounds.top;
            }
          }
        }
      }
      if (event.data.type === 'perfilwiki-preview-interaction') {
        chooserReturnToTile.current = false;
        closeChooser();
        interactionCallback.current?.();
      }
      if (event.data.type === 'perfilwiki-preview-ready') sendConfig();
      if (event.data.type === 'perfilwiki-preview-state') {
        if (Number.isFinite(event.data.height)) setHeight(Math.min(12000, Math.max(120, Math.ceil(event.data.height))));
        setStatus('ready');
        setError('');
      }
      if (event.data.type === 'perfilwiki-preview-period' && PERIODS.has(event.data.period)) periodCallback.current?.(event.data.period);
      if (event.data.type === 'perfilwiki-preview-error') {
        setStatus('error');
        setHeight(120);
        setError('Não foi possível montar a prévia local. Confira se os arquivos do painel foram preparados.');
      }
    }
    window.addEventListener('message', receive);
    return () => window.removeEventListener('message', receive);
  }, [compact]);

  useEffect(() => { sendConfig(); }, [configKey, compact, editable]);

  useEffect(() => {
    function leaveWindow() { chooserReturnToTile.current = false; closeChooser(); }
    window.addEventListener('blur', leaveWindow);
    return () => window.removeEventListener('blur', leaveWindow);
  }, []);

  useEffect(() => { if (!editable) chooserReturnToTile.current = false; }, [editable]);

  useEffect(() => {
    if (status !== 'loading') return;
    const timeout = window.setTimeout(() => {
      setStatus('error');
      setHeight(120);
      setError('A prévia local não respondeu. Confira se os arquivos do painel foram preparados.');
    }, 12000);
    return () => window.clearTimeout(timeout);
  }, [status]);

  return <article aria-label={t('Prévia do PerfilWiki para {user}',{user})} style={{ border: '1px solid #d8dce3', borderRadius: 9, overflow: 'hidden', background: '#fff', minWidth: 0 }}>
    <div className="local-panel-toolbar" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '4px 12px', padding: '12px 16px', borderBottom: '1px solid #eaecf0', background: '#f8f9fa', color: '#54595d', fontSize: 11, lineHeight: 1.6 }}><strong style={{ color: '#202122' }}>{t('Dados de exemplo')}</strong><span>{t('Os números são fictícios. Esta prévia usa o código do painel.')}</span>{typeof onEditPanel === 'function' && <button type="button" className="secondary local-panel-edit" onClick={onEditPanel}>{t('Editar painel')}</button>}</div>
    {editable && <div className="preview-box-toolbar"><span>{t('Arraste as caixas para mudar a ordem. Use a estrela para destacar.')}</span><button type="button" className="preview-add-boxes" popoverTarget={chooserId} onClick={() => { chooserReturnToTile.current = false; interactionCallback.current?.(); }}>{t('+ Adicionar caixas')}</button><div ref={chooserRef} id={chooserId} popover="auto" role="dialog" onToggle={chooserToggled} className="preview-box-chooser" aria-labelledby={`${chooserId}-title`}><div className="preview-box-chooser-heading"><h3 id={`${chooserId}-title`}>{t('Caixas do painel')}</h3><button type="button" aria-label={t('Fechar seleção de caixas')} onClick={() => chooserRef.current?.hidePopover()}>×</button></div><p>{t('Escolha as caixas que deseja exibir. Mantenha pelo menos uma selecionada.')}</p><div className="preview-box-choices">{METRICS.map(metric => { const selected = config.appearance.metrics.includes(metric.id); return <label key={metric.id}><input type="checkbox" checked={selected} disabled={selected && config.appearance.metrics.length === 1} onChange={() => onToggleMetric(metric.id)} />{t(metric.label)}</label>; })}</div></div></div>}
    {status === 'loading' && <p role="status" style={{ margin: 16, color: '#54595d', fontSize: 13 }}>{t('Preparando a prévia local.')}</p>}
    {status === 'error' && <p role="alert" style={{ margin: 16, color: '#b32424', fontSize: 13 }}>{t(error)}</p>}
    <iframe ref={frameRef} src={`${import.meta.env.BASE_URL}local-preview/frame.html`} title={t('Painel de exemplo de {user}',{user})} sandbox="allow-scripts allow-same-origin" referrerPolicy="no-referrer" onLoad={sendConfig} style={{ display: 'block', width: '100%', height, border: 0, visibility: status === 'error' ? 'hidden' : 'visible' }} />
  </article>;
}

export default ProfilePreview;
