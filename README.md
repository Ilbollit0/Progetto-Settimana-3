📺 AnimeBox
AnimeBox è una web app per gestire una collezione di anime e cartoni animati degli anni '70, '80 e '90: Mazinga Z, Goldrake, Jeeg Robot, Lupin III, Lady Oscar, Mila e Shiro, I Cavalieri dello Zodiaco, Sailor Moon e tanti altri.

Per ogni serie si può segnare se l'hai già vista o se è ancora da vedere, darle un voto, cercarla, filtrarla, ordinarla e vedere le statistiche della collezione.

È il progetto del venerdì: riprende il concetto della to-do list (una lista di elementi da gestire) e mette insieme tutto quello che abbiamo visto in queste tre settimane: HTML semantico, CSS, JavaScript moderno (ES6+), DOM, eventi, validazione e localStorage.

Requisiti del progetto: cosa è stato fatto
Obbligatori
Requisito	Fatto	Dove
Struttura come da slide 5 (header, form, controlli, lista, footer)	✅	index.html
Tema chiaro/scuro	✅	bottone 🌙 nell'header, body.dark in style.css
Hover su tutti i button e i link	✅	.btn:hover, .btn-primario:hover, .btn-tema:hover, a:hover
Ricerca live con l'evento input	✅	listener input su #ricerca
Costruzione della griglia di elementi	✅	render() crea card, righe o tabella
Form di inserimento con validazione	✅	campi obbligatori, anno tra 1960 e l'anno corrente, titolo non duplicato
ID univoco con Date.now()	✅	id: Date.now() quando il form crea l'oggetto
Interazioni base (slide 10): aggiungi, elimina, modifica in-place, conteggio dinamico	✅	push, filter per id, ✏️ con Invio/blur, "Totale: N · Viste: N di M" sopra la lista
Almeno due indicatori visivi (slide 14)	✅	contatori grandi, barra viste/da vedere, barre per categoria
Extra
Requisito	Fatto	Dove
Filtro con la sua variabile	✅	filtro (viste / da vedere) e filtroCategoria
Feedback all'utente (slide 12)	✅	notifica(testo, tipo): verde per successo, rosso per errore, sparisce dopo 3 secondi
Raggruppamento (slide 16)	✅	reduce per categoria + un <h3> per gruppo
Super extra
Requisito	Fatto	Dove
Ordinamento	✅	variabile ordine + sort dentro render()
Spostamento elementi (slide 13)	✅	bottoni ↑ ↓ con event delegation
Visualizzazioni multiple (slide 15)	✅	variabile vista: Lista / Card / Tabella
Come avviarlo
Apri la cartella del progetto in VS Code.
Tasto destro su index.html → Open with Live Server.
La prima volta compaiono 14 serie di esempio. Da lì in poi i dati restano salvati nel browser.
Per ripartire dai dati di esempio: apri la console del browser (F12) e scrivi localStorage.clear(), poi ricarica la pagina.

Struttura dei file
anime-box/
├── index.html   → struttura della pagina (5 sezioni)
├── style.css    → tutto lo stile, tema chiaro e scuro
├── script.js    → stato, render() ed eventi
└── README.md    → questo file
Le sezioni della pagina (index.html)
Sezione	Cosa contiene
Header	Titolo dell'app, sottotitolo e bottone per cambiare tema (🌙 / ☀️)
Form di inserimento	Titolo*, protagonista*, anno*, categoria* (<select>), voto* (<select>), checkbox "serie già vista", bottone Aggiungi e <p id="errore">
Controlli	Ricerca live (<input type="search">), filtro visto / da vedere, filtro per categoria, ordinamento
Statistiche	Contatori grandi e barre orizzontali
Lista	Bottoni Lista / Card / Tabella, il conteggio dinamico #conteggio e il contenitore #lista, vuoto nell'HTML perché lo riempie render()
Footer	Crediti e link "Torna su"
In fondo alla pagina c'è anche <div id="notifica">, nascosto, per i messaggi temporanei.

Tutti gli elementi che il JavaScript cerca con getElementById esistono davvero nell'HTML (nel progetto precedente mancava il container).

Come funziona: Stato → render() → Eventi
L'app segue un unico schema:

   EVENTO (click, input, change, submit)
        │
        ▼
   modifica lo STATO (l'array anime + poche variabili)
        │
        ▼
   render()  →  ridisegna la pagina leggendo lo stato
Gli eventi non toccano mai il DOM direttamente: cambiano solo lo stato e poi chiamano render(). In questo modo la pagina mostra sempre quello che c'è nello stato, e c'è una sola fonte di verità.

1. Lo stato
In cima a script.js ci sono poche variabili globali:

let anime = [...];             // l'array di oggetti: i dati veri
let ricerca = "";              // testo cercato
let filtro = "tutti";          // "tutti" | "visti" | "da-vedere"
let filtroCategoria = "tutte"; // "tutte" | "Robot" | "Shojo" | ...
let ordine = "manuale";        // come ordinare
let vista = "card";            // "lista" | "card" | "tabella"
let tema = "chiaro";           // "chiaro" | "scuro"
let idInModifica = null;       // quale serie si sta modificando
Ogni serie è un oggetto così:

{ id: 1, titolo: "Mazinga Z", protagonista: "Koji Kabuto",
  anno: 1972, categoria: "Robot", voto: 5, visto: true }
L'id univoco delle serie nuove si crea con Date.now(), cioè i millisecondi correnti.

2. La funzione render()
render() non ha parametri: legge sempre lo stato completo. A ogni chiamata fa i 5 passi visti a lezione:

Parte dall'array completo anime.
Filtra in memoria con filter: ricerca (includes + toLowerCase, quindi senza distinzione tra maiuscole e minuscole), visto / da vedere e categoria.
Ordina in memoria con sort, per anno, titolo (localeCompare) o voto. filter restituisce un array nuovo, quindi l'ordine dello stato non cambia.
Svuota il contenitore: lista.innerHTML = "".
Ricrea un elemento DOM per ogni serie, raggruppando per categoria.
Infine aggiorna le parti che dipendono dallo stato e salva nel localStorage. Queste parti sono:

il conteggio dinamico sopra la lista ("Mostrate: N · Totale: N · Viste: N di M");
le statistiche;
il bottone della vista attiva;
il tema.
3. Gli eventi
Evento	Dove	Cosa fa allo stato
submit	form	valida e fa push della nuova serie
click (delegation)	#lista	elimina, segna vista, modifica, sposta su/giù
keydown / focusout	#lista	conferma o annulla la modifica del titolo
input	ricerca	aggiorna ricerca
change	i tre <select>	aggiorna filtro, filtroCategoria, ordine
click	bottoni vista	aggiorna vista
click	bottone tema	alterna tema
Ogni listener finisce con render().

Scelte di scrittura del codice
Il codice usa solo costrutti di base, così ogni riga è facile da leggere e da spiegare:

if / else al posto dell'operatore ternario (? :) e dei valori di default con ||;
appendChild per aggiungere un elemento alla volta;
classList.add / classList.remove per le classi;
textContent invece di innerHTML per il testo scritto dall'utente (innerHTML = "" si usa solo per svuotare i contenitori).
Funzionalità nel dettaglio
Form con validazione
event.preventDefault() evita il ricaricamento della pagina.
I valori si leggono con .value.trim().
Controlli:
i campi obbligatori (*) non devono essere vuoti;
l'anno deve essere un numero (isNaN) tra 1960 e l'anno corrente;
la serie non deve essere già presente (confronto senza distinzione tra maiuscole e minuscole).
Se qualcosa non va, il messaggio compare in <p id="errore"> e la funzione si ferma con return.
Altrimenti: crea l'oggetto, fa push nello stato, form.reset(), render() e mostra una notifica verde.
Event delegation
I bottoni della lista vengono ricreati a ogni render(), quindi non ha senso mettere un listener su ciascuno. C'è un solo listener sul contenitore #lista: ogni bottone ha data-azione (elimina, visto, modifica, su, giu) e data-id. Il listener legge questi due valori da event.target.dataset e sa cosa fare e su quale serie.

Serie vista / da vedere
Il bottone "👁 Da vedere" / "✔ Vista" inverte serie.visto. Le serie viste hanno un bordo verde a sinistra in tutte e tre le viste.

Eliminare
anime = anime.filter(s => s.id !== id): si tiene tutto tranne la serie con quell'id.

Modifica in-place
Cliccando ✏️, idInModifica prende l'id della serie. Nel render() successivo, al posto del titolo di quella serie compare un <input>, che riceve subito il focus.

Invio o uscita dal campo (blur, intercettato con focusout che fa bubbling): il nuovo titolo viene salvato, se non è vuoto.
Esc: annulla la modifica.
Il controllo if (idInModifica === null) return; evita di salvare due volte quando dopo Invio arriva anche il blur.

Riordino ↑ ↓
Con "Ordine personale" ogni serie ha le frecce ↑ e ↓, che scambiano la serie con la precedente o la successiva della stessa categoria nell'array, perché la lista è raggruppata per categoria. Lo scambio usa una variabile temporanea. Il nuovo ordine resta salvato perché lo stato cambia e render() chiama salva(). Quando si sceglie un altro ordinamento le frecce spariscono, perché non avrebbero effetto visibile.

Ricerca, filtri, ordinamento
Ogni controllo salva la scelta in una variabile di stato e chiama render(). Il filtraggio e l'ordinamento avvengono solo dentro render(), mai nei listener.

Raggruppamento per categoria (reduce)
In render() un reduce trasforma l'array filtrato in un oggetto { Robot: [...], Shojo: [...], ... }. Poi si cicla sulle chiavi: per ogni categoria si disegna un <h3> con icona, nome e quantità, e sotto le sue serie.

Tre viste: Lista, Card, Tabella
La variabile vista dice a render() quale HTML produrre:

Lista: <ul> con una riga compatta per serie (titolo e dettagli a sinistra, stelle e azioni a destra);
Card: griglia CSS Grid con icona della categoria, titolo, dettagli, stelle e azioni;
Tabella: <table> con intestazioni (Titolo, Protagonista, Anno, Voto, Azioni).
Le funzioni creaContenitore() e creaElemento(serie) scelgono in base a vista.

Statistiche (indicatori visivi)
Calcolate dentro render() (in renderStatistiche()), perché dipendono dallo stato:

contatori grandi: serie totali, serie viste con percentuale, voto medio (calcolato con reduce);
barre orizzontali: viste e da vedere, con width: X%;
distribuzione per categoria: una barra per categoria, contata con filter().length.
Stelline del voto
La funzione stelle(voto) costruisce la stringa ★★★☆☆ con un ciclo for da 1 a 5.

Notifiche
notifica(testo, tipo) scrive il testo in #notifica, applica la classe successo (verde) o errore (rosso), lo mostra con display: block e lo nasconde dopo 3 secondi con setTimeout. clearTimeout evita che una notifica vecchia chiuda quella nuova.

Tema chiaro / scuro
Il bottone nell'header alterna la variabile tema tra "chiaro" e "scuro". render() aggiunge o toglie la classe dark sul <body> con classList.add / classList.remove dentro un if / else. Anche la scelta del tema viene salvata.

Nel CSS i colori normali sono quelli del tema chiaro. In fondo a style.css c'è una sezione TEMA SCURO con regole che iniziano con body.dark, per esempio body.dark .pannello { ... }. Valgono solo quando il body ha la classe dark e cambiano sfondo, testo e bordi. Per non dover riscrivere tutto, i bottoni normali hanno sfondo transparent e color: inherit, quindi si adattano da soli a tutti e due i temi.

Salvataggio (localStorage)
salva() scrive l'array (con JSON.stringify) e il tema nel localStorage alla fine di ogni render(). All'avvio lo stato parte dai dati di esempio; se localStorage.getItem(...) non è null, cioè c'è qualcosa di salvato, JSON.parse lo ritrasforma in un array e prende il loro posto. JSON.stringify e JSON.parse servono perché il localStorage salva solo testo.

