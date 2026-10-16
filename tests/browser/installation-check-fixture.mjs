const localFetch=window.fetch.bind(window);
let release=null, publicReads=0;
window.fetch=async(address,options={})=>{
 const url=new URL(address,document.baseURI);
 if(url.origin===location.origin){
  const response=await localFetch(url.href,options);
  if(url.pathname.endsWith('/release-files.json'))release=await response.clone().json();
  return response;
 }
 if(url.origin!=='https://pt.wikipedia.org' || url.pathname!=='/w/api.php' || url.searchParams.get('action')!=='query' || url.searchParams.get('prop')!=='info|revisions' || options.method!=='GET' || options.credentials!=='omit')throw new Error('Consulta externa bloqueada pelo teste local.');
 publicReads+=1;document.getElementById('check-requests').textContent=publicReads+' consulta(s) simulada(s), GET, sem credenciais. Nenhum pedido foi enviado à Wikipédia.';
 const scenario=document.getElementById('check-scenario').value;
 if(scenario==='offline')return new Response('',{status:503});
 if(!release)throw new Error('Manifesto local ainda indisponível.');
 const titles=url.searchParams.get('titles').split('|');
 const pages=titles.map((title,index)=>{
  if(index===1 && scenario==='missing')return {title,missing:true};
  const text=index===0?document.getElementById('snippet-activation').value:index===1?document.getElementById('snippet-profile').value:release.files.find(file=>file.destination===title)?.text;
  return {title,contentmodel:index===1?'wikitext':index===3?(scenario==='styles'?'wikitext':'sanitized-css'):'javascript',revisions:[{slots:{main:{content:text}}}]};
 });
 return new Response(JSON.stringify({batchcomplete:true,query:{pages}}),{headers:{'Content-Type':'application/json'}});
};
const source=await (await localFetch(new URL('INICIO.html',document.baseURI))).text();
for(const match of source.matchAll(/href="([^"<>]*assets\/[^"<>]+\.css)"/g)){
 const link=document.createElement('link');link.rel='stylesheet';link.href=new URL(match[1],document.baseURI).href;document.head.appendChild(link);
}
const entry=source.match(/src="([^"<>]*assets\/[^"<>]+\.js)"/);
if(!entry)throw new Error('Instalador local não compilado.');
await import(new URL(entry[1],document.baseURI).href);
