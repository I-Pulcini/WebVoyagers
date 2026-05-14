<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { userStore } from '../stores/userStore'
// Abbiamo importato jQuery (Rif: 11-jquery.pdf) per realizzare alcuni effetti
// di animazione sulla galleria fotografica. jQuery è un framework JS storico
// che semplifica selezione DOM, eventi e animazioni cross-browser.
// Lo usiamo qui in modo dimostrativo: di solito Vue gestisce tutto in modo
// dichiarativo, ma jQuery offre metodi imperativi (fadeIn, animate, ecc.)
// molto rapidi da scrivere per piccoli effetti visivi.
import $ from 'jquery'

/* --- PAGINA DINAMICA DETTAGLIO VIAGGIO --- */
// Abbiamo creato una sola pagina riusabile per tutti i viaggi disponibili.
// L'id del viaggio viene preso dall'URL (es. /viaggio/1, /viaggio/2)
// e i contenuti (descrizione, itinerario, foto) vengono caricati dal backend.

const route = useRoute()
const router = useRouter()

// Abbiamo creato le variabili reattive per i dati del viaggio
const viaggio = ref(null)
const caricamento = ref(true)
const erroreCaricamento = ref('')

// Abbiamo creato un array reattivo che tiene traccia di quali giorni sono aperti
const giorniAperti = ref([])

// Abbiamo creato le variabili reattive per il modale di prenotazione
const modaleAperto = ref(false)
const numeroViaggiatori = ref(1)
const nomeCompleto = ref('')
const emailContatto = ref('')
const telefono = ref('')
const note = ref('')
const errore = ref('')
const inviando = ref(false)
const successo = ref(null)

// Abbiamo creato la funzione per caricare i dati del viaggio dal backend
const caricaViaggio = async (id) => {
  caricamento.value = true
  erroreCaricamento.value = ''
  viaggio.value = null
  giorniAperti.value = []
  
  try {
    const response = await fetch(`/api/viaggi/dettaglio/${id}`, {
      credentials: 'include'
    })
    
    const data = await response.json()
    
    if (response.ok) {
      viaggio.value = data
    } else {
      erroreCaricamento.value = data.error || 'Viaggio non trovato.'
    }
  } catch (err) {
    console.error('Errore nel caricamento del viaggio:', err)
    erroreCaricamento.value = 'Errore di connessione al server.'
  } finally {
    caricamento.value = false
  }
}

// Abbiamo creato la funzione che apre/chiude un singolo giorno dell'itinerario
const toggleGiorno = (index) => {
  const posizione = giorniAperti.value.indexOf(index)
  if (posizione === -1) {
    // Non era aperto: lo aggiungiamo agli aperti
    giorniAperti.value.push(index)
  } else {
    // Era aperto: lo togliamo dagli aperti
    giorniAperti.value.splice(posizione, 1)
  }
}

// Abbiamo creato la funzione che apre il modale di prenotazione
const apriModale = () => {
  if (!userStore.loggato) {
    errore.value = ''
    router.push('/login')
    return
  }
  modaleAperto.value = true
  errore.value = ''
  successo.value = null
}

// Abbiamo creato la funzione che chiude il modale e resetta i campi
const chiudiModale = () => {
  modaleAperto.value = false
  errore.value = ''
}

// Abbiamo creato la funzione asincrona che invia la prenotazione al backend
const inviaPrenotazione = async () => {
  errore.value = ''
  
  if (!nomeCompleto.value || !emailContatto.value || !numeroViaggiatori.value) {
    errore.value = 'Compila tutti i campi obbligatori.'
    return
  }
  
  inviando.value = true
  
  try {
    const response = await fetch('/api/prenota-viaggio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        idViaggio: viaggio.value.id,
        numeroViaggiatori: numeroViaggiatori.value,
        nomeCompleto: nomeCompleto.value,
        emailContatto: emailContatto.value,
        telefono: telefono.value,
        note: note.value
      })
    })
    
    const data = await response.json()
    
    if (response.ok) {
      successo.value = {
        codice: data.codice,
        destinazione: data.destinazione
      }
      numeroViaggiatori.value = 1
      nomeCompleto.value = ''
      emailContatto.value = ''
      telefono.value = ''
      note.value = ''
    } else {
      errore.value = data.error || 'Errore durante la prenotazione.'
    }
  } catch (err) {
    console.error('Errore nella chiamata al backend:', err)
    errore.value = 'Errore di connessione al server.'
  } finally {
    inviando.value = false
  }
}

