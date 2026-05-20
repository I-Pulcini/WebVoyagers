<script setup>
import { ref } from 'vue'

const nome = ref('')
const email = ref('')
const telefono = ref('')
const motivo = ref('')
const messaggio = ref('')
const privacy = ref(false)
const inviato = ref(false)
const errore = ref('')
const inviando = ref(false)

const motivi = [
  'Voglio prenotare un viaggio',
  'Ho domande su un viaggio specifico',
  'Voglio diventare coordinatore',
  'Collaborazioni e partnership',
  'Altro'
]

const galleria = [
  { src: '/Socotra2.jpg',      didascalia: 'Isola di Socotra, Yemen' },
  { src: '/Chefchaouen.jpg',   didascalia: 'Chefchaouen, Marocco' },
  { src: '/MachuPicchu.jpg',   didascalia: 'Machu Picchu, Perù' },
  { src: '/Zanzibar.jpg',      didascalia: 'Zanzibar, Tanzania' },
  { src: '/Tromso28.jpg',      didascalia: 'Tromsø, Norvegia' },
  { src: '/Marrakech.jpg',     didascalia: 'Marrakech, Marocco' },
  { src: '/Cambogia.jpg',      didascalia: 'Angkor Wat, Cambogia' },
  { src: '/Cusco.jpg',         didascalia: 'Cusco, Perù' },
  { src: '/StoneTown.jpg',     didascalia: 'Stone Town, Zanzibar' },
  { src: '/Kiruna.jpg',        didascalia: 'Kiruna, Lapponia Svedese' },
  { src: '/Cancun.jpg',        didascalia: 'Cancún, Messico' },
  { src: '/Uganda27.jpg',      didascalia: 'Uganda' },
  { src: '/Sfondo2.jpg',       didascalia: 'Mete tropicali' },
  { src: '/Sfondo3.jpg',       didascalia: 'Avventure in arrivo' },
  { src: '/Sfondo4.jpg',       didascalia: 'I nostri viaggi' }
]

const inviaForm = async () => {
  errore.value = ''
  inviato.value = false

  if (!nome.value || !email.value || !motivo.value || !messaggio.value) {
    errore.value = 'Compila tutti i campi obbligatori (*).'
    return
  }
  if (!privacy.value) {
    errore.value = 'Devi accettare la Privacy Policy per continuare.'
    return
  }

  inviando.value = true

  try {
    const response = await fetch('/api/contattaci', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        nome: nome.value,
        email: email.value,
        telefono: telefono.value,
        motivo: motivo.value,
        messaggio: messaggio.value
      })
    })

    const data = await response.json()

    if (response.ok) {
      inviato.value = true
      nome.value = ''
      email.value = ''
      telefono.value = ''
      motivo.value = ''
      messaggio.value = ''
      privacy.value = false
    } else {
      errore.value = data.error || "Errore durante l'invio del messaggio."
    }
  } catch (err) {
    console.error('Errore nella chiamata al backend:', err)
    errore.value = 'Errore di connessione al server.'
  } finally {
    inviando.value = false
  }
}
</script>

<template>
  <div class="Contattaci-wrapper">

    <header class="header-verde">
      <div class="header-content">
        <h1 class="titolo-pagina">WebVoyagers</h1>
        <p class="sottotitolo-pagina">Siamo qui per te, scrivici!</p>
      </div>
    </header>

    <main class="contenuto-principale">
      <section class="sezione-form">
        <h2>Contattaci</h2>
        <p class="testo-intro-form">Utilizza il modulo sottostante per inviarci un messaggio.</p>

        <div v-if="inviato" class="messaggio-successo">
          ✓ Messaggio inviato con successo! Ti risponderemo al più presto.
        </div>

        <div v-if="errore" class="messaggio-errore">{{ errore }}</div>

        <form @submit.prevent="inviaForm" class="form-contatti">

          <div class="form-group">
            <label for="nome">Nome e cognome <span class="obbligatorio">*</span></label>
            <input id="nome" type="text" v-model="nome" />
          </div>

          <div class="form-group">
            <label for="email">Email <span class="obbligatorio">*</span></label>
            <input id="email" type="email" v-model="email" />
          </div>

          <div class="form-group">
            <label for="telefono">Numero di telefono</label>
            <input id="telefono" type="tel" v-model="telefono" />
          </div>

          <div class="form-group">
            <label for="motivo">Scrivo perché <span class="obbligatorio">*</span></label>
            <select id="motivo" v-model="motivo">
              <option value="" disabled>Seleziona un motivo...</option>
              <option v-for="m in motivi" :key="m" :value="m">{{ m }}</option>
            </select>
          </div>

          <div class="form-group">
            <label for="messaggio">Messaggio <span class="obbligatorio">*</span></label>
            <textarea id="messaggio" rows="6" v-model="messaggio"></textarea>
          </div>

          <div class="form-group form-checkbox">
            <input id="privacy" type="checkbox" v-model="privacy" />
            <label for="privacy">
              Accetto le condizioni della <a href="#">Privacy Policy</a>
            </label>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn-invia" :disabled="inviando">
              <span v-if="inviando">⏳ Invio in corso...</span>
              <span v-else>Invia</span>
            </button>
          </div>
        </form>
      </section>
    </main>

    <section class="sezione-galleria">
      <h2 class="titolo-galleria">Lasciati ispirare</h2>
      <p class="sottotitolo-galleria">Alcuni momenti dei nostri viaggi</p>
      <div class="galleria-grid">
        <div v-for="(foto, index) in galleria" :key="index" class="galleria-item">
          <img :src="foto.src" :alt="foto.didascalia" loading="lazy" />
          <div class="galleria-overlay">
            <span>{{ foto.didascalia }}</span>
          </div>
        </div>
      </div>
    </section>

  </div>
