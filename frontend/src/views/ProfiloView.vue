<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { userStore } from '../stores/userStore'

/* --- PAGINA PROFILO UTENTE --- */
/* Abbiamo creato una pagina dove l'utente loggato può:
   - Vedere i propri dati (username, email, data registrazione)
   - Cambiare la password (richiedendo la verifica della vecchia)
   - Consultare le statistiche personali sulle prenotazioni */

const router = useRouter()

// Abbiamo creato le variabili reattive per gestire i dati del profilo
const profilo = ref(null)
const caricamento = ref(true)
const errore = ref('')

// Abbiamo creato le variabili per il form di cambio password
const passwordAttuale = ref('')
const passwordNuova = ref('')
const passwordConferma = ref('')
const erroreCambioPassword = ref('')
const successoCambioPassword = ref('')
const cambiandoPassword = ref(false)
const formCambioPasswordAperto = ref(false)

// Abbiamo creato la funzione asincrona che scarica i dati del profilo dal backend
const caricaProfilo = async () => {
  try {
    const response = await fetch('/api/profilo', {
      credentials: 'include'
    })
    const data = await response.json()
    
    if (response.ok) {
      profilo.value = data
    } else {
      errore.value = data.error || 'Errore nel caricamento del profilo.'
    }
  } catch (err) {
    console.error('Errore nella chiamata al backend:', err)
    errore.value = 'Errore di connessione al server.'
  } finally {
    caricamento.value = false
  }
}

// Abbiamo creato la funzione che formatta la data di registrazione in italiano
const formattaData = (dataIso) => {
  return new Date(dataIso).toLocaleDateString('it-IT', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  })
}

// Abbiamo creato la funzione che apre il form di cambio password svuotando i campi
const apriCambioPassword = () => {
  formCambioPasswordAperto.value = true
  passwordAttuale.value = ''
  passwordNuova.value = ''
  passwordConferma.value = ''
  erroreCambioPassword.value = ''
  successoCambioPassword.value = ''
}

// Abbiamo creato la funzione che chiude il form di cambio password
const chiudiCambioPassword = () => {
  formCambioPasswordAperto.value = false
  erroreCambioPassword.value = ''
  successoCambioPassword.value = ''
}

// Abbiamo creato la funzione asincrona che invia la richiesta di cambio password al backend
const cambiaPassword = async () => {
  erroreCambioPassword.value = ''
  successoCambioPassword.value = ''
  
  // Abbiamo verificato che tutti i campi siano compilati
  if (!passwordAttuale.value || !passwordNuova.value || !passwordConferma.value) {
    erroreCambioPassword.value = 'Compila tutti i campi.'
    return
  }
  
  // Abbiamo verificato che le due nuove password coincidano
  if (passwordNuova.value !== passwordConferma.value) {
    erroreCambioPassword.value = 'Le due nuove password non coincidono.'
    return
  }
  
  // Abbiamo verificato che la nuova password sia abbastanza lunga
  if (passwordNuova.value.length < 6) {
    erroreCambioPassword.value = 'La nuova password deve essere di almeno 6 caratteri.'
    return
  }
  
  cambiandoPassword.value = true
  
  try {
    const response = await fetch('/api/cambia-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        passwordAttuale: passwordAttuale.value,
        passwordNuova: passwordNuova.value
      })
    })
    
    const data = await response.json()
    
    if (response.ok) {
      successoCambioPassword.value = data.message
      // Abbiamo svuotato i campi del form dopo il successo
      passwordAttuale.value = ''
      passwordNuova.value = ''
      passwordConferma.value = ''
      // Abbiamo chiuso automaticamente il form dopo 2 secondi
      setTimeout(() => {
        chiudiCambioPassword()
      }, 2000)
    } else {
      erroreCambioPassword.value = data.error || 'Errore durante il cambio password.'
    }
  } catch (err) {
    console.error('Errore nella chiamata al backend:', err)
    erroreCambioPassword.value = 'Errore di connessione al server.'
  } finally {
    cambiandoPassword.value = false
  }
}

