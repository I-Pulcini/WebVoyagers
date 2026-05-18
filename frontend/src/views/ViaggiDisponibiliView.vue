<script setup>
import { ref, computed, onMounted } from 'vue';
// imoprtiamo da Vue tre strumenti essenziali: 1) ref variabili reattive, che HTML aggiorna da solo 2) computed: serve per creare variabili che is calcola e aggironano in automatico  in base ad altre variabili
// 3) onMOunted, per eseguire una funzione appena la pagina web è stata caricata
import { useRouter } from 'vue-router';  //importimao lo strumento di Vuew Router che ci permette di far cambiare pagina all'utente

const router = useRouter();  //ci salviamo la costante router

const mesi = ['Gennaio','Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];
const meseSelezionato = ref('Gennaio');  //ci creiamo un array statico con tutti i nomi dei mesi che ci serviranno per i bottini e di default impostimao a gennaio 

// è unan variabili reattiva che conterrà i viaggi caricati dal backend
const viaggi = ref([]);

const caricamento = ref(true); // è una variabile reattiva che parte da true e sever per mostrare un messaggio finchè no non ci arrivano i dati 

const errore = ref(''); //variabile reattiva vuota che serve per ospitare un testo di errore da mostrare all'untente in caso di errore

// Funzione asincrona che chiama il backend per scaricare i viaggi disponibili
const caricaViaggi = async () => {
  try {  //viene chiamato un try-catch per la gestione degli errori
   
    const response = await fetch('/api/viaggi/disponibile'); // Chiamata all'endpoint che restituisce i viaggi con stato 'disponibile'
    //usiamo la chiamata fetch() per fare una richiesta AJAX al nostro backend Node.js
    const data = await response.json(); //await serve per mettere in pausa l'esecuzione finchè il server non risponde. Aspettiamo ce la risposta sia trasformata dal formato JSON ad un ogetto JavaScirpt
    
    
    if (response.ok) {  //controlliamo se la risposta HTTP del server è un successo
     
      viaggi.value = data.viaggi.map(v => ({     // Trasformiamo i dati del backend nel formato richiesto dal template
        id: v.id,
        mese: v.mese,
        periodo: v.periodo,
        data: v.data_visualizzata,
        destinazione: v.destinazione, // Spazio extra rimosso (ora gestito dal CSS)
        prezzo: `${v.prezzo}€`,
        stato: 'Vedi Viaggio >',
        posti: v.posti_disponibili,
        rotta: v.rotta
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

// Agganciamo il caricamento dei viaggi al montaggio della pagina
onMounted(() => {
  caricaViaggi();
});

const viaggiFiltrati = computed(() => {   //ci creiamo una varaibil computed che is ricalcola in automatica ongi volta che i dati al suo intenro cambiano
  return viaggi.value.filter(viaggio => viaggio.mese === meseSelezionato.value);   //prendiamo tutta la lista dei viaggi, 'viaggi.vue' e la filtrimao tenendo e restituendo solo  i viaggi in cui il mese corrisponde al meseselezazionato dall'utente
});

const cambiaMese = (nuovoMese) => {   //una variabile  che scatterà quando l'utente clicca su un bottone dei mesi 
  meseSelezionato.value = nuovoMese;   //sostiuiamo il mese attuale con qello nuovo poichè è una variabile reattiva
};

const apriViaggio = (viaggio) => {    //dichiariamo una funzione che scatta quadno si clicca il bottone 'vedi Viaggio >'
  if (viaggio.rotta) {  //ci assicurimao che il viaggio cliccato abbiamo una rotta valida 
    router.push(viaggio.rotta);  //Diciamo al router di Vue di cambiare pagina e portare l'utente all'indirizzo url specifico nella rotta di quel viaggio.
  }
};
</script>

<template>
  <div class="ViaggiDisponibili-wrapper">

    <header class="fascia-foto">
      <div class="overlay-testo">
        <h1 class="fascia-titolo">PROSSIME PARTENZE</h1>
        <p class="sottotitolo-header">
          WebVoyagers ti offre viaggi organizzati verso destinazioni poco conosciute, creando insieme un itinerario personalizzato.
          Unisciti a noi per un'esperienza indimenticabile. Prenota il tuo viaggio e vivi l'avventura dei tuoi sogni.
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
          Nessun viaggio in programma per {{ meseSelezionato }}.
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

          <div class="colonna-info">
            <span v-if="viaggio.posti > 0">
              Posti rimasti a questo prezzo: <strong style="color: #d81b60;">{{ viaggio.posti }}</strong>
            </span>
          </div>

          <div class="colonna-azione">
            <button
              class="btn-vediviaggio"
              :disabled="!viaggio.rotta"
              @click="apriViaggio(viaggio)"
            >
              {{ viaggio.stato }}
            </button>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.ViaggiDisponibili-wrapper,
.ViaggiDisponibili-wrapper * {
  box-sizing: border-box;
}

.ViaggiDisponibili-wrapper {
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
  background-image: url('/Sfondo.jpg');
  background-size: cover;
  background-position: center;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

/* Sfumatura scura in alto, per far risaltare il menu hamburger */
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

.btn-vediviaggio {
  background-color: #d81b60;
  color: white;
  padding: 12px 25px;
  border-radius: 30px;
  border: none;
  font-weight: bold;
  cursor: pointer;
  transition: opacity 0.3s;
}

.btn-vediviaggio:disabled {
  background-color: #ccc;
  cursor: not-allowed;
  opacity: 0.6;
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
