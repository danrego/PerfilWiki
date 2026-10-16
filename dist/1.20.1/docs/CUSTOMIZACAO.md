# Personalizar o PerfilWiki

O instalador da versão 1.20.0 prepara a aparência dos oito contadores padrão, das caixas opcionais e do painel de atividade sem mudar as regras das contagens. Esta versão ainda é um candidato local, e as opções só poderão ser usadas na Wikipédia depois da atualização manual do programa compartilhado e dos estilos.

## Idioma e exemplos iniciais

O seletor de idioma oferece português do Brasil, português de Portugal, inglês, espanhol, francês e italiano. A escolha acompanha o instalador e os textos do painel, incluindo a apresentação de números e datas. Nomes de conta, títulos de artigos e informações pessoais permanecem como foram escritos. As páginas de documentação técnica deste pacote continuam em português do Brasil.

A configuração guarda essa escolha em `appearance.language`, com os valores `pt-BR`, `pt-PT`, `en`, `es`, `fr` e `it`. Uma configuração antiga sem esse campo usa `pt-BR`. O idioma é uma opção de apresentação e não muda a identidade do cache ou as regras das métricas.

Novas escolhas começam no fuso de Brasília, `America/Sao_Paulo`, com Belo Horizonte e UFMG como sugestões nos campos. Esses exemplos não são preenchidos como dados da pessoa. Configurações importadas mantêm o fuso e os textos que já continham.

Quando existe um contexto da própria ptwiki com `wgUserName`, o instalador aproveita a conta da página e dispensa sua digitação. Isso não consulta um login. Uma abertura por "Editar painel" pode receber as escolhas da sessão dona do painel por uma troca entre janelas. Abrir diretamente um servidor local ou o GitHub Pages mantém o campo manual, pois o endereço externo não consegue ler o login da Wikipédia.

## Editar as escolhas sem um arquivo

Use "Ver painel" depois de fazer os ajustes para abrir uma simulação local sem alças, estrelas ou campos de edição. No painel, "Editar painel" volta à personalização com as escolhas atuais, incluindo foto, cores, contadores, ordem, posição dos campos, fuso e textos pessoais. Não é preciso baixar ou importar JSON para alternar entre essas duas telas.

As escolhas ficam na mesma aba e podem ser recuperadas ao recarregar enquanto a sessão local existir, por até 24 horas desde a última gravação. O endereço recebe apenas um identificador aleatório, sem nome de conta ou conteúdo pessoal. Se o navegador impedir o armazenamento, o painel e os ajustes continuam funcionando na aba aberta, com um aviso de que o recarregamento não poderá recuperar as escolhas. Um endereço vencido ou sem a cópia correspondente informa o problema e volta à personalização.

Na sessão da própria conta, a versão 1.20.0 prepara "Editar painel" para abrir o instalador em `https://danrego.github.io/PerfilWiki/INICIO.html` e transmitir as escolhas atuais depois de conferir as duas janelas. A hospedagem da mesma versão precisa estar acessível para concluir essa passagem. O endereço contém apenas um identificador temporário, sem os campos pessoais. O controle não aparece para visitantes nem inicia consultas ao instalador antes do clique.

O programa também pode consultar o código-fonte público da página depois do clique, para conservar o texto anterior no rascunho de instalação. Um par único de marcadores permite substituir somente a área do painel. Sem esses marcadores, ou quando há ambiguidade, a ferramenta apresenta o bloco novo para uma substituição manual. O restante do código-fonte permanece disponível para conferência, sem transformar seus textos pessoais em campos do instalador. Se a consulta falhar, as escolhas podem abrir mesmo assim, com aviso para preservar o conteúdo manualmente.

Depois de personalizar, confira o rascunho e copie os trechos para o editor da Wikipédia. A previsão e o salvamento continuam sendo feitos pela pessoa, sem publicação automática.

"Baixar minhas escolhas" e "Carregar minhas escolhas" continuam disponíveis para guardar uma cópia fora da sessão ou retomar um arquivo anterior. Essa alternativa conserva o mesmo processo de validação antes de substituir os campos.

## Blocos de conteúdo pessoal

Em "Textos e projetos", os blocos abaixo das visualizações acomodam textos maiores que os campos do perfil, como metas, projetos ou uma declaração escrita pela própria pessoa. Cada bloco tem um título de texto simples e um corpo em wikitexto. O instalador permite acrescentar, mudar a ordem e remover até oito blocos. O limite é de 100 caracteres por título, 50.000 por corpo e 200.000 no total dos corpos. A marcação digitada faz parte desses limites.

A prévia local aproxima parágrafos, ligações, negrito, listas e títulos. Predefinições e HTML não são executados, e podem aparecer como texto. Tabelas podem ser conferidas como código em uma área recolhível. O botão "Editar" de cada bloco volta ao campo correspondente no instalador. O wikitexto completo permanece no trecho preparado. Confira sua apresentação na previsão do editor da Wikipédia quando fizer uma futura atualização manual.

Essas escolhas pertencem ao instalador, no campo `contentSections`, e ficam fora de `window.PerfilWikiConfig`. Um exemplo para um arquivo de escolhas é:

```json
{
  "contentSections": [
    {
      "title": "Metas e projetos",
      "content": "* Revisar artigos sobre [[História]].\n* Organizar minhas leituras."
    },
    {
      "title": "Sobre minha participação",
      "content": "Escreva aqui o texto que deseja publicar."
    }
  ]
}
```

