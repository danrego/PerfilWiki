#!/usr/bin/env python3
"""Build the two offline installation indexes from the final release files.

Usage: python3 scripts/build_index.py [--root REPOSITORY]
Only INICIO.html and dist/VERSION/INICIO.html are written. No network is used.
"""
import argparse
import datetime
import hashlib
import html
import json
import pathlib
import re


HOST = "Usuário:Daniel G Rego/PerfilWiki"
STYLES_PAGE = "Usuário:Daniel G Rego/RitmoPU-estilos"
FILES = [
    ("Carregador_PerfilWiki.js", "Seu common.js", "personal", "common",
     "Acrescente o carregador uma só vez. Preserve o restante do common.js. Ao migrar, retire apenas os carregadores antigos de RitmoPU e EstatisticasPU."),
    ("Contadores_iniciais.wiki", "Suas caixas de números", "personal", "pu",
     "Coloque este trecho onde deseja mostrar as caixas. Ele começa sem números pessoais. Quem já tem as caixas pode conservar sua disposição e seus identificadores."),
    ("Atividade_inicial.wiki", "Seu painel de atividade", "personal", "pu",
     "Coloque este trecho onde deseja mostrar o calendário e as listas. Mantenha um só painel de atividade e preserve os outros textos da página."),
    ("PerfilWiki-estilos.css", "Manutenção dos estilos compartilhados", "maintenance", STYLES_PAGE,
     "A instalação compartilhada usa a página RitmoPU-estilos, que já tem o modelo CSS higienizado. O nome do arquivo local continua PerfilWiki-estilos.css. Não crie outra página de estilos em texto wiki."),
    ("PerfilWiki.js", "Manutenção do programa compartilhado", "maintenance", HOST + ".js",
     "Arquivo completo para quem mantém a instalação compartilhada. Substitua a versão anterior inteira, sem acrescentar outra cópia ao fim."),
    ("Documentacao_PerfilWiki.wiki", "Documentação na Wikipédia", "maintenance", HOST,
     "Guia completo de instalação, contagens, atualização pública e retirada, preparado para a página de documentação do programa."),
    ("Notas_da_versao.txt", "Notas da versão na Wikipédia", "maintenance", HOST + "/Notas da versão",
     "Notas desta distribuição para quem mantém a documentação compartilhada. Confira a versão antes de substituir o texto anterior."),
]

STYLE = """
*{box-sizing:border-box}body{margin:0;background:#f8f9fa;color:#202122;font:16px/1.6 Arial,sans-serif}main{max-width:1080px;margin:auto;padding:30px 22px 50px}h1,h2,h3{line-height:1.25}h1{font-size:32px;margin:8px 0 18px}h2{font-size:24px;margin:30px 0 16px}h3{font-size:19px;margin:0}a{color:#36c}p{margin:12px 0}.intro{max-width:820px}.notice,.account{border:1px solid #a2a9b1;background:#fff;padding:16px 20px;border-radius:10px;margin:20px 0}.notice{background:#eaf3ff;border-color:#b9cbe8}.account label{display:block;font-weight:bold}.account input{width:min(100%,420px);font:inherit;border:1px solid #72777d;padding:8px 10px;margin:8px 0}.help,.path,.hash,.status{font-size:13px}.help,.path{color:#54595d}.path,.hash{overflow-wrap:anywhere}.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px}.card{border:1px solid #c8ccd1;border-radius:12px;background:#fff;padding:20px;min-width:0}.card p{margin:11px 0}.actions{display:flex;flex-wrap:wrap;gap:9px;align-items:center;margin:15px 0}button,.button{font:600 13px/1.4 Arial,sans-serif;padding:9px 11px;border:1px solid #36c;border-radius:6px;background:#36c;color:#fff;text-decoration:none;cursor:pointer}.secondary{color:#36c;background:#fff;border-color:#a2a9b1}a[aria-disabled=true]{color:#72777d;border-color:#c8ccd1;cursor:default}button:focus,a:focus,summary:focus,input:focus,textarea:focus{outline:3px solid #36c;outline-offset:3px}summary{cursor:pointer;color:#36c;font-size:14px}textarea{width:100%;height:230px;padding:10px;margin:10px 0;border:1px solid #a2a9b1;font:12px/1.5 monospace;white-space:pre;resize:vertical}.summary-text{height:75px}.status{min-height:21px;color:#246342}.status.error{color:#b32424}.hash{color:#54595d;font-family:monospace}.section-help{max-width:850px}.history{border-left:3px solid #c8ccd1;padding-left:20px}.history h3{margin-top:22px}footer{margin-top:35px;font-size:13px;color:#54595d}code{background:#eaecf0;padding:1px 3px}.nav{display:flex;flex-wrap:wrap;gap:10px 20px;margin:20px 0}@media(max-width:720px){main{padding:22px 16px 36px}.grid{grid-template-columns:1fr}h1{font-size:28px}.card{padding:17px}}
"""

