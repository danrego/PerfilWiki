# Histórico de versões

Cada lançamento reúne suas próprias mudanças, da versão mais recente para a mais antiga.

## 1.20.1 - 2026-10-15, candidato local

- Recupera na tela os últimos contadores compatíveis do EstatisticasPU, com sua data e indicação de dados salvos, sem usar essa apresentação como prova de uma consulta nova.
- Lê os caches antigos da mesma conta e pode consultar uma vez sua subpágina pública de estatísticas quando faltam números, com leitura anônima limitada e dentro do orçamento do ciclo.
- Limita a série pedida de cada artigo ao período posterior à primeira edição, evitando baixar dias que nunca entrariam na soma, e calcula sem consulta os intervalos sem dias elegíveis.
- Conserva por até sete dias as datas de uma consulta incompleta ao atravessar a meia-noite UTC, mostra o corte mantido e retoma a classificação pelos identificadores das páginas quando novas edições mudam a ordem.
- Reúne os campos iniciais de identidade numa única consulta pública, mantendo a conferência separada de cada resposta e as pausas e os limites do transporte.
- Mantém os cálculos e as cópias no navegador, sem servidor de apuração, publicação automática ou mudança nos critérios dos totais de todos os artigos.

## 1.20.0 - 2026-10-15, candidato local

- Mostra primeiro os dados de identidade já conferidos, como o total global de contribuições e a criação mais antiga da conta, enquanto o histórico da ptwiki continua em lotes.
- Começa a apresentar até dez artigos com visualizações conferidas durante uma coleta grande, com ordem provisória e sem inventar um total antes de concluir a cobertura de todos os artigos elegíveis.
- Corrige a caixa Na Wikipédia e a exportação Tempo decorrido para usar a menor data pública conferida entre a conta global e as contas vinculadas, preservando a data local da ptwiki em sua métrica própria.
- Prepara Editar painel na sessão da própria conta para abrir o instalador hospedado com as escolhas atuais, por uma troca conferida entre janelas depois do clique, sem campos pessoais no endereço e sem publicação automática.
- Pode trazer o código-fonte público e a revisão da página para preparar um rascunho, substituindo somente um bloco com marcadores únicos e exigindo substituição manual quando a página antiga não tem essa região.
- Explica o custo da primeira coleta, a diferença entre totais globais e locais, os resultados provisórios e o caminho de cópia, previsão e salvamento manual, mantendo a hospedagem sujeita à conferência de disponibilidade.
- Conserva cópias grandes do cache no IndexedDB, mantém os limites do codec, espaça as gravações intermediárias e avisa quando o navegador não consegue guardar o progresso.

## 1.19.0 - 2026-10-15, candidato local

- Oferece português do Brasil, português de Portugal, inglês, espanhol, francês e italiano para o instalador e o painel, com números e datas no idioma escolhido, sem traduzir textos pessoais ou títulos de artigos.
- Usa exemplos de Belo Horizonte e UFMG e começa novas escolhas no fuso de Brasília, preservando o fuso de configurações importadas.
- Aproveita a conta disponível no contexto da própria ptwiki, sem consulta ao login, e conserva o campo manual em endereços locais ou externos.
- Corrige a fila de leitura para uma consulta por vez, com pausas após respostas lentas e limites do serviço e um orçamento compartilhado de até 40 consultas de dados por ciclo, mais uma consulta opcional de imagens.
- Recusa redirecionamentos, limita o tamanho das respostas e remove a cópia local vencida ou inválida quando alguém tenta reabri-la, preservando outros dados do navegador.
- Acrescenta os avisos completos das bibliotecas do instalador, fixa Node e pnpm, desativa scripts de instalação das dependências e atualiza Vite para 6.4.3.
- Prepara CI de leitura, comparação de duas construções e exportação selecionada para revisão, com guias de privacidade e publicação manual, sem publicação na Wikipédia ou envio desta versão ao GitHub.

