/* --- SINTASSI JAVASCRIPT ES6 (Rif: 05-javascript-intro.pdf) --- */
/* Ho aggiornato la definizione delle variabili. Al posto di 'var' ho utilizzato 'const' 
   per immagazzinare i riferimenti ai nodi DOM. Poiché questi nodi non subiscono riassegnazioni 
   nel corso dello script, 'const' è la keyword raccomandata dallo standard ECMAScript 6. */
const menuDropdown = document.getElementById("myDropdown");
const hamburgerBtn = document.getElementById("hamburgerBtn");
const esploraBtn = document.getElementById("esploraBtn");
const esploraSubmenu = document.getElementById("esploraSubmenu");

/* --- GESTIONE MENU ED EVENTI (Rif: 05-javascript-intro.pdf e 06-javascript-www.pdf) --- */
if (hamburgerBtn) {
    /* Per associare la logica all'evento 'click' ho impiegato le Arrow Functions '() =>'. 
       Questa notazione introdotta da ES6 snellisce il codice omettendo la parola chiave 'function'. */
    hamburgerBtn.addEventListener("click", () => {
        menuDropdown.classList.toggle("show");
    });
}

if (esploraBtn) {
    esploraBtn.addEventListener("click", (event) => {
        /* Per gestire il menu a discesa ho bloccato i comportamenti di default del browser. 
           Uso 'preventDefault()' per impedire al tag anchor di ricaricare la vista, e 
           'stopPropagation()' per fermare il Bubbling dell'evento verso il nodo window. */
        event.preventDefault(); 
        event.stopPropagation(); 
        esploraSubmenu.classList.toggle("show");
    });
}

/* Applico un listener globale all'oggetto window per far collassare i menu 
   non appena l'utente effettua un click su porzioni esterne dell'interfaccia. */
window.addEventListener("click", (event) => {
    if (!event.target.matches('.hamburger') && !event.target.closest('.menu-dropdown')) {
        if (menuDropdown && menuDropdown.classList.contains('show')) {
            menuDropdown.classList.remove('show');
            if (esploraSubmenu) esploraSubmenu.classList.remove('show');
        }
    }
});

/* --- AJAX, JSON E FETCH API (Rif: 08-ajax.pdf) --- */
/* Ho progettato il form affinché venga popolato dinamicamente. Questo dimostra 
   le potenzialità di AJAX nel disaccoppiare i dati (strutturati nel file JSON) dal documento HTML. */
const selectMese = document.getElementById("parla");
const selectPaese = document.getElementById("paese");

if (selectMese && selectPaese) {
    /* Richiamo asincronamente il file di appoggio tramite il costrutto fetch. */
    fetch('destinazioni.json')
        /* Ricevo la Promise e applico il metodo .json() sull'oggetto Response 
           per effettuare il parsing della stringa testuale in un oggetto JavaScript nativo. */
        .then(response => response.json()) 
        .then(data => {
            selectMese.innerHTML = '<option value="" disabled selected>Scegli un periodo</option>';
            selectPaese.innerHTML = '<option value="" disabled selected>Scegli una destinazione...</option>';

            /* Attraverso il metodo forEach(), itero l'array restituito dal JSON, 
               costruendo per ogni stringa un nuovo nodo DOM di tipo <option>. */
            data.mesi.forEach(mese => {
                let option = document.createElement("option");
                option.value = mese;
                option.textContent = mese;
                selectMese.appendChild(option);
            });

            data.paesi.forEach(paese => {
                let option = document.createElement("option");
                option.value = paese;
                option.textContent = paese;
                selectPaese.appendChild(option);
            });

            /* --- WEB STORAGE API (Rif: 07-javascript-altro.pdf) --- */
            /* Ho integrato il Web Storage richiamando getItem("ultimaMeta"). 
               Se l'utente ha già interrogato il form in precedenza, il browser riconosce 
               la stringa in memoria e preimposta in automatico la select sulla medesima destinazione. */
            let ultimaRicerca = localStorage.getItem("ultimaMeta");
            if (ultimaRicerca) {
                selectPaese.value = ultimaRicerca;
            }
        })
        .catch(error => console.error("Errore nel caricamento AJAX:", error));
}

/* --- GESTIONE FORM E LOGICA DI NAVIGAZIONE (Rif: 01-html.pdf e 08-ajax.pdf) --- */
const formRicerca = document.getElementById("ricercaViaggio");

if (formRicerca) {
    formRicerca.addEventListener("submit", (event) => {
        /* Intercetto l'evento 'submit' del form e lo inibisco con preventDefault(), 
           poiché desidero delegare interamente il meccanismo di routing alla logica JavaScript. */
        event.preventDefault(); 

        let mese = selectMese.value;
        let paese = selectPaese.value;

        if (mese !== "" && paese !== "") {
            /* Sfrutto il metodo setItem del LocalStorage per salvare persistentemente 
               sul client la destinazione indicata dall'utente. */
            localStorage.setItem("ultimaMeta", paese);

            /* Eseguo una manipolazione delle stringhe. Converto i dati di input in minuscolo 
               e utilizzo una regular expression (/ /g) per rimpiazzare globalmente gli spazi 
               con l'underscore, generando l'URI univoco del file (es: "agosto_algeria.html"). */
            let nomeMese = mese.toLowerCase();
            let nomePaese = paese.toLowerCase().replace(/ /g, "_");
            let nomePagina = nomeMese + "_" + nomePaese + ".html";
            
            /* Sfrutto nuovamente la Fetch API alterandone le opzioni base. Specificando { method: 'HEAD' }, 
               richiedo unicamente gli header al web server. Questo mi permette di capire se il documento 
               della vacanza esiste (status 200 OK) o meno (status 404), senza trasferirne il payload. */
            fetch(nomePagina, { method: 'HEAD' })
                .then(response => {
                    if (response.ok) {
                        window.location.href = nomePagina;
                    } else {
                        window.location.href = "non_disponibile.html";
                    }
                })
                .catch(() => {
                    window.location.href = "non_disponibile.html";
                });
        }
    });
}

/* --- LOGICA ACCORDION E ATTRAVERSAMENTO DOM (Rif: 06-javascript-www.pdf) --- */
const accordions = document.getElementsByClassName("accordion");

/* Utilizzo il costrutto ES6 'let i' nel ciclo for in modo da limitare lo scope 
   della variabile all'iterazione in corso. */
for (let i = 0; i < accordions.length; i++) {
    accordions[i].addEventListener("click", function() {
        this.classList.toggle("active");
        
        /* Ho optato per 'nextElementSibling' anziché 'nextSibling'. Questa scelta strutturale 
           mi garantisce la selezione esclusiva del tag HTML successivo (il <div> pannello), 
           filtrando nativamente i node text invisibili e prevenendo anomalie di rendering. */
        let panel = this.nextElementSibling;
        
        if (panel.style.display === "block") {
            panel.style.display = "none";
        } else {
            panel.style.display = "block";
        }
    });
}
