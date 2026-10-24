// =====================================================
//  AnimeBox - script.js
//  Pattern fondamentale:  STATO  ->  render()  ->  EVENTI
//  Gli eventi modificano SOLO lo stato e poi chiamano render().
// =====================================================


// ----------------- COSTANTI -----------------

const CHIAVE_SERIE = "animebox-serie";
const CHIAVE_TEMA = "animebox-tema";

// Un'icona per ogni categoria (card, titoli dei gruppi, statistiche)
const ICONE = {
  Robot: "🤖",
  Shojo: "🌸",
  Azione: "⚔️",
  Avventura: "🗺️",
  Sport: "🏐",
  Commedia: "😄"
};

// Serie di partenza: usate solo la prima volta, quando il localStorage è vuoto
const DATI_INIZIALI = [
  { id: 1, titolo: "Mazinga Z", protagonista: "Koji Kabuto", anno: 1972, categoria: "Robot", voto: 5, visto: true },
  { id: 2, titolo: "Il Grande Mazinga", protagonista: "Tetsuya Tsurugi", anno: 1974, categoria: "Robot", voto: 4, visto: false },
  { id: 3, titolo: "UFO Robot Goldrake", protagonista: "Actarus", anno: 1975, categoria: "Robot", voto: 5, visto: true },
  { id: 4, titolo: "Jeeg Robot d'acciaio", protagonista: "Hiroshi Shiba", anno: 1975, categoria: "Robot", voto: 4, visto: false },
  { id: 5, titolo: "Lupin III", protagonista: "Arsenio Lupin III", anno: 1971, categoria: "Avventura", voto: 5, visto: true },
  { id: 6, titolo: "Occhi di gatto", protagonista: "Sheila", anno: 1983, categoria: "Avventura", voto: 4, visto: false },
  { id: 7, titolo: "Lady Oscar", protagonista: "Oscar François de Jarjayes", anno: 1979, categoria: "Shojo", voto: 5, visto: true },
  { id: 8, titolo: "Candy Candy", protagonista: "Candy White", anno: 1976, categoria: "Shojo", voto: 3, visto: false },
  { id: 9, titolo: "Sailor Moon", protagonista: "Bunny Tsukino", anno: 1992, categoria: "Shojo", voto: 4, visto: true },
  { id: 10, titolo: "Mila e Shiro - Due cuori nella pallavolo", protagonista: "Mila Hazuki", anno: 1984, categoria: "Sport", voto: 4, visto: false },
  { id: 11, titolo: "Holly e Benji", protagonista: "Holly Hutton", anno: 1983, categoria: "Sport", voto: 4, visto: true },
  { id: 12, titolo: "I Cavalieri dello Zodiaco", protagonista: "Pegasus", anno: 1986, categoria: "Azione", voto: 5, visto: false },
  { id: 13, titolo: "Ken il guerriero", protagonista: "Kenshiro", anno: 1984, categoria: "Azione", voto: 4, visto: false },
  { id: 14, titolo: "Superchicche", protagonista: "Lolly, Dolly e Molly", anno: 1998, categoria: "Commedia", voto: 3, visto: false }
];


// ----------------- STATO (poche variabili globali) -----------------


let anime = DATI_INIZIALI;
if (localStorage.getItem(CHIAVE_SERIE) !== null) {
  anime = JSON.parse(localStorage.getItem(CHIAVE_SERIE));
}
let ricerca = "";
let filtro = "tutti";            // "tutti" | "visti" | "da-vedere"
let filtroCategoria = "tutte";   // "tutte" | una categoria
let ordine = "manuale";          // "manuale" | "anno-asc" | "anno-desc" | "titolo" | "voto"
let vista = "card";              // "lista" | "card" | "tabella"
let tema = "chiaro";             // "chiaro" | "scuro"
if (localStorage.getItem(CHIAVE_TEMA) !== null) {
  tema = localStorage.getItem(CHIAVE_TEMA);
}
let idInModifica = null;         // id della serie di cui si sta modificando il titolo
let timerNotifica = null;


