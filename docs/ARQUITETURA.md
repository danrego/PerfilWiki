# Como o programa está organizado

O PerfilWiki consulta o histórico público da Wikipédia em português uma vez por ciclo e compartilha esse resultado com os cálculos de atividade e os contadores que precisam dele. As consultas da conta global e das visualizações usam seus serviços próprios, dentro da mesma rotina de atualização.

O JavaScript distribuído é montado a partir dos arquivos em `src`. O carregador pessoal importa esse arquivo uma só vez. A distribuição também traz os estilos, os trechos iniciais, o instalador em duas telas e a documentação para publicação manual. A versão 1.20.0 é um candidato local, ainda sem publicação na Wikipédia ou envio ao GitHub.

## Partes do código

| Arquivo | Trabalho |
| --- | --- |
| `I18n.js` | Fornece textos, números e datas nos seis idiomas da interface |
| `ProfileFields.js` | Confere os grupos de itens, conserva os valores anteriores e permite rótulos sem dado |
| `UserGroups.js` | Confere a prova pública dos grupos da ptwiki, traduz os nomes e retira somente os grupos redundantes de autoconfirmação |
| `ProfileClock.js` | Formata o horário local e a diferença para UTC, com ajuste sazonal |
| `ProfileHeaderView.js` | Prepara e atualiza os campos escolhidos para o topo |
| `ProfileText.js` | Valida texto com ligações internas e nomes de imagens do Commons e prepara HTML, wikitexto e nós do navegador com a mesma leitura |
| `ProfileSections.js` | Confere os blocos pessoais, conserva o wikitexto original e prepara uma aproximação local que não executa o código digitado |
| `LiveEdit.js` | Confere a troca entre a sessão dona do painel e o instalador hospedado, sem salvar páginas |
| `Configuration.js` | Confere a conta, o nome de exibição, o fuso, a aparência, os títulos de estilos e documentação e os endereços públicos permitidos |
| `Appearance.js` | Valida as opções de aparência e prepara cores legíveis e classes finitas para os componentes |
| `History.js` | Percorre o histórico da ptwiki, segue a continuação e confere as revisões recebidas |
| `Statistics.js` | Calcula os contadores com o histórico compartilhado e consulta os números de alcance global |
| `PageviewsCore.js` | Calcula a atividade, as sequências e as visualizações depois da primeira edição em cada artigo |
| `Coordinator.js` | Reúne histórico, contadores e visualizações em um estado conferido e prepara as atualizações de progresso |
| `LayoutView.js` | Compõe os blocos na disposição escolhida e move apenas os elementos reconhecidos do painel, sem copiá-los |
| `CardsView.js` | Prepara as caixas na sessão e o trecho de wikitexto dos contadores |
| `ActivityView.js` | Prepara o calendário, as metas, as listas e o trecho de wikitexto da atividade |
| `Presenter.js` | Prepara a última edição e confere as miniaturas opcionais |
| `Cache.js` | Compacta e restaura os resultados guardados no navegador |
| `LargeCache.js` | Guarda o mesmo cache compactado no IndexedDB, com limite de tamanho e comparação atômica das datas |
| `Runtime.js` | Cuida do transporte, das abas, dos controles, dos intervalos e dos downloads |
| `PerfilWiki-estilos.css` | Define a aparência das caixas e do painel, com regras preparadas para TemplateStyles |

## Conta, página e configuração

A rotina exige a Wikipédia em português, uma página de leitura do grupo "Usuário" e a conta conectada igual à configurada. O nome do dono da página também precisa corresponder à conta. A ferramenta não inicia o coletor em uma página de outra pessoa.

`PerfilWikiConfig` aceita `user`, `displayName`, `location`, `customFields`, `photo`, `coverImage`, `timeZone`, `stylesPage`, `documentationPage` e `appearance`. Sem `user`, usa a conta conectada. Sem `timeZone`, usa o fuso do navegador, com UTC como alternativa. As duas páginas opcionais recebem títulos completos da Wikipédia e são usadas na exportação.

`displayName` é opcional e fica restrito à apresentação. Vazio ou ausente, usa o nome da conta. A validação aceita até 100 pontos de código Unicode e recusa controles e os sinais `<`, `>`, `[`, `]`, `{`, `}` e `|`. O valor entra nos títulos da prévia e da atividade, inclusive o de visualizações, e no wikitexto exportado. Não escolhe a conta das consultas, o dono da página, os destinos ou as chaves de armazenamento.

`location` é uma string opcional de até 120 pontos de código Unicode. `customFields` é uma lista opcional de até três objetos com `label` de até 40 pontos e `value` de até 160, ou `values` com até oito itens de 160 pontos cada. A configuração normaliza os textos, aceita ligações internas nos valores e recusa controles, HTML e predefinições. Um rótulo pode ficar sozinho, e apenas as linhas inteiramente vazias são retiradas. Cada linha também pode usar `placement`, com `inherit`, `top`, `cards`, `activity`, `both`, `top-activity`, `top-cards`, `all` ou `hidden`. A apresentação escapa esses valores no HTML e no wikitexto. Eles ficam fora da configuração de métricas, da identidade do histórico e das chaves do cache.

`ProfileFields.js` também confere as cores opcionais de cada grupo. `labelColor` recebe a cor do rótulo, `valueColor` pertence à forma com `value` e `valueColors` pertence à forma com `values`, com uma entrada por item. Cada valor aceita apenas string vazia ou cor hexadecimal de seis dígitos, normalizada para letras minúsculas. A string vazia e a ausência do campo herdam `appearance.labelColor` ou `appearance.informationColor`. A validação impede misturar as formas única e agrupada ou manter uma lista de cores desalinhada dos itens. Essas escolhas são dados de apresentação e não alteram a identidade das métricas.

O instalador coloca a conta informada em `data-perfilwiki-user` antes de copiar ou baixar os trechos. Os arquivos genéricos do índice de manutenção usam `SEU_NOME_DE_USUARIO` para a substituição manual. O carregador confere a conta conectada, a conta configurada e o dono da página antes de importar o programa. A marca no HTML informa a quem o bloco pertence e precisa corresponder a essa conta.

O arquivo de origem `PerfilWiki-estilos.css` contém as regras da aparência. O destino público padrão é `Usuário:Daniel G Rego/RitmoPU-estilos`, uma folha já preparada com o modelo de conteúdo `sanitized-css`. O nome do arquivo da distribuição não determina o modelo de conteúdo de uma página na Wikipédia. A sessão do usuário recebe os mesmos estilos incorporados ao JavaScript, e a cópia pública depende da chamada de TemplateStyles.

A disposição `integrated` começa selecionada e coloca `dan-pu-estatisticas` no espaço `dan-pu-integrated-cards`, depois do cabeçalho com a sequência e antes do gráfico de 12 semanas. `LayoutView.js` faz a mesma composição para a prévia e os trechos preparados. O agrupamento explícito usa `data-perfilwiki-group="true"` e a conta correspondente. O programa conserva o elemento das caixas antes de substituir o HTML da atividade e o devolve ao espaço interno depois, mantendo os números e campos já conferidos. Os modos `together` e `separate` continuam aceitos. O primeiro pode inverter os blocos dentro do próprio agrupamento. O segundo conserva as posições do código-fonte, sem mover os textos entre elas. Os identificadores antigos continuam aceitos.

## Histórico e contadores

