# Origens, licenças e créditos

O PerfilWiki foi preparado a partir do RitmoPU 8.1.0, do EstatisticasPU 1.5.1 e dos estilos usados por essas ferramentas. A página de usuário mantém a apresentação das caixas e do painel de atividade.

| Material de origem | Referência pública |
| --- | --- |
| RitmoPU | [Usuário:Daniel G Rego/RitmoPU.js](https://pt.wikipedia.org/wiki/Usu%C3%A1rio:Daniel_G_Rego/RitmoPU.js) |
| EstatisticasPU | [Usuário:Daniel G Rego/EstatisticasPU.js](https://pt.wikipedia.org/wiki/Usu%C3%A1rio:Daniel_G_Rego/EstatisticasPU.js) |
| Estilos | [Usuário:Daniel G Rego/RitmoPU-estilos](https://pt.wikipedia.org/wiki/Usu%C3%A1rio:Daniel_G_Rego/RitmoPU-estilos) |
| Guia e regras das métricas | [Guia do RitmoPU](https://pt.wikipedia.org/wiki/Usu%C3%A1rio:Daniel_G_Rego/RitmoPU) e [documentação técnica](https://pt.wikipedia.org/wiki/Usu%C3%A1rio:Daniel_G_Rego/RitmoPU/Documenta%C3%A7%C3%A3o_t%C3%A9cnica) |

A distribuição 1.0.1 mantém a folha compartilhada `Usuário:Daniel G Rego/RitmoPU-estilos` como destino público, com as mesmas regras do arquivo `PerfilWiki-estilos.css`. Essa folha já tem o modelo de conteúdo exigido por TemplateStyles.

O [manifesto de origem](PROVENIENCIA.json) guarda os arquivos de origem e seus hashes, com autoria e licença. Os endereços públicos permitem consultar as páginas, que podem mudar depois da preparação do pacote.

## Licença do pacote

O código próprio e a documentação do PerfilWiki são distribuídos sob [CC BY-SA 4.0](../LICENSE). O campo de licença do pacote usa `CC-BY-SA-4.0`. Os avisos das fontes e o manifesto de origem acompanham a distribuição. Daniel G Rego é o autor indicado nos arquivos de origem relacionados no manifesto.

Não substituir os avisos de um componente copiado pela licença geral do repositório. Qualquer arquivo com licença própria precisa conservar seu aviso e suas condições.

## Componentes do instalador

O instalador compilado contém React 19.2.0, React DOM 19.2.0, Scheduler 0.27.0 e o auxiliar de pré-carregamento de módulos gerado pelo Vite 6.4.3. Esses componentes usam MIT. O arquivo [THIRD_PARTY_NOTICES.txt](../THIRD_PARTY_NOTICES.txt) conserva seus avisos completos de autoria, permissão e garantia e acompanha o instalador e a distribuição. A licença CC BY-SA do código próprio não substitui esses termos.

As ferramentas de compilação e teste são recuperadas pelas versões e pelos hashes de integridade do lockfile. A pasta node_modules não acompanha o pacote público. [BUILD_TOOLCHAIN.json](../BUILD_TOOLCHAIN.json) informa as versões fixadas, as referências oficiais conferidas e os componentes presentes no programa compilado. A existência de um fluxo de CI preparado não quer dizer que ele já tenha sido executado no GitHub.

## Recursos do MediaWiki e imagens

A página pública usa TemplateStyles e os controles de recolhimento do MediaWiki. As miniaturas são pedidas pelo PageImages, sem redistribuir no repositório as fotos usadas nas prévias de versões anteriores.

Cada imagem tem sua própria autoria e licença. O filtro de imagens livres do PageImages não muda as condições do arquivo original nem faz a imagem receber a licença do PerfilWiki.

## Documentação dos serviços

Os parâmetros das consultas são explicados nas documentações de [Usercontribs](https://www.mediawiki.org/wiki/API:Usercontribs), [Revisions](https://www.mediawiki.org/wiki/API:Revisions), [TemplateStyles](https://www.mediawiki.org/wiki/Extension:TemplateStyles), [PageImages](https://www.mediawiki.org/wiki/Extension:PageImages) e da [API de visualizações da Wikimedia](https://doc.wikimedia.org/generated-data-platform/aqs/analytics-api/reference/page-views.html).

Essas referências explicam os serviços consultados. Elas não são uma declaração de autoria ou licença do código do PerfilWiki.
