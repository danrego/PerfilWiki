#!/usr/bin/env python3
"""Build PerfilWiki from repository sources using only Python's standard library."""
import argparse
import importlib.util
import json
import os
import pathlib
import re


MODULES = ["Configuration", "PageviewsCore", "History", "Statistics", "Coordinator",
           "Presenter", "ActivityView", "Cache", "CardsView"]
HOST = "Usuário:Daniel G Rego/PerfilWiki"
STYLES_PAGE = "Usuário:Daniel G Rego/RitmoPU-estilos"
USER_TOKEN = "SEU_NOME_DE_USUARIO"
CARDS = [
    ("perfilwiki-anos", "Na Wikipédia", "🌱", " dan-pu-stat-tenure"),
    ("dan-pu-ritmo-melhor-sequencia", "Melhor sequência", "🔥", ""),
    ("dan-pu-agradecimentos", "Agradecimentos recebidos", "💛", ""),
    ("dan-pu-edicoes", "Contribuições", "✍️", " dan-pu-stat-primary"),
    ("dan-pu-reversoes", "Reversões", "🛡️", ""),
    ("dan-pu-editados", "Artigos diferentes editados", "🛠️", ""),
    ("dan-pu-artigos", "Artigos criados", "📚", ""),
    ("dan-pu-criados-tecnicos", "Predefinições, módulos e scripts criados", "🧩", ""),
]


def write(path, value):
    with path.open("w", encoding="utf-8", newline="\n") as target:
        target.write(value.rstrip() + "\n")


def loader(version):
    return '/* PerfilWiki ' + version + '. Carregador pessoal. Daniel G Rego, CC BY-SA 4.0. */\n' + """
(function () {
    'use strict';
    if (typeof mw === 'undefined' || !mw.config || mw.config.get('wgDBname') !== 'ptwiki' ||
        mw.config.get('wgAction') !== 'view' || mw.config.get('wgNamespaceNumber') !== 2) { return; }
    var user = mw.config.get('wgUserName');
    var owner = mw.config.get('wgRelevantUserName') || String(mw.config.get('wgTitle') || '').split('/')[0].replace(/_/g, ' ');
    if (!user || owner !== user || window.PerfilWiki || window.PerfilWikiLoaderRequested || typeof importScript !== 'function') { return; }
    window.PerfilWikiLoaderRequested = true;
    importScript('Usuário:Daniel G Rego/PerfilWiki.js');
}());
"""


def check_public_tree(root):
    """Reject accidentally copied local account material before packaging public files.

    Browser and transport tests may contain synthetic names, dates and deliberately
    invalid credential URLs. Real credential signatures and local client paths are
    forbidden in every scanned UTF-8 file, including tests and generated assets.
    """
    root = pathlib.Path(root).resolve()
    excluded = {'.git', 'node_modules', '__pycache__', '.pytest_cache', 'coverage', 'test-results'}
    forbidden_dirs = {'sources', 'outputs', '.aws', '.ssh'}
    forbidden_names = {'.env', '.netrc', 'pu.wiki', 'dados_consultados.json'}
    patterns = [
        re.compile(r'/(?:Users|home)/[^/\s\"\'<>]+/'),
        re.compile(r'[A-Za-z]:\\Users\\[^\\\s]+\\'),
        re.compile(r'/(?:private/)?var/folders/'),
        re.compile(r'-----BEGIN (?:[A-Z]+ )?PRIVATE KEY-----'),
        re.compile(r'\bgh[pousr]_[A-Za-z0-9_]{20,}\b'),
        re.compile(r'\bgithub_pat_[A-Za-z0-9_]{20,}\b'),
        re.compile(r'\bsk-(?:proj-)?[A-Za-z0-9_-]{24,}\b'),
        re.compile(r'\b(?:AKIA|ASIA)[A-Z0-9]{16}\b'),
        re.compile(r'\bBearer [A-Za-z0-9_.-]{24,}'),
    ]
    checked = 0
    for directory, folders, files in os.walk(root, topdown=True, followlinks=False):
        parent = pathlib.Path(directory)
        kept = []
        for name in folders:
            if name in excluded:
                continue
            child = parent / name
            relative = child.relative_to(root).as_posix()
            if child.is_symlink() or name.lower() in forbidden_dirs:
                raise ValueError('Pasta privada, sincronizada ou simbólica na distribuição: ' + relative)
            kept.append(name)
        folders[:] = kept
        for name in files:
            if name in {'.DS_Store'} or name.endswith(('.pyc', '.pyo')):
                continue
            child = parent / name
            relative = child.relative_to(root).as_posix()
            lower = name.lower()
            if child.is_symlink() or lower in forbidden_names or re.fullmatch(r'common(?:[._-].*)?\.(?:js|css)', lower) or \
                    re.match(r'(?:pagina|página)[_-](?:usuario|usuário)', lower) or lower.startswith('dados_consultados_'):
                raise ValueError('Arquivo pessoal ou simbólico na distribuição: ' + relative)
            raw = child.read_bytes()
            try:
                content = raw.decode('utf-8')
            except UnicodeDecodeError:
                continue
            if any(pattern.search(content) for pattern in patterns):
                # Never include a matching token or filesystem path in diagnostics.
                raise ValueError('Caminho local ou credencial encontrado em: ' + relative)
            checked += 1
    return checked


