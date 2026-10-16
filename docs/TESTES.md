# Repetir a construção e os testes

Use Node.js 24.19.0, pnpm 11.25.0 e Python 3.9 ou posterior, conforme `.node-version`, `package.json` e `BUILD_TOOLCHAIN.json`. Os comandos abaixo trabalham nos arquivos locais. Eles não entram em contas nem publicam páginas.

## Construir os arquivos

Instale as dependências do instalador uma vez com pnpm. Na raiz do repositório, execute:

```sh
pnpm --dir installer install --frozen-lockfile --ignore-scripts
npm run build
```

O comando `node scripts/build-all.cjs` reúne os módulos, copia os estilos e a documentação e compila o instalador `INICIO.html`. O índice completo de manutenção passa a se chamar `Arquivos.html`. A versão vem de `package.json`, e as notas vêm de `docs/RELEASES.json`. Os dois precisam apontar para o mesmo lançamento.

Para atualizar os índices depois de mudar uma fonte ou a documentação, repita a construção completa. Os scripts Python geram os arquivos do programa antes da compilação do instalador. Executá-los isoladamente substitui o índice principal pela visão antiga de manutenção.

O instalador e o índice de manutenção da raiz e de `dist/1.20.0` usam caminhos relativos próprios. A construção não busca dados externos nem inclui uma fotografia pessoal de resultados.

## Executar os contratos locais

```sh
npm test
```

O comando executa os arquivos `tests/*.test.cjs`, `tests/inherited_metrics.cjs` e `installer/tests/*.test.mjs`. Os testes usam respostas controladas e contas de exemplo para conferir o histórico paginado, as contagens, a coordenação, a configuração, a apresentação e os cálculos herdados.

Os casos de falha precisam conservar o último resultado válido, manter dados desconhecidos sem convertê-los em zero e recusar respostas incompatíveis. Os casos de identidade verificam que uma conta não receba resultados de outra. O teste de transporte confere as fontes permitidas e a recusa de ações de escrita e autenticação.

O resultado de uma execução vale para a árvore de arquivos testada. Depois de alterar o código ou a construção, gere novamente a distribuição e repita os contratos correspondentes.

## Conferir o índice

Use uma conta de exemplo na primeira tela do instalador e confira os destinos do `common.js` e da página ou subpágina escolhida. Os dois trechos iniciais devem ter o nome informado em `data-perfilwiki-user`, sem a marca `SEU_NOME_DE_USUARIO` na cópia preparada. O carregador precisa conferir a conta configurada, a conta conectada e o dono da página antes de importar o programa.

Confira conteúdo inteiro, resumo, download e ligação ao editor em cada cartão. O texto manual deve ser igual ao texto copiado. A alternativa manual deve continuar disponível quando a área de transferência estiver bloqueada. Um teste automatizado dessa alternativa pode simular a área de transferência, sem modificar o clipboard do sistema.

Os downloads personalizados precisam corresponder ao nome e às escolhas exibidos nos destinos e no resumo. Os arquivos genéricos do repositório continuam com a marca de substituição. Caracteres como acentos, apóstrofos e aspas exigem a mesma identidade depois de passar pelo HTML.

## Conferir o instalador e o código gerado

Use somente uma conta inventada e os dados locais da prévia. Troque a conta, o nome de exibição, o fuso e o destino, avance pelas telas e volte para conferir se as escolhas permanecem. Um nome de exibição diferente precisa aparecer nos títulos, enquanto os destinos, as consultas e as marcas de identidade conservam a conta real. Confira o campo vazio, acentos, caracteres Unicode e o limite de 100 pontos de código. Controles e os sinais de marcação recusados devem gerar erro, sem executar ou inserir código. Tente avançar com uma conta vazia, um fuso inválido ou um nome de subpágina inválido. Os erros devem ficar junto dos campos e ser alcançáveis pelo teclado.

Em um teste isolado, forneça uma configuração inventada de `mw.config` com `wgDBname: 'ptwiki'` e `wgUserName`, conferindo o preenchimento automático da conta. Sem esse contexto ou em outro projeto, o campo deve continuar manual. Não abra uma sessão autenticada real para esse teste.

Confira a escolha inicial do fuso, UTC e os grupos por região. A seleção deve reunir 55 opções aceitas pelo navegador em oito grupos geográficos, sem campo de busca nem enumeração do catálogo completo. Confira Havaí, Alasca, Arizona e as novas cidades da Europa e da Ásia, incluindo a diferença de meia hora da Índia. Havaí e Arizona precisam manter seus horários em testes de inverno e verão, enquanto os locais que adotam ajustes sazonais devem acompanhar a data. Uma instalação nova começa com Brasília. Um fuso válido já escolhido ou importado precisa continuar disponível mesmo quando está fora da seleção. Teste um alias válido, um identificador inválido, diferenças fracionárias de UTC e datas de inverno e verão com relógio controlado. A configuração precisa conservar o nome do fuso, sem trocar o nome por uma diferença fixa.

Em "Personalize seu painel", confira a paleta com nomes, o espectro por clique, arraste e teclado, o único controle "Clarear ou escurecer" e o campo hexadecimal. Os controles separados de Matiz e Saturação não devem aparecer. Branco, preto, cinza e amarelo ajudam a encontrar texto sem contraste. A cor exata pode ficar nos detalhes de destaque, mas os títulos, os valores e os controles precisam continuar legíveis. Confira o alinhamento padrão à direita e as opções à esquerda e ao centro. Abra o seletor da cor principal e o do fundo das caixas e confira seu fechamento com clique fora, Escape e botão de fechar. A navegação pelo teclado deve alcançar os controles e devolver o foco ao botão que abriu o seletor.

Confira as 24 opções em "Adicionar caixas" e a seleção inicial de oito. Remova uma caixa de um conjunto de oito e confira sete contadores e uma caixa tracejada "Adicionar caixa +" na posição seguinte da grade. O botão deve abrir o mesmo seletor por clique, Enter ou Espaço. A caixa tracejada precisa ficar antes do convite único das caixas, sem virar contador ou alvo de arraste. Ela deve desaparecer com todos os 24 contadores selecionados e em prévias sem edição ou sem caixas visíveis. Confira fechamento por clique externo, Escape e botão de fechar, com retorno de foco quando apropriado. Origem ou janela estrangeira não pode abrir o seletor nem dirigir o foco da prévia.

Adicione e remova contadores na própria prévia. A última caixa visível não pode ser removida enquanto o bloco de caixas estiver ativo. Reordene as caixas pela alça diretamente na prévia. Com o foco na alça, teste as setas para esquerda ou cima para antecipar e para direita ou baixo para colocar depois, conferindo também os limites da lista. Ative e retire o destaque pela estrela da própria caixa. O menu "Opções" e o seletor de posição não devem existir.

Os três grupos de ajustes devem abrir e recolher, com rolagem própria da coluna em telas largas para manter a prévia à vista. Os controles locais não podem aparecer no HTML nem no wikitexto exportados. Alterne caixas primeiro e atividade primeiro, e teste o modo separado com texto de exemplo entre os blocos. O agrupamento de uma conta diferente ou ausente não pode autorizar que a rotina mova os blocos.

Altere o espaçamento entre Compacto, Confortável e Amplo. Teste a disposição automática e os limites de duas, três e quatro colunas em larguras diferentes, sem rolagem horizontal. Altere também a aba inicial. Verifique as mesmas escolhas na prévia, no objeto `PerfilWikiConfig.appearance`, nas marcas dos blocos e nos downloads. Ocultar um bloco deve retirá-lo dos trechos preparados. A ferramenta deve impedir que todos os blocos sejam ocultados e que caixas visíveis fiquem sem contadores.

Escolha caixas diferentes para receber o fundo de destaque, selecione mais de uma e retire todos os destaques. Teste cores claras e escuras e confira a legibilidade na prévia, no HTML e no wikitexto. Confirme o padrão de destaque em "Na Wikipédia" com `#faf7ef`.

Em caixas apenas, atividade apenas e nos dois blocos em cada ordem, conte uma só ocorrência do convite de instalação depois do último bloco visível. A alternância das opções não pode deixar cópias antigas desse convite.