O histórico guarda revisões distintas e os campos necessários às contagens, como página, domínio, título, data, criação e etiquetas. A continuação pertence ao percurso em andamento. Respostas incompletas, tokens repetidos e registros incompatíveis impedem que uma coleta seja declarada completa.

As consultas incrementais retomam o histórico com sobreposição para conferir edições próximas ao ponto de retomada. A reconstrução periódica permite refazer o conjunto público. Cada etapa confere a identidade da conta e as datas antes de reutilizar dados.

Na primeira coleta sem histórico completo aproveitável, o coordenador pede primeiro uma conferência curta da identidade global e da criação da conta. Esse resultado pode preencher os contadores de identidade antes da passagem por todas as revisões da ptwiki. A mesma consulta global é reaproveitada pelos detalhes posteriores, sem uma segunda busca só para obter esses campos. A continuação do histórico e os contadores de alcance local mantêm seus critérios de completude.

Uma conta com muitas edições exige muitos lotes na primeira passagem. O orçamento por ciclo, a fila única e as pausas exigidas pelos serviços podem levar essa etapa a minutos. Esse custo não corresponde a carregar apenas HTML e CSS. O cache conserva o ponto de retomada para que os próximos ciclos e visitas possam continuar ou consultar somente as edições novas.

Em novas coletas com mais de cinquenta artigos candidatos, a primeira classificação de metadados pode iniciar séries para até dez artigos já aceitos, antes de terminar a classificação de todo o conjunto. Cada linha apresentada tem sua própria série conferida, mas a ordem permanece provisória. O total do período continua desconhecido, e as marcas de cobertura e classificação permanecem incompletas até a conclusão real. A soma final conserva todos os artigos elegíveis e o começo depois da primeira edição em cada um.

Os contadores têm alcances diferentes. Edições e agradecimentos recebidos usam a conta global. Agradecimentos enviados usam somente o registro público da Wikipédia em português. Artigos criados usam as Wikipédias ligadas, pelo XTools, sem Wikipédias de teste e com os filtros definidos na documentação. Artigos diferentes editados, reversões e criações técnicas usam a ptwiki.

A caixa da melhor sequência recebe o mesmo resultado de atividade usado pelo painel. O contador opcional `activeDays` usa `activity.summary.totalActiveDays` quando `activity.complete` é verdadeiro e o total é um inteiro seguro não negativo. A soma distingue os dias no fuso escolhido e segue as mesmas exclusões do calendário. Um estado parcial não produz um total de dias como se fosse completo, e a atualização visual conserva o último valor conferido quando disponível. A caixa "Na Wikipédia" usa o menor registro público conferido entre a conta global e as contas vinculadas. Sem essa prova, permanece desconhecida, mesmo que exista uma data local de ingresso na ptwiki.

Os contadores opcionais `articleEdits` e `talkEdits` separam as edições públicas aceitas pelo domínio da página. O primeiro soma edições no domínio principal. O segundo soma edições nos domínios de discussão. `activeMonths` e `busiestDay` usam os dias aceitos pelo calendário, agrupados no fuso configurado e com as mesmas exclusões. O mês entra uma vez quando há alguma edição nele. O dia com mais edições guarda a data e seu total. As quatro caixas aguardam o histórico completo e reutilizam os dados consultados no ciclo, sem outro pedido à rede. Um estado incompleto não pode substituir um total conferido por um valor parcial.

Com o resumo completo da atividade, `edits30` recebe `activity.summary.edits30`, incluindo o dia em andamento no fuso configurado. `averagePerActiveDay` divide o total de edições aceitas pelo número de dias com edições e usa uma casa decimal na apresentação. `activeYears` conta os anos distintos desses dias. `busiestMonth` agrupa as edições por mês e guarda o mês, o ano e seu total, escolhendo o mais antigo em caso de empate. Esses quatro contadores, acrescentados em 1.4.0, seguem as exclusões do calendário e aguardam a conclusão do histórico, sem exigir outra coleta.