## 1.18.0 - 2026-10-15, candidato local

Esta versão fica em teste local, sem publicação na Wikipédia nem envio ao GitHub.

- Permite escolher uma cor para cada rótulo e para cada item das informações adicionais, incluindo suas ligações, nas posições escolhidas do perfil.
- Mantém Padrão do perfil como escolha inicial de cada campo, acompanhando as cores gerais dos rótulos e das informações sem mudar as configurações anteriores.
- Conserva a cor de cada item ao acrescentar ou remover outros itens e ao alternar entre uma linha, linhas separadas ou marcadores.
- Guarda as cores individuais na sessão local, no arquivo de escolhas e nos trechos preparados, sem mudar as contagens, a capa diária ou o processo de instalação manual.
- Atualiza os guias e os exemplos de configuração do candidato local, sem publicação na Wikipédia, purga de cache ou envio ao GitHub.

## 1.17.0 - 2026-10-15, candidato local

Esta versão fica em teste local, sem publicação na Wikipédia nem envio ao GitHub.

- Acrescenta Imagem do dia da Wikipédia, para visitantes, com uma chamada ao calendário existente que acompanha a data UTC quando a Wikipédia renova a página em cache, sem salvamento diário.
- Conserva a capa manual e a Imagem do dia do Commons, na sua sessão, distinguindo os dois calendários e mantendo o arquivo manual guardado ao mudar de opção.
- Mantém a chamada dinâmica nos trechos iniciais e nos downloads do painel, sem exigir JavaScript dos visitantes, consultas à API pelo painel ou a criação de uma predefinição ou módulo.
- Retira o grupo Cores e destaques e leva a cor do painel para Disposição, o fundo das caixas para perto da grade e as cores dos campos para Seu perfil.
- Permite escolher cores para nome, rótulos e informações do perfil, incluindo suas ligações, com opção automática como padrão e sem modificar as regras dos contadores.
- Conserva a prévia ilustrativa local e os arquivos de instalação manual, sem publicação na Wikipédia, purga de cache ou envio ao GitHub.

## 1.16.0 - 2026-10-15, candidato local

Esta versão fica em teste local, sem publicação na Wikipédia nem envio ao GitHub.

- Acrescenta Ver painel para experimentar o painel local sem controles de personalização e Editar painel para voltar às escolhas atuais, sem baixar ou importar JSON.
- Conserva as opções e os textos pessoais na mesma aba, usando um identificador aleatório no endereço local e uma cópia validada na sessão do navegador, sem enviar os dados pela navegação.
- Mostra o horário no formato 10:42 (UTC-4), com os detalhes de data e fuso na dica e no atributo de data, mantendo o comportamento da cópia salva.
- Marca Conta da Wikipédia com um asterisco vermelho e indicação acessível de campo obrigatório, deixando as indicações opcionais menores e discretas.
- Mantém o novo botão restrito ao teste local, sem acrescentá-lo ao código exportado para a Wikipédia, e conserva o JSON como cópia de segurança opcional.
- Oferece Imagem do dia do Commons como alternativa à capa manual, com data UTC e acesso à página do arquivo para consulta dos créditos, sem apagar o nome manual guardado.
- Reaproveita a imagem diária conferida e mantém a anterior em caso de falha, sem alterar o agendamento das métricas. O instalador usa apenas uma ilustração local, e a página publicada permanece com a imagem da última cópia salva manualmente.
- Conserva o horário preparado nos trechos enquanto as escolhas não mudam, para que inserir, conferir e salvar o rascunho local usem o mesmo código.

## 1.15.0 - 2026-10-15, candidato local

Esta versão fica em teste local, sem publicação na Wikipédia nem envio ao GitHub.

