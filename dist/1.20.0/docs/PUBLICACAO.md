# Preparar a publicação

O candidato 1.20.0 reúne o instalador, o programa da página de usuário e os guias em um pacote local. A situação da hospedagem e dos arquivos publicados precisa ser conferida junto da entrega, pois abrir esta distribuição não atualiza o GitHub nem a Wikipédia. Os relatórios de cada versão guardam as verificações que realmente ocorreram.

## Do computador para o GitHub

Depois dos testes, prepare uma pasta nova com `python3 scripts/export_public.py --output CAMINHO_NOVO`. O comando seleciona fontes, testes, documentação, avisos de licença e a distribuição atual, sem copiar `.git`, dependências instaladas, prévias antigas ou registros particulares de teste. O arquivo `PUBLIC_MANIFEST.json` permite conferir o tamanho e o SHA-256 de cada arquivo. A exportação não faz um commit nem envia conteúdo.

Compare a exportação com a versão atual de `main` antes de criar uma branch para revisão. Preserve o histórico público que já existe. O pacote selecionado não autoriza copiar toda a pasta de trabalho, e uma verificação por padrões não garante que todo texto pessoal tenha sido encontrado. Confira os exemplos, os arquivos novos e o diff inteiro antes do envio.

O fluxo de CI preparado usa somente permissão de leitura. Ele instala as versões fixadas sem scripts de instalação das dependências, constrói o pacote duas vezes e executa os testes. A configuração não publica um site, não cria um lançamento e não acessa uma conta Wikimedia. O resultado só pode ser chamado de aprovado no GitHub depois de uma execução real naquela plataforma.

O instalador compilado pode ser hospedado no GitHub Pages em `https://danrego.github.io/PerfilWiki/INICIO.html`. A página externa não consegue ler o login da Wikipédia. Na versão 1.20.0, o botão "Editar painel" da sessão dona do painel abre esse destino e transmite a configuração entre as janelas depois de um clique e da conferência de origem, janela e identificador temporário. Publique a mesma distribuição no site e confira o endereço antes de anunciar esse caminho como disponível. Uma construção local ou um teste da troca entre janelas não comprova que o site publicado esteja acessível.

O código-fonte público da página pode acompanhar as escolhas para montar um rascunho. O instalador só troca a região delimitada por um par único de marcadores reconhecidos. Uma página antiga sem essa região exige a substituição manual. A ferramenta não pede uma sessão Wikimedia, não recebe token de edição e não salva o rascunho na Wikipédia.

Para habilitar a hospedagem estática pelo próprio GitHub, a pessoa responsável abre [Settings → Pages do PerfilWiki](https://github.com/danrego/PerfilWiki/settings/pages), escolhe "Deploy from a branch", a branch `main` e a pasta `/(root)`, e salva. A raiz publicada precisa conter o instalador compilado e `.nojekyll`. Essa configuração não exige um fluxo de implantação nem um token com permissões de escrita. Confira depois [o instalador público](https://danrego.github.io/PerfilWiki/INICIO.html), os arquivos locais que ele usa e a versão mostrada. Uma página ausente ou uma resposta diferente da distribuição mantém a hospedagem como pendente.

## Do pacote para a Wikipédia

O código executado na página de usuário deve continuar hospedado na ptwiki. O GitHub guarda as fontes e os lançamentos para revisão, sem acrescentar uma importação automática da versão mais recente de um servidor externo. Scripts pessoais podem ser carregados pelo `common.js`, seguindo o funcionamento do [JavaScript do MediaWiki](https://www.mediawiki.org/wiki/Manual:Interface/JavaScript) e das [orientações de scripts da ptwiki](https://pt.wikipedia.org/wiki/Wikip%C3%A9dia:Scripts#Instala%C3%A7%C3%A3o).

A atualização manual segue esta ordem:

1. Confira o pacote, os avisos de licença e o resultado dos testes da mesma versão.
2. Atualize o programa compartilhado em `Usuário:Daniel G Rego/PerfilWiki.js`.
3. Confira a folha `Usuário:Daniel G Rego/RitmoPU-estilos`, com modelo de conteúdo "CSS higienizado". Não crie uma folha de texto wiki para usá-la com TemplateStyles.
4. Prepare o carregador pessoal no instalador, preserve os outros scripts do `common.js` e retire somente chamadas antigas que duplicariam o PerfilWiki.
5. Confira o trecho completo da página em "Mostrar previsão", preservando categorias, textos, metas e outros blocos que já existiam.
6. Salve manualmente quando desejar e abra uma nova visita à página, com as abas antigas encerradas.
7. Use "Verificar instalação" para comparar os arquivos públicos e confira visualmente o painel. A comparação não substitui o teste na sessão da pessoa.

O índice `Arquivos.html` apresenta os destinos, o conteúdo inteiro e o resumo de edição, com download e atalho para o editor ao lado da cópia. Os atalhos não enviam uma edição. A documentação acompanha a mesma versão em `Documentacao_PerfilWiki.wiki`, e o histórico de mudanças fica em `Notas_da_versao.txt`.

A ferramenta lê dados públicos sem agir como uma conta que edita páginas. Isso não é uma aprovação prévia de todas as regras locais nem autoriza uma futura rotina de publicação automática. Qualquer mudança que passe a salvar páginas precisa de nova análise da [política de robôs da ptwiki](https://pt.wikipedia.org/wiki/Wikip%C3%A9dia:Pol%C3%ADtica_de_rob%C3%B4s), além de autorização da pessoa.

## Consultas e pausas

As instâncias do PerfilWiki na mesma origem do navegador compartilham uma consulta de dados por vez e espaçam seus inícios por pelo menos 500 milissegundos. Uma resposta da Action API que demora mais de um segundo impõe uma espera de cinco segundos antes da próxima consulta à Action API. Respostas com limite de uso ou atraso do serviço mantêm uma pausa que o botão de atualização não pode ignorar. A coordenação do transporte independe da conta e do fuso, usa Web Locks ou uma reserva conferida no armazenamento compartilhado e não controla outras ferramentas ou as conexões normais do navegador. Essas escolhas acompanham as [regras de acesso automático da Wikimedia](https://wikitech.wikimedia.org/wiki/Robot_policy) conferidas em 15 de outubro de 2026.

Um ciclo tem um orçamento compartilhado de até 40 consultas de dados, incluindo a reserva da capa quando necessária, e no máximo uma consulta opcional de metadados de imagens. Acabar o orçamento deixa o trabalho pendente para outro ciclo e conserva os últimos resultados completos. Esse limite não conta os pedidos de imagem feitos pelo próprio navegador para mostrar arquivos, nem todas as conexões que a página normal da Wikipédia realiza.

Se o armazenamento estiver bloqueado, Web Locks permite continuar em memória. Se as duas formas de coordenação estiverem indisponíveis, novas consultas são recusadas e a apresentação permanece disponível.

O transporte recusa redirecionamentos e destinos fora da lista prevista, usa `credentials: 'omit'`, limita o tamanho de respostas e encerra consultas ao sair da página. A [política de identificação de clientes](https://foundation.wikimedia.org/wiki/Policy:User-Agent_policy#JavaScript) permite o identificador padrão do navegador para JavaScript. O programa também envia `Api-User-Agent` com o nome, a versão e o endereço público do projeto nas consultas à Action API.

## O que precisa de uma conferência real

Os testes locais usam respostas controladas. Eles verificam as contagens e as fronteiras de segurança sem entrar em contas ou consultar um histórico real. O relatório da versão distingue os testes executados dos que ainda faltam. Antes de um lançamento estável, confira o instalador em navegadores disponíveis, os seis idiomas, o teclado, uma tela estreita e os trechos gerados. Uma execução em Chrome não deve ser registrada como teste em Safari ou Firefox.

A inspeção de dependências consulta avisos publicados para as versões instaladas. Um resultado sem alertas naquele momento não garante a ausência de falhas desconhecidas. Novas versões, mudanças nas regras dos serviços e alterações no código exigem repetir a análise.
