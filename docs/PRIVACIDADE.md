# Dados e privacidade

Ao configurar uma conta, você escolhe quais números e campos pessoais deseja mostrar. A coleta básica ainda consulta o histórico e os totais necessários ao painel, mesmo quando algumas caixas ficam fora da seleção. Opções como os estatutos visíveis podem acrescentar consultas próprias. O histórico público pode conter o nome da conta, títulos de páginas, datas e horários de edições. Os pedidos aos serviços carregam os nomes e os títulos necessários à consulta, mesmo quando o painel mostra apenas um total. As visualizações são totais por página e dia, sem uma lista de leitores.

O programa usa pedidos públicos de leitura, com GET e `credentials: 'omit'`, sem aproveitar cookies de login. Ele não pede senha, token de edição nem acesso à lista de páginas vigiadas. Não há rotina para salvar páginas, enviar mensagens ou publicar arquivos. Esse cuidado não torna uma consulta anônima para o serviço que a recebe, pois uma conexão ainda informa dados de rede, como o endereço IP.

## Recuperar números que já estavam salvos

Na versão 1.20.1, o navegador pode mostrar novamente os contadores compatíveis de um cache antigo do EstatisticasPU, depois de conferir a mesma conta, os formatos e os dados de apoio. As caixas recebem uma indicação de dados salvos e sua data. Um número recuperado assim não passa a ser uma consulta nova, não entra nas provas das métricas e não é exportado como resultado recém-conferido. A criação mais antiga da conta continua exigindo sua própria prova.

Se uma caixa compatível permanecer sem número aproveitável, a rotina pode fazer uma leitura anônima da subpágina pública `Usuário:NOME/PU/Estatísticas` da própria conta configurada. Há uma tentativa por carregamento do programa, dentro do orçamento compartilhado do ciclo. O conteúdo aceito tem até 260.000 caracteres e é lido como dados, sem executar seu texto. Uma cópia dessa fonte pode ficar no armazenamento local da conta e do fuso para evitar a mesma leitura nas visitas seguintes. Nenhuma subpágina é criada ou alterada.

O cálculo das visualizações permanece no navegador e pede somente os dias elegíveis depois da primeira edição de cada artigo. A retomada por até sete dias conserva o corte de uma consulta incompleta, com a data visível, sem enviar o histórico a um servidor próprio de apuração. Uma primeira soma de milhares de artigos ainda pode exigir milhares de consultas aos serviços públicos existentes.

## O que acontece no instalador

A prévia usa números, artigos, estatutos e imagens de exemplo guardados no pacote local. Digitar uma conta ou um texto pessoal não inicia a coleta do histórico, não busca uma foto e não envia o wikitexto à Wikipédia. Belo Horizonte e UFMG são exemplos nos campos, sem preencher sua localização ou formação. Uma instalação nova começa com o horário de Brasília, e uma configuração importada conserva o fuso escolhido.

Se o instalador estiver na própria ptwiki e receber o contexto do MediaWiki, ele pode aproveitar `wgUserName` que já existe naquela página. Essa leitura não faz uma consulta ao login. Abrir diretamente um endereço local ou o GitHub Pages mantém o campo manual, pois o navegador não permite ler o login da Wikipédia. Uma abertura por "Editar painel" pode receber a conta e as escolhas da sessão dona do painel, depois da troca conferida entre as janelas.

Na etapa de instalação, "Verificar instalação" faz consultas públicas somente depois que você aciona o botão. A conferência lê o manifesto do pacote e quatro páginas públicas, o `common.js` da conta, a página de destino, o programa e os estilos. O conteúdo recebido é conferido como texto, sem executar os scripts. O resultado compara os arquivos e não comprova o funcionamento na sessão da conta. Abrir um atalho para o editor ou para o envio de fotos leva ao serviço escolhido, onde valem suas próprias regras de acesso.

O idioma muda os textos da interface e o formato de números e datas. Ele não traduz nomes de artigos, nomes de pessoas ou os textos que você escreveu. A escolha de idioma também não muda a conta consultada nem cria uma cópia diferente do histórico de edições.