/* --- ANIMAZIONI CON JQUERY (Rif: 11-jquery.pdf) --- */
// Abbiamo creato una funzione che usa jQuery per animare la galleria foto
// con un effetto "fade-in scaglionato": le foto compaiono una alla volta
// con un piccolo ritardo crescente, creando un effetto cascata.
// 
// Note tecniche dimostrate qui:
// - $('.foto-grid') = selettore jQuery con sintassi CSS (come in JQuery slide 9)
// - .hide() = metodo jQuery che nasconde gli elementi (display:none)
// - .each(function(index) {...}) = iterazione su tutti gli elementi selezionati,
//   l'argomento index è la posizione nella collezione (slide 20)
// - $(this) = wrapping in oggetto jQuery dell'elemento corrente (slide 11)
// - .delay(ms) = inserisce un ritardo nella coda delle animazioni
// - .fadeIn(durata) = effetto di assolvenza (slide 27)
// - method chaining: $(...).delay().fadeIn() (slide 25)
const animaGalleria = () => {
  // Abbiamo nascosto inizialmente tutte le foto della galleria
  $('.foto-grid').hide()
  // Le abbiamo mostrate una alla volta con fadeIn ed un ritardo crescente
  // (effetto "stagger") usando il metodo each() di jQuery
  $('.foto-grid').each(function(index) {
    $(this).delay(index * 150).fadeIn(800)
  })
}

// Abbiamo caricato il viaggio quando il componente viene montato
onMounted(() => {
  caricaViaggio(route.params.id)
})

// Abbiamo creato un watch per ricaricare il viaggio se l'id cambia
// (quando l'utente naviga da /viaggio/1 a /viaggio/2 senza ricaricare)
watch(() => route.params.id, (nuovoId) => {
  if (nuovoId) {
    caricaViaggio(nuovoId)
  }
})

// Abbiamo creato un watch su viaggio: quando i dati vengono caricati
// e il DOM è stato aggiornato da Vue (nextTick), lanciamo l'animazione jQuery.
// nextTick() è importante perché jQuery deve agire su elementi che esistono
// già nel DOM, e Vue li renderizza solo dopo che la variabile reattiva è stata aggiornata.
watch(viaggio, async (nuovoViaggio) => {
  if (nuovoViaggio && nuovoViaggio.galleria_foto && nuovoViaggio.galleria_foto.length > 0) {
    // Aspettiamo che Vue abbia finito di renderizzare il DOM
    await nextTick()
    // Lanciamo l'animazione jQuery
    animaGalleria()
  }
})
</script>