- Permite escolher fotos de 64, 96, 128, 160 ou 200 pixels, quadradas ou redondas, mantendo o alinhamento independente e o acesso aos créditos fora do recorte.
- Acrescenta blocos de conteúdo pessoal depois do painel para textos de apresentação, metas, projetos ou uma declaração escrita pela própria pessoa, com wikitexto preservado para revisão manual.
- Oferece uma prévia local simplificada desses textos, sem executar HTML ou predefinições nem enviar o conteúdo para análise na Wikipédia.
- Permite baixar e carregar as escolhas em JSON para retomar a personalização, conservando os textos pessoais fora da configuração de ativação e das atualizações de métricas.
- Explica a futura edição manual na Wikipédia, com previsão e salvamento pela pessoa, sem acrescentar publicação automática nem declarar aprovação pelas regras de robôs.

## 1.14.0 - 2026-10-15, candidato local

Esta versão fica em teste local, sem publicação na Wikipédia nem envio ao GitHub.

- Deixa os estatutos e a data de criação por último nas informações de cada área, depois dos campos adicionais, com Estatutos antes de Conta criada.
- Aplica negrito somente aos rótulos Estatutos e Conta criada, mantendo os valores com o peso normal do texto.
- Acrescenta botões de alinhamento junto da foto, com esquerda, centro e direita, sem mudar o alinhamento do nome, dos contadores ou a posição da capa.
- Conserva a foto à esquerda nas configurações anteriores e atualiza os guias e os arquivos do candidato local, sem publicação na Wikipédia nem envio ao GitHub.

## 1.13.0 - 2026-10-15, candidato local

Esta versão fica em teste local, sem publicação na Wikipédia nem envio ao GitHub.

- Coloca os ajustes de disposição junto de cada rótulo, disponíveis mesmo com um único item, e mantém a configuração anterior da disposição geral.
- Mostra o rótulo assim que ele é preenchido e aceita informações sem dado, sem acrescentar dois-pontos ou espaços de lista vazios.
- Mantém cidade e hora local juntas na mesma linha de informações, antes dos outros campos, quando recebem a mesma posição.
- Acrescenta junto da foto o acesso ao assistente de envio do Wikimedia Commons, sem enviar arquivos pelo instalador.
- Oferece estatutos públicos da Wikipédia em português como campo opcional, com posição própria, consulta anônima e conservação da última resposta conferida.
- Atualiza os guias e os arquivos do candidato local, sem publicar na Wikipédia nem enviar arquivos ao GitHub.

## 1.12.0 - 2026-10-15, candidato local

Esta versão fica em teste local, sem publicação na Wikipédia nem envio ao GitHub.

- Reúne o horário local e o fuso junto de Localização, em Seu perfil.
- Troca os nomes de posição que usavam cabeçalho por atividade e limita o seletor da foto a topo, atividade, os dois ou ocultar, conservando as configurações anteriores no programa.
- Acrescenta uma imagem de capa opcional do Wikimedia Commons acima das informações do topo. A prévia usa uma ilustração local, e o wikitexto mantém a imagem escolhida e o acesso à página do arquivo.
- Permite escolher a cor de fundo do topo, com branco no início e cores de texto e ligações calculadas para a leitura.
- Conserva as posições individuais dos outros campos e as opções dos contadores, sem mudar as contagens ou acrescentar consultas de métricas.
- Atualiza os guias e os arquivos do candidato local, sem publicar na Wikipédia nem enviar arquivos ao GitHub.

## 1.11.0 - 2026-10-15, candidato local

Esta versão fica em teste local, sem publicação na Wikipédia nem envio ao GitHub.

- Adota "No topo" como posição padrão dos campos do perfil. Configurações com posições anteriores explícitas conservam suas escolhas.
- Reúne o tamanho e o alinhamento do nome junto do nome de exibição e a disposição das informações junto dos campos, em "Seu perfil".
- Usa botões com ícones para alinhar o perfil e os contadores à esquerda, ao centro ou à direita, com nomes acessíveis e indicação da escolha ativa. O alinhamento dos contadores continua junto dos ajustes das caixas.
- Conserva as opções de itens, separadores, posições individuais e exportação, sem mudar as contagens ou acrescentar consultas de dados.
- Atualiza os guias e os testes do candidato local, sem publicar na Wikipédia nem enviar arquivos ao GitHub.

