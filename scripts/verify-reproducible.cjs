'use strict';
// Two complete local builds, compared by relative path and SHA-256. No network.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');

function snapshot(directory) {
  const result = {};
  function visit(parent, prefix) {
    for (const name of fs.readdirSync(parent).sort()) {
      const absolute = path.join(parent, name), relative = prefix + name;
      const stat = fs.lstatSync(absolute);
      if (stat.isSymbolicLink()) throw new Error('A distribuição contém uma ligação simbólica.');
      if (stat.isDirectory()) visit(absolute, relative + '/');
      else if (stat.isFile()) result[relative] = crypto.createHash('sha256').update(fs.readFileSync(absolute)).digest('hex');
      else throw new Error('A distribuição contém um tipo de arquivo inesperado.');
    }
  }
  visit(directory, '');
  return result;
}
function compare(first, second) {
  const names = Array.from(new Set([...Object.keys(first), ...Object.keys(second)])).sort();
  return names.filter(name => first[name] !== second[name]);
}
function run(root) {
  const version = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8')).version;
  if (typeof version !== 'string' || !/^\d+\.\d+\.\d+$/.test(version)) throw new Error('A versão do pacote é inválida.');
  const directory = path.join(root, 'dist', version);
  const build = () => {
    // Historical versions remain intact. Each current-version build starts empty,
    // so an obsolete file cannot mask an omitted input or survive both snapshots.
    fs.rmSync(directory, { recursive: true, force: true });
    const result = spawnSync(process.execPath, [path.join(root, 'scripts/build-all.cjs')], { cwd: root, stdio: 'inherit' });
    if (result.status !== 0) throw new Error('A construção completa falhou.');
    return snapshot(directory);
  };
  const first = build(), second = build(), different = compare(first, second);
  if (different.length) throw new Error('As duas construções diferem em ' + different.length + ' arquivo(s): ' + different.join(', '));
  return { version, builds: 2, files: Object.keys(second).length, identical: true };
}
if (require.main === module) {
  try { console.log(JSON.stringify(run(path.resolve(__dirname, '..')))); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
module.exports = Object.freeze({ snapshot, compare, run });