// ----------------- ELEMENTI DEL DOM -----------------

const form = document.getElementById("form-serie");
const inputTitolo = document.getElementById("titolo");
const inputProtagonista = document.getElementById("protagonista");
const inputAnno = document.getElementById("anno");
const selectCategoria = document.getElementById("categoria");
const selectVoto = document.getElementById("voto");
const checkVisto = document.getElementById("visto");
const erroreForm = document.getElementById("errore");

const inputRicerca = document.getElementById("ricerca");
const selectFiltro = document.getElementById("filtro");
const selectFiltroCategoria = document.getElementById("filtro-categoria");
const selectOrdine = document.getElementById("ordine");
const bottoniVista = document.getElementById("viste");
const btnTema = document.getElementById("btn-tema");

const statistiche = document.getElementById("statistiche");
const conteggio = document.getElementById("conteggio");
const lista = document.getElementById("lista");
const notificaBox = document.getElementById("notifica");


// ----------------- FUNZIONI DI SUPPORTO -----------------

// Crea un elemento con classe e testo (textContent: sicuro anche con testo scritto dall'utente)
function crea(tag, classe, testo) {
  const elemento = document.createElement(tag);
  if (classe) elemento.className = classe;
  if (testo !== undefined) elemento.textContent = testo;
  return elemento;
}

// Stelline del voto costruite con un ciclo for: ★★★☆☆
function stelle(voto) {
  let risultato = "";
  for (let i = 1; i <= 5; i++) {
    if (i <= voto) {
      risultato += "★";
    } else {
      risultato += "☆";
    }
  }
  return risultato;
}

function salva() {
  localStorage.setItem(CHIAVE_SERIE, JSON.stringify(anime));
  localStorage.setItem(CHIAVE_TEMA, tema);
}

// Messaggio temporaneo: verde per successo, rosso per errore
function notifica(testo, tipo) {
  notificaBox.textContent = testo;
  notificaBox.className = tipo;
  notificaBox.style.display = "block";
  clearTimeout(timerNotifica);
  timerNotifica = setTimeout(() => {
    notificaBox.style.display = "none";
  }, 3000);
}

function creaBottone(testo, azione, id, suggerimento) {
  const bottone = crea("button", "btn btn-piccolo", testo);
  bottone.type = "button";
  bottone.title = suggerimento;
  bottone.dataset.azione = azione;
  bottone.dataset.id = id;
  return bottone;
}

// Il titolo è un testo, oppure un <input> se la serie è in modifica
function creaTitolo(serie) {
  if (serie.id === idInModifica) {
    const input = crea("input", "input-modifica");
    input.value = serie.titolo;
    return input;
  }
  return crea("strong", "titolo", serie.titolo);
}

function creaAzioni(serie) {
  const azioni = crea("div", "azioni");

  const btnVisto = creaBottone("👁 Da vedere", "visto", serie.id, "Segna come vista / da vedere");
  btnVisto.classList.add("btn-visto");
  if (serie.visto) {
    btnVisto.textContent = "✔ Vista";
    btnVisto.classList.add("attivo");
  }
  azioni.appendChild(btnVisto);

  // Le frecce hanno senso solo con l'ordine personale
  if (ordine === "manuale") {
    azioni.appendChild(creaBottone("↑", "su", serie.id, "Sposta su"));
    azioni.appendChild(creaBottone("↓", "giu", serie.id, "Sposta giù"));
  }
  azioni.appendChild(creaBottone("✏️", "modifica", serie.id, "Modifica titolo"));
  azioni.appendChild(creaBottone("🗑️", "elimina", serie.id, "Elimina"));
  return azioni;
}

