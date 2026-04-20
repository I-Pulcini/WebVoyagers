<script setup>

  import {ref, computed} form 'vue';
  const mesi = ['Gennaio','Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];
  const meseSelezionao = ref('Gennaio');


  //creimao il database con i viaggi disponibili
const viaggi = ref([
 { id: 1, mese: 'Gennaio', periodo: 'GENNAIO', data: '03-07', destinazione: 'NORVEGIA', prezzo: '3100€', stato: 'Vedi Viaggio>', posti: 4},
  { id: 2, mese: 'Febbraio', periodo: 'FEBBRAIO', data: '10-15', destinazione: 'LAPPONIA SVEDESE', prezzo: '3700€', stato: 'Vedi Viaggio>', posti: 2 },
  { id: 3, mese: 'Marzo', periodo: 'MARZO', data: '15-19', destinazione: 'LONDRA', prezzo: '1500€', stato: 'Vedi Viaggio>', posti: 1},
  { id: 4, mese: 'Aprile', periodo: 'APRILE', data: '22-27', destinazione: 'TUNISIA', prezzo: '1200€', stato: 'Vedi viaggio >', posti: 4 },
  { id: 5, mese: 'Maggio', periodo: 'OTTOBRE-NOVEMBRE', data: '28-06', destinazione: 'MAROCCO', prezzo: '2400€', stato: 'Vedi Viaggio >', posti: 8 },
  { id: 6, mese: 'Giugno', periodo: 'GIUGNO', data: '18-28', destinazione: 'PERU', prezzo: '5900€', stato: 'Vedi Viaggio >', posti: 6 },
   { id: 7, mese: 'Luglio', periodo: 'LUGLIO-AGOSTO', data: '24-05', destinazione: 'THAILANDIA', prezzo: '4200€', stato: 'Vedi Viaggio >', posti: 9},
  { id: 8, mese: 'Agosto', periodo: 'AGOSTO', data: '08-20', destinazione: 'ALGERIA', prezzo: '3300€', stato: 'Vedi Viaggio>', posti: 7},
  { id: 9, mese: 'Settembre', periodo: 'SETTEMBRE-OTTOBRE', data: '27-07', destinazione: 'OMAN', prezzo: '2800€', stato: 'Vedi Viaggio>', posti: 3 },
  { id: 10, mese: 'Ottobre', periodo: 'OTTOBRE-NOVEMBRE', data: '28-06', destinazione: 'MAROCCO', prezzo: '2400€', stato: 'Vedi Viaggio >', posti: 8 },
  { id: 11, mese: 'Novembre', periodo: 'NOVEMBRE', data: '21-29', destinazione: 'COREA DEL SUD', prezzo: '4200€', stato: 'Vedi Viaggio >', posti: 1 },
   { id: 12, mese: 'Dicembre', periodo: 'DICEMBRE-GENNAIO', data: '21-02', destinazione: 'CAPO VERDE', prezzo: '3600€', stato: 'Vedi Viaggio >', posti: 2},
]);

  //usiamo una funzione filtra i viaggi
const viaggiFiltrati = computed(() => {
  return viaggi.value.filter(viaggio => viaggio.mese === meseSelezionato.value);
});
//funzione che scatta quando clicchiamo sul bottone per cambaire il mese
  const cambiaMese = (nuovoMese) => {
    meseSelezionato.value = nuovoMese;
  };
  
</script>

<template>
  <div class="ViaggiDisponibili-wrapper">
    
    <header class="fascia-foto">
      <h1 class="fascia-titolo">Prossime Partenze</h1>
      <p class = "sottotitolo-header">
         WebVoyagers ti offre viaggi organizzati verso destinazioni poco cononsciute,creando insieme un itinerario personalizzato.
           Unisci a noi per un'esperienza indimenticabile. 
           Prenota il tuo viaggio e vivi l'avventura dei tuoi sogni.
        </p>
    </header>

    <main>
      <main class="contenuto-principale">
      <section class = "mesi-container">
        <button
          v-for="mese in mesi" 
          :key="mese" 
          @click="cambiaMese(mese)"
          :class="['btn-mese', { 'selezionato': mese === meseSelezionato }]"
        >
          {{ mese }}
        </button>
      </section>
      <section class="lista-viaggi">
        <div v-if="viaggiFiltrati.length === 0" class="nessun-viaggio">
          Nessun viaggio in programma per {{ meseSelezionato }}.
        </div>

        <div v-for="viaggio in viaggiFiltrati" :key="viaggio.id" class="riga-viaggio">
          
          <div class="colonna-date">
            <span class="periodo">{{ viaggio.periodo }}</span>
            <span class="data-esatta">{{ viaggio.data }}</span>
          </div>

          <div class="colonna-destinazione">
            <strong>{{ viaggio.destinazione }}</strong>
          </div>

          <div class="colonna-prezzo">
            <strong>{{ viaggio.prezzo }}</strong>
          </div>

          <div class="colonna-info">
            <span v-if="viaggio.posti > 0">Posti rimasti a questo prezzo: <strong style="color: #d81b60;">{{ viaggio.posti }}</strong></span>
          </div>

          <div class="colonna-azione">
            <button v-if="viaggio.stato === 'sold out'" class="btn-soldout">sold out</button>
            <span v-else-if="viaggio.stato === 'no sito'" class="testo-nosito">no sito</span>
            <button v-else class="btn-vediviaggio">{{ viaggio.stato }}</button>
          </div>

        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
/* Stili di base per simulare la foto */
.contenuto-principale {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
  font-family: sans-serif;
}

/* Container dei bottoni dei mesi */
.mesi-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
  margin-bottom: 40px;
}

.btn-mese {
  background-color: transparent;
  border: 1px solid #ccc;
  border-radius: 20px;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

/* Quando il bottone è cliccato, cambia colore (stile della foto) */
.btn-mese.selezionato {
  background-color: #00c4b4; //verde
  color: white;
  border-color: #00c4b4;
  font-weight: bold;
}

/* Griglia per ogni riga di viaggio */
.riga-viaggio {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 0;
  border-bottom: 1px solid #eee;
}

.colonna-date {
  display: flex;
  flex-direction: column;
  font-size: 12px;
  color: #666;
}

.data-esatta {
  font-size: 16px;
  color: #333;
}

.colonna-destinazione {
  flex: 2;
  text-align: left;
  padding-left: 20px;
}

.colonna-prezzo {
  flex: 1;
}

.colonna-info {
  flex: 2;
  font-size: 14px;
}

.colonna-azione {
  flex: 1;
  text-align: right;
}

/* Pulsanti finali */
.btn-soldout {
  background: transparent;
  color: #d81b60;
  border: none;
  font-weight: bold;
}

.btn-vediviaggio {
  background-color: #d81b60; // Fucsia 
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 20px;
  cursor: pointer;
  font-weight: bold;
}

.testo-nosito {
  color: #888;
}

.nessun-viaggio {
  text-align: center;
  color: #888;
  font-style: italic;
  padding: 20px;
}
</style>



        

      
