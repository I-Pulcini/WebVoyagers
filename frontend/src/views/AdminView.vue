<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { userStore } from '../stores/userStore'

/* --- DASHBOARD ADMIN --- */
/* Abbiamo creato la pagina di amministrazione visibile solo agli utenti con flag is_admin = TRUE.
   Mostra statistiche globali del sito, lista di tutti gli utenti e di tutte le prenotazioni,
   con possibilità di cambiare lo stato delle prenotazioni. */

const router = useRouter()

// Abbiamo creato le variabili reattive per i dati della dashboard
const stats = ref(null)
const prenotazioniViaggi = ref([])
const prenotazioniMisteriose = ref([])
const utenti = ref([])
const messaggi = ref([])
const recensioni = ref([])
const caricamento = ref(true)
const errore = ref('')

// Abbiamo creato la variabile che gestisce il tab attivo: 'stats', 'prenotazioni', 'utenti'
const tabAttivo = ref('stats')

// Abbiamo creato il messaggio di feedback per le azioni di cambio stato
const messaggioFeedback = ref('')

// Abbiamo creato la funzione asincrona che carica le statistiche globali
const caricaStats = async () => {
  try {
    const response = await fetch('/api/admin/stats', { credentials: 'include' })
    const data = await response.json()
    if (response.ok) {
      stats.value = data
    } else {
      errore.value = data.error || 'Errore caricamento statistiche.'
    }
  } catch (err) {
    console.error('Errore stats:', err)
    errore.value = 'Errore di connessione.'
  }
}

// Abbiamo creato la funzione che carica tutte le prenotazioni del sistema
const caricaPrenotazioni = async () => {
  try {
    const response = await fetch('/api/admin/prenotazioni', { credentials: 'include' })
    const data = await response.json()
    if (response.ok) {
      prenotazioniViaggi.value = data.prenotazioniViaggi
      prenotazioniMisteriose.value = data.prenotazioniMisteriose
    }
  } catch (err) {
    console.error('Errore prenotazioni:', err)
  }
}

// Abbiamo creato la funzione che carica la lista di tutti gli utenti registrati
const caricaUtenti = async () => {
  try {
    const response = await fetch('/api/admin/utenti', { credentials: 'include' })
    const data = await response.json()
    if (response.ok) {
      utenti.value = data.utenti
    }
  } catch (err) {
    console.error('Errore utenti:', err)
  }
}

// Abbiamo creato la funzione che carica tutti i messaggi del form Contattaci
const caricaMessaggi = async () => {
  try {
    const response = await fetch('/api/admin/messaggi', { credentials: 'include' })
    const data = await response.json()
    if (response.ok) {
      messaggi.value = data.messaggi
    }
  } catch (err) {
    console.error('Errore messaggi:', err)
  }
}

// Abbiamo creato la funzione che cambia lo stato di un messaggio (nuovo / letto / risolto)
const cambiaStatoMessaggio = async (id, nuovoStato) => {
  try {
    const response = await fetch('/api/admin/messaggi/cambia-stato', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ id, nuovoStato })
    })
    if (response.ok) {
      messaggioFeedback.value = '✓ Stato messaggio aggiornato!'
      await caricaMessaggi()
      setTimeout(() => { messaggioFeedback.value = '' }, 3000)
    }
  } catch (err) {
    console.error('Errore:', err)
  }
}

// Abbiamo creato la funzione che carica tutte le recensioni del sistema
const caricaRecensioniAdmin = async () => {
  try {
    const response = await fetch('/api/admin/recensioni', { credentials: 'include' })
    const data = await response.json()
    if (response.ok) {
      recensioni.value = data.recensioni
    }
  } catch (err) {
    console.error('Errore recensioni:', err)
  }
}