Esse exemplo mostra somente o campo dos textos, e não é um arquivo completo para importar. Use "Baixar minhas escolhas" para obter o formato completo e "Carregar minhas escolhas" para retomá-lo. O arquivo do instalador conserva seus textos e suas opções. A cópia baixada pela ferramenta na própria conta contém a configuração, sem recuperar o conteúdo que foi editado na página. Os blocos de texto ficam fora das áreas atualizadas, de modo que as coletas e os downloads de métricas não os reescrevem.

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

## Cores de cada rótulo e item

Desde 1.18.0, `labelColor` escolhe a cor do rótulo de cada objeto de `customFields`, enquanto `valueColor` escolhe a cor de um único `value`. Na forma com `values`, `valueColors` traz uma cor por item, na mesma ordem e com a mesma quantidade de entradas. Cada cor pode ser uma string vazia, para seguir o padrão do perfil, ou `#` com seis dígitos hexadecimais. A ausência desses campos também segue o padrão, preservando as configurações antigas. Sem uma cor própria, o rótulo acompanha `appearance.labelColor`, e o valor ou item acompanha `appearance.informationColor`. Não junte `value` e `values` nem suas duas formas de cor no mesmo objeto.

```javascript
customFields: [
    {
        label: 'Formação',
        labelColor: '#4b2d73',
        values: ['[[Universidade Federal de Minas Gerais|UFMG]]', '[[Universidade de São Paulo|USP]]'],
        valueColors: ['#285b85', '#7b2d35'],
        layout: 'inline',
        separator: 'pipe',
        placement: 'top'
    },
    {
        label: 'Pesquisa',
        labelColor: '',
        value: '[[História]]',
        valueColor: '',
        placement: 'cards'
    }
]
```

Neste trecho de configuração, o rótulo "Formação" e cada universidade têm cores próprias. "Pesquisa" segue as cores gerais do perfil, mesmo que elas sejam alteradas depois. O exemplo mostra apenas `customFields`, e não um arquivo completo para importar. Use o arquivo gerado por "Baixar minhas escolhas" para guardar a configuração inteira.

## Caixas dentro da atividade

A disposição inicial coloca as caixas no painel de atividade, depois do cabeçalho com a sequência de dias e antes do gráfico de 12 semanas. O nome e os campos que seguem a posição padrão começam no topo, acima desse painel. Os campos escolhidos para as caixas ficam logo acima dos contadores, dentro do mesmo painel. Escolher os dois locais mostra o campo nas duas posições, e "Ocultar" continua disponível.

Em "Disposição", "Caixas na atividade" usa esse painel integrado. As opções anteriores permitem manter caixas e atividade em blocos próprios, na ordem escolhida, ou colocar textos entre os blocos separados. A ordem dos blocos fica guardada quando você experimenta a disposição integrada. As cores, os destaques, a seleção e a ordem das caixas, as colunas e os alinhamentos continuam independentes dessa escolha.

O trecho completo da página de usuário já leva as caixas para a posição escolhida. No painel integrado, "Baixar painel atualizado" reúne atividade e caixas em um arquivo para substituir o painel inteiro. "Baixar contadores atualizados" continua fornecendo somente as caixas, para substituir essa parte interna sem repetir o convite. Se apenas as caixas estiverem visíveis, seu arquivo também leva o convite de instalação.

## Conta, nome de exibição e fuso

"Conta da Wikipédia" precisa ser o nome exato da conta que fornecerá os dados. É o único campo de perfil obrigatório, com asterisco vermelho e indicação acessível. As indicações opcionais ficam menores e mais discretas, enquanto os seletores já vêm preenchidos. Ativar uma opção pode exigir seu dado correspondente, como as datas de um período personalizado. Dentro da própria Wikipédia em português, o instalador pode aproveitar a conta que já consta na configuração da página. No endereço local, esse campo é preenchido manualmente, sem consultar o login em outra página.

"Nome de exibição" permite usar um nome diferente nos títulos da prévia e do painel, incluindo o título das visualizações. Deixe-o vazio para manter o nome da conta. São aceitos até 100 caracteres Unicode, sem caracteres de controle nem os sinais `<`, `>`, `[`, `]`, `{`, `}` e `|`. Essa opção não muda a conta das consultas, os destinos ou a identidade dos dados guardados.

O horário de Brasília é a escolha inicial, preservando o fuso de uma configuração importada. A lista mostra 55 opções em oito grupos geográficos, incluindo UTC, sem um campo de busca. Ela conserva os horários do Brasil, de Portugal e dos países africanos de língua portuguesa e acrescenta Havaí, Alasca e mais cidades das Américas, da Europa, da Ásia e da Oceania. A Índia usa uma diferença de meia hora, que também é calculada pelo navegador. Um fuso válido já escolhido ou recebido do navegador permanece disponível mesmo quando fica fora dessa seleção. Os nomes das cidades vêm acompanhados da diferença para UTC na data de abertura, que pode mudar com o horário de verão. A configuração conserva o identificador do fuso para calcular cada data corretamente.

## Informações abaixo do nome

