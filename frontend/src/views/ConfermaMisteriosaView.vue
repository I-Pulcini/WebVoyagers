<script setup>
import { onMounted, ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { prenotazioneStore } from '../stores/prenotazioneStore'

/* --- PAGINA DI CONFERMA VIAGGIO MISTERIOSO --- */
/* Abbiamo creato una pagina dedicata che mostra il risultato della prenotazione misteriosa:
   il codice e le 3 destinazioni candidate (quella vera + 2 simili), tutte mescolate. */

// Abbiamo importato il router per poter reindirizzare l'utente se accede senza dati validi
const router = useRouter()

// Variabile reattiva con le opzioni mescolate (1, 2 o 3 a seconda dei risultati disponibili)
const opzioni = ref([])
const soloUnViaggio = ref(false)

onMounted(() => {
  if (!prenotazioneStore.codice) {
    router.push('/viaggio-misterioso')
    return
  }

  // Unisce il viaggio scelto con i distrattori (possono essere 0, 1 o 2)
  const tutte = [prenotazioneStore.viaggioScelto, ...(prenotazioneStore.viaggiSimili || [])]

  // Se c'è solo il viaggio scelto (partenza entro 7 giorni o nessun distrattore disponibile),
  // non mescoliamo e mostriamo solo quello
  if (tutte.length === 1) {
    soloUnViaggio.value = true
    opzioni.value = tutte
    return
  }

  // Mescola con Fisher-Yates così l'utente non sa quale è quello vero
  for (let i = tutte.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[tutte[i], tutte[j]] = [tutte[j], tutte[i]]
  }

  opzioni.value = tutte
})
</script>

<template>
  <div class="ConfermaMisteriosa-wrapper">

    <!-- HEADER -->
    <header class="header-conferma">
      <div class="overlay-stelle"></div>
      <div class="header-content">
        <div class="conferma-icona">✨</div>
        <h1 class="titolo-pagina">PRENOTAZIONE RICEVUTA!</h1>
        <p class="sottotitolo-pagina">
          La tua avventura misteriosa è stata confermata.<br>
          Una di queste tre destinazioni è la tua. <strong>Quale sarà?</strong>
        </p>
      </div>
    </header>

    <main class="contenuto-principale">

      <!-- CODICE PRENOTAZIONE -->
      <section class="codice-box">
        <p class="codice-label">Il tuo codice di prenotazione:</p>
        <div class="codice-prenotazione">{{ prenotazioneStore.codice }}</div>
        <p class="codice-info">
        <strong>Conserva con cura questo codice.</strong> Ti servirà per scoprire la tua destinazione 7 giorni prima della partenza!
        </p>
      </section>

      <!-- 3 OPZIONI MISTERIOSE -->
      <section class="opzioni-section">
        <h2 class="opzioni-titolo">
          🎲 {{ opzioni.length === 1 ? 'La tua destinazione candidata' : 'Le tue destinazioni candidate' }}
        </h2>
        <p class="opzioni-sottotitolo">
          La verità ti sarà rivelata <strong>7 giorni prima della partenza</strong>!
        </p>

        <div class="opzioni-grid-mistero" :style="{ gridTemplateColumns: `repeat(${opzioni.length}, 1fr)` }">
          <div v-for="(opzione, index) in opzioni" :key="index" class="opzione-mistero">
            <div class="opzione-numero">?</div>
            <div class="opzione-meta">
              <span class="opzione-continente">{{ opzione.continente }}</span>
              <span class="opzione-tipo">{{ opzione.tipo_esperienza }}</span>
            </div>
            <ul class="opzione-indizi">
              <li>🔍 {{ opzione.indizio_1 }}</li>
              <li>🔍 {{ opzione.indizio_2 }}</li>
              <li>🔍 {{ opzione.indizio_3 }}</li>
            </ul>
          </div>
        </div>

        <!-- Bottone per scoprire la destinazione tramite codice -->
        <div class="scopri-cta">
          <p class="scopri-cta-testo">
            Quando mancheranno 7 giorni alla partenza, torna qui per svelare la tua destinazione!
          </p>
          <RouterLink to="/scopri-viaggio" class="btn-scopri">
            🔮 Scopri il tuo viaggio
          </RouterLink>
        </div>
      </section>

      <!-- AZIONI FINALI -->
      <section class="azioni-finali">
        <p class="azioni-testo">
          Nel frattempo... inizia a sognare! 🌍✈️
        </p>
        <div class="bottoni-finali">
          <RouterLink to="/viaggio-misterioso" class="btn-altro-viaggio">
            🎁 Prenota un altro viaggio
          </RouterLink>
          <RouterLink to="/" class="btn-home-conferma">
            🏠 Torna alla home
          </RouterLink>
        </div>
      </section>

    </main>
  </div>
</template>

<style scoped>
.ConfermaMisteriosa-wrapper,
.ConfermaMisteriosa-wrapper * {
  box-sizing: border-box;
}

.ConfermaMisteriosa-wrapper {
  background-color: #f9f9f9;
  min-height: 100vh;
  width: 100%;
  font-family: sans-serif;
  overflow-x: hidden;
  color: #333;
}

/* ===== HEADER ===== */
.header-conferma {
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

.conferma-icona {
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

/* ===== CONTENUTO ===== */
.contenuto-principale {
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
  padding: 60px 5%;
}

/* ===== CODICE PRENOTAZIONE ===== */
.codice-box {
  background: white;
  border-radius: 15px;
  padding: 40px 30px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  margin-bottom: 50px;
  border: 3px solid #00c4b4;
}

.codice-label {
  color: #666;
  margin: 0 0 15px 0;
  font-size: 1rem;
}

.codice-prenotazione {
  font-family: 'Courier New', monospace;
  font-size: 2.5rem;
  font-weight: bold;
  color: #d81b60;
  letter-spacing: 5px;
  background: #f9f9f9;
  padding: 20px 35px;
  border-radius: 10px;
  display: inline-block;
  margin-bottom: 20px;
  border: 2px dashed #d81b60;
}

.codice-info {
  color: #555;
  font-size: 0.95rem;
  margin: 0;
}

/* ===== SEZIONE OPZIONI ===== */
.opzioni-section {
  margin-bottom: 50px;
}

.opzioni-titolo {
  text-align: center;
  font-size: clamp(1.5rem, 3vw, 2rem);
  color: #6a1b9a;
  margin: 0 0 15px 0;
  font-weight: bold;
}

.opzioni-sottotitolo {
  text-align: center;
  color: #666;
  font-size: 1.05rem;
  line-height: 1.6;
  margin-bottom: 40px;
}

.opzioni-grid-mistero {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 25px;
}

.opzione-mistero {
  background: white;
  border-radius: 15px;
  padding: 30px 22px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.08);
  text-align: center;
  transition: transform 0.3s, box-shadow 0.3s;
  border: 2px solid transparent;
}

.opzione-mistero:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 30px rgba(106, 27, 154, 0.25);
  border-color: #6a1b9a;
}

.opzione-numero {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #6a1b9a 0%, #d81b60 100%);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.8rem;
  font-weight: bold;
  margin: 0 auto 20px auto;
  box-shadow: 0 4px 15px rgba(106, 27, 154, 0.3);
}

.opzione-meta {
  display: flex;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 22px;
}

.opzione-continente,
.opzione-tipo {
  background: #f0f0f0;
  color: #333;
  padding: 5px 14px;
  border-radius: 15px;
  font-size: 0.85rem;
  text-transform: capitalize;
  font-weight: 600;
}

.opzione-indizi {
  list-style: none;
  padding: 0;
  margin: 0;
  text-align: left;
}

.opzione-indizi li {
  padding: 10px 0;
  font-size: 0.95rem;
  color: #555;
  line-height: 1.5;
  border-bottom: 1px dashed #eee;
}

.opzione-indizi li:last-child {
  border-bottom: none;
}

/* ===== AZIONI FINALI ===== */
.azioni-finali {
  text-align: center;
  margin-top: 60px;
}

.azioni-testo {
  font-size: 1.2rem;
  color: #555;
  margin-bottom: 25px;
  font-style: italic;
}

.bottoni-finali {
  display: flex;
  gap: 20px;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-altro-viaggio,
.btn-home-conferma {
  display: inline-block;
  padding: 14px 35px;
  border-radius: 30px;
  font-size: 1rem;
  font-weight: bold;
  text-decoration: none;
  transition: transform 0.2s, box-shadow 0.3s;
}

.btn-altro-viaggio {
  background: linear-gradient(135deg, #6a1b9a 0%, #d81b60 100%);
  color: white;
  box-shadow: 0 6px 15px rgba(216, 27, 96, 0.3);
}

.btn-home-conferma {
  background: white;
  color: #00c4b4;
  border: 2px solid #00c4b4;
}

.btn-altro-viaggio:hover,
.btn-home-conferma:hover {
  transform: translateY(-3px);
}

.btn-altro-viaggio:hover {
  box-shadow: 0 10px 25px rgba(216, 27, 96, 0.4);
}

.btn-home-conferma:hover {
  background: #00c4b4;
  color: white;
}
/* ===== CTA SCOPRI VIAGGIO ===== */
.scopri-cta {
  text-align: center;
  margin-top: 50px;
  padding: 40px 30px;
  background: linear-gradient(135deg, rgba(106,27,154,0.05) 0%, rgba(216,27,96,0.05) 100%);
  border-radius: 15px;
  border: 2px dashed #6a1b9a;
}

.scopri-cta-testo {
  color: #555;
  font-size: 1.05rem;
  margin: 0 0 20px 0;
  line-height: 1.6;
}

.btn-scopri {
  display: inline-block;
  background: linear-gradient(135deg, #1a237e 0%, #6a1b9a 100%);
  color: white;
  padding: 16px 40px;
  border-radius: 50px;
  font-size: 1.1rem;
  font-weight: bold;
  text-decoration: none;
  transition: transform 0.2s, box-shadow 0.3s;
  box-shadow: 0 6px 15px rgba(106, 27, 154, 0.3);
}

.btn-scopri:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 25px rgba(106, 27, 154, 0.4);
}

/* ===== RESPONSIVE ===== */
@media (max-width: 900px) {
  .opzioni-grid-mistero {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  .codice-prenotazione {
    font-size: 1.8rem;
    letter-spacing: 3px;
    padding: 15px 25px;
  }
}
</style>