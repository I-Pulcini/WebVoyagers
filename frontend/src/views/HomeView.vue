<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

/* VUE ROUTER: Importiamo il router di Vue per poter cambiare pagina 
   senza ricaricare il browser (logica Single Page Application) */
const router = useRouter()

/* COMPOSITION API: Usiamo ref() per creare variabili reattive. 
   Quando queste cambiano, l'HTML si aggiorna da solo! */
const mesi = ref([])
const paesi = ref([])
// Lasciamo i due valori a stringa vuota così i menu mostrano sempre il placeholder all'apertura
const selectedMese = ref("")
const selectedPaese = ref("")
// Abbiamo creato una variabile per mostrare un eventuale errore se la combinazione non esiste
const erroreRicerca = ref('')

/* LIFECYCLE HOOKS: onMounted scatta non appena la pagina viene caricata.
   Qui facciamo la chiamata AJAX per prendere i dati dal JSON. */
onMounted(() => {
  // Abbiamo caricato il file destinazioni.json usando XMLHttpRequest puro (XHR).
  // È l'API tradizionale per fare AJAX (Asynchronous JavaScript And XML),
  // alternativa "classica" a fetch(). La usiamo qui in modo dimostrativo
  // per mostrare il pattern XHR completo: open + handler + send.
  // (Negli altri endpoint del progetto usiamo fetch per la sintassi più moderna basata su Promise.)
  
  // Abbiamo creato un nuovo oggetto XMLHttpRequest
  const xhr = new XMLHttpRequest()
  
  // Abbiamo registrato un handler che viene chiamato ad ogni cambio di stato (readyState).
  // I valori possibili di readyState sono:
  // 0 = UNSENT, 1 = OPENED, 2 = HEADERS_RECEIVED, 3 = LOADING, 4 = DONE.
  // Procediamo a leggere i dati solo quando readyState === 4 (DONE) e status === 200 (OK).
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        // Abbiamo deserializzato la stringa JSON ricevuta in un oggetto JavaScript
        const data = JSON.parse(xhr.responseText)
        mesi.value = data.mesi
        paesi.value = data.paesi
      } else {
        console.error("Errore XHR:", xhr.status, xhr.statusText)
      }
    }
  }
  
  // Abbiamo aperto la richiesta GET in modalità asincrona (terzo parametro = true)
  xhr.open('GET', '/destinazioni.json', true)
  
  // Abbiamo inviato la richiesta. Per le GET, send() viene chiamato senza argomenti.
  xhr.send()
})

/* GESTIONE EVENTI: Funzione chiamata al submit del form */
// Abbiamo cambiato la logica: invece di costruire un URL "vecchio stile" tipo /agosto_algeria,
// chiediamo al backend di trovare l'id del viaggio corrispondente nel DB e poi navighiamo
// alla pagina dinamica /viaggio/:id che è l'unica che esiste ora nel router.
const cercaDestinazione = async () => {
  if (!selectedMese.value || !selectedPaese.value) return
  
  erroreRicerca.value = ''
  
  // Salviamo nel LocalStorage l'ultima ricerca (utile per altre statistiche)
  localStorage.setItem("ultimaMeta", selectedPaese.value)
  
  try {
    // Abbiamo costruito le opzioni della richiesta in due passi:
// prima un oggetto base, poi lo arricchiamo con lo spread operator (...).
// Questo dimostra come spread permetta di estendere oggetti esistenti.
const opzioniBase = {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
}
const response = await fetch('/api/cerca-viaggio', {
  ...opzioniBase,
  body: JSON.stringify({
    // Abbiamo usato l'operatore nullish coalescing (??) per fornire stringhe vuote
    // di fallback se le ref dovessero per qualche motivo essere null o undefined.
    mese: selectedMese.value ?? '',
    destinazione: selectedPaese.value ?? ''
  })
})
    
    const data = await response.json()
    
    if (response.ok) {
      // Abbiamo trovato il viaggio: navighiamo alla pagina dinamica
      router.push(`/viaggio/${data.id}`)
    } else {
      // Nessun viaggio trovato per questa combinazione: andiamo alla pagina di errore
      router.push('/non-disponibile')
    }
  } catch (err) {
    console.error('Errore nella ricerca viaggio:', err)
    erroreRicerca.value = 'Errore di connessione al server.'
  }
}
</script>

<template>
  <div class="home-wrapper">
    <header>
      <h1 class="main-title">WebVoyagers</h1>
    </header>

    <main class="main-content">
      <form @submit.prevent="cercaDestinazione">
        
        <div class="form-group">
          <label for="parla">Quando? :</label>
          <select id="parla" v-model="selectedMese" required>
            <option value="" disabled>Scegli un periodo</option>
            <option v-for="mese in mesi" :key="mese" :value="mese">{{ mese }}</option>
          </select>
        </div>

        <div class="form-group">
          <label for="paese">Scegli un paese:</label>
          <select id="paese" v-model="selectedPaese" required>
            <option value="" disabled>Scegli una destinazione...</option>
            <option v-for="paese in paesi" :key="paese" :value="paese">{{ paese }}</option>
          </select>
        </div>

        <div class="form-group">
          <button type="submit" id="bottoneCerca">Cerca Destinazione</button>
        </div>
      </form>
    </main>
  </div>
</template>

<style scoped>
.home-wrapper {
  background-image: url('/web.jpg');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  min-height: 100vh;
  width: 100%;
  padding-top: 100px;
}

.main-title {
  text-align: center;
  color: white;
  font-size: 3.5em;
  margin-top: 20px;
  margin-bottom: 0;
  font-weight: 900;
  -webkit-text-stroke: 3px black;
  text-shadow: 2px 2px 5px rgba(0,0,0,0.5);
}

.main-content {
  margin-top: 25vh;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  background: rgba(100, 100, 100, 0.4);
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(0,0,0,0.2);
}

.form-group { margin-bottom: 20px; }

.form-group label {
  display: block;
  font-weight: bold;
  margin-bottom: 8px;
  color: #ffffff;
}

.form-group select, .form-group input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 16px;
}

#bottoneCerca {
  width: 100%;
  padding: 12px;
  margin-top: 15px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
}

@media (max-width: 768px) {
  .main-title { font-size: 2.5em; }
  .main-content {
    width: 90%;
    padding: 20px;
    margin-top: 15vh;
  }
}
</style>