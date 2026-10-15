# Instalar ou atualizar o PerfilWiki

O PerfilWiki usa um programa compartilhado e os blocos que você coloca na sua página de usuário. O seu `common.js` carrega o programa quando você está conectado. Os visitantes veem os números salvos na página.

Abra o [índice de copiar e colar](../INICIO.html) da distribuição baixada. Cada etapa traz o destino, o conteúdo inteiro, o resumo de edição, o download e a ligação para o editor.

## Antes de começar

O programa, os estilos e a documentação compartilhados precisam ser publicados manualmente nos destinos do índice. A distribuição não confirma que esses arquivos já estejam na Wikipédia. Se você vai usar a instalação compartilhada, comece depois que ela estiver disponível.

Informe o nome da sua conta no índice. Ele prepara os destinos do `common.js` e da subpágina `/PU` e substitui `SEU_NOME_DE_USUARIO` nas marcas dos dois trechos iniciais. Os botões de copiar e baixar passam a usar os trechos preparados para sua conta. Se abrir os arquivos `.wiki` diretamente, substitua essa marca manualmente pelo nome exato da conta.

## 1. Carregar o programa

Entre na sua conta da Wikipédia em português e abra [seu common.js](https://pt.wikipedia.org/wiki/Especial:Minha_p%C3%A1gina/common.js?action=edit). Preserve o código que já estiver no arquivo.

Copie o arquivo inteiro `Carregador_PerfilWiki.js` pelo índice e acrescente-o uma só vez. Esse carregador confere a conta e a página antes de buscar o programa. Ele usa a conta conectada e o fuso do navegador. Uma importação isolada faria o navegador buscar o programa também em páginas onde a rotina não será usada.

Se preferir escolher o fuso, coloque a configuração abaixo antes do carregador completo:

```javascript
window.PerfilWikiConfig = {
    timeZone: 'America/Sao_Paulo'
};
```

Cole o conteúdo inteiro de `Carregador_PerfilWiki.js` logo depois dessa configuração. Não acrescente outra chamada de importação.

Você também pode informar `user`, com o nome exato da própria conta. Sem esse campo, o programa usa o nome da conta conectada. Sem `timeZone`, usa o fuso obtido no navegador, com UTC como alternativa quando esse fuso não puder ser obtido.

O nome "Daniel G Rego" no endereço de importação dentro do carregador aponta para o programa compartilhado e deve permanecer ali. Ele não escolhe de quem serão os números.

## 2. Colocar as caixas e o painel na página

Abra [sua página de usuário](https://pt.wikipedia.org/wiki/Especial:Minha_p%C3%A1gina?action=edit) em "Editar código-fonte". Use os blocos iniciais do índice para escolher onde as caixas e o painel de atividade aparecerão. Preserve os outros textos e as categorias.

A folha de estilos compartilhada é carregada com:

```wikitext
<templatestyles src="Usuário:Daniel G Rego/PerfilWiki-estilos" />
```

Use uma só ocorrência de cada identificador fornecido pelo índice. O painel de atividade mantém o identificador `dan-pu-ritmo`, e as caixas mantêm os identificadores compatíveis com a apresentação anterior.

Comece com os blocos que aguardam consulta. Copiar números publicados na página de outra pessoa não prepara a sua conta.

As caixas e o painel podem ficar em posições independentes. Não envolva toda a página em um novo bloco para instalar a ferramenta.

Salve, feche as abas antigas da Wikipédia e abra a versão de leitura da sua página. A primeira coleta pode precisar de mais lotes. Mantenha a página aberta e visível enquanto o andamento aparece.

## 3. Atualizar a cópia que os visitantes veem

Quando a consulta terminar, use a opção de download. As caixas e o painel de atividade podem ser exportados em trechos separados. Abra o arquivo em um editor de texto, confira a conta e a data e copie o trecho inteiro.

Substitua somente o bloco correspondente na página. Não cole um segundo painel junto do primeiro. Se o trecho baixado já tiver a chamada dos estilos, mantenha uma só chamada para aquele conjunto.

Use "Mostrar previsão" e confira a página antes de salvar. O download e a atualização da sua sessão não salvam a página pública.

## Migrar do RitmoPU e do EstatisticasPU

Guarde uma cópia do trecho atual do seu `common.js`. Retire apenas os blocos de configuração e carregamento antigos de RitmoPU e EstatisticasPU, inclusive carregadores que importem esses dois programas por outra função. Coloque a chamada única do PerfilWiki e a configuração que escolher.

Preserve o RevisaWiki e os outros scripts do arquivo. Não substitua o `common.js` inteiro pelo exemplo deste guia.

Atualize a chamada dos estilos e os blocos da página pelos trechos do índice. Os identificadores compatíveis permitem manter a apresentação das caixas e do painel de atividade. A ferramenta confere a identidade dos dados antes de reaproveitá-los. Se um conjunto antigo não for aceito, uma nova coleta precisa terminar antes de você atualizar a cópia pública.

Depois de salvar, feche as abas antigas para encerrar os programas anteriores. Reabra sua página e confira a conta, o fuso e o andamento da consulta. Baixe os trechos atualizados e publique manualmente cada bloco que desejar substituir.

## Manter uma cópia própria do programa

A importação compartilhada é suficiente para uma instalação comum. Quem preferir hospedar a própria cópia deve publicar o JavaScript completo em uma subpágina `.js` da própria conta e os estilos em uma subpágina com modelo de conteúdo `sanitized-css`. Depois, precisa ajustar a única chamada de importação dentro do carregador completo e a chamada de `templatestyles` para esses destinos. Preserve as verificações de conta e página do carregador. Os campos opcionais `stylesPage` e `documentationPage` em `PerfilWikiConfig` escolhem os endereços usados nos trechos exportados. Esses campos recebem títulos completos de páginas da Wikipédia, e não URLs.

Use os arquivos completos da mesma versão. O CSS foi preparado para TemplateStyles. Uma folha aceita pelo navegador pode ter propriedades ou seletores recusados pela extensão.

## Se algo não carregar

| O que aparece | O que conferir |
| --- | --- |
| O bloco ainda aguarda consulta | Conta conectada, configuração antes da importação e versão de leitura da própria página |
| O painel aparece sem os estilos | Chamada de `templatestyles` e destino da folha compartilhada |
| A coleta ainda está em andamento | Página aberta e visível, andamento dos lotes e eventual pausa pedida pelo serviço |
| Os visitantes veem números antigos | Download e substituição manual dos blocos da página |
| O dia muda no horário inesperado | `timeZone`, pois a atividade usa o fuso escolhido e as visualizações usam UTC |
| Abas ou expansões não respondem | Painel único, identificadores sem duplicação e abas antigas encerradas |

## Retirar a ferramenta

Remova do `common.js` a configuração do PerfilWiki e a chamada que o importa. Feche as abas antigas. Se também quiser retirar a apresentação pública, apague somente as caixas e o painel da página de usuário.

O restante da página e os outros scripts podem permanecer. A ferramenta não apaga a página nem altera sua contagem oficial de edições.