## 1.10.0 - 2026-10-15, candidato local

Esta versão fica em teste local, sem publicação na Wikipédia nem envio ao GitHub.

- Permite reunir até oito itens em uma informação adicional, com ligações internas e escolhas de separador, linhas separadas ou lista com marcadores.
- Acrescenta um topo opcional ao painel, com posição independente para nome, localização, informações, foto, data de criação e horário local. Os campos também podem aparecer em mais de uma área ou ficar ocultos.
- Oferece tamanhos de 16 a 36 pixels para o nome de exibição, com 24 pixels no início, e retira a linha pequena que misturava nome e cidades do fuso na prévia.
- Mostra o horário no fuso escolhido com a diferença para UTC e ajusta o horário de verão. A cópia pública salva recebe data e horário, sem aparentar um relógio em andamento.
- Mantém as opções na prévia, no programa e nos trechos preparados, com conferência da instalação e conservação dos dados já verificados nas atualizações.
- Atualiza os guias e os testes locais, sem publicar na Wikipédia ou enviar arquivos ao GitHub.

## 1.9.0 - 2026-10-15, candidato local

Esta versão fica em teste local, sem publicação na Wikipédia nem envio ao GitHub.

- Adota as caixas dentro do painel de atividade como disposição padrão, entre o cabeçalho com a sequência e o gráfico de 12 semanas.
- Conserva as disposições anteriores e as opções de cores, contadores, ordem, destaques, campos pessoais, foto, espaçamento, colunas e períodos de visualizações.
- Usa a mesma composição na prévia, no código inicial e no painel atualizado. As atualizações preservam as caixas internas, seus campos e os últimos números conferidos.
- Prepara o painel integrado em um trecho único para a página de usuário e no download do painel atualizado, com um só convite de instalação.
- Atualiza os guias e os testes do candidato local, sem publicar na Wikipédia nem enviar arquivos ao GitHub.

## 1.8.0 - 2026-10-15, candidato local

Esta versão fica em teste local, sem publicação na Wikipédia nem envio ao GitHub.

- Permite escolher separadamente onde aparecem nome, localização, cada informação adicional, data de criação e foto, com opção de ocultar cada campo e manter a posição padrão anterior.
- Oferece informações em linhas separadas ou na mesma linha, com o separador | e quebra conforme a largura disponível, abaixo da linha do nome.
- Aceita o nome de uma foto já existente no Wikimedia Commons. A prévia usa uma imagem ilustrativa local, e os trechos preparados levam o arquivo escolhido e o acesso à página dele no Commons.
- Usa até cinco colunas no modo Compacto automático, quatro no Confortável e três no Amplo, com opção explícita de cinco e adaptação às telas menores.
- Retira o cabeçalho de exemplo duplicado da prévia e mantém a aparência das ligações internas dos campos, com navegação bloqueada no teste local.
- Atualiza os guias, os arquivos preparados e os testes locais, sem acrescentar consultas de métricas nem publicar na Wikipédia ou no GitHub.

## 1.7.0 - 2026-10-15, candidato local

Esta versão fica em teste local, sem publicação na Wikipédia nem envio ao GitHub.

- Reúne conta, textos e aparência na primeira etapa do instalador, com a prévia ao lado. A segunda etapa prepara a instalação.
- Aceita ligações internas como [[Rio de Janeiro]] e [[Rio de Janeiro|Rio]] na localização e nos valores das informações adicionais, com a mesma leitura segura na prévia e no código exportado.
- Permite mostrar nome, localização, informações e data de criação nas caixas, na atividade ou nos dois blocos. Se apenas um bloco estiver visível, as informações acompanham esse bloco.
- Amplia os dados inventados da prévia para dez artigos e conserva a lista inicial de dez no programa, com mais cem por vez até quinhentos.
- Acrescenta o período Personalizado, com início e fim escolhidos, respeitando a primeira edição de cada artigo e os totais de todos os artigos elegíveis.
- Atualiza a conferência da instalação, os guias e os testes locais, sem publicação na Wikipédia ou no GitHub.

