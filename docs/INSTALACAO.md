# Instalar ou atualizar o PerfilWiki

O PerfilWiki usa um programa compartilhado e os blocos que você coloca na sua página de usuário. O seu `common.js` carrega o programa quando você está conectado. Os visitantes veem os números salvos na página.

A versão 1.20.0 está em teste local, sem publicação na Wikipédia ou envio ao GitHub. Você pode testar a prévia, personalizar o painel e conferir os arquivos, mantendo todas as ações no computador. Os editores de teste recebem código como texto e não executam nem publicam esse código.

Abra `INICIO.html` pelo servidor local para usar o instalador em duas telas. O índice completo de manutenção fica em `Arquivos.html`. Cada destino deve ter o conteúdo inteiro, o resumo de edição, o download e um atalho para o editor ao lado da cópia. Os endereços são atalhos para uma etapa manual futura, sem envio automático.

Para adotar as cores individuais da versão 1.18.0 em uma futura instalação, prepare novamente o carregador e o trecho da página depois de atualizar o programa e os estilos compartilhados. A configuração anterior continua usando as cores gerais do perfil. Escolhas por rótulo ou item precisam acompanhar o carregador e os blocos da página para que a sessão da própria conta e a cópia pública recebam a mesma aparência.

A capa diária para visitantes continua disponível desde 1.17.0. Só mudar o carregador não coloca a capa dinâmica no wikitexto que já estava salvo. Com o modo da Wikipédia presente no trecho da página, as próximas datas deixam de exigir uma gravação diária.

## Idioma e exemplos iniciais

O seletor de idioma oferece português do Brasil, português de Portugal, inglês, espanhol, francês e italiano. A escolha acompanha o instalador e os textos do painel, incluindo a apresentação de números e datas. Nomes de conta, títulos de artigos e informações pessoais permanecem como foram escritos. As páginas de documentação técnica deste pacote continuam em português do Brasil.

A configuração guarda essa escolha em `appearance.language`, com os valores `pt-BR`, `pt-PT`, `en`, `es`, `fr` e `it`. Uma configuração antiga sem esse campo usa `pt-BR`. O idioma é uma opção de apresentação e não muda a identidade do cache ou as regras das métricas.

Novas escolhas começam no fuso de Brasília, `America/Sao_Paulo`, com Belo Horizonte e UFMG como sugestões nos campos. Esses exemplos não são preenchidos como dados da pessoa. Configurações importadas mantêm o fuso e os textos que já continham.

Quando existe um contexto da própria ptwiki com `wgUserName`, o instalador aproveita a conta da página e dispensa sua digitação. Isso não consulta um login. Uma abertura por "Editar painel" pode receber as escolhas diretamente da sessão dona do painel. Abrir o instalador diretamente em um servidor local ou no GitHub Pages mantém o campo manual, pois esse endereço não consegue ler o login da Wikipédia.

## Guardar e retomar a personalização

Use "Ver painel" depois de fazer os ajustes para abrir uma simulação local sem alças, estrelas ou campos de edição. No painel, "Editar painel" volta à personalização com as escolhas atuais, incluindo foto, cores, contadores, ordem, posição dos campos, fuso e textos pessoais. Não é preciso baixar ou importar JSON para alternar entre essas duas telas.

As escolhas ficam na mesma aba e podem ser recuperadas ao recarregar enquanto a sessão local existir, por até 24 horas desde a última gravação. O endereço recebe apenas um identificador aleatório, sem nome de conta ou conteúdo pessoal. Se o navegador impedir o armazenamento, o painel e os ajustes continuam funcionando na aba aberta, com um aviso de que o recarregamento não poderá recuperar as escolhas. Um endereço vencido ou sem a cópia correspondente informa o problema e volta à personalização.

O programa 1.20.0 prepara um botão "Editar painel" na sessão da própria conta para abrir o instalador em `https://danrego.github.io/PerfilWiki/INICIO.html`. A passagem só pode terminar quando a mesma versão estiver hospedada e acessível nesse endereço. Depois do clique, as janelas conferem a origem, a janela esperada e um identificador temporário antes de transmitir as escolhas. Os campos pessoais não vão no endereço.

Uma consulta pública pode trazer o código-fonte e o número da revisão da página, para conservar o original ao preparar o rascunho. O instalador substitui apenas um bloco reconhecido entre um par único de marcadores do PerfilWiki. Se a página antiga não tiver esses marcadores, ou se eles forem ambíguos, use o bloco novo para uma substituição manual e confira o original. Se a consulta falhar, as escolhas ainda podem abrir, com aviso para preservar a página manualmente.

Como cópia de segurança opcional, "Carregar minhas escolhas" na primeira etapa abre um arquivo JSON baixado anteriormente pelo PerfilWiki. O instalador confere o conteúdo antes de trocar as escolhas atuais. Um arquivo inválido mantém o que já estava na tela e informa o problema. Configurações anteriores da série 1 continuam aceitas, com os padrões das opções que ainda não existiam. O arquivo é lido como dados, sem executar código.

Use "Baixar minhas escolhas" antes de sair para guardar as opções e os blocos de conteúdo do instalador. O nome da conta, a localização e os textos que você tiver preenchido ficam dentro desse arquivo, por isso confira seu conteúdo antes de compartilhá-lo. O JSON serve para reabrir a personalização, e não deve ser colado no common.js ou na página de usuário.

## Textos, metas e declarações abaixo do painel