Os arquivos iniciais precisam usar "Aguardando dados", sem os números inventados da prévia. O modo separado deve acrescentar apenas instruções de posição em comentários, sem textos de biografia. Cada identificador deve ocorrer uma só vez no conjunto instalado.

Nos editores locais, mantenha um trecho anterior de código e as categorias do exemplo da página. Acrescente o bloco duas vezes e confira que a segunda tentativa não o duplica. Um bloco incompleto ou de uma configuração anterior deve exigir conferência e preservar o rascunho. O texto não pode ser executado, enviado à Wikipédia nem salvo como edição real.

O carregador pode ser executado nos testes com objetos inventados de `window`, `mw` e `importScript`. Confira que não importa nada em outro projeto, numa página de artigo, em modo de edição, sem conta, com uma conta diferente ou numa página de outra pessoa. No caso permitido, a importação precisa ocorrer uma só vez. Esse teste não usa uma sessão de navegador da Wikimedia.

## Conferir as caixas opcionais

Mantenha as oito caixas anteriores na seleção inicial e selecione separadamente dias com edições, o artigo mais editado, os dois totais de bytes, edições em artigos, edições em discussões, meses com edições e o dia com mais edições, edições nos últimos 30 dias, média por dia ativo, anos com edições e o mês com mais edições. As escolhas precisam passar pela prévia, pela configuração e pelos downloads, mantendo ordem, alinhamento e dados desconhecidos quando necessário.

Use revisões públicas inventadas com diferenças positivas, negativas e zero. Uma diferença de +500 precisa somar 500 em bytes acrescentados, e -200 precisa somar 200 em removidos. Repetir a mesma revisão em dois lotes não pode somá-la outra vez. Os totais devem abranger os grupos de páginas locais, sem serem confundidos com a contagem global de contribuições.

Um campo de diferença ausente ou inválido deve impedir um total completo. Um cache antigo sem essas diferenças precisa iniciar a recuperação dos campos e retomar os lotes, mantendo os demais resultados válidos. Só depois da passagem completa os totais podem ser apresentados como conferidos. As visitas seguintes devem reaproveitar os dados, sem repetir uma passagem inteira por causa de uma mudança de cor ou de alinhamento.

Use edições inventadas em horários próximos da meia-noite para conferir os dias distintos no fuso escolhido. Dez revisões do mesmo dia contam um dia, e revisões de dias diferentes contam separadamente. O total precisa usar o histórico completo aceito pelo calendário, sem contar as antigas atualizações da própria subpágina de estatísticas. Históricos parciais ou resumos ausentes não podem produzir um total completo. Durante uma atualização incompleta, o último valor conferido pode permanecer na caixa.

Use revisões inventadas nos domínios principal, de discussão e em outros domínios para conferir a separação dos totais de edições. Repita revisões em lotes diferentes para confirmar que cada edição entra uma só vez. Para meses e dia com mais edições, teste horários próximos da meia-noite, mudanças de mês, o fuso escolhido e as exclusões do calendário. Um histórico incompleto deve manter os novos valores desconhecidos ou conservar o último resultado completo, sem acrescentar consultas de rede.

Confira as quatro caixas de 1.4.0 com o resumo completo do calendário. O total de 30 dias precisa incluir o dia em andamento no fuso escolhido. A média usa as edições aceitas divididas pelos dias ativos e aparece com uma casa decimal, incluindo o caso sem edições. Os anos são anos distintos com atividade, sem exigir continuidade. O mês com mais edições deve conservar mês, ano e total, escolhendo o mês mais antigo em caso de empate. Teste limites de mês e ano, diferenças de fuso, exclusões, resumo incompleto e valores inválidos. Uma mudança de aparência não pode iniciar outra coleta.

Confira os três novos valores de bytes com diferenças positivas, negativas e zero no mesmo histórico. A média precisa usar todas as revisões públicas locais deduplicadas no denominador e somente os acréscimos no numerador, com uma casa decimal e unidades binárias na apresentação. O maior acréscimo e a maior remoção precisam usar a maior diferença de uma única edição. Teste histórico completo vazio, cobertura parcial, campo inválido e preservação do último resultado conferido. Os cálculos não podem iniciar outro percurso do histórico.

Confira agradecimentos enviados com eventos públicos inventados da ptwiki. O pedido deve usar `leuser` para a conta configurada e só ocorrer quando a caixa estiver selecionada. Teste continuação, identificadores repetidos, autor errado, ação incompatível, registro indisponível e retomada depois de uma falha. Nenhum desses casos pode mudar a regra dos agradecimentos recebidos da conta global ou transformar uma consulta incompleta em zero.

## Conferir os campos e a data opcionais

Teste o nome alinhado à esquerda, ao centro e à direita enquanto o alinhamento das caixas permanece independente. Deixe localização e campos extras vazios, preencha os três pares e confira a prévia, a configuração, o HTML e o wikitexto. Teste 120 pontos de código na localização, 40 no rótulo e 160 no valor, além dos limites excedidos, caracteres Unicode e marcação recusada. Campos vazios não podem entrar na configuração preparada, e esses dados não podem mudar a identidade das métricas ou do cache.

A opção de criação da conta começa desmarcada. Confira a data global anterior à local e a data local anterior à global, com saída por extenso no idioma escolhido e dia calculado em UTC. Teste prova completa, data global ou local ausente, nenhum registro conhecido, falha de transporte, data futura e identidade estrangeira. O texto precisa distinguir a criação conferida, a data mais antiga disponível e a indisponibilidade. A caixa de anos usa a mesma criação mais antiga conferida, sem recorrer à data local da ptwiki quando falta essa prova. Reaproveitar a consulta global não pode iniciar pedidos a cada wiki vinculada.

## Conferir o verificador de instalação

A segunda etapa não deve mostrar os cartões dos arquivos compartilhados. O atalho "Arquivos e documentação" precisa abrir o índice com os arquivos completos, destinos, resumos, cópia, download e endereço de edição. O botão "Verificar instalação" deve permanecer sem pedidos antes de um clique.

Use um transporte simulado para conferir o manifesto local e a consulta pública das quatro páginas. Os pedidos precisam ser `GET` com `credentials: 'omit'`, sem token, escrita ou execução dos textos. Teste instalação correspondente, carregador incompleto ou repetido, blocos de outra conta ou configuração, arquivo compartilhado diferente, folha sem CSS higienizado, página ausente, revisão oculta, falha de rede, resposta incompleta e resposta grande demais. A API não deve receber `rvlimit` com vários títulos. Mudar a configuração durante a espera precisa cancelar o resultado antigo. O resultado não pode afirmar que o script executou no navegador.

## Conferir ligações, disposição e datas personalizadas

Na primeira etapa, abra "Seu perfil" e use `[[Rio de Janeiro]]` na localização e `[[História do Brasil|História]]` em uma informação adicional. Confira os limites, o rótulo em texto simples e a recusa de HTML, predefinições, ligações externas e colchetes incompletos. Escolha caixas, atividade e os dois blocos, conferindo o mesmo destino na prévia e no wikitexto. Ao esconder um bloco, as informações precisam acompanhar o que ficou visível. O convite de instalação continua aparecendo uma vez.

Confira dez artigos na lista inicial e a aba "Personalizado" depois das quatro anteriores. Aplique datas na coluna e na própria prévia. Teste fevereiro com 29 dias, um dia só, início depois do fim, dia atual, datas futuras e datas anteriores a julho de 2015. Um erro conserva o período aplicado. A cópia pública mantém as datas e os números sem exportar o formulário.

Os testes de coleta precisam conferir soma de todos os artigos, corte individual da primeira edição, intervalos idênticos às abas fixas, retomada sem pedidos repetidos e mudança de datas sem reaproveitar a soma errada. Uma resposta ausente ou falha fica desconhecida. Confira a recuperação automática depois da espera, a exclusão de um artigo antigo redirecionado e a validade de cada atualização de progresso. Enquanto uma consulta avança, datas ainda não aplicadas e o foco precisam permanecer no formulário.

## Conferir posição por campo e foto

