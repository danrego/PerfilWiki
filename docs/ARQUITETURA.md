# Como o programa está organizado

O PerfilWiki consulta o histórico público da Wikipédia em português uma vez por ciclo e compartilha esse resultado com os cálculos de atividade e os contadores que precisam dele. As consultas da conta global e das visualizações usam seus serviços próprios, dentro da mesma rotina de atualização.

O JavaScript distribuído é montado a partir dos arquivos em `src`. O carregador pessoal importa esse arquivo uma só vez. A distribuição também traz os estilos, os dois trechos iniciais e a documentação para publicação manual.

## Partes do código

| Arquivo | Trabalho |
| --- | --- |
| `Configuration.js` | Confere a conta, o fuso, os títulos de estilos e documentação e os endereços públicos permitidos |
| `History.js` | Percorre o histórico da ptwiki, segue a continuação e confere as revisões recebidas |
| `Statistics.js` | Calcula os contadores com o histórico compartilhado e consulta os números de alcance global |
| `PageviewsCore.js` | Calcula a atividade, as sequências e as visualizações depois da primeira edição em cada artigo |
| `Coordinator.js` | Reúne histórico, contadores e visualizações em um estado conferido e prepara as atualizações de progresso |
| `CardsView.js` | Prepara as caixas na sessão e o trecho de wikitexto dos contadores |
| `ActivityView.js` | Prepara o calendário, as metas, as listas e o trecho de wikitexto da atividade |
| `Presenter.js` | Prepara a última edição e confere as miniaturas opcionais |
| `Cache.js` | Compacta e restaura os resultados guardados no navegador |
| `Runtime.js` | Cuida do transporte, das abas, dos controles, dos intervalos e dos downloads |
| `PerfilWiki-estilos.css` | Define a aparência das caixas e do painel, com regras preparadas para TemplateStyles |

## Conta, página e configuração

A rotina exige a Wikipédia em português, uma página de leitura do grupo "Usuário" e a conta conectada igual à configurada. O nome do dono da página também precisa corresponder à conta. A ferramenta não inicia o coletor em uma página de outra pessoa.

`PerfilWikiConfig` aceita `user`, `timeZone`, `stylesPage` e `documentationPage`. Sem `user`, usa a conta conectada. Sem `timeZone`, usa o fuso do navegador, com UTC como alternativa. As duas páginas opcionais recebem títulos completos da Wikipédia e são usadas na exportação.

Os arquivos iniciais usam `data-perfilwiki-user="SEU_NOME_DE_USUARIO"`. O índice substitui a marca pelo nome informado antes de copiar ou baixar os trechos. A importação continua usando a conta conectada. A marca no HTML informa a quem o bloco pertence e precisa corresponder a essa conta.

As caixas e a atividade mantêm contêineres separados. Os identificadores antigos compatíveis permitem conservar sua posição na página. A ferramenta não recebe uma página pessoal completa como modelo nem precisa reordenar os outros textos.

## Histórico e contadores

O histórico guarda revisões distintas e os campos necessários às contagens, como página, domínio, título, data, criação e etiquetas. A continuação pertence ao percurso em andamento. Respostas incompletas, tokens repetidos e registros incompatíveis impedem que uma coleta seja declarada completa.

As consultas incrementais retomam o histórico com sobreposição para conferir edições próximas ao ponto de retomada. A reconstrução periódica permite refazer o conjunto público. Cada etapa confere a identidade da conta e as datas antes de reutilizar dados.

Os contadores têm alcances diferentes. Edições e agradecimentos usam a conta global. Artigos criados usam as Wikipédias ligadas, pelo XTools, sem Wikipédias de teste e com os filtros definidos na documentação. Artigos diferentes editados, reversões e criações técnicas usam a ptwiki.

A caixa da melhor sequência recebe o mesmo resultado de atividade usado pelo painel. A caixa "Na Wikipédia" usa o registro público local da conta. Um resultado ausente permanece desconhecido, sem herdar uma data ou um número de outra pessoa.

## Visualizações e datas

A atividade divide os dias pelo fuso escolhido. As visualizações usam UTC e começam no primeiro dia completo depois da primeira edição pública da conta em cada artigo. As quatro janelas terminam no último dia UTC completo.

A soma de cada período abrange todos os artigos aceitos. O núcleo pode manter uma classificação maior durante o cálculo, mas a apresentação mostra até 500 artigos por período. Classificação concluída e total concluído são conferidos separadamente.

As séries precisam corresponder à página, ao título, ao período e ao corte de primeira edição. Uma edição nova no mesmo artigo não muda esse corte. Falhas e dados ainda não disponíveis não viram zero. A documentação das métricas explica as provas exigidas para dias omitidos e respostas 404.

## Transporte, armazenamento e navegação

O transporte aceita somente pedidos públicos previstos na configuração. Usa `GET` com `credentials: 'omit'` e recusa ações de escrita e pedidos de autenticação ou tokens. As pausas dos serviços são respeitadas. Consultas repetidas pelo mesmo ciclo podem compartilhar a resposta.

O armazenamento usa um prefixo do PerfilWiki com conta e fuso. Os estados são conferidos antes de serem aceitos, inclusive os candidatos de migração do RitmoPU. Uma cópia de outra conta ou de outro fuso não passa a representar os números da instalação atual.

O controle entre abas evita que duas páginas façam a mesma coleta. Sair da página cancela os pedidos e invalida os trabalhadores antigos. Uma volta pelo histórico do navegador agenda outro ciclo. O resultado precisa pertencer à geração atual para alterar a tela e a cópia local.

## Saída pública

O download dos contadores e o download da atividade são separados. Cada um prepara seu próprio trecho, com a chamada dos estilos e a identidade da conta. A data da última edição no trecho público é completa, sem depender do relógio do visitante.

O programa não envia esse texto para salvar uma página. A pessoa abre o arquivo, confere e cola o trecho na Wikipédia. O carregador pessoal e o wikitexto público têm funções diferentes e não devem ser colados um no lugar do outro.

## Construção da distribuição

`npm run build` executa `scripts/build.py`. O script lê a versão em `package.json`, confere `docs/RELEASES.json`, reúne os módulos e escreve os arquivos completos em `dist/1.0.0` para esta versão.

`scripts/build_index.py` prepara o índice da raiz e o índice da distribuição com os mesmos arquivos e metadados. Os textos ficam incorporados ao HTML, com tamanho e SHA-256. Os trechos iniciais são personalizados no navegador depois de informar a conta, sem alterar os arquivos genéricos do repositório.

O [manifesto de origem](PROVENIENCIA.json) guarda os hashes das fontes herdadas. O [guia de testes](TESTES.md) explica os comandos e os limites da verificação.
