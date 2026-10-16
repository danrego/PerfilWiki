# PerfilWiki

O PerfilWiki reúne as caixas de estatísticas e o painel de atividade do RitmoPU e do EstatisticasPU para páginas de usuário da Wikipédia em português. A página mantém as caixas, o calendário, as metas de dias seguidos e as listas de artigos com suas visualizações.

A distribuição **1.20.0, de 15 de outubro de 2026**, reúne o programa e o instalador para conferência e instalação manual. As mudanças de cada versão ficam no [histórico](CHANGELOG.md), e os testes executados ficam no relatório da versão. A ferramenta compartilhada na Wikipédia só recebe a atualização quando a pessoa responsável copia e salva o código naquele projeto.

O [plano de publicação](docs/PUBLICACAO.md) explica a passagem ao GitHub e a instalação manual na Wikipédia. O [guia de privacidade](docs/PRIVACIDADE.md) informa quais dados ficam na aba, no cache e nos trechos públicos.

## Idioma e exemplos iniciais

O seletor de idioma oferece português do Brasil, português de Portugal, inglês, espanhol, francês e italiano. A escolha acompanha o instalador e os textos do painel, incluindo a apresentação de números e datas. Nomes de conta, títulos de artigos e informações pessoais permanecem como foram escritos. As páginas de documentação técnica deste pacote continuam em português do Brasil.

A configuração guarda essa escolha em `appearance.language`, com os valores `pt-BR`, `pt-PT`, `en`, `es`, `fr` e `it`. Uma configuração antiga sem esse campo usa `pt-BR`. O idioma é uma opção de apresentação e não muda a identidade do cache ou as regras das métricas.

Novas escolhas começam no fuso de Brasília, `America/Sao_Paulo`, com Belo Horizonte e UFMG como sugestões nos campos. Esses exemplos não são preenchidos como dados da pessoa. Configurações importadas mantêm o fuso e os textos que já continham.

Quando existe um contexto da própria ptwiki com `wgUserName`, o instalador aproveita a conta da página e dispensa sua digitação. Isso não consulta um login. O botão "Editar painel" da sessão dona do painel pode transmitir a configuração ao instalador hospedado depois de um clique. Abrir o instalador diretamente em um servidor local ou no GitHub Pages conserva o campo manual, pois esse endereço não consegue ler o login da Wikipédia.

## Conteúdo pessoal depois do painel

Em "Textos e projetos", na primeira etapa, acrescente blocos para os textos que deseja manter abaixo das visualizações, como suas metas, projetos ou uma declaração sobre conflito de interesses. Cada bloco tem um título e um campo de wikitexto. Você pode mudar a ordem ou remover um bloco antes de preparar a página. A ferramenta não redige nem presume uma declaração sobre você.

O trecho completo conserva o wikitexto digitado, incluindo ligações, listas e predefinições. A prévia local mostra apenas uma aproximação da formatação, sem executar HTML ou predefinições e sem consultar a Wikipédia para renderizar o texto. Tabelas podem ser conferidas como código em uma área recolhível. Confira o resultado com "Mostrar previsão" quando fizer uma futura edição manual. Os blocos ficam fora da parte que atualiza os números, para que uma nova coleta ou um download do painel não os substitua.

## Voltar para editar suas escolhas

Depois de personalizar, use "Ver painel" para experimentar o resultado sem os controles de ajuste. O botão "Editar painel" abre a personalização com a foto, as cores, os contadores e os textos que você já escolheu, sem precisar baixar ou importar um arquivo. Esse caminho funciona na mesma aba local e mantém as escolhas na sessão do navegador por até 24 horas desde a última gravação. O endereço contém apenas um identificador aleatório, sem o nome da conta nem seus textos.

Se o navegador impedir o armazenamento, você ainda pode alternar entre o painel e os ajustes na aba aberta, mas recebe um aviso de que recarregar pode perder as escolhas. Para conservar uma cópia além dessa sessão, "Baixar minhas escolhas" e "Carregar minhas escolhas" continuam disponíveis. O JSON guarda as opções e os blocos de texto presentes no instalador.

