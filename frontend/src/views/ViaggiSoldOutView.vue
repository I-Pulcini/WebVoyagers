<script setup>
import { ref, computed, onMounted } from 'vue';
//importa ref per le variabile rattive 
//computed per variabili che si ricalcolano
//onMountend per eseguire azioni all'avvio della pagina

const mesi = ['Gennaio','Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];
const meseSelezionato = ref('Gennaio');
//creiamo un array statico con tutti i mesi, e in default mettiamo Gennaio

// Abbiamo creato la variabile reattiva che conterrà i viaggi caricati dal backend
const viaggi = ref([]);
// Abbiamo creato la variabile per gestire lo stato di caricamento
const caricamento = ref(true);
// Abbiamo creato la variabile per gestire eventuali errori
const errore = ref('');

// Abbiamo creato la funzione asincrona che chiama il backend per scaricare i viaggi sold out
const caricaViaggi = async () => {
  try {
    // Abbiamo chiamato l'endpoint che restituisce i viaggi con stato 'sold_out'
    const response = await fetch('/api/viaggi/sold_out');  // usiamo fetch() per interrogare l'API che abbiamo scritto nel backend,l'esecuzione è in pausa finchè il server non risponde
    const data = await response.json();  //convertiamo la risposta in formato JSON

    if (response.ok) {  //se il server risponde correttamente
   
      viaggi.value = data.viaggi.map(v => ({  //riempiano l'array reattivo con i viaggi e le sue informazioni
        id: v.id,
        mese: v.mese,  //mese in cui avverrà il viaggio
        periodo: v.periodo,
        data: v.data_visualizzata,
        destinazione: ' ' + v.destinazione,
        prezzo: v.prezzo + '€'
      }));
    } else {  //se il server risponde con un errore
      errore.value = data.error || 'Errore nel caricamento dei viaggi.';
    }
  } catch (err) {   //gestione errrore
    console.error('Errore nella chiamata al backend:', err);
    errore.value = 'Errore di connessione al server.';
  } finally {  //viene eseguito SEMPRE alla fine fi tutto, sia se il server risponde correttamente sia se non lo fa
    caricamento.value = false;
  }
};


onMounted(() => {   //abbiamo agganciato il caricamento dei viaggi al montaggio della pagina
  caricaViaggi();  //funzione che va a scaricare i dati dal database
});

const viaggiFiltrati = computed(() => {
  return viaggi.value.filter(viaggio => viaggio.mese === meseSelezionato.value);
});

const cambiaMese = (nuovoMese) => {   //funzione che scatta quando l'utente fa click su uno dei bottoni del mese
  meseSelezionato.value = nuovoMese;  //aggioriamo la var. con il mese selezionato
};
</script>

<template>
  <div class="ViaggiSoldOut-wrapper">

    <header class="fascia-foto">
      <div class="overlay-testo">
        <h1 class="fascia-titolo">VIAGGI SOLD OUT</h1>
        <p class="sottotitolo-header">
          Queste mete non sono più disponibili, torneranno al più presto!
          Nel frattempo, scopri la meta perfetta per te tra i viaggi a disposizione.
        </p>
      </div>
    </header>

    <main class="contenuto-principale">

      <section class="mesi-container">
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
      
        <div v-if="caricamento" class="caricamento-info">
          ⏳ Caricamento viaggi in corso...
        </div>

     
        <div v-else-if="errore" class="errore-info">
          ⚠️ {{ errore }}
        </div>

       
        <div v-else-if="viaggiFiltrati.length === 0" class="nessun-viaggio">
          Nessun viaggio sold out registrato per {{ meseSelezionato }}.
        </div>

     
        <div v-else v-for="viaggio in viaggiFiltrati" :key="viaggio.id" class="riga-viaggio">
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

          <div class="colonna-info"></div>

          <div class="colonna-azione">
            <button class="btn-soldout">SOLD OUT</button>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.ViaggiSoldOut-wrapper,
.ViaggiSoldOut-wrapper * {
  box-sizing: border-box;
}

.ViaggiSoldOut-wrapper {
  background-color: #f9f9f9;
  min-height: 100vh;
  width: 100%;
  font-family: sans-serif;
  overflow-x: hidden;
}


.fascia-foto {
  width: 100%;
  height: 70vh;
  background-image: url('/Sfondo2.jpg');
  background-size: cover;
  background-position: center;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}


.fascia-foto::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 120px;
  background: linear-gradient(to bottom, rgba(0,0,0,0.35), rgba(0,0,0,0));
  pointer-events: none;
  z-index: 1;
}

.overlay-testo {
  padding: 40px 20px;
  width: 100%;
  color: white;
  position: relative;
  z-index: 2;
}

.fascia-titolo {
  font-size: clamp(2rem, 5vw, 4rem);
  font-weight: bold;
  letter-spacing: 5px;
  margin-bottom: 20px;
  text-transform: uppercase;
  white-space: nowrap;
  text-shadow: 2px 2px 8px rgba(0,0,0,0.5);
}

.sottotitolo-header {
  font-size: clamp(0.9rem, 1.3vw, 1.2rem);
  max-width: 1100px;
  margin: 0 auto;
  line-height: 1.6;
  text-shadow: 1px 1px 4px rgba(0,0,0,0.5);
}

.contenuto-principale {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 5%;
}

.mesi-container {
  display: flex;
  flex-wrap: nowrap;
  overflow-x: auto;
  gap: 15px;
  justify-content: space-between;
  margin-bottom: 50px;
  padding-bottom: 10px;
}

.btn-mese {
  background-color: white;
  border: 1px solid #ccc;
  border-radius: 25px;
  padding: 10px 20px;
  cursor: pointer;
  white-space: nowrap;
  font-size: 0.95rem;
  min-width: 100px;
  transition: 0.3s;
}

.btn-mese.selezionato {
  background-color: #00c4b4;
  color: white;
  border-color: #00c4b4;
  font-weight: bold;
}

.riga-viaggio {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 25px 0;
  border-bottom: 1px solid #eee;
  gap: 15px;
}

.colonna-date {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.periodo {
  font-size: 0.85rem;
  color: #999;
  text-transform: uppercase;
}

.data-esatta {
  font-size: 1.1rem;
  color: #333;
  font-weight: bold;
}

.colonna-destinazione {
  flex: 2;
  font-size: 1.2rem;
  padding-left: 20px;
}

.colonna-prezzo {
  flex: 1;
  font-size: 1.1rem;
  text-align: center;
  color: #444;
}

.colonna-info {
  flex: 2;
  text-align: center;
}

.colonna-azione {
  flex: 1;
  display: flex;
  justify-content: flex-end;
}

.btn-soldout {
  background-color: transparent;
  color: #d81b60;
  border: 2px solid #d81b60;
  padding: 12px 25px;
  border-radius: 30px;
  font-size: 0.95rem;
  font-weight: bold;
  letter-spacing: 2px;
  cursor: default;
}

.nessun-viaggio {
  text-align: center;
  padding: 60px;
  font-size: 1.1rem;
  color: #bbb;
  font-style: italic;
}

.caricamento-info,
.errore-info {
  text-align: center;
  padding: 60px;
  font-size: 1.1rem;
  color: #666;
}

.errore-info {
  color: #d81b60;
  font-weight: bold;
}

@media (max-width: 768px) {
  .fascia-foto {
    height: 50vh;
  }
  .fascia-titolo {
    letter-spacing: 2px;
    white-space: normal;
  }
  .riga-viaggio {
    flex-wrap: wrap;
  }
}
</style>