Os campos opcionais "Localização" e "Informações adicionais" aceitam texto e ligações internas, como `[[Rio de Janeiro]]` ou `[[Rio de Janeiro|Rio]]`. A localização aceita até 120 pontos de código Unicode. Até três informações aceitam rótulos de até 40 pontos de código e até oito itens de 160 pontos cada. Esses limites contam o texto digitado inteiro, incluindo os sinais da marcação das ligações. O rótulo usa apenas texto e já aparece na prévia quando é preenchido, mesmo sem dado, sem receber dois-pontos ou uma lista vazia. HTML, predefinições e marcação malformada não são aceitos. As ligações levam à Wikipédia em português. O trecho exportado acrescenta dois-pontos antes do destino, como em `[[:Rio de Janeiro|Rio]]`, para que ele permaneça uma ligação mesmo em páginas de arquivos ou categorias. Campos vazios ficam fora da configuração preparada e não alteram a conta consultada. Ao lado de cada campo, escolha se ele aparece nas caixas, na atividade ou nos dois blocos, ou use "Ocultar". A opção "Padrão" segue "Posição padrão das informações", que começa em "No topo". As escolhas explícitas de posição continuam guardadas. Quando só um bloco estiver visível, os campos destinados aos blocos acompanham esse bloco, sem retirar os campos do topo ou mostrar campos ocultos.

O nome e essas informações começam alinhados à esquerda e podem ficar no centro ou à direita, independentemente do alinhamento dos números nas caixas. "Mostrar a data de criação da conta" fica desmarcado no início. Ao marcar, o painel usa a menor data pública entre o registro global e os registros das contas locais vinculadas. A data aparece por extenso no idioma escolhido, com dia, mês e ano em UTC. Se faltar algum registro, o texto avisa que a data é a mais antiga disponível entre os dados consultados. Sem nenhuma data, o painel informa que ela está indisponível. A caixa "Na Wikipédia" conta os anos completos desde essa mesma data pública conferida, mesmo que o registro local da ptwiki seja posterior. Sem uma data global ou vinculada conferida, a caixa aguarda dados e não usa o registro local como substituto.