## 1.6.0 - 2026-10-15, candidato local

Esta versão está em teste local e ainda não foi publicada na Wikipédia nem enviada ao GitHub. A validação local passou pelos testes e pela conferência no Chrome e no navegador interno do Codex.

- Troca os ajustes técnicos de cor por uma paleta com nomes, um campo de cores que aceita clique e arraste, um só controle "Clarear ou escurecer" e o campo hexadecimal.
- Acrescenta "Adicionar caixa +" à próxima posição da grade da prévia, com o mesmo seletor de contadores e sem levar esse controle aos trechos exportados.
- Separa o alinhamento do nome do alinhamento das caixas e permite acrescentar localização e até três campos de texto abaixo dele.
- Oferece uma data opcional de criação da conta por extenso, usando o registro global e os registros locais vinculados, com aviso quando os dados forem incompletos. A caixa de anos na Wikipédia mantém sua regra local.
- Simplifica a última etapa e acrescenta "Verificar instalação", que lê somente o texto público das quatro páginas necessárias, sem login, execução de código ou edições.
- Conserva os arquivos compartilhados completos, os destinos, os resumos, a cópia e os downloads no índice de manutenção, acessível pela última etapa.

## 1.5.0 - 2026-10-15, candidato local

Esta versão está em teste local e ainda não foi publicada na Wikipédia nem enviada ao GitHub.

- Amplia a seleção de fusos por região, com Havaí e mais opções nas Américas, Europa, Ásia, África e Oceania, mantendo as diferenças de UTC e o ajuste sazonal do navegador.
- Retira o menu Opções e o seletor de posição das caixas. A estrela aplica ou retira o destaque, e a alça permite ordenar por arraste ou pelas setas do teclado.
- Oferece 24 contadores com agradecimentos enviados, média de bytes acrescentados por edição, maior acréscimo e maior remoção em uma edição, mantendo as oito caixas anteriores na seleção inicial.
- Consulta o registro público de agradecimentos enviados da Wikipédia em português somente quando essa caixa está selecionada. As caixas de bytes reaproveitam o histórico completo já consultado.
- Atualiza a documentação, os arquivos preparados para instalação e os testes locais, sem publicação na Wikipédia ou no GitHub.

## 1.4.0 - 2026-10-15, candidato local

Esta versão está em teste local e ainda não foi publicada na Wikipédia nem enviada ao GitHub.

- Reduz a escolha de fuso a 21 opções usuais, sem busca, mantendo um fuso válido já escolhido ou recebido do navegador.
- Reúne os ajustes de aparência em grupos recolhíveis e mantém a prévia à vista em telas largas.
- Leva a seleção, a remoção, a ordem e o destaque de cada caixa para a própria prévia, com posição acessível pelo teclado.
- Oferece vinte contadores com edições nos últimos 30 dias, média por dia ativo, anos com edições e o mês com mais edições, mantendo as oito caixas anteriores na seleção inicial.
- Reaproveita o resumo completo do calendário nas quatro novas caixas, sem acrescentar consultas de rede nem controles de edição aos trechos exportados.

## 1.3.0 - 2026-10-15, candidato local

Esta versão está em teste local e ainda não foi publicada na Wikipédia nem enviada ao GitHub.

- Troca o seletor nativo de cores por um controle do instalador que fecha ao clicar fora, pressionar Escape ou usar o botão de fechar.
- Acrescenta o espaçamento Amplo e a escolha de duas, três ou quatro colunas para as caixas, além da disposição automática.
- Oferece dezesseis opções de contadores com edições em artigos, edições em discussões, meses com edições e o dia com mais edições, mantendo as oito caixas anteriores na seleção inicial.
- Reaproveita o histórico já consultado nas novas caixas, sem acrescentar consultas de rede.
- Atualiza para "Meu impacto na Wikipédia" o título do texto de exemplo entre os blocos na prévia.