<template>
  <div class="viaggio-wrapper">
    <!-- SCHERMATA DI CARICAMENTO -->
    <div v-if="caricamento" class="loading-box">
      <p>⏳ Caricamento viaggio in corso...</p>
    </div>

    <!-- ERRORE -->
    <div v-else-if="erroreCaricamento" class="errore-box">
      <h2>⚠️ Ops!</h2>
      <p>{{ erroreCaricamento }}</p>
      <RouterLink to="/viaggi-disponibili" class="btn-torna">← Torna ai viaggi</RouterLink>
    </div>

    <!-- VIAGGIO CARICATO -->
    <template v-else-if="viaggio">
      <header 
        class="fascia-foto"
        :style="viaggio.foto_header ? { backgroundImage: `url('${viaggio.foto_header}')` } : {}"
        >
        <h1 class="fascia-titolo">{{ viaggio.destinazione }}</h1>
        </header>

      <!-- Bottone Prenota in posizione fissa -->
      <div class="prenota-bar">
        <div class="prenota-info">
          <span class="prenota-prezzo">{{ viaggio.prezzo }}€</span>
          <span class="prenota-durata">{{ viaggio.periodo }} · {{ viaggio.mese }}</span>
        </div>
        <button @click="apriModale" class="btn-prenota-grande">
          🎒 Prenota questo viaggio
        </button>
      </div>

      <main>
        <section class="fascia-testo">
          <p style="margin-top: 0;">{{ viaggio.descrizione }}</p>
        </section>

        <h2 class="titolo-sezione">Itinerario Viaggio</h2>

        <section class="itinerario-container">
          <template v-for="(giorno, index) in viaggio.itinerario" :key="index">
            <button 
              class="accordion" 
              :class="{ active: giorniAperti.includes(index) }"
              @click="toggleGiorno(index)"
            >
              {{ giorno.titolo }}
            </button>
            <div 
              class="panel" 
              :style="{ 
                backgroundImage: `url('${giorno.immagine}')`,
                display: giorniAperti.includes(index) ? 'block' : 'none'
              }"
            >
              <div class="testo-giorno" v-html="giorno.testo"></div>
            </div>
          </template>
        </section>

        <h2 class="titolo-sezione">Galleria Fotografica</h2>
        <section class="galleria-grid">
          <div 
            v-for="(foto, index) in viaggio.galleria_foto" 
            :key="index"
            class="foto-grid" 
            :style="{ backgroundImage: `url('${foto}')` }"
          ></div>
        </section>

        <!-- Bottone Prenota in fondo pagina -->
        <section class="cta-finale">
          <h2>Pronto a partire?</h2>
          <p>Posti limitati. Prenota ora e assicurati il tuo posto in questa avventura.</p>
          <button @click="apriModale" class="btn-prenota-grande">
            🎒 Prenota questo viaggio
          </button>
        </section>
      </main>

      <!-- MODALE PRENOTAZIONE -->
      <div v-if="modaleAperto" class="modale-overlay" @click.self="chiudiModale">
        <div class="modale-content">

          <!-- SCHERMATA SUCCESSO -->
          <div v-if="successo" class="successo-box">
            <div class="successo-icona">🎉</div>
            <h2>Prenotazione confermata!</h2>
            <p class="codice-label">Il tuo codice di prenotazione:</p>
            <div class="codice-box">{{ successo.codice }}</div>
            <p class="testo-successo">
              Ti contatteremo presto con tutti i dettagli per il viaggio in <strong>{{ successo.destinazione }}</strong>.
            </p>
            <p class="testo-successo-secondo">
              Conserva il codice. Lo trovi anche nella sezione "Le mie prenotazioni".
            </p>
            <div class="bottoni-successo">
              <RouterLink to="/le-mie-prenotazioni" @click="chiudiModale" class="btn-vedi-prenotazioni">
                Vedi le mie prenotazioni
              </RouterLink>
              <button @click="chiudiModale" class="btn-chiudi-successo">Chiudi</button>
            </div>
          </div>

          <!-- FORM DI PRENOTAZIONE -->
          <div v-else>
            <button @click="chiudiModale" class="btn-chiudi-x" aria-label="Chiudi">×</button>
            <h2 class="modale-titolo">🎒 Prenota: {{ viaggio.destinazione }}</h2>
            <p class="modale-sottotitolo">Compila i dati per confermare la tua prenotazione.</p>

            <div v-if="errore" class="messaggio-errore">⚠️ {{ errore }}</div>

            <form @submit.prevent="inviaPrenotazione" class="form-prenotazione">
              <div class="form-row">
                <label for="num">👥 Numero viaggiatori *</label>
                <input id="num" type="number" v-model="numeroViaggiatori" min="1" max="20" required />
              </div>

              <div class="form-row">
                <label for="nome">📝 Nome e cognome *</label>
                <input id="nome" type="text" v-model="nomeCompleto" placeholder="Mario Rossi" required />
              </div>

              <div class="form-row">
                <label for="email">📧 Email *</label>
                <input id="email" type="email" v-model="emailContatto" placeholder="mario.rossi@email.com" required />
              </div>

              <div class="form-row">
                <label for="tel">📞 Telefono</label>
                <input id="tel" type="tel" v-model="telefono" placeholder="+39 333 1234567" />
              </div>

              <div class="form-row">
                <label for="note">💬 Note (opzionali)</label>
                <textarea id="note" v-model="note" rows="3" placeholder="Allergie, richieste speciali, ecc."></textarea>
              </div>

              <div class="modale-azioni">
                <button type="button" @click="chiudiModale" class="btn-annulla">Annulla</button>
                <button type="submit" :disabled="inviando" class="btn-conferma">
                  <span v-if="inviando">⏳ Prenotazione in corso...</span>
                  <span v-else>✓ Conferma prenotazione</span>
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
/* Schermata caricamento ed errore */
.loading-box, .errore-box {
  text-align: center;
  padding: 80px 20px;
  font-size: 1.2rem;
  color: #555;
}

.errore-box h2 {
  color: #d81b60;
  font-size: 2rem;
  margin-bottom: 15px;
}

.btn-torna {
  display: inline-block;
  margin-top: 20px;
  background: #00c4b4;
  color: white;
  padding: 12px 28px;
  border-radius: 30px;
  text-decoration: none;
  font-weight: bold;
}

.btn-torna:hover {
  background: #00897b;
}

