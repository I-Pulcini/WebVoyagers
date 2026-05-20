<script setup>
import { ref, onMounted, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { userStore } from '../stores/userStore'



// Abbiamo creato la variabile reattiva che conterrà le recensioni dal backend
const recensioni = ref([])
// Abbiamo creato la variabile per gestire lo stato di caricamento
const caricamentoRecensioni = ref(true)

// Variabili per il form di nuova recensione
const formAperto = ref(false)
const stelleScelte = ref(0)
const stelleHover = ref(0)
const titoloRecensione = ref('')
const testoRecensione = ref('')
const erroreRecensione = ref('')
const successoRecensione = ref('')
const inviandoRecensione = ref(false)

// Abbiamo creato la funzione asincrona che carica le recensioni dal backend
const caricaRecensioni = async () => {
  try {
    const response = await fetch('/api/recensioni')
    const data = await response.json()
    if (response.ok) {
      recensioni.value = data.recensioni
    }
  } catch (err) {
    console.error('Errore nel caricamento recensioni:', err)
  } finally {
    caricamentoRecensioni.value = false
  }
}


const votoMedio = computed(() => {
  if (recensioni.value.length === 0) return '5.0'
  const somma = recensioni.value.reduce((acc, r) => acc + r.stelle, 0)
  return (somma / recensioni.value.length).toFixed(1)
})

// Abbiamo creato la funzione che apre il form di scrittura recensione
const apriForm = () => {
  if (!userStore.loggato) {
    alert('Devi essere loggato per scrivere una recensione!')
    return
  }
  formAperto.value = true
  erroreRecensione.value = ''
  successoRecensione.value = ''
}

// Abbiamo creato la funzione che chiude il form
const chiudiForm = () => {
  formAperto.value = false
  stelleScelte.value = 0
  titoloRecensione.value = ''
  testoRecensione.value = ''
  erroreRecensione.value = ''
}

// Abbiamo creato la funzione asincrona che invia la recensione al backend
const inviaRecensione = async () => {
  erroreRecensione.value = ''
  successoRecensione.value = ''
  
  if (stelleScelte.value === 0) {
    erroreRecensione.value = 'Scegli quante stelle dare!'
    return
  }
  if (!titoloRecensione.value.trim() || !testoRecensione.value.trim()) {
    erroreRecensione.value = 'Compila titolo e testo della recensione.'
    return
  }
  
  inviandoRecensione.value = true
  
  try {
    const response = await fetch('/api/recensioni', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        stelle: stelleScelte.value,
        titolo: titoloRecensione.value,
        testo: testoRecensione.value
      })
    })
    
    const data = await response.json()
    
    if (response.ok) {
      successoRecensione.value = data.message
      // Abbiamo svuotato i campi del form
      stelleScelte.value = 0
      titoloRecensione.value = ''
      testoRecensione.value = ''
      // Abbiamo chiuso il form dopo 3 secondi
      setTimeout(() => {
        chiudiForm()
      }, 3000)
    } else {
      erroreRecensione.value = data.error || 'Errore durante l\'invio.'
    }
  } catch (err) {
    console.error('Errore:', err)
    erroreRecensione.value = 'Errore di connessione al server.'
  } finally {
    inviandoRecensione.value = false
  }
}

// Abbiamo creato una funzione che formatta il tempo in modo "umano"
const tempoTrascorso = (dataIso) => {
  const data = new Date(dataIso)
  const ora = new Date()
  const diffMs = ora - data
  const diffGiorni = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffGiorni === 0) return 'Oggi'
  if (diffGiorni === 1) return 'Ieri'
  if (diffGiorni < 7) return `${diffGiorni} giorni fa`
  if (diffGiorni < 30) return `${Math.floor(diffGiorni / 7)} settimane fa`
  if (diffGiorni < 365) return `${Math.floor(diffGiorni / 30)} mesi fa`
  return `${Math.floor(diffGiorni / 365)} anni fa`
}

