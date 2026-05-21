<script setup>
import { ref, onMounted } from 'vue'  //importiamo la libreria ref e onMounted, ref serve per creare delle variabili reattive mentre onMounted serve per costruire HTML
import { useRouter } from 'vue-router'  //importiamo la funzione che serve per spostare l'utente da una pagina all'altra programmaticamente

const router = useRouter()  //variabile in cui salviamo il router

const mesi = ref([])
const paesi = ref([])  //creiamo due array reattivi vuoti, che servono per mostrare i paesi ed i mesi a tendina del form

const selectedMese = ref("")
const selectedPaese = ref("")  //sono due stringhe reattive vuote che verranno riempite quando l'utente selezionerà il mese ed il paese in tempo reale

const erroreRicerca = ref('')  //var. reattiva per un eventuale messaggio di errore

onMounted(async () => {  //il codice qua dentro viene eseguito una sola volta, appena la pagina finisce di caricare. async permette di usare await al suo interno

  try {
    const response = await fetch('/destinazioni.json')  //invia una richiesta HTTP GET al file 'destinazioni.json' e si mette in attesa della risposta del server senza bloccare il resto del browser
    if (response.ok) {  //se la risposta del server è andata a buon fine
      const data = await response.json()  //convertiamo il testo da JSON ad un oggetto JavaScript
      mesi.value = data.mesi  //assegna l'array dei mesi ricevuto dal JSON alla variabile reattiva mesi, aggiornando automaticamente l'interfaccia HTML
      paesi.value = data.paesi
    } else {
      console.error("Errore Fetch:", response.status)  //stampiamo l'errore se il server risponde con un codice diverso da 200
    }
  } catch (err) {
    console.error("Errore di connessione:", err)  //catturiamo eventuali errori di rete
  }
})

const cercaDestinazione = async () => {  //una funzione asincrona che scatterà quando l'utente clicca il bottone Cerca
  if (!selectedMese.value || !selectedPaese.value) return  //se l'utente non ha selezionato il mese o il paese usciamo subito

  erroreRicerca.value = ''

  localStorage.setItem("ultimaMeta", selectedPaese.value)  //salviamo il paese cercato nel LocalStorage

  try {
    const opzioniBase = {
      method: 'POST',  //richiesta POST, usata per inviare dati al server
      headers: { 'Content-Type': 'application/json' }  //informiamo il server che i dati che stiamo per mandare sono in formato JSON
    }
    const response = await fetch('/api/cerca-viaggio', {  //fetch() invia una richiesta HTTP al backend e si mette in attesa della risposta
      ...opzioniBase,  //dentro ci sta la copia di tutte le opzioniBase (method e headers), ... = spread operator
      body: JSON.stringify({  //convertiamo l'oggetto JavaScript in una stringa JSON
        mese: selectedMese.value ?? '',  //prendiamo il valore del mese selezionato; se è null o undefined, l'operatore ?? usa come fallback una stringa vuota
        destinazione: selectedPaese.value ?? ''
      })
    })

    const data = await response.json()

    if (response.ok) {
      router.push(`/viaggio/${data.id}`)  //viaggio trovato: router.push() serve per cambiare pagina
    } else {
      router.push('/non-disponibile')  //nessun viaggio trovato: reindirizza alla pagina di errore
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
//il contenitore a tendina si fa combinando i due tag; select che fa da contenitore principale e option che rappresentano le singole voci selezionabili dall'utente
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
  .home-wrapper {
    background-attachment: scroll !important;
    background-size: 100% auto !important;
    background-position: top center !important;
    background-repeat: no-repeat !important;
    justify-content: flex-start;
    padding-top: 40px;
  }
  .main-title { -webkit-text-stroke: 2px black; }
  .main-content { padding: 25px 20px; }
}
</style>
