import { reactive } from 'vue'


const statoIniziale = {
    criteri: null,
    viaggioScelto: null,
    viaggiSimili: [],
    codice: ''
}

export const prenotazioneStore = reactive({
    
    ...statoIniziale,

   
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