// Abbiamo creato la funzione che restituisce le stelle visualizzate (★★★★☆ ecc.)
const renderStelle = (numStelle) => '★'.repeat(numStelle) + '☆'.repeat(5 - numStelle)

// Carichiamo le recensioni al montaggio della pagina
onMounted(() => {
  caricaRecensioni()
})

const steps = [
  { numero: '01', titolo: 'Scegli', descrizione: 'Filtra per Paese, periodo e budget. Trova la destinazione perfetta tra le nostre proposte.' },
  { numero: '02', titolo: 'Prenota', descrizione: 'Prenota il viaggio direttamente sul sito in pochi click, senza intermediari.' },
  { numero: '03', titolo: 'Viaggia', descrizione: 'Parti con il tuo gruppo e vivi un\'esperienza autentica, guidato dai nostri coordinatori esperti.' },
  { numero: '04', titolo: 'Torna a casa', descrizione: 'Torna con ricordi, foto e nuove amicizie. E magari prenota già il prossimo!' }
]

const inclusi = [
  { icona: '✈️', titolo: 'Voli A/R', descrizione: 'Voli internazionali inclusi nel prezzo' },
  { icona: '🏨', titolo: 'Alloggi', descrizione: 'Hotel, riad e strutture selezionate' },
  { icona: '🗺️', titolo: 'Itinerario', descrizione: 'Programma completo giorno per giorno' },
  { icona: '👥', titolo: 'Coordinatore', descrizione: 'Una guida esperta italiana sempre con voi' },
  { icona: '🛡️', titolo: 'Assicurazione', descrizione: 'Polizza medico-bagaglio inclusa' }
]

const founders = [
  { nome: 'Valerio Balducci', ruolo: 'Co-Founder & Travel Designer', handle: '@valerio_wv' },
  { nome: 'Elisa Baldinelli', ruolo: 'Co-Founder & Coordinatrice', handle: '@elisa_wv' }
]
</script>

