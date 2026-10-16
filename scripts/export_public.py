#!/usr/bin/env python3
"""Export a reviewed source/current-release tree without Git history or publication."""
import argparse
import hashlib
import importlib.util
import json
import pathlib
import shutil
import sys

ROOT_FILES = (
    '.gitignore', '.node-version', '.nvmrc', '.nojekyll', 'package.json', 'README.md',
    'CHANGELOG.md', 'LICENSE', 'THIRD_PARTY_NOTICES.txt', 'BUILD_TOOLCHAIN.json',
    'INICIO.html', 'index.html', 'Arquivos.html', 'release-files.json',
    'PerfilWiki.js', 'PerfilWiki-estilos.css', 'Carregador_PerfilWiki.js',
    'Contadores_iniciais.wiki', 'Atividade_inicial.wiki',
    'Documentacao_PerfilWiki.wiki', 'Notas_da_versao.txt',
)
SOURCE_DIRS = ('src', 'scripts', 'tests', 'docs', 'installer/src',
               'installer/scripts', 'installer/tests', 'installer/public/local-preview')
INSTALLER_FILES = ('installer/package.json', 'installer/pnpm-lock.yaml',
                   'installer/pnpm-workspace.yaml', 'installer/index.html',
                   'installer/vite.config.mjs', 'installer/AGENTS.md',
                   '.github/workflows/ci.yml')
STATIC_DIRS = ('assets', 'local-preview', 'release')
TEXT_EXTENSIONS = {'.js', '.cjs', '.mjs', '.jsx', '.css', '.html', '.md',
                   '.wiki', '.json', '.py', '.yml', '.yaml', '.txt', '.svg'}


def guard(root):
    spec = importlib.util.spec_from_file_location('perfilwiki_public_guard', root / 'scripts/build.py')
    module = importlib.util.module_from_spec(spec)
    previous = sys.dont_write_bytecode
    try:
        # Loading the guard must not add a private-path-bearing .pyc file to
        # the source checkout or the freshly selected publication tree.
        sys.dont_write_bytecode = True
        spec.loader.exec_module(module)
    finally:
        sys.dont_write_bytecode = previous
    return module.check_public_tree(root)


def selected_files(root):
    root = pathlib.Path(root).resolve()
    version = json.loads((root / 'package.json').read_text(encoding='utf-8'))['version']
    if not isinstance(version, str) or not __import__('re').fullmatch(r'\d+\.\d+\.\d+', version):
        raise ValueError('A versão do pacote é inválida.')
    selected = set(ROOT_FILES + INSTALLER_FILES)
    directories = SOURCE_DIRS + STATIC_DIRS + ('dist/' + version,)
    for directory in directories:
        start = root / directory
        if start.is_symlink() or not start.is_dir():
            raise ValueError('Falta uma pasta pública esperada: ' + directory)
        for candidate in start.rglob('*'):
            relative = candidate.relative_to(root)
            if '__pycache__' in relative.parts or candidate.name.endswith(('.pyc', '.pyo')):
                continue
            if candidate.is_symlink():
                raise ValueError('Uma entrada pública é simbólica: ' + relative.as_posix())
            if candidate.is_file():
                if any(part.startswith('.') for part in relative.parts) or candidate.suffix not in TEXT_EXTENSIONS and candidate.name != 'LICENSE':
                    raise ValueError('Tipo de arquivo fora da lista pública: ' + relative.as_posix())
                selected.add(relative.as_posix())
    for name in sorted(selected):
        source = root / name
        if source.is_symlink() or not source.is_file():
            raise ValueError('Falta um arquivo público esperado: ' + name)
        try:
            source.read_bytes().decode('utf-8')
        except UnicodeDecodeError as error:
            raise ValueError('Arquivo binário exige revisão antes da exportação: ' + name) from error
    return version, sorted(selected)


def export(root, output):
    root, output = pathlib.Path(root).resolve(), pathlib.Path(output).resolve()
    if output == root or root in output.parents or output in root.parents or output.exists():
        raise ValueError('Use uma pasta nova fora do repositório, sem substituir arquivos existentes.')
    guard(root)
    version, names = selected_files(root)
    # Selection and validation finish before any destination is created.
    output.mkdir(parents=True)
    try:
        files = {}
        for name in names:
            target = output / name
            target.parent.mkdir(parents=True, exist_ok=True)
            content = (root / name).read_bytes()
            target.write_bytes(content)
            files[name] = {'bytes': len(content), 'sha256': hashlib.sha256(content).hexdigest()}
        manifest = {'schema': 1, 'version': version, 'status': 'reviewed-local-candidate',
                    'scope': 'source-and-current-release-only', 'publicationPerformed': False, 'files': files}
        (output / 'PUBLIC_MANIFEST.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
        guard(output)
    except Exception:
        shutil.rmtree(output)
        raise
    return {'version': version, 'files': len(names), 'publicationPerformed': False}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root', type=pathlib.Path, default=pathlib.Path(__file__).resolve().parents[1])
    parser.add_argument('--output', type=pathlib.Path, required=True, help='New local directory outside this checkout')
    args = parser.parse_args()
    try:
        print(json.dumps(export(args.root, args.output), ensure_ascii=False))
    except (OSError, ValueError, TypeError, KeyError) as error:
        parser.exit(1, 'Não foi possível preparar o pacote público: ' + str(error) + '\n')


if __name__ == '__main__':
    main()
