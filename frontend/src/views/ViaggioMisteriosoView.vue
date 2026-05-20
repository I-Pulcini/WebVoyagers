<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { userStore } from '../stores/userStore'
import { prenotazioneStore } from '../stores/prenotazioneStore'



// Abbiamo importato il router per reindirizzare l'utente alla pagina di conferma dopo la prenotazione
const router = useRouter()

// Abbiamo creato le variabili reattive 
const continente = ref('')
const dataPartenza = ref('')
const durata = ref('')
const budget = ref('')
const tipoEsperienza = ref('')
const numeroViaggiatori = ref(1)
const note = ref('')

// Abbiamo creato la variabile per gestire eventuali messaggi di errore del form
const errore = ref('')

// Abbiamo definito le opzioni selezionabili nei vari menu a tendina
const continenti = [
  { value: 'qualsiasi', label: 'Sorprendimi! (qualsiasi continente)' },
  { value: 'europa', label: 'Europa' },
  { value: 'asia', label: 'Asia' },
  { value: 'africa', label: 'Africa' },
  { value: 'americhe', label: 'Americhe' },
  { value: 'oceania', label: 'Oceania' }
]

const durate = [
  { value: '3-5', label: '3-5 giorni (weekend lungo)' },
  { value: '6-10', label: '6-10 giorni (vacanza classica)' },
  { value: '11-15', label: '11-15 giorni (immersione)' },
  { value: '16+', label: 'Oltre 15 giorni (avventura epica)' }
]

const budgets = [
  { value: 'economico', label: 'Economico (fino a 1.500€)', stelle: '€' },
  { value: 'medio', label: 'Medio (1.500€ - 3.500€)', stelle: '€€' },
  { value: 'premium', label: 'Premium (3.500€ - 6.000€)', stelle: '€€€' },
  { value: 'luxury', label: 'Luxury (oltre 6.000€)', stelle: '€€€€' }
]

const tipiEsperienza = [
  { value: 'avventura', label: '⛰️ Avventura e natura' },
  { value: 'cultura', label: '🏛️ Cultura e storia' },
  { value: 'mare', label: '🏖️ Mare e relax' },
  { value: 'cibo', label: '🍜 Cibo e tradizioni' },
  { value: 'metropoli', label: '🌆 Metropoli e vita urbana' },
  { value: 'sorpresa', label: '🎲 Lasciami stupire!' }
]

// Abbiamo creato una variabile calcolata che dice se il form è valido
const formValido = computed(() => {
  return continente.value && dataPartenza.value && durata.value && 
         budget.value && tipoEsperienza.value && numeroViaggiatori.value > 0
})

// Abbiamo creato la funzione asincrona che gestisce l'invio del form al backend
const inviaPrenotazione = async () => {
  errore.value = ''

  // Abbiamo verificato che l'utente sia loggato prima di permettere la prenotazione
  if (!userStore.loggato) {
    errore.value = 'Devi essere loggato per prenotare un viaggio misterioso.'
    return
  }

  // Abbiamo verificato che tutti i campi obbligatori siano compilati
  if (!formValido.value) {
    errore.value = 'Compila tutti i campi del form per continuare.'
    return
  }

  // Abbiamo verificato che la data di partenza sia futura
  const oggi = new Date()
  oggi.setHours(0, 0, 0, 0)
  const partenza = new Date(dataPartenza.value)
  if (partenza < oggi) {
    errore.value = 'La data di partenza deve essere futura.'
    return
  }

  try {
    // Abbiamo chiamato il backend inviando tutti i dati del form e includendo il cookie di sessione
    const response = await fetch('/api/prenota-misterioso', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        continente: continente.value,
        dataPartenza: dataPartenza.value,
        durata: durata.value,
        budget: budget.value,
        tipoEsperienza: tipoEsperienza.value,
        numeroViaggiatori: numeroViaggiatori.value,
        note: note.value
      })
    })

    // Abbiamo trasformato la risposta JSON in oggetto JavaScript
    const data = await response.json()

    if (response.ok) {
      // Abbiamo costruito un oggetto con i criteri scelti dall'utente per conservarli nello store
      const criteri = {
        continente: continente.value,
        dataPartenza: dataPartenza.value,
        durata: durata.value,
        budget: budget.value,
        tipoEsperienza: tipoEsperienza.value,
        numeroViaggiatori: numeroViaggiatori.value,
        note: note.value
      }
      // Abbiamo salvato tutti i dati della prenotazione nello store globale (criteri, viaggio scelto, simili, codice)
      prenotazioneStore.set(criteri, data.viaggioScelto, data.viaggiSimili, data.codice)
      // Abbiamo reindirizzato l'utente alla pagina dedicata di conferma con le 3 carte indizio
      router.push('/viaggio-misterioso/conferma')
    } else {
      // Abbiamo mostrato l'errore restituito dal backend (es. nessuna destinazione compatibile)
      errore.value = data.error || 'Errore durante la prenotazione. Riprova più tardi.'
    }
  } catch (err) {
    // Abbiamo gestito gli errori di rete che impediscono la comunicazione con il server
    console.error('Errore nella chiamata al backend:', err)
    errore.value = 'Errore di connessione al server. Verifica che il backend sia attivo.'
  }
}
</script>