/* Bottone Prenota grande - barra fissa sotto l'header */
.prenota-bar {
  background: linear-gradient(135deg, #00c4b4 0%, #00897b 100%);
  padding: 25px 5%;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 30px;
  flex-wrap: wrap;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}

.prenota-info {
  display: flex;
  flex-direction: column;
  color: white;
  text-align: right;
}

.prenota-prezzo {
  font-size: 2rem;
  font-weight: 900;
  line-height: 1;
}

.prenota-durata {
  font-size: 0.95rem;
  opacity: 0.95;
  margin-top: 4px;
}

.btn-prenota-grande {
  background: white;
  color: #d81b60;
  border: none;
  padding: 16px 40px;
  border-radius: 50px;
  font-size: 1.15rem;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.3s;
  box-shadow: 0 6px 15px rgba(0,0,0,0.15);
}

.btn-prenota-grande:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
}

/* Sezione CTA finale */
.cta-finale {
  background: linear-gradient(135deg, #d81b60 0%, #6a1b9a 100%);
  padding: 70px 30px;
  text-align: center;
  color: white;
  margin-top: 60px;
}

.cta-finale h2 {
  font-size: clamp(1.8rem, 4vw, 2.5rem);
  margin: 0 0 15px 0;
}

.cta-finale p {
  font-size: 1.1rem;
  margin: 0 0 30px 0;
  opacity: 0.95;
}

.cta-finale .btn-prenota-grande {
  color: #d81b60;
}

/* MODALE */
.modale-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  padding: 20px;
  backdrop-filter: blur(3px);
}

.modale-content {
  background: white;
  border-radius: 15px;
  padding: 40px 35px;
  max-width: 550px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 20px 50px rgba(0,0,0,0.3);
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
  color: #d81b60;
}

.modale-titolo {
  margin: 0 0 8px 0;
  color: #00897b;
  font-size: 1.6rem;
}

.modale-sottotitolo {
  color: #666;
  margin: 0 0 25px 0;
  font-size: 0.95rem;
}

.messaggio-errore {
  background: #fce4ec;
  color: #d81b60;
  padding: 12px 18px;
  border-radius: 8px;
  border-left: 4px solid #d81b60;
  margin-bottom: 18px;
  font-weight: bold;
  font-size: 0.95rem;
}

.form-prenotazione {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.form-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-row label {
  font-weight: bold;
  color: #333;
  font-size: 0.95rem;
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
  border-color: #00c4b4;
  box-shadow: 0 0 0 3px rgba(0,196,180,0.15);
}

.form-row textarea {
  resize: vertical;
}

.modale-azioni {
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

.btn-annulla:hover {
  background: #e0e0e0;
}

.btn-conferma {
  background: linear-gradient(135deg, #00c4b4 0%, #00897b 100%);
  color: white;
}

.btn-conferma:hover:not(:disabled) {
  transform: translateY(-2px);
}

.btn-conferma:disabled {
  background: #ccc;
  cursor: not-allowed;
}

/* SUCCESSO */
.successo-box {
  text-align: center;
  padding: 20px 0;
}

.successo-icona {
  font-size: 5rem;
  margin-bottom: 20px;
  animation: bounce 1s ease;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-15px); }
}

.successo-box h2 {
  color: #00897b;
  margin: 0 0 20px 0;
  font-size: 1.8rem;
}

.codice-label {
  color: #666;
  font-size: 0.95rem;
  margin: 0 0 10px 0;
}

.codice-box {
  font-family: 'Courier New', monospace;
  font-size: 1.6rem;
  font-weight: bold;
  color: #d81b60;
  letter-spacing: 3px;
  background: #f9f9f9;
  padding: 18px;
  border-radius: 10px;
  border: 2px dashed #d81b60;
  display: inline-block;
  margin-bottom: 20px;
}

.testo-successo {
  color: #444;
  font-size: 1.05rem;
  line-height: 1.6;
  margin: 0 0 12px 0;
}

.testo-successo-secondo {
  color: #888;
  font-size: 0.9rem;
  margin: 0 0 25px 0;
}

.bottoni-successo {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
}

.btn-vedi-prenotazioni {
  background: #00c4b4;
  color: white;
  padding: 12px 28px;
  border-radius: 30px;
  text-decoration: none;
  font-weight: bold;
  transition: background-color 0.3s;
}

.btn-vedi-prenotazioni:hover {
  background: #00897b;
}

.btn-chiudi-successo {
  background: white;
  color: #666;
  border: 2px solid #ddd;
  padding: 12px 28px;
  border-radius: 30px;
  font-weight: bold;
  cursor: pointer;
}

.btn-chiudi-successo:hover {
  background: #f5f5f5;
}

@media (max-width: 600px) {
  .prenota-bar {
    flex-direction: column;
    gap: 15px;
  }
  .prenota-info {
    text-align: center;
  }
  .modale-content {
    padding: 30px 22px;
  }
}
</style>