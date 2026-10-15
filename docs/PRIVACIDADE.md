# Dados e privacidade

O PerfilWiki consulta informações públicas sobre a conta configurada. Entram nessas consultas as edições, os registros públicos de agradecimentos, os projetos ligados à conta global, as páginas criadas ou editadas e as visualizações dos artigos aceitos pelos filtros.

O nome de usuário e os títulos consultados fazem parte dos pedidos aos serviços. As visualizações vêm de totais públicos por página e dia. O programa não recebe uma lista de leitores. O repositório público não contém números iniciais, capturas, página pessoal completa, histórico pessoal ou cópia do common.js de uma conta.

## Serviços consultados

- A API da Wikipédia em português fornece o histórico e as informações atuais das páginas.
- As APIs dos projetos ligados à conta global fornecem os contadores e registros disponíveis em cada projeto.
- O XTools fornece a contagem de artigos criados nas Wikipédias consultadas.
- A API de estatísticas da Wikimedia fornece as visualizações e os dados usados para conferir sua disponibilidade.
- A lista pública de exclusões mantida pela Wikimedia pode ser consultada para conferir as listas de artigos mais vistos.
- PageImages e os servidores de imagens da Wikimedia fornecem as miniaturas opcionais.

O nome informado no índice de instalação fica naquela página local e prepara os trechos e os links. O índice não faz consultas externas. A Wikipédia só é aberta quando você escolhe um link.

Os pedidos de dados feitos pelo programa instalado usam leitura pública, sem enviar as credenciais da sessão. O programa não pede senha ou token de edição e não salva páginas na Wikipédia.

As imagens são opcionais. Se uma miniatura falhar, o título e os números do artigo permanecem. A consulta procura imagens livres pelo PageImages. Cada arquivo tem sua própria autoria e licença.

## Resultados guardados no navegador

O navegador guarda resultados para retomar consultas e evitar trabalho repetido. Esses dados podem conter nomes e números de páginas, datas de edições, totais, períodos consultados e provas usadas na conferência dos resultados. A cópia local pertence à conta, à wiki e ao fuso configurados.

Uma consulta incompleta conserva o último grupo completo. Um erro de conexão, uma resposta genérica do servidor ou dados ainda indisponíveis não viram zero.

As consultas param quando a página é encerrada. Se o navegador impedir o armazenamento, a sessão pode usar os resultados em memória, mas talvez precise repetir o trabalho na próxima visita.

Para retirar a ferramenta, remova sua configuração e sua chamada do `common.js`, feche as abas antigas e retire da página somente o bloco que desejar apagar.

## O que os visitantes veem

O JavaScript pessoal atualiza a tela de quem instalou a ferramenta. Os visitantes veem a cópia de wikitexto salva na página de usuário. Essa cópia pode mostrar os contadores, os títulos dos artigos, as visualizações e a data da consulta. As caixas e o painel de atividade podem ser baixados em trechos separados, para substituir somente os blocos correspondentes.

Baixar o painel não publica o arquivo. Confira seu conteúdo antes de colá-lo na página e salvar. A data completa de "Última edição consultada" se refere à edição recebida naquela consulta.

## Limites dos números

Uma visualização não corresponde a uma pessoa única. A contagem não permite afirmar que alguém leu o artigo por causa de uma edição sua. Os títulos atuais também podem deixar de fora acessos antigos de páginas que mudaram de nome.

As contribuições e os agradecimentos podem abranger outros projetos da conta global. O calendário, as sequências e as visualizações usam a Wikipédia em português. O guia explica os filtros de cada contador.

As definições externas estão na documentação da [API do MediaWiki](https://www.mediawiki.org/wiki/API:Main_page), dos [scripts pessoais](https://www.mediawiki.org/wiki/Manual:Interface/JavaScript#Personal_scripts), das [visualizações da Wikimedia](https://doc.wikimedia.org/generated-data-platform/aqs/analytics-api/concepts/page-views.html) e do [PageImages](https://www.mediawiki.org/wiki/Extension:PageImages).