// Un elemento per ogni serie, diverso in base alla vista corrente
function creaElemento(serie) {
  const dettagli = `${serie.protagonista} · ${serie.anno}`;
  let elemento;

  if (vista === "lista") {
    elemento = crea("li", "riga");
    const info = crea("div", "info");
    info.appendChild(creaTitolo(serie));
    info.appendChild(crea("span", "dettagli", dettagli));
    elemento.appendChild(info);
    elemento.appendChild(crea("span", "stelle", stelle(serie.voto)));
    elemento.appendChild(creaAzioni(serie));
  } else if (vista === "tabella") {
    elemento = crea("tr");
    const tdTitolo = crea("td");
    const tdAzioni = crea("td");
    tdTitolo.appendChild(creaTitolo(serie));
    tdAzioni.appendChild(creaAzioni(serie));
    elemento.appendChild(tdTitolo);
    elemento.appendChild(crea("td", "", serie.protagonista));
    elemento.appendChild(crea("td", "", serie.anno));
    elemento.appendChild(crea("td", "stelle", stelle(serie.voto)));
    elemento.appendChild(tdAzioni);
  } else {
    // vista "card"
    elemento = crea("article", "card");
    elemento.appendChild(crea("div", "card-icona", ICONE[serie.categoria]));
    elemento.appendChild(creaTitolo(serie));
    elemento.appendChild(crea("p", "dettagli", dettagli));
    elemento.appendChild(crea("p", "stelle", stelle(serie.voto)));
    elemento.appendChild(creaAzioni(serie));
  }

  // Bordo verde per le serie già viste: uguale in tutte e tre le viste
  if (serie.visto) elemento.classList.add("guardata");
  return elemento;
}

// Contenitore di un gruppo: <ul>, griglia di card o tabella
function creaContenitore() {
  if (vista === "lista") return crea("ul", "vista-lista");
  if (vista === "card") return crea("div", "griglia");

  const tabella = crea("table", "tabella");
  const intestazione = crea("tr");
  ["Titolo", "Protagonista", "Anno", "Voto", "Azioni"].forEach(testo => {
    intestazione.appendChild(crea("th", "", testo));
  });
  const thead = crea("thead");
  thead.appendChild(intestazione);
  tabella.appendChild(thead);
  tabella.appendChild(crea("tbody"));
  return tabella;
}

function creaContatore(numero, etichetta) {
  const contatore = crea("div", "contatore");
  contatore.appendChild(crea("span", "contatore-numero", numero));
  contatore.appendChild(crea("span", "contatore-etichetta", etichetta));
  return contatore;
}

function creaBarra(etichetta, valore, totale, classe) {
  const riga = crea("div", "barra-riga");
  const barra = crea("div", "barra");
  const piena = crea("div", "barra-piena " + classe);
  let percentuale = 0;
  if (totale > 0) percentuale = (valore / totale) * 100;
  piena.style.width = percentuale + "%";
  barra.appendChild(piena);
  riga.appendChild(crea("span", "", etichetta));
  riga.appendChild(barra);
  riga.appendChild(crea("span", "barra-valore", valore));
  return riga;
}

// Le statistiche dipendono dallo stato, quindi le ricalcola render()
// (riceve il numero di serie viste, già calcolato da render() per il conteggio)
function renderStatistiche(viste) {
  const totale = anime.length;
  let percentuale = 0;
  let media = 0;
  if (totale > 0) {
    percentuale = Math.round((viste / totale) * 100);
    media = anime.reduce((somma, serie) => somma + serie.voto, 0) / totale;
  }

  statistiche.innerHTML = "";

  const contatori = crea("div", "contatori");
  contatori.appendChild(creaContatore(totale, "Serie in collezione"));
  contatori.appendChild(creaContatore(`${viste} (${percentuale}%)`, "Serie viste"));
  contatori.appendChild(creaContatore(media.toFixed(1) + " ★", "Voto medio"));
  statistiche.appendChild(contatori);

  statistiche.appendChild(creaBarra("✔ Viste", viste, totale, "verde"));
  statistiche.appendChild(creaBarra("👁 Da vedere", totale - viste, totale, ""));

  statistiche.appendChild(crea("h4", "stat-titolo", "Per categoria"));
  Object.keys(ICONE).forEach(categoria => {
    const quante = anime.filter(serie => serie.categoria === categoria).length;
    statistiche.appendChild(creaBarra(`${ICONE[categoria]} ${categoria}`, quante, totale, ""));
  });
}


