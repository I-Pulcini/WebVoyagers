
<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { userStore } from '../stores/userStore'

/* --- VIAGGIO OMAN  --- */

const router = useRouter()


const ID_VIAGGIO_OMAN = 9

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
  
  // Abbiamo verificato che i campi obbligatori siano compilati
  if (!nomeCompleto.value || !emailContatto.value || !numeroViaggiatori.value) {
    errore.value = 'Compila tutti i campi obbligatori.'
    return
  }
  
  inviando.value = true
  
  try {
    // Abbiamo chiamato l'endpoint del backend per prenotare il viaggio
    const response = await fetch('/api/prenota-viaggio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        idViaggio: ID_VIAGGIO_LONDRA,
        numeroViaggiatori: numeroViaggiatori.value,
        nomeCompleto: nomeCompleto.value,
        emailContatto: emailContatto.value,
        telefono: telefono.value,
        note: note.value
      })
    })
    
    const data = await response.json()
    
    if (response.ok) {
      // Abbiamo salvato i dati di successo per mostrarli all'utente
      successo.value = {
        codice: data.codice,
        destinazione: data.destinazione
      }
      // Abbiamo svuotato i campi del form
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

/* --- ACCORDION ITINERARIO --- */
onMounted(() => {
  const accordions = document.getElementsByClassName("accordion")

  for (let i = 0; i < accordions.length; i++) {
    accordions[i].addEventListener("click", function() {
      this.classList.toggle("active")
      let panel = this.nextElementSibling
      if (panel.style.display === "block") {
        panel.style.display = "none"
      } else {
        panel.style.display = "block"
      }
    })
  }
})
</script>

<template>
  <div class="oman-wrapper">
    <header class="fascia-foto">
      <h1 class="fascia-titolo"></h1>
    </header>

    <!-- Bottone Prenota in posizione fissa -->
    <div class="prenota-bar">
      <div class="prenota-info">
        <span class="prenota-prezzo">2800€</span>
        <span class="prenota-durata"> 11 giorni ·Settembre </span>
      </div>
      <button @click="apriModale" class="btn-prenota-grande">
        🎒 Prenota questo viaggio
      </button>
    </div>

    <main>
      <section class="fascia-testo">
        <p style="margin-top: 0;">
       
        </p>
      </section>

      <h2 class="titolo-sezione">Itinerario Viaggio</h2>

      <section class="itinerario-container">
        
        <button class="accordion">Day 1:Arrivo a Mascate </button>
        <div class="panel" style="background-image: url('/Mascate.jpg');">
            <div class="testo-giorno">
                <b>Pomeriggio:</b>partenza dall’Italia con voli con scalo per Mascate <br><br>
                <b>Sera:</b>arrivo a Mascate, noleggio auto 4×4 e check in in hotel e pernottamento         
	</div>
        </div>

        <button class="accordion">Day 2:Mascate </button>
        <div class="panel" style="background-image: url('/Mascate2.jpg');">
            <div class="testo-giorno">
                <b>Mattina:</b> visita della moschea del Sultano Qaboos, la terza più grande del mondo e uno dei più impressionanti esempi di architettura islamica moderna. Noleggio dell’attrezzatura necessaria per il camping<br><br>
                <b>Pomeriggio:</b> visita del souq Mutrah, uno dei più colorati della penisola arabica. Prosecuzione della visita nel quartiere della Corniche, affacciato sull’oceano Indiano<br><br>
                <b>Sera:</b> cena e serata nei locali di Mascate          
	</div>
        </div>

        <button class="accordion">Day 3: Bimmah Sinkhole e Wadi Shab </button>
        <div class="panel" style="background-image: url('/Wadi.jpg');">
            <div class="testo-giorno">
                   <b>Mattina:</b>partenza presto lungo la strada costiera a sud di Mascat, visita e bagno rinfrescante nelle acque turchesi del Bimmah Sinkhole. Prosecuzione dell’itinerario e arrivo a Wadi Shab, relax e, per i più temerari, possibilità di nuotare controcorrente nel fiume per arrivare alla misteriosa «cascata segreta» <br><br>
                <b>Pomeriggio:</b> pranzo nei pressi di Wadi Shab, prosecuzione dell’itinerario e arrivo a Ras Al Hadd. Allestimento del wild camp in una spiaggia deserta tra Ras Al Hadd e Ras Al Jinz<br><br>
                <b>Sera:</b> opzionale, visita notturna guidata della Turtle Reserve di Ras Al Jinz, per assistere all’emozionante fenomeno della schiusa delle uova delle taratughe
            </div>
        </div>

        <button class="accordion">Day 4:Sugar Dunes </button>
        <div class="panel" style="background-image: url('/SugarDunes.jpg');">
            <div class="testo-giorno">
                   <b>Mattina:</b>sveglia presto, e nuova visita alla Turtle Reserve illuminata dalla splendida luce dell’alba, per vedere le tartarughe fare ritorno all’oceano. Partenza e prosecuzione dell’itinerario verso sud <br><br>
                <b>Pomeriggio:</b>arrivo nei pressi delle Sugar Dunes, scenic drive tra le immense dune bianche per l’off road più eccitante del viaggio! Preparazione del wild camp <br><br>
                <b>Sera:</b> cena in tenda e serata sotto le stelle sull’immensa spiaggia affacciata sull’Oceano Indiano   
            </div>
        </div>

        <button class="accordion">Day 5-6: Benvenuti in paradiso! </button>
        <div class="panel" style="background-image: url('/Barr.jpg');">
            <div class="testo-giorno">
               
 		       <b>Mattina:</b> <br> Arrivo a Barr Al Hikman, partendo dalle Sugar Dunes, ci aspettano 3 ore di macchina nel deserto on the road !!<br>
                <b>Pomeriggio:</b>Check-in nel whales campe che ci ospiderà per le prossime due notti. Domiremo in un campeggio circondati da mare cristallino e sabbia bianca senza il troppo turismo di massa!! <br><br>
                <b>Sera:</b> cena e serata in tenda
             </div>
        </div>

        <button class="accordion">Day 7: Wahiba Sands </button>
        <div class="panel" style="background-image: url('/Wadi2.jpg');">
            <div class="testo-giorno">
               
 		       <b>Mattina:</b> mattinata a disposizione nei pressi delle Sugar Dunes, tra un bagno nell’oceano e una derapata sulle dune <br><br>
                <b>Pomeriggio:</b> prosecuzione dell’itinerario verso il deserto rosso di Wahiba Sands, self drive su pista fino al camp nel deserto (con tende preallestite e servizi). Tè di benvenuto e tramonto da Mille e una notte dall’alto delle dune del Wahiba Sands  <br><br>
                <b>Sera:</b> cena e serata sotto milioni di stelle nel deserto dell’Oman
             </div>
        </div>

         <button class="accordion">Day 8:Wadi Bani Kalid, arrivo a Nizwa </button>
      v class="panel" style="background-image: url('/Nizwa.jpg');">
            <div class="testo-giorno">
               
 		       <b>Mattina:</b> sveglia presto e camminata nel deserto all’alba tra le dune che si tingono di rosa. Colazione e partenza per Wadi Bani Khalid, bagno nelle piscine naturali dell’oasi e, per i più temerari, possibilità di cimentarsi nel cliff diving <br><br>
                <b>Pomeriggio:</b> prosecuzione per Nizwa, dopo una breve visita alla polverosa cittadina di Ibra e ai palazzi abbandonati della città vecchia. Arrivo nel pomeriggio a Nizwa e visita del souq serale <br><br>
                <b>Sera:</b> sistemazione in hotel, cena e serata a Nizwa
             </div>
        </div>


       <button class="accordion">Day 9: Jebel Shams</button>
        <div class="panel" style="background-image: url('/Jebel.jpg');">
            <div class="testo-giorno">
               
 		       <b>Mattina:</b> visita del pittoresco mercato del venerdì di Nizwa, dedicato al commercio del bestiame: un autentico spaccato di vita rurale omanita, e un’incredibile opportunità per gli amanti della fotografia. Visita del forte di Nizwa, il monumento più visitato dell’Oman, e prosecuzione sulla panoramica strada che sale verso il Jebel Shams <br><br>
                <b>Pomeriggio:</b>prosecuzione verso Jebel Shams, la montagna più alta dell’Oman, lungo una strada che si snoda in cima allo spettacolare Wadi Gul, il «grand canyon d’oriente». Arrivo al villaggio di Al Khitaym e allestimento del camp su un altopiano a strapiombo sul canyon  <br><br>
                <b>Sera:</b>wild camping sull’orlo del Wadi Gul 
             </div>
        </div>

       <button class="accordion">Day 10:Jebel Shams  </button>
        <div class="panel" style="background-image: url('/Jebel2.jpg');">
            <div class="testo-giorno">
               
 		       <b>Mattina:</b>  sveglia presto e trekking lungo la cosiddetta «Balcony Walk», sentiero in cengia che taglia la parete a strapiombo del Wadi Gul, offrendo viste mozzafiato sull’interno del Canyon. Arrivo al villaggio abbandonato di Sab, caratteristico per le sue antiche abitazioni abbarbicate sulla parete del Wadi. Rientro alle macchine e partenza verso Balad Sayt<br><br>
                <b>Pomeriggio:</b>percorso lungo strade panoramiche di montagna e visita del pittoresco villaggio di Balad Sayt, tra i più belli dell’Oman. Rientro verso Mascate con possibilità di fare un ultimo bagno nell’oceano Indiano  <br><br>
                <b>Sera:</b> cena e ultima serata nei locali di Mascate compatibilmente con l’operativo voli
             </div>
        </div>

        <button class="accordion">Day 11: Arrivo in Itali</button>
        <div class="panel" style="background-image: url('/Oman.jpg');">
            <div class="testo-giorno">
                <b>Mattina/Pomeriggio:</b> Arrivo in Aereporto  <br><br>
                <b>Sera:</b> volo notturno e arrivo in Italia il Day 9.. e alla prossima avventura!
             </div>
        </div>
      </section>

      <h2 class="titolo-sezione">Galleria Fotografica</h2>
      <section class="galleria-grid">
          <div class="foto-grid" style="background-image: url('/Mascate.jpg');"></div>
          <div class="foto-grid" style="background-image: url('/Barr.jpg');"></div>
          <div class="foto-grid" style="background-image: url('/Nizwa.jpg');"></div>
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
          <h2 class="modale-titolo">🎒 Prenota:OMAN </h2>
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
  </div>
</template>

<style scoped>
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