// Abbiamo creato la funzione che cambia lo stato di una recensione (approva o nasconde)
const cambiaStatoRecensione = async (id, nuovoStato) => {
  try {
    const response = await fetch('/api/admin/recensioni/cambia-stato', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ id, nuovoStato })
    })
    if (response.ok) {
      messaggioFeedback.value = '✓ Stato recensione aggiornato!'
      await caricaRecensioniAdmin()
      setTimeout(() => { messaggioFeedback.value = '' }, 3000)
    }
  } catch (err) {
    console.error('Errore:', err)
  }
}

// Abbiamo creato la funzione che cambia lo stato di una prenotazione
const cambiaStato = async (tipo, id, nuovoStato) => {
  if (!confirm(`Confermi il cambio di stato a "${nuovoStato}"?`)) return
  
  try {
    const response = await fetch('/api/admin/cambia-stato', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ tipo, id, nuovoStato })
    })
    const data = await response.json()
    
    if (response.ok) {
      messaggioFeedback.value = '✓ Stato aggiornato!'
      // Abbiamo ricaricato le prenotazioni per riflettere il cambiamento
      await caricaPrenotazioni()
      // Abbiamo nascosto il messaggio dopo 3 secondi
      setTimeout(() => { messaggioFeedback.value = '' }, 3000)
    } else {
      messaggioFeedback.value = '❌ ' + (data.error || 'Errore')
    }
  } catch (err) {
    console.error('Errore cambio stato:', err)
    messaggioFeedback.value = '❌ Errore di connessione'
  }
}

