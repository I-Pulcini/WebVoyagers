<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { userStore } from '../stores/userStore'

/* --- PAGINA "LE MIE PRENOTAZIONI" --- */
/* Abbiamo creato una pagina che mostra tutte le prenotazioni dell'utente loggato:
   sia quelle dei viaggi misteriosi sia quelle dei viaggi normali.
   L'utente può passare dall'una all'altra cliccando sui due tab in cima.
   Per i viaggi normali può anche annullare una prenotazione dal bottone dedicato.
   Per i viaggi misteriosi l'annullamento e possibile solo finche la destinazione 
   non e stata rivelata (mancano piu di 7 giorni alla partenza). */

const router = useRouter()

// Abbiamo creato le variabili reattive per le due liste di prenotazioni
const prenotazioniMisteriose = ref([])
const prenotazioniViaggi = ref([])

// Abbiamo creato le variabili per gestire stato di caricamento ed errori
const caricamentoMisteriose = ref(true)
const caricamentoViaggi = ref(true)
const erroreMisteriose = ref('')
const erroreViaggi = ref('')

// Abbiamo creato la variabile che gestisce quale tab è attivo: 'misteriose' o 'viaggi'
const tabAttivo = ref('viaggi')

// Abbiamo creato le variabili per il modale di annullamento
const modaleAnnullamentoAperto = ref(false)
const prenotazioneDaAnnullare = ref(null)
// Abbiamo aggiunto un flag per sapere se stiamo annullando un viaggio normale o uno misterioso
const tipoAnnullamento = ref('viaggio')
const annullamentoInCorso = ref(false)
const erroreAnnullamento = ref('')
const messaggioSuccesso = ref('')

// Abbiamo calcolato il numero totale di prenotazioni per il sottotitolo
const totalePrenotazioni = computed(() => 
  prenotazioniMisteriose.value.length + prenotazioniViaggi.value.length
)

// Abbiamo creato la funzione asincrona che scarica le prenotazioni misteriose
const caricaPrenotazioniMisteriose = async () => {
  try {
    const response = await fetch('/api/mie-prenotazioni-misteriose', {
      credentials: 'include'
    })
    const data = await response.json()
    if (response.ok) {
      prenotazioniMisteriose.value = data.prenotazioni
    } else {
      erroreMisteriose.value = data.error || 'Errore nel recupero delle prenotazioni misteriose.'
    }
  } catch (err) {
    console.error('Errore (misteriose):', err)
    erroreMisteriose.value = 'Errore di connessione al server.'
  } finally {
    caricamentoMisteriose.value = false
  }
}

// Abbiamo creato la funzione asincrona che scarica le prenotazioni dei viaggi normali
const caricaPrenotazioniViaggi = async () => {
  try {
    const response = await fetch('/api/mie-prenotazioni-viaggi', {
      credentials: 'include'
    })
    const data = await response.json()
    if (response.ok) {
      prenotazioniViaggi.value = data.prenotazioni
    } else {
      erroreViaggi.value = data.error || 'Errore nel recupero delle prenotazioni.'
    }
  } catch (err) {
    console.error('Errore (viaggi):', err)
    erroreViaggi.value = 'Errore di connessione al server.'
  } finally {
    caricamentoViaggi.value = false
  }
}

// Abbiamo creato la funzione che apre il modale per annullare un viaggio normale
const apriModaleAnnullamento = (prenotazione) => {
  prenotazioneDaAnnullare.value = prenotazione
  tipoAnnullamento.value = 'viaggio'
  modaleAnnullamentoAperto.value = true
  erroreAnnullamento.value = ''
}

// Abbiamo creato la funzione che apre il modale per annullare un viaggio misterioso
const apriModaleAnnullamentoMisterioso = (prenotazione) => {
  prenotazioneDaAnnullare.value = prenotazione
  tipoAnnullamento.value = 'misteriosa'
  modaleAnnullamentoAperto.value = true
  erroreAnnullamento.value = ''
}

// Abbiamo creato la funzione che chiude il modale
const chiudiModaleAnnullamento = () => {
  modaleAnnullamentoAperto.value = false
  prenotazioneDaAnnullare.value = null
  erroreAnnullamento.value = ''
}

