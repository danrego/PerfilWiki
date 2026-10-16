import LiveEdit from '../../src/LiveEdit.js';
import {importChoices,profileTitle} from './model.mjs';

const ERROR='Não foi possível receber o painel da Wikipédia. Mantenha a página original aberta e tente "Editar painel" novamente.';

/** Receive data after an explicit owner click. No login, API request or code execution. */
export function receiveLivePanel({host=window,onReceive,onError,sourceOrigin=LiveEdit.wikiOrigin}={}){
  const nonce=LiveEdit.nonceFromUrl(host?.location?.href);
  if(!nonce)return ()=>{};
  // A two-origin loopback fixture can inject its source only into this helper.
  // The production App never supplies an origin or reads one from its URL.
  if(sourceOrigin!==LiveEdit.wikiOrigin&&!(LiveEdit.localOrigin(new URL(host.location.href).origin)&&LiveEdit.localOrigin(sourceOrigin)))throw new TypeError('Origem de teste inválida.');
  let source=null,done=false,timer;
  function cleanup(){done=true;host.removeEventListener('message',receive);if(timer!==undefined)host.clearTimeout(timer);}
  function fail(){if(done)return;cleanup();onError?.(ERROR);}
  function receive(event){
    if(done||event.origin!==sourceOrigin||!event.source)return;
    if(LiveEdit.isSignal(event.data,'hello',nonce)){
      if(source&&source!==event.source)return;
      source=event.source;
      source.postMessage(LiveEdit.signal('ready',nonce),sourceOrigin);
      return;
    }
    if(event.source!==source)return;
    try{
      const envelope=LiveEdit.validateEnvelope(event.data,nonce,host.Date?.now?.()??Date.now());
      const config=importChoices(JSON.stringify(envelope.config));
      const liveSource=LiveEdit.source({origin:LiveEdit.wikiOrigin,user:config.user,page:envelope.page},config.user,profileTitle(config));
      cleanup();
      onReceive?.({config,liveSource});
      source.postMessage(LiveEdit.signal('accepted',nonce),sourceOrigin);
    }catch{fail();}
  }
  host.addEventListener('message',receive);
  timer=host.setTimeout(fail,LiveEdit.limits.lifetimeMs);
  return cleanup;
}

export {LiveEdit};