<template>
  <div class="ViaggioMisterioso-wrapper">

   
    <header class="header-mistero">
      <div class="overlay-stelle"></div>
      <div class="header-content">
        <div class="icona-mistero">🎁</div>
        <h1 class="titolo-pagina">VIAGGIO MISTERIOSO</h1>
        <p class="sottotitolo-pagina">
          Scegli quando, scegli quanto. Alla destinazione ci pensiamo noi.<br>
          Scoprirai dove andrai solo <strong>7 giorni prima della partenza</strong>!
        </p>
      </div>
    </header>

   
    <main class="contenuto-principale">

   
      <div v-if="!userStore.loggato" class="avviso-login">
        ⚠️ Per prenotare un viaggio misterioso devi prima
        <RouterLink to="/login">accedere o registrarti</RouterLink>.
      </div>

      <h2 class="titolo-form">Indica le tue preferenze di viaggio</h2>
<p class="testo-intro">
  Più dettagliate saranno le informazioni fornite, più accurato sarà il viaggio selezionato per te.
</p>

      <div v-if="errore" class="messaggio-errore">{{ errore }}</div>

      <form @submit.prevent="inviaPrenotazione" class="form-mistero">

      
        <div class="form-group">
          <label>🌍 Continente preferito</label>
          <div class="opzioni-grid">
            <label v-for="c in continenti" :key="c.value" 
                   :class="['opzione-card', { selezionata: continente === c.value }]">
              <input type="radio" v-model="continente" :value="c.value" />
              <span>{{ c.label }}</span>
            </label>
          </div>
        </div>

     
        <div class="form-group">
          <label for="data">📅 Quando vuoi partire?</label>
          <input id="data" type="date" v-model="dataPartenza" />
        </div>


        <div class="form-group">
          <label for="durata">⏱️ Durata del viaggio</label>
          <select id="durata" v-model="durata">
            <option value="" disabled>Seleziona la durata...</option>
            <option v-for="d in durate" :key="d.value" :value="d.value">{{ d.label }}</option>
          </select>
        </div>

        <div class="form-group">
          <label>💰 Qual è il tuo budget? (a persona)</label>
          <div class="opzioni-grid budget-grid">
            <label v-for="b in budgets" :key="b.value" 
                   :class="['opzione-card', 'opzione-budget', { selezionata: budget === b.value }]">
              <input type="radio" v-model="budget" :value="b.value" />
              <span class="budget-stelle">{{ b.stelle }}</span>
              <span class="budget-label">{{ b.label }}</span>
            </label>
          </div>
        </div>

  
        <div class="form-group">
          <label>✨ Che tipo di esperienza cerchi?</label>
          <div class="opzioni-grid esperienza-grid">
            <label v-for="t in tipiEsperienza" :key="t.value" 
                   :class="['opzione-card', { selezionata: tipoEsperienza === t.value }]">
              <input type="radio" v-model="tipoEsperienza" :value="t.value" />
              <span>{{ t.label }}</span>
            </label>
          </div>
        </div>

        
        <div class="form-group">
          <label for="viaggiatori">👥 Quanti siete?</label>
          <input id="viaggiatori" type="number" v-model="numeroViaggiatori" min="1" max="20" />
        </div>

    
        <div class="form-group">
          <label for="note">📝 Vuoi aggiungere qualcosa? (opzionale)</label>
          <textarea id="note" rows="4" v-model="note" 
                    placeholder="Es: sono allergico ai frutti di mare, viaggio con un bambino piccolo, preferisco posti tranquilli..."></textarea>
        </div>

        <button type="submit" class="btn-prenota" :disabled="!userStore.loggato">
          🎁 Prenota il mio viaggio misterioso
        </button>
      </form>

 
      <section class="come-funziona">
        <h3>Come funziona?</h3>
        <div class="steps-mistero">
          <div class="step-mistero">
            <div class="step-num">1</div>
            <p>Compili il form con le tue preferenze</p>
          </div>
          <div class="step-mistero">
            <div class="step-num">2</div>
            <p>I nostri esperti studiano il viaggio perfetto per te</p>
          </div>
          <div class="step-mistero">
            <div class="step-num">3</div>
            <p>7 giorni prima della partenza, scopri la destinazione</p>
          </div>
          <div class="step-mistero">
            <div class="step-num">4</div>
            <p>Prepari la valigia e parti per l'avventura!</p>
          </div>
        </div>
      </section>

    </main>
  </div>
</template>

<style scoped>
.ViaggioMisterioso-wrapper,
.ViaggioMisterioso-wrapper * {
  box-sizing: border-box;
}

.ViaggioMisterioso-wrapper {
  background-color: #f9f9f9;
  min-height: 100vh;
  width: 100%;
  font-family: sans-serif;
  overflow-x: hidden;
  color: #333;
}