<template>
  <div class="ChiSiamo-wrapper">

  
    <header class="fascia-foto">
      <div class="overlay-testo">
        <h1 class="fascia-titolo">CHI SIAMO</h1>
        <p class="sottotitolo-header">
          Viaggi di gruppo ai confini della terra.<br>
          Chi viaggia con noi, vola davvero!
        </p>
      </div>
    </header>

 
    <section class="sezione-descrizione">
      <h2 class="titolo-sezione">WebVoyagers: il Tour Operator per Viaggi di Gruppo Unici</h2>
      <p>
        <strong>WebVoyagers</strong> non è il solito tour operator. Siamo la realtà nata dalla
        visione di <strong>viaggiatori professionisti</strong> per chi, come te, cerca un modo
        autentico di esplorare il mondo. Organizziamo <strong>viaggi di gruppo unici</strong>
        e itinerari esperienziali tutto l'anno, portandoti negli angoli più remoti e affascinanti
        del pianeta attraverso <strong>viaggi progettati nei minimi dettagli</strong>.
      </p>
      <p>
        La qualità e l'autenticità dei nostri viaggi sono garantite personalmente dai nostri
        fondatori. Ogni meta, ogni percorso e ogni attività portano la firma di chi il viaggio
        lo vive sulla propria pelle.
      </p>
      <p class="impegno">
        Il nostro impegno è semplice:
        <strong>non vivrai mai un'esperienza che noi stessi non abbiamo già testato</strong>
        o che non sceglieremmo per noi. Questo è il nostro marchio di garanzia.
      </p>
    </section>

 
    <section class="sezione-steps">
      <h2 class="titolo-sezione">Come viaggiare con WebVoyagers?</h2>
      <div class="steps-grid">
        <div v-for="step in steps" :key="step.numero" class="step-card">
          <div class="step-numero">{{ step.numero }}</div>
          <h3>{{ step.titolo }}</h3>
          <p>{{ step.descrizione }}</p>
        </div>
      </div>
    </section>

 
    <section class="sezione-inclusi">
      <h2 class="titolo-sezione">Cosa include un viaggio WebVoyagers?</h2>
      <p class="testo-intro">
        <strong>Il prezzo che vedi è quello che paghi.</strong> Nessuna sorpresa, nessun costo nascosto.
      </p>
      <div class="inclusi-grid">
        <div v-for="item in inclusi" :key="item.titolo" class="incluso-card">
          <div class="incluso-icona">{{ item.icona }}</div>
          <h4>{{ item.titolo }}</h4>
          <p>{{ item.descrizione }}</p>
        </div>
      </div>
    </section>

  
    <section class="sezione-statistica">
      <p class="stat-label">Con noi hanno già viaggiato</p>
      <h2 class="stat-numero">10.000</h2>
      <p class="stat-sublabel">persone</p>
      <RouterLink to="/viaggi-disponibili" class="btn-cta">Unisciti anche tu!</RouterLink>
    </section>

 
    <section class="sezione-recensioni">
      <h2 class="titolo-sezione">Cosa dicono di noi</h2>
      <p class="testo-intro" v-if="recensioni.length > 0">
        Valutata <strong>{{ votoMedio }}</strong> su 5 sulla base di 
        {{ recensioni.length }} {{ recensioni.length === 1 ? 'recensione' : 'recensioni' }}
      </p>
      <p class="testo-intro" v-else-if="!caricamentoRecensioni">
        Sii il primo a recensirci dopo il tuo viaggio!
      </p>

    
      <div v-if="caricamentoRecensioni" class="caricamento-recensioni">
        ⏳ Caricamento recensioni...
      </div>

    
      <div v-else-if="recensioni.length > 0" class="recensioni-grid">
        <div v-for="r in recensioni" :key="r.id" class="recensione-card">
          <div class="stelle">{{ renderStelle(r.stelle) }}</div>
          <h4>{{ r.titolo }}</h4>
          <p class="recensione-testo">{{ r.testo }}</p>
          <p class="recensione-autore">
            {{ r.username || 'Utente anonimo' }}, 
            <span>{{ tempoTrascorso(r.data_creazione) }}</span>
          </p>
        </div>
      </div>

     
      <div class="cta-recensione" v-if="!formAperto">
        <button @click="apriForm" class="btn-scrivi-recensione">
          ✍️ Scrivi una recensione
        </button>
        <p v-if="!userStore.loggato" class="cta-info">
          Per scrivere devi essere loggato e aver almeno una prenotazione.
        </p>
      </div>

   
      <div v-else class="form-recensione-wrapper">
        <h3 class="form-recensione-titolo">✍️ Scrivi la tua recensione</h3>

        <div v-if="erroreRecensione" class="form-errore">⚠️ {{ erroreRecensione }}</div>
        <div v-if="successoRecensione" class="form-successo">✓ {{ successoRecensione }}</div>

        <div class="form-recensione">
         //stelle interattive
          <div class="form-row">
            <label>Quanto è stato bello il tuo viaggio?</label>
            <div class="stelle-input">
              <span 
                v-for="n in 5" 
                :key="n"
                @click="stelleScelte = n"
                @mouseover="stelleHover = n"
                @mouseleave="stelleHover = 0"
                :class="['stella-clickabile', { 'attiva': n <= (stelleHover || stelleScelte) }]"
              >★</span>
            </div>
            <span class="stelle-feedback" v-if="stelleScelte">
              {{ stelleScelte }} {{ stelleScelte === 1 ? 'stella' : 'stelle' }}
            </span>
          </div>

          <div class="form-row">
            <label for="titolo-rec">Titolo</label>
            <input 
              id="titolo-rec"
              type="text" 
              v-model="titoloRecensione" 
              placeholder="Es. Esperienza indimenticabile!"
              maxlength="150"
              :disabled="inviandoRecensione"
            />
          </div>

          <div class="form-row">
            <label for="testo-rec">La tua recensione</label>
            <textarea 
              id="testo-rec"
              v-model="testoRecensione" 
              rows="5"
              placeholder="Raccontaci com'è andata..."
              maxlength="2000"
              :disabled="inviandoRecensione"
            ></textarea>
          </div>

          <div class="form-azioni">
            <button @click="chiudiForm" class="btn-annulla-rec" :disabled="inviandoRecensione">
              Annulla
            </button>
            <button @click="inviaRecensione" class="btn-invia-rec" :disabled="inviandoRecensione">
              <span v-if="inviandoRecensione">⏳ Invio...</span>
              <span v-else>📤 Invia recensione</span>
            </button>
          </div>
        </div>
      </div>

    </section>

   
    <section class="sezione-founders">
      <h2 class="titolo-sezione">Con chi WebVoyagers?</h2>
      <p class="founders-subtitle">I nostri founders</p>
      <div class="founders-grid">
        <div v-for="f in founders" :key="f.nome" class="founder-card">
          <div class="founder-avatar">{{ f.nome.charAt(0) }}</div>
          <h4>{{ f.nome }}</h4>
          <p class="founder-ruolo">{{ f.ruolo }}</p>
          <p class="founder-handle">{{ f.handle }}</p>
        </div>
      </div>
      <p class="founders-claim">
        Due viaggiatori, una sola idea: rendere ogni viaggio un'esperienza autentica e indimenticabile.
      </p>
    </section>

  </div>