Use uma conta inventada e escolha "Nos dois blocos" para o nome, "Nas caixas" para a localização e posições diferentes para cada informação adicional. Confira "Padrão", as posições explícitas e "Não mostrar", com um ou dois blocos visíveis. O nome precisa aparecer uma vez em cada bloco escolhido. O cabeçalho inventado "Página de usuário" não deve aparecer na prévia. Teste uma configuração antiga sem as novas opções e outra com todos os campos ocultos, incluindo uma variante que mostra apenas uma informação adicional.

Na disposição em linha, confira o nome, o divisor e as informações abaixo dele, com separadores visuais e quebra de linha quando faltar espaço. Use `[[Washington, DC]]` e `[[História]]` para conferir o texto, o destino das ligações e a cópia em wikitexto. A prévia local precisa manter a aparência dessas ligações e impedir sua navegação. O número de colunas no automático precisa chegar a cinco em Compacto, quatro em Confortável e três em Amplo nas larguras previstas. Confira também a escolha explícita de cinco colunas e a redução em telas estreitas.

Informe um nome de imagem do Commons, com e sem o prefixo `File:` ou `Ficheiro:`. Teste acentos, espaços, aspas e nomes inválidos. Endereços, caminhos, marcação e formatos não aceitos precisam ser recusados. A prévia usa somente uma imagem ilustrativa local. O programa e a cópia em wikitexto mantêm a imagem e a ligação à página do arquivo no Commons. Uma falha da foto precisa deixar os textos e os números disponíveis. No JavaScript, `crossorigin` e `referrerpolicy` precisam ser definidos antes de `src`. Esses testes não confirmam que um arquivo real existe no Commons.

## Estado da validação da versão 1.8.0

Os 391 testes locais passaram sem falhas nem casos ignorados. A revisão independente conferiu 360 combinações de trechos iniciais e cópias do programa, incluindo campos ocultos e cabeçalhos com somente uma informação adicional. A construção completa passou, e a folha atualizada passou pelo sanitizador de TemplateStyles sem erros nem pedidos externos.

Chrome e o navegador interno do Codex foram conferidos em localhost com a conta inventada Marina Exemplo. O nome apareceu nos dois blocos, enquanto localização, interesse e foto ficaram acima das caixas. A prévia manteve as ligações visíveis e não navegou ao ativá-las. Compacto mostrou cinco colunas em tela larga. Em 360 pixels, a página e a prévia couberam sem rolagem horizontal, com as informações em linha e a foto ilustrativa. Os trechos de instalação mantiveram as posições, o nome normalizado do arquivo e a marcação da imagem, sem controles locais.

Firefox e Safari não foram repetidos nesta rodada. Nenhuma foto real do Commons foi carregada ou enviada durante os testes. As falhas e os pedidos de imagem foram simulados, e a existência de um nome de arquivo real continua fora dessa conferência. Nenhuma sessão autenticada, edição ou publicação na Wikimedia ou no GitHub foi feita. O relatório está em [VALIDACAO_1.8.0.json](VALIDACAO_1.8.0.json).

## Estado da validação da versão 1.7.0

Os 369 testes locais passaram sem falhas nem casos ignorados, incluindo os contratos anteriores e os testes de ligações internas, escolha dos blocos e períodos personalizados. A construção completa passou. A folha atualizada para a quinta aba passou pelo sanitizador de TemplateStyles, sem erros de sintaxe, erros do sanitizador ou pedidos externos.

Chrome e o navegador interno do Codex foram conferidos somente em localhost com a conta inventada Marina Exemplo. O fluxo tem duas etapas, com os campos em "Seu perfil" na coluna. As ligações, a escolha dos blocos, o intervalo de fevereiro de 2024 e os trechos preparados foram conferidos. A prévia mostrou dez artigos. Em 360 pixels, a página e o formulário de datas da prévia couberam sem rolagem horizontal. O verificador passou pelo caso simulado com a localização ligada nos dois blocos, sem enviar pedidos à Wikipédia.

A revisão independente encontrou e conferiu as correções da recuperação de falhas, do intervalo de origem após excluir um redirecionamento antigo e da preservação de rascunhos e foco durante o progresso. Firefox e Safari não foram repetidos nesta rodada. Dados reais do novo intervalo, gestos por toque e a disponibilidade dos serviços externos não foram conferidos. Nenhuma sessão autenticada, edição ou publicação na Wikimedia ou no GitHub foi feita. O relatório está em [VALIDACAO_1.7.0.json](VALIDACAO_1.7.0.json).

## Estado da validação da versão 1.6.0

Os 325 testes locais passaram sem falhas nem casos ignorados ao conferir a escolha de cores, a caixa de adição, os campos do perfil, a data de criação e a leitura dos arquivos da instalação, junto dos contratos anteriores. A construção completa também passou, e a folha de TemplateStyles permanece igual à cópia validada de 1.3.0.

Chrome e o navegador interno do Codex foram usados com a conta inventada Marina Exemplo para conferir as amostras de cores, o espectro, os atalhos de teclado e o campo hexadecimal. O seletor fechou por Escape, clique externo e botão de fechar. Um arraste nativo no espectro mudou a cor, e um clique com o botão secundário conservou o valor. Após remover uma das oito caixas, a posição livre recebeu o botão de adição. Seu clique abriu o seletor e alcançou o contador removido.

O nome centralizado, a localização, a informação adicional e a data de criação por extenso apareceram no painel, com os contadores ainda alinhados à direita. As mesmas escolhas chegaram aos trechos preparados. Em 360 pixels, o formulário e a prévia couberam sem rolagem horizontal, e o seletor de cores mediu 328 por 528 pixels.

A terceira etapa foi conferida sem os cartões compartilhados. O verificador passou pelos casos simulados de instalação correspondente, perfil ausente, modelo incorreto de CSS e serviço indisponível. A página isolada de teste bloqueou transportes externos e não enviou pedidos à Wikipédia. Firefox e Safari não foram repetidos, e o arraste por toque, a resposta real do verificador e os dados reais de criação da conta não foram testados nesta rodada. Nenhuma sessão autenticada, edição ou publicação na Wikimedia ou no GitHub foi feita. O relatório está em [VALIDACAO_1.6.0.json](VALIDACAO_1.6.0.json).

## Estado da validação da versão 1.5.0

Os 263 testes locais passaram, sem falhas nem casos ignorados. A construção completa passou. Os casos novos cobrem a seleção ampliada de fusos, a estrela de destaque, as setas da alça, a consulta opcional de agradecimentos enviados e as três caixas de bytes. O registro de agradecimentos foi conferido com respostas inventadas, incluindo paginação, nomes localizados do domínio de usuário, falhas e eventos ocultos. A folha compartilhada permanece igual à cópia validada de 1.3.0.

Chrome e o navegador interno do Codex passaram pela conferência local com a conta inventada Marina Exemplo. A lista mostrou 55 fusos em oito grupos e conservou o Havaí ao avançar pelas telas. A estrela mudou o destaque por clique e teclado, e as setas da alça mudaram a ordem. O arraste nativo com mouse passou no Chrome. As 24 opções e os valores de exemplo das quatro novas caixas foram conferidos na prévia real. Em 360 pixels, as caixas com espaçamento Amplo e o seletor couberam sem rolagem horizontal. A configuração preparada conservou as escolhas e ficou sem os controles locais de edição.

Firefox e Safari não foram repetidos. O gesto por toque e a resposta real da API de agradecimentos enviados não foram testados. Nenhuma página ou sessão autenticada da Wikimedia foi operada, e nada foi publicado no GitHub. O relatório está em [VALIDACAO_1.5.0.json](VALIDACAO_1.5.0.json).

## Estado da validação da versão 1.4.0

Os 246 testes locais passaram, sem falhas nem casos ignorados. A construção completa passou. Os casos novos conferem os quatro contadores, a seleção reduzida de fusos, as mensagens da prévia, o cancelamento de um gesto solto fora das caixas e a posição dos menus nas bordas da tela. A folha de TemplateStyles permanece igual à cópia validada de 1.3.0.

