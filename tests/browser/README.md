# Testes nos navegadores instalados

Depois de gerar `dist/1.0.0`, execute:

```sh
node scripts/test-browsers.cjs --output /tmp/perfilwiki-browser-results
```

O teste usa Chrome, Firefox e Safari instalados no macOS. O Chrome precisa do pacote Node `playwright`, instalado no projeto ou indicado por `PLAYWRIGHT_MODULE_PATH`. O Safari precisa permitir automação remota. Os navegadores usam sessões de teste, sem a conta da Wikipédia.

Opções: `--browsers chrome,firefox,safari`, `--no-indices` e `--only-indices`. O índice público é servido de `dist/1.0.0/INICIO.html`. A conferência do índice pessoal espera o pacote local em `outputs/perfilwiki_1_0_0`, fora deste repositório. Para testar apenas o programa em uma cópia independente do repositório, use `--no-indices`.

O servidor escuta somente em `127.0.0.1`, aceita GET e HEAD e entrega arquivos locais. As respostas de Wikimedia e XTools são simuladas antes de qualquer conexão. O cenário tem uma editora fictícia, 501 artigos e um total de 251.502 visualizações. A política CSP e os interceptadores dos navegadores recusam recursos externos. Nenhum formulário, edição na Wikipédia ou conteúdo real da área de transferência é usado.

A suíte carrega o pacote completo duas vezes, verifica a conta, as caixas, quatro períodos, expansão até 500 linhas, atualização, exportação integral, dados desconhecidos e leitura da fotografia sem o programa. Pede uma largura de 320 pixels e guarda a largura real, pois o navegador pode impor uma largura mínima. Nos índices, compara texto, downloads e SHA-256 de todos os arquivos. A área de transferência é substituída por uma variável de teste. A falha simulada da cópia precisa abrir, focar e selecionar o texto completo.

Os relatórios JSON e as imagens ficam no diretório escolhido. Guarde os resultados fora do repositório antes de publicar o código.