</template>

<style scoped>
.ChiSiamo-wrapper,
.ChiSiamo-wrapper * {
  box-sizing: border-box;
}

.ChiSiamo-wrapper {
  background-color: #ffffff;
  min-height: 100vh;
  width: 100%;
  font-family: sans-serif;
  overflow-x: hidden;
  color: #333;
}


.fascia-foto {
  width: 100%;
  height: 70vh;
  background-image: url('/Sfondo4.jpg');
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
  top: 0; left: 0; right: 0; bottom: 0;
  background: linear-gradient(to bottom, rgba(0,0,0,0.45), rgba(0,0,0,0.25));
  z-index: 1;
}

.overlay-testo {
  position: relative;
  z-index: 2;
  padding: 40px 20px;
  color: white;
  width: 100%;
}

.fascia-titolo {
  font-size: clamp(2.5rem, 6vw, 5rem);
  font-weight: bold;
  letter-spacing: 6px;
  margin-bottom: 25px;
  text-transform: uppercase;
  text-shadow: 2px 2px 10px rgba(0,0,0,0.6);
}

.sottotitolo-header {
  font-size: clamp(1rem, 1.5vw, 1.4rem);
  max-width: 800px;
  margin: 0 auto;
  line-height: 1.7;
  text-shadow: 1px 1px 4px rgba(0,0,0,0.6);
}


.titolo-sezione {
  font-size: clamp(1.6rem, 3vw, 2.4rem);
  color: #00c4b4;
  text-align: center;
  margin-bottom: 30px;
  font-weight: bold;
}

.testo-intro {
  text-align: center;
  font-size: 1.1rem;
  max-width: 800px;
  margin: 0 auto 40px auto;
  line-height: 1.6;
  color: #555;
}


.sezione-descrizione {
  max-width: 1000px;
  margin: 0 auto;
  padding: 80px 5%;
  text-align: center;
}

.sezione-descrizione p {
  font-size: 1.05rem;
  line-height: 1.8;
  margin-bottom: 25px;
  color: #444;
}

.sezione-descrizione .impegno {
  margin-top: 30px;
  font-style: italic;
  color: #d81b60;
}


.sezione-steps {
  background-color: #f9f9f9;
  padding: 80px 5%;
}

.steps-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 25px;
  max-width: 1300px;
  margin: 0 auto;
}

.step-card {
  background-color: #00c4b4;
  color: white;
  padding: 40px 25px;
  border-radius: 12px;
  text-align: center;
  transition: transform 0.3s, box-shadow 0.3s;
}

