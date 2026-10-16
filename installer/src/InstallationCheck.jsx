import React, {useEffect,useRef,useState} from 'react';
import {useI18n} from './i18n.jsx';
import {checkInstallation} from './installation-check.mjs';
import './installation-check.css';

export function InstallationCheck({config}) {
  const {t}=useI18n();
  const [state,setState]=useState(null), request=useRef(null);
  const identity=JSON.stringify(config);
  useEffect(()=>{ request.current?.abort(); request.current=null; setState(null); return()=>{request.current?.abort();request.current=null;}; },[identity]);
  async function verify() {
    request.current?.abort(); const controller=new AbortController(); request.current=controller;
    setState({pending:true});
    const timeout=setTimeout(()=>controller.abort(),20000);
    try {
      const result=await checkInstallation(config,{signal:controller.signal});
      if (request.current===controller && !controller.signal.aborted) setState(result);
    } catch (error) {
      if(request.current===controller) setState({error:controller.signal.aborted?'A consulta demorou mais que o esperado. Tente novamente.':error.message || 'Não foi possível conferir a instalação.'});
    } finally {clearTimeout(timeout);}
  }
  return <section className="installation-check" aria-labelledby="installation-check-heading"><h2 id="installation-check-heading">{t('Conferir a instalação')}</h2><p>{t('Depois de salvar os trechos na Wikipédia, confira o carregador, os blocos do perfil e os estilos.')}</p><button className="secondary" type="button" disabled={state?.pending} onClick={verify}>{t(state?.pending?'Verificando...':'Verificar instalação')}</button><p className="field-help">{t('A consulta lê somente páginas públicas, sem usar seu login. Ela confere os arquivos, mas não executa o script no navegador.')}</p><div role="status" aria-live="polite">{state?.error && <p className="field-error">{t(state.error)}</p>}{state?.results && <><p className="installation-check-summary">{t(state.complete?'Os trechos públicos conferem com esta instalação.':'Alguns itens ainda precisam de conferência.')}</p><ul className="installation-check-results">{state.results.map(item=><li key={item.id} data-check-status={item.status}><span aria-hidden="true">{item.status==='ok'?'✓':item.status==='unknown'?'?':'!'}</span><div><strong>{t(item.title)}</strong><p>{t(item.detail)}</p></div></li>)}</ul></>}</div><a className="text-button" href="./Arquivos.html" target="_blank" rel="noopener noreferrer">{t('Arquivos e documentação')}</a></section>;
}