Em "Textos e projetos", acrescente um bloco de conteúdo para cada parte que deseja manter depois das visualizações, com um título e seu texto em wikitexto. Você pode mudar a ordem ou remover os blocos antes de preparar os trechos. O instalador aceita até oito blocos, títulos com até 100 caracteres e textos com até 50.000 caracteres por bloco, com um total de até 200.000 caracteres nos textos. Um título é texto simples, enquanto o corpo conserva a marcação digitada.

Esses blocos permitem trazer suas metas, projetos e os textos que já estavam na página. Uma declaração sobre conflito de interesses pode ocupar um deles, com o conteúdo que você decidir escrever. O instalador não cria uma declaração em seu nome. Ligações, listas e predefinições permanecem no wikitexto preparado. A prévia local aproxima apenas a formatação mais simples, enquanto HTML e predefinições ficam como texto. Tabelas podem ser conferidas como código em uma área recolhível. Nada é executado ou enviado à Wikipédia para produzir essa prévia. O botão "Editar" de cada bloco na prévia volta ao campo de texto correspondente.

O trecho completo da página coloca esses textos depois do painel, fora dos elementos atualizados pelas métricas. Eles não entram no carregador de ativação nem nos downloads de números. Ao atualizar o painel, substitua apenas o trecho indicado e preserve os blocos pessoais que estiverem abaixo dele.

## Como editar depois de uma futura instalação

Para mudar um texto pessoal, abra sua página no editor normal da Wikipédia e edite a seção correspondente. Os blocos usam títulos de seção nativos, que permitem a edição de seção quando essa opção está disponível na página. Confira o resultado em "Mostrar previsão" e use o botão de salvar do próprio editor quando estiver pronto. O PerfilWiki não salva em seu nome.

Para mudar cores, foto ou contadores, use "Editar painel" na sua sessão, faça os ajustes e confira os novos trechos. O caminho por JSON continua disponível. "Baixar minhas escolhas" guarda a configuração do painel, sem ler os textos pessoais editados diretamente na página. Ele não substitui uma cópia desses textos. O rascunho recebido da página mantém os textos fora do bloco reconhecido, sem convertê-los em campos. Preserve os outros scripts e o conteúdo da página ao fazer a atualização manual.

A edição futura continua pelo editor normal e pelo salvamento manual da pessoa. A navegação local entre painel e ajustes não acrescenta pedidos de escrita nem uma rotina de publicação na Wikipédia.

## Foto, capa e fundo do topo

"Cor do painel" fica em "Disposição", junto das escolhas gerais do painel. "Cor do destaque das caixas" fica perto das colunas e do alinhamento dos contadores. A estrela da caixa continua escolhendo quais recebem o destaque. As cores dos campos ficam em "Seu perfil", junto dos textos que mudam, e o fundo do topo fica junto da capa. O grupo separado "Cores e destaques" foi retirado.

Em "Seu perfil", a foto pode ficar em "No topo, padrão", "Na atividade", "Topo e atividade" ou "Ocultar". A área antes chamada "cabeçalho" passa a ser "atividade" nos controles, para distingui-la do topo. As configurações anteriores com outras posições explícitas continuam aceitas pelo programa.

Junto da foto, os botões de "Alinhamento da foto" escolhem "À esquerda", "Centralizado" ou "À direita". À esquerda, o padrão, a foto fica ao lado do texto. À direita, ela passa para o outro lado. No centro, ela fica acima das informações. Essa escolha é independente do alinhamento do nome e dos contadores e vale nas áreas em que a foto foi exibida. Em telas estreitas, a foto e o texto se reorganizam para caber. A capa permanece acima das informações do topo.

O tamanho da foto pode ser 64, 96, 128, 160 ou 200 pixels, com 96 pixels no início. Escolha o formato quadrado ou redondo sem mudar seu alinhamento. O recorte vale para a imagem, deixando "Ver arquivo no Commons" inteiro e legível abaixo dela. A largura se adapta a telas menores. Essas escolhas mudam a apresentação da foto, sem pedir outra imagem por causa do ajuste.

Em "Imagem de capa", escolha "Escolher arquivo do Commons" para informar uma imagem fixa, "Imagem do dia da Wikipédia, para visitantes" para acompanhar a escolha diária da Wikipédia em português, ou "Imagem do dia do Commons, na sua sessão" para consultar a escolha do Commons na sessão da própria conta. As duas escolhas diárias podem usar imagens diferentes. O nome do arquivo manual fica guardado ao mudar de opção. Para ficar sem capa, volte ao modo manual e deixe o nome vazio. A imagem ocupa uma faixa acima das informações do topo, com recorte central para preencher a área.

