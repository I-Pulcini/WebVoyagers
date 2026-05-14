import { reactive } from 'vue'

/* --- STORE PRENOTAZIONE MISTERIOSA --- */
/* Abbiamo creato uno store reattivo per condividere i dati della prenotazione misteriosa
   tra la pagina del form e la pagina del risultato. Questo evita di dover passare
   tutti i parametri tramite URL (che sarebbe brutto e scomodo con tanti dati). */

// Abbiamo definito uno stato iniziale "vuoto" come oggetto costante.
// Lo riutilizzeremo nella funzione reset() grazie allo spread operator (...)
// che ci permette di copiare tutte le proprietà di un oggetto in un altro.
const statoIniziale = {
    criteri: null,
    viaggioScelto: null,
    viaggiSimili: [],
    codice: ''
}

export const prenotazioneStore = reactive({
    // Abbiamo usato lo spread operator (...) per copiare tutte le proprietà
    // dello statoIniziale dentro lo store. Questa è una sintassi moderna ES2018+
    // equivalente a Object.assign({}, statoIniziale)
    ...statoIniziale,

    // Abbiamo creato una funzione per salvare tutti i dati della prenotazione
    set(criteri, viaggioScelto, viaggiSimili, codice) {
        this.criteri = criteri
        this.viaggioScelto = viaggioScelto
        // Abbiamo usato lo spread operator per creare una copia indipendente dell'array
        // viaggiSimili. Senza lo spread, lo store conserverebbe un riferimento
        // all'array originale, e modifiche esterne lo influenzerebbero.
        this.viaggiSimili = [...viaggiSimili]
        // Abbiamo usato l'operatore nullish coalescing (??) per assegnare una
        // stringa vuota se il codice è null o undefined. A differenza di ||,
        // l'operatore ?? non considera "falsy" valori come 0 o '' (stringa vuota),
        // ma solo null e undefined.
        this.codice = codice ?? ''
    },

    // Abbiamo creato una funzione per svuotare lo store.
    // Usiamo Object.assign con lo spread per riportare tutti i campi
    // ai valori iniziali in una sola riga.
    reset() {
        Object.assign(this, { ...statoIniziale })
    }
})