/* PerfilWiki 1.20.0. Daniel G Rego, CC BY-SA 4.0. Built from src, without seeded metrics. */

;

/* PerfilWiki. Authored interface messages only. No network, storage, or personal text translation. CC BY-SA 4.0. */
(function(root,factory){var api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.PerfilWikiI18n=api;}(typeof globalThis==='object'?globalThis:this,function(){
'use strict';
var languages=Object.freeze(['pt-BR','pt-PT','en','es','fr','it']);
var languageNames=Object.freeze({'pt-BR':'Português do Brasil','pt-PT':'Português de Portugal',en:'English',es:'Español',fr:'Français',it:'Italiano'});
var rows=[["Personalize","Customize","Personalizar","Personnaliser","Personalizza"],["Instalação","Installation","Instalación","Installation","Installazione"],["Idioma","Language","Idioma","Langue","Lingua"],["Idioma da interface","Interface language","Idioma de la interfaz","Langue de l'interface","Lingua dell'interfaccia"],["Padrão, no topo","Default, at the top","Por defecto, arriba","Par défaut, en haut","Predefinito, in alto"],["Padrão, na atividade","Default, in activity","Por defecto, en la actividad","Par défaut, dans l'activité","Predefinito, nell'attività"],["Padrão, nas caixas","Default, above the boxes","Por defecto, en las casillas","Par défaut, dans les cases","Predefinito, nei riquadri"],["Padrão, atividade e caixas","Default, activity and boxes","Por defecto, actividad y casillas","Par défaut, activité et cases","Predefinito, attività e riquadri"],["Padrão, todas as áreas","Default, all areas","Por defecto, todas las áreas","Par défaut, toutes les zones","Predefinito, tutte le aree"],["No topo","At the top","Arriba","En haut","In alto"],["Na atividade","In activity","En la actividad","Dans l'activité","Nell'attività"],["Nas caixas","Above the boxes","En las casillas","Dans les cases","Nei riquadri"],["Topo e atividade","Top and activity","Parte superior y actividad","Haut et activité","In alto e nell'attività"],["Topo e caixas","Top and boxes","Parte superior y casillas","Haut et cases","In alto e nei riquadri"],["Atividade e caixas","Activity and boxes","Actividad y casillas","Activité et cases","Attività e riquadri"],["Em todas as áreas","In all areas","En todas las áreas","Dans toutes les zones","In tutte le aree"],["Ocultar","Hide","Ocultar","Masquer","Nascondi"],["Mostrar foto","Show photo","Mostrar foto","Afficher la photo","Mostra foto"],["No topo, padrão","At the top, default","Arriba, por defecto","En haut, par défaut","In alto, predefinito"],["À esquerda","Left","A la izquierda","À gauche","A sinistra"],["Centralizado","Center","Centrado","Centré","Al centro"],["À direita","Right","A la derecha","À droite","A destra"],["Automática","Automatic","Automática","Automatique","Automatica"],["Personalizada","Custom","Personalizada","Personnalisée","Personalizzata"],["Código da {label}","Code for {label}","Código de {label}","Code de {label}","Codice di {label}"],["Rótulo","Label","Etiqueta","Libellé","Etichetta"],["Rótulo da informação {number}","Information {number} label","Etiqueta de la información {number}","Libellé de l'information {number}","Etichetta dell'informazione {number}"],["Ex.: Formação","E.g. Education","Ej.: Formación","Ex. : Formation","Es.: Formazione"],["Cor do rótulo {number}","Label {number} color","Color de la etiqueta {number}","Couleur du libellé {number}","Colore dell'etichetta {number}"],["Padrão do perfil","Profile default","Por defecto del perfil","Valeur du profil","Predefinito del profilo"],["Informação","Information","Información","Information","Informazione"],["opcional","optional","opcional","facultatif","facoltativo"],["Item {number}","Item {number}","Elemento {number}","Élément {number}","Elemento {number}"],["Item {item} da informação {number}","Item {item} of information {number}","Elemento {item} de la información {number}","Élément {item} de l'information {number}","Elemento {item} dell'informazione {number}"],["Remover item {item} da informação {number}","Remove item {item} of information {number}","Eliminar elemento {item} de la información {number}","Supprimer l'élément {item} de l'information {number}","Rimuovi l'elemento {item} dell'informazione {number}"],["Cor do item {item} da informação {number}","Color of item {item} of information {number}","Color del elemento {item} de la información {number}","Couleur de l'élément {item} de l'information {number}","Colore dell'elemento {item} dell'informazione {number}"],["+ Adicionar item","+ Add item","+ Añadir elemento","+ Ajouter un élément","+ Aggiungi elemento"],["Disposição das informações","Information layout","Disposición de la información","Disposition des informations","Disposizione delle informazioni"],["Disposição da informação {number}","Information {number} layout","Disposición de la información {number}","Disposition de l'information {number}","Disposizione dell'informazione {number}"],["Na mesma linha","On the same line","En la misma línea","Sur la même ligne","Sulla stessa riga"],["Um por linha","One per line","Uno por línea","Un par ligne","Uno per riga"],["Lista com marcadores","Bulleted list","Lista con viñetas","Liste à puces","Elenco puntato"],["Separação","Separator","Separación","Séparateur","Separatore"],["Barra vertical |","Vertical bar |","Barra vertical |","Barre verticale |","Barra verticale |"],["Ponto ·","Dot ·","Punto ·","Point ·","Punto ·"],["Espaço","Space","Espacio","Espace","Spazio"],["Mostrar informação {number}","Show information {number}","Mostrar información {number}","Afficher l'information {number}","Mostra informazione {number}"],["Remover informação {number}","Remove information {number}","Eliminar información {number}","Supprimer l'information {number}","Rimuovi informazione {number}"],["As escolhas são de outra conta. Use um arquivo da conta identificada nesta página.","These settings belong to another account. Use a file for the account identified on this page.","Estos ajustes son de otra cuenta. Usa un archivo de la cuenta identificada en esta página.","Ces réglages appartiennent à un autre compte. Utilisez un fichier du compte identifié sur cette page.","Queste impostazioni appartengono a un altro account. Usa un file dell'account identificato in questa pagina."],["Escolhas carregadas nesta aba. Confira a prévia antes de preparar os novos trechos.","Settings loaded in this tab. Check the preview before preparing the new snippets.","Ajustes cargados en esta pestaña. Revisa la vista previa antes de preparar los nuevos fragmentos.","Réglages chargés dans cet onglet. Vérifiez l'aperçu avant de préparer les nouveaux extraits.","Impostazioni caricate in questa scheda. Controlla l'anteprima prima di preparare i nuovi frammenti."],["Escolha datas válidas entre 1 de julho de 2015 e ontem em UTC, com início até o fim.","Choose valid dates between 1 July 2015 and yesterday in UTC, with the start no later than the end.","Elige fechas válidas entre el 1 de julio de 2015 y ayer en UTC, con el inicio antes o igual al final.","Choisissez des dates valides entre le 1er juillet 2015 et hier en UTC, avec le début avant ou à la fin.","Scegli date valide tra il 1 luglio 2015 e ieri in UTC, con l'inizio non successivo alla fine."],["O painel pode ser editado nesta aba. Não foi possível guardar as escolhas para recarregar a página.","You can edit the panel in this tab. The settings could not be stored for a page reload.","Puedes editar el panel en esta pestaña. No se pudieron guardar los ajustes para recargar la página.","Vous pouvez modifier le panneau dans cet onglet. Les réglages n'ont pas pu être conservés pour un rechargement.","Puoi modificare il pannello in questa scheda. Non è stato possibile conservare le impostazioni per il ricaricamento."],["Há ajustes incompletos nesta aba. Suas alterações foram mantidas. Confira os campos antes de abrir o painel.","Some settings in this tab are incomplete. Your changes were kept. Check the fields before opening the panel.","Hay ajustes incompletos en esta pestaña. Se conservaron los cambios. Revisa los campos antes de abrir el panel.","Certains réglages de cet onglet sont incomplets. Vos modifications sont conservées. Vérifiez les champs avant d'ouvrir le panneau.","Alcune impostazioni in questa scheda sono incomplete. Le modifiche sono conservate. Controlla i campi prima di aprire il pannello."],["Contador movido para a posição {number}.","Counter moved to position {number}.","Contador movido a la posición {number}.","Compteur déplacé à la position {number}.","Contatore spostato alla posizione {number}."],["Mantenha ao menos um bloco na prévia.","Keep at least one block in the preview.","Mantén al menos un bloque en la vista previa.","Gardez au moins un bloc dans l'aperçu.","Mantieni almeno un blocco nell'anteprima."],["Aparência padrão restaurada. Sua conta foi mantida.","Default appearance restored. Your account was kept.","Aspecto predeterminado restaurado. Se conservó tu cuenta.","Apparence par défaut restaurée. Votre compte est conservé.","Aspetto predefinito ripristinato. Il tuo account è conservato."],["Código completo copiado. Confira o destino antes de colar.","Full code copied. Check the destination before pasting.","Código completo copiado. Revisa el destino antes de pegarlo.","Code complet copié. Vérifiez la destination avant de le coller.","Codice completo copiato. Controlla la destinazione prima di incollarlo."],["Texto completo selecionado. Copie pelo teclado e use no editor local.","Full text selected. Copy with your keyboard and use it in the local editor.","Texto completo seleccionado. Cópialo con el teclado y úsalo en el editor local.","Texte complet sélectionné. Copiez-le au clavier et utilisez-le dans l'éditeur local.","Testo completo selezionato. Copialo con la tastiera e usalo nell'editor locale."],["Resumo de edição copiado.","Edit summary copied.","Resumen de edición copiado.","Résumé de modification copié.","Oggetto della modifica copiato."],["Resumo selecionado. Copie pelo teclado.","Summary selected. Copy with your keyboard.","Resumen seleccionado. Cópialo con el teclado.","Résumé sélectionné. Copiez-le au clavier.","Oggetto selezionato. Copialo con la tastiera."],["Adicione o trecho preparado antes de salvar esta simulação.","Add the prepared snippet before saving this simulation.","Añade el fragmento preparado antes de guardar esta simulación.","Ajoutez l'extrait préparé avant d'enregistrer cette simulation.","Aggiungi il frammento preparato prima di salvare questa simulazione."],["Ativação salva no editor local.","Activation saved in the local editor.","Activación guardada en el editor local.","Activation enregistrée dans l'éditeur local.","Attivazione salvata nell'editor locale."],["Bloco salvo na página simulada.","Block saved on the simulated page.","Bloque guardado en la página simulada.","Bloc enregistré sur la page simulée.","Blocco salvato nella pagina simulata."],["Monte o seu painel","Build your panel","Crea tu panel","Créez votre panneau","Crea il tuo pannello"],["· teste local","· local test","· prueba local","· test local","· test locale"],["Etapas de configuração","Setup steps","Pasos de configuración","Étapes de configuration","Passaggi di configurazione"],["PAINEL LOCAL","LOCAL PANEL","PANEL LOCAL","PANNEAU LOCAL","PANNELLO LOCALE"],["Seu PerfilWiki","Your PerfilWiki","Tu PerfilWiki","Votre PerfilWiki","Il tuo PerfilWiki"],["ETAPA 1 DE 2","STEP 1 OF 2","PASO 1 DE 2","ÉTAPE 1 SUR 2","PASSAGGIO 1 DI 2"],["Personalize seu painel","Customize your panel","Personaliza tu panel","Personnalisez votre panneau","Personalizza il tuo pannello"],["A prévia muda junto com as suas escolhas.","The preview updates as you change your settings.","La vista previa se actualiza al cambiar los ajustes.","L'aperçu suit vos réglages.","L'anteprima si aggiorna con le tue scelte."],["Ver painel","View panel","Ver panel","Voir le panneau","Visualizza pannello"],["Carregar minhas escolhas","Load my settings","Cargar mis ajustes","Charger mes réglages","Carica le mie impostazioni"],["Restaurar aparência padrão","Restore default appearance","Restaurar aspecto predeterminado","Restaurer l'apparence par défaut","Ripristina l'aspetto predefinito"],["Navegação da personalização","Customization navigation","Navegación de personalización","Navigation de personnalisation","Navigazione della personalizzazione"],["Ajustes","Settings","Ajustes","Réglages","Impostazioni"],["Ver prévia","View preview","Ver vista previa","Voir l'aperçu","Visualizza anteprima"],["Personalização do painel","Panel customization","Personalización del panel","Personnalisation du panneau","Personalizzazione del pannello"],["Seu perfil","Your profile","Tu perfil","Votre profil","Il tuo profilo"],["Conta da Wikipédia","Wikipedia account","Cuenta de Wikipedia","Compte Wikipédia","Account Wikipedia"],["Conta identificada nesta página, sem consultar seu login.","Account identified on this page without requesting your login.","Cuenta identificada en esta página sin consultar tu inicio de sesión.","Compte identifié sur cette page sans consulter votre connexion.","Account identificato in questa pagina senza richiedere l'accesso."],[", obrigatório",", required",", obligatorio",", obligatoire",", obbligatorio"],["Conta preenchida pela sessão da Wikipédia.","Account filled from this Wikipedia session.","Cuenta rellenada desde esta sesión de Wikipedia.","Compte renseigné depuis cette session Wikipédia.","Account compilato da questa sessione di Wikipedia."],["Campo obrigatório. Informe o nome exato da conta, sem \"Usuário:\".","Required field. Enter the exact account name without \"Usuário:\".","Campo obligatorio. Introduce el nombre exacto de la cuenta sin \"Usuário:\".","Champ obligatoire. Saisissez le nom exact du compte sans \"Usuário:\".","Campo obbligatorio. Inserisci il nome esatto dell'account senza \"Usuário:\"."],["Nome de exibição","Display name","Nombre mostrado","Nom affiché","Nome visualizzato"],["Como seu nome deve aparecer","How your name should appear","Cómo debe aparecer tu nombre","Comment afficher votre nom","Come deve apparire il tuo nome"],["Deixe em branco para usar o nome da conta. As estatísticas continuam sendo da conta informada acima.","Leave blank to use the account name. Statistics still belong to the account entered above.","Déjalo vacío para usar el nombre de la cuenta. Las estadísticas siguen siendo de la cuenta indicada arriba.","Laissez vide pour utiliser le nom du compte. Les statistiques restent celles du compte indiqué plus haut.","Lascia vuoto per usare il nome dell'account. Le statistiche restano quelle dell'account indicato sopra."],["Tamanho do nome","Name size","Tamaño del nombre","Taille du nom","Dimensione del nome"],["Alinhamento do nome de exibição","Display name alignment","Alineación del nombre","Alignement du nom affiché","Allineamento del nome"],["Cor do nome","Name color","Color del nombre","Couleur du nom","Colore del nome"],["Mostrar nome","Show name","Mostrar nombre","Afficher le nom","Mostra nome"],["Localização","Location","Ubicación","Lieu","Località"],["Ex.: Belo Horizonte","E.g. Belo Horizonte","Ej.: Belo Horizonte","Ex. : Belo Horizonte","Es.: Belo Horizonte"],["Pode usar [[Belo Horizonte]] ou [[Belo Horizonte|BH]].","You can use [[Belo Horizonte]] or [[Belo Horizonte|BH]].","Puedes usar [[Belo Horizonte]] o [[Belo Horizonte|BH]].","Vous pouvez utiliser [[Belo Horizonte]] ou [[Belo Horizonte|BH]].","Puoi usare [[Belo Horizonte]] o [[Belo Horizonte|BH]]."],["Mostrar localização","Show location","Mostrar ubicación","Afficher le lieu","Mostra località"],["Mostrar hora local","Show local time","Mostrar hora local","Afficher l'heure locale","Mostra ora locale"],["O horário segue o fuso escolhido abaixo.","The time follows the time zone selected below.","La hora sigue la zona horaria elegida abajo.","L'heure suit le fuseau choisi ci-dessous.","L'ora segue il fuso scelto sotto."],["Posição da hora","Time position","Posición de la hora","Position de l'heure","Posizione dell'ora"],["Fuso horário","Time zone","Zona horaria","Fuseau horaire","Fuso orario"],["Começamos com o horário de Brasília. Você pode escolher outro fuso; os ajustes sazonais são automáticos.","The default is Brasília time. You can choose another time zone. Seasonal changes are automatic.","La zona inicial es Brasilia. Puedes elegir otra zona. Los cambios estacionales son automáticos.","Le fuseau initial est celui de Brasília. Vous pouvez en choisir un autre. Les changements saisonniers sont automatiques.","Il fuso iniziale è quello di Brasília. Puoi sceglierne un altro. I cambi stagionali sono automatici."],["Informações adicionais","Additional information","Información adicional","Informations complémentaires","Informazioni aggiuntive"],["+ Adicionar informação","+ Add information","+ Añadir información","+ Ajouter une information","+ Aggiungi informazione"],["Até três rótulos, com até oito itens em cada um. Os itens são opcionais e aceitam ligações como [[História do Brasil|História]].","Up to three labels with eight items each. Items are optional and accept links such as [[História do Brasil|História]].","Hasta tres etiquetas con ocho elementos cada una. Los elementos son opcionales y aceptan enlaces como [[História do Brasil|História]].","Jusqu'à trois libellés de huit éléments chacun. Les éléments sont facultatifs et acceptent des liens comme [[História do Brasil|História]].","Fino a tre etichette con otto elementi ciascuna. Gli elementi sono facoltativi e accettano collegamenti come [[História do Brasil|História]]."],["Cor dos rótulos","Label colors","Color de las etiquetas","Couleur des libellés","Colore delle etichette"],["Cor das informações","Information colors","Color de la información","Couleur des informations","Colore delle informazioni"],["As cores valem para os campos do perfil, como localização, estatutos e data de criação.","These colors apply to profile fields such as location, user groups and account creation date.","Los colores se aplican a campos como ubicación, permisos y fecha de creación.","Ces couleurs concernent les champs du profil, comme le lieu, les statuts et la date de création.","I colori si applicano ai campi del profilo, come località, gruppi e data di creazione."],["Mostrar estatutos","Show user groups","Mostrar permisos","Afficher les statuts","Mostra gruppi utente"],["Usa os estatutos públicos da conta na Wikipédia em português.","Uses the account's public groups on Portuguese Wikipedia.","Usa los permisos públicos de la cuenta en Wikipedia en portugués.","Utilise les statuts publics du compte sur Wikipédia en portugais.","Usa i gruppi pubblici dell'account su Wikipedia in portoghese."],["Mostrar estatutos em","Show user groups in","Mostrar permisos en","Afficher les statuts dans","Mostra gruppi in"],["Mostrar data de criação da conta","Show account creation date","Mostrar fecha de creación de la cuenta","Afficher la date de création du compte","Mostra data di creazione dell'account"],["Usa a data mais antiga disponível nas contas vinculadas.","Uses the earliest available date across linked accounts.","Usa la fecha más antigua disponible entre las cuentas vinculadas.","Utilise la date disponible la plus ancienne des comptes liés.","Usa la data disponibile più antica degli account collegati."],["Mostrar data de criação","Show creation date","Mostrar fecha de creación","Afficher la date de création","Mostra data di creazione"],["Foto do Wikimedia Commons","Wikimedia Commons photo","Foto de Wikimedia Commons","Photo de Wikimedia Commons","Foto da Wikimedia Commons"],["Informe o nome do arquivo. A prévia é ilustrativa, e o arquivo do Commons entra no código preparado.","Enter the filename. The preview is illustrative. The Commons file is used in the prepared code.","Introduce el nombre del archivo. La vista previa es ilustrativa. El archivo de Commons entra en el código preparado.","Saisissez le nom du fichier. L'aperçu est illustratif. Le fichier Commons figure dans le code préparé.","Inserisci il nome del file. L'anteprima è illustrativa. Il file di Commons viene usato nel codice preparato."],["Ainda não tem uma foto no Commons?","Don't have a photo on Commons yet?","¿Aún no tienes una foto en Commons?","Vous n'avez pas encore de photo sur Commons ?","Non hai ancora una foto su Commons?"],["Envie uma foto","Upload a photo","Subir una foto","Importer une photo","Carica una foto"],["Tamanho da foto","Photo size","Tamaño de la foto","Taille de la photo","Dimensione della foto"],["Formato da foto","Photo shape","Forma de la foto","Forme de la photo","Forma della foto"],["Quadrada","Square","Cuadrada","Carrée","Quadrata"],["Redonda","Round","Redonda","Ronde","Rotonda"],["Alinhamento da foto","Photo alignment","Alineación de la foto","Alignement de la photo","Allineamento della foto"],["Topo do perfil","Profile top","Parte superior del perfil","Haut du profil","Parte superiore del profilo"],["Imagem de capa","Cover image","Imagen de portada","Image de couverture","Immagine di copertina"],["Escolher arquivo do Commons","Choose a Commons file","Elegir un archivo de Commons","Choisir un fichier Commons","Scegli un file di Commons"],["Imagem do dia da Wikipédia, para visitantes","Wikipedia picture of the day, for visitors","Imagen del día de Wikipedia, para visitantes","Image du jour de Wikipédia, pour les visiteurs","Immagine del giorno di Wikipedia, per i visitatori"],["Imagem do dia do Commons, na sua sessão","Commons picture of the day, in your session","Imagen del día de Commons, en tu sesión","Image du jour de Commons, dans votre session","Immagine del giorno di Commons, nella tua sessione"],["Imagem de capa do Wikimedia Commons","Wikimedia Commons cover image","Imagen de portada de Wikimedia Commons","Couverture de Wikimedia Commons","Copertina da Wikimedia Commons"],["Atualiza para os visitantes pelo calendário da Wikipédia, conforme o cache da página. A prévia é ilustrativa.","Updates for visitors using Wikipedia's calendar and page cache. The preview is illustrative.","Se actualiza para visitantes según el calendario de Wikipedia y la caché. La vista previa es ilustrativa.","Se met à jour pour les visiteurs selon le calendrier de Wikipédia et son cache. L'aperçu est illustratif.","Si aggiorna per i visitatori secondo il calendario di Wikipedia e la cache. L'anteprima è illustrativa."],["A prévia usa uma imagem ilustrativa. Na sua sessão ativa, a capa usa a imagem do dia do Commons, com recorte central.","The preview uses an illustration. Your active session uses the Commons picture of the day with a centered crop.","La vista previa usa una ilustración. Tu sesión activa usa la imagen del día de Commons con recorte centrado.","L'aperçu utilise une illustration. Votre session active utilise l'image du jour de Commons avec un recadrage centré.","L'anteprima usa un'illustrazione. La sessione attiva usa l'immagine del giorno di Commons con un ritaglio centrato."],["A capa fica acima das informações do topo. Informe o nome do arquivo. A prévia usa uma imagem ilustrativa.","The cover sits above the top information. Enter the filename. The preview uses an illustration.","La portada queda sobre la información superior. Introduce el nombre del archivo. La vista previa usa una ilustración.","La couverture se trouve au-dessus des informations du haut. Saisissez le nom du fichier. L'aperçu utilise une illustration.","La copertina è sopra le informazioni iniziali. Inserisci il nome del file. L'anteprima usa un'illustrazione."],["Cor de fundo do topo","Top background color","Color del fondo superior","Couleur de fond du haut","Colore di sfondo superiore"],["Código da cor de fundo do topo","Top background color code","Código del color del fondo superior","Code couleur du fond du haut","Codice del colore di sfondo superiore"],["As cores automáticas do texto acompanham o fundo escolhido.","Automatic text colors follow the selected background.","Los colores automáticos del texto se adaptan al fondo elegido.","Les couleurs automatiques du texte s'adaptent au fond choisi.","I colori automatici del testo si adattano allo sfondo scelto."],["Onde o painel vai aparecer?","Where will the panel appear?","¿Dónde aparecerá el panel?","Où afficher le panneau ?","Dove apparirà il pannello?"],["Na minha página de usuário","On my user page","En mi página de usuario","Sur ma page utilisateur","Nella mia pagina utente"],["A opção mais simples para começar.","The simplest option to start with.","La opción más sencilla para empezar.","L'option la plus simple pour commencer.","L'opzione più semplice per iniziare."],["Em uma subpágina que eu uso","On a subpage I use","En una subpágina que uso","Sur une sous-page que j'utilise","In una sottopagina che uso"],["Por exemplo, /PU ou /Perfil.","For example, /PU or /Perfil.","Por ejemplo, /PU o /Perfil.","Par exemple, /PU ou /Perfil.","Per esempio, /PU o /Perfil."],["Nome da subpágina","Subpage name","Nombre de la subpágina","Nom de la sous-page","Nome della sottopagina"],["Use uma subpágina já exibida no seu perfil, ou experimente esse destino separadamente.","Use a subpage already displayed on your profile, or try that destination separately.","Usa una subpágina ya mostrada en tu perfil o prueba ese destino por separado.","Utilisez une sous-page déjà affichée dans votre profil, ou essayez cette destination séparément.","Usa una sottopagina già mostrata nel profilo oppure prova questa destinazione separatamente."],["Posição padrão das informações","Default information position","Posición predeterminada de la información","Position par défaut des informations","Posizione predefinita delle informazioni"],["Vale para os campos marcados como Padrão. Cada campo pode ter outra posição ou ficar oculto.","Applies to fields set to Default. Each field can have another position or be hidden.","Se aplica a los campos marcados como Predeterminado. Cada campo puede tener otra posición u ocultarse.","S'applique aux champs réglés sur la valeur par défaut. Chaque champ peut avoir une autre position ou être masqué.","Si applica ai campi su Predefinito. Ogni campo può avere un'altra posizione o essere nascosto."],["Textos e projetos","Texts and projects","Textos y proyectos","Textes et projets","Testi e progetti"],["Acrescente textos depois das visualizações. Pode usar código wiki, listas, ligações e predefinições. Na Wikipédia, essas seções ficam separadas dos dados do painel e podem ser editadas pelo editor da página.","Add text below pageviews. You can use wikitext, lists, links and templates. On Wikipedia, these sections stay separate from panel data and can be changed in the page editor.","Añade textos bajo las visualizaciones. Puedes usar código wiki, listas, enlaces y plantillas. En Wikipedia, estas secciones quedan separadas de los datos y se editan con el editor de la página.","Ajoutez du texte sous les consultations. Vous pouvez utiliser le wikicode, des listes, des liens et des modèles. Sur Wikipédia, ces sections restent séparées des données et se modifient dans l'éditeur de la page.","Aggiungi testi sotto le visualizzazioni. Puoi usare wikitesto, elenchi, collegamenti e template. Su Wikipedia queste sezioni restano separate dai dati e si modificano nell'editor della pagina."],["Conflito de interesses","Conflict of interest","Conflicto de intereses","Conflit d'intérêts","Conflitto di interessi"],["Metas e projetos","Goals and projects","Metas y proyectos","Objectifs et projets","Obiettivi e progetti"],["+ Conflito de interesses","+ Conflict of interest","+ Conflicto de intereses","+ Conflit d'intérêts","+ Conflitto di interessi"],["+ Metas e projetos","+ Goals and projects","+ Metas y proyectos","+ Objectifs et projets","+ Obiettivi e progetti"],["Seção","Section","Sección","Section","Sezione"],["Título","Title","Título","Titre","Titolo"],["Texto em código wiki","Wikitext","Texto en código wiki","Wikicode","Wikitesto"],["Escreva seu texto ou cole um trecho da sua página.","Write your text or paste a section from your page.","Escribe tu texto o pega un fragmento de tu página.","Écrivez votre texte ou collez un extrait de votre page.","Scrivi il testo o incolla una parte della tua pagina."],["Mover seção {number} para cima","Move section {number} up","Subir sección {number}","Monter la section {number}","Sposta la sezione {number} in alto"],["Mover seção {number} para baixo","Move section {number} down","Bajar sección {number}","Descendre la section {number}","Sposta la sezione {number} in basso"],["Remover seção","Remove section","Eliminar sección","Supprimer la section","Rimuovi sezione"],["+ Adicionar seção","+ Add section","+ Añadir sección","+ Ajouter une section","+ Aggiungi sezione"],["Até oito seções. A prévia local mostra uma aproximação do código wiki, sem carregar ou executar predefinições.","Up to eight sections. The local preview approximates wikitext without loading or executing templates.","Hasta ocho secciones. La vista previa local aproxima el código wiki sin cargar ni ejecutar plantillas.","Jusqu'à huit sections. L'aperçu local donne une approximation du wikicode sans charger ni exécuter de modèles.","Fino a otto sezioni. L'anteprima locale approssima il wikitesto senza caricare o eseguire template."],["Disposição","Layout","Disposición","Disposition","Disposizione"],["Caixas na atividade","Boxes inside activity","Casillas en la actividad","Cases dans l'activité","Riquadri nell'attività"],["Blocos juntos","Blocks together","Bloques juntos","Blocs regroupés","Blocchi insieme"],["Separados","Separate","Separados","Séparés","Separati"],["As caixas ficam dentro da atividade, entre a sequência e o gráfico. As posições dos campos distinguem a atividade e as caixas.","Boxes sit inside activity, between the streak and the chart. Field positions distinguish activity from boxes.","Las casillas quedan dentro de la actividad, entre la racha y el gráfico. Las posiciones de los campos distinguen actividad y casillas.","Les cases se trouvent dans l'activité, entre la série et le graphique. Les positions des champs distinguent l'activité et les cases.","I riquadri sono nell'attività, tra la serie e il grafico. Le posizioni dei campi distinguono attività e riquadri."],["Blocos juntos mantém as duas áreas no mesmo grupo. Em Separados, cabe texto do perfil entre elas.","Blocks together keeps both areas in one group. Separate lets you place profile text between them.","Bloques juntos conserva las dos áreas en un grupo. Separados permite colocar texto del perfil entre ellas.","Blocs regroupés conserve les deux zones ensemble. Séparés permet de placer du texte entre elles.","Blocchi insieme conserva le due aree in un gruppo. Separati consente di inserire testo tra le due."],["Ordem dos blocos","Block order","Orden de los bloques","Ordre des blocs","Ordine dei blocchi"],["Caixas primeiro","Boxes first","Casillas primero","Cases en premier","Prima i riquadri"],["Atividade primeiro","Activity first","Actividad primero","Activité en premier","Prima l'attività"],["Cor do painel","Panel color","Color del panel","Couleur du panneau","Colore del pannello"],["Código hexadecimal da cor","Hex color code","Código hexadecimal del color","Code hexadécimal de la couleur","Codice esadecimale del colore"],["O texto dos botões se ajusta para continuar legível.","Button text adjusts to stay readable.","El texto de los botones se ajusta para mantener la legibilidad.","Le texte des boutons s'adapte pour rester lisible.","Il testo dei pulsanti si adatta per restare leggibile."],["Espaçamento","Spacing","Espaciado","Espacement","Spaziatura"],["Confortável","Comfortable","Cómodo","Confortable","Confortevole"],["Compacto","Compact","Compacto","Compact","Compatto"],["Amplo","Spacious","Amplio","Spacieux","Ampio"],["Colunas das caixas","Box columns","Columnas de casillas","Colonnes des cases","Colonne dei riquadri"],["Automático","Automatic","Automático","Automatique","Automatico"],["2 colunas","2 columns","2 columnas","2 colonnes","2 colonne"],["3 colunas","3 columns","3 columnas","3 colonnes","3 colonne"],["4 colunas","4 columns","4 columnas","4 colonnes","4 colonne"],["5 colunas","5 columns","5 columnas","5 colonnes","5 colonne"],["O modo Compacto pode usar cinco colunas no automático. Em telas menores, as caixas se reorganizam para caber na página.","Compact mode can use five columns automatically. Boxes rearrange on smaller screens to fit the page.","El modo compacto puede usar cinco columnas automáticamente. En pantallas pequeñas, las casillas se reorganizan para caber.","Le mode compact peut utiliser cinq colonnes automatiquement. Sur petit écran, les cases se réorganisent pour tenir dans la page.","La modalità compatta può usare cinque colonne automaticamente. Sugli schermi piccoli i riquadri si riordinano per adattarsi alla pagina."],["Alinhamento dos contadores","Counter alignment","Alineación de contadores","Alignement des compteurs","Allineamento dei contatori"],["Vale para os números e os textos das caixas.","Applies to box numbers and text.","Se aplica a los números y textos de las casillas.","S'applique aux nombres et aux textes des cases.","Si applica ai numeri e ai testi dei riquadri."],["Cor do destaque das caixas","Box highlight color","Color de resaltado de casillas","Couleur de mise en valeur des cases","Colore di evidenziazione dei riquadri"],["Código da cor de destaque das caixas","Box highlight color code","Código del color de resaltado","Code couleur de mise en valeur","Codice del colore di evidenziazione"],["Conteúdo","Content","Contenido","Contenu","Contenuto"],["O que aparece","What to display","Qué mostrar","Éléments affichés","Cosa mostrare"],["Caixas de números","Number boxes","Casillas de números","Cases de chiffres","Riquadri numerici"],["Atividade e visualizações","Activity and pageviews","Actividad y visualizaciones","Activité et consultations","Attività e visualizzazioni"],["Período inicial das visualizações","Initial pageview period","Período inicial de visualizaciones","Période initiale des consultations","Periodo iniziale delle visualizzazioni"],["De","From","Desde","Du","Dal"],["Até","To","Hasta","Au","Al"],["Aplicar período","Apply period","Aplicar período","Appliquer la période","Applica periodo"],["Dias completos em UTC, a partir de julho de 2015.","Complete UTC days, from July 2015 onward.","Días completos en UTC, a partir de julio de 2015.","Jours complets en UTC, à partir de juillet 2015.","Giorni completi in UTC, da luglio 2015."],["Voltar aos ajustes","Back to settings","Volver a los ajustes","Retour aux réglages","Torna alle impostazioni"],["PRÉVIA DO SEU PERFIL","YOUR PROFILE PREVIEW","VISTA PREVIA DE TU PERFIL","APERÇU DE VOTRE PROFIL","ANTEPRIMA DEL TUO PROFILO"],["Prévia com o mesmo código que desenha o painel. Os números são de exemplo e não foram consultados para esta conta.","The preview uses the dashboard's own code. The numbers are examples and were not queried for this account.","La vista previa usa el código del panel. Los números son ejemplos y no se consultaron para esta cuenta.","L'aperçu utilise le code du panneau. Les chiffres sont des exemples et n'ont pas été consultés pour ce compte.","L'anteprima usa il codice del pannello. I numeri sono esempi e non sono stati richiesti per questo account."],["Confira a prévia antes de preparar os trechos.","Check the preview before preparing the snippets.","Revisa la vista previa antes de preparar los fragmentos.","Vérifiez l'aperçu avant de préparer les extraits.","Controlla l'anteprima prima di preparare i frammenti."],["Preparar instalação","Prepare installation","Preparar instalación","Préparer l'installation","Prepara installazione"],["ETAPA 2 DE 2","STEP 2 OF 2","PASO 2 DE 2","ÉTAPE 2 SUR 2","PASSAGGIO 2 DI 2"],["Instale seu PerfilWiki","Install your PerfilWiki","Instala tu PerfilWiki","Installez votre PerfilWiki","Installa il tuo PerfilWiki"],["Copie o carregador e os blocos preparados com as suas escolhas.","Copy the loader and blocks prepared with your settings.","Copia el cargador y los bloques preparados con tus ajustes.","Copiez le chargeur et les blocs préparés avec vos réglages.","Copia il caricatore e i blocchi preparati con le tue impostazioni."],["Ajustar a aparência","Adjust appearance","Ajustar aspecto","Ajuster l'apparence","Regola l'aspetto"],["Esta versão está em teste local.","This version is being tested locally.","Esta versión está en pruebas locales.","Cette version est en test local.","Questa versione è in test locale."],["Os trechos abaixo usam o código real desta versão. Os arquivos compartilhados da versão","The snippets below use this version's actual code. The shared files for version","Los fragmentos usan el código real de esta versión. Los archivos compartidos de la versión","Les extraits utilisent le code réel de cette version. Les fichiers partagés de la version","I frammenti usano il codice reale di questa versione. I file condivisi della versione"],["precisam ser atualizados antes da instalação na Wikipédia. Você pode conferir tudo nos editores locais, sem enviar nenhuma edição.","must be updated before installation on Wikipedia. You can check everything in the local editors without submitting an edit.","deben actualizarse antes de la instalación en Wikipedia. Puedes revisar todo en los editores locales sin enviar ediciones.","doivent être mis à jour avant l'installation sur Wikipédia. Vous pouvez tout vérifier dans les éditeurs locaux sans envoyer de modification.","devono essere aggiornati prima dell'installazione su Wikipedia. Puoi verificare tutto negli editor locali senza inviare modifiche."],["Cor personalizada","Custom color","Color personalizado","Couleur personnalisée","Colore personalizzato"],["Com atividade e visualizações","With activity and pageviews","Con actividad y visualizaciones","Avec activité et consultations","Con attività e visualizzazioni"],["Adicione ao seu perfil","Add to your profile","Añadir a tu perfil","Ajouter à votre profil","Aggiungi al tuo profilo"],["Acrescente o trecho ao final do rascunho, mantendo os scripts que já estão lá.","Add the snippet at the end of the draft, keeping existing scripts.","Añade el fragmento al final del borrador conservando los scripts existentes.","Ajoutez l'extrait à la fin du brouillon en gardant les scripts existants.","Aggiungi il frammento alla fine della bozza conservando gli script esistenti."],["Experimente colocar as caixas e a atividade em pontos diferentes, preservando o texto da página.","Try placing boxes and activity at different points while preserving the page text.","Prueba a colocar las casillas y la actividad en distintos puntos conservando el texto.","Essayez de placer les cases et l'activité à différents endroits en conservant le texte.","Prova a posizionare riquadri e attività in punti diversi conservando il testo."],["Coloque o bloco no ponto do perfil em que deseja mostrar o painel.","Place the block where you want the panel on your profile.","Coloca el bloque donde quieras mostrar el panel en tu perfil.","Placez le bloc à l'endroit où vous voulez afficher le panneau.","Inserisci il blocco nel punto del profilo in cui vuoi mostrare il pannello."],["Copiar","Copy","Copiar","Copier","Copia"],["ativação","activation","activación","activation","attivazione"],["bloco do perfil","profile block","bloque del perfil","bloc du profil","blocco del profilo"],["Abrir editor local","Open local editor","Abrir editor local","Ouvrir l'éditeur local","Apri editor locale"],["Abrir destino na Wikipédia","Open destination on Wikipedia","Abrir destino en Wikipedia","Ouvrir la destination sur Wikipédia","Apri destinazione su Wikipedia"],["Ver trecho completo ou copiar pelo teclado","View full snippet or copy with keyboard","Ver fragmento completo o copiar con el teclado","Voir l'extrait complet ou copier au clavier","Visualizza frammento completo o copia da tastiera"],["Código de","Code for","Código de","Code de","Codice di"],["Resumo de edição","Edit summary","Resumen de edición","Résumé de modification","Oggetto della modifica"],["Copiar resumo de edição","Copy edit summary","Copiar resumen de edición","Copier le résumé","Copia oggetto della modifica"],["Baixar somente as caixas","Download boxes only","Descargar solo las casillas","Télécharger les cases seules","Scarica solo i riquadri"],["Baixar somente a atividade","Download activity only","Descargar solo la actividad","Télécharger l'activité seule","Scarica solo l'attività"],["Baixar código completo","Download full code","Descargar código completo","Télécharger le code complet","Scarica codice completo"],["Conferência local concluída","Local check complete","Comprobación local finalizada","Vérification locale terminée","Verifica locale completata"],["O carregador e o perfil foram conferidos nos editores locais. Nenhuma página da Wikipédia foi alterada.","The loader and profile were checked in the local editors. No Wikipedia page was changed.","El cargador y el perfil se comprobaron en editores locales. No se modificó ninguna página de Wikipedia.","Le chargeur et le profil ont été vérifiés dans les éditeurs locaux. Aucune page Wikipédia n'a été modifiée.","Il caricatore e il profilo sono stati verificati negli editor locali. Nessuna pagina Wikipedia è stata modificata."],["Na versão real, a consulta atualiza a tela do dono da página. Os visitantes veem a última cópia que ele salvou no perfil.","The installed version updates the page owner's screen. Visitors see the last copy saved on the profile.","La versión instalada actualiza la pantalla del dueño. Los visitantes ven la última copia guardada en el perfil.","La version installée actualise l'écran du propriétaire. Les visiteurs voient la dernière copie enregistrée dans le profil.","La versione installata aggiorna lo schermo del proprietario. I visitatori vedono l'ultima copia salvata nel profilo."],["Rever minha prévia","Review my preview","Revisar mi vista previa","Revoir mon aperçu","Rivedi anteprima"],["Voltar à prévia","Back to preview","Volver a la vista previa","Retour à l'aperçu","Torna all'anteprima"],["Baixar minhas escolhas","Download my settings","Descargar mis ajustes","Télécharger mes réglages","Scarica le mie impostazioni"],["PerfilWiki · instalação e personalização","PerfilWiki · installation and customization","PerfilWiki · instalación y personalización","PerfilWiki · installation et personnalisation","PerfilWiki · installazione e personalizzazione"],["Suas escolhas ficam nesta aba. Nenhuma edição na Wikipédia.","Your settings stay in this tab. No Wikipedia edits.","Tus ajustes quedan en esta pestaña. Sin ediciones en Wikipedia.","Vos réglages restent dans cet onglet. Aucune modification sur Wikipédia.","Le impostazioni restano in questa scheda. Nessuna modifica su Wikipedia."],["Fechar","Close","Cerrar","Fermer","Chiudi"],["Cole o conteúdo de PerfilWiki_escolhas.json. As escolhas carregadas substituem os ajustes desta aba e não alteram a Wikipédia. Os textos editados diretamente na sua página continuam nela.","Paste the contents of PerfilWiki_escolhas.json. Loaded settings replace those in this tab without changing Wikipedia. Text edited directly on your page stays there.","Pega el contenido de PerfilWiki_escolhas.json. Los ajustes sustituyen los de esta pestaña sin modificar Wikipedia. Los textos editados en tu página permanecen allí.","Collez le contenu de PerfilWiki_escolhas.json. Les réglages remplacent ceux de cet onglet sans modifier Wikipédia. Les textes modifiés sur votre page y restent.","Incolla il contenuto di PerfilWiki_escolhas.json. Le impostazioni sostituiscono quelle della scheda senza modificare Wikipedia. I testi modificati sulla pagina restano lì."],["Escolhas em JSON","Settings in JSON","Ajustes en JSON","Réglages en JSON","Impostazioni in JSON"],["Carregar escolhas nesta aba","Load settings in this tab","Cargar ajustes en esta pestaña","Charger les réglages dans cet onglet","Carica impostazioni in questa scheda"],["EDITOR LOCAL · CONFERÊNCIA","LOCAL EDITOR · CHECK","EDITOR LOCAL · COMPROBACIÓN","ÉDITEUR LOCAL · VÉRIFICATION","EDITOR LOCALE · VERIFICA"],["Seu common.js","Your common.js","Tu common.js","Votre common.js","Il tuo common.js"],["Sua página de usuário","Your user page","Tu página de usuario","Votre page utilisateur","La tua pagina utente"],["Este editor permite conferir o código e preservar seus outros textos. Nada digitado aqui é executado ou enviado à Wikipédia.","Use this editor to check the code and preserve your other text. Nothing typed here is executed or sent to Wikipedia.","Este editor permite revisar el código y conservar otros textos. Nada escrito aquí se ejecuta ni se envía a Wikipedia.","Cet éditeur permet de vérifier le code et de conserver vos autres textes. Rien saisi ici n'est exécuté ni envoyé à Wikipédia.","Questo editor consente di verificare il codice e conservare gli altri testi. Nulla viene eseguito o inviato a Wikipedia."],["Adicionar trecho preparado","Add prepared snippet","Añadir fragmento preparado","Ajouter l'extrait préparé","Aggiungi frammento preparato"],["Adicione o trecho preparado para conferir a prévia.","Add the prepared snippet to check the preview.","Añade el fragmento preparado para comprobar la vista previa.","Ajoutez l'extrait préparé pour vérifier l'aperçu.","Aggiungi il frammento preparato per verificare l'anteprima."],["Voltar ao código","Back to code","Volver al código","Retour au code","Torna al codice"],["Conferir prévia local","Check local preview","Comprobar vista previa local","Vérifier l'aperçu local","Verifica anteprima locale"],["Conteúdo do rascunho local","Local draft contents","Contenido del borrador local","Contenu du brouillon local","Contenuto della bozza locale"],["Salvar mantém este rascunho somente na simulação.","Saving keeps this draft only in the simulation.","Guardar conserva este borrador solo en la simulación.","L'enregistrement conserve ce brouillon uniquement dans la simulation.","Il salvataggio conserva la bozza solo nella simulazione."],["Salvar rascunho local","Save local draft","Guardar borrador local","Enregistrer le brouillon local","Salva bozza locale"],["Na Wikipédia","On Wikipedia","En Wikipedia","Sur Wikipédia","Su Wikipedia"],["Anos na Wikipédia","Years on Wikipedia","Años en Wikipedia","Années sur Wikipédia","Anni su Wikipedia"],["Melhor sequência","Longest streak","Mejor racha","Plus longue série","Serie più lunga"],["Agradecimentos recebidos","Thanks received","Agradecimientos recibidos","Remerciements reçus","Ringraziamenti ricevuti"],["Contribuições","Contributions","Contribuciones","Contributions","Contributi"],["Edições","Edits","Ediciones","Modifications","Modifiche"],["Reversões","Reverts","Reversiones","Révocations","Annullamenti"],["Artigos diferentes editados","Distinct articles edited","Artículos distintos editados","Articles distincts modifiés","Articoli diversi modificati"],["Artigos editados","Articles edited","Artículos editados","Articles modifiés","Articoli modificati"],["Artigos criados","Articles created","Artículos creados","Articles créés","Articoli creati"],["Predefinições, módulos e scripts criados","Templates, modules and scripts created","Plantillas, módulos y scripts creados","Modèles, modules et scripts créés","Template, moduli e script creati"],["Artigo mais editado","Most-edited article","Artículo más editado","Article le plus modifié","Articolo più modificato"],["Bytes acrescentados","Bytes added","Bytes añadidos","Octets ajoutés","Byte aggiunti"],["Bytes removidos","Bytes removed","Bytes eliminados","Octets supprimés","Byte rimossi"],["Saldo positivo por edição","Positive size change per edit","Cambio de tamaño positivo por edición","Variation positive de taille par modification","Variazione positiva per modifica"],["Saldo negativo por edição","Negative size change per edit","Cambio de tamaño negativo por edición","Variation négative de taille par modification","Variazione negativa per modifica"],["Dias com edições","Days with edits","Días con ediciones","Jours avec des modifications","Giorni con modifiche"],["Edições em artigos","Article edits","Ediciones en artículos","Modifications d'articles","Modifiche agli articoli"],["Edições em discussões","Talk-page edits","Ediciones en discusiones","Modifications de discussions","Modifiche alle discussioni"],["Meses com edições","Months with edits","Meses con ediciones","Mois avec des modifications","Mesi con modifiche"],["Dia com mais edições","Day with most edits","Día con más ediciones","Jour le plus actif","Giorno con più modifiche"],["Edições nos últimos 30 dias","Edits in the last 30 days","Ediciones en los últimos 30 días","Modifications des 30 derniers jours","Modifiche negli ultimi 30 giorni"],["Média por dia ativo","Average per active day","Media por día activo","Moyenne par jour actif","Media per giorno attivo"],["Edições por dia com atividade","Edits per active day","Ediciones por día activo","Modifications par jour actif","Modifiche per giorno attivo"],["Anos com edições","Years with edits","Años con ediciones","Années avec des modifications","Anni con modifiche"],["Mês com mais edições","Month with most edits","Mes con más ediciones","Mois le plus actif","Mese con più modifiche"],["Agradecimentos enviados","Thanks sent","Agradecimientos enviados","Remerciements envoyés","Ringraziamenti inviati"],["Na Wikipédia em português","On Portuguese Wikipedia","En Wikipedia en portugués","Sur Wikipédia en portugais","Su Wikipedia in portoghese"],["Média de bytes acrescentados por edição","Average bytes added per edit","Media de bytes añadidos por edición","Moyenne d'octets ajoutés par modification","Media dei byte aggiunti per modifica"],["Todas as edições públicas da conta na ptwiki","All public edits by the account on ptwiki","Todas las ediciones públicas de la cuenta en ptwiki","Toutes les modifications publiques du compte sur ptwiki","Tutte le modifiche pubbliche dell'account su ptwiki"],["Maior acréscimo em uma edição","Largest addition in one edit","Mayor adición en una edición","Plus grand ajout en une modification","Maggiore aggiunta in una modifica"],["Maior remoção em uma edição","Largest removal in one edit","Mayor eliminación en una edición","Plus grande suppression en une modification","Maggiore rimozione in una modifica"],["Aguardando dados","Waiting for data","Esperando datos","En attente de données","In attesa dei dati"],["Nenhum dia","No day","Ningún día","Aucun jour","Nessun giorno"],["Nenhum mês","No month","Ningún mes","Aucun mois","Nessun mese"],["Nenhum artigo","No article","Ningún artículo","Aucun article","Nessun articolo"],[" dia"," day"," día"," jour"," giorno"],[" dias"," days"," días"," jours"," giorni"],[" ano"," year"," año"," an"," anno"],[" anos"," years"," años"," ans"," anni"],[" mês"," month"," mes"," mois"," mese"],[" meses"," months"," meses"," mois"," mesi"],[" edição"," edit"," edición"," modification"," modifica"],[" edições"," edits"," ediciones"," modifications"," modifiche"],[" de "," of "," de "," de "," di "],[" a "," to "," a "," au "," al "],["Gostou deste painel?","Like this panel?","¿Te gusta este panel?","Ce panneau vous plaît ?","Ti piace questo pannello?"],["Veja como adicionar à sua página de usuário.","See how to add it to your user page.","Descubre cómo añadirlo a tu página de usuario.","Découvrez comment l'ajouter à votre page utilisateur.","Scopri come aggiungerlo alla tua pagina utente."],["Conta criada em:","Account created on:","Cuenta creada el:","Compte créé le :","Account creato il:"],["Data de criação mais antiga disponível:","Earliest available creation date:","Fecha de creación más antigua disponible:","Date de création disponible la plus ancienne :","Data di creazione disponibile più antica:"],["Data de criação","Creation date","Fecha de creación","Date de création","Data di creazione"],["indisponível","unavailable","no disponible","indisponible","non disponibile"],["Estatutos indisponíveis","User groups unavailable","Permisos no disponibles","Statuts indisponibles","Gruppi non disponibili"],["Estatutos:","User groups:","Permisos:","Statuts :","Gruppi utente:"],["Estatutos consultados em {date} UTC","User groups checked on {date} UTC","Permisos consultados el {date} UTC","Statuts consultés le {date} UTC","Gruppi consultati il {date} UTC"],["Pode haver contas anteriores sem data registrada.","Earlier accounts may have no recorded date.","Puede haber cuentas anteriores sin fecha registrada.","Des comptes plus anciens peuvent ne pas avoir de date enregistrée.","Potrebbero esistere account precedenti senza data registrata."],["Imagem indisponível","Image unavailable","Imagen no disponible","Image indisponible","Immagine non disponibile"],["Ver arquivo no Commons","View file on Commons","Ver archivo en Commons","Voir le fichier sur Commons","Vedi file su Commons"],["Foto de {name}","Photo of {name}","Foto de {name}","Photo de {name}","Foto di {name}"],["Capa do perfil de {name}","Profile cover for {name}","Portada del perfil de {name}","Couverture du profil de {name}","Copertina del profilo di {name}"],["Atividade na Wikipédia em Português","Activity on Portuguese Wikipedia","Actividad en Wikipedia en portugués","Activité sur Wikipédia en portugais","Attività su Wikipedia in portoghese"],["As estatísticas ainda não foram consultadas.","Statistics have not been queried yet.","Aún no se consultaron las estadísticas.","Les statistiques n'ont pas encore été consultées.","Le statistiche non sono ancora state richieste."],["Última edição consultada","Last edit checked","Última edición consultada","Dernière modification consultée","Ultima modifica consultata"],["Última edição","Last edit","Última edición","Dernière modification","Ultima modifica"],["Horário indisponível","Time unavailable","Hora no disponible","Heure indisponible","Ora non disponibile"],["Nenhuma edição encontrada","No edits found","No se encontraron ediciones","Aucune modification trouvée","Nessuna modifica trovata"],["Meta de dias seguidos","Consecutive-day goal","Meta de días seguidos","Objectif de jours consécutifs","Obiettivo di giorni consecutivi"],["dias seguidos","consecutive days","días seguidos","jours consécutifs","giorni consecutivi"],["Próxima meta","Next goal","Próxima meta","Prochain objectif","Prossimo obiettivo"],["{current} de {goal}","{current} of {goal}","{current} de {goal}","{current} sur {goal}","{current} su {goal}"],["Faltam {number}","{number} to go","Faltan {number}","Encore {number}","Ne mancano {number}"],["{number} dias alcançados","{number} days achieved","{number} días alcanzados","{number} jours atteints","{number} giorni raggiunti"],["Seu primeiro marco: 7 dias","Your first milestone: 7 days","Tu primer hito: 7 días","Votre premier palier : 7 jours","Il tuo primo traguardo: 7 giorni"],["Depois: {number} dias","Then: {number} days","Después: {number} días","Ensuite : {number} jours","Poi: {number} giorni"],["{current} de {goal} dias seguidos, faltam {remaining} dias","{current} of {goal} consecutive days, {remaining} days to go","{current} de {goal} días seguidos, faltan {remaining} días","{current} jours consécutifs sur {goal}, encore {remaining} jours","{current} su {goal} giorni consecutivi, mancano {remaining} giorni"],["12 semanas","12 weeks","12 semanas","12 semaines","12 settimane"],["Edições por dia","Edits per day","Ediciones por día","Modifications par jour","Modifiche al giorno"],["{edits} edições em {days} dos últimos 30 dias. Fuso {zone}.","{edits} edits on {days} of the last 30 days. Time zone {zone}.","{edits} ediciones en {days} de los últimos 30 días. Zona {zone}.","{edits} modifications sur {days} des 30 derniers jours. Fuseau {zone}.","{edits} modifiche in {days} degli ultimi 30 giorni. Fuso {zone}."],[", dia ainda não concluído",", day not yet complete",", día aún no concluido",", journée pas encore terminée",", giorno non ancora concluso"],["{edits} edições · {articles} artigos diferentes editados nos últimos 30 dias","{edits} edits · {articles} distinct articles edited in the last 30 days","{edits} ediciones · {articles} artículos distintos editados en los últimos 30 días","{edits} modifications · {articles} articles distincts modifiés ces 30 derniers jours","{edits} modifiche · {articles} articoli diversi modificati negli ultimi 30 giorni"],["Nenhuma","None","Ninguna","Aucune","Nessuna"],["Mais edições","More edits","Más ediciones","Plus de modifications","Più modifiche"],["Visualizações dos artigos editados por {name}.","Pageviews of articles edited by {name}.","Visualizaciones de los artículos editados por {name}.","Consultations des articles modifiés par {name}.","Visualizzazioni degli articoli modificati da {name}."],["Somente após sua primeira edição em cada artigo.","Only after your first edit to each article.","Solo después de tu primera edición en cada artículo.","Uniquement après votre première modification de chaque article.","Solo dopo la tua prima modifica a ciascun articolo."],["Os períodos somam as visitas recebidas depois da sua primeira edição em cada artigo. Os totais abrangem todos os artigos elegíveis, mesmo quando a lista mostra apenas uma parte. A contagem de visualizações começa no dia seguinte à primeira edição, em UTC. As sequências usam o fuso {zone}. A última edição corresponde ao histórico consultado, que pode ter sido atualizado antes desta visita.","Periods add up views after your first edit to each article. Totals cover all eligible articles, even when the list shows only some. Counting starts the day after your first edit, in UTC. Streaks use {zone}. The last edit comes from the queried history, which may have been refreshed before this visit.","Los períodos suman visitas posteriores a tu primera edición en cada artículo. Los totales abarcan todos los artículos elegibles aunque la lista muestre solo parte. La cuenta comienza al día siguiente de la primera edición, en UTC. Las rachas usan {zone}. La última edición procede del historial consultado, que puede haberse actualizado antes de esta visita.","Les périodes totalisent les visites après votre première modification de chaque article. Les totaux couvrent tous les articles admissibles, même si la liste n'en affiche qu'une partie. Le calcul commence le lendemain de la première modification, en UTC. Les séries utilisent {zone}. La dernière modification provient de l'historique consulté, parfois actualisé avant cette visite.","I periodi sommano le visite dopo la tua prima modifica a ciascun articolo. I totali coprono tutti gli articoli idonei anche quando l'elenco ne mostra solo alcuni. Il conteggio inizia il giorno dopo la prima modifica, in UTC. Le serie usano {zone}. L'ultima modifica proviene dalla cronologia consultata, che può essere stata aggiornata prima della visita."],["Sobre estes dados","About these data","Sobre estos datos","À propos de ces données","Informazioni sui dati"],["30 dias","30 days","30 días","30 jours","30 giorni"],["90 dias","90 days","90 días","90 jours","90 giorni"],["12 meses","12 months","12 meses","12 mois","12 mesi"],["Total acumulado","All-time total","Total acumulado","Total cumulé","Totale cumulativo"],["Personalizado","Custom","Personalizado","Personnalisé","Personalizzato"],["Visualizações nos últimos 30 dias","Pageviews in the last 30 days","Visualizaciones en los últimos 30 días","Consultations des 30 derniers jours","Visualizzazioni negli ultimi 30 giorni"],["Visualizações nos últimos 90 dias","Pageviews in the last 90 days","Visualizaciones en los últimos 90 días","Consultations des 90 derniers jours","Visualizzazioni negli ultimi 90 giorni"],["Visualizações nos últimos 12 meses","Pageviews in the last 12 months","Visualizaciones en los últimos 12 meses","Consultations des 12 derniers mois","Visualizzazioni negli ultimi 12 mesi"],["Visualizações acumuladas","All-time pageviews","Visualizaciones acumuladas","Consultations cumulées","Visualizzazioni cumulative"],["Visualizações no período escolhido","Pageviews in the selected period","Visualizaciones en el período elegido","Consultations de la période choisie","Visualizzazioni nel periodo scelto"],["Período de visualizações","Pageview period","Período de visualizaciones","Période des consultations","Periodo delle visualizzazioni"],["Data inicial","Start date","Fecha inicial","Date de début","Data iniziale"],["Data final","End date","Fecha final","Date de fin","Data finale"],["nos {number} artigos editados por você","across {number} articles you edited","en los {number} artículos que editaste","sur les {number} articles que vous avez modifiés","nei {number} articoli che hai modificato"],["Escolha as datas e aplique o período.","Choose dates and apply the period.","Elige las fechas y aplica el período.","Choisissez les dates et appliquez la période.","Scegli le date e applica il periodo."],["Somando as visualizações de todos os artigos editados.","Adding up views of all edited articles.","Sumando las visualizaciones de todos los artículos editados.","Calcul des consultations de tous les articles modifiés.","Somma delle visualizzazioni di tutti gli articoli modificati."],["Até {date}","Through {date}","Hasta {date}","Jusqu'au {date}","Fino al {date}"],["Histórico disponível desde 1 jul. de 2015. Artigos editados antes disso têm contagem parcial.","History is available from 1 July 2015. Articles edited earlier have partial counts.","Historial disponible desde el 1 de julio de 2015. Los artículos editados antes tienen recuentos parciales.","Historique disponible depuis le 1er juillet 2015. Les articles modifiés auparavant ont des totaux partiels.","Cronologia disponibile dal 1 luglio 2015. Gli articoli modificati prima hanno conteggi parziali."],["Todo o histórico · {number} artigos editados","All history · {number} articles edited","Todo el historial · {number} artículos editados","Tout l'historique · {number} articles modifiés","Tutta la cronologia · {number} articoli modificati"],["Artigo","Article","Artículo","Article","Articolo"],["Ordem provisória","Provisional order","Orden provisional","Classement provisoire","Ordine provvisorio"],["Visualizações","Pageviews","Visualizaciones","Consultations","Visualizzazioni"],["Primeira edição: {date}","First edit: {date}","Primera edición: {date}","Première modification : {date}","Prima modifica: {date}"],["Mostrar só 10","Show only 10","Mostrar solo 10","Afficher seulement 10","Mostra solo 10"],["Ocultar esta etapa","Hide this batch","Ocultar este grupo","Masquer ce groupe","Nascondi questo gruppo"],["Mostrar mais {number}","Show {number} more","Mostrar {number} más","Afficher {number} de plus","Mostra altri {number}"],["Exibindo {shown} de {total} artigos","Showing {shown} of {total} articles","Mostrando {shown} de {total} artículos","Affichage de {shown} articles sur {total}","Visualizzati {shown} articoli su {total}"],["Consulta em andamento · {number} artigos consultados","Query in progress · {number} articles checked","Consulta en curso · {number} artículos consultados","Consultation en cours · {number} articles consultés","Richiesta in corso · {number} articoli consultati"],["Atualizado em {date} UTC","Updated {date} UTC","Actualizado el {date} UTC","Mis à jour le {date} UTC","Aggiornato il {date} UTC"],["Horário salvo em {date}","Time saved on {date}","Hora guardada el {date}","Heure enregistrée le {date}","Ora salvata il {date}"],["Horário local em {date}","Local time on {date}","Hora local el {date}","Heure locale le {date}","Ora locale il {date}"],["há menos de 1 minuto","less than 1 minute ago","hace menos de 1 minuto","il y a moins d'une minute","meno di 1 minuto fa"],["Usuário registrado","Registered user","Usuario registrado","Utilisateur inscrit","Utente registrato"],["Autoconfirmado","Autoconfirmed","Autoconfirmado","Autoconfirmé","Autoconvalidato"],["Confirmado","Confirmed","Confirmado","Confirmé","Convalidato"],["Autoconfirmado estendido","Extended confirmed","Autoconfirmado extendido","Autoconfirmé étendu","Autoconvalidato esteso"],["Autorrevisor","Autopatrolled","Autoverificado","Autopatrouillé","Autoverificato"],["Revisor","Reviewer","Revisor","Réviseur","Revisore"],["Reversor","Rollbacker","Reversor","Révocateur","Rollbacker"],["Eliminador","Eliminator","Eliminador","Suppresseur","Eliminatore"],["Administrador","Administrator","Administrador","Administrateur","Amministratore"],["Burocrata","Bureaucrat","Burócrata","Bureaucrate","Burocrate"],["Verificador de contas","CheckUser","Verificador de usuarios","Vérificateur d'utilisateurs","CheckUser"],["Supervisor","Oversighter","Supresor","Masqueur","Soppressore"],["Robô","Bot","Bot","Robot","Bot"],["Administrador de interface","Interface administrator","Administrador de interfaz","Administrateur d'interface","Amministratore dell'interfaccia"],["Editor de interface","Interface editor","Editor de interfaz","Éditeur d'interface","Editore dell'interfaccia"],["Isento de bloqueio de IP","IP block exempt","Exento de bloqueo de IP","Exempté de blocage d'IP","Esente dal blocco IP"],["Importador","Importer","Importador","Importateur","Importatore"],["Importador transwiki","Transwiki importer","Importador transwiki","Importateur transwiki","Importatore transwiki"],["Imagem do dia da Wikipédia em português","Portuguese Wikipedia picture of the day","Imagen del día de Wikipedia en portugués","Image du jour de Wikipédia en portugais","Immagine del giorno di Wikipedia in portoghese"],["Atualize o trecho do perfil para carregar a capa pelo calendário da Wikipédia.","Update the profile snippet to load the cover using Wikipedia's calendar.","Actualiza el fragmento del perfil para cargar la portada según el calendario de Wikipedia.","Mettez à jour l'extrait du profil pour charger la couverture selon le calendrier de Wikipédia.","Aggiorna il frammento del profilo per caricare la copertina dal calendario di Wikipedia."],["Imagem de capa indisponível","Cover image unavailable","Portada no disponible","Image de couverture indisponible","Immagine di copertina non disponibile"],["Ver arquivo e créditos","View file and credits","Ver archivo y créditos","Voir le fichier et les crédits","Vedi file e crediti"],["Imagem do dia do Commons","Commons picture of the day","Imagen del día de Commons","Image du jour de Commons","Immagine del giorno di Commons"],["Imagem do dia do Wikimedia Commons","Wikimedia Commons picture of the day","Imagen del día de Wikimedia Commons","Image du jour de Wikimedia Commons","Immagine del giorno di Wikimedia Commons"],["Imagem do dia do Commons · Prévia ilustrativa","Commons picture of the day · Illustrative preview","Imagen del día de Commons · Vista previa ilustrativa","Image du jour de Commons · Aperçu illustratif","Immagine del giorno di Commons · Anteprima illustrativa"],["Imagem do dia do Commons · Aguardando consulta","Commons picture of the day · Waiting for query","Imagen del día de Commons · Esperando consulta","Image du jour de Commons · En attente de consultation","Immagine del giorno di Commons · In attesa della richiesta"],["Imagem do dia indisponível","Picture of the day unavailable","Imagen del día no disponible","Image du jour indisponible","Immagine del giorno non disponibile"],[" · Clique na imagem para ver o arquivo e os créditos."," · Click the image to view the file and credits."," · Pulsa la imagen para ver el archivo y los créditos."," · Cliquez sur l'image pour voir le fichier et les crédits."," · Fai clic sull'immagine per vedere il file e i crediti."],["Imagem do dia da Wikipédia em português · Prévia ilustrativa","Portuguese Wikipedia picture of the day · Illustrative preview","Imagen del día de Wikipedia en portugués · Vista previa ilustrativa","Image du jour de Wikipédia en portugais · Aperçu illustratif","Immagine del giorno di Wikipedia in portoghese · Anteprima illustrativa"],["Descrição ilustrativa da imagem do dia.","Illustrative picture-of-the-day description.","Descripción ilustrativa de la imagen del día.","Description illustrative de l'image du jour.","Descrizione illustrativa dell'immagine del giorno."],["Prévia ilustrativa da imagem do dia da Wikipédia em português","Illustrative Portuguese Wikipedia picture-of-the-day preview","Vista previa ilustrativa de la imagen del día de Wikipedia en portugués","Aperçu illustratif de l'image du jour de Wikipédia en portugais","Anteprima illustrativa dell'immagine del giorno di Wikipedia in portoghese"],["Não foi possível recuperar este painel local. Abra o instalador e confira suas escolhas.","This local panel could not be recovered. Open the installer and check your settings.","No se pudo recuperar este panel local. Abre el instalador y revisa los ajustes.","Ce panneau local n'a pas pu être récupéré. Ouvrez l'installateur et vérifiez vos réglages.","Impossibile recuperare questo pannello locale. Apri il programma di installazione e controlla le impostazioni."],["Idioma inválido.","Invalid language.","Idioma no válido.","Langue invalide.","Lingua non valida."],["África","Africa","África","Afrique","Africa"],["Américas","Americas","América","Amériques","Americhe"],["Antártida","Antarctica","Antártida","Antarctique","Antartide"],["Ártico","Arctic","Ártico","Arctique","Artico"],["Ásia","Asia","Asia","Asie","Asia"],["Atlântico","Atlantic","Atlántico","Atlantique","Atlantico"],["Austrália","Australia","Australia","Australie","Australia"],["Europa","Europe","Europa","Europe","Europa"],["Oceano Índico","Indian Ocean","Océano Índico","Océan Indien","Oceano Indiano"],["Pacífico","Pacific","Pacífico","Pacifique","Pacifico"],["Outros","Other","Otros","Autres","Altri"],["UTC e horários fixos","UTC and fixed offsets","UTC y desfases fijos","UTC et décalages fixes","UTC e scarti fissi"],["Ex.: Marina Exemplo","E.g. Marina Exemplo","Ej.: Marina Exemplo","Ex. : Marina Exemplo","Es.: Marina Exemplo"],["Ex.: Example.jpg","E.g. Example.jpg","Ej.: Example.jpg","Ex. : Example.jpg","Es.: Example.jpg"],["Ex.: Paisagem.jpg","E.g. Paisagem.jpg","Ej.: Paisagem.jpg","Ex. : Paisagem.jpg","Es.: Paisagem.jpg"],["Ex.: [[Universidade Federal de Minas Gerais|UFMG]]","E.g. [[Universidade Federal de Minas Gerais|UFMG]]","Ej.: [[Universidade Federal de Minas Gerais|UFMG]]","Ex. : [[Universidade Federal de Minas Gerais|UFMG]]","Es.: [[Universidade Federal de Minas Gerais|UFMG]]"],["Escolher outra cor","Choose another color","Elegir otro color","Choisir une autre couleur","Scegli un altro colore"],["Ex.: Meu foco atual","E.g. My current focus","Ej.: Mi enfoque actual","Ex. : Mes priorités","Es.: Il mio obiettivo attuale"],["Azul","Blue","Azul","Bleu","Blu"],["Verde","Green","Verde","Vert","Verde"],["Violeta","Violet","Violeta","Violet","Viola"],["Mantenha ao menos um contador selecionado.","Keep at least one counter selected.","Mantén al menos un contador seleccionado.","Gardez au moins un compteur sélectionné.","Mantieni almeno un contatore selezionato."],["{number} contador","{number} counter","{number} contador","{number} compteur","{number} contatore"],["{number} contadores","{number} counters","{number} contadores","{number} compteurs","{number} contatori"],["Sem contadores","No counters","Sin contadores","Sans compteurs","Senza contatori"],["Somente as caixas","Boxes only","Solo las casillas","Cases seules","Solo i riquadri"],["Ative no seu navegador","Activate in your browser","Activar en tu navegador","Activer dans votre navigateur","Attiva nel tuo browser"],["Salvo localmente","Saved locally","Guardado localmente","Enregistré localement","Salvato localmente"],["Para experimentar","To try","Para probar","Pour essayer","Da provare"],["Fechar {label}","Close {label}","Cerrar {label}","Fermer {label}","Chiudi {label}"],["Cores","Colors","Colores","Couleurs","Colori"],["Cinza","Gray","Gris","Gris","Grigio"],["Vermelho","Red","Rojo","Rouge","Rosso"],["Amarelo","Yellow","Amarillo","Jaune","Giallo"],["{color} claro","Light {color}","{color} claro","{color} clair","{color} chiaro"],["{color} escuro","Dark {color}","{color} oscuro","{color} foncé","{color} scuro"],["Espectro de cores","Color spectrum","Espectro de colores","Spectre de couleurs","Spettro dei colori"],["Cor selecionada: {color}","Selected color: {color}","Color seleccionado: {color}","Couleur sélectionnée : {color}","Colore selezionato: {color}"],["Use as setas para escolher a cor. Esquerda e direita percorrem as cores, acima e abaixo ajustam a intensidade. Segure Shift para passos maiores.","Use the arrow keys to choose a color. Left and right move through the colors, up and down adjust intensity. Hold Shift for larger steps.","Usa las flechas para elegir el color. Izquierda y derecha recorren los colores, arriba y abajo ajustan la intensidad. Mantén pulsada Mayús para pasos mayores.","Utilisez les flèches pour choisir la couleur. Gauche et droite parcourent les couleurs, haut et bas règlent l'intensité. Maintenez Maj pour des pas plus grands.","Usa i tasti freccia per scegliere il colore. Sinistra e destra scorrono i colori, su e giù regolano l'intensità. Tieni premuto Maiusc per passi più ampi."],["Clarear ou escurecer","Lighten or darken","Aclarar u oscurecer","Éclaircir ou assombrir","Schiarisci o scurisci"],["Escuro","Dark","Oscuro","Foncé","Scuro"],["Claro","Light","Claro","Clair","Chiaro"],["{amount}% de claridade","{amount}% lightness","{amount}% de luminosidad","{amount} % de luminosité","{amount}% di luminosità"],["Código da cor","Color code","Código del color","Code couleur","Codice del colore"],["Conferir a instalação","Check installation","Comprobar la instalación","Vérifier l'installation","Verifica l'installazione"],["Depois de salvar os trechos na Wikipédia, confira o carregador, os blocos do perfil e os estilos.","After saving the snippets on Wikipedia, check the loader, profile blocks and styles.","Después de guardar los fragmentos en Wikipedia, comprueba el cargador, los bloques del perfil y los estilos.","Après avoir enregistré les extraits sur Wikipédia, vérifiez le chargeur, les blocs du profil et les styles.","Dopo aver salvato i frammenti su Wikipedia, verifica il caricatore, i blocchi del profilo e gli stili."],["Verificando...","Checking...","Comprobando...","Vérification...","Verifica in corso..."],["Verificar instalação","Verify installation","Verificar instalación","Vérifier l'installation","Verifica l'installazione"],["A consulta lê somente páginas públicas, sem usar seu login. Ela confere os arquivos, mas não executa o script no navegador.","The check reads only public pages without using your login. It checks the files without running the script in your browser.","La comprobación lee solo páginas públicas sin usar tu sesión. Comprueba los archivos sin ejecutar el script en tu navegador.","La vérification lit uniquement des pages publiques sans utiliser votre session. Elle vérifie les fichiers sans exécuter le script dans votre navigateur.","La verifica legge solo pagine pubbliche senza usare la tua sessione. Controlla i file senza eseguire lo script nel browser."],["A consulta demorou mais que o esperado. Tente novamente.","The check took longer than expected. Try again.","La comprobación tardó más de lo esperado. Inténtalo de nuevo.","La vérification a pris plus de temps que prévu. Réessayez.","La verifica ha richiesto più tempo del previsto. Riprova."],["Não foi possível conferir a instalação.","The installation could not be checked.","No se pudo comprobar la instalación.","L'installation n'a pas pu être vérifiée.","Non è stato possibile verificare l'installazione."],["Os trechos públicos conferem com esta instalação.","The public snippets match this installation.","Los fragmentos públicos coinciden con esta instalación.","Les extraits publics correspondent à cette installation.","I frammenti pubblici corrispondono a questa installazione."],["Alguns itens ainda precisam de conferência.","Some items still need checking.","Algunos elementos aún necesitan revisión.","Certains éléments doivent encore être vérifiés.","Alcuni elementi devono ancora essere verificati."],["Arquivos e documentação","Files and documentation","Archivos y documentación","Fichiers et documentation","File e documentazione"],["Seu nome de usuário","Your username","Tu nombre de usuario","Votre nom d'utilisateur","Il tuo nome utente"],["Prévia do PerfilWiki para {user}","PerfilWiki preview for {user}","Vista previa de PerfilWiki para {user}","Aperçu de PerfilWiki pour {user}","Anteprima di PerfilWiki per {user}"],["Painel de exemplo de {user}","Example dashboard for {user}","Panel de ejemplo de {user}","Tableau de bord d'exemple pour {user}","Pannello di esempio di {user}"],["Dados de exemplo","Example data","Datos de ejemplo","Données d'exemple","Dati di esempio"],["Os números são fictícios. Esta prévia usa o código do painel.","The numbers are fictional. This preview uses the dashboard code.","Las cifras son ficticias. Esta vista previa usa el código del panel.","Les chiffres sont fictifs. Cet aperçu utilise le code du tableau de bord.","I numeri sono fittizi. Questa anteprima usa il codice del pannello."],["Editar painel","Edit dashboard","Editar panel","Modifier le tableau de bord","Modifica il pannello"],["Arraste as caixas para mudar a ordem. Use a estrela para destacar.","Drag the boxes to change their order. Use the star to highlight them.","Arrastra las cajas para cambiar el orden. Usa la estrella para destacarlas.","Faites glisser les cases pour changer leur ordre. Utilisez l'étoile pour les mettre en valeur.","Trascina le caselle per cambiarne l'ordine. Usa la stella per metterle in risalto."],["+ Adicionar caixas","+ Add boxes","+ Añadir cajas","+ Ajouter des cases","+ Aggiungi caselle"],["Caixas do painel","Dashboard boxes","Cajas del panel","Cases du tableau de bord","Caselle del pannello"],["Fechar seleção de caixas","Close box selection","Cerrar selección de cajas","Fermer la sélection des cases","Chiudi la selezione delle caselle"],["Escolha as caixas que deseja exibir. Mantenha pelo menos uma selecionada.","Choose the boxes to display. Keep at least one selected.","Elige las cajas que deseas mostrar. Mantén al menos una seleccionada.","Choisissez les cases à afficher. Gardez-en au moins une sélectionnée.","Scegli le caselle da mostrare. Mantienine selezionata almeno una."],["Preparando a prévia local.","Preparing the local preview.","Preparando la vista previa local.","Préparation de l'aperçu local.","Preparazione dell'anteprima locale."],["Não foi possível montar a prévia local. Confira se os arquivos do painel foram preparados.","The local preview could not be built. Check that the dashboard files have been prepared.","No se pudo crear la vista previa local. Comprueba que los archivos del panel estén preparados.","L'aperçu local n'a pas pu être créé. Vérifiez que les fichiers du tableau de bord ont été préparés.","Non è stato possibile creare l'anteprima locale. Verifica che i file del pannello siano stati preparati."],["A prévia local não respondeu. Confira se os arquivos do painel foram preparados.","The local preview did not respond. Check that the dashboard files have been prepared.","La vista previa local no respondió. Comprueba que los archivos del panel estén preparados.","L'aperçu local n'a pas répondu. Vérifiez que les fichiers du tableau de bord ont été préparés.","L'anteprima locale non ha risposto. Verifica che i file del pannello siano stati preparati."],["Confira a conta e as opções antes de verificar.","Check the account and settings before verifying.","Revisa la cuenta y las opciones antes de verificar.","Vérifiez le compte et les options avant de continuer.","Controlla l'account e le opzioni prima di verificare."],["Ativação no common.js","Activation in common.js","Activación en common.js","Activation dans common.js","Attivazione in common.js"],["Blocos no perfil","Profile blocks","Bloques del perfil","Blocs du profil","Blocchi del profilo"],["Programa do PerfilWiki","PerfilWiki program","Programa de PerfilWiki","Programme PerfilWiki","Programma di PerfilWiki"],["Estilos do painel","Dashboard styles","Estilos del panel","Styles du tableau de bord","Stili del pannello"],["A página ainda não existe.","The page does not exist yet.","La página aún no existe.","La page n'existe pas encore.","La pagina non esiste ancora."],["Não foi possível conferir o conteúdo público desta página.","The public content of this page could not be checked.","No se pudo comprobar el contenido público de esta página.","Le contenu public de cette page n'a pas pu être vérifié.","Non è stato possibile verificare il contenuto pubblico di questa pagina."],["O trecho preparado foi encontrado, mas o código ao redor precisa de conferência manual.","The prepared snippet was found, but the surrounding code needs manual review.","Se encontró el fragmento preparado, pero el código que lo rodea necesita revisión manual.","L'extrait préparé a été trouvé, mais le code qui l'entoure doit être vérifié manuellement.","Il frammento preparato è stato trovato, ma il codice circostante richiede una verifica manuale."],["O trecho preparado está no nível principal do common.js. A conferência não executa o programa.","The prepared snippet is at the top level of common.js. This check does not run the program.","El fragmento preparado está en el nivel principal de common.js. La comprobación no ejecuta el programa.","L'extrait préparé est au niveau principal de common.js. La vérification n'exécute pas le programme.","Il frammento preparato è al livello principale di common.js. La verifica non esegue il programma."],["A folha precisa ter o modelo CSS higienizado.","The stylesheet must use the sanitized CSS content model.","La hoja debe usar el modelo de contenido CSS saneado.","La feuille doit utiliser le modèle de contenu CSS nettoyé.","Il foglio deve usare il modello di contenuto CSS sanitizzato."],["Confere com os arquivos e as escolhas preparados.","Matches the prepared files and settings.","Coincide con los archivos y las opciones preparados.","Correspond aux fichiers et aux choix préparés.","Corrisponde ai file e alle opzioni preparati."],["Os blocos publicados não correspondem às escolhas preparadas.","The published blocks do not match the prepared settings.","Los bloques publicados no coinciden con las opciones preparadas.","Les blocs publiés ne correspondent pas aux choix préparés.","I blocchi pubblicati non corrispondono alle opzioni preparate."],["O carregador está diferente, incompleto ou repetido.","The loader is different, incomplete or duplicated.","El cargador es diferente, está incompleto o repetido.","Le chargeur est différent, incomplet ou en double.","Il caricatore è diverso, incompleto o duplicato."],["O arquivo compartilhado é diferente desta distribuição.","The shared file differs from this distribution.","El archivo compartido difiere de esta distribución.","Le fichier partagé diffère de cette distribution.","Il file condiviso è diverso da questa distribuzione."],["Consulta pública indisponível. Tente novamente.","The public query is unavailable. Try again.","La consulta pública no está disponible. Inténtalo de nuevo.","La consultation publique est indisponible. Réessayez.","La consultazione pubblica non è disponibile. Riprova."],["A resposta excedeu o limite da conferência.","The response exceeded the check size limit.","La respuesta superó el límite de la comprobación.","La réponse dépasse la limite de taille de la vérification.","La risposta ha superato il limite di dimensione della verifica."],["Os arquivos locais não correspondem a esta versão.","The local files do not match this version.","Los archivos locales no coinciden con esta versión.","Les fichiers locaux ne correspondent pas à cette version.","I file locali non corrispondono a questa versione."],["A Wikipédia não devolveu uma resposta completa. Tente novamente.","Wikipedia did not return a complete response. Try again.","Wikipedia no devolvió una respuesta completa. Inténtalo de nuevo.","Wikipédia n'a pas renvoyé de réponse complète. Réessayez.","Wikipedia non ha restituito una risposta completa. Riprova."],["Opção de aparência desconhecida.","Unknown appearance option.","Opción de apariencia desconocida.","Option d'apparence inconnue.","Opzione di aspetto sconosciuta."],["Tema inválido.","Invalid theme.","Tema no válido.","Thème non valide.","Tema non valido."],["Cor inválida. Use seis dígitos após #.","Invalid color. Use six digits after #.","Color no válido. Usa seis dígitos después de #.","Couleur non valide. Utilisez six chiffres après #.","Colore non valido. Usa sei cifre dopo #."],["Cor de destaque inválida. Use seis dígitos após #.","Invalid highlight color. Use six digits after #.","Color de resaltado no válido. Usa seis dígitos después de #.","Couleur de mise en évidence non valide. Utilisez six chiffres après #.","Colore di evidenziazione non valido. Usa sei cifre dopo #."],["Cor do topo inválida. Use seis dígitos após #.","Invalid profile-top color. Use six digits after #.","Color de la parte superior del perfil no válido. Usa seis dígitos después de #.","Couleur du haut du profil non valide. Utilisez six chiffres après #.","Colore della parte superiore del profilo non valido. Usa sei cifre dopo #."],["Cor do texto inválida. Use seis dígitos após # ou a opção automática.","Invalid text color. Use six digits after # or choose automatic.","Color de texto no válido. Usa seis dígitos después de # o elige la opción automática.","Couleur du texte non valide. Utilisez six chiffres après # ou choisissez l'option automatique.","Colore del testo non valido. Usa sei cifre dopo # o scegli l'opzione automatica."],["Opção de apresentação inválida.","Invalid display option.","Opción de presentación no válida.","Option d'affichage non valide.","Opzione di visualizzazione non valida."],["Posição das informações inválida.","Invalid information placement.","Ubicación de la información no válida.","Position des informations non valide.","Posizione delle informazioni non valida."],["Escolha as datas do período personalizado.","Choose the dates for the custom period.","Elige las fechas del período personalizado.","Choisissez les dates de la période personnalisée.","Scegli le date del periodo personalizzato."],["Escolha válida para a data de criação da conta.","Choose a valid account creation date option.","Elige una opción válida para la fecha de creación de la cuenta.","Choisissez une option valide pour la date de création du compte.","Scegli un'opzione valida per la data di creazione dell'account."],["Escolha válida para os estatutos.","Choose a valid user rights option.","Elige una opción válida para los permisos de usuario.","Choisissez une option valide pour les statuts.","Scegli un'opzione valida per i diritti utente."],["Escolha válida para o horário local.","Choose a valid local time option.","Elige una opción válida para la hora local.","Choisissez une option valide pour l'heure locale.","Scegli un'opzione valida per l'ora locale."],["Escolha pelo menos um painel.","Choose at least one panel.","Elige al menos un panel.","Choisissez au moins un panneau.","Scegli almeno un pannello."],["Escolha contadores válidos, sem repetir.","Choose valid counters without duplicates.","Elige contadores válidos, sin repetirlos.","Choisissez des compteurs valides, sans doublons.","Scegli contatori validi, senza duplicati."],["Escolha destaques válidos, sem repetir.","Choose valid highlights without duplicates.","Elige resaltados válidos, sin repetirlos.","Choisissez des mises en évidence valides, sans doublons.","Scegli evidenziazioni valide, senza duplicati."],["Escolha uma data inicial e uma data final.","Choose a start date and an end date.","Elige una fecha de inicio y una fecha de fin.","Choisissez une date de début et une date de fin.","Scegli una data di inizio e una data di fine."],["Use datas entre 1 de julho de 2015 e o último dia completo, com o início antes do fim.","Use dates between July 1, 2015 and the last complete day, with the start before the end.","Usa fechas entre el 1 de julio de 2015 y el último día completo, con el inicio antes del fin.","Utilisez des dates entre le 1er juillet 2015 et le dernier jour complet, avec le début avant la fin.","Usa date tra il 1° luglio 2015 e l'ultimo giorno completo, con l'inizio prima della fine."],["Posição da informação inválida.","Invalid field placement.","Ubicación del campo no válida.","Position du champ non valide.","Posizione del campo non valida."],["Use uma cor no formato #3366cc.","Use a color in the format #3366cc.","Usa un color con el formato #3366cc.","Utilisez une couleur au format #3366cc.","Usa un colore nel formato #3366cc."],["Digite o nome da conta.","Enter the account name.","Escribe el nombre de la cuenta.","Saisissez le nom du compte.","Inserisci il nome dell'account."],["Escolha um fuso horário.","Choose a time zone.","Elige una zona horaria.","Choisissez un fuseau horaire.","Scegli un fuso orario."],["Confira as opções de aparência.","Check the appearance settings.","Revisa las opciones de apariencia.","Vérifiez les options d'apparence.","Controlla le opzioni di aspetto."],["Digite o nome da conta, sem o prefixo Usuário:.","Enter the account name without the Usuário: prefix.","Escribe el nombre de la cuenta sin el prefijo Usuário:.","Saisissez le nom du compte sans le préfixe Usuário:.","Inserisci il nome dell'account senza il prefisso Usuário:."],["Use apenas o nome da conta, sem prefixo, barras ou caracteres de código.","Use only the account name, without a prefix, slashes or markup characters.","Usa solo el nombre de la cuenta, sin prefijo, barras ni caracteres de código.","Utilisez uniquement le nom du compte, sans préfixe, barres obliques ni caractères de code.","Usa solo il nome dell'account, senza prefisso, barre o caratteri di codice."],["Use até 100 caracteres, sem código ou quebras de linha.","Use up to 100 characters, without markup or line breaks.","Usa hasta 100 caracteres, sin código ni saltos de línea.","Utilisez au maximum 100 caractères, sans code ni sauts de ligne.","Usa al massimo 100 caratteri, senza codice o interruzioni di riga."],["Escolha um fuso horário válido, como America/Sao_Paulo.","Choose a valid time zone, such as America/Sao_Paulo.","Elige una zona horaria válida, como America/Sao_Paulo.","Choisissez un fuseau horaire valide, comme America/Sao_Paulo.","Scegli un fuso orario valido, come America/Sao_Paulo."],["Escolha a página de usuário ou uma subpágina.","Choose the user page or a subpage.","Elige la página de usuario o una subpágina.","Choisissez la page utilisateur ou une sous-page.","Scegli la pagina utente o una sottopagina."],["Dê um nome à subpágina, sem barras, pontos de navegação ou caracteres de código.","Name the subpage without slashes, navigation dots or markup characters.","Pon un nombre a la subpágina sin barras, puntos de navegación ni caracteres de código.","Nommez la sous-page sans barres obliques, points de navigation ni caractères de code.","Assegna un nome alla sottopagina senza barre, punti di navigazione o caratteri di codice."],["Confira a cor e as opções de aparência.","Check the color and appearance settings.","Revisa el color y las opciones de apariencia.","Vérifiez la couleur et les options d'apparence.","Controlla il colore e le opzioni di aspetto."],["Mantenha pelo menos um bloco visível.","Keep at least one block visible.","Mantén al menos un bloque visible.","Gardez au moins un bloc visible.","Mantieni visibile almeno un blocco."],["Escolha pelo menos um contador para o bloco de estatísticas.","Choose at least one counter for the statistics block.","Elige al menos un contador para el bloque de estadísticas.","Choisissez au moins un compteur pour le bloc de statistiques.","Scegli almeno un contatore per il blocco delle statistiche."],["Cole um arquivo JSON de escolhas com até 1 MiB.","Paste a settings JSON file of up to 1 MiB.","Pega un archivo JSON de opciones de hasta 1 MiB.","Collez un fichier JSON de réglages de 1 Mio maximum.","Incolla un file JSON delle impostazioni di dimensioni non superiori a 1 MiB."],["Cole o conteúdo do arquivo PerfilWiki_escolhas.json, sem código JavaScript.","Paste the contents of PerfilWiki_escolhas.json, without JavaScript code.","Pega el contenido del archivo PerfilWiki_escolhas.json, sin código JavaScript.","Collez le contenu du fichier PerfilWiki_escolhas.json, sans code JavaScript.","Incolla il contenuto del file PerfilWiki_escolhas.json, senza codice JavaScript."],["O arquivo contém uma opção desconhecida.","The file contains an unknown option.","El archivo contiene una opción desconocida.","Le fichier contient une option inconnue.","Il file contiene un'opzione sconosciuta."],["O arquivo contém uma estrutura muito longa.","The file contains a structure that is too deeply nested.","El archivo contiene una estructura demasiado anidada.","Le fichier contient une structure trop imbriquée.","Il file contiene una struttura troppo annidata."],["O arquivo contém uma chave inválida.","The file contains an invalid key.","El archivo contiene una clave no válida.","Le fichier contient une clé non valide.","Il file contiene una chiave non valida."],["Use um arquivo de escolhas do PerfilWiki 1.x.","Use a PerfilWiki 1.x settings file.","Usa un archivo de opciones de PerfilWiki 1.x.","Utilisez un fichier de réglages de PerfilWiki 1.x.","Usa un file delle impostazioni di PerfilWiki 1.x."],["O arquivo contém uma opção de aparência desconhecida.","The file contains an unknown appearance option.","El archivo contiene una opción de apariencia desconocida.","Le fichier contient une option d'apparence inconnue.","Il file contiene un'opzione di aspetto sconosciuta."],["A ordem dos contadores precisa ser uma lista.","The counter order must be a list.","El orden de los contadores debe ser una lista.","L'ordre des compteurs doit être une liste.","L'ordine dei contatori deve essere una lista."],["Informe um título de página válido.","Enter a valid page title.","Escribe un título de página válido.","Saisissez un titre de page valide.","Inserisci un titolo di pagina valido."],["O texto e o bloco precisam ser texto.","The text and block must be text values.","El texto y el bloque deben ser valores de texto.","Le texte et le bloc doivent être des valeurs textuelles.","Il testo e il blocco devono essere valori di testo."],["Use um bloco completo do PerfilWiki.","Use a complete PerfilWiki block.","Usa un bloque completo de PerfilWiki.","Utilisez un bloc PerfilWiki complet.","Usa un blocco completo di PerfilWiki."],["Há um bloco antigo do protótipo neste texto. Confira o rascunho antes de continuar.","This text contains an old prototype block. Check the draft before continuing.","Este texto contiene un bloque antiguo del prototipo. Revisa el borrador antes de continuar.","Ce texte contient un ancien bloc du prototype. Vérifiez le brouillon avant de continuer.","Questo testo contiene un vecchio blocco del prototipo. Controlla la bozza prima di continuare."],["Já existe um bloco do PerfilWiki diferente ou incompleto neste texto. Confira o rascunho antes de continuar.","This text already contains a different or incomplete PerfilWiki block. Check the draft before continuing.","Este texto ya contiene un bloque de PerfilWiki diferente o incompleto. Revisa el borrador antes de continuar.","Ce texte contient déjà un bloc PerfilWiki différent ou incomplet. Vérifiez le brouillon avant de continuer.","Questo testo contiene già un blocco PerfilWiki diverso o incompleto. Controlla la bozza prima di continuare."],["Escolha o editor de ativação ou o editor da página.","Choose the activation editor or the page editor.","Elige el editor de activación o el editor de la página.","Choisissez l'éditeur d'activation ou l'éditeur de la page.","Scegli l'editor di attivazione o l'editor della pagina."],["Retire as chamadas antigas de RitmoPU e EstatisticasPU do common.js antes de carregar PerfilWiki.","Remove the old RitmoPU and EstatisticasPU calls from common.js before loading PerfilWiki.","Elimina las llamadas antiguas de RitmoPU y EstatisticasPU de common.js antes de cargar PerfilWiki.","Retirez les anciens appels de RitmoPU et EstatisticasPU de common.js avant de charger PerfilWiki.","Rimuovi le vecchie chiamate a RitmoPU ed EstatisticasPU da common.js prima di caricare PerfilWiki."],["Imagem do dia indisponível.","Today's image is unavailable.","La imagen del día no está disponible.","L'image du jour est indisponible.","L'immagine del giorno non è disponibile."],["Metadados de imagem incompletos.","Image metadata is incomplete.","Los metadatos de la imagen están incompletos.","Les métadonnées de l'image sont incomplètes.","I metadati dell'immagine sono incompleti."],["Confira as datas do intervalo.","Check the date range.","Revisa las fechas del intervalo.","Vérifiez les dates de la période.","Controlla le date dell'intervallo."],["Gostou deste painel? ","Like this panel? ","¿Te gusta este panel? ","Ce panneau vous plaît ? ","Ti piace questo pannello? "],["Página suspensa.","Page suspended.","Página suspendida.","Page suspendue.","Pagina sospesa."],["A resposta pública excedeu o limite de tamanho.","The public response exceeded the size limit.","La respuesta pública superó el límite de tamaño.","La réponse publique a dépassé la taille limite.","La risposta pubblica ha superato il limite di dimensione."],["A consulta não pertence às fontes públicas do painel.","The request is outside the panel's public data sources.","La consulta no pertenece a las fuentes públicas del panel.","La requête ne fait pas partie des sources publiques du panneau.","La richiesta non appartiene alle fonti pubbliche del pannello."],["O serviço pediu uma pausa nas consultas.","The service requested a pause in requests.","El servicio ha solicitado una pausa en las consultas.","Le service a demandé une pause dans les requêtes.","Il servizio ha richiesto una pausa nelle richieste."],["Consulta pausada.","Request paused.","Consulta en pausa.","Requête mise en pause.","Richiesta in pausa."],["A consulta pública foi redirecionada.","The public request was redirected.","La consulta pública fue redirigida.","La requête publique a été redirigée.","La richiesta pubblica è stata reindirizzata."],["HTTP {number}","HTTP {number}","HTTP {number}","HTTP {number}","HTTP {number}"],["A lista de exclusões excede o tamanho esperado.","The exclusion list exceeds the expected size.","La lista de exclusiones supera el tamaño esperado.","La liste d'exclusion dépasse la taille attendue.","L'elenco delle esclusioni supera la dimensione prevista."],["Lista de exclusões inválida.","Invalid exclusion list.","Lista de exclusiones no válida.","Liste d'exclusion non valide.","Elenco delle esclusioni non valido."],["Resposta pública inválida.","Invalid public response.","Respuesta pública no válida.","Réponse publique non valide.","Risposta pubblica non valida."],["Consulta pública incompleta.","Incomplete public request.","Consulta pública incompleta.","Requête publique incomplète.","Richiesta pubblica incompleta."],["Consultando as estatísticas…","Loading statistics…","Consultando las estadísticas…","Chargement des statistiques…","Caricamento delle statistiche…"],["Os dados novos não passaram pela conferência.","The new data failed validation.","Los datos nuevos no superaron la verificación.","Les nouvelles données n'ont pas passé la vérification.","I nuovi dati non hanno superato la verifica."],["Calculando as visualizações de todos os artigos editados por você. O painel acompanha a consulta.","Calculating pageviews for all articles you have edited. The panel follows the progress.","Calculando las visitas de todos los artículos que has editado. El panel muestra el progreso.","Calcul des vues de tous les articles que vous avez modifiés. Le panneau suit l'avancement.","Calcolo delle visualizzazioni di tutti gli articoli che hai modificato. Il pannello segue l'avanzamento."],["Painel atualizado nesta tela.","Panel updated on this screen.","Panel actualizado en esta pantalla.","Panneau actualisé sur cet écran.","Pannello aggiornato in questa schermata."],["Os dados disponíveis foram atualizados. As consultas incompletas mantiveram seus últimos resultados.","Available data has been updated. Incomplete requests kept their previous results.","Se han actualizado los datos disponibles. Las consultas incompletas conservaron sus últimos resultados.","Les données disponibles ont été actualisées. Les requêtes incomplètes ont conservé leurs derniers résultats.","I dati disponibili sono stati aggiornati. Le richieste incomplete hanno conservato gli ultimi risultati."],["Outra aba já está consultando o painel.","Another tab is already updating the panel.","Otra pestaña ya está consultando el panel.","Un autre onglet consulte déjà le panneau.","Un'altra scheda sta già aggiornando il pannello."],["Não foi possível concluir a consulta. O painel anterior foi mantido.","The request could not be completed. The previous panel was kept.","No se pudo completar la consulta. Se conservó el panel anterior.","La requête n'a pas pu être terminée. Le panneau précédent a été conservé.","Non è stato possibile completare la richiesta. È stato mantenuto il pannello precedente."],["Aguarde a primeira consulta completa.","Wait for the first complete request.","Espera a que se complete la primera consulta.","Attendez la fin de la première requête complète.","Attendi il completamento della prima richiesta."],["O painel de atividade está desativado nas suas opções.","The activity panel is disabled in your settings.","El panel de actividad está desactivado en tus opciones.","Le panneau d'activité est désactivé dans vos options.","Il pannello delle attività è disattivato nelle tue opzioni."],["Aguarde a primeira consulta dos contadores.","Wait for the first counter update.","Espera a la primera consulta de los contadores.","Attendez la première mise à jour des compteurs.","Attendi il primo aggiornamento dei contatori."],["Os contadores estão desativados nas suas opções.","Counters are disabled in your settings.","Los contadores están desactivados en tus opciones.","Les compteurs sont désactivés dans vos options.","I contatori sono disattivati nelle tue opzioni."],["Consultando a atividade de {name}.","Loading activity for {name}.","Consultando la actividad de {name}.","Chargement de l'activité de {name}.","Caricamento dell'attività di {name}."],["Consultando visualizações após sua primeira edição em cada artigo.","Loading pageviews after your first edit to each article.","Consultando las visitas posteriores a tu primera edición en cada artículo.","Chargement des vues après votre première modification de chaque article.","Caricamento delle visualizzazioni dopo la tua prima modifica a ogni articolo."],["Atualizar estatísticas","Update statistics","Actualizar estadísticas","Actualiser les statistiques","Aggiorna le statistiche"],["Baixar painel atualizado","Download updated panel","Descargar panel actualizado","Télécharger le panneau actualisé","Scarica il pannello aggiornato"],["Baixar contadores atualizados","Download updated counters","Descargar contadores actualizados","Télécharger les compteurs actualisés","Scarica i contatori aggiornati"],["Carregador pessoal","Personal loader","Cargador personal","Chargeur personnel","Caricatore personale"],["Caixas e atividade","Counters and activity","Contadores y actividad","Compteurs et activité","Contatori e attività"],["Caixas de estatísticas","Statistics counters","Contadores de estadísticas","Compteurs de statistiques","Contatori delle statistiche"],["Painel de atividade","Activity panel","Panel de actividad","Panneau d'activité","Pannello delle attività"],["Configurar o PerfilWiki e suas opções de aparência","Configure PerfilWiki and its appearance settings","Configurar PerfilWiki y sus opciones de apariencia","Configurer PerfilWiki et ses options d'apparence","Configura PerfilWiki e le sue opzioni di aspetto"],["Adicionar os blocos do PerfilWiki","Add PerfilWiki blocks","Añadir los bloques de PerfilWiki","Ajouter les blocs PerfilWiki","Aggiungi i blocchi di PerfilWiki"],["Adicionar as caixas de estatísticas do PerfilWiki","Add PerfilWiki statistics counters","Añadir los contadores de estadísticas de PerfilWiki","Ajouter les compteurs de statistiques PerfilWiki","Aggiungi i contatori delle statistiche di PerfilWiki"],["Adicionar o painel de atividade do PerfilWiki","Add the PerfilWiki activity panel","Añadir el panel de actividad de PerfilWiki","Ajouter le panneau d'activité PerfilWiki","Aggiungi il pannello delle attività di PerfilWiki"],["Aguardando dados. Abra esta página na sua conta para iniciar a consulta pública.","Waiting for data. Open this page while signed in to your account to start the public request.","Esperando datos. Abre esta página con tu cuenta para iniciar la consulta pública.","En attente des données. Ouvrez cette page depuis votre compte pour lancer la requête publique.","In attesa dei dati. Apri questa pagina dal tuo account per avviare la richiesta pubblica."],["Use até oito blocos de texto.","Use up to eight text blocks.","Usa hasta ocho bloques de texto.","Utilisez au maximum huit blocs de texte.","Usa al massimo otto blocchi di testo."],["Cada bloco precisa de título e conteúdo em texto.","Each block needs a title and text content.","Cada bloque necesita un título y contenido en texto.","Chaque bloc doit avoir un titre et un contenu textuel.","Ogni blocco richiede un titolo e un contenuto testuale."],["Use um título com até 100 caracteres, sem código ou quebras de linha.","Use a title of up to 100 characters, without markup or line breaks.","Usa un título de hasta 100 caracteres, sin código ni saltos de línea.","Utilisez un titre de 100 caractères maximum, sans code ni sauts de ligne.","Usa un titolo di massimo 100 caratteri, senza codice o interruzioni di riga."],["Use até 50.000 caracteres no conteúdo de cada bloco.","Use up to 50,000 characters in each block's content.","Usa hasta 50.000 caracteres en el contenido de cada bloque.","Utilisez au maximum 50 000 caractères dans le contenu de chaque bloc.","Usa al massimo 50.000 caratteri nel contenuto di ogni blocco."],["Retire as marcas de instalação do conteúdo do bloco.","Remove installation markers from the block's content.","Elimina las marcas de instalación del contenido del bloque.","Retirez les marqueurs d'installation du contenu du bloc.","Rimuovi i marcatori di installazione dal contenuto del blocco."],["Os blocos podem somar até 200.000 caracteres de conteúdo.","Blocks can contain up to 200,000 characters of content in total.","Los bloques pueden sumar hasta 200.000 caracteres de contenido.","Les blocs peuvent contenir au total 200 000 caractères de contenu.","I blocchi possono contenere fino a 200.000 caratteri di contenuto in totale."],["Dê um título ao bloco de texto.","Give the text block a title.","Pon un título al bloque de texto.","Donnez un titre au bloc de texte.","Assegna un titolo al blocco di testo."],["Use texto e ligações internas como [[Rio de Janeiro]] ou [[Título|Rótulo]], sem outro código.","Use text and internal links such as [[Rio de Janeiro]] or [[Title|Label]], without other markup.","Usa texto y enlaces internos como [[Rio de Janeiro]] o [[Título|Etiqueta]], sin otro código.","Utilisez du texte et des liens internes comme [[Rio de Janeiro]] ou [[Titre|Libellé]], sans autre code.","Usa testo e collegamenti interni come [[Rio de Janeiro]] o [[Titolo|Etichetta]], senza altro codice."],["Limite de texto inválido.","Invalid text limit.","Límite de texto no válido.","Limite de texte non valide.","Limite di testo non valido."],["Use até {number} caracteres.","Use up to {number} characters.","Usa hasta {number} caracteres.","Utilisez au maximum {number} caractères.","Usa al massimo {number} caratteri."],["Cor do texto inválida.","Invalid text color.","Color de texto no válido.","Couleur du texte non valide.","Colore del testo non valido."],["Informe o nome de um arquivo de imagem do Wikimedia Commons.","Enter an image filename from Wikimedia Commons.","Escribe el nombre de un archivo de imagen de Wikimedia Commons.","Saisissez le nom d'un fichier image de Wikimedia Commons.","Inserisci il nome di un file immagine di Wikimedia Commons."],["Use apenas o nome de uma imagem JPG, PNG, WebP, GIF ou SVG do Wikimedia Commons, sem endereço ou código.","Use only a Wikimedia Commons JPG, PNG, WebP, GIF or SVG filename, without a URL or markup.","Usa solo el nombre de una imagen JPG, PNG, WebP, GIF o SVG de Wikimedia Commons, sin dirección ni código.","Utilisez uniquement le nom d'une image JPG, PNG, WebP, GIF ou SVG de Wikimedia Commons, sans adresse ni code.","Usa solo il nome di un'immagine JPG, PNG, WebP, GIF o SVG di Wikimedia Commons, senza indirizzo o codice."],["O rótulo deve conter apenas texto.","The label must contain plain text only.","La etiqueta solo debe contener texto.","Le libellé doit contenir uniquement du texte.","L'etichetta deve contenere solo testo."],["O rótulo deve ter até 40 caracteres.","The label must be no longer than 40 characters.","La etiqueta debe tener un máximo de 40 caracteres.","Le libellé doit comporter au maximum 40 caractères.","L'etichetta deve contenere al massimo 40 caratteri."],["Escolha uma cor de texto válida.","Choose a valid text color.","Elige un color de texto válido.","Choisissez une couleur de texte valide.","Scegli un colore del testo valido."],["Use até três informações adicionais.","Use up to three additional fields.","Usa hasta tres campos adicionales.","Utilisez au maximum trois champs supplémentaires.","Usa al massimo tre campi aggiuntivi."],["Informação adicional inválida.","Invalid additional field.","Campo adicional no válido.","Champ supplémentaire non valide.","Campo aggiuntivo non valido."],["Escolha uma disposição e um separador válidos para os itens.","Choose a valid layout and separator for the items.","Elige una disposición y un separador válidos para los elementos.","Choisissez une disposition et un séparateur valides pour les éléments.","Scegli una disposizione e un separatore validi per gli elementi."],["Use até oito itens em cada informação adicional.","Use up to eight items in each additional field.","Usa hasta ocho elementos en cada campo adicional.","Utilisez au maximum huit éléments dans chaque champ supplémentaire.","Usa al massimo otto elementi in ogni campo aggiuntivo."],["Cada item deve ter a sua própria opção de cor.","Each item must have its own color option.","Cada elemento debe tener su propia opción de color.","Chaque élément doit avoir sa propre option de couleur.","Ogni elemento deve avere la propria opzione di colore."],["Preencha o rótulo da informação ou remova a linha.","Enter a label for the field or remove the row.","Completa la etiqueta del campo o elimina la fila.","Saisissez le libellé du champ ou retirez la ligne.","Compila l'etichetta del campo o rimuovi la riga."],["Nome de exibição inválido.","Invalid display name.","Nombre para mostrar no válido.","Nom affiché non valide.","Nome visualizzato non valido."],["O nome de exibição deve ter até 100 caracteres.","The display name must be no longer than 100 characters.","El nombre para mostrar debe tener un máximo de 100 caracteres.","Le nom affiché doit comporter au maximum 100 caractères.","Il nome visualizzato deve contenere al massimo 100 caratteri."],["Opção de configuração desconhecida.","Unknown configuration option.","Opción de configuración desconocida.","Option de configuration inconnue.","Opzione di configurazione sconosciuta."],["Informe um nome de usuário.","Enter a username.","Escribe un nombre de usuario.","Saisissez un nom d'utilisateur.","Inserisci un nome utente."],["Nome de usuário inválido.","Invalid username.","Nombre de usuario no válido.","Nom d'utilisateur non valide.","Nome utente non valido."],["Fuso inválido.","Invalid time zone.","Zona horaria no válida.","Fuseau horaire non valide.","Fuso orario non valido."],["Título de página inválido.","Invalid page title.","Título de página no válido.","Titre de page non valide.","Titolo di pagina non valido."],["Com o botão de mover em foco, use as setas para mudar a ordem da caixa.","With the move button focused, use arrow keys to reorder the box.","Con el botón de mover enfocado, usa las flechas para reordenar la casilla.","Avec le bouton de déplacement sélectionné, utilisez les flèches pour réordonner la case.","Con il pulsante di spostamento attivo, usa le frecce per riordinare il riquadro."],["Arrastar {label}","Drag {label}","Arrastrar {label}","Déplacer {label}","Trascina {label}"],["Arraste ou use as setas para mudar a ordem","Drag or use arrow keys to reorder","Arrastra o usa las flechas para cambiar el orden","Déplacez ou utilisez les flèches pour changer l'ordre","Trascina o usa le frecce per cambiare l'ordine"],["Retirar destaque de {label}","Remove highlight from {label}","Quitar resaltado de {label}","Retirer la mise en valeur de {label}","Rimuovi evidenziazione da {label}"],["Destacar {label}","Highlight {label}","Resaltar {label}","Mettre {label} en valeur","Evidenzia {label}"],["Remover {label}","Remove {label}","Eliminar {label}","Supprimer {label}","Rimuovi {label}"],["Remover caixa","Remove box","Eliminar casilla","Supprimer la case","Rimuovi riquadro"],["Adicionar caixa","Add box","Añadir casilla","Ajouter une case","Aggiungi riquadro"],["Adicionar caixa +","Add box +","Añadir casilla +","Ajouter une case +","Aggiungi riquadro +"],["Meu impacto na Wikipédia","My Wikipedia impact","Mi impacto en Wikipedia","Mon apport à Wikipédia","Il mio apporto a Wikipedia"],["Seu texto pode ficar entre os contadores e o painel de atividade.","Your text can sit between the counters and the activity panel.","Tu texto puede quedar entre los contadores y el panel de actividad.","Votre texte peut se placer entre les compteurs et le panneau d'activité.","Il tuo testo può stare tra i contatori e il pannello di attività."],["Confira o título e o conteúdo das seções de texto nos ajustes.","Check section titles and contents in settings.","Revisa los títulos y contenidos de las secciones en los ajustes.","Vérifiez les titres et le contenu des sections dans les réglages.","Controlla i titoli e i contenuti delle sezioni nelle impostazioni."],["Os dados locais não foram preparados.","Local data have not been prepared.","Los datos locales no se han preparado.","Les données locales n'ont pas été préparées.","I dati locali non sono stati preparati."],["O código do painel não foi preparado.","The panel code has not been prepared.","El código del panel no se ha preparado.","Le code du panneau n'a pas été préparé.","Il codice del pannello non è stato preparato."],["Não foi possível preparar os dados de exemplo.","The sample data could not be prepared.","No se pudieron preparar los datos de ejemplo.","Les données d'exemple n'ont pas pu être préparées.","Impossibile preparare i dati di esempio."],["Escolha um período entre 1 de julho de 2015 e ontem em UTC, com início até o fim.","Choose a period between 1 July 2015 and yesterday in UTC, with the start no later than the end.","Elige un período entre el 1 de julio de 2015 y ayer en UTC, con el inicio antes o igual al final.","Choisissez une période entre le 1er juillet 2015 et hier en UTC, avec le début avant ou à la fin.","Scegli un periodo tra il 1 luglio 2015 e ieri in UTC, con l'inizio non successivo alla fine."],["Editar seção","Edit section","Editar sección","Modifier la section","Modifica sezione"],["Prévia local, sem consultas à Wikipédia. Os números são fictícios.","Local preview, without Wikipedia queries. The numbers are fictional.","Vista previa local, sin consultas a Wikipedia. Los números son ficticios.","Aperçu local, sans consultation de Wikipédia. Les chiffres sont fictifs.","Anteprima locale, senza richieste a Wikipedia. I numeri sono fittizi."],["Preparando os dados de exemplo.","Preparing sample data.","Preparando los datos de ejemplo.","Préparation des données d'exemple.","Preparazione dei dati di esempio."],["Tempo Universal Coordenado","Coordinated Universal Time","Tiempo Universal Coordinado","Temps universel coordonné","Tempo coordinato universale"],["Brasília / São Paulo","Brasília / São Paulo","Brasilia / São Paulo","Brasília / São Paulo","Brasilia / San Paolo"],["Manaus","Manaus","Manaos","Manaus","Manaus"],["Campo Grande","Campo Grande","Campo Grande","Campo Grande","Campo Grande"],["Rio Branco","Rio Branco","Rio Branco","Rio Branco","Rio Branco"],["Fernando de Noronha","Fernando de Noronha","Fernando de Noronha","Fernando de Noronha","Fernando de Noronha"],["Washington / Nova York","Washington / New York","Washington / Nueva York","Washington / New York","Washington / New York"],["Chicago, EUA","Chicago, USA","Chicago, EE. UU.","Chicago, États-Unis","Chicago, Stati Uniti"],["Denver, EUA","Denver, USA","Denver, EE. UU.","Denver, États-Unis","Denver, Stati Uniti"],["Los Angeles, EUA","Los Angeles, USA","Los Ángeles, EE. UU.","Los Angeles, États-Unis","Los Angeles, Stati Uniti"],["Alasca / Anchorage, EUA","Alaska / Anchorage, USA","Alaska / Anchorage, EE. UU.","Alaska / Anchorage, États-Unis","Alaska / Anchorage, Stati Uniti"],["Arizona / Phoenix, EUA","Arizona / Phoenix, USA","Arizona / Phoenix, EE. UU.","Arizona / Phoenix, États-Unis","Arizona / Phoenix, Stati Uniti"],["Toronto, Canadá","Toronto, Canada","Toronto, Canadá","Toronto, Canada","Toronto, Canada"],["Cidade do México, México","Mexico City, Mexico","Ciudad de México, México","Mexico, Mexique","Città del Messico, Messico"],["Bogotá, Colômbia","Bogotá, Colombia","Bogotá, Colombia","Bogotá, Colombie","Bogotà, Colombia"],["Lima, Peru","Lima, Peru","Lima, Perú","Lima, Pérou","Lima, Perù"],["Santiago, Chile","Santiago, Chile","Santiago, Chile","Santiago, Chili","Santiago, Cile"],["Buenos Aires, Argentina","Buenos Aires, Argentina","Buenos Aires, Argentina","Buenos Aires, Argentine","Buenos Aires, Argentina"],["Lisboa, Portugal","Lisbon, Portugal","Lisboa, Portugal","Lisbonne, Portugal","Lisbona, Portogallo"],["Londres, Reino Unido","London, United Kingdom","Londres, Reino Unido","Londres, Royaume-Uni","Londra, Regno Unito"],["Paris, França","Paris, France","París, Francia","Paris, France","Parigi, Francia"],["Madri, Espanha","Madrid, Spain","Madrid, España","Madrid, Espagne","Madrid, Spagna"],["Berlim, Alemanha","Berlin, Germany","Berlín, Alemania","Berlin, Allemagne","Berlino, Germania"],["Roma, Itália","Rome, Italy","Roma, Italia","Rome, Italie","Roma, Italia"],["Zurique, Suíça","Zurich, Switzerland","Zúrich, Suiza","Zurich, Suisse","Zurigo, Svizzera"],["Estocolmo, Suécia","Stockholm, Sweden","Estocolmo, Suecia","Stockholm, Suède","Stoccolma, Svezia"],["Atenas, Grécia","Athens, Greece","Atenas, Grecia","Athènes, Grèce","Atene, Grecia"],["Istambul, Turquia","Istanbul, Türkiye","Estambul, Turquía","Istanbul, Turquie","Istanbul, Turchia"],["Moscou, Rússia","Moscow, Russia","Moscú, Rusia","Moscou, Russie","Mosca, Russia"],["Açores","Azores","Azores","Açores","Azzorre"],["Cabo Verde","Cape Verde","Cabo Verde","Cap-Vert","Capo Verde"],["Luanda, Angola","Luanda, Angola","Luanda, Angola","Luanda, Angola","Luanda, Angola"],["Maputo, Moçambique","Maputo, Mozambique","Maputo, Mozambique","Maputo, Mozambique","Maputo, Mozambico"],["Bissau, Guiné-Bissau","Bissau, Guinea-Bissau","Bisáu, Guinea-Bisáu","Bissau, Guinée-Bissau","Bissau, Guinea-Bissau"],["São Tomé, São Tomé e Príncipe","São Tomé, São Tomé and Príncipe","Santo Tomé, Santo Tomé y Príncipe","São Tomé, Sao Tomé-et-Principe","São Tomé, São Tomé e Príncipe"],["Cairo, Egito","Cairo, Egypt","El Cairo, Egipto","Le Caire, Égypte","Il Cairo, Egitto"],["Casablanca, Marrocos","Casablanca, Morocco","Casablanca, Marruecos","Casablanca, Maroc","Casablanca, Marocco"],["Nairóbi, Quênia","Nairobi, Kenya","Nairobi, Kenia","Nairobi, Kenya","Nairobi, Kenya"],["Joanesburgo, África do Sul","Johannesburg, South Africa","Johannesburgo, Sudáfrica","Johannesburg, Afrique du Sud","Johannesburg, Sudafrica"],["Tóquio, Japão","Tokyo, Japan","Tokio, Japón","Tokyo, Japon","Tokyo, Giappone"],["Nova Délhi / Calcutá, Índia","New Delhi / Kolkata, India","Nueva Delhi / Calcuta, India","New Delhi / Calcutta, Inde","Nuova Delhi / Calcutta, India"],["Pequim / Xangai, China","Beijing / Shanghai, China","Pekín / Shanghái, China","Pékin / Shanghai, Chine","Pechino / Shanghai, Cina"],["Hong Kong, China","Hong Kong, China","Hong Kong, China","Hong Kong, Chine","Hong Kong, Cina"],["Macau, China","Macau, China","Macao, China","Macao, Chine","Macao, Cina"],["Singapura","Singapore","Singapur","Singapour","Singapore"],["Díli, Timor-Leste","Dili, Timor-Leste","Dili, Timor Oriental","Dili, Timor oriental","Dili, Timor Est"],["Seul, Coreia do Sul","Seoul, South Korea","Seúl, Corea del Sur","Séoul, Corée du Sud","Seul, Corea del Sud"],["Bangcoc, Tailândia","Bangkok, Thailand","Bangkok, Tailandia","Bangkok, Thaïlande","Bangkok, Thailandia"],["Dubai, Emirados Árabes Unidos","Dubai, United Arab Emirates","Dubái, Emiratos Árabes Unidos","Dubaï, Émirats arabes unis","Dubai, Emirati Arabi Uniti"],["Jacarta, Indonésia","Jakarta, Indonesia","Yakarta, Indonesia","Jakarta, Indonésie","Giacarta, Indonesia"],["Sydney, Austrália","Sydney, Australia","Sídney, Australia","Sydney, Australie","Sydney, Australia"],["Perth, Austrália","Perth, Australia","Perth, Australia","Perth, Australie","Perth, Australia"],["Adelaide, Austrália","Adelaide, Australia","Adelaida, Australia","Adélaïde, Australie","Adelaide, Australia"],["Auckland, Nova Zelândia","Auckland, New Zealand","Auckland, Nueva Zelanda","Auckland, Nouvelle-Zélande","Auckland, Nuova Zelanda"],["Havaí / Honolulu, EUA","Hawaii / Honolulu, USA","Hawái / Honolulu, EE. UU.","Hawaï / Honolulu, États-Unis","Hawaii / Honolulu, Stati Uniti"]];
rows=rows.concat([["Abre o instalador no GitHub Pages com as escolhas deste painel.","Opens the installer on GitHub Pages with this panel's settings.","Abre el instalador en GitHub Pages con los ajustes de este panel.","Ouvre l'installateur sur GitHub Pages avec les réglages de ce panneau.","Apre il programma di installazione su GitHub Pages con le impostazioni di questo pannello."],["Não foi possível abrir o editor do painel.","The panel editor could not be opened.","No se pudo abrir el editor del panel.","Impossible d'ouvrir l'éditeur du panneau.","Impossibile aprire l'editor del pannello."],["Permita a abertura de uma nova aba para editar o painel.","Allow a new tab to open to edit the panel.","Permite abrir una nueva pestaña para editar el panel.","Autorisez l'ouverture d'un nouvel onglet pour modifier le panneau.","Consenti l'apertura di una nuova scheda per modificare il pannello."],["O instalador não respondeu. Mantenha esta página aberta e tente \"Editar painel\" novamente.","The installer did not respond. Keep this page open and try \"Edit panel\" again.","El instalador no respondió. Mantén esta página abierta y vuelve a intentar \"Editar panel\".","L'installateur n'a pas répondu. Gardez cette page ouverte et réessayez \"Modifier le panneau\".","Il programma di installazione non ha risposto. Tieni aperta questa pagina e riprova \"Modifica pannello\"."],["Não foi possível receber o painel da Wikipédia. Mantenha a página original aberta e tente \"Editar painel\" novamente.","The Wikipedia panel could not be received. Keep the original page open and try \"Edit panel\" again.","No se pudo recibir el panel de Wikipedia. Mantén la página original abierta y vuelve a intentar \"Editar panel\".","Impossible de recevoir le panneau Wikipédia. Gardez la page d'origine ouverte et réessayez \"Modifier le panneau\".","Impossibile ricevere il pannello di Wikipedia. Tieni aperta la pagina originale e riprova \"Modifica pannello\"."],["Conta recebida do painel da Wikipédia, sem consultar seu login.","Account received from the Wikipedia panel without checking your login.","Cuenta recibida del panel de Wikipedia, sin consultar tu sesión.","Compte reçu du panneau Wikipédia, sans consulter votre connexion.","Account ricevuto dal pannello di Wikipedia, senza controllare l'accesso."],["Aguardando as escolhas da página da Wikipédia. Mantenha a página original aberta.","Waiting for settings from the Wikipedia page. Keep the original page open.","Esperando los ajustes de la página de Wikipedia. Mantén la página original abierta.","En attente des réglages de la page Wikipédia. Gardez la page d'origine ouverte.","In attesa delle impostazioni dalla pagina di Wikipedia. Tieni aperta la pagina originale."],["Escolhas e texto público recebidos. Confira a prévia e salve as alterações manualmente na Wikipédia.","Settings and public page text received. Check the preview and save changes manually on Wikipedia.","Ajustes y texto público recibidos. Revisa la vista previa y guarda los cambios manualmente en Wikipedia.","Réglages et texte public reçus. Vérifiez l'aperçu et enregistrez les modifications manuellement sur Wikipédia.","Impostazioni e testo pubblico ricevuti. Controlla l'anteprima e salva le modifiche manualmente su Wikipedia."],["Escolhas recebidas. O texto público não pôde ser recuperado. Preserve sua página ao copiar os novos trechos.","Settings received. The public page text could not be recovered. Preserve your page when copying the new snippets.","Ajustes recibidos. No se pudo recuperar el texto público. Conserva tu página al copiar los nuevos fragmentos.","Réglages reçus. Le texte public n'a pas pu être récupéré. Conservez votre page en copiant les nouveaux extraits.","Impostazioni ricevute. Non è stato possibile recuperare il testo pubblico. Conserva la pagina quando copi i nuovi frammenti."],["Atualizar somente o bloco do painel","Update only the panel block","Actualizar solo el bloque del panel","Mettre à jour uniquement le bloc du panneau","Aggiorna solo il blocco del pannello"],["Texto público da revisão {number}. Os textos fora do bloco do painel são preservados.","Public text from revision {number}. Text outside the panel block is preserved.","Texto público de la revisión {number}. Se conserva el texto fuera del bloque del panel.","Texte public de la révision {number}. Le texte hors du bloc du panneau est conservé.","Testo pubblico della revisione {number}. Il testo esterno al blocco del pannello viene conservato."],["O texto público não foi recuperado. Cole sua página inteira no rascunho antes de substituir o painel.","The public text was not recovered. Paste your entire page into the draft before replacing the panel.","No se recuperó el texto público. Pega tu página completa en el borrador antes de sustituir el panel.","Le texte public n'a pas été récupéré. Collez votre page entière dans le brouillon avant de remplacer le panneau.","Il testo pubblico non è stato recuperato. Incolla l'intera pagina nella bozza prima di sostituire il pannello."],["Esta página ainda não tem um bloco PerfilWiki delimitado. Substitua o painel manualmente, preservando seus outros textos e categorias.","This page does not yet have a marked PerfilWiki block. Replace the panel manually, preserving your other text and categories.","Esta página aún no tiene un bloque PerfilWiki delimitado. Sustituye el panel manualmente y conserva el resto del texto y las categorías.","Cette page n'a pas encore de bloc PerfilWiki délimité. Remplacez le panneau manuellement en conservant vos autres textes et catégories.","Questa pagina non ha ancora un blocco PerfilWiki delimitato. Sostituisci il pannello manualmente, conservando gli altri testi e le categorie."],["Há marcas incompletas ou repetidas do PerfilWiki. Confira o texto antes de substituir o painel.","PerfilWiki markers are incomplete or repeated. Check the text before replacing the panel.","Las marcas de PerfilWiki están incompletas o repetidas. Revisa el texto antes de sustituir el panel.","Les marqueurs PerfilWiki sont incomplets ou répétés. Vérifiez le texte avant de remplacer le panneau.","I marcatori PerfilWiki sono incompleti o ripetuti. Controlla il testo prima di sostituire il pannello."],["Novo bloco do painel para inserção manual","New panel block for manual insertion","Nuevo bloque del panel para insertar manualmente","Nouveau bloc du panneau à insérer manuellement","Nuovo blocco del pannello da inserire manualmente"],["Preparando artigos · {done} de {total} títulos verificados","Preparing articles · {done} of {total} titles checked","Preparando artículos · {done} de {total} títulos comprobados","Préparation des articles · {done} titres vérifiés sur {total}","Preparazione degli articoli · {done} titoli verificati su {total}"],["Consultando visualizações · {done} de {total} artigos","Checking pageviews · {done} of {total} articles","Consultando visitas · {done} de {total} artículos","Consultation des vues · {done} articles sur {total}","Consultazione delle visualizzazioni · {done} articoli su {total}"]]);
rows=rows.concat([["Há trechos de código ou comentários incompletos. Confira a página antes de substituir o painel.","Some code blocks or comments are incomplete. Check the page before replacing the panel.","Hay bloques de código o comentarios incompletos. Revisa la página antes de sustituir el panel.","Des blocs de code ou commentaires sont incomplets. Vérifiez la page avant de remplacer le panneau.","Alcuni blocchi di codice o commenti sono incompleti. Controlla la pagina prima di sostituire il pannello."],["Novos blocos de texto precisam ser acrescentados manualmente fora do painel. A atualização do painel preserva os textos que já estão na página.","New text blocks need to be added manually outside the panel. Updating the panel preserves the text already on the page.","Los nuevos bloques de texto deben añadirse manualmente fuera del panel. La actualización conserva el texto que ya está en la página.","Les nouveaux blocs de texte doivent être ajoutés manuellement hors du panneau. La mise à jour conserve les textes déjà présents sur la page.","I nuovi blocchi di testo devono essere aggiunti manualmente fuori dal pannello. L'aggiornamento conserva il testo già presente nella pagina."]]);
rows=rows.concat([["O navegador não guardou esta consulta. Os resultados continuam disponíveis nesta aba.","The browser did not save this query. Its results remain available in this tab.","El navegador no guardó esta consulta. Los resultados siguen disponibles en esta pestaña.","Le navigateur n'a pas conservé cette consultation. Les résultats restent disponibles dans cet onglet.","Il browser non ha salvato questa ricerca. I risultati restano disponibili in questa scheda."]]);
rows=rows.concat([["A cópia e o download mantêm os textos e as categorias da página recebida, alterando somente o bloco do painel. Confira o código antes de salvar na Wikipédia.","Copying and downloading retain the received page's text and categories, changing only the panel block. Check the code before saving on Wikipedia.","La copia y la descarga conservan el texto y las categorías de la página recibida y cambian solo el bloque del panel. Revisa el código antes de guardar en Wikipedia.","La copie et le téléchargement conservent les textes et catégories de la page reçue et modifient uniquement le bloc du panneau. Vérifiez le code avant d'enregistrer sur Wikipédia.","La copia e il download conservano i testi e le categorie della pagina ricevuta, modificando solo il blocco del pannello. Controlla il codice prima di salvare su Wikipedia."],["Este trecho é apenas o novo painel. Não substitua sua página inteira por ele.","This snippet is only the new panel. Do not replace your entire page with it.","Este fragmento contiene solo el nuevo panel. No sustituyas toda tu página por él.","Cet extrait contient uniquement le nouveau panneau. Ne remplacez pas toute votre page par cet extrait.","Questo frammento contiene solo il nuovo pannello. Non sostituire l'intera pagina con questo frammento."],["Abra o editor de conferência para manter seus textos e substituir o painel manualmente. A página original não é alterada.","Open the review editor to retain your text and replace the panel manually. The original page is not changed.","Abre el editor de revisión para conservar tu texto y sustituir el panel manualmente. La página original no se modifica.","Ouvrez l'éditeur de vérification pour conserver vos textes et remplacer le panneau manuellement. La page d'origine n'est pas modifiée.","Apri l'editor di verifica per conservare i tuoi testi e sostituire il pannello manualmente. La pagina originale non viene modificata."],["Revisar página completa antes de copiar","Review the full page before copying","Revisar la página completa antes de copiar","Vérifier la page entière avant de copier","Controlla l'intera pagina prima di copiare"],["Copiar página preservada","Copy preserved page","Copiar la página conservada","Copier la page conservée","Copia la pagina conservata"],["Copiar somente o novo bloco","Copy only the new block","Copiar solo el nuevo bloque","Copier uniquement le nouveau bloc","Copia solo il nuovo blocco"],["Baixar página preservada","Download preserved page","Descargar la página conservada","Télécharger la page conservée","Scarica la pagina conservata"],["Baixar somente o novo bloco","Download only the new block","Descargar solo el nuevo bloque","Télécharger uniquement le nouveau bloc","Scarica solo il nuovo blocco"]]);
rows=rows.concat([["O rascunho salvo precisa de revisão antes de copiar uma página completa. Abra o editor de conferência.","The saved draft needs review before copying a complete page. Open the review editor.","El borrador guardado necesita revisión antes de copiar una página completa. Abre el editor de revisión.","Le brouillon enregistré doit être vérifié avant de copier une page entière. Ouvrez l'éditeur de vérification.","La bozza salvata deve essere controllata prima di copiare una pagina completa. Apri l'editor di verifica."]]);
var catalogs=Object.create(null);languages.forEach(function(language){catalogs[language]=Object.create(null);});
function portugal(source){return source.replace(/usuários/g,'utilizadores').replace(/usuário/g,'utilizador').replace(/Usuários/g,'Utilizadores').replace(/Usuário registrado/g,'Utilizador registado').replace(/Usuário/g,'Utilizador').replace(/arquivos/g,'ficheiros').replace(/arquivo/g,'ficheiro').replace(/Arquivo/g,'Ficheiro').replace(/prévia/g,'pré-visualização').replace(/Prévia/g,'Pré-visualização').replace(/\baba(s)?\b/g,'separador$1').replace(/tela(s)?\b/g,'ecrã$1').replace(/salvar/g,'guardar').replace(/Salvar/g,'Guardar').replace(/salvo/g,'guardado').replace(/salva/g,'guardada').replace(/Baixar/g,'Descarregar').replace(/baixar/g,'descarregar').replace(/selecion/g,'selecion').replace(/registrad/g,'registad').replace(/Você pode/g,'Pode').replace(/você/g,'si').replace(/Ao invés/g,'Em vez');}
rows.forEach(function(row){catalogs['pt-BR'][row[0]]=row[0];catalogs['pt-PT'][row[0]]=portugal(row[0]);['en','es','fr','it'].forEach(function(language,index){catalogs[language][row[0]]=row[index+1];});});
Object.assign(catalogs['pt-PT'],{'Washington / Nova York':'Washington / Nova Iorque','Madri, Espanha':'Madrid, Espanha','Moscou, Rússia':'Moscovo, Rússia','Nairóbi, Quênia':'Nairobi, Quénia','Nova Délhi / Calcutá, Índia':'Nova Deli / Calcutá, Índia','Bangcoc, Tailândia':'Banguecoque, Tailândia','Havaí / Honolulu, EUA':'Havai / Honolulu, EUA','Nome de exibição':'Nome de apresentação','Ajustes':'Definições','Ver prévia':'Ver pré-visualização','Seu perfil':'O seu perfil','Sua página de usuário':'A sua página de utilizador','Na minha página de usuário':'Na minha página de utilizador','Personalize seu painel':'Personalize o seu painel','Instale seu PerfilWiki':'Instale o seu PerfilWiki','Seu PerfilWiki':'O seu PerfilWiki','Carregar minhas escolhas':'Carregar as minhas escolhas','Baixar minhas escolhas':'Descarregar as minhas escolhas','Começamos com o horário de Brasília. Você pode escolher outro fuso; os ajustes sazonais são automáticos.':'O fuso inicial é o de Brasília. Pode escolher outro fuso. As mudanças sazonais são automáticas.','Alinhamento do nome de exibição':'Alinhamento do nome de apresentação'});
Object.keys(catalogs).forEach(function(language){Object.freeze(catalogs[language]);});Object.freeze(catalogs);
function normalizeLanguage(value){return languages.indexOf(value)>=0?value:'pt-BR';}
function t(language,source,params){var selected=catalogs[normalizeLanguage(language)],message=Object.prototype.hasOwnProperty.call(selected,source)?selected[source]:String(source);return message.replace(/\{([A-Za-z][A-Za-z0-9_]*)\}/g,function(whole,key){return params&&Object.prototype.hasOwnProperty.call(params,key)?String(params[key]):whole;});}
var formats=new Map();function formatter(kind,language,options){var locale=normalizeLanguage(language),key=kind+'|'+locale+'|'+JSON.stringify(options||{});if(formats.has(key))return formats.get(key);var result=kind==='number'?new Intl.NumberFormat(locale,options):new Intl.DateTimeFormat(locale,options);if(formats.size>=128)formats.delete(formats.keys().next().value);formats.set(key,result);return result;}
function number(language,value,options){return formatter('number',language,options).format(value);}
function date(language,value,options){return formatter('date',language,Object.assign({timeZone:'UTC'},options)).format(new Date(value));}
return Object.freeze({languages:languages,languageNames:languageNames,catalogs:catalogs,normalizeLanguage:normalizeLanguage,locale:normalizeLanguage,t:t,number:number,date:date});
}));

;

/* PerfilWiki. Shared, request-free appearance contract. CC BY-SA 4.0. */
(function (root, factory) {
    var api = factory();
    if (typeof module === 'object' && module.exports) { module.exports = api; }
    else { root.PerfilWikiAppearance = api; }
}(typeof window !== 'undefined' ? window : this, function () {
    'use strict';
    var defaultMetrics = ['tenure', 'bestStreak', 'thanks', 'edits', 'reverts', 'edited', 'articles', 'technicalCreated'];
    var metrics = defaultMetrics.concat(['mostEditedArticle', 'bytesAdded', 'bytesRemoved', 'activeDays',
        'articleEdits', 'talkEdits', 'activeMonths', 'busiestDay',
        'edits30', 'averagePerActiveDay', 'activeYears', 'busiestMonth',
        'thanksSent', 'averageBytesPerEdit', 'largestAddition', 'largestRemoval']);
    var themes = Object.freeze({blue:'#3366cc', forest:'#246342', violet:'#6854a4'});
    var defaults = Object.freeze({theme:'blue',language:'pt-BR', accent:'#3366cc', density:'comfortable', layout:'integrated',
        metrics:Object.freeze(defaultMetrics.slice()), showCards:true, showActivity:true, initialPeriod:'30d', alignment:'right', nameAlignment:'left', photoAlignment:'left', photoSize:96, photoShape:'square', nameFontSize:24, showAccountCreated:false, showLocalTime:false, showUserGroups:false, profilePlacement:'top',
        profilePlacements:Object.freeze({name:'inherit',location:'inherit',accountCreated:'inherit',photo:'top',localTime:'top',userGroups:'inherit'}), profileDetailsLayout:'stacked', customRange:null,
        highlightedMetrics:Object.freeze(['tenure']), highlightColor:'#faf7ef', topBackground:'#ffffff', nameColor:'', labelColor:'', informationColor:'', coverSource:'manual', blockOrder:'cards-first', cardColumns:'auto'});
    function normalize(input) {
        if (input === undefined) { input = {}; }
        if (!input || typeof input !== 'object' || Array.isArray(input) || Object.keys(input).some(function (key) {
            return !Object.prototype.hasOwnProperty.call(defaults, key);
        })) { throw new Error('Opção de aparência desconhecida.'); }
        var result = Object.assign({}, defaults, input);
        if(['pt-BR','pt-PT','en','es','fr','it'].indexOf(result.language)<0)throw new Error('Idioma inválido.');
        if (input.nameAlignment === undefined) { result.nameAlignment = defaults.nameAlignment; }
        if (input.photoAlignment === undefined) { result.photoAlignment = defaults.photoAlignment; }
        if (input.photoSize === undefined) { result.photoSize = defaults.photoSize; }
        if (input.photoShape === undefined) { result.photoShape = defaults.photoShape; }
        if (input.nameFontSize === undefined) { result.nameFontSize = defaults.nameFontSize; }
        if (input.showAccountCreated === undefined) { result.showAccountCreated = defaults.showAccountCreated; }
        if (input.showLocalTime === undefined) { result.showLocalTime = defaults.showLocalTime; }
        if (input.coverSource === undefined) { result.coverSource = defaults.coverSource; }
        if (input.showUserGroups === undefined) { result.showUserGroups = defaults.showUserGroups; }
        if (['blue','forest','violet','custom'].indexOf(result.theme) < 0) { throw new Error('Tema inválido.'); }
        if (input.accent === undefined) { result.accent = themes[result.theme] || defaults.accent; }
        if (typeof result.accent !== 'string' || !/^#[0-9a-f]{6}$/i.test(result.accent)) { throw new Error('Cor inválida. Use seis dígitos após #.'); }
        result.accent = result.accent.toLowerCase();
        if (typeof result.highlightColor !== 'string' || !/^#[0-9a-f]{6}$/i.test(result.highlightColor)) { throw new Error('Cor de destaque inválida. Use seis dígitos após #.'); }
        result.highlightColor = result.highlightColor.toLowerCase();
        if (typeof result.topBackground !== 'string' || !/^#[0-9a-f]{6}$/i.test(result.topBackground)) { throw new Error('Cor do topo inválida. Use seis dígitos após #.'); }
        result.topBackground = result.topBackground.toLowerCase();
        ['nameColor','labelColor','informationColor'].forEach(function(key){
            if(input[key] === undefined)result[key]=defaults[key];
            if(typeof result[key]!=='string'||result[key]!==''&&!/^#[0-9a-f]{6}$/i.test(result[key])) { throw new Error('Cor do texto inválida. Use seis dígitos após # ou a opção automática.'); }
            result[key]=result[key].toLowerCase();
        });
        if (result.theme !== 'custom' && themes[result.theme] !== result.accent) { result.theme = 'custom'; }
        if (['comfortable','compact','roomy'].indexOf(result.density) < 0 || ['integrated','together','separate'].indexOf(result.layout) < 0 ||
            ['left','center','right'].indexOf(result.alignment) < 0 || ['left','center','right'].indexOf(result.nameAlignment) < 0 || ['left','center','right'].indexOf(result.photoAlignment) < 0 ||
            [64,96,128,160,200].indexOf(result.photoSize) < 0 || ['square','round'].indexOf(result.photoShape) < 0 || ['manual','daily','wiki-daily'].indexOf(result.coverSource) < 0 ||
            [16,20,24,28,32,36].indexOf(result.nameFontSize) < 0 ||
            ['30d','90d','12m','since','custom'].indexOf(result.initialPeriod) < 0 ||
            ['activity','cards','both','top','all'].indexOf(result.profilePlacement) < 0 ||
            ['stacked','inline'].indexOf(result.profileDetailsLayout) < 0 ||
            ['cards-first','activity-first'].indexOf(result.blockOrder) < 0 || ['auto','2','3','4','5'].indexOf(result.cardColumns) < 0) {
            throw new Error('Opção de apresentação inválida.');
        }
        var placements=result.profilePlacements;
        if (!placements || typeof placements!=='object' || Array.isArray(placements) || Object.keys(placements).some(function(key){return ['name','location','accountCreated','photo','localTime','userGroups'].indexOf(key)<0;}) ||
            Object.keys(placements).some(function(key){return !validPlacement(placements[key]);})) { throw new Error('Posição das informações inválida.'); }
        result.profilePlacements=Object.assign({},defaults.profilePlacements,placements);
        result.customRange = normalizeRange(result.customRange);
        if (result.initialPeriod === 'custom' && !result.customRange) { throw new Error('Escolha as datas do período personalizado.'); }
        if (typeof result.showAccountCreated !== 'boolean') { throw new Error('Escolha válida para a data de criação da conta.'); }
        if (typeof result.showUserGroups !== 'boolean') { throw new Error('Escolha válida para os estatutos.'); }
        if (typeof result.showLocalTime !== 'boolean') { throw new Error('Escolha válida para o horário local.'); }
        if (typeof result.showCards !== 'boolean' || typeof result.showActivity !== 'boolean' || !result.showCards && !result.showActivity) {
            throw new Error('Escolha pelo menos um painel.');
        }
        if (!Array.isArray(result.metrics) || result.metrics.length > metrics.length || result.showCards && !result.metrics.length ||
            result.metrics.some(function (key, index) { return metrics.indexOf(key) < 0 || result.metrics.indexOf(key) !== index; })) {
            throw new Error('Escolha contadores válidos, sem repetir.');
        }
        if (!Array.isArray(result.highlightedMetrics) || result.highlightedMetrics.length > metrics.length ||
            result.highlightedMetrics.some(function (key, index) { return metrics.indexOf(key) < 0 || result.highlightedMetrics.indexOf(key) !== index; })) {
            throw new Error('Escolha destaques válidos, sem repetir.');
        }
        result.metrics = result.metrics.slice();
        result.highlightedMetrics = result.highlightedMetrics.slice();
        return result;
    }
    function normalizeRange(value, now) {
        if (value === null || value === undefined) { return null; }
        if (!value || typeof value !== 'object' || Array.isArray(value) || Object.keys(value).length !== 2 || !Object.prototype.hasOwnProperty.call(value,'start') || !Object.prototype.hasOwnProperty.call(value,'end')) { throw new Error('Escolha uma data inicial e uma data final.'); }
        var valid = function (date) { return typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date) && Number.isFinite(Date.parse(date + 'T00:00:00Z')) && new Date(date + 'T00:00:00Z').toISOString().slice(0,10) === date; };
        var today = new Date(now === undefined ? Date.now() : now).toISOString().slice(0,10);
        if (!valid(value.start) || !valid(value.end) || value.start < '2015-07-01' || value.start > value.end || value.end >= today) { throw new Error('Use datas entre 1 de julho de 2015 e o último dia completo, com o início antes do fim.'); }
        return {start:value.start,end:value.end};
    }
    function validPlacement(value) { return ['inherit','cards','activity','both','hidden','top','top-activity','top-cards','all'].indexOf(value)>=0; }
    function fieldIn(input, block, fieldOrPlacement) {
        var settings=normalize(input);
        if (block!=='cards'&&block!=='activity'&&block!=='top') { return false; }
        var placement=Object.prototype.hasOwnProperty.call(settings.profilePlacements,fieldOrPlacement) ? settings.profilePlacements[fieldOrPlacement] : fieldOrPlacement;
        if(placement===undefined)placement='inherit';
        if(!validPlacement(placement)) { throw new Error('Posição da informação inválida.'); }
        if(placement==='hidden'||block==='cards'&&!settings.showCards||block==='activity'&&!settings.showActivity)return false;
        if(placement==='inherit')placement=settings.profilePlacement;
        var scopes={cards:['cards'],activity:['activity'],both:['cards','activity'],top:['top'],'top-activity':['top','activity'],'top-cards':['top','cards'],all:['top','cards','activity']}[placement];
        if(block==='top')return scopes.indexOf('top')>=0;
        return scopes.indexOf(block)>=0||block==='cards'&&!settings.showActivity&&scopes.indexOf('activity')>=0||block==='activity'&&!settings.showCards&&scopes.indexOf('cards')>=0;
    }
    function profileIn(input, block, customFields) {
        var settings = normalize(input);
        return ['name','location','accountCreated','photo','localTime','userGroups'].some(function(field){return (field!=='userGroups'||settings.showUserGroups)&&fieldIn(settings,block,field);}) ||
            Array.isArray(customFields)&&customFields.some(function(field){return field&&(field.placement===undefined||validPlacement(field.placement))&&fieldIn(settings,block,field.placement);});
    }
    function channels(hex) { return [1,3,5].map(function (offset) { return parseInt(hex.slice(offset, offset + 2), 16); }); }
    function luminance(hex) {
        var values = channels(hex).map(function (channel) { var value = channel / 255; return value <= 0.04045 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4); });
        return 0.2126 * values[0] + 0.7152 * values[1] + 0.0722 * values[2];
    }
    function contrast(first, second) { var a = luminance(first), b = luminance(second); return (Math.max(a,b) + 0.05) / (Math.min(a,b) + 0.05); }
    function blend(hex, white) {
        return '#' + channels(hex).map(function (channel) { return Math.round(channel + (255 - channel) * white).toString(16).padStart(2,'0'); }).join('');
    }
    function colors(input) {
        var appearance = normalize(input), accent = appearance.accent, ink = accent, tint = blend(accent,0.91);
        while (contrast(ink, '#ffffff') < 4.5 || contrast(ink, tint) < 4.5) {
            ink = '#' + channels(ink).map(function (value) { return Math.max(0, Math.floor(value * 0.85)).toString(16).padStart(2, '0'); }).join('');
        }
        return {accent:accent, ink:ink, tint:tint, foreground:contrast(accent,'#ffffff') >= contrast(accent,'#000000') ? '#ffffff' : '#000000',
            palette:['#eaecf0', blend(ink,0.80), blend(ink,0.55), blend(ink,0.25), ink]};
    }
    function classes(input) {
        var value = normalize(input);
        return 'dan-pu-density-' + value.density + ' dan-pu-align-' + value.alignment + ' dan-pu-layout-' + value.layout + ' dan-pu-initial-' + value.initialPeriod + ' dan-pu-columns-' + value.cardColumns;
    }
    function highlightColors(input) {
        var background = normalize(input).highlightColor;
        var foreground = contrast(background,'#ffffff') >= contrast(background,'#000000') ? '#ffffff' : '#000000';
        return {background:background, foreground:foreground};
    }
    function topColors(input) {
        var background=normalize(input).topBackground;
        var foreground=contrast(background,'#ffffff')>=contrast(background,'#000000')?'#ffffff':'#000000';
        return {background:background,foreground:foreground,link:foreground,tone:foreground==='#ffffff'?'dark':'light'};
    }
    function footerOwner(input) {
        var settings = normalize(input);
        if(settings.layout==='integrated'&&settings.showCards&&settings.showActivity)return 'activity';
        return settings.showCards && (!settings.showActivity || settings.blockOrder === 'activity-first') ? 'cards' : 'activity';
    }
    return Object.freeze({profileIn:profileIn, fieldIn:fieldIn, validPlacement:validPlacement, normalizeRange:normalizeRange, defaults:defaults, themes:themes, metricIds:Object.freeze(metrics), normalize:normalize, colors:colors,
        highlightColors:highlightColors, topColors:topColors, footerOwner:footerOwner, classes:classes, contrast:contrast});
}));

;

/* PerfilWiki. Request-free block composition and owned DOM arrangement. CC BY-SA 4.0. */
(function(root,factory){
    var api=factory(typeof module==='object'&&module.exports?require('./Appearance.js'):root.PerfilWikiAppearance);
    if(typeof module==='object'&&module.exports)module.exports=api;
    else root.PerfilWikiLayoutView=api;
}(typeof window!=='undefined'?window:this,function(appearance){
    'use strict';
    var SLOT='<div id="dan-pu-integrated-cards" class="dan-pu-integrated-cards-slot" data-perfilwiki-cards-slot="true"></div>';
    function integrated(settings){return settings.layout==='integrated'&&settings.showCards&&settings.showActivity;}
    function slotMarkup(input){return integrated(appearance.normalize(input))?SLOT:'';}
    function compose(cardsMarkup,activityMarkup,input,headerMarkup){
        var settings=appearance.normalize(input);
        if(cardsMarkup===undefined||cardsMarkup===null)cardsMarkup='';
        if(activityMarkup===undefined||activityMarkup===null)activityMarkup='';
        if(headerMarkup===undefined||headerMarkup===null)headerMarkup='';
        if(typeof cardsMarkup!=='string'||typeof activityMarkup!=='string'||typeof headerMarkup!=='string')throw new TypeError('Os blocos do painel devem conter texto.');
        var cards=settings.showCards?cardsMarkup:'',activity=settings.showActivity?activityMarkup:'';
        if(integrated(settings)&&activity.indexOf(SLOT)>=0&&activity.indexOf(SLOT)===activity.lastIndexOf(SLOT))return headerMarkup+activity.replace(SLOT,function(){return SLOT.slice(0,-6)+cards+'</div>';});
        return headerMarkup+(settings.blockOrder==='activity-first'?activity+cards:cards+activity);
    }
    function owned(node,user){return !!node&&typeof node.getAttribute==='function'&&node.getAttribute('data-perfilwiki-user')===user;}
    function contains(parent,node){for(var cursor=node;cursor;cursor=cursor.parentNode)if(cursor===parent)return true;return false;}
    function groupOf(node,user){
        for(var parent=node&&node.parentNode;parent;parent=parent.parentNode){
            if(typeof parent.getAttribute==='function'&&parent.getAttribute('data-perfilwiki-group')==='true')return owned(parent,user)?parent:null;
        }
        return null;
    }
    function arrange(document,input,user){
        var settings=appearance.normalize(input);
        if(!document||typeof document.getElementById!=='function'||typeof user!=='string'||!user)return false;
        var cards=document.getElementById('dan-pu-estatisticas'),activity=document.getElementById('dan-pu-ritmo');
        if(!owned(cards,user)||!owned(activity,user)||typeof activity.querySelector!=='function')return false;
        var slot=activity.querySelector('#dan-pu-integrated-cards');
        if(slot&&(!slot.getAttribute||slot.getAttribute('data-perfilwiki-cards-slot')!=='true'||!contains(activity,slot)))slot=null;
        var nested=!!slot&&cards.parentNode===slot;
        var group=groupOf(activity,user),sameGroup=!!group&&groupOf(cards,user)===group&&activity.parentNode===group;
        var direct=sameGroup&&(cards.parentNode===group||nested);
        if(integrated(settings)){
            if(!slot||nested||!direct||typeof slot.appendChild!=='function')return false;
            slot.appendChild(cards);return true;
        }
        var changed=false;
        // An existing owned combined snapshot may be unwrapped by its owner.
        // Extract only from our recognized slot, immediately beside its panel.
        if(nested&&activity.parentNode&&typeof activity.parentNode.insertBefore==='function'){
            activity.parentNode.insertBefore(cards,activity);changed=true;
        }
        if(settings.layout!=='together'||!settings.showCards||!settings.showActivity||!sameGroup||cards.parentNode!==group)return changed;
        var first=settings.blockOrder==='activity-first'?activity:cards,second=first===activity?cards:activity;
        var children=Array.from(group.children||group.childNodes||[]);
        if(children.indexOf(first)>children.indexOf(second)){group.insertBefore(first,second);changed=true;}
        return changed;
    }
    return Object.freeze({slotMarkup:slotMarkup,compose:compose,arrange:arrange});
}));

;

/* PerfilWiki. Validated Commons daily-image metadata, without requests. CC BY-SA 4.0.
 * Feed: https://www.mediawiki.org/wiki/Wikifeeds */
(function(root,factory){
    var api=factory();
    if(typeof module==='object'&&module.exports)module.exports=api;
    else root.PerfilWikiDailyCover=api;
}(typeof window!=='undefined'?window:this,function(){
    'use strict';
    var keys=['version','date','filename','checkedAt','artist','license'];
    function today(now){try{var value=new Date(now===undefined?Date.now():now);return Number.isFinite(value.getTime())?value.toISOString().slice(0,10):null;}catch(_){return null;}}
    function day(value,now){return typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&value>='2000-01-01'&&value<=today(now)&&new Date(value+'T00:00:00.000Z').toISOString().slice(0,10)===value;}
    function filename(value){
        if(typeof value!=='string'||/[\x00-\x1f\x7f-\x9f\u2028\u2029<>{}]/.test(value))return null;
        var normalized=value.normalize('NFC').trim().replace(/^(?:File|Ficheiro):\s*/i,'').replace(/_/g,' ').trim();
        return normalized&&Array.from(normalized).length<=240&&!/[\x00-\x1f\x7f-\x9f\u2028\u2029<>{}\[\]|:#?\/\\]/.test(normalized)&&
            !/%[0-9a-f]{2}|&(?:#[0-9]+|#x[0-9a-f]+|[a-z][a-z0-9]*);/i.test(normalized)&&!/^\./.test(normalized)&&/\.(?:jpe?g|png|webp|gif|svg)$/i.test(normalized)?normalized:null;
    }
    function plain(value,limit){return typeof value==='string'&&value===value.normalize('NFC').trim()&&value.length>0&&Array.from(value).length<=limit&&!/[\x00-\x1f\x7f-\x9f\u2028\u2029<>{}\[\]|]/.test(value)?value:null;}
    function normalize(proof,now){
        try{
            if(!proof||typeof proof!=='object'||Array.isArray(proof)||Object.keys(proof).some(function(key){return keys.indexOf(key)<0;})||['version','date','filename','checkedAt'].some(function(key){return !Object.prototype.hasOwnProperty.call(proof,key);})||proof.version!==1||!day(proof.date,now)||filename(proof.filename)!==proof.filename)return null;
            var checked=new Date(proof.checkedAt),clock=new Date(now===undefined?Date.now():now);
            if(typeof proof.checkedAt!=='string'||!Number.isFinite(checked.getTime())||checked.toISOString()!==proof.checkedAt||!Number.isFinite(clock.getTime())||checked>clock||proof.date>today(checked))return null;
            var result={version:1,date:proof.date,filename:proof.filename,checkedAt:proof.checkedAt};
            for(var index=0;index<2;index+=1){var key=index?'license':'artist';if(Object.prototype.hasOwnProperty.call(proof,key)){if(!plain(proof[key],index?120:200))return null;result[key]=proof[key];}}
            return result;
        }catch(_){return null;}
    }
    function fromFeed(data,date,now){
        try{
            if(!data||typeof data!=='object'||Array.isArray(data)||!day(date,now)||!data.image||typeof data.image!=='object'||Array.isArray(data.image)||typeof data.image.title!=='string'||!/^File:/.test(data.image.title))return null;
            var name=filename(data.image.title);if(!name)return null;
            var proof={version:1,date:date,filename:name,checkedAt:new Date(now===undefined?Date.now():now).toISOString()};
            var artist=data.image.artist&&plain(data.image.artist.text,200),license=data.image.license&&plain(data.image.license.type,120);
            if(artist)proof.artist=artist;if(license)proof.license=license;
            return normalize(proof,now);
        }catch(_){return null;}
    }
    function url(date,now){try{return day(date,now)?'https://pt.wikipedia.org/api/rest_v1/feed/featured/'+date.replace(/-/g,'/'):'';}catch(_){return '';}}
    function caption(proof){return 'Imagem do dia do Commons · '+proof.date.slice(8,10)+'/'+proof.date.slice(5,7)+'/'+proof.date.slice(0,4)+(proof.artist?' · '+proof.artist:'')+(proof.license?' · '+proof.license:'');}
    return Object.freeze({today:today,normalize:normalize,fromFeed:fromFeed,url:url,caption:caption});
}));

;

/* PerfilWiki. Native date-selected ptwiki cover, without visitor scripts or requests.
 * Uses the same dated transclusion as ptwiki's main page. CC BY-SA 4.0. */
(function(root,factory){
    var api=factory(typeof module==='object'&&module.exports?require('./I18n.js'):root.PerfilWikiI18n);
    if(typeof module==='object'&&module.exports)module.exports=api;
    else root.PerfilWikiNativeDailyCover=api;
}(typeof window!=='undefined'?window:this,function(i18n){
    'use strict';
    var date='{{CURRENTDAY}} de {{CURRENTMONTHNAME}} de {{CURRENTYEAR}}';
    var title='Wikipédia:Imagem em destaque/'+date;
    function pageTitle(){return title;}
    function transclusion(){return '{{'+title+'|min=1200|max=1200}}';}
    function wikitext(language){
        return '{{#ifexist:'+title+'\n|'+transclusion()+'\n|<div class="dan-pu-profile-cover-pending">'+i18n.t(language,'Imagem do dia indisponível')+'</div>\n}}';
    }
    function caption(wiki,language){
        return wiki?'[['+title+'|'+i18n.t(language,'Imagem do dia da Wikipédia em português')+']] · '+(language&&language.indexOf('pt-')!==0?'{{CURRENTYEAR}}-{{CURRENTMONTH}}-{{CURRENTDAY2}}':date)+i18n.t(language,' · Clique na imagem para ver o arquivo e os créditos.'):
            i18n.t(language,'Imagem do dia da Wikipédia em português · Prévia ilustrativa');
    }
    function preview(orientation,language){
        var portrait=orientation==='portrait',width=portrait?600:1200,height=portrait?1000:800;
        var svg='<svg xmlns="http://www.w3.org/2000/svg" width="'+width+'" height="'+height+'" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice"><rect width="1200" height="800" fill="#d9e8ed"/><circle cx="940" cy="180" r="85" fill="#fff0bf"/><path d="M0 590L260 180l260 410L770 300l430 330v170H0Z" fill="#8ca9ad"/><path d="M0 700l270-210 290 220 280-180 360 210v60H0Z" fill="#426e66"/></svg>';
        var description='<p>'+i18n.t(language,'Descrição ilustrativa da imagem do dia.')+'</p>';
        return '<div align="center"><table><tbody><tr><td><span class="imagem-destaque" typeof="mw:File"><a class="mw-file-description" href="#perfilwiki-local-daily-cover-credit"><img width="'+width+'" height="'+height+'" alt="'+i18n.t(language,'Prévia ilustrativa da imagem do dia da Wikipédia em português')+'" src="data:image/svg+xml,'+encodeURIComponent(svg)+'"></a></span></td>'+(portrait?'<td>'+description+'</td>':'')+'</tr></tbody></table>'+(portrait?'':description)+'</div>';
    }
    return Object.freeze({pageTitle:pageTitle,transclusion:transclusion,wikitext:wikitext,caption:caption,preview:preview});
}));

;

/* PerfilWiki. Safe, request-free profile text and internal wiki links. CC BY-SA 4.0. */
(function (root, factory) {
    var api = factory(typeof module === 'object' && module.exports ? require('./Appearance.js') : root.PerfilWikiAppearance,
        typeof module === 'object' && module.exports ? require('./DailyCover.js') : root.PerfilWikiDailyCover,
        typeof module === 'object' && module.exports ? require('./NativeDailyCover.js') : root.PerfilWikiNativeDailyCover,
        typeof module==='object'&&module.exports?require('./I18n.js'):root.PerfilWikiI18n);
    if (typeof module === 'object' && module.exports) { module.exports = api; }
    else { root.PerfilWikiProfileText = api; }
}(typeof window !== 'undefined' ? window : this, function (appearanceApi,dailyCoverApi,nativeCoverApi,i18n) {
    'use strict';
    var forbidden = /[\x00-\x1f\x7f-\x9f\u2028\u2029<>\{\}]/;
    var localNamespaces = ['media','especial','special','discussão','discussao','talk','usuário','usuario','usuária','usuaria','user',
        'discussão de usuário','discussao de usuario','user talk','wikipédia','wikipedia','discussão sobre a wikipédia','wikipedia talk',
        'predefinição','predefinicao','template','predefinição discussão','template talk','módulo','modulo','module','module talk',
        'ajuda','help','help talk','categoria','category','category talk','ficheiro','arquivo','imagem','file','image','file talk',
        'portal','portal talk','anexo','mediawiki','mediawiki talk','gadget','gadget definition'];
    function fail() { throw new TypeError('Use texto e ligações internas como [[Rio de Janeiro]] ou [[Título|Rótulo]], sem outro código.'); }
    function escape(value) {
        return value.replace(/[&<>"']/g,function (character) { return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]; });
    }
    function literal(value) {
        return escape(value).replace(/[\[\]{}|~_:]/g,function (character) { return '&#' + character.charCodeAt(0) + ';'; });
    }
    function target(value) {
        var title = value.replace(/_/g,' ').normalize('NFC').trim();
        if (title.charAt(0) === ':') { title = title.slice(1).trim(); }
        if (!title || forbidden.test(title) || /[\[\]|]/.test(title) || /%[0-9a-f]{2}|&(?:#[0-9]+|#x[0-9a-f]+|[a-z][a-z0-9]*);/i.test(title)) { fail(); }
        var hash = title.indexOf('#'), page = hash < 0 ? title : title.slice(0,hash), fragment = hash < 0 ? '' : title.slice(hash + 1);
        if (!page.trim() || hash >= 0 && (!fragment.trim() || fragment.indexOf('#') >= 0)) { fail(); }
        var colon = page.indexOf(':');
        if (colon >= 0 && localNamespaces.indexOf(page.slice(0,colon).trim().toLocaleLowerCase('pt-BR')) < 0) { fail(); }
        if (colon >= 0 && !page.slice(colon + 1).trim()) { fail(); }
        return title;
    }
    function address(title) {
        var hash = title.indexOf('#'), page = hash < 0 ? title : title.slice(0,hash), fragment = hash < 0 ? '' : title.slice(hash + 1);
        return 'https://pt.wikipedia.org/wiki/' + encodeURIComponent(page.replace(/ /g,'_')) + (fragment ? '#' + encodeURIComponent(fragment.replace(/ /g,'_')) : '');
    }
    function parse(value, limit) {
        if (typeof value !== 'string' || forbidden.test(value)) { fail(); }
        if (limit === undefined) { limit = 1024; }
        if (!Number.isSafeInteger(limit) || limit < 0) { throw new TypeError('Limite de texto inválido.'); }
        value = value.normalize('NFC').trim();
        if (Array.from(value).length > limit) { throw new TypeError('Use até ' + limit + ' caracteres.'); }
        var result = [], cursor = 0;
        while (cursor < value.length) {
            var open = value.indexOf('[[',cursor), plain = value.slice(cursor,open < 0 ? value.length : open);
            if (/[\[\]|]/.test(plain)) { fail(); }
            if (plain) { result.push(Object.freeze({type:'text',value:plain})); }
            if (open < 0) { break; }
            var close = value.indexOf(']]',open + 2);
            if (close < 0) { fail(); }
            var contents = value.slice(open + 2,close), parts = contents.split('|');
            if (parts.length > 2 || /[\[\]]/.test(contents)) { fail(); }
            var title = target(parts[0]), label = parts.length === 2 ? parts[1].trim() : title;
            if (!label || forbidden.test(label) || /[\[\]|]/.test(label)) { fail(); }
            result.push(Object.freeze({type:'link',title:title,label:label,href:address(title)}));
            cursor = close + 2;
        }
        return {value:value,tokens:Object.freeze(result)};
    }
    function tokens(value) { return parse(value).tokens; }
    function linkColor(value) {
        if(value===undefined||value==='')return '';
        if(typeof value!=='string'||!/^#[0-9a-f]{6}$/i.test(value))throw new TypeError('Cor do texto inválida.');
        return value.toLowerCase();
    }
    function html(value,color) {
        color=linkColor(color);
        return tokens(value).map(function (token) { return token.type === 'text' ? escape(token.value) : '<a href="' + escape(token.href) + '"'+(color?' style="color:'+color+';"':'')+'>' + escape(token.label) + '</a>'; }).join('');
    }
    function wikitext(value,color) {
        color=linkColor(color);
        return tokens(value).map(function (token) {
            return token.type === 'text' ? literal(token.value) : '[[:' + escape(token.title).replace(/~/g,'&#126;') + '|' + (color?'<span style="color:'+color+';">':'')+literal(token.label)+(color?'</span>':'') + ']]';
        }).join('');
    }
    function append(document, parent, value,color) {
        color=linkColor(color);
        tokens(value).forEach(function (token) {
            var node = document.createElement(token.type === 'link' ? 'a' : 'span');
            node.textContent = token.type === 'link' ? token.label : token.value;
            if (token.type === 'link') { node.setAttribute('href',token.href); }
            if (token.type === 'link'&&color) { node.setAttribute('style','color:'+color+';'); }
            parent.appendChild(node);
        });
        return parent;
    }
    function normalizePhoto(value) {
        if(value===undefined)return '';
        if(typeof value!=='string'||forbidden.test(value))throw new TypeError('Informe o nome de um arquivo de imagem do Wikimedia Commons.');
        var filename=value.normalize('NFC').trim().replace(/^(?:File|Ficheiro):\s*/i,'').replace(/_/g,' ').trim();
        if(!filename)return '';
        if(Array.from(filename).length>240||forbidden.test(filename)||/[\[\]|:#?\/\\]/.test(filename)||
            /%[0-9a-f]{2}|&(?:#[0-9]+|#x[0-9a-f]+|[a-z][a-z0-9]*);/i.test(filename)||
            /^\./.test(filename)||! /\.(?:jpe?g|png|webp|gif|svg)$/i.test(filename)) {
            throw new TypeError('Use apenas o nome de uma imagem JPG, PNG, WebP, GIF ou SVG do Wikimedia Commons, sem endereço ou código.');
        }
        return filename;
    }
    function photoAddress(value) { var filename=normalizePhoto(value);return filename?'https://commons.wikimedia.org/wiki/File:'+encodeURIComponent(filename.replace(/ /g,'_')):''; }
    function photoSource(value) { var filename=normalizePhoto(value);return filename?'https://commons.wikimedia.org/wiki/Special:FilePath/'+encodeURIComponent(filename.replace(/ /g,'_'))+'?width=160':''; }
    function photoInfo(presentation) {
        presentation=presentation||{};var filename,language=appearanceApi.normalize(presentation.appearance).language;
        try {filename=normalizePhoto(presentation.photo);}catch(_){return null;}
        if(!filename)return null;
        return {filename:filename,href:photoAddress(filename),src:presentation.localPhotoPreview===true ?
            'data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160"><rect width="160" height="160" rx="12" fill="#eaecf0"/><circle cx="80" cy="58" r="26" fill="#a2a9b1"/><path d="M30 145c0-38 18-57 50-57s50 19 50 57" fill="#a2a9b1"/></svg>') : photoSource(filename),
            alt:i18n.t(language,'Foto de {name}',{name:String(presentation.displayName||presentation.user||'')})};
    }
    function photoMarkup(presentation,wiki) {
        var settings=appearanceApi.normalize(presentation&&presentation.appearance),photo=photoInfo(presentation),t=function(source,params){return i18n.t(settings.language,source,params);};if(!photo)return '';
        var image=wiki ? '[[Ficheiro:'+literal(photo.filename)+'|'+settings.photoSize+'x'+settings.photoSize+'px|link='+photo.href+'|alt='+literal(photo.alt)+']]' :
            '<a class="dan-pu-profile-photo-image-link" href="'+escape(photo.href)+'"><img class="dan-pu-profile-photo-image" crossorigin="anonymous" referrerpolicy="no-referrer" loading="lazy" decoding="async" src="'+escape(photo.src)+'" alt="'+escape(photo.alt)+'" width="160" height="160"></a><span class="dan-pu-profile-photo-placeholder" hidden>'+t('Imagem indisponível')+'</span>';
        var caption=wiki ? '['+photo.href+' '+t('Ver arquivo no Commons')+']' : '<a class="dan-pu-profile-photo-link" href="'+escape(photo.href)+'">'+t('Ver arquivo no Commons')+'</a>';
        return '<div class="dan-pu-profile-photo" data-perfilwiki-photo="'+(wiki?literal(photo.filename):escape(photo.filename))+'" data-photo-size="'+settings.photoSize+'" data-photo-shape="'+settings.photoShape+'"><div class="dan-pu-profile-photo-visual">'+image+'</div><div class="dan-pu-profile-photo-caption">'+caption+'</div></div>';
    }
    function coverSource(value) { var filename=normalizePhoto(value);return filename?'https://commons.wikimedia.org/wiki/Special:FilePath/'+encodeURIComponent(filename.replace(/ /g,'_'))+'?width=1200':''; }
    function coverInfo(presentation) {
        presentation=presentation||{};var filename,settings=appearanceApi.normalize(presentation.appearance),daily=settings.coverSource==='daily';
        if(settings.coverSource==='wiki-daily')return {native:true,filename:'',src:'',href:'',localPreview:presentation.localCoverPreview===true,caption:nativeCoverApi.caption(false,settings.language)};
        var proof=daily&&dailyCoverApi?dailyCoverApi.normalize(presentation.dailyCover,presentation.now):null;
        try {filename=daily?proof&&proof.filename||'':normalizePhoto(presentation.coverImage);}catch(_){return null;}
        if(!filename&&!daily)return null;
        var illustration='<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="300" viewBox="0 0 1200 300"><defs><linearGradient id="sky" x2="0" y2="1"><stop stop-color="#b8d8ef"/><stop offset="1" stop-color="#e8f1ed"/></linearGradient></defs><rect width="1200" height="300" fill="url(#sky)"/><circle cx="965" cy="72" r="33" fill="#fff3ca"/><path d="M0 210L175 65l195 159L577 91l201 149 188-122 234 102v80H0Z" fill="#9cb8bc"/><path d="M0 252l178-97 200 117 190-104 187 94 201-86 244 83v41H0Z" fill="#597e78"/><path d="M0 282l241-57 239 64 230-49 226 41 264-62v81H0Z" fill="#315e53"/></svg>';
        return {filename:filename,href:photoAddress(filename),src:presentation.localCoverPreview===true?'data:image/svg+xml,'+encodeURIComponent(illustration):coverSource(filename),
            alt:daily?i18n.t(settings.language,'Imagem do dia do Wikimedia Commons'):i18n.t(settings.language,'Capa do perfil de {name}',{name:String(presentation.displayName||presentation.user||'')}),
            daily:daily,proof:proof,pending:daily&&!filename&&presentation.localCoverPreview!==true,
            caption:daily?(presentation.localCoverPreview===true&&!proof?i18n.t(settings.language,'Imagem do dia do Commons · Prévia ilustrativa'):proof?i18n.t(settings.language,'Imagem do dia do Commons')+' · '+i18n.date(settings.language,proof.date+'T00:00:00Z',{day:'2-digit',month:'2-digit',year:'numeric'})+(proof.artist?' · '+proof.artist:'')+(proof.license?' · '+proof.license:''):i18n.t(settings.language,'Imagem do dia do Commons · Aguardando consulta')):''};
    }
    function coverMarkup(presentation,wiki) {
        var cover=coverInfo(presentation),language=appearanceApi.normalize(presentation&&presentation.appearance).language,t=function(source,params){return i18n.t(language,source,params);};if(!cover)return '';
        if(cover.native)return '<div class="dan-pu-profile-cover" data-perfilwiki-cover="" data-perfilwiki-cover-source="wiki-daily"><div class="dan-pu-profile-cover-native-body">'+(wiki?nativeCoverApi.wikitext(language):cover.localPreview?nativeCoverApi.preview(undefined,language):'<div class="dan-pu-profile-cover-pending">'+t('Imagem do dia da Wikipédia em português')+'</div>')+'</div><div class="dan-pu-profile-cover-caption">'+(wiki?nativeCoverApi.caption(true,language):escape(cover.caption))+'</div></div>';
        var image=cover.pending||wiki&&!cover.filename?'<div class="dan-pu-profile-cover-pending">'+t('Imagem do dia do Commons')+'</div>':wiki&&cover.filename?'[[Ficheiro:'+literal(cover.filename)+'|1200px|link='+cover.href+'|alt='+literal(cover.alt)+']]' :
            (cover.href?'<a class="dan-pu-profile-cover-image-link" href="'+escape(cover.href)+'">':'')+'<img class="dan-pu-profile-cover-image" crossorigin="anonymous" referrerpolicy="no-referrer" loading="lazy" decoding="async" src="'+escape(cover.src)+'" alt="'+escape(cover.alt)+'" width="1200" height="300">'+(cover.href?'</a>':'')+'<span class="dan-pu-profile-cover-placeholder" hidden>'+t('Imagem de capa indisponível')+'</span>';
        var caption=cover.daily?'<div class="dan-pu-profile-cover-caption">'+(wiki?literal(cover.caption):escape(cover.caption))+(cover.href?' · '+(wiki?'['+cover.href+' '+t('Ver arquivo e créditos')+']':'<a href="'+escape(cover.href)+'">'+t('Ver arquivo e créditos')+'</a>'):'')+'</div>':'';
        return '<div class="dan-pu-profile-cover" data-perfilwiki-cover="'+(wiki?literal(cover.filename):escape(cover.filename))+'" data-perfilwiki-cover-source="'+(cover.daily?'daily':'manual')+'"'+(cover.proof?' data-perfilwiki-daily-cover="'+(wiki?literal(JSON.stringify(cover.proof)):escape(JSON.stringify(cover.proof)))+'"':'')+'>'+image+caption+'</div>';
    }
    return Object.freeze({normalize:function (value,limit) { return parse(value,limit).value; },tokens:tokens,html:html,wikitext:wikitext,append:append,
        normalizePhoto:normalizePhoto,photoAddress:photoAddress,photoSource:photoSource,photoInfo:photoInfo,photoMarkup:photoMarkup,
        normalizeCover:normalizePhoto,coverSource:coverSource,coverInfo:coverInfo,coverMarkup:coverMarkup});
}));

;

/* PerfilWiki. Personal wikitext stays outside the refreshed statistics. CC BY-SA 4.0. */
(function(root,factory){
    var api=factory(typeof module==='object'&&module.exports?require('./ProfileText.js'):root.PerfilWikiProfileText);
    if(typeof module==='object'&&module.exports)module.exports=api;
    else root.PerfilWikiProfileSections=api;
}(typeof window!=='undefined'?window:this,function(profileText){
    'use strict';
    var MAX_SECTIONS=8,MAX_CONTENT=50000,MAX_TOTAL=200000;
    var BEGIN='<!-- PERFILWIKI-CONTENT-BEGIN -->',END='<!-- PERFILWIKI-CONTENT-END -->';
    function escape(value){return String(value).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
    function normalize(input){
        if(input===undefined)return [];
        if(!Array.isArray(input)||input.length>MAX_SECTIONS)throw new TypeError('Use até oito blocos de texto.');
        var total=0,result=[];
        input.forEach(function(row){
            if(!row||typeof row!=='object'||Array.isArray(row)||Object.keys(row).some(function(k){return ['title','content'].indexOf(k)<0;})||typeof row.title!=='string'||typeof row.content!=='string')throw new TypeError('Cada bloco precisa de título e conteúdo em texto.');
            var title=row.title.normalize('NFC').trim(),content=row.content;
            if(/[\x00-\x1f\x7f-\x9f<>\[\]{}|=]/.test(title)||Array.from(title).length>100)throw new TypeError('Use um título com até 100 caracteres, sem código ou quebras de linha.');
            if(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f-\x9f]/.test(content)||content.length>MAX_CONTENT)throw new TypeError('Use até 50.000 caracteres no conteúdo de cada bloco.');
            if(/PERFILWIKI-(?:PROFILE|ACTIVATION|CARDS|ACTIVITY|CONTENT)-(?:BEGIN|END)/i.test(content))throw new TypeError('Retire as marcas de instalação do conteúdo do bloco.');
            total+=content.length;
            if(total>MAX_TOTAL)throw new TypeError('Os blocos podem somar até 200.000 caracteres de conteúdo.');
            if(!title&&!content.trim())return;
            if(!title)throw new TypeError('Dê um título ao bloco de texto.');
            result.push({title:title,content:content});
        });
        return result;
    }
    // This is a small, inert approximation for the local installer. The original
    // wikitext is exported verbatim and is never sent to a parsing service.
    function inline(value,depth){
        depth=depth||0;
        if(depth>6)return escape(value);
        var expression=/\[\[|\[https?:\/\/|'''|''|\{\{|</g,out='',cursor=0,match;
        while((match=expression.exec(value))){
            var opener=match[0],closing=opener==='[['?']]':opener==='{{'?'}}':opener==='<'?'>':opener.charAt(0)==='['?']':opener;
            var end=value.indexOf(closing,match.index+opener.length);
            // A missing closer consumes the remaining literal text once, avoiding
            // repeated tail scans for malformed but otherwise permitted drafts.
            if(end<0)break;
            var token=value.slice(match.index,end+closing.length);
            out+=escape(value.slice(cursor,match.index));
            if(token.slice(0,2)==='[['){try{out+=profileText.html(token);}catch(_){out+='<code class="dan-pu-section-code">'+escape(token)+'</code>';}}
            else if(token.charAt(0)==='['){
                var link=/^\[(https?:\/\/[^\s\]]+)(?:\s+([^\]]+))?\]$/.exec(token),safe=false;
                if(link){try{var url=new URL(link[1]);safe=['http:','https:'].indexOf(url.protocol)>=0&&!url.username&&!url.password;}catch(_) { /* Keep malformed addresses as text. */ }}
                out+=safe?'<a href="'+escape(link[1])+'" rel="noopener noreferrer">'+escape(link[2]||link[1])+'</a>':escape(token);
            }else if(token.slice(0,3)==="'''")out+='<strong>'+inline(token.slice(3,-3),depth+1)+'</strong>';
            else if(token.slice(0,2)==="''")out+='<em>'+inline(token.slice(2,-2),depth+1)+'</em>';
            else out+='<code class="dan-pu-section-code">'+escape(token)+'</code>';
            cursor=end+closing.length;expression.lastIndex=cursor;
        }
        return out+escape(value.slice(cursor));
    }
    function preview(content){
        var lines=content.replace(/\r\n?/g,'\n').split('\n'),out=[],paragraph=[],list=null,table=null;
        function flush(){if(paragraph.length){out.push('<p>'+inline(paragraph.join(' '))+'</p>');paragraph=[];}if(list){out.push('</'+list+'>');list=null;}}
        lines.forEach(function(line){
            if(table){table.push(line);if(/^\s*\|}/.test(line)){out.push('<details class="dan-pu-section-source"><summary>Tabela em wikitexto</summary><pre>'+escape(table.join('\n'))+'</pre></details>');table=null;}return;}
            if(/^\s*\{\|/.test(line)){flush();table=[line];return;}
            if(!line.trim()){flush();return;}
            var heading=/^(={2,6})\s*(.*?)\s*\1\s*$/.exec(line),item=/^([*#]+)\s*(.*)$/.exec(line);
            if(heading){flush();var level=Math.min(6,heading[1].length+1);out.push('<h'+level+'>'+inline(heading[2])+'</h'+level+'>');}
            else if(item){if(paragraph.length){out.push('<p>'+inline(paragraph.join(' '))+'</p>');paragraph=[];}var kind=item[1].charAt(0)==='#'?'ol':'ul';if(list!==kind){if(list)out.push('</'+list+'>');list=kind;out.push('<'+kind+'>');}out.push('<li>'+inline(item[2])+'</li>');}
            else{if(list){out.push('</'+list+'>');list=null;}paragraph.push(line);}
        });
        flush();if(table)out.push('<pre class="dan-pu-section-source">'+escape(table.join('\n'))+'</pre>');
        return out.join('');
    }
    function html(input,options){
        var rows=normalize(input);if(!rows.length)return '';options=options||{};
        return '<div id="dan-pu-content-sections" class="dan-pu-content-sections" data-perfilwiki-user="'+escape(options.user||'')+'">'+rows.map(function(row,index){
            return '<section class="dan-pu-content-section"><div class="dan-pu-content-section-heading"><h2>'+escape(row.title)+'</h2><button type="button" class="dan-pu-section-edit" data-perfilwiki-edit-section="'+index+'" aria-label="Editar '+escape(row.title)+'">Editar</button></div><div class="dan-pu-content-section-body">'+preview(row.content)+'</div></section>';
        }).join('')+'<p class="dan-pu-content-preview-note">Prévia simplificada. Predefinições e código HTML aparecem como texto. O código original é mantido na instalação.</p></div>';
    }
    function wikitext(input,options){
        var rows=normalize(input);if(!rows.length)return '';options=options||{};
        return BEGIN+'\n<div id="dan-pu-content-sections" class="dan-pu-content-sections" data-perfilwiki-user="'+escape(options.user||'')+'">\n'+rows.map(function(row){var title=escape(row.title).replace(/[~_]/g,function(c){return '&#'+c.charCodeAt(0)+';';});return '<div class="dan-pu-content-section">\n== '+title+' ==\n'+row.content+'\n</div>';}).join('\n')+'\n</div>\n'+END;
    }
    return Object.freeze({normalize:normalize,html:html,wikitext:wikitext,preview:preview,markers:Object.freeze({start:BEGIN,end:END}),limits:Object.freeze({sections:MAX_SECTIONS,title:100,content:MAX_CONTENT,total:MAX_TOTAL})});
}));

;

/* PerfilWiki. Shared, request-free custom profile field normalization. CC BY-SA 4.0. */
(function (root, factory) {
    var api = factory(typeof module === 'object' && module.exports ? require('./ProfileText.js') : root.PerfilWikiProfileText);
    if (typeof module === 'object' && module.exports) { module.exports = api; }
    else { root.PerfilWikiProfileFields = api; }
}(typeof window !== 'undefined' ? window : this, function (profileText) {
    'use strict';
    var layouts = ['inline','lines','bullets'];
    var separators = ['pipe','dot','space'];
    var placements = ['inherit','cards','activity','both','hidden','top','top-activity','top-cards','all'];
    function owns(value, key) { return Object.prototype.hasOwnProperty.call(value,key); }
    function plainLabel(value) {
        if (typeof value !== 'string' || /[\x00-\x1f\x7f-\x9f\u2028\u2029<>\[\]{}|]/.test(value)) { throw new TypeError('O rótulo deve conter apenas texto.'); }
        var label = value.normalize('NFC').trim();
        if (Array.from(label).length > 40) { throw new TypeError('O rótulo deve ter até 40 caracteres.'); }
        return label;
    }
    function color(value, optional) {
        if (value === '' || optional && value === undefined) { return ''; }
        if (typeof value !== 'string' || !/^#[0-9a-f]{6}$/i.test(value)) { throw new TypeError('Escolha uma cor de texto válida.'); }
        return value.toLowerCase();
    }
    function normalize(input) {
        if (input === undefined) { return []; }
        if (!Array.isArray(input) || input.length > 3) { throw new TypeError('Use até três informações adicionais.'); }
        var normalized = [];
        for (var index = 0; index < input.length; index += 1) {
            var field = input[index];
            if (!field || typeof field !== 'object' || Array.isArray(field)) { throw new TypeError('Informação adicional inválida.'); }
            var legacy = owns(field,'value'), grouped = owns(field,'values');
            var allowed = grouped ? ['label','values','layout','separator','placement','labelColor','valueColors'] : ['label','value','placement','labelColor','valueColor'];
            if (legacy && grouped || !owns(field,'label') || Object.keys(field).some(function (key) { return allowed.indexOf(key) < 0; }) ||
                field.placement !== undefined && placements.indexOf(field.placement) < 0) { throw new TypeError('Informação adicional inválida.'); }
            var label = plainLabel(field.label), labelColor = color(field.labelColor,true), values, value, result, colors = [], valueColor;
            if (grouped) {
                var layout = field.layout === undefined ? 'inline' : field.layout;
                var separator = field.separator === undefined ? 'pipe' : field.separator;
                if (layouts.indexOf(layout) < 0 || separators.indexOf(separator) < 0) { throw new TypeError('Escolha uma disposição e um separador válidos para os itens.'); }
                if (!Array.isArray(field.values) || field.values.length > 8) { throw new TypeError('Use até oito itens em cada informação adicional.'); }
                if (field.valueColors !== undefined && (!Array.isArray(field.valueColors) || field.valueColors.length !== field.values.length)) { throw new TypeError('Cada item deve ter a sua própria opção de cor.'); }
                values = [];
                for (var item = 0; item < field.values.length; item += 1) {
                    value = profileText.normalize(field.values[item],160);
                    valueColor = field.valueColors === undefined ? '' : color(field.valueColors[item],false);
                    if (value) { values.push(value); colors.push(valueColor); }
                }
                if (!label && !values.length) { continue; }
                if (!label) { throw new TypeError('Preencha o rótulo da informação ou remova a linha.'); }
                result = {label:label,values:values,layout:layout,separator:separator};
                if (colors.some(function (entry) { return entry !== ''; })) { result.valueColors = colors; }
            } else {
                value = profileText.normalize(legacy ? field.value : '',160);
                valueColor = color(field.valueColor,true);
                if (!label && !value) { continue; }
                if (!label) { throw new TypeError('Preencha o rótulo da informação ou remova a linha.'); }
                result = {label:label,value:value};
                if (valueColor) { result.valueColor = valueColor; }
            }
            if (labelColor) { result.labelColor = labelColor; }
            if (field.placement !== undefined) { result.placement = field.placement; }
            normalized.push(result);
        }
        return normalized;
    }
    function fieldValue(field) { return normalize([field])[0] || null; }
    function values(field) {
        var normalized = fieldValue(field);
        return !normalized ? [] : owns(normalized,'values') ? normalized.values.slice() : normalized.value ? [normalized.value] : [];
    }
    function layoutOf(field) { var normalized = fieldValue(field); return normalized && normalized.layout || 'inline'; }
    function separatorOf(field) { var normalized = fieldValue(field); return normalized && normalized.separator || 'pipe'; }
    function valueColors(field) {
        var normalized = fieldValue(field);
        if (!normalized) { return []; }
        return owns(normalized,'values') ? normalized.values.map(function (_,index) { return normalized.valueColors && normalized.valueColors[index] || ''; }) : normalized.value ? [normalized.valueColor || ''] : [];
    }
    return Object.freeze({normalize:normalize,values:values,valueColors:valueColors,layoutOf:layoutOf,separatorOf:separatorOf});
}));

;

/* PerfilWiki. Local-time presentation from Intl, without requests or timers. CC BY-SA 4.0. */
(function(root,factory){
    var api=factory(typeof module==='object'&&module.exports?require('./I18n.js'):root.PerfilWikiI18n);
    if(typeof module==='object'&&module.exports)module.exports=api;
    else root.PerfilWikiProfileClock=api;
}(typeof window!=='undefined'?window:this,function(i18n){
    'use strict';
    var cache=new Map();
    function formatters(timeZone,language){
        language=i18n.normalizeLanguage(language);
        var key=language+'|'+timeZone;
        if(typeof timeZone!=='string'||!timeZone)return null;
        if(cache.has(key))return cache.get(key);
        try{
            var options={timeZone:timeZone,hour:'2-digit',minute:'2-digit',hourCycle:'h23'};
            var value={clock:new Intl.DateTimeFormat(language+'-u-ca-gregory-nu-latn',options),
                date:new Intl.DateTimeFormat(language+'-u-ca-gregory-nu-latn',Object.assign({},options,{year:'numeric',month:'2-digit',day:'2-digit'})),offset:null,
                parts:new Intl.DateTimeFormat('en-GB-u-ca-gregory-nu-latn',{timeZone:timeZone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'})};
            try{value.offset=new Intl.DateTimeFormat('en-US-u-ca-gregory-nu-latn',{timeZone:timeZone,timeZoneName:'longOffset'});}catch(_){}
            if(cache.size>=64)cache.delete(cache.keys().next().value);
            cache.set(key,value);return value;
        }catch(_){return null;}
    }
    function offsetAt(date,formats){
        if(formats.offset){
            var part=formats.offset.formatToParts(date).find(function(item){return item.type==='timeZoneName';});
            var raw=part&&part.value.replace(/−/g,'-');
            if(raw==='GMT'||raw==='UTC')return 'UTC+0';
            var matched=/^(?:GMT|UTC)([+-])(\d{1,2})(?::(\d{2}))?(?::(\d{2}))?$/.exec(raw||'');
            if(matched)return 'UTC'+matched[1]+Number(matched[2])+((matched[3]&&matched[3]!=='00'||matched[4]&&matched[4]!=='00')?':'+(matched[3]||'00'):'')+(matched[4]&&matched[4]!=='00'?':'+matched[4]:'');
        }
        var fields={};formats.parts.formatToParts(date).forEach(function(part){if(part.type!=='literal')fields[part.type]=Number(part.value);});
        var wall=Date.UTC(fields.year,fields.month-1,fields.day,fields.hour%24,fields.minute,fields.second),seconds=Math.round((wall-Math.floor(date.getTime()/1000)*1000)/1000);
        if(!Number.isFinite(seconds)||Math.abs(seconds)>86400)return null;
        var absolute=Math.abs(seconds),hours=Math.floor(absolute/3600),minutes=Math.floor(absolute%3600/60),remainder=absolute%60;
        return 'UTC'+(seconds<0?'-':'+')+hours+(minutes||remainder?':'+String(minutes).padStart(2,'0'):'')+(remainder?':'+String(remainder).padStart(2,'0'):'');
    }
    function details(now,timeZone,wiki,language){
        language=i18n.normalizeLanguage(language);
        try{
            var date=new Date(now===undefined?Date.now():now),formats=formatters(timeZone,language);
            if(!formats||!Number.isFinite(date.getTime()))throw new RangeError('Invalid clock');
            var offset=offsetAt(date,formats);if(!offset)throw new RangeError('Invalid offset');
            return {text:formats.clock.format(date)+' ('+offset+')',
                title:i18n.t(language,wiki?'Horário salvo em {date}':'Horário local em {date}',{date:formats.date.format(date)})+' ('+offset+') · '+timeZone,
                timestamp:date.toISOString()};
        }catch(_){return {text:i18n.t(language,'Horário indisponível'),title:i18n.t(language,'Horário indisponível'),timestamp:''};}
    }
    function text(now,timeZone,wiki,language){return details(now,timeZone,wiki,language).text;}
    function paint(node,now,timeZone,wiki,language){
        var value=details(now,timeZone,wiki,language);
        node.textContent=value.text;node.setAttribute('title',value.title);
        node.setAttribute('data-perfilwiki-clock-at',value.timestamp);
        node.setAttribute('data-perfilwiki-timezone',timeZone);
        return node;
    }
    function update(document,now,user,timeZone,language){
        if(!document||typeof document.getElementById!=='function'||typeof user!=='string'||!user)return 0;
        var seen=new Set(),updated=0;
        ['dan-pu-profile-header','dan-pu-ritmo','dan-pu-estatisticas'].forEach(function(id){
            var root=document.getElementById(id);
            if(!root||!root.getAttribute||root.getAttribute('data-perfilwiki-user')!==user||!root.querySelectorAll)return;
            Array.from(root.querySelectorAll('.dan-pu-local-time')).forEach(function(node){
                if(seen.has(node)||!node.getAttribute)return;
                for(var parent=node.parentNode;parent&&parent!==root;parent=parent.parentNode){
                    if(parent.getAttribute&&parent.getAttribute('data-perfilwiki-user')&&parent.getAttribute('data-perfilwiki-user')!==user)return;
                }
                var zone=node.getAttribute('data-perfilwiki-timezone');
                if(typeof timeZone!=='string'||zone!==timeZone)return;
                seen.add(node);paint(node,now,zone,false,language);updated+=1;
            });
        });
        return updated;
    }
    return Object.freeze({text:text,details:details,paint:paint,update:update});
}));

;

/* PerfilWiki. Verified public ptwiki user groups, without requests or DOM. CC BY-SA 4.0. */
(function (root, factory) {
    var api = factory(typeof module==='object'&&module.exports?require('./I18n.js'):root.PerfilWikiI18n);
    if (typeof module === 'object' && module.exports) { module.exports = api; }
    else { root.PerfilWikiUserGroups = api; }
}(typeof globalThis === 'object' ? globalThis : this, function (i18n) {
    'use strict';
    var LABELS = Object.freeze({user:'Usuário registrado',autoconfirmed:'Autoconfirmado',confirmed:'Confirmado',
        extendedconfirmed:'Autoconfirmado estendido',autoreviewer:'Autorrevisor',reviewer:'Revisor',rollbacker:'Reversor',
        eliminator:'Eliminador',sysop:'Administrador',bureaucrat:'Burocrata',checkuser:'Verificador de contas',
        oversight:'Supervisor',bot:'Robô','interface-admin':'Administrador de interface','interface-editor':'Editor de interface',
        'ipblock-exempt':'Isento de bloqueio de IP',import:'Importador',
        transwiki:'Importador transwiki'});
    var ORDER = ['extendedconfirmed','confirmed','autoconfirmed','autoreviewer','reviewer','rollbacker','eliminator',
        'sysop','bureaucrat','checkuser','oversight','interface-admin','interface-editor','ipblock-exempt','bot','import','transwiki'];
    function normalize(groups) {
        if (!Array.isArray(groups) || groups.length > 128 || Array.from(groups).some(function (group) {
            return typeof group !== 'string' || group !== '*' && !/^[a-z][a-z0-9_-]{0,63}$/.test(group);
        })) { throw new Error('Estatutos públicos inválidos.'); }
        return Array.from(new Set(groups)).sort();
    }
    function visible(groups) {
        var values = normalize(groups).filter(function (group) { return group !== '*' && group !== 'user'; });
        if (values.indexOf('extendedconfirmed') >= 0) {
            values = values.filter(function (group) { return group !== 'autoconfirmed' && group !== 'confirmed'; });
        }
        if (!values.length) { return ['user']; }
        return values.sort(function (a,b) {
            var first = ORDER.indexOf(a), second = ORDER.indexOf(b);
            if (first < 0) { first = ORDER.length; } if (second < 0) { second = ORDER.length; }
            return first - second || (a < b ? -1 : a > b ? 1 : 0);
        });
    }
    function labels(groups,language) { return visible(groups).map(function (group) { return Object.prototype.hasOwnProperty.call(LABELS,group) ? i18n.t(language,LABELS[group]) : group; }); }
    function fromProof(proof,user,now) {
        try {
            if (!proof || typeof proof !== 'object' || Array.isArray(proof) || proof.version !== 1 ||
                proof.user !== user || typeof user !== 'string' || !user || user !== user.trim() || user.length > 255 ||
                /[\x00-\x1f\x7f|<>\[\]{}#]/.test(user) || proof.project !== 'pt.wikipedia.org' ||
                Object.keys(proof).some(function (key) { return ['version','user','project','checkedAt','groups'].indexOf(key) < 0; }) ||
                typeof proof.checkedAt !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(proof.checkedAt)) { return null; }
            var checked = Date.parse(proof.checkedAt), at = new Date(now === undefined ? Date.now() : now).getTime();
            if (!Number.isFinite(checked) || !Number.isFinite(at) || checked > at ||
                new Date(checked).toISOString().replace('.000Z','Z') !== proof.checkedAt.replace('.000Z','Z')) { return null; }
            var groups = normalize(proof.groups);
            if (JSON.stringify(groups) !== JSON.stringify(proof.groups)) { return null; }
            return {version:1,user:user,project:'pt.wikipedia.org',checkedAt:proof.checkedAt,groups:groups};
        } catch (_) { return null; }
    }
    function text(proof,user,now,language) { var checked = fromProof(proof,user,now); return checked ? labels(checked.groups,language).join(' · ') : null; }
    return Object.freeze({normalize:normalize,visible:visible,labels:labels,fromProof:fromProof,text:text});
}));

;

/* PerfilWiki. Bounded data-only editing handoff and lossless managed-block replacement. CC BY-SA 4.0. */
(function(root,factory){var api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.PerfilWikiLiveEdit=api;}(typeof globalThis==='object'?globalThis:this,function(){
    'use strict';
    var ORIGIN='https://danrego.github.io',PATH='/PerfilWiki/INICIO.html',WIKI='https://pt.wikipedia.org';
    var PROTOCOL='perfilwiki-live-edit-v1',NONCE=/^[a-f0-9]{32}$/,MAX_BYTES=1048576,TTL=60000;
    var BEGIN='<!-- PERFILWIKI-PROFILE-BEGIN -->',END='<!-- PERFILWIKI-PROFILE-END -->';
    function bytes(value){var size=0;for(var i=0;i<value.length;i+=1){var c=value.charCodeAt(i);if(c<128)size+=1;else if(c<2048)size+=2;else if(c>=0xd800&&c<=0xdbff&&i+1<value.length&&value.charCodeAt(i+1)>=0xdc00&&value.charCodeAt(i+1)<=0xdfff){size+=4;i+=1;}else size+=3;}return size;}
    function record(value){return !!value&&Object.prototype.toString.call(value)==='[object Object]';}
    function keys(value,expected){return record(value)&&Object.keys(value).sort().join(',')===expected.slice().sort().join(',');}
    function safe(value,depth,parents,counter){
        if(depth>20||++counter.count>100000)throw new TypeError('Dados do painel inválidos.');
        if(value===null||typeof value==='boolean'||typeof value==='number'&&Number.isFinite(value))return;
        if(typeof value==='string'){if(value.length>MAX_BYTES)throw new TypeError('Dados do painel muito grandes.');return;}
        if(!Array.isArray(value)&&!record(value)||parents.indexOf(value)>=0)throw new TypeError('Dados do painel inválidos.');
        var names=Object.keys(value);if(names.length>10000||names.some(function(name){return ['__proto__','prototype','constructor'].indexOf(name)>=0;}))throw new TypeError('Dados do painel inválidos.');
        parents.push(value);names.forEach(function(name){safe(value[name],depth+1,parents,counter);});parents.pop();
    }
    function bounded(value){safe(value,0,[],{count:0});if(bytes(JSON.stringify(value))>MAX_BYTES)throw new TypeError('Dados do painel muito grandes.');return value;}
    function localOrigin(value){try{var url=new URL(value);return ['http:','https:'].indexOf(url.protocol)>=0&&['localhost','127.0.0.1','[::1]'].indexOf(url.hostname)>=0&&!url.username&&!url.password&&url.origin===value;}catch(_){return false;}}
    function installerUrl(nonce){if(!NONCE.test(nonce||''))throw new TypeError('Identificador inválido.');return ORIGIN+PATH+'?perfilwiki=handoff#perfilwiki-handoff='+nonce;}
    function nonceFromUrl(value){try{var url=new URL(value),allowed=url.origin===ORIGIN&&url.pathname===PATH||localOrigin(url.origin);if(!allowed||url.username||url.password||url.searchParams.getAll('perfilwiki').length!==1||url.searchParams.get('perfilwiki')!=='handoff')return null;var match=/^#perfilwiki-handoff=([a-f0-9]{32})$/.exec(url.hash);return match?match[1]:null;}catch(_){return null;}}
    function signal(type,nonce){if(['hello','ready','accepted'].indexOf(type)<0||!NONCE.test(nonce||''))throw new TypeError('Mensagem inválida.');return {protocol:PROTOCOL,type:type,nonce:nonce};}
    function isSignal(value,type,nonce){return keys(value,['protocol','type','nonce'])&&value.protocol===PROTOCOL&&value.type===type&&value.nonce===nonce&&NONCE.test(nonce||'');}
    function page(value,title){
        if(value===null)return null;
        if(!keys(value,['title','revisionId','content'])||value.title!==title||!Number.isSafeInteger(value.revisionId)||value.revisionId<=0||typeof value.content!=='string'||/[\x00-\x08\x0b\x0c\x0e-\x1f]/.test(value.content))throw new TypeError('A página pública recebida é inválida.');
        bounded(value);return {title:value.title,revisionId:value.revisionId,content:value.content};
    }
    function source(value,user,title){if(!keys(value,['origin','user','page'])||value.origin!==WIKI||value.user!==user)throw new TypeError('A conta recebida não corresponde ao painel.');return {origin:WIKI,user:user,page:page(value.page,title)};}
    function envelope(config,publicPage,nonce,now){
        if(!NONCE.test(nonce||'')||!Number.isFinite(now))throw new TypeError('Mensagem inválida.');
        return bounded({protocol:PROTOCOL,type:'settings',nonce:nonce,createdAt:now,config:config,page:publicPage});
    }
    function validateEnvelope(value,nonce,now){
        if(!keys(value,['protocol','type','nonce','createdAt','config','page'])||value.protocol!==PROTOCOL||value.type!=='settings'||value.nonce!==nonce||!NONCE.test(nonce||'')||!Number.isFinite(now)||!Number.isFinite(value.createdAt)||value.createdAt>now+5000||now-value.createdAt>TTL||!record(value.config))throw new TypeError('A transferência do painel expirou ou é inválida.');
        return bounded(value);
    }
    function activeWikitext(text){
        if(typeof text!=='string')throw new TypeError('Use o código completo da página.');
        var chunks=[],cursor=0,scan=0,start;
        function mask(from,to){chunks.push(text.slice(cursor,from),text.slice(from,to).replace(/[^\r\n]/g,' '));cursor=to;scan=to;}
        function tagEndAt(from){
            var quote='',end=from+1;
            for(;end<text.length;end+=1){var character=text.charAt(end);if(quote){if(character===quote)quote='';}else if(character==='"'||character==="'"){quote=character;}else if(character==='>')return end;else if(character==='<')ambiguous();}
            ambiguous();
        }
        function ambiguous(){throw new TypeError('Há trechos de código ou comentários incompletos. Confira a página antes de substituir o painel.');}
        while((start=text.indexOf('<',scan))>=0){
            if(text.slice(start,start+4)==='<!--'){
                if(text.slice(start,start+BEGIN.length)===BEGIN){scan=start+BEGIN.length;continue;}
                if(text.slice(start,start+END.length)===END){scan=start+END.length;continue;}
                var commentEnd=text.indexOf('-->',start+4);if(commentEnd<0)ambiguous();mask(start,commentEnd+3);continue;
            }
            var match=/^<\/?(nowiki|pre|source|syntaxhighlight)(?=[\s/>])/i.exec(text.slice(start,start+32));
            if(!match){
                if(/^<\/?[A-Za-z][A-Za-z0-9:_-]*(?=[\s/>])/.test(text.slice(start,start+128))){
                    var ordinaryEnd=tagEndAt(start)+1;
                    // Keep identifiers available for panel detection while
                    // hiding comment/transclusion delimiters inside attributes.
                    chunks.push(text.slice(cursor,start),text.slice(start,ordinaryEnd).replace(/[<>{}]/g,' '));cursor=ordinaryEnd;scan=ordinaryEnd;
                }else{scan=start+1;}
                continue;
            }
            if(text.charAt(start+1)==='/')ambiguous();
            var tagEnd=tagEndAt(start);
            if(/\/\s*$/.test(text.slice(start,tagEnd))){mask(start,tagEnd+1);continue;}
            var closing=new RegExp('</'+match[1]+'\\s*>','ig');closing.lastIndex=tagEnd+1;var close=closing.exec(text);if(!close)ambiguous();mask(start,close.index+close[0].length);
        }
        chunks.push(text.slice(cursor));return chunks.join('');
    }
    function profileRange(text){
        var start=text.indexOf(BEGIN),end=text.indexOf(END);
        if(start<0&&end<0)throw new TypeError('Esta página ainda não tem um bloco PerfilWiki delimitado. Substitua o painel manualmente, preservando seus outros textos e categorias.');
        if(start<0||end<start||text.indexOf(BEGIN,start+BEGIN.length)>=0||text.indexOf(END,end+END.length)>=0)throw new TypeError('Há marcas incompletas ou repetidas do PerfilWiki. Confira o texto antes de substituir o painel.');
        return {start:start,end:end+END.length};
    }
    function range(text){return profileRange(activeWikitext(text));}
    function managedBlock(text){var span=range(text);return text.slice(span.start,span.end);}
    function replaceProfile(original,replacement){var span=range(original),block=managedBlock(replacement);return original.slice(0,span.start)+block+original.slice(span.end);}
    function hasProfile(text){try{range(text);return true;}catch(_){return false;}}
    function containsPanel(text){try{var active=activeWikitext(text);return hasProfile(text)||/\bid\s*=\s*["'](?:dan-pu-ritmo|dan-pu-estatisticas)["']/i.test(active);}catch(_){return false;}}
    function relativeSource(text){
        if(typeof text!=='string'||containsPanel(text))return null;
        var active;try{active=activeWikitext(text);}catch(_){return null;}
        var matches=Array.from(active.matchAll(/^[ \t]*\{\{\/([^{}|\r\n]+)\}\}[ \t]*$/gm));
        if(matches.length!==1)return null;
        var label=matches[0][1].replace(/_/g,' ').trim().normalize('NFC');
        return label&&label.length<=255&&!/[:\/#<>\[\]{}|\x00-\x1f\x7f-\x9f]/.test(label)&&label.indexOf('..')<0&&label!=='.'?label:null;
    }
    return Object.freeze({installerOrigin:ORIGIN,installerPath:PATH,wikiOrigin:WIKI,protocol:PROTOCOL,limits:Object.freeze({bytes:MAX_BYTES,lifetimeMs:TTL}),bytes:bytes,bounded:bounded,localOrigin:localOrigin,installerUrl:installerUrl,nonceFromUrl:nonceFromUrl,signal:signal,isSignal:isSignal,page:page,source:source,envelope:envelope,validateEnvelope:validateEnvelope,managedBlock:managedBlock,replaceProfile:replaceProfile,hasProfile:hasProfile,containsPanel:containsPanel,relativeSource:relativeSource});
}));

;

/* PerfilWiki 1.1.1. Configuration and anonymous-source boundary. CC BY-SA 4.0. */
(function (root, factory) {
    var api = factory(typeof module === 'object' && module.exports ? require('./Appearance.js') : root.PerfilWikiAppearance,
        typeof module === 'object' && module.exports ? require('./ProfileText.js') : root.PerfilWikiProfileText,
        typeof module === 'object' && module.exports ? require('./ProfileFields.js') : root.PerfilWikiProfileFields);
    if (typeof module === 'object' && module.exports) { module.exports = api; }
    else { root.PerfilWikiConfiguration = api; }
}(typeof window !== 'undefined' ? window : this, function (appearance, profileTextApi, profileFields) {
    'use strict';
    var BLACKLIST = 'https://raw.githubusercontent.com/wikimedia/analytics-refinery/master/static_data/cassandra/disallowed_cassandra_articles/disallowed_cassandra_articles.tsv';
    function title(value) {
        return typeof value === 'string' && value.length > 0 && value.length <= 512 && !/[\x00-\x1f\x7f<>\[\]{}|#]/.test(value);
    }
    function displayName(value, user) {
        if (value === undefined) { return user; }
        if (typeof value !== 'string' || /[\x00-\x1f\x7f-\x9f<>\[\]{}|]/.test(value)) { throw new Error('Nome de exibição inválido.'); }
        var label = value.normalize('NFC').trim();
        if (Array.from(label).length > 100) { throw new Error('O nome de exibição deve ter até 100 caracteres.'); }
        return label || user;
    }
    function resolve(mw, win) {
        var input = win.PerfilWikiConfig || {};
        if (!input || typeof input !== 'object' || Array.isArray(input) || Object.keys(input).some(function (k) { return ['user','displayName','location','customFields','photo','coverImage','timeZone','stylesPage','documentationPage','appearance'].indexOf(k) < 0; })) { throw new Error('Opção de configuração desconhecida.'); }
        var user = input.user === undefined ? mw.config.get('wgUserName') : input.user;
        if (typeof user !== 'string') { throw new Error('Informe um nome de usuário.'); }
        user = user.replace(/_/g, ' ').trim().normalize('NFC');
        if (!title(user) || user.length > 255 || /[:/]/.test(user)) { throw new Error('Nome de usuário inválido.'); }
        var zone = input.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
        if (typeof zone !== 'string') { throw new Error('Fuso inválido.'); }
        new Intl.DateTimeFormat('pt-BR', {timeZone: zone}).format(new Date(0));
        var stylesPage = input.stylesPage || 'Usuário:Daniel G Rego/RitmoPU-estilos';
        var documentationPage = input.documentationPage || 'Usuário:Daniel G Rego/PerfilWiki';
        if (!title(stylesPage) || !title(documentationPage)) { throw new Error('Título de página inválido.'); }
        return {metrics: {user:user, project:'pt.wikipedia.org', timeZone:zone, activityRefreshMs:300000,
            fullRescanMs:2592000000, pageviewsRefreshMs:86400000, rankLimit:1000}, displayName:displayName(input.displayName,user),
            location:input.location === undefined ? '' : profileTextApi.normalize(input.location,120), customFields:profileFields.normalize(input.customFields),photo:profileTextApi.normalizePhoto(input.photo),coverImage:profileTextApi.normalizePhoto(input.coverImage),
            stylesPage:stylesPage, documentationPage:documentationPage, appearance:appearance.normalize(input.appearance)};
    }
    function requestAllowed(value) {
        try {
            var url = new URL(value);
            if (url.protocol !== 'https:' || url.username || url.password || url.port || url.hash) { return false; }
            if (url.href === BLACKLIST) { return true; }
            if (url.origin === 'https://pt.wikipedia.org' && /^\/api\/rest_v1\/feed\/featured\/\d{4}\/\d{2}\/\d{2}$/.test(url.pathname)) {
                var date = url.pathname.slice(-10).replace(/\//g,'-');
                return !url.search && date >= '2000-01-01' && new Date(date+'T00:00:00.000Z').toISOString().slice(0,10) === date;
            }
            if (url.pathname === '/w/api.php' && /(^|\.)(wikipedia|wikimedia|wikidata|wiktionary|wikibooks|wikinews|wikiquote|wikisource|wikiversity|wikivoyage|mediawiki|wikifunctions)\.org$/.test(url.hostname)) {
                return url.searchParams.getAll('action').length === 1 && url.searchParams.get('action') === 'query' &&
                    !url.searchParams.has('assert') && !url.searchParams.has('assertuser') &&
                    !url.searchParams.has('token') && !url.searchParams.has('csrftoken') &&
                    url.searchParams.getAll('meta').every(function (v) { return v.split('|').indexOf('tokens') < 0; });
            }
            if (url.origin === 'https://wikimedia.org') {
                return !url.search && (url.pathname.indexOf('/api/rest_v1/metrics/pageviews/per-article/pt.wikipedia.org/all-access/user/') === 0 ||
                    /^\/api\/rest_v1\/metrics\/pageviews\/top\/pt\.wikipedia\.org\/all-access\/\d{4}\/\d{2}\/(?:\d{2}|all-days)$/.test(url.pathname));
            }
            return url.origin === 'https://xtools.wmcloud.org' && /^\/api\/user\/pages_count\/[a-z0-9-]+\.wikipedia\.org\/[^/]+\/0\/noredirects\/all$/.test(url.pathname) && !url.search;
        } catch (_) { return false; }
    }
    return Object.freeze({resolve:resolve, requestAllowed:requestAllowed, validTitle:title,normalizePhoto:profileTextApi.normalizePhoto});
}));

;

/* PerfilWiki 1.0.0, pageview engine derived from RitmoPU 8.0.3. CC BY-SA 4.0.
 * Author: Daniel G Rego. Public GET data only; no authentication or wiki writes. */
(function (root, factory) {
    'use strict';
    var api = factory();
    if (typeof module === 'object' && module.exports) { module.exports = api; }
    if (root) { root.PerfilWikiPageviewsCore = api; }
}(typeof window !== 'undefined' ? window : null, function () {
    'use strict';

    var DAY = 86400000;
    var DEFAULT_CONFIG = Object.freeze({
        user: '',
        project: 'pt.wikipedia.org',
        timeZone: 'UTC',
        activityRefreshMs: 300000,
        fullRescanMs: 30 * DAY,
        pageviewsRefreshMs: DAY,
        rankLimit: 1000
    });
    var own = function (object, key) { return Object.prototype.hasOwnProperty.call(object, key); };
    var assertedFlag = function (object, key) {
        return !!object && own(object, key) && (object[key] === true || object[key] === 1 || object[key] === '');
    };
    var formatters = new Map();

    function fail(message, code) {
        var error = new Error(message);
        error.code = code || 'invalid-data';
        throw error;
    }

    function errorInfo(error) {
        return {
            code: error && error.code ? String(error.code) : 'request-failed',
            message: error && error.message ? String(error.message) : 'Request failed.'
        };
    }

    function nowDate(value) {
        var result = value === undefined ? new Date() : new Date(value);
        if (!Number.isFinite(result.getTime())) { fail('Invalid current time.'); }
        return result;
    }

    function normalizeConfig(input, expectedRankLimit) {
        var config = Object.assign({}, DEFAULT_CONFIG, input || {});
        if (input && own(input, 'timezone') && !own(input, 'timeZone')) { config.timeZone = input.timezone; }
        config.user = String(config.user || '').trim();
        if (!config.user) { fail('A Wikipedia username is required.'); }
        // This panel has an explicit Portuguese Wikipedia scope.
        if (config.project !== 'pt.wikipedia.org') { fail('Only pt.wikipedia.org is supported.'); }
        ['activityRefreshMs', 'fullRescanMs', 'pageviewsRefreshMs'].forEach(function (key) {
            if (!Number.isFinite(config[key]) || config[key] < 0) { fail('Invalid cache duration: ' + key); }
        });
        var requiredRankLimit = expectedRankLimit === 100 || expectedRankLimit === 250 ? expectedRankLimit : 1000;
        if (config.rankLimit !== requiredRankLimit) { fail('The visible exact ranking contains at most ' + requiredRankLimit + ' articles.'); }
        localDate(new Date(0), config.timeZone);
        return {
            user: config.user,
            project: config.project,
            timeZone: config.timeZone,
            activityRefreshMs: config.activityRefreshMs,
            fullRescanMs: config.fullRescanMs,
            pageviewsRefreshMs: config.pageviewsRefreshMs,
            rankLimit: requiredRankLimit
        };
    }

    function localDate(value, timeZone) {
        var date = nowDate(value);
        var zone = timeZone || DEFAULT_CONFIG.timeZone;
        var formatter = formatters.get(zone);
        if (!formatter) {
            formatter = new Intl.DateTimeFormat('en-US', {
                timeZone: zone, year: 'numeric', month: '2-digit', day: '2-digit'
            });
            formatters.set(zone, formatter);
        }
        var parts = formatter.formatToParts(date);
        var fields = {};
        parts.forEach(function (part) { fields[part.type] = part.value; });
        return fields.year + '-' + fields.month + '-' + fields.day;
    }

    function validDate(value) {
        if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) { return false; }
        var date = new Date(value + 'T00:00:00.000Z');
        return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
    }

    function addDate(value, amount) {
        if (!validDate(value) || !Number.isInteger(amount)) { fail('Invalid calendar date or day offset.'); }
        return new Date(new Date(value + 'T00:00:00.000Z').getTime() + amount * DAY).toISOString().slice(0, 10);
    }

    function validTimestamp(value) {
        return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/.test(value) &&
            Number.isFinite(new Date(value).getTime()) && validDate(value.slice(0, 10));
    }

    // Compact, lossless fields used by this panel: revision, page, namespace, title, UTC time, creation flag.
    function unpackEntry(entry) {
        if (Array.isArray(entry)) {
            return { revid: entry[0], pageid: entry[1], ns: entry[2], title: entry[3], timestamp: entry[4], isNew: entry[5] === 1 || entry[5] === true };
        }
        return {
            revid: entry && entry.revid,
            pageid: entry && entry.pageid,
            ns: entry && entry.ns,
            title: entry && entry.title,
            timestamp: entry && entry.timestamp,
            // formatversion=2 returns boolean flags, including new:false.
            // The empty string is the older API representation of an asserted flag.
            isNew: !!entry && (entry.isNew === true || entry.isNew === 1 || assertedFlag(entry, 'new'))
        };
    }

    function packEntry(raw) {
        var entry = unpackEntry(raw);
        if (!Number.isSafeInteger(entry.revid) || entry.revid <= 0 ||
            !Number.isSafeInteger(entry.pageid) || entry.pageid < 0 ||
            !Number.isInteger(entry.ns) || entry.ns < 0 ||
            typeof entry.title !== 'string' || !validTimestamp(entry.timestamp)) {
            fail('An edit has invalid revision, page, title, or time data.');
        }
        return [entry.revid, entry.pageid, entry.ns, entry.title,
            new Date(entry.timestamp).toISOString(), entry.isNew ? 1 : 0];
    }

    function compareEntries(left, right) {
        return right[4].localeCompare(left[4]) || right[0] - left[0];
    }

    function summarize(rawEntries, options) {
        options = options || {};
        var config = normalizeConfig(options.config || { timeZone: options.timeZone || options.timezone || DEFAULT_CONFIG.timeZone });
        var now = nowDate(options.now);
        var today = localDate(now, config.timeZone);
        var start = addDate(today, -29);
        var counts = Object.create(null);
        var entries = [];
        var seen = new Set();
        var excludedEdits = 0;
        var statisticsTitle = 'Usuário:' + config.user + '/PU/Estatísticas';
        (rawEntries || []).forEach(function (raw) {
            var entry = packEntry(raw);
            if (new Date(entry[4]).getTime() > now.getTime()) { fail('Contribution history contains a future edit.'); }
            if (!seen.has(entry[0])) {
                seen.add(entry[0]);
                // The pre-existing statistics updater must not maintain its own streak.
                if (entry[3] === statisticsTitle || entry[3] === 'User:' + config.user + '/PU/Estatísticas') {
                    excludedEdits += 1;
                    return;
                }
                entries.push(entry);
                var date = localDate(entry[4], config.timeZone);
                if (date > today) { fail('Contribution history contains a future local day.'); }
                counts[date] = (counts[date] || 0) + 1;
            }
        });
        entries.sort(compareEntries);
        var activeDates = Object.keys(counts).sort();
        var bestStreak = 0;
        var bestStart = null;
        var bestEnd = null;
        var run = 0;
        var runStart = null;
        var previousDate = null;
        activeDates.forEach(function (date) {
            if (previousDate !== null && addDate(previousDate, 1) === date) { run += 1; }
            else { run = 1; runStart = date; }
            // A tie uses the most recent completed run.
            if (run >= bestStreak) { bestStreak = run; bestStart = runStart; bestEnd = date; }
            previousDate = date;
        });
        var cursor = counts[today] ? today : addDate(today, -1);
        var streakEnd = counts[cursor] ? cursor : null;
        var currentStreak = 0;
        while (counts[cursor]) { currentStreak += 1; cursor = addDate(cursor, -1); }
        var articles = new Set();
        var edits30 = 0;
        var activeDays30 = 0;
        activeDates.forEach(function (date) {
            if (date >= start && date <= today) { activeDays30 += 1; edits30 += counts[date]; }
        });
        entries.forEach(function (entry) {
            var date = localDate(entry[4], config.timeZone);
            if (entry[2] === 0 && entry[1] > 0 && date >= start && date <= today) { articles.add(entry[1]); }
        });
        var weekday = new Date(today + 'T00:00:00.000Z').getUTCDay();
        var currentMonday = addDate(today, -((weekday + 6) % 7));
        var gridStart = addDate(currentMonday, -77);
        var weeks = [];
        for (var w = 0; w < 12; w += 1) {
            var weekStart = addDate(gridStart, w * 7);
            var days = [];
            for (var d = 0; d < 7; d += 1) {
                var day = addDate(weekStart, d);
                days.push({ date: day, count: counts[day] || 0, future: day > today, today: day === today });
            }
            weeks.push({ start: weekStart, days: days });
        }
        return {
            asOf: now.toISOString(), timeZone: config.timeZone, today: today,
            start: gridStart, end: addDate(currentMonday, 6),
            activityPeriod: { start: start, end: today, days: 30, basis: 'local', timeZone: config.timeZone },
            currentStreak: currentStreak, bestStreak: bestStreak,
            currentStreakStart: currentStreak ? addDate(cursor, 1) : null,
            currentStreakEnd: streakEnd,
            pendingToday: currentStreak > 0 && !counts[today],
            bestStreakStart: bestStart, bestStreakEnd: bestEnd,
            todayEdits: counts[today] || 0, activeDays30: activeDays30, edits30: edits30,
            articles30: articles.size, distinctArticles30: articles.size,
            totalEdits: entries.length, totalActiveDays: activeDates.length,
            historyEdits: seen.size, excludedEdits: excludedEdits,
            averageEditsPerDay30: edits30 / 30,
            counts: counts, weeks: weeks, gridStart: gridStart,
            gridEnd: addDate(currentMonday, 6),
            firstEditAt: entries.length ? entries[entries.length - 1][4] : null,
            lastEditAt: entries.length ? entries[0][4] : null
        };
    }

    function identity(config) { return { user: config.user, project: config.project }; }
    function sameIdentity(section, config) {
        return !!section && !!section.identity && section.identity.user === config.user && section.identity.project === config.project;
    }
    function sectionPrevious(previous, name, config) {
        var section = previous && previous[name] ? previous[name] : previous;
        return sameIdentity(section, config) && (name !== 'pageviews' || (section.rankLimit === config.rankLimit && section.metricVersion === METRIC_VERSION && section.totalModel === TOTAL_MODEL)) ? section : null;
    }

    function apiUrl(config, parameters) {
        var url = new URL('https://' + config.project + '/w/api.php');
        var params = Object.assign({ action: 'query', format: 'json', formatversion: 2, origin: '*', maxlag: 5 }, parameters);
        Object.keys(params).forEach(function (key) {
            if (params[key] !== undefined && params[key] !== null) { url.searchParams.set(key, String(params[key])); }
        });
        return url.toString();
    }

    function checkedResponse(response) {
        if (!response || typeof response !== 'object' || Array.isArray(response)) { fail('The service returned an invalid response.'); }
        if (response.error) { fail('The service reported an error.', response.error.code || 'api-error'); }
        if (response.warnings && Object.keys(response.warnings).length) { fail('The service returned a warning; the response is incomplete.', 'api-warning'); }
        return response;
    }

    function requireRequest(options) {
        if (!options || typeof options.requestJson !== 'function') { fail('requestJson(url) is required.'); }
        return options.requestJson;
    }

    async function collectActivity(options) {
        options = options || {};
        var requestJson = requireRequest(options);
        var config = normalizeConfig(options.config);
        var now = nowDate(options.now);
        var capturedAt = now.toISOString();
        var previous = sectionPrevious(options.previous, 'activity', config);
        var fullScan = !previous || !previous.complete || !validTimestamp(previous.fullScanAt) ||
            now.getTime() - new Date(previous.fullScanAt).getTime() >= config.fullRescanMs;
        if (previous && !fullScan && validTimestamp(previous.capturedAt) &&
            now.getTime() >= new Date(previous.capturedAt).getTime() &&
            now.getTime() - new Date(previous.capturedAt).getTime() < config.activityRefreshMs) {
            return Object.assign({}, previous, {
                summary: summarize(previous.entries, { config: config, now: now }), cacheHit: true,
                stale: false, error: null
            });
        }
        try {
            var baseEntries = previous ? previous.entries.map(packEntry).sort(compareEntries) : [];
            var lowerBound = !fullScan && baseEntries.length ?
                new Date(new Date(baseEntries[0][4]).getTime() - DAY).toISOString() : null;
            var parameters = {
                list: 'usercontribs', ucuser: config.user, uclimit: 500,
                ucprop: 'ids|title|timestamp|flags', ucdir: 'older', ucstart: capturedAt
            };
            if (lowerBound) { parameters.ucend = lowerBound; }
            var fetched = new Map();
            var continuation = {};
            var seenContinuations = new Set();
            var pagesFetched = 0;
            while (true) {
                var response = checkedResponse(await requestJson(apiUrl(config, Object.assign({}, parameters, continuation))));
                if (!response.query || !Array.isArray(response.query.usercontribs)) { fail('Contribution history is missing from the response.'); }
                var added = 0;
                response.query.usercontribs.forEach(function (raw) {
                    var entry = packEntry(raw);
                    var time = new Date(entry[4]).getTime();
                    if (time > now.getTime() || (lowerBound && time < new Date(lowerBound).getTime())) {
                        fail('Contribution history falls outside the requested time bounds.');
                    }
                    if (!fetched.has(entry[0])) { fetched.set(entry[0], entry); added += 1; }
                    else if (JSON.stringify(fetched.get(entry[0])) !== JSON.stringify(entry)) { fail('A revision was returned with conflicting data.'); }
                });
                pagesFetched += 1;
                if (!response.continue) {
                    if (!assertedFlag(response, 'batchcomplete')) { fail('Contribution history has no completion marker.', 'incomplete-history'); }
                    break;
                }
                if (!response.continue || typeof response.continue !== 'object' ||
                    typeof response.continue.uccontinue !== 'string' || !response.continue.uccontinue || !added) {
                    fail('Contribution pagination made no progress.', 'pagination-no-progress');
                }
                var token = response.continue.uccontinue;
                if (seenContinuations.has(token)) { fail('Contribution pagination repeated a continuation.', 'pagination-duplicate'); }
                seenContinuations.add(token);
                continuation = { uccontinue: token };
                if (own(response.continue, 'continue')) {
                    if (typeof response.continue.continue !== 'string') { fail('Invalid continuation data.'); }
                    continuation.continue = response.continue.continue;
                }
            }
            var merged = new Map();
            if (!fullScan && lowerBound) {
                baseEntries.forEach(function (entry) {
                    if (entry[4] < lowerBound) { merged.set(entry[0], entry); }
                });
            }
            fetched.forEach(function (entry, revid) { merged.set(revid, entry); });
            var entries = Array.from(merged.values()).sort(compareEntries);
            return {
                identity: identity(config), entries: entries, complete: true,
                capturedAt: capturedAt, lastAttemptAt: capturedAt,
                fullScanAt: fullScan ? capturedAt : previous.fullScanAt,
                scanMode: fullScan ? 'full' : 'incremental', pagesFetched: pagesFetched,
                summary: summarize(entries, { config: config, now: now }),
                cacheHit: false, stale: false, error: null
            };
        } catch (error) {
            if (previous && previous.complete) {
                return Object.assign({}, previous, {
                    summary: summarize(previous.entries, { config: config, now: now }),
                    lastAttemptAt: capturedAt, cacheHit: false, stale: true, error: errorInfo(error)
                });
            }
            return {
                identity: identity(config), entries: [], complete: false, capturedAt: null,
                lastAttemptAt: capturedAt, fullScanAt: null, scanMode: 'full', pagesFetched: 0,
                summary: null, cacheHit: false, stale: true, error: errorInfo(error)
            };
        }
    }

    function viewPeriod(now) {
        // A complete UTC day ends at midnight. Late/missing AQS data remains unavailable.
        var end = addDate(now.toISOString().slice(0, 10), -1);
        return { start: addDate(end, -29), end: end, days: 30, basis: 'UTC' };
    }

    function articleCandidates(entries) {
        var byPage = new Map();
        entries.map(packEntry).sort(compareEntries).forEach(function (entry) {
            if (entry[2] !== 0 || entry[1] <= 0) { return; }
            if (!byPage.has(entry[1])) {
                byPage.set(entry[1], { pageid: entry[1], title: entry[3], firstEditAt: entry[4], lastEditAt: entry[4], revid: entry[0], creationDate: null });
            }
            var known = byPage.get(entry[1]);
            if (entry[4] < known.firstEditAt) { known.firstEditAt = entry[4]; }
            if (entry[5] === 1) {
                var candidate = byPage.get(entry[1]);
                var date = entry[4].slice(0, 10);
                if (!candidate.creationDate || date < candidate.creationDate) { candidate.creationDate = date; }
            }
        });
        return Array.from(byPage.values()).sort(function (a, b) {
            return b.lastEditAt.localeCompare(a.lastEditAt) || b.revid - a.revid;
        });
    }

    function viewUrl(config, title, period) {
        var article = encodeURIComponent(title.replace(/ /g, '_'));
        var stamp = function (date) { return date.replace(/-/g, '') + '00'; };
        return 'https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/' +
            config.project + '/all-access/user/' + article + '/daily/' + stamp(period.start) + '/' + stamp(period.end);
    }

    function blankRow(article) {
        return {
            pageid: article.pageid, title: article.title, lastEditAt: article.lastEditAt,
            creationDate: article.creationDate || null,
            creationEvidence: article.creationEvidence || (article.creationDate ? { type: 'user-new-flag' } : null),
            views: null, status: 'unavailable', daily: []
        };
    }

    async function firstRevisionCreation(article, requestJson, config) {
        var response = checkedResponse(await requestJson(apiUrl(config, {
            prop: 'revisions', pageids: article.pageid, rvprop: 'ids|timestamp', rvdir: 'newer', rvlimit: 1
        })));
        // rvlimit=1 deliberately does not exhaust the revision list. Its continuation is expected.
        if (response.continue && (typeof response.continue !== 'object' ||
            typeof response.continue.rvcontinue !== 'string' || !response.continue.rvcontinue ||
            Object.keys(response.continue).some(function (key) { return key !== 'continue' && key !== 'rvcontinue'; }))) {
            fail('The first-revision response has invalid continuation data.');
        }
        if (!response.query || !Array.isArray(response.query.pages) || response.query.pages.length !== 1) {
            fail('The first-revision response has no single requested page.');
        }
        var page = response.query.pages[0];
        if (!page || page.pageid !== article.pageid || page.ns !== 0 || page.title !== article.title ||
            assertedFlag(page, 'missing') || assertedFlag(page, 'invalid') || assertedFlag(page, 'redirect') ||
            !Array.isArray(page.revisions) || page.revisions.length !== 1) {
            fail('The first-revision response has invalid page metadata.');
        }
        var revision = page.revisions[0];
        if (!revision || !Number.isSafeInteger(revision.revid) || revision.revid <= 0 ||
            revision.parentid !== 0 || !validTimestamp(revision.timestamp) ||
            new Date(revision.timestamp).getTime() > new Date(article.lastEditAt).getTime()) {
            fail('The first visible revision does not verify the page creation date.', 'creation-unverified');
        }
        var timestamp = new Date(revision.timestamp).toISOString();
        return {
            creationDate: timestamp.slice(0, 10),
            creationEvidence: { type: 'first-revision', revid: revision.revid, parentid: 0, timestamp: timestamp }
        };
    }

    function validatedViewRow(article, period, response, config) {
        checkedResponse(response);
        if (!Array.isArray(response.items)) { fail('Daily article views are missing.'); }
        var daily = new Map();
        response.items.forEach(function (item) {
            if (!item || typeof item.timestamp !== 'string' || !/^\d{8}00$/.test(item.timestamp) ||
                !Number.isSafeInteger(item.views) || item.views < 0 || item.agent !== 'user' ||
                item.access !== 'all-access' || item.granularity !== 'daily' ||
                typeof item.project !== 'string' || item.project.replace(/\.org$/, '') !== config.project.replace(/\.org$/, '') ||
                typeof item.article !== 'string' || item.article.replace(/ /g, '_') !== article.title.replace(/ /g, '_')) {
                fail('An article view item has invalid metadata or a view count.');
            }
            var date = item.timestamp.slice(0, 4) + '-' + item.timestamp.slice(4, 6) + '-' + item.timestamp.slice(6, 8);
            if (!validDate(date) || date < period.start || date > period.end || daily.has(date)) {
                fail('Article views contain duplicate dates or dates outside the requested period.');
            }
            daily.set(date, item.views);
        });
        var rows = [];
        var views = 0;
        for (var offset = 0; offset < 30; offset += 1) {
            var date = addDate(period.start, offset);
            var count = daily.get(date);
            if (count === undefined) {
                if (article.creationDate && date < article.creationDate) { count = 0; }
                else { fail('Article views are missing at least one day.', 'missing-interval'); }
            }
            if (article.creationDate && date < article.creationDate && count !== 0) {
                fail('Article views precede the known page creation date.');
            }
            views += count;
            if (!Number.isSafeInteger(views)) { fail('The article view total is outside the safe integer range.'); }
            rows.push({ date: date, views: count });
        }
        return Object.assign(blankRow(article), { views: views, status: 'available', daily: rows });
    }

    function zeroBeforeCreation(article, period) {
        var daily = [];
        for (var offset = 0; offset < 30; offset += 1) { daily.push({ date: addDate(period.start, offset), views: 0 }); }
        return Object.assign(blankRow(article), { views: 0, status: 'verified-zero', daily: daily });
    }

    function sortedViewRows(rows) {
        return rows.slice().sort(function (a, b) {
            if (a.views === null && b.views !== null) { return 1; }
            if (a.views !== null && b.views === null) { return -1; }
            if (a.views !== null && b.views !== null && a.views !== b.views) { return b.views - a.views; }
            return b.lastEditAt.localeCompare(a.lastEditAt) || a.pageid - b.pageid;
        });
    }

    function normalizedTitle(title) { return title.replace(/ /g, '_'); }

    // Verified against the public refinery blacklist on 2026-10-13. No PT-specific
    // entries existed. '-' is excluded separately by the daily-top loader.
    var TOP_BOUND_EXCLUDED_TITLES = Object.freeze(['-']);
    var TOP_BOUND_SOURCE = 'https://raw.githubusercontent.com/wikimedia/analytics-refinery/master/hql/cassandra/daily/load_cassandra_pageview_top_articles_daily.hql';
    var TOP_BLACKLIST_URL = 'https://raw.githubusercontent.com/wikimedia/analytics-refinery/master/static_data/cassandra/disallowed_cassandra_articles/disallowed_cassandra_articles.tsv';

    function universeFingerprint(candidates) {
        return candidates.slice().sort(function (a, b) { return a.pageid - b.pageid; }).map(function (article) { return article.pageid + '@' + article.firstEditAt; }).join(',');
    }

    function clone(value) { return JSON.parse(JSON.stringify(value)); }

    function compactRow(row) {
        return Object.assign({}, row, { daily: row.daily.map(function (item) { return typeof item === 'number' ? item : item.views; }) });
    }

    function expandedRow(row, period) {
        return Object.assign({}, row, { daily: row.daily.map(function (count, index) { return { date: addDate(period.start, index), views: count }; }) });
    }

    function topUrl(config, date) {
        return 'https://wikimedia.org/api/rest_v1/metrics/pageviews/top/' + config.project +
            '/all-access/' + date.slice(0, 4) + '/' + date.slice(5, 7) + '/' + date.slice(8, 10);
    }

    function validatedTopDay(response, date, cohort, config) {
        checkedResponse(response);
        if (!Array.isArray(response.items) || response.items.length !== 1) { fail('The daily top feed has no single requested day.'); }
        var item = response.items[0];
        if (!item || typeof item.project !== 'string' || item.project.replace(/\.org$/, '') !== config.project.replace(/\.org$/, '') ||
            item.access !== 'all-access' || (own(item, 'agent') && item.agent !== 'user') ||
            String(item.year) !== date.slice(0, 4) || String(item.month).padStart(2, '0') !== date.slice(5, 7) ||
            String(item.day).padStart(2, '0') !== date.slice(8, 10) || !Array.isArray(item.articles) || !item.articles.length || item.articles.length > 1000 || item.articles[0].rank !== 1) {
            fail('The daily top feed has incorrect project, date, access, or agent metadata.');
        }
        var titles = new Set();
        var counts = new Map();
        var previousViews = Infinity;
        var previousRank = 0;
        item.articles.forEach(function (article, index) {
            if (!article || typeof article.article !== 'string' || !article.article ||
                !Number.isSafeInteger(article.views) || article.views <= 0 ||
                !Number.isInteger(article.rank) || article.rank < 1 || article.rank > 1000 ||
                article.views > previousViews || article.rank < previousRank ||
                article.rank !== (article.views === previousViews ? previousRank : index + 1)) {
                fail('The daily top feed is not a valid descending ranking.');
            }
            var title = normalizedTitle(article.article);
            if (titles.has(title)) { fail('The daily top feed repeats an article.'); }
            titles.add(title);
            counts.set(title, article.views);
            previousViews = article.views;
            previousRank = article.rank;
        });
        // Official SQL excludes the entire tie group crossing rank 1000. Its
        // output can contain fewer than 1000 rows; absent ordinary titles still
        // cannot exceed the minimum returned value. The agent filter is 'user'.
        var known = {};
        cohort.forEach(function (article) {
            var views = counts.get(normalizedTitle(article.title));
            if (views !== undefined) { known[article.pageid] = views; }
        });
        return {
            date: date, status: 'available', cutoff: previousViews, known: known,
            coverage: { articleCount: item.articles.length, minRank: item.articles[0].rank,
                maxRank: previousRank, source: 'AQS-daily-top-user', agent: 'user', access: 'all-access',
                project: config.project, sourceDefinition: TOP_BOUND_SOURCE }, error: null
        };
    }

    var PERIOD_IDS = Object.freeze(['30d', '90d', '12m', 'since']);
    var METRIC_VERSION = 'after-first-edit-v1';
    var TOTAL_MODEL = 'all-periods-all-eligible-v1';
    function grandForModel(model, id) { return model === TOTAL_MODEL || (model === 'since-all-eligible-v1' && id === 'since'); }
    var COVERAGE_FLOOR = '2015-07-01';

    function addMonthsClamped(date, amount) {
        if (!validDate(date) || !Number.isInteger(amount)) { fail('Invalid month offset.'); }
        var original = new Date(date + 'T00:00:00Z');
        var target = new Date(Date.UTC(original.getUTCFullYear(), original.getUTCMonth() + amount, 1));
        var lastDay = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate();
        target.setUTCDate(Math.min(original.getUTCDate(), lastDay));
        return target.toISOString().slice(0, 10);
    }

    function periodsFor(value) {
        var today = nowDate(value).toISOString().slice(0, 10);
        var end = addDate(today, -1);
        var annualStart = addMonthsClamped(today, -12);
        return {
            '30d': { start: addDate(end, -29), end: end, days: 30, basis: 'UTC' },
            '90d': { start: addDate(end, -89), end: end, days: 90, basis: 'UTC' },
            '12m': { start: annualStart, end: end, days: Math.round((Date.parse(end) - Date.parse(annualStart)) / DAY) + 1, basis: 'UTC' },
            'since': { start: COVERAGE_FLOOR, end: end, days: Math.round((Date.parse(end) - Date.parse(COVERAGE_FLOOR)) / DAY) + 1, basis: 'UTC' }
        };
    }

    function countStart(article) {
        if (!validTimestamp(article.firstEditAt)) { fail('The first public edit timestamp is missing.'); }
        var next = addDate(article.firstEditAt.slice(0, 10), 1);
        return next < COVERAGE_FLOOR ? COVERAGE_FLOOR : next;
    }

    function effectivePeriod(article, period) {
        var start = countStart(article);
        if (period.start > start) { start = period.start; }
        return { start: start, end: period.end, days: Math.max(0, Math.round((Date.parse(period.end) - Date.parse(start)) / DAY) + 1), basis: 'UTC' };
    }

    function sourceForArticles(periods, articles) {
        var start = periods['12m'].start;
        articles.forEach(function (article) { var first = countStart(article); if (first < start) { start = first; } });
        return { start: start, end: periods['12m'].end, days: Math.round((Date.parse(periods['12m'].end) - Date.parse(start)) / DAY) + 1, basis: 'UTC' };
    }

    // Streaming scans keep the history-derived interval fixed while metadata
    // excludes pages. Older caches retain their original eligible-cohort rule.
    function sourceForState(periods, state) {
        return sourceForArticles(periods, state.sourceBasis === 'history-candidates-v1' || !state.metadata.complete ? state.candidates : state.metadata.cohort);
    }

    function sourceOf(periods) { return periods.sourcePeriod || periods['12m']; }

    var ZERO_DOCUMENTATION = 'https://doc.wikimedia.org/generated-data-platform/aqs/analytics-api/documentation/troubleshooting.html';
    function expectedControlTitles(source) { return source.start < '2022-11-30' ? ['China', 'Portugal'] : ['China', 'ChatGPT']; }

    function validAvailabilityProof(proof, source, config, captureAt) {
        if (!proof || proof.complete !== true || proof.kind !== 'aqs-documented-omitted-zero' ||
            proof.documentation !== ZERO_DOCUMENTATION || proof.project !== config.project ||
            JSON.stringify(proof.sourcePeriod) !== JSON.stringify(source) || !validTimestamp(proof.capturedAt) ||
            proof.capturedAt.slice(0, 10) <= source.end || Date.parse(proof.capturedAt) > Date.parse(captureAt) ||
            !Array.isArray(proof.controls) || proof.controls.length !== 2) { return false; }
        var titles = new Set();
        return proof.controls.every(function (control) {
            if (!control || expectedControlTitles(source).indexOf(control.title) < 0 || titles.has(control.title) ||
                control.requestUrl !== viewUrl(config, control.title, source) || control.project !== config.project ||
                control.agent !== 'user' || control.access !== 'all-access' || control.granularity !== 'daily' ||
                !validTimestamp(control.capturedAt) || control.capturedAt.slice(0, 10) <= source.end || Date.parse(control.capturedAt) > Date.parse(proof.capturedAt) ||
                !Array.isArray(control.daily) || control.daily.length !== source.days) { return false; }
            titles.add(control.title);
            return control.daily.every(function (day, index) {
                return day && day.date === addDate(source.start, index) && Number.isSafeInteger(day.views) && day.views >= 0;
            });
        }) && titles.size === 2;
    }

    function availabilityControl(title, periods, response, config, capturedAt) {
        var article = { pageid: 1, title: title, firstEditAt: '2015-06-30T00:00:00.000Z', lastEditAt: capturedAt };
        var series = validatedSeries(article, periods, response, config, capturedAt);
        if (series.missing.length || series.reportedDays !== sourceOf(periods).days) { fail('The availability control lacks explicit dates.', 'availability-unverified'); }
        var counts = new Map(response.items.map(function (item) {
            return [item.timestamp.slice(0, 4) + '-' + item.timestamp.slice(4, 6) + '-' + item.timestamp.slice(6, 8), item.views];
        }));
        return { title: title, requestUrl: viewUrl(config, title, sourceOf(periods)), capturedAt: capturedAt,
            project: config.project, agent: 'user', access: 'all-access', granularity: 'daily',
            daily: Array.from({ length: sourceOf(periods).days }, function (_, index) {
                var date = addDate(sourceOf(periods).start, index); return { date: date, views: counts.get(date) };
            }) };
    }

    function normalizedProblemPath(value) {
        if (typeof value !== 'string') { return null; }
        var path = value;
        if (/^https:\/\//.test(path)) {
            try {
                var parsed = new URL(path);
                if (parsed.search || parsed.hash || ['wikimedia.org', 'analytics.wikimedia.org'].indexOf(parsed.hostname) < 0) { return null; }
                path = parsed.pathname;
                if (parsed.hostname === 'analytics.wikimedia.org' && path.indexOf('/v1/pageviews/') === 0) { path = '/analytics.wikimedia.org' + path; }
            } catch (_) { return null; }
        }
        var match = path.match(/^\/(?:api\/rest_v1\/metrics|metrics|analytics\.wikimedia\.org\/v1)\/pageviews\/per-article\/(.+)$/);
        if (!match) { return null; }
        try { return decodeURIComponent(match[1]); } catch (_) { return null; }
    }

    function documentedEmptyError(error, url) {
        var problem = error && error.problem;
        var knownType = !!problem && (['https://mediawiki.org/wiki/HyperSwitch/errors/not_found', 'https://restbase.org/errors/not_found'].indexOf(problem.type) >= 0 ||
            (problem.type === 'about:blank' && problem.status === 404 && problem.title === 'Not Found'));
        return !!error && (own(error, 'status') ? error.status === 404 : error.code === 404) && error.requestUrl === url &&
            knownType &&
            problem.method === 'get' && normalizedProblemPath(problem.uri) !== null && normalizedProblemPath(problem.uri) === normalizedProblemPath(url);
    }

    function refreshSeriesStats(series, periods, article) {
        var source = sourceOf(periods);
        series.firstEditAt = article.firstEditAt;
        series.countStartDate = countStart(article);
        series.creationDate = article.creationDate || null;
        series.creationEvidence = article.creationEvidence || (article.creationDate ? { type: 'user-new-flag' } : null);
        if (article.creationDate && series.firstNonZeroDate && series.firstNonZeroDate < article.creationDate) { series.titleHistoryBeforePageCreation = true; }
        else { delete series.titleHistoryBeforePageCreation; }
        series.missing = series.missing.filter(function (index) { return addDate(source.start, index) >= series.countStartDate; });
        PERIOD_IDS.forEach(function (id) {
            var period = effectivePeriod(article, periods[id]);
            var missing = series.missing.filter(function (index) { var date = addDate(source.start, index); return date >= period.start && date <= period.end; }).length;
            series.covered[id] = period.days - missing;
            series.totals[id] = missing ? null : series.partialSums[id];
        });
        series.status = series.missing.length ? (series.validated ? 'partial' : 'unavailable') : 'available';
        return series;
    }

    function emptySeries(article, periods, capturedAt, error) {
        var source = sourceOf(periods);
        return refreshSeriesStats({ pageid: article.pageid, title: article.title,
            lastEditAt: article.lastEditAt, sourcePeriod: source, capturedAt: capturedAt,
            totals: {}, partialSums: { '30d': 0, '90d': 0, '12m': 0, 'since': 0 }, covered: {},
            missing: Array.from({ length: source.days }, function (_, index) { return index; }),
            firstNonZeroDate: null, validated: false, creationChecked: !!article.creationDate,
            error: error || null }, periods, article);
    }

    function validatedSeries(article, periods, response, config, capturedAt, availabilityProof) {
        checkedResponse(response);
        if (!Array.isArray(response.items)) { fail('The annual daily series is missing.'); }
        var source = sourceOf(periods);
        var daily = new Map();
        var firstNonZeroDate = null;
        response.items.forEach(function (item) {
            if (!item || typeof item.timestamp !== 'string' || !/^\d{8}00$/.test(item.timestamp) ||
                !Number.isSafeInteger(item.views) || item.views < 0 || item.agent !== 'user' || item.access !== 'all-access' ||
                item.granularity !== 'daily' || typeof item.project !== 'string' || item.project.replace(/\.org$/, '') !== config.project.replace(/\.org$/, '') ||
                typeof item.article !== 'string' || normalizedTitle(item.article) !== normalizedTitle(article.title)) {
                fail('An annual view item has invalid metadata or views.');
            }
            var date = item.timestamp.slice(0, 4) + '-' + item.timestamp.slice(4, 6) + '-' + item.timestamp.slice(6, 8);
            if (!validDate(date) || date < source.start || date > source.end || daily.has(date)) { fail('The annual series contains duplicate or out-of-range dates.'); }
            if (item.views && (!firstNonZeroDate || date < firstNonZeroDate)) { firstNonZeroDate = date; }
            daily.set(date, item.views);
        });
        var series = emptySeries(article, periods, capturedAt);
        series.validated = true;
        series.reportedDays = daily.size;
        var documentedZeros = validAvailabilityProof(availabilityProof, source, config, capturedAt);
        series.missing = [];
        series.firstNonZeroDate = firstNonZeroDate;
        for (var index = 0; index < source.days; index += 1) {
            var date = addDate(source.start, index);
            if (!daily.has(date)) {
                if (documentedZeros) { series.zeroBasis = 'aqs-documented-omitted-zero'; series.availabilityProofAt = availabilityProof.capturedAt; }
                else { series.missing.push(index); }
                continue;
            }
            var views = daily.get(date);
            PERIOD_IDS.forEach(function (id) {
                if (date >= effectivePeriod(article, periods[id]).start && date <= periods[id].end) {
                    series.partialSums[id] += views;
                    if (!Number.isSafeInteger(series.partialSums[id])) { fail('A view total exceeds the safe integer range.'); }
                }
            });
        }
        return refreshSeriesStats(series, periods, article);
    }

    function periodBounds(state, id) {
        var period = state.periods[id].period;
        var excluded = new Set(state.boundExcludedTitles);
        return state.metadata.cohort.map(function (article) {
            var series = state.series[article.pageid];
            var aggregate = state.aggregateTotals[article.pageid] && state.aggregateTotals[article.pageid][id];
            if (aggregate) { return { article: article, exact: aggregate.total, lower: aggregate.total, upper: aggregate.total, missingDates: [] }; }
            if (!series) { return { article: article, exact: null, lower: 0, upper: null, missingDates: [] }; }
            if (series.totals[id] !== null) {
                return { article: article, exact: series.totals[id], lower: series.totals[id], upper: series.totals[id], missingDates: [] };
            }
            var lower = series.partialSums[id];
            var upper = lower;
            var bounded = true;
            var dates = [];
            series.missing.forEach(function (index) {
                var date = addDate(series.sourcePeriod.start, index);
                if (date < countStart(article) || date < period.start || date > period.end) { return; }
                dates.push(date);
                var day = state.topDays[date];
                if (excluded.has(normalizedTitle(article.title)) || !state.blacklist.complete || !day || day.status !== 'available') { bounded = false; return; }
                if (own(day.known, article.pageid)) { lower += day.known[article.pageid]; upper += day.known[article.pageid]; }
                else { upper += day.cutoff; }
            });
            if (!Number.isSafeInteger(lower) || !Number.isSafeInteger(upper)) { fail('A period bound exceeds the safe integer range.'); }
            return { article: article, exact: null, lower: lower, upper: bounded ? upper : null, missingDates: dates };
        });
    }

    function rowForPeriod(article, series, id, state) {
        var aggregate = state.aggregateTotals[article.pageid] && state.aggregateTotals[article.pageid][id];
        return { pageid: article.pageid, title: article.title, lastEditAt: article.lastEditAt,
            firstEditAt: article.firstEditAt, countFromDate: effectivePeriod(article, state.periods[id].period).start,
            coverageTruncated: id === 'since' && addDate(article.firstEditAt.slice(0, 10), 1) < COVERAGE_FLOOR,
            creationDate: series.creationDate, creationEvidence: series.creationEvidence,
            views: aggregate ? aggregate.total : series.totals[id], status: 'available', sourcePeriod: aggregate ? aggregate.period : series.sourcePeriod,
            sourceGranularity: aggregate ? 'monthly' : 'daily',
            coveredDays: aggregate ? effectivePeriod(article, state.periods[id].period).days : series.covered[id], dailyCoveredDays: series.covered[id], capturedAt: aggregate ? aggregate.capturedAt : series.capturedAt };
    }

    function monthSlices(period) {
        var slices = [];
        var month = period.start.slice(0, 7) + '-01';
        while (month <= period.end) {
            var next = addMonthsClamped(month, 1);
            slices.push({ month: month.slice(0, 7), start: month < period.start ? period.start : month,
                end: addDate(next, -1) > period.end ? period.end : addDate(next, -1) });
            month = next;
        }
        return slices;
    }

    function monthlyUrl(config, article, period) {
        return viewUrl(config, article.title, period).replace('/daily/', '/monthly/');
    }

    function validatedAggregate(article, period, response, config, capturedAt, earlierTitleHistory) {
        checkedResponse(response);
        if (!Array.isArray(response.items)) { fail('The monthly range aggregate is missing.'); }
        var slices = monthSlices(period);
        var expected = new Set(slices.map(function (slice) { return slice.month; }));
        var counts = new Map();
        response.items.forEach(function (item) {
            if (!item || typeof item.timestamp !== 'string' || !/^\d{6}0100$/.test(item.timestamp) ||
                !Number.isSafeInteger(item.views) || item.views < 0 || item.agent !== 'user' || item.access !== 'all-access' ||
                item.granularity !== 'monthly' || typeof item.project !== 'string' || item.project.replace(/\.org$/, '') !== config.project.replace(/\.org$/, '') ||
                typeof item.article !== 'string' || normalizedTitle(item.article) !== normalizedTitle(article.title)) {
                fail('A monthly range item has invalid metadata or views.');
            }
            var month = item.timestamp.slice(0, 4) + '-' + item.timestamp.slice(4, 6);
            if (!validDate(month + '-01') || !expected.has(month) || counts.has(month)) { fail('The monthly range contains duplicate or out-of-range months.'); }
            counts.set(month, item.views);
        });
        var titleHistoryBeforePageCreation = !!earlierTitleHistory || !!(article.creationDate && slices.some(function (slice) {
            return slice.end < article.creationDate && (counts.get(slice.month) || 0) > 0;
        }));
        var total = 0;
        var buckets = slices.map(function (slice) {
            var views = counts.get(slice.month);
            var beforeCreation = false;
            var inferredZero = views === undefined && beforeCreation && !titleHistoryBeforePageCreation;
            if (views === undefined) {
                if (inferredZero) { views = 0; }
                else { fail('At least one queried month has no published aggregate.', 'missing-monthly-interval'); }
            }
            total += views;
            if (!Number.isSafeInteger(total)) { fail('The monthly range total exceeds the safe integer range.'); }
            return Object.assign({}, slice, { views: views, verifiedBeforeCreation: !!inferredZero });
        });
        return { pageid: article.pageid, title: article.title, period: period, granularity: 'monthly',
            total: total, buckets: buckets, capturedAt: capturedAt,
            firstEditAt: article.firstEditAt, creationDate: article.creationDate || null, creationEvidence: article.creationEvidence || null,
            titleHistoryBeforePageCreation: titleHistoryBeforePageCreation };
    }

    function snapshotV3(state) {
        return { identity: state.identity, scope: state.scope, rankLimit: state.rankLimit,
            capturedAt: state.capturedAt, historyCapturedAt: state.historyCapturedAt, metricVersion: METRIC_VERSION, totalModel: state.totalModel,
            periods: clone(state.periods), allPeriodsComplete: state.allPeriodsComplete };
    }

    function refreshV3(state, projectionModel) {
        var model = projectionModel === undefined ? state.totalModel : projectionModel;
        var legacyTopTotals = model == null;
        var eligible = state.metadata.cohort.length;
        PERIOD_IDS.forEach(function (id) {
            var result = state.periods[id];
            var bounds = periodBounds(state, id);
            var exact = bounds.filter(function (bound) { return bound.exact !== null; }).map(function (bound) { return rowForPeriod(bound.article, state.series[bound.article.pageid], id, state); });
            exact = sortedViewRows(exact);
            var rows = exact.slice(0, Math.min(state.rankLimit, eligible));
            var unknown = bounds.filter(function (bound) { return bound.exact === null; });
            var unbounded = unknown.filter(function (bound) { return bound.upper === null; }).length;
            var maximum = unbounded ? null : unknown.reduce(function (value, bound) { return Math.max(value, bound.upper); }, -1);
            var needed = Math.min(state.rankLimit, eligible);
            var cutoff = needed && rows.length === needed ? rows[needed - 1].views : null;
            var complete = state.metadata.complete && (eligible === 0 ||
                (rows.length === needed && !unbounded && (!unknown.length || cutoff > maximum)));
            var grand = grandForModel(model, id);
            var allExact = state.metadata.complete && unknown.length === 0;
            var rankedTotal = complete ? rows.reduce(function (sum, row) { return sum + row.views; }, 0) : null;
            result.rows = rows;
            result.rankingComplete = complete;
            result.complete = grand ? allExact : complete;
            result.allArticleTotal = grand && allExact ? exact.reduce(function (sum, row) { return sum + row.views; }, 0) : null;
            result.totalScope = grand ? 'all-eligible-articles' : 'ranked-top-' + state.rankLimit;
            result.total = grand ? result.allArticleTotal : rankedTotal;
            if (!legacyTopTotals) { result.rankedTotal = rankedTotal; }
            if ([result.total, result.allArticleTotal, rankedTotal].some(function (value) { return value !== null && !Number.isSafeInteger(value); })) { fail('The article view total exceeds the safe integer range.'); }
            result.proof = { kind: unknown.length ? 'daily-top-upper-bounds' : 'exhaustive-published-period-totals', strict: true,
                metadataComplete: state.metadata.complete, eligible: eligible, exactArticles: exact.length,
                truncatedArticles: id === 'since' ? state.metadata.cohort.filter(function (article) { return addDate(article.firstEditAt.slice(0, 10), 1) < COVERAGE_FLOOR; }).length : 0,
                uncertainArticles: unknown.length, unboundedRemaining: unbounded,
                cutoff: cutoff, remainingMaxUpper: maximum, complete: legacyTopTotals ? complete : result.complete };
            if (!legacyTopTotals) { result.proof.rankingComplete = complete; result.proof.totalComplete = result.complete; }
        });
        state.allPeriodsComplete = PERIOD_IDS.every(function (id) { return state.periods[id].complete; });
        var active = state.periods[state.activePeriod];
        state.period = active.period; state.rows = active.rows; state.total = active.total;
        state.totalScope = active.totalScope; state.allArticleTotal = active.allArticleTotal;
        if (!legacyTopTotals) { state.rankedTotal = active.rankedTotal; }
        state.rankingComplete = active.rankingComplete; state.complete = state.allPeriodsComplete;
        state.proof = active.proof;
        state.workPeriod = active.complete ? (PERIOD_IDS.find(function (id) { return !state.periods[id].complete; }) || state.activePeriod) : state.activePeriod;
        var workResult = state.periods[state.workPeriod];
        var allArticlesNeeded = grandForModel(model, state.workPeriod);
        var neededDates = new Set();
        var missingSeries = 0;
        var unavailable = 0;
        var creationNeeded = 0;
        state.metadata.cohort.forEach(function (article) {
            var series = state.series[article.pageid];
            if (!series) { missingSeries += 1; }
            else if (!series.validated && series.status !== 'available') { unavailable += 1; }
            
        });
        var activeBounds = periodBounds(state, state.workPeriod);
        var aggregateNeeded = 0;
        activeBounds.forEach(function (bound) {
            if (bound.exact !== null) { return; }
            if (!allArticlesNeeded && workResult.proof.cutoff !== null && bound.upper !== null && bound.upper < workResult.proof.cutoff) { return; }
            if (!state.aggregateFailures[bound.article.pageid + ':' + state.workPeriod]) { aggregateNeeded += 1; }
            if (state.boundExcludedTitles.indexOf(normalizedTitle(bound.article.title)) >= 0) { return; }
            bound.missingDates.forEach(function (date) { if (!state.topDays[date]) { neededDates.add(date); } });
        });
        var metadataRemaining = state.candidates.length - state.metadata.cursor;
        state.progress = Object.assign({}, state.progress, {
            candidates: state.candidates.length, resolved: state.metadata.cursor, eligible: eligible,
            collectedArticles: Object.keys(state.series).length, unavailable: unavailable,
            metadataRemaining: metadataRemaining, seriesRemaining: missingSeries, creationRemaining: creationNeeded,
            feedRemaining: neededDates.size, feedDays: Object.keys(state.topDays).filter(function (date) { return state.topDays[date].status === 'available'; }).length,
            aggregateRemaining: aggregateNeeded,
            pending: state.allPeriodsComplete ? 0 : metadataRemaining + missingSeries + unavailable + creationNeeded + neededDates.size + aggregateNeeded,
            workPeriod: state.workPeriod, resumable: !state.allPeriodsComplete && !state.error
        });
        state.stale = !state.allPeriodsComplete;
        state.phase = state.allPeriodsComplete ? 'complete' : (metadataRemaining ? 'metadata' : (missingSeries || creationNeeded ? 'annual-series' : 'bounds'));
        if (state.allPeriodsComplete) { state.error = null; }
        return Array.from(neededDates).sort();
    }

    function newStateV3(config, now, activity, candidates, previous) {
        var definitions = periodsFor(now);
        var periods = {};
        PERIOD_IDS.forEach(function (id) { periods[id] = { period: definitions[id], rows: [], rankingComplete: false, complete: false, total: null, totalScope: 'ranked-top-1000', allArticleTotal: null, proof: null }; });
        var reusable = previous && previous.periods['12m'].period.start === definitions['12m'].start && previous.periods['12m'].period.end === definitions['12m'].end ? clone(previous.series) : {};
        return { identity: identity(config), scope: 'all-distinct-edited-existing-mainspace-nonredirect-articles', metricVersion: METRIC_VERSION, totalModel: TOTAL_MODEL, rankLimit: 1000,
            sourcePeriod: sourceForArticles(definitions, candidates),
            sourceBasis: candidates.length > 50 ? 'history-candidates-v1' : 'eligible-cohort-v1',
            activePeriod: '30d', periods: periods, startedAt: now.toISOString(), capturedAt: now.toISOString(), lastAttemptAt: now.toISOString(),
            historyCapturedAt: activity.capturedAt, candidates: candidates, universeFingerprint: universeFingerprint(candidates),
            metadata: { cursor: 0, complete: candidates.length === 0, cohort: [], excluded: [] }, series: {}, reusableSeries: reusable,
            availabilityProof: previous && validAvailabilityProof(previous.availabilityProof, sourceForArticles(definitions, candidates), config, now.toISOString()) ? clone(previous.availabilityProof) : null,
            availabilityAttemptAt: null,
            aggregateTotals: {}, aggregateFailures: {},
            reusableAggregates: previous && previous.periods['12m'].period.start === definitions['12m'].start && previous.periods['12m'].period.end === definitions['12m'].end ? clone(previous.aggregateTotals || {}) : {},
            topDays: {}, boundExcludedTitles: Array.from(new Set(TOP_BOUND_EXCLUDED_TITLES.concat(previous && previous.boundExcludedTitles || []))),
            blacklist: { complete: false, source: TOP_BLACKLIST_URL, snapshotAt: null, excludedTitles: [] },
            progress: { requests: 0, totalRequests: 0 }, error: null, stale: true, phase: 'metadata', cacheHit: false,
            lastCompleteSnapshot: previous && previous.allPeriodsComplete ? snapshotV3(previous) : (previous && previous.lastCompleteSnapshot) || null };
    }

    async function collectFixedPageviews(options) {
        options = options || {};
        var requestJson = requireRequest(options);
        var config = normalizeConfig(options.config);
        var now = nowDate(options.now);
        var previous = sectionPrevious(options.previous, 'pageviews', config);
        var activity = options.activity || (options.previous && options.previous.activity);
        var activePeriod = options.activePeriod || (previous && previous.activePeriod) || '30d';
        if (PERIOD_IDS.indexOf(activePeriod) < 0) { fail('Unknown view period.'); }
        if (!activity || !activity.complete) {
            var unavailable = previous ? clone(previous) : newStateV3(config, now, { capturedAt: null }, [], null);
            unavailable.activePeriod = activePeriod; unavailable.metadata.complete = false;
            unavailable.error = { code: 'activity-unavailable', message: 'Complete contribution history is unavailable.' };
            refreshV3(unavailable); return unavailable;
        }
        var candidates = articleCandidates(activity.entries);
        var definitions = periodsFor(now);
        var fingerprint = universeFingerprint(candidates);
        // An unfinished snapshot also belongs to its original history and UTC
        // windows. Rebuild metadata when either changes, retaining reusable
        // series through newStateV3 instead of producing an invalid checkpoint.
        var unchangedCandidates = previous && JSON.stringify(previous.candidates) === JSON.stringify(candidates);
        var previousCandidates = new Map(previous ? previous.candidates.map(function (article) { return [article.pageid, article]; }) : []);
        var sameArticleIdentity = previous && candidates.every(function (article) {
            var old = previousCandidates.get(article.pageid);
            return old && old.title === article.title && old.creationDate === article.creationDate;
        });
        var resume = previous && previous.periods['12m'].period.start === definitions['12m'].start &&
            previous.periods['12m'].period.end === definitions['12m'].end && previous.universeFingerprint === fingerprint &&
            (unchangedCandidates || previous.metadata.complete && sameArticleIdentity);
        var state = resume && !options.restartPageviews ? clone(previous) : newStateV3(config, now, activity, candidates, previous);
        if (resume && !options.restartPageviews && !unchangedCandidates) {
            // A later edit does not change the first-edit cutoff or pageviews.
            // Metadata is complete, so changing candidate order cannot skip a
            // partially classified batch. Keep the already collected scores.
            var currentCandidates = new Map(candidates.map(function (article) { return [article.pageid, article]; }));
            state.candidates = candidates;
            state.historyCapturedAt = activity.capturedAt;
            state.metadata.cohort.forEach(function (article) {
                var currentArticle = currentCandidates.get(article.pageid);
                article.lastEditAt = currentArticle.lastEditAt; article.revid = currentArticle.revid;
                if (state.series[article.pageid]) { state.series[article.pageid].lastEditAt = currentArticle.lastEditAt; }
            });
        }
        if (options.restartPageviews) { state.reusableSeries = {}; state.reusableAggregates = {}; }
        var oldCaptureAt = state.capturedAt;
        state.capturedAt = now.toISOString(); state.lastAttemptAt = now.toISOString(); state.activePeriod = activePeriod;
        state.error = null; state.cacheHit = !!resume; state.progress.requests = 0;
        var maxRequests = options.maxRequests === undefined ? 40 : options.maxRequests;
        if (maxRequests !== Infinity && (!Number.isInteger(maxRequests) || maxRequests < 1)) { fail('Invalid request budget.'); }
        var checkpointEvery = options.checkpointEvery === undefined ? 8 : options.checkpointEvery;
        if (!Number.isInteger(checkpointEvery) || checkpointEvery < 1) { fail('Invalid checkpoint interval.'); }
        var requests = 0; var completedRequests = 0;
        async function request(url) {
            if (options.signal && options.signal.aborted) { fail('Collection was paused.', 'aborted'); }
            if (requests >= maxRequests) { fail('The request budget is exhausted.', 'request-budget'); }
            requests += 1; state.progress.requests = requests; state.progress.totalRequests += 1;
            try { return await requestJson(url); } finally { completedRequests += 1; }
        }
        async function checkpoint(force) {
            if (force || completedRequests >= checkpointEvery) {
                refreshV3(state);
                completedRequests = 0;
                if (options.onProgress) { await options.onProgress(clone(state)); }
            }
        }
        function metadataSource() {
            var definitions={};PERIOD_IDS.forEach(function(id){definitions[id]=state.periods[id].period;});
            state.sourcePeriod=sourceForState(definitions,state);
            Object.keys(state.reusableSeries).forEach(function(id){if(JSON.stringify(state.reusableSeries[id].sourcePeriod)!==JSON.stringify(state.sourcePeriod))delete state.reusableSeries[id];});
            if(state.availabilityProof&&!validAvailabilityProof(state.availabilityProof,state.sourcePeriod,config,now.toISOString())){state.availabilityProof=null;state.availabilityAttemptAt=null;}
        }
        var periodDefinitions = null, zerosVerified = false, seriesPrepared = false, attempted = new Set();
        async function prepareSeries() {
            if (seriesPrepared) { return; }
            metadataSource();
            periodDefinitions = {}; PERIOD_IDS.forEach(function (id) { periodDefinitions[id] = state.periods[id].period; });
            state.sourcePeriod = sourceForState(periodDefinitions,state);
            periodDefinitions.sourcePeriod = state.sourcePeriod;
            if (!validAvailabilityProof(state.availabilityProof, sourceOf(periodDefinitions), config, now.toISOString()) &&
                (!state.availabilityAttemptAt || options.retryUnavailableSeries)) {
                var controls = [];
                var controlTitles = expectedControlTitles(sourceOf(periodDefinitions));
                for (var controlIndex = 0; controlIndex < controlTitles.length; controlIndex += 1) {
                    try {
                        var controlTitle = controlTitles[controlIndex];
                        controls.push(availabilityControl(controlTitle, periodDefinitions,
                            await request(viewUrl(config, controlTitle, sourceOf(periodDefinitions))), config, now.toISOString()));
                    } catch (controlError) {
                        if (controlError.code === 'request-budget' || controlError.code === 'aborted') { throw controlError; }
                    }
                }
                state.availabilityAttemptAt = now.toISOString();
                if (controls.length === 2) {
                    state.availabilityProof = { complete: true, kind: 'aqs-documented-omitted-zero', documentation: ZERO_DOCUMENTATION,
                        project: config.project, sourcePeriod: sourceOf(periodDefinitions), capturedAt: now.toISOString(), controls: controls };
                }
                await checkpoint(false);
            }
            zerosVerified = validAvailabilityProof(state.availabilityProof, sourceOf(periodDefinitions), config, now.toISOString());
            seriesPrepared = true;
        }
        function reuseClassified() {
            state.metadata.cohort.forEach(function (article) {
                var reusable = state.reusableSeries[article.pageid];
                if (reusable && reusable.title === article.title && reusable.firstEditAt === article.firstEditAt && JSON.stringify(reusable.sourcePeriod) === JSON.stringify(state.sourcePeriod)) { state.series[article.pageid] = Object.assign({}, reusable, { lastEditAt: article.lastEditAt }); delete state.reusableSeries[article.pageid]; }
                var aggregates = state.reusableAggregates[article.pageid];
                if (aggregates && Object.keys(aggregates).every(function (id) { return aggregates[id].title === article.title; })) { state.aggregateTotals[article.pageid] = aggregates; delete state.reusableAggregates[article.pageid]; }
            });
        }
        async function collectSeries(articles, publishFirst) {
            var previewPublished = false;
            while (requests < maxRequests) {
                var queue = articles.filter(function (article) {
                    var series = state.series[article.pageid];
                    return !attempted.has(article.pageid) && (!series || (options.retryUnavailableSeries && !series.validated) ||
                        (zerosVerified && series.validated && series.missing.length));
                });
                if (!queue.length) { break; }
                queue.sort(function (a, b) { return (state.series[a.pageid] ? 1 : 0) - (state.series[b.pageid] ? 1 : 0); });
                var work = queue.slice(0, Math.min(2, maxRequests - requests));
                work.forEach(function (article) { attempted.add(article.pageid); });
                await Promise.all(work.map(async function (article) {
                    var series = state.series[article.pageid];
                    try {
                        if (!series || (options.retryUnavailableSeries && !series.validated) || (zerosVerified && series.validated && series.missing.length)) {
                            series = validatedSeries(article, periodDefinitions, await request(viewUrl(config, article.title, sourceOf(periodDefinitions))), config, now.toISOString(), state.availabilityProof);
                        }
                        state.series[article.pageid] = series;
                    } catch (error) {
                        if (error.code !== 'request-budget' && error.code !== 'aborted') {
                            series = emptySeries(article, periodDefinitions, now.toISOString(), errorInfo(error));
                            var articleUrl = viewUrl(config, article.title, sourceOf(periodDefinitions));
                            if (zerosVerified && documentedEmptyError(error, articleUrl)) {
                                series.validated = true; series.missing = []; series.reportedDays = 0;
                                series.zeroBasis = 'aqs-documented-empty-series'; series.availabilityProofAt = state.availabilityProof.capturedAt;
                                series.zeroEvidence = { requestUrl: articleUrl, status: 404, problem: clone(error.problem) };
                                series.error = null; refreshSeriesStats(series, periodDefinitions, article);
                            }
                            state.series[article.pageid] = series;
                        }
                    }
                }));
                await checkpoint(!!publishFirst && !previewPublished); previewPublished = true;
            }
        }
        try {
            metadataSource();
            refreshV3(state);
            if (state.allPeriodsComplete) { state.capturedAt = oldCaptureAt; await checkpoint(true); return state; }
            while (!state.metadata.complete && requests < maxRequests) {
                var batch = state.candidates.slice(state.metadata.cursor, state.metadata.cursor + 50);
                var response = checkedResponse(await request(apiUrl(config, { prop: 'info', pageids: batch.map(function (article) { return article.pageid; }).join('|') })));
                if (response.continue || !assertedFlag(response, 'batchcomplete') || !response.query || !Array.isArray(response.query.pages)) { fail('Current article metadata is incomplete.'); }
                var pages = new Map(); var requested = new Set(batch.map(function (article) { return article.pageid; }));
                response.query.pages.forEach(function (page) {
                    if (!page || !Number.isSafeInteger(page.pageid) || !requested.has(page.pageid) || pages.has(page.pageid)) { fail('Current metadata has invalid or duplicate page IDs.'); }
                    pages.set(page.pageid, page);
                });
                var additions = []; var exclusions = [];
                var knownTitles = new Set(state.metadata.cohort.map(function (article) { return normalizedTitle(article.title); }));
                batch.forEach(function (article) {
                    var page = pages.get(article.pageid);
                    if (!page) { fail('Current metadata omitted a requested page.'); }
                    if (assertedFlag(page, 'missing') || assertedFlag(page, 'invalid') || assertedFlag(page, 'redirect') || page.ns !== 0) {
                        exclusions.push({ pageid: article.pageid, reason: assertedFlag(page, 'redirect') ? 'redirect' : (page.ns !== 0 ? 'namespace' : 'missing') });
                    } else {
                        if (typeof page.title !== 'string' || !page.title || knownTitles.has(normalizedTitle(page.title))) { fail('Current metadata has missing or duplicate titles.'); }
                        knownTitles.add(normalizedTitle(page.title)); additions.push(Object.assign({}, article, { title: page.title }));
                    }
                });
                state.metadata.cohort = state.metadata.cohort.concat(additions); state.metadata.excluded = state.metadata.excluded.concat(exclusions);
                state.metadata.cursor += batch.length; state.metadata.complete = state.metadata.cursor === state.candidates.length;
                if(state.metadata.complete)metadataSource();
                await checkpoint(false);
                if (state.sourceBasis === 'history-candidates-v1' && !state.metadata.complete && options.metadataOnly !== true) {
                    reuseClassified();
                    var preview = state.metadata.cohort.slice(0,10);
                    if (preview.some(function (article) { return !state.series[article.pageid]; })) {
                        await prepareSeries();
                        await collectSeries(preview,true);
                    }
                }
            }
            if (!state.metadata.complete) { await checkpoint(true); return state; }
            metadataSource();
            if (options.metadataOnly === true) { await checkpoint(true); return state; }
            await prepareSeries();
            reuseClassified();
            state.reusableSeries = {}; state.reusableAggregates = {};
            await collectSeries(state.metadata.cohort,false);
            var neededDates = refreshV3(state);
            if (state.allPeriodsComplete) { state.lastCompleteSnapshot = snapshotV3(state); await checkpoint(true); return state; }
            if (state.progress.seriesRemaining || state.progress.creationRemaining || requests >= maxRequests) { await checkpoint(true); return state; }
            if (neededDates.length && !state.blacklist.complete && !state.blacklist.error && requests < maxRequests) {
                try {
                    var blacklist = checkedResponse(await request(TOP_BLACKLIST_URL));
                    if (blacklist.project !== config.project || blacklist.source !== TOP_BLACKLIST_URL || !validTimestamp(blacklist.snapshotAt) ||
                        !Array.isArray(blacklist.excludedTitles) || blacklist.excludedTitles.some(function (title) { return typeof title !== 'string' || !title; })) { fail('The daily-top exclusion list is invalid.', 'top-exclusions-unavailable'); }
                    state.boundExcludedTitles = Array.from(new Set(state.boundExcludedTitles.concat(blacklist.excludedTitles.map(normalizedTitle))));
                    state.blacklist = { complete: true, source: TOP_BLACKLIST_URL, snapshotAt: blacklist.snapshotAt, excludedTitles: state.boundExcludedTitles.slice() };
                } catch (error) {
                    if (error.code === 'request-budget' || error.code === 'aborted') { throw error; }
                    state.blacklist.error = errorInfo(error);
                }
            }
            neededDates = refreshV3(state);
            if (state.blacklist.complete) {
                var feedWorkPeriod = state.workPeriod;
                for (var dateIndex = 0; dateIndex < neededDates.length && requests < maxRequests; dateIndex += 1) {
                    var date = neededDates[dateIndex];
                    try { state.topDays[date] = validatedTopDay(await request(topUrl(config, date)), date, state.metadata.cohort, config); }
                    catch (error) {
                        if (error.code === 'request-budget' || error.code === 'aborted') { throw error; }
                        state.topDays[date] = { date: date, status: 'unavailable', cutoff: null, known: {}, coverage: null, error: errorInfo(error) };
                    }
                    await checkpoint(false);
                    refreshV3(state);
                    if (state.allPeriodsComplete || state.workPeriod !== feedWorkPeriod) { break; }
                }
            }
            refreshV3(state);
            if (!state.allPeriodsComplete && requests < maxRequests && (!state.progress.feedRemaining || state.blacklist.error)) {
                var attemptedAggregates = new Set();
                var aggregatePeriod = state.workPeriod;
                while (!state.periods[aggregatePeriod].complete && requests < maxRequests) {
                    var bounds = periodBounds(state, aggregatePeriod);
                    var cutoff = state.periods[aggregatePeriod].proof.cutoff;
                    var needEveryArticle = grandForModel(state.totalModel, aggregatePeriod);
                    var contenders = bounds.filter(function (bound) {
                        var key = bound.article.pageid + ':' + aggregatePeriod;
                        return bound.exact === null && (needEveryArticle || cutoff === null || bound.upper === null || bound.upper >= cutoff) && !attemptedAggregates.has(key) &&
                            (options.retryUnavailableAggregates || !state.aggregateFailures[key]);
                    }).sort(function (a, b) {
                        if (a.upper === null && b.upper !== null) { return -1; }
                        if (a.upper !== null && b.upper === null) { return 1; }
                        return (b.upper || 0) - (a.upper || 0) || b.lower - a.lower;
                    });
                    if (!contenders.length) { break; }
                    var work = contenders.slice(0, Math.min(2, maxRequests - requests));
                    await Promise.all(work.map(async function (bound) {
                        var article = bound.article; var key = article.pageid + ':' + aggregatePeriod;
                        attemptedAggregates.add(key);
                        try {
                            var result = validatedAggregate(article, effectivePeriod(article, state.periods[aggregatePeriod].period),
                                await request(monthlyUrl(config, article, effectivePeriod(article, state.periods[aggregatePeriod].period))), config, now.toISOString(),
                                state.series[article.pageid].titleHistoryBeforePageCreation);
                            if (result.total < state.series[article.pageid].partialSums[aggregatePeriod]) { fail('The published aggregate is below already verified daily views.'); }
                            if (!state.aggregateTotals[article.pageid]) { state.aggregateTotals[article.pageid] = {}; }
                            state.aggregateTotals[article.pageid][aggregatePeriod] = result; delete state.aggregateFailures[key];
                        } catch (error) {
                            if (error.code !== 'request-budget' && error.code !== 'aborted') { state.aggregateFailures[key] = { capturedAt: now.toISOString(), error: errorInfo(error) }; }
                        }
                    }));
                    await checkpoint(false);
                    refreshV3(state);
                }
            }
            refreshV3(state);
            if (state.allPeriodsComplete) { state.lastCompleteSnapshot = snapshotV3(state); }
            else if (requests < maxRequests && !state.progress.metadataRemaining && !state.progress.seriesRemaining &&
                !state.progress.creationRemaining && (!state.progress.feedRemaining || state.blacklist.error) && !state.progress.aggregateRemaining) {
                state.error = { code: 'period-views-incomplete', message: 'Unavailable article dates still prevent completing the article totals.' };
            }
            await checkpoint(true); return state;
        } catch (error) {
            if (error.code !== 'request-budget' && error.code !== 'aborted') { state.error = errorInfo(error); }
            await checkpoint(true); return state;
        }
    }

    function normalizeCustomRange(value, now) {
        if (value === undefined || value === null) { return null; }
        if (!value || typeof value !== 'object' || Array.isArray(value) || Object.keys(value).length !== 2 ||
            Object.keys(value).some(function (key) { return key !== 'start' && key !== 'end'; }) ||
            !validDate(value.start) || !validDate(value.end) || value.start < COVERAGE_FLOOR || value.end < value.start ||
            value.end > addDate(nowDate(now).toISOString().slice(0,10),-1)) { fail('Escolha datas completas entre 01/07/2015 e o último dia UTC encerrado.', 'invalid-custom-range'); }
        return {start:value.start,end:value.end};
    }
    function customDefinition(range) {
        return {start:range.start,end:range.end,days:Math.round((Date.parse(range.end)-Date.parse(range.start))/DAY)+1,basis:'UTC'};
    }
    function customFingerprint(articles) {
        return JSON.stringify(articles.map(function (a) { return [a.pageid,a.title,a.firstEditAt]; }).sort(function (a,b) { return a[0]-b[0]; }));
    }
    function customSource(range, articles) {
        var starts = articles.map(function (article) { return effectivePeriod(article,customDefinition(range)); }).filter(function (period) { return period.days > 0; }).map(function (period) { return period.start; });
        return customDefinition({start:starts.length ? starts.sort()[0] : range.start,end:range.end});
    }
    function customProofValid(proof, source, config, at) {
        return !!proof && !!proof.sourcePeriod && proof.sourcePeriod.start <= source.start && proof.sourcePeriod.end >= source.end &&
            validAvailabilityProof(proof,proof.sourcePeriod,config,at);
    }
    function fixedProjection(section) {
        var result = clone(section);
        delete result.customRange; delete result.customCache; delete result.customProgress;
        if (result.periods) { delete result.periods.custom; }
        return result;
    }
    function customRow(article, entry, period) {
        return {pageid:article.pageid,title:article.title,lastEditAt:article.lastEditAt,firstEditAt:article.firstEditAt,
            countFromDate:effectivePeriod(article,period).start,coverageTruncated:false,creationDate:article.creationDate || null,
            creationEvidence:article.creationEvidence || null,views:entry.total,status:'available',sourcePeriod:entry.period,
            sourceGranularity:entry.basis === 'fixed-period' ? 'cached-period' : 'daily',coveredDays:entry.period.days,
            dailyCoveredDays:entry.period.days,capturedAt:entry.capturedAt};
    }
    function projectCustom(section) {
        var cache = section.customCache, period = customDefinition(section.customRange), articles = section.metadata.cohort;
        var exact = articles.filter(function (article) { var entry=cache.series[article.pageid];return entry && entry.status === 'available'; });
        var rows = sortedViewRows(exact.map(function (article) { return customRow(article,cache.series[article.pageid],period); }));
        var complete = section.metadata.complete && exact.length === articles.length;
        var total = complete ? rows.reduce(function (sum,row) { return sum+row.views; },0) : null;
        var ranked = rows.slice(0,500), rankedTotal = complete ? ranked.reduce(function (sum,row) { return sum+row.views; },0) : null;
        if (total !== null && !Number.isSafeInteger(total)) { fail('O total de visualizações excedeu o limite numérico.'); }
        return {period:period,rows:ranked,rankingComplete:complete,complete:complete,total:total,totalScope:'all-eligible-articles',
            allArticleTotal:total,rankedTotal:rankedTotal,proof:{kind:'exhaustive-custom-daily-totals',strict:true,metadataComplete:section.metadata.complete,
                eligible:articles.length,exactArticles:exact.length,uncertainArticles:articles.length-exact.length,truncatedArticles:0,
                unboundedRemaining:articles.length-exact.length,cutoff:complete && ranked.length ? ranked[ranked.length-1].views : null,
                remainingMaxUpper:complete ? -1 : null,complete:complete,rankingComplete:complete,totalComplete:complete}};
    }
    function installCustomProjection(section) {
        var result = projectCustom(section), cache = section.customCache;
        if (!result.complete && cache.lastCompleteSnapshot) { result.lastCompleteSnapshot=clone(cache.lastCompleteSnapshot); }
        section.periods.custom=result;
        section.customProgress={requests:cache.requests,totalRequests:cache.totalRequests,eligible:section.metadata.cohort.length,
            completed:result.proof.exactArticles,pending:section.metadata.complete ? result.proof.uncertainArticles : section.candidates.length-section.metadata.cursor,
            resumable:!result.complete && !cache.error,error:cache.error};
        return result;
    }
    function newCustomCache(section,range,previous,now) {
        var fingerprint=customFingerprint(section.metadata.cohort), same=previous && JSON.stringify(previous.range)===JSON.stringify(range);
        var source=customSource(range,section.metadata.cohort), entries={};
        if (same && section.metadata.complete) {
            section.metadata.cohort.forEach(function (article) {
                var entry=previous.series[article.pageid];
                if (entry && entry.title===article.title && entry.firstEditAt===article.firstEditAt) entries[article.pageid]=clone(entry);
            });
        }
        return {version:1,identity:section.identity,range:range,sourcePeriod:source,cohortFingerprint:fingerprint,capturedAt:now,
            series:entries,controls:same && JSON.stringify(previous.sourcePeriod)===JSON.stringify(source) ? clone(previous.controls) : [],
            controlAttempts:same && JSON.stringify(previous.sourcePeriod)===JSON.stringify(source) ? clone(previous.controlAttempts) : {},availabilityProof:same && customProofValid(previous.availabilityProof,source,DEFAULT_CONFIG,now) ? clone(previous.availabilityProof) : null,
            lastCompleteSnapshot:same && previous.cohortFingerprint===fingerprint ? clone(previous.lastCompleteSnapshot) : null,
            requests:0,totalRequests:same ? previous.totalRequests : 0,error:null};
    }
    function customEntry(article,range,now) {
        return {pageid:article.pageid,title:article.title,firstEditAt:article.firstEditAt,period:effectivePeriod(article,customDefinition(range)),
            capturedAt:now,status:'unavailable',total:null,partialTotal:0,missingDates:[],reportedDays:0,basis:'daily',error:null};
    }
    function parseCustomDaily(article,range,response,config,now,proof) {
        checkedResponse(response);
        if (!response || !Array.isArray(response.items)) { fail('A série do intervalo personalizado está incompleta.'); }
        var entry=customEntry(article,range,now), counts=new Map();
        Array.from(response.items).forEach(function (item) {
            if (!item || typeof item.timestamp!=='string' || !/^\d{8}00$/.test(item.timestamp) ||
                !Number.isSafeInteger(item.views) || item.views<0 || item.agent!=='user' || item.access!=='all-access' || item.granularity!=='daily' ||
                typeof item.project!=='string' || item.project.replace(/\.org$/,'')!==config.project.replace(/\.org$/,'') ||
                typeof item.article!=='string' || normalizedTitle(item.article)!==normalizedTitle(article.title)) { fail('Uma observação do intervalo personalizado é inválida.'); }
            var date=item.timestamp.slice(0,4)+'-'+item.timestamp.slice(4,6)+'-'+item.timestamp.slice(6,8);
            if (!validDate(date) || date<entry.period.start || date>entry.period.end || counts.has(date)) { fail('A série personalizada contém datas repetidas ou fora do intervalo.'); }
            counts.set(date,item.views);
        });
        entry.reportedDays=counts.size;
        var zeroProof=customProofValid(proof,entry.period,config,now);
        for(var day=entry.period.start;day<=entry.period.end;day=addDate(day,1)) {
            if (!counts.has(day)) { if (!zeroProof) entry.missingDates.push(day); else entry.zeroBasis='aqs-documented-omitted-zero'; }
            else entry.partialTotal+=counts.get(day);
            if (!Number.isSafeInteger(entry.partialTotal)) fail('Uma soma personalizada excedeu o limite numérico.');
        }
        if (!entry.missingDates.length) { entry.status='available';entry.total=entry.partialTotal; }
        return entry;
    }
    function reusableCustomFixed(section,article,range,now) {
        var matched=PERIOD_IDS.find(function (id) { var p=section.periods[id].period;return p.start===range.start && p.end===range.end; });
        if (!matched) return null;
        var series=section.series[article.pageid], aggregate=section.aggregateTotals[article.pageid] && section.aggregateTotals[article.pageid][matched];
        var total=aggregate ? aggregate.total : series && series.totals[matched];
        if (!Number.isSafeInteger(total) || total<0) return null;
        var entry=customEntry(article,range,now);entry.status='available';entry.total=total;entry.partialTotal=total;entry.basis='fixed-period';entry.fixedPeriod=matched;
        return entry;
    }
    async function collectCustomRange(section,range,options,previous,request,remaining) {
        var now=nowDate(options.now).toISOString(), config=normalizeConfig(options.config);
        section.customRange=range;section.customCache=newCustomCache(section,range,previous,now);
        var cache=section.customCache, completed=0, checkpointEvery=options.checkpointEvery===undefined?8:options.checkpointEvery;
        async function checkpoint(force) {if(force||completed>=checkpointEvery){installCustomProjection(section);completed=0;if(options.onProgress)await options.onProgress(clone(section));}}
        if (!section.metadata.complete) {await checkpoint(true);return section;}
        section.metadata.cohort.forEach(function (article) {
            if (cache.series[article.pageid] && cache.series[article.pageid].status==='available') return;
            var entry=customEntry(article,range,now);
            if (!entry.period.days) {entry.status='available';entry.total=0;entry.basis='before-first-edit';cache.series[article.pageid]=entry;}
            else {var reused=reusableCustomFixed(section,article,range,now);if(reused)cache.series[article.pageid]=reused;}
        });
        if (projectCustom(section).complete) {cache.lastCompleteSnapshot=projectCustom(section);await checkpoint(true);return section;}
        if (!cache.availabilityProof && customProofValid(section.availabilityProof,cache.sourcePeriod,config,now)) cache.availabilityProof=clone(section.availabilityProof);
        if (!cache.availabilityProof) {
            var names=expectedControlTitles(cache.sourcePeriod), definitions=periodsFor(now);definitions.sourcePeriod=cache.sourcePeriod;
            for(var index=0;index<names.length && remaining()>0;index+=1) {
                var title=names[index];
                if (cache.controls.some(function (control) {return control.title===title;}) || cache.controlAttempts[title] && !options.retryUnavailableSeries &&
                    Date.parse(now)-Date.parse(cache.controlAttempts[title].capturedAt)<300000) continue;
                try {cache.controls.push(availabilityControl(title,definitions,await request(viewUrl(config,title,cache.sourcePeriod)),config,now));}
                catch(error){if(error.code==='aborted'||error.code==='request-budget')throw error;cache.controlAttempts[title]=Object.assign({capturedAt:now},errorInfo(error));}
                cache.requests+=1;cache.totalRequests+=1;completed+=1;
                await checkpoint();
            }
            if(cache.controls.length===2) cache.availabilityProof={complete:true,kind:'aqs-documented-omitted-zero',documentation:ZERO_DOCUMENTATION,project:config.project,
                sourcePeriod:cache.sourcePeriod,capturedAt:now,controls:clone(cache.controls)};
        }
        section.metadata.cohort.forEach(function(article){
            var entry=cache.series[article.pageid];
            if(entry && entry.status!=='available' && !entry.error && entry.missingDates.length && customProofValid(cache.availabilityProof,entry.period,config,now)) {
                entry.total=entry.partialTotal;entry.status='available';entry.missingDates=[];entry.zeroBasis='aqs-documented-omitted-zero';entry.capturedAt=now;
            }
        });
        var attempted=new Set();
        while(remaining()>0) {
            var article=section.metadata.cohort.find(function(a){var entry=cache.series[a.pageid];return !attempted.has(a.pageid)&&(!entry||entry.status!=='available'&&
                (options.retryUnavailableSeries||Date.parse(now)-Date.parse(entry.capturedAt)>=300000));});
            if(!article)break;attempted.add(article.pageid);
            var entry=customEntry(article,range,now), url=viewUrl(config,article.title,entry.period);
            try {entry=parseCustomDaily(article,range,await request(url),config,now,cache.availabilityProof);}
            catch(error) {
                if(error.code==='aborted'||error.code==='request-budget')throw error;
                entry.error=errorInfo(error);
                if(customProofValid(cache.availabilityProof,entry.period,config,now)&&documentedEmptyError(error,url)) {
                    entry.status='available';entry.total=0;entry.zeroBasis='aqs-documented-empty-series';entry.zeroEvidence={requestUrl:url,status:404,problem:clone(error.problem)};entry.error=null;
                }
            }
            cache.series[article.pageid]=entry;cache.requests+=1;cache.totalRequests+=1;completed+=1;await checkpoint();
        }
        var result=projectCustom(section);
        if(result.complete)cache.lastCompleteSnapshot=result;
        else if(remaining()>0)cache.error={code:'custom-views-incomplete',message:'Algumas datas ainda não puderam ser conferidas.'};
        await checkpoint(true);return section;
    }
    async function collectPageviews(options) {
        options=options||{};
        var range=normalizeCustomRange(options.customRange,options.now), original=sectionPrevious(options.previous,'pageviews',normalizeConfig(options.config));
        if(options.activePeriod==='custom'&&!range)fail('Escolha as datas do intervalo personalizado.','invalid-custom-range');
        var previousCustom=original && original.customCache;
        var limit=options.maxRequests===undefined?40:options.maxRequests, used=0, requestJson=requireRequest(options);
        if(limit!==Infinity && (!Number.isInteger(limit)||limit<1))fail('Invalid request budget.');
        async function request(url) {if(options.signal&&options.signal.aborted)fail('Collection was paused.','aborted');if(used>=limit)fail('The request budget is exhausted.','request-budget');used+=1;return requestJson(url);}
        var previous=options.previous;
        if(original && original.customRange) previous=Object.assign({},options.previous,{pageviews:fixedProjection(original)});
        var fixedPeriod=PERIOD_IDS.indexOf(options.activePeriod)>=0?options.activePeriod:(original&&original.activePeriod)||'30d';
        var customReady=original&&JSON.stringify(original.customRange)===JSON.stringify(range)&&original.periods.custom&&original.periods.custom.complete;
        var fixed=await collectFixedPageviews(Object.assign({},options,{previous:previous,requestJson:request,activePeriod:fixedPeriod,
            metadataOnly:!!range&&options.activePeriod==='custom'&&!customReady,onProgress:range?undefined:options.onProgress}));
        if(!range)return fixed;
        return collectCustomRange(fixed,range,options,previousCustom,request,function(){return limit-used;});
    }
    function validateCustomCache(section,captureAt,check) {
        var hasCustom=own(section,'customRange')||own(section,'customCache')||section.periods&&own(section.periods,'custom');
        if(!hasCustom)return;
        var label='Custom article range: ', range=normalizeCustomRange(section.customRange,captureAt), cache=section.customCache;
        check(!!range&&!!cache&&cache.version===1&&sameIdentity(cache,section.identity),label+'invalid range cache identity.');
        if(!range||!cache)return;
        check(JSON.stringify(cache.range)===JSON.stringify(range)&&validTimestamp(cache.capturedAt)&&Date.parse(cache.capturedAt)<=Date.parse(captureAt),label+'invalid cache anchor.');
        var articles=new Map(section.metadata.cohort.map(function(a){return[a.pageid,a];})),source=customSource(range,section.metadata.cohort);
        check(cache.cohortFingerprint===customFingerprint(section.metadata.cohort)&&JSON.stringify(cache.sourcePeriod)===JSON.stringify(source),label+'article cohort or source interval mismatch.');
        check(cache.series&&typeof cache.series==='object'&&!Array.isArray(cache.series)&&Array.isArray(cache.controls)&&cache.controls.length<=2&&
            cache.controlAttempts&&typeof cache.controlAttempts==='object'&&!Array.isArray(cache.controlAttempts),label+'missing collection evidence.');
        var controlTitles=new Set();
        (cache.controls||[]).forEach(function(control){
            check(control&&expectedControlTitles(source).indexOf(control.title)>=0&&!controlTitles.has(control.title)&&control.requestUrl===viewUrl(DEFAULT_CONFIG,control.title,source)&&
                control.project===DEFAULT_CONFIG.project&&control.agent==='user'&&control.access==='all-access'&&control.granularity==='daily'&&
                validTimestamp(control.capturedAt)&&Date.parse(control.capturedAt)<=Date.parse(cache.capturedAt)&&Array.isArray(control.daily)&&control.daily.length===source.days&&
                control.daily.every(function(day,index){return day&&day.date===addDate(source.start,index)&&Number.isSafeInteger(day.views)&&day.views>=0;}),label+'invalid partial availability control.');
            controlTitles.add(control.title);
        });
        if(cache.availabilityProof)check(customProofValid(cache.availabilityProof,source,DEFAULT_CONFIG,cache.capturedAt),label+'invalid zero-availability proof.');
        Object.keys(cache.controlAttempts||{}).forEach(function(title){var error=cache.controlAttempts[title];check(expectedControlTitles(source).indexOf(title)>=0&&error&&typeof error.code==='string'&&typeof error.message==='string'&&
            validTimestamp(error.capturedAt)&&Date.parse(error.capturedAt)<=Date.parse(cache.capturedAt),label+'invalid availability attempt.');});
        Object.keys(cache.series||{}).forEach(function(key){
            var entry=cache.series[key],article=articles.get(Number(key));
            check(article&&entry&&entry.pageid===Number(key)&&entry.title===article.title&&entry.firstEditAt===article.firstEditAt&&
                JSON.stringify(entry.period)===JSON.stringify(effectivePeriod(article,customDefinition(range)))&&validTimestamp(entry.capturedAt)&&
                Date.parse(entry.capturedAt)<=Date.parse(cache.capturedAt),label+'cached article identity, cutoff or interval mismatch.');
            if(!entry||!article)return;
            check(['available','unavailable'].indexOf(entry.status)>=0&&['daily','fixed-period','before-first-edit'].indexOf(entry.basis)>=0&&
                Number.isSafeInteger(entry.partialTotal)&&entry.partialTotal>=0&&Array.isArray(entry.missingDates)&&new Set(entry.missingDates).size===entry.missingDates.length&&
                entry.missingDates.every(function(date){return validDate(date)&&date>=entry.period.start&&date<=entry.period.end;})&&
                Number.isInteger(entry.reportedDays)&&entry.reportedDays>=0&&entry.reportedDays<=entry.period.days,label+'invalid cached daily sum.');
            if(entry.status==='available')check(Number.isSafeInteger(entry.total)&&entry.total>=0&&entry.total===entry.partialTotal&&!entry.missingDates.length,label+'available article has unknown dates or mismatched sums.');
            else check(entry.total===null&&(entry.error||entry.missingDates.length),label+'unavailable article must not provide a total.');
            if(entry.basis==='before-first-edit')check(entry.period.days===0&&entry.total===0,label+'unverified first-edit zero.');
            if(entry.basis==='fixed-period') {
                var fixed=periodsFor(entry.capturedAt)[entry.fixedPeriod];
                check(fixed&&fixed.start===range.start&&fixed.end===range.end&&entry.status==='available',label+'invalid reused fixed-period sum.');
            }
            if(entry.basis==='daily'&&entry.status==='available'&&entry.reportedDays<entry.period.days) {
                check(customProofValid(cache.availabilityProof,entry.period,DEFAULT_CONFIG,entry.capturedAt)&&
                    ['aqs-documented-omitted-zero','aqs-documented-empty-series'].indexOf(entry.zeroBasis)>=0,label+'omitted dates need availability evidence.');
            }
            if(entry.zeroBasis==='aqs-documented-empty-series')check(entry.total===0&&entry.reportedDays===0&&entry.zeroEvidence&&
                documentedEmptyError({status:404,requestUrl:entry.zeroEvidence.requestUrl,problem:entry.zeroEvidence.problem},viewUrl(DEFAULT_CONFIG,entry.title,entry.period)),label+'unverified empty-series response.');
        });
        check(Number.isSafeInteger(cache.requests)&&cache.requests>=0&&Number.isSafeInteger(cache.totalRequests)&&cache.totalRequests>=cache.requests,label+'invalid request progress.');
        if(cache.lastCompleteSnapshot) {
            var snapshot=cache.lastCompleteSnapshot;
            check(snapshot.complete===true&&JSON.stringify(snapshot.period)===JSON.stringify(customDefinition(range))&&snapshot.proof&&
                snapshot.proof.eligible===articles.size&&snapshot.proof.exactArticles===articles.size&&snapshot.proof.complete===true&&
                Array.isArray(snapshot.rows)&&snapshot.rows.length===Math.min(500,articles.size)&&snapshot.rows.every(function(row){var article=articles.get(row.pageid);return article&&row.title===article.title&&row.firstEditAt===article.firstEditAt&&Number.isSafeInteger(row.views)&&row.views>=0;})&&
                Number.isSafeInteger(snapshot.total)&&snapshot.total>=0&&snapshot.total===snapshot.allArticleTotal&&snapshot.totalScope==='all-eligible-articles'&&
                snapshot.rankedTotal===snapshot.rows.reduce(function(sum,row){return sum+row.views;},0)&&snapshot.total>=snapshot.rankedTotal,label+'invalid prior same-range snapshot.');
            check(new Set(snapshot.rows.map(function(row){return row.pageid;})).size===snapshot.rows.length&&
                JSON.stringify(snapshot.rows)===JSON.stringify(sortedViewRows(snapshot.rows)),label+'prior snapshot has repeated or unsorted articles.');
        }
        var projected=clone(section);installCustomProjection(projected);
        check(JSON.stringify(section.periods.custom)===JSON.stringify(projected.periods.custom)&&JSON.stringify(section.customProgress)===JSON.stringify(projected.customProgress),label+'custom ranking or progress does not match article evidence.');
    }

    function streakGoal(current, best) {
        if (!Number.isSafeInteger(current) || current < 0 || (best !== undefined && (!Number.isSafeInteger(best) || best < current))) {
            fail('Invalid current or best editing streak.');
        }
        best = best === undefined ? current : best;
        var milestones = [30, 45, 60, 90, 100, 150, 200, 365, 500, 730, 1000];
        while (milestones[milestones.length - 1] <= Math.max(current, best)) { milestones.push(milestones[milestones.length - 1] + 365); }
        var completed = milestones.filter(function (milestone) { return milestone <= best; });
        var next = milestones.find(function (milestone) { return milestone > current; });
        return { current: current, best: best, completed: completed,
            lastCompleted: completed.length ? completed[completed.length - 1] : null,
            next: next, remaining: next - current, progress: current / next };
    }

    function validateV3(section, captureAt, check, expectedRankLimit, projectionModel) {
        var expectedModel = projectionModel === undefined ? TOTAL_MODEL : projectionModel;
        var legacyTopTotals = expectedModel == null;
        var label = 'Article ranking: ';
        check(legacyTopTotals ? !own(section, 'totalModel') : section.totalModel === expectedModel, label + 'invalid cumulative total model.');
        check(section.metricVersion === METRIC_VERSION && section.scope === 'all-distinct-edited-existing-mainspace-nonredirect-articles' && section.rankLimit === expectedRankLimit && PERIOD_IDS.indexOf(section.activePeriod) >= 0, label + 'invalid scope or period.');
        check(validTimestamp(section.startedAt) && validTimestamp(section.capturedAt) && Date.parse(section.startedAt) <= Date.parse(section.capturedAt) && Date.parse(section.capturedAt) <= Date.parse(captureAt), label + 'invalid capture times.');
        var definitions = periodsFor(section.startedAt);
        check(!!section.periods && PERIOD_IDS.every(function (id) { return section.periods[id] && JSON.stringify(section.periods[id].period) === JSON.stringify(definitions[id]); }), label + 'frozen period definitions do not match the anchor date.');
        check(Array.isArray(section.candidates) && !!section.metadata && Array.isArray(section.metadata.cohort) && Array.isArray(section.metadata.excluded), label + 'metadata is missing.');
        if (!Array.isArray(section.candidates) || !section.metadata || !Array.isArray(section.metadata.cohort)) { return; }
        var candidateIds = new Set(); var candidateFirst = new Map();
        section.candidates.forEach(function (article) {
            check(Number.isSafeInteger(article.pageid) && article.pageid > 0 && !candidateIds.has(article.pageid) && typeof article.title === 'string' && !!article.title && validTimestamp(article.lastEditAt) && validTimestamp(article.firstEditAt) && article.firstEditAt <= article.lastEditAt, label + 'invalid candidate.');
            candidateIds.add(article.pageid); candidateFirst.set(article.pageid, article.firstEditAt);
        });
        check(section.universeFingerprint === universeFingerprint(section.candidates), label + 'universe fingerprint mismatch.');
        check(Number.isInteger(section.metadata.cursor) && section.metadata.cursor >= 0 && section.metadata.cursor <= section.candidates.length, label + 'invalid metadata cursor.');
        var classified = new Set(); var titles = new Set(); var articles = new Map();
        section.metadata.cohort.forEach(function (article) {
            check(candidateIds.has(article.pageid) && !classified.has(article.pageid) && typeof article.title === 'string' && !!article.title && !titles.has(normalizedTitle(article.title)) && validTimestamp(article.lastEditAt) && validTimestamp(article.firstEditAt) && article.firstEditAt === candidateFirst.get(article.pageid) && article.firstEditAt <= article.lastEditAt, label + 'invalid eligible article.');
            classified.add(article.pageid); titles.add(normalizedTitle(article.title)); articles.set(article.pageid, article);
        });
        section.metadata.excluded.forEach(function (article) {
            check(candidateIds.has(article.pageid) && !classified.has(article.pageid) && ['missing', 'redirect', 'namespace'].indexOf(article.reason) >= 0, label + 'invalid excluded article.'); classified.add(article.pageid);
        });
        check(classified.size === section.metadata.cursor && section.candidates.slice(0, section.metadata.cursor).every(function (article) { return classified.has(article.pageid); }) &&
            (!section.metadata.complete || section.metadata.cursor === section.candidates.length), label + 'metadata is incomplete or omits candidates.');
        check(Array.isArray(section.boundExcludedTitles) && section.boundExcludedTitles.indexOf('-') >= 0 && !!section.blacklist, label + 'exclusion coverage is missing.');
        if (section.blacklist && section.blacklist.complete) {
            check(section.blacklist.source === TOP_BLACKLIST_URL && validTimestamp(section.blacklist.snapshotAt) && Date.parse(section.blacklist.snapshotAt) <= Date.parse(captureAt) &&
                Array.isArray(section.blacklist.excludedTitles) && section.blacklist.excludedTitles.every(function (title) { return section.boundExcludedTitles.indexOf(title) >= 0; }), label + 'invalid live exclusion list.');
        }
        check(!own(section,'sourceBasis') || ['history-candidates-v1','eligible-cohort-v1'].indexOf(section.sourceBasis) >= 0, label + 'invalid source interval basis.');
        var source = sourceForState(definitions,section);
        check(JSON.stringify(section.sourcePeriod) === JSON.stringify(source), label + 'source interval does not cover lifetime and rolling periods.');
        // The same controls and source interval apply to every cached article.
        // Validate their observations once, retaining the per-series chronology
        // check below. This does not bypass any zero-availability evidence.
        var availabilityValid = !!section.availabilityProof && validAvailabilityProof(section.availabilityProof, source, DEFAULT_CONFIG, captureAt);
        if (section.availabilityProof) { check(availabilityValid, label + 'invalid annual availability proof.'); }
        if (section.availabilityAttemptAt) {
            check(validTimestamp(section.availabilityAttemptAt) && Date.parse(section.availabilityAttemptAt) <= Date.parse(captureAt), label + 'invalid availability attempt time.');
        }
        function validateSeriesCache(series) {
            check(Number.isSafeInteger(series.pageid) && series.pageid > 0 && typeof series.title === 'string' && !!series.title && validTimestamp(series.lastEditAt) && validTimestamp(series.capturedAt) && Date.parse(series.capturedAt) <= Date.parse(captureAt), label + 'invalid cached article.');
            check(validTimestamp(series.firstEditAt) && series.countStartDate === countStart(series), label + 'invalid first-edit cutoff.');
            check(JSON.stringify(series.sourcePeriod) === JSON.stringify(source) && Array.isArray(series.missing) && !!series.partialSums && !!series.totals && !!series.covered, label + 'invalid series projection.');
            var seenMissing = new Set();
            (series.missing || []).forEach(function (index) {
                check(Number.isInteger(index) && index >= 0 && index < source.days && !seenMissing.has(index), label + 'invalid or duplicate missing-date index.'); seenMissing.add(index);
                check(addDate(source.start, index) >= countStart(series), label + 'a pre-first-edit date cannot remain unknown.');
            });
            PERIOD_IDS.forEach(function (id) {
                var period = effectivePeriod(series, definitions[id]);
                var missing = (series.missing || []).filter(function (index) { var date = addDate(source.start, index); return date >= period.start && date <= period.end; }).length;
                check(Number.isSafeInteger(series.partialSums[id]) && series.partialSums[id] >= 0 && series.covered[id] === period.days - missing &&
                    series.totals[id] === (missing ? null : series.partialSums[id]), label + 'period coverage or totals do not match the missing dates.');
            });
            check(series.partialSums['30d'] <= series.partialSums['90d'] && series.partialSums['90d'] <= series.partialSums['12m'] && series.partialSums['12m'] <= series.partialSums['since'], label + 'nested period sums are inconsistent.');
            check(!series.firstNonZeroDate || (validDate(series.firstNonZeroDate) && series.firstNonZeroDate >= source.start && series.firstNonZeroDate <= source.end), label + 'invalid first positive date.');
            check(!!series.titleHistoryBeforePageCreation === !!(series.creationDate && series.firstNonZeroDate && series.firstNonZeroDate < series.creationDate), label + 'invalid prior-title-history flag.');
            check(!series.creationDate || validDate(series.creationDate), label + 'invalid creation date.');
            if (series.creationEvidence && series.creationEvidence.type === 'first-revision') {
                check(series.creationEvidence.parentid === 0 && Number.isSafeInteger(series.creationEvidence.revid) && series.creationEvidence.revid > 0 && validTimestamp(series.creationEvidence.timestamp) && series.creationEvidence.timestamp.slice(0, 10) === series.creationDate, label + 'invalid creation evidence.');
            }
            check(['available', 'partial', 'unavailable'].indexOf(series.status) >= 0 && (series.status !== 'available' || series.missing.length === 0), label + 'invalid series status.');
            if (own(series, 'reportedDays')) {
                check(Number.isInteger(series.reportedDays) && series.reportedDays >= 0 && series.reportedDays <= source.days, label + 'invalid explicit reported-day count.');
            }
            if (series.zeroBasis) {
                check(['aqs-documented-omitted-zero', 'aqs-documented-empty-series'].indexOf(series.zeroBasis) >= 0 &&
                    availabilityValid && Date.parse(section.availabilityProof.capturedAt) <= Date.parse(series.capturedAt) &&
                    series.availabilityProofAt === section.availabilityProof.capturedAt && series.validated === true &&
                    series.status === 'available' && series.missing.length === 0 && Number.isInteger(series.reportedDays) && series.reportedDays < source.days,
                    label + 'zero-filled article lacks matching availability evidence.');
                if (series.zeroBasis === 'aqs-documented-empty-series') {
                    var evidence = series.zeroEvidence;
                    check(!!evidence && evidence.status === 404 && series.reportedDays === 0 && !series.firstNonZeroDate &&
                        PERIOD_IDS.every(function (id) { return series.partialSums[id] === 0; }) &&
                        documentedEmptyError({ status: 404, requestUrl: evidence.requestUrl, problem: evidence.problem }, viewUrl(DEFAULT_CONFIG, series.title, source)),
                        label + 'empty series lacks a matching AQS not-found response.');
                } else { check(!series.zeroEvidence, label + 'omitted-day series has incompatible not-found evidence.'); }
            } else { check(!series.availabilityProofAt && !series.zeroEvidence, label + 'article zero evidence has no declared basis.'); }
        }
        check(!!section.series && typeof section.series === 'object' && !!section.topDays && typeof section.topDays === 'object', label + 'series or feed cache is missing.');
        Object.keys(section.series || {}).forEach(function (id) {
            var series = section.series[id]; var article = articles.get(Number(id));
            check(!!article && series.pageid === Number(id) && series.title === article.title && series.firstEditAt === article.firstEditAt, label + 'cached series is outside the universe or first-edit history.'); validateSeriesCache(series);
        });
        Object.keys(section.reusableSeries || {}).forEach(function (id) { validateSeriesCache(section.reusableSeries[id]); });
        function validateAggregateCache(result, id, key, requireMembership) {
            var article = articles.get(Number(key));
            check(PERIOD_IDS.indexOf(id) >= 0 && (!requireMembership || (!!article && article.title === result.title)) && result.pageid === Number(key) &&
                result.granularity === 'monthly' && JSON.stringify(result.period) === JSON.stringify(effectivePeriod(article || result, definitions[id])) &&
                validTimestamp(result.capturedAt) && Date.parse(result.capturedAt) <= Date.parse(captureAt) && Number.isSafeInteger(result.total) && result.total >= 0,
                label + 'invalid published monthly aggregate.');
            var slices = monthSlices(effectivePeriod(article || result, definitions[id]));
            check(Array.isArray(result.buckets) && result.buckets.length === slices.length, label + 'monthly aggregate lacks expected calendar buckets.');
            var sum = 0;
            (result.buckets || []).forEach(function (bucket, index) {
                var expected = slices[index];
                check(!!expected && bucket.month === expected.month && bucket.start === expected.start && bucket.end === expected.end &&
                    Number.isSafeInteger(bucket.views) && bucket.views >= 0, label + 'invalid monthly bucket interval.');
                if (bucket.verifiedBeforeCreation) { check(!!result.creationDate && !result.titleHistoryBeforePageCreation && bucket.end < result.creationDate && bucket.views === 0, label + 'unverified pre-creation bucket zero.'); }
                sum += bucket.views;
            });
            check(sum === result.total, label + 'monthly bucket sum mismatch.');
        }
        check(!!section.aggregateTotals && !!section.aggregateFailures && !!section.reusableAggregates, label + 'monthly aggregate caches are missing.');
        Object.keys(section.aggregateTotals || {}).forEach(function (key) {
            Object.keys(section.aggregateTotals[key]).forEach(function (id) { validateAggregateCache(section.aggregateTotals[key][id], id, key, true); });
        });
        Object.keys(section.reusableAggregates || {}).forEach(function (key) {
            Object.keys(section.reusableAggregates[key]).forEach(function (id) { validateAggregateCache(section.reusableAggregates[key][id], id, key, false); });
        });
        Object.keys(section.topDays || {}).forEach(function (date) {
            var day = section.topDays[date];
            check(validDate(date) && date >= source.start && date <= source.end && day.date === date && ['available', 'unavailable'].indexOf(day.status) >= 0, label + 'invalid cached feed date.');
            if (day.status === 'available') {
                check(Number.isSafeInteger(day.cutoff) && day.cutoff > 0 && !!day.coverage && day.coverage.source === 'AQS-daily-top-user' && day.coverage.agent === 'user' &&
                    day.coverage.access === 'all-access' && day.coverage.project === 'pt.wikipedia.org' && day.coverage.sourceDefinition === TOP_BOUND_SOURCE &&
                    Number.isInteger(day.coverage.articleCount) && day.coverage.articleCount > 0 && day.coverage.articleCount <= 1000 && day.coverage.minRank === 1 &&
                    Number.isInteger(day.coverage.maxRank) && day.coverage.maxRank >= 1 && day.coverage.maxRank <= 1000, label + 'invalid daily-feed coverage.');
                Object.keys(day.known || {}).forEach(function (id) { check(articles.has(Number(id)) && Number.isSafeInteger(day.known[id]) && day.known[id] >= day.cutoff, label + 'invalid listed-article views.'); });
            } else { check(day.cutoff === null && Object.keys(day.known || {}).length === 0, label + 'unavailable feed provides bounds.'); }
        });
        var expected = clone(section); refreshV3(expected, expectedModel);
        PERIOD_IDS.forEach(function (id) {
            var actual = section.periods[id]; var computed = expected.periods[id];
            check(actual.totalScope === computed.totalScope && actual.allArticleTotal === computed.allArticleTotal && (legacyTopTotals || actual.rankedTotal === computed.rankedTotal) && actual.rows.length <= expectedRankLimit &&
                JSON.stringify(actual.rows) === JSON.stringify(computed.rows) && JSON.stringify(actual.proof) === JSON.stringify(computed.proof) &&
                actual.total === computed.total && actual.rankingComplete === computed.rankingComplete && actual.complete === computed.complete, label + 'unproved or mismatched ' + id + ' ranking.');
        });
        ['period', 'rows', 'total', 'proof', 'complete', 'rankingComplete', 'allPeriodsComplete', 'totalScope', 'allArticleTotal'].concat(legacyTopTotals ? [] : ['rankedTotal']).forEach(function (key) {
            check(JSON.stringify(section[key]) === JSON.stringify(expected[key]), label + 'active-period alias mismatch: ' + key);
        });
        if (section.lastCompleteSnapshot) {
            check((legacyTopTotals ? !own(section.lastCompleteSnapshot, 'totalModel') : section.lastCompleteSnapshot.totalModel === expectedModel) && section.lastCompleteSnapshot.metricVersion === METRIC_VERSION && section.lastCompleteSnapshot.rankLimit === 1000 && !!section.lastCompleteSnapshot.periods && PERIOD_IDS.every(function (id) {
                var result = section.lastCompleteSnapshot.periods[id];
                return result && Array.isArray(result.rows) && result.rows.length <= 1000 && result.rows.every(function (row) { return validTimestamp(row.firstEditAt) && row.countFromDate === effectivePeriod(row, result.period).start; }) && result.totalScope === (grandForModel(expectedModel, id) ? 'all-eligible-articles' : 'ranked-top-' + expectedRankLimit) &&
                    (!result.rankingComplete || (legacyTopTotals ? result.total : result.rankedTotal) === result.rows.reduce(function (sum, row) { return sum + row.views; }, 0)) &&
                    (!result.complete || (result.proof.complete && (grandForModel(expectedModel, id) ? Number.isSafeInteger(result.allArticleTotal) && result.allArticleTotal >= result.rankedTotal && result.total === result.allArticleTotal : result.total === result.rows.reduce(function (sum, row) { return sum + row.views; }, 0))));
            }), label + 'invalid prior snapshot.');
        }
    }

    function validateStateForRank(state, expectedRankLimit, projectionModel) {
        var errors = [];
        function check(condition, message) { if (!condition) { errors.push(message); } }
        try {
            check(!!state && typeof state === 'object' && state.schemaVersion === 4, 'Unsupported state schema.');
            if (!state || typeof state !== 'object') { return { valid: false, errors: errors }; }
            check(!!state.config && typeof state.config === 'object', 'State configuration is missing.');
            var config = normalizeConfig(state.config, expectedRankLimit);
            check(validTimestamp(state.capturedAt), 'Invalid state capture time.');
            var activity = state.activity;
            check(sameIdentity(activity, config), 'Activity identity does not match the state.');
            check(!!activity && Array.isArray(activity.entries), 'Contribution history is missing.');
            if (activity && Array.isArray(activity.entries)) {
                var revids = new Set();
                activity.entries.forEach(function (raw) {
                    var entry = packEntry(raw);
                    check(!revids.has(entry[0]), 'Duplicate cached revision.');
                    revids.add(entry[0]);
                    check(new Date(entry[4]).getTime() <= new Date(state.capturedAt).getTime(), 'Cached edit is in the future.');
                    if (activity.capturedAt) {
                        check(new Date(entry[4]).getTime() <= new Date(activity.capturedAt).getTime(), 'Cached edit follows its activity capture time.');
                    }
                });
                if (activity.complete) {
                    check(validTimestamp(activity.capturedAt) && validTimestamp(activity.fullScanAt), 'Complete activity has no capture or full-scan time.');
                    check(new Date(activity.fullScanAt).getTime() <= new Date(activity.capturedAt).getTime() &&
                        new Date(activity.capturedAt).getTime() <= new Date(state.capturedAt).getTime(), 'Activity capture and full-scan times are inconsistent.');
                    check(!!activity.summary && validTimestamp(activity.summary.asOf), 'Complete activity has no valid summary.');
                    if (activity.summary && validTimestamp(activity.summary.asOf)) {
                        check(new Date(activity.summary.asOf).getTime() <= new Date(state.capturedAt).getTime(), 'Activity summary is in the future.');
                        var expected = summarize(activity.entries, { config: Object.assign({}, config, { rankLimit: 1000 }), now: activity.summary.asOf });
                        Object.keys(expected).forEach(function (key) {
                            if (key !== 'counts') {
                                check(JSON.stringify(activity.summary[key]) === JSON.stringify(expected[key]), 'Cached summary mismatch: ' + key);
                            }
                        });
                        var actualCounts = activity.summary.counts || {};
                        check(Object.keys(actualCounts).length === Object.keys(expected.counts).length &&
                            Object.keys(expected.counts).every(function (date) { return actualCounts[date] === expected.counts[date]; }), 'Cached daily edit counts mismatch.');
                    }
                } else { check(activity.entries.length === 0 && activity.summary === null, 'Incomplete first scan must not expose partial activity.'); }
            }
            check(sameIdentity(state.pageviews, config), 'Article-view identity does not match the state.');
            if (state.pageviews) {
                check(JSON.stringify(state.pageviews.candidates) === JSON.stringify(articleCandidates(activity.entries)), 'First-edit candidate history does not match the complete public contributions.');
                validateV3(state.pageviews, state.capturedAt, check, expectedRankLimit, projectionModel);
                validateCustomCache(state.pageviews,state.capturedAt,check);
            }
        } catch (error) { errors.push(errorInfo(error).message); }
        return { valid: errors.length === 0, errors: errors };
    }

    function validateState(state) { return validateStateForRank(state, 1000); }

    function upgradeAllArticleTotalCache(previous) {
        if (validateState(previous).valid) { return clone(previous); }
        var oldModel = previous && previous.pageviews && own(previous.pageviews, 'totalModel') ? previous.pageviews.totalModel : null;
        if ((oldModel !== null && oldModel !== 'since-all-eligible-v1') || !validateStateForRank(previous, 1000, oldModel).valid) { fail('The previous after-first-edit cache is invalid.', 'invalid-legacy-cache'); }
        var state = clone(previous);
        state.pageviews.totalModel = TOTAL_MODEL;
        state.pageviews.lastCompleteSnapshot = null;
        refreshV3(state.pageviews);
        if (state.pageviews.allPeriodsComplete) { state.pageviews.lastCompleteSnapshot = snapshotV3(state.pageviews); }
        state.complete = state.activity.complete && state.pageviews.complete;
        state.fresh = !state.activity.stale && !state.pageviews.stale;
        var validation = validateState(state);
        if (!validation.valid) { fail('The cumulative total cache upgrade failed: ' + validation.errors.join('; '), 'invalid-upgraded-cache'); }
        return state;
    }

    function upgradeAfterFirstEditCache(previous) {
        if (validateState(previous).valid) { return clone(previous); }
        if (previous && previous.schemaVersion === 4) { return upgradeAllArticleTotalCache(previous); }
        if (!previous || previous.schemaVersion !== 3 || !previous.activity || !previous.activity.complete ||
            !previous.config || typeof previous.config.user !== 'string' || !previous.config.user || previous.config.project !== DEFAULT_CONFIG.project ||
            !validTimestamp(previous.capturedAt)) { fail('The prior public activity cache is invalid.', 'invalid-legacy-cache'); }
        var config = normalizeConfig(Object.assign({}, previous.config, { rankLimit: 1000 }));
        var activity = clone(previous.activity);
        var candidates = articleCandidates(activity.entries);
        var pageviews = newStateV3(config, nowDate(previous.capturedAt), activity, candidates, null);
        var oldMetadata = previous.pageviews && sameIdentity(previous.pageviews, config) && previous.pageviews.metadata;
        if (oldMetadata && Array.isArray(oldMetadata.cohort) && Array.isArray(oldMetadata.excluded)) {
            var byId = new Map(candidates.map(function (article) { return [article.pageid, article]; }));
            pageviews.metadata = { cursor: oldMetadata.cursor, complete: oldMetadata.complete,
                cohort: oldMetadata.cohort.map(function (old) {
                    var candidate = byId.get(old.pageid);
                    if (!candidate || typeof old.title !== 'string' || !old.title) { fail('Legacy metadata is outside the public contribution history.', 'invalid-legacy-cache'); }
                    return Object.assign({}, candidate, { title: old.title });
                }), excluded: clone(oldMetadata.excluded) };
            pageviews.sourcePeriod = sourceForState(periodsFor(pageviews.startedAt),pageviews);
        }
        refreshV3(pageviews);
        var state = { schemaVersion: 4, config: config, capturedAt: previous.capturedAt, activity: activity,
            pageviews: pageviews, complete: activity.complete && pageviews.complete, fresh: !activity.stale && !pageviews.stale, cacheDiscarded: false };
        var validation = validateState(state);
        if (!validation.valid) { fail('The prior activity and metadata cannot be upgraded: ' + validation.errors.join('; '), 'invalid-legacy-cache'); }
        return state;
    }

    function upgradeRankingCache(previous) { return upgradeAfterFirstEditCache(previous); }

    async function update(options) {
        options = options || {};
        var config = normalizeConfig(options.config);
        var now = nowDate(options.now);
        var previous = options.previous || null;
        var cacheDiscarded = false;
        if (previous && (previous.schemaVersion === 3 || (previous.schemaVersion === 4 && (!previous.pageviews || previous.pageviews.totalModel !== TOTAL_MODEL)))) {
            try { previous = upgradeRankingCache(previous); } catch (_) { previous = null; cacheDiscarded = true; }
        }
        if (previous && (!validateState(previous).valid || !previous.config ||
            previous.config.user !== config.user || previous.config.project !== config.project)) {
            previous = null;
            cacheDiscarded = true;
        }
        var common = Object.assign({}, options, { config: config, now: now, requestJson: requireRequest(options), previous: previous });
        var activity = await collectActivity(common);
        function stateWith(pageviews) {
            return { schemaVersion: 4, config: config, capturedAt: now.toISOString(), activity: activity,
                pageviews: pageviews, complete: activity.complete && pageviews.complete,
                fresh: !activity.stale && !pageviews.stale, cacheDiscarded: cacheDiscarded };
        }
        var progressCallback = options.onProgress ? async function (pageviews) { await options.onProgress(stateWith(pageviews)); } : undefined;
        var pageviews = await collectPageviews(Object.assign({}, common, { activity: activity, onProgress: progressCallback }));
        return stateWith(pageviews);
    }

    return Object.freeze({
        DEFAULT_CONFIG: DEFAULT_CONFIG, localDate: localDate, addDate: addDate, dateAdd: addDate,
        summarize: summarize, collectActivity: collectActivity, collectPageviews: collectPageviews,
        update: update, validateState: validateState, upgradeRankingCache: upgradeRankingCache, upgradeAfterFirstEditCache: upgradeAfterFirstEditCache, upgradeAllArticleTotalCache: upgradeAllArticleTotalCache, packEntry: packEntry, unpackEntry: unpackEntry,
        streakGoal: streakGoal, TOP_BLACKLIST_URL: TOP_BLACKLIST_URL,
        periodsFor: periodsFor, addMonthsClamped: addMonthsClamped, PERIOD_IDS: PERIOD_IDS, normalizeCustomRange:normalizeCustomRange,
        METRIC_VERSION: METRIC_VERSION, TOTAL_MODEL: TOTAL_MODEL, COVERAGE_FLOOR: COVERAGE_FLOOR, effectivePeriod: effectivePeriod,
        viewPeriod: function (now) { return viewPeriod(nowDate(now)); }
    });
}));

;

/* PerfilWiki 1.1.0: shared, public Portuguese Wikipedia contribution history. */
(function (root, factory) {
    'use strict';
    var api = factory();
    if (typeof module === 'object' && module.exports) { module.exports = api; }
    if (root) { root.PerfilWikiHistory = api; }
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
    'use strict';

    var PROJECT = 'pt.wikipedia.org';
    var DAY = 86400000;
    var LIMITS = Object.freeze({ entries: 1000000, cursors: 10000, requests: 200, tags: 256 });
    var own = function (object, key) { return Object.prototype.hasOwnProperty.call(object, key); };
    var object = function (value) { return !!value && typeof value === 'object' && !Array.isArray(value); };

    function fail(code, message) {
        var error = new Error(message);
        error.code = code;
        throw error;
    }

    function username(value) {
        if (typeof value !== 'string' || !value.trim() || value.length > 255 || /[\x00-\x1f\x7f]/.test(value)) {
            fail('invalid-user', 'A valid Wikipedia username is required.');
        }
        return value.trim();
    }

    function currentTime(value) {
        var date = value === undefined ? new Date() : new Date(value);
        if (value === null || !Number.isFinite(date.getTime())) { fail('invalid-now', 'The current time is invalid.'); }
        return date;
    }

    function timestamp(value) {
        if (typeof value !== 'string') { fail('invalid-timestamp', 'An ISO UTC timestamp is required.'); }
        var match = /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})(?:\.(\d{1,3}))?Z$/.exec(value);
        var date = new Date(value);
        var expected = match && match[1] + '.' + ((match[2] || '') + '000').slice(0, 3) + 'Z';
        if (!match || !Number.isFinite(date.getTime()) || date.toISOString() !== expected) {
            fail('invalid-timestamp', 'An ISO UTC timestamp is invalid.');
        }
        return expected;
    }

    function text(value, max, label) {
        if (typeof value !== 'string' || !value.length || value.length > max || /[\x00-\x1f\x7f]/.test(value)) {
            fail('invalid-entry', 'An edit has an invalid ' + label + '.');
        }
        return value;
    }

    function tags(value) {
        if (!Array.isArray(value) || value.length > LIMITS.tags) { fail('invalid-entry', 'An edit has invalid tags.'); }
        var result = Array.from(value, function (tag) { return text(tag, 255, 'tag'); }).sort();
        for (var i = 1; i < result.length; i += 1) {
            if (result[i] === result[i - 1]) { fail('invalid-entry', 'An edit repeats a tag.'); }
        }
        return result;
    }

    function packEntry(raw, user, upper, lower, fromApi) {
        if (!fromApi && (!Array.isArray(raw) || raw.length !== 9 && raw.length !== 10)) {
            fail('invalid-entry', 'Cached edits must contain nine or ten fields.');
        }
        if (fromApi && !object(raw)) { fail('invalid-entry', 'An edit must be an API object.'); }
        if (fromApi) {
            ['new', 'minor', 'top', 'patrolled', 'autopatrolled'].forEach(function (flag) {
                if (own(raw, flag) && typeof raw[flag] !== 'boolean') {
                    fail('invalid-entry', 'API edit flags must use formatversion 2 booleans.');
                }
            });
        }
        var result = fromApi ? [raw.revid, raw.pageid, raw.ns, raw.title, raw.timestamp,
            raw.new === true ? 1 : 0, raw.parentid, raw.user, raw.tags,
            Number.isSafeInteger(raw.sizediff) ? raw.sizediff : null] : raw;
        if (!Number.isSafeInteger(result[0]) || result[0] <= 0 ||
            !Number.isSafeInteger(result[1]) || result[1] < 0 ||
            !Number.isSafeInteger(result[2]) || result[2] < 0 ||
            !Number.isSafeInteger(result[6]) || result[6] < 0 || result[6] === result[0] ||
            (result[5] !== 0 && result[5] !== 1)) {
            fail('invalid-entry', 'An edit has invalid identifiers or creation flag.');
        }
        if (typeof result[7] !== 'string' || result[7] !== user || username(result[7]) !== result[7]) {
            fail('wrong-identity', 'An edit belongs to another user or omits its user.');
        }
        var time = timestamp(result[4]);
        if (!fromApi && result.length === 10 && result[9] !== null && !Number.isSafeInteger(result[9])) {
            fail('invalid-entry', 'A cached size difference must be a safe signed integer or null.');
        }
        if (time > upper || (lower && time < lower)) {
            fail('invalid-bounds', 'An edit falls outside the requested time bounds.');
        }
        return [result[0], result[1], result[2], text(result[3], 1024, 'title'), time,
            result[5], result[6], result[7], tags(result[8]), result.length === 10 ? result[9] : null];
    }

    function byteCoverage(entries, scannedAt) {
        var known = entries.reduce(function (count, entry) { return count + (Number.isSafeInteger(entry[9]) ? 1 : 0); }, 0);
        return {version:1, scannedAt:scannedAt, complete:scannedAt !== null && known === entries.length,
            knownEdits:known, totalEdits:entries.length};
    }

    function compare(left, right) { return right[4].localeCompare(left[4]) || right[0] - left[0]; }
    function equal(left, right) { return JSON.stringify(left) === JSON.stringify(right); }

    function cachedEntries(input, user, upper, lower) {
        if (!Array.isArray(input) || input.length > LIMITS.entries) { fail('invalid-cache', 'The history array exceeds its limit or is missing.'); }
        var seen = new Set();
        var last = null;
        return Array.from(input, function (raw) {
            var entry = packEntry(raw, user, upper, lower, false);
            if (seen.has(entry[0])) { fail('invalid-cache', 'Cached revisions must be unique.'); }
            if (last && compare(last, entry) > 0) { fail('invalid-cache', 'Cached edits are out of order.'); }
            seen.add(entry[0]);
            last = entry;
            return entry;
        });
    }

    function cursor(input) {
        if (!object(input) || typeof input.uccontinue !== 'string' || !input.uccontinue ||
            input.uccontinue.length > 2048 || /[\x00-\x1f\x7f]/.test(input.uccontinue)) {
            fail('invalid-continuation', 'The continuation cursor is invalid.');
        }
        var result = { uccontinue: input.uccontinue };
        Object.keys(input).forEach(function (key) {
            if (key !== 'uccontinue' && key !== 'continue') { fail('invalid-continuation', 'The continuation contains an unexpected parameter.'); }
        });
        if (own(input, 'continue')) {
            if (typeof input.continue !== 'string' || input.continue.length > 2048 || /[\x00-\x1f\x7f]/.test(input.continue)) {
                fail('invalid-continuation', 'The generic continuation cursor is invalid.');
            }
            result.continue = input.continue;
        }
        return result;
    }

    function baseState(input, user, now) {
        if (!object(input) || input.user !== user || input.project !== PROJECT) {
            fail('wrong-identity', 'The cached history has a different user or project.');
        }
        if (typeof input.complete !== 'boolean' || typeof input.stale !== 'boolean' || typeof input.cacheHit !== 'boolean' ||
            (input.scanMode !== 'full' && input.scanMode !== 'incremental')) {
            fail('invalid-cache', 'The cached history has invalid status fields.');
        }
        if (input.error !== null && (!object(input.error) || typeof input.error.code !== 'string' ||
            !input.error.code || input.error.code.length > 100 || typeof input.error.message !== 'string' || input.error.message.length > 500)) {
            fail('invalid-cache', 'The cached history has an invalid error.');
        }
        if ((!input.stale && input.error !== null) || (input.cacheHit && input.stale)) {
            fail('invalid-cache', 'The cached freshness and error fields are inconsistent.');
        }
        var result = {
            user: user, project: PROJECT, entries: [], complete: input.complete,
            capturedAt: null, fullScanAt: null, scanMode: input.scanMode,
            cacheHit: input.cacheHit, stale: input.stale, error: input.error ? { code: input.error.code, message: input.error.message } : null,
            pending: null, byteCoverage:byteCoverage([], null)
        };
        if (input.complete) {
            result.capturedAt = timestamp(input.capturedAt);
            result.fullScanAt = timestamp(input.fullScanAt);
            if (result.fullScanAt > result.capturedAt || result.capturedAt > now) {
                fail('invalid-cache', 'The cached history has inconsistent or future timestamps.');
            }
            result.entries = cachedEntries(input.entries, user, result.capturedAt, null);
        } else if (input.capturedAt !== null || input.fullScanAt !== null || !Array.isArray(input.entries) || input.entries.length ||
            input.scanMode !== 'full' || !input.stale || input.cacheHit) {
            fail('invalid-cache', 'An incomplete cold scan must not expose contributions.');
        }
        if (own(input, 'byteCoverage')) {
            var coverage = input.byteCoverage;
            if (!object(coverage) || coverage.version !== 1 || typeof coverage.complete !== 'boolean' ||
                !Number.isSafeInteger(coverage.knownEdits) || !Number.isSafeInteger(coverage.totalEdits)) {
                fail('invalid-cache', 'The byte coverage metadata is invalid.');
            }
            var scannedAt = coverage.scannedAt === null ? null : timestamp(coverage.scannedAt);
            if (scannedAt !== null && (!result.complete || scannedAt !== result.fullScanAt)) {
                fail('invalid-cache', 'The byte coverage must belong to the completed full scan.');
            }
            result.byteCoverage = byteCoverage(result.entries, scannedAt);
            if (coverage.complete !== result.byteCoverage.complete || coverage.knownEdits !== result.byteCoverage.knownEdits ||
                coverage.totalEdits !== result.byteCoverage.totalEdits) { fail('invalid-cache', 'The byte coverage does not match the revisions.'); }
        } else { result.byteCoverage = byteCoverage(result.entries, null); }
        return result;
    }

    function pendingState(input, base, now) {
        if (!object(input) || input.version !== 1 || input.user !== base.user || input.project !== PROJECT ||
            (input.scanMode !== 'full' && input.scanMode !== 'incremental') ||
            own(input, 'sizeDiffVersion') && input.sizeDiffVersion !== 1) {
            fail('invalid-pending', 'The pending scan has a different identity or schema.');
        }
        var anchor = timestamp(input.anchor);
        if (anchor > now || (base.capturedAt && anchor < base.capturedAt) ||
            input.baseCapturedAt !== base.capturedAt || input.baseFullScanAt !== base.fullScanAt) {
            fail('invalid-pending', 'The pending scan has inconsistent or future timestamps.');
        }
        var lower = input.lowerBound === null ? null : timestamp(input.lowerBound);
        if (input.scanMode === 'incremental') {
            if (!base.complete || lower !== overlapStart(base) || lower > anchor) {
                fail('invalid-pending', 'The incremental scan has invalid base history or bounds.');
            }
        } else if (lower !== null) { fail('invalid-pending', 'A full scan cannot have a lower time bound.'); }
        if (!Number.isSafeInteger(input.pagesFetched) || input.pagesFetched < 1 || input.pagesFetched > LIMITS.cursors ||
            !Array.isArray(input.seenCursors) || input.seenCursors.length !== input.pagesFetched) {
            fail('invalid-pending', 'The pending pagination history exceeds its limit or is invalid.');
        }
        var next = cursor(input.cursor);
        var seen = new Set();
        Array.from(input.seenCursors).forEach(function (value) {
            cursor({ uccontinue: value });
            if (seen.has(value)) { fail('invalid-pending', 'The pending scan repeats a cursor.'); }
            seen.add(value);
        });
        if (input.seenCursors[input.seenCursors.length - 1] !== next.uccontinue) {
            fail('invalid-pending', 'The pending cursor does not match its pagination history.');
        }
        var entries = cachedEntries(input.entries, base.user, anchor, lower);
        if (!entries.length) { fail('invalid-pending', 'A continuing scan must contain contributions.'); }
        return {
            version: 1, sizeDiffVersion:input.sizeDiffVersion || 0, user: base.user, project: PROJECT, scanMode: input.scanMode,
            anchor: anchor, lowerBound: lower, baseCapturedAt: base.capturedAt, baseFullScanAt: base.fullScanAt,
            entries: entries, cursor: next, seenCursors: input.seenCursors.slice(), pagesFetched: input.pagesFetched
        };
    }

    function validate(state, options) {
        try {
            options = options || {};
            var user = username(options.user);
            var now = currentTime(options.now).toISOString();
            var base = baseState(state, user, now);
            if (state.pending !== null) {
                pendingState(state.pending, base, now);
                if (!state.stale || state.cacheHit) { fail('invalid-pending', 'Pending history must be stale and cannot be a cache hit.'); }
            }
            return { valid: true, errors: [] };
        } catch (error) {
            return { valid: false, errors: [error.message || 'The history is invalid.'] };
        }
    }

    function overlapStart(base) {
        var latest = base.entries.length ? base.entries[0][4] : base.capturedAt;
        return new Date(new Date(latest).getTime() - DAY).toISOString();
    }

    function apiUrl(user, stage) {
        var url = new URL('https://' + PROJECT + '/w/api.php');
        var params = {
            action: 'query', format: 'json', formatversion: 2, origin: '*', maxlag: 5,
            list: 'usercontribs', ucuser: user, ucprop: 'ids|title|timestamp|flags|tags|sizediff',
            ucdir: 'older', uclimit: 500, ucstart: stage.anchor
        };
        if (stage.lowerBound) { params.ucend = stage.lowerBound; }
        if (stage.cursor) { Object.assign(params, stage.cursor); }
        Object.keys(params).forEach(function (key) { url.searchParams.set(key, String(params[key])); });
        return url.toString();
    }

    function responseEntries(response) {
        if (!object(response)) { fail('invalid-response', 'The service returned an invalid response.'); }
        if (own(response, 'error')) { fail('api-error', 'The service reported an API error.'); }
        if (own(response, 'warnings') && (!object(response.warnings) || Object.keys(response.warnings).length)) {
            fail('api-warning', 'The service returned an incomplete response warning.');
        }
        if (!object(response.query) || !Array.isArray(response.query.usercontribs) || response.query.usercontribs.length > 500) {
            fail('invalid-response', 'The contribution batch is invalid or missing.');
        }
        if (own(response, 'batchcomplete') && typeof response.batchcomplete !== 'boolean') {
            fail('invalid-response', 'Completion flags must use formatversion 2 booleans.');
        }
        return response.query.usercontribs;
    }

    function errorInfo(error) {
        return { code: String(error && error.code || 'request-failed').slice(0, 100),
            message: String(error && error.message || 'The history request failed.').slice(0, 500) };
    }

    function duration(value, fallback, name) {
        if (value === undefined) { return fallback; }
        if (!Number.isFinite(value) || value < 0 || value > Number.MAX_SAFE_INTEGER) { fail('invalid-options', name + ' must be a non-negative duration.'); }
        return value;
    }

    function emptyState(user) {
        return { user: user, project: PROJECT, entries: [], complete: false, capturedAt: null, fullScanAt: null,
            scanMode: 'full', cacheHit: false, stale: true, error: null, pending: null, byteCoverage:byteCoverage([],null) };
    }

    // requestJson receives a URL for a public GET. It must not add authentication or write parameters.
    // force bypasses the freshness cache. It does not discard a valid resumable scan.
    async function collect(options) {
        options = options || {};
        var user = username(options.user);
        var now = currentTime(options.now).toISOString();
        var nowMs = new Date(now).getTime();
        var budget = options.maxRequests === undefined ? 20 : options.maxRequests;
        var fullRescanMs = duration(options.fullRescanMs, 30 * DAY, 'fullRescanMs');
        var refreshMs = duration(options.refreshMs, 300000, 'refreshMs');
        if (!Number.isSafeInteger(budget) || budget < 1 || budget > LIMITS.requests ||
            (options.force !== undefined && typeof options.force !== 'boolean')) {
            fail('invalid-options', 'maxRequests must be an integer from 1 to ' + LIMITS.requests + ', and force must be boolean.');
        }
        if (typeof options.requestJson !== 'function') { fail('invalid-options', 'requestJson(url) is required.'); }

        var base = emptyState(user);
        var stage = null;
        if (options.previous) {
            try {
                base = baseState(options.previous, user, now);
                if (options.previous.pending !== null) {
                    try { stage = pendingState(options.previous.pending, base, now); }
                    catch (ignorePending) { stage = null; }
                }
            } catch (ignoreCache) { base = emptyState(user); }
        }
        // A legacy cache gets one resumable full scan for sizediff. A completed
        // attempt remains cacheable even when a hidden delta stays unavailable.
        if (stage && stage.sizeDiffVersion !== 1) { stage = null; }
        var full = !base.complete || !base.byteCoverage.scannedAt || nowMs - new Date(base.fullScanAt).getTime() >= fullRescanMs;
        if (!stage && base.complete && !base.stale && !base.error && !full && !options.force &&
            nowMs - new Date(base.capturedAt).getTime() < refreshMs) {
            base.cacheHit = true;
            return base;
        }
        if (!stage) {
            stage = { version: 1, sizeDiffVersion:1, user: user, project: PROJECT, scanMode: full ? 'full' : 'incremental',
                anchor: now, lowerBound: full ? null : overlapStart(base), baseCapturedAt: base.capturedAt,
                baseFullScanAt: base.fullScanAt, entries: [], cursor: null, seenCursors: [], pagesFetched: 0 };
        }
        base.cacheHit = false;
        base.stale = true;
        base.error = null;
        var fetched = new Map(stage.entries.map(function (entry) { return [entry[0], entry]; }));
        var seenCursors = new Set(stage.seenCursors);

        try {
            for (var request = 0; request < budget; request += 1) {
                var response = await options.requestJson(apiUrl(user, stage));
                var batch = responseEntries(response);
                var page = Array.from(batch, function (raw) { return packEntry(raw, user, stage.anchor, stage.lowerBound, true); });
                var additions = new Map();
                var boundary = stage.entries.length ? stage.entries[stage.entries.length - 1] : null;
                page.forEach(function (entry, index) {
                    if (index && compare(page[index - 1], entry) > 0) { fail('pagination-no-progress', 'The contribution batch is out of order.'); }
                    var existing = fetched.get(entry[0]) || additions.get(entry[0]);
                    if (existing && !equal(existing, entry)) { fail('conflicting-revision', 'A revision was repeated with conflicting data.'); }
                    if (!existing) {
                        if (boundary && compare(boundary, entry) >= 0) {
                            fail('pagination-no-progress', 'The contribution cursor did not move to older edits.');
                        }
                        additions.set(entry[0], entry);
                    }
                });
                if (fetched.size + additions.size > LIMITS.entries) { fail('history-limit', 'The contribution history exceeds the entry limit.'); }
                var next = null;
                if (own(response, 'continue')) {
                    next = cursor(response.continue);
                    if (!additions.size) { fail('pagination-no-progress', 'The contribution cursor returned no new revisions.'); }
                    if (seenCursors.has(next.uccontinue)) { fail('pagination-loop', 'The contribution cursor repeated.'); }
                    if (stage.pagesFetched >= LIMITS.cursors) { fail('history-limit', 'The contribution scan exceeds the cursor limit.'); }
                } else if (response.batchcomplete !== true) {
                    fail('incomplete-history', 'The contribution history has no completion marker.');
                }
                // Commit a page only after all its entries and continuation have passed validation.
                additions.forEach(function (entry, revid) { fetched.set(revid, entry); });
                // Every new entry is older than the previous boundary, so appending keeps the cache ordered.
                stage.entries = stage.entries.concat(Array.from(additions.values()));
                stage.pagesFetched += 1;
                if (!next) {
                    var merged = new Map();
                    if (stage.scanMode === 'incremental') {
                        base.entries.forEach(function (entry) {
                            if (entry[4] < stage.lowerBound) { merged.set(entry[0], entry); }
                        });
                    }
                    fetched.forEach(function (entry, revid) { merged.set(revid, entry); });
                    if (merged.size > LIMITS.entries) { fail('history-limit', 'The merged history exceeds the entry limit.'); }
                    var completeEntries = Array.from(merged.values()).sort(compare);
                    return { user: user, project: PROJECT, entries: completeEntries, complete: true,
                        capturedAt: stage.anchor, fullScanAt: stage.scanMode === 'full' ? stage.anchor : base.fullScanAt,
                        scanMode: stage.scanMode, cacheHit: false, stale: nowMs - new Date(stage.anchor).getTime() >= refreshMs,
                        error: null, pending: null,
                        byteCoverage:byteCoverage(completeEntries, stage.scanMode === 'full' ? stage.anchor : base.byteCoverage.scannedAt) };
                }
                stage.cursor = next;
                stage.seenCursors.push(next.uccontinue);
                seenCursors.add(next.uccontinue);
            }
            base.pending = stage;
            return base;
        } catch (error) {
            base.error = errorInfo(error);
            // A failed page never advances the persisted cursor or contaminates the complete history.
            base.pending = stage.cursor && stage.pagesFetched === stage.seenCursors.length ? stage : null;
            return base;
        }
    }

    function richToActivityEntries(history) {
        if (!history || history.complete !== true) { fail('incomplete-history', 'A complete history is required for activity statistics.'); }
        var checked = validate(history, { user: history.user, now: new Date() });
        if (!checked.valid) { fail('invalid-cache', checked.errors[0]); }
        return history.entries.map(function (entry) { return entry.slice(0, 6); });
    }

    return Object.freeze({ collect: collect, validate: validate, richToActivityEntries: richToActivityEntries, limits: LIMITS });
}));

;

/* PerfilWiki 1.1.0. Public statistics collectors, without DOM, timers or personal data. */
(function (root, factory) {
    'use strict';
    var api = factory(typeof module === 'object' && module.exports ? require('./UserGroups.js') : root.PerfilWikiUserGroups);
    if (typeof module === 'object' && module.exports) { module.exports = api; }
    else { root.PerfilWikiStatistics = api; }
}(typeof globalThis === 'object' ? globalThis : this, function (userGroups) {
    'use strict';
    var DAY = 86400000, GLOBAL_TTL = 300000, MAX_PROJECTS = 2000, MAX_PAGES = 200000, MAX_LOGS = 250000;
    var METRICS = ['edits', 'thanks', 'articles', 'edited', 'technicalCreated', 'reverts', 'bestStreak', 'registration',
        'bytesAdded', 'bytesRemoved', 'averageBytesPerEdit', 'largestAddition', 'largestRemoval', 'thanksSent', 'earliestRegistration'];
    var BYTE_METRICS = ['bytesAdded', 'bytesRemoved', 'averageBytesPerEdit', 'largestAddition', 'largestRemoval'];
    var OPTIONAL_METRICS = BYTE_METRICS.concat(['thanksSent','earliestRegistration']);
    var PROJECT = 'pt.wikipedia.org';
    var own = function (o, k) { return Object.prototype.hasOwnProperty.call(o, k); };
    function clone(value) { return JSON.parse(JSON.stringify(value)); }
    function integer(value) { return Number.isSafeInteger(value) && value >= 0; }
    function positive(value) { return integer(value) && value > 0; }
    function username(value) { return typeof value === 'string' && value === value.trim() && value.length > 0 && value.length <= 255 && !/[\x00-\x1f\x7f|<>\[\]{}#]/.test(value); }
    function validTime(value, now) {
        if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value)) { return false; }
        var time = Date.parse(value);
        return Number.isFinite(time) && new Date(time).toISOString().replace('.000Z', 'Z') === value.replace('.000Z', 'Z') && (now === undefined || time <= now);
    }
    function object(value) { return !!value && typeof value === 'object' && !Array.isArray(value); }
    function flag(o, key) { return own(o, key) && (o[key] === true || o[key] === 1 || o[key] === ''); }
    function projectKey(value) { return typeof value === 'string' && value.length <= 64 && /^[a-z0-9_]+$/.test(value) && ['__proto__', 'constructor', 'prototype'].indexOf(value) < 0; }
    function recipientTitle(value) {
        if (typeof value !== 'string' || value.length > 1024 || value !== value.trim() ||
            !/^[^\x00-\x1f\x7f-\x9f|<>\[\]{}#:]+:[^\x00-\x1f\x7f-\x9f|<>\[\]{}#:]+$/.test(value)) { return false; }
        var separator = value.indexOf(':');
        return value.slice(0,separator).trim().length > 0 && value.slice(separator + 1).trim().length > 0;
    }
    function allowedOrigin(value) {
        var url = new URL(value);
        if (url.protocol !== 'https:' || url.username || url.password || url.port ||
            !/(^|\.)(wikipedia|wikimedia|wikidata|wiktionary|wikibooks|wikinews|wikiquote|wikisource|wikiversity|wikivoyage|mediawiki|wikifunctions)\.org$/.test(url.hostname)) {
            throw new Error('Endereço de projeto inválido.');
        }
        return url.origin;
    }
    function queryUrl(origin, params) {
        var url = new URL('/w/api.php', allowedOrigin(origin));
        var all = Object.assign({ action: 'query', format: 'json', formatversion: 2, origin: '*', maxlag: 5 }, params);
        Object.keys(all).forEach(function (key) { url.searchParams.set(key, String(all[key])); });
        return url.toString();
    }
    function responseData(data) {
        if (!object(data) || data.error || data.warnings && Object.keys(data.warnings).length) {
            var error = new Error('Resposta pública incompleta.');
            error.code = data && data.error && data.error.code;
            error.detail = data && JSON.stringify(data.error || data.warnings || {});
            throw error;
        }
        return data;
    }
    function completed(data) { return !data.continue && flag(data, 'batchcomplete'); }
    function safeSum(values) {
        var sum = values.reduce(function (a, b) { if (!integer(b)) { throw new Error('Contagem incompleta.'); } return a + b; }, 0);
        if (!integer(sum)) { throw new Error('Contagem fora do limite numérico.'); }
        return sum;
    }
    function registrationData(info,user,now) {
        var at = Date.parse(now);
        if (!username(user) || !validTime(now) || !object(info) || info.name !== user ||
            ['missing','invalid','hidden','suppressed'].some(function (key) { return flag(info,key); }) ||
            !Array.isArray(info.merged) || info.merged.length > MAX_PROJECTS) { throw new Error('Identidade de registro global incompleta.'); }
        function timestamp(value) {
            if (value === undefined || value === null) { return null; }
            if (!validTime(value,at)) { throw new Error('Data de criação inválida.'); }
            return value;
        }
        var globalRegistration = timestamp(info.registration), seen = new Set();
        var accounts = Array.from(info.merged).map(function (account) {
            if (!object(account) || !projectKey(account.wiki) || seen.has(account.wiki) ||
                own(account,'name') && account.name !== user || own(account,'user') && account.user !== user ||
                ['missing','invalid','hidden','suppressed'].some(function (key) { return flag(account,key); })) {
                throw new Error('Conta vinculada sem identidade completa.');
            }
            seen.add(account.wiki);
            return {wiki:account.wiki,url:allowedOrigin(account.url),registration:timestamp(account.registration)};
        }).sort(function (a,b) { return a.wiki < b.wiki ? -1 : a.wiki > b.wiki ? 1 : 0; });
        var earliest = globalRegistration;
        accounts.forEach(function (account) {
            if (account.registration !== null && (earliest === null || Date.parse(account.registration) < Date.parse(earliest))) { earliest = account.registration; }
        });
        return {earliestRegistration:earliest,registrationCoverage:{version:1,user:user,checkedAt:now,
            complete:globalRegistration !== null && accounts.every(function (account) { return account.registration !== null; }),
            globalRegistration:globalRegistration,accounts:accounts}};
    }
    function technicalSubpageExcluded(title) {
        var value = title.replace(/_/g, ' ').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
        if (/(?:^|[._ -])(?:test|tests|teste|testes|spec)\.js$/.test(value.split(':').pop())) { return true; }
        return value.split('/').slice(1).some(function (part) {
            return /^(?:doc|documentacao|documentation|teste|testes|test|tests|testcases|casos de teste|sandbox|caixa de areia)(?:$|[ ._-])/.test(part) ||
                /(?:^|[._ -])(?:test|tests|teste|testes|spec)\.js$/.test(part);
        });
    }
    function technicalKind(page) {
        if (!page || page.missing || page.redirect || typeof page.title !== 'string' || !page.title || typeof page.contentmodel !== 'string' || technicalSubpageExcluded(page.title)) { return null; }
        var model = page.contentmodel.toLowerCase();
        if (page.ns === 10 && model === 'wikitext' && !/\.(?:css|json|js)$/i.test(page.title)) { return 'template'; }
        if (page.ns === 828 && model === 'scribunto') { return 'module'; }
        if ((page.ns === 2 || page.ns === 8) && model === 'javascript') { return 'script'; }
        return null;
    }
    function blank(user, now) {
        var metrics = {}, updated = {};
        METRICS.forEach(function (key) { metrics[key] = null; updated[key] = null; });
        return { schema: 1, user: user, project: PROJECT, capturedAt: now, metrics: metrics, metricUpdatedAt: updated,
            errors: [], pending: false, projects: {}, pageInfo: {}, global: null, metadataScan: null, articlesScan: null, byteCoverage:null,
            thanksSentScan:null, thanksSentCoverage:null, registrationCoverage:null };
    }
    function validate(state, options) {
        options = options || {};
        var errors = [], now = options.now === undefined ? Date.now() : new Date(options.now).getTime();
        function check(condition, message) { if (!condition && errors.length < 100) { errors.push(message); } }
        function time(value) { return validTime(value, now); }
        function optionalTime(value) { return value === null || time(value); }
        try {
            check(Number.isFinite(now), 'Horário inválido.');
            check(object(state) && state.schema === 1 && state.project === PROJECT && username(state.user), 'Identidade ou formato inválido.');
            if (!object(state)) { return { valid: false, errors: errors }; }
            check(!options.user || state.user === options.user, 'O cache pertence a outro usuário.');
            check(time(state.capturedAt), 'Horário futuro ou inválido no cache.');
            if (state.userGroups !== undefined && state.userGroups !== null) {
                check(!!userGroups && !!userGroups.fromProof(state.userGroups,state.user,now), 'Estatutos sem conferência pública válida.');
            }
            if (state.userGroupsAttemptAt !== undefined && state.userGroupsAttemptAt !== null) {
                check(time(state.userGroupsAttemptAt), 'Horário de consulta dos estatutos inválido.');
            }
            check(object(state.metrics) && object(state.metricUpdatedAt), 'Métricas ausentes.');
            METRICS.forEach(function (key) {
                var value = state.metrics && state.metrics[key], updated = state.metricUpdatedAt && state.metricUpdatedAt[key];
                // Earlier caches remain valid without the optional counters.
                if (OPTIONAL_METRICS.indexOf(key) >= 0 && value === undefined && updated === undefined) { return; }
                check(key === 'registration' || key === 'earliestRegistration' ? value === null || time(value) : key === 'averageBytesPerEdit' ? value === null ||
                    typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= Number.MAX_SAFE_INTEGER : value === null || integer(value), 'Métrica inválida: ' + key);
                check(optionalTime(updated), 'Horário da métrica inválido: ' + key);
                check(value === null || updated !== null, 'Métrica sem horário: ' + key);
            });
            if (state.byteCoverage !== undefined && state.byteCoverage !== null) {
                var coverage = state.byteCoverage;
                check(object(coverage) && coverage.version === 1 && typeof coverage.complete === 'boolean' &&
                    integer(coverage.knownEdits) && integer(coverage.totalEdits) && coverage.knownEdits <= coverage.totalEdits &&
                    optionalTime(coverage.scannedAt) && (!coverage.complete || coverage.scannedAt !== null && coverage.knownEdits === coverage.totalEdits), 'Cobertura de bytes inválida.');
            }
            BYTE_METRICS.forEach(function (key) {
                if (state.metrics && state.metrics[key] !== null && state.metrics[key] !== undefined) {
                    check(state.byteCoverage && state.byteCoverage.complete === true, 'Contagem de bytes sem cobertura completa.');
                }
            });
            if (state.metrics && state.metrics.averageBytesPerEdit !== null && state.metrics.averageBytesPerEdit !== undefined) {
                check(integer(state.metrics.bytesAdded) && state.byteCoverage &&
                    state.metrics.averageBytesPerEdit === (state.byteCoverage.totalEdits ? state.metrics.bytesAdded / state.byteCoverage.totalEdits : 0), 'Média de bytes sem denominador completo.');
            }
            if (state.thanksSentScan !== undefined && state.thanksSentScan !== null) {
                var sentScan = state.thanksSentScan;
                check(object(sentScan) && time(sentScan.anchorAt) && Array.isArray(sentScan.logids) && sentScan.logids.length <= MAX_LOGS &&
                    Array.from(sentScan.logids).every(positive) && new Set(sentScan.logids).size === sentScan.logids.length, 'Fila de agradecimentos enviados inválida.');
                check(Array.isArray(sentScan.seen) && sentScan.seen.length <= 2000 && Array.from(sentScan.seen).every(function (s) {
                    return typeof s === 'string' && s.length > 0 && s.length <= 1024;
                }) && new Set(sentScan.seen).size === sentScan.seen.length, 'Cursores de agradecimentos enviados inválidos.');
                check(sentScan.continuation === null || object(sentScan.continuation) && typeof sentScan.continuation.lecontinue === 'string' &&
                    sentScan.continuation.lecontinue.length > 0 && sentScan.continuation.lecontinue.length <= 1024 &&
                    Object.keys(sentScan.continuation).every(function (k) { return k === 'lecontinue' || k === 'continue'; }) &&
                    (!own(sentScan.continuation,'continue') || typeof sentScan.continuation.continue === 'string' && sentScan.continuation.continue.length <= 1024), 'Continuação de agradecimentos enviados inválida.');
                if (object(sentScan) && Array.isArray(sentScan.logids) && Array.isArray(sentScan.seen)) {
                    check(sentScan.continuation === null ? sentScan.logids.length === 0 && sentScan.seen.length === 0 :
                        object(sentScan.continuation) && sentScan.logids.length > 0 && sentScan.seen.indexOf(sentScan.continuation.lecontinue) >= 0,
                        'Cursor de agradecimentos enviados sem página conferida.');
                }
            }
            if (state.thanksSentCoverage !== undefined && state.thanksSentCoverage !== null) {
                var sentCoverage = state.thanksSentCoverage;
                check(object(sentCoverage) && sentCoverage.version === 1 && time(sentCoverage.completedAt) && integer(sentCoverage.count) &&
                    state.metrics.thanksSent === sentCoverage.count && state.metricUpdatedAt.thanksSent === sentCoverage.completedAt,
                    'Cobertura de agradecimentos enviados inválida.');
            }
            if (state.metrics && state.metrics.thanksSent !== null && state.metrics.thanksSent !== undefined) {
                check(!!state.thanksSentCoverage, 'Agradecimentos enviados sem conferência completa.');
            }
            if (state.registrationCoverage !== undefined && state.registrationCoverage !== null) {
                var registration = state.registrationCoverage;
                check(object(registration) && registration.version === 1 && registration.user === state.user && time(registration.checkedAt) &&
                    typeof registration.complete === 'boolean' && optionalTime(registration.globalRegistration), 'Cobertura de criação de conta inválida.');
                var derivedRegistration = registrationData({name:registration.user,registration:registration.globalRegistration,merged:registration.accounts},state.user,registration.checkedAt);
                check(registration.complete === derivedRegistration.registrationCoverage.complete &&
                    registration.accounts.every(function (account,index) {
                        var derived = derivedRegistration.registrationCoverage.accounts[index];
                        return account.wiki === derived.wiki && account.url === derived.url && account.registration === derived.registration;
                    }) &&
                    state.metrics.earliestRegistration === derivedRegistration.earliestRegistration &&
                    state.metricUpdatedAt.earliestRegistration === registration.checkedAt, 'Data de criação sem provas correspondentes.');
            }
            if (state.metrics && (state.metrics.earliestRegistration !== null && state.metrics.earliestRegistration !== undefined ||
                state.metricUpdatedAt.earliestRegistration !== null && state.metricUpdatedAt.earliestRegistration !== undefined)) {
                check(!!state.registrationCoverage, 'Data de criação sem conferência global.');
            }
            check(Array.isArray(state.errors) && state.errors.length <= 100 && Array.from(state.errors).every(function (e) { return typeof e === 'string' && e.length <= 300; }), 'Erros inválidos.');
            check(typeof state.pending === 'boolean', 'Fila inválida.');
            check(object(state.projects) && Object.keys(state.projects).length <= MAX_PROJECTS, 'Projetos inválidos.');
            Object.keys(state.projects || {}).forEach(function (key) {
                var p = state.projects[key];
                check(projectKey(key) && object(p) && p.url === allowedOrigin(p.url) && integer(p.editcount), 'Projeto inválido.');
                ['thanks', 'articles'].forEach(function (field) { check(p[field] === null || integer(p[field]), 'Contagem de projeto inválida.'); check(optionalTime(p[field + 'At']), 'Horário de projeto inválido.'); });
                if (p.thanksScan) {
                    var scan = p.thanksScan;
                    check(object(scan) && time(scan.anchorAt) && Array.isArray(scan.logids) && scan.logids.length <= MAX_LOGS && Array.from(scan.logids).every(positive) && new Set(scan.logids).size === scan.logids.length, 'Fila de agradecimentos inválida.');
                    check(Array.isArray(scan.seen) && scan.seen.length <= 2000 && Array.from(scan.seen).every(function (s) { return typeof s === 'string' && s.length > 0 && s.length <= 1024; }) && new Set(scan.seen).size === scan.seen.length, 'Cursores inválidos.');
                    check(scan.continuation === null || object(scan.continuation) && typeof scan.continuation.lecontinue === 'string' && scan.continuation.lecontinue.length > 0 && scan.continuation.lecontinue.length <= 1024 &&
                        Object.keys(scan.continuation).every(function (k) { return k === 'lecontinue' || k === 'continue'; }) && (!own(scan.continuation, 'continue') || typeof scan.continuation.continue === 'string'), 'Continuação inválida.');
                }
            });
            check(object(state.pageInfo) && Object.keys(state.pageInfo).length <= MAX_PAGES, 'Metadados inválidos.');
            Object.keys(state.pageInfo || {}).forEach(function (key) {
                var p = state.pageInfo[key];
                check(/^[1-9]\d*$/.test(key) && positive(Number(key)) && object(p) && p.pageid === Number(key) && time(p.checkedAt) && typeof p.missing === 'boolean' && typeof p.redirect === 'boolean', 'Página inválida.');
                if (!p.missing) { check(integer(p.ns) && typeof p.title === 'string' && p.title.length > 0 && p.title.length <= 1024 && typeof p.contentmodel === 'string' && p.contentmodel.length > 0 && p.contentmodel.length <= 128, 'Tipo de página inválido.'); }
            });
            if (state.global) {
                var global = state.global;
                check(object(global) && time(global.infoAt) && time(global.anchorAt) && optionalTime(global.thanksCompleteAt) && integer(global.editcount) && Array.isArray(global.accountKeys) && global.accountKeys.length <= MAX_PROJECTS && new Set(global.accountKeys).size === global.accountKeys.length && Array.from(global.accountKeys).every(function (k) { return projectKey(k) && own(state.projects, k); }), 'Fotografia global inválida.');
            }
            ['metadataScan', 'articlesScan'].forEach(function (key) {
                var scan = state[key];
                if (scan) { check(object(scan) && time(scan.anchorAt) && typeof scan.force === 'boolean' && typeof scan.complete === 'boolean', 'Conferência pendente inválida.'); }
            });
        } catch (_) { errors.push('Cache inválido.'); }
        return { valid: errors.length === 0, errors: errors };
    }
    function validateHistory(history, user, now) {
        if (!history || history.user !== user || history.project !== PROJECT || history.complete !== true || !Array.isArray(history.entries) || history.entries.length > 2000000 || !validTime(history.capturedAt, now)) { throw new Error('Histórico local completo indisponível.'); }
        var seen = new Map();
        Array.from(history.entries).forEach(function (entry) {
            if (!Array.isArray(entry) || entry.length !== 9 && entry.length !== 10 || !positive(entry[0]) || !integer(entry[1]) || !integer(entry[2]) || typeof entry[3] !== 'string' || !entry[3] || entry[3].length > 1024 || !validTime(entry[4], now) ||
                (entry[5] !== 0 && entry[5] !== 1) || !integer(entry[6]) || entry[7] !== user || !Array.isArray(entry[8]) || entry[8].length > 500 || Array.from(entry[8]).some(function (t) { return typeof t !== 'string' || !t || t.length > 255; })) { throw new Error('Provas do histórico local inválidas.'); }
            if (entry.length === 10 && entry[9] !== null && !Number.isSafeInteger(entry[9])) { throw new Error('Diferença de tamanho inválida.'); }
            var previous = seen.get(entry[0]);
            if (previous && JSON.stringify(previous) !== JSON.stringify(entry)) { throw new Error('Revisão com provas conflitantes.'); }
            seen.set(entry[0], entry);
        });
        return Array.from(seen.values());
    }
    function totalsFromEntries(entries, history, now) {
        var known = entries.filter(function (entry) { return Number.isSafeInteger(entry[9]); }).length;
        var proof = history.byteCoverage;
        var scannedAt = proof && validTime(proof.scannedAt, now) && proof.scannedAt === history.fullScanAt ? proof.scannedAt : null;
        var complete = !!(proof && proof.version === 1 && proof.complete === true && scannedAt &&
            proof.knownEdits === known && proof.totalEdits === entries.length && known === entries.length);
        var result = {bytesAdded:null, bytesRemoved:null, averageBytesPerEdit:null, largestAddition:null, largestRemoval:null, byteCoverage:{version:1, scannedAt:scannedAt,
            complete:complete, knownEdits:known, totalEdits:entries.length}};
        if (complete) {
            var added = 0, removed = 0, largestAddition = 0, largestRemoval = 0;
            entries.forEach(function (entry) {
                if (entry[9] > 0) { added += entry[9]; largestAddition = Math.max(largestAddition,entry[9]); }
                else if (entry[9] < 0) { removed -= entry[9]; largestRemoval = Math.max(largestRemoval,-entry[9]); }
            });
            result.largestAddition = largestAddition; result.largestRemoval = largestRemoval;
            if (integer(added) && integer(removed)) {
                result.bytesAdded = added; result.bytesRemoved = removed;
                result.averageBytesPerEdit = entries.length ? added / entries.length : 0;
            }
        }
        return result;
    }
    function byteTotals(history, user, now) {
        var at = now === undefined ? Date.now() : new Date(now).getTime();
        return totalsFromEntries(validateHistory(history,user,at),history,at);
    }
    function articleCount(data, user, host) {
        responseData(data);
        if (data.username !== user || data.project !== host || Number(data.namespace) !== 0 || data.redirects !== 'noredirects' || data.deleted !== 'all' || !object(data.counts)) { throw new Error('Resposta do XTools inválida.'); }
        if (!Object.keys(data.counts).length) { return 0; }
        if (!data.counts['0'] || !integer(data.counts['0'].count)) { throw new Error('Total de artigos incompleto.'); }
        return data.counts['0'].count;
    }
    async function collect(options) {
        options = options || {};
        var user = options.user, date = options.now === undefined ? new Date() : new Date(options.now), nowMs = date.getTime();
        if (!username(user) || !Number.isFinite(nowMs) || typeof options.requestJson !== 'function') { throw new Error('Usuário, horário ou transporte inválido.'); }
        var now = date.toISOString(), limit = options.maxRequests === undefined ? 20 : options.maxRequests;
        if (!Number.isInteger(limit) || limit < 1 || limit > 1000) { throw new Error('Orçamento de consultas inválido.'); }
        var state = options.previous && validate(options.previous, { user: user, now: now }).valid ? clone(options.previous) : blank(user, now);
        OPTIONAL_METRICS.forEach(function (key) { if (!own(state.metrics,key)) { state.metrics[key] = null; state.metricUpdatedAt[key] = null; } });
        if (!own(state,'byteCoverage')) { state.byteCoverage = null; }
        if (!own(state,'thanksSentScan')) { state.thanksSentScan = null; }
        if (!own(state,'thanksSentCoverage')) { state.thanksSentCoverage = null; }
        if (!own(state,'registrationCoverage')) { state.registrationCoverage = null; }
        var previousGroupError = state.errors.indexOf('Estatutos na ptwiki') >= 0;
        state.capturedAt = now; state.errors = []; state.pending = false;
        var remaining = limit, budgetExhausted = false;
        function error(label) { if (!budgetExhausted && state.errors.length < 100 && state.errors.indexOf(label) < 0) { state.errors.push(label); } }
        function setMetric(key, value, at) { state.metrics[key] = value; state.metricUpdatedAt[key] = at || now; }
        async function request(url) {
            if (!remaining || budgetExhausted) { var error = new Error('Orçamento esgotado.'); error.code='request-budget'; budgetExhausted=true; throw error; }
            remaining -= 1;
            try { return responseData(await options.requestJson(url)); }
            catch (failure) { if (failure && failure.code === 'request-budget') { budgetExhausted=true; } throw failure; }
        }
        var entries = null;
        try { entries = validateHistory(options.history, user, nowMs); }
        catch (_) { error('Histórico local completo indisponível'); }
        var activity = options.activity;
        if (activity && activity.complete && activity.identity && activity.identity.user === user && activity.identity.project === PROJECT && validTime(activity.capturedAt, nowMs) && activity.summary && integer(activity.summary.bestStreak)) {
            setMetric('bestStreak', activity.summary.bestStreak, activity.capturedAt);
        }
        if (entries) {
            setMetric('reverts', entries.filter(function (entry) { return entry[8].some(function (tag) { return ['mw-rollback', 'mw-undo', 'mw-manual-revert'].indexOf(tag) >= 0; }); }).length, options.history.capturedAt);
            var bytes = totalsFromEntries(entries,options.history,nowMs);
            state.byteCoverage = bytes.byteCoverage;
            BYTE_METRICS.forEach(function (key) {
                state.metrics[key] = bytes[key];
                state.metricUpdatedAt[key] = bytes[key] === null ? null : options.history.capturedAt;
            });
        }
        // Optional public ptwiki groups are independent of edit metrics and
        // profile/cache identity. The selected account's public list needs
        // only one anonymous GET, no tokens or access to private preferences.
        if (options.includeUserGroups === true && (!state.userGroups || options.force ||
            nowMs - Date.parse(state.userGroupsAttemptAt || state.userGroups.checkedAt) >= DAY)) {
            if (!own(state,'userGroups')) { state.userGroups = null; }
            if (!remaining) { state.pending = true; }
            else {
                try {
                    state.userGroupsAttemptAt = now;
                    var groupResponse = await request(queryUrl('https://' + PROJECT,{list:'users',ususers:user,usprop:'groups|implicitgroups'}));
                    var groupUsers = groupResponse.query && groupResponse.query.users;
                    if (!userGroups || !completed(groupResponse) || own(groupResponse,'continue') || !Array.isArray(groupUsers) || groupUsers.length !== 1 ||
                        !object(groupUsers[0]) || groupUsers[0].name !== user || !positive(groupUsers[0].userid) ||
                        ['missing','invalid','hidden','suppressed'].some(function (key) { return own(groupUsers[0],key); }) ||
                        !Array.isArray(groupUsers[0].groups) || !Array.isArray(groupUsers[0].implicitgroups)) { throw new Error('Estatutos públicos incompletos.'); }
                    var groups = userGroups.normalize(userGroups.normalize(groupUsers[0].groups).concat(userGroups.normalize(groupUsers[0].implicitgroups)));
                    state.userGroups = {version:1,user:user,project:PROJECT,checkedAt:now,groups:groups};
                } catch (_) { error('Estatutos na ptwiki'); }
            }
        } else if (options.includeUserGroups === true && previousGroupError) { error('Estatutos na ptwiki'); }
        // This optional count reads only the public log of the selected account
        // on ptwiki. Its cursor and verified total are independent of received thanks.
        if (options.deferDetails !== true && options.includeThanksSent === true) {
            var sent = state.thanksSentScan;
            if (!sent && (state.metrics.thanksSent === null || options.force ||
                nowMs - Date.parse(state.metricUpdatedAt.thanksSent) >= GLOBAL_TTL)) {
                sent = state.thanksSentScan = {anchorAt:now,logids:[],continuation:null,seen:[]};
            }
            var sentBudget = Math.min(remaining,Math.max(1,Math.floor(limit / 4)));
            while (sent && sentBudget > 0 && remaining > 0) {
                sentBudget -= 1;
                try {
                    var sentParams = Object.assign({list:'logevents',letype:'thanks',leuser:user,
                        leprop:'ids|type|user|title|timestamp',lelimit:500,ledir:'older',lestart:sent.anchorAt},sent.continuation || {});
                    var sentResponse = await request(queryUrl('https://' + PROJECT,sentParams));
                    var sentEvents = sentResponse.query && sentResponse.query.logevents;
                    if (!Array.isArray(sentEvents)) { throw new Error('Agradecimentos enviados incompletos.'); }
                    var sentIds = new Set(sent.logids), sentAdded = 0;
                    Array.from(sentEvents).forEach(function (event) {
                        if (!object(event) || event.type !== 'thanks' || event.action !== 'thank' || !positive(event.logid) ||
                            event.user !== user || event.ns !== 2 || !recipientTitle(event.title) ||
                            !validTime(event.timestamp,Date.parse(sent.anchorAt)) ||
                            ['userhidden','actionhidden','titlehidden','suppressed'].some(function (key) { return own(event,key); })) {
                            throw new Error('Agradecimento enviado sem identidade pública completa.');
                        }
                        if (!sentIds.has(event.logid)) { sentIds.add(event.logid); sentAdded += 1; }
                    });
                    if (sentIds.size > MAX_LOGS) { throw new Error('Limite de agradecimentos enviados excedido.'); }
                    var sentContinuation = null, sentSeen = sent.seen.slice();
                    if (sentResponse.continue) {
                        var nextSent = sentResponse.continue;
                        if (!object(nextSent) || typeof nextSent.lecontinue !== 'string' || !nextSent.lecontinue || nextSent.lecontinue.length > 1024 ||
                            sentSeen.indexOf(nextSent.lecontinue) >= 0 || !sentAdded || sentSeen.length >= 2000 ||
                            Object.keys(nextSent).some(function (key) { return key !== 'continue' && key !== 'lecontinue'; }) ||
                            own(nextSent,'continue') && (typeof nextSent.continue !== 'string' || nextSent.continue.length > 1024)) { throw new Error('Paginação de agradecimentos enviados inválida.'); }
                        sentContinuation = {lecontinue:nextSent.lecontinue};
                        if (own(nextSent,'continue')) { sentContinuation.continue = nextSent.continue; }
                        sentSeen.push(nextSent.lecontinue);
                    } else if (!completed(sentResponse)) { throw new Error('Agradecimentos enviados sem conclusão.'); }
                    sent.logids = Array.from(sentIds); sent.seen = sentSeen; sent.continuation = sentContinuation;
                    if (!sentContinuation) {
                        setMetric('thanksSent',sentIds.size,sent.anchorAt);
                        state.thanksSentCoverage = {version:1,completedAt:sent.anchorAt,count:sentIds.size};
                        state.thanksSentScan = null; sent = null;
                    }
                } catch (_) { error('Agradecimentos enviados na ptwiki'); break; }
            }
            if (state.thanksSentScan) { state.pending = true; }
        }
        var needsGlobal = !state.global || state.global.thanksCompleteAt && (options.force || nowMs - Date.parse(state.global.infoAt) >= GLOBAL_TTL);
        var needsEarliestRegistration = options.includeEarliestRegistration === true && (!state.registrationCoverage || options.force ||
            nowMs - Date.parse(state.registrationCoverage.checkedAt) >= DAY);
        if (needsGlobal || needsEarliestRegistration) {
            if (!remaining) { state.pending = true; }
            else {
                try {
                    var data = await request(queryUrl('https://' + PROJECT, { meta: 'globaluserinfo', guiuser: user, guiprop: 'editcount|merged' }));
                    var info = data.query && data.query.globaluserinfo;
                    if (!info || info.name !== user || !integer(info.editcount) || !Array.isArray(info.merged) || info.merged.length > MAX_PROJECTS || info.editcount > 0 && !info.merged.length || !completed(data)) { throw new Error('Identidade global incompleta.'); }
                    if (needsGlobal) {
                        var projects = {}, keys = [];
                        Array.from(info.merged).forEach(function (account) {
                            if (!account || !projectKey(account.wiki) || own(projects, account.wiki) || !integer(account.editcount)) { throw new Error('Projeto global inválido.'); }
                            var origin = allowedOrigin(account.url), old = state.projects[account.wiki];
                            var p = old && old.url === origin ? clone(old) : { url: origin, editcount: 0, thanks: null, thanksAt: null, articles: null, articlesAt: null, thanksScan: null };
                            p.editcount = account.editcount;
                            // This optimization only reuses a previously verified zero.
                            if (p.editcount === 0 && p.thanks === 0) { p.thanksAt = now; p.thanksScan = null; }
                            else { p.thanksScan = { anchorAt: now, logids: [], continuation: null, seen: [] }; }
                            projects[account.wiki] = p; keys.push(account.wiki);
                        });
                        state.projects = projects;
                        state.global = { anchorAt: now, infoAt: now, editcount: info.editcount, accountKeys: keys.sort(), thanksCompleteAt: null };
                        setMetric('edits', info.editcount);
                    }
                    // CentralAuth already supplies global and local registration
                    // dates here. No request to each linked wiki is needed.
                    if (options.includeEarliestRegistration === true) {
                        try {
                            var registrationResult = registrationData(info,user,now);
                            state.registrationCoverage = registrationResult.registrationCoverage;
                            setMetric('earliestRegistration',registrationResult.earliestRegistration);
                        } catch (_) { error('Data de criação da conta'); }
                    }
                } catch (_) { error(needsGlobal ? 'Contribuições globais' : 'Data de criação da conta'); }
            }
        }
        if (!state.metricUpdatedAt.registration || options.force || nowMs - Date.parse(state.metricUpdatedAt.registration) >= DAY) {
            if (remaining) {
                try {
                    var local = await request(queryUrl('https://' + PROJECT, { list: 'users', ususers: user, usprop: 'registration' }));
                    var users = local.query && local.query.users;
                    if (!completed(local) || !Array.isArray(users) || users.length !== 1 || users[0].name !== user || flag(users[0], 'missing') || flag(users[0], 'invalid') || (users[0].registration !== null && !validTime(users[0].registration, nowMs))) { throw new Error('Inscrição local inválida.'); }
                    setMetric('registration', users[0].registration);
                } catch (_) { error('Data de ingresso na ptwiki'); }
            } else { state.pending = true; }
        }
        // Identity counters can be shown before the full contribution scan and
        // the linked-project logs. A later ordinary pass resumes the same state.
        if (options.deferDetails === true) {
            state.pending = true;
            state.errors.sort();
            var identityCheck = validate(state, {user:user, now:now});
            if (!identityCheck.valid) { throw new Error('As estatísticas iniciais são inválidas: ' + identityCheck.errors.join(' ')); }
            return state;
        }
        var pageids = entries ? Array.from(new Set(entries.map(function (entry) { return entry[1]; }).filter(positive))).sort(function (a, b) { return a - b; }) : [];
        if (pageids.length > MAX_PAGES) { error('Limite de páginas locais excedido'); entries = null; }
        if (entries) {
            var wanted = new Set(pageids);
            Object.keys(state.pageInfo).forEach(function (id) { if (!wanted.has(Number(id))) { delete state.pageInfo[id]; } });
            var meta = state.metadataScan;
            if (!meta || meta.complete) { meta = state.metadataScan = { anchorAt: now, force: !!options.force, complete: false }; }
            var threshold = Date.parse(meta.anchorAt) - (meta.force ? 0 : DAY);
            var missing = pageids.filter(function (id) { return !state.pageInfo[id] || Date.parse(state.pageInfo[id].checkedAt) < threshold; });
            var metadataBudget = Math.min(remaining, Math.max(1, Math.ceil(remaining / 3)));
            while (missing.length && metadataBudget > 0 && remaining > 0) {
                var chunk = missing.slice(0, 50); metadataBudget -= 1;
                try {
                    var response = await request(queryUrl('https://' + PROJECT, { prop: 'info', pageids: chunk.join('|') }));
                    var pages = response.query && response.query.pages;
                    if (!completed(response) || !Array.isArray(pages) || pages.length !== chunk.length) { throw new Error('Metadados incompletos.'); }
                    var expected = new Set(chunk), checked = [];
                    Array.from(pages).forEach(function (page) {
                        if (!page || !expected.delete(page.pageid) || flag(page, 'invalid') || own(page, 'missing') && typeof page.missing !== 'boolean' || own(page, 'redirect') && typeof page.redirect !== 'boolean') { throw new Error('Página inesperada.'); }
                        var record = { pageid: page.pageid, checkedAt: now, missing: flag(page, 'missing'), redirect: flag(page, 'redirect') };
                        if (!record.missing) {
                            if (!integer(page.ns) || typeof page.title !== 'string' || !page.title || page.title.length > 1024 || typeof page.contentmodel !== 'string' || !page.contentmodel || page.contentmodel.length > 128) { throw new Error('Tipo de página incompleto.'); }
                            record.ns = page.ns; record.title = page.title; record.contentmodel = page.contentmodel;
                        }
                        checked.push(record);
                    });
                    checked.forEach(function (page) { state.pageInfo[page.pageid] = page; });
                    missing = missing.slice(chunk.length);
                } catch (_) { error('Situação atual das páginas da ptwiki'); break; }
            }
            meta.complete = missing.length === 0;
            if (meta.complete) {
                var localEvidenceAt = new Date(pageids.reduce(function (oldest, id) { return Math.min(oldest, Date.parse(state.pageInfo[id].checkedAt)); }, Date.parse(options.history.capturedAt))).toISOString();
                setMetric('edited', pageids.filter(function (id) { var p = state.pageInfo[id]; return !p.missing && !p.redirect && p.ns === 0; }).length, localEvidenceAt);
                var creations = new Set(entries.filter(function (e) { return e[5] === 1 && e[6] === 0 && e[7] === user && e[1] > 0; }).map(function (e) { return e[1]; }));
                setMetric('technicalCreated', Array.from(creations).filter(function (id) { return !!technicalKind(state.pageInfo[id]); }).length, localEvidenceAt);
            } else { state.pending = true; }
        }
        var global = state.global;
        if (global) {
            var thanksBudget = Math.min(remaining, Math.max(1, Math.ceil(remaining / 2)));
            for (var index = 0; index < global.accountKeys.length && thanksBudget > 0 && remaining > 0; index += 1) {
                var key = global.accountKeys[index], project = state.projects[key], scan = project.thanksScan;
                if (!scan) { continue; }
                while (scan && thanksBudget > 0 && remaining > 0) {
                    thanksBudget -= 1;
                    try {
                        var params = Object.assign({ list: 'logevents', letype: 'thanks', letitle: 'User:' + user, leprop: 'ids|type|timestamp', lelimit: 500, ledir: 'older', lestart: scan.anchorAt }, scan.continuation || {});
                        var logs = await request(queryUrl(project.url, params)), events = logs.query && logs.query.logevents;
                        if (!Array.isArray(events)) { throw new Error('Agradecimentos incompletos.'); }
                        var ids = new Set(scan.logids), added = 0;
                        Array.from(events).forEach(function (event) {
                            if (!event || event.type !== 'thanks' || !positive(event.logid) || !validTime(event.timestamp, Date.parse(scan.anchorAt))) { throw new Error('Agradecimento inválido.'); }
                            if (!ids.has(event.logid)) { ids.add(event.logid); added += 1; }
                        });
                        if (ids.size > MAX_LOGS) { throw new Error('Limite do histórico de agradecimentos excedido.'); }
                        var continuation = null, seen = scan.seen.slice();
                        if (logs.continue) {
                            var c = logs.continue;
                            if (!object(c) || typeof c.lecontinue !== 'string' || !c.lecontinue || c.lecontinue.length > 1024 || seen.indexOf(c.lecontinue) >= 0 || !added || seen.length >= 2000 ||
                                Object.keys(c).some(function (k) { return k !== 'continue' && k !== 'lecontinue'; }) || own(c, 'continue') && typeof c.continue !== 'string') { throw new Error('Paginação de agradecimentos inválida.'); }
                            continuation = { lecontinue: c.lecontinue }; if (own(c, 'continue')) { continuation.continue = c.continue; } seen.push(c.lecontinue);
                        } else if (!completed(logs)) { throw new Error('Agradecimentos sem conclusão.'); }
                        scan.logids = Array.from(ids); scan.seen = seen; scan.continuation = continuation;
                        if (!continuation) { project.thanks = ids.size; project.thanksAt = scan.anchorAt; project.thanksScan = null; scan = null; }
                    } catch (failure) {
                        var detail = String(failure && (failure.detail || failure.message) || '');
                        if (key === 'loginwiki' && (failure.unsupportedThanks || /thanks/i.test(detail) && /badvalue|unrecognized/i.test(String(failure.code || '') + detail))) {
                            project.thanks = 0; project.thanksAt = scan.anchorAt; project.thanksScan = null;
                        } else { error('Agradecimentos: ' + key); }
                        break;
                    }
                }
            }
            var thanksComplete = global.accountKeys.every(function (key) { var p = state.projects[key]; return !p.thanksScan && integer(p.thanks) && validTime(p.thanksAt, nowMs) && Date.parse(p.thanksAt) >= Date.parse(global.anchorAt); });
            if (thanksComplete) { setMetric('thanks', safeSum(global.accountKeys.map(function (key) { return state.projects[key].thanks; })), global.anchorAt); if (!global.thanksCompleteAt) { global.thanksCompleteAt = now; } }
            else { state.pending = true; }
            var wikipediaKeys = global.accountKeys.filter(function (key) { return key !== 'testwiki' && key !== 'test2wiki' && new URL(state.projects[key].url).hostname.endsWith('.wikipedia.org'); });
            var articleScan = state.articlesScan;
            if (!articleScan || articleScan.complete) { articleScan = state.articlesScan = { anchorAt: now, force: !!options.force, complete: false }; }
            var articlesThreshold = Date.parse(articleScan.anchorAt) - (articleScan.force ? 0 : DAY);
            var articlePending = wikipediaKeys.filter(function (key) { var p = state.projects[key]; return p.articles === null || !p.articlesAt || Date.parse(p.articlesAt) < articlesThreshold; });
            for (var a = 0; a < articlePending.length && remaining > 0; a += 1) {
                var wiki = articlePending[a], p = state.projects[wiki], host = new URL(p.url).hostname;
                try {
                    var count = articleCount(await request('https://xtools.wmcloud.org/api/user/pages_count/' + encodeURIComponent(host) + '/' + encodeURIComponent(user) + '/0/noredirects/all'), user, host);
                    p.articles = count; p.articlesAt = now;
                } catch (_) { error('Artigos criados: ' + wiki); }
            }
            articleScan.complete = wikipediaKeys.every(function (key) { var p = state.projects[key]; return integer(p.articles) && p.articlesAt && Date.parse(p.articlesAt) >= articlesThreshold; });
            if (articleScan.complete) {
                var articlesEvidenceAt = new Date(wikipediaKeys.reduce(function (oldest, key) { return Math.min(oldest, Date.parse(state.projects[key].articlesAt)); }, Date.parse(global.infoAt))).toISOString();
                setMetric('articles', safeSum(wikipediaKeys.map(function (key) { return state.projects[key].articles; })), articlesEvidenceAt);
            }
            else { state.pending = true; }
        } else { state.pending = true; }
        if (budgetExhausted) { state.pending = true; }
        state.errors.sort();
        var checkedState = validate(state, { user: user, now: now });
        if (!checkedState.valid) { throw new Error('As estatísticas coletadas são inválidas: ' + checkedState.errors.join(' ')); }
        return state;
    }
    return Object.freeze({ collect: collect, validate: validate, byteTotals:byteTotals, technicalKind: technicalKind, technicalSubpageExcluded: technicalSubpageExcluded, articleCount: articleCount, allowedOrigin: allowedOrigin });
}));

;

/* PerfilWiki 1.1.0. Shared history and statistics/pageviews coordinator.
 * Daniel G Rego, CC BY-SA 4.0. Caller supplies an anonymous read-only transport. */
(function (root, factory) {
    var common = typeof module === 'object' && module.exports;
    var api = factory(common ? require('./PageviewsCore.js') : root.PerfilWikiPageviewsCore,
        common ? require('./History.js') : root.PerfilWikiHistory,
        common ? require('./Statistics.js') : root.PerfilWikiStatistics);
    if (common) { module.exports = api; } else { root.PerfilWikiCoordinator = api; }
}(typeof window !== 'undefined' ? window : this, function (pageviews, historyCore, statisticsCore) {
    'use strict';
    function identity(config) { return { user: config.user, project: config.project }; }
    function activityFrom(history, previous, config, now) {
        if (history.complete) {
            var entries = historyCore.richToActivityEntries(history);
            return { identity: identity(config), entries: entries, complete: true, capturedAt: history.capturedAt,
                lastAttemptAt: now, fullScanAt: history.fullScanAt, scanMode: history.scanMode,
                pagesFetched: history.pagesFetched || 0, summary: pageviews.summarize(entries, {config: config, now: now}),
                cacheHit: !!history.cacheHit, stale: !!history.stale || !!history.pending, error: history.error || null };
        }
        if (previous && previous.complete && previous.identity.user === config.user && previous.identity.project === config.project) {
            return Object.assign({}, previous, {summary: pageviews.summarize(previous.entries, {config: config, now: now}),
                lastAttemptAt: now, stale: true, error: history.error || null});
        }
        return { identity: identity(config), entries: [], complete: false, capturedAt: null, lastAttemptAt: now,
            fullScanAt: null, scanMode: 'full', pagesFetched: 0, summary: null, cacheHit: false, stale: true, error: history.error || null };
    }
    function validateState(state) {
        var check = pageviews.validateState(state);
        if (!check.valid) { return check; }
        var user = state.config.user, now = state.capturedAt;
        if (state.history) {
            var history = historyCore.validate(state.history, {user: user, now: now});
            if (!history.valid) { return history; }
            if (state.history.complete && JSON.stringify(historyCore.richToActivityEntries(state.history)) !== JSON.stringify(state.activity.entries)) {
                return { valid: false, errors: ['O painel e os contadores usam históricos diferentes.'] };
            }
        }
        if (state.statistics) {
            var stats = statisticsCore.validate(state.statistics, {user: user, now: now});
            if (!stats.valid) { return stats; }
            var stamps = state.statistics.metricUpdatedAt, metrics = state.statistics.metrics;
            if (state.activity.complete && stamps.bestStreak === state.activity.capturedAt &&
                metrics.bestStreak !== state.activity.summary.bestStreak) {
                return {valid: false, errors: ['A melhor sequência difere do histórico consultado.']};
            }
            if (state.history && state.history.complete && stamps.reverts === state.history.capturedAt) {
                var reverts = state.history.entries.filter(function (entry) {
                    return entry[8].some(function (tag) { return ['mw-rollback', 'mw-undo', 'mw-manual-revert'].indexOf(tag) >= 0; });
                }).length;
                if (metrics.reverts !== reverts) { return {valid: false, errors: ['As reversões diferem do histórico consultado.']}; }
            }
            if (state.history && state.history.complete && ['bytesAdded','bytesRemoved','averageBytesPerEdit','largestAddition','largestRemoval'].some(function (key) {
                return stamps[key] === state.history.capturedAt;
            })) {
                var byteTotals = statisticsCore.byteTotals(state.history,user,now);
                if (['bytesAdded','bytesRemoved','averageBytesPerEdit','largestAddition','largestRemoval'].some(function (key) {
                    return stamps[key] === state.history.capturedAt && metrics[key] !== byteTotals[key];
                })) { return {valid:false, errors:['As contagens de bytes diferem do histórico consultado.']}; }
            }
        }
        return check;
    }
    async function update(options) {
        var requestLimit = options.maxRequests === undefined ? 40 : options.maxRequests, requests = 0;
        if (!Number.isInteger(requestLimit) || requestLimit < 1 || requestLimit > 1000 || typeof options.requestJson !== 'function') { throw new Error('Orçamento de consultas inválido.'); }
        function budgetError() { var error = new Error('O orçamento de consultas foi concluído.'); error.code = 'request-budget'; return error; }
        function dispatch(url) {
            if (requests >= requestLimit) { return Promise.reject(budgetError()); }
            requests += 1; return options.requestJson(url);
        }
        var config = Object.assign({}, pageviews.DEFAULT_CONFIG, options.config || {});
        var now = new Date(options.now === undefined ? Date.now() : options.now).toISOString();
        var previous = options.previous || null;
        if (previous && (!validateState(previous).valid || previous.config.user !== config.user || previous.config.timeZone !== config.timeZone)) { previous = null; }
        // The two collectors classify overlapping page IDs in different batch
        // orders. Share each verified response instead of fetching it twice.
        var metadata = new Map(), metadataJobs = new Map(), previousMetadata = new Map();
        if (previous && previous.statistics) {
            Object.keys(previous.statistics.pageInfo || {}).forEach(function (id) {
                var record = previous.statistics.pageInfo[id];
                if (Date.parse(record.checkedAt) >= Date.parse(now) - 86400000) {
                    var page = Object.assign({},record); delete page.checkedAt;
                    previousMetadata.set(Number(id),page);
                }
            });
        }
        function metadataIds(address) {
            try {
                var url = new URL(address), params = url.searchParams;
                if (url.origin !== 'https://pt.wikipedia.org' || url.pathname !== '/w/api.php' ||
                    params.get('action') !== 'query' || params.get('format') !== 'json' || params.get('formatversion') !== '2' ||
                    params.get('prop') !== 'info' || Array.from(params.keys()).some(function (key) {
                        return ['action','format','formatversion','origin','maxlag','prop','pageids'].indexOf(key) < 0;
                    })) { return null; }
                var ids = String(params.get('pageids') || '').split('|').map(Number);
                return ids.length && ids.length <= 50 && ids.every(function (id) { return Number.isSafeInteger(id) && id > 0; }) &&
                    new Set(ids).size === ids.length ? ids : null;
            } catch (_) { return null; }
        }
        async function metadataRequest(address, allowPrevious) {
            var ids = metadataIds(address);
            if (!ids) { return dispatch(address); }
            function available(id) { return metadata.get(id) || allowPrevious && previousMetadata.get(id); }
            var missing = ids.filter(function (id) { return !available(id) && !metadataJobs.has(id); });
            if (missing.length) {
                var url = new URL(address); url.searchParams.set('pageids',missing.join('|'));
                var job = Promise.resolve().then(function () { return dispatch(url.toString()); }).then(function (response) {
                    var pages = response && response.query && response.query.pages, expected = new Set(missing), accepted = [];
                    if (!response || response.batchcomplete !== true || response.continue || response.error ||
                        response.warnings && Object.keys(response.warnings).length || !Array.isArray(pages) || pages.length !== missing.length) {
                        throw new Error('Metadados compartilhados incompletos.');
                    }
                    pages.forEach(function (page) {
                        if (!page || !expected.delete(page.pageid)) { throw new Error('Metadados compartilhados inválidos.'); }
                        accepted.push(page);
                    });
                    accepted.forEach(function (page) { metadata.set(page.pageid,JSON.parse(JSON.stringify(page))); });
                });
                missing.forEach(function (id) { metadataJobs.set(id,job); });
                job.finally(function () { missing.forEach(function (id) { if (metadataJobs.get(id) === job) { metadataJobs.delete(id); } }); }).catch(function () {});
            }
            await Promise.all(ids.map(function (id) { return metadataJobs.get(id) || Promise.resolve(); }));
            return {batchcomplete:true,query:{pages:ids.map(function (id) {
                var page = available(id); if (!page) { throw new Error('Metadados compartilhados ausentes.'); }
                return JSON.parse(JSON.stringify(page));
            })}};
        }
        var requestJson = function (url) { return metadataRequest(url,false); };
        var viewRequestJson = function (url) { return metadataRequest(url,true); };
        var history = previous && previous.history || null;
        var activity = activityFrom(history || {complete:false,error:null}, previous && previous.activity, config, now);
        var statistics = previous && previous.statistics || null, latestViews = null, statsError = null;
        function stateWith(views) {
            var customComplete = !options.customRange || !!(views.periods.custom && views.periods.custom.complete);
            return {profileSchema: 1, schemaVersion: 4, config: config, capturedAt: now, activity: activity,
                history: history, statistics: statistics, pageviews: views,
                complete: !!activity.complete && !!views.complete && customComplete && !!statistics && !statistics.pending && !(history && history.pending),
                fresh: !activity.stale && !views.stale && customComplete && !!statistics && !statistics.errors.length && !statistics.pending && !(history && history.pending) && !statsError,
                cacheDiscarded: !!options.previous && !previous};
        }
        async function publish(views) {
            latestViews = views;
            if (options.onProgress) { await options.onProgress(stateWith(views)); }
        }
        // Independent identity counters should not wait behind a complete
        // account-history scan. This bounded first pass never visits other wikis.
        var identityBudget = Math.min(3, Math.max(0,requestLimit - 1));
        var needsIdentity = !statistics || !statistics.metricUpdatedAt.edits || !statistics.metricUpdatedAt.registration ||
            options.includeEarliestRegistration === true && !statistics.registrationCoverage;
        if (needsIdentity && identityBudget) {
            statistics = await statisticsCore.collect({user:config.user,now:now,history:history,activity:activity,
                previous:statistics,requestJson:requestJson,maxRequests:identityBudget,deferDetails:true,
                includeEarliestRegistration:options.includeEarliestRegistration === true,includeUserGroups:options.includeUserGroups === true});
            if (options.onProgress && !activity.complete) {
                var initialViews = await pageviews.collectPageviews(Object.assign({},options,{config:config,now:now,
                    previous:previous,activity:activity,requestJson:viewRequestJson,maxRequests:1,metadataOnly:true,onProgress:undefined}));
                await publish(initialViews);
            }
        }
        history = await historyCore.collect({user: config.user, now: now, previous: previous && previous.history,
            requestJson: requestJson, maxRequests: Math.min(options.historyBudget || (previous && previous.history && previous.history.complete ? 20 : 30),Math.max(1,requestLimit - requests)), fullRescanMs: config.fullRescanMs,
            refreshMs: config.activityRefreshMs, force: config.activityRefreshMs === 0});
        activity = activityFrom(history, previous && previous.activity, config, now);
        // The early empty-candidate checkpoint belongs to the pre-history stage.
        latestViews = null;
        var statsOptions = {user: config.user, now: now, history: history, activity: activity,
            previous: statistics, requestJson: requestJson, maxRequests: Math.min(options.statisticsBudget ||
                (previous && previous.pageviews && previous.pageviews.metadata && previous.pageviews.metadata.complete ? 20 : 3),requestLimit),
            force: !!options.forceStatistics, includeThanksSent: options.includeThanksSent === true,
            includeEarliestRegistration: options.includeEarliestRegistration === true, includeUserGroups: options.includeUserGroups === true};
        var historyChanged = history.complete && (!previous || !previous.history || !previous.history.complete || previous.history.capturedAt !== history.capturedAt);
        var serviceErrors = statistics && statistics.errors.some(function (error) { return error !== 'Histórico local completo indisponível'; });
        var newlyEnabledGroups = options.includeUserGroups === true && statistics && !statistics.userGroups &&
            statistics.errors.indexOf('Estatutos na ptwiki') < 0;
        var statsCoolingDown = serviceErrors && !historyChanged && Date.parse(now) - Date.parse(statistics.capturedAt) < 300000 && !options.forceStatistics && !newlyEnabledGroups;
        var statsJob = (statsCoolingDown ? Promise.resolve(statistics) : statisticsCore.collect(statsOptions)).then(async function (value) {
                statistics = value;
                if (latestViews && options.onProgress) { await options.onProgress(stateWith(latestViews)); }
            });
        // Avoid a rejected promise escaping while pageview requests are still running.
        statsJob = statsJob.catch(function (error) { statsError = error; });
        var views = await pageviews.collectPageviews(Object.assign({}, options, {config: config, now: now,
            previous: previous, activity: activity, requestJson:viewRequestJson, onProgress: publish}));
        latestViews = views;
        await statsJob;
        if (statsError && !statistics) { throw statsError; }
        if (statsError) {
            statistics = JSON.parse(JSON.stringify(statistics));
            statistics.capturedAt = now;
            statistics.errors = ['Consulta de contadores incompleta'];
            statistics.pending = true;
        }
        var state = stateWith(views);
        var result = validateState(state);
        if (!result.valid) { throw new Error('Os dados integrados são inválidos: ' + result.errors.join(', ')); }
        return state;
    }
    return Object.freeze(Object.assign({}, pageviews, {update: update, validateState: validateState, activityFrom: activityFrom}));
}));

;

/* Dados opcionais de apresentação. Não altera métricas nem publica edições. */
(function (root, factory) {
    var api = factory(typeof module==='object'&&module.exports?require('./I18n.js'):root.PerfilWikiI18n);
    if (typeof module === 'object' && module.exports) { module.exports = api; }
    else { root.PerfilWikiPresenter = api; }
}(typeof window !== 'undefined' ? window : this, function (i18n) {
    'use strict';
    var DAY = 86400000;
    var periods = ['30d', '90d', '12m', 'since', 'custom'];
    var relative = new Intl.RelativeTimeFormat('pt-BR', { numeric: 'always' });
    var absolute = new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC', dateStyle: 'short', timeStyle: 'short' });
    function timestamp(value) {
        if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value)) { return null; }
        var date = new Date(value);
        if (!Number.isFinite(date.getTime()) || date.toISOString().replace('.000Z', 'Z') !== value.replace('.000Z', 'Z')) { return null; }
        return date.toISOString();
    }
    function nowValue(value) {
        var result = value === undefined ? Date.now() : new Date(value).getTime();
        return Number.isFinite(result) ? result : null;
    }
    function lastEditAt(state) {
        var activity = state && state.activity;
        var entries = activity && Array.isArray(activity.entries) ? activity.entries : [];
        var latest = null;
        entries.forEach(function (entry) {
            var raw = Array.isArray(entry) && entry[4];
            // ISO dates sort chronologically. Most histories already start with
            // the newest edit, so avoid parsing every older date on each paint.
            if (typeof raw !== 'string' || latest && raw <= latest) { return; }
            var value = timestamp(raw);
            if (value && (!latest || value > latest)) { latest = value; }
        });
        return latest || timestamp(activity && activity.summary && activity.summary.lastEditAt);
    }
    function relativeTime(value, now, language) {
        language=i18n.normalizeLanguage(language);
        var relative=new Intl.RelativeTimeFormat(language,{numeric:'always'});
        var stamp = timestamp(value), reference = nowValue(now);
        if (!stamp || reference === null || Date.parse(stamp) > reference + 60000) { return null; }
        var seconds = Math.max(0, Math.floor((reference - Date.parse(stamp)) / 1000));
        if (seconds < 60) { return i18n.t(language,'há menos de 1 minuto'); }
        if (seconds < 3600) { return relative.format(-Math.floor(seconds / 60), 'minute'); }
        if (seconds < 86400) { return relative.format(-Math.floor(seconds / 3600), 'hour'); }
        return relative.format(-Math.floor(seconds / 86400), 'day');
    }
    function absoluteTime(value,language) {
        var absolute=new Intl.DateTimeFormat(i18n.normalizeLanguage(language),{timeZone:'UTC',dateStyle:'short',timeStyle:'short'});
        var stamp = timestamp(value);
        return stamp ? absolute.format(new Date(stamp)) + ' UTC' : null;
    }
    function featuredArticles(state) {
        var data = state && state.pageviews;
        var seen = new Set(), articles = [];
        periods.forEach(function (key) {
            var profile = data && data.periods && data.periods[key];
            var previous = data && data.lastCompleteSnapshot && data.lastCompleteSnapshot.periods && data.lastCompleteSnapshot.periods[key];
            var displayed = profile && !profile.complete && (profile.lastCompleteSnapshot || previous) || profile;
            var rows = displayed && Array.isArray(displayed.rows) ? displayed.rows : [];
            rows.slice().sort(function (a, b) {
                return (b.views == null ? -1 : b.views) - (a.views == null ? -1 : a.views) || String(a.title).localeCompare(String(b.title), 'pt');
            }).slice(0, 10).forEach(function (row) {
                if (Number.isSafeInteger(row.pageid) && row.pageid > 0 && typeof row.title === 'string' && row.title.length > 0 && row.title.length <= 512 && !seen.has(row.pageid)) {
                    seen.add(row.pageid); articles.push({ pageid: row.pageid, title: row.title });
                }
            });
        });
        return articles;
    }
    function imageRequest(articles) {
        if (!Array.isArray(articles) || !articles.length || articles.length > 50 || articles.some(function (row) { return !row || !Number.isSafeInteger(row.pageid) || row.pageid <= 0; })) { return null; }
        var url = new URL('https://pt.wikipedia.org/w/api.php');
        var parameters = { action: 'query', format: 'json', formatversion: '2', origin: '*', prop: 'pageimages', piprop: 'thumbnail|name', pilicense: 'free', pithumbsize: '96', pilimit: '50', pageids: articles.map(function (row) { return row.pageid; }).join('|') };
        Object.keys(parameters).forEach(function (key) { url.searchParams.set(key, parameters[key]); });
        return url.href;
    }
    function safeFile(value) {
        return typeof value === 'string' && value.length > 0 && value.length <= 512 && value.trim() === value && !/[\u0000-\u001f\u007f\u2028\u2029\[\]{}|<>#%:\\/]/.test(value) && /\.(?:jpe?g|png|gif|webp|svg|tiff?|avif)$/i.test(value);
    }
    function imageSource(value) {
        try {
            if (typeof value !== 'string' || value.length > 4096) { return null; }
            var url = new URL(value);
            if (url.protocol !== 'https:' || url.username || url.password || url.port || url.hash || ['upload.wikimedia.org', 'thumb.wikimedia.org'].indexOf(url.hostname) < 0 ||
                !/^\/wikipedia\/(?:commons|pt)\/thumb\/[a-f0-9]\/[a-f0-9]{2}\/[^/]+\/[^/]+$/.test(url.pathname) || /[\u0000-\u001f\u007f\\]/.test(decodeURIComponent(url.pathname))) { return null; }
            var safe = true;
            url.searchParams.forEach(function (_, key) { if (['utm_source', 'utm_campaign', 'utm_content'].indexOf(key) < 0) { safe = false; } });
            if (!safe) { return null; }
            url.search = '';
            return url.href;
        } catch (_) { return null; }
    }
    function validateImage(page, capturedAt) {
        var stamp = timestamp(capturedAt);
        if (!page || !stamp || !Number.isSafeInteger(page.pageid) || page.pageid <= 0 || page.ns !== 0 || typeof page.title !== 'string' || !page.title || page.title.length > 512 ||
            !safeFile(page.pageimage) || !page.thumbnail || !Number.isSafeInteger(page.thumbnail.width) || page.thumbnail.width < 1 || page.thumbnail.width > 4096 ||
            !Number.isSafeInteger(page.thumbnail.height) || page.thumbnail.height < 1 || page.thumbnail.height > 4096) { return null; }
        var src = imageSource(page.thumbnail.source);
        return src ? { pageid: page.pageid, title: page.title, file: page.pageimage, src: src, capturedAt: stamp } : null;
    }
    function normalizeImages(raw, now) {
        var result = Object.create(null), reference = nowValue(now);
        if (!raw || typeof raw !== 'object' || Array.isArray(raw) || reference === null || Object.keys(raw).length > 80) { return result; }
        Object.keys(raw).forEach(function (key) {
            var entry = raw[key];
            if (!entry || String(entry.pageid) !== key || !Number.isSafeInteger(entry.pageid) || entry.pageid <= 0 || !timestamp(entry.capturedAt) ||
                Date.parse(entry.capturedAt) > reference + 60000 || reference - Date.parse(entry.capturedAt) >= 7 * DAY) { return; }
            var normalized = validateImage({ pageid: entry.pageid, ns: 0, title: entry.title, pageimage: entry.file, thumbnail: { source: entry.src, width: 96, height: 96 } }, entry.capturedAt);
            if (normalized) { result[key] = normalized; }
        });
        return result;
    }
    function imageFor(images, row) {
        var image = images && row && images[row.pageid];
        if (!image || image.pageid !== row.pageid || image.title !== row.title || !safeFile(image.file) || !imageSource(image.src) || !timestamp(image.capturedAt)) { return null; }
        return image;
    }
    return Object.freeze({ lastEditAt: lastEditAt, relativeTime: relativeTime, absoluteTime: absoluteTime, featuredArticles: featuredArticles,
        imageRequest: imageRequest, validateImage: validateImage, normalizeImages: normalizeImages, imageFor: imageFor });
}));

;

/* Interface do painel Atividade na Wikipédia. Nenhuma requisição ou edição. */
(function (root, factory) {
    var api = factory(typeof module === 'object' && module.exports ? require('./Presenter.js') : root.PerfilWikiPresenter,
        typeof module === 'object' && module.exports ? require('./Appearance.js') : root.PerfilWikiAppearance,
        typeof module === 'object' && module.exports ? require('./ProfileText.js') : root.PerfilWikiProfileText,
        typeof module === 'object' && module.exports ? require('./LayoutView.js') : root.PerfilWikiLayoutView,
        typeof module === 'object' && module.exports ? require('./ProfileFields.js') : root.PerfilWikiProfileFields,
        typeof module === 'object' && module.exports ? require('./ProfileClock.js') : root.PerfilWikiProfileClock,
        typeof module === 'object' && module.exports ? require('./UserGroups.js') : root.PerfilWikiUserGroups,
        typeof module === 'object' && module.exports ? require('./I18n.js') : root.PerfilWikiI18n);
    if (typeof module === 'object' && module.exports) { module.exports = api; }
    else { root.PerfilWikiActivityView = api; }
}(typeof window !== 'undefined' ? window : this, function (presenter, appearance, profileTextApi, layoutView, fieldsApi, clockApi, groupsApi, i18n) {
    'use strict';
    var language='pt-BR';
    function tr(source,params){return i18n.t(language,source,params);}
    function inLanguage(fn,presentation,args){var previous=language;language=i18n.normalizeLanguage(presentation&&presentation.language||presentation&&presentation.appearance&&presentation.appearance.language);try{return fn.apply(null,args);}finally{language=previous;}}

    var months = ['jan.', 'fev.', 'mar.', 'abr.', 'mai.', 'jun.', 'jul.', 'ago.', 'set.', 'out.', 'nov.', 'dez.'];
    var weekdays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
    var numberFormatter = {format:function(value){return i18n.number(language,value);}};
    var accountDateFormatter = {format:function(value){return i18n.date(language,value,{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'});}};
    function escape(value) {
        return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
    }
    function escapeData(value, wiki) {
        var text = escape(value);
        return wiki ? text.replace(/[\[\]{}|~_\r\n\u2028\u2029]/g, function (c) { return '&#' + c.charCodeAt(0) + ';'; }) : text;
    }
    function number(value) { return Number.isSafeInteger(value) ? numberFormatter.format(value) : tr("Aguardando dados"); }
    function shortDate(value) {
        if(language!=='pt-BR'&&language!=='pt-PT')return i18n.date(language,value+'T00:00:00Z',{day:'numeric',month:'short'});
        var p = value.split('-').map(Number);
        return p[2] + ' ' + months[p[1] - 1];
    }
    function range(period) {
        if(language!=='pt-BR'&&language!=='pt-PT')return i18n.date(language,period.start+'T00:00:00Z',{day:'numeric',month:'short',year:'numeric'})+' – '+i18n.date(language,period.end+'T00:00:00Z',{day:'numeric',month:'short',year:'numeric'});
        return shortDate(period.start) + (period.start.slice(0, 4) !== period.end.slice(0, 4) ? tr(" de ") + period.start.slice(0, 4) : '') + tr(" a ") + shortDate(period.end) + tr(" de ") + period.end.slice(0, 4);
    }
    function wikiLink(title, label, wiki, external) {
        if (wiki && !external) {
            // Titles are public API titles. Escape parser delimiters defensively.
            return '[[' + title.replace(/[\[\]{}|<>\r\n]/g, function (c) { return '&#' + c.charCodeAt(0) + ';'; }) + '|' + escape(label).replace(/[\[\]{}|\r\n]/g, function (c) { return '&#' + c.charCodeAt(0) + ';'; }) + ']]';
        }
        var href = external || 'https://pt.wikipedia.org/wiki/' + encodeURIComponent(title.replace(/ /g, '_'));
        return wiki ? '[' + href + ' ' + escape(label) + ']' : '<a href="' + escape(href) + '" style="color:#36c;text-decoration:none;">' + escape(label) + '</a>';
    }
    function installationFooter(presentation, settings, wiki) {
        if (appearance.footerOwner(settings) !== 'activity') { return ''; }
        return ("<div id=\"dan-pu-ritmo-install\" style=\"margin-top:18px;padding-top:14px;border-top:1px solid #eaecf0;color:#54595d;font-size:12px;\">"+tr("Gostou deste painel?")+" ") +
            wikiLink(presentation.documentationPage || 'Usuário:Daniel G Rego/PerfilWiki', tr("Veja como adicionar à sua página de usuário."), wiki) + '</div>';
    }
    function profileColors(settings,scope) {
        var automatic=scope==='top'?appearance.topColors(settings).foreground:'#54595d';
        return {name:settings.nameColor||automatic,label:settings.labelColor||automatic,information:settings.informationColor||automatic,
            labelStyle:settings.labelColor||settings.informationColor?'color:'+(settings.labelColor||automatic)+';':''};
    }
    function profileLabel(displayName, settings, wiki, scope) {
        return '<div class="dan-pu-profile-label" style="color:'+profileColors(settings,scope).name+';font-size:' + settings.nameFontSize + 'px;text-align:' + settings.nameAlignment + ';">' + escapeData(displayName,wiki) + '</div>';
    }
    function profileText(value, wiki) {
        var text = escapeData(value,wiki);
        return wiki ? text.replace(/:/g,'&#58;') : text;
    }
    function profileValue(value, wiki,settings) {
        try { return wiki ? profileTextApi.wikitext(value,settings&&settings.informationColor) : profileTextApi.html(value,settings&&settings.informationColor); }
        catch (_) { return profileText(value,wiki); }
    }
    function appendProfileValue(document, parent, value,settings) {
        try { profileTextApi.append(document,parent,value,settings&&settings.informationColor); }
        catch (_) { parent.textContent = value; }
    }
    function profileTimestamp(value) {
        if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value)) { return null; }
        var date = new Date(value);
        return Number.isFinite(date.getTime()) && date.toISOString().replace('.000Z','Z') === value.replace('.000Z','Z') ? date.getTime() : null;
    }
    function accountCreated(state, user, now) {
        var stats = state.statistics, evidence = stats && stats.registrationCoverage;
        var earliest = stats && stats.metrics && profileTimestamp(stats.metrics.earliestRegistration);
        var checked = evidence && profileTimestamp(evidence.checkedAt);
        var clock = new Date(now === undefined ? Date.now() : now).getTime();
        if (!stats || stats.user !== user || !evidence || evidence.version !== 1 || evidence.user !== user ||
            !Array.isArray(evidence.accounts) || earliest === null || checked === null || !Number.isFinite(clock) || checked > clock) { return null; }
        var known = [], complete = evidence.complete === true, valid = true;
        [evidence.globalRegistration].concat(evidence.accounts.map(function (account) { return account && account.registration; })).forEach(function (value) {
            var timestamp = profileTimestamp(value);
            if (timestamp === null) { complete = false; }
            else if (timestamp > checked) { valid = false; }
            else { known.push(timestamp); }
        });
        if (!valid || !known.length || Math.min.apply(null,known) !== earliest) { return null; }
        return {date:accountDateFormatter.format(new Date(earliest)),timestamp:new Date(earliest).toISOString(),complete:complete};
    }
    function createdParts(created) {
        return created ? {label:created.complete?tr("Conta criada em:"):tr("Data de criação mais antiga disponível:"),value:created.date} : {label:tr("Data de criação"),value:tr("indisponível")};
    }
    function metadataLabel(text,labelStyle) { return '<strong style="font-weight:600;'+(labelStyle||'')+'">'+escape(text)+'</strong>'; }
    function createdMarkup(created,labelStyle) { var parts=createdParts(created);return metadataLabel(parts.label,labelStyle)+' '+escape(parts.value); }

    function createdProof(created, user) {
        return created ? JSON.stringify({version:1,user:user,timestamp:created.timestamp,complete:created.complete}) : null;
    }
    function storedCreated(raw, user, now) {
        try {
            var proof = raw && JSON.parse(raw);
            var timestamp = proof && profileTimestamp(proof.timestamp);
            var clock = new Date(now === undefined ? Date.now() : now).getTime();
            if (!proof || proof.version !== 1 || proof.user !== user || typeof proof.complete !== 'boolean' || timestamp === null ||
                !Number.isFinite(clock) || timestamp > clock) { return null; }
            return {date:accountDateFormatter.format(new Date(timestamp)),timestamp:new Date(timestamp).toISOString(),complete:proof.complete};
        } catch (_) { return null; }
    }
    function savedCreated(element, user, now) {
        return storedCreated(element && element.getAttribute('data-perfilwiki-account-created'),user,now);
    }
    function captureAccountCreated(root, user, now) {
        if (!root || !root.getAttribute || root.getAttribute('data-perfilwiki-user') !== user || !root.querySelector) { return null; }
        var created = savedCreated(root.querySelector('.dan-pu-account-created'),user,now);
        return createdProof(created,user);
    }
    function profileRows(state, presentation, settings, user, scope, created) {
        var rows=[],time=settings.showLocalTime&&appearance.fieldIn(settings,scope,'localTime')?{
            type:'time',zone:presentation.timeZone||state.config&&state.config.timeZone||'UTC',now:presentation.now
        }:null;
        if(appearance.fieldIn(settings,scope,'location')&&typeof presentation.location==='string'&&presentation.location.trim()) {
            rows.push({type:'location',value:presentation.location.normalize('NFC').trim(),time:time});
        }else if(time){
            rows.push(time);
        }
        var normalizedFields=[];
        if(Array.isArray(presentation.customFields))presentation.customFields.slice(0,3).forEach(function(field){
            try { normalizedFields=normalizedFields.concat(fieldsApi.normalize([field])); } catch (_) { /* An incomplete draft does not hide other fields. */ }
        });
        normalizedFields.forEach(function(field){
            if(!appearance.fieldIn(settings,scope,field.placement))return;
            rows.push({type:'field',label:field.label,field:field,values:fieldsApi.values(field),layout:fieldsApi.layoutOf(field),separator:fieldsApi.separatorOf(field)});
        });
        if(settings.showUserGroups&&appearance.fieldIn(settings,scope,'userGroups')){
            var stats=state.statistics,proof=groupsApi.fromProof(stats&&stats.userGroups,user,presentation.now);
            rows.push({type:'groups',proof:proof,text:proof?groupsApi.text(proof,user,presentation.now,settings.language):stats&&Array.isArray(stats.errors)&&stats.errors.indexOf('Estatutos na ptwiki')>=0?tr("Estatutos indisponíveis"):tr("Aguardando dados")});
        }
        if(settings.showAccountCreated&&appearance.fieldIn(settings,scope,'accountCreated'))rows.push({type:'created',created:created});
        return rows;
    }
    function currentCreated(state,presentation,user) {
        var created=accountCreated(state||{},user,presentation.now);
        if(!created&&!(state&&state.statistics&&state.statistics.registrationCoverage))created=storedCreated(presentation.savedAccountCreated,user,presentation.now);
        return created;
    }
    function fieldLabelStyle(field,settings,scope) {
        return field.labelColor ? 'color:'+field.labelColor+';' : profileColors(settings,scope).labelStyle;
    }
    function fieldValueColor(field,index) {
        return Object.prototype.hasOwnProperty.call(field,'value') ? field.valueColor || '' : field.valueColors && field.valueColors[index] || '';
    }
    function fieldValueMarkup(value,field,index,wiki,settings) {
        var color=fieldValueColor(field,index), effective=color?{informationColor:color}:settings;
        var output=profileValue(value,wiki,effective);
        return color?'<span style="color:'+color+';">'+output+'</span>':output;
    }
    function fieldMarkup(row,wiki,settings,scope) {
                settings=settings||appearance.normalize();var labelStyle=fieldLabelStyle(row.field,settings,scope);
                if(!row.values.length)return '<div class="dan-pu-profile-field"'+(Object.prototype.hasOwnProperty.call(row.field,'values')?' data-field-layout="'+row.layout+'"':'')+'><span style="font-weight:600;'+labelStyle+'">'+profileText(row.label,wiki)+'</span></div>';
                if(row.field&&Object.prototype.hasOwnProperty.call(row.field,'value'))return '<div class="dan-pu-profile-field"><span style="font-weight:600;'+labelStyle+'">'+profileText(row.label,wiki)+':</span> '+fieldValueMarkup(row.field.value,row.field,0,wiki,settings)+'</div>';
                var values=row.values.map(function(value,index){return fieldValueMarkup(value,row.field,index,wiki,settings);}), contents;
                if(row.layout==='bullets')contents='<ul class="dan-pu-field-values" data-layout="bullets">'+values.map(function(value){return '<li>'+value+'</li>';}).join('')+'</ul>';
                else if(row.layout==='lines')contents='<div class="dan-pu-field-values" data-layout="lines">'+values.map(function(value){return '<div>'+value+'</div>';}).join('')+'</div>';
                else contents='<span class="dan-pu-field-values" data-layout="inline">'+values.map(function(value,index){return (index?'<span class="dan-pu-field-separator" aria-hidden="true">'+(row.separator==='dot'?' · ':row.separator==='space'?' ':wiki?' &#124; ':' | ')+'</span>':'')+'<span class="dan-pu-field-item">'+value+'</span>';}).join('')+'</span>';
                return '<div class="dan-pu-profile-field" data-field-layout="'+row.layout+'"><span style="font-weight:600;'+labelStyle+'">'+profileText(row.label,wiki)+':</span> '+contents+'</div>';
    }
    function customFieldMarkup(field,wiki,appearanceInput,scope) {
        var normalized=fieldsApi.normalize([field]);
        if(!normalized.length)return '';
        var value=normalized[0];
        return fieldMarkup({field:value,label:value.label,values:fieldsApi.values(value),layout:fieldsApi.layoutOf(value),separator:fieldsApi.separatorOf(value)},wiki,appearance.normalize(appearanceInput),scope||'activity');
    }
    function groupsCheckedTitle(proof) { return tr('Estatutos consultados em {date} UTC',{date:proof.checkedAt.slice(0,19).replace('T',' ')}); }
    function profileMetadata(rows,settings,wiki,user,scope) {
        var textColors=profileColors(settings,scope);
        function clockMarkup(row,tag){var value=clockApi.details(row.now,row.zone,wiki,settings.language);return '<'+tag+' class="dan-pu-local-time" data-perfilwiki-timezone="'+escapeData(row.zone,wiki)+'" data-perfilwiki-clock-at="'+escapeData(value.timestamp,wiki)+'" title="'+escapeData(value.title,wiki)+'">'+escape(value.text)+'</'+tag+'>';}
        var markup=rows.map(function(row){
            if(row.type==='location')return row.time?'<div class="dan-pu-profile-location-time"><span class="dan-pu-profile-location">'+profileValue(row.value,wiki,settings)+'</span><span class="dan-pu-location-time-separator" aria-hidden="true"> · </span>'+clockMarkup(row.time,'span')+'</div>':'<div class="dan-pu-profile-location">'+profileValue(row.value,wiki,settings)+'</div>';
            if(row.type==='field')return fieldMarkup(row,wiki,settings,scope);
            if(row.type==='time')return clockMarkup(row,'div');
            if(row.type==='groups')return '<div class="dan-pu-user-groups"'+(row.proof?' data-perfilwiki-user-groups="'+escapeData(JSON.stringify(row.proof),wiki)+'" title="'+escape(groupsCheckedTitle(row.proof))+'"':'')+'>'+metadataLabel(tr("Estatutos:"),textColors.labelStyle)+' '+escape(row.text)+'</div>';
            var created=row.created;
            return '<div class="dan-pu-account-created"'+(created?' data-perfilwiki-account-created="'+escapeData(createdProof(created,user),wiki)+'"':'')+'>'+createdMarkup(created,textColors.labelStyle)+
                (created&&!created.complete?("<div class=\"dan-pu-account-created-note\" style=\"margin-top:2px;font-size:12px;\">"+tr("Pode haver contas anteriores sem data registrada.")+"</div>"):'')+'</div>';
        }).join('');
        return rows.length?'<div class="dan-pu-profile-details" style="margin-top:6px;color:'+textColors.information+';font-size:13px;text-align:'+settings.nameAlignment+';" data-layout="'+settings.profileDetailsLayout+'" data-align="'+settings.nameAlignment+'">'+markup+'</div>':'';
    }
    function profileMarkup(state,presentation,wiki,scope) {
        presentation=presentation||{};state=state||{};scope=scope||'activity';
        var settings=appearance.normalize(presentation.appearance);
        if(!appearance.profileIn(settings,scope,presentation.customFields))return '';
        var user=presentation.user||state.config&&state.config.user||'';
        var displayName=typeof presentation.displayName==='string'&&presentation.displayName.trim()?presentation.displayName.normalize('NFC').trim():user;
        var rows=profileRows(state,presentation,settings,user,scope,currentCreated(state,presentation,user));
        var label=appearance.fieldIn(settings,scope,'name')?profileLabel(displayName,settings,wiki,scope):'';
        var photo=appearance.fieldIn(settings,scope,'photo')?profileTextApi.photoMarkup(Object.assign({},presentation,{displayName:displayName,user:user}),wiki):'';
        var details=profileMetadata(rows,settings,wiki,user,scope);
        return label||photo||details?'<div class="dan-pu-profile-content" data-layout="'+settings.profileDetailsLayout+'" data-photo-align="'+settings.photoAlignment+'" style="text-align:'+settings.nameAlignment+';">'+photo+'<div class="dan-pu-profile-copy">'+label+details+'</div></div>':'';
    }
    function paintProfile(document,state,presentation,scope) {
        presentation=presentation||{};
        var user=typeof presentation.user==='string'?presentation.user:state&&state.config&&state.config.user;
        if(!document||!user)return false;
        var settings=appearance.normalize(presentation.appearance),changed=false;
        var roots=[{scope:'activity',root:document.getElementById('dan-pu-ritmo')},{scope:'cards',root:document.getElementById('dan-pu-estatisticas')},{scope:'top',root:document.getElementById('dan-pu-profile-header')}];
        var retained=storedCreated(presentation.savedAccountCreated,user,presentation.now);
        roots.forEach(function(item){var root=item.root;if(!retained&&root&&root.getAttribute&&root.getAttribute('data-perfilwiki-user')===user&&root.querySelector)retained=savedCreated(root.querySelector('.dan-pu-account-created'),user,presentation.now);});
        var created=accountCreated(state||{},user,presentation.now);
        if(!created&&!(state&&state.statistics&&state.statistics.registrationCoverage))created=retained;
        function remove(node){if(node&&node.parentNode)node.parentNode.removeChild(node);}
        function element(className,text){var node=document.createElement('div');node.className=className;if(text!==undefined)node.textContent=text;return node;}
        function appendLabel(node,text,textColors){var label=document.createElement('strong');label.style.fontWeight='600';if(textColors.labelStyle)label.style.color=textColors.label;label.textContent=text;node.appendChild(label);}
        roots.forEach(function(item){
            var root=item.root;
            if(scope&&scope!==item.scope||!root||!root.getAttribute||root.getAttribute('data-perfilwiki-user')!==user||!root.querySelector)return;
            var textColors=profileColors(settings,item.scope);
            var slot=root.querySelector(item.scope==='cards'?'.dan-pu-cards-profile':item.scope==='top'?'.dan-pu-top-profile-slot':'.dan-pu-profile-slot'),profileRoot=slot||root;
            var label=profileRoot.querySelector('.dan-pu-profile-label'),previous=profileRoot.querySelector('.dan-pu-profile-details'),photo=profileRoot.querySelector('.dan-pu-profile-photo');
            var content=profileRoot.querySelector('.dan-pu-profile-content');
            var showName=appearance.fieldIn(settings,item.scope,'name'),rows=profileRows(state||{},presentation,settings,user,item.scope,created);
            var photoData=appearance.fieldIn(settings,item.scope,'photo')?profileTextApi.photoInfo(Object.assign({},presentation,{user:user})):null;
            if(!showName&&!rows.length&&!photoData){remove(content);remove(label);remove(previous);remove(photo);if(item.scope==='cards'){remove(slot);root.style.gridAutoRows='';}changed=true;return;}
            if(item.scope==='cards')root.style.gridAutoRows='auto';
            if(!slot){
                if(!root.insertBefore)return;
                slot=element(item.scope==='cards'?'dan-pu-cards-profile':item.scope==='top'?'dan-pu-top-profile-slot':'dan-pu-profile-slot');
                if(item.scope==='cards'){slot.style.gridColumn='1 / -1';slot.style.marginBottom='8px';slot.style.paddingBottom='12px';}
                root.insertBefore(slot,label&&label.parentNode===root?label:root.firstChild||root.childNodes&&root.childNodes[0]||null);
            }
            if(item.scope==='cards')slot.style.borderBottom=settings.profileDetailsLayout==='inline'?'':'1px solid #eaecf0';
            if(!content){content=element('dan-pu-profile-content');slot.appendChild(content);}
            content.setAttribute('data-layout',settings.profileDetailsLayout);content.setAttribute('data-photo-align',settings.photoAlignment);content.style.textAlign=settings.nameAlignment;
            var copy=content.querySelector('.dan-pu-profile-copy');if(!copy){copy=element('dan-pu-profile-copy');content.appendChild(copy);}
            var displayName=typeof presentation.displayName==='string'&&presentation.displayName.trim()?presentation.displayName.normalize('NFC').trim():user;
            if(showName){
                if(!label)label=element('dan-pu-profile-label');
                if(label.parentNode!==copy)copy.appendChild(label);
                label.textContent=displayName;label.style.textAlign=settings.nameAlignment;label.style.color=textColors.name;label.style.fontSize=settings.nameFontSize+'px';
            }else remove(label);
            var details=element('dan-pu-profile-details');details.style.marginTop='6px';details.style.color=textColors.information;details.style.fontSize='13px';details.style.textAlign=settings.nameAlignment;
            details.setAttribute('data-layout',settings.profileDetailsLayout);details.setAttribute('data-align',settings.nameAlignment);
            rows.forEach(function(row){
                var node;
                if(row.type==='location'){
                    node=element(row.time?'dan-pu-profile-location-time':'dan-pu-profile-location');
                    var location=row.time?document.createElement('span'):node;
                    if(row.time){location.className='dan-pu-profile-location';node.appendChild(location);}
                    appendProfileValue(document,location,row.value,settings);
                    if(row.time){
                        var between=document.createElement('span');between.className='dan-pu-location-time-separator';between.setAttribute('aria-hidden','true');between.textContent=' · ';node.appendChild(between);
                        var clock=document.createElement('span');clock.className='dan-pu-local-time';clockApi.paint(clock,row.time.now,row.time.zone,false,settings.language);node.appendChild(clock);
                    }
                }
                else if(row.type==='field'){
                    node=element('dan-pu-profile-field');node.setAttribute('data-field-layout',row.layout);
                    var key=document.createElement('span');key.style.fontWeight='600';if(fieldLabelStyle(row.field,settings,item.scope))key.style.color=row.field.labelColor||textColors.label;key.textContent=row.label+(row.values.length?': ':'');node.appendChild(key);
                    if(!row.values.length){details.appendChild(node);return;}
                    if(Object.prototype.hasOwnProperty.call(row.field,'value')){
                        var legacyValue=document.createElement('span'),legacyColor=fieldValueColor(row.field,0);if(legacyColor)legacyValue.style.color=legacyColor;appendProfileValue(document,legacyValue,row.field.value,legacyColor?{informationColor:legacyColor}:settings);node.appendChild(legacyValue);details.appendChild(node);return;
                    }
                    var values=document.createElement(row.layout==='bullets'?'ul':row.layout==='lines'?'div':'span');values.className='dan-pu-field-values';values.setAttribute('data-layout',row.layout);
                    row.values.forEach(function(value,index){
                        if(row.layout==='inline'&&index){var separator=document.createElement('span');separator.className='dan-pu-field-separator';separator.setAttribute('aria-hidden','true');separator.textContent=row.separator==='dot'?' · ':row.separator==='space'?' ':' | ';values.appendChild(separator);}
                        var valueNode=document.createElement(row.layout==='bullets'?'li':row.layout==='lines'?'div':'span'),valueColor=fieldValueColor(row.field,index);valueNode.className='dan-pu-field-item';if(valueColor)valueNode.style.color=valueColor;appendProfileValue(document,valueNode,value,valueColor?{informationColor:valueColor}:settings);values.appendChild(valueNode);
                    });node.appendChild(values);
                }else if(row.type==='time'){
                    node=element('dan-pu-local-time');clockApi.paint(node,row.now,row.zone,false,settings.language);
                }else if(row.type==='groups'){
                    node=element('dan-pu-user-groups');appendLabel(node,tr("Estatutos:"),textColors);var groupsValue=document.createElement('span');groupsValue.textContent=' '+row.text;node.appendChild(groupsValue);if(row.proof){node.setAttribute('data-perfilwiki-user-groups',JSON.stringify(row.proof));node.setAttribute('title',groupsCheckedTitle(row.proof));}
                }else{
                    node=element('dan-pu-account-created');var creation=createdParts(row.created);appendLabel(node,creation.label,textColors);var dateValue=document.createElement('span');dateValue.textContent=' '+creation.value;node.appendChild(dateValue);if(row.created)node.setAttribute('data-perfilwiki-account-created',createdProof(row.created,user));
                    if(row.created&&!row.created.complete){var note=element('dan-pu-account-created-note',tr("Pode haver contas anteriores sem data registrada."));note.style.marginTop='2px';note.style.fontSize='12px';node.appendChild(note);}
                }
                details.appendChild(node);
            });
            remove(previous);if(rows.length)copy.appendChild(details);
            if(!photoData)remove(photo);
            else{
                var image=photo&&photo.querySelector('.dan-pu-profile-photo-image');
                if(!photo||photo.getAttribute('data-perfilwiki-photo')!==photoData.filename||!image||image.getAttribute('src')!==photoData.src){
                    remove(photo);photo=element('dan-pu-profile-photo');photo.setAttribute('data-perfilwiki-photo',photoData.filename);
                    var imageLink=document.createElement('a');imageLink.className='dan-pu-profile-photo-image-link';imageLink.setAttribute('href',photoData.href);
                    image=document.createElement('img');image.className='dan-pu-profile-photo-image';
                    [['width','160'],['height','160'],['crossorigin','anonymous'],['referrerpolicy','no-referrer'],['loading','lazy'],['decoding','async'],['src',photoData.src]].forEach(function(pair){image.setAttribute(pair[0],pair[1]);});
                    var visual=element('dan-pu-profile-photo-visual');imageLink.appendChild(image);visual.appendChild(imageLink);photo.appendChild(visual);
                    var placeholder=document.createElement('span');placeholder.className='dan-pu-profile-photo-placeholder';placeholder.hidden=true;placeholder.textContent=tr("Imagem indisponível");visual.appendChild(placeholder);
                    var caption=element('dan-pu-profile-photo-caption'),link=document.createElement('a');link.className='dan-pu-profile-photo-link';link.setAttribute('href',photoData.href);link.textContent=tr("Ver arquivo no Commons");caption.appendChild(link);photo.appendChild(caption);
                }
                var photoVisual=photo.querySelector('.dan-pu-profile-photo-visual');
                if(!photoVisual){
                    photoVisual=element('dan-pu-profile-photo-visual');photo.insertBefore(photoVisual,photo.firstChild||photo.childNodes&&photo.childNodes[0]||null);
                    var retainedLink=photo.querySelector('.dan-pu-profile-photo-image-link'),retainedPlaceholder=photo.querySelector('.dan-pu-profile-photo-placeholder');
                    if(retainedLink)photoVisual.appendChild(retainedLink);if(retainedPlaceholder)photoVisual.appendChild(retainedPlaceholder);
                }
                photo.setAttribute('data-photo-size',settings.photoSize);photo.setAttribute('data-photo-shape',settings.photoShape);
                image.setAttribute('alt',tr('Foto de {name}',{name:displayName}));
                if(photo.parentNode!==content)content.insertBefore(photo,copy);
            }
            changed=true;
        });
        return changed;
    }
    function streakGoal(current, best) {
        var goals = [7, 14, 30, 45, 60, 90, 100, 150, 200, 250, 365, 500, 730, 1000];
        var maximum = Math.max(current, best || 0);
        while (goals[goals.length - 1] <= maximum) { goals.push(goals[goals.length - 1] + 365); }
        var nextIndex = goals.findIndex(function (days) { return days > current; });
        var earned = goals.filter(function (days) { return days <= maximum; });
        return { current: current, next: goals[nextIndex], following: goals[nextIndex + 1] || goals[nextIndex] + 365,
            achieved: earned.length ? earned[earned.length - 1] : 0,
            remaining: goals[nextIndex] - current, percent: Math.min(100, current / goals[nextIndex] * 100) };
    }
    function render(state, wiki, allRows) {
        var a = state.activity && state.activity.summary;
        var p = state.pageviews;
        var user = state.config && state.config.user || '';
        var activityZone = state.config && state.config.timeZone || 'UTC';
        var presentation = allRows && typeof allRows === 'object' ? allRows : {};
        var displayName = typeof presentation.displayName === 'string' && presentation.displayName.trim() ? presentation.displayName.normalize('NFC').trim() : user;
        var settings = appearance.normalize(presentation.appearance), colors = appearance.colors(settings), palette = colors.palette;
        if (!settings.showActivity) { return ''; }
        var attributes = ' data-perfilwiki-user="' + escape(user) + '" class="' + appearance.classes(settings) + '" data-perfilwiki-appearance="' + escape(JSON.stringify(settings)) + '" lang="'+settings.language+'"';
        var profile = '<div class="dan-pu-profile-slot" data-perfilwiki-profile-slot="activity">' + profileMarkup(state,presentation,wiki,'activity') + '</div>';
        if (!a) { return (wiki ? '<templatestyles src="' + escape(presentation.stylesPage || 'Usuário:Daniel G Rego/RitmoPU-estilos') + '" />' : '') + '<div id="dan-pu-ritmo"' + attributes + ("><strong>"+tr("Atividade na Wikipédia em Português")+"</strong>") + profile + layoutView.slotMarkup(settings) + ("<p>"+tr("As estatísticas ainda não foram consultadas.")+"</p>") + installationFooter(presentation, settings, wiki) + '</div>'; }
        var h = [];
        h.push('<div id="dan-pu-ritmo"' + attributes + ' data-perfilwiki-project="pt.wikipedia.org" style="clear:both;box-sizing:border-box;margin:2.1em 0;padding:' + (settings.density === 'compact' ? '18px' : settings.density === 'roomy' ? '32px' : '24px') + ';border:1px solid #c8ccd1;border-top:3px solid ' + colors.accent + ';border-radius:12px;background:#fff;color:#202122;font-size:14px;line-height:1.5;">');
        h.push('<div style="display:flex;flex-wrap:wrap;align-items:center;gap:20px;margin-bottom:25px;">');
        var lastEdit = presenter && presenter.lastEditAt(state);
        var lastExact = lastEdit && presenter.absoluteTime(lastEdit,settings.language);
        var lastLabel = wiki ? lastExact : lastEdit && presenter.relativeTime(lastEdit, presentation.now,settings.language);
        h.push(("<div style=\"flex:1 1 300px;min-width:0;\"><div style=\"font-family:Georgia,serif;font-size:29px;font-weight:bold;line-height:1.2;margin-bottom:7px;\">"+tr("Atividade na Wikipédia em Português")+"</div>"));
        var profileIndex=h.length;h.push(profile);
        h.push('<div class="dan-pu-last-edit-line" style="margin-top:10px;color:#54595d;font-size:12px;">' + (wiki ? tr("Última edição consultada") : tr("Última edição")) + ' · <span class="dan-pu-last-edit" data-live="' + (wiki ? 'false' : 'true') + '"' + (lastEdit ? ' data-timestamp="' + escape(lastEdit) + '" title="' + escape(lastExact) + '"' : '') + '>' + escape(lastLabel || (lastEdit ? tr("Horário indisponível") : tr("Nenhuma edição encontrada"))) + '</span></div></div>');
        var goal = streakGoal(a.currentStreak, a.bestStreak);
        // Wikipedia removes numeric ARIA attributes from saved markup. A static
        // image label preserves the full value for visitors; the owner's live
        // DOM uses the native progressbar semantics.
        var goalAria = wiki ? 'role="img" aria-label="' + escape(tr('{current} de {goal} dias seguidos, faltam {remaining} dias',{current:a.currentStreak,goal:goal.next,remaining:goal.remaining}))+'"' :
            'role="progressbar" aria-label="'+tr('Meta de dias seguidos')+'" aria-valuemin="0" aria-valuemax="' + goal.next + '" aria-valuenow="' + a.currentStreak + '"';
        h.push('<div style="flex:1 1 300px;background:#faf7ef;border-radius:10px;padding:16px 20px;">');
        h.push('<div style="display:flex;align-items:center;gap:24px;"><div style="flex:1;"><div style="font-size:33px;font-weight:700;line-height:1.2;">' + number(a.currentStreak) + ("</div><div style=\"color:#54595d;\">"+tr("dias seguidos")+"</div></div><div style=\"flex:1.5;min-width:140px;\"><div style=\"color:#54595d;font-size:12px;\">"+tr("Próxima meta")+"</div><div style=\"font-size:24px;font-weight:700;line-height:1.4;\">") + number(goal.next) + (tr(" dias")+"</div><div style=\"display:flex;justify-content:space-between;gap:8px;font-size:12px;color:#54595d;margin:4px 0;\">") + tr('{current} de {goal}',{current:number(a.currentStreak),goal:number(goal.next)}) + '<span>' + tr('Faltam {number}',{number:number(goal.remaining)}) + '</span></div><div ' + goalAria + ' style="height:7px;border-radius:4px;background:#e5e1d7;overflow:hidden;"><div style="height:7px;width:' + goal.percent.toFixed(2) + '%;background:#36c;border-radius:4px;"></div></div></div></div>');
        h.push('<div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px;margin-top:13px;padding-top:11px;border-top:1px solid #e5e1d7;font-size:12px;"><span style="color:#246342;font-weight:600;">' + (goal.achieved ? '✓ ' + tr('{number} dias alcançados',{number:number(goal.achieved)}) : tr("Seu primeiro marco: 7 dias")) + '</span><span style="color:#54595d;">' + tr('Depois: {number} dias',{number:number(goal.following)}) + '</span></div></div></div>');
        h.push(layoutView.slotMarkup(settings));
        h.push('<div style="border:1px solid #d8dce3;border-radius:10px;padding:18px;margin-bottom:20px;">');
        h.push(("<div style=\"display:flex;flex-wrap:wrap;align-items:baseline;gap:7px 14px;margin-bottom:18px;\"><strong style=\"font-family:Georgia,serif;font-size:20px;\">"+tr("12 semanas")+"</strong><span style=\"color:#54595d;\">") + shortDate(a.gridStart) + tr(" a ") + shortDate(a.today) + ("</span><span style=\"margin-left:auto;color:#54595d;font-size:12px;\">"+tr("Edições por dia")+"</span></div>"));
        var weeks = a.weeks;
        var max = Math.max.apply(null, weeks.flatMap(function (w) { return w.days.map(function (d) { return d.count || 0; }); }));
        var legend = palette.map(function (color) { return '<span style="display:inline-block;width:15px;height:15px;border-radius:3px;background:' + color + ';vertical-align:middle;"></span>'; }).join(' ');
        h.push('<div style="overflow-x:auto;"><div style="min-width:240px;display:grid;grid-template-columns:28px 1fr;gap:8px;">');
        h.push('<div style="display:grid;grid-template-rows:repeat(7,24px);gap:3px;font-size:11px;color:#54595d;">' + (language==='pt-BR'?weekdays:Array.from({length:7},function(_,index){return i18n.date(language,Date.UTC(2026,9,12+index),{weekday:'short'});})).map(function (d) { return '<span style="display:flex;align-items:center;">' + d + '</span>'; }).join('') + '</div>');
        h.push('<div role="img" aria-label="' + escape(tr('{edits} edições em {days} dos últimos 30 dias. Fuso {zone}.',{edits:a.edits30,days:a.activeDays30,zone:activityZone})) + '" style="display:grid;grid-template-columns:repeat(12,minmax(12px,1fr));grid-template-rows:repeat(7,24px);grid-auto-flow:column;gap:3px;">');
        weeks.forEach(function (week) {
            week.days.forEach(function (day) {
                var bucket = !day.count ? 0 : Math.max(1, Math.min(4, Math.ceil(Math.log(1 + day.count) / Math.log(1 + Math.max(2, max)) * 4)));
                var label = day.future ? shortDate(day.date) + tr(", dia ainda não concluído") : shortDate(day.date) + ': ' + number(day.count) + tr(" edições");
                h.push('<span data-date="' + day.date + '" data-count="' + day.count + '" title="' + escape(label) + '" style="display:block;border-radius:3px;background:' + (day.future ? '#f8f9fa' : palette[bucket]) + ';' + (day.date === a.today ? 'outline:2px solid #202122;outline-offset:1px;' : '') + '"></span>');
            });
        });
        h.push('</div><span></span><div style="display:grid;grid-template-columns:repeat(12,minmax(12px,1fr));gap:3px;font-size:9px;color:#54595d;">' + weeks.map(function (w) { var date = w.start.split('-').map(Number); return '<span style="text-align:center;white-space:nowrap;">' + date[2] + '/' + date[1] + '</span>'; }).join('') + '</div></div></div>');
        h.push('<div style="display:flex;flex-wrap:wrap;justify-content:space-between;gap:12px;margin-top:17px;font-size:12px;color:#54595d;"><span>' + tr('{edits} edições · {articles} artigos diferentes editados nos últimos 30 dias',{edits:number(a.edits30),articles:number(a.articles30)}) + '</span><span>'+tr('Nenhuma')+' ' + legend + ' '+tr('Mais edições')+'</span></div></div>');
        h.push('<div class="dan-pu-readership" data-perfilwiki-user="' + escape(user) + '" data-perfilwiki-project="pt.wikipedia.org" data-metric-version="after-first-edit-v1" data-total-model="all-periods-all-eligible-v1" style="border:1px solid #d8dce3;border-radius:10px;padding:' + (settings.density === 'roomy' ? '24px' : '18px') + ';">');
        h.push('<div class="dan-pu-readership-heading" style="font-family:Georgia,serif;font-size:23px;font-weight:bold;line-height:1.25;margin-bottom:5px;">' + tr('Visualizações dos artigos editados por {name}.',{name:escapeData(displayName,wiki)}) + '</div>');
        h.push(("<div style=\"color:#54595d;font-size:12px;\">"+tr("Somente após sua primeira edição em cada artigo.")+"</div>"));
        var explanation = tr('Os períodos somam as visitas recebidas depois da sua primeira edição em cada artigo. Os totais abrangem todos os artigos elegíveis, mesmo quando a lista mostra apenas uma parte. A contagem de visualizações começa no dia seguinte à primeira edição, em UTC. As sequências usam o fuso {zone}. A última edição corresponde ao histórico consultado, que pode ter sido atualizado antes desta visita.',{zone:escape(activityZone)});
        if (wiki) {
            h.push('<div class="dan-pu-data-help">' + wikiLink(presentation.documentationPage ? presentation.documentationPage + '#Como_os_dados_são_contados' : 'Usuário:Daniel G Rego/PerfilWiki#Como_os_dados_são_contados', tr("Sobre estes dados"), true) + '</div>');
        } else {
            h.push(("<details class=\"dan-pu-data-help\"><summary>"+tr("Sobre estes dados")+"</summary><div>") + explanation + '</div></details>');
        }
        var keys = ['30d', '90d', '12m', 'since', 'custom'];
        var labels = { '30d': tr("30 dias"), '90d': tr("90 dias"), '12m': tr("12 meses"), 'since': tr("Total acumulado"), 'custom':tr("Personalizado") };
        var titles = { '30d': tr("Visualizações nos últimos 30 dias"), '90d': tr("Visualizações nos últimos 90 dias"), '12m': tr("Visualizações nos últimos 12 meses"), 'since': tr("Visualizações acumuladas"), 'custom':tr("Visualizações no período escolhido") };
        keys.forEach(function (key) { h.push('<span id="dan-pu-view-' + key + '" class="dan-pu-view-target" aria-hidden="true"></span>'); });
        h.push(("<div class=\"dan-pu-period-tabs plainlinks\" role=\"navigation\" aria-label=\""+tr("Período de visualizações")+"\">"));
        keys.forEach(function (key) {
            h.push(wiki ? '<span id="dan-pu-ritmo-tab-' + key + '" class="dan-pu-tab-' + key + '">[{{fullurl:{{FULLPAGENAME}}}}#dan-pu-view-' + key + ' ' + labels[key] + ']</span>' :
                '<a id="dan-pu-ritmo-tab-' + key + '" class="dan-pu-tab-' + key + '" href="#dan-pu-view-' + key + '">' + labels[key] + '</a>');
        });
        h.push('</div>');
        keys.forEach(function (key) {
            var profile = p && p.periods && p.periods[key];
            var previousProfile = p && p.lastCompleteSnapshot && p.lastCompleteSnapshot.periods && p.lastCompleteSnapshot.periods[key];
            if (key === 'custom') {
                var chosen = settings.customRange;
                var matches = function (period) { return chosen && period && period.start === chosen.start && period.end === chosen.end; };
                if (!matches(p && p.customRange) || !matches(profile && profile.period)) { profile = null; }
                if (!matches(previousProfile && previousProfile.period)) { previousProfile = null; }
            }
            var needsPrevious = profile && !profile.complete;
            var data = needsPrevious && (profile.lastCompleteSnapshot || previousProfile) || profile;
            // The display cap never changes the all-article totals or cached proofs.
            if (key === 'custom' && data && !matches(data.period)) { data = profile; }
            var rows = (data && data.rows || []).slice().sort(function (x, y) { return (y.views == null ? -1 : y.views) - (x.views == null ? -1 : x.views) || x.title.localeCompare(y.title, 'pt'); }).slice(0, 500);
            var eligible = data && data.proof && Number.isSafeInteger(data.proof.eligible) ? data.proof.eligible : (p && p.metadata && p.metadata.cohort ? p.metadata.cohort.length : 0);
            var requestedRows = allRows && allRows.visibleCounts && allRows.visibleCounts[key];
            var expanded = allRows === true || allRows && allRows.expanded && allRows.expanded[key];
            var visibleRows = Math.min(rows.length, expanded ? rows.length : Number.isSafeInteger(requestedRows) ? Math.max(10, requestedRows) : 10);
            var exact = !!data && data.rankingComplete;
            h.push('<div id="dan-pu-period-' + key + '" class="dan-pu-period dan-pu-period-' + key + '">');
            if (key === 'custom' && !wiki) {
                var clock = new Date(presentation.now === undefined ? Date.now() : presentation.now);
                var lastDay = new Date(Date.UTC(clock.getUTCFullYear(),clock.getUTCMonth(),clock.getUTCDate()) - 86400000).toISOString().slice(0,10);
                var defaultStart = new Date(Date.parse(lastDay + 'T00:00:00Z') - 29 * 86400000).toISOString().slice(0,10);
                var selectedRange = settings.customRange || {start:defaultStart,end:lastDay};
                h.push('<form id="dan-pu-custom-form" style="display:flex;flex-wrap:wrap;align-items:end;gap:10px;margin-bottom:16px;">' +
                    ("<label style=\"display:grid;gap:4px;font-size:13px;\">De<input id=\"dan-pu-custom-start\" type=\"date\" aria-label=\""+tr("Data inicial")+"\" aria-describedby=\"dan-pu-custom-error\" min=\"2015-07-01\" max=\"") + lastDay + '" value="' + selectedRange.start + '" style="max-width:100%;box-sizing:border-box;padding:6px;border:1px solid #a2a9b1;border-radius:4px;"></label>' +
                    ("<label style=\"display:grid;gap:4px;font-size:13px;\">Até<input id=\"dan-pu-custom-end\" type=\"date\" aria-label=\""+tr("Data final")+"\" aria-describedby=\"dan-pu-custom-error\" min=\"2015-07-01\" max=\"") + lastDay + '" value="' + selectedRange.end + '" style="max-width:100%;box-sizing:border-box;padding:6px;border:1px solid #a2a9b1;border-radius:4px;"></label>' +
                    '<button id="dan-pu-custom-apply" type="submit" style="padding:7px 12px;border:1px solid ' + colors.ink + ';border-radius:4px;background:' + colors.accent + ';color:' + colors.foreground + (";font-weight:600;cursor:pointer;\">"+tr("Aplicar período")+"</button>") +
                    '<div id="dan-pu-custom-error" role="alert" style="flex-basis:100%;color:#b32424;font-size:12px;"></div></form>');
            }
            h.push('<div style="font-size:17px;font-weight:600;margin-bottom:8px;">' + titles[key] + '</div>');
            var totalExact = exact && data.complete && Number.isSafeInteger(data.allArticleTotal);
            if (totalExact) {
                h.push('<div style="font-size:33px;font-weight:700;line-height:1.2;">' + number(data.allArticleTotal) + '</div>');
                h.push('<div style="color:#54595d;font-size:13px;margin:4px 0 10px;">'+tr('nos {number} artigos editados por você',{number:number(eligible)})+'</div>');
            } else { h.push('<div style="color:#54595d;margin:4px 0 10px;">' + (key === 'custom' && !settings.customRange ? tr("Escolha as datas e aplique o período.") : tr("Somando as visualizações de todos os artigos editados.")) + '</div>'); }
            if (data && data.period) { h.push('<div style="color:#54595d;font-size:12px;margin-bottom:4px;">' + (key === 'since' ? tr('Até {date}',{date:shortDate(data.period.end)+(language==='pt-BR'||language==='pt-PT'?' de ':' ')+data.period.end.slice(0,4)}) : range(data.period)) + ' · UTC</div>'); }
            if (key === 'since' && data && data.proof && data.proof.truncatedArticles > 0) {
                h.push(("<div style=\"color:#54595d;font-size:12px;margin-bottom:8px;\">"+tr("Histórico disponível desde 1 jul. de 2015. Artigos editados antes disso têm contagem parcial.")+"</div>"));
            }
            if (key !== 'since') { h.push('<div style="color:#54595d;font-size:12px;margin-bottom:17px;">'+tr('Todo o histórico · {number} artigos editados',{number:number(eligible)})+'</div>'); }
            if (rows.length) {
                var sorted = rows;
                h.push('<div style="display:flex;justify-content:space-between;gap:12px;padding-bottom:8px;border-bottom:1px solid #c8ccd1;color:#54595d;font-size:12px;"><span>' + (exact ? tr("Artigo") : tr("Ordem provisória")) + ("</span><span>"+tr("Visualizações")+"</span></div>"));
                function renderRow(row, index) {
                    var countedFrom = row.countFromDate || data.period.start;
                    var details = 'https://pageviews.wmcloud.org/?project=pt.wikipedia.org&platform=all-access&agent=user&start=' + countedFrom + '&end=' + data.period.end + '&pages=' + encodeURIComponent(row.title.replace(/ /g, '_'));
                    var firstDate = key === 'since' && row.firstEditAt ? row.firstEditAt.slice(0, 10) : null;
                    var firstLabel = firstDate ? '<span class="dan-pu-view-first">'+tr('Primeira edição: {date}',{date:shortDate(firstDate)+(language==='pt-BR'||language==='pt-PT'?' de ':' ')+firstDate.slice(0,4)})+'</span>' : '';
                    var pending = ("<span class=\"dan-pu-view-pending\"><span aria-hidden=\"true\">◷</span> "+tr("Aguardando dados")+"</span>");
                    var viewLabel = Number.isSafeInteger(row.views) ? countedFrom <= data.period.end ? wikiLink('', number(row.views), wiki, details) : number(row.views) : pending;
                    // Keep the rank as real text. CSS Grid positions it without
                    // a wrapper. The lifetime date stays outside the article link.
                    var articleLabel = wikiLink(row.title, row.title, wiki);
                    if (firstLabel) { articleLabel = '<span class="dan-pu-view-title">' + articleLabel + firstLabel + '</span>'; }
                    var linkedViews = Number.isSafeInteger(row.views) && countedFrom <= data.period.end;
                    if (!linkedViews) { viewLabel = '<span class="dan-pu-view-views">' + viewLabel + '</span>'; }
                    if (index < 10) {
                        var image = presenter && presenter.imageFor(presentation.images, row);
                        var picture = image ? (wiki ? '[[Ficheiro:' + image.file + '|48x48px|link=|alt=]]' : '<img class="dan-pu-thumb" src="' + escape(image.src) + '" alt="" width="48" height="48" loading="lazy" decoding="async" crossorigin="anonymous" referrerpolicy="no-referrer">') : '<span class="dan-pu-thumb-placeholder" aria-hidden="true">▧</span>';
                        h.push('<div class="dan-pu-view-row" data-layout="featured" data-shade="' + (index % 2 ? 'alternate' : 'plain') + '" style="display:grid;grid-template-columns:24px 48px minmax(0,1fr) max-content;column-gap:12px;">' +
                            '<span class="dan-pu-view-rank">' + (index + 1) + '</span><span class="dan-pu-view-image" aria-hidden="true" data-pageid="' + row.pageid + '" data-title="' + escape(row.title) + '">' + picture + '</span>' +
                            '<span class="dan-pu-featured-title">' + wikiLink(row.title, row.title, wiki) + firstLabel + '</span><span class="dan-pu-featured-views">' + viewLabel + '</span></div>');
                    } else {
                        h.push('<div class="dan-pu-view-row" data-layout="compact">' + (index + 1) + articleLabel + viewLabel + '</div>');
                    }
                }
                sorted.slice(0, wiki ? 10 : visibleRows).forEach(renderRow);
                if (sorted.length > 10) {
                    if (wiki) {
                        var stages = 0;
                        for (var start = 10; start < sorted.length; start += 100) {
                            var chunk = sorted.slice(start, start + 100);
                            h.push('<div class="dan-pu-native-more mw-collapsible mw-collapsed" data-expandtext="' + tr('Mostrar mais {number}',{number:chunk.length}) + '" data-collapsetext="' + (start === 10 ? tr("Mostrar só 10") : tr("Ocultar esta etapa")) + '"><div class="mw-collapsible-content">');
                            chunk.forEach(function (row, index) { renderRow(row, index + start); });
                            stages += 1;
                        }
                        for (var stage = 0; stage < stages; stage += 1) { h.push('</div></div>'); }
                    } else {
                        h.push('<div style="display:flex;flex-wrap:wrap;align-items:center;gap:12px;margin-top:13px;">');
                        h.push('<span style="color:#54595d;font-size:12px;">'+tr('Exibindo {shown} de {total} artigos',{shown:number(visibleRows),total:number(sorted.length)})+'</span>');
                        if (visibleRows < sorted.length) {
                            h.push('<span id="dan-pu-ritmo-expand-' + key + '">' + wikiLink('Especial:Contribuições/' + user, tr('Mostrar mais {number}',{number:Math.min(100,sorted.length-visibleRows)}), false) + '</span>');
                        }
                        if (visibleRows > 10) {
                            h.push('<span id="dan-pu-ritmo-collapse-' + key + '">' + wikiLink('Especial:Contribuições/' + user, tr("Mostrar só 10"), false) + '</span>');
                        }
                        h.push('</div>');
                    }
                }
            }
            if (profile && !profile.complete && p && p.progress) {
                var preparing = p.metadata && !p.metadata.complete;
                var progressLabel = preparing ? tr('Preparando artigos · {done} de {total} títulos verificados', {
                    done: number(p.metadata.cursor), total: number(p.candidates.length)
                }) : tr('Consultando visualizações · {done} de {total} artigos', {
                    done: number(p.progress.collectedArticles || 0),
                    total: number(p.progress.eligible || eligible)
                });
                h.push('<div role="status" style="margin-top:12px;color:#54595d;font-size:12px;">'+progressLabel+'</div>');
            }
            var stamp = new Intl.DateTimeFormat(language, { timeZone: 'UTC', dateStyle: 'short', timeStyle: 'short' }).format(new Date(data && data.capturedAt || (data !== profile && p && p.lastCompleteSnapshot && p.lastCompleteSnapshot.capturedAt) || p && p.capturedAt || state.capturedAt));
            h.push('<div style="margin-top:15px;color:#54595d;font-size:11px;">'+tr('Atualizado em {date} UTC',{date:escape(stamp)})+'</div></div>');
        });
        h.push('</div>' + installationFooter(presentation, settings, wiki) + '</div>');
        // Newlines between inline cells make the wiki parser insert a paragraph
        // inside the CSS grid. Keep the exported HTML fragment contiguous.
        var markup = h.map(function(fragment,index){return index===profileIndex?fragment:fragment.replace(/style="[^"]*"/g, function (style) { return style.replace(/#36c\b|#3366cc\b|#2454a6\b/g, colors.ink); });}).join('');
        return (wiki ? '<templatestyles src="' + escape(presentation.stylesPage || 'Usuário:Daniel G Rego/RitmoPU-estilos') + '" />' : '') + markup;
    }
    return Object.freeze({ streakGoal: streakGoal, paintProfile:function(){return inLanguage(paintProfile,arguments[2],arguments);}, profileMarkup:function(){return inLanguage(profileMarkup,arguments[1],arguments);}, customFieldMarkup:function(){return inLanguage(customFieldMarkup,arguments[2],arguments);}, captureAccountCreated:captureAccountCreated, html: function (s, all) { return inLanguage(render,all,[s,false,all]); }, wikitext: function (s, options) { return inLanguage(render,options,[s,true,options||false]); } });
}));

;

/* PerfilWiki. Public profile header shared by local preview and saved output. CC BY-SA 4.0. */
(function(root,factory){
    var api=factory(typeof module==='object'&&module.exports?require('./ActivityView.js'):root.PerfilWikiActivityView,
        typeof module==='object'&&module.exports?require('./Appearance.js'):root.PerfilWikiAppearance,
        typeof module==='object'&&module.exports?require('./ProfileClock.js'):root.PerfilWikiProfileClock,
        typeof module==='object'&&module.exports?require('./ProfileText.js'):root.PerfilWikiProfileText,
        typeof module === 'object' && module.exports ? require('./I18n.js') : root.PerfilWikiI18n);
    if(typeof module==='object'&&module.exports)module.exports=api;
    else root.PerfilWikiProfileHeaderView=api;
}(typeof window!=='undefined'?window:this,function(activity,appearance,clock,profileText,i18n){
    'use strict';
    var language='pt-BR';
    function tr(source,params){return i18n.t(language,source,params);}
    function inLanguage(fn,presentation,args){var previous=language;language=i18n.normalizeLanguage(presentation&&presentation.language||presentation&&presentation.appearance&&presentation.appearance.language);try{return fn.apply(null,args);}finally{language=previous;}}

    function escape(value,wiki){var text=String(value==null?'':value).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});return wiki?text.replace(/[\[\]{}|~_\r\n]/g,function(c){return '&#'+c.charCodeAt(0)+';';}):text;}
    function identity(state,presentation){return presentation.user||state&&state.config&&state.config.user||'';}
    function rootStyle(settings){var colors=appearance.topColors(settings);return 'border-top-color:'+appearance.colors(settings).accent+';background:'+colors.background+';color:'+colors.foreground+';';}
    function rootClasses(settings,cover,content){return 'dan-pu-profile-header '+appearance.classes(settings)+' dan-pu-top-'+appearance.topColors(settings).tone+(cover?' dan-pu-has-cover':'')+(cover&&!content?' dan-pu-cover-only':'');}
    function markup(state,presentation,wiki){
        presentation=presentation||{};var user=identity(state,presentation);if(!user)return '';
        var settings=appearance.normalize(presentation.appearance),options=Object.assign({},presentation,{user:user,appearance:settings});
        var content=activity.profileMarkup(state,options,wiki,'top'),cover=profileText.coverMarkup(options,wiki);if(!content&&!cover)return '';
        return '<div id="dan-pu-profile-header" class="'+rootClasses(settings,cover,content)+'" data-perfilwiki-user="'+escape(user,wiki)+'" data-perfilwiki-project="pt.wikipedia.org" data-perfilwiki-profile-top="true" data-perfilwiki-appearance="'+escape(JSON.stringify(settings),wiki)+'" lang="'+settings.language+'" style="'+rootStyle(settings)+'">'+cover+'<div class="dan-pu-top-profile-slot">'+content+'</div></div>';
    }
    function owned(node,user){return node&&node.getAttribute&&node.getAttribute('data-perfilwiki-user')===user;}
    function anchor(document,user){
        if(document.querySelectorAll){
            var group=Array.from(document.querySelectorAll('[data-perfilwiki-group="true"]')).find(function(node){return owned(node,user);});if(group)return group;
            var panel=Array.from(document.querySelectorAll('#dan-pu-ritmo, #dan-pu-estatisticas')).find(function(node){return owned(node,user);});if(panel)return panel;
        }
        return ['dan-pu-ritmo','dan-pu-estatisticas'].map(function(id){return document.getElementById(id);}).find(function(node){return owned(node,user);})||null;
    }
    function paint(document,state,presentation){
        presentation=presentation||{};var user=identity(state,presentation);
        if(!document||!user||!document.getElementById||!document.createElement)return false;
        var root=document.getElementById('dan-pu-profile-header');
        if(root&&(!owned(root,user)||root.getAttribute('data-perfilwiki-profile-top')!=='true'))return false;
        var saved=root&&activity.captureAccountCreated(root,user,presentation.now),options=Object.assign({},presentation,{user:user});
        if(saved&&!options.savedAccountCreated)options.savedAccountCreated=saved;
        var settings=appearance.normalize(options.appearance),content=activity.profileMarkup(state,options,false,'top'),coverData=profileText.coverInfo(options);
        if(!content&&!coverData){if(root&&root.parentNode){root.parentNode.removeChild(root);return true;}return false;}
        var before=anchor(document,user);
        if(!root){
            if(!before||!before.parentNode)return false;
            root=document.createElement('div');root.id='dan-pu-profile-header';root.setAttribute('data-perfilwiki-user',user);root.setAttribute('data-perfilwiki-project','pt.wikipedia.org');root.setAttribute('data-perfilwiki-profile-top','true');
            var slot=document.createElement('div');slot.className='dan-pu-top-profile-slot';root.appendChild(slot);before.parentNode.insertBefore(root,before);
        }
        root.setAttribute('lang',settings.language);root.className=rootClasses(settings,coverData,content);root.setAttribute('data-perfilwiki-appearance',JSON.stringify(settings));root.style.borderTopColor=appearance.colors(settings).accent;
        var topColors=appearance.topColors(settings);root.style.background=topColors.background;root.style.color=topColors.foreground;
        var cover=root.querySelector('.dan-pu-profile-cover'),image=cover&&cover.querySelector('.dan-pu-profile-cover-image');
        if(!coverData){if(cover&&cover.parentNode)cover.parentNode.removeChild(cover);}
        else if(coverData.native){
            // Keep the server-rendered dated transclusion and its image node intact.
            if(!cover||cover.getAttribute('data-perfilwiki-cover-source')!=='wiki-daily'){
                if(cover&&cover.parentNode)cover.parentNode.removeChild(cover);
                cover=document.createElement('div');cover.className='dan-pu-profile-cover';cover.setAttribute('data-perfilwiki-cover','');cover.setAttribute('data-perfilwiki-cover-source','wiki-daily');
                var nativeBody=document.createElement('div');nativeBody.className='dan-pu-profile-cover-native-body';
                var nativePending=document.createElement('div');nativePending.className='dan-pu-profile-cover-pending';nativePending.textContent=tr("Imagem do dia da Wikipédia em português");nativeBody.appendChild(nativePending);cover.appendChild(nativeBody);
                var nativeCaption=document.createElement('div');nativeCaption.className='dan-pu-profile-cover-caption';nativeCaption.textContent=tr("Atualize o trecho do perfil para carregar a capa pelo calendário da Wikipédia.");cover.appendChild(nativeCaption);
                root.insertBefore(cover,root.firstChild||root.childNodes&&root.childNodes[0]||null);
            }
        }
        else{
            var proof=coverData.proof?JSON.stringify(coverData.proof):'',source=coverData.daily?'daily':'manual';
            if(!cover||cover.getAttribute('data-perfilwiki-cover')!==coverData.filename||cover.getAttribute('data-perfilwiki-cover-source')!==source||(cover.getAttribute('data-perfilwiki-daily-cover')||'')!==proof||coverData.src&&(!image||image.getAttribute('src')!==coverData.src)){
                if(cover&&cover.parentNode)cover.parentNode.removeChild(cover);
                cover=document.createElement('div');cover.className='dan-pu-profile-cover';cover.setAttribute('data-perfilwiki-cover',coverData.filename);cover.setAttribute('data-perfilwiki-cover-source',source);
                if(proof)cover.setAttribute('data-perfilwiki-daily-cover',proof);
                if(coverData.src){
                    var link=coverData.href?document.createElement('a'):null;if(link){link.className='dan-pu-profile-cover-image-link';link.setAttribute('href',coverData.href);}
                    image=document.createElement('img');image.className='dan-pu-profile-cover-image';
                    [['width','1200'],['height','300'],['crossorigin','anonymous'],['referrerpolicy','no-referrer'],['loading','lazy'],['decoding','async'],['src',coverData.src]].forEach(function(pair){image.setAttribute(pair[0],pair[1]);});
                    if(link){link.appendChild(image);cover.appendChild(link);}else cover.appendChild(image);
                    var fallback=document.createElement('span');fallback.className='dan-pu-profile-cover-placeholder';fallback.hidden=true;fallback.textContent=tr("Imagem de capa indisponível");cover.appendChild(fallback);
                }else{image=null;var pending=document.createElement('div');pending.className='dan-pu-profile-cover-pending';pending.textContent=tr("Imagem do dia do Commons");cover.appendChild(pending);}
                if(coverData.daily){var caption=document.createElement('div');caption.className='dan-pu-profile-cover-caption';var captionText=document.createElement('span');captionText.textContent=coverData.caption+(coverData.href?' · ':'');caption.appendChild(captionText);if(coverData.href){var credits=document.createElement('a');credits.setAttribute('href',coverData.href);credits.textContent=tr("Ver arquivo e créditos");caption.appendChild(credits);}cover.appendChild(caption);}
                root.insertBefore(cover,root.firstChild||root.childNodes&&root.childNodes[0]||null);
            }
            if(image)image.setAttribute('alt',coverData.alt);
        }
        activity.paintProfile(document,state,options,'top');clock.update(document,presentation.now,user,options.timeZone||state&&state.config&&state.config.timeZone,settings.language);
        return true;
    }
    return Object.freeze({html:function(state,presentation){return inLanguage(markup,presentation,[state,presentation,false]);},wikitext:function(state,presentation){return inLanguage(markup,presentation,[state,presentation,true]);},paint:function(){return inLanguage(paint,arguments[2],arguments);},clockText:clock.text,updateClocks:clock.update,rootStyle:rootStyle,coverInfo:profileText.coverInfo,coverMarkup:profileText.coverMarkup});
}));

;

/* Reversible local JSON cache dictionary. No network, DOM, or wiki writes. */
(function (root, factory) {
    'use strict';
    var api = factory();
    if (typeof module === 'object' && module.exports) { module.exports = api; }
    if (root) { root.PerfilWikiCache = api; }
}(typeof window !== 'undefined' ? window : null, function () {
    'use strict';
    var FORMAT = 'dan-pu-cache-dictionary-v1';
    var PACKED_LIMIT = 4000000;
    var EXPANDED_LIMIT = 12000000;
    var DICTIONARY_LIMIT = 100000;
    var BLOCK_LIMIT = 4096;
    var SHORT_INDEX_LIMIT = 0xd700;
    var STRING_TOKEN = /"(?:[^"\\]|\\.)*"/g;
    function fail() { throw new Error('Invalid or oversized local cache dictionary.'); }
    function repeatedArrays(payload) {
        var starts = [], counts = new Map();
        for (var index = 0; index < payload.length; index += 1) {
            if (payload[index] === '[' || payload[index] === '{') {
                starts.push({ at: index, close: payload[index] === '[' ? ']' : '}' });
            } else if (payload[index] === ']' || payload[index] === '}') {
                var opening = starts.pop();
                if (!opening || opening.close !== payload[index]) { fail(); }
                var start = opening.at, length = index - start + 1;
                if (opening.close === ']' && length >= 2048 || opening.close === '}' && length >= 24 && length <= 512) {
                    var value = payload.slice(start, index + 1);
                    counts.set(value, (counts.get(value) || 0) + 1);
                }
            }
        }
        if (starts.length) { fail(); }
        var candidates = Array.from(counts.keys()).filter(function (value) { return value[0] === '[' && counts.get(value) > 1; }).sort(function (a, b) { return b.length - a.length; });
        var arrays = [];
        candidates.forEach(function (value) {
            if (arrays.length >= 128) { return; }
            var pieces = payload.split(value);
            if (pieces.length < 3) { return; }
            payload = pieces.join('$' + arrays.length.toString(36) + ';');
            arrays.push(value);
        });
        // Replace small repeated objects in one pass. Array blocks remain
        // nonrecursive, and their large contents are never rescanned per object.
        var objectCounts = new Map(), occurrences = [], stack = [];
        for (var at = 0; at < payload.length; at += 1) {
            var character = payload[at];
            if (character === '[' || character === '{') { stack.push({ at: at, close: character === '[' ? ']' : '}' }); }
            else if (character === ']' || character === '}') {
                var open = stack.pop();
                if (!open || open.close !== character) { fail(); }
                var size = at - open.at + 1;
                if (character === '}' && size >= 24 && size <= 512) {
                    var object = payload.slice(open.at, at + 1);
                    if (object.indexOf('$') < 0) {
                        objectCounts.set(object, (objectCounts.get(object) || 0) + 1);
                        occurrences.push({ start: open.at, end: at + 1, value: object });
                    }
                }
            }
        }
        if (stack.length) { fail(); }
        occurrences.sort(function (a, b) { return a.start - b.start || b.end - a.end; });
        var pieces = [], cursor = 0, objectIndexes = new Map();
        occurrences.forEach(function (occurrence) {
            if (occurrence.start < cursor || objectCounts.get(occurrence.value) < 2) { return; }
            var index = objectIndexes.get(occurrence.value);
            if (index === undefined) {
                if (arrays.length >= BLOCK_LIMIT) { return; }
                index = arrays.length; arrays.push(occurrence.value); objectIndexes.set(occurrence.value, index);
            }
            pieces.push(payload.slice(cursor, occurrence.start), '$' + index.toString(36) + ';'); cursor = occurrence.end;
        });
        pieces.push(payload.slice(cursor)); payload = pieces.join('');
        return { payload: payload, arrays: arrays };
    }
    function packJson(raw) {
        if (typeof raw !== 'string' || raw.length > EXPANDED_LIMIT) { fail(); }
        if (raw.length <= 100000) { return raw; }
        JSON.parse(raw);
        var dictionary = [], indexes = new Map();
        var payload = raw.replace(STRING_TOKEN, function (token) {
            var index = indexes.get(token);
            if (index === undefined) {
                index = dictionary.length;
                if (index >= DICTIONARY_LIMIT) { fail(); }
                dictionary.push(token); indexes.set(token, index);
            }
            return index < SHORT_INDEX_LIMIT ? '@' + String.fromCharCode(0x100 + index) : '@!' + index.toString(36) + ';';
        });
        var repeated = repeatedArrays(payload);
        var packed = JSON.stringify({ format: FORMAT, encoding: 'unicode-index', dictionary: dictionary,
            arrays: repeated.arrays, payload: repeated.payload });
        if (packed.length > PACKED_LIMIT) { fail(); }
        return packed.length < raw.length ? packed : raw;
    }
    function unpack(raw, parsedValue) {
        if (typeof raw !== 'string' || raw.length > PACKED_LIMIT) { fail(); }
        var envelope = JSON.parse(raw);
        if (!envelope || envelope.format !== FORMAT) { return parsedValue ? envelope : raw; }
        if (!Array.isArray(envelope.dictionary) || envelope.dictionary.length > DICTIONARY_LIMIT || typeof envelope.payload !== 'string') { fail(); }
        envelope.dictionary.forEach(function (token) {
            if (typeof token !== 'string' || token[0] !== '"' || token[token.length - 1] !== '"' || typeof JSON.parse(token) !== 'string') { fail(); }
        });
        if (envelope.encoding !== 'unicode-index' && envelope.encoding !== undefined) { fail(); }
        var payload = envelope.payload;
        if (envelope.arrays !== undefined) {
            if (!Array.isArray(envelope.arrays) || envelope.arrays.length > BLOCK_LIMIT) { fail(); }
            envelope.arrays.forEach(function (array) {
                if (typeof array !== 'string' || !((array[0] === '[' && array[array.length - 1] === ']') ||
                    (array[0] === '{' && array[array.length - 1] === '}')) || array.indexOf('$') >= 0 || array.length > EXPANDED_LIMIT) { fail(); }
            });
            var arrayExpandedLength = payload.length;
            payload = payload.replace(/\$([0-9a-z]+);/g, function (token, digits) {
                var index = parseInt(digits, 36);
                if (!Number.isSafeInteger(index) || index < 0 || index >= envelope.arrays.length || index.toString(36) !== digits) { fail(); }
                var value = envelope.arrays[index];
                arrayExpandedLength += value.length - token.length;
                if (arrayExpandedLength > EXPANDED_LIMIT) { fail(); }
                return value;
            });
        }
        if (payload.length > EXPANDED_LIMIT) { fail(); }
        var expandedLength = payload.length;
        function restore(token, index) {
            if (!Number.isSafeInteger(index) || index < 0 || index >= envelope.dictionary.length) { fail(); }
            var value = envelope.dictionary[index];
            expandedLength += value.length - token.length;
            if (expandedLength > EXPANDED_LIMIT) { fail(); }
            return value;
        }
        var expanded = envelope.encoding === 'unicode-index' ?
            payload.replace(/@(?:([\u0100-\ud7ff])|!([0-9a-z]+);)/g, function (token, character, digits) {
                var index = character ? character.charCodeAt(0) - 0x100 : parseInt(digits, 36);
                if (digits && (index < SHORT_INDEX_LIMIT || index.toString(36) !== digits)) { fail(); }
                return restore(token, index);
            }) : payload.replace(/@([0-9a-z]+);/g, function (token, digits) {
                var index = parseInt(digits, 36);
                if (index.toString(36) !== digits) { fail(); }
                return restore(token, index);
            });
        if (expanded.length > EXPANDED_LIMIT) { fail(); }
        var value = JSON.parse(expanded);
        return parsedValue ? value : expanded;
    }
    function unpackJson(raw) { return unpack(raw, false); }
    function parseJson(raw) { return unpack(raw, true); }
    return Object.freeze({ packJson: packJson, unpackJson: unpackJson, parseJson: parseJson, format: FORMAT,
        packedLimit: PACKED_LIMIT, expandedLimit: EXPANDED_LIMIT });
}));

;

/* PerfilWiki. Size-bounded IndexedDB fallback for packed metric caches.
 * No requests, DOM, account lookup or wiki writes. CC BY-SA 4.0. */
(function (root, factory) {
    'use strict';
    var api = factory(root);
    if (typeof module === 'object' && module.exports) { module.exports = api; }
    else if (root) { root.PerfilWikiLargeCache = api; }
}(typeof window !== 'undefined' ? window : typeof globalThis === 'object' ? globalThis : this, function (host) {
    'use strict';
    var DATABASE = 'perfilwiki-large-cache-v1', STORE = 'snapshots';
    var PACKED_LIMIT = 4000000, KEY_LIMIT = 4096, TIMEOUT = 1500;
    function now() { return host && host.Date && typeof host.Date.now === 'function' ? host.Date.now() : Date.now(); }
    function validKey(key) {
        return typeof key === 'string' && key.length <= KEY_LIMIT && /^perfilwiki-v1-.+-.+-cache$/.test(key) && !/[\x00-\x20\x7f]/.test(key);
    }
    function validPacked(packed) { return typeof packed === 'string' && packed.length > 0 && packed.length <= PACKED_LIMIT; }
    function timestamp(value) {
        if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value)) { return null; }
        var date = new Date(value), instant = date.getTime();
        return Number.isFinite(instant) && date.toISOString().replace('.000Z', 'Z') === value.replace('.000Z', 'Z') && instant <= now() ? instant : null;
    }
    function validRecord(record, key) {
        return !!record && typeof record === 'object' && !Array.isArray(record) &&
            Object.keys(record).sort().join(',') === 'capturedAt,key,packed,schema' && record.schema === 1 &&
            record.key === key && validKey(record.key) && validPacked(record.packed) && timestamp(record.capturedAt) !== null;
    }
    function operation(key, mode, next) {
        return new Promise(function (resolve) {
            var settled = false, database = null, transaction = null, completed = false, timer = null;
            var fallback = mode === 'readonly' ? null : false;
            function finish(value) {
                if (settled) { return; }
                settled = true;
                if (timer !== null) { host.clearTimeout(timer); }
                if (transaction && !completed) { try { transaction.abort(); } catch (_) {} }
                if (database) { try { database.close(); } catch (_) {} }
                resolve(value);
            }
            function failed(event) { if (event && event.preventDefault) { event.preventDefault(); } finish(fallback); }
            try {
                if (!validKey(key) || !host || !host.indexedDB || typeof host.indexedDB.open !== 'function' ||
                    typeof host.setTimeout !== 'function' || typeof host.clearTimeout !== 'function') { finish(fallback); return; }
                timer = host.setTimeout(function () { finish(fallback); }, TIMEOUT);
                var request = host.indexedDB.open(DATABASE, 1);
                request.onblocked = failed;
                request.onerror = failed;
                request.onupgradeneeded = function () {
                    if (settled) {
                        try { request.transaction.abort(); } catch (_) {}
                        try { request.result.close(); } catch (_) {}
                        return;
                    }
                    try {
                        database = request.result;
                        if (!database.objectStoreNames.contains(STORE)) { database.createObjectStore(STORE, {keyPath:'key'}); }
                    } catch (_) { try { request.transaction.abort(); } catch (ignore) {} finish(fallback); }
                };
                request.onsuccess = function () {
                    database = request.result;
                    if (settled) { try { database.close(); } catch (_) {} return; }
                    database.onversionchange = function () { finish(fallback); };
                    try {
                        transaction = database.transaction(STORE, mode);
                        var result = fallback;
                        transaction.oncomplete = function () { completed = true; finish(result); };
                        transaction.onerror = failed;
                        transaction.onabort = failed;
                        var store = transaction.objectStore(STORE), read = store.get(key);
                        read.onerror = failed;
                        read.onsuccess = function () {
                            if (settled) { return; }
                            try { result = next(store, validRecord(read.result, key) ? read.result : null); }
                            catch (_) { finish(fallback); }
                        };
                    } catch (_) { finish(fallback); }
                };
            } catch (_) { finish(fallback); }
        });
    }
    function get(key) { return operation(key, 'readonly', function (_store, record) { return record ? record.packed : null; }); }
    function put(key, packed, capturedAt) {
        if (!validKey(key) || !validPacked(packed) || timestamp(capturedAt) === null) { return Promise.resolve(false); }
        // The comparison and write share one readwrite transaction, so another
        // tab cannot replace a newer completed snapshot with an older one.
        return operation(key, 'readwrite', function (store, previous) {
            if (previous && Date.parse(previous.capturedAt) > Date.parse(capturedAt)) { return false; }
            store.put({schema:1,key:key,packed:packed,capturedAt:capturedAt});
            return true;
        });
    }
    return Object.freeze({get:get,put:put,limits:Object.freeze({packedCharacters:PACKED_LIMIT,keyCharacters:KEY_LIMIT,timeoutMs:TIMEOUT})});
}));

;

/* PerfilWiki 1.0.0. Statistics cards, compatible with existing RitmoPU markup.
 * Daniel G Rego, CC BY-SA 4.0. No requests, timers, or wiki writes. */
(function (root, factory) {
    var api = factory(typeof module === 'object' && module.exports ? require('./Appearance.js') : root.PerfilWikiAppearance,
        typeof module === 'object' && module.exports ? require('./ActivityView.js') : root.PerfilWikiActivityView,
        typeof module === 'object' && module.exports ? require('./I18n.js') : root.PerfilWikiI18n);
    if (typeof module === 'object' && module.exports) { module.exports = api; }
    else { root.PerfilWikiCardsView = api; }
}(typeof window !== 'undefined' ? window : this, function (appearance, profileView, i18n) {
    'use strict';
    var language='pt-BR';
    function tr(source,params){return i18n.t(language,source,params);}
    function inLanguage(fn,presentation,args){var previous=language;language=i18n.normalizeLanguage(presentation&&presentation.language||presentation&&presentation.appearance&&presentation.appearance.language);try{return fn.apply(null,args);}finally{language=previous;}}

    var formatter = {format:function(value){return i18n.number(language,value,{});}};
    var decimalFormatter = {format:function(value){return i18n.number(language,value,{maximumFractionDigits:1});}};
    var averageFormatter = {format:function(value){return i18n.number(language,value,{minimumFractionDigits:1,maximumFractionDigits:1});}};
    var articleCache = new WeakMap();
    var namespaceCache = new WeakMap();
    var calendarCache = new WeakMap();
    var fields = [
        ['tenure', 'perfilwiki-anos', 'Na Wikipédia', '🌱', 'dan-pu-stat-tenure'],
        ['bestStreak', 'dan-pu-ritmo-melhor-sequencia', 'Melhor sequência', '🔥', ''],
        ['thanks', 'dan-pu-agradecimentos', 'Agradecimentos recebidos', '💛', ''],
        ['edits', 'dan-pu-edicoes', 'Contribuições', '✍️', 'dan-pu-stat-primary'],
        ['reverts', 'dan-pu-reversoes', 'Reversões', '🛡️', ''],
        ['edited', 'dan-pu-editados', 'Artigos diferentes editados', '🛠️', ''],
        ['articles', 'dan-pu-artigos', 'Artigos criados', '📚', ''],
        ['technicalCreated', 'dan-pu-criados-tecnicos', 'Predefinições, módulos e scripts criados', '🧩', ''],
        ['mostEditedArticle', 'dan-pu-artigo-mais-editado', 'Artigo mais editado', '', ''],
        ['bytesAdded', 'dan-pu-bytes-acrescentados', 'Bytes acrescentados', '', '', 'Saldo positivo por edição'],
        ['bytesRemoved', 'dan-pu-bytes-removidos', 'Bytes removidos', '', '', 'Saldo negativo por edição'],
        ['activeDays', 'dan-pu-dias-com-edicoes', 'Dias com edições', '', ''],
        ['articleEdits', 'dan-pu-edicoes-em-artigos', 'Edições em artigos', '', ''],
        ['talkEdits', 'dan-pu-edicoes-em-discussoes', 'Edições em discussões', '', ''],
        ['activeMonths', 'dan-pu-meses-com-edicoes', 'Meses com edições', '', ''],
        ['busiestDay', 'dan-pu-dia-com-mais-edicoes', 'Dia com mais edições', '', ''],
        ['edits30', 'dan-pu-edicoes-30-dias', 'Edições nos últimos 30 dias', '', ''],
        ['averagePerActiveDay', 'dan-pu-media-por-dia-ativo', 'Média por dia ativo', '', '', 'Edições por dia com atividade'],
        ['activeYears', 'dan-pu-anos-com-edicoes', 'Anos com edições', '', ''],
        ['busiestMonth', 'dan-pu-mes-com-mais-edicoes', 'Mês com mais edições', '', ''],
        ['thanksSent', 'dan-pu-agradecimentos-enviados', 'Agradecimentos enviados', '', '', 'Na Wikipédia em português'],
        ['averageBytesPerEdit', 'dan-pu-media-bytes-por-edicao', 'Média de bytes acrescentados por edição', '', '', 'Todas as edições públicas da conta na ptwiki'],
        ['largestAddition', 'dan-pu-maior-acrescimo', 'Maior acréscimo em uma edição', '', '', 'Saldo positivo por edição'],
        ['largestRemoval', 'dan-pu-maior-remocao', 'Maior remoção em uma edição', '', '', 'Saldo negativo por edição']
    ];
    function escape(value) { return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) { return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
    function escapeData(value) { return escape(value).replace(/[\[\]{}|]/g, function (character) { return '&#' + character.charCodeAt(0) + ';'; }); }
    function years(registration, now) {
        var start = new Date(registration), end = new Date(now);
        if (!registration || !Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime()) || start > end) { return null; }
        var value = end.getUTCFullYear() - start.getUTCFullYear();
        if (end.getUTCMonth() < start.getUTCMonth() || end.getUTCMonth() === start.getUTCMonth() && end.getUTCDate() < start.getUTCDate()) { value -= 1; }
        return Math.max(0, value);
    }
    function tenureRegistration(statistics, now) {
        var evidence = statistics && statistics.registrationCoverage;
        var metrics = statistics && statistics.metrics;
        var clock = new Date(now === undefined ? Date.now() : now).getTime();
        function timestamp(value) {
            if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value)) { return null; }
            var parsed = new Date(value);
            return Number.isFinite(parsed.getTime()) && parsed.toISOString().replace('.000Z', 'Z') === value.replace('.000Z', 'Z') ? parsed.getTime() : null;
        }
        var earliest = metrics && timestamp(metrics.earliestRegistration);
        var checked = evidence && timestamp(evidence.checkedAt);
        if (!statistics || !metrics || !evidence || evidence.version !== 1 || evidence.user !== statistics.user ||
            typeof evidence.complete !== 'boolean' || !Array.isArray(evidence.accounts) || evidence.accounts.length > 2000 ||
            !statistics.metricUpdatedAt || statistics.metricUpdatedAt.earliestRegistration !== evidence.checkedAt ||
            earliest === null || checked === null || !Number.isFinite(clock) || checked > clock) { return null; }
        var known = [], complete = true, valid = true;
        [evidence.globalRegistration].concat(Array.from(evidence.accounts, function (account) { return account && account.registration; })).forEach(function (value) {
            if (value === null) { complete = false; return; }
            var parsed = timestamp(value);
            if (parsed === null || parsed > checked) { valid = false; }
            else { known.push(parsed); }
        });
        // A local registration date does not establish when the linked account
        // first existed. Only the checked minimum from global evidence is used.
        return valid && known.length && complete === evidence.complete && Math.min.apply(null, known) === earliest ? metrics.earliestRegistration : null;
    }
    function mostEditedArticle(activity) {
        if (!activity || activity.complete !== true || !Array.isArray(activity.entries)) { return null; }
        var cached = articleCache.get(activity);
        if (cached && cached.entries === activity.entries && cached.length === activity.entries.length) { return cached.value; }
        var seen = new Set(), pages = new Map();
        activity.entries.forEach(function (entry) {
            if (!Array.isArray(entry) || !Number.isSafeInteger(entry[0]) || entry[0] <= 0 || seen.has(entry[0]) ||
                !Number.isSafeInteger(entry[1]) || entry[1] <= 0 || entry[2] !== 0 || typeof entry[3] !== 'string' || !entry[3] || entry[3].length > 1024) { return; }
            var time = Date.parse(entry[4]);
            if (!Number.isFinite(time)) { return; }
            seen.add(entry[0]);
            var page = pages.get(entry[1]);
            if (!page) { page = {pageid:entry[1], title:entry[3], edits:0, time:time, revision:entry[0]}; pages.set(entry[1], page); }
            page.edits += 1;
            if (time > page.time || time === page.time && entry[0] > page.revision) { page.title = entry[3]; page.time = time; page.revision = entry[0]; }
        });
        var winner = null;
        pages.forEach(function (page) {
            if (!winner || page.edits > winner.edits || page.edits === winner.edits &&
                (page.title.localeCompare(winner.title, 'pt') < 0 || page.title.localeCompare(winner.title, 'pt') === 0 && page.pageid < winner.pageid)) { winner = page; }
        });
        var value = Object.freeze(winner ? {pageid:winner.pageid, title:winner.title, edits:winner.edits} : {pageid:null, title:null, edits:0});
        articleCache.set(activity, {entries:activity.entries, length:activity.entries.length, value:value});
        return value;
    }
    function namespaceTotals(activity) {
        if (!activity || activity.complete !== true || !Array.isArray(activity.entries)) { return null; }
        var cached = namespaceCache.get(activity);
        if (cached && cached.entries === activity.entries && cached.length === activity.entries.length) { return cached.value; }
        var seen = new Set(), result = {articleEdits:0, talkEdits:0};
        activity.entries.forEach(function (entry) {
            if (!Array.isArray(entry) || !Number.isSafeInteger(entry[0]) || entry[0] <= 0 || seen.has(entry[0]) ||
                !Number.isSafeInteger(entry[1]) || entry[1] < 0 || !Number.isInteger(entry[2]) || entry[2] < 0 ||
                typeof entry[3] !== 'string' || entry[3].length > 1024 || typeof entry[4] !== 'string' ||
                !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/.test(entry[4])) { return; }
            var time = new Date(entry[4]);
            if (!Number.isFinite(time.getTime()) || time.toISOString().slice(0,10) !== entry[4].slice(0,10)) { return; }
            seen.add(entry[0]);
            if (entry[2] === 0) { result.articleEdits += 1; }
            if (entry[2] % 2 === 1) { result.talkEdits += 1; }
        });
        Object.freeze(result);
        namespaceCache.set(activity,{entries:activity.entries,length:activity.entries.length,value:result});
        return result;
    }
    function validDay(date) {
        if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) { return false; }
        var time = new Date(date + 'T00:00:00Z');
        return Number.isFinite(time.getTime()) && time.toISOString().slice(0,10) === date;
    }
    function calendarTotals(activity) {
        if (!activity || activity.complete !== true || !activity.summary || !activity.summary.counts ||
            typeof activity.summary.counts !== 'object' || Array.isArray(activity.summary.counts)) { return null; }
        var summary = activity.summary, cached = calendarCache.get(summary);
        if (cached && cached.counts === summary.counts) { return cached.value; }
        // The shared activity summary already deduplicates revisions, applies its
        // calendar exclusions and groups each edit in the configured time zone.
        var months = new Map(), years = new Set(), busiest = {date:null,edits:0}, valid = true;
        var totalEdits = 0, activeDays = 0;
        Object.keys(summary.counts).forEach(function (date) {
            var count = summary.counts[date];
            if (!validDay(date) || !Number.isSafeInteger(count) || count < 0) { valid = false; return; }
            if (!count) { return; }
            var month = date.slice(0,7), monthEdits = (months.get(month) || 0) + count;
            totalEdits += count;
            if (!Number.isSafeInteger(totalEdits) || !Number.isSafeInteger(monthEdits)) { valid = false; return; }
            activeDays += 1;
            months.set(month,monthEdits);
            years.add(date.slice(0,4));
            if (count > busiest.edits || count === busiest.edits && date < busiest.date) { busiest = {date:date,edits:count}; }
        });
        var busiestMonth = {month:null,edits:0};
        months.forEach(function (edits,month) {
            if (edits > busiestMonth.edits || edits === busiestMonth.edits && month < busiestMonth.month) {
                busiestMonth = {month:month,edits:edits};
            }
        });
        var result = valid ? Object.freeze({activeMonths:months.size,busiestDay:Object.freeze(busiest),
            activeYears:years.size,averagePerActiveDay:activeDays ? totalEdits / activeDays : 0,
            busiestMonth:Object.freeze(busiestMonth)}) : null;
        calendarCache.set(summary,{counts:summary.counts,value:result});
        return result;
    }
    function values(statistics, activity, now, includeArticle, includeActiveDays, selected) {
        var result = Object.assign({}, statistics && statistics.metrics || {});
        result.tenureRegistration = tenureRegistration(statistics, now);
        result.tenure = years(result.tenureRegistration, now === undefined ? Date.now() : now);
        if (activity && activity.complete && activity.summary) { result.bestStreak = activity.summary.bestStreak; }
        if (includeArticle) { result.mostEditedArticle = mostEditedArticle(activity); }
        if (includeActiveDays) {
            result.activeDays = activity && activity.complete === true && activity.summary && Number.isSafeInteger(activity.summary.totalActiveDays) && activity.summary.totalActiveDays >= 0 ? activity.summary.totalActiveDays : null;
        }
        selected = selected || [];
        if (selected.indexOf('edits30') >= 0) {
            result.edits30 = activity && activity.complete === true && activity.summary && Number.isSafeInteger(activity.summary.edits30) && activity.summary.edits30 >= 0 ? activity.summary.edits30 : null;
        }
        if (selected.indexOf('articleEdits') >= 0 || selected.indexOf('talkEdits') >= 0) {
            var namespaces = namespaceTotals(activity);
            result.articleEdits = namespaces ? namespaces.articleEdits : null;
            result.talkEdits = namespaces ? namespaces.talkEdits : null;
        }
        if (selected.indexOf('activeMonths') >= 0 || selected.indexOf('busiestDay') >= 0 || selected.indexOf('activeYears') >= 0 ||
            selected.indexOf('averagePerActiveDay') >= 0 || selected.indexOf('busiestMonth') >= 0) {
            var calendar = calendarTotals(activity);
            result.activeMonths = calendar ? calendar.activeMonths : null;
            result.busiestDay = calendar ? calendar.busiestDay : null;
            result.activeYears = calendar ? calendar.activeYears : null;
            result.averagePerActiveDay = calendar ? calendar.averagePerActiveDay : null;
            result.busiestMonth = calendar ? calendar.busiestMonth : null;
        }
        return result;
    }
    function metricValue(value,key) {
        return key === 'averagePerActiveDay' || key === 'averageBytesPerEdit' ? typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= Number.MAX_SAFE_INTEGER : Number.isSafeInteger(value) && value >= 0;
    }
    function label(value, key) {
        if (!metricValue(value,key)) { return tr("Aguardando dados"); }
        if (key === 'averagePerActiveDay') { return averageFormatter.format(value); }
        if (['bytesAdded','bytesRemoved','averageBytesPerEdit','largestAddition','largestRemoval'].indexOf(key) >= 0) {
            var units = ['bytes', 'KiB', 'MiB', 'GiB', 'TiB'], amount = value, unit = 0;
            while (amount >= 1024 && unit < units.length - 1) { amount /= 1024; unit += 1; }
            return (key === 'averageBytesPerEdit' ? averageFormatter.format(amount) : unit ? decimalFormatter.format(amount) : formatter.format(amount)) + ' ' + (value === 1 ? 'byte' : units[unit]);
        }
        return formatter.format(value) + (key === 'bestStreak' || key === 'activeDays' ? value === 1 ? tr(" dia") : tr(" dias") : key === 'tenure' || key === 'activeYears' ? value === 1 ? tr(" ano") : tr(" anos") : key === 'activeMonths' ? value === 1 ? tr(" mês") : tr(" meses") : '');
    }
    function busiestValue(value) {
        return value && typeof value === 'object' && (value.date === null && value.edits === 0 ||
            validDay(value.date) && Number.isSafeInteger(value.edits) && value.edits > 0);
    }
    function busiestMarkup(value) {
        if (!busiestValue(value)) { return tr("Aguardando dados"); }
        if (!value.edits) { return tr("Nenhum dia"); }
        return i18n.date(language,value.date+'T00:00:00Z',{day:'2-digit',month:'2-digit',year:'numeric'}) + '<span style="display:block;font-size:13px;font-weight:400;margin-top:5px;">' + formatter.format(value.edits) + (value.edits === 1 ? tr(" edição") : tr(" edições")) + '</span>';
    }
    function paintBusiest(document,element,value) {
        if (!busiestValue(value)) { return; }
        var signature = JSON.stringify(value);
        if (element.getAttribute('data-perfilwiki-busiest-day') === signature) { return; }
        element.textContent = value.edits ? i18n.date(language,value.date+'T00:00:00Z',{day:'2-digit',month:'2-digit',year:'numeric'}) : tr("Nenhum dia");
        element.setAttribute('data-perfilwiki-busiest-day',signature);
        if (!value.edits) { return; }
        var count = document.createElement('span');
        count.style.display = 'block'; count.style.fontSize = '13px'; count.style.fontWeight = '400'; count.style.marginTop = '5px';
        count.textContent = formatter.format(value.edits) + (value.edits === 1 ? tr(" edição") : tr(" edições"));
        element.appendChild(count);
    }
    function busiestMonthValue(value) {
        return value && typeof value === 'object' && (value.month === null && value.edits === 0 ||
            typeof value.month === 'string' && /^\d{4}-(?:0[1-9]|1[0-2])$/.test(value.month) && Number.isSafeInteger(value.edits) && value.edits > 0);
    }
    function monthLabel(month) {
        if(language!=='pt-BR'&&language!=='pt-PT')return i18n.date(language,month+'-01T00:00:00Z',{month:'long',year:'numeric'});
        return ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'][Number(month.slice(5)) - 1] + tr(" de ") + Number(month.slice(0,4));
    }
    function busiestMonthMarkup(value) {
        if (!busiestMonthValue(value)) { return tr("Aguardando dados"); }
        if (!value.edits) { return tr("Nenhum mês"); }
        return monthLabel(value.month) + '<span style="display:block;font-size:13px;font-weight:400;margin-top:5px;">' + formatter.format(value.edits) + (value.edits === 1 ? tr(" edição") : tr(" edições")) + '</span>';
    }
    function paintBusiestMonth(document,element,value) {
        if (!busiestMonthValue(value)) { return; }
        var signature = JSON.stringify(value);
        if (element.getAttribute('data-perfilwiki-busiest-month') === signature) { return; }
        element.textContent = value.edits ? monthLabel(value.month) : tr("Nenhum mês");
        element.setAttribute('data-perfilwiki-busiest-month',signature);
        if (!value.edits) { return; }
        var count = document.createElement('span');
        count.style.display = 'block'; count.style.fontSize = '13px'; count.style.fontWeight = '400'; count.style.marginTop = '5px';
        count.textContent = formatter.format(value.edits) + (value.edits === 1 ? tr(" edição") : tr(" edições"));
        element.appendChild(count);
    }
    function articleValue(value) {
        return value && typeof value === 'object' && (value.edits === 0 && value.pageid === null && value.title === null ||
            Number.isSafeInteger(value.edits) && value.edits > 0 && Number.isSafeInteger(value.pageid) && value.pageid > 0 && typeof value.title === 'string' && value.title.length > 0 && value.title.length <= 1024);
    }
    function articleMarkup(value, wiki, colors) {
        if (!articleValue(value)) { return tr("Aguardando dados"); }
        if (!value.edits) { return tr("Nenhum artigo"); }
        var title = value.title.replace(/[\[\]{}|<>\r\n]/g, function (character) { return '&#' + character.charCodeAt(0) + ';'; });
        var link = wiki ? '[[' + title + '|<span style="color:' + colors.ink + ';">' + title + '</span>]]' : '<a href="https://pt.wikipedia.org/wiki/' + escape(encodeURIComponent(value.title.replace(/ /g, '_'))) + '" style="color:' + colors.ink + ';text-decoration:none;">' + escape(value.title) + '</a>';
        return link + '<span style="display:block;font-size:13px;font-weight:400;margin-top:5px;">' + formatter.format(value.edits) + (value.edits === 1 ? tr(" edição") : tr(" edições")) + '</span>';
    }
    function paintArticle(document, element, value, colors) {
        if (!articleValue(value)) { return; }
        var signature = JSON.stringify(value);
        if (element.getAttribute('data-perfilwiki-most-edited') === signature) { return; }
        element.textContent = '';
        element.setAttribute('data-perfilwiki-most-edited', signature);
        if (!value.edits) { element.textContent = tr("Nenhum artigo"); return; }
        var link = document.createElement('a'), count = document.createElement('span');
        link.href = 'https://pt.wikipedia.org/wiki/' + encodeURIComponent(value.title.replace(/ /g, '_'));
        link.style.color = colors.ink; link.style.textDecoration = 'none'; link.textContent = value.title;
        count.style.display = 'block'; count.style.fontSize = '13px'; count.style.fontWeight = '400'; count.style.marginTop = '5px';
        count.textContent = formatter.format(value.edits) + (value.edits === 1 ? tr(" edição") : tr(" edições"));
        element.appendChild(link); element.appendChild(count);
    }
    function cardColors(settings, key, colors) {
        return settings.highlightedMetrics.indexOf(key) < 0 ? colors : {ink:appearance.highlightColors(settings).foreground};
    }
    function footer(options, colors) {
        var title = options.documentationPage || 'Usuário:Daniel G Rego/PerfilWiki';
        var label = tr("Veja como adicionar à sua página de usuário.");
        var safeTitle = String(title).replace(/[\[\]{}|<>\r\n]/g, function (character) { return '&#' + character.charCodeAt(0) + ';'; });
        var link = options.wiki ? '[[' + safeTitle + '|<span style="color:' + colors.ink + ';">' + label + '</span>]]' :
            '<a href="https://pt.wikipedia.org/wiki/' + escape(encodeURIComponent(String(title).replace(/ /g,'_'))) + '" style="color:' + colors.ink + ';">' + label + '</a>';
        return ("<div id=\"dan-pu-ritmo-install\" style=\"grid-column:1/-1;margin-top:4px;padding-top:14px;border-top:1px solid #eaecf0;color:#54595d;font-size:12px;text-align:left;\">"+tr("Gostou deste painel?")+" ") + link + '</div>';
    }
    function render(statistics, activity, options) {
        options = options || {};
        var user = options.user || statistics && statistics.user || activity && activity.identity && activity.identity.user || '';
        if (statistics && statistics.user !== user || activity && activity.identity && activity.identity.user !== user) { throw new Error('Os contadores pertencem a outro usuário.'); }
        var settings = appearance.normalize(options.appearance), colors = appearance.colors(settings);
        if (!settings.showCards) { return ''; }
        var data = values(statistics, activity, options.now, settings.metrics.indexOf('mostEditedArticle') >= 0, settings.metrics.indexOf('activeDays') >= 0,settings.metrics);
        var profile = profileView.profileMarkup({config:{user:user},statistics:statistics,activity:activity},Object.assign({},options,{user:user,appearance:settings}),options.wiki,'cards');
        var html = '<div id="dan-pu-estatisticas" class="dan-pu-stats ' + appearance.classes(settings) + '" data-perfilwiki-user="' + escape(user) + '" data-perfilwiki-rendered="ready" data-perfilwiki-documentation="' + escapeData(options.documentationPage || 'Usuário:Daniel G Rego/PerfilWiki') + '" data-perfilwiki-appearance="' + escape(JSON.stringify(settings)) + '" lang="'+settings.language+'" style="text-align:' + settings.alignment + ';' + (profile?'grid-auto-rows:auto;':'') + '">';
        if (profile) { html += '<div class="dan-pu-cards-profile" style="grid-column:1/-1;margin-bottom:8px;padding-bottom:12px;' + (settings.profileDetailsLayout==='inline'?'':'border-bottom:1px solid #eaecf0;') + '">' + profile + '</div>'; }
        settings.metrics.forEach(function (key) {
            var field = fields.find(function (item) { return item[0] === key; });
            var highlighted = settings.highlightedMetrics.indexOf(key) >= 0;
            var palette = cardColors(settings,key,colors);
            var text = field[0] === 'mostEditedArticle' ? articleMarkup(data.mostEditedArticle, options.wiki, palette) : field[0] === 'busiestDay' ? busiestMarkup(data.busiestDay) : field[0] === 'busiestMonth' ? busiestMonthMarkup(data.busiestMonth) : label(data[field[0]], field[0]);
            if (options.wiki && (language==='pt-BR'||language==='pt-PT') && field[0] === 'tenure' && metricValue(data.tenure, 'tenure')) {
                var date = new Date(data.tenureRegistration);
                text = '{{Tempo decorrido|' + date.getUTCDate() + '|' + (date.getUTCMonth() + 1) + '|' + date.getUTCFullYear() + '|prec=ano}}';
            }
            var cardStyle = ' style="' + (settings.density === 'compact' ? 'padding:12px 14px;' : settings.density === 'roomy' ? 'padding:24px 22px;' : '') + 'background:' + (highlighted ? settings.highlightColor : '#ffffff') + ';border-color:#eaecf0;"';
            var valueStyle = (settings.density === 'compact' ? 'font-size:24px;' : settings.density === 'roomy' ? 'font-size:32px;' : '') + (highlighted || field[0] === 'edits' ? 'color:' + palette.ink + ';' : '');
            if (field[0] === 'mostEditedArticle') { valueStyle += 'font-size:18px;line-height:1.35;'; }
            if (field[0] === 'busiestDay') { valueStyle += 'font-size:22px;line-height:1.35;'; }
            if (field[0] === 'busiestMonth') { valueStyle += 'font-size:18px;line-height:1.35;'; }
            var valueAttributes = field[0] === 'mostEditedArticle' && articleValue(data.mostEditedArticle) ? ' data-perfilwiki-most-edited="' + escapeData(JSON.stringify(data.mostEditedArticle)) + '"' : '';
            if (field[0] === 'busiestDay' && busiestValue(data.busiestDay)) { valueAttributes += ' data-perfilwiki-busiest-day="' + escapeData(JSON.stringify(data.busiestDay)) + '"'; }
            if (field[0] === 'busiestMonth' && busiestMonthValue(data.busiestMonth)) { valueAttributes += ' data-perfilwiki-busiest-month="' + escapeData(JSON.stringify(data.busiestMonth)) + '"'; }
            if (['bytesAdded','bytesRemoved','averageBytesPerEdit','largestAddition','largestRemoval'].indexOf(field[0]) >= 0 && metricValue(data[field[0]],field[0])) {
                valueAttributes += ' title="' + (field[0] === 'averageBytesPerEdit' ? averageFormatter : formatter).format(data[field[0]]) + ' bytes"';
            }
            html += '<div class="dan-pu-stat-card' + (field[4] ? ' ' + field[4] : '') + '"' + cardStyle + '><div class="dan-pu-stat-icon" aria-hidden="true">' + field[3] + '</div><div class="dan-pu-stat-value"' + (valueStyle ? ' style="' + valueStyle + '"' : '') + '><span id="' + field[1] + '"' + valueAttributes + '>' + text + '</span></div><div class="dan-pu-stat-label"' + (highlighted ? ' style="color:' + palette.ink + ';"' : '') + '>' + tr(field[2]) + '</div>' + (field[5] ? '<div style="margin-top:5px;font-size:11px;color:' + (highlighted ? palette.ink : '#72777d') + ';line-height:1.4;">' + tr(field[5]) + '</div>' : '') + '</div>';
        });
        return html + (appearance.footerOwner(settings) === 'cards' ? footer(options,colors) : '') + '</div>';
    }
    function paint(document, statistics, activity, now, options, presentation) {
        presentation = presentation || {};
        var settings = options ? appearance.normalize(options) : null;
        var selected = settings ? settings.metrics : fields.filter(function (field) { return !!document.getElementById(field[1]); }).map(function (field) { return field[0]; });
        var data = values(statistics, activity, now, selected.indexOf('mostEditedArticle') >= 0, selected.indexOf('activeDays') >= 0,selected);
        var colors = appearance.colors(settings || undefined);
        var root = document.getElementById('dan-pu-estatisticas');
        var profileUser = presentation.user || statistics && statistics.user || activity && activity.identity && activity.identity.user || root && root.getAttribute('data-perfilwiki-user') || '';
        var savedAccountCreated = profileView.captureAccountCreated(root,profileUser,now);
        if (root && options) {
            var signature = JSON.stringify(settings);
            root.style.display = settings.showCards ? '' : 'none';
            if (!settings.showCards) { return; }
            if (root.getAttribute('data-perfilwiki-appearance') !== signature || root.getAttribute('data-perfilwiki-rendered') !== 'ready' ||
                root.getAttribute('data-perfilwiki-documentation') !== (presentation.documentationPage || 'Usuário:Daniel G Rego/PerfilWiki')) {
                var user = presentation.user || statistics && statistics.user || activity && activity.identity && activity.identity.user || root.getAttribute('data-perfilwiki-user') || '';
                var previous = {};
                if (root.getAttribute('data-perfilwiki-user') === user) {
                    fields.forEach(function (field) {
                        var element = document.getElementById(field[1]);
                        if (!element) { return; }
                        previous[field[0]] = element.textContent;
                        if (field[0] === 'mostEditedArticle' && !articleValue(data.mostEditedArticle)) {
                            try { var saved = JSON.parse(element.getAttribute('data-perfilwiki-most-edited')); if (articleValue(saved)) { data.mostEditedArticle = saved; } } catch (_) {}
                        }
                        if (field[0] === 'busiestDay' && !busiestValue(data.busiestDay)) {
                            try { var savedDay = JSON.parse(element.getAttribute('data-perfilwiki-busiest-day')); if (busiestValue(savedDay)) { data.busiestDay = savedDay; } } catch (_) {}
                        }
                        if (field[0] === 'busiestMonth' && !busiestMonthValue(data.busiestMonth)) {
                            try { var savedMonth = JSON.parse(element.getAttribute('data-perfilwiki-busiest-month')); if (busiestMonthValue(savedMonth)) { data.busiestMonth = savedMonth; } } catch (_) {}
                        }
                    });
                }
                root.outerHTML = render(statistics, activity, Object.assign({},presentation,{user:user,now:now,appearance:settings,savedAccountCreated:savedAccountCreated}));
                fields.forEach(function (field) {
                    var element = document.getElementById(field[1]);
                    if (element && field[0] !== 'tenure' && field[0] !== 'mostEditedArticle' && field[0] !== 'busiestDay' && field[0] !== 'busiestMonth' && !metricValue(data[field[0]],field[0]) && previous[field[0]]) { element.textContent = previous[field[0]]; }
                });
            }
        }
        fields.forEach(function (field) {
            var element = document.getElementById(field[1]);
            if (element && field[0] === 'tenure' && !metricValue(data.tenure, 'tenure')) { element.textContent = tr("Aguardando dados"); }
            else if (element && field[0] === 'mostEditedArticle') { paintArticle(document, element, data.mostEditedArticle, settings ? cardColors(settings,field[0],colors) : colors); }
            else if (element && field[0] === 'busiestDay') { paintBusiest(document,element,data.busiestDay); }
            else if (element && field[0] === 'busiestMonth') { paintBusiestMonth(document,element,data.busiestMonth); }
            else if (element && metricValue(data[field[0]],field[0])) {
                element.textContent = label(data[field[0]], field[0]);
                if (['bytesAdded','bytesRemoved','averageBytesPerEdit','largestAddition','largestRemoval'].indexOf(field[0]) >= 0) {
                    element.setAttribute('title', (field[0] === 'averageBytesPerEdit' ? averageFormatter : formatter).format(data[field[0]]) + ' bytes');
                }
            }
        });
        if (root && settings) { profileView.paintProfile(document,{config:{user:profileUser},statistics:statistics,activity:activity},Object.assign({},presentation,{user:profileUser,now:now,appearance:settings,savedAccountCreated:savedAccountCreated}),'cards'); }
    }
    return Object.freeze({ html:function(s,a,options){return inLanguage(render,options,[s,a,options]);}, wikitext: function (s,a,options){return inLanguage(render,options,[s,a,Object.assign({},options,{wiki:true})]);}, paint:function(){return inLanguage(paint,arguments[4],arguments);}, years: years, mostEditedArticle:mostEditedArticle,
        namespaceTotals:namespaceTotals,calendarTotals:calendarTotals });
}));

;

(function (root) { root.PerfilWikiStyleText = ".dan-pu-stats {\n display: grid;\n grid-template-columns: repeat(auto-fit,minmax(min(100%,max(136px,calc((100% - 36px) / 4))),1fr));\n grid-auto-rows: 1fr;\n min-width: 0;\n gap: 12px;\n text-align: right;\n margin: 0.6em 0 2.1em;\n color: #202122;\n font-size: 14px;\n line-height: 1.5;\n}\n.dan-pu-integrated-cards-slot { min-width: 0; }\n.dan-pu-integrated-cards-slot > .dan-pu-stats {\n margin: 0 0 20px !important;\n padding: 0 !important;\n border: 0 !important;\n border-radius: 0 !important;\n background: transparent !important;\n}\n.dan-pu-stat-card {\n min-width: 0;\n box-sizing: border-box;\n border: 1px solid #d8dce3;\n border-radius: 10px;\n background: #fff;\n padding: 18px 16px;\n}\n.dan-pu-stat-icon { display: none; }\n.dan-pu-stat-value {\n color: #202122;\n font-size: 28px;\n font-weight: 700;\n line-height: 1.2;\n margin-bottom: 8px;\n font-variant-numeric: tabular-nums;\n overflow-wrap: anywhere;\n}\n.dan-pu-stat-label { color: #54595d; font-size: 13px; line-height: 1.4; }\n.dan-pu-stat-tenure { background: #faf7ef; border-color: #e5e1d7; }\n.dan-pu-stat-primary .dan-pu-stat-value { color: #36c; }\n@media (max-width: 600px) {\n .dan-pu-stat-card { padding: 16px 14px; }\n .dan-pu-stat-value { font-size: 26px; }\n}\n\n.dan-pu-readership .dan-pu-view-target { display: block; position: relative; top: -12px; height: 0; width: 0; overflow: hidden; }\n.dan-pu-period-tabs { display: flex; flex-wrap: wrap; gap: 8px; margin: 16px 0 20px; }\n.dan-pu-period-tabs a { display: inline-block; padding: 7px 14px; border: 1px solid #c8ccd1; border-radius: 6px; background: #fff; color: #54595d; font-size: 13px; text-decoration: none; }\n.dan-pu-period-tabs a:hover { border-color: #36c; color: #36c; text-decoration: none; }\n.dan-pu-period-tabs a:focus { outline: 2px solid #36c; outline-offset: 2px; }\n/* A saved snapshot keeps its selected period without JavaScript. */\n.dan-pu-period-tabs a.dan-pu-tab-30d,\n.dan-pu-period-tabs .dan-pu-tab-30d a { background: #eaecf0; border-color: #72777d; color: #202122; font-weight: 600; }\n.dan-pu-readership .dan-pu-period { display: none; }\n.dan-pu-readership .dan-pu-period-30d { display: block; }\n.dan-pu-initial-90d .dan-pu-period-30d { display: none; }\n.dan-pu-initial-90d .dan-pu-period-90d { display: block; }\n.dan-pu-initial-90d .dan-pu-period-tabs a.dan-pu-tab-30d,\n.dan-pu-initial-90d .dan-pu-period-tabs .dan-pu-tab-30d a { background: #fff; border-color: #c8ccd1; color: #54595d; font-weight: 400; }\n.dan-pu-initial-90d .dan-pu-period-tabs a.dan-pu-tab-90d,\n.dan-pu-initial-90d .dan-pu-period-tabs .dan-pu-tab-90d a { background: #eaecf0; border-color: #72777d; color: #202122; font-weight: 600; }\n.dan-pu-initial-12m .dan-pu-period-30d { display: none; }\n.dan-pu-initial-12m .dan-pu-period-12m { display: block; }\n.dan-pu-initial-12m .dan-pu-period-tabs a.dan-pu-tab-30d,\n.dan-pu-initial-12m .dan-pu-period-tabs .dan-pu-tab-30d a { background: #fff; border-color: #c8ccd1; color: #54595d; font-weight: 400; }\n.dan-pu-initial-12m .dan-pu-period-tabs a.dan-pu-tab-12m,\n.dan-pu-initial-12m .dan-pu-period-tabs .dan-pu-tab-12m a { background: #eaecf0; border-color: #72777d; color: #202122; font-weight: 600; }\n.dan-pu-initial-since .dan-pu-period-30d { display: none; }\n.dan-pu-initial-since .dan-pu-period-since { display: block; }\n.dan-pu-initial-since .dan-pu-period-tabs a.dan-pu-tab-30d,\n.dan-pu-initial-since .dan-pu-period-tabs .dan-pu-tab-30d a { background: #fff; border-color: #c8ccd1; color: #54595d; font-weight: 400; }\n.dan-pu-initial-since .dan-pu-period-tabs a.dan-pu-tab-since,\n.dan-pu-initial-since .dan-pu-period-tabs .dan-pu-tab-since a { background: #eaecf0; border-color: #72777d; color: #202122; font-weight: 600; }\n.dan-pu-initial-custom .dan-pu-period-30d { display: none; }\n.dan-pu-initial-custom .dan-pu-period-custom { display: block; }\n.dan-pu-initial-custom .dan-pu-period-tabs a.dan-pu-tab-30d,\n.dan-pu-initial-custom .dan-pu-period-tabs .dan-pu-tab-30d a { background: #fff; border-color: #c8ccd1; color: #54595d; font-weight: 400; }\n.dan-pu-initial-custom .dan-pu-period-tabs a.dan-pu-tab-custom,\n.dan-pu-initial-custom .dan-pu-period-tabs .dan-pu-tab-custom a { background: #eaecf0; border-color: #72777d; color: #202122; font-weight: 600; }\n.dan-pu-readership .dan-pu-view-target:target ~ .dan-pu-period { display: none; }\n.dan-pu-view-target:target ~ .dan-pu-period-tabs a { background: #fff; border-color: #c8ccd1; color: #54595d; font-weight: 400; }\n#dan-pu-view-30d:target ~ .dan-pu-period-30d { display: block; }\n#dan-pu-view-30d:target ~ .dan-pu-period-tabs a.dan-pu-tab-30d,\n#dan-pu-view-30d:target ~ .dan-pu-period-tabs .dan-pu-tab-30d a { background: #eaecf0; border-color: #72777d; color: #202122; font-weight: 600; }\n#dan-pu-view-90d:target ~ .dan-pu-period-90d { display: block; }\n#dan-pu-view-90d:target ~ .dan-pu-period-tabs a.dan-pu-tab-90d,\n#dan-pu-view-90d:target ~ .dan-pu-period-tabs .dan-pu-tab-90d a { background: #eaecf0; border-color: #72777d; color: #202122; font-weight: 600; }\n#dan-pu-view-12m:target ~ .dan-pu-period-12m { display: block; }\n#dan-pu-view-12m:target ~ .dan-pu-period-tabs a.dan-pu-tab-12m,\n#dan-pu-view-12m:target ~ .dan-pu-period-tabs .dan-pu-tab-12m a { background: #eaecf0; border-color: #72777d; color: #202122; font-weight: 600; }\n#dan-pu-view-since:target ~ .dan-pu-period-since { display: block; }\n#dan-pu-view-since:target ~ .dan-pu-period-tabs a.dan-pu-tab-since,\n#dan-pu-view-since:target ~ .dan-pu-period-tabs .dan-pu-tab-since a { background: #eaecf0; border-color: #72777d; color: #202122; font-weight: 600; }\n#dan-pu-view-custom:target ~ .dan-pu-period-custom { display: block; }\n#dan-pu-view-custom:target ~ .dan-pu-period-tabs a.dan-pu-tab-custom,\n#dan-pu-view-custom:target ~ .dan-pu-period-tabs .dan-pu-tab-custom a { background: #eaecf0; border-color: #72777d; color: #202122; font-weight: 600; }\n.dan-pu-native-more { margin-top: 13px; }\n.dan-pu-native-more .mw-collapsible-toggle { float: none; display: inline-block; margin: 0 0 10px; }\n@media print {\n .dan-pu-period-tabs { display: none; }\n .dan-pu-readership .dan-pu-period { display: block !important; margin-top: 25px; }\n}\n\n.dan-pu-view-row { display: flex; align-items: center; gap: 12px; border-bottom: 1px solid #eaecf0; padding: 12px 0; }\n.dan-pu-view-rank { width: 32px; color: #72777d; flex: none; font-size: 12px; }\n.dan-pu-view-title { min-width: 0; flex: 1; overflow-wrap: anywhere; }\n.dan-pu-view-views { text-align: right; white-space: nowrap; font-size: 13px; }\n.dan-pu-view-first { display: block; color: #72777d; font-size: 11px; margin-top: 3px; }\n\n\n.dan-pu-focus-layout {\n display: grid;\n grid-template-columns: minmax(210px,1fr) minmax(0,1.5fr);\n align-items: start;\n gap: 20px;\n margin: 1.2em 0 2.1em;\n font-size: 14px;\n line-height: 1.6;\n}\n.dan-pu-focus-aside {\n display: grid;\n gap: 14px;\n min-width: 0;\n}\n.dan-pu-focus-projects { min-width: 0; }\n.dan-pu-focus-projects ul { margin: 0; padding-left: 1.35em; }\n.dan-pu-focus-projects li { margin-bottom: 14px; }\n.dan-pu-focus-projects li:last-child { margin-bottom: 0; }\n@media (max-width: 600px) {\n .dan-pu-focus-layout { grid-template-columns: minmax(0,1fr); gap: 20px; }\n}\n\n/* Compact rows preserve real rank text and both destinations. Old rows remain supported. */\n.dan-pu-view-row[data-layout=\"compact\"] {\n display: grid;\n grid-template-columns: 32px minmax(0,1fr) max-content;\n column-gap: 12px;\n color: #72777d;\n font-size: 12px;\n}\n.dan-pu-view-row[data-layout=\"compact\"] > a:first-of-type,\n.dan-pu-view-row[data-layout=\"compact\"] > .dan-pu-view-title {\n grid-column: 2;\n min-width: 0;\n font-size: 14px;\n overflow-wrap: anywhere;\n}\n.dan-pu-view-row[data-layout=\"compact\"] > a:nth-of-type(2),\n.dan-pu-view-row[data-layout=\"compact\"] > .dan-pu-view-title + a,\n.dan-pu-view-row[data-layout=\"compact\"] > .dan-pu-view-views {\n grid-column: 3;\n text-align: right;\n white-space: nowrap;\n font-size: 13px;\n}\n\n/* Featured rows have explicit cells, so optional pictures never shift links. */\n.dan-pu-view-row[data-layout=\"featured\"] {\n box-sizing: border-box;\n min-height: 68px;\n padding: 10px 9px;\n border-bottom: 0;\n border-radius: 5px;\n}\n.dan-pu-view-row[data-layout=\"featured\"][data-shade=\"alternate\"] { background: #f8f9fa; }\n.dan-pu-view-row[data-layout=\"featured\"] .dan-pu-view-rank { width: auto; font-variant-numeric: tabular-nums; }\n.dan-pu-view-image {\n display: flex;\n align-items: center;\n justify-content: center;\n width: 48px;\n height: 48px;\n overflow: hidden;\n border-radius: 5px;\n background: #eaecf0;\n}\n.dan-pu-view-image img { display: block; width: 48px; height: 48px; object-fit: cover; }\n.dan-pu-thumb-placeholder { display: block; color: #72777d; font-size: 25px; line-height: 1; }\n.dan-pu-featured-title { min-width: 0; overflow-wrap: anywhere; font-size: 14px; }\n.dan-pu-featured-title > a { font-weight: 600; }\n.dan-pu-featured-views { text-align: right; font-size: 14px; font-weight: 600; font-variant-numeric: tabular-nums; }\n.dan-pu-featured-views > a { white-space: nowrap; }\n.dan-pu-view-pending { display: inline-block; color: #54595d; font-size: 12px; font-weight: 400; }\n.dan-pu-data-help { margin-top: 8px; color: #54595d; font-size: 12px; }\n.dan-pu-data-help summary { width: fit-content; color: #36c; cursor: pointer; }\n.dan-pu-data-help > div { max-width: 65em; padding: 9px 12px; border-left: 2px solid #c8ccd1; margin-top: 8px; }\n.dan-pu-data-help summary:focus,\n#dan-pu-ritmo a:focus,\n#dan-pu-ritmo button:focus { outline: 2px solid #36c; outline-offset: 3px; }\n@media (max-width: 600px) {\n .dan-pu-stats { clear: both; }\n #dan-pu-ritmo { padding: 14px !important; }\n #dan-pu-ritmo .dan-pu-readership { padding: 12px !important; }\n}\n@media (max-width: 520px) {\n #dan-pu-ritmo .dan-pu-view-row[data-layout=\"featured\"] {\n  grid-template-columns: 18px 40px minmax(0,1fr) !important;\n  gap: 3px 8px;\n  padding: 10px 6px;\n }\n .dan-pu-view-row[data-layout=\"featured\"] .dan-pu-view-rank { grid-column: 1; grid-row: 1 / span 2; }\n .dan-pu-view-row[data-layout=\"featured\"] .dan-pu-view-image { grid-column: 2; grid-row: 1 / span 2; width: 40px; height: 40px; }\n .dan-pu-view-row[data-layout=\"featured\"] .dan-pu-view-image img { width: 40px; height: 40px; }\n .dan-pu-featured-title { grid-column: 3; grid-row: 1; }\n .dan-pu-featured-views { grid-column: 3; grid-row: 2; text-align: left; font-size: 13px; }\n}\n@media print {\n .dan-pu-view-image { background: transparent; }\n .dan-pu-data-help > div { display: block; }\n}\n\n/* Finite appearance classes are accepted by TemplateStyles. Custom colors are\n   validated six-digit hex values in the generated inline styles. */\n.dan-pu-stats.dan-pu-align-left { text-align: left; }\n.dan-pu-stats.dan-pu-align-center { text-align: center; }\n.dan-pu-stats.dan-pu-align-right { text-align: right; }\n.dan-pu-stats.dan-pu-columns-2 { grid-template-columns: repeat(2,minmax(0,1fr)); }\n.dan-pu-stats.dan-pu-columns-3 { grid-template-columns: repeat(3,minmax(0,1fr)); }\n.dan-pu-stats.dan-pu-columns-4 { grid-template-columns: repeat(4,minmax(0,1fr)); }\n.dan-pu-stats.dan-pu-columns-5 { grid-template-columns: repeat(5,minmax(0,1fr)); }\n.dan-pu-stats.dan-pu-columns-auto.dan-pu-density-compact { grid-template-columns: repeat(auto-fit,minmax(min(100%,max(128px,calc((100% - 32px) / 5))),1fr)); }\n.dan-pu-stats.dan-pu-columns-auto.dan-pu-density-roomy { grid-template-columns: repeat(auto-fit,minmax(min(100%,max(180px,calc((100% - 36px) / 3))),1fr)); }\n.dan-pu-stats.dan-pu-density-compact { gap: 8px; }\n.dan-pu-density-compact .dan-pu-stat-card { padding: 12px 14px; }\n.dan-pu-density-compact .dan-pu-stat-value { font-size: 24px; margin-bottom: 5px; }\n#dan-pu-ritmo.dan-pu-density-compact { padding: 18px !important; }\n#dan-pu-ritmo.dan-pu-density-compact .dan-pu-readership { padding: 14px !important; }\n#dan-pu-ritmo.dan-pu-density-compact .dan-pu-view-row[data-layout=\"featured\"] { min-height: 60px; padding-top: 6px; padding-bottom: 6px; }\n.dan-pu-stats.dan-pu-density-roomy { gap: 18px; }\n.dan-pu-density-roomy .dan-pu-stat-card { padding: 24px 22px; }\n.dan-pu-density-roomy .dan-pu-stat-value { font-size: 32px; margin-bottom: 10px; }\n#dan-pu-ritmo.dan-pu-density-roomy { padding: 32px !important; }\n#dan-pu-ritmo.dan-pu-density-roomy .dan-pu-readership { padding: 24px !important; }\n#dan-pu-ritmo.dan-pu-density-roomy .dan-pu-view-row[data-layout=\"featured\"] { min-height: 76px; padding-top: 14px; padding-bottom: 14px; }\n#dan-pu-ritmo.dan-pu-density-roomy .dan-pu-view-row[data-layout=\"compact\"] { padding-top: 16px; padding-bottom: 16px; }\n@media (max-width: 600px) {\n .dan-pu-stats.dan-pu-columns-2,\n .dan-pu-stats.dan-pu-columns-3,\n .dan-pu-stats.dan-pu-columns-4,\n .dan-pu-stats.dan-pu-columns-5 { grid-template-columns: repeat(2,minmax(0,1fr)); }\n #dan-pu-ritmo.dan-pu-density-compact { padding: 12px !important; }\n #dan-pu-ritmo.dan-pu-density-compact .dan-pu-readership { padding: 10px !important; }\n #dan-pu-ritmo.dan-pu-density-roomy { padding: 18px !important; }\n #dan-pu-ritmo.dan-pu-density-roomy .dan-pu-readership { padding: 16px !important; }\n}\n@media (max-width: 400px) {\n .dan-pu-stats.dan-pu-columns-2,\n .dan-pu-stats.dan-pu-columns-3,\n .dan-pu-stats.dan-pu-columns-4,\n .dan-pu-stats.dan-pu-columns-5 { grid-template-columns: minmax(0,1fr); }\n}\n\n/* Profile information wraps without changing the alignment of the counters. */\n.dan-pu-profile-header { box-sizing: border-box; clear: both; margin: 0 0 16px; padding: 18px; border: 1px solid #c8ccd1; border-top: 3px solid #36c; border-radius: 12px; background: #fff; color: #202122; font-size: 14px; line-height: 1.5; }\n.dan-pu-profile-header.dan-pu-density-compact { padding: 14px; }\n.dan-pu-profile-header.dan-pu-density-roomy { padding: 24px; }\n.dan-pu-profile-header .dan-pu-profile-details { font-size: 14px !important; }\n.dan-pu-profile-header.dan-pu-has-cover { padding-top: 0; overflow: hidden; }\n.dan-pu-profile-cover { margin: 0 -18px 18px; }\n.dan-pu-profile-header.dan-pu-density-compact .dan-pu-profile-cover { margin: 0 -14px 14px; }\n.dan-pu-profile-header.dan-pu-density-roomy .dan-pu-profile-cover { margin: 0 -24px 24px; }\n.dan-pu-profile-cover-image-link { display: block; }\n.dan-pu-profile-cover a:focus { outline: 3px solid #36c; outline-offset: -3px; }\n.dan-pu-profile-cover img { display: block; box-sizing: border-box; width: 100%; height: 180px; object-fit: cover; object-position: 50% 50%; }\n/* The native daily template keeps its file link, with only its picture in the cover. */\n.dan-pu-profile-cover-native-body > div { width: 100%; margin: 0; }\n.dan-pu-profile-cover-native-body > div > table { width: 100% !important; margin: 0 !important; border: 0; border-collapse: collapse; background: transparent; }\n.dan-pu-profile-cover-native-body td { padding: 0; border: 0; }\n.dan-pu-profile-cover-native-body td + td,\n.dan-pu-profile-cover-native-body > div > p { display: none; }\n.dan-pu-profile-cover-native-body .imagem-destaque,\n.dan-pu-profile-cover-native-body .imagem-destaque a { display: block; width: 100%; }\n.dan-pu-profile-cover-caption { padding: 7px 16px; background: #f8f9fa; color: #202122; font-size: 11px; line-height: 1.5; overflow-wrap: anywhere; }\n.dan-pu-profile-cover-caption a { color: #36c; text-decoration: underline; }\n.dan-pu-profile-cover-placeholder { display: block; box-sizing: border-box; min-height: 110px; padding: 44px 16px; background: #eaecf0; color: #54595d; text-align: center; }\n.dan-pu-profile-cover-placeholder[hidden] { display: none; }\n.dan-pu-profile-cover.is-unavailable .dan-pu-profile-cover-image-link { display: none; }\n.dan-pu-profile-header.dan-pu-cover-only { padding-bottom: 0; }\n.dan-pu-profile-header.dan-pu-cover-only .dan-pu-profile-cover { margin-bottom: 0; }\n.dan-pu-profile-header.dan-pu-top-dark .dan-pu-profile-details a,\n.dan-pu-profile-header.dan-pu-top-dark .dan-pu-profile-photo-caption a { color: #fff; }\n.dan-pu-profile-header.dan-pu-top-light .dan-pu-profile-details a,\n.dan-pu-profile-header.dan-pu-top-light .dan-pu-profile-photo-caption a { color: #000; }\n.dan-pu-profile-header.dan-pu-top-dark .dan-pu-profile-details a:focus,\n.dan-pu-profile-header.dan-pu-top-dark .dan-pu-profile-photo a:focus { outline-color: #fff; }\n.dan-pu-profile-header.dan-pu-top-light .dan-pu-profile-details a:focus,\n.dan-pu-profile-header.dan-pu-top-light .dan-pu-profile-photo a:focus { outline-color: #000; }\n.dan-pu-profile-header.dan-pu-top-dark .dan-pu-profile-label + .dan-pu-profile-details[data-layout=\"inline\"] { border-top-color: #72777d; }\n.dan-pu-profile-header.dan-pu-top-dark .dan-pu-profile-details[data-layout=\"inline\"] > div + div { border-left-color: #72777d; }\n.dan-pu-top-profile-slot { min-width: 0; }\n.dan-pu-local-time { font-variant-numeric: tabular-nums; }\n.dan-pu-profile-location-time { min-width: 0; }\n.dan-pu-profile-location-time > .dan-pu-profile-location,\n.dan-pu-profile-location-time > .dan-pu-local-time { display: inline; }\n.dan-pu-field-values[data-layout=\"lines\"] > div { display: block; }\n.dan-pu-field-values[data-layout=\"lines\"] > div + div { margin-top: 3px; }\n.dan-pu-field-values[data-layout=\"bullets\"] { margin: 4px 0; padding-left: 1.4em; list-style: disc; }\n.dan-pu-field-separator { white-space: pre-wrap; }\n.dan-pu-profile-slot,\n.dan-pu-cards-profile { min-width: 0; }\n.dan-pu-profile-content { display: flex; align-items: flex-start; gap: 16px; min-width: 0; }\n.dan-pu-profile-content[data-photo-align=\"right\"] { flex-direction: row-reverse; }\n.dan-pu-profile-content[data-photo-align=\"center\"] { flex-direction: column; align-items: center; }\n.dan-pu-profile-content[data-photo-align=\"center\"] > .dan-pu-profile-copy { align-self: stretch; }\n\n.dan-pu-content-sections { clear: both; min-width: 0; margin: 20px 0; color: #202122; font-size: 14px; line-height: 1.6; }\n.dan-pu-content-section { min-width: 0; box-sizing: border-box; margin: 18px 0; padding: 24px; border: 1px solid #c8ccd1; border-radius: 12px; background: #fff; overflow-wrap: anywhere; }\n.dan-pu-content-section h2 { margin: 0 0 16px; padding: 0; border: 0; color: #202122; font-family: Georgia, serif; font-size: 24px; line-height: 1.3; }\n.dan-pu-content-section-heading { display: flex; align-items: baseline; justify-content: space-between; gap: 14px; }\n.dan-pu-content-section-body { min-width: 0; }\n.dan-pu-content-section-body p { margin: 0 0 12px; }\n.dan-pu-content-section-body p:last-child { margin-bottom: 0; }\n.dan-pu-content-section-body h3 { margin: 16px 0 8px; font-size: 18px; }\n.dan-pu-content-section-body ul, .dan-pu-content-section-body ol { margin: 8px 0; padding-left: 24px; }\n.dan-pu-content-section-body pre, .dan-pu-section-source pre { max-width: 100%; white-space: pre-wrap; overflow-wrap: anywhere; }\n.dan-pu-section-code { color: #54595d; white-space: pre-wrap; overflow-wrap: anywhere; }\n.dan-pu-section-edit { flex-shrink: 0; padding: 4px 8px; border: 1px solid #a2a9b1; border-radius: 4px; background: #fff; color: #36c; font: inherit; font-size: 12px; cursor: pointer; }\n.dan-pu-section-edit:focus { outline: 2px solid #36c; outline-offset: 2px; }\n.dan-pu-content-preview-note { color: #54595d; font-size: 12px; }\n@media (max-width: 600px) { .dan-pu-content-section { padding: 18px; } }\n.dan-pu-profile-copy { flex: 1; min-width: 0; }\n.dan-pu-profile-label { font-size: 24px; overflow-wrap: anywhere; }\n.dan-pu-profile-details { overflow-wrap: anywhere; }\n.dan-pu-profile-details a { color: #36c; text-decoration: underline; }\n.dan-pu-profile-details a:focus,\n.dan-pu-profile-photo a:focus { outline: 2px solid #36c; outline-offset: 2px; }\n.dan-pu-profile-details[data-layout=\"inline\"] { display: flex; flex-wrap: wrap; row-gap: 5px; }\n.dan-pu-profile-label + .dan-pu-profile-details[data-layout=\"inline\"] { padding-top: 7px; border-top: 1px solid #eaecf0; }\n.dan-pu-profile-details[data-layout=\"inline\"][data-align=\"center\"] { justify-content: center; }\n.dan-pu-profile-details[data-layout=\"inline\"][data-align=\"right\"] { justify-content: flex-end; }\n.dan-pu-profile-details[data-layout=\"inline\"] > div { min-width: 0; }\n.dan-pu-profile-details[data-layout=\"inline\"] > div + div { border-left: 1px solid #a2a9b1; padding-left: 9px; margin-left: 9px; }\n.dan-pu-profile-photo { flex: none; width: 96px; max-width: 100%; min-width: 0; text-align: center; }\n.dan-pu-profile-photo[data-photo-size=\"64\"] { width: 64px; }\n.dan-pu-profile-photo[data-photo-size=\"128\"] { width: 128px; }\n.dan-pu-profile-photo[data-photo-size=\"160\"] { width: 160px; }\n.dan-pu-profile-photo[data-photo-size=\"200\"] { width: 200px; }\n.dan-pu-profile-photo-visual { position: relative; width: 100%; padding-top: 100%; }\n.dan-pu-profile-photo-visual a { display: block; position: absolute; top: 0; right: 0; bottom: 0; left: 0; }\n.dan-pu-profile-photo img { display: block; position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; border-radius: 0; }\n.dan-pu-profile-photo-placeholder { display: block; box-sizing: border-box; position: absolute; top: 0; right: 0; bottom: 0; left: 0; padding: 20px 6px; border: 1px solid #c8ccd1; border-radius: 0; background: #f8f9fa; color: #54595d; font-size: 12px; }\n.dan-pu-profile-photo[data-photo-shape=\"round\"] img,\n.dan-pu-profile-photo[data-photo-shape=\"round\"] .dan-pu-profile-photo-placeholder { border-radius: 50%; }\n.dan-pu-profile-photo-placeholder[hidden] { display: none; }\n.dan-pu-profile-photo-caption { margin-top: 5px; font-size: 10px; line-height: 1.35; overflow-wrap: anywhere; }\n.dan-pu-profile-photo-caption a { color: #36c; text-decoration: underline; }\n@media (max-width: 600px) {\n .dan-pu-profile-cover img { height: 120px; }\n}\n@media (max-width: 400px) {\n .dan-pu-profile-content { flex-wrap: wrap; gap: 10px; }\n .dan-pu-profile-content[data-photo-align=\"right\"] > .dan-pu-profile-photo { margin-left: auto; }\n .dan-pu-profile-copy { flex-basis: 100%; }\n}\n"; }(window));

;

/* PerfilWiki 1.20.0. Shared scheduler and anonymous transport. Daniel G Rego, CC BY-SA 4.0. */
(function (win) {
    'use strict';
    var mw = win.mw, core = win.PerfilWikiCoordinator, view = win.PerfilWikiActivityView, codec = win.PerfilWikiCache, presenter = win.PerfilWikiPresenter;
    if (!mw || !core || !view || !codec || !presenter || !mw.config || mw.config.get('wgDBname') !== 'ptwiki' ||
        mw.config.get('wgAction') !== 'view' || win.PerfilWiki) { return; }
    if (win.DanPURitmo || win.DanPUStats) {
        if (mw.notify) { mw.notify('Retire as chamadas antigas de RitmoPU e EstatisticasPU do common.js antes de carregar PerfilWiki.', {type:'warn'}); }
        return;
    }
    var configured, profileOptions;
    try { profileOptions = win.PerfilWikiConfiguration.resolve(mw, win); configured = profileOptions.metrics; }
    catch (error) { if (win.console) { win.console.warn('PerfilWiki: configuração inválida.', error); } return; }
    if (!mw.config.get('wgUserName') || mw.config.get('wgUserName') !== configured.user) { return; }
    var relevantUser = mw.config.get('wgRelevantUserName') || String(mw.config.get('wgTitle') || '').split('/')[0].replace(/_/g, ' ');
    var namespace = mw.config.get('wgNamespaceNumber');
    if (relevantUser !== configured.user || namespace !== 2) { return; }
    var appearance = profileOptions.appearance, appearanceColors = win.PerfilWikiAppearance.colors(appearance);
    var defaultUser = false;
    var PREFIX = 'perfilwiki-v1-' + encodeURIComponent(configured.user) + '-' + encodeURIComponent(configured.timeZone) + '-';
    if (win.PerfilWikiStyleText && !win.document.getElementById('perfilwiki-style-v1')) {
        var style = win.document.createElement('style'); style.id = 'perfilwiki-style-v1'; style.textContent = win.PerfilWikiStyleText;
        (win.document.head || win.document.documentElement).appendChild(style);
    }
    var REFRESH = 300000;
    var BLACKLIST_URL = 'https://raw.githubusercontent.com/wikimedia/analytics-refinery/master/static_data/cassandra/disallowed_cassandra_articles/disallowed_cassandra_articles.tsv';
    var queryAnchor = null, nextRequestAt = 0, nextActionRequestAt = 0;
    var API_USER_AGENT = 'PerfilWiki/1.20.0 (https://github.com/danrego/PerfilWiki)';
    var TRANSPORT_PREFIX = 'perfilwiki-transport-v1-', TRANSPORT_LOCK = 'perfilwiki-public-transport-v1';
    var JSON_RESPONSE_LIMIT = 8 * 1024 * 1024, BLACKLIST_RESPONSE_LIMIT = 256000;
    var periodKeys = ['30d', '90d', '12m', 'since', 'custom'];
    var visibleCounts = { '30d': 10, '90d': 10, '12m': 10, 'since': 10, 'custom':10 };
    var activePeriod = appearance.initialPeriod, priorityChanged = false;
    function periodFromHash() {
        var hash = win.location && win.location.hash || '';
        var match = /^#dan-pu-view-(30d|90d|12m|since|custom)$/.exec(hash);
        return match ? match[1] : null;
    }
    activePeriod = periodFromHash() || activePeriod;
    var current = null, started = false, running = false, suspended = false, timer;
    var lifecycle = 0, releaseActiveLease = null, nextCheck = 0;
    var cachedRaw = null, cachedState = null;
    var controllers = new Set(), pauses = Object.create(null);
    var active = 0, waiters = [];
    var images = Object.create(null), imageAttempts = Object.create(null), brokenImages = new Set();
    var imagesLoaded = false, imagesInFlight = false, imageTimer, clockTimer, imageRequests = 0, imageCycleStarted = false;
    var dailyCoverApi=win.PerfilWikiDailyCover,dailyCover=null,dailyCoverInFlight=null;
    function storageGet(key) { try { return win.localStorage.getItem(PREFIX + key); } catch (_) { return null; } }
    var largeCache = win.PerfilWikiLargeCache, cacheRestore = null, hasAdvancedCurrent = false;
    var localRevision = 0, appliedLocalRevision = 0, cacheSequence = 0, committedSequence = 0, currentCheckpoint = 0;
    var checkpointAnchor = -Infinity, checkpointOrdinal = 0, CHECKPOINT_LIMIT = 1000000;
    var lastQueuedAnchor = -Infinity, lastCommittedAnchor = -Infinity, lastProgressSaveAt = -Infinity;
    var cacheSaveQueue = Promise.resolve(), cacheWarningShown = false;
    function storageSet(key, value) {
        try { win.localStorage.setItem(PREFIX + key, value); return true; }
        catch (_) { return false; }
    }
    function checkpointNumber(state) { return state && state.cacheCheckpoint ? state.cacheCheckpoint.sequence : 0; }
    function seedCheckpoint(state) {
        if (!state) { return; }
        var anchor = Date.parse(state.capturedAt), sequence = checkpointNumber(state);
        if (anchor > checkpointAnchor) { checkpointAnchor = anchor; checkpointOrdinal = sequence; }
        else if (anchor === checkpointAnchor) { checkpointOrdinal = Math.max(checkpointOrdinal,sequence); }
    }
    function warnCacheFailure() {
        if (cacheWarningShown) { return; }
        cacheWarningShown = true;
        notify('O navegador não guardou esta consulta. Os resultados continuam disponíveis nesta aba.', 'warn');
    }
    function saveCache(state, force) {
        var now = Date.now(), anchor = state && Date.parse(state.capturedAt);
        if (!state || !Number.isFinite(anchor) || anchor < lastQueuedAnchor ||
            !force && now - lastProgressSaveAt < 15000) { return cacheSaveQueue; }
        seedCheckpoint(state);
        if (anchor < checkpointAnchor || checkpointOrdinal + 1 >= CHECKPOINT_LIMIT) { warnCacheFailure(); return cacheSaveQueue; }
        lastProgressSaveAt = now; lastQueuedAnchor = anchor;
        var sequence = ++cacheSequence, ordinal = ++checkpointOrdinal, raw;
        var persisted = Object.assign({},state,{cacheCheckpoint:{schema:1,sequence:ordinal}});
        if (state === current) { currentCheckpoint = ordinal; }
        // Serialize only accepted checkpoints. The immutable string also keeps
        // a collector's later mutations out of an older asynchronous write.
        try { raw = JSON.stringify(persisted); }
        catch (_) { warnCacheFailure(); return cacheSaveQueue; }
        cacheSaveQueue = cacheSaveQueue.catch(function () {}).then(async function () {
            if (anchor < lastCommittedAnchor || anchor === lastCommittedAnchor && sequence <= committedSequence) { return false; }
            var packed;
            try { packed = codec.packJson(raw); }
            catch (_) { warnCacheFailure(); return false; }
            var localSaved = storageSet('cache',packed), largeSaved = false;
            if (localSaved) {
                if (packed !== cachedRaw) { localRevision += 1; }
                cachedRaw = packed; cachedState = persisted; appliedLocalRevision = localRevision;
            }
            // Mirroring successful local writes prevents an older same-anchor
            // IndexedDB checkpoint from winning during a subsequent visit.
            if (largeCache && typeof largeCache.put === 'function') {
                try { largeSaved = await largeCache.put(PREFIX + 'cache',packed,state.capturedAt) === true; } catch (_) {}
            }
            if (localSaved || largeSaved) {
                lastCommittedAnchor = anchor; committedSequence = sequence;
                return true;
            }
            warnCacheFailure(); return false;
        });
        return cacheSaveQueue;
    }
    function applyLocalCache(state) {
        if (!state) { return; }
        var anchor = Date.parse(state.capturedAt), currentAnchor = current && Date.parse(current.capturedAt);
        var ordinal = checkpointNumber(state);
        if (!current || anchor > currentAnchor || anchor === currentAnchor &&
            (ordinal > currentCheckpoint || !ordinal && !currentCheckpoint && localRevision > appliedLocalRevision)) {
            current = state; currentCheckpoint = ordinal; hasAdvancedCurrent = true; appliedLocalRevision = localRevision;
            lastCommittedAnchor = Math.max(lastCommittedAnchor,anchor); paint(current);
        }
    }
    function restoreLargeCache() {
        if (cacheRestore) { return cacheRestore; }
        if (!largeCache || typeof largeCache.get !== 'function') { cacheRestore = Promise.resolve(); return cacheRestore; }
        var epoch = lifecycle, initialSequence = cacheSequence, initialRevision = localRevision;
        cacheRestore = Promise.resolve().then(function () { return largeCache.get(PREFIX + 'cache'); }).then(function (raw) {
            if (suspended || epoch !== lifecycle) { return; }
            var restored = validatedCache(raw,false);
            if (!restored) { return; }
            var anchor = Date.parse(restored.capturedAt), currentAnchor = current && Date.parse(current.capturedAt), ordinal = checkpointNumber(restored);
            seedCheckpoint(restored);
            if (!current || anchor > currentAnchor || anchor === currentAnchor && !hasAdvancedCurrent &&
                cacheSequence === initialSequence && localRevision === initialRevision &&
                (ordinal > currentCheckpoint || !ordinal && !currentCheckpoint)) {
                current = restored; currentCheckpoint = ordinal; hasAdvancedCurrent = true; appliedLocalRevision = localRevision;
                lastCommittedAnchor = Math.max(lastCommittedAnchor,anchor);
                paint(current);
            }
        }).catch(function () {});
        return cacheRestore;
    }
    function validatedCache(raw, upgrade) {
        try {
            if (!raw || raw.length > 4000000) { return null; }
            var state = codec.parseJson(raw);
            if (state.cacheCheckpoint !== undefined) {
                var checkpoint = state.cacheCheckpoint;
                if (!checkpoint || typeof checkpoint !== 'object' || Array.isArray(checkpoint) ||
                    Object.keys(checkpoint).sort().join(',') !== 'schema,sequence' || checkpoint.schema !== 1 ||
                    !Number.isInteger(checkpoint.sequence) || checkpoint.sequence < 1 || checkpoint.sequence >= CHECKPOINT_LIMIT) { return null; }
            }
            if (Date.parse(state.capturedAt) > Date.now() + 60000) { return null; }
            if (upgrade) {
                var upgradeCache = state.schemaVersion === 4 ? core.upgradeAllArticleTotalCache : core.upgradeAfterFirstEditCache;
                if (typeof upgradeCache !== 'function') { return null; }
                state = upgradeCache(state);
            }
            if (!state.config || state.config.user !== configured.user || state.config.project !== configured.project || state.config.timeZone !== configured.timeZone) { return null; }
            return Date.parse(state.capturedAt) <= Date.now() + 60000 && core.validateState(state).valid ? state : null;
        } catch (_) { return null; }
    }
    function readCache() {
        var raw = storageGet('cache');
        if (cachedState && raw === cachedRaw && Date.parse(cachedState.capturedAt) <= Date.now() + 60000) { return cachedState; }
        var cached = validatedCache(raw, false);
        if (cached) { seedCheckpoint(cached); }
        if (cached && raw !== cachedRaw) { localRevision += 1; }
        cachedRaw = cached ? raw : null; cachedState = cached;
        if (cached) { return cached; }
        var legacyKeys = ['dan-pu-ritmo-v8-' + encodeURIComponent(configured.user) + '-' + encodeURIComponent(configured.timeZone) + '-cache', 'dan-pu-ritmo-v8-cache', 'dan-pu-ritmo-v7-cache', 'dan-pu-ritmo-v6-cache', 'dan-pu-ritmo-v5-cache', 'dan-pu-ritmo-v4-cache', 'dan-pu-ritmo-v3-cache'];
        for (var index = 0; index < legacyKeys.length; index += 1) {
            try {
                var legacyRaw = win.localStorage.getItem(legacyKeys[index]);
                var upgraded = validatedCache(legacyRaw, false) || validatedCache(legacyRaw, true);
                if (upgraded) { seedCheckpoint(upgraded); return upgraded; }
            } catch (_) { /* Try the other strictly validated legacy cache. */ }
        }
        return null;
    }
    function rememberDailyCover(value) {
        var checked=dailyCoverApi&&dailyCoverApi.normalize(value,Date.now());
        if(!checked)return false;
        if(!dailyCover||checked.date>dailyCover.date||checked.date===dailyCover.date&&checked.checkedAt>dailyCover.checkedAt){dailyCover=checked;return true;}
        return false;
    }
    function readDailyCover() {
        if(appearance.coverSource!=='daily'||!dailyCoverApi)return;
        try{var raw=storageGet('daily-cover-v1');if(raw&&raw.length<=4096)rememberDailyCover(JSON.parse(raw));}catch(_){}
        var root=win.document.getElementById('dan-pu-profile-header');
        if(root&&root.getAttribute('data-perfilwiki-user')===configured.user&&root.querySelector){var cover=root.querySelector('.dan-pu-profile-cover');try{if(cover)rememberDailyCover(JSON.parse(cover.getAttribute('data-perfilwiki-daily-cover')||'null'));}catch(_){}}
    }
    function dailyCoverEnabled() {
        if(appearance.coverSource!=='daily'||!dailyCoverApi||win.document.hidden)return false;
        var root=win.document.getElementById('dan-pu-profile-header');
        return !!(root&&root.getAttribute('data-perfilwiki-user')===configured.user&&!root.hidden&&(!root.style||root.style.display!=='none'));
    }
    function dailyCoverDue() {
        if(!dailyCoverEnabled())return false;
        readDailyCover();
        var now=Date.now(),deadline=Number(storageGet('daily-cover-retry-v1'))||0;
        return (!dailyCover||dailyCover.date!==dailyCoverApi.today(now))&&(!Number.isFinite(deadline)||deadline<=now||deadline>now+REFRESH+60000);
    }
    function collectDailyCover(epoch) {
        if(dailyCoverInFlight)return dailyCoverInFlight;
        if(!dailyCoverDue())return Promise.resolve(false);
        var date=dailyCoverApi.today(Date.now()),url=dailyCoverApi.url(date,Date.now());
        if(!url)return Promise.resolve(false);
        storageSet('daily-cover-retry-v1',String(Date.now()+REFRESH));
        dailyCoverInFlight=(async function(){
            try{
                var data=await requestJson(url,epoch);checkLifecycle(epoch);
                var proof=dailyCoverApi.fromFeed(data,date,Date.now());if(!proof)throw new Error('Imagem do dia indisponível.');
                rememberDailyCover(proof);storageSet('daily-cover-v1',JSON.stringify(dailyCover));storageSet('daily-cover-retry-v1','0');
                paintHeader(current);patchProfilePhotos();return true;
            }catch(_){return false;}
            finally{dailyCoverInFlight=null;}
        }());
        return dailyCoverInFlight;
    }
    function readImages() {
        if (imagesLoaded) { return; }
        imagesLoaded = true;
        try {
            var raw = storageGet('images-v1');
            if (raw && raw.length <= 262144) { images = presenter.normalizeImages(JSON.parse(raw), Date.now()); }
        } catch (_) { /* Optional image metadata never invalidates statistics. */ }
    }
    function imageSlots() {
        var target = win.document.getElementById('dan-pu-ritmo');
        return target && typeof target.querySelectorAll === 'function' ? Array.from(target.querySelectorAll('.dan-pu-view-image[data-pageid]')) : [];
    }
    function placeholder(slot) {
        var fallback = win.document.createElement('span');
        fallback.className = 'dan-pu-thumb-placeholder'; fallback.textContent = '▧'; fallback.setAttribute('aria-hidden', 'true');
        slot.replaceChildren(fallback);
    }
    function patchImages() {
        imageSlots().forEach(function (slot) {
            var row = { pageid: Number(slot.getAttribute('data-pageid')), title: slot.getAttribute('data-title') };
            var image = presenter.imageFor(images, row);
            var existing = slot.querySelector('img');
            if (!image || brokenImages.has(image.src)) {
                if (existing) { placeholder(slot); }
                return;
            }
            var element = existing;
            if (!element || element.getAttribute('src') !== image.src) {
                element = win.document.createElement('img'); element.className = 'dan-pu-thumb'; element.alt = '';
                element.width = 48; element.height = 48; element.loading = 'lazy'; element.decoding = 'async';
                element.crossOrigin = 'anonymous'; element.referrerPolicy = 'no-referrer'; element.src = image.src;
                slot.replaceChildren(element);
            }
            if (!element.danPURitmoBound) {
                element.danPURitmoBound = true;
                element.addEventListener('error', function () { brokenImages.add(image.src); if (element.parentNode === slot) { placeholder(slot); } }, { once: true });
            }
        });
    }
    function patchProfilePhotos() {
        var coverFilename=appearance.coverSource==='wiki-daily'?'':appearance.coverSource==='daily'?dailyCover&&dailyCover.filename:profileOptions.coverImage;
        if (!profileOptions.photo && !coverFilename) { return; }
        ['dan-pu-estatisticas', 'dan-pu-ritmo', 'dan-pu-profile-header'].forEach(function (id) {
            var root = win.document.getElementById(id);
            if (!root || root.getAttribute('data-perfilwiki-user') !== configured.user || typeof root.querySelectorAll !== 'function') { return; }
            [{filename:profileOptions.photo,slot:'.dan-pu-profile-photo',attribute:'data-perfilwiki-photo',image:'img.dan-pu-profile-photo-image',fallback:'.dan-pu-profile-photo-placeholder'},
                {filename:coverFilename,slot:'.dan-pu-profile-cover',attribute:'data-perfilwiki-cover',image:'img.dan-pu-profile-cover-image',fallback:'.dan-pu-profile-cover-placeholder'}].forEach(function(kind){
                if(!kind.filename)return;
                Array.from(root.querySelectorAll(kind.slot)).forEach(function (slot) {
                    if (slot.getAttribute(kind.attribute) !== kind.filename) { return; }
                    var image = slot.querySelector(kind.image), fallback = slot.querySelector(kind.fallback);
                    if (!image || !fallback) { return; }
                    function unavailable() {
                        image.hidden = true; image.style.display = 'none';
                        if(kind.attribute==='data-perfilwiki-cover'&&slot.classList)slot.classList.add('is-unavailable');
                        fallback.hidden = false; fallback.removeAttribute('hidden');
                    }
                    if (!image.perfilWikiPhotoBound) {
                        image.perfilWikiPhotoBound = true;
                        image.addEventListener('error', unavailable, {once:true});
                    }
                    // A cached failure can finish before this owner's script runs.
                    if (image.complete && image.naturalWidth === 0 && image.getAttribute('src')) { unavailable(); }
                });
            });
        });
    }
    function updateClock() {
        if (suspended || win.document.hidden) { return; }
        if (appearance.showLocalTime && win.PerfilWikiProfileClock) { win.PerfilWikiProfileClock.update(win.document, Date.now(), configured.user, configured.timeZone, appearance.language); }
        var target = win.document.getElementById('dan-pu-ritmo');
        if (target && typeof target.querySelectorAll === 'function') {
            Array.from(target.querySelectorAll('.dan-pu-last-edit[data-live="true"]')).forEach(function (label) {
                var value = presenter.relativeTime(label.getAttribute('data-timestamp'), Date.now());
                if (value && label.textContent !== value) { label.textContent = value; }
            });
        }
    }
    function startClock() {
        win.clearTimeout(clockTimer); updateClock();
        if (!suspended && !win.document.hidden && (win.document.getElementById('dan-pu-ritmo') || appearance.showLocalTime && hasPanel())) {
            clockTimer = win.setTimeout(function () { startClock(); }, 60020 - Date.now() % 60000);
        }
    }
    function queueImages() {
        win.clearTimeout(imageTimer);
        if (suspended || imagesInFlight || imageRequests >= 1 || win.document.hidden || !imageSlots().length) { return; }
        imageTimer = win.setTimeout(function () { collectImages(); }, 1800);
    }
    async function collectImages() {
        if (suspended || imagesInFlight || imageRequests >= 1 || win.document.hidden) { return; }
        var epoch = lifecycle, requested = [], seen = new Set(), now = Date.now();
        imageSlots().forEach(function (slot) {
            var row = { pageid: Number(slot.getAttribute('data-pageid')), title: slot.getAttribute('data-title') };
            var attempt = imageAttempts[row.pageid];
            if (Number.isSafeInteger(row.pageid) && row.pageid > 0 && row.title && row.title.length <= 512 && !seen.has(row.pageid) && requested.length < 50 &&
                !presenter.imageFor(images, row) && !(attempt && attempt.title === row.title && now - attempt.at < 3600000)) {
                seen.add(row.pageid); requested.push(row); imageAttempts[row.pageid] = { title: row.title, at: now };
            }
        });
        var url = presenter.imageRequest(requested);
        if (!url) { return; }
        imagesInFlight = true; imageRequests += 1;
        try {
            var response = await sharedRequestJson(url, epoch);
            checkLifecycle(epoch);
            if (!response.query || !Array.isArray(response.query.pages) || response.query.pages.length > 50 || response.continue) { throw new Error('Metadados de imagem incompletos.'); }
            var capturedAt = new Date().toISOString();
            response.query.pages.forEach(function (page) {
                var expected = requested.find(function (row) { return row.pageid === page.pageid && row.title === page.title; });
                var image = expected && presenter.validateImage(page, capturedAt);
                if (image) { images[image.pageid] = image; }
            });
            var retained = Object.create(null);
            imageSlots().forEach(function (slot) {
                var row = { pageid: Number(slot.getAttribute('data-pageid')), title: slot.getAttribute('data-title') };
                var image = presenter.imageFor(images, row);
                if (image) { retained[image.pageid] = image; }
            });
            images = presenter.normalizeImages(retained, Date.now());
            storageSet('images-v1', JSON.stringify(images)); patchImages();
        } catch (error) {
            requested.forEach(function (row) {
                var attempt = imageAttempts[row.pageid];
                if (!attempt || attempt.title !== row.title || attempt.at !== now) { return; }
                if (suspended || epoch !== lifecycle || error.code === 'aborted') { delete imageAttempts[row.pageid]; }
                else { attempt.at = Date.now() - 3300000; }
            });
        } finally {
            imagesInFlight = false;
            if (!suspended) { queueImages(); }
        }
    }
    function enhancePresentation() {
        patchProfilePhotos(); patchImages(); startClock(); queueImages();
    }
    function bindControls() {
        var customApply = win.document.getElementById('dan-pu-custom-apply');
        if (customApply && !customApply.danPURitmoBound) {
            function applyCustom(event) {
                if(event&&event.preventDefault)event.preventDefault();
                var start=win.document.getElementById('dan-pu-custom-start'),end=win.document.getElementById('dan-pu-custom-end'),error=win.document.getElementById('dan-pu-custom-error');
                try {
                    var range=core.normalizeCustomRange({start:start&&start.value,end:end&&end.value},Date.now());
                    appearance=win.PerfilWikiAppearance.normalize(Object.assign({},appearance,{customRange:range,initialPeriod:'custom'}));
                    profileOptions.appearance=appearance;activePeriod='custom';visibleCounts.custom=10;priorityChanged=true;
                    if(error)error.textContent='';
                    if(start)start.setAttribute('aria-invalid','false');if(end)end.setAttribute('aria-invalid','false');
                    if(current)paint(current);else applyPeriodVisibility();
                    if(started&&!running&&!suspended)refresh(false,true);
                } catch(failure) {if(error)error.textContent=failure.message||'Confira as datas do intervalo.';if(start)start.setAttribute('aria-invalid','true');if(end)end.setAttribute('aria-invalid','true');}
            }
            customApply.addEventListener('click',applyCustom);
            if(customApply.form)customApply.form.addEventListener('submit',applyCustom);
            customApply.danPURitmoBound=true;
        }
        periodKeys.forEach(function (key) {
            var tab = win.document.getElementById('dan-pu-ritmo-tab-' + key);
            if (tab && !tab.danPURitmoBound) {
                tab.addEventListener('click', function () { choosePeriod(key); }); tab.danPURitmoBound = true;
            }
            var expand = win.document.getElementById('dan-pu-ritmo-expand-' + key);
            var collapse = win.document.getElementById('dan-pu-ritmo-collapse-' + key);
            var pageviews = current && current.pageviews;
            var section = pageviews && pageviews.periods && pageviews.periods[key];
            var previousProfile = pageviews && pageviews.lastCompleteSnapshot && pageviews.lastCompleteSnapshot.periods && pageviews.lastCompleteSnapshot.periods[key];
            var needsPrevious = section && !section.complete;
            var displayed = section && needsPrevious && (section.lastCompleteSnapshot || previousProfile) || section;
            if (!displayed || !Array.isArray(displayed.rows) || displayed.rows.length <= 10) { return; }
            var total = Math.min(500, displayed.rows.length);
            visibleCounts[key] = Math.min(total, Math.max(10, visibleCounts[key]));
            function bindButton(container, label, handler) {
                if (!container) { return; }
                var button = win.document.createElement('button'); button.type = 'button'; button.textContent = label;
                button.style.cssText = 'border:0;background:none;color:' + appearanceColors.ink + ';font:inherit;padding:0;cursor:pointer;text-decoration:underline;';
                button.addEventListener('click', handler); container.replaceChildren(button);
            }
            if (visibleCounts[key] < total) {
                bindButton(expand, 'Mostrar mais ' + Math.min(100, total - visibleCounts[key]), function () {
                    visibleCounts[key] = Math.min(total, visibleCounts[key] + 100); paint(current);
                });
            }
            if (visibleCounts[key] > 10) {
                bindButton(collapse, 'Mostrar só 10', function () { visibleCounts[key] = 10; paint(current); });
            }
        });
    }
    function applyPeriodVisibility() {
        periodKeys.forEach(function (key) {
            var selected = key === activePeriod;
            var section = win.document.getElementById('dan-pu-period-' + key);
            if (section) { section.style.display = selected ? 'block' : 'none'; }
            var tab = win.document.getElementById('dan-pu-ritmo-tab-' + key);
            if (tab) {
                var pill = tab.querySelector && tab.querySelector('a') || tab;
                pill.style.background = selected ? appearanceColors.tint : '#fff';
                pill.style.borderColor = selected ? appearanceColors.ink : '#c8ccd1';
                pill.style.color = selected ? appearanceColors.ink : '#54595d';
                pill.style.fontWeight = selected ? '600' : '400';
                pill.setAttribute('aria-current', selected ? 'true' : 'false');
            }
        });
    }
    function choosePeriod(key) {
        if (periodKeys.indexOf(key) < 0) { return; }
        if(key==='custom'&&!appearance.customRange) {
            var defaults=core.periodsFor(Date.now())['30d'];
            appearance=win.PerfilWikiAppearance.normalize(Object.assign({},appearance,{customRange:{start:defaults.start,end:defaults.end}}));
            profileOptions.appearance=appearance;if(current)paint(current);
        }
        var changed = key !== activePeriod;
        activePeriod = key; applyPeriodVisibility();
        var customReady=current&&current.pageviews&&JSON.stringify(current.pageviews.customRange)===JSON.stringify(appearance.customRange)&&current.pageviews.periods.custom&&current.pageviews.periods.custom.complete;
        if (!changed || !current || !current.pageviews || (key==='custom'?customReady:current.pageviews.allPeriodsComplete)) { return; }
        priorityChanged = true;
        if (started && !running && !suspended) { refresh(false, true); }
    }
    function currentMetricReadership(element) {
        return element && element.getAttribute('data-perfilwiki-user') === configured.user && element.getAttribute('data-perfilwiki-project') === 'pt.wikipedia.org' && element.getAttribute('data-metric-version') === 'after-first-edit-v1' &&
            element.getAttribute('data-total-model') === 'all-periods-all-eligible-v1';
    }
    function applyBlockOrder() {
        if (win.PerfilWikiLayoutView) { win.PerfilWikiLayoutView.arrange(win.document, appearance, configured.user); }
        if (appearance.layout !== 'together' || typeof win.document.querySelectorAll !== 'function') { return; }
        Array.from(win.document.querySelectorAll('[data-perfilwiki-group="true"]')).forEach(function (group) {
            if (group.getAttribute('data-perfilwiki-user') !== configured.user || typeof group.querySelector !== 'function') { return; }
            var cards = group.querySelector('#dan-pu-estatisticas'), activity = group.querySelector('#dan-pu-ritmo');
            // Only the installer-created group owns this order. Existing user
            // prose and separately placed blocks never enter this operation.
            if (!cards || !activity || cards.parentNode !== group || activity.parentNode !== group ||
                cards.getAttribute('data-perfilwiki-user') !== configured.user || activity.getAttribute('data-perfilwiki-user') !== configured.user) { return; }
            var first = appearance.blockOrder === 'activity-first' ? activity : cards;
            var second = first === activity ? cards : activity;
            var children = Array.from(group.children);
            if (children.indexOf(first) > children.indexOf(second)) { group.insertBefore(first, second); }
        });
    }
    function synchronizeActivityFooter() {
        var target = win.document.getElementById('dan-pu-ritmo');
        if (!target || typeof target.querySelector !== 'function' || typeof target.appendChild !== 'function') { return; }
        var footer = target.querySelector('#dan-pu-ritmo-install');
        if (win.PerfilWikiAppearance.footerOwner(appearance) !== 'activity') {
            if (footer && footer.parentNode) { footer.parentNode.removeChild(footer); }
            return;
        }
        if (!footer) {
            footer = win.document.createElement('div'); footer.id = 'dan-pu-ritmo-install';
            footer.style.cssText = 'margin-top:18px;padding-top:14px;border-top:1px solid #eaecf0;color:#54595d;font-size:12px;';
            target.appendChild(footer);
        }
        var link = footer.querySelector('a');
        if (!link) { footer.textContent = 'Gostou deste painel? '; link = win.document.createElement('a'); footer.appendChild(link); }
        link.href = 'https://pt.wikipedia.org/wiki/' + encodeURIComponent(profileOptions.documentationPage.replace(/ /g, '_'));
        link.textContent = 'Veja como adicionar à sua página de usuário.';
        link.style.color = appearanceColors.ink; link.style.textDecoration = 'none';
    }
    function customDraft(root) {
        if(!root||root.getAttribute('data-perfilwiki-user')!==configured.user)return null;
        var start=win.document.getElementById('dan-pu-custom-start'),end=win.document.getElementById('dan-pu-custom-end'),error=win.document.getElementById('dan-pu-custom-error');
        if(!start||!end||root.contains&&(!root.contains(start)||!root.contains(end)))return null;
        var focused=win.document.activeElement,ids=['dan-pu-custom-start','dan-pu-custom-end','dan-pu-custom-apply'];
        return {user:configured.user,start:start.value,end:end.value,error:error&&error.textContent||'',invalidStart:start.getAttribute('aria-invalid'),invalidEnd:end.getAttribute('aria-invalid'),
            focus:focused&&ids.indexOf(focused.id)>=0?focused.id:null};
    }
    function restoreCustomDraft(saved) {
        if(!saved||saved.user!==configured.user)return;
        var root=win.document.getElementById('dan-pu-ritmo'),start=win.document.getElementById('dan-pu-custom-start'),end=win.document.getElementById('dan-pu-custom-end'),error=win.document.getElementById('dan-pu-custom-error');
        if(!root||root.getAttribute('data-perfilwiki-user')!==saved.user||!start||!end)return;
        start.value=saved.start;end.value=saved.end;if(error)error.textContent=saved.error;
        [['aria-invalid',start,saved.invalidStart],['aria-invalid',end,saved.invalidEnd]].forEach(function(item){if(item[2]===null)item[1].removeAttribute(item[0]);else item[1].setAttribute(item[0],item[2]);});
        var focused=saved.focus&&win.document.getElementById(saved.focus);if(focused&&focused.focus)focused.focus({preventScroll:true});
    }
    function detachNestedCards(target) {
        var cards = target && target.querySelector && target.querySelector('#dan-pu-estatisticas');
        if (!cards || cards.getAttribute('data-perfilwiki-user') !== configured.user || !target.parentNode) { return null; }
        // Activity is repainted as a whole. Keep the actual counters node alive,
        // including profile metadata and any last-known-good statistics.
        target.parentNode.insertBefore(cards, target);
        return cards;
    }
    function retainedAccountCreated() {
        if (!view.captureAccountCreated) { return null; }
        return view.captureAccountCreated(win.document.getElementById('dan-pu-ritmo'), configured.user, Date.now()) ||
            view.captureAccountCreated(win.document.getElementById('dan-pu-estatisticas'), configured.user, Date.now()) ||
            view.captureAccountCreated(win.document.getElementById('dan-pu-profile-header'), configured.user, Date.now());
    }
    function headerPresentation() {
        return {user:configured.user,timeZone:configured.timeZone,displayName:profileOptions.displayName,location:profileOptions.location,photo:profileOptions.photo,coverImage:profileOptions.coverImage,dailyCover:dailyCover,
            customFields:profileOptions.customFields,appearance:appearance,now:Date.now(),documentationPage:profileOptions.documentationPage,savedAccountCreated:retainedAccountCreated()};
    }
    function paintHeader(state,savedCreated) {
        var presentation=headerPresentation();if(savedCreated)presentation.savedAccountCreated=savedCreated;
        if (win.PerfilWikiProfileHeaderView) { win.PerfilWikiProfileHeaderView.paint(win.document,state,presentation); }
        if (appearance.showLocalTime) { startClock(); }
    }
    function restoreNestedCards(cards) {
        if (!cards || appearance.layout !== 'integrated' || !appearance.showCards || !appearance.showActivity) { return; }
        var target = win.document.getElementById('dan-pu-ritmo');
        var slot = target && target.querySelector && target.querySelector('#dan-pu-integrated-cards');
        if (target && target.getAttribute('data-perfilwiki-user') === configured.user && slot) { slot.appendChild(cards); }
    }
    function paint(state) {
        var retainedCreated=retainedAccountCreated();
        if (state && win.PerfilWikiCardsView) { win.PerfilWikiCardsView.paint(win.document, state.statistics, state.activity, Date.now(), appearance, {user:configured.user,timeZone:configured.timeZone,displayName:profileOptions.displayName,location:profileOptions.location,photo:profileOptions.photo,coverImage:profileOptions.coverImage,dailyCover:dailyCover,customFields:profileOptions.customFields,appearance:appearance,now:Date.now(),documentationPage:profileOptions.documentationPage}); }
        paintHeader(state,retainedCreated);
        patchProfilePhotos();
        applyBlockOrder(); synchronizeActivityFooter();
        var target = win.document.getElementById('dan-pu-ritmo');
        if (target) { target.style.display = appearance.showActivity ? '' : 'none'; }
        if (!appearance.showActivity) { return; }
        if (!target || !state || !state.activity || !state.activity.complete) { return; }
        var pageviews = state.pageviews;
        var hasCompleteProfile = periodKeys.some(function (key) {
            var profile = pageviews && pageviews.periods && pageviews.periods[key];
            var previous = pageviews && pageviews.lastCompleteSnapshot && pageviews.lastCompleteSnapshot.periods && pageviews.lastCompleteSnapshot.periods[key];
            return profile && (profile.complete || profile.lastCompleteSnapshot && profile.lastCompleteSnapshot.complete) || previous && previous.complete;
        });
        var previousReadership = target.querySelector && target.querySelector('.dan-pu-readership');
        var preserved = !hasCompleteProfile && currentMetricReadership(previousReadership) ? previousReadership : null;
        readImages();
        var help = target.querySelector && target.querySelector('details.dan-pu-data-help');
        var helpOpen = help && help.open;
        var stagedCustom=customDraft(target);
        var savedAccountCreated = retainedAccountCreated() || retainedCreated;
        var retainedCards = detachNestedCards(target);
        target.outerHTML = view.html(state, { visibleCounts: visibleCounts, images: images, now: Date.now(), displayName:profileOptions.displayName, location:profileOptions.location, photo:profileOptions.photo,coverImage:profileOptions.coverImage,dailyCover:dailyCover, customFields:profileOptions.customFields, stylesPage: profileOptions.stylesPage, documentationPage: profileOptions.documentationPage, appearance:appearance, savedAccountCreated:savedAccountCreated });
        restoreNestedCards(retainedCards);
        applyBlockOrder(); synchronizeActivityFooter();
        paintHeader(state);
        if (preserved) {
            var updated = win.document.getElementById('dan-pu-ritmo');
            var readership = updated && updated.querySelector('.dan-pu-readership');
            if (readership) {
                readership.replaceWith(preserved);
                var preservedHeading = preserved.querySelector('.dan-pu-readership-heading') || preserved.firstElementChild;
                if (preservedHeading) { preservedHeading.textContent = 'Visualizações dos artigos editados por ' + profileOptions.displayName + '.'; }
                Array.from(preserved.querySelectorAll('a')).forEach(function (link) { link.style.color = appearanceColors.ink; });
            }
        }
        var best = win.document.getElementById('dan-pu-ritmo-melhor-sequencia');
        if (best) { var days = state.activity.summary.bestStreak; best.textContent = new Intl.NumberFormat('pt-BR').format(days) + (days === 1 ? ' dia' : ' dias'); }
        bindControls(); applyPeriodVisibility();restoreCustomDraft(stagedCustom);
        if (helpOpen) {
            var nextTarget = win.document.getElementById('dan-pu-ritmo');
            var nextHelp = nextTarget && nextTarget.querySelector('details.dan-pu-data-help');
            if (nextHelp) { nextHelp.open = true; }
        }
        enhancePresentation();
    }
    function requestAllowed(url) { return win.PerfilWikiConfiguration.requestAllowed(url); }
    function canonicalRequest(url) { var value = new URL(url); value.searchParams.sort(); return value.toString(); }
    var sharedRequests = new Map();
    function sharedRequestJson(url, epoch) {
        var key = canonicalRequest(url);
        if (sharedRequests.has(key)) { return sharedRequests.get(key); }
        var request = requestJson(url, epoch);
        sharedRequests.set(key, request);
        request.catch(function () { if (sharedRequests.get(key) === request) { sharedRequests.delete(key); } });
        return request;
    }
    function servicePause(origin, until) {
        try {
            var shared = JSON.parse(transportGet('pausas') || storageGet('pausas') || '{}');
            if (shared && typeof shared === 'object' && !Array.isArray(shared)) {
                Object.keys(shared).forEach(function (key) { if (Number.isFinite(shared[key])) { pauses[key] = Math.max(pauses[key] || 0, shared[key]); } });
            }
        } catch (_) { /* Use the in-memory pause. */ }
        if (until !== undefined) { pauses[origin] = Math.max(pauses[origin] || 0, until); transportSet('pausas', JSON.stringify(pauses)); }
        return pauses[origin] || 0;
    }
    function checkLifecycle(epoch) {
        if (suspended || epoch !== lifecycle) {
            var error = new Error('Página suspensa.'); error.code = 'aborted'; throw error;
        }
    }
    function responseLimitError() { var error = new Error('A resposta pública excedeu o limite de tamanho.'); error.code = 'response-too-large'; return error; }
    function utf8Length(text) {
        var bytes = 0;
        for (var index = 0; index < text.length; index += 1) {
            var code = text.charCodeAt(index);
            if (code < 128) { bytes += 1; }
            else if (code < 2048) { bytes += 2; }
            else if (code >= 0xd800 && code <= 0xdbff && index+1 < text.length && text.charCodeAt(index+1) >= 0xdc00 && text.charCodeAt(index+1) <= 0xdfff) { bytes += 4; index += 1; }
            else { bytes += 3; }
        }
        return bytes;
    }
    async function responseText(response, limit, epoch) {
        var length = response.headers && response.headers.get && response.headers.get('Content-Length');
        if (length !== null && length !== undefined && /^\d+$/.test(length) && Number(length) > limit) { throw responseLimitError(); }
        // Browser responses are bounded while streaming, before building a string
        // or parsing JSON. The text/json fallback supports older test adapters.
        if (response.body && typeof response.body.getReader === 'function') {
            var reader = response.body.getReader(), decoder = new TextDecoder(), pieces = [], size = 0, finished = false;
            try {
                while (true) {
                    checkLifecycle(epoch);
                    var chunk = await reader.read(); checkLifecycle(epoch);
                    if (chunk.done) { finished = true; break; }
                    size += chunk.value.byteLength;
                    if (size > limit) { throw responseLimitError(); }
                    pieces.push(decoder.decode(chunk.value, {stream:true}));
                }
                pieces.push(decoder.decode()); return pieces.join('');
            } finally {
                if (!finished) { try { await reader.cancel(); } catch (_) {} }
                if (typeof reader.releaseLock === 'function') { reader.releaseLock(); }
            }
        }
        var text = typeof response.text === 'function' ? await response.text() : JSON.stringify(await response.json());
        checkLifecycle(epoch);
        if (typeof text !== 'string' || text.length > limit || utf8Length(text) > limit) { throw responseLimitError(); }
        return text;
    }
    function retryDeadline(response, fallback) {
        var retry = response.headers && response.headers.get && response.headers.get('Retry-After');
        var delay = retry && /^\d+$/.test(retry) ? Number(retry) * 1000 :
            retry && Number.isFinite(Date.parse(retry)) ? Date.parse(retry) - Date.now() : fallback;
        return Date.now() + Math.max(5000, Number.isFinite(delay) ? delay : fallback);
    }
    function actionDeadline() {
        var shared = Number(transportGet('action-next-v1')) || 0;
        if (Number.isFinite(shared) && shared <= Date.now()+65000) { nextActionRequestAt = Math.max(nextActionRequestAt,shared); }
        return nextActionRequestAt;
    }
    function waitForRequest(milliseconds, controller, epoch) {
        if (!milliseconds) { return Promise.resolve(); }
        return new Promise(function (resolve,reject) {
            var timeout;
            function abort() { win.clearTimeout(timeout); controller.signal.removeEventListener('abort',abort); var error=new Error('Página suspensa.'); error.code='aborted'; reject(error); }
            controller.signal.addEventListener('abort',abort,{once:true});
            timeout=win.setTimeout(function () { controller.signal.removeEventListener('abort',abort); try {checkLifecycle(epoch);resolve();} catch(error) {reject(error);} },milliseconds);
            if (controller.signal.aborted) { abort(); }
        });
    }
    function transportGet(key) {try {return win.localStorage.getItem(TRANSPORT_PREFIX+key);}catch(_){return null;}}
    function transportSet(key,value) {try {win.localStorage.setItem(TRANSPORT_PREFIX+key,value);return win.localStorage.getItem(TRANSPORT_PREFIX+key)===value;}catch(_){return false;}}
    async function withTransportLock(task,controller,epoch) {
        // Only PerfilWiki instances from this browser origin share this lock.
        // Account, timezone and optional thumbnail entry points use the same name.
        var timingAvailable=transportSet('timing-available','1');
        if(win.navigator&&win.navigator.locks&&typeof win.navigator.locks.request==='function') {
            return win.navigator.locks.request(TRANSPORT_LOCK,{signal:controller.signal},async function(){
                checkLifecycle(epoch);
                try{return await task();}
                finally {
                    // With storage blocked, retain the timing boundary by holding
                    // this origin's lock. The page can still collect in memory.
                    if(!timingAvailable&&!suspended&&epoch===lifecycle) {
                        var until=Math.max(nextRequestAt,nextActionRequestAt);
                        Object.keys(pauses).forEach(function(origin){until=Math.max(until,pauses[origin]);});
                        if(until>Date.now()) {
                            var cooldown=new AbortController();controllers.add(cooldown);
                            try{await waitForRequest(until-Date.now(),cooldown,epoch);}
                            finally{controllers.delete(cooldown);}
                        }
                    }
                }
            });
        }
        // Browsers without Web Locks use a short verified storage claim. If the
        // claim is unavailable or lost, keep the displayed data and do not fetch.
        if(!timingAvailable)throw new Error('Consulta pausada.');
        var key='bloqueio',now=Date.now(),lease;
        try{lease=JSON.parse(transportGet(key)||'null');}catch(_){lease=null;}
        if(lease&&Number.isFinite(lease.expires)&&lease.expires>now&&lease.expires<=now+180000)throw new Error('Consulta pausada.');
        var token=now+'-'+Math.random().toString(36).slice(2),heartbeat;
        function owns(){try{return JSON.parse(transportGet(key)||'null').token===token;}catch(_){return false;}}
        function release(){if(heartbeat)win.clearInterval(heartbeat);if(owns())transportSet(key,JSON.stringify({token:token,expires:0}));}
        if(!transportSet(key,JSON.stringify({token:token,expires:now+120000})))throw new Error('Consulta pausada.');
        try {
            await waitForRequest(50,controller,epoch);checkLifecycle(epoch);
            if(!owns())throw new Error('Consulta pausada.');
            heartbeat=win.setInterval(function(){if(owns())transportSet(key,JSON.stringify({token:token,expires:Date.now()+120000}));},30000);
            return await task();
        }finally{release();}
    }
    async function requestJson(url, requestEpoch) {
        var epoch = requestEpoch === undefined ? lifecycle : requestEpoch;
        checkLifecycle(epoch);
        if (!requestAllowed(url)) { throw new Error('A consulta não pertence às fontes públicas do painel.'); }
        if (active >= 1) { await new Promise(function (resolve) { waiters.push(resolve); }); } else { active += 1; }
        var controller = new AbortController(); controllers.add(controller);
        async function dispatch() {
            var timeout, requestStartedAt=null, actionApi=new URL(url).pathname==='/w/api.php';
            try {
                checkLifecycle(epoch);
            var origin = new URL(url).origin;
            if (servicePause(origin) > Date.now()) { throw new Error('O serviço pediu uma pausa nas consultas.'); }
            var sharedStart=Number(transportGet('next-start-v1'))||0;
            if(Number.isFinite(sharedStart)&&sharedStart<=Date.now()+65000)nextRequestAt=Math.max(nextRequestAt,sharedStart);
            var wait = Math.max(0, nextRequestAt - Date.now(), actionApi ? actionDeadline() - Date.now() : 0);
            await waitForRequest(wait,controller,epoch);
            checkLifecycle(epoch);
            if (servicePause(origin) > Date.now()) { throw new Error('Consulta pausada.'); }
            timeout = win.setTimeout(function () { controller.abort(); }, 20000);
            var requestOptions={ method:'GET',credentials:'omit',cache:'no-store',redirect:'error',referrerPolicy:'no-referrer',signal:controller.signal };
            if (actionApi) { requestOptions.headers = {'Api-User-Agent':API_USER_AGENT}; }
            requestStartedAt = Date.now(); nextRequestAt = requestStartedAt + 500; transportSet('next-start-v1',String(nextRequestAt));
            var response = await win.fetch(url,requestOptions);
            checkLifecycle(epoch);
            if (response.redirected || response.type === 'opaqueredirect' || response.type === 'opaque' || response.url && canonicalRequest(response.url) !== canonicalRequest(url)) { throw new Error('A consulta pública foi redirecionada.'); }
            if (!response.ok) {
                if (response.status === 429 || response.status === 503) {
                    servicePause(origin, retryDeadline(response, REFRESH));
                }
                var httpError = new Error('HTTP ' + response.status); httpError.code = response.status;
                if (response.status === 404) {
                    httpError.status = 404;
                    var requestUrl = new URL(url);
                    if (requestUrl.origin === 'https://wikimedia.org' && requestUrl.pathname.indexOf('/api/rest_v1/metrics/pageviews/per-article/pt.wikipedia.org/all-access/user/') === 0) {
                        httpError.requestUrl = url;
                        try { httpError.problem = JSON.parse(await responseText(response,JSON_RESPONSE_LIMIT,epoch)); } catch (_) { /* A proxy response is not analytics evidence. */ }
                    }
                }
                throw httpError;
            }
            if (url === BLACKLIST_URL) {
                var sourceText = await responseText(response,BLACKLIST_RESPONSE_LIMIT,epoch);
                checkLifecycle(epoch);
                if (sourceText.length > 256000) { throw new Error('A lista de exclusões excede o tamanho esperado.'); }
                var excludedTitles = [];
                sourceText.split(/\r?\n/).forEach(function (line) {
                    if (!line.trim()) { return; }
                    var fields = line.split('\t');
                    if (fields.length !== 2 || !/^[a-z0-9._-]+$/.test(fields[0]) || !fields[1].trim()) { throw new Error('Lista de exclusões inválida.'); }
                    if (fields[0] === 'pt.wikipedia' || fields[0] === 'pt.wikipedia.org') { excludedTitles.push(fields[1].replace(/ /g, '_')); }
                });
                return { project: 'pt.wikipedia.org', source: BLACKLIST_URL, snapshotAt: queryAnchor || new Date().toISOString(), excludedTitles: excludedTitles };
            }
            var data = JSON.parse(await responseText(response,JSON_RESPONSE_LIMIT,epoch));
            checkLifecycle(epoch);
            if (!data || typeof data !== 'object' || Array.isArray(data)) { throw new Error('Resposta pública inválida.'); }
            if (data.error || data.warnings && Object.keys(data.warnings).length) {
                if (data.error && ['maxlag','ratelimited','rate-limited','readonly'].indexOf(data.error.code) >= 0) { servicePause(origin,retryDeadline(response,REFRESH)); }
                var failure = new Error('Consulta pública incompleta.');
                failure.code = data.error && data.error.code || 'api-warning';
                failure.detail = JSON.stringify(data.error || data.warnings);
                throw failure;
            }
            return data;
            } catch (error) {
                // Refusing a response also stops any unread response body.
                controller.abort();throw error;
            } finally {
                if(actionApi&&requestStartedAt!==null&&Date.now()-requestStartedAt>1000){nextActionRequestAt=Math.max(nextActionRequestAt,Date.now()+5000);transportSet('action-next-v1',String(nextActionRequestAt));}
                if(timeout)win.clearTimeout(timeout);
            }
        }
        try {return await withTransportLock(dispatch,controller,epoch);}
        finally {
            controllers.delete(controller);
            if(waiters.length){waiters.shift()();}else{active-=1;}
        }
    }
    function notify(message, type) { if (mw.notify) { mw.notify(win.PerfilWikiI18n ? win.PerfilWikiI18n.t(appearance.language,message) : message, { tag: 'dan-pu-ritmo', type: type || 'info' }); } }
    function schedule(delay) {
        win.clearTimeout(timer);
        if (!suspended) {
            var wait=delay===undefined?REFRESH:delay;
            if(appearance.coverSource==='daily'&&dailyCoverApi){var instant=new Date(Date.now()),boundary=Date.UTC(instant.getUTCFullYear(),instant.getUTCMonth(),instant.getUTCDate()+1)-Date.now()+50;wait=Math.min(wait,Math.max(50,boundary));}
            timer = win.setTimeout(function () { refresh(false); },wait);
        }
    }
    async function withLease(task) {
        var now = Date.now(), lease;
        var epoch = lifecycle;
        try { lease = JSON.parse(storageGet('bloqueio') || 'null'); } catch (_) { lease = null; }
        if (lease && lease.expires > now) { return false; }
        var token = now + '-' + Math.random().toString(36).slice(2);
        storageSet('bloqueio', JSON.stringify({ token: token, expires: now + 120000 }));
        function owns() {
            if (suspended || epoch !== lifecycle) { return false; }
            var raw = storageGet('bloqueio');
            if (raw === null) { return !suspended; }
            try { return !suspended && JSON.parse(raw).token === token; } catch (_) { return false; }
        }
        if (!owns()) { return false; }
        var heartbeat = win.setInterval(function () {
            if (owns()) { storageSet('bloqueio', JSON.stringify({ token: token, expires: Date.now() + 120000 })); }
        }, 30000);
        function release() {
            win.clearInterval(heartbeat);
            try {
                var finalLease = JSON.parse(storageGet('bloqueio') || 'null');
                if (finalLease && finalLease.token === token) { storageSet('bloqueio', JSON.stringify({ token: token, expires: 0 })); }
            } catch (_) { /* Its deadline still releases an unreadable lease. */ }
        }
        releaseActiveLease = release;
        try { await task(owns); return true; }
        finally { release(); if (releaseActiveLease === release) { releaseActiveLease = null; } }
    }
    async function refresh(manual, priority) {
        if (!started || running || suspended || !hasPanel()) { return; }
        var epoch = lifecycle;
        await restoreLargeCache();
        if (!started || running || suspended || epoch !== lifecycle || !hasPanel()) { return; }
        applyLocalCache(readCache());
        var storedDeadline = Number(storageGet('proxima-consulta')) || 0;
        if (!Number.isFinite(storedDeadline) || storedDeadline > Date.now() + REFRESH + 60000) { storedDeadline = 0; }
        if (!Number.isFinite(nextCheck) || nextCheck > Date.now() + REFRESH + 60000) { nextCheck = 0; }
        var deadline = Math.max(nextCheck, storedDeadline),metricsDue=manual||priority||deadline<=Date.now(),coverDue=dailyCoverDue();
        if (!metricsDue&&!coverDue && deadline < Date.now() + REFRESH + 60000) { schedule(Math.max(1000, deadline - Date.now())); return; }
        if (!manual && win.document.hidden) { schedule(); return; }
        running = true;
        if (metricsDue) { if (imageCycleStarted) { imageRequests = 0; } else { imageCycleStarted = true; } }
        async function collect(owns) {
            // The optional cover shares the transport and account lease, but never the statistics identity.
            var coverTask=coverDue?collectDailyCover(epoch):Promise.resolve(false);
            if(!metricsDue){await coverTask;return;}
            try {
            if (manual) { notify('Consultando as estatísticas…'); }
            var config = Object.assign({}, configured);
            if (manual) { config.activityRefreshMs = 0; }
            queryAnchor = new Date().toISOString(); sharedRequests.clear();
            var requestedPeriod = activePeriod; priorityChanged = false;
            var firstProgress = true;
            var next = await core.update({ requestJson: function (url) { checkLifecycle(epoch); return sharedRequestJson(url, epoch); }, previous: current, config: config, now: queryAnchor, activePeriod: requestedPeriod, maxRequests: coverDue?39:40,
                customRange:appearance.customRange,
                includeUserGroups: appearance.showUserGroups && ['top','activity','cards'].some(function(scope){return win.PerfilWikiAppearance.fieldIn(appearance,scope,'userGroups');}),
                includeThanksSent: appearance.showCards && appearance.metrics.indexOf('thanksSent') >= 0,
                includeEarliestRegistration: appearance.showCards && appearance.metrics.indexOf('tenure') >= 0 || appearance.showAccountCreated && (win.PerfilWikiAppearance.fieldIn(appearance, 'cards', 'accountCreated') || win.PerfilWikiAppearance.fieldIn(appearance, 'activity', 'accountCreated') || win.PerfilWikiAppearance.fieldIn(appearance, 'top', 'accountCreated')),
                retryUnavailableSeries: !!manual, retryUnavailableAggregates: !!manual, forceStatistics: !!manual,
                onProgress: function (partial) {
                    if (!owns() || suspended || !core.validateState(partial).valid) { return; }
                    currentCheckpoint = current && current.capturedAt === partial.capturedAt ? Math.max(currentCheckpoint,checkpointNumber(partial)) : checkpointNumber(partial);
                    current = partial; hasAdvancedCurrent = true; paint(current);
                    saveCache(current,firstProgress); firstProgress = false;
                }
            });
            next.config = Object.assign({}, configured);
            if (!owns()) { return; }
            if (!core.validateState(next).valid) { throw new Error('Os dados novos não passaram pela conferência.'); }
            currentCheckpoint = current && current.capturedAt === next.capturedAt ? Math.max(currentCheckpoint,checkpointNumber(next)) : checkpointNumber(next);
            current = next; hasAdvancedCurrent = true;
            paint(current);
            await saveCache(current,true);
            if (manual) {
                if (next.pageviews && !next.pageviews.allPeriodsComplete && !next.pageviews.error) {
                    notify('Calculando as visualizações de todos os artigos editados por você. O painel acompanha a consulta.');
                } else { notify(next.fresh ? 'Painel atualizado nesta tela.' : 'Os dados disponíveis foram atualizados. As consultas incompletas mantiveram seus últimos resultados.', next.fresh ? 'success' : 'warn'); }
            }
            } finally {await coverTask;}
        }
        try {
            var complete;
            if (win.navigator.locks && win.navigator.locks.request) {
                complete = await win.navigator.locks.request(PREFIX + 'consulta', { ifAvailable: true }, function (lock) { return lock ? withLease(collect) : false; });
            } else { complete = await withLease(collect); }
            if (!complete && manual) { notify('Outra aba já está consultando o painel.'); }
        } catch (error) {
            win.console.warn('Atividade na Wikipédia: os dados anteriores foram mantidos.', error);
            if (manual) { notify('Não foi possível concluir a consulta. O painel anterior foi mantido.', 'warn'); }
        } finally {
            running = false;
            if (!suspended && epoch !== lifecycle) { schedule(1500); }
            else if (!suspended&&!metricsDue) {schedule(Math.max(1000,deadline-Date.now()));}
            else if (!suspended) {
                var views = current && current.pageviews;
                var customPending=appearance.customRange&&views&&(!views.periods.custom||JSON.stringify(views.customRange)!==JSON.stringify(appearance.customRange)||!views.periods.custom.complete);
                var continuing = views && !views.allPeriodsComplete && views.progress && views.progress.pending > 0 && !views.error || customPending&&views.customProgress&&views.customProgress.resumable || current && (current.history && current.history.pending && !current.history.error || current.statistics && current.statistics.pending && !current.statistics.errors.length);
                var delay = priorityChanged && views && (!views.allPeriodsComplete||customPending) ? 0 : (continuing ? 15000 : REFRESH);
                nextCheck = Date.now() + delay;
                storageSet('proxima-consulta', String(nextCheck)); schedule(delay);
            }
        }
    }
    function currentChoices() {
        var page=String(mw.config.get('wgTitle')||configured.user).replace(/_/g,' '),prefix=configured.user+'/';
        var subpage=page.indexOf(prefix)===0?page.slice(prefix.length):'';
        return {version:'1.20.0',user:configured.user,displayName:profileOptions.displayName,location:profileOptions.location,
            photo:profileOptions.photo,coverImage:profileOptions.coverImage,customFields:profileOptions.customFields,
            timeZone:configured.timeZone,destination:subpage?'subpage':'main',subpage:subpage||'PU',appearance:appearance};
    }
    var editingSession=null;
    function ensureEditButton(){
        if(!win.PerfilWikiLiveEdit||win.document.getElementById('perfilwiki-edit-panel'))return;
        var anchor=win.document.getElementById('dan-pu-profile-header')||win.document.getElementById('dan-pu-ritmo')||win.document.getElementById('dan-pu-estatisticas');
        if(!anchor||!anchor.parentNode||typeof anchor.parentNode.insertBefore!=='function')return;
        var button=win.document.createElement('button');button.id='perfilwiki-edit-panel';button.type='button';
        button.textContent=win.PerfilWikiI18n?win.PerfilWikiI18n.t(appearance.language,'Editar painel'):'Editar painel';
        button.title=win.PerfilWikiI18n?win.PerfilWikiI18n.t(appearance.language,'Abre o instalador no GitHub Pages com as escolhas deste painel.'):'Abre o instalador no GitHub Pages com as escolhas deste painel.';
        button.style.cssText='display:block;margin:12px 0;padding:6px 12px;cursor:pointer;';
        button.addEventListener('click',editPanel);anchor.parentNode.insertBefore(button,anchor);
    }
    function editPanel() {
        var api=win.PerfilWikiLiveEdit;
        if(!api||editingSession||!win.crypto||typeof win.crypto.getRandomValues!=='function'||typeof win.open!=='function') { notify('Não foi possível abrir o editor do painel.', 'warn');return; }
        var nonceBytes=new Uint8Array(16);win.crypto.getRandomValues(nonceBytes);
        var nonce=Array.from(nonceBytes,function(value){return value.toString(16).padStart(2,'0');}).join('');
        var popup;
        try {
            // Detach the opener while this blank document is still same-origin.
            // Retain only our WindowProxy for the exact-origin data handoff.
            popup=win.open('about:blank','_blank');
            if(!popup)throw new Error('blocked');
            popup.opener=null;
            popup.document.write('<!doctype html><html><head><meta name="referrer" content="no-referrer"><title>PerfilWiki</title></head><body></body></html>');
            popup.document.close();
        }catch(_){notify('Permita a abertura de uma nova aba para editar o painel.','warn');return;}
        var epoch=lifecycle,choices=currentChoices(),title='Usuário:'+configured.user+(choices.destination==='subpage'?'/'+choices.subpage:'');
        var ready=false,payload=null,sent=false,interval,timeout,done=false;
        function cleanup(){if(done)return;done=true;win.removeEventListener('message',receive);win.clearInterval(interval);win.clearTimeout(timeout);editingSession=null;}
        function fail(){if(done)return;cleanup();notify('O instalador não respondeu. Mantenha esta página aberta e tente "Editar painel" novamente.','warn');}
        function send(){if(done||!ready||!payload||sent)return;try{popup.postMessage(payload,api.installerOrigin);sent=true;}catch(_){fail();}}
        function receive(event){
            if(done||event.origin!==api.installerOrigin||event.source!==popup)return;
            if(api.isSignal(event.data,'ready',nonce)){ready=true;send();}
            else if(sent&&api.isSignal(event.data,'accepted',nonce)){cleanup();}
        }
        editingSession={cancel:cleanup};win.addEventListener('message',receive);
        interval=win.setInterval(function(){if(done)return;if(popup.closed){cleanup();return;}try{popup.postMessage(api.signal('hello',nonce),api.installerOrigin);}catch(_){fail();}},500);
        timeout=win.setTimeout(fail,api.limits.lifetimeMs);
        try{popup.location.replace(api.installerUrl(nonce));}catch(_){fail();return;}
        // Only this explicit click requests the public page text. It uses the
        // same anonymous queue, service pauses, redirect guard and size limits.
        function readPublicPage(pageTitle){
            var url=new URL('https://pt.wikipedia.org/w/api.php');
            url.searchParams.set('action','query');url.searchParams.set('format','json');url.searchParams.set('formatversion','2');url.searchParams.set('maxlag','5');
            url.searchParams.set('prop','revisions');url.searchParams.set('rvslots','main');url.searchParams.set('rvprop','ids|content');url.searchParams.set('rvlimit','1');url.searchParams.set('titles',pageTitle);
            return requestJson(url.href,epoch).then(function(data){
                var pages=data.query&&data.query.pages,entry=Array.isArray(pages)&&pages.length===1?pages[0]:null,revision=entry&&entry.revisions&&entry.revisions.length===1?entry.revisions[0]:null;
                var content=revision&&revision.slots&&revision.slots.main&&revision.slots.main.content;
                return api.page({title:entry&&entry.title,revisionId:revision&&revision.revid,content:content},pageTitle);
            });
        }
        readPublicPage(title).then(async function(publicPage){
            if(done)return;
            // A main user page may transclude its sole panel from {{/PU}}.
            // Follow at most one unambiguous simple own subpage, and accept it
            // only if its public source actually contains the panel.
            var relative=choices.destination==='main'?api.relativeSource(publicPage.content):null;
            if(relative){
                try{var candidate=await readPublicPage(title+'/'+relative);if(api.containsPanel(candidate.content)){publicPage=candidate;choices.destination='subpage';choices.subpage=relative;}}
                catch(_){/* Preserve the main-page draft and require manual placement. */}
            }
            if(done)return;
            payload=api.envelope(choices,publicPage,nonce,Date.now());send();
        }).catch(function(){
            if(done)return;
            try{payload=api.envelope(choices,null,nonce,Date.now());send();}catch(_){fail();}
        });
    }
    function downloadChoices() {
        var choices=currentChoices();
        // Personal wikitext belongs to the page, not to the statistics cache or
        // these appearance settings. Downloading settings never reads or saves it.
        var blob=new Blob([JSON.stringify(choices,null,2)+'\n'],{type:'application/json;charset=utf-8'}),url=URL.createObjectURL(blob);
        var link=win.document.createElement('a');link.href=url;link.download='PerfilWiki_escolhas.json';link.click();
        win.setTimeout(function(){URL.revokeObjectURL(url);},1000);
    }
    function managedExport(markup){
        var group=appearance.layout!=='separate',user=configured.user.replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
        return '<!-- PERFILWIKI-PROFILE-BEGIN -->\n'+(group?'<div data-perfilwiki-group="true" data-perfilwiki-user="'+user+'">\n':'')+markup+(group?'\n</div>':'')+'\n<!-- PERFILWIKI-PROFILE-END -->';
    }
    function download() {
        if (!current || !current.activity.complete) { notify('Aguarde a primeira consulta completa.', 'warn'); return; }
        if (!appearance.showActivity) { notify('O painel de atividade está desativado nas suas opções.', 'warn'); return; }
        var presentation = {user:configured.user, timeZone:configured.timeZone, now:Date.now(), images:images, displayName:profileOptions.displayName, location:profileOptions.location, photo:profileOptions.photo,coverImage:profileOptions.coverImage,dailyCover:dailyCover, customFields:profileOptions.customFields, stylesPage:profileOptions.stylesPage, documentationPage:profileOptions.documentationPage, appearance:appearance, savedAccountCreated:retainedAccountCreated()};
        var markup = view.wikitext(current, presentation);
        var header = win.PerfilWikiProfileHeaderView ? win.PerfilWikiProfileHeaderView.wikitext(current, presentation) : '';
        if (appearance.layout === 'integrated' && appearance.showCards && win.PerfilWikiLayoutView && win.PerfilWikiCardsView) {
            markup = win.PerfilWikiLayoutView.compose(win.PerfilWikiCardsView.wikitext(current.statistics, current.activity, presentation), markup, appearance, header);
        } else if (!appearance.showCards || appearance.blockOrder === 'activity-first') { markup = header + markup; }
        if(!appearance.showCards||appearance.layout==='integrated'&&win.PerfilWikiLayoutView&&win.PerfilWikiCardsView){markup=managedExport(markup);}
        else {markup='<!-- Trecho de atividade. Substitua somente a atividade, preservando as marcas externas PERFILWIKI-PROFILE e os outros blocos. -->\n'+markup;}
        var blob = new Blob([markup + '\n'], { type: 'text/plain;charset=utf-8' });
        var url = URL.createObjectURL(blob);
        var link = win.document.createElement('a'); link.href = url; link.download = 'PerfilWiki_atividade.wiki';
        link.click(); win.setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    }
    function downloadCards() {
        if (!current || !current.statistics) { notify('Aguarde a primeira consulta dos contadores.', 'warn'); return; }
        if (!appearance.showCards) { notify('Os contadores estão desativados nas suas opções.', 'warn'); return; }
        var markup = '<templatestyles src="' + profileOptions.stylesPage.replace(/&/g, '&amp;').replace(/"/g, '&quot;') + '" />' +
            win.PerfilWikiCardsView.wikitext(current.statistics, current.activity, {user: configured.user,timeZone:configured.timeZone,displayName:profileOptions.displayName,location:profileOptions.location,photo:profileOptions.photo,coverImage:profileOptions.coverImage,dailyCover:dailyCover,customFields:profileOptions.customFields,now: Date.now(), appearance:appearance, documentationPage:profileOptions.documentationPage,savedAccountCreated:retainedAccountCreated()});
        if (win.PerfilWikiProfileHeaderView && (!appearance.showActivity || appearance.layout !== 'integrated' && appearance.blockOrder === 'cards-first')) {
            markup = win.PerfilWikiProfileHeaderView.wikitext(current,headerPresentation()) + markup;
        }
        if(!appearance.showActivity){markup=managedExport(markup);}
        else {markup='<!-- Trecho de contadores. Substitua somente os contadores, preservando as marcas externas PERFILWIKI-PROFILE e os outros blocos. -->\n'+markup;}
        var url = URL.createObjectURL(new Blob([markup + '\n'], {type:'text/plain;charset=utf-8'}));
        var link = win.document.createElement('a'); link.href = url; link.download = 'PerfilWiki_contadores.wiki'; link.click();
        win.setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    }
    function hasPanel() { return !!(win.document.getElementById('dan-pu-ritmo') || win.document.getElementById('dan-pu-estatisticas')); }
    function begin() {
        if (started || !hasPanel()) { return; }
        started = true; readImages(); current = readCache(); appliedLocalRevision = localRevision;
        if (current) { lastCommittedAnchor = Date.parse(current.capturedAt); currentCheckpoint = checkpointNumber(current); }
        var copiedHeader=win.document.getElementById('dan-pu-profile-header');
        if(copiedHeader&&copiedHeader.getAttribute('data-perfilwiki-profile-top')==='true'&&copiedHeader.getAttribute('data-perfilwiki-user')!==configured.user&&copiedHeader.parentNode){copiedHeader.parentNode.removeChild(copiedHeader);}
        readDailyCover();
        var startupCreated=retainedAccountCreated();
        var cards = win.document.getElementById('dan-pu-estatisticas');
        if (cards && !win.document.getElementById('perfilwiki-anos')) {
            var tenure = cards.querySelector('.dan-pu-stat-tenure .dan-pu-stat-value');
            if (tenure) { var tenureValue = win.document.createElement('span'); tenureValue.id = 'perfilwiki-anos'; tenureValue.append.apply(tenureValue, Array.from(tenure.childNodes)); tenure.appendChild(tenureValue); }
        }
        if (cards && cards.getAttribute('data-perfilwiki-user') !== configured.user) {
            ['dan-pu-edicoes','dan-pu-agradecimentos','dan-pu-artigos','dan-pu-editados','dan-pu-criados-tecnicos','dan-pu-reversoes','dan-pu-ritmo-melhor-sequencia','perfilwiki-anos',
                'dan-pu-artigo-mais-editado','dan-pu-bytes-acrescentados','dan-pu-bytes-removidos','dan-pu-dias-com-edicoes','dan-pu-edicoes-em-artigos','dan-pu-edicoes-em-discussoes','dan-pu-meses-com-edicoes','dan-pu-dia-com-mais-edicoes','dan-pu-edicoes-30-dias','dan-pu-media-por-dia-ativo','dan-pu-anos-com-edicoes','dan-pu-mes-com-mais-edicoes','dan-pu-agradecimentos-enviados','dan-pu-media-bytes-por-edicao','dan-pu-maior-acrescimo','dan-pu-maior-remocao'].forEach(function (id) {
                var number = win.document.getElementById(id);
                if (number) {
                    number.textContent = 'Aguardando dados';
                    number.removeAttribute('title');
                    number.removeAttribute('data-perfilwiki-most-edited');
                    number.removeAttribute('data-perfilwiki-busiest-day');
                    number.removeAttribute('data-perfilwiki-busiest-month');
                }
            });
            cards.setAttribute('data-perfilwiki-user', configured.user);
        }
        if (win.PerfilWikiCardsView) { win.PerfilWikiCardsView.paint(win.document, current && current.statistics, current && current.activity, Date.now(), appearance, {user:configured.user,timeZone:configured.timeZone,displayName:profileOptions.displayName,location:profileOptions.location,photo:profileOptions.photo,coverImage:profileOptions.coverImage,dailyCover:dailyCover,customFields:profileOptions.customFields,appearance:appearance,now:Date.now(),documentationPage:profileOptions.documentationPage}); }
        applyBlockOrder();
        var activityRoot = win.document.getElementById('dan-pu-ritmo');
        if (activityRoot) { activityRoot.style.display = appearance.showActivity ? '' : 'none'; }

        if (current) { paint(current); }
        else {
            var target = win.document.getElementById('dan-pu-ritmo');
            if (target && target.getAttribute('data-perfilwiki-user') !== configured.user) {
                detachNestedCards(target);
                target.textContent = 'Consultando a atividade de ' + configured.user + '.';
                target.setAttribute('data-perfilwiki-user', configured.user);
                target.setAttribute('data-perfilwiki-project', configured.project);
            }
            var readership = target && target.querySelector('.dan-pu-readership');
            if (readership && !currentMetricReadership(readership)) {
                var pending = win.document.createElement('div');
                pending.textContent = 'Consultando visualizações após sua primeira edição em cada artigo.';
                readership.replaceChildren(pending);
            }
            if (view.paintProfile) { view.paintProfile(win.document, null, {user:configured.user, timeZone:configured.timeZone, displayName:profileOptions.displayName, location:profileOptions.location, photo:profileOptions.photo,coverImage:profileOptions.coverImage,dailyCover:dailyCover, customFields:profileOptions.customFields, appearance:appearance, now:Date.now(), savedAccountCreated:startupCreated}); }
            bindControls(); applyPeriodVisibility(); enhancePresentation();
        }
        paintHeader(current,startupCreated); patchProfilePhotos(); synchronizeActivityFooter();ensureEditButton();
        restoreLargeCache();
        mw.loader.using(['mediawiki.util']).then(function () {
            var refreshLink = mw.util.addPortletLink('p-tb', '#', 'Atualizar estatísticas', 't-perfilwiki-refresh');
            var downloadLink = appearance.showActivity && mw.util.addPortletLink('p-tb', '#', 'Baixar painel atualizado', 't-perfilwiki-download');
            var cardsLink = appearance.showCards && mw.util.addPortletLink('p-tb', '#', 'Baixar contadores atualizados', 't-perfilwiki-cards');
            var choicesLink = mw.util.addPortletLink('p-tb', '#', 'Baixar minhas escolhas', 't-perfilwiki-choices');
            var editLink = win.PerfilWikiLiveEdit && mw.util.addPortletLink('p-tb','#',win.PerfilWikiI18n?win.PerfilWikiI18n.t(appearance.language,'Editar painel'):'Editar painel','t-perfilwiki-edit');
            if (editLink) { editLink.addEventListener('click',function(event){event.preventDefault();editPanel();}); }
            if (choicesLink) { choicesLink.addEventListener('click', function (event) { event.preventDefault(); downloadChoices(); }); }
            if (cardsLink) { cardsLink.addEventListener('click', function (event) { event.preventDefault(); downloadCards(); }); }
            if (refreshLink) { refreshLink.addEventListener('click', function (event) { event.preventDefault(); refresh(true); }); }
            if (downloadLink) { downloadLink.addEventListener('click', function (event) { event.preventDefault(); download(); }); }
            schedule(1500);
        });
    }
    win.PerfilWiki = Object.freeze({ version: '1.20.0', readOnly: true, refreshInterval: REFRESH,
        refresh: function () { return refresh(true); }, download: download, downloadActivity: download, downloadCards: downloadCards,downloadChoices:downloadChoices,editPanel:editPanel,
        getState: function () { return current ? JSON.parse(JSON.stringify(current)) : null; },
        getAppearance: function () { return JSON.parse(JSON.stringify(appearance)); } });
    // Compatibility sentinels stop old loaders from starting a second scheduler.
    win.DanPURitmo = win.PerfilWiki; win.DanPUStats = win.PerfilWiki;
    win.addEventListener('storage', function (event) {
        if(event.key===PREFIX+'daily-cover-v1'&&appearance.coverSource==='daily'){var previousCover=dailyCover;readDailyCover();if(dailyCover!==previousCover){paintHeader(current);patchProfilePhotos();}}
        if (event.key === PREFIX + 'cache') { applyLocalCache(readCache()); }
    });
    win.addEventListener('focus', function () { refresh(false); startClock(); queueImages(); });
    win.addEventListener('hashchange', function () { choosePeriod(periodFromHash() || appearance.initialPeriod); });
    win.document.addEventListener('visibilitychange', function () {
        if (!win.document.hidden) { refresh(false); startClock(); queueImages(); }
        else { win.clearTimeout(clockTimer); win.clearTimeout(imageTimer); }
    });
    win.addEventListener('pagehide', function () {
        if(editingSession){editingSession.cancel();}
        suspended = true; lifecycle += 1; win.clearTimeout(timer); win.clearTimeout(clockTimer); win.clearTimeout(imageTimer);
        controllers.forEach(function (controller) { controller.abort(); });
        if (releaseActiveLease) { releaseActiveLease(); }
    });
    win.addEventListener('pageshow', function () { if (suspended) { suspended = false; cacheRestore = null; restoreLargeCache(); schedule(1500); startClock(); queueImages(); } });
    if (mw.hook) { mw.hook('wikipage.content').add(begin); }
    if (win.document.readyState === 'loading') { win.document.addEventListener('DOMContentLoaded', begin, { once: true }); }
    else { begin(); }
}(window));