Chrome e o navegador interno do Codex passaram pela conferência local com dados inventados. A primeira etapa mostrou 21 fusos sem busca. Os três grupos de ajustes recolhem, e a coluna tem rolagem própria em telas largas. As vinte opções foram conferidas, com adição e remoção na prévia, posição pelo teclado, destaque e proteção da última caixa. O gesto de arrastar com o mouse passou no Chrome, sem mover a página. O menu da primeira coluna permaneceu dentro da prévia. A página e o seletor couberam em 360 pixels, e as vinte caixas com espaçamento Amplo couberam no limite de altura da prévia sem rolagem horizontal. Os trechos preparados conservaram as escolhas e ficaram sem os controles locais de edição.

Firefox e Safari não foram repetidos. O gesto de arrastar por toque não foi testado. Nenhuma página ou sessão autenticada da Wikimedia foi operada, e nada foi publicado no GitHub. O relatório está em [VALIDACAO_1.4.0.json](VALIDACAO_1.4.0.json).

## Estado da validação da versão 1.3.0

A versão 1.3.0 passou pelos 218 testes locais, sem falhas ou casos ignorados. Os casos novos conferem os quatro contadores, o histórico incompleto, revisões repetidas, mudanças de fuso, exclusões do calendário e empates no dia com mais edições. A revisão também confirmou os novos valores de aparência na configuração e nos trechos exportados. A folha de TemplateStyles passou pelo sanitizador da Wikimedia sem erros.

Chrome e o navegador interno do Codex passaram pela conferência com dados inventados. O seletor de cores fechou por clique externo, Escape e botão de fechar, preservando a cor escolhida. Um clique nativo do Chrome dentro da prévia também fechou o seletor. Os controles de teclado mudaram a cor, e abrir um seletor fechou o outro. As dezesseis caixas, as colunas e o espaçamento Amplo foram conferidos na prévia real. A página e o seletor couberam em 360 pixels sem rolagem horizontal. Firefox e Safari não foram repetidos, e o gesto de arrastar continua sem nova conferência nesta rodada. Nenhuma página ou sessão autenticada da Wikimedia foi operada. O relatório está em [VALIDACAO_1.3.0.json](VALIDACAO_1.3.0.json).

## Estado da validação da versão 1.2.0

A versão 1.2.0 passou pelos 204 testes locais, sem falhas ou casos ignorados. As verificações cobrem as doze opções, os dias com edições após completar o histórico, o convite único nas combinações de blocos, os fundos claros e escuros e a ordem que chega ao código de instalação. O programa só muda a posição de blocos reunidos pelo próprio instalador e pertencentes à mesma conta. A folha de TemplateStyles permanece igual à cópia já validada.

Chrome e o navegador interno do Codex passaram pela conferência local com dados inventados. A prévia mostrou doze caixas, recebeu a nova ordem pelo seletor de posição e manteve um convite ao ocultar cada bloco ou inverter a ordem. A página e a prévia couberam em 360 pixels sem rolagem horizontal. Os fundos personalizados chegaram aos trechos exportados. O gesto de arrastar não pôde ser confirmado pela automação desta rodada e fica como conferência manual, com o seletor de posição disponível. Firefox e Safari não foram repetidos. Nenhuma sessão autenticada da Wikipédia foi usada. O relatório está em [VALIDACAO_1.2.0.json](VALIDACAO_1.2.0.json).

## Estado da validação da versão 1.1.1

A versão 1.1.1 passou pelos 186 testes locais, sem falhas ou casos ignorados. Os casos novos conferem o nome de exibição, a separação da conta real, o preenchimento por um contexto de página inventado e a lista completa de fusos. Os nomes exportados ficam como texto literal, inclusive quando contêm sinais que o wikitexto usaria como comandos. A folha de TemplateStyles permanece igual à cópia já validada.

Chrome e o navegador interno do Codex passaram pelo fluxo local. A lista apresentou 419 fusos em 11 grupos nessa sessão, com busca, seleção preservada e diferenças fracionadas para UTC. O formulário coube em 360 pixels sem rolagem horizontal. A prévia e os arquivos conservaram a conta real ao usar outro nome de exibição. Os controles de cor e a retirada dos textos laterais foram conferidos. Firefox e Safari não foram repetidos. Nenhuma sessão autenticada da Wikipédia foi usada. O relatório está em [VALIDACAO_1.1.1.json](VALIDACAO_1.1.1.json).

## Estado da validação da versão 1.1.0

A versão 1.1.0 passou pelos 161 testes locais do Node, sem falhas ou casos ignorados. A construção completa, os contratos entre instalador e programa, a migração dos bytes e a limpeza dos dados ao trocar de conta passaram na árvore final. A folha de estilos passou pelo sanitizador de TemplateStyles sem erros. O relatório está em [VALIDACAO_1.1.0.json](VALIDACAO_1.1.0.json).

Chrome e o navegador interno do Codex passaram pelo fluxo local com dados inventados. A conferência cobriu a apresentação de 360 pixels, os controles da prévia, os destinos e os editores locais. Uma página de teste isolada capturou as cópias e os downloads gerados, conferiu o programa inteiro e selecionou todo o texto quando a cópia foi recusada. Firefox e Safari não foram repetidos nesta rodada. Os resultados de 1.0.1 abaixo pertencem à versão anterior.

## Conferir os estilos e a página

A folha destinada à Wikipédia precisa passar pelo sanitizador de TemplateStyles. Validade em um navegador comum não garante validade no modelo `sanitized-css`.

A revisão visual deve conferir as caixas e a atividade em suas posições independentes, em telas largas e estreitas. Confira abas, expansões, teclado, foco e falhas das miniaturas. As imagens opcionais não podem mudar uma soma nem impedir a leitura do título.

Os testes locais de regras não substituem essa revisão visual. Um teste de navegador deve registrar o navegador usado, os passos e os limites da sessão. Na validação anterior da versão 1.0.1, passaram os 107 testes registrados no Node, com 20 casos herdados de métricas dentro dessa execução. Chrome 155.0.8059.40, Firefox 158.0 e Safari 27.0.1 passaram por 112 verificações cada, com respostas simuladas em localhost. A conferência cobriu os cinco cenários de execução, os dois índices e a apresentação estreita, com 320 pixels no Chrome e no Firefox e 336 pixels no Safari, o mínimo obtido nessa sessão WebDriver. O relatório resumido está em [VALIDACAO.json](VALIDACAO.json). Nenhuma sessão autenticada da Wikimedia foi operada e a área de transferência real não foi alterada.

Na versão 1.0.1, a correção também passou por uma previsão anônima na API real do MediaWiki, sem salvar a página. A resposta não trouxe avisos nem erro de modelo do TemplateStyles e conservou as oito caixas e a marca da conta. A consulta pública do modelo confirmou `sanitized-css` na folha compartilhada existente. Os testes locais de navegador, por si só, não conferem o modelo de uma página hospedada na Wikipédia.

## Repetir os testes de navegador

No macOS, com Chrome, Firefox e Safari instalados, execute `node scripts/test-browsers.cjs --output ../browser_qa`. O teste de Chrome precisa do pacote Playwright disponível por `require` ou pelo caminho informado em `PLAYWRIGHT_MODULE_PATH`. O Safari precisa permitir automação remota e estar livre de outra sessão WebDriver. Os resultados e as capturas ficam fora da árvore publicada.

Para conferir a cópia do novo instalador sem usar a área de transferência do sistema, abra `tests/browser/installer-copy.html` pelo servidor local. O campo "Simular falha de cópia" permite conferir a seleção manual do texto inteiro. Essa página usa os mesmos arquivos compilados do instalador.

O servidor aceita somente localhost e os dados da conta são inventados. As consultas externas são simuladas, os outros transportes são recusados e os botões de cópia usam uma área de transferência simulada. Nenhuma ligação para um editor da Wikipédia é acionada. As capturas devem ser conferidas localmente e não precisam ser publicadas.

## Consultas reais e publicação

A validação deste candidato fica em localhost. Não abra editores nem opere sessões autenticadas da Wikimedia para conferir o candidato. Os endereços preparados podem ser inspecionados como texto, sem navegação.

Uma consulta real exige verificação separada dos serviços e dos dados recebidos. Ela deve usar somente as fontes públicas e os limites previstos, sem credenciais nos pedidos. Respostas simuladas exercitam as regras do programa, mas não certificam a disponibilidade dos serviços em outro momento.