## 1.2.0 - 2026-10-15, candidato local

Esta versão está em teste local e ainda não foi publicada na Wikipédia nem enviada ao GitHub.

- Oferece doze opções de contadores com a nova caixa "Dias com edições", mantendo as oito caixas anteriores na seleção inicial.
- Permite escolher quais caixas recebem fundo de destaque e a cor desse fundo, com texto ajustado para a leitura.
- Permite colocar a atividade antes das caixas ou manter as caixas primeiro, sem mover os outros textos da página.
- Troca as setas de ordenação por arrastar e soltar e por uma escolha de posição que também funciona pelo teclado.
- Mostra um só convite de instalação depois do último bloco visível, inclusive quando apenas as caixas aparecem.
- Conserva o nome de exibição opcional, a lista organizada de fusos e os arquivos completos para conferência local.

## 1.1.1 - 2026-10-15, candidato local

Esta versão está em teste local e ainda não foi publicada na Wikipédia nem enviada ao GitHub.

- Preenche a conta a partir da configuração da própria página quando o instalador está no contexto da Wikipédia em português, sem consultas de autenticação.
- Separa a conta da Wikipédia do nome de exibição opcional, mantendo a conta real nas consultas, nos destinos e na validação dos dados.
- Oferece os fusos IANA aceitos pelo navegador, com UTC, regiões em português, busca e diferença atual para UTC.
- Retira os textos laterais dispensáveis da primeira etapa e dá mais destaque a "Escolher outra cor".
- Conserva o teste local, os arquivos completos e os atalhos para futura instalação manual.

## 1.1.0 - 2026-10-15, candidato local

Esta versão está em teste local e ainda não foi publicada na Wikipédia nem enviada ao GitHub.

- Adota o instalador em três telas, com conta, personalização e arquivos de instalação.
- Aplica cores, espaçamento, seleção e ordem das oito caixas ao programa e aos trechos exportados.
- Oferece caixas opcionais de artigo mais editado e bytes acrescentados ou removidos, mantendo as oito anteriores no padrão.
- Alinha o conteúdo das caixas à direita por padrão e oferece alinhamento à esquerda ou ao centro.
- Permite escolher os blocos visíveis, a posição conjunta ou separada e a aba inicial de visualizações.
- Usa o título "Atividade na Wikipédia em Português" e a etapa "Personalize seu painel".
- Usa dados inventados na prévia local e mantém os trechos iniciais com "Aguardando dados".
- Conserva o índice completo de manutenção em Arquivos.html e documenta a ordem de atualização.

## 1.0.1 - 2026-10-15

- Corrige a instalação para usar a folha compartilhada RitmoPU-estilos, que já tem o modelo CSS higienizado.
- Retira a necessidade de mudar o modelo de conteúdo de uma página nova para instalar a cópia compartilhada.
- Mantém o destino correto nos dois downloads, nos blocos iniciais e nos atalhos do índice.
- Explica a diferença entre o CSS local e a página que o TemplateStyles pode carregar.

## 1.0.0 - 2026-10-15

- Reúne os contadores e o painel de atividade em um programa e um carregador.
- Compartilha o histórico público da Wikipédia em português entre os contadores e o calendário, com continuação de lotes pendentes.
- Usa a própria conta conectada e o fuso configurado, sem números pessoais ou dados iniciais de outra conta.
- Conserva a posição escolhida para as caixas e o painel e permite atualizar seus trechos públicos separadamente.
- Mantém os cortes individuais de visualizações depois da primeira edição e soma todos os artigos elegíveis.
- Faz apenas consultas públicas de leitura e conserva o último resultado completo quando uma consulta falha.
- Fornece documentação, arquivos completos e índice local com destinos, resumos, downloads e cópia manual.
