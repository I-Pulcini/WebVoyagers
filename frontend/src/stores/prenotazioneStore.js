import { reactive } from 'vue'

// STORE PRENOTAZIONE MISTERIOSA 

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
 
    ...statoIniziale,

    // Abbiamo creato una funzione per salvare tutti i dati della prenotazione
    set(criteri, viaggioScelto, viaggiSimili, codice) {
        this.criteri = criteri
        this.viaggioScelto = viaggioScelto
      
        this.viaggiSimili = [...viaggiSimili]
       
        this.codice = codice ?? ''
    },

   
    reset() {
        Object.assign(this, { ...statoIniziale })
    }
})