/* --- LIFECYCLE HOOK --- */
onMounted(() => {
  // Se l'utente non è loggato, lo rimandiamo al login
  if (!userStore.loggato) {
    router.push('/login')
    return
  }
  caricaProfilo()
})
</script>

<template>
  <div class="Profilo-wrapper">

    <!-- HEADER -->
    <header class="header-profilo">
      <div class="overlay-stelle"></div>
      <div class="header-content">
        <div class="avatar-grande">
          {{ userStore.username ? userStore.username.charAt(0).toUpperCase() : '?' }}
        </div>
        <h1 class="titolo-pagina">{{ userStore.username }}</h1>
        <p class="sottotitolo-pagina" v-if="profilo">
          Membro WebVoyagers dal {{ formattaData(profilo.dataRegistrazione) }}
        </p>
      </div>
    </header>

    <main class="contenuto-principale">

      <!-- CARICAMENTO -->
      <div v-if="caricamento" class="stato-info">
        <div class="spinner">⏳</div>
        <p>Caricamento profilo...</p>
      </div>

      <!-- ERRORE -->
      <div v-else-if="errore" class="messaggio-errore">
        ⚠️ {{ errore }}
      </div>

      <!-- CONTENUTO PROFILO -->
      <div v-else-if="profilo" class="profilo-content">

        <!-- SEZIONE INFORMAZIONI -->
        <section class="sezione-card">
          <h2 class="sezione-titolo">📌 Informazioni account</h2>
          <div class="info-grid">
            <div class="info-row">
              <span class="info-label">👤 Username</span>
              <span class="info-value">{{ profilo.username }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">📧 Email</span>
              <span class="info-value">{{ profilo.email }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">📅 Iscritto dal</span>
              <span class="info-value">{{ formattaData(profilo.dataRegistrazione) }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">🆔 ID utente</span>
              <span class="info-value">#{{ profilo.id }}</span>
            </div>
          </div>
        </section>

        <!-- SEZIONE STATISTICHE -->
        <section class="sezione-card">
          <h2 class="sezione-titolo">📊 Le tue statistiche</h2>
          <div class="stats-grid">
            <RouterLink to="/le-mie-prenotazioni" class="stat-card stat-viaggi">
              <div class="stat-icona">🎒</div>
              <div class="stat-numero">{{ profilo.statistiche.prenotazioniViaggi }}</div>
              <div class="stat-label">
                {{ profilo.statistiche.prenotazioniViaggi === 1 ? 'Viaggio prenotato' : 'Viaggi prenotati' }}
              </div>
            </RouterLink>
            <RouterLink to="/le-mie-prenotazioni" class="stat-card stat-misteriosi">
              <div class="stat-icona">🎁</div>
              <div class="stat-numero">{{ profilo.statistiche.prenotazioniMisteriose }}</div>
              <div class="stat-label">
                {{ profilo.statistiche.prenotazioniMisteriose === 1 ? 'Viaggio misterioso' : 'Viaggi misteriosi' }}
              </div>
            </RouterLink>
            <div class="stat-card stat-totale">
              <div class="stat-icona">🌍</div>
              <div class="stat-numero">
                {{ profilo.statistiche.prenotazioniViaggi + profilo.statistiche.prenotazioniMisteriose }}
              </div>
              <div class="stat-label">Totale prenotazioni</div>
            </div>
          </div>
        </section>

        <!-- SEZIONE SICUREZZA / CAMBIO PASSWORD -->
        <section class="sezione-card">
          <h2 class="sezione-titolo">🔒 Sicurezza</h2>

          <!-- Pulsante per aprire il form -->
          <div v-if="!formCambioPasswordAperto" class="sicurezza-info">
            <p class="sicurezza-testo">
              Per la tua sicurezza, ti consigliamo di cambiare periodicamente la password.
            </p>
            <button @click="apriCambioPassword" class="btn-cambia-password">
              🔑 Cambia password
            </button>
          </div>

          <!-- Form cambio password -->
          <form v-else @submit.prevent="cambiaPassword" class="form-cambio-password">

            <div v-if="erroreCambioPassword" class="messaggio-errore-piccolo">
              ⚠️ {{ erroreCambioPassword }}
            </div>

            <div v-if="successoCambioPassword" class="messaggio-successo">
              ✓ {{ successoCambioPassword }}
            </div>

            <div class="form-row">
              <label for="pwd-attuale">🔓 Password attuale</label>
              <input 
                id="pwd-attuale" 
                type="password" 
                v-model="passwordAttuale" 
                placeholder="Inserisci la tua password attuale" 
                :disabled="cambiandoPassword"
              />
            </div>

            <div class="form-row">
              <label for="pwd-nuova">🔐 Nuova password (min. 6 caratteri)</label>
              <input 
                id="pwd-nuova" 
                type="password" 
                v-model="passwordNuova" 
                placeholder="Scegli una nuova password" 
                :disabled="cambiandoPassword"
              />
            </div>

            <div class="form-row">
              <label for="pwd-conferma">🔐 Conferma nuova password</label>
              <input 
                id="pwd-conferma" 
                type="password" 
                v-model="passwordConferma" 
                placeholder="Ripeti la nuova password" 
                :disabled="cambiandoPassword"
              />
            </div>

            <div class="form-azioni">
              <button 
                type="button" 
                @click="chiudiCambioPassword" 
                class="btn-annulla"
                :disabled="cambiandoPassword"
              >
                Annulla
              </button>
              <button 
                type="submit" 
                class="btn-conferma" 
                :disabled="cambiandoPassword"
              >
                <span v-if="cambiandoPassword">⏳ Cambio in corso...</span>
                <span v-else>✓ Conferma cambio</span>
              </button>
            </div>
          </form>
        </section>

      </div>
    </main>
  </div>
</template>

<style scoped>
.Profilo-wrapper,
.Profilo-wrapper * {
  box-sizing: border-box;
}

.Profilo-wrapper {
  background-color: #f9f9f9;
  min-height: 100vh;
  width: 100%;
  font-family: sans-serif;
  overflow-x: hidden;
  color: #333;
}

/* ===== HEADER ===== */
.header-profilo {
  background: linear-gradient(135deg, #00897b 0%, #00c4b4 50%, #4527a0 100%);
  width: 100%;
  padding: 90px 5% 60px 5%;
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
  max-width: 800px;
  margin: 0 auto;
}

.avatar-grande {
  width: 130px;
  height: 130px;
  margin: 0 auto 20px auto;
  background: linear-gradient(135deg, #fff 0%, #e0f7f5 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 4rem;
  font-weight: 900;
  color: #00897b;
  border: 5px solid white;
  box-shadow: 0 6px 20px rgba(0,0,0,0.2);
}

.titolo-pagina {
  font-size: clamp(2rem, 5vw, 3.5rem);
  font-weight: 900;
  margin: 0 0 10px 0;
  letter-spacing: 2px;
  text-shadow: 2px 2px 10px rgba(0,0,0,0.4);
}

.sottotitolo-pagina {
  font-size: clamp(0.95rem, 1.3vw, 1.1rem);
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

.profilo-content {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

/* ===== STATI ===== */
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

/* ===== SEZIONE CARD ===== */
.sezione-card {
  background: white;
  border-radius: 15px;
  padding: 35px 30px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.06);
}

.sezione-titolo {
  margin: 0 0 25px 0;
  font-size: 1.4rem;
  color: #00897b;
  border-bottom: 2px solid #e0f7f5;
  padding-bottom: 12px;
}

/* ===== INFO GRID ===== */
.info-grid {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px dashed #eee;
  flex-wrap: wrap;
  gap: 8px;
}

.info-row:last-child {
  border-bottom: none;
}

.info-label {
  font-weight: bold;
  color: #555;
  font-size: 0.95rem;
}

.info-value {
  color: #333;
  font-weight: 600;
}

/* ===== STATISTICHE ===== */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
}

.stat-card {
  background: linear-gradient(135deg, #f9f9f9 0%, #fff 100%);
  border-radius: 12px;
  padding: 25px 15px;
  text-align: center;
  text-decoration: none;
  color: #333;
  transition: transform 0.3s, box-shadow 0.3s;
  border: 2px solid transparent;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.1);
  border-color: #00c4b4;
}

.stat-viaggi {
  background: linear-gradient(135deg, #e0f7f5 0%, #fff 100%);
}

.stat-misteriosi {
  background: linear-gradient(135deg, #f3e5f5 0%, #fff 100%);
}

.stat-totale {
  background: linear-gradient(135deg, #fff3e0 0%, #fff 100%);
  cursor: default;
}

.stat-totale:hover {
  transform: none;
  border-color: transparent;
  box-shadow: none;
}

.stat-icona {
  font-size: 3rem;
  margin-bottom: 10px;
}

.stat-numero {
  font-size: 2.5rem;
  font-weight: 900;
  color: #00897b;
  line-height: 1;
  margin-bottom: 8px;
}

.stat-misteriosi .stat-numero {
  color: #6a1b9a;
}

.stat-totale .stat-numero {
  color: #f57c00;
}

.stat-label {
  font-size: 0.9rem;
  color: #666;
}

/* ===== SICUREZZA ===== */
.sicurezza-info {
  text-align: center;
}

.sicurezza-testo {
  color: #555;
  margin: 0 0 20px 0;
  line-height: 1.5;
}

.btn-cambia-password {
  background: linear-gradient(135deg, #d81b60 0%, #6a1b9a 100%);
  color: white;
  border: none;
  padding: 14px 32px;
  border-radius: 30px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.3s;
  box-shadow: 0 6px 15px rgba(216, 27, 96, 0.3);
}

.btn-cambia-password:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 25px rgba(216, 27, 96, 0.4);
}

.form-cambio-password {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.form-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-row label {
  font-weight: bold;
  color: #333;
  font-size: 0.95rem;
}

.form-row input {
  padding: 12px 14px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  font-family: inherit;
  transition: border-color 0.3s;
}

.form-row input:focus {
  outline: none;
  border-color: #00c4b4;
  box-shadow: 0 0 0 3px rgba(0,196,180,0.15);
}

.form-row input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.form-azioni {
  display: flex;
  gap: 12px;
  margin-top: 10px;
}

.btn-annulla,
.btn-conferma {
  flex: 1;
  padding: 14px 20px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  border: none;
  transition: transform 0.2s, background-color 0.3s;
}

.btn-annulla {
  background: #f5f5f5;
  color: #333;
}

.btn-annulla:hover:not(:disabled) {
  background: #e0e0e0;
}

.btn-conferma {
  background: linear-gradient(135deg, #00c4b4 0%, #00897b 100%);
  color: white;
}

.btn-conferma:hover:not(:disabled) {
  transform: translateY(-2px);
}

.btn-annulla:disabled,
.btn-conferma:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.messaggio-errore-piccolo {
  background: #fce4ec;
  color: #d81b60;
  padding: 12px 18px;
  border-radius: 8px;
  border-left: 4px solid #d81b60;
  font-weight: bold;
  font-size: 0.95rem;
}

.messaggio-successo {
  background: #e8f8f5;
  color: #00897b;
  padding: 12px 18px;
  border-radius: 8px;
  border-left: 4px solid #00c4b4;
  font-weight: bold;
  font-size: 0.95rem;
}

/* ===== RESPONSIVE ===== */
@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  .info-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
}
</style>