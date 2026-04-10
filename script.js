// Uso const (costante) e let (variabile) invece di var, come spiegato in JS ES6
const menuDropdown = document.getElementById("myDropdown");
const hamburgerBtn = document.getElementById("hamburgerBtn");
const esploraBtn = document.getElementById("esploraBtn");
const esploraSubmenu = document.getElementById("esploraSubmenu");

// --- GESTIONE MENU ---
if (hamburgerBtn) {
    // Uso le Arrow Function () => al posto di function() (spiegato nelle slide ES6)
    hamburgerBtn.addEventListener("click", () => {
        menuDropdown.classList.toggle("show");
    });
}

if (esploraBtn) {
    esploraBtn.addEventListener("click", (event) => {
        event.preventDefault(); 
        event.stopPropagation(); 
        esploraSubmenu.classList.toggle("show");
    });
}

// Chiude i menu se l'utente clicca fuori
window.addEventListener("click", (event) => {
    if (!event.target.matches('.hamburger') && !event.target.closest('.menu-dropdown')) {
        if (menuDropdown && menuDropdown.classList.contains('show')) {
            menuDropdown.classList.remove('show');
            esploraSubmenu.classList.remove('show');
        }
    }
});

// --- AJAX E JSON (CARICAMENTO DINAMICO DEI DATI) ---
// Spiegato dal prof: prendo i dati dal file destinazioni.json senza ricaricare la pagina
const selectMese = document.getElementById("parla");
const selectPaese = document.getElementById("paese");

// Controllo se sono nella home page (dove ci sono le tendine)
if (selectMese && selectPaese) {
    fetch('destinazioni.json')
        .then(response => response.json()) // Trasforma il file in un oggetto JS
        .then(data => {
            // Svuota le tendine prima di riempirle
            selectMese.innerHTML = '<option value="" disabled selected>Scegli un periodo</option>';
            selectPaese.innerHTML = '<option value="" disabled selected>Scegli una destinazione...</option>';

            // Cicla l'array dei mesi dal JSON e crea le option in HTML
            data.mesi.forEach(mese => {
                let option = document.createElement("option");
                option.value = mese;
                option.textContent = mese;
                selectMese.appendChild(option);
            });

            // Cicla l'array dei paesi dal JSON
            data.paesi.forEach(paese => {
                let option = document.createElement("option");
                option.value = paese;
                option.textContent = paese;
                selectPaese.appendChild(option);
            });

            // WEB STORAGE: Se l'utente aveva già cercato un paese prima, lo rimetto in automatico
            let ultimaRicerca = localStorage.getItem("ultimaMeta");
            if (ultimaRicerca) {
                selectPaese.value = ultimaRicerca;
            }
        })
        .catch(error => console.error("Errore nel caricamento AJAX:", error));
}

// --- GESTIONE FORM E RICERCA ---
const formRicerca = document.getElementById("ricercaViaggio");

if (formRicerca) {
    formRicerca.addEventListener("submit", (event) => {
        event.preventDefault(); // Blocca l'invio standard del form HTML

        let mese = selectMese.value;
        let paese = selectPaese.value;

        if (mese !== "" && paese !== "") {
            // Salva la scelta nel LocalStorage (spiegato nelle slide)
            localStorage.setItem("ultimaMeta", paese);

            let nomeMese = mese.toLowerCase();
            let nomePaese = paese.toLowerCase().replace(/ /g, "_");
            let nomePagina = nomeMese + "_" + nomePaese + ".html";
            
            // Richiesta HEAD per vedere se la pagina del viaggio esiste
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

// --- ACCORDION DELLA PAGINA DESTINAZIONE ---
const accordions = document.getElementsByClassName("accordion");

// Uso il costrutto let i = 0 al posto di var
for (let i = 0; i < accordions.length; i++) {
    accordions[i].addEventListener("click", function() {
        this.classList.toggle("active");
        
        // Uso nextElementSibling per prendere il div successivo in modo sicuro
        let panel = this.nextElementSibling;
        
        if (panel.style.display === "block") {
            panel.style.display = "none";
        } else {
            panel.style.display = "block";
        }
    });
}
