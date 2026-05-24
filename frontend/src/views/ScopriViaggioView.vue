<script setup>
import { ref } from 'vue'
import { RouterLink } from 'vue-router'


const codiceInserito = ref('')
const errore = ref('')
const caricamento = ref(false)
const risultato = ref(null)

const cercaPrenotazione = async () => {
  errore.value = ''
  risultato.value = null

  if (!codiceInserito.value.trim()) {
    errore.value = 'Inserisci il tuo codice prenotazione.'
    return
  }

  caricamento.value = true

  try {
    const response = await fetch(`/api/scopri-viaggio/${codiceInserito.value.trim().toUpperCase()}`)
    const data = await response.json()

    if (response.ok) {
      risultato.value = data
    } else {
      errore.value = data.error || 'Errore durante la ricerca.'
    }
  } catch (err) {
    console.error('Errore nella chiamata al backend:', err)
    errore.value = 'Errore di connessione al server.'
  } finally {
    caricamento.value = false
  }
}

const nuovaRicerca = () => {
  codiceInserito.value = ''
  risultato.value = null
  errore.value = ''
}
</script>

<template>
  <div class="ScopriViaggio-wrapper">


    <header class="header-scopri">
      <div class="overlay-stelle"></div>
      <div class="header-content">
        <div class="icona-scopri">🔮</div>
        <h1 class="titolo-pagina">SCOPRI IL TUO VIAGGIO</h1>
        <p class="sottotitolo-pagina">
          Inserisci il tuo codice di prenotazione per svelare la tua destinazione misteriosa!
        </p>
      </div>
    </header>

    <main class="contenuto-principale">

    
      <section v-if="!risultato" class="form-section">
        <form @submit.prevent="cercaPrenotazione" class="form-codice">
          <label for="codice">Il tuo codice di prenotazione</label>
          <input 
            id="codice" 
            type="text" 
            v-model="codiceInserito" 
            placeholder="Es. WV-ABC1234"
            class="input-codice"
            :disabled="caricamento"
          />

          <div v-if="errore" class="messaggio-errore">{{ errore }}</div>

          <button type="submit" class="btn-cerca" :disabled="caricamento">
            <span v-if="caricamento">⏳ Cerco...</span>
            <span v-else>🔮 Scopri il viaggio</span>
          </button>
        </form>

        <p class="aiuto-text">
          Hai smarrito il codice? Controlla la pagina di conferma della tua prenotazione.
        </p>
      </section>

      <section v-else-if="risultato.rivelato" class="risultato-rivelato">
        <div class="celebration-icon">🎉</div>
        <h2 class="risultato-titolo">È ora di scoprire!</h2>
        <p class="risultato-sottotitolo">La tua destinazione misteriosa è...</p>
        
        <div class="destinazione-card">
          <h3 class="destinazione-nome">{{ risultato.destinazione.nome }}</h3>
          <div class="destinazione-tags">
            <span class="tag-continente">{{ risultato.destinazione.continente }}</span>
            <span class="tag-tipo">{{ risultato.destinazione.tipo_esperienza }}</span>
          </div>
          <p class="destinazione-descrizione">{{ risultato.destinazione.descrizione }}</p>
          
          <div class="info-viaggio">
            <div class="info-item">
              <span class="info-label">📅 Partenza</span>
              <span class="info-value">{{ new Date(risultato.dataPartenza).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' }) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">⏱️ Durata</span>
              <span class="info-value">{{ risultato.durata }} giorni</span>
            </div>
            <div class="info-item">
              <span class="info-label">👥 Viaggiatori</span>
              <span class="info-value">{{ risultato.numeroViaggiatori }}</span>
            </div>
          </div>

          <p class="messaggio-finale" v-if="risultato.giorniMancanti > 0">
            Mancano solo <strong>{{ risultato.giorniMancanti }} giorni</strong> alla partenza! Inizia a preparare la valigia! 🧳
          </p>
          <p class="messaggio-finale" v-else-if="risultato.giorniMancanti === 0">
            <strong>Si parte oggi!</strong> Buon viaggio! ✈️
          </p>
          <p class="messaggio-finale" v-else>
            Speriamo che il tuo viaggio sia stato indimenticabile! 🌟
          </p>
        </div>

        <button @click="nuovaRicerca" class="btn-altro-codice">
          🔮 Cerca un altro codice
        </button>
      </section>

     
      <section v-else class="risultato-nascosto">
        <div class="lock-icon">🔒</div>
        <h2 class="risultato-titolo">Ancora un po' di pazienza!</h2>
        <p class="risultato-sottotitolo">
          Mancano ancora <strong>{{ risultato.giorniAllaRivelazione }} giorni</strong> 
          prima che possiamo svelare la tua destinazione.
        </p>
        
        <div class="countdown-box">
          <div class="countdown-numero">{{ risultato.giorniAllaRivelazione }}</div>
          <div class="countdown-label">
            {{ risultato.giorniAllaRivelazione === 1 ? 'giorno' : 'giorni' }} 
            alla rivelazione
          </div>
        </div>

        <p class="info-extra">
          La destinazione viene svelata <strong>7 giorni prima della partenza</strong>.<br>
          Mancano <strong>{{ risultato.giorniMancanti }} giorni</strong> al tuo viaggio.<br>
          Torna tra <strong>{{ risultato.giorniAllaRivelazione }} giorni</strong> per scoprire dove andrai!
        </p>

        <button @click="nuovaRicerca" class="btn-altro-codice">
          🔮 Cerca un altro codice
        </button>
      </section>

    </main>
  </div>
</template>

<style scoped>
.ScopriViaggio-wrapper,
.ScopriViaggio-wrapper * {
  box-sizing: border-box;
}

.ScopriViaggio-wrapper {
  background-color: #f9f9f9;
  min-height: 100vh;
  width: 100%;
  font-family: sans-serif;
  overflow-x: hidden;
  color: #333;
}

.header-scopri {
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
  top: 0; left: 0; right: 0; bottom: 0;
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

.icona-scopri {
  font-size: 5rem;
  margin-bottom: 20px;
  animation: floating 3s ease-in-out infinite;
}

@keyframes floating {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-15px); }
}

.titolo-pagina {
  font-size: clamp(2rem, 5vw, 3.5rem);
  font-weight: 900;
  margin: 0 0 20px 0;
  letter-spacing: 3px;
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
  max-width: 800px;
  margin: 0 auto;
  padding: 60px 5%;
}


.form-section {
  text-align: center;
}

.form-codice {
  background: white;
  border-radius: 15px;
  padding: 50px 40px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-codice label {
  font-size: 1.1rem;
  font-weight: bold;
  color: #333;
  text-align: left;
}

.input-codice {
  padding: 18px 20px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 1.3rem;
  font-family: 'Courier New', monospace;
  text-align: center;
  letter-spacing: 4px;
  text-transform: uppercase;
  transition: border-color 0.3s, box-shadow 0.3s;
}

.input-codice:focus {
  outline: none;
  border-color: #6a1b9a;
  box-shadow: 0 0 0 3px rgba(106,27,154,0.15);
}

.input-codice:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.messaggio-errore {
  background-color: #fce4ec;
  color: #d81b60;
  padding: 12px 20px;
  border-radius: 8px;
  border-left: 4px solid #d81b60;
  font-weight: bold;
  text-align: left;
}

.btn-cerca {
  background: linear-gradient(135deg, #6a1b9a 0%, #d81b60 100%);
  color: white;
  border: none;
  padding: 16px 40px;
  border-radius: 50px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.3s;
  box-shadow: 0 6px 15px rgba(106, 27, 154, 0.3);
}

.btn-cerca:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 10px 25px rgba(106, 27, 154, 0.4);
}

.btn-cerca:disabled {
  background: #ccc;
  cursor: not-allowed;
  box-shadow: none;
}

.aiuto-text {
  margin-top: 25px;
  color: #888;
  font-style: italic;
  font-size: 0.95rem;
}


.risultato-rivelato {
  text-align: center;
}

.celebration-icon {
  font-size: 5rem;
  margin-bottom: 20px;
  animation: floating 3s ease-in-out infinite;
}

.risultato-titolo {
  font-size: clamp(1.8rem, 3vw, 2.5rem);
  color: #6a1b9a;
  margin: 0 0 15px 0;
  font-weight: bold;
}

.risultato-sottotitolo {
  font-size: 1.2rem;
  color: #666;
  margin-bottom: 35px;
}

.destinazione-card {
  background: white;
  border-radius: 20px;
  padding: 50px 35px;
  box-shadow: 0 8px 30px rgba(106, 27, 154, 0.15);
  border: 3px solid #6a1b9a;
  margin-bottom: 30px;
}

.destinazione-nome {
  font-size: clamp(2rem, 4vw, 3rem);
  background: linear-gradient(135deg, #6a1b9a 0%, #d81b60 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0 0 25px 0;
  font-weight: 900;
}

.destinazione-tags {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-bottom: 25px;
  flex-wrap: wrap;
}

.tag-continente,
.tag-tipo {
  background: #f0f0f0;
  color: #333;
  padding: 6px 18px;
  border-radius: 20px;
  font-size: 0.95rem;
  text-transform: capitalize;
  font-weight: 600;
}

.destinazione-descrizione {
  color: #555;
  font-size: 1.1rem;
  line-height: 1.7;
  margin-bottom: 30px;
  font-style: italic;
}

.info-viaggio {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 25px;
  padding: 20px 0;
  border-top: 1px dashed #ddd;
  border-bottom: 1px dashed #ddd;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.info-label {
  font-size: 0.85rem;
  color: #888;
}

.info-value {
  font-size: 1rem;
  font-weight: bold;
  color: #333;
}

.messaggio-finale {
  color: #6a1b9a;
  font-size: 1.05rem;
  margin: 0;
}


.risultato-nascosto {
  text-align: center;
}

.lock-icon {
  font-size: 5rem;
  margin-bottom: 20px;
  animation: floating 3s ease-in-out infinite;
}

.countdown-box {
  background: linear-gradient(135deg, #1a237e 0%, #6a1b9a 100%);
  color: white;
  border-radius: 20px;
  padding: 50px 30px;
  margin: 30px 0;
  box-shadow: 0 8px 30px rgba(106, 27, 154, 0.3);
}

.countdown-numero {
  font-size: clamp(4rem, 10vw, 7rem);
  font-weight: 900;
  line-height: 1;
  margin-bottom: 10px;
}

.countdown-label {
  font-size: 1.2rem;
  opacity: 0.9;
}

.info-extra {
  color: #555;
  font-size: 1rem;
  line-height: 1.8;
  margin: 25px 0;
}


.btn-altro-codice {
  background: white;
  color: #6a1b9a;
  border: 2px solid #6a1b9a;
  padding: 14px 35px;
  border-radius: 30px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
  margin-top: 20px;
}

.btn-altro-codice:hover {
  background: #6a1b9a;
  color: white;
  transform: translateY(-3px);
}


@media (max-width: 600px) {
  .info-viaggio {
    grid-template-columns: 1fr;
    gap: 15px;
  }
  .form-codice {
    padding: 35px 25px;
  }
  .destinazione-card {
    padding: 35px 25px;
  }
}
</style>
