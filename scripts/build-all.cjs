'use strict';
/** Build the runtime, portable local installer, and complete manual-install files. */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const installer = path.join(root, 'installer');
const version = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8')).version;
const output = path.join(root, 'dist', version);
function run(command, args, cwd = root) {
  const result = spawnSync(command, args, { cwd, encoding: 'utf8', stdio: 'inherit' });
  if (result.status !== 0) throw new Error('Falha ao gerar os arquivos locais.');
}
run('python3', ['scripts/build.py']);
// Keep the complete previous file index as an advanced maintenance view.
let advanced = fs.readFileSync(path.join(output, 'INICIO.html'), 'utf8').replaceAll('../../docs/', './docs/').replaceAll('../../CHANGELOG.md', './CHANGELOG.md');
const publicDir = path.join(installer, 'public');
fs.mkdirSync(publicDir, { recursive: true });
fs.writeFileSync(path.join(publicDir, 'Arquivos.html'), advanced);
run(process.execPath, [path.join(installer, 'scripts/sync-runtime.cjs'), '--repo', root]);
const specs = [
  ['PerfilWiki-estilos.css', 'Estilos do painel', 'Usuário:Daniel G Rego/RitmoPU-estilos', 'Atualizar os estilos do PerfilWiki para ' + version],
  ['PerfilWiki.js', 'Programa do PerfilWiki', 'Usuário:Daniel G Rego/PerfilWiki.js', 'Atualizar o PerfilWiki para ' + version + ' com instalador e personalização'],
  ['Documentacao_PerfilWiki.wiki', 'Documentação de instalação e funcionamento', 'Usuário:Daniel G Rego/PerfilWiki', 'Atualizar a documentação do PerfilWiki ' + version],
  ['Notas_da_versao.txt', 'Notas da versão', 'Usuário:Daniel G Rego/PerfilWiki/Notas da versão', 'Adicionar as notas do PerfilWiki ' + version],
];
const releaseDir = path.join(publicDir, 'release');
fs.rmSync(releaseDir, { recursive: true, force: true });
fs.mkdirSync(releaseDir, { recursive: true });
const files = specs.map(([filename, label, destination, summary]) => {
  const bytes = fs.readFileSync(path.join(output, filename));
  fs.writeFileSync(path.join(releaseDir, filename), bytes);
  return { filename, label, destination, summary, text: bytes.toString('utf8'), bytes: bytes.length,
    sha256: crypto.createHash('sha256').update(bytes).digest('hex') };
});
fs.writeFileSync(path.join(publicDir, 'release-files.json'), JSON.stringify({ version, status: 'local-candidate', files }) + '\n');
for (const filename of ['PerfilWiki.js', 'PerfilWiki-estilos.css', 'Carregador_PerfilWiki.js', 'Contadores_iniciais.wiki', 'Atividade_inicial.wiki', 'Documentacao_PerfilWiki.wiki', 'Notas_da_versao.txt']) {
  fs.copyFileSync(path.join(output, filename), path.join(publicDir, filename));
}
fs.rmSync(path.join(publicDir, 'docs'), { recursive: true, force: true });
fs.cpSync(path.join(root, 'docs'), path.join(publicDir, 'docs'), { recursive: true });
fs.copyFileSync(path.join(root, 'CHANGELOG.md'), path.join(publicDir, 'CHANGELOG.md'));
for (const filename of ['LICENSE', 'THIRD_PARTY_NOTICES.txt', 'BUILD_TOOLCHAIN.json']) {
  fs.copyFileSync(path.join(root, filename), path.join(publicDir, filename));
}
run(process.execPath, [path.join(installer, 'node_modules/vite/bin/vite.js'), 'build'], installer);
const client = path.join(installer, 'dist/client');
for (const destination of [root, output]) {
  for (const name of fs.readdirSync(client)) {
    const source = path.join(client, name);
    const target = path.join(destination, name);
    // Source documentation remains owned by the authoring files at the root.
    if (destination === root && (name === 'docs' || name === 'CHANGELOG.md')) continue;
    if (['assets', 'local-preview', 'release', 'docs'].includes(name)) fs.rmSync(target, { recursive: true, force: true });
    fs.cpSync(source, target, { recursive: true });
  }
  fs.copyFileSync(path.join(client, 'index.html'), path.join(destination, 'INICIO.html'));
}
run('python3', ['scripts/build.py', '--check-public']);
console.log(JSON.stringify({ version, status: 'local-candidate', installer: 'INICIO.html', filesIndex: 'Arquivos.html', sharedFiles: files.length }));