def cards_markup():
    pieces = ['<templatestyles src="' + STYLES_PAGE + '" />',
              '<div id="dan-pu-estatisticas" class="dan-pu-stats" data-perfilwiki-user="' + USER_TOKEN + '">']
    for element_id, label, icon, classes in CARDS:
        pieces.append('<div class="dan-pu-stat-card' + classes + '"><div class="dan-pu-stat-icon" aria-hidden="true">' +
                      icon + '</div><div class="dan-pu-stat-value"><span id="' + element_id +
                      '">Aguardando dados</span></div><div class="dan-pu-stat-label">' + label + '</div></div>')
    pieces.append('</div>')
    # Contiguous HTML keeps the wiki parser from adding paragraphs between cards.
    return ''.join(pieces)


def activity_markup():
    return ('<templatestyles src="' + STYLES_PAGE + '" />'
            '<div id="dan-pu-ritmo" data-perfilwiki-user="' + USER_TOKEN + '">'
            'A atividade ainda não foi consultada. Abra esta página na sua conta para iniciar a consulta pública.'
            '</div>')


def build(root):
    root = pathlib.Path(root).resolve()
    check_public_tree(root)
    package = json.loads((root / 'package.json').read_text(encoding='utf-8'))
    releases = json.loads((root / 'docs/RELEASES.json').read_text(encoding='utf-8'))
    version = package['version']
    if not releases or releases[0]['version'] != version:
        raise ValueError('A versão do pacote e das notas precisa ser a mesma.')
    # build_index also validates the version and release history before writing an index.
    spec = importlib.util.spec_from_file_location('perfilwiki_build_index', root / 'scripts/build_index.py')
    index = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(index)
    index.read_metadata(root)
    output = root / 'dist' / version
    output.mkdir(parents=True, exist_ok=True)
    css = (root / 'src/PerfilWiki-estilos.css').read_text(encoding='utf-8')
    bundle = ['/* PerfilWiki ' + version + '. Daniel G Rego, CC BY-SA 4.0. Built from src, without seeded metrics. */']
    for name in MODULES:
        bundle.append((root / 'src' / (name + '.js')).read_text(encoding='utf-8').rstrip())
    bundle.append('(function (root) { root.PerfilWikiStyleText = ' + json.dumps(css, ensure_ascii=True) + '; }(window));')
    bundle.append((root / 'src/Runtime.js').read_text(encoding='utf-8').rstrip())
    files = {
        'PerfilWiki.js': '\n\n;\n\n'.join(bundle),
        'PerfilWiki-estilos.css': css,
        'Carregador_PerfilWiki.js': loader(version),
        'Contadores_iniciais.wiki': cards_markup(),
        'Atividade_inicial.wiki': activity_markup(),
        'Documentacao_PerfilWiki.wiki': (root / 'docs/Documentacao_PerfilWiki.wiki').read_text(encoding='utf-8'),
        'Notas_da_versao.txt': 'PerfilWiki ' + version + ' · ' + releases[0]['date'] + '\n\n' +
            '\n'.join('* ' + change for change in releases[0]['changes']),
    }
    for name, value in files.items():
        write(output / name, value)
    indexes = index.build(root)
    return {'version': version, 'files': sorted(files), 'indexes': indexes['indexes']}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root', type=pathlib.Path, default=pathlib.Path(__file__).resolve().parents[1])
    parser.add_argument('--check-public', action='store_true', help='Conferir somente os arquivos públicos, sem gerar a distribuição.')
    args = parser.parse_args()
    try:
        result = {'checkedFiles': check_public_tree(args.root)} if args.check_public else build(args.root)
        print(json.dumps(result, ensure_ascii=False))
    except (OSError, UnicodeError, ValueError, TypeError, KeyError) as error:
        parser.exit(1, 'Não foi possível gerar a distribuição: ' + str(error) + '\n')


if __name__ == '__main__':
    main()