// Abbiamo creato una funzione che formatta la data
const formattaData = (dataIso) => {
  if (!dataIso) return '-'
  return new Date(dataIso).toLocaleDateString('it-IT', { 
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

// Abbiamo creato il totale prenotazioni come computed per il badge del tab
const totalePrenotazioni = computed(() => 
  prenotazioniViaggi.value.length + prenotazioniMisteriose.value.length
)

/* --- LIFECYCLE HOOK --- */
onMounted(async () => {
  // Abbiamo verificato che l'utente sia loggato
  if (!userStore.loggato) {
    router.push('/login')
    return
  }
  
  // Abbiamo verificato che l'utente sia admin
  if (!userStore.isAdmin) {
    router.push('/')
    return
  }
  
  // Carichiamo tutti i dati in parallelo per velocità
  await Promise.all([
    caricaStats(), 
    caricaPrenotazioni(), 
    caricaUtenti(), 
    caricaMessaggi(),
    caricaRecensioniAdmin()
  ])
  caricamento.value = false
})
</script>

<template>
  <div class="Admin-wrapper">

    <!-- HEADER -->
    <header class="header-admin">
      <div class="header-content">
        <div class="badge-admin">⚡ ADMIN PANEL</div>
        <h1 class="titolo-pagina">Dashboard Amministrazione</h1>
        <p class="sottotitolo-pagina">
          Pannello di controllo riservato agli amministratori di WebVoyagers
        </p>
      </div>
    </header>

    <main class="contenuto-principale">

      <!-- CARICAMENTO -->
      <div v-if="caricamento" class="stato-info">
        <div class="spinner">⏳</div>
        <p>Caricamento dashboard...</p>
      </div>

      <div v-else>

        <!-- MESSAGGIO FEEDBACK CAMBIO STATO -->
        <div v-if="messaggioFeedback" class="feedback-banner">
          {{ messaggioFeedback }}
        </div>

        <!-- TABS -->
        <div class="tabs-container">
          <button 
            @click="tabAttivo = 'stats'"
            :class="['tab-btn', { 'attivo': tabAttivo === 'stats' }]"
          >
            📊 Statistiche
          </button>
          <button 
            @click="tabAttivo = 'prenotazioni'"
            :class="['tab-btn', { 'attivo': tabAttivo === 'prenotazioni' }]"
          >
            📋 Prenotazioni 
            <span class="badge">{{ totalePrenotazioni }}</span>
          </button>
          <button 
            @click="tabAttivo = 'utenti'"
            :class="['tab-btn', { 'attivo': tabAttivo === 'utenti' }]"
          >
            👥 Utenti 
            <span class="badge">{{ utenti.length }}</span>
          </button>
          <button 
            @click="tabAttivo = 'messaggi'"
            :class="['tab-btn', { 'attivo': tabAttivo === 'messaggi' }]"
            >
            💬 Messaggi 
            <span class="badge">{{ messaggi.length }}</span>
            </button>
            <button 
                @click="tabAttivo = 'recensioni'"
                :class="['tab-btn', { 'attivo': tabAttivo === 'recensioni' }]"
                >
                ⭐ Recensioni 
                <span class="badge">{{ recensioni.length }}</span>
            </button>
        </div>

        <!-- ============================== -->
        <!-- TAB STATISTICHE                -->
        <!-- ============================== -->
        <div v-if="tabAttivo === 'stats' && stats" class="stats-section">
          <div class="stats-grid">
            <div class="stat-card stat-utenti">
              <div class="stat-icona">👥</div>
              <div class="stat-numero">{{ stats.utenti }}</div>
              <div class="stat-label">Utenti registrati</div>
            </div>
            <div class="stat-card stat-viaggi">
              <div class="stat-icona">🎒</div>
              <div class="stat-numero">{{ stats.prenotazioniViaggi }}</div>
              <div class="stat-label">Prenotazioni viaggi</div>
            </div>
            <div class="stat-card stat-misteriosi">
              <div class="stat-icona">🎁</div>
              <div class="stat-numero">{{ stats.prenotazioniMisteriose }}</div>
              <div class="stat-label">Prenotazioni misteriose</div>
            </div>
            <div class="stat-card stat-attivi">
              <div class="stat-icona">🌍</div>
              <div class="stat-numero">{{ stats.viaggiAttivi }}</div>
              <div class="stat-label">Viaggi attivi</div>
            </div>
            <div class="stat-card stat-incasso">
              <div class="stat-icona">💰</div>
              <div class="stat-numero">€{{ stats.incassoTotale.toLocaleString('it-IT') }}</div>
              <div class="stat-label">Incasso totale</div>
            </div>
          </div>
        </div>

        <!-- ============================== -->
        <!-- TAB PRENOTAZIONI               -->
        <!-- ============================== -->
        <div v-else-if="tabAttivo === 'prenotazioni'" class="prenotazioni-section">

          <h3 class="sottotitolo-tab">🎒 Viaggi normali ({{ prenotazioniViaggi.length }})</h3>
          <div v-if="prenotazioniViaggi.length === 0" class="vuoto">
            Nessuna prenotazione viaggio.
          </div>
          <div v-else class="tabella-wrapper">
            <table class="tabella-admin">
              <thead>
                <tr>
                  <th>Codice</th>
                  <th>Utente</th>
                  <th>Destinazione</th>
                  <th>Pers.</th>
                  <th>Data prenot.</th>
                  <th>Stato</th>
                  <th>Azioni</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="p in prenotazioniViaggi" :key="p.id">
                  <td class="codice-cell">{{ p.codice }}</td>
                  <td>{{ p.username }}<br><small>{{ p.utente_email }}</small></td>
                  <td>{{ p.destinazione || '—' }}</td>
                  <td>{{ p.numero_viaggiatori }}</td>
                  <td><small>{{ formattaData(p.data_prenotazione) }}</small></td>
                  <td>
                    <span :class="['stato-badge', 'stato-' + p.stato]">{{ p.stato }}</span>
                  </td>
                  <td>
                    <select 
                      :value="p.stato" 
                      @change="cambiaStato('viaggio', p.id, $event.target.value)"
                      class="select-stato"
                    >
                      <option value="in_attesa">in_attesa</option>
                      <option value="confermata">confermata</option>
                      <option value="completata">completata</option>
                      <option value="annullata">annullata</option>
                    </select>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 class="sottotitolo-tab">🎁 Viaggi misteriosi ({{ prenotazioniMisteriose.length }})</h3>
          <div v-if="prenotazioniMisteriose.length === 0" class="vuoto">
            Nessuna prenotazione misteriosa.
          </div>
          <div v-else class="tabella-wrapper">
            <table class="tabella-admin">
              <thead>
                <tr>
                  <th>Codice</th>
                  <th>Utente</th>
                  <th>Destinazione</th>
                  <th>Pers.</th>
                  <th>Partenza</th>
                  <th>Stato</th>
                  <th>Azioni</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="p in prenotazioniMisteriose" :key="p.id">
                  <td class="codice-cell">{{ p.codice }}</td>
                  <td>{{ p.username }}<br><small>{{ p.utente_email }}</small></td>
                  <td>{{ p.destinazione_nome || '🔒 nascosta' }}</td>
                  <td>{{ p.numero_viaggiatori }}</td>
                  <td><small>{{ formattaData(p.data_partenza) }}</small></td>
                  <td>
                    <span :class="['stato-badge', 'stato-' + p.stato]">{{ p.stato }}</span>
                  </td>
                  <td>
                    <select 
                      :value="p.stato" 
                      @change="cambiaStato('misteriosa', p.id, $event.target.value)"
                      class="select-stato"
                    >
                      <option value="in_attesa">in_attesa</option>
                      <option value="confermata">confermata</option>
                      <option value="rivelata">rivelata</option>
                      <option value="completata">completata</option>
                      <option value="annullata">annullata</option>
                    </select>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

        </div>

        <!-- ============================== -->
        <!-- TAB UTENTI                     -->
        <!-- ============================== -->
        <div v-else-if="tabAttivo === 'utenti'" class="utenti-section">
          <div class="tabella-wrapper">
            <table class="tabella-admin">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Ruolo</th>
                  <th>Iscritto dal</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="u in utenti" :key="u.id">
                  <td>#{{ u.id }}</td>
                  <td><strong>{{ u.username }}</strong></td>
                  <td>{{ u.email }}</td>
                  <td>
                    <span v-if="u.is_admin" class="badge-ruolo badge-admin-piccolo">⚡ ADMIN</span>
                    <span v-else class="badge-ruolo badge-user">utente</span>
                  </td>
                  <td><small>{{ formattaData(u.data_registrazione) }}</small></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- ============================== -->
        <!-- TAB MESSAGGI                   -->
        <!-- ============================== -->
        <div v-else-if="tabAttivo === 'messaggi'" class="messaggi-section">
          <div v-if="messaggi.length === 0" class="vuoto">
            Nessun messaggio ricevuto.
          </div>
          <div v-else>
            <div v-for="m in messaggi" :key="m.id" class="messaggio-card" :class="'msg-' + m.stato">
              <div class="messaggio-header">
                <div>
                  <strong>{{ m.nome }}</strong>
                  <span v-if="m.username" class="badge-utente">@{{ m.username }}</span>
                  <br>
                  <small>📧 {{ m.email }}<span v-if="m.telefono"> · 📞 {{ m.telefono }}</span></small>
                </div>
                <div class="messaggio-meta">
                  <span :class="['stato-badge', 'stato-' + m.stato]">{{ m.stato }}</span>
                  <small>{{ formattaData(m.data_invio) }}</small>
                </div>
              </div>
              <div class="messaggio-motivo">
                📌 <strong>Motivo:</strong> {{ m.motivo }}
              </div>
              <div class="messaggio-testo">
                {{ m.messaggio }}
              </div>
              <div class="messaggio-azioni">
                <select 
                  :value="m.stato" 
                  @change="cambiaStatoMessaggio(m.id, $event.target.value)"
                  class="select-stato"
                >
                  <option value="nuovo">nuovo</option>
                  <option value="letto">letto</option>
                  <option value="risolto">risolto</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- ============================== -->
        <!-- TAB RECENSIONI                 -->
        <!-- ============================== -->
        <div v-else-if="tabAttivo === 'recensioni'" class="recensioni-admin-section">
          <div v-if="recensioni.length === 0" class="vuoto">
            Nessuna recensione ancora.
          </div>
          <div v-else>
            <div v-for="r in recensioni" :key="r.id" class="recensione-admin-card" :class="'rec-' + r.stato">
              <div class="recensione-admin-header">
                <div>
                  <strong>{{ r.username || 'Utente eliminato' }}</strong>
                  <small class="email-utente">{{ r.email }}</small>
                </div>
                <div class="recensione-meta">
                  <span :class="['stato-badge', 'stato-rec-' + r.stato]">{{ r.stato }}</span>
                  <small>{{ formattaData(r.data_creazione) }}</small>
                </div>
              </div>
              <div class="stelle-admin">
                <span v-for="n in 5" :key="n" :class="{ 'stella-attiva': n <= r.stelle }">★</span>
                <span class="stelle-numero">{{ r.stelle }}/5</span>
              </div>
              <h4 class="recensione-titolo-admin">{{ r.titolo }}</h4>
              <p class="recensione-testo-admin">{{ r.testo }}</p>
              <div class="recensione-azioni">
                <select 
                  :value="r.stato" 
                  @change="cambiaStatoRecensione(r.id, $event.target.value)"
                  class="select-stato"
                >
                  <option value="in_attesa">in_attesa</option>
                  <option value="pubblicata">pubblicata</option>
                  <option value="nascosta">nascosta</option>
                </select>
              </div>
            </div>
          </div>
        </div>

      </div>

    </main>
  </div>
</template>

<style scoped>
.Admin-wrapper,
.Admin-wrapper * {
  box-sizing: border-box;
}

.Admin-wrapper {
  background-color: #1a1a2e;
  min-height: 100vh;
  width: 100%;
  font-family: sans-serif;
  overflow-x: hidden;
  color: #f0f0f0;
}

/* HEADER */
.header-admin {
  background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
  padding: 90px 5% 60px 5%;
  text-align: center;
  border-bottom: 3px solid #d81b60;
}

.header-content {
  max-width: 900px;
  margin: 0 auto;
}

.badge-admin {
  display: inline-block;
  background: linear-gradient(135deg, #d81b60 0%, #6a1b9a 100%);
  color: white;
  padding: 8px 22px;
  border-radius: 20px;
  font-weight: 900;
  letter-spacing: 3px;
  font-size: 0.9rem;
  margin-bottom: 20px;
  box-shadow: 0 4px 15px rgba(216, 27, 96, 0.4);
}

.titolo-pagina {
  font-size: clamp(1.8rem, 4vw, 2.8rem);
  margin: 0 0 12px 0;
  font-weight: 900;
  color: white;
}

.sottotitolo-pagina {
  margin: 0;
  color: #b0b0d0;
  font-size: 1rem;
}

/* CONTENUTO */
.contenuto-principale {
  width: 100%;
  max-width: 1300px;
  margin: 0 auto;
  padding: 40px 3%;
}

.stato-info {
  text-align: center;
  padding: 80px 30px;
  color: #b0b0d0;
}

.spinner {
  font-size: 4rem;
  animation: spin 2s linear infinite;
  display: inline-block;
  margin-bottom: 20px;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.feedback-banner {
  background: linear-gradient(135deg, #00c4b4 0%, #00897b 100%);
  color: white;
  padding: 14px 20px;
  border-radius: 10px;
  text-align: center;
  font-weight: bold;
  margin-bottom: 25px;
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* TABS */
.tabs-container {
  display: flex;
  gap: 12px;
  margin-bottom: 30px;
  border-bottom: 2px solid #2a2a3e;
  padding-bottom: 0;
  flex-wrap: wrap;
}

.tab-btn {
  background: #2a2a3e;
  border: none;
  border-radius: 12px 12px 0 0;
  padding: 14px 26px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  color: #b0b0d0;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: -2px;
  border: 2px solid #2a2a3e;
  border-bottom: none;
}

.tab-btn:hover {
  background: #3a3a4e;
  color: white;
}

.tab-btn.attivo {
  background: #1a1a2e;
  color: #d81b60;
  border-color: #d81b60;
}

.badge {
  background: #3a3a4e;
  color: white;
  border-radius: 12px;
  padding: 2px 10px;
  font-size: 0.85rem;
}

.tab-btn.attivo .badge {
  background: #d81b60;
}

/* STATISTICHE */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
}

.stat-card {
  background: #2a2a3e;
  border-radius: 15px;
  padding: 30px 22px;
  text-align: center;
  border-left: 4px solid #00c4b4;
  transition: transform 0.3s;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-utenti { border-left-color: #00c4b4; }
.stat-viaggi { border-left-color: #00897b; }
.stat-misteriosi { border-left-color: #6a1b9a; }
.stat-attivi { border-left-color: #f57c00; }
.stat-incasso { border-left-color: #d81b60; }

.stat-icona {
  font-size: 2.8rem;
  margin-bottom: 12px;
}

.stat-numero {
  font-size: 2.2rem;
  font-weight: 900;
  color: white;
  line-height: 1;
  margin-bottom: 8px;
}

.stat-label {
  color: #b0b0d0;
  font-size: 0.9rem;
}

/* SEZIONI */
.sottotitolo-tab {
  color: #00c4b4;
  margin: 25px 0 15px 0;
  font-size: 1.3rem;
}

.vuoto {
  background: #2a2a3e;
  padding: 25px;
  border-radius: 10px;
  text-align: center;
  color: #b0b0d0;
  font-style: italic;
  margin-bottom: 20px;
}

/* TABELLE */
.tabella-wrapper {
  background: #2a2a3e;
  border-radius: 12px;
  overflow-x: auto;
  margin-bottom: 30px;
}

.tabella-admin {
  width: 100%;
  border-collapse: collapse;
  color: white;
  font-size: 0.9rem;
}

.tabella-admin th {
  background: #1a1a2e;
  color: #00c4b4;
  padding: 14px 12px;
  text-align: left;
  font-weight: bold;
  text-transform: uppercase;
  font-size: 0.8rem;
  letter-spacing: 1px;
}

.tabella-admin td {
  padding: 12px;
  border-bottom: 1px solid #3a3a4e;
}

.tabella-admin tr:last-child td {
  border-bottom: none;
}

.tabella-admin tr:hover {
  background: #3a3a4e;
}

.tabella-admin small {
  color: #b0b0d0;
  font-size: 0.8rem;
}

.codice-cell {
  font-family: 'Courier New', monospace;
  color: #d81b60;
  font-weight: bold;
}

.stato-badge {
  padding: 4px 10px;
  border-radius: 10px;
  font-size: 0.8rem;
  font-weight: bold;
  text-transform: lowercase;
}

.stato-in_attesa { background: #fff8e1; color: #f57c00; }
.stato-confermata { background: #e0f7f5; color: #00897b; }
.stato-rivelata { background: #f3e5f5; color: #6a1b9a; }
.stato-completata { background: #e8f5e9; color: #2e7d32; }
.stato-annullata { background: #fce4ec; color: #d81b60; }

.select-stato {
  background: #1a1a2e;
  color: white;
  border: 1px solid #3a3a4e;
  padding: 6px 10px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
}

.select-stato:hover {
  border-color: #00c4b4;
}

.badge-ruolo {
  padding: 4px 10px;
  border-radius: 10px;
  font-size: 0.8rem;
  font-weight: bold;
}

.badge-admin-piccolo {
  background: linear-gradient(135deg, #d81b60 0%, #6a1b9a 100%);
  color: white;
}

.badge-user {
  background: #3a3a4e;
  color: #b0b0d0;
}
/* MESSAGGI */
.messaggi-section {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.messaggio-card {
  background: #2a2a3e;
  border-radius: 12px;
  padding: 22px;
  border-left: 4px solid #00c4b4;
  transition: transform 0.2s;
}

.messaggio-card:hover {
  transform: translateX(4px);
}

.msg-nuovo { border-left-color: #d81b60; }
.msg-letto { border-left-color: #f57c00; }
.msg-risolto { border-left-color: #00c4b4; opacity: 0.7; }

.messaggio-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 15px;
  flex-wrap: wrap;
  margin-bottom: 14px;
  padding-bottom: 14px;
  border-bottom: 1px solid #3a3a4e;
}

.messaggio-header small {
  color: #b0b0d0;
  font-size: 0.85rem;
}

.messaggio-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
}

.badge-utente {
  display: inline-block;
  background: #00c4b4;
  color: white;
  padding: 2px 8px;
  border-radius: 8px;
  font-size: 0.75rem;
  margin-left: 8px;
  font-weight: bold;
}

.messaggio-motivo {
  color: #b0b0d0;
  font-size: 0.95rem;
  margin-bottom: 12px;
}

.messaggio-motivo strong {
  color: white;
}

.messaggio-testo {
  background: #1a1a2e;
  padding: 16px;
  border-radius: 8px;
  color: white;
  line-height: 1.6;
  font-size: 0.95rem;
  white-space: pre-wrap;
  margin-bottom: 14px;
}

.messaggio-azioni {
  display: flex;
  justify-content: flex-end;
}

/* RECENSIONI ADMIN */
.recensioni-admin-section {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.recensione-admin-card {
  background: #2a2a3e;
  border-radius: 12px;
  padding: 22px;
  border-left: 4px solid #00c4b4;
  transition: transform 0.2s;
}

.recensione-admin-card:hover {
  transform: translateX(4px);
}

.rec-in_attesa { border-left-color: #f57c00; }
.rec-pubblicata { border-left-color: #00c4b4; }
.rec-nascosta { border-left-color: #d81b60; opacity: 0.6; }

.recensione-admin-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 15px;
  flex-wrap: wrap;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #3a3a4e;
}

.email-utente {
  display: block;
  color: #b0b0d0;
  font-size: 0.85rem;
  margin-top: 2px;
}

.recensione-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
}

.stato-rec-in_attesa { background: #fff8e1; color: #f57c00; padding: 4px 10px; border-radius: 10px; font-size: 0.8rem; font-weight: bold; }
.stato-rec-pubblicata { background: #e0f7f5; color: #00897b; padding: 4px 10px; border-radius: 10px; font-size: 0.8rem; font-weight: bold; }
.stato-rec-nascosta { background: #fce4ec; color: #d81b60; padding: 4px 10px; border-radius: 10px; font-size: 0.8rem; font-weight: bold; }

.stelle-admin {
  font-size: 1.4rem;
  letter-spacing: 3px;
  color: #555;
  margin-bottom: 10px;
}

.stelle-admin .stella-attiva {
  color: #f57c00;
}

.stelle-numero {
  margin-left: 12px;
  color: white;
  font-size: 0.95rem;
  font-weight: bold;
}

.recensione-titolo-admin {
  margin: 0 0 8px 0;
  color: white;
  font-size: 1.1rem;
}

.recensione-testo-admin {
  color: #d0d0e0;
  line-height: 1.6;
  margin: 0 0 14px 0;
  font-size: 0.95rem;
  white-space: pre-wrap;
  background: #1a1a2e;
  padding: 14px;
  border-radius: 8px;
}

.recensione-azioni {
  display: flex;
  justify-content: flex-end;
}

/* RESPONSIVE */
@media (max-width: 768px) {
  .tab-btn {
    flex: 1;
    justify-content: center;
    font-size: 0.85rem;
    padding: 12px 14px;
  }
  .stat-numero {
    font-size: 1.8rem;
  }
}
</style>