.header-mistero {
  background: linear-gradient(135deg, #1a237e 0%, #4527a0 50%, #6a1b9a 100%);
  width: 100%;
  padding: 100px 5% 80px 5%;
  color: white;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.overlay-stelle {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    radial-gradient(2px 2px at 20% 30%, white, transparent),
    radial-gradient(2px 2px at 60% 70%, white, transparent),
    radial-gradient(1px 1px at 50% 50%, white, transparent),
    radial-gradient(1px 1px at 80% 10%, white, transparent),
    radial-gradient(2px 2px at 90% 60%, white, transparent),
    radial-gradient(1px 1px at 33% 80%, white, transparent),
    radial-gradient(1px 1px at 15% 90%, white, transparent);
  opacity: 0.4;
  pointer-events: none;
}

.header-content {
  position: relative;
  z-index: 2;
  max-width: 900px;
  margin: 0 auto;
}

.icona-mistero {
  font-size: 5rem;
  margin-bottom: 20px;
  animation: floating 3s ease-in-out infinite;
}

@keyframes floating {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-15px); }
}

.titolo-pagina {
  font-size: clamp(2rem, 5vw, 3.8rem);
  font-weight: 900;
  margin: 0 0 20px 0;
  letter-spacing: 4px;
  text-shadow: 2px 2px 10px rgba(0,0,0,0.5);
}

.sottotitolo-pagina {
  font-size: clamp(1rem, 1.5vw, 1.3rem);
  margin: 0;
  line-height: 1.7;
  opacity: 0.95;
}


.contenuto-principale {
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  padding: 60px 5%;
}

.avviso-login {
  background-color: #fff3cd;
  color: #856404;
  padding: 15px 20px;
  border-radius: 8px;
  margin-bottom: 30px;
  border-left: 4px solid #ffc107;
}

.avviso-login a {
  color: #d81b60;
  font-weight: bold;
}

.titolo-form {
  font-size: clamp(1.6rem, 3vw, 2.2rem);
  color: #333;
  margin-bottom: 10px;
  text-align: center;
}

.testo-intro {
  color: #777;
  text-align: center;
  margin-bottom: 40px;
  font-size: 1.05rem;
}

.messaggio-errore {
  background-color: #fce4ec;
  color: #d81b60;
  padding: 15px 20px;
  border-radius: 8px;
  margin-bottom: 25px;
  border-left: 4px solid #d81b60;
  font-weight: bold;
}

.form-mistero {
  display: flex;
  flex-direction: column;
  gap: 35px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-weight: bold;
  margin-bottom: 12px;
  color: #333;
  font-size: 1.05rem;
}

.form-group input[type="date"],
.form-group input[type="number"],
.form-group select,
.form-group textarea {
  padding: 14px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  font-family: inherit;
  background-color: white;
  transition: border-color 0.3s, box-shadow 0.3s;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #00c4b4;
  box-shadow: 0 0 0 3px rgba(0,196,180,0.15);
}

.form-group textarea {
  resize: vertical;
}


.opzioni-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.budget-grid {
  grid-template-columns: repeat(2, 1fr);
}

.esperienza-grid {
  grid-template-columns: repeat(3, 1fr);
}

.opzione-card {
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  padding: 18px 15px;
  cursor: pointer;
  text-align: center;
  font-size: 0.95rem;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
}

.opzione-card:hover {
  border-color: #00c4b4;
  transform: translateY(-2px);
}

.opzione-card.selezionata {
  border-color: #00c4b4;
  background-color: #e0f7f5;
  color: #00897b;
  font-weight: bold;
}

.opzione-card input[type="radio"] {
  display: none;
}

.opzione-budget {
  padding: 22px 15px;
}

.budget-stelle {
  font-size: 1.5rem;
  color: #d81b60;
  font-weight: bold;
}

.budget-label {
  font-size: 0.85rem;
}

.btn-prenota {
  background: linear-gradient(135deg, #d81b60 0%, #6a1b9a 100%);
  color: white;
  border: none;
  padding: 18px 40px;
  border-radius: 50px;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.3s;
  margin-top: 10px;
  box-shadow: 0 6px 15px rgba(216, 27, 96, 0.3);
}

.btn-prenota:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 10px 25px rgba(216, 27, 96, 0.4);
}

.btn-prenota:disabled {
  background: #ccc;
  cursor: not-allowed;
  box-shadow: none;
}


.come-funziona {
  margin-top: 80px;
  padding: 50px 30px;
  background: white;
  border-radius: 15px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.05);
}

.come-funziona h3 {
  text-align: center;
  font-size: 1.8rem;
  color: #00c4b4;
  margin-bottom: 40px;
}

.steps-mistero {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.step-mistero {
  text-align: center;
}

.step-num {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #00c4b4 0%, #d81b60 100%);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0 auto 15px auto;
}

.step-mistero p {
  color: #555;
  font-size: 0.95rem;
  line-height: 1.5;
  margin: 0;
}

@media (max-width: 768px) {
  .opzioni-grid,
  .esperienza-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .budget-grid {
    grid-template-columns: 1fr;
  }
  .steps-mistero {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .opzioni-grid,
  .esperienza-grid,
  .steps-mistero {
    grid-template-columns: 1fr;
  }
}
</style>
