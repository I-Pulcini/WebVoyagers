<script setup>
  
import { ref, onMounted, watch, nextTick } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { userStore } from '../stores/userStore'


  
import $ from 'jquery' 
const route = useRoute()  
const router = useRouter()  

const viaggio = ref(null)
const caricamento = ref(true)
const erroreCaricamento = ref('')

const giorniAperti = ref([])

const modaleAperto = ref(false)
const numeroViaggiatori = ref(1)
const nomeCompleto = ref('')
const emailContatto = ref('')
const telefono = ref('')
const note = ref('')
const errore = ref('')
const inviando = ref(false)
const successo = ref(null)


const caricaViaggio = async (id) => {  /
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

const toggleGiorno = (index) => {   
  const posizione = giorniAperti.value.indexOf(index)  
  if (posizione === -1) { 
  
    giorniAperti.value.push(index)  
  } else {
    giorniAperti.value.splice(posizione, 1) 
  }
}

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

const chiudiModale = () => {
  modaleAperto.value = false
  errore.value = ''
}

const inviaPrenotazione = async () => {
  errore.value = ''
  
  if (!nomeCompleto.value || !emailContatto.value || !numeroViaggiatori.value || !telefono.value || numeroViaggiatori== 0 ) {
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


const animaGalleria = () => {   //abbiamo usato Jquery al posto di Vue
 
  $('.foto-grid').hide()  //serve per rascondere tutte le foto nella pagina
  $('.foto-grid').each(function(index) {  //poi facciamo un ciclo su ogni singola foto trovata e della prima foto l'indice sarà 0 ecc
    $(this).delay(index * 150).fadeIn(800)  //selezionato la singola foto specifica e si aprirà nel tempo di index*150 ms mentre .fadeIn(800) fa apparire la foto con una sfumatura 
  })
}

onMounted(() => {
  caricaViaggio(route.params.id)
})

watch(() => route.params.id, (nuovoId) => {
  if (nuovoId) {
    caricaViaggio(nuovoId)
  }
})


watch(viaggio, async (nuovoViaggio) => {
  if (nuovoViaggio && nuovoViaggio.galleria_foto && nuovoViaggio.galleria_foto.length > 0) {  
 
    await nextTick()  
    animaGalleria()
  }
})
</script>

<template>
  <div class="viaggio-wrapper">
   //schermata
    <div v-if="caricamento" class="loading-box">
      <p>⏳ Caricamento viaggio in corso...</p>
    </div>

   //errori 
    <div v-else-if="erroreCaricamento" class="errore-box">
      <h2>⚠️ Ops!</h2>
      <p>{{ erroreCaricamento }}</p>
      <RouterLink to="/viaggi-disponibili" class="btn-torna">← Torna ai viaggi</RouterLink>
    </div>

  
    <template v-else-if="viaggio">
      <header 
        class="fascia-foto"
        :style="viaggio.foto_header ? { backgroundImage: `url('${viaggio.foto_header}')` } : {}"   
        >
        <h1 class="fascia-titolo">{{ viaggio.destinazione }}</h1>
        </header>

      //prenota viaggio
      <div class="prenota-bar">
        <div class="prenota-info">
          <span class="prenota-prezzo">{{ viaggio.prezzo }}€</span>
          <span class="prenota-durata">{{ viaggio.periodo }} · {{ viaggio.mese }}</span>
          <span class="prenota-posti">
      🎒 Posti rimasti: {{ viaggio.posti_disponibili }} su {{ viaggio.posti_totali }} totali
    </span>
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

       //bottone prenota in fondo alla pagina
        <section class="cta-finale">
          <h2>Pronto a partire?</h2>
          <p>Posti limitati. Prenota ora e assicurati il tuo posto in questa avventura.</p>
          <button @click="apriModale" class="btn-prenota-grande">
            🎒 Prenota questo viaggio
          </button>
        </section>
      </main>

      <div v-if="modaleAperto" class="modale-overlay" @click.self="chiudiModale">
        <div class="modale-content">

       // schermata successo
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

       //form prenotazione
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
  gap: 5px;
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
