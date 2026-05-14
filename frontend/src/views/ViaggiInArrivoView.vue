<script setup>
import { ref, computed, onMounted } from 'vue';
import { RouterLink } from 'vue-router';


const mesi = ['Gennaio','Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];
const meseSelezionato = ref('Gennaio');

// Abbiamo creato la variabile reattiva che conterrà i viaggi caricati dal backend
const viaggi = ref([]);
// Abbiamo creato la variabile per gestire lo stato di caricamento
const caricamento = ref(true);
// Abbiamo creato la variabile per gestire eventuali errori
const errore = ref('');

// Abbiamo creato la funzione asincrona che chiama il backend per scaricare i viaggi in arrivo
const caricaViaggi = async () => {
  try {
    // Abbiamo chiamato l'endpoint che restituisce i viaggi con stato 'in_arrivo'
    const response = await fetch('/api/viaggi/in_arrivo');
    const data = await response.json();

    if (response.ok) {
      // Abbiamo trasformato i dati del backend nel formato richiesto dal template
      viaggi.value = data.viaggi.map(v => ({
        id: v.id,
        mese: v.mese,
        periodo: v.periodo,
        data: v.data_visualizzata,
        destinazione: ' ' + v.destinazione,
        prezzo: v.prezzo + '€',
        postiTotali: v.posti_totali
      }));
    } else {
      errore.value = data.error || 'Errore nel caricamento dei viaggi.';
    }
  } catch (err) {
    console.error('Errore nella chiamata al backend:', err);
    errore.value = 'Errore di connessione al server.';
  } finally {
    caricamento.value = false;
  }
};

// Abbiamo agganciato il caricamento dei viaggi al montaggio della pagina
onMounted(() => {
  caricaViaggi();
});

const viaggiFiltrati = computed(() => {
  return viaggi.value.filter(viaggio => viaggio.mese === meseSelezionato.value);
});

const cambiaMese = (nuovoMese) => {
  meseSelezionato.value = nuovoMese;
};
</script>

<template>
  <div class="ViaggiInArrivo-wrapper">

    <header class="fascia-foto">
      <div class="overlay-testo">
        <h1 class="fascia-titolo">VIAGGI IN ARRIVO</h1>
        <p class="sottotitolo-header">
          Abbiamo pensato ai viaggi di gruppo più indimenticabili del mondo: preparate lo zaino e il cuore, si parte!!
          In questa pagina trovate le novità che usciranno a breve; pronti partenza e si parte!!!
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
        <!-- Indicatore di caricamento -->
        <div v-if="caricamento" class="caricamento-info">
          ⏳ Caricamento viaggi in corso...
        </div>

        <!-- Messaggio di errore -->
        <div v-else-if="errore" class="errore-info">
          ⚠️ {{ errore }}
        </div>

        <!-- Nessun viaggio per il mese selezionato -->
        <div v-else-if="viaggiFiltrati.length === 0" class="nessun-viaggio">
          Nessun viaggio in arrivo per {{ meseSelezionato }}.
        </div>

        <!-- Lista viaggi -->
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
            <RouterLink :to="`/viaggio/${viaggio.id}`" class="btn-vedi-viaggio">
              Vedi Viaggio &gt;
            </RouterLink>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.ViaggiInArrivo-wrapper,
.ViaggiInArrivo-wrapper * {
  box-sizing: border-box;
}

.ViaggiInArrivo-wrapper {
  background-color: #f9f9f9;
  min-height: 100vh;
  width: 100%;
  font-family: sans-serif;
  overflow-x: hidden;
}

/* Fascia foto a tutta larghezza */
.fascia-foto {
  width: 100%;
  height: 70vh;
  background-image: url('/Sfondo3.jpg');
  background-size: cover;
  background-position: center;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

/* Sfumatura scura in alto, per far risaltare il menu hamburger */
.fascia-foto:before {
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
/* Bottone "Vedi Viaggio" - stile uguale ai viaggi disponibili */
.btn-vedi-viaggio {
  background: linear-gradient(135deg, #00c4b4 0%, #00897b 100%);
  color: white;
  padding: 12px 25px;
  border-radius: 30px;
  font-size: 0.95rem;
  font-weight: bold;
  letter-spacing: 1px;
  text-decoration: none;
  display: inline-block;
  transition: transform 0.2s, box-shadow 0.3s;
  box-shadow: 0 4px 10px rgba(0, 196, 180, 0.3);
}

.btn-vedi-viaggio:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(0, 196, 180, 0.4);
  color: white;
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