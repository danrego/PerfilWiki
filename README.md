# PerfilWiki

O PerfilWiki reúne as caixas de estatísticas e o painel de atividade do RitmoPU e do EstatisticasPU para páginas de usuário da Wikipédia em português. A página mantém as caixas, o calendário, as metas de dias seguidos e as listas de artigos com suas visualizações.

A versão inicial é **1.0.0**. As mudanças de cada versão ficam no [histórico](CHANGELOG.md), com uma lista própria para cada lançamento.

## Instalação

Abra o [índice de copiar e colar](INICIO.html) da distribuição baixada. Ele apresenta o destino de cada arquivo, o conteúdo completo, o resumo de edição, o download e a ligação para o editor da Wikipédia. O [guia de instalação](docs/INSTALACAO.md) explica as etapas e a migração.

Os arquivos compartilhados precisam ser publicados manualmente nos destinos indicados pelo índice antes de usar a importação. O pacote não confirma que esses endereços já estejam instalados.

A instalação tem três partes: o programa compartilhado, o trecho no seu `common.js` e os blocos colocados na sua página de usuário. As caixas e a atividade podem ficar em posições independentes. O programa usa a conta conectada e o fuso do navegador, com UTC como alternativa se o fuso não puder ser obtido. A configuração permite escolher outro fuso.

Copie o arquivo inteiro `Carregador_PerfilWiki.js` pelo índice e acrescente-o ao `common.js`. Ele confere a conta e a página antes de buscar o programa. Não use uma importação isolada no lugar desse carregador.

O destino `Usuário:Daniel G Rego/PerfilWiki.js` dentro do carregador aponta para o programa compartilhado. Seus números vêm da conta configurada. Preserve os outros scripts do arquivo.

Quem já usa RitmoPU e EstatisticasPU deve seguir a migração do índice e manter uma só chamada do PerfilWiki. Depois de salvar, feche as abas antigas da Wikipédia e abra sua página novamente. Isso encerra as instâncias anteriores dos scripts.

Informe sua conta no índice antes de copiar os trechos iniciais. Ele substitui a marca `SEU_NOME_DE_USUARIO` nos dois blocos e prepara os destinos pessoais. Se usar os arquivos diretamente, faça essa substituição manualmente. O bloco inicial aguarda a consulta da sua conta.

Quem já tem uma página pronta deve conservar os textos, as caixas e a atividade nas posições escolhidas, substituindo somente os blocos correspondentes.

## Seus números e a página pública

Quando você está conectado, o script consulta os dados públicos da conta configurada e atualiza sua tela. A primeira consulta pode levar mais tempo, pois precisa percorrer o histórico. A coleta depende da página aberta e visível.

Os visitantes veem o conteúdo que você salvou na página. Para atualizar essa cópia, baixe os trechos das caixas e do painel de atividade, confira os arquivos e substitua os blocos correspondentes. Use "Mostrar previsão" antes de salvar. O PerfilWiki não publica a página em seu nome.

As consultas e a cópia salva têm horários próprios. Uma consulta incompleta conserva o último resultado completo e informa que ainda faltam dados. Falha de conexão não significa zero.

## O que os números contam

| Número | Onde é contado |
| --- | --- |
| Contribuições | Projetos ligados à conta global |
| Agradecimentos recebidos | Projetos ligados à conta global que oferecem o registro público de agradecimentos |
| Artigos criados | Wikipédias ligadas à conta, pelo XTools, com os filtros explicados no guia |
| Artigos diferentes editados | Wikipédia em português, apenas artigos existentes, sem redirecionamentos |
| Reversões | Wikipédia em português, pelas etiquetas de reversão aceitas |
| Predefinições, módulos e scripts criados | Wikipédia em português, com conferência da criação e do tipo atual da página |
| Calendário e dias seguidos | Edições públicas da Wikipédia em português, no fuso escolhido |
| Visualizações | Artigos editados na Wikipédia em português |

As visualizações começam no primeiro dia completo em UTC depois da sua primeira edição pública em cada artigo. As abas de 30 dias, 90 dias e 12 meses respeitam esse início. O total acumulado usa a série disponível desde 1 de julho de 2015.

Cada soma abrange todos os artigos aceitos. A lista mostra até 500 por período, com dez no início e mais cem por expansão. Os acessos podem se repetir e não medem pessoas únicas nem visitas causadas pela sua edição.

## Código e dados

O programa faz consultas públicas e guarda resultados no navegador. Código e documentação usam [CC BY-SA 4.0](LICENSE). Leia [como os dados são usados](docs/PRIVACIDADE.md) e [as origens e os créditos](docs/LICENCAS_E_CREDITOS.md).

A [arquitetura](docs/ARQUITETURA.md) explica os módulos e o histórico compartilhado. O [guia de testes](docs/TESTES.md) separa os contratos locais das consultas reais e dos testes de navegador.

Os dados de edições vêm da [API do MediaWiki](https://www.mediawiki.org/wiki/API:Usercontribs). As visualizações usam a [API de estatísticas da Wikimedia](https://doc.wikimedia.org/generated-data-platform/aqs/analytics-api/reference/page-views.html). As regras de cada contador precisam ser lidas junto do alcance indicado na tabela acima.
