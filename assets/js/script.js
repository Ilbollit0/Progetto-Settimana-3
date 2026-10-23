const CHIAVE_SERIE = "animebox-serie";
const CHIAVE_TEMA = "animebox-tema";

const ICONE = {
  Robot: "🤖",
  Shojo: "🌸",
  Azione: "⚔️",
  Avventura: "🗺️",
  Sport: "🏐",
  Commedia: "😄",
};

const DATI_INIZIALI = [
  {
    id: 1,
    titolo: "Mazinga Z",
    protagonista: "Koji Kabuto",
    anno: 1972,
    categoria: "Robot",
    voto: 5,
    visto: true,
  },
  {
    id: 2,
    titolo: "Il Grande Mazinga",
    protagonista: "Tetsuya Tsurugi",
    anno: 1974,
    categoria: "Robot",
    voto: 4,
    visto: false,
  },
  {
    id: 3,
    titolo: "UFO Robot Goldrake",
    protagonista: "Actarus",
    anno: 1975,
    categoria: "Robot",
    voto: 5,
    visto: true,
  },
  {
    id: 4,
    titolo: "Jeeg Robot d'acciaio",
    protagonista: "Hiroshi Shiba",
    anno: 1975,
    categoria: "Robot",
    voto: 4,
    visto: false,
  },
  {
    id: 5,
    titolo: "Lupin III",
    protagonista: "Arsenio Lupin III",
    anno: 1971,
    categoria: "Avventura",
    voto: 5,
    visto: true,
  },
  {
    id: 6,
    titolo: "Occhi di gatto",
    protagonista: "Sheila",
    anno: 1983,
    categoria: "Avventura",
    voto: 4,
    visto: false,
  },
  {
    id: 7,
    titolo: "Lady Oscar",
    protagonista: "Oscar François de Jarjayes",
    anno: 1979,
    categoria: "Shojo",
    voto: 5,
    visto: true,
  },
  {
    id: 8,
    titolo: "Candy Candy",
    protagonista: "Candy White",
    anno: 1976,
    categoria: "Shojo",
    voto: 3,
    visto: false,
  },
  {
    id: 9,
    titolo: "Sailor Moon",
    protagonista: "Bunny Tsukino",
    anno: 1992,
    categoria: "Shojo",
    voto: 4,
    visto: true,
  },
  {
    id: 10,
    titolo: "Mila e Shiro - Due cuori nella pallavolo",
    protagonista: "Mila Hazuki",
    anno: 1984,
    categoria: "Sport",
    voto: 4,
    visto: false,
  },
  {
    id: 11,
    titolo: "Holly e Benji",
    protagonista: "Holly Hutton",
    anno: 1983,
    categoria: "Sport",
    voto: 4,
    visto: true,
  },
  {
    id: 12,
    titolo: "I Cavalieri dello Zodiaco",
    protagonista: "Pegasus",
    anno: 1986,
    categoria: "Azione",
    voto: 5,
    visto: false,
  },
  {
    id: 13,
    titolo: "Ken il guerriero",
    protagonista: "Kenshiro",
    anno: 1984,
    categoria: "Azione",
    voto: 4,
    visto: false,
  },
  {
    id: 14,
    titolo: "Superchicche",
    protagonista: "Lolly, Dolly e Molly",
    anno: 1998,
    categoria: "Commedia",
    voto: 3,
    visto: false,
  },
];

let anime = JSON.parse(localStorage.getItem(CHIAVE_SERIE)) || DATI_INIZIALI;
let ricerca = "";
let filtro = "tutti"; // "tutti" | "visti" | "da-vedere"
let filtroCategoria = "tutte"; // "tutte" | una categoria
let ordine = "manuale"; // "manuale" | "anno-asc" | "anno-desc" | "titolo" | "voto"
let vista = "card"; // "lista" | "card" | "tabella"
let tema = localStorage.getItem(CHIAVE_TEMA) || "chiaro";
let idInModifica = null; // id della serie di cui si sta modificando il titolo
let timerNotifica = null;

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