O contador opcional `thanksSent` consulta `list=logevents` na ptwiki, com `letype=thanks` e `leuser` igual à conta configurada. A consulta só entra no ciclo quando esse contador está selecionado. O filtro considera quem enviou o agradecimento. O evento precisa ter a ação `thank`, o identificador público válido, a conta esperada e uma data aceita. A continuação e os identificadores dos eventos evitam somar o mesmo agradecimento em lotes repetidos. A cobertura completa e o resultado anterior ficam separados do contador global de recebidos, que conserva suas regras. Consulte a [extensão Thanks](https://www.mediawiki.org/wiki/Extension:Thanks#SQL_documentation) e a [API de registros](https://www.mediawiki.org/wiki/API:Logevents) para os campos públicos usados.

## Estatutos públicos opcionais

`appearance.showUserGroups` começa como `false`, e `appearance.profilePlacements.userGroups` começa em `inherit`. O Runtime só passa `includeUserGroups` quando esse campo está ativado em alguma área visível. A opção fica fora da identidade das métricas e do histórico, e sua ativação pode iniciar a consulta sem descartar o restante dos dados guardados.

`Statistics.js` faz um GET anônimo à API da ptwiki com `list=users`, `ususers` igual à conta configurada e `usprop=groups|implicitgroups`. A resposta precisa conter uma única conta com nome e identificador válidos, sem marcas de ausência ou ocultação. Os grupos explícitos e implícitos entram numa lista ordenada e sem repetição, conferida por `UserGroups.js`. Os campos da consulta pública constam em [API:Users](https://www.mediawiki.org/wiki/API:Users).

O estado guarda `statistics.userGroups` com `version: 1`, `user`, `project: 'pt.wikipedia.org'`, `checkedAt` e `groups`. `userGroupsAttemptAt` guarda a tentativa mais recente. Depois de uma prova válida, a rotina espera 24 horas para a próxima consulta normal. `force` pode antecipá-la. Uma falha sem prova anterior permite nova tentativa em outro ciclo. A mensagem em `statistics.errors` usa "Estatutos na ptwiki", e uma falha conserva a prova válida anterior.

`UserGroups.fromProof` recusa provas de outra conta ou projeto, datas futuras e listas fora da forma canônica. `UserGroups.text` fornece os nomes públicos em português. A apresentação esconde `autoconfirmed` e `confirmed` quando existe `extendedconfirmed`, sem esconder outros estatutos. Sem um grupo adicional, mostra "Usuário registrado". Os [tipos de usuário da ptwiki](https://pt.wikipedia.org/wiki/Wikip%C3%A9dia:Tipos_de_usu%C3%A1rios) explicam os grupos do projeto.

`ActivityView.js` prepara os campos de encerramento depois das informações adicionais em cada área do perfil. `.dan-pu-user-groups` fica antes da data de criação da conta, quando os dois estão visíveis naquele local. Somente os rótulos "Estatutos" e "Conta criada" recebem negrito, enquanto os valores mantêm o peso normal do texto. Uma prova válida entra em `data-perfilwiki-user-groups`, e a dica `title` informa a data de conferência em UTC. O HTML inicial, a atualização por nós do navegador e o wikitexto usam a mesma validação. Sem prova, a apresentação aguarda dados ou informa a falha, sem transformar o problema numa lista vazia de estatutos. O wikitexto mantém a resposta da consulta salva até outra atualização manual da página.

## Data opcional de criação da conta

`appearance.showAccountCreated` começa como `false`. A rotina só pede a coleta opcional quando um bloco com as informações está visível e a opção está marcada. `includeEarliestRegistration` passa ao coletor fora da configuração de métricas e da identidade do cache. A consulta `globaluserinfo` já usada pelo programa pode fornecer o registro global e os registros das contas locais vinculadas, sem pedir uma data a cada projeto.

`Statistics.js` guarda o menor registro público em `metrics.earliestRegistration`. A prova `registrationCoverage` contém `version`, `user`, `checkedAt`, `complete`, `globalRegistration` e uma lista ordenada `accounts`, com `wiki`, `url` e `registration`. O horário `metricUpdatedAt.earliestRegistration` precisa corresponder a `checkedAt`. A prova só é completa quando a data global e as datas das contas vinculadas estão disponíveis. Datas inválidas, futuras ou de outra identidade não viram uma criação conferida.

`ActivityView.js` formata o dia, o mês e o ano em português, usando UTC, junto às informações abaixo do nome. Quando falta parte das datas, o texto diz "Data de criação mais antiga disponível" e avisa que podem existir contas anteriores sem data registrada. Sem data conhecida, mostra a indisponibilidade. Uma falha conserva o último resultado conferido quando disponível. O contador `tenure` usa o mesmo `metrics.earliestRegistration`, com a identidade da prova e `metricUpdatedAt.earliestRegistration` conferidos. A data local continua em `metrics.registration`, com seu significado original, e não substitui a criação mais antiga. A exportação portuguesa de `Tempo decorrido` usa a mesma data conferida da caixa. Um cache antigo que só conhece o registro local permanece pendente até receber a prova global. Os campos públicos estão na [API do CentralAuth](https://www.mediawiki.org/wiki/Extension:CentralAuth/API) e no [registro técnico sobre as datas locais](https://phabricator.wikimedia.org/T124534).

## Diferenças de tamanho das edições

As caixas opcionais de bytes usam a diferença de tamanho de cada revisão pública em relação à revisão anterior. Diferenças positivas entram em `bytesAdded`, e o valor absoluto das diferenças negativas entra em `bytesRemoved`. As somas percorrem todos os grupos de páginas do histórico público local, com revisão deduplicada pelo identificador. Elas não medem os caracteres substituídos, a autoria do texto nem o conteúdo que permaneceu publicado.

O histórico precisa informar a diferença de tamanho de todas as revisões aceitas antes de declarar esses totais completos. Um resultado zero conferido é diferente de um campo ausente ou inválido. Cópias antigas sem esses campos exigem uma passagem completa, com retomada de lotes, e não podem receber o rótulo de cobertura completa apenas por terem uma data recente. Depois dessa passagem, o histórico guardado e as consultas incrementais evitam reconstruir tudo em cada visita.

`averageBytesPerEdit` divide `bytesAdded` pelo número total de revisões públicas locais deduplicadas, incluindo diferenças negativas e zero. `largestAddition` guarda a maior diferença positiva, e `largestRemoval` guarda o valor absoluto da maior diferença negativa. Um histórico completo vazio produz zero. As três caixas exigem cobertura completa das diferenças e reaproveitam o percurso já usado pelos bytes, sem iniciar outro. A apresentação da média usa uma casa decimal e unidades binárias de bytes.

## Visualizações e datas

A atividade divide os dias pelo fuso escolhido. As visualizações usam UTC e começam no primeiro dia completo depois da primeira edição pública da conta em cada artigo. As quatro janelas fixas terminam no último dia UTC completo. O intervalo personalizado termina na data final escolhida, que também precisa ser um dia completo em UTC.

A soma de cada período abrange todos os artigos aceitos. O núcleo pode manter uma classificação maior durante o cálculo, mas a apresentação mostra até 500 artigos por período. Classificação concluída e total concluído são conferidos separadamente.

As séries precisam corresponder à página, ao título, ao período e ao corte de primeira edição. Uma edição nova no mesmo artigo não muda esse corte. Falhas e dados ainda não disponíveis não viram zero. A documentação das métricas explica as provas exigidas para dias omitidos e respostas 404.

## Transporte, armazenamento e navegação

O transporte aceita somente pedidos públicos previstos na configuração. Usa `GET` com `credentials: 'omit'` e recusa ações de escrita e pedidos de autenticação ou tokens. As pausas dos serviços são respeitadas. Consultas repetidas pelo mesmo ciclo podem compartilhar a resposta.

O armazenamento usa um prefixo do PerfilWiki com conta e fuso. Os estados são conferidos antes de serem aceitos, inclusive os candidatos de migração do RitmoPU. Uma cópia de outra conta ou de outro fuso não passa a representar os números da instalação atual.

As cópias aceitas usam primeiro `localStorage` e também são espelhadas no IndexedDB quando ele está disponível, sem mudar os limites de quatro milhões de caracteres compactados e doze milhões de caracteres expandidos do codec. O banco `perfilwiki-large-cache-v1` recebe somente as chaves de cache da própria ferramenta, com até 4.096 caracteres. Cada registro confere esquema, tipos, tamanho e uma data canônica que não pode estar no futuro. A comparação com a cópia anterior e a gravação acontecem na mesma transação, impedindo que outra aba substitua uma data mais recente por uma mais antiga. A operação termina em até 1.500 milissegundos quando a abertura ou o armazenamento não responde e fecha as conexões.

A apresentação disponível é aplicada antes da leitura assíncrona desse banco. Nenhum coletor começa antes de terminar essa tentativa de recuperação, e a cópia recebida ainda passa pelo codec e pela validação completa do coordenador, da conta, do projeto e do fuso. A primeira cópia de progresso e a cópia final sempre tentam persistir. As intermediárias são agrupadas para gravar no máximo uma a cada quinze segundos. O encerramento normal do ciclo espera a fila de gravação antes de liberar sua reserva. Uma gravação em qualquer dos dois armazenamentos permite conservar a cópia. Se ambos falharem, ou se o codec recusar o tamanho, um aviso aparece uma vez e os dados disponíveis continuam em memória.

O controle entre abas evita que duas páginas façam a mesma coleta. Sair da página cancela os pedidos e invalida os trabalhadores antigos. Uma volta pelo histórico do navegador agenda outro ciclo. O resultado precisa pertencer à geração atual para alterar a tela e a cópia local.

## Saída pública

O download integrado reúne a atividade e as caixas. Quando apenas um desses blocos está habilitado, seu download também contém o painel inteiro. Esses arquivos completos conservam um único par de marcadores `PERFILWIKI-PROFILE-BEGIN` e `PERFILWIKI-PROFILE-END`, para permitir uma futura troca da região. Quando os dois blocos estão habilitados em `together` ou `separate`, os downloads individuais continuam sendo fragmentos e orientam a preservar os marcadores externos e o outro bloco. Cada saída conserva a chamada dos estilos e a identidade da conta. A data da última edição no trecho público é completa, sem depender do relógio do visitante.

O programa não envia esse texto para salvar uma página. A pessoa abre o arquivo, confere e cola o trecho na Wikipédia. O carregador pessoal e o wikitexto público têm funções diferentes e não devem ser colados um no lugar do outro.

## Instalador e aparência

As fontes do instalador ficam em `installer/`. O grupo "Seu perfil", na primeira etapa de personalização, prepara a identidade, o nome de exibição, a localização e os campos opcionais, o fuso e o destino. O preenchimento automático da conta lê somente `mw.config` no contexto da própria Wikipédia em português, com `wgDBname` igual a `ptwiki` e `wgUserName` disponível. O endereço local permanece com preenchimento manual. Essa leitura não usa pedidos de autenticação nem consulta outra aba ou a sessão de outro site.

A seleção de fuso usa `listCommonTimeZones` de `installer/src/timezones.mjs`, com 55 identificadores em oito grupos geográficos, incluindo UTC, Havaí e mais cidades da Europa e da Ásia. Cada opção passa pela validação de `Intl.DateTimeFormat`, sem enumerar o catálogo completo. Um identificador válido já escolhido permanece disponível mesmo se for um alias ou estiver fora da seleção. Uma configuração nova usa `America/Sao_Paulo`, enquanto uma configuração importada conserva um fuso válido anterior. As opções ficam em grupos geográficos em português, com cidades e a diferença para UTC na data da abertura. Não há busca na primeira tela. A configuração guarda o identificador do fuso, sem substituí-lo por uma diferença fixa de horas.

O seletor de cores é um componente local do instalador, usado na cor principal, no fundo das caixas destacadas, no fundo do topo e nas cores de nome, rótulos e informações. Ele fecha ao clicar fora, pressionar Escape ou usar o botão de fechar. Os controles são acessíveis pelo teclado. A cor principal e o fundo de destaque ficam em "Disposição", perto dos ajustes do painel e das caixas. As cores dos campos ficam junto dos campos em "Seu perfil".

A etapa "Personalize seu painel" reúne a coluna de ajustes nos grupos recolhíveis "Seu perfil", "Disposição" e "Conteúdo". Somente um grupo fica aberto por vez. "Seu perfil" começa aberto em telas largas e recolhido em telas pequenas. Em telas largas, a coluna fica limitada à altura disponível e tem rolagem própria para manter a prévia visível. A seleção dos contadores saiu dessa coluna.

"Adicionar caixas" abre a seleção junto à prévia. Cada caixa recebe controles locais com uma estrela para aplicar ou retirar o destaque, um botão × para remover e uma alça para mudar a ordem. A alça aceita arraste e as setas do teclado. Esquerda ou cima antecipam a caixa, enquanto direita ou baixo a colocam depois. Todas essas ações mudam a mesma lista ordenada da configuração, sem menu de posição. Os controles pertencem à prévia do instalador e não são incluídos pelos componentes do painel no HTML ou no wikitexto exportado. Uma caixa tracejada "Adicionar caixa +" aparece depois do último contador e antes do convite das caixas quando há opções disponíveis. Ela abre o mesmo seletor na página principal do instalador, sem se tornar um contador ou alvo de arraste. Some quando os 24 contadores estão selecionados. A mensagem só é aceita da origem e da janela da própria prévia, com a seleção atual válida. O fechamento pode devolver o foco à caixa tracejada ou à última alça, sem tomar o foco de um controle externo escolhido pela pessoa.

A última tela oferece os trechos pessoais, os resumos, os destinos e os editores de teste locais. "Arquivos e documentação" abre o índice de manutenção para os arquivos compartilhados.

A prévia usa os componentes reais de apresentação com respostas inventadas e mantidas no computador. Informar o nome de uma conta não inicia uma consulta pública. Os editores locais recebem o código gerado como texto, sem executá-lo. A instalação gerada usa os mesmos identificadores de elementos que o programa espera na página pessoal.

`appearance` aceita `coverSource` para escolher a capa manual, a diária do Commons na sessão da própria conta ou a diária nativa da Wikipédia para visitantes, `nameColor`, `labelColor` e `informationColor` para os textos do perfil, tema, cor hexadecimal, espaçamento, número máximo de colunas, alinhamento dos contadores, `nameAlignment` para o nome e suas informações, `showAccountCreated` para a data opcional, `profilePlacement` para escolher em qual bloco essas informações aparecem, `customRange` para o intervalo personalizado, ordem dos contadores, visibilidade dos blocos, disposição, ordem dos blocos, caixas destacadas, cor do fundo de destaque e aba inicial. O padrão mantém os oito contadores anteriores, alinhamento das caixas à direita, `nameAlignment: 'left'`, `nameFontSize: 24`, `profilePlacement: 'top'`, `showAccountCreated: false`, `showLocalTime: false`, `blockOrder: 'cards-first'`, `highlightedMetrics: ['tenure']` e `highlightColor: '#faf7ef'`. Os dezesseis contadores opcionais `mostEditedArticle`, `bytesAdded`, `bytesRemoved`, `activeDays`, `articleEdits`, `talkEdits`, `activeMonths`, `busiestDay`, `edits30`, `averagePerActiveDay`, `activeYears`, `busiestMonth`, `thanksSent`, `averageBytesPerEdit`, `largestAddition` e `largestRemoval` completam as 24 opções sem entrar na seleção inicial. A validação recusa opções desconhecidas, contadores repetidos, cores fora do formato e uma página sem nenhum bloco. A lista de contadores pode ficar vazia somente quando o bloco de caixas está oculto.

`density` aceita `compact`, `comfortable` e `roomy`. `cardColumns` aceita `auto`, `2`, `3`, `4` e `5` como texto e usa `auto` por padrão. O automático permite até cinco colunas em Compacto, quatro em Confortável e três em Amplo, com redução conforme a largura. As classes previstas na folha de estilos aplicam o limite escolhido à grade das caixas, com redução para telas estreitas. Essas escolhas passam para o HTML e o wikitexto, sem introduzir valores livres de CSS.

`Appearance.js` prepara as cores e as classes usadas pelos componentes, sem acessar a rede. A cor de fundo das caixas destacadas passa pela validação hexadecimal, e a cor do texto é calculada para permitir a leitura sobre esse fundo. A lista de caixas destacadas aceita os identificadores conhecidos e pode ficar vazia. Cores claras recebem uma tonalidade mais escura para o texto sobre branco. Os estilos exportados usam valores conferidos e classes previstas pela folha, sem exigir propriedades personalizadas de CSS.

As cores individuais acompanham a normalização de `customFields`, a configuração de ativação, o arquivo de escolhas e a sessão local. A apresentação do HTML, a atualização por nós do navegador e o wikitexto aplicam a cor ao rótulo ou item correspondente, incluindo as ligações internas. O instalador mantém os pares de item e cor ao acrescentar ou retirar entradas e conserva a cor única ao transformar o campo em um grupo. Uma cor local explícita permanece independente de mudanças nas cores gerais. Não há novas consultas à rede para esses ajustes.

Cada raiz leva `data-perfilwiki-appearance` com as opções de apresentação. Os blocos iniciais também levam `data-perfilwiki-rendered="pending"`, para que a sessão possa aplicar a apresentação completa ao iniciar. A seleção e a ordem dos contadores valem para o HTML da sessão e para o wikitexto exportado. O modo separado não insere uma biografia de exemplo na página.

O convite de instalação pertence ao último bloco visível na ordem escolhida. Quando apenas as caixas ou apenas a atividade aparecem, esse bloco recebe o convite. A apresentação e os trechos exportados precisam manter uma só ocorrência.

Os downloads públicos conservam as opções e os dados que foram conferidos. A configuração pessoal não altera sozinha o wikitexto salvo. A cópia que os visitantes veem precisa ser substituída manualmente quando os números ou a aparência mudarem.

## Conteúdo pessoal e reabertura das escolhas

`contentSections` pertence ao modelo do instalador e aceita até oito objetos `{title, content}`. O título usa texto simples com até 100 pontos de código Unicode. O corpo conserva o wikitexto original, incluindo as quebras de linha, com até 50.000 unidades UTF-16 por bloco e 200.000 no total dos corpos. Essa contagem usa o comprimento das strings do JavaScript, em que um emoji pode ocupar duas unidades. Esses textos não pertencem a `window.PerfilWikiConfig`, não alteram a identidade das métricas e não entram no cache de estatísticas.

O trecho completo acrescenta um contêiner estático depois do painel, com títulos de seção nativos. Esse contêiner fica fora das raízes e dos marcadores que a rotina de atualização substitui. Repaint, coleta, atualização entre abas e downloads de métricas não leem nem reescrevem esses blocos. A edição posterior usa o editor normal da página, com previsão e salvamento manual.

O grupo "Textos e projetos" mantém os campos dos blocos na coluna, e o botão "Editar" na prévia volta ao campo correspondente. A prévia local recebe o texto como dados e aproxima a marcação simples, sem executar HTML ou predefinições e sem consultar uma API de análise de wikitexto. O resultado dessa aproximação não é usado para exportar a página. A exportação conserva o corpo digitado para que o parser da Wikipédia o processe somente depois de uma eventual publicação manual.

"Baixar minhas escolhas" no instalador prepara JSON com a configuração e `contentSections`. "Carregar minhas escolhas" lê JSON, confere os campos e só troca o estado quando a validação termina. Configurações anteriores da série 1 recebem os padrões dos campos que não continham. O código recebido nunca é avaliado. O download na sessão da própria conta exporta as escolhas da configuração e não tenta extrair o conteúdo pessoal da página.

Essas operações não acrescentam pedidos de escrita à Wikipédia. A edição futura passa pelo editor comum e pelo salvamento acionado pela pessoa.

## Navegação local entre painel e personalização

`installer/src/panel-session.mjs` conserva uma cópia validada do modelo completo, incluindo `contentSections`, no `sessionStorage` da aba. `Ver painel` e `Editar painel` trocam a apresentação no mesmo aplicativo e usam `history.pushState`, sem navegação HTTP. A simulação usa os componentes reais de apresentação, com os controles do instalador desativados no modo de painel. O botão de edição pertence ao aplicativo local, sem entrar no código exportado ou acrescentar uma consulta às APIs da Wikipédia.

O módulo só aceita HTTP ou HTTPS nos hosts `localhost`, `127.0.0.1` e `[::1]`, sem credenciais no endereço. O modo vem de um único parâmetro `perfilwiki=panel` ou `perfilwiki=customize`. O fragmento usa `#perfilwiki-session=TOKEN`, em que `TOKEN` tem 32 caracteres hexadecimais gerados com `crypto.getRandomValues`. Nome de conta, textos e configuração ficam fora do endereço.

A chave `perfilwiki-panel-session-v1:TOKEN` guarda `{schema: 1, savedAt, config}`. O limite é de 1 MiB para o registro serializado em UTF-8, e a validade é de 24 horas desde a gravação. Leitura e gravação passam o modelo por `importChoices`, sem avaliar código. Dados acima do limite, schema inválido, data vencida, data mais de um minuto no futuro ou identificador inválido não são restaurados. Uma leitura malsucedida apresenta uma mensagem e retorna à personalização. Quando o identificador aponta para uma entrada inválida ou vencida, a leitura tenta remover somente essa entrada do armazenamento, sem apagar dados de outras ferramentas.

Se `sessionStorage` ou a geração do identificador falharem, o estado em memória permite alternar entre as telas durante a execução, com aviso de que recarregar não recuperará as escolhas. O JSON continua como cópia de segurança independente da sessão. Os eventos de histórico recuperam a cópia validada da sessão, e alterações válidas podem atualizar essa mesma cópia.

Esta implementação não conecta o botão a uma página publicada na Wikipédia. Uma integração futura precisaria de hospedagem do instalador e reconhecimento da conta dona do painel, em trabalho separado. O fluxo existente de edição manual dos textos e de preparo dos trechos permanece disponível.

O formulário marca apenas a entrada principal da conta como obrigatória, com asterisco vermelho explicado em texto e `required` no campo. Outros campos podem permanecer vazios ou usar seus padrões. Regras condicionais, como um título para uma seção acrescentada ou datas para um período personalizado, continuam conferidas antes de preparar os arquivos. As indicações opcionais usam texto menor e cor discreta sem serem ocultadas.

## Construção da distribuição

`npm run build` chama `node scripts/build-all.cjs`. A construção lê a versão de `package.json`, confere as notas em `docs/RELEASES.json`, prepara o programa e os arquivos de distribuição e compila o instalador. Para esta versão, a saída fica em `dist/1.20.0`.

`INICIO.html` passa a ser o instalador em duas telas. `Arquivos.html` conserva o índice completo de manutenção, com o programa, os estilos, os documentos e os trechos genéricos. Cada arquivo mantém seu conteúdo inteiro, destino, resumo, download e ligação ao editor. A raiz e a distribuição usam os mesmos arquivos de referência.

Os trechos pessoais são preparados no navegador, sem modificar os arquivos genéricos do repositório. A construção pode precisar das dependências de desenvolvimento instaladas, mas não consulta contas da Wikipédia nem publica os arquivos gerados.

O [manifesto de origem](PROVENIENCIA.json) guarda os hashes das fontes herdadas. O [guia de testes](TESTES.md) explica os comandos e os limites da verificação.

## Seletor de cores do instalador

O instalador usa um seletor dentro da página com `popover="auto"`. O navegador fecha essa janela por clique externo ou Escape. A paleta tem cores com nomes, o espectro aceita clique e arraste e um só controle "Clarear ou escurecer" muda a luminosidade. O campo hexadecimal aceita uma cor exata. A navegação por teclado percorre a paleta, o espectro e o controle de luminosidade. As conversões de cor ficam em `installer/src/color.mjs`, sem expor controles técnicos separados de matiz e saturação.

Um clique dentro da prévia percorre outro documento. O arquivo local da prévia avisa o instalador pelo mesmo canal que informa a aba e a altura. O instalador só aceita o aviso quando a origem e a janela pertencem ao seu próprio quadro, e então fecha os seletores abertos. A perda de foco da janela também fecha um seletor aberto. Esses avisos ficam em localhost e não chegam à Wikipédia.

## Conferência pública da instalação

`installer/src/installation-check.mjs` lê o manifesto local da versão e prepara uma consulta pública para quatro títulos, o `common.js` da conta, a página de destino, o programa compartilhado e os estilos. A conferência começa somente pelo botão "Verificar instalação". Os pedidos usam `GET`, `credentials: 'omit'`, recusa de redirecionamento e limites de tamanho. O componente pode cancelar a consulta ao mudar de configuração e encerra uma espera longa.

A consulta combina `prop=info|revisions`, conteúdo da revisão mais recente e o espaço principal da revisão. O texto recebido é comparado sem executar JavaScript, analisar o wikitexto como uma página ou pedir autenticação. O carregador precisa corresponder ao trecho preparado. Os blocos precisam ter a conta, os identificadores e as escolhas esperados. O programa e os estilos são comparados aos arquivos do manifesto local. A folha precisa ter o modelo `sanitized-css`. As regras desses módulos públicos estão na [API de revisões](https://www.mediawiki.org/wiki/API:Revisions) e na [API de informações](https://www.mediawiki.org/wiki/API:Info).

Os estados separam correspondência, ausência, diferença e impossibilidade de conferência. Falhas de rede ou conteúdo oculto não viram ausência. Um resultado favorável confere os trechos públicos naquele momento, sem provar a execução do script no navegador ou a resposta dos serviços de estatísticas. A conferência não publica correções nem altera a cópia local dos números.

## Intervalo personalizado

`appearance.customRange` recebe `null` ou um objeto com `start` e `end` no formato `YYYY-MM-DD`. `initialPeriod` aceita `custom` quando esse objeto está preenchido. A validação exige datas reais, início desde `2015-07-01`, fim anterior ao dia atual em UTC e início igual ou anterior ao fim.

A coleta personalizada usa o mesmo histórico e a classificação atual das páginas, com dados próprios do intervalo. O resultado chega a `pageviews.periods.custom`, e `pageviews.customRange` impede apresentar uma soma sob datas diferentes. O corte da primeira edição vale para cada artigo. O andamento conserva os artigos já concluídos e os totais antigos das quatro abas fixas. A rotina de atualização usa somente os endereços públicos permitidos e o orçamento de consultas existente.

## Posição dos campos e foto

`appearance.profilePlacements` recebe `name`, `location`, `accountCreated`, `photo`, `localTime` e `userGroups`. Cada chave aceita `inherit`, `top`, `cards`, `activity`, `both`, `top-activity`, `top-cards`, `all` ou `hidden`. A foto e o horário começam em `top`, e os outros campos em `inherit`. O instalador oferece somente `top`, `activity`, `top-activity` e `hidden` para a foto. Os demais valores explícitos continuam válidos no programa para conservar configurações anteriores. A herança segue `appearance.profilePlacement`, cujo padrão passa a `top` na versão 1.11.0. Essa opção geral também aceita `activity`, `cards`, `both` e `all`. Configurações com uma posição explícita conservam essa escolha, enquanto uma posição geral ausente usa o novo padrão. Cada objeto de `customFields` pode escolher sua própria `placement`, também herdada quando ausente. Um campo oculto não reaparece quando apenas um painel está visível. A parte destinada aos blocos acompanha o único bloco disponível sem retirar campos do topo ou reescrever a preferência.

`profileDetailsLayout` continua aceitando `stacked`, o padrão, ou `inline` nas configurações anteriores, embora seu seletor tenha saído do instalador. Na disposição geral em linha, os detalhes ficam abaixo da linha divisória do nome, com separadores | e quebra conforme a largura. O `layout` de cada informação controla somente seus itens, com `inline`, `lines` ou `bullets`. HTML, wikitexto e atualização dos nós usam as mesmas regras de posição. A cidade e o horário da mesma área ficam no elemento `.dan-pu-profile-location-time`, antes das informações adicionais, independentemente da disposição geral.

`appearance.photoSize` aceita os números `64`, `96`, `128`, `160` e `200`, com `96` no início. `appearance.photoShape` aceita `square`, o padrão, e `round`. Os dois valores passam pela normalização compartilhada, usam regras previstas na folha de estilos e acompanham HTML, wikitexto, pintura dos nós e exportação. O recorte redondo fica na imagem, sem cortar a legenda. A largura máxima respeita o espaço disponível. Os ajustes de tamanho e formato mantêm a origem de imagem de 160 pixels já usada, sem iniciar outra consulta por causa da mudança de estilo.

`appearance.photoAlignment` aceita `left`, `center` ou `right`, com `left` quando ausente. O alinhamento da foto não altera `nameAlignment`, `alignment` ou as posições dos campos. A apresentação à esquerda e à direita mantém a imagem ao lado das informações quando há largura. A opção central coloca a imagem acima do texto. HTML, wikitexto e atualização dos nós conservam a mesma escolha. Em telas estreitas, os componentes se reorganizam sem alargar a página. A imagem de capa conserva sua posição acima do conteúdo do topo.

`photo` fica na raiz da configuração e recebe uma string vazia ou um nome de arquivo do Commons. `ProfileText.normalizePhoto` aceita até 240 pontos de código Unicode e extensões JPG, JPEG, PNG, WebP, GIF e SVG. Retira um prefixo inicial `File:` ou `Ficheiro:` e recusa endereços, caracteres de controle e marcação. `Configuration` reaproveita essa normalização. O arquivo não altera as chaves do cache nem os cálculos de métricas.

A apresentação da sessão usa uma imagem do Commons e o acesso à página do arquivo. O wikitexto exportado inclui a chamada da imagem e o mesmo acesso à página do Commons. O nome de um arquivo válido não confirma que ele exista, que esteja disponível ou que sua licença tenha sido conferida. O instalador não envia arquivos.

A prévia passa `localPhotoPreview: true` aos componentes reais. Essa opção usa uma imagem SVG fixa em um endereço de dados e não atribui um endereço externo ao elemento de imagem. A política do quadro mantém `connect-src 'none'` e permite imagens somente locais ou em endereços de dados. O cabeçalho fictício externo foi retirado. As ligações internas dos campos conservam os endereços da Wikipédia em português e recebem aparência de ligação, mas os eventos de clique e clique auxiliar impedem a navegação no quadro local.

## Foto, capa e fundo do topo

Em "Seu perfil", a foto pode ficar em "No topo, padrão", "Na atividade", "Topo e atividade" ou "Ocultar". A área antes chamada "cabeçalho" passa a ser "atividade" nos controles, para distingui-la do topo. As configurações anteriores com outras posições explícitas continuam aceitas pelo programa.

Junto da foto, os botões de "Alinhamento da foto" escolhem "À esquerda", "Centralizado" ou "À direita". À esquerda, o padrão, a foto fica ao lado do texto. À direita, ela passa para o outro lado. No centro, ela fica acima das informações. Essa escolha é independente do alinhamento do nome e dos contadores e vale nas áreas em que a foto foi exibida. Em telas estreitas, a foto e o texto se reorganizam para caber. A capa permanece acima das informações do topo.

O tamanho da foto pode ser 64, 96, 128, 160 ou 200 pixels, com 96 pixels no início. Escolha o formato quadrado ou redondo sem mudar seu alinhamento. O recorte vale para a imagem, deixando "Ver arquivo no Commons" inteiro e legível abaixo dela. A largura se adapta a telas menores. Essas escolhas mudam a apresentação da foto, sem pedir outra imagem por causa do ajuste.

Em "Imagem de capa", escolha "Escolher arquivo do Commons" para informar uma imagem fixa, "Imagem do dia da Wikipédia, para visitantes" para acompanhar a escolha diária da Wikipédia em português, ou "Imagem do dia do Commons, na sua sessão" para consultar a escolha do Commons na sessão da própria conta. As duas escolhas diárias podem usar imagens diferentes. O nome do arquivo manual fica guardado ao mudar de opção. Para ficar sem capa, volte ao modo manual e deixe o nome vazio. A imagem ocupa uma faixa acima das informações do topo, com recorte central para preencher a área.

"Imagem do dia da Wikipédia, para visitantes" usa as páginas diárias que já existem na Wikipédia em português. Depois da instalação manual inicial, a data em UTC é recalculada pela própria Wikipédia, sem precisar salvar outra edição a cada dia. Os visitantes não precisam do JavaScript do PerfilWiki, de uma conta conectada ou de consultas à API pelo painel. A troca acompanha a renovação do cache da Wikipédia, sem garantir a mudança à meia-noite nem trocar a imagem de uma aba que já está aberta. Se a página diária ainda não existir, a capa mostra um aviso discreto no lugar de um arquivo inventado. O arquivo exibido conserva sua ligação nativa para consultar os créditos e a licença. A opção usa o [calendário de imagens em destaque da Wikipédia em português](https://pt.wikipedia.org/wiki/Wikip%C3%A9dia:Imagem_em_destaque) e as [palavras mágicas de data do MediaWiki](https://www.mediawiki.org/wiki/Help:Magic_words#Date_and_time).

"Imagem do dia do Commons, na sua sessão" conserva o funcionamento anterior. O programa pode consultar a imagem pela data UTC na sessão da própria conta e conserva a última imagem conferida se a consulta falhar. Os visitantes recebem a imagem da última cópia salva manualmente nesse modo. No instalador, todas as capas continuam ilustrativas e locais, sem buscar imagens ou enviar seu código à Wikipédia. O modo da Wikipédia prepara uma chamada dinâmica para o calendário existente, e o modo do Commons começa com um aviso de espera até haver dados conferidos.

"Cor de fundo do topo" usa o mesmo seletor dos outros ajustes e começa em branco. Na opção automática de texto, o programa calcula cores legíveis sobre esse fundo. Uma cor de texto escolhida manualmente permanece como foi informada. O fundo vale somente para o topo, sem mudar o fundo das caixas ou da atividade. Foto, capa e cores acompanham a prévia e os trechos preparados.

"Cor do nome" fica junto do nome de exibição, e "Cor dos rótulos" e "Cor das informações" ficam junto das informações adicionais. Cada controle permite manter "Automática" ou escolher uma cor. A escolha vale para os campos do perfil nas áreas em que aparecem, incluindo suas ligações, sem mudar os números das caixas. As cores escolhidas são mantidas como foram informadas. Confira a leitura sobre os fundos que usa ou volte a "Automática" para recuperar as cores preparadas pelo painel.

## Itens de uma informação e campos no topo

Em "Seu perfil", os ajustes de tamanho e alinhamento ficam junto do nome de exibição. O tamanho pode ser 16, 20, 24, 28, 32 ou 36 pixels, com 24 no início. "Alinhamento do nome de exibição" usa botões com ícones de linhas, identificados como "À esquerda", "Centralizado" e "À direita", com a escolha ativa visível e nomes para leitores de tela. Cada rótulo tem seu próprio controle de "Disposição das informações", mesmo quando contém só um item, para escolher uma linha, linhas separadas ou marcadores sem mudar as outras informações. "Alinhamento dos contadores" continua em "Disposição", perto dos ajustes da grade das caixas, sem mudar o alinhamento do perfil.

Uma informação adicional pode reunir até oito itens sob o mesmo rótulo. Em "Formação", por exemplo, coloque `[[Universidade Federal de Minas Gerais|UFMG]]` no primeiro item e `[[Universidade de São Paulo|USP]]` no segundo. "Adicionar item" cria outro campo sem repetir o rótulo. Escolha itens na mesma linha, com barra vertical, ponto central ou espaço, ou use linhas separadas, com ou sem marcadores. Os itens passam para outra linha quando falta largura. Cada item aceita até 160 pontos de código Unicode, e o painel mantém até três grupos com rótulos de até 40 pontos.

Os campos que usam "Padrão" começam no topo, acima da atividade. Os campos de texto também podem ficar na atividade ou acima das caixas, em uma combinação dessas áreas, ou ocultos. A escolha antiga "Nos dois blocos" conserva a atividade e as caixas. Configurações com uma posição anterior explícita mantêm essa escolha, enquanto uma posição geral ausente usa o novo padrão no topo. O topo só aparece quando recebe conteúdo, sem repetir o nome por conta própria.

"Mostrar hora local" e o fuso ficam junto de "Localização", em "Seu perfil". O horário usa o fuso escolhido, sem tentar deduzi-lo do texto da cidade. Quando aparecem na mesma área, uma localização como `[[Belo Horizonte]]` fica seguida de "11:42 (UTC-3)" na mesma linha de informações, antes dos outros campos. Se tiverem posições diferentes, cada um conserva a posição escolhida. Sem uma cidade visível naquela área, o horário pode aparecer sozinho. A diferença para UTC muda com o horário de verão. O relógio usa o horário do computador e a mesma rotina que atualiza a indicação da última edição, sem outra consulta de dados.

Na sessão da própria conta com o programa ativo, o horário acompanha os minutos. A cópia salva para visitantes mantém o horário do momento em que o trecho foi preparado, pois o programa não inicia a rotina na sessão de outras pessoas. Nos dois casos, a linha mostra apenas a hora e a diferença para UTC. A dica informa o fuso e a data da conferência, e o atributo de data conserva o instante em formato ISO. Nos downloads, os campos do topo acompanham o painel integrado ou o primeiro bloco visível nas disposições anteriores. Substitua essa parte junto com o bloco, mantendo um só topo.

`ProfileClock.details` fornece `text`, `title` e `timestamp`. O texto visível usa apenas hora e diferença compacta para UTC, como `11:42 (UTC-3)`, `UTC+0`, `UTC+5:30` ou `UTC+5:45`. A dica distingue horário local e horário salvo, com data e identificador do fuso. O atributo `data-perfilwiki-clock-at` conserva o instante ISO, e `data-perfilwiki-timezone` conserva o fuso. A conferência de instalação compara os atributos e a apresentação calculada, sem retirar a precisão para deixar a linha menor.

As configurações anteriores com um único `value` continuam aceitas, incluindo `{label: 'Pesquisa', value: ''}` para mostrar só o rótulo. A forma curta `{label: 'Pesquisa'}` também é aceita. Um grupo com `values: []` mantém seu rótulo e seus ajustes de disposição. Para escrever uma lista manualmente, use `values`, sem juntar as duas formas no mesmo grupo. Um exemplo é `{ label: 'Formação', values: ['[[Universidade Federal de Minas Gerais|UFMG]]', '[[Universidade de São Paulo|USP]]'], layout: 'inline', separator: 'pipe', placement: 'top' }`. As outras disposições são `lines` e `bullets`, e os outros separadores são `dot` e `space`. A posição do horário fica em `appearance.profilePlacements.localTime`, sua exibição em `appearance.showLocalTime`, e o tamanho do nome em `appearance.nameFontSize`.

Os botões de alinhamento do instalador usam controles de seleção única com ícones, nomes acessíveis e indicação da opção ativa. O nome continua usando `nameAlignment`, e os contadores usam `alignment`, com os mesmos valores `left`, `center` e `right`. Reunir os controles junto dos campos não altera a configuração exportada ou os pedidos de dados.

## Capa e fundo do topo

`coverImage` fica na raiz da configuração e usa a mesma normalização de `photo`, com uma string vazia como padrão. `appearance.coverSource` aceita `manual`, o padrão, `daily` ou `wiki-daily`, preservando o nome manual quando o modo muda. A capa pertence somente ao topo, antes das informações do perfil. A prévia usa uma ilustração local para os três modos, sem buscar imagens nem enviar o wikitexto à Wikipédia. Essas opções não modificam as contagens ou as chaves dos dados de métricas.

No modo `daily`, a rotina consulta por GET público `https://pt.wikipedia.org/api/rest_v1/feed/featured/YYYY/MM/DD`, com a data UTC, e usa o campo `image` do [Wikifeeds](https://www.mediawiki.org/wiki/Wikifeeds). Há apenas uma consulta em andamento por vez. A resposta válida do dia é reaproveitada, e uma falha conserva a última resposta válida e impõe uma pausa de cinco minutos antes de tentar novamente. Essa coleta opcional tem seu próprio estado e não muda a identidade ou o agendamento das métricas. A apresentação usa enquadramento central com `object-fit: cover` para acomodar o formato do arquivo.

A legenda do modo `daily` mostra a data UTC da imagem e o acesso à página canônica do arquivo no Commons. Sem uma resposta resolvida, a exportação inicial usa um aviso de espera em vez de um nome de arquivo fictício. O programa pode preparar outra cópia com a imagem resolvida para salvamento manual. Nesse modo, a página dos visitantes conserva a última imagem salva. O modo `wiki-daily` segue o caminho nativo explicado abaixo.

`appearance.topBackground` recebe uma cor hexadecimal de seis dígitos e começa em `#ffffff`. As cores automáticas do topo são calculadas para permitir a leitura sobre esse fundo. `nameColor`, `labelColor` e `informationColor` recebem uma string vazia como padrão automático ou uma cor `#RRGGBB`, normalizada para letras minúsculas. A cor manual é aplicada exatamente, incluindo as ligações daquele campo, sem passar pelo cálculo de contraste. Esses três campos acompanham nome, rótulos e informações em suas áreas escolhidas, sem mudar os números das caixas. O fundo continua limitado ao topo. As cores e a capa acompanham apresentação, exportação e conferência dos demais campos do perfil.

No instalador, a localização fica junto do controle "Mostrar hora local" e do fuso. O seletor "Posição da hora" aparece quando o horário está ativado. Os valores internos de posição continuam os mesmos, embora os nomes visíveis usem "Na atividade" e "Topo e atividade" para evitar a confusão entre o antigo "cabeçalho" e o topo separado.

O assistente de envio junto da foto é uma ligação externa fixa para `https://commons.wikimedia.org/wiki/Special:UploadWizard?uselang=pt-br`, com abertura em outra aba e `noopener noreferrer`. O instalador não envia a imagem, não abre uma sessão no Commons e não recebe o arquivo enviado. O nome precisa ser preenchido depois pelo usuário.

## Imagem diária para visitantes

O modo `wiki-daily` prepara uma transclusão das páginas existentes de `Wikipédia:Imagem em destaque`. O nome da página usa `{{CURRENTDAY}}`, `{{CURRENTMONTHNAME}}` e `{{CURRENTYEAR}}`, que seguem a data UTC. A chamada da imagem recebe `min=1200|max=1200`. A verificação `#ifexist` usa uma função custosa por capa para mostrar um aviso neutro quando a página do dia não existe. Nenhuma predefinição ou módulo novo precisa ser publicado. A [página de imagens em destaque](https://pt.wikipedia.org/wiki/Wikip%C3%A9dia:Imagem_em_destaque) mantém esse calendário, e o [MediaWiki documenta as palavras mágicas de data](https://www.mediawiki.org/wiki/Help:Magic_words#Date_and_time).

```wikitext
{{Wikipédia:Imagem em destaque/{{CURRENTDAY}} de {{CURRENTMONTHNAME}} de {{CURRENTYEAR}}|min=1200|max=1200}}
```

A chamada permanece dinâmica no wikitexto inicial e nos downloads posteriores, sem ser substituída pelo arquivo resolvido daquele dia. Durante as atualizações da sessão da própria conta, o programa conserva o elemento nativo já analisado pela Wikipédia. Os visitantes recebem a imagem sem carregar o JavaScript do PerfilWiki e sem consultas à API pelo painel. O cache da Wikipédia controla quando a página volta a ser analisada. A imagem pode levar algum tempo para mudar depois da virada do dia e não troca sozinha em uma aba já aberta. Essa escolha pode diferir da imagem diária do Commons e não promete igualdade entre os dois calendários.

Os testes do instalador mantêm a ilustração local. A criação dos trechos não faz edição, purga de cache ou carregamento remoto do código escrito pela pessoa. O funcionamento nativo não altera as condições de uso do script nas métricas, nem declara aprovação pelas regras de robôs.

## Idioma e transporte da versão 1.20.0

O módulo puro `I18n` é carregado antes dos módulos de apresentação e fornece os textos da interface, números e datas para os seis idiomas aceitos. A configuração guarda a escolha em `appearance.language`. O cache das métricas continua separado por conta e fuso, sem incluir o idioma. A apresentação traduz somente mensagens escritas no programa, sem aplicar substituições aos títulos e aos textos pessoais.

As instâncias do PerfilWiki na mesma origem compartilham uma consulta de transporte por vez, inícios separados por pelo menos 500 milissegundos e espera de cinco segundos após uma resposta da Action API que demora mais de um segundo. Respostas de limite de uso ou atraso mantêm uma pausa compartilhada entre as tentativas, inclusive quando alguém pede uma atualização manual. Os pedidos usam GET, sem credenciais, sem referenciador e sem seguir redirecionamentos. O corpo é lido com limite de oito MiB para JSON e 256 kB para a lista de exclusões.

History, Statistics e Pageviews compartilham o orçamento de até 40 consultas de dados por ciclo. A capa pode reservar uma dessas consultas. Os metadados de imagens têm um limite separado de uma consulta por ciclo, sem transformar o total em quarenta para todos os pedidos da página. A coordenação usa um nome fixo de Web Locks, independente da conta e do fuso, e horários compartilhados com prefixo `perfilwiki-transport-v1-`. Sem Web Locks, há uma reserva de transporte conferida no armazenamento. Com Web Locks e armazenamento bloqueado, as esperas ficam dentro da reserva para conservar o funcionamento em memória. Se as duas formas estiverem indisponíveis, novas consultas são recusadas, sem apagar a apresentação. Isso não controla conexões de outras ferramentas. A falta de orçamento deixa o trabalho pendente e preserva os últimos valores completos, sem registrar uma indisponibilidade do serviço que não ocorreu.

A construção fixa as versões do ambiente e conserva os avisos das bibliotecas no pacote estático. O comando de reprodutibilidade esvazia somente a distribuição da versão atual antes de cada uma das duas construções e compara caminhos e SHA-256. As distribuições históricas permanecem intactas. A exportação pública seleciona fontes e arquivos atuais, sem copiar o histórico Git ou as evidências privadas de teste. O guia PUBLICACAO.md explica o que ainda exige conferência manual.

## Edição da aparência a partir da página

O controle "Editar painel" é preparado somente pela rotina da conta dona do painel. Um clique abre o destino fixo `https://danrego.github.io/PerfilWiki/INICIO.html` com um identificador aleatório no fragmento. O programa conserva a referência da janela aberta e só aceita a troca depois de conferir origem, janela e identificador. O instalador recebe dados de configuração, sem código executável, e não consegue consultar o login da Wikipédia.

Depois do clique, uma ou duas consultas públicas usam a mesma fila de leitura para obter o código-fonte da página e seu número de revisão. A segunda só ocorre quando a página principal aponta para uma única subpágina própria reconhecida, como `{{/PU}}`, que precisa conter o painel. Essa cópia pode acompanhar a configuração para montar o rascunho. A região do painel só é trocada quando existe um par único de marcadores aceitos. A ausência dos marcadores, a ambiguidade ou uma falha da consulta conserva a necessidade de substituição manual. Os textos fora da região não são reconstruídos como campos de personalização e permanecem no original para conferência.

O instalador conserva a sessão no endereço local previsto ou no caminho fixo do GitHub Pages, com os mesmos limites de validade e tamanho. A hospedagem da mesma versão precisa ser publicada e verificada antes de considerar a integração disponível. A aplicação não usa tokens de edição nem faz pedidos de escrita. O resultado continua sendo um rascunho para cópia, previsão e salvamento manual no editor normal.