</template>

<style scoped>
.Contattaci-wrapper,
.Contattaci-wrapper * {
  box-sizing: border-box;
}

.Contattaci-wrapper {
  background-color: #ffffff;
  min-height: 100vh;
  width: 100%;
  font-family: sans-serif;
  overflow-x: hidden;
  color: #333;
}

/* HEADER */
.header-verde {
  background-color: #00c4b4;
  width: 100%;
  padding: 120px 5% 80px 5%;
  color: white;
  text-align: center;
}

.header-content { max-width: 1000px; margin: 0 auto; }

.titolo-pagina {
  font-size: clamp(2.5rem, 6vw, 4.5rem);
  font-weight: 900;
  margin: 0 0 15px 0;
  letter-spacing: 2px;
}

.sottotitolo-pagina {
  font-size: clamp(1.1rem, 1.8vw, 1.5rem);
  margin: 0;
  font-weight: 300;
  opacity: 0.95;
}


.contenuto-principale {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  padding: 70px 5%;
}

.sezione-form h2 {
  font-size: clamp(1.8rem, 3vw, 2.5rem);
  color: #333;
  margin-bottom: 10px;
  font-weight: bold;
}

.testo-intro-form {
  color: #777;
  margin-bottom: 35px;
  font-size: 1.05rem;
}

.messaggio-successo {
  background-color: #e8f8f5;
  color: #00897b;
  padding: 15px 20px;
  border-radius: 8px;
  margin-bottom: 25px;
  border-left: 4px solid #00c4b4;
  font-weight: bold;
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

.form-contatti { display: flex; flex-direction: column; gap: 25px; }
.form-group { display: flex; flex-direction: column; }

.form-group label {
  font-weight: bold;
  margin-bottom: 8px;
  color: #333;
  font-size: 0.95rem;
}

.obbligatorio { color: #d81b60; }

.form-group input,
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

.form-group textarea { resize: vertical; min-height: 120px; }

.form-checkbox { flex-direction: row; align-items: center; gap: 10px; }
.form-checkbox input { width: 18px; height: 18px; cursor: pointer; accent-color: #00c4b4; }
.form-checkbox label { margin-bottom: 0; font-weight: normal; color: #555; }
.form-checkbox label a { color: #00c4b4; text-decoration: underline; }

.form-actions { display: flex; justify-content: flex-end; margin-top: 10px; }

.btn-invia {
  background-color: #00c4b4;
  color: white;
  border: none;
  padding: 14px 50px;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.2s;
}

.btn-invia:hover { background-color: #00a89a; transform: translateY(-2px); }
.btn-invia:disabled { background: #ccc; cursor: not-allowed; transform: none; }


.sezione-galleria {
  background-color: #f9f9f9;
  padding: 80px 5%;
  width: 100%;
}

.titolo-galleria {
  text-align: center;
  font-size: clamp(1.8rem, 3vw, 2.4rem);
  color: #00c4b4;
  margin-bottom: 10px;
  font-weight: bold;
}

.sottotitolo-galleria {
  text-align: center;
  color: #777;
  font-size: 1.1rem;
  margin-bottom: 50px;
}

.galleria-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 15px;
  max-width: 1400px;
  margin: 0 auto;
}

.galleria-item {
  position: relative;
  aspect-ratio: 1 / 1;
  overflow: hidden;
  border-radius: 10px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.galleria-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.galleria-item:hover img { transform: scale(1.1); }

.galleria-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0));
  color: white;
  padding: 20px 15px 12px 15px;
  font-weight: bold;
  font-size: 0.95rem;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.galleria-item:hover .galleria-overlay { opacity: 1; }

@media (max-width: 1024px) {
  .galleria-grid { grid-template-columns: repeat(3, 1fr); }
}

@media (max-width: 600px) {
  .header-verde { padding: 100px 5% 60px 5%; }
  .galleria-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
  .form-actions { justify-content: stretch; }
  .btn-invia { width: 100%; }
}
</style>