.step-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 10px 25px rgba(0,196,180,0.3);
}

.step-numero {
  font-size: 3rem;
  font-weight: bold;
  margin-bottom: 15px;
  color: rgba(255,255,255,0.5);
}

.step-card h3 {
  font-size: 1.5rem;
  margin-bottom: 15px;
}

.step-card p {
  font-size: 0.95rem;
  line-height: 1.5;
  opacity: 0.95;
}


.sezione-inclusi {
  padding: 80px 5%;
  max-width: 1300px;
  margin: 0 auto;
}

.inclusi-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 20px;
}

.incluso-card {
  text-align: center;
  padding: 25px 15px;
}

.incluso-icona {
  width: 100px;
  height: 100px;
  margin: 0 auto 20px auto;
  background-color: #00c4b4;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  color: white;
}

.incluso-card h4 {
  font-size: 1.1rem;
  margin-bottom: 10px;
  color: #333;
}

.incluso-card p {
  font-size: 0.9rem;
  color: #666;
  line-height: 1.5;
}


.sezione-statistica {
  background-color: #00c4b4;
  color: white;
  padding: 80px 5%;
  text-align: center;
}

.stat-label {
  font-size: 1.5rem;
  margin-bottom: 10px;
  font-weight: 300;
}

.stat-numero {
  font-size: clamp(4rem, 12vw, 9rem);
  font-weight: 900;
  line-height: 1;
  margin: 0;
  letter-spacing: -2px;
}

.stat-sublabel {
  font-size: 1.5rem;
  margin-top: 10px;
  margin-bottom: 35px;
}

.btn-cta {
  display: inline-block;
  background-color: white;
  color: #d81b60;
  padding: 18px 45px;
  border-radius: 50px;
  font-size: 1.2rem;
  font-weight: bold;
  text-decoration: none;
  transition: transform 0.3s, box-shadow 0.3s;
}

.btn-cta:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 20px rgba(0,0,0,0.2);
}

.sezione-recensioni {
  background-color: #f9f9f9;
  padding: 80px 5%;
}

.caricamento-recensioni {
  text-align: center;
  color: #888;
  padding: 60px 20px;
  font-size: 1.1rem;
}

.recensioni-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  max-width: 1300px;
  margin: 0 auto 40px auto;
}

