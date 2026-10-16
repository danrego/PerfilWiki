import React, { useEffect, useRef, useState } from 'react';
import { editorUrl, RELEASE_VERSION } from './model.mjs';

export function ReleaseFiles() {
  const [release, setRelease] = useState(null);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [opened, setOpened] = useState({});
  const [selection, setSelection] = useState(null);
  const fields = useRef({});
  useEffect(() => {
    const controller = new AbortController();
    fetch(new URL('release-files.json', document.baseURI), { credentials: 'omit', signal: controller.signal })
      .then(response => { if (!response.ok) throw new Error(); return response.json(); })
      .then(data => {
        if (data.version !== RELEASE_VERSION || !Array.isArray(data.files) || data.files.length < 4 || data.files.some(file => typeof file.text !== 'string' || typeof file.summary !== 'string' || !file.filename || !file.destination)) throw new Error();
        setRelease(data);
      }).catch(failure => { if (failure.name !== 'AbortError') setError('Os arquivos desta versão ainda não foram preparados. Gere o pacote local antes de copiar a instalação.'); });
    return () => controller.abort();
  }, []);
  useEffect(() => { if (selection) { fields.current[selection.key]?.focus(); fields.current[selection.key]?.select(); } }, [selection]);
  async function copy(file, summary = false) {
    const text = summary ? file.summary : file.text;
    if (!summary) {
      try {
        const bytes = new TextEncoder().encode(text);
        if (bytes.byteLength !== file.bytes) throw new Error('Tamanho diferente do arquivo preparado.');
        if (crypto.subtle) {
          const digest = await crypto.subtle.digest('SHA-256', bytes);
          const hash = [...new Uint8Array(digest)].map(value => value.toString(16).padStart(2, '0')).join('');
          if (hash !== file.sha256) throw new Error('O arquivo não passou pela conferência.');
        }
      } catch (_) {
        setStatus('O arquivo não passou pela conferência. Gere novamente o pacote antes de copiar.');
        return;
      }
    }
    try {
      if (!navigator.clipboard?.writeText) throw new Error();
      await navigator.clipboard.writeText(text);
      setStatus(summary ? 'Resumo de edição copiado.' : 'Arquivo completo copiado. Confira o destino antes de colar.');
    } catch (_) {
      setOpened(previous => ({ ...previous, [file.filename]: true }));
      setSelection({ key: file.filename + (summary ? '-summary' : '') });
      setStatus('Texto completo selecionado para copiar pelo teclado.');
    }
  }
  return <section className="shared-files" aria-labelledby="shared-heading"><h2 id="shared-heading">Arquivos compartilhados desta versão</h2><p>Quem mantém o PerfilWiki atualiza estes arquivos uma vez. Depois, cada pessoa usa o carregador e os blocos pessoais acima. Esta distribuição local ainda não confirma uma atualização na Wikipédia.</p><p className="field-help">Os estilos usam o destino RitmoPU-estilos, que precisa ter o modelo de conteúdo "CSS higienizado". Publicar o CSS como texto wiki impede o TemplateStyles de funcionar.</p>{error && <p className="field-error" role="alert">{error}</p>}{!release && !error && <p role="status">Preparando arquivos locais...</p>}{release && <div className="release-grid">{release.files.map(file => <article className="release-card" key={file.filename}><h3>{file.label}</h3><p className="destination">{file.destination}</p><div className="install-buttons"><button className="secondary" onClick={() => copy(file)}>Copiar arquivo completo</button><a className="editor-target" href={editorUrl(file.destination)} target="_blank" rel="noopener noreferrer">Abrir destino na Wikipédia</a></div><div className="release-actions"><a href={'./release/' + encodeURIComponent(file.filename)} download={file.filename}>Baixar arquivo</a><button className="text-button" onClick={() => copy(file, true)}>Copiar resumo de edição</button></div><details open={!!opened[file.filename]} onToggle={event => { const isOpen = event.currentTarget.open; setOpened(previous => previous[file.filename] === isOpen ? previous : { ...previous, [file.filename]: isOpen }); }}><summary>Ver código completo e resumo</summary><label htmlFor={'file-' + file.filename}>{file.filename}</label><textarea id={'file-' + file.filename} readOnly value={file.text} ref={el => { fields.current[file.filename] = el; }} spellCheck="false" /><label htmlFor={'summary-' + file.filename}>Resumo de edição</label><textarea className="summary-text" id={'summary-' + file.filename} readOnly value={file.summary} ref={el => { fields.current[file.filename + '-summary'] = el; }} /></details><p className="field-help">{file.bytes.toLocaleString('pt-BR')} bytes · SHA-256 {file.sha256}</p></article>)}</div>}<p className="global-status" role="status">{status}</p><p><a href="./Arquivos.html" target="_blank" rel="noopener noreferrer">Abrir índice de arquivos e documentação</a></p></section>;
}
