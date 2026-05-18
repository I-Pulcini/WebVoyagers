<script setup>
import { ref, onMounted } from 'vue'  //importiamo la libreria ref e onMounted, ref serve per creare delle variabili reattive mentre onMounted serve per costruire HTML
import { useRouter } from 'vue-router'  //importiamo la funione che serve per spostare l'utente da una pagina all'altra programmaticamente


const router = useRouter()  //variabile in cui salviamo il router


const mesi = ref([])
const paesi = ref([])  //creiamo due array reattivi vuoti, che servono per mostrare i paesi ed i mesi a tendina del form

const selectedMese = ref("")
const selectedPaese = ref("")  //sono due stringhe reattivev vuote che verranno riempite quando l'utente selezionerà il mese ed il paese in tempo reale

const erroreRicerca = ref('')  //var. reattiva per un eventuale messaggio di errore


onMounted(() => {  //il codice qua dentro viene eseguito una sola volta, appena la pagina finisce di caricare

  const xhr = new XMLHttpRequest()  // Creiamo una nuova istanza di XMLHttpRequest, il metodo vecchio rispetto ad AJAX
  

 
  xhr.onreadystatechange = function() {  //
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
       
        const data = JSON.parse(xhr.responseText)
        mesi.value = data.mesi
        paesi.value = data.paesi
      } else {
        console.error("Errore XHR:", xhr.status, xhr.statusText)
      }
    }
  }

  xhr.open('GET', '/destinazioni.json', true)
  
  xhr.send()
})

const cercaDestinazione = async () => {
  if (!selectedMese.value || !selectedPaese.value) return
  
  erroreRicerca.value = ''

  localStorage.setItem("ultimaMeta", selectedPaese.value)
  
  try {
  
const opzioniBase = {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
}
const response = await fetch('/api/cerca-viaggio', {
  ...opzioniBase,
  body: JSON.stringify({
   
    mese: selectedMese.value ?? '',
    destinazione: selectedPaese.value ?? ''
  })
})
    
    const data = await response.json()
    
    if (response.ok) {
     
      router.push(`/viaggio/${data.id}`)
    } else {
     
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