Na sessão da própria conta, o programa 1.20.0 também prepara "Editar painel" para abrir o instalador em `https://danrego.github.io/PerfilWiki/INICIO.html`, com as escolhas atuais. Essa passagem depende de o instalador da mesma versão estar publicado e acessível naquele endereço. A abertura acontece somente depois do clique. As janelas conferem o endereço, a origem e um identificador temporário antes de transmitir os dados. O endereço leva esse identificador, sem o nome da conta ou suas escolhas.

Depois do clique, uma consulta pública pode trazer o código-fonte e o número da revisão da página para preparar um rascunho. O instalador só troca automaticamente a área do painel quando encontra um par único de marcadores reconhecidos. Uma página antiga sem esses marcadores pede uma substituição manual e mantém o original para conferência. Metas, categorias e textos fora dessa área permanecem no rascunho. Os textos pessoais escritos na página não são reconstruídos como campos de personalização.

Confira o rascunho, copie os trechos e use "Mostrar previsão" e o salvamento normal da Wikipédia para aplicar a alteração. O botão não salva páginas. O JSON continua disponível como cópia de segurança, e o download de escolhas feito na própria conta guarda a configuração sem recuperar os textos pessoais da página.

## Foto, capa e fundo do topo

Em "Seu perfil", a foto pode ficar em "No topo, padrão", "Na atividade", "Topo e atividade" ou "Ocultar". A área antes chamada "cabeçalho" passa a ser "atividade" nos controles, para distingui-la do topo. As configurações anteriores com outras posições explícitas continuam aceitas pelo programa.

Junto da foto, os botões de "Alinhamento da foto" escolhem "À esquerda", "Centralizado" ou "À direita". À esquerda, o padrão, a foto fica ao lado do texto. À direita, ela passa para o outro lado. No centro, ela fica acima das informações. Essa escolha é independente do alinhamento do nome e dos contadores e vale nas áreas em que a foto foi exibida. Em telas estreitas, a foto e o texto se reorganizam para caber. A capa permanece acima das informações do topo.

O tamanho da foto pode ser 64, 96, 128, 160 ou 200 pixels, com 96 pixels no início. Escolha o formato quadrado ou redondo sem mudar seu alinhamento. O recorte vale para a imagem, deixando "Ver arquivo no Commons" inteiro e legível abaixo dela. A largura se adapta a telas menores. Essas escolhas mudam a apresentação da foto, sem pedir outra imagem por causa do ajuste.

Em "Imagem de capa", escolha "Escolher arquivo do Commons" para informar uma imagem fixa, "Imagem do dia da Wikipédia, para visitantes" para acompanhar a escolha diária da Wikipédia em português, ou "Imagem do dia do Commons, na sua sessão" para consultar a escolha do Commons na sessão da própria conta. As duas escolhas diárias podem usar imagens diferentes. O nome do arquivo manual fica guardado ao mudar de opção. Para ficar sem capa, volte ao modo manual e deixe o nome vazio. A imagem ocupa uma faixa acima das informações do topo, com recorte central para preencher a área.