A publicação do JavaScript, do CSS, da documentação e dos trechos públicos continua manual. Abrir uma ligação ao editor não executa um teste nem confirma que o arquivo já esteja hospedado naquele destino.

## Conferir a disposição integrada da versão 1.9.0

O padrão coloca as caixas no espaço interno da atividade, entre o cabeçalho com a sequência e o gráfico de 12 semanas. Confira os dois trechos iniciais preparados pelo instalador, o carregador e a página de usuário, e use a mesma posição dos campos na prévia e no texto exportado. A instalação padrão entrega um painel completo. Os trechos individuais continuam disponíveis nos modos anteriores.

Nos testes do programa, uma troca real de HTML precisa destruir os descendentes da atividade. Assim, o teste percebe se as caixas desaparecem durante as atualizações. Confira início com cache e sem cache, dados incompletos, progresso, fim da consulta e atualização recebida de outra aba. Os números conferidos, a prova da data de criação, os campos pessoais e os rascunhos de datas devem ser conservados quando não houver dados novos que os substituam. Uma prova de outra conta ou uma cobertura explicitamente indisponível não pode ser reaproveitada.

Experimente cores, destaques, remoção e adição de caixas, ordem pelo teclado, campos no cabeçalho e nas caixas, foto ilustrativa, colunas, espaçamento, alinhamentos e períodos. Passe pelas disposições anteriores e volte à integrada, conservando as escolhas. Mostre apenas caixas, apenas atividade e os dois componentes, sempre com um convite de instalação. Confira a tela larga e a tela estreita e mantenha as consultas de teste no computador.

"Baixar painel atualizado" deve produzir a atividade com as caixas internas e um convite. "Baixar contadores atualizados" fornece só a parte das caixas. Com somente as caixas visíveis, o convite acompanha essa parte. Nenhum desses testes abre editores ou usa uma conta da Wikimedia.

### Resultado desta rodada

Os 418 testes automatizados passaram, sem falhas ou testes ignorados. A prévia foi conferida no navegador integrado, com Chromium, na tela larga e em 360 por 800 pixels. As escolhas de aparência, os campos, a seleção e a ordem das caixas, os períodos, as disposições anteriores e o editor local foram exercitados. O instalador e o índice responderam com HTTP 200, e os pedidos observados ficaram no servidor local. A folha de estilos passou no parser e no sanitizador CSS usados pelo TemplateStyles, sem erros nem pedidos de rede.

Firefox e Safari nativos não foram repetidos nesta rodada. Os testes usam dados inventados e uma foto ilustrativa local, sem consultar contas, carregar fotos reais, abrir editores da Wikipédia ou publicar arquivos. Os detalhes estão em [VALIDACAO_1.9.0.json](VALIDACAO_1.9.0.json).

## Conferir os campos e o cabeçalho da versão 1.10.0