A consulta de registros usa os dados públicos da [API do CentralAuth](https://www.mediawiki.org/wiki/Extension:CentralAuth/API). Contas antigas podem ter datas locais ausentes. O [registro técnico sobre os campos de criação locais](https://phabricator.wikimedia.org/T124534) explica a disponibilidade desses campos. A ferramenta não usa a primeira edição como substituta de uma data de criação desconhecida.

## Posição de cada campo e foto

A posição pode ser escolhida separadamente para o nome, a localização, cada informação adicional, a data de criação, o horário e os estatutos opcionais. A foto tem seu próprio seletor com topo, atividade, os dois ou ocultar. "Padrão" segue "Posição padrão das informações", que começa no topo. Uma posição explícita anterior continua valendo, inclusive a posição geral recebida de uma configuração antiga. "Ocultar" retira somente aquele campo do painel. As outras opções mostram o campo no topo, nas caixas, na atividade ou em uma combinação dessas áreas. Quando apenas um bloco está visível, ele recebe os campos destinados aos blocos, sem mudar os do topo ou apagar a preferência guardada.

Junto de cada rótulo, "Disposição das informações" escolhe uma linha, linhas separadas ou marcadores para aquela informação, mesmo quando contém só um item. O rótulo pode ficar sem dado e já aparece na prévia enquanto é preenchido. O programa continua aceitando a configuração anterior da disposição geral, sem oferecer seu antigo seletor no instalador. O alinhamento escolhido para o nome também vale para essas informações.

O campo "Foto do Wikimedia Commons" recebe o nome de uma imagem já existente, como `Example.jpg`, com até 240 pontos de código Unicode. Aceita JPG, JPEG, PNG, WebP, GIF e SVG, com o prefixo opcional `File:` ou `Ficheiro:`. Informe o nome, sem endereço completo ou código de imagem. A prévia mostra uma imagem ilustrativa local, sem buscar o arquivo no Commons ou conferir sua existência. O arquivo escolhido entra no código preparado, junto ao acesso "Ver arquivo no Commons", onde você pode consultar os créditos e a licença. O instalador não envia imagens.

Ocultar um campo não apaga o valor preparado no carregador. Se esse código for publicado manualmente no `common.js`, seu texto será público, mesmo quando o campo não aparecer no painel.

## Escolher a aparência

"Cor do painel" fica em "Disposição", junto das escolhas gerais do painel. "Cor do destaque das caixas" fica perto das colunas e do alinhamento dos contadores. A estrela da caixa continua escolhendo quais recebem o destaque. As cores dos campos ficam em "Seu perfil", junto dos textos que mudam, e o fundo do topo fica junto da capa. O grupo separado "Cores e destaques" foi retirado.

A primeira etapa reúne os grupos "Seu perfil", "Disposição" e "Conteúdo" na coluna de ajustes. Ao abrir um grupo, os demais se recolhem. "Seu perfil" começa aberto em telas largas e recolhido em telas pequenas. Em telas largas, essa coluna permanece ao lado da prévia e permite rolar os ajustes sem perder o painel de vista.

Em "Disposição", a paleta de "Cor do painel" oferece cores com nomes. O campo de cores permite clicar ou arrastar até a tonalidade desejada, e o controle "Clarear ou escurecer" muda sua luminosidade. O campo hexadecimal continua aceitando uma cor exata com seis dígitos depois de `#`, como `#3366cc`. Esses controles substituem os ajustes técnicos separados de matiz e saturação. O seletor fecha ao clicar fora dele, pressionar Escape ou usar o botão de fechar. A mesma forma de escolha vale para a cor do fundo das caixas destacadas. Quando uma cor clara não permite ler o texto sobre branco, o programa usa uma versão mais escura para o texto e mantém a cor escolhida nos detalhes de destaque.

O espaçamento Confortável mantém a apresentação inicial. Compacto reduz o espaço interno e o tamanho dos números nas caixas. Amplo aumenta o espaço dentro dos componentes. O conteúdo das caixas fica alinhado à direita por padrão, com opções à esquerda e ao centro. Essa escolha vale para o conteúdo das caixas, sem deslocar o texto dos artigos na lista de visualizações.

No modo automático, Compacto usa até cinco colunas, Confortável até quatro e Amplo até três, quando houver largura suficiente. Também é possível escolher um limite de duas, três, quatro ou cinco colunas. O limite escolhido vale quando há largura suficiente, e telas estreitas reduzem o número de colunas para manter a leitura. Essa opção muda apenas a grade das caixas. Na disposição integrada, o cabeçalho permanece acima delas e o gráfico abaixo. Nos blocos próprios, vale a ordem escolhida.

Use "Adicionar caixas", junto à prévia, para escolher entre 24 contadores, dos quais oito vêm selecionados. Na própria caixa, a estrela aplica ou retira o destaque e o botão × remove o contador da seleção. A alça permite arrastar para mudar a ordem. Para usar o teclado, dê foco à alça e pressione esquerda ou cima para antecipar a caixa, ou direita ou baixo para colocá-la depois. Se o bloco de caixas estiver visível, pelo menos um contador precisa permanecer selecionado. É possível mostrar somente as caixas ou somente a atividade, mantendo ao menos um bloco na página.

Ao preparar os trechos da página de usuário, o instalador conserva a aparência escolhida e retira as alças, as estrelas e os botões de remoção usados na prévia local.

Escolha as caixas que receberão um fundo de destaque e a cor desse fundo. O padrão destaca "Na Wikipédia" com `#faf7ef`. É possível destacar outra caixa, mais de uma ou nenhuma. O texto sobre esse fundo recebe uma cor legível preparada pelo programa.

No modo conjunto, escolha entre caixas primeiro ou atividade primeiro. O programa pode inverter os dois blocos somente dentro do agrupamento preparado pelo instalador para a mesma conta. No modo separado, coloque cada trecho na posição desejada do código da página, preservando os textos entre eles. A configuração não move blocos separados através desses textos.

O convite "Gostou deste painel? Veja como adicionar à sua página de usuário." aparece uma só vez depois do último bloco visível. Se houver apenas caixas, o convite fica ao fim delas. Se houver apenas atividade, fica ao fim da atividade.

A aba inicial pode ser "30 dias", "90 dias", "12 meses", "Total acumulado" ou "Personalizado". Para a última opção, escolha uma data inicial e uma data final. As outras abas conservam suas próprias contagens.

A caixa tracejada "Adicionar caixa +" ocupa a posição seguinte da grade enquanto houver algum contador disponível. Com sete caixas, ela ocupa a oitava posição. Clique nela ou use Enter ou Espaço para abrir o mesmo seletor de "Adicionar caixas", que também permanece na barra da prévia. O seletor fecha por clique externo, Escape ou pelo botão de fechar. Quando a abertura partiu da caixa tracejada, o foco pode voltar a ela ao fechar. Se todos os 24 contadores já estiverem selecionados, essa caixa desaparece. Ela não recebe número, destaque ou alça e não entra nos arquivos exportados.

## Escolher um intervalo de visualizações

A aba "Personalizado" fica depois de "Total acumulado". Escolha o início e o fim e use "Aplicar período". O intervalo aceita um dia só ou datas diferentes, de 1 de julho de 2015 até o último dia completo em UTC. As duas datas entram na soma, respeitando o início individual de cada artigo, que continua no dia seguinte à primeira edição.

O total soma todos os artigos elegíveis do histórico. A lista começa com dez artigos, com mais cem por vez até quinhentos. Na prévia, dez artigos recebem números de exemplo, e as datas escolhidas mudam esses números. No programa instalado, a consulta do intervalo começa quando ele é escolhido e pode continuar em lotes sem repetir artigos já conferidos. Os resultados das quatro abas fixas permanecem guardados. Uma falha deixa o resultado incompleto e pode ser tentada novamente em uma atualização posterior, após pelo menos cinco minutos.

No código exportado para visitantes, a aba personalizada mostra o intervalo preparado e seus números. Alterar as datas exige a sessão do dono da página com o JavaScript ativo. Para guardar outro intervalo como escolha inicial, prepare novamente o carregador no instalador. Nenhuma dessas ações salva uma edição automaticamente.

## Estatutos na Wikipédia em português

Em "Seu perfil", marque "Mostrar estatutos" para apresentar os grupos públicos da conta na Wikipédia em português e escolha sua posição em "Mostrar estatutos em". A opção começa desmarcada, e "Padrão" acompanha a posição geral das informações. A lista usa os [tipos de usuário da ptwiki](https://pt.wikipedia.org/wiki/Wikip%C3%A9dia:Tipos_de_usu%C3%A1rios), sem tentar deduzir permissões pelas edições da conta.

Com a opção marcada e visível, o programa pede os grupos explícitos e implícitos à [API pública de usuários](https://www.mediawiki.org/wiki/API:Users), por uma consulta GET anônima. Depois de uma resposta conferida, o resultado é reaproveitado por 24 horas. Uma atualização forçada pode antecipar outra consulta. Esses dados ficam separados dos contadores e não mudam suas regras ou a identidade do histórico.

Se a lista contém "Autoconfirmado estendido", a apresentação retira "Autoconfirmado" e "Confirmado" para evitar a repetição. Outros estatutos, como "Autorrevisor", "Reversor" e "Administrador", permanecem juntos quando constam na resposta. Sem dados conferidos, o campo mostra "Aguardando dados" ou "Estatutos indisponíveis" depois de uma falha. Um erro posterior conserva a última resposta válida.

Em cada área do perfil, os estatutos e a data de criação ficam depois das informações adicionais, quando estiverem visíveis naquele local. **Estatutos** vem antes de **Conta criada**, e somente esses rótulos recebem negrito, mantendo os valores com o peso normal do texto. A posição escolhida para cada campo continua valendo.

A cópia pública mostra os estatutos da última consulta salva, e o atributo de dica do campo informa a data dessa conferência em UTC. Novas alterações nos grupos só aparecem para visitantes depois de preparar e salvar outra cópia do painel. A configuração usa `appearance.showUserGroups: true` e `appearance.profilePlacements.userGroups`, que começa em `inherit`.

Para mostrar os estatutos no topo, os dois ajustes dentro de `appearance` ficam assim, junto das outras escolhas do painel.

```javascript
showUserGroups: true,
profilePlacements: {
    userGroups: 'top'
}
```

## Configuração preparada pelo instalador

`appearance.nameColor`, `appearance.labelColor` e `appearance.informationColor` exigem o programa e os estilos da versão 1.17.0. Cada campo usa uma string vazia para manter a escolha automática ou uma cor hexadecimal como `#3366cc`. Uma configuração anterior recebe o valor automático nos três campos. As cores valem para os campos do perfil onde forem mostrados e suas ligações, sem alterar os contadores ou as regras das métricas.

O carregador pessoal inclui um objeto com a conta, o fuso e as opções abaixo. O instalador prepara esse código, por isso não é necessário escrever os nomes das opções à mão.

```javascript
window.PerfilWikiConfig = {
    user: 'SEU_NOME_DE_USUARIO',
    displayName: 'SEU_NOME_DE_EXIBICAO',
    location: '',
    customFields: [],
    photo: '',
    coverImage: '',
    timeZone: 'America/Sao_Paulo',
    stylesPage: 'Usuário:Daniel G Rego/RitmoPU-estilos',
    documentationPage: 'Usuário:Daniel G Rego/PerfilWiki',
    appearance: {
        theme: 'blue',
        accent: '#3366cc',
        topBackground: '#ffffff',
        coverSource: 'manual',
        density: 'comfortable',
        cardColumns: 'auto',
        layout: 'integrated',
        blockOrder: 'cards-first',
        alignment: 'right',
        nameAlignment: 'left',
        photoAlignment: 'left',
        photoSize: 96,
        photoShape: 'square',
        nameFontSize: 24,
        nameColor: '',
        labelColor: '',
        informationColor: '',
        showLocalTime: false,
        showUserGroups: false,
        profilePlacement: 'top',
        profilePlacements: {name: 'inherit', location: 'inherit', accountCreated: 'inherit', photo: 'top', localTime: 'top', userGroups: 'inherit'},
        profileDetailsLayout: 'stacked',
        customRange: null,
        showAccountCreated: false,
        highlightedMetrics: ['tenure'],
        highlightColor: '#faf7ef',
        metrics: ['tenure', 'bestStreak', 'thanks', 'edits', 'reverts', 'edited', 'articles', 'technicalCreated'],
        showCards: true,
        showActivity: true,
        initialPeriod: '30d'
    }
};
```

`displayName` fica fora de `appearance`, ao lado de `user`, e exige o programa 1.1.1. Retire-o ou deixe-o vazio se quiser usar o nome da conta. `blockOrder`, `highlightedMetrics`, `highlightColor` e o contador `activeDays` exigem o programa 1.2.0. `cardColumns`, o espaçamento `roomy` e os contadores `articleEdits`, `talkEdits`, `activeMonths` e `busiestDay` exigem o programa 1.3.0. Os contadores `edits30`, `averagePerActiveDay`, `activeYears` e `busiestMonth` exigem o programa 1.4.0. Os contadores `thanksSent`, `averageBytesPerEdit`, `largestAddition` e `largestRemoval` exigem o programa 1.5.0. `location`, `customFields`, `nameAlignment` e `showAccountCreated` exigem o programa 1.6.0. As ligações internas nos campos, `profilePlacement`, `customRange` e `initialPeriod: 'custom'` exigem o programa 1.7.0. `photo`, `profilePlacements`, `profileDetailsLayout`, a posição de cada informação adicional e cinco colunas exigem o programa 1.8.0.

A disposição `integrated`, padrão desde a versão 1.9.0, exige o programa e os estilos dessa versão. `together` e `separate` continuam aceitos para conservar as disposições anteriores.

O padrão `profilePlacement: 'top'` começa na versão 1.11.0. Atualizar o programa conserva as posições explícitas de uma configuração anterior. Quando a posição geral não foi informada, o programa usa o novo padrão no topo. Os botões de alinhamento mudam apenas o controle do instalador e continuam preparando `nameAlignment` e `alignment` com os valores anteriores.

Rótulos sem dado, os ajustes de itens sempre junto do rótulo e os estatutos opcionais exigem o programa 1.13.0. `appearance.showUserGroups` começa em `false`, e `appearance.profilePlacements.userGroups` começa em `inherit`.

`appearance.photoSize` e `appearance.photoShape` exigem o programa e os estilos da versão 1.15.0. O tamanho aceita os números `64`, `96`, `128`, `160` e `200`, com `96` quando ausente. O formato aceita `square`, o padrão, ou `round`. Uma configuração anterior conserva a foto quadrada de 96 pixels. Essas escolhas mantêm o alinhamento e as posições da foto.

`appearance.photoAlignment` exige o programa e os estilos da versão 1.14.0. Aceita `left`, `center` e `right`. Uma configuração anterior sem esse campo conserva a foto à esquerda.

`coverImage` e `appearance.topBackground` exigem o programa e os estilos da versão 1.12.0. `coverImage` fica na raiz da configuração, como `photo`, e aceita os mesmos nomes de arquivo. A string vazia deixa a capa de fora no modo manual. `appearance.coverSource` aceita `manual`, o padrão, `daily`, desde 1.16.0, ou `wiki-daily`, desde 1.17.0. Os modos diários conservam o nome manual para quando você voltar a ele. `wiki-daily` mantém a chamada ao calendário existente da Wikipédia nos trechos iniciais e nos downloads, sem fixar o arquivo de um dia. Ele exige o programa e os estilos da versão 1.17.0, mas dispensa criar predefinições ou módulos. `topBackground` recebe uma cor hexadecimal de seis dígitos e usa branco quando não foi informado. A foto começa com `profilePlacements.photo: 'top'`. O seletor atual oferece `top`, `activity`, `top-activity` e `hidden`, enquanto o programa continua aceitando os valores explícitos das configurações anteriores.

| Campo | Valores aceitos |
| --- | --- |
| `theme` | `blue`, `forest`, `violet` ou `custom` |
| `accent` | Cor hexadecimal com seis dígitos, precedida por `#` |
| `topBackground` | Cor hexadecimal com seis dígitos para o fundo do topo, com `#ffffff` no início |
| `coverSource` | `manual`, o padrão, usa `coverImage`. `daily` consulta a imagem do Commons na sessão da própria conta. `wiki-daily` mantém a chamada ao calendário da Wikipédia para visitantes |
| `density` | `compact`, `comfortable` ou `roomy`, chamado Amplo no instalador |
| `cardColumns` | `auto`, `2`, `3`, `4` ou `5`, como texto, com redução em telas estreitas |
| `layout` | `integrated`, o padrão, `together` ou `separate` |
| `blockOrder` | `cards-first` para caixas antes da atividade ou `activity-first` para atividade antes das caixas |
| `highlightedMetrics` | Lista dos contadores que receberão fundo de destaque, sem repetição, ou uma lista vazia |
| `highlightColor` | Cor hexadecimal com seis dígitos para o fundo das caixas escolhidas |
| `alignment` | `right`, `left` ou `center`, para os números das caixas |
| `profilePlacement` | `top`, o padrão, `activity`, `cards`, `both` ou `all`, para os campos que usam `inherit` |
| `profilePlacements` | Objeto com `name`, `location`, `accountCreated`, `photo`, `localTime` e `userGroups`. Cada valor aceita `inherit`, `top`, `cards`, `activity`, `both`, `top-activity`, `top-cards`, `all` ou `hidden`. A foto e o horário começam em `top`, os outros campos em `inherit` |
| `profileDetailsLayout` | Configuração anterior ainda aceita, com `stacked` ou `inline`. Seu seletor saiu do instalador. Os itens de cada informação usam seu próprio `layout` |
| `customRange` | `null` ou `{start: 'YYYY-MM-DD', end: 'YYYY-MM-DD'}`, com datas válidas entre 1 de julho de 2015 e o último dia completo em UTC |
| `nameAlignment` | `left`, `center` ou `right`, com `left` no início, para o nome e as informações abaixo dele |
| `photoAlignment` | `left`, o padrão, `center` ou `right`, para a foto, sem mudar o alinhamento do nome ou dos contadores |
| `photoSize` | `64`, `96`, `128`, `160` ou `200`, como número, com `96` no início |
| `photoShape` | `square`, o padrão, ou `round`, com recorte aplicado somente à imagem |
| `nameColor`, `labelColor` e `informationColor` | String vazia para automática, o padrão, ou `#` seguido de seis dígitos, mantendo a cor escolhida sem alteração |
| `nameFontSize` | `16`, `20`, `24`, `28`, `32` ou `36`, como número, com `24` no início |
| `showLocalTime` | `true` para mostrar o horário no fuso escolhido ou `false`, o padrão, para ocultá-lo |
| `showUserGroups` | `true` para mostrar os estatutos públicos da ptwiki ou `false`, o padrão, para ocultá-los e não pedir essa consulta |
| `showAccountCreated` | `true` para mostrar a data de criação disponível ou `false`, o padrão, para ocultá-la |
| `metrics` | Lista dos contadores selecionados, sem repetição e na ordem desejada |
| `showCards` | `true` para mostrar as caixas ou `false` para ocultá-las |
| `showActivity` | `true` para mostrar a atividade ou `false` para ocultá-la |
| `initialPeriod` | `30d`, `90d`, `12m`, `since` ou `custom`, quando `customRange` está preenchido |

`location` e `customFields` ficam na raiz de `PerfilWikiConfig`, fora de `appearance`. `location` recebe texto com ligações internas ou uma string vazia. Os valores de `customFields` também aceitam essas ligações, enquanto os rótulos usam apenas texto. `customFields` recebe até três objetos com `label`, `value` e a opção `placement`, por exemplo `[{label: 'Pesquisa', value: 'Bibliotecas e arquivos', placement: 'cards'}]`. `placement` aceita `inherit`, `top`, `cards`, `activity`, `both`, `top-activity`, `top-cards`, `all` ou `hidden`. Quando não é informado, usa `inherit`. Os limites são 120 pontos de código para a localização, 40 para o rótulo e 160 para o valor, contando também os sinais da marcação das ligações. A configuração conserva rótulos sem dados e retira apenas linhas inteiramente vazias. `photo` e `coverImage` também ficam na raiz, fora de `appearance`, e uma string vazia deixa a imagem correspondente de fora, salvo a capa quando um dos modos diários está escolhido.

| Contador | Nome usado em `metrics` |
| --- | --- |
| Na Wikipédia | `tenure` |
| Melhor sequência | `bestStreak` |
| Agradecimentos recebidos | `thanks` |
| Contribuições | `edits` |
| Reversões | `reverts` |
| Artigos diferentes editados | `edited` |
| Artigos criados | `articles` |
| Predefinições, módulos e scripts criados | `technicalCreated` |
| Artigo mais editado, opcional | `mostEditedArticle` |
| Bytes acrescentados, opcional | `bytesAdded` |
| Bytes removidos, opcional | `bytesRemoved` |
| Dias com edições, opcional | `activeDays` |
| Edições em artigos, opcional | `articleEdits` |
| Edições em discussões, opcional | `talkEdits` |
| Meses com edições, opcional | `activeMonths` |
| Dia com mais edições, opcional | `busiestDay` |
| Edições nos últimos 30 dias, opcional | `edits30` |
| Média por dia ativo, opcional | `averagePerActiveDay` |
| Anos com edições, opcional | `activeYears` |
| Mês com mais edições, opcional | `busiestMonth` |
| Agradecimentos enviados, opcional | `thanksSent` |
| Média de bytes acrescentados por edição, opcional | `averageBytesPerEdit` |
| Maior acréscimo em uma edição, opcional | `largestAddition` |
| Maior remoção em uma edição, opcional | `largestRemoval` |

O carregador confere se a conta conectada é a mesma da configuração e se a página pertence a ela. O nome "Daniel G Rego" no endereço do programa compartilhado escolhe de onde vem o código. Ele não escolhe de quem são os números.

## Levar a aparência para os visitantes

Os blocos iniciais e os downloads incluem a identidade da conta e a configuração de aparência. A prévia local usa dados inventados, enquanto os arquivos iniciais aguardam dados. Depois de uma consulta real concluída, os downloads do programa trazem os resultados dessa consulta.

Na primeira coleta, o total global e a criação mais antiga conferida podem aparecer antes dos contadores que dependem do histórico completo da ptwiki. As visualizações também podem começar com até dez artigos conferidos e a indicação "Ordem provisória". O total aguarda a cobertura de todos os artigos elegíveis, e a ordem pode mudar quando os próximos artigos chegam. Essas etapas não mudam a seleção das caixas nem os limites de exibição que você escolheu.

Mudar o carregador altera a apresentação na sessão da própria conta. Para levar as novas escolhas e os números aos visitantes, baixe novamente as caixas e a atividade e substitua os blocos correspondentes na página. Preserve os outros textos e as categorias. Com `coverSource: 'wiki-daily'`, a capa conserva sua chamada ao calendário da Wikipédia e acompanha a data sem outra gravação diária. Os números, os demais campos e a capa no modo `daily` continuam usando a última cópia salva manualmente.

Os downloads de todo o painel conservam um único par de marcadores `PERFILWIKI-PROFILE-BEGIN` e `PERFILWIKI-PROFILE-END`. Isso vale para o painel integrado e para uma instalação com apenas caixas ou apenas atividade. Quando os dois blocos estão habilitados nas disposições anteriores, os downloads individuais são fragmentos. Ao substituir um desses fragmentos, preserve os marcadores externos, o outro bloco e seus textos pessoais fora da região do painel.

## Caixas opcionais

A seleção inicial conserva as oito caixas anteriores. "Dias com edições", "Artigo mais editado", "Bytes acrescentados" e "Bytes removidos" continuam disponíveis entre as 24 opções.

"Dias com edições" conta quantos dias distintos tiveram alguma edição aceita no histórico público da Wikipédia em português, no fuso escolhido. Dez edições no mesmo dia contam como um dia. A caixa usa as mesmas exclusões do calendário, incluindo as antigas atualizações da própria subpágina de estatísticas. O número aguarda o histórico completo. Uma atualização temporariamente incompleta conserva o último valor conferido, quando houver.

"Artigo mais editado" conta quantas edições públicas da conta foram feitas em cada artigo da Wikipédia em português e mostra o primeiro da classificação. Não usa as visualizações dos artigos para escolher esse resultado.

As caixas de bytes usam a diferença de tamanho de cada revisão pública em relação à revisão anterior. Uma edição com diferença de +500 soma 500 bytes acrescentados, enquanto uma edição com diferença de -200 soma 200 bytes removidos. As duas somas abrangem os grupos de páginas da Wikipédia em português, sem se limitar a artigos. Cada revisão entra uma só vez.

A diferença líquida de uma edição não conta todos os caracteres substituídos. Se uma revisão troca um trecho por outro do mesmo tamanho, sua diferença é zero, mesmo que o texto tenha mudado. Os totais não medem autoria, texto que permaneceu na página ou qualidade das edições.

Um histórico antigo guardado no navegador pode não ter as diferenças de tamanho. Nesse caso, a ferramenta precisa completar uma nova passagem do histórico antes de informar os totais de bytes. Valores ausentes ou inválidos ficam desconhecidos, sem serem convertidos em zero. Depois da conferência completa, as próximas atualizações podem reaproveitar os dados e consultar as edições novas.

"Edições em artigos" soma as edições públicas no domínio principal da Wikipédia em português. Uma página pode entrar mais de uma vez se recebeu mais de uma edição. "Edições em discussões" soma as edições nas páginas de discussão dos grupos de páginas locais. Esses valores contam edições, sem medir quantas páginas diferentes foram alteradas.

"Meses com edições" conta cada mês com ao menos uma edição aceita pelo calendário, no fuso escolhido. "Dia com mais edições" mostra a data que teve o maior total de edições aceitas e o total daquele dia. Esses cálculos usam as mesmas exclusões dos dias com edições. As quatro caixas aguardam o histórico completo e não acrescentam consultas de rede. Uma atualização incompleta conserva o último valor conferido, quando houver.

"Edições nos últimos 30 dias" soma as edições aceitas pelo calendário nos últimos 30 dias, incluindo o dia em andamento, no fuso escolhido. "Média por dia ativo" divide todas as edições aceitas pelo número de dias em que houve alguma edição e mostra uma casa decimal. Os dias sem edição ficam fora dessa divisão.

"Anos com edições" conta cada ano do calendário que teve alguma edição aceita, sem exigir anos seguidos. "Mês com mais edições" mostra o mês e o ano com o maior total e informa quantas edições ele teve. Um empate escolhe o mês mais antigo. As quatro caixas seguem as exclusões do calendário, aguardam o histórico completo e reaproveitam o resumo já calculado, sem novas consultas de rede.

"Média de bytes acrescentados por edição" divide o total de acréscimos pelo número de revisões públicas locais do histórico completo. Entram nessa divisão as edições que acrescentaram conteúdo, as que removeram e as que não mudaram o tamanho. Com três edições de +600, -200 e zero bytes, o total acrescentado é 600 e a média é 200 bytes por edição. A média aparece com uma casa decimal.

"Maior acréscimo em uma edição" mostra a maior diferença positiva de tamanho. "Maior remoção em uma edição" mostra a maior diferença negativa em valor absoluto. As três caixas usam as diferenças já consultadas pelo programa, sem outro percurso do histórico. Um histórico completo sem edições recebe zero. Se alguma diferença estiver ausente ou inválida, o resultado fica desconhecido até completar a cobertura, sem substituir um valor anterior já conferido por um resultado parcial.

Os valores de bytes usam B, KiB, MiB e as unidades seguintes, com cada unidade igual a 1.024 da anterior. Esses números medem diferenças de tamanho, sem determinar quem escreveu cada trecho ou quanto dele permanece no artigo.

"Agradecimentos enviados" soma os eventos públicos em que a conta enviou um agradecimento na Wikipédia em português. Essa consulta só acontece quando a caixa está selecionada. A caixa não abrange agradecimentos enviados em outros projetos nem eventos que não estejam no registro público. "Agradecimentos recebidos" conserva seu alcance nos projetos da conta global. A consulta pública do registro usa o filtro de autor da ação, chamado `leuser`, e percorre os lotes antes de concluir o total. Uma consulta incompleta conserva o último resultado conferido quando houver. As regras do registro estão na [extensão Thanks](https://www.mediawiki.org/wiki/Extension:Thanks#SQL_documentation) e na [API de eventos públicos](https://www.mediawiki.org/wiki/API:Logevents).

## Ideias para caixas futuras

As ideias abaixo ainda não foram acrescentadas ao instalador nem ao painel. Todas podem aproveitar os cálculos do histórico já consultado, sem exigir outra fonte de dados.

| Ideia | O que contaria |
| --- | --- |
| Dias ativos nos últimos 30 dias | Quantos dos últimos 30 dias tiveram edições, incluindo o dia em andamento |
| Edições na Wikipédia em português | Total local de edições públicas, separado da caixa de contribuições da conta global |
| Média diária de edições | Edições dos últimos 30 dias divididas por 30, incluindo os dias sem edição, com uma casa decimal |
| Artigos editados cinco vezes ou mais | Quantos artigos receberam ao menos cinco edições da conta |

Esses números ajudariam a acompanhar a frequência e o volume de edições. Eles não medem a qualidade do texto nem quantas pessoas abriram um artigo por causa de uma edição.