.recensione-card {
  background-color: white;
  padding: 25px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.stelle {
  color: #f57c00;
  font-size: 1.3rem;
  letter-spacing: 2px;
  margin-bottom: 10px;
}

.recensione-card h4 {
  font-size: 1.05rem;
  margin-bottom: 12px;
  color: #333;
}

.recensione-testo {
  font-size: 0.9rem;
  line-height: 1.6;
  color: #555;
  margin-bottom: 15px;
  white-space: pre-wrap;
}

.recensione-autore {
  font-size: 0.85rem;
  color: #333;
  font-weight: bold;
}

.recensione-autore span {
  color: #999;
  font-weight: normal;
}


.cta-recensione {
  text-align: center;
  margin-top: 40px;
}

.btn-scrivi-recensione {
  background: linear-gradient(135deg, #d81b60 0%, #6a1b9a 100%);
  color: white;
  border: none;
  padding: 16px 36px;
  border-radius: 30px;
  font-size: 1.05rem;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.3s;
  box-shadow: 0 6px 15px rgba(216, 27, 96, 0.3);
}

.btn-scrivi-recensione:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 25px rgba(216, 27, 96, 0.4);
}

.cta-info {
  margin-top: 12px;
  color: #888;
  font-size: 0.9rem;
  font-style: italic;
}


.form-recensione-wrapper {
  max-width: 700px;
  margin: 40px auto 0 auto;
  background: white;
  border-radius: 15px;
  padding: 40px 30px;
  box-shadow: 0 8px 25px rgba(0,0,0,0.08);
}

.form-recensione-titolo {
  text-align: center;
  margin: 0 0 25px 0;
  color: #6a1b9a;
}

.form-errore {
  background: #fce4ec;
  color: #d81b60;
  padding: 12px 18px;
  border-radius: 8px;
  border-left: 4px solid #d81b60;
  margin-bottom: 18px;
  font-weight: bold;
}

.form-successo {
  background: #e8f8f5;
  color: #00897b;
  padding: 12px 18px;
  border-radius: 8px;
  border-left: 4px solid #00c4b4;
  margin-bottom: 18px;
  font-weight: bold;
}

.form-recensione {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-row label {
  font-weight: bold;
  color: #333;
}

.form-row input,
.form-row textarea {
  padding: 12px 14px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  font-family: inherit;
  transition: border-color 0.3s;
}

.form-row input:focus,
.form-row textarea:focus {
  outline: none;
  border-color: #6a1b9a;
  box-shadow: 0 0 0 3px rgba(106,27,154,0.15);
}

.stelle-input {
  display: flex;
  gap: 8px;
  font-size: 2.5rem;
}

.stella-clickabile {
  cursor: pointer;
  color: #ddd;
  transition: color 0.2s, transform 0.2s;
  user-select: none;
}

.stella-clickabile.attiva {
  color: #f57c00;
}

.stella-clickabile:hover {
  transform: scale(1.15);
}

.stelle-feedback {
  color: #f57c00;
  font-weight: bold;
  margin-top: 4px;
}

.form-azioni {
  display: flex;
  gap: 12px;
  margin-top: 10px;
}

.btn-annulla-rec,
.btn-invia-rec {
  flex: 1;
  padding: 14px 20px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  border: none;
  transition: all 0.3s;
}

.btn-annulla-rec {
  background: #f5f5f5;
  color: #333;
}

.btn-annulla-rec:hover:not(:disabled) {
  background: #e0e0e0;
}

.btn-invia-rec {
  background: linear-gradient(135deg, #d81b60 0%, #6a1b9a 100%);
  color: white;
}

.btn-invia-rec:hover:not(:disabled) {
  transform: translateY(-2px);
}

.btn-annulla-rec:disabled,
.btn-invia-rec:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}


.sezione-founders {
  padding: 80px 5%;
  max-width: 900px;
  margin: 0 auto;
  text-align: center;
}

.founders-subtitle {
  font-size: 1.3rem;
  color: #00c4b4;
  margin-bottom: 50px;
}

.founders-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 40px;
  margin-bottom: 50px;
}

.founder-card {
  padding: 20px;
  text-align: center;
}

.founder-avatar {
  width: 160px;
  height: 160px;
  margin: 0 auto 25px auto;
  background: linear-gradient(135deg, #00c4b4 0%, #d81b60 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3.5rem;
  color: white;
  font-weight: bold;
  border: 4px solid white;
  box-shadow: 0 6px 18px rgba(0,0,0,0.15);
}

.founder-card h4 {
  font-size: 1.4rem;
  margin-bottom: 8px;
  color: #333;
}

.founder-ruolo {
  color: #666;
  font-size: 1rem;
  margin-bottom: 6px;
}

.founder-handle {
  color: #d81b60;
  font-size: 0.95rem;
  font-weight: bold;
}

.founders-claim {
  font-size: 1.1rem;
  font-style: italic;
  color: #555;
  max-width: 700px;
  margin: 0 auto;
  line-height: 1.6;
}


@media (max-width: 1024px) {
  .steps-grid,
  .recensioni-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .inclusi-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 600px) {
  .fascia-foto {
    height: 50vh;
  }
  .steps-grid,
  .recensioni-grid,
  .founders-grid,
  .inclusi-grid {
    grid-template-columns: 1fr;
  }
  .sezione-descrizione,
  .sezione-steps,
  .sezione-inclusi,
  .sezione-founders,
  .sezione-recensioni,
  .sezione-statistica {
    padding-left: 20px;
    padding-right: 20px;
  }
  .stelle-input {
    font-size: 2rem;
  }
}
</style>