SCRIPT = r"""
(function () {
  'use strict';
  var payload = JSON.parse(document.getElementById('release-files').textContent);
  Object.keys(payload).forEach(function (file) {
    payload[file].sourceText = payload[file].text;
    payload[file].sourceSha256 = payload[file].sha256;
  });
  var username = document.getElementById('username');
  var accountStatus = document.getElementById('account-status');
  function escapedAttribute(value) {
    return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function showText(card, item) {
    card.querySelector('.full-text').value = item.text;
    card.querySelector('.summary-text').value = item.summary;
    var label = item.bytes + ' bytes · SHA-256: ' + (item.sha256 || 'calculando para o trecho personalizado');
    card.querySelector('.hash').textContent = label;
  }
  function updateStarter(card, user, valid) {
    var item = payload[card.dataset.file];
    if (!item.template) { return; }
    item.text = valid ? item.sourceText.split('SEU_NOME_DE_USUARIO').join(escapedAttribute(user)) : item.sourceText;
    item.bytes = new TextEncoder().encode(item.text).byteLength;
    item.sha256 = valid ? null : item.sourceSha256;
    showText(card, item);
    card.querySelectorAll('[data-copy]').forEach(function (button) { button.disabled = !valid; });
    var download = card.querySelector('[data-download]');
    if (download.dataset.objectUrl) { URL.revokeObjectURL(download.dataset.objectUrl); delete download.dataset.objectUrl; }
    if (valid) {
      var url = URL.createObjectURL(new Blob([item.text], {type: 'text/plain;charset=utf-8'}));
      download.href = url; download.dataset.objectUrl = url;
    } else { download.href = download.dataset.sourceHref; }
    download.setAttribute('aria-disabled', valid ? 'false' : 'true');
    if (valid && window.crypto && window.crypto.subtle) {
      var text = item.text;
      window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)).then(function (buffer) {
        if (item.text !== text) { return; }
        item.sha256 = Array.from(new Uint8Array(buffer)).map(function (v) { return v.toString(16).padStart(2, '0'); }).join('');
        card.querySelector('.hash').textContent = item.bytes + ' bytes · SHA-256: ' + item.sha256;
      }).catch(function () {
        if (item.text === text) { card.querySelector('.hash').textContent = item.bytes + ' bytes · Trecho personalizado. SHA-256 do modelo: ' + item.sourceSha256; }
      });
    } else if (valid) {
      card.querySelector('.hash').textContent = item.bytes + ' bytes · Trecho personalizado. SHA-256 do modelo: ' + item.sourceSha256;
    }
  }
  function editUrl(title) {
    return 'https://pt.wikipedia.org/w/index.php?title=' + encodeURIComponent(title.replace(/ /g, '_')) + '&action=edit';
  }
  function updateDestinations() {
    var user = username.value.replace(/_/g, ' ').trim().normalize('NFC');
    var valid = user.length > 0 && user.length <= 255 && !/[\x00-\x1f\x7f<>\[\]{}|#:/]/.test(user);
    document.querySelectorAll('[data-scope="personal"]').forEach(function (card) {
      var destination = valid ? 'Usuário:' + user + (card.dataset.target === 'common' ? '/common.js' : '/PU') : '';
      card.querySelector('.destination').textContent = destination || 'Informe sua conta acima para preparar o destino.';
      var link = card.querySelector('[data-editor]');
      link.href = valid ? editUrl(destination) : '#username';
      link.setAttribute('aria-disabled', valid ? 'false' : 'true');
      updateStarter(card, user, valid);
    });
    accountStatus.textContent = valid ? 'Destinos preparados para ' + user + '. O nome fica somente nesta página local.' : user ? 'Digite somente o nome da conta, sem prefixo, barras ou sinais de marcação.' : 'Os destinos pessoais serão preparados quando você informar a conta.';
  }
  function reveal(card, kind) {
    var detail = card.querySelector('details');
    detail.open = true;
    var area = card.querySelector(kind === 'summary' ? '.summary-text' : '.full-text');
    area.focus(); area.select();
  }
  async function verifiedText(file) {
    var item = payload[file];
    if (!item || typeof item.text !== 'string') { throw new Error('Arquivo ausente do índice.'); }
    var text = item.text, expectedHash = item.sha256;
    var encoded = new TextEncoder().encode(text);
    if (encoded.byteLength !== item.bytes) { throw new Error('O texto não passou pela conferência de tamanho. Use o arquivo baixado.'); }
    if (window.crypto && window.crypto.subtle) {
      var digest = new Uint8Array(await window.crypto.subtle.digest('SHA-256', encoded));
      var hash = Array.from(digest).map(function (v) { return v.toString(16).padStart(2, '0'); }).join('');
      if (expectedHash && hash !== expectedHash) { throw new Error('O texto não passou pela conferência SHA-256. Use o arquivo baixado.'); }
    }
    if (item.text !== text) { throw new Error('A conta mudou durante a conferência. Copie novamente o trecho atualizado.'); }
    return text;
  }
  document.querySelectorAll('.card').forEach(function (card) {
    var item = payload[card.dataset.file];
    showText(card, item);
    var download = card.querySelector('[data-download]');
    download.dataset.sourceHref = download.getAttribute('href');
    download.addEventListener('click', function (event) {
      if (download.getAttribute('aria-disabled') === 'true') { event.preventDefault(); username.focus(); }
    });
    card.querySelectorAll('[data-copy]').forEach(function (button) {
      button.addEventListener('click', async function () {
        var status = card.querySelector('.status'), kind = button.dataset.copy;
        status.classList.remove('error');
        try {
          var text = kind === 'summary' ? item.summary : await verifiedText(card.dataset.file);
          if (navigator.clipboard && navigator.clipboard.writeText) {
            try {
              await navigator.clipboard.writeText(text);
              status.textContent = kind === 'summary' ? 'Resumo copiado.' : 'Arquivo completo copiado. Confira o destino antes de colar.';
              return;
            } catch (_) { /* The selected text below is the manual fallback. */ }
          }
          reveal(card, kind);
          status.textContent = 'Texto completo selecionado. Copie pelo teclado.';
        } catch (error) {
          reveal(card, kind); status.classList.add('error'); status.textContent = error.message;
        }
      });
    });
    var editor = card.querySelector('[data-editor]');
    editor.addEventListener('click', function (event) {
      if (editor.getAttribute('aria-disabled') === 'true') { event.preventDefault(); username.focus(); }
    });
  });
  username.addEventListener('input', updateDestinations);
  updateDestinations();
}());
"""


def read_metadata(root):
    package = json.loads((root / "package.json").read_text(encoding="utf-8"))
    version = package.get("version")
    if not isinstance(version, str) or not re.fullmatch(r"\d+\.\d+\.\d+", version):
        raise ValueError("package.json precisa de uma versão x.y.z")
    releases = json.loads((root / "docs/RELEASES.json").read_text(encoding="utf-8"))
    if not isinstance(releases, list) or not releases or not isinstance(releases[0], dict) or releases[0].get("version") != version:
        raise ValueError("A primeira versão de docs/RELEASES.json precisa corresponder ao package.json")
    seen, previous = set(), None
    for release in releases:
        if not isinstance(release, dict):
            raise ValueError("Entrada de histórico inválida")
        name, changes = release.get("version"), release.get("changes")
        if not isinstance(name, str) or not re.fullmatch(r"\d+\.\d+\.\d+", name) or name in seen:
            raise ValueError("Versão inválida ou repetida no histórico")
        numeric = tuple(int(value) for value in name.split("."))
        if previous is not None and numeric >= previous:
            raise ValueError("O histórico precisa vir da versão mais recente para a mais antiga")
        if not isinstance(changes, list) or not changes or not all(isinstance(v, str) and v.strip() for v in changes):
            raise ValueError("Cada versão precisa de uma lista de mudanças")
        if release.get("date"):
            if not isinstance(release["date"], str) or not re.fullmatch(r"\d{4}-\d{2}-\d{2}", release["date"]):
                raise ValueError("Data de lançamento inválida")
            datetime.date.fromisoformat(release["date"])
        seen.add(name)
        previous = numeric
    return version, releases


def release_payload(root, version):
    payload = {}
    for name, _title, scope, _target, _description in FILES:
        source = root / "dist" / version / name
        if source.is_symlink() or not source.is_file():
            raise ValueError("Arquivo de distribuição ausente ou simbólico: " + name)
        raw = source.read_bytes()
        text = raw.decode("utf-8")
        if not text.strip():
            raise ValueError("Arquivo de distribuição vazio: " + name)
        verb = "Instala" if scope == "personal" else "Atualiza"
        template = name in {"Contadores_iniciais.wiki", "Atividade_inicial.wiki"}
        if template and ("SEU_NOME_DE_USUARIO" not in text or "data-perfilwiki-user" not in text):
            raise ValueError("Trecho inicial sem a marca de conta esperada: " + name)
        payload[name] = {"text": text, "bytes": len(raw), "sha256": hashlib.sha256(raw).hexdigest(), "template": template,
                         "summary": f"{verb} PerfilWiki {version}: {name}."}
    return payload


def editor_url(title):
    from urllib.parse import quote
    return "https://pt.wikipedia.org/w/index.php?title=" + quote(title.replace(" ", "_"), safe="") + "&action=edit"


def render_card(spec, payload, prefix):
    name, title, scope, target, description = spec
    item = payload[name]
    esc = html.escape
    href = "#username" if scope == "personal" else editor_url(target)
    destination = "Informe sua conta acima para preparar o destino." if scope == "personal" else target
    disabled = "true" if scope == "personal" else "false"
    model_link = ('<a class="button secondary" href="' + esc(editor_url(target).replace('&action=edit', '&action=info')) + '" target="_blank" rel="noopener noreferrer">Conferir modelo da página</a>') if name == 'PerfilWiki-estilos.css' else ''
    return f'''<article class="card" data-file="{esc(name)}" data-scope="{scope}" data-target="{esc(target)}">
<h3>{esc(title)}</h3><p class="path destination">{esc(destination)}</p><p>{esc(description)}</p>
<div class="actions"><button type="button" data-copy="content">Copiar arquivo inteiro</button><button type="button" class="secondary" data-copy="summary">Copiar resumo</button><a class="button secondary" data-editor href="{esc(href)}" aria-disabled="{disabled}" target="_blank" rel="noopener noreferrer">Abrir editor</a><a class="button secondary" data-download href="{esc(prefix + name)}" download="{esc(name)}">Baixar {esc(name)}</a>{model_link}</div>
<p class="status" role="status" aria-live="polite"></p><p class="hash">{item['bytes']} bytes · SHA-256: {item['sha256']}</p>
<details><summary>Ver texto completo e copiar pelo teclado</summary><label>Arquivo inteiro: {esc(name)}<textarea class="full-text" readonly spellcheck="false"></textarea></label><label>Resumo de edição<textarea class="summary-text" readonly spellcheck="false"></textarea></label></details></article>'''