## Escolhas e textos guardados na aba

"Ver painel" e "Editar painel" mantêm as escolhas na mesma aba do instalador, em `sessionStorage`, sob o prefixo `perfilwiki-panel-session-v1:`. Essa cópia pode conter o nome da conta, localização, foto, cores e todo o wikitexto dos blocos pessoais, incluindo uma declaração que você tenha escrito. Ao receber uma página publicada, a sessão também pode conservar seu código-fonte público e o número da revisão para preparar o rascunho. O endereço leva apenas um identificador aleatório no fragmento, sem colocar esses valores na URL. O identificador não substitui uma senha nem protege a cópia contra outros programas com acesso à mesma origem do navegador.

A cópia é aceita por até 24 horas desde a última gravação. Uma tentativa de abrir uma cópia vencida ou inválida remove somente aquela entrada do PerfilWiki, quando o navegador permite a remoção. O programa não executa uma limpeza em segundo plano. Fechar a aba costuma encerrar esse armazenamento, mas a restauração de abas do navegador pode conservá-lo. Para apagar a cópia sem depender dessa restauração, limpe os dados do endereço local nas opções do navegador. Essa limpeza pode apagar outros dados da mesma origem.

Se o armazenamento estiver bloqueado, as escolhas continuam na memória da aba aberta e podem se perder no recarregamento. A recuperação por endereço fica restrita aos endereços locais previstos e ao caminho do instalador em `https://danrego.github.io/PerfilWiki/`. Isso não permite que uma página hospedada em outro endereço reabra a mesma sessão.

## Abrir o instalador a partir do painel

Na sessão da própria conta, "Editar painel" abre o endereço fixo `https://danrego.github.io/PerfilWiki/INICIO.html` somente depois do clique. A abertura externa faz a conexão normal com o GitHub Pages. O endereço contém um identificador temporário, sem nome da conta, textos ou escolhas. A transmissão da configuração usa mensagens entre as duas janelas, com origem, janela e identificador conferidos, e não um envio de formulário ou um servidor próprio que receba esses campos.

Depois do clique, o programa pode fazer uma consulta pública de leitura ao código-fonte da página para transmitir o original e seu número de revisão ao instalador. Pode haver uma segunda consulta quando a página principal aponta para uma única subpágina própria reconhecida que contém o painel. Esses pedidos usam a mesma fila, as pausas e a leitura sem credenciais das outras consultas. Esse material já é público, mas pode conter campos pessoais, metas, categorias ou declarações. O instalador pode conservá-lo na sessão da aba junto das escolhas. O código recebido é usado como texto, sem execução de scripts ou predefinições.

O rascunho só substitui uma região reconhecida do PerfilWiki quando encontra um par único de marcadores. A página antiga sem marcadores, uma marcação ambígua ou uma falha de leitura exige conferência manual. O restante do conteúdo não é convertido automaticamente em campos de personalização. As alterações voltam à Wikipédia por cópia, previsão e salvamento feitos pela pessoa, sem pedido de escrita ou acesso autenticado pelo PerfilWiki.

No instalador, "Baixar minhas escolhas" cria um JSON com as opções e os textos pessoais preenchidos. Na sessão do painel instalado, o comando de mesmo nome guarda a configuração, sem ler o wikitexto pessoal que estiver na página. Guarde uma cópia separada desses textos antes de atualizar a página. Confira esse arquivo antes de compartilhar, pois ocultar um campo não retira seu valor do JSON. O programa confere o arquivo importado como dados, sem executar seu conteúdo. Quando uma conta foi reconhecida no contexto da ptwiki, a importação de escolhas de outra conta é recusada.

## Campos que podem ficar públicos

Nome de exibição, localização, informações adicionais, fuso e nomes dos arquivos de imagem podem entrar no carregador preparado. "Ocultar" muda a apresentação e conserva esses valores na configuração. Para retirá-los do código que será público, apague os campos antes de preparar os trechos novamente. Mesmo um `common.js` pessoal pode ser lido por outras pessoas na Wikipédia.