"Imagem do dia da Wikipédia, para visitantes" usa as páginas diárias que já existem na Wikipédia em português. Depois da instalação manual inicial, a data em UTC é recalculada pela própria Wikipédia, sem precisar salvar outra edição a cada dia. Os visitantes não precisam do JavaScript do PerfilWiki, de uma conta conectada ou de consultas à API pelo painel. A troca acompanha a renovação do cache da Wikipédia, sem garantir a mudança à meia-noite nem trocar a imagem de uma aba que já está aberta. Se a página diária ainda não existir, a capa mostra um aviso discreto no lugar de um arquivo inventado. O arquivo exibido conserva sua ligação nativa para consultar os créditos e a licença. A opção usa o [calendário de imagens em destaque da Wikipédia em português](https://pt.wikipedia.org/wiki/Wikip%C3%A9dia:Imagem_em_destaque) e as [palavras mágicas de data do MediaWiki](https://www.mediawiki.org/wiki/Help:Magic_words#Date_and_time).

"Imagem do dia do Commons, na sua sessão" conserva o funcionamento anterior. O programa pode consultar a imagem pela data UTC na sessão da própria conta e conserva a última imagem conferida se a consulta falhar. Os visitantes recebem a imagem da última cópia salva manualmente nesse modo. No instalador, todas as capas continuam ilustrativas e locais, sem buscar imagens ou enviar seu código à Wikipédia. O modo da Wikipédia prepara uma chamada dinâmica para o calendário existente, e o modo do Commons começa com um aviso de espera até haver dados conferidos.

"Cor de fundo do topo" usa o mesmo seletor dos outros ajustes e começa em branco. Na opção automática de texto, o programa calcula cores legíveis sobre esse fundo. Uma cor de texto escolhida manualmente permanece como foi informada. O fundo vale somente para o topo, sem mudar o fundo das caixas ou da atividade. Foto, capa e cores acompanham a prévia e os trechos preparados.

"Cor do nome" fica junto do nome de exibição, e "Cor dos rótulos" e "Cor das informações" ficam junto das informações adicionais. Cada controle permite manter "Automática" ou escolher uma cor. A escolha vale para os campos do perfil nas áreas em que aparecem, incluindo suas ligações, sem mudar os números das caixas. As cores escolhidas são mantidas como foram informadas. Confira a leitura sobre os fundos que usa ou volte a "Automática" para recuperar as cores preparadas pelo painel.

Junto de "Foto do Wikimedia Commons", "Envie uma foto" abre o [assistente de envio do Commons](https://commons.wikimedia.org/wiki/Special:UploadWizard?uselang=pt-br) em outra aba. O envio acontece no Commons, seguindo suas [orientações para carregar arquivos](https://commons.wikimedia.org/wiki/Commons:Upload). Depois de concluir essa etapa, copie o nome do arquivo para o campo da foto, pois o instalador não faz o envio nem o preenchimento automático.

## Itens de uma informação e campos no topo

Em "Seu perfil", os ajustes de tamanho e alinhamento ficam junto do nome de exibição. O tamanho pode ser 16, 20, 24, 28, 32 ou 36 pixels, com 24 no início. "Alinhamento do nome de exibição" usa botões com ícones de linhas, identificados como "À esquerda", "Centralizado" e "À direita", com a escolha ativa visível e nomes para leitores de tela. Cada rótulo tem seu próprio controle de "Disposição das informações", mesmo quando contém só um item, para escolher uma linha, linhas separadas ou marcadores sem mudar as outras informações. "Alinhamento dos contadores" continua em "Disposição", perto dos ajustes da grade das caixas, sem mudar o alinhamento do perfil.

Uma informação adicional pode reunir até oito itens sob o mesmo rótulo. Em "Formação", por exemplo, coloque `[[Universidade Federal de Minas Gerais|UFMG]]` no primeiro item e `[[Universidade de São Paulo|USP]]` no segundo. "Adicionar item" cria outro campo sem repetir o rótulo. Escolha itens na mesma linha, com barra vertical, ponto central ou espaço, ou use linhas separadas, com ou sem marcadores. Os itens passam para outra linha quando falta largura. Cada item aceita até 160 pontos de código Unicode, e o painel mantém até três grupos com rótulos de até 40 pontos.

Os campos que usam "Padrão" começam no topo, acima da atividade. Os campos de texto também podem ficar na atividade ou acima das caixas, em uma combinação dessas áreas, ou ocultos. A escolha antiga "Nos dois blocos" conserva a atividade e as caixas. Configurações com uma posição anterior explícita mantêm essa escolha, enquanto uma posição geral ausente usa o novo padrão no topo. O topo só aparece quando recebe conteúdo, sem repetir o nome por conta própria.

"Mostrar hora local" e o fuso ficam junto de "Localização", em "Seu perfil". O horário usa o fuso escolhido, sem tentar deduzi-lo do texto da cidade. Quando aparecem na mesma área, uma localização como `[[Belo Horizonte]]` fica seguida de "11:42 (UTC-3)" na mesma linha de informações, antes dos outros campos. Se tiverem posições diferentes, cada um conserva a posição escolhida. Sem uma cidade visível naquela área, o horário pode aparecer sozinho. A diferença para UTC muda com o horário de verão. O relógio usa o horário do computador e a mesma rotina que atualiza a indicação da última edição, sem outra consulta de dados.

Na sessão da própria conta com o programa ativo, o horário acompanha os minutos. A cópia salva para visitantes mantém o horário do momento em que o trecho foi preparado, pois o programa não inicia a rotina na sessão de outras pessoas. Nos dois casos, a linha mostra apenas a hora e a diferença para UTC. A dica informa o fuso e a data da conferência, e o atributo de data conserva o instante em formato ISO. Nos downloads, os campos do topo acompanham o painel integrado ou o primeiro bloco visível nas disposições anteriores. Substitua essa parte junto com o bloco, mantendo um só topo.

As configurações anteriores com um único `value` continuam aceitas, incluindo `{label: 'Pesquisa', value: ''}` para mostrar só o rótulo. A forma curta `{label: 'Pesquisa'}` também é aceita. Um grupo com `values: []` mantém seu rótulo e seus ajustes de disposição. Para escrever uma lista manualmente, use `values`, sem juntar as duas formas no mesmo grupo. Um exemplo é `{ label: 'Formação', values: ['[[Universidade Federal de Minas Gerais|UFMG]]', '[[Universidade de São Paulo|USP]]'], layout: 'inline', separator: 'pipe', placement: 'top' }`. As outras disposições são `lines` e `bullets`, e os outros separadores são `dot` e `space`. A posição do horário fica em `appearance.profilePlacements.localTime`, sua exibição em `appearance.showLocalTime`, e o tamanho do nome em `appearance.nameFontSize`.

## Estatutos na Wikipédia em português

Em "Seu perfil", marque "Mostrar estatutos" para apresentar os grupos públicos da conta na Wikipédia em português e escolha sua posição em "Mostrar estatutos em". A opção começa desmarcada, e "Padrão" acompanha a posição geral das informações. A lista usa os [tipos de usuário da ptwiki](https://pt.wikipedia.org/wiki/Wikip%C3%A9dia:Tipos_de_usu%C3%A1rios), sem tentar deduzir permissões pelas edições da conta.

Com a opção marcada e visível, o programa pede os grupos explícitos e implícitos à [API pública de usuários](https://www.mediawiki.org/wiki/API:Users), por uma consulta GET anônima. Depois de uma resposta conferida, o resultado é reaproveitado por 24 horas. Uma atualização forçada pode antecipar outra consulta. Esses dados ficam separados dos contadores e não mudam suas regras ou a identidade do histórico.

Se a lista contém "Autoconfirmado estendido", a apresentação retira "Autoconfirmado" e "Confirmado" para evitar a repetição. Outros estatutos, como "Autorrevisor", "Reversor" e "Administrador", permanecem juntos quando constam na resposta. Sem dados conferidos, o campo mostra "Aguardando dados" ou "Estatutos indisponíveis" depois de uma falha. Um erro posterior conserva a última resposta válida.

Em cada área do perfil, os estatutos e a data de criação ficam depois das informações adicionais, quando estiverem visíveis naquele local. **Estatutos** vem antes de **Conta criada**, e somente esses rótulos recebem negrito, mantendo os valores com o peso normal do texto. A posição escolhida para cada campo continua valendo.

A cópia pública mostra os estatutos da última consulta salva, e o atributo de dica do campo informa a data dessa conferência em UTC. Novas alterações nos grupos só aparecem para visitantes depois de preparar e salvar outra cópia do painel. A configuração usa `appearance.showUserGroups: true` e `appearance.profilePlacements.userGroups`, que começa em `inherit`.

## Caixas dentro da atividade

A disposição inicial coloca as caixas no painel de atividade, depois do cabeçalho com a sequência de dias e antes do gráfico de 12 semanas. O nome e os campos que seguem a posição padrão começam no topo, acima desse painel. Os campos escolhidos para as caixas ficam logo acima dos contadores, dentro do mesmo painel. Escolher os dois locais mostra o campo nas duas posições, e "Ocultar" continua disponível.

Em "Disposição", "Caixas na atividade" usa esse painel integrado. As opções anteriores permitem manter caixas e atividade em blocos próprios, na ordem escolhida, ou colocar textos entre os blocos separados. A ordem dos blocos fica guardada quando você experimenta a disposição integrada. As cores, os destaques, a seleção e a ordem das caixas, as colunas e os alinhamentos continuam independentes dessa escolha.

O trecho completo da página de usuário já leva as caixas para a posição escolhida. No painel integrado, "Baixar painel atualizado" reúne atividade e caixas em um arquivo para substituir o painel inteiro. "Baixar contadores atualizados" continua fornecendo somente as caixas, para substituir essa parte interna sem repetir o convite. Se apenas as caixas estiverem visíveis, seu arquivo também leva o convite de instalação.

Os downloads de todo o painel conservam um único par de marcadores `PERFILWIKI-PROFILE-BEGIN` e `PERFILWIKI-PROFILE-END`. Isso vale para o painel integrado e para uma instalação com apenas caixas ou apenas atividade. Quando os dois blocos estão habilitados nas disposições anteriores, os downloads individuais são fragmentos. Ao substituir um desses fragmentos, preserve os marcadores externos, o outro bloco e seus textos pessoais fora da região do painel.

## Percorrer o instalador

Na primeira tela, informe em "Conta da Wikipédia" o nome exato da conta, sem o prefixo "Usuário:". Esse é o único campo de perfil obrigatório e recebe um asterisco vermelho, explicado em texto e anunciado aos leitores de tela. Os campos opcionais usam uma indicação menor e discreta. Os seletores já vêm preenchidos, e uma opção ativada ainda pode exigir o dado que precisa para funcionar. Se o instalador estiver sendo executado na própria Wikipédia em português, ele pode preencher esse campo com a conta disponível na configuração da página, sem fazer uma consulta de autenticação. No endereço local, informe a conta manualmente.

Use "Nome de exibição" se quiser outro nome nos títulos da prévia e do painel. Deixar esse campo vazio usa o nome da conta. Essa escolha não muda a conta das consultas, os destinos do carregador ou da página pessoal nem a identidade dos dados guardados. São aceitos até 100 caracteres Unicode, sem caracteres de controle nem os sinais `<`, `>`, `[`, `]`, `{`, `}` e `|`.

Os campos opcionais "Localização" e "Informações adicionais" aceitam texto e ligações internas, como `[[Rio de Janeiro]]` ou `[[Rio de Janeiro|Rio]]`. A localização aceita até 120 pontos de código Unicode. Até três informações aceitam rótulos de até 40 pontos de código e até oito itens de 160 pontos cada. Esses limites contam o texto digitado inteiro, incluindo os sinais da marcação das ligações. O rótulo usa apenas texto e já aparece na prévia quando é preenchido, mesmo sem dado, sem receber dois-pontos ou uma lista vazia. HTML, predefinições e marcação malformada não são aceitos. Campos vazios ficam fora da configuração preparada e não alteram a conta consultada. Ao lado de cada campo, escolha se ele aparece nas caixas, na atividade ou nos dois blocos, ou use "Ocultar". A opção "Padrão" segue "Posição padrão das informações", que começa em "No topo". As escolhas explícitas de posição continuam guardadas. Quando só um bloco estiver visível, os campos destinados aos blocos acompanham esse bloco, sem retirar os campos do topo ou mostrar campos ocultos.

Use o seletor ao lado de cada campo para escolher sua posição ou ocultá-lo. As informações podem ficar uma por linha ou juntas, separadas por |. A opção em linha acrescenta uma divisória abaixo do nome, e a largura disponível define onde as informações precisam quebrar.

A foto é opcional e usa uma imagem já existente no Wikimedia Commons. Digite somente o nome de um arquivo JPG, JPEG, PNG, WebP, GIF ou SVG, com `File:` ou `Ficheiro:` se quiser. A prévia é ilustrativa e não busca a foto. Os trechos preparados usam o arquivo escolhido e oferecem "Ver arquivo no Commons" para consultar seus créditos e sua licença. O instalador não envia imagens.

O nome e essas informações começam alinhados à esquerda e podem ficar no centro ou à direita, independentemente do alinhamento dos números nas caixas. "Mostrar a data de criação da conta" fica desmarcado no início. Ao marcar, o painel usa a menor data pública entre o registro global e os registros das contas locais vinculadas. A data aparece por extenso no idioma escolhido, com dia, mês e ano em UTC. Se faltar algum registro, o texto avisa que a data é a mais antiga disponível entre os dados consultados. Sem nenhuma data, o painel informa que ela está indisponível. A caixa "Na Wikipédia" conta os anos completos desde essa mesma data pública conferida, mesmo que o registro local da ptwiki seja posterior. Sem uma data global ou vinculada conferida, a caixa aguarda dados e não usa o registro local como substituto.

O fuso começa no horário de Brasília, preservando uma escolha já importada. A lista reúne 55 opções em oito grupos geográficos, incluindo UTC, sem campo de busca. Havaí, Alasca e mais cidades da Europa e da Ásia estão disponíveis. Um fuso válido já escolhido ou recebido do navegador permanece disponível quando não está nessa seleção. Confira a cidade e a diferença atual para UTC. Essa diferença pode mudar com o horário de verão, enquanto a configuração conserva o nome do fuso. Escolha também o destino dos blocos, que pode ser a página de usuário ou uma subpágina. Nenhuma dessas escolhas inicia a coleta de dados.

Na primeira etapa, abra "Seu perfil", "Disposição" e "Conteúdo" conforme precisar. Em telas largas, a coluna tem sua própria rolagem e mantém a prévia à vista. Use uma das cores sugeridas ou "Escolher outra cor" e ajuste o espaçamento e o alinhamento das caixas. As oito caixas anteriores continuam selecionadas por padrão e ficam alinhadas à direita, com opções à esquerda e ao centro.

Use "Adicionar caixas", junto à prévia, para escolher entre 24 contadores. Na própria caixa, use a estrela para aplicar ou retirar o destaque e o botão × para removê-la. Arraste pela alça para mudar a ordem. Com o foco nessa alça, as setas para esquerda ou cima antecipam a caixa, e as setas para direita ou baixo colocam a caixa depois. Esses controles ficam apenas no instalador local e não aparecem na página de usuário. As caixas e a atividade podem aparecer juntas, com caixas primeiro ou atividade primeiro, ou em posições separadas. Também é possível ocultar um dos blocos e escolher a aba inicial de visualizações. Pelo menos um bloco precisa permanecer visível.

A caixa tracejada "Adicionar caixa +" ocupa a posição seguinte da grade enquanto houver algum contador disponível. Com sete caixas, ela ocupa a oitava posição. Clique nela ou use Enter ou Espaço para abrir o mesmo seletor de "Adicionar caixas", que também permanece na barra da prévia. O seletor fecha por clique externo, Escape ou pelo botão de fechar. Quando a abertura partiu da caixa tracejada, o foco pode voltar a ela ao fechar. Se todos os 24 contadores já estiverem selecionados, essa caixa desaparece. Ela não recebe número, destaque ou alça e não entra nos arquivos exportados.

O espaçamento oferece Compacto, Confortável e Amplo. A disposição automática usa até cinco colunas em Compacto, quatro em Confortável e três em Amplo, quando houver espaço. Você também pode escolher duas, três, quatro ou cinco colunas, com redução em telas estreitas. A paleta tem cores com nomes, um campo de cores que aceita clique e arraste, um controle "Clarear ou escurecer" e o campo hexadecimal. O seletor fecha ao clicar fora dele, pressionar Escape ou usar o botão de fechar.

A prévia usa dados inventados e os componentes reais de apresentação. As escolhas passam para o código do painel e para os trechos que serão copiados ou baixados. Os números inventados não entram nos arquivos iniciais, que aguardam a consulta da conta.

Na última tela, confira a configuração e experimente os editores locais. Acrescentar o trecho preserva o texto de exemplo que já estava neles. Um bloco duplicado, incompleto ou de outra configuração exige conferência antes de continuar. Salvar nesse editor encerra somente a simulação local.

A última etapa mantém os trechos pessoais. Para conferir ou manter o programa, os estilos e os documentos compartilhados, use "Arquivos e documentação", que abre `Arquivos.html` com conteúdo inteiro, cópia, resumo, download e endereço de edição.

## Verificar os trechos públicos

Depois de uma futura instalação manual, "Verificar instalação" permite comparar os arquivos públicos com a distribuição local e as escolhas do instalador. O botão lê o manifesto local e faz uma consulta pública para o `common.js` da conta, a página de destino, o programa compartilhado e os estilos. A leitura usa `GET` com `credentials: 'omit'`, sem login, tokens ou execução do código recebido. Ela só começa quando o botão é acionado.

O resultado separa o que confere, o que está ausente, o que está diferente e o que não pôde ser conferido. Uma falha de acesso não significa que a página não existe. A conferência lê o texto e o modelo de conteúdo das páginas. Ela não certifica que o script tenha sido executado no navegador nem que todos os serviços de estatísticas estejam disponíveis.

O resultado corresponde às escolhas preparadas naquele momento. Ao mudar a conta, o destino ou a configuração, faça outra conferência. O botão não salva correções. Para um arquivo compartilhado diferente, abra o índice de manutenção e confira a versão antes de preparar uma atualização manual. As consultas de texto e de modelo de conteúdo usam a [API de revisões](https://www.mediawiki.org/wiki/API:Revisions) e a [API de informações das páginas](https://www.mediawiki.org/wiki/API:Info).

## Ordem de uma futura atualização

Os passos abaixo documentam a publicação manual quando a versão for aprovada. O teste local não realiza nenhuma dessas alterações.

1. Atualize o programa inteiro em [Usuário:Daniel G Rego/PerfilWiki.js](https://pt.wikipedia.org/w/index.php?title=Usu%C3%A1rio%3ADaniel_G_Rego%2FPerfilWiki.js&action=edit) pelo índice de manutenção.
2. Atualize a folha inteira em [Usuário:Daniel G Rego/RitmoPU-estilos](https://pt.wikipedia.org/w/index.php?title=Usu%C3%A1rio%3ADaniel_G_Rego%2FRitmoPU-estilos&action=edit), conservando o modelo "CSS higienizado".
3. Atualize a [documentação compartilhada](https://pt.wikipedia.org/w/index.php?title=Usu%C3%A1rio%3ADaniel_G_Rego%2FPerfilWiki&action=edit) com o arquivo de documentação da mesma versão.
4. Use o instalador para preparar o carregador da própria conta e os blocos pessoais. Confira os destinos, o texto completo e os resumos antes de qualquer cópia manual.
5. Depois da publicação manual dos trechos pessoais, encerre as abas antigas e reabra a página em modo de leitura para iniciar a consulta.

A configuração com `appearance` exige o programa 1.1.0. O programa 1.0.1 não conhece esse campo, por isso atualizar somente o carregador pessoal não basta. O campo `displayName` exige o programa 1.1.1. O contador de dias com edições, os fundos personalizados, a ordem dos blocos e o convite único exigem o programa 1.2.0. As caixas de edições em artigos, edições em discussões, meses com edições e dia com mais edições, o espaçamento Amplo e a escolha de colunas exigem o programa 1.3.0. As caixas de edições nos últimos 30 dias, média por dia ativo, anos com edições e mês com mais edições exigem o programa 1.4.0. As caixas de agradecimentos enviados, média de bytes acrescentados por edição, maior acréscimo e maior remoção em uma edição exigem o programa 1.5.0. O alinhamento do nome, as informações pessoais e a data opcional de criação da conta exigem o programa 1.6.0. As ligações internas nos campos, a escolha do bloco para essas informações e o período personalizado exigem 1.7.0. A posição individual dos campos, a foto, as informações na mesma linha e cinco colunas exigem 1.8.0. Os estilos e a documentação precisam acompanhar a mesma distribuição.

## Antes de começar

O programa compartilhado precisa estar instalado no destino do índice antes de usar a importação. Os estilos públicos usam a folha existente `Usuário:Daniel G Rego/RitmoPU-estilos`, que já tem o modelo de conteúdo "CSS higienizado". A instalação compartilhada não exige criar uma folha de estilos nem mudar o modelo de conteúdo de uma página.

Informe o nome da sua conta no instalador. Ele prepara os destinos do `common.js` e da página ou subpágina escolhida e coloca a conta nas marcas dos blocos iniciais. Os botões de copiar e baixar passam a usar os trechos preparados para sua conta. Se abrir os arquivos `.wiki` diretamente, substitua essa marca manualmente pelo nome exato da conta.

## 1. Carregar o programa

Entre na sua conta da Wikipédia em português e abra [seu common.js](https://pt.wikipedia.org/wiki/Especial:Minha_p%C3%A1gina/common.js?action=edit). Preserve o código que já estiver no arquivo.

Copie o carregador pessoal preparado na última tela do instalador e acrescente-o uma só vez ao `common.js`. Esse trecho conserva a conta, o fuso e as escolhas de aparência antes de importar o programa. A conta conectada e o dono da página precisam corresponder à conta configurada. Uma importação isolada faria o navegador buscar o programa também em páginas onde a rotina não será usada.

O arquivo genérico `Carregador_PerfilWiki.js` do índice de manutenção é uma alternativa para usar os padrões, sem a configuração personalizada. Ele pode iniciar a coleta na página da própria conta, mas não recupera as escolhas da prévia. Para conservar foto, campos, cores e seleção das caixas, use o carregador preparado pelo instalador.

O instalador já prepara a configuração antes do carregador. Em uma configuração escrita manualmente, o fuso pode ser escolhido assim:

```javascript
window.PerfilWikiConfig = {
    user: 'SEU_NOME_DE_USUARIO',
    displayName: 'SEU_NOME_DE_EXIBICAO',
    timeZone: 'America/Sao_Paulo'
};
```

Quando o arquivo preparado pelo instalador já contiver `window.PerfilWikiConfig`, altere esse objeto no próprio trecho. Evite uma segunda configuração que sobrescreva as opções escolhidas e mantenha uma só chamada de importação.

Você também pode informar `user`, com o nome exato da própria conta. Sem esse campo, o programa usa o nome da conta conectada. Sem `timeZone`, usa o fuso obtido no navegador, com UTC como alternativa quando esse fuso não puder ser obtido.

O campo opcional `displayName` muda somente o nome mostrado nos títulos. Retire-o ou deixe-o vazio para usar o nome da conta. Mantenha a conta real em `user`, mesmo quando os dois nomes forem diferentes.

O nome "Daniel G Rego" no endereço de importação dentro do carregador aponta para o programa compartilhado e deve permanecer ali. Ele não escolhe de quem serão os números.

## 2. Colocar as caixas e o painel na página

Abra [sua página de usuário](https://pt.wikipedia.org/wiki/Especial:Minha_p%C3%A1gina?action=edit) em "Editar código-fonte". Use o trecho completo preparado pelo instalador para conservar a disposição integrada e suas escolhas. Os trechos individuais do índice de manutenção continuam disponíveis para quem conserva uma disposição anterior. Preserve os outros textos e as categorias.

A folha de estilos compartilhada é carregada com:

```wikitext
<templatestyles src="Usuário:Daniel G Rego/RitmoPU-estilos" />
```

O nome "RitmoPU-estilos" é mantido porque essa folha já atende ao TemplateStyles e tem as mesmas regras de aparência usadas pelo PerfilWiki. Não troque esse destino por uma página nova em wikitexto.

Use uma só ocorrência de cada identificador fornecido pelo índice. O painel de atividade mantém o identificador `dan-pu-ritmo`, e as caixas mantêm os identificadores compatíveis com a apresentação anterior.

Comece com os blocos que aguardam consulta. Copiar números publicados na página de outra pessoa não prepara a sua conta.

O padrão usa as caixas dentro da atividade. Escolha outra disposição no instalador se quiser posições independentes. Não envolva toda a página em um novo bloco para instalar a ferramenta.

Salve, feche as abas antigas da Wikipédia e abra a versão de leitura da sua página. A primeira coleta pode precisar de mais lotes. Mantenha a página aberta e visível enquanto o andamento aparece.

## Personalização no programa e na cópia pública

Os campos opcionais `location`, `customFields` e `photo` ficam ao lado de `user`, fora de `appearance`. Cada informação adicional pode receber `placement`, e `appearance.profilePlacements` escolhe as posições individuais dos outros campos. A posição `hidden` oculta o campo sem apagar o valor do carregador preparado. Esse texto será público se houver uma futura publicação manual no common.js. O alinhamento dessas informações acompanha `nameAlignment`, que começa à esquerda. `showAccountCreated` começa como `false`.

Cada rótulo e cada item de uma informação adicional pode usar sua própria cor ou seguir "Padrão do perfil". Essa escolha fica no objeto correspondente de `customFields` e acompanha a prévia, o arquivo de escolhas e os trechos preparados. Para retomar a personalização, use "Editar painel" ou carregue o JSON guardado, sem precisar reescrever as cores à mão.

O objeto `window.PerfilWikiConfig.appearance` guarda o tema, a cor de destaque, o espaçamento, o número máximo de colunas, o alinhamento e a ordem dos contadores. Também escolhe as caixas destacadas e a cor de fundo delas, os blocos visíveis, sua ordem no modo conjunto, a posição conjunta ou separada e a aba inicial. O [guia de personalização](CUSTOMIZACAO.md) traz o formato completo e os valores aceitos.

A sessão da própria conta aplica essas escolhas ao renderizar o painel. Os downloads dos contadores e da atividade levam as mesmas opções para a cópia pública, com os identificadores e a identidade da conta. Mudar a configuração não substitui o wikitexto já salvo na página. Para os visitantes receberem a nova aparência, é preciso baixar os trechos novamente e atualizar os blocos correspondentes manualmente.

No modo conjunto, o instalador prepara um agrupamento próprio da conta para que a ordem dos blocos possa ser aplicada. Preserve esse agrupamento se quiser alternar entre caixas primeiro e atividade primeiro pela configuração. No modo separado, coloque os trechos nos pontos desejados da página. A rotina conserva os textos entre eles e não move esses blocos de uma posição para outra.

O convite "Gostou deste painel? Veja como adicionar à sua página de usuário." aparece uma vez, depois do último bloco visível. Ele continua disponível quando somente as caixas são usadas.

## 3. Atualizar a cópia que os visitantes veem

Na primeira visita sem um cache aproveitável, a coleta começa pela identidade pública e segue o histórico em lotes. O total global de contribuições e a criação mais antiga podem aparecer antes das caixas que dependem de todo o histórico da ptwiki. Essas caixas permanecem pendentes até a conferência terminar. Uma conta com muitas edições pode precisar de minutos e de mais de um ciclo, conforme as pausas dos serviços. Mantenha a página aberta e visível para continuar, sem iniciar atualizações manuais repetidas.

Uma coleta grande das visualizações pode começar mostrando até dez artigos já conferidos, com "Ordem provisória". Os demais artigos ainda podem alterar essa ordem, e o total do período permanece pendente até a cobertura terminar. Uma lista inicial visível não significa que todas as abas já estejam concluídas. Cada aba respeita o mesmo começo depois da primeira edição em cada artigo, e a soma final continua abrangendo todos os artigos elegíveis.

Quando a consulta terminar, use a opção de download. As caixas e o painel de atividade podem ser exportados em trechos separados. Abra o arquivo em um editor de texto, confira a conta e a data e copie o trecho inteiro.

Substitua somente o bloco correspondente na página. Não cole um segundo painel junto do primeiro. Se o trecho baixado já tiver a chamada dos estilos, mantenha uma só chamada para aquele conjunto.

Use "Mostrar previsão" e confira a página antes de salvar. O download e a atualização da sua sessão não salvam a página pública.

## Migrar do RitmoPU e do EstatisticasPU

Guarde uma cópia do trecho atual do seu `common.js`. Retire apenas os blocos de configuração e carregamento antigos de RitmoPU e EstatisticasPU, inclusive carregadores que importem esses dois programas por outra função. Coloque a chamada única do PerfilWiki e a configuração que escolher.

Preserve o RevisaWiki e os outros scripts do arquivo. Não substitua o `common.js` inteiro pelo exemplo deste guia.

Atualize a chamada dos estilos e os blocos da página pelos trechos do índice. Os identificadores compatíveis permitem manter a apresentação das caixas e do painel de atividade. A ferramenta confere a identidade dos dados antes de reaproveitá-los. Se um conjunto antigo não for aceito, uma nova coleta precisa terminar antes de você atualizar a cópia pública.

Depois de salvar, feche as abas antigas para encerrar os programas anteriores. Reabra sua página e confira a conta, o fuso e o andamento da consulta. Baixe os trechos atualizados e publique manualmente cada bloco que desejar substituir.

## Corrigir uma instalação da versão 1.0.0

Se a página exibir o erro de que `Usuário:Daniel G Rego/PerfilWiki-estilos` precisa ter o modelo "CSS higienizado", abra o código-fonte da sua página e troque todas as chamadas desse destino por:

```wikitext
<templatestyles src="Usuário:Daniel G Rego/RitmoPU-estilos" />
```

Essa troca conserva os textos, os números e a disposição dos blocos. Use "Mostrar previsão" para conferir a aparência antes de salvar. O pacote de correção traz a página pessoal preparada quando essa opção está indicada no índice.

Atualize também o programa compartilhado para a versão 1.0.1 pelo índice. Se a sua configuração contiver `stylesPage`, confira se ela aponta para `Usuário:Daniel G Rego/RitmoPU-estilos`, ou retire esse campo para usar o destino padrão. Isso impede que um download futuro recoloque a chamada incorreta. Feche as abas antigas e reabra a página depois da atualização.

Não é necessário mudar o modelo de conteúdo da página criada por engano para recuperar a apresentação. A folha compartilhada válida já está disponível.

## Manter uma cópia própria do programa

A importação compartilhada atende à instalação comum. Quem quiser hospedar apenas o JavaScript pode publicar o arquivo completo em uma subpágina `.js` da própria conta e continuar usando a folha compartilhada. Ajuste a única chamada de importação dentro do carregador completo, preservando as verificações de conta e página.

Para hospedar também os estilos, a página de destino precisa ter o modelo de conteúdo "CSS higienizado", cujo nome técnico é `sanitized-css`. Criar uma subpágina no domínio "Usuário" com o final `.css` produz CSS comum e não resolve essa exigência do TemplateStyles. Mudar o modelo exige a permissão `editcontentmodel`. Se a conta não tiver essa permissão, peça a um administrador para preparar a folha ou continue usando a folha compartilhada.

Depois que a folha própria estiver pronta, ajuste a chamada de `templatestyles` e o campo opcional `stylesPage` em `PerfilWikiConfig`. O campo opcional `documentationPage` escolhe o destino da documentação nos trechos exportados. Esses campos recebem títulos completos de páginas da Wikipédia, e não URLs.

Use os arquivos completos da mesma versão. O CSS foi preparado para TemplateStyles. Uma folha aceita pelo navegador pode ter propriedades ou seletores recusados pela extensão.

## Se algo não carregar

| O que aparece | O que conferir |
| --- | --- |
| O bloco ainda aguarda consulta | Conta conectada, configuração antes da importação e versão de leitura da própria página |
| O total global já apareceu, mas outras caixas ainda aguardam | O histórico local ou os registros de outros projetos ainda estão em coleta, com a página aberta e visível |
| As primeiras visualizações dizem "Ordem provisória" | Há artigos já conferidos, mas a cobertura ainda não permite fechar a classificação e o total |
| "Editar painel" abre uma página ausente | A mesma versão do instalador precisa estar hospedada no endereço fixo do GitHub Pages |
| O painel aparece sem os estilos | Chamada de `templatestyles` para `Usuário:Daniel G Rego/RitmoPU-estilos` |
| A página pede "CSS higienizado" | [Correção da chamada da versão 1.0.0](#corrigir-uma-instalação-da-versão-100) e eventual campo `stylesPage` na configuração |
| A coleta ainda está em andamento | Página aberta e visível, andamento dos lotes e eventual pausa pedida pelo serviço |
| Os visitantes veem números antigos | Download e substituição manual dos blocos da página |
| O dia muda no horário inesperado | `timeZone`, pois a atividade usa o fuso escolhido e as visualizações usam UTC |
| Abas ou expansões não respondem | Painel único, identificadores sem duplicação e abas antigas encerradas |

## Retirar a ferramenta

Remova do `common.js` a configuração do PerfilWiki e a chamada que o importa. Feche as abas antigas. Se também quiser retirar a apresentação pública, apague somente as caixas e o painel da página de usuário.

O restante da página e os outros scripts podem permanecer. A ferramenta não apaga a página nem altera sua contagem oficial de edições.
