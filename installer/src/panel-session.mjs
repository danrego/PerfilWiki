import {importChoices, profileTitle, RELEASE_VERSION} from './model.mjs';
import LiveEdit from '../../src/LiveEdit.js';

const PREFIX='perfilwiki-panel-session-v1:';
const TOKEN=/^[a-f0-9]{32}$/;
const MAX_BYTES=1048576;
const TTL=86400000;
const MESSAGE='Não foi possível recuperar este painel local. Abra o instalador e confira suas escolhas.';
const defaultHost=()=>typeof window==='object'?window:undefined;

function localUrl(host){
  try{
    if(typeof host?.location?.href!=='string')return null;
    const url=new URL(host.location.href);
    const local=LiveEdit.localOrigin(url.origin);
    const hosted=url.origin===LiveEdit.installerOrigin&&['/PerfilWiki/','/PerfilWiki/INICIO.html','/PerfilWiki/index.html'].includes(url.pathname);
    return (local||hosted)&&!url.username&&!url.password?url:null;
  }catch{return null;}
}
function currentTime(host){return typeof host?.Date?.now==='function'?host.Date.now():Date.now();}
function serialized(config){return JSON.stringify({version:RELEASE_VERSION,...config});}
function discardSnapshot(host,key){
  try{host.sessionStorage.removeItem?.(key);}catch{/* A blocked store must not prevent recovery in the installer. */}
}

/** Save current choices only in this browser tab. No settings enter the URL. */
export function writePanelSession(config,host=defaultHost(),token,{liveSource}={}){
  try{
    if(!localUrl(host))return null;
    const prepared=importChoices(serialized(config));
    if(token!==undefined&&token!==null&&!TOKEN.test(token))return null;
    if(!token){
      const random=new Uint8Array(16);host.crypto.getRandomValues(random);
      token=Array.from(random,byte=>byte.toString(16).padStart(2,'0')).join('');
    }
    const source=liveSource?LiveEdit.source(liveSource,prepared.user,profileTitle(prepared)):null;
    const text=JSON.stringify({schema:1,savedAt:currentTime(host),config:prepared,...(source?{liveSource:source}:{})});
    if(new TextEncoder().encode(text).length>MAX_BYTES)return null;
    host.sessionStorage.setItem(PREFIX+token,text);
    return token;
  }catch{return null;}
}

/** A local opaque URL token can recover only this tab's validated snapshot. */
export function readPanelSession(host=defaultHost()){
  const url=localUrl(host);if(!url||!url.searchParams.has('perfilwiki'))return null;
  if(LiveEdit.nonceFromUrl(url.href))return null;
  const modes=url.searchParams.getAll('perfilwiki'),mode=modes[0],match=/^#perfilwiki-session=([a-f0-9]{32})$/.exec(url.hash);
  const failed={mode:'customize',config:null,token:null,error:MESSAGE};
  if(modes.length!==1||!['panel','customize'].includes(mode)||!match)return failed;
  const key=PREFIX+match[1];
  const reject=()=>{discardSnapshot(host,key);return failed;};
  try{
    const raw=host.sessionStorage.getItem(key);
    if(typeof raw!=='string'||new TextEncoder().encode(raw).length>MAX_BYTES)return reject();
    const saved=JSON.parse(raw),now=currentTime(host);
    if(!saved||typeof saved!=='object'||Array.isArray(saved)||!['config,savedAt,schema','config,liveSource,savedAt,schema'].includes(Object.keys(saved).sort().join(','))||saved.schema!==1||!Number.isFinite(saved.savedAt)||saved.savedAt>now+60000||now-saved.savedAt>TTL)return reject();
    const config=importChoices(serialized(saved.config));
    const source=saved.liveSource?LiveEdit.source(saved.liveSource,config.user,profileTitle(config)):null;
    return {mode,config,token:match[1],error:'',...(source?{liveSource:source}:{})};
  }catch{return reject();}
}

/** Same-tab history navigation only, with no HTTP request or external target. */
export function navigatePanelSession(mode,token,host=defaultHost(),{replace=false}={}){
  try{
    const url=localUrl(host);if(!url||!['panel','customize'].includes(mode)||!TOKEN.test(token||''))return false;
    url.searchParams.set('perfilwiki',mode);url.hash='perfilwiki-session='+token;
    host.history[replace?'replaceState':'pushState'](null,'',url.pathname+url.search+url.hash);
    return true;
  }catch{return false;}
}

export const PANEL_SESSION_LIMITS=Object.freeze({bytes:MAX_BYTES,lifetimeMs:TTL});
