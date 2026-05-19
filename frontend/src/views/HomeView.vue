<script setup>
import { ref, onMounted } from 'vue'  //importiamo la libreria ref e onMounted, ref serve per creare delle variabili reattive mentre onMounted serve per costruire HTML
import { useRouter } from 'vue-router'  //importiamo la funzione che serve per spostare l'utente da una pagina all'altra programmaticamente

const router = useRouter()  //variabile in cui salviamo il router

const mesi = ref([])
const paesi = ref([])  //creiamo due array reattivi vuoti, che servono per mostrare i paesi ed i mesi a tendina del form

const selectedMese = ref("")
const selectedPaese = ref("")  //sono due stringhe reattive vuote che verranno riempite quando l'utente selezionerà il mese ed il paese in tempo reale

const erroreRicerca = ref('')  //var. reattiva per un eventuale messaggio di errore

onMounted(() => {  //il codice qua dentro viene eseguito una sola volta, appena la pagina finisce di caricare

  const xhr = new XMLHttpRequest()  // Creiamo una nuova istanza di XMLHttpRequest, il metodo vecchio rispetto ad AJAX

  xhr.onreadystatechange = function() {  //handler chiamato ad ogni cambio di stato: procediamo solo quando readyState === 4 (DONE) e status === 200 (OK)
    if (xhr.readyState === 4) {   // significa se la richiesta completata il server ha finito di rispondere e si chiude la connessione
      if (xhr.status === 200) {   //status 200 è il coice HTTP che significa che tutto è andato a buon fine
        const data = JSON.parse(xhr.responseText)  //deserializziamo la stringa JSON ricevuta in un oggetto JavaScript
        mesi.value = data.mesi
        paesi.value = data.paesi
      } else {   //se il server risponde con errore
        console.error("Errore XHR:", xhr.status, xhr.statusText)   //stiamo l'errore
      }
    }
  }

  xhr.open('GET', '/destinazioni.json', true)  //apriamo la richiesta GET in modalità asincrona (terzo parametro = true)

  xhr.send()  //inviamo la richiesta; per le GET, send() viene chiamato senza argomenti
})

const cercaDestinazione = async () => {    //una funzione asincrona che scatterà quando l'utente clicca il bottone Cerca
//  if (!selectedMese.value || !selectedPaese.value) return   //se l'utente non ha seleszionato il mese o il paese ci sta errore

  erroreRicerca.value = ''

  localStorage.setItem("ultimaMeta", selectedPaese.value)  //salviamo il paese cercato nel LocalStorage 

  try {
    //costruiamo le opzioni della richiesta in due passi: prima un oggetto base, poi lo arricchiamo con lo spread operator
    const opzioniBase = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }
    const response = await fetch('/api/cerca-viaggio', {   //API 10.c
      ...opzioniBase,
      body: JSON.stringify({
        mese: selectedMese.value ?? '',       //usiamo l'operatore nullish coalescing (??) per fornire stringhe vuote di fallback
        destinazione: selectedPaese.value ?? ''
      })
    })

    const data = await response.json()

    if (response.ok) {
      router.push(`/viaggio/${data.id}`)  //viaggio trovato: navighiamo alla pagina dinamica
    } else {
      router.push('/non-disponibile')  //nessun viaggio trovato: andiamo alla pagina di errore
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
          <select id="parla" v-model="selectedMese" >
            <option value="" disabled>Scegli un periodo</option>
            <option v-for="mese in mesi" :key="mese" :value="mese">{{ mese }}</option>
          </select>
        </div>

        <div class="form-group">
          <label for="paese">Scegli un paese:</label>
          <select id="paese" v-model="selectedPaese" >
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
  background-image: url('/Socotra2.jpg');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.main-title {
  text-align: center;
  color: white;
  font-size: clamp(2.5rem, 8vw, 5rem);
  margin-bottom: 40px;
  font-weight: 900;
  -webkit-text-stroke: 3px black;
  text-shadow: 2px 2px 5px rgba(0,0,0,0.5);
}

.main-content {
  width: 100%;
  max-width: 560px;
  background: rgba(80, 80, 80, 0.5);
  backdrop-filter: blur(4px);
  padding: 35px 40px;
  border-radius: 14px;
  box-shadow: 0 8px 30px rgba(0,0,0,0.3);
}

.form-group { margin-bottom: 20px; }

.form-group label {
  display: block;
  font-weight: bold;
  margin-bottom: 8px;
  color: #ffffff;
}

.form-group select,
.form-group input {
  width: 100%;
  padding: 11px 14px;
  border: 1px solid #ccc;
  border-radius: 7px;
  font-size: 16px;
}

#bottoneCerca {
  width: 100%;
  padding: 13px;
  margin-top: 8px;
  background-color: #00c4b4;
  color: white;
  border: none;
  border-radius: 7px;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.25s, transform 0.2s;
}

#bottoneCerca:hover {
  background-color: #00a89a;
  transform: translateY(-2px);
}

@media (max-width: 600px) {
  .main-title { -webkit-text-stroke: 2px black; }
  .main-content { padding: 25px 20px; }
}
</style>