// Abbiamo creato la funzione che chiama il backend per annullare la prenotazione.
// In base al tipo (viaggio o misteriosa) chiama l'endpoint giusto e ricarica la lista corretta
const confermaAnnullamento = async () => {
  if (!prenotazioneDaAnnullare.value) return
  
  annullamentoInCorso.value = true
  erroreAnnullamento.value = ''
  
  // Abbiamo scelto l'endpoint giusto in base al tipo di prenotazione
  const endpoint = tipoAnnullamento.value === 'misteriosa' 
    ? '/api/annulla-prenotazione-misteriosa' 
    : '/api/annulla-prenotazione'
  
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        codice: prenotazioneDaAnnullare.value.codice
      })
    })
    
    const data = await response.json()
    
    if (response.ok) {
      messaggioSuccesso.value = `Prenotazione ${prenotazioneDaAnnullare.value.codice} annullata con successo.`
      chiudiModaleAnnullamento()
      // Abbiamo ricaricato la lista corretta in base al tipo
      if (tipoAnnullamento.value === 'misteriosa') {
        await caricaPrenotazioniMisteriose()
      } else {
        await caricaPrenotazioniViaggi()
      }
      setTimeout(() => { messaggioSuccesso.value = '' }, 5000)
    } else {
      erroreAnnullamento.value = data.error || 'Errore durante l\'annullamento.'
    }
  } catch (err) {
    console.error('Errore annullamento:', err)
    erroreAnnullamento.value = 'Errore di connessione al server.'
  } finally {
    annullamentoInCorso.value = false
  }
}

// Abbiamo creato una funzione che formatta la data in stile italiano
const formattaData = (dataIso) => {
  return new Date(dataIso).toLocaleDateString('it-IT', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  })
}

// Abbiamo creato una funzione che restituisce il testo da mostrare in base ai giorni alla partenza
const testoCountdown = (giorni) => {
  if (giorni < 0) return 'Viaggio concluso'
  if (giorni === 0) return 'Si parte oggi!'
  if (giorni === 1) return 'Manca 1 giorno'
  if (giorni <= 7) return `Mancano ${giorni} giorni - destinazione svelata!`
  return `Mancano ${giorni} giorni`
}

// Abbiamo creato una funzione che restituisce la classe CSS in base al countdown
const classeCountdown = (giorni) => {
  if (giorni < 0) return 'countdown-passato'
  if (giorni <= 7) return 'countdown-imminente'
  if (giorni <= 30) return 'countdown-vicino'
  return 'countdown-lontano'
}

// Abbiamo creato una funzione che restituisce il testo da mostrare per lo stato della prenotazione
const testoStato = (stato) => {
  if (stato === 'annullata') return '❌ Annullata'
  if (stato === 'completata') return '✅ Completata'
  if (stato === 'rivelata') return '🔮 Rivelata'
  if (stato === 'in_attesa') return '⏳ In attesa'
  if (stato === 'confermata' || stato === 'attiva') return '✅ Confermata'
  return stato
}

// Abbiamo creato una funzione che restituisce la classe CSS per il badge stato
const classeStato = (stato) => {
  if (stato === 'annullata') return 'badge-stato-annullata'
  if (stato === 'completata') return 'badge-stato-completata'
  if (stato === 'rivelata') return 'badge-stato-rivelata'
  if (stato === 'in_attesa') return 'badge-stato-attesa'
  return 'badge-stato-attiva'
}

/* --- LIFECYCLE HOOK --- */
onMounted(() => {
  // Se l'utente non è loggato, lo rimandiamo al login
  if (!userStore.loggato) {
    router.push('/login')
    return
  }
  // Carichiamo entrambi i tipi di prenotazione in parallelo
  caricaPrenotazioniMisteriose()
  caricaPrenotazioniViaggi()
})
</script>

<template>
  <div class="LePrenotazioni-wrapper">

    <!-- HEADER -->
    <header class="header-prenotazioni">
      <div class="overlay-stelle"></div>
      <div class="header-content">
        <div class="icona-header">📋</div>
        <h1 class="titolo-pagina">LE MIE PRENOTAZIONI</h1>
        <p class="sottotitolo-pagina">
          Ciao <strong>{{ userStore.username }}</strong>! 
          Hai <strong>{{ totalePrenotazioni }}</strong> 
          {{ totalePrenotazioni === 1 ? 'prenotazione' : 'prenotazioni' }} totali.
        </p>
      </div>
    </header>

    <main class="contenuto-principale">

      <!-- Messaggio di successo dopo annullamento -->
      <div v-if="messaggioSuccesso" class="messaggio-successo">
        ✅ {{ messaggioSuccesso }}
      </div>

      <!-- TAB DI NAVIGAZIONE -->
      <div class="tabs-container">
        <button 
          @click="tabAttivo = 'viaggi'"
          :class="['tab-btn', { 'attivo': tabAttivo === 'viaggi' }]"
        >
          🎒 Viaggi prenotati 
          <span class="badge">{{ prenotazioniViaggi.length }}</span>
        </button>
        <button 
          @click="tabAttivo = 'misteriose'"
          :class="['tab-btn', { 'attivo': tabAttivo === 'misteriose' }]"
        >
          🎁 Viaggi misteriosi 
          <span class="badge">{{ prenotazioniMisteriose.length }}</span>
        </button>
      </div>

      <!-- ============================== -->
      <!-- TAB VIAGGI NORMALI             -->
      <!-- ============================== -->
      <div v-if="tabAttivo === 'viaggi'">

        <div v-if="caricamentoViaggi" class="stato-info">
          <div class="spinner">⏳</div>
          <p>Caricamento delle prenotazioni in corso...</p>
        </div>

        <div v-else-if="erroreViaggi" class="messaggio-errore">
          ⚠️ {{ erroreViaggi }}
        </div>

        <div v-else-if="prenotazioniViaggi.length === 0" class="nessuna-prenotazione">
          <div class="icona-vuoto">🌍</div>
          <h2>Nessun viaggio prenotato</h2>
          <p>Non hai ancora prenotato nessun viaggio dal nostro catalogo.</p>
          <RouterLink to="/viaggi-disponibili" class="btn-prenota-ora">
            🎒 Esplora i viaggi disponibili
          </RouterLink>
        </div>

        <div v-else class="lista-prenotazioni">
          <div 
            v-for="p in prenotazioniViaggi" 
            :key="p.id" 
            :class="['card-prenotazione', 'card-viaggio', { 'card-annullata': p.stato === 'annullata' }]"
          >

            <div class="card-header">
              <div class="codice-piccolo">{{ p.codice }}</div>
              <div class="badge-container">
                <div class="badge-tipo badge-viaggio">🎒 Viaggio</div>
                <div :class="['badge-stato', classeStato(p.stato)]">
                  {{ testoStato(p.stato) }}
                </div>
              </div>
            </div>

            <div class="card-body">
              <div class="destinazione-viaggio">
                <h3 class="nome-destinazione-viaggio">
                  {{ p.destinazione || 'Destinazione non disponibile' }}
                </h3>
                <p class="periodo-viaggio">
                  📅 {{ p.periodo }} {{ p.data_visualizzata }}
                </p>
              </div>

              <div class="dettagli-grid">
                <div class="dettaglio">
                  <span class="dettaglio-label">👥 Viaggiatori</span>
                  <span class="dettaglio-value">{{ p.numero_viaggiatori }}</span>
                </div>
                <div class="dettaglio">
                  <span class="dettaglio-label">💰 Prezzo a persona</span>
                  <span class="dettaglio-value">{{ p.prezzo }}€</span>
                </div>
                <div class="dettaglio">
                  <span class="dettaglio-label">📧 Email contatto</span>
                  <span class="dettaglio-value email-piccola">{{ p.email_contatto }}</span>
                </div>
                <div class="dettaglio">
                  <span class="dettaglio-label">📅 Prenotato il</span>
                  <span class="dettaglio-value">{{ formattaData(p.data_prenotazione) }}</span>
                </div>
              </div>

              <div class="card-actions card-actions-doppio">
                <RouterLink v-if="p.rotta" :to="p.rotta" class="btn-vedi-itinerario">
                  📖 Rivedi l'itinerario
                </RouterLink>
                <button 
                  v-if="p.stato !== 'annullata'"
                  @click="apriModaleAnnullamento(p)"
                  class="btn-annulla-prenotazione"
                >
                  ❌ Annulla prenotazione
                </button>
              </div>
            </div>
          </div>

          <div class="cta-fondo">
            <RouterLink to="/viaggi-disponibili" class="btn-nuova-prenotazione">
              🎒 Prenota un altro viaggio
            </RouterLink>
          </div>
        </div>
      </div>

      <!-- ============================== -->
      <!-- TAB VIAGGI MISTERIOSI          -->
      <!-- ============================== -->
      <div v-else-if="tabAttivo === 'misteriose'">

        <div v-if="caricamentoMisteriose" class="stato-info">
          <div class="spinner">⏳</div>
          <p>Caricamento delle prenotazioni misteriose...</p>
        </div>

        <div v-else-if="erroreMisteriose" class="messaggio-errore">
          ⚠️ {{ erroreMisteriose }}
        </div>

        <div v-else-if="prenotazioniMisteriose.length === 0" class="nessuna-prenotazione">
          <div class="icona-vuoto">🎁</div>
          <h2>Nessun viaggio misterioso</h2>
          <p>Non hai ancora prenotato nessun viaggio misterioso. Lasciati sorprendere!</p>
          <RouterLink to="/viaggio-misterioso" class="btn-prenota-ora">
            🎁 Prenota un viaggio misterioso
          </RouterLink>
        </div>

        <div v-else class="lista-prenotazioni">
          <div 
            v-for="p in prenotazioniMisteriose" 
            :key="p.id" 
            :class="['card-prenotazione', 'card-misteriosa', { 'card-annullata': p.stato === 'annullata' }]"
          >

            <div class="card-header">
              <div class="codice-piccolo">{{ p.codice }}</div>
              <div class="badge-container">
                <div :class="['countdown-badge', classeCountdown(p.giorni_alla_partenza)]">
                  {{ testoCountdown(p.giorni_alla_partenza) }}
                </div>
                <div :class="['badge-stato', classeStato(p.stato)]">
                  {{ testoStato(p.stato) }}
                </div>
              </div>
            </div>

            <div class="card-body">
              <div v-if="p.destinazione_rivelata" class="destinazione-rivelata">
                <span class="label-rivelata">🎉 La tua destinazione:</span>
                <h3 class="nome-destinazione">{{ p.destinazione_rivelata }}</h3>
              </div>

              <div v-else class="destinazione-mistero">
                <span class="lock-icon-small">🔒</span>
                <span>Destinazione ancora misteriosa...</span>
              </div>

              <div class="dettagli-grid">
                <div class="dettaglio">
                  <span class="dettaglio-label">📅 Partenza</span>
                  <span class="dettaglio-value">{{ formattaData(p.data_partenza) }}</span>
                </div>
                <div class="dettaglio">
                  <span class="dettaglio-label">⏱️ Durata</span>
                  <span class="dettaglio-value">{{ p.durata }} giorni</span>
                </div>
                <div class="dettaglio">
                  <span class="dettaglio-label">👥 Viaggiatori</span>
                  <span class="dettaglio-value">{{ p.numero_viaggiatori }}</span>
                </div>
                <div class="dettaglio">
                  <span class="dettaglio-label">💰 Budget</span>
                  <span class="dettaglio-value capitalize">{{ p.budget }}</span>
                </div>
              </div>

              <div class="card-actions card-actions-doppio">
                <RouterLink 
                  v-if="!p.destinazione_rivelata && p.giorni_alla_partenza >= 0 && p.stato !== 'annullata'" 
                  to="/scopri-viaggio" 
                  class="btn-scopri-card"
                >
                  🔮 Vai a "Scopri il tuo viaggio"
                </RouterLink>
                <button 
                  v-if="p.stato !== 'annullata' && p.giorni_alla_partenza > 7"
                  @click="apriModaleAnnullamentoMisterioso(p)"
                  class="btn-annulla-prenotazione"
                >
                  ❌ Annulla prenotazione
                </button>
              </div>

              <!-- Avvertimento se non si puo piu annullare -->
              <div 
                v-if="p.stato !== 'annullata' && p.giorni_alla_partenza <= 7 && p.giorni_alla_partenza >= 0" 
                class="avviso-no-annullo"
              >
                ⚠️ Non e piu possibile annullare: la destinazione e stata svelata o il viaggio e troppo vicino.
              </div>
            </div>
          </div>

          <div class="cta-fondo">
            <RouterLink to="/viaggio-misterioso" class="btn-nuova-prenotazione">
              🎁 Prenota un altro viaggio misterioso
            </RouterLink>
          </div>
        </div>
      </div>

    </main>

    <!-- ============================== -->
    <!-- MODALE CONFERMA ANNULLAMENTO    -->
    <!-- ============================== -->
    <div v-if="modaleAnnullamentoAperto" class="modale-overlay" @click.self="chiudiModaleAnnullamento">
      <div class="modale-content-annulla">
        <button @click="chiudiModaleAnnullamento" class="btn-chiudi-x" aria-label="Chiudi">×</button>
        
        <div class="icona-warning">⚠️</div>
        <h2 class="modale-titolo-annulla">Annulla prenotazione?</h2>
        
        <p v-if="tipoAnnullamento === 'viaggio'" class="modale-testo-annulla">
          Stai per annullare la prenotazione 
          <strong>{{ prenotazioneDaAnnullare?.codice }}</strong> 
          per il viaggio in <strong>{{ prenotazioneDaAnnullare?.destinazione }}</strong>.
        </p>
        <p v-else class="modale-testo-annulla">
          Stai per annullare la prenotazione misteriosa 
          <strong>{{ prenotazioneDaAnnullare?.codice }}</strong>.
        </p>
        
        <div class="avvertimento-box">
          <strong>⚠️ Attenzione:</strong> questa azione è definitiva e non potrà essere annullata.
          <span v-if="tipoAnnullamento === 'viaggio'">
            I posti saranno restituiti al viaggio e altri utenti potranno prenotarli.
          </span>
          <span v-else>
            La prenotazione resterà visibile nella lista ma marcata come annullata.
          </span>
        </div>

        <div v-if="erroreAnnullamento" class="messaggio-errore-modale">
          ⚠️ {{ erroreAnnullamento }}
        </div>

        <div class="modale-azioni-annulla">
          <button 
            @click="chiudiModaleAnnullamento" 
            class="btn-mantieni" 
            :disabled="annullamentoInCorso"
          >
            ✓ Mantieni la prenotazione
          </button>
          <button 
            @click="confermaAnnullamento" 
            class="btn-conferma-annulla" 
            :disabled="annullamentoInCorso"
          >
            <span v-if="annullamentoInCorso">⏳ Annullamento in corso...</span>
            <span v-else>❌ Sì, annulla la prenotazione</span>
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
.LePrenotazioni-wrapper,
.LePrenotazioni-wrapper * {
  box-sizing: border-box;
}

.LePrenotazioni-wrapper {
  background-color: #f9f9f9;
  min-height: 100vh;
  width: 100%;
  font-family: sans-serif;
  overflow-x: hidden;
  color: #333;
}

/* ===== HEADER ===== */
.header-prenotazioni {
  background: linear-gradient(135deg, #00897b 0%, #00c4b4 50%, #4527a0 100%);
  width: 100%;
  padding: 100px 5% 70px 5%;
  color: white;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.overlay-stelle {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background-image: 
    radial-gradient(2px 2px at 20% 30%, white, transparent),
    radial-gradient(1px 1px at 60% 70%, white, transparent),
    radial-gradient(1px 1px at 80% 10%, white, transparent),
    radial-gradient(2px 2px at 90% 60%, white, transparent),
    radial-gradient(1px 1px at 33% 80%, white, transparent);
  opacity: 0.3;
  pointer-events: none;
}

.header-content {
  position: relative;
  z-index: 2;
  max-width: 900px;
  margin: 0 auto;
}

.icona-header {
  font-size: 4rem;
  margin-bottom: 15px;
}

.titolo-pagina {
  font-size: clamp(1.8rem, 4.5vw, 3.2rem);
  font-weight: 900;
  margin: 0 0 15px 0;
  letter-spacing: 3px;
  text-shadow: 2px 2px 10px rgba(0,0,0,0.4);
}

.sottotitolo-pagina {
  font-size: clamp(1rem, 1.5vw, 1.2rem);
  margin: 0;
  opacity: 0.95;
}

/* ===== CONTENUTO ===== */
.contenuto-principale {
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
  padding: 50px 5%;
}

/* ===== MESSAGGIO SUCCESSO ===== */
.messaggio-successo {
  background-color: #d4f4e0;
  color: #00695c;
  padding: 18px 25px;
  border-radius: 10px;
  border-left: 4px solid #00897b;
  font-weight: bold;
  margin-bottom: 25px;
  text-align: center;
  animation: slideIn 0.4s ease;
}

@keyframes slideIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ===== TABS ===== */
.tabs-container {
  display: flex;
  gap: 12px;
  margin-bottom: 35px;
  border-bottom: 2px solid #e0e0e0;
  padding-bottom: 0;
  flex-wrap: wrap;
}

.tab-btn {
  background: white;
  border: 2px solid #e0e0e0;
  border-bottom: none;
  border-radius: 12px 12px 0 0;
  padding: 14px 24px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  color: #666;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: -2px;
}

.tab-btn:hover {
  background: #f5f5f5;
  color: #333;
}

.tab-btn.attivo {
  background: white;
  color: #00897b;
  border-color: #00c4b4;
  border-bottom: 2px solid white;
}

.badge {
  background: #f0f0f0;
  color: #666;
  border-radius: 12px;
  padding: 2px 10px;
  font-size: 0.85rem;
  font-weight: bold;
}

.tab-btn.attivo .badge {
  background: #00c4b4;
  color: white;
}

/* ===== STATI INFO ===== */
.stato-info {
  text-align: center;
  padding: 80px 30px;
  color: #666;
}

.spinner {
  font-size: 4rem;
  margin-bottom: 20px;
  animation: spin 2s linear infinite;
  display: inline-block;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.messaggio-errore {
  background-color: #fce4ec;
  color: #d81b60;
  padding: 20px;
  border-radius: 10px;
  border-left: 4px solid #d81b60;
  font-weight: bold;
  text-align: center;
}

/* ===== NESSUNA PRENOTAZIONE ===== */
.nessuna-prenotazione {
  text-align: center;
  padding: 80px 30px;
  background: white;
  border-radius: 15px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.05);
}

.icona-vuoto {
  font-size: 5rem;
  margin-bottom: 25px;
}

.nessuna-prenotazione h2 {
  color: #333;
  font-size: 1.8rem;
  margin: 0 0 15px 0;
}

.nessuna-prenotazione p {
  color: #666;
  font-size: 1.1rem;
  margin: 0 0 30px 0;
}

.btn-prenota-ora {
  display: inline-block;
  background: linear-gradient(135deg, #6a1b9a 0%, #d81b60 100%);
  color: white;
  padding: 16px 40px;
  border-radius: 50px;
  font-size: 1.1rem;
  font-weight: bold;
  text-decoration: none;
  transition: transform 0.2s, box-shadow 0.3s;
  box-shadow: 0 6px 15px rgba(216, 27, 96, 0.3);
}

.btn-prenota-ora:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 25px rgba(216, 27, 96, 0.4);
}

/* ===== LISTA ===== */
.lista-prenotazioni {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.card-prenotazione {
  background: white;
  border-radius: 15px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.08);
  overflow: hidden;
  transition: transform 0.3s, box-shadow 0.3s;
}

.card-prenotazione:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 25px rgba(0,196,180,0.15);
}

.card-misteriosa:hover {
  box-shadow: 0 10px 25px rgba(106, 27, 154, 0.15);
}

/* Card annullata: aspetto sbiadito */
.card-annullata {
  opacity: 0.65;
  filter: grayscale(0.4);
}

.card-annullata:hover {
  transform: none;
  box-shadow: 0 4px 15px rgba(0,0,0,0.08);
}

.card-header {
  background: linear-gradient(135deg, #f5f5f5 0%, #fafafa 100%);
  padding: 18px 25px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  border-bottom: 1px solid #eee;
}

.codice-piccolo {
  font-family: 'Courier New', monospace;
  font-weight: bold;
  font-size: 1.1rem;
  color: #d81b60;
  letter-spacing: 2px;
}

/* Container per i due badge (tipo + stato) */
.badge-container {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.badge-tipo {
  padding: 6px 14px;
  border-radius: 15px;
  font-size: 0.85rem;
  font-weight: bold;
}

.badge-viaggio {
  background: #e0f7f5;
  color: #00897b;
}

/* Badge per lo stato della prenotazione */
.badge-stato {
  padding: 6px 14px;
  border-radius: 15px;
  font-size: 0.85rem;
  font-weight: bold;
}

.badge-stato-attiva {
  background: #d4f4e0;
  color: #00695c;
}

.badge-stato-annullata {
  background: #ffcdd2;
  color: #c62828;
}

.badge-stato-completata {
  background: #e3f2fd;
  color: #1565c0;
}

.countdown-badge {
  padding: 6px 14px;
  border-radius: 15px;
  font-size: 0.85rem;
  font-weight: bold;
}

.countdown-passato {
  background: #f5f5f5;
  color: #888;
}

.countdown-imminente {
  background: #d4f4e0;
  color: #00897b;
}

.countdown-vicino {
  background: #fff8e1;
  color: #f57c00;
}

.countdown-lontano {
  background: #e3f2fd;
  color: #1976d2;
}

.card-body {
  padding: 25px;
}

/* Destinazione viaggio normale */
.destinazione-viaggio {
  background: linear-gradient(135deg, rgba(0,196,180,0.08) 0%, rgba(216,27,96,0.05) 100%);
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 20px;
  border-left: 4px solid #00c4b4;
}

.nome-destinazione-viaggio {
  margin: 0 0 8px 0;
  font-size: clamp(1.3rem, 2.5vw, 1.8rem);
  color: #00897b;
  letter-spacing: 1px;
}

.periodo-viaggio {
  margin: 0;
  color: #555;
  font-size: 0.95rem;
}

/* Destinazione misteriosa rivelata */
.destinazione-rivelata {
  background: linear-gradient(135deg, rgba(0,196,180,0.1) 0%, rgba(216,27,96,0.1) 100%);
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 20px;
  border-left: 4px solid #00c4b4;
}

.label-rivelata {
  display: block;
  font-size: 0.9rem;
  color: #00897b;
  font-weight: bold;
  margin-bottom: 5px;
}

.nome-destinazione {
  margin: 0;
  font-size: clamp(1.4rem, 2.5vw, 1.8rem);
  background: linear-gradient(135deg, #00897b 0%, #d81b60 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.destinazione-mistero {
  background: #f5f5f5;
  border-radius: 10px;
  padding: 18px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  color: #666;
  font-style: italic;
}

.lock-icon-small {
  font-size: 1.5rem;
}

.dettagli-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
  margin-bottom: 20px;
}

.dettaglio {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.dettaglio-label {
  font-size: 0.8rem;
  color: #999;
}

.dettaglio-value {
  font-size: 0.95rem;
  font-weight: bold;
  color: #333;
}

.email-piccola {
  font-size: 0.8rem;
  word-break: break-all;
}

.capitalize {
  text-transform: capitalize;
}

.card-actions {
  text-align: center;
  padding-top: 15px;
  border-top: 1px dashed #eee;
}

/* Quando ci sono 2 bottoni, li mettiamo affiancati */
.card-actions-doppio {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-scopri-card,
.btn-vedi-itinerario {
  display: inline-block;
  background: white;
  color: #6a1b9a;
  border: 2px solid #6a1b9a;
  padding: 10px 25px;
  border-radius: 25px;
  font-size: 0.95rem;
  font-weight: bold;
  text-decoration: none;
  transition: all 0.3s;
}

.btn-vedi-itinerario {
  color: #00897b;
  border-color: #00c4b4;
}

.btn-scopri-card:hover {
  background: #6a1b9a;
  color: white;
}

.btn-vedi-itinerario:hover {
  background: #00c4b4;
  color: white;
}

/* Bottone annulla prenotazione */
.btn-annulla-prenotazione {
  background: white;
  color: #c62828;
  border: 2px solid #c62828;
  padding: 10px 25px;
  border-radius: 25px;
  font-size: 0.95rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
  font-family: inherit;
}

.btn-annulla-prenotazione:hover {
  background: #c62828;
  color: white;
}

/* ===== CTA FONDO ===== */
.cta-fondo {
  text-align: center;
  margin-top: 40px;
  padding: 30px;
}

.btn-nuova-prenotazione {
  display: inline-block;
  background: linear-gradient(135deg, #6a1b9a 0%, #d81b60 100%);
  color: white;
  padding: 16px 40px;
  border-radius: 50px;
  font-size: 1.05rem;
  font-weight: bold;
  text-decoration: none;
  transition: transform 0.2s, box-shadow 0.3s;
  box-shadow: 0 6px 15px rgba(216, 27, 96, 0.3);
}

.btn-nuova-prenotazione:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 25px rgba(216, 27, 96, 0.4);
}

/* ===== MODALE ANNULLAMENTO ===== */
.modale-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.65);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  padding: 20px;
  backdrop-filter: blur(4px);
}

.modale-content-annulla {
  background: white;
  border-radius: 15px;
  padding: 40px 35px 30px 35px;
  max-width: 520px;
  width: 100%;
  position: relative;
  box-shadow: 0 20px 60px rgba(0,0,0,0.4);
  text-align: center;
}

.btn-chiudi-x {
  position: absolute;
  top: 10px;
  right: 15px;
  background: none;
  border: none;
  font-size: 2rem;
  color: #999;
  cursor: pointer;
  padding: 0;
  width: 35px;
  height: 35px;
  line-height: 1;
}

.btn-chiudi-x:hover {
  color: #c62828;
}

.icona-warning {
  font-size: 4rem;
  margin-bottom: 15px;
  animation: shake 0.5s ease;
}

@keyframes shake {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(-10deg); }
  75% { transform: rotate(10deg); }
}

.modale-titolo-annulla {
  margin: 0 0 15px 0;
  color: #c62828;
  font-size: 1.6rem;
}

.modale-testo-annulla {
  color: #444;
  font-size: 1.05rem;
  line-height: 1.6;
  margin: 0 0 20px 0;
}

.avvertimento-box {
  background: #fff3e0;
  color: #e65100;
  padding: 15px 20px;
  border-radius: 10px;
  border-left: 4px solid #ff9800;
  text-align: left;
  font-size: 0.95rem;
  line-height: 1.5;
  margin-bottom: 20px;
}

.messaggio-errore-modale {
  background: #fce4ec;
  color: #d81b60;
  padding: 12px 18px;
  border-radius: 8px;
  border-left: 4px solid #d81b60;
  margin-bottom: 18px;
  font-weight: bold;
  font-size: 0.95rem;
  text-align: left;
}

.modale-azioni-annulla {
  display: flex;
  gap: 12px;
  margin-top: 25px;
  flex-direction: column;
}

.btn-mantieni,
.btn-conferma-annulla {
  width: 100%;
  padding: 14px 20px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  border: none;
  transition: transform 0.2s, background-color 0.3s;
  font-family: inherit;
}

.btn-mantieni {
  background: #00c4b4;
  color: white;
}

.btn-mantieni:hover:not(:disabled) {
  background: #00897b;
  transform: translateY(-2px);
}

.btn-conferma-annulla {
  background: white;
  color: #c62828;
  border: 2px solid #c62828;
}

.btn-conferma-annulla:hover:not(:disabled) {
  background: #c62828;
  color: white;
}

.btn-mantieni:disabled,
.btn-conferma-annulla:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
/* Badge per gli stati aggiuntivi delle misteriose */
.badge-stato-rivelata {
  background: #f3e5f5;
  color: #6a1b9a;
}

.badge-stato-attesa {
  background: #fff8e1;
  color: #f57c00;
}

/* Avviso quando non si puo piu annullare una misteriosa */
.avviso-no-annullo {
  background: #fff3e0;
  color: #e65100;
  padding: 12px 18px;
  border-radius: 8px;
  border-left: 4px solid #ff9800;
  text-align: center;
  font-size: 0.9rem;
  margin-top: 15px;
  font-style: italic;
}

/* ===== RESPONSIVE ===== */
@media (max-width: 768px) {
  .dettagli-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .tab-btn {
    flex: 1;
    justify-content: center;
    font-size: 0.9rem;
    padding: 12px 14px;
  }
}

@media (max-width: 480px) {
  .dettagli-grid {
    grid-template-columns: 1fr;
  }
  .card-header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>