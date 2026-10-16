import React, {useEffect, useRef, useState} from 'react';
import {useI18n} from './i18n.jsx';
import {COLOR_FAMILIES,hexToHsl,hslToHex,spectrumColor,spectrumKey} from './color.mjs';

/** Auto popovers support outside click and Escape without a modal overlay.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/popover */
export function ColorPicker({id,label,value,onChange,compact=false}) {
  const {t}=useI18n();
  const localizedLabel=t(label);
  const [hsl,setHsl]=useState(()=>hexToHsl(value));
  const [text,setText]=useState(value);
  const previous=useRef(value);
  const panel=useRef(null);
  useEffect(()=>{
    // A click in the dashboard iframe changes browsing context, so it does
    // not reach the parent document's native light-dismiss handling.
    function closeOnBlur() {
      if (panel.current?.matches(':popover-open')) panel.current.hidePopover();
    }
    window.addEventListener('blur',closeOnBlur);
    return ()=>window.removeEventListener('blur',closeOnBlur);
  },[]);
  useEffect(()=>{
    if (previous.current!==value) {setHsl(hexToHsl(value));setText(value);previous.current=value;}
  },[value]);
  function apply(next) {
    const hex=hslToHex(next);
    setHsl(next);setText(hex);previous.current=hex;onChange(hex);
  }
  function chooseHex(hex) {
    setHsl(hexToHsl(hex));setText(hex);previous.current=hex;onChange(hex);
  }
  function changeText(next) {
    setText(next);
    if (/^#[0-9a-f]{6}$/i.test(next)) {
      const hex=next.toLowerCase();setHsl(hexToHsl(hex));previous.current=hex;onChange(hex);
    }
  }
  function choosePoint(event) {
    const box=event.currentTarget.getBoundingClientRect();
    const hex=spectrumColor(event.clientX-box.left,event.clientY-box.top,box.width,box.height);
    if (hex) chooseHex(hex);
  }
  function chooseKey(event) {
    const next=spectrumKey(hsl,event.key,event.shiftKey);
    if (next) {event.preventDefault();apply(next);}
  }
  return <>
    <button id={id+'-trigger'} type="button" className={'custom-color-picker'+(compact?' color-picker-compact':'')} popoverTarget={id} aria-haspopup="dialog" aria-label={localizedLabel}>
      <span className="color-wheel" aria-hidden="true"><span style={{background:value}} /></span><span>{localizedLabel}</span>
    </button>
    <div ref={panel} id={id} className="color-popover" popover="auto" role="dialog" aria-label={localizedLabel}>
      <div className="color-popover-heading"><strong>{localizedLabel}</strong><button type="button" className="color-popover-close" popoverTarget={id} popoverTargetAction="hide" aria-label={t('Fechar {label}',{label:localizedLabel.toLowerCase()})}>×</button></div>
      <fieldset className="color-palette"><legend>{t('Cores')}</legend><div className="color-palette-families">{COLOR_FAMILIES.map(family=><div className="color-palette-family" key={family.name}><span className="color-palette-name">{t(family.name)}</span>{family.colors.map((hex,index)=>{
        const color=t(family.name),name=index===0?t('{color} claro',{color}):index===2?t('{color} escuro',{color}):color;
        return <button type="button" key={hex} className="color-palette-swatch" style={{background:hex}} aria-label={name} title={name} aria-pressed={value.toLowerCase()===hex} onClick={()=>chooseHex(hex)} />;
      })}</div>)}</div></fieldset>
      <div className="color-spectrum-label" id={id+'-spectrum-label'}>{t('Espectro de cores')}</div>
      <div className="color-spectrum" tabIndex={0} role="group" aria-labelledby={id+'-spectrum-label'} aria-describedby={id+'-spectrum-help'} onKeyDown={chooseKey} onPointerDown={event=>{if(event.button!==0 || event.isPrimary===false)return;event.currentTarget.focus();event.currentTarget.setPointerCapture(event.pointerId);choosePoint(event);}} onPointerMove={event=>{if(event.currentTarget.hasPointerCapture(event.pointerId))choosePoint(event);}}><span style={{left:(hsl.h/360*100)+'%',top:(100-hsl.s)+'%',background:value}} /></div>
      <output className="sr-only" aria-live="polite" aria-atomic="true">{t('Cor selecionada: {color}',{color:value})}</output>
      <span className="sr-only" id={id+'-spectrum-help'}>{t('Use as setas para escolher a cor. Esquerda e direita percorrem as cores, acima e abaixo ajustam a intensidade. Segure Shift para passos maiores.')}</span>
      <div className="color-lightness"><label htmlFor={id+'-lightness'}>{t('Clarear ou escurecer')}</label><div className="color-lightness-control"><span>{t('Escuro')}</span><input id={id+'-lightness'} type="range" min="0" max="100" step="0.1" value={hsl.l} aria-valuetext={t('{amount}% de claridade',{amount:Math.round(hsl.l)})} style={{background:`linear-gradient(to right,#000,hsl(${hsl.h},${hsl.s}%,50%),#fff)`}} onChange={event=>apply({...hsl,l:Number(event.target.value)})} /><span>{t('Claro')}</span></div></div>
      <div className="color-popover-hex"><span aria-hidden="true" style={{background:value}} /><label htmlFor={id+'-hex'}>{t('Código da cor')}<input id={id+'-hex'} value={text} maxLength={7} spellCheck="false" onChange={event=>changeText(event.target.value)} onBlur={()=>setText(value)} /></label></div>
    </div>
  </>;
}