def render_index(version, releases, payload, *, distribution=False):
    prefix = "" if distribution else f"dist/{version}/"
    root_prefix = "../../" if distribution else ""
    personal = "\n".join(render_card(spec, payload, prefix) for spec in FILES if spec[2] == "personal")
    maintenance = "\n".join(render_card(spec, payload, prefix) for spec in FILES if spec[2] == "maintenance")
    history = []
    for release in releases:
        label = html.escape(release["version"] + (" · " + release["date"] if release.get("date") else ""))
        bullets = "".join("<li>" + html.escape(change) + "</li>" for change in release["changes"])
        history.append(f"<section><h3>{label}</h3><ul>{bullets}</ul></section>")
    embedded = json.dumps(payload, ensure_ascii=False, separators=(",", ":")).replace("<", "\\u003c").replace("\u2028", "\\u2028").replace("\u2029", "\\u2029")
    return f'''<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>PerfilWiki {html.escape(version)}: instalar e atualizar</title><style>{STYLE}</style></head>
<body><main><header><p class="help">PerfilWiki {html.escape(version)}</p><h1>Arquivos para instalar e atualizar</h1><p class="intro">Escolha a conta, copie o carregador e coloque as caixas e o painel de atividade onde desejar na sua página. Os textos completos estão neste índice e nos arquivos da distribuição.</p><nav class="nav" aria-label="Nesta página"><a href="#personal">Sua instalação</a><a href="#maintenance">Arquivos compartilhados</a><a href="#history">Versões</a><a href="{root_prefix}docs/INSTALACAO.md">Guia de instalação</a></nav></header>
<section class="notice"><p>Os destinos compartilhados abaixo são os endereços previstos para a instalação. Este pacote não confirma que os arquivos já tenham sido publicados na Wikipédia. Use a importação depois que o responsável tiver instalado o programa e os estilos nesses destinos.</p><p>Copiar e baixar não salva páginas. "Abrir editor" abre a Wikipédia somente quando você clica. A conferência e a decisão de salvar ficam com você.</p></section>
<section class="account" aria-label="Preparar destinos pessoais"><label for="username">Seu nome de usuário na Wikipédia em português</label><input id="username" type="text" autocomplete="off" spellcheck="false" placeholder="Nome da conta"><p class="help">Digite sem "Usuário:". O nome prepara os destinos do common.js e da subpágina /PU e substitui SEU_NOME_DE_USUARIO nas marcas das caixas e da atividade. Os botões desses dois trechos copiam e baixam a versão preparada para sua conta. Se preferir a página principal de usuário, cole nela somente os trechos correspondentes.</p><p id="account-status" class="help" role="status" aria-live="polite"></p></section>
<section id="personal"><h2>Sua instalação</h2><p class="section-help">Mantenha uma só chamada do PerfilWiki. O carregador usa a conta conectada e o fuso do navegador, com UTC como alternativa. A configuração opcional fica antes da importação. Preserve RevisaWiki e os outros scripts.</p><p class="section-help">Ao migrar uma página pronta, conserve os textos e a disposição das caixas e do painel. Substitua somente os trechos correspondentes. Não copie uma página pessoal inteira nem os números de outra conta.</p><div class="grid">{personal}</div></section>
<section id="maintenance"><h2>Arquivos compartilhados, para manutenção</h2><p class="section-help">Estas etapas são para quem instala ou atualiza os arquivos compartilhados. Uma pessoa que usa a instalação pronta só precisa dos três trechos acima. Use a folha compartilhada RitmoPU-estilos, que já está preparada para TemplateStyles. Atualize o programa e a documentação antes dos trechos pessoais.</p><div class="grid">{maintenance}</div></section>
<section id="history"><h2>Versões</h2><p>Histórico preparado a partir dos mesmos metadados da distribuição. O <a href="{root_prefix}CHANGELOG.md">CHANGELOG</a> guarda as notas de cada lançamento.</p><div class="history">{''.join(history)}</div></section>
<footer><p>Na sua sessão, o programa consulta dados públicos e atualiza a tela. Para os visitantes, baixe os contadores e a atividade e substitua manualmente os blocos correspondentes na página. Uma falha de consulta não vira zero.</p><p>O total de visualizações soma todos os artigos aceitos. A lista apresenta até 500 por período. Edições e agradecimentos podem abranger os projetos da conta global, enquanto a atividade e as visualizações usam a Wikipédia em português.</p><p>Este índice não busca arquivos pela rede. Cada botão usa o texto inteiro incorporado, com tamanho e SHA-256 indicados acima. Se o navegador não permitir copiar, abra o texto completo e use o teclado.</p></footer></main>
<script id="release-files" type="application/json">{embedded}</script><script>{SCRIPT}</script></body></html>
'''


def build(root):
    root = pathlib.Path(root).resolve()
    version, releases = read_metadata(root)
    payload = release_payload(root, version)
    outputs = [(root / "INICIO.html", False), (root / "dist" / version / "INICIO.html", True)]
    for path, distribution in outputs:
        with path.open("w", encoding="utf-8", newline="\n") as target:
            target.write(render_index(version, releases, payload, distribution=distribution))
    return {"version": version, "files": len(payload), "indexes": [path.relative_to(root).as_posix() for path, _ in outputs]}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=pathlib.Path, default=pathlib.Path(__file__).resolve().parents[1])
    args = parser.parse_args()
    try:
        print(json.dumps(build(args.root), ensure_ascii=False))
    except (OSError, UnicodeError, ValueError, TypeError, KeyError) as error:
        parser.exit(1, "Não foi possível gerar o índice: " + str(error) + "\n")


if __name__ == "__main__":
    main()