Os blocos de metas, projetos e declarações ficam no wikitexto preparado para a página, fora do carregador e das atualizações dos números. A prévia aproxima a formatação simples sem executar HTML ou predefinições. Ao publicar manualmente um desses blocos, você torna seu texto parte da página e de seu histórico. Apagar o texto depois não apaga automaticamente revisões anteriores. Confira os campos ocultos, o carregador, os blocos e os arquivos baixados antes de qualquer publicação.

As ligações internas dos campos levam à Wikipédia em português. Na prévia, conservam a aparência e o endereço, com navegação bloqueada. A foto ilustrativa usa dados locais, sem pedir uma imagem ao Commons. O repositório e o pacote de publicação devem conter apenas exemplos, sem cópias de páginas pessoais, `common.js` de uma conta, capturas, registros de rede ou rascunhos particulares.

## Serviços consultados pelo painel instalado

| Serviço | Dados enviados e finalidade |
| --- | --- |
| APIs públicas da Wikipédia em português e dos projetos da conta global | Conta, projeto e parâmetros para consultar edições, páginas e registros públicos de agradecimentos. Os grupos públicos só são consultados quando a opção de estatutos está visível. |
| XTools em `xtools.wmcloud.org` | Conta e projeto para consultar a contagem de artigos criados. |
| API de estatísticas em `wikimedia.org` | Títulos e datas para somar visualizações de páginas e conferir a disponibilidade dos dados. |
| GitHub em `raw.githubusercontent.com` | Endereço fixo da lista pública de exclusões do projeto `wikimedia/analytics-refinery`, sem nome da conta no endereço dessa lista. A conexão vai ao GitHub. |
| PageImages e servidores de imagens da Wikimedia | Identificadores das páginas para procurar miniaturas livres e endereços dos arquivos para exibi-las. |
| Wikimedia Commons e Wikifeeds | Arquivo de foto ou capa escolhido e, no modo diário do Commons, a data UTC necessária para consultar a imagem. |

Uma imagem pode exigir uma conexão própria com o servidor que a entrega. Cada arquivo tem autoria e licença próprias. As ligações para o arquivo permitem conferir esses créditos. Se uma miniatura falhar, o título e os números do artigo permanecem no painel. "Envie uma foto" apenas abre o assistente do Commons, sem enviar um arquivo pelo instalador ou preencher o campo automaticamente.

"Imagem do dia da Wikipédia, para visitantes" prepara uma transclusão do calendário que já existe na ptwiki. A própria Wikipédia calcula a data e entrega a página em cache, sem uma consulta de dados do PerfilWiki para cada visitante e sem edição diária da página de usuário. A imagem pode mudar depois da renovação desse cache, e uma aba já aberta não troca sozinha. "Imagem do dia do Commons, na sua sessão" permite uma consulta pública na sessão dona do painel e mantém a última imagem válida se o serviço falhar. Nesse segundo modo, visitantes recebem a imagem da cópia que foi salva manualmente.

## Resultados guardados para evitar consultas repetidas

O painel guarda resultados em `localStorage` com chaves que começam por `perfilwiki-v1-`, separadas por conta e fuso. As cópias aceitas do cache também podem ir para IndexedDB, no banco `perfilwiki-large-cache-v1`, que conserva apenas registros do cache e permite retomar uma cópia que excedeu o espaço do `localStorage`. Esse segundo armazenamento usa o mesmo texto compactado e não acrescenta campos pessoais. A coordenação do transporte usa outras chaves, com prefixo `perfilwiki-transport-v1-`, que guardam horários, pausas dos serviços e a reserva de uma consulta, sem o nome da conta. Podem entrar nesse armazenamento títulos, datas de edições, totais, provas de completude das consultas e as tentativas mais recentes. O cache permite retomar um histórico longo e exibir os últimos dados válidos enquanto uma atualização termina. Os estatutos têm sua própria data de conferência e são reaproveitados por até 24 horas nas atualizações normais.