Crie uma informação chamada "Alma mater" e acrescente `[[GWU]]` e `[[MIT]] como itens separados. Confira a linha com barra, ponto ou espaço, depois mude para linhas e marcadores. A informação pode guardar até oito itens. Os campos antigos de um só valor devem conservar o mesmo texto e as mesmas ligações.

Mova cada campo entre topo, atividade e caixas. "Nos dois blocos" conserva o sentido anterior, atividade e caixas. "Em todos" acrescenta o topo. Um campo destinado somente ao topo não deve reaparecer dentro do painel. Com apenas um componente visível, as posições internas acompanham esse componente e conservam a escolha do topo.

Escolha o tamanho do nome entre 16 e 36 pixels e experimente os alinhamentos. Ative "Mostrar hora local", escolha um fuso e confira "Hora local" com a diferença para UTC. A localização digitada não escolhe o fuso. Os testes de relógio devem cobrir horário de verão, mudança de dia e fusos com meia hora ou 45 minutos. A cópia pública mostra "Horário salvo", com data, hora e diferença para UTC. O relógio em andamento usa a rotina de minuto já existente, sem outra consulta.

Confira o perfil exportado no editor local. O cabeçalho, a atividade e as caixas devem entrar uma só vez, conservando os textos anteriores. Nos modos separados, o cabeçalho acompanha o primeiro bloco visível. Uma data de criação já conferida para a mesma conta deve atravessar as mudanças de posição, mas não pode ser reaproveitada de outra conta ou quando a cobertura estiver explicitamente indisponível.

Os 460 testes automatizados passaram, sem falhas ou testes ignorados. A prévia foi conferida no navegador integrado, com Chromium, na tela larga e em 360 por 800 pixels. Os campos do topo quebram a linha sem rolagem horizontal. O editor local conservou os textos anteriores e impediu a cópia repetida do painel. Os destinos dos botões foram lidos como texto, sem abrir a Wikipédia. A folha passou no parser e no sanitizador CSS usados pelo TemplateStyles, sem erros ou consultas de rede.

Firefox e Safari nativos não foram repetidos nesta rodada. Os testes usam dados inventados e não consultam contas. A conferência não usa a área de transferência nem publica arquivos. Os detalhes estão em [VALIDACAO_1.10.0.json](VALIDACAO_1.10.0.json).

## Conferir o padrão e os controles da versão 1.11.0

Abra uma configuração nova e preencha o nome e a localização. Os campos marcados como "Padrão, no topo" devem aparecer acima da atividade, sem outra cópia dentro dela. Uma configuração com posição anterior explícita deve continuar usando essa posição. Ao mudar "Posição padrão das informações", confira o texto das opções herdadas e a posição dos campos na prévia.

Em "Seu perfil", confira o tamanho e os ícones de alinhamento junto do nome. Os controles de disposição das informações ficam junto da localização e das informações adicionais. Na seção geral "Disposição", devem permanecer os ajustes do painel e das caixas. Use os ícones para mudar o alinhamento com o mouse e as setas do teclado. Cada grupo precisa ter uma única escolha ativa e nomes que um leitor de tela possa anunciar.

Prepare a instalação e acrescente o trecho no editor local. Confira um cabeçalho, uma atividade e uma parte de caixas, com o alinhamento e os campos escolhidos. Os textos anteriores devem ficar no rascunho. Nos modos separados, os trechos individuais devem levar o topo junto do primeiro bloco visível, sem repeti-lo no segundo.

Os 465 testes automatizados passaram, sem falhas ou testes ignorados. O navegador integrado, com Chromium, passou pelas escolhas de posição, cliques nos ícones, seleção pelo teclado, alinhamentos independentes e exportação. Em 360 por 800 pixels, os controles couberam sem rolagem horizontal. O instalador e o índice responderam com HTTP 200. Os pedidos observados ficaram no servidor local, e não houve erros de console.

A folha de TemplateStyles conserva exatamente os bytes validados na versão 1.10.0. A comparação SHA-256 foi repetida, sem repetir o sanitizador. As regras novas de aparência pertencem somente ao instalador local. Firefox e Safari nativos não foram repetidos. Os detalhes estão em [VALIDACAO_1.11.0.json](VALIDACAO_1.11.0.json).

## Conferir capa, foto e horário da versão 1.12.0

Preencha a localização e ative "Mostrar hora local" no grupo logo abaixo dela. O fuso deve ficar no mesmo grupo. Com o horário ativo, "Posição da hora" permite escolher onde ele aparece. Os seletores usam "Na atividade" para distinguir essa área do topo.

A foto oferece quatro posições, "No topo, padrão", "Na atividade", "Topo e atividade" e "Ocultar". Experimente todas e confira que a capa continua no topo quando a foto fica oculta. As configurações antigas com posições explícitas continuam sendo aceitas pelo programa.

Informe uma imagem de capa e confira a faixa acima dos campos. A prévia usa uma paisagem ilustrativa local. No código preparado, deve entrar o nome do arquivo do Commons em marcação nativa, com a ligação para esse arquivo. Mude o fundo para uma cor escura e depois clara, conferindo o texto e as ligações. Os testes de contraste exigem pelo menos 4,5 para 1. Em tela estreita, a capa usa 120 pixels de altura e o conteúdo deve caber sem rolagem horizontal.

O teste de execução passa por início sem cache, cache, progresso e atualização de outra aba. A capa e o fundo precisam acompanhar o perfil sem alterar a identidade das métricas ou acrescentar consultas aos contadores. Uma imagem que falha deve dar lugar ao aviso, conservando os campos do perfil. Um elemento de outra conta ou de outro arquivo não deve receber o tratamento da imagem configurada.

Os 484 testes automatizados passaram, sem falhas ou testes ignorados. A conferência no navegador integrado, com Chromium, cobriu as quatro posições da foto, a capa, fundos claro e escuro, a paleta, o fechamento do seletor por clique fora e a exportação no editor local. Em 360 por 800 pixels, a página e a prévia não tiveram rolagem horizontal. A segunda inserção manteve um só topo e uma só capa, sem retirar o texto anterior.

O instalador e o índice responderam com HTTP 200, e os pedidos observados ficaram no computador. A folha completa passou no parser e no sanitizador CSS usados pelo TemplateStyles, sem erros ou pedidos de rede. Firefox e Safari nativos não foram repetidos. Não houve consulta de contas, uso de login, escrita na área de transferência, edição na Wikipédia ou envio ao GitHub. Os detalhes estão em [VALIDACAO_1.12.0.json](VALIDACAO_1.12.0.json).

## Conferir rótulos, cidade e estatutos da versão 1.13.0

Crie um rótulo e deixe sua informação vazia. O rótulo deve aparecer enquanto é digitado, sem dois-pontos, itens vazios ou uma lista sem conteúdo. Acrescente outro rótulo e mude a disposição dos seus itens entre mesma linha, linhas separadas e marcadores. A escolha deve valer somente para esse grupo. As configurações anteriores de um valor continuam aceitas.

Ative a hora local e coloque-a na mesma área da cidade. A cidade deve ser seguida pelo relógio dentro da mesma linha de informações, antes dos outros campos, sem impedir a quebra de linha quando faltar largura. As posições escolhidas separadamente continuam valendo. Confira a hora sem cidade, a cidade sem hora e a atualização do relógio já existente.

Ative "Mostrar estatutos" e use respostas simuladas com autoconfirmado, autoconfirmado estendido, autorrevisor e reversor. A apresentação deve esconder a confirmação inferior e conservar os direitos independentes. A resposta precisa pertencer à conta exata e à ptwiki, com grupos válidos e data não futura. Confira erros, respostas incompletas, cache anterior sem grupos, atualização forçada e limite de consultas. Uma falha não pode inventar estatutos ou apagar a última resposta conferida. A data da dica deve continuar sendo a da última consulta concluída.

Com a opção oculta ou desativada, não deve haver nova consulta dos grupos. Uma consulta concluída permite reutilizar os grupos por 24 horas. A atualização forçada pode antecipar outra consulta. Quando uma tentativa de atualizar uma prova anterior falha, o programa conserva a data da resposta e guarda separadamente a data da tentativa. Sem prova anterior, a falha usa a pausa existente antes de tentar novamente.

Confira somente o endereço de "Envie uma foto", sem abri-lo. O instalador deve apresentar uma ligação para o assistente do Commons, sem formulário próprio ou envio automático. No editor local, confira os rótulos, as disposições e a cidade junto da hora, conservando o texto que já estava na página. O trecho inicial deve ter "Aguardando dados" para estatutos, sem copiar os papéis fictícios da prévia.

Os 513 testes automatizados passaram, sem falhas ou testes ignorados. O navegador integrado, com Chromium, confirmou a prévia imediata de rótulo sem dado, disposições independentes, cidade e hora juntas, estatutos filtrados e exportação. Em 360 por 800 pixels, a página e a prévia couberam sem rolagem horizontal. O instalador e o índice responderam com HTTP 200, sem pedidos externos durante o teste no navegador. A folha passou no parser e no sanitizador CSS usados pelo TemplateStyles, sem erros ou pedidos de rede.

Firefox e Safari nativos não foram repetidos. Os dados de conta são inventados, as consultas do coletor foram simuladas e nenhuma sessão autenticada da Wikimedia foi operada. Não houve envio de foto, escrita na área de transferência, edição na Wikipédia ou envio ao GitHub. Os detalhes estão em [VALIDACAO_1.13.0.json](VALIDACAO_1.13.0.json).

## Conferir estatutos, data e foto da versão 1.14.0

Preencha uma informação adicional e ative os estatutos e a data de criação. Em cada área escolhida, a cidade e os campos adicionais devem vir antes dos estatutos. A data de criação fica por último. Confira o negrito somente nos rótulos e conserve os valores com o peso normal do texto. Uma data incompleta precisa manter o aviso de que podem existir contas anteriores sem data registrada.

No grupo da foto, experimente esquerda, centro e direita. Na tela larga, esquerda e direita deixam a foto ao lado do texto. Centro coloca a foto acima dele. O alinhamento do nome deve permanecer na posição escolhida. Em tela estreita, a foto pode ficar acima do texto, conservando seu alinhamento. A capa permanece acima das informações do topo.

Prepare os trechos e abra os editores locais. O carregador deve guardar `appearance.photoAlignment`, e o perfil deve usar `data-photo-align` com a mesma escolha. Os rótulos preparados ficam em negrito, com dados ainda aguardando consulta. Os papéis fictícios da prévia não podem entrar no trecho. Os testes de execução passam por cache, início sem cache, progresso, atualização e mudança em outra aba, sem acrescentar consultas às métricas.

Os 530 testes automatizados passaram, sem falhas ou testes ignorados. O navegador integrado, com Chromium, confirmou as três posições na tela larga e em 360 por 800 pixels, sem rolagem horizontal. O instalador e o índice responderam com HTTP 200. O console não apresentou erros, e os pedidos observados ficaram no computador. A folha completa passou no parser e no sanitizador CSS usados pelo TemplateStyles, sem erros ou pedidos de rede.

Firefox e Safari nativos não foram repetidos. Os dados são inventados, nenhuma conta Wikimedia foi operada e não houve edição, envio de arquivo ou escrita na área de transferência. Os detalhes estão em [VALIDACAO_1.14.0.json](VALIDACAO_1.14.0.json).

## Conferir foto, textos e retomada da versão 1.15.0

Experimente os cinco tamanhos da foto, de 64 a 200 pixels, com os formatos quadrado e redondo. A largura e a altura da área de imagem devem ser iguais, e a legenda do Commons deve ficar fora do recorte. Mude o alinhamento sem mudar o nome e confirme que o programa conserva o elemento e o endereço da imagem ao atualizar a aparência. A foto maior precisa caber na tela estreita.

Em "Textos e projetos", acrescente metas e uma declaração de conflito de interesses escrita para o teste. Os botões iniciais deixam o corpo vazio. Confira listas, negrito e ligações na prévia, depois acrescente uma predefinição e um trecho HTML. O HTML e a predefinição devem aparecer como texto, sem executar código ou carregar imagens. O botão "Editar" precisa voltar ao campo certo, mesmo quando houver rascunhos vazios antes dele. Mude a ordem e remova um bloco.

Prepare o perfil e confira os títulos nativos de seção e o corpo original, conservando as quebras de linha. As marcas dos textos pessoais devem ficar depois de `PERFILWIKI-PROFILE-END`. Os textos não entram no carregador nem nos downloads de métricas. Os testes de execução devem conservar o mesmo elemento pessoal durante o início sem cache, progresso, atualização e mudança em outra aba, sem substituir uma edição manual.

Baixe as escolhas e carregue o JSON pelo diálogo local. Confira os tamanhos, formatos e textos. Arquivos anteriores da versão 1.x devem receber os padrões dos campos novos. JavaScript colado, chaves desconhecidas, tentativas de alterar protótipos e entradas além do limite precisam ser recusadas. O comando de baixar escolhas do programa guarda a aparência e os campos do perfil, sem ler os textos editados na página nem iniciar consultas.

Os 551 testes automatizados passaram, sem falhas ou testes ignorados. O navegador integrado, com Chromium, confirmou os tamanhos, os formatos, a ordem dos textos, a edição local e a exportação e retomada do JSON. A tela larga e a de 360 por 800 pixels couberam sem rolagem horizontal. O instalador e o índice responderam com HTTP 200, sem erros de console ou pedidos externos. A folha completa passou no parser e no sanitizador CSS usados pelo TemplateStyles, sem erros ou pedidos de rede.

Firefox e Safari nativos não foram repetidos. O wikitexto avançado não foi enviado à Wikimedia para renderização. A futura edição das seções usa o editor normal e o salvamento manual. Nenhuma conta Wikimedia foi operada, nenhuma edição foi enviada e nenhum arquivo foi publicado. Os detalhes estão em [VALIDACAO_1.15.0.json](VALIDACAO_1.15.0.json).

## Conferir a retomada e a capa diária da versão 1.16.0

Preencha uma conta inventada e escolha nome, foto, formato, tamanho, cores, contadores, ordem, posições dos campos, fuso e textos pessoais. Abra "Ver painel" e confira que as alças e os outros controles de personalização saíram da prévia. "Editar painel" deve devolver todas as escolhas aos seus campos sem pedir um arquivo JSON. Mude o período para 90 dias, repita o caminho e confira também o recarregamento e o botão Voltar do navegador.

O endereço deve conter somente o modo local e um identificador aleatório, sem o nome da conta ou os textos preenchidos. Os testes de sessão precisam recusar identificadores inválidos, registros vencidos, datas futuras e conteúdo acima do limite de 1 MiB, sem executar código ou abrir uma página externa. Com o armazenamento bloqueado, a troca de telas deve continuar na aba aberta e explicar que recarregar não recuperará as escolhas. Um endereço sem a cópia válida precisa apresentar o aviso e voltar à personalização. O JSON continua disponível como cópia de segurança.

Confira o asterisco vermelho em "Conta da Wikipédia", sua explicação e os atributos de campo obrigatório. O campo deve receber o foco quando estiver vazio ao preparar os trechos. As indicações opcionais precisam continuar legíveis, com menor tamanho e menor destaque. Os seletores preenchidos e as regras de opções dependentes permanecem válidos, como as datas de um período personalizado.

Ative o horário e experimente UTC, horário de verão, meia hora e 45 minutos de diferença. A linha deve usar somente a hora e a diferença para UTC, como "10:42 (UTC-4)". A dica e os atributos precisam conservar a data exata e o fuso, distinguindo a cópia salva do relógio da sessão. Na instalação simulada, prepare o trecho, espere o relógio avançar e acrescente o código no editor local. A conferência deve usar o mesmo trecho preparado durante essa operação, sem uma nova data ISO tornar o conteúdo diferente. Uma segunda inserção deve continuar impedindo a duplicação, e os textos que já estavam no rascunho precisam permanecer nele.

Em "Imagem de capa", informe um arquivo manual e mude para "Imagem do dia do Commons". O campo manual deve ficar desativado sem perder o nome. Voltar ao modo manual deve recuperá-lo. A prévia usa somente a ilustração local, enquadrada pelo centro para preencher a faixa. Confira imagens de formatos diferentes nos testes simulados, a legenda e o acesso à página canônica do arquivo no Commons. O trecho inicial diário deve usar um aviso de espera, sem um nome de arquivo inventado.

Os testes do programa usam respostas simuladas do Wikifeeds para conferir a data UTC, a validação do arquivo, uma só consulta em andamento, o reaproveitamento da resposta do dia e a pausa de cinco minutos depois de uma falha. A última imagem válida deve permanecer disponível. Uma resposta inválida não pode introduzir HTML, endereços arbitrários ou um arquivo fora das regras aceitas. O modo manual, o topo oculto e a aba inativa não devem iniciar a consulta opcional. As métricas conservam sua identidade e seu agendamento.

Confira a tela larga e a de 360 por 800 pixels, medindo o documento do instalador e o documento da prévia separadamente. A capa, os textos e os controles precisam caber sem rolagem horizontal. A execução futura do programa atualiza a capa somente na sessão da própria conta. Os visitantes continuam recebendo a imagem e a data da última cópia salva manualmente na página. Esta rodada não usa uma conta Wikimedia nem envia uma edição.

Os 593 testes automatizados passaram, sem falhas ou testes ignorados. A repetição no editor local confirmou a inserção, a prévia, o salvamento e a reabertura com o mesmo horário preparado, conservando os textos anteriores. O console permaneceu sem erros. Uma conferência de rede delimitada capturou 41 pedidos completos, todos locais. O monitoramento longo anterior perdeu eventos antigos e não foi usado como prova de cobertura completa. A folha passou no parser e no sanitizador CSS do TemplateStyles, sem erros ou pedidos de rede. Os detalhes estão em [VALIDACAO_1.16.0.json](VALIDACAO_1.16.0.json).

## Conferir capa para visitantes e cores da versão 1.17.0

Escolha "Imagem do dia da Wikipédia, para visitantes" e prepare o trecho. Ele deve conservar o título com CURRENTDAY, CURRENTMONTHNAME e CURRENTYEAR, com uma só verificação de existência. O nome de um arquivo fixo, a prova anterior do Commons e a ilustração local não podem substituir esse calendário. Confira os blocos juntos, separados, integrados e usados sozinhos. Os downloads de atualização da própria conta também precisam conservar a transclusão.

Use o teste local em `tests/browser/native-cover.html` para alternar paisagem e retrato e duas datas simuladas em UTC. O recorte deve preencher a faixa pelo centro. A descrição não pode tomar o lugar da capa. Esse teste usa ilustrações e duas respostas simuladas, sem executar o parser da Wikipédia. Os testes do programa conferem que as atualizações dos números conservam o mesmo elemento da imagem já renderizada pelo servidor e que visitantes anônimos não iniciam o programa ou consultas.

Em "Seu perfil", escolha cores diferentes para nome, rótulos e informações. Confira também as ligações internas e os campos de estatutos e criação da conta. Volte para "Automática" e confirme o retorno às cores calculadas para o fundo. Digitar uma cor incompleta não pode substituir a última escolha válida. No grupo "Disposição", confira a cor do painel e o destaque junto das opções das caixas. A antiga seção "Cores e destaques" não deve existir.

Os 627 testes automatizados passaram, sem falhas ou testes ignorados. O navegador integrado, com Chromium, confirmou as cores escolhidas, o recorte nas duas orientações, a troca de datas simuladas e o salvamento no editor local. A tela larga e a de 360 por 800 pixels couberam sem rolagem horizontal. O instalador e o índice responderam com HTTP 200. Duas conferências delimitadas de rede capturaram 23 e 15 pedidos, todos locais e sem perda de eventos. O console não apresentou erros.

A folha passou no parser e no sanitizador CSS de TemplateStyles, sem erros ou pedidos de rede. Firefox e Safari nativos não foram repetidos. A consulta pública de referência leu somente fontes e HTML de uma página existente. Nenhum perfil foi enviado para análise remota, nenhuma sessão Wikimedia foi operada e nenhuma edição foi publicada. A atualização futura para visitantes depende do cache do servidor e não muda uma aba que permanece aberta. Os detalhes estão em [VALIDACAO_1.17.0.json](VALIDACAO_1.17.0.json).

## Conferir cores de cada informação na versão 1.18.0

Crie um rótulo "Alma mater" com dois itens, como GWU e MIT. Escolha uma cor para o rótulo e cores diferentes para os itens. Confira as ligações internas na mesma linha, em linhas separadas e com marcadores, nas áreas escolhidas para o perfil. Mude a cor geral e confirme que somente os itens em "Padrão do perfil" acompanham a mudança. Volte um item personalizado para esse padrão e confira a cor herdada.

Remova o primeiro item e confirme que a cor do segundo acompanha seu texto. Acrescente outro item, mude a disposição e confira a conversão de uma informação antiga, que tinha um único valor. As cores precisam continuar junto de seus itens. O JSON antigo deve conservar a aparência anterior, e os dados novos devem recusar cores inválidas ou listas de cores com tamanho diferente da lista de valores. Confira também o rótulo sem dado e uma informação herdada ao lado de outra personalizada.

Os 641 testes automatizados passaram, sem falhas ou testes ignorados. O navegador integrado, com Chromium, confirmou as cores individuais, a herança, a remoção de item, o recarregamento e a exportação. O editor local conservou o texto anterior e salvou o rascunho com as cores escolhidas. Os controles couberam em 360 por 800 pixels, sem rolagem horizontal. O instalador respondeu com HTTP 200, o console ficou sem erros e os 23 pedidos de uma conferência delimitada foram locais, sem perda de eventos.

A folha de TemplateStyles permaneceu com os mesmos bytes da versão 1.17.0, conferidos pelo SHA-256, e conservou sua validação anterior. Firefox e Safari nativos não foram repetidos. Nenhuma página Wikimedia foi operada e nenhum código foi enviado para análise remota ou publicação. Os detalhes estão em [VALIDACAO_1.18.0.json](VALIDACAO_1.18.0.json).

## Conferência da versão 1.19.0

A execução completa passou nos 701 testes locais, sem falhas ou testes ignorados. As conferências abrangem os seis idiomas, os trechos preparados, a preservação de textos pessoais, a fila entre abas, as pausas dos serviços e a retomada com orçamento limitado. Duas construções limpas da distribuição produziram arquivos idênticos. A instalação de dependências foi repetida em uma pasta vazia, com lockfile fixo e scripts de instalação desativados. A consulta aos avisos públicos de dependências não encontrou alertas para o conjunto instalado com Vite 6.4.3.

A conferência visual usou Chrome e o navegador integrado do Codex, com dados inventados. Os seis idiomas preservaram nome, formação, ligações internas e títulos dos artigos. A tela francesa de 360 por 800 pixels coube sem rolagem horizontal. O fluxo italiano preparou a instalação e conservou o código como texto no editor local. Um recarregamento observado teve 24 pedidos locais, sem destinos externos ou falhas de rede, e não houve erros no console.

Safari e Firefox não estavam disponíveis pelas ferramentas desta sessão e precisam de uma conferência real antes de um lançamento estável. Os testes não entraram em contas Wikimedia, não publicaram páginas, não escreveram no GitHub nem alteraram a área de transferência do sistema. O relatório estruturado fica em VALIDACAO_1.19.0.json. A validação de TemplateStyles foi reaproveitada depois de confirmar que a folha tem o mesmo SHA-256 da versão já conferida.

## Conferir a primeira coleta e a edição da versão 1.20.0

Use respostas controladas para uma conta com histórico longo e sem cache. Confira que a identidade global e a criação mais antiga chegam antes do histórico completo, com os alcances preservados. Uma contagem global de contribuições pode ser maior que o total local de revisões da ptwiki. Os contadores que dependem do histórico devem continuar pendentes até sua conclusão, sem mostrar totais parciais como se fossem completos. Repita com um cache válido e confirme a retomada ou a consulta incremental, sem reconstruir o histórico sem necessidade.

Simule mais de cinquenta artigos candidatos e confira as primeiras linhas de visualizações antes de terminar todos os metadados. Cada linha precisa usar sua série conferida, com ordem provisória e total do período desconhecido. Um artigo ainda não classificado pode entrar acima dos primeiros. Só a cobertura completa permite fechar a soma de todos os artigos elegíveis. A antecipação das linhas não pode alterar o corte após a primeira edição, a seleção dos artigos ou o orçamento compartilhado de consultas.

Confira a caixa de anos com uma criação local da ptwiki posterior à criação de uma conta vinculada. O HTML, a atualização do DOM e a exportação portuguesa de `Tempo decorrido` precisam usar a mesma data mais antiga. Teste os seis idiomas, uma criação global ainda anterior, aniversário incompleto, provas parciais, dados ausentes, datas inválidas ou futuras e uma prova de outra conta. Um cache antigo que só conhece a criação local deve deixar a caixa pendente, sem conservar um número antigo incorreto nem inventar zero.

No ambiente simulado, "Editar painel" só pode aparecer para a conta dona e só pode abrir o instalador depois de um clique. Confira origem, referência da janela e identificador temporário, incluindo mensagens de outra origem, janela ou identificador, expiração e janela bloqueada. A configuração deve chegar como dados, sem campos pessoais no endereço. A leitura opcional da página precisa ser pública, usar a fila de consultas e conservar o original como texto. Um par único de marcadores permite trocar somente a região do painel. Teste marcação ausente, repetida ou incompleta e preserve metas, categorias e conteúdo externo à região. Nenhum cenário pode salvar na Wikipédia.

A execução da suíte completa, a comparação das construções e a disponibilidade do instalador hospedado precisam ser registradas na validação da versão depois dos testes. Os resultados da 1.19.0 acima continuam sendo o registro daquela distribuição e não comprovam a nova versão. O GitHub Pages só pode ser anunciado como disponível depois de conferir o endereço publicado e seus arquivos.

### Conferir uma cópia maior que o localStorage

Abra `tests/browser/large-cache.html` pelo servidor local para testar o IndexedDB real do navegador. A página usa uma chave inventada, grava e lê uma cópia de cerca de 2,8 milhões de caracteres, confere o texto e sua decodificação e recusa uma gravação anterior à cópia mais recente. O valor equivale a mais de cinco MiB em UTF-16, sem preencher o `localStorage` para simular falta de espaço. Ao terminar, o teste remove somente a própria chave inventada e mostra se a limpeza ocorreu. A política da página impede conexões externas. Guarde a captura e o resultado fora da árvore pública do repositório.

Os testes de `LargeCache` também precisam conferir limite de caracteres, chaves de outros dados, registros inválidos, datas futuras, concorrência entre abas, armazenamento bloqueado e abertura que não termina. A operação deve retornar uma falta de dados ou uma falha de gravação em vez de rejeitar a promessa, com limite de espera e fechamento da conexão, inclusive quando uma abertura bloqueada termina tarde.

Na integração com o programa, confira a apresentação imediata da cópia disponível e a espera da recuperação do IndexedDB antes de qualquer coletor. Um registro armazenado só pode voltar ao painel depois da validação completa de conta, projeto, fuso e métricas. Teste uma gravação aceita pelo `localStorage`, outra aceita somente pelo IndexedDB e a falha dos dois. A primeira cópia de progresso e a final precisam tentar persistir, sem gravar todas as intermediárias em menos de quinze segundos. O aviso de falha deve aparecer uma vez, mantendo a memória e os últimos resultados disponíveis. Esses testes não podem apagar chaves de outros programas nem ampliar os limites do codec.

## Resultado da conferência local da versão 1.20.0

A suíte completa passou pelos 762 testes, sem falhas nem testes ignorados. Chrome e o navegador interno do Codex passaram por 23 verificações do painel e 21 verificações de recusa de acesso, serviço indisponível e leitura da cópia salva em cada navegador. A conferência de IndexedDB passou por oito verificações em cada um, com uma entrada inventada de 2.800.014 caracteres, maior que cinco MiB em UTF-16, removida ao terminar.

A troca entre duas origens locais abriu o instalador com as escolhas recebidas, manteve a janela de origem desligada do campo opener e recusou mensagens com origem, janela ou identificador incorretos. A revisão no editor conservou os projetos e a categoria fora do painel. Uma nota acrescentada ao rascunho permaneceu depois de mudar a aparência. Janela bloqueada e ausência de resposta encerraram a tentativa com uma mensagem, sem pedir uma sessão Wikimedia.

No histórico inventado com 10.620 revisões e 3.690 artigos candidatos, a primeira série chegou na consulta 30 e as primeiras linhas foram apresentadas na consulta 31 do primeiro ciclo. A rotina anterior chegava à primeira série na consulta 192 do quinto ciclo. A soma completa e a classificação final continuam pendentes até conferir os artigos restantes, sem transformar resultados parciais em totais.

A consulta de avisos das dependências não encontrou alertas nas 115 dependências examinadas. A folha de estilos manteve o SHA-256 da versão validada. Firefox e Safari não estavam disponíveis pelas ferramentas desta sessão. Os resultados locais e a construção reproduzível ficam em VALIDACAO_1.20.0.json. A disponibilidade do site hospedado e a execução do CI precisam ser conferidas depois do envio ao GitHub, e o uso da sessão real da Wikipédia fica com a pessoa que instala.