"Imagem do dia da Wikipédia, para visitantes" usa as páginas diárias que já existem na Wikipédia em português. Depois da instalação manual inicial, a data em UTC é recalculada pela própria Wikipédia, sem precisar salvar outra edição a cada dia. Os visitantes não precisam do JavaScript do PerfilWiki, de uma conta conectada ou de consultas à API pelo painel. A troca acompanha a renovação do cache da Wikipédia, sem garantir a mudança à meia-noite nem trocar a imagem de uma aba que já está aberta. Se a página diária ainda não existir, a capa mostra um aviso discreto no lugar de um arquivo inventado. O arquivo exibido conserva sua ligação nativa para consultar os créditos e a licença. A opção usa o [calendário de imagens em destaque da Wikipédia em português](https://pt.wikipedia.org/wiki/Wikip%C3%A9dia:Imagem_em_destaque) e as [palavras mágicas de data do MediaWiki](https://www.mediawiki.org/wiki/Help:Magic_words#Date_and_time).

"Imagem do dia do Commons, na sua sessão" conserva o funcionamento anterior. O programa pode consultar a imagem pela data UTC na sessão da própria conta e conserva a última imagem conferida se a consulta falhar. Os visitantes recebem a imagem da última cópia salva manualmente nesse modo. No instalador, todas as capas continuam ilustrativas e locais, sem buscar imagens ou enviar seu código à Wikipédia. O modo da Wikipédia prepara uma chamada dinâmica para o calendário existente, e o modo do Commons começa com um aviso de espera até haver dados conferidos.

"Cor de fundo do topo" usa o mesmo seletor dos outros ajustes e começa em branco. Na opção automática de texto, o programa calcula cores legíveis sobre esse fundo. Uma cor de texto escolhida manualmente permanece como foi informada. O fundo vale somente para o topo, sem mudar o fundo das caixas ou da atividade. Foto, capa e cores acompanham a prévia e os trechos preparados.

"Cor do nome" fica junto do nome de exibição, e "Cor dos rótulos" e "Cor das informações" ficam junto das informações adicionais. Cada controle permite manter "Automática" ou escolher uma cor. A escolha vale para os campos do perfil nas áreas em que aparecem, incluindo suas ligações, sem mudar os números das caixas. As cores escolhidas são mantidas como foram informadas. Confira a leitura sobre os fundos que usa ou volte a "Automática" para recuperar as cores preparadas pelo painel.

Junto de cada rótulo, escolha "Cor do rótulo" para mudar só aquele título. Cada item tem seu próprio controle "Cor do item", por isso `[[Universidade Federal de Minas Gerais|UFMG]]` e `[[Universidade de São Paulo|USP]]` podem ter cores diferentes sob "Formação". "Padrão do perfil" acompanha a cor geral dos rótulos ou das informações, inclusive quando ela muda depois. Escolher uma cor própria mantém esse campo independente. A cor vale também para as ligações e acompanha o campo nas áreas em que ele aparece. Ao remover um item, os que ficam conservam suas cores. Mudar os separadores ou a disposição também conserva essas escolhas.

Junto de "Foto do Wikimedia Commons", "Envie uma foto" abre o [assistente de envio do Commons](https://commons.wikimedia.org/wiki/Special:UploadWizard?uselang=pt-br) em outra aba. O envio acontece no Commons, seguindo suas [orientações para carregar arquivos](https://commons.wikimedia.org/wiki/Commons:Upload). Depois de concluir essa etapa, copie o nome do arquivo para o campo da foto, pois o instalador não faz o envio nem o preenchimento automático.

## Itens de uma informação e campos no topo

Em "Seu perfil", os ajustes de tamanho e alinhamento ficam junto do nome de exibição. O tamanho pode ser 16, 20, 24, 28, 32 ou 36 pixels, com 24 no início. "Alinhamento do nome de exibição" usa botões com ícones de linhas, identificados como "À esquerda", "Centralizado" e "À direita", com a escolha ativa visível e nomes para leitores de tela. Cada rótulo tem seu próprio controle de "Disposição das informações", mesmo quando contém só um item, para escolher uma linha, linhas separadas ou marcadores sem mudar as outras informações. "Alinhamento dos contadores" continua em "Disposição", perto dos ajustes da grade das caixas, sem mudar o alinhamento do perfil.

Uma informação adicional pode reunir até oito itens sob o mesmo rótulo. Em "Formação", por exemplo, coloque `[[Universidade Federal de Minas Gerais|UFMG]]` no primeiro item e `[[Universidade de São Paulo|USP]]` no segundo. "Adicionar item" cria outro campo sem repetir o rótulo. Escolha itens na mesma linha, com barra vertical, ponto central ou espaço, ou use linhas separadas, com ou sem marcadores. Os itens passam para outra linha quando falta largura. Cada item aceita até 160 pontos de código Unicode, e o painel mantém até três grupos com rótulos de até 40 pontos.

Os campos que usam "Padrão" começam no topo, acima da atividade. Os campos de texto também podem ficar na atividade ou acima das caixas, em uma combinação dessas áreas, ou ocultos. A escolha antiga "Nos dois blocos" conserva a atividade e as caixas. Configurações com uma posição anterior explícita mantêm essa escolha, enquanto uma posição geral ausente usa o novo padrão no topo. O topo só aparece quando recebe conteúdo, sem repetir o nome por conta própria.

"Mostrar hora local" e o fuso ficam junto de "Localização", em "Seu perfil". O horário usa o fuso escolhido, sem tentar deduzi-lo do texto da cidade. Quando aparecem na mesma área, uma localização como `[[Belo Horizonte]]` fica seguida de "11:42 (UTC-3)" na mesma linha de informações, antes dos outros campos. Se tiverem posições diferentes, cada um conserva a posição escolhida. Sem uma cidade visível naquela área, o horário pode aparecer sozinho. A diferença para UTC muda com o horário de verão. O relógio usa o horário do computador e a mesma rotina que atualiza a indicação da última edição, sem outra consulta de dados.

Na sessão da própria conta com o programa ativo, o horário acompanha os minutos. A cópia salva para visitantes mantém o horário do momento em que o trecho foi preparado, pois o programa não inicia a rotina na sessão de outras pessoas. Nos dois casos, a linha mostra apenas a hora e a diferença para UTC. A dica informa o fuso e a data da conferência, e o atributo de data conserva o instante em formato ISO. Nos downloads, os campos do topo acompanham o painel integrado ou o primeiro bloco visível nas disposições anteriores. Substitua essa parte junto com o bloco, mantendo um só topo.

As configurações anteriores com um único `value` continuam aceitas, incluindo `{label: 'Pesquisa', value: ''}` para mostrar só o rótulo. A forma curta `{label: 'Pesquisa'}` também é aceita. Um grupo com `values: []` mantém seu rótulo e seus ajustes de disposição. Para escrever uma lista manualmente, use `values`, sem juntar as duas formas no mesmo grupo. Um exemplo é `{ label: 'Formação', values: ['[[Universidade Federal de Minas Gerais|UFMG]]', '[[Universidade de São Paulo|USP]]'], layout: 'inline', separator: 'pipe', placement: 'top' }`. As outras disposições são `lines` e `bullets`, e os outros separadores são `dot` e `space`. A posição do horário fica em `appearance.profilePlacements.localTime`, sua exibição em `appearance.showLocalTime`, e o tamanho do nome em `appearance.nameFontSize`.

Na versão 1.18.0, `customFields` também pode guardar `labelColor`, `valueColor` para o valor único e `valueColors` para a lista de itens. Uma string vazia segue a cor geral do perfil. Uma cor como `#3366cc` muda só aquele texto e suas ligações. O [guia de personalização](docs/CUSTOMIZACAO.md#cores-de-cada-rótulo-e-item) traz um exemplo com duas universidades em cores diferentes.

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

## Prévia e instalação

"Cor do painel" fica em "Disposição", junto das escolhas gerais do painel. "Cor do destaque das caixas" fica perto das colunas e do alinhamento dos contadores. A estrela da caixa continua escolhendo quais recebem o destaque. As cores dos campos ficam em "Seu perfil", junto dos textos que mudam, e o fundo do topo fica junto da capa. O grupo separado "Cores e destaques" foi retirado.

Abra o instalador `INICIO.html` pelo servidor local para percorrer as duas telas de personalização e instalação. A prévia usa dados inventados e os mesmos componentes de apresentação do programa. Digitar uma conta não consulta o histórico dela.

Na primeira etapa, abra "Seu perfil" na coluna de ajustes. "Conta da Wikipédia" recebe o nome exato da conta que terá os dados consultados e é o único campo de perfil obrigatório, com asterisco vermelho e indicação para leitores de tela. Os campos opcionais recebem uma indicação menor e mais discreta, sem perder a legibilidade. Os seletores já começam preenchidos, e uma opção ativada pode exigir seu dado correspondente. "Nome de exibição" permite mostrar outro nome nos títulos, sem trocar a conta das consultas nem os destinos dos arquivos. Quando o instalador é executado dentro da própria Wikipédia em português, pode preencher a conta pela configuração já presente na página. No endereço local, o preenchimento continua manual. O fuso começa no horário de Brasília, preservando uma escolha já importada. A lista mostra 55 opções em oito grupos geográficos, incluindo UTC, Havaí e cidades de mais países da Europa e da Ásia, sem campo de busca. Um fuso válido já escolhido ou recebido do navegador continua disponível mesmo quando não está nessa lista.

Os campos opcionais "Localização" e "Informações adicionais" aceitam texto e ligações internas, como `[[Rio de Janeiro]]` ou `[[Rio de Janeiro|Rio]]`. A localização aceita até 120 pontos de código Unicode. Até três informações aceitam rótulos de até 40 pontos de código e até oito itens de 160 pontos cada. Esses limites contam o texto digitado inteiro, incluindo os sinais da marcação das ligações. O rótulo usa apenas texto e já aparece na prévia quando é preenchido, mesmo sem dado, sem receber dois-pontos ou uma lista vazia. HTML, predefinições e marcação malformada não são aceitos. Campos vazios ficam fora da configuração preparada e não alteram a conta consultada. Ao lado de cada campo, escolha se ele aparece nas caixas, na atividade ou nos dois blocos, ou use "Ocultar". A opção "Padrão" segue "Posição padrão das informações", que começa em "No topo". As escolhas explícitas de posição continuam guardadas. Quando só um bloco estiver visível, os campos destinados aos blocos acompanham esse bloco, sem retirar os campos do topo ou mostrar campos ocultos.

A posição do nome, da localização, de cada informação adicional, da data de criação e da foto pode ser escolhida separadamente. "Ocultar" retira o campo da apresentação, enquanto "Padrão" segue a posição geral, inicialmente no topo. Cada informação tem seus próprios ajustes de itens e separadores, com quebra conforme a largura disponível. A configuração anterior da disposição geral continua aceita pelo programa, mas esse controle saiu do instalador.

"Foto do Wikimedia Commons" aceita o nome de uma imagem já existente. A prévia usa uma imagem ilustrativa local, sem consultar o Commons ou enviar arquivos. O código preparado usa o nome escolhido e acrescenta "Ver arquivo no Commons" para consultar os créditos e a licença. Um campo oculto continua no carregador preparado, cujo texto será público se houver uma futura publicação manual no common.js.

O nome e essas informações começam alinhados à esquerda e podem ficar no centro ou à direita, independentemente do alinhamento dos números nas caixas. "Mostrar a data de criação da conta" fica desmarcado no início. Ao marcar, o painel usa a menor data pública entre o registro global e os registros das contas locais vinculadas. A data aparece por extenso no idioma escolhido, com dia, mês e ano em UTC. Se faltar algum registro, o texto avisa que a data é a mais antiga disponível entre os dados consultados. Sem nenhuma data, o painel informa que ela está indisponível. A caixa "Na Wikipédia" usa essa mesma data conferida para contar os anos completos, mesmo que a conta local da ptwiki tenha sido criada depois.

Em "Personalize seu painel", os ajustes ficam nos grupos "Seu perfil", "Disposição" e "Conteúdo", que podem ser recolhidos. Em telas largas, a coluna tem sua própria rolagem para manter a prévia à vista. As oito caixas anteriores continuam selecionadas entre 24 opções. Use "Adicionar caixas" na prévia para escolher os contadores. Em cada caixa, a estrela aplica ou retira o destaque e o botão × remove a caixa. Use a alça para arrastar ou, com o foco nela, pressione esquerda ou cima para antecipar a caixa e direita ou baixo para colocá-la depois. O conteúdo fica alinhado à direita por padrão, com opções à esquerda e ao centro. As caixas e a atividade podem ficar juntas, na ordem escolhida, ou em posições independentes. Esses controles pertencem apenas ao instalador e não entram no painel exportado. A prévia usa somente os cabeçalhos do próprio painel, sem repetir o nome num cabeçalho fictício. As ligações internas dos campos mantêm sua aparência, mas os cliques não abrem outra página durante o teste local.

A caixa tracejada "Adicionar caixa +" ocupa a posição seguinte da grade enquanto houver algum contador disponível. Com sete caixas, ela ocupa a oitava posição. Clique nela ou use Enter ou Espaço para abrir o mesmo seletor de "Adicionar caixas", que também permanece na barra da prévia. O seletor fecha por clique externo, Escape ou pelo botão de fechar. Quando a abertura partiu da caixa tracejada, o foco pode voltar a ela ao fechar. Se todos os 24 contadores já estiverem selecionados, essa caixa desaparece. Ela não recebe número, destaque ou alça e não entra nos arquivos exportados.

No modo automático, as caixas usam até cinco colunas em Compacto, quatro em Confortável e três em Amplo, quando houver largura. Também é possível escolher duas, três, quatro ou cinco colunas. A largura da tela pode reduzir o número de colunas. A paleta tem cores com nomes, um campo de cores que aceita clique e arraste, um só controle "Clarear ou escurecer" e o campo hexadecimal. O seletor fecha ao clicar fora, pressionar Escape ou usar seu botão de fechar. O [guia de personalização](docs/CUSTOMIZACAO.md) explica cada opção.

A última tela fornece o carregador pessoal e o wikitexto real dos blocos, com os destinos, o conteúdo inteiro, os resumos de edição e os downloads. Os trechos iniciais usam "Aguardando dados". Os números da prévia nunca entram nesses arquivos. Os editores locais guardam o texto apenas na tela e não executam o carregador nem enviam uma edição.

Depois de uma futura instalação manual, "Verificar instalação" permite comparar os arquivos públicos com a distribuição local e as escolhas do instalador. O botão lê o manifesto local e faz uma consulta pública para o `common.js` da conta, a página de destino, o programa compartilhado e os estilos. A leitura usa `GET` com `credentials: 'omit'`, sem login, tokens ou execução do código recebido. Ela só começa quando o botão é acionado.

O resultado separa o que confere, o que está ausente, o que está diferente e o que não pôde ser conferido. Uma falha de acesso não significa que a página não existe. A conferência lê o texto e o modelo de conteúdo das páginas. Ela não certifica que o script tenha sido executado no navegador nem que todos os serviços de estatísticas estejam disponíveis.

A etapa de instalação concentra os trechos pessoais e a conferência. Os cartões dos arquivos compartilhados ficam no índice de manutenção, acessível por "Arquivos e documentação".

O [índice de manutenção](Arquivos.html) conserva os arquivos completos do programa, dos estilos e da documentação. O [guia de instalação](docs/INSTALACAO.md) explica a ordem de atualização, os destinos e a migração. Os botões e os endereços de edição preparam uma publicação manual futura, sem confirmar que ela aconteceu.

Antes de usar estas opções na Wikipédia, o programa compartilhado, a folha de estilos e a documentação precisam receber os arquivos da mesma versão. Atualizar somente o `common.js` para uma configuração com `appearance` enquanto o programa hospedado ainda usa a versão 1.0.1 não instala a personalização.

O nome de exibição exige o programa 1.1.1. A caixa de dias com edições, os fundos personalizados, a ordem dos blocos e o convite único exigem o programa 1.2.0. As caixas de edições em artigos, edições em discussões, meses com edições e dia com mais edições, o espaçamento Amplo e a escolha de colunas exigem o programa 1.3.0. As caixas de edições nos últimos 30 dias, média por dia ativo, anos com edições e mês com mais edições exigem o programa 1.4.0. As caixas de agradecimentos enviados, média de bytes acrescentados por edição, maior acréscimo e maior remoção em uma edição exigem o programa 1.5.0. O alinhamento do nome, os campos pessoais e a data opcional de criação da conta exigem o programa 1.6.0. As ligações internas nos campos, a escolha do bloco para essas informações e o período personalizado exigem 1.7.0. A posição individual dos campos, a foto, as informações na mesma linha e a opção de cinco colunas exigem 1.8.0. Atualize os arquivos compartilhados da mesma distribuição antes de usar essas opções.

O destino padrão dos estilos permanece `Usuário:Daniel G Rego/RitmoPU-estilos`, com o modelo "CSS higienizado". Não crie uma página em wikitexto para substituí-lo. O endereço `Usuário:Daniel G Rego/PerfilWiki.js` no carregador aponta para o programa compartilhado, enquanto o campo `user` escolhe a própria conta cujos dados serão consultados.

Preserve os outros scripts do `common.js`, os textos e as categorias da página pessoal. Quem já usa RitmoPU e EstatisticasPU deve retirar somente os carregadores antigos correspondentes e manter uma só chamada do PerfilWiki. As instruções completas estão no guia.

## Seus números e a página pública

Quando você está conectado, o script consulta os dados públicos da conta configurada e atualiza sua tela. A consulta inicial busca primeiro os dados de identidade que podem ser conferidos sem percorrer todas as edições, como o total global e a criação mais antiga da conta. O histórico da ptwiki chega em lotes, e os contadores que dependem dele aguardam sua conclusão. Essa primeira passagem pode levar minutos para uma conta com muitas edições, principalmente se os serviços exigirem pausas. A coleta depende da página aberta e visível.

Os visitantes veem o conteúdo que você salvou na página. Para atualizar essa cópia, baixe o painel completo na disposição integrada ou os trechos correspondentes nas disposições anteriores, confira os arquivos e substitua o conteúdo correspondente. Use "Mostrar previsão" antes de salvar. O PerfilWiki não publica a página em seu nome.

As consultas e a cópia salva têm horários próprios. Uma consulta incompleta conserva o último resultado completo e informa que ainda faltam dados. Falha de conexão não significa zero.

Para retomar uma coleta longa, o programa conserva cópias no armazenamento do navegador, usando `localStorage` e, quando disponível, IndexedDB. O segundo permite guardar uma cópia compactada que já ultrapassou o espaço do primeiro, sem aumentar os limites aceitos pelo codec. A primeira cópia de progresso e a cópia final são gravadas, enquanto as intermediárias ficam espaçadas por pelo menos quinze segundos. Se nenhuma forma de armazenamento aceitar a cópia, um aviso informa que o progresso pode se perder ao fechar ou recarregar a página. Os dados disponíveis continuam na memória da aba e na apresentação anterior.

## O que os números contam

| Número | Onde é contado |
| --- | --- |
| Na Wikipédia | Anos completos desde a menor data pública conferida entre a conta global e as contas vinculadas |
| Contribuições | Projetos ligados à conta global |
| Agradecimentos recebidos | Projetos ligados à conta global que oferecem o registro público de agradecimentos |
| Agradecimentos enviados | Registro público da Wikipédia em português, consultado somente quando essa caixa está selecionada |
| Bytes acrescentados ou removidos, média por edição e maiores alterações | Diferenças de tamanho das revisões públicas da Wikipédia em português |
| Artigos criados | Wikipédias ligadas à conta, pelo XTools, com os filtros explicados no guia |
| Artigos diferentes editados | Wikipédia em português, apenas artigos existentes, sem redirecionamentos |
| Reversões | Wikipédia em português, pelas etiquetas de reversão aceitas |
| Predefinições, módulos e scripts criados | Wikipédia em português, com conferência da criação e do tipo atual da página |
| Calendário, dias seguidos, dias, meses e anos com edições, dia e mês com mais edições, edições nos últimos 30 dias e média por dia ativo | Edições públicas da Wikipédia em português, no fuso escolhido |
| Edições em artigos e em discussões | Histórico público da Wikipédia em português, separado pelo grupo da página |
| Visualizações | Artigos editados na Wikipédia em português |

As visualizações começam no primeiro dia completo em UTC depois da sua primeira edição pública em cada artigo. As abas de 30 dias, 90 dias e 12 meses respeitam esse início. O total acumulado usa a série disponível desde 1 de julho de 2015. Em "Personalizado", escolha o início e o fim entre essa data e o último dia completo em UTC, incluindo os dois dias na soma. Somente a sessão do dono da página com o JavaScript ativo oferece o ajuste das datas. Os visitantes recebem o intervalo e os números salvos no wikitexto.

As caixas de dias, meses e anos com edições, dia e mês com mais edições, edições nos últimos 30 dias e média por dia ativo usam as datas do histórico público no fuso escolhido e seguem as mesmas exclusões do calendário. A média divide as edições pelos dias em que houve atividade e usa uma casa decimal. Os anos são anos do calendário que tiveram edições, sem exigir uma sequência entre eles. As caixas de edições em artigos e em discussões separam o histórico pelo grupo da página. Os novos valores aguardam o histórico completo e reaproveitam os dados já consultados.

A média de bytes acrescentados divide todos os acréscimos pelo número de edições públicas locais, incluindo as edições que removeram conteúdo ou não mudaram o tamanho. O maior acréscimo e a maior remoção usam a maior diferença de uma única edição em cada sentido. Essas caixas aguardam a cobertura completa das diferenças de tamanho e reaproveitam o histórico já consultado.

O convite "Gostou deste painel? Veja como adicionar à sua página de usuário." aparece uma só vez, depois do último bloco visível. Ele também aparece quando somente as caixas são usadas.

Cada soma abrange todos os artigos aceitos. A lista mostra até 500 por período, com dez no início e mais cem por expansão. Os acessos podem se repetir e não medem pessoas únicas nem visitas causadas pela sua edição.

Em uma primeira coleta grande, a lista pode começar com até dez artigos cujas visualizações já foram conferidas, enquanto a classificação dos demais continua. "Ordem provisória" informa que outros artigos ainda podem entrar acima deles. O total do período permanece pendente até completar a cobertura de todos os artigos elegíveis. Esse começo antecipado não reduz o alcance da soma nem transforma a lista inicial em um top dez definitivo. As séries de milhares de artigos e os períodos mais antigos ainda podem exigir muitas consultas e continuar por bem mais tempo que o preenchimento inicial das caixas.

## Código e dados

O programa faz consultas públicas e guarda resultados no navegador. Código e documentação usam [CC BY-SA 4.0](LICENSE). Leia [como os dados são usados](docs/PRIVACIDADE.md) e [as origens e os créditos](docs/LICENCAS_E_CREDITOS.md).

A [arquitetura](docs/ARQUITETURA.md) explica os módulos e o histórico compartilhado. O [guia de testes](docs/TESTES.md) separa os contratos locais das consultas reais e dos testes de navegador.

Os dados de edições vêm da [API do MediaWiki](https://www.mediawiki.org/wiki/API:Usercontribs). As visualizações usam a [API de estatísticas da Wikimedia](https://doc.wikimedia.org/generated-data-platform/aqs/analytics-api/reference/page-views.html). As regras de cada contador precisam ser lidas junto do alcance indicado na tabela acima.