// ----------------- RENDER -----------------

function render() {
  // 1. Parto dall'array completo (lo stato)
  // 2. Filtro in memoria: ricerca + stato visto + categoria
  const testo = ricerca.toLowerCase();
  const risultati = anime.filter(serie => {
    const okRicerca = serie.titolo.toLowerCase().includes(testo) ||
                      serie.protagonista.toLowerCase().includes(testo);
    const okFiltro = filtro === "tutti" ||
                     (filtro === "visti" && serie.visto) ||
                     (filtro === "da-vedere" && !serie.visto);
    const okCategoria = filtroCategoria === "tutte" || serie.categoria === filtroCategoria;
    return okRicerca && okFiltro && okCategoria;
  });

  // 3. Ordino in memoria (filter ha già creato un array nuovo, lo stato non cambia)
  if (ordine === "anno-asc") risultati.sort((a, b) => a.anno - b.anno);
  if (ordine === "anno-desc") risultati.sort((a, b) => b.anno - a.anno);
  if (ordine === "titolo") risultati.sort((a, b) => a.titolo.localeCompare(b.titolo));
  if (ordine === "voto") risultati.sort((a, b) => b.voto - a.voto);

  // 4. Svuoto il container
  lista.innerHTML = "";
  // Conteggio dinamico in cima alla lista
  const viste = anime.filter(serie => serie.visto).length;
  conteggio.textContent = `Mostrate: ${risultati.length} · Totale: ${anime.length} · Viste: ${viste} di ${anime.length}`;

  if (risultati.length === 0) {
    lista.appendChild(crea("p", "vuoto", "Nessuna serie trovata. Prova a cambiare ricerca o filtri."));
  }

  // 5. Raggruppo per categoria con reduce: { Robot: [...], Shojo: [...] }
  const gruppi = risultati.reduce((accumulatore, serie) => {
    if (!accumulatore[serie.categoria]) accumulatore[serie.categoria] = [];
    accumulatore[serie.categoria].push(serie);
    return accumulatore;
  }, {});

  // ...e ricreo un header <h3> + un elemento DOM per ogni serie
  Object.keys(gruppi).forEach(categoria => {
    lista.appendChild(crea("h3", "gruppo-titolo", `${ICONE[categoria]} ${categoria} (${gruppi[categoria].length})`));

    const contenitore = creaContenitore();
    let destinazione = contenitore;
    if (vista === "tabella") destinazione = contenitore.querySelector("tbody");
    gruppi[categoria].forEach(serie => destinazione.appendChild(creaElemento(serie)));

    if (vista === "tabella") {
      const wrapper = crea("div", "tabella-wrapper");
      wrapper.appendChild(contenitore);
      lista.appendChild(wrapper);
    } else {
      lista.appendChild(contenitore);
    }
  });

  // Parti della pagina che dipendono dallo stato
  renderStatistiche(viste);
  bottoniVista.querySelectorAll("button").forEach(bottone => {
    bottone.classList.remove("attivo");
    if (bottone.dataset.vista === vista) bottone.classList.add("attivo");
  });
  if (tema === "scuro") {
    document.body.classList.add("dark");
    btnTema.textContent = "☀️ Tema chiaro";
  } else {
    document.body.classList.remove("dark");
    btnTema.textContent = "🌙 Tema scuro";
  }

  const inputModifica = lista.querySelector(".input-modifica");
  if (inputModifica) inputModifica.focus();

  salva();
}


// ----------------- FUNZIONI CHE MODIFICANO LO STATO -----------------

function sposta(id, direzione) {
  const i = anime.findIndex(serie => serie.id === id);
  let j = i + direzione;
  while (j >= 0 && j < anime.length && anime[j].categoria !== anime[i].categoria) {
    j += direzione;
  }
  if (j < 0 || j >= anime.length) return;

  const temporanea = anime[i];
  anime[i] = anime[j];
  anime[j] = temporanea;
}

function confermaModifica(input) {
  if (idInModifica === null) return; //(Invio seguito da blur)

  const nuovoTitolo = input.value.trim();
  const serie = anime.find(s => s.id === idInModifica);
  idInModifica = null;

  if (nuovoTitolo === "") {
    notifica("Il titolo non può essere vuoto", "errore");
  } else if (nuovoTitolo !== serie.titolo) {
    serie.titolo = nuovoTitolo;
    notifica("Titolo aggiornato", "successo");
  }
  render();
}


// ----------------- EVENTI -----------------

// Form: validazione e aggiunta
form.addEventListener("submit", event => {
  event.preventDefault();

  const titolo = inputTitolo.value.trim();
  const protagonista = inputProtagonista.value.trim();
  const annoTesto = inputAnno.value.trim();
  const categoria = selectCategoria.value;
  const votoTesto = selectVoto.value;
  const annoMassimo = new Date().getFullYear();

  const anno = Number(annoTesto);

  // Controlli in fila: il primo che fallisce decide il messaggio
  let errore = "";
  if (titolo === "" || protagonista === "" || annoTesto === "" || categoria === "" || votoTesto === "") {
    errore = "Compila tutti i campi obbligatori (*).";
  } else if (isNaN(anno) || anno < 1960 || anno > annoMassimo) {
    errore = `L'anno deve essere un numero tra 1960 e ${annoMassimo}.`;
  } else if (anime.some(serie => serie.titolo.toLowerCase() === titolo.toLowerCase())) {
    errore = "Questa serie è già nella collezione.";
  }

  erroreForm.textContent = errore;
  if (errore !== "") return;

  anime.push({
    id: Date.now(),
    titolo,
    protagonista,
    anno,
    categoria,
    voto: Number(votoTesto),
    visto: checkVisto.checked
  });
  form.reset();
  render();
  notifica(`"${titolo}" aggiunta alla collezione`, "successo");
});

// Event delegation: un solo listener per tutti i bottoni della lista
lista.addEventListener("click", event => {
  const azione = event.target.dataset.azione;
  if (!azione) return;

  const id = Number(event.target.dataset.id);
  const serie = anime.find(s => s.id === id);

  if (azione === "elimina") {
    anime = anime.filter(s => s.id !== id);
    notifica(`"${serie.titolo}" eliminata`, "errore");
  } else if (azione === "visto") {
    serie.visto = !serie.visto;
    if (serie.visto) {
      notifica(`"${serie.titolo}" segnata come vista`, "successo");
    } else {
      notifica(`"${serie.titolo}" da vedere`, "successo");
    }
  } else if (azione === "modifica") {
    idInModifica = id;
  } else if (azione === "su") {
    sposta(id, -1);
  } else if (azione === "giu") {
    sposta(id, 1);
  }
  render();
});

// Modifica in-place: conferma con Invio, annulla con Esc, conferma anche uscendo dal campo
lista.addEventListener("keydown", event => {
  if (!event.target.classList.contains("input-modifica")) return;
  if (event.key === "Enter") {
    confermaModifica(event.target);
  } else if (event.key === "Escape") {
    idInModifica = null;
    render();
  }
});

lista.addEventListener("focusout", event => {
  if (event.target.classList.contains("input-modifica")) confermaModifica(event.target);
});

// Controlli: salvano la scelta nello stato e ridisegnano
inputRicerca.addEventListener("input", () => {
  ricerca = inputRicerca.value.trim();
  render();
});

selectFiltro.addEventListener("change", () => {
  filtro = selectFiltro.value;
  render();
});

selectFiltroCategoria.addEventListener("change", () => {
  filtroCategoria = selectFiltroCategoria.value;
  render();
});

selectOrdine.addEventListener("change", () => {
  ordine = selectOrdine.value;
  render();
});

bottoniVista.addEventListener("click", event => {
  if (!event.target.dataset.vista) return;
  vista = event.target.dataset.vista;
  render();
});

btnTema.addEventListener("click", () => {
  if (tema === "chiaro") {
    tema = "scuro";
  } else {
    tema = "chiaro";
  }
  render();
});


// Primo disegno della pagina
render();