A primeira cópia de progresso e a cópia final de um ciclo são gravadas, enquanto as cópias intermediárias ficam espaçadas por pelo menos quinze segundos. A gravação é aceita quando pelo menos uma das formas de armazenamento termina. Se as duas falharem, ou se a cópia exceder os limites do codec, o programa avisa uma vez e conserva os dados na memória da aba. O IndexedDB confere o formato, o tamanho e a data de cada registro e impede que uma gravação mais antiga substitua uma mais recente. As cópias carregadas ainda passam pela conferência completa de conta, projeto, fuso e métricas antes de serem usadas.

Uma consulta incompleta conserva o último resultado completo quando existe. A primeira coleta pode mostrar linhas de visualizações já conferidas, com ordem provisória, enquanto o total continua pendente até a cobertura terminar. Falhas de conexão e dados ainda indisponíveis não viram zero. As consultas param ao encerrar a página. Se o navegador impedir o armazenamento e permitir a coordenação por Web Locks, o programa pode trabalhar em memória e precisar repetir a coleta em outra visita. Sem Web Locks, usa uma reserva conferida no armazenamento compartilhado. Quando o navegador impede as duas formas de coordenação, o programa conserva a apresentação e recusa novas consultas, pois não consegue coordená-las com outra aba. O cache completo das métricas não é transmitido ao instalador pelo botão de edição, e o pacote não contém análise de uso ou envio de erros a um servidor próprio do PerfilWiki.

Para retirar a ferramenta, remova a configuração e a chamada correspondente do `common.js`, retire somente os blocos desejados da página e feche as abas antigas. Isso não apaga sozinho as cópias em `localStorage` ou IndexedDB. Para removê-las, use os controles de dados do site, ciente de que apagar todos os dados da Wikipédia pode encerrar sua sessão e remover preferências locais de outras ferramentas. Arquivos JSON e downloads que você salvou precisam ser apagados separadamente se não quiser conservá-los.

## O que os visitantes veem

O JavaScript pessoal atualiza a sessão de quem instalou o painel. Visitantes veem o wikitexto salvo, com seus contadores, artigos, visualizações e data de consulta. Os estatutos opcionais também permanecem nessa cópia até uma nova atualização manual. A capa do calendário da ptwiki é a exceção que pode acompanhar a data pela própria renderização da Wikipédia. O relógio salvo e os outros números não passam a ser atualizados para todo visitante.

Baixar um trecho não o publica. Cada pessoa confere o conteúdo, abre o editor normal e decide se deseja salvar. "Editar painel" na sessão dona do painel abre a personalização, sem atualizar a cópia pública por conta própria. O instalador hospedado precisa estar acessível e acompanhar a versão usada pelo programa.

## Limites dos números

Uma visualização pode ser uma nova visita da mesma pessoa e não comprova leitura provocada por uma edição sua. Cada artigo é contado após sua primeira edição, com início no dia seguinte em UTC e dentro do período escolhido. Como os totais seguem o título atual, uma mudança de nome pode deixar acessos antigos fora da soma. A disponibilidade da API também limita a parte mais antiga da contagem.

As edições e os agradecimentos podem abranger os projetos ligados à conta global. Calendário, sequências e visualizações usam a Wikipédia em português. "Na Wikipédia" conta anos desde a menor data pública conferida entre a conta global e as contas vinculadas, sem trocar essa data pela criação local da ptwiki. Os filtros de cada contador estão no guia. As definições externas podem ser conferidas na [API do MediaWiki](https://www.mediawiki.org/wiki/API:Main_page), nos [scripts pessoais](https://www.mediawiki.org/wiki/Manual:Interface/JavaScript#Personal_scripts), nas [visualizações da Wikimedia](https://doc.wikimedia.org/generated-data-platform/aqs/analytics-api/concepts/page-views.html) e no [PageImages](https://www.mediawiki.org/wiki/Extension:PageImages).
