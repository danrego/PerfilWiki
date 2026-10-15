# Repetir a construção e os testes

Use Node.js 20 ou posterior e Python 3.9 ou posterior, como indicado no `package.json`. Os comandos abaixo trabalham nos arquivos locais. Eles não entram em contas nem publicam páginas.

## Construir os arquivos

Na raiz do repositório, execute:

```sh
npm run build
```

O comando reúne os módulos, copia os estilos e a documentação e gera os trechos iniciais e os dois índices. A versão vem de `package.json`, e as notas vêm de `docs/RELEASES.json`. Os dois precisam apontar para o mesmo lançamento.

Para reconstruir somente os índices depois de preparar os arquivos de distribuição, execute:

```sh
python3 scripts/build_index.py
```

O índice da raiz e o índice dentro de `dist/1.0.0` usam caminhos relativos próprios. A construção não busca dados externos nem inclui uma fotografia pessoal de resultados.

## Executar os contratos locais

```sh
npm test
```

O comando executa os arquivos `tests/*.test.cjs` e `tests/inherited_metrics.cjs`. Os testes usam respostas controladas e contas de exemplo para conferir o histórico paginado, as contagens, a coordenação, a configuração, a apresentação e os cálculos herdados.

Os casos de falha precisam conservar o último resultado válido, manter dados desconhecidos sem convertê-los em zero e recusar respostas incompatíveis. Os casos de identidade verificam que uma conta não receba resultados de outra. O teste de transporte confere as fontes permitidas e a recusa de ações de escrita e autenticação.

O resultado de uma execução vale para a árvore de arquivos testada. Depois de alterar o código ou a construção, gere novamente a distribuição e repita os contratos correspondentes.

## Conferir o índice

Use uma conta de exemplo no campo do índice e confira os destinos do `common.js` e de `/PU`. Os dois trechos iniciais devem ter o nome informado em `data-perfilwiki-user`, sem a marca `SEU_NOME_DE_USUARIO` na cópia preparada. O carregador continua usando a conta conectada.

Confira conteúdo inteiro, resumo, download e ligação ao editor em cada cartão. O texto manual deve ser igual ao texto copiado. A alternativa manual deve continuar disponível quando a área de transferência estiver bloqueada. Um teste automatizado dessa alternativa pode simular a área de transferência, sem modificar o clipboard do sistema.

Os downloads personalizados precisam corresponder ao nome exibido nos destinos. Os arquivos genéricos do repositório continuam com a marca de substituição. Caracteres como acentos, apóstrofos e aspas exigem a mesma identidade depois de passar pelo HTML.

## Conferir os estilos e a página

A folha destinada à Wikipédia precisa passar pelo sanitizador de TemplateStyles. Validade em um navegador comum não garante validade no modelo `sanitized-css`.

A revisão visual deve conferir as caixas e a atividade em suas posições independentes, em telas largas e estreitas. Confira abas, expansões, teclado, foco e falhas das miniaturas. As imagens opcionais não podem mudar uma soma nem impedir a leitura do título.

Os testes locais de regras não substituem essa revisão visual. Um teste de navegador deve registrar o navegador usado, os passos e os limites da sessão. Na versão 1.0.0, passaram os 104 testes registrados no Node, com 20 casos herdados de métricas dentro dessa execução. Chrome 155.0.8059.40, Firefox 158.0 e Safari 27.0.1 passaram por 110 verificações cada, com respostas simuladas em localhost. A conferência cobriu os cinco cenários de execução, os dois índices e a apresentação estreita, com 320 pixels no Chrome e no Firefox e 336 pixels no Safari, o mínimo obtido nessa sessão WebDriver. O relatório resumido está em [VALIDACAO.json](VALIDACAO.json). Nenhuma sessão autenticada da Wikimedia foi operada e a área de transferência real não foi alterada.

## Repetir os testes de navegador

No macOS, com Chrome, Firefox e Safari instalados, execute `node scripts/test-browsers.cjs --output ../browser_qa`. O teste de Chrome precisa do pacote Playwright disponível por `require` ou pelo caminho informado em `PLAYWRIGHT_MODULE_PATH`. O Safari precisa permitir automação remota e estar livre de outra sessão WebDriver. Os resultados e as capturas ficam fora da árvore publicada.

O servidor aceita somente localhost e os dados da conta são inventados. As consultas externas são simuladas, os outros transportes são recusados e os botões de cópia usam uma área de transferência simulada. Nenhuma ligação para um editor da Wikipédia é acionada. As capturas devem ser conferidas localmente e não precisam ser publicadas.

## Consultas reais e publicação

Uma consulta real exige verificação separada dos serviços e dos dados recebidos. Ela deve usar somente as fontes públicas e os limites previstos, sem credenciais nos pedidos. Respostas simuladas exercitam as regras do programa, mas não certificam a disponibilidade dos serviços em outro momento.

A publicação do JavaScript, do CSS, da documentação e dos trechos públicos continua manual. Abrir uma ligação ao editor não executa um teste nem confirma que o arquivo já esteja hospedado naquele destino.
