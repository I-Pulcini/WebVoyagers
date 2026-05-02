
<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { userStore } from '../stores/userStore'

/* --- VIAGGIO ThAILANDIA --- */

const router = useRouter()


const ID_VIAGGIO_THAILANDIA = 7

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
        idViaggio: ID_VIAGGIO_THAILANDIA,
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
  <div class="thailandia-wrapper">
    <header class="fascia-foto">
      <h1 class="fascia-titolo"></h1>
    </header>

    <!-- Bottone Prenota in posizione fissa -->
    <div class="prenota-bar">
      <div class="prenota-info">
        <span class="prenota-prezzo">4200€</span>
        <span class="prenota-durata"> 13 giorni ·Luglio </span>
      </div>
      <button @click="apriModale" class="btn-prenota-grande">
        🎒 Prenota questo viaggio
      </button>
    </div>

    <main>
      <section class="fascia-testo">
        <p style="margin-top: 0;">
       Il nostro grande viaggio inizia da una grande capitale: ci immergeremo nell’atmosfera unica di Bangkok, dove templi sacri e vivace vita notturna si fondono in un affascinante connubio tra tradizione e modernità. L’imponente architettura di Ayutthaya e i suggestivi mercati galleggianti saranno il perfetto antipasto prima di raggiungere il grande nord e la sua capitale, la tranquilla e splendida Chiang Mai, con il suo fascino autentico e le sue atmosfere rilassate. Concluderemo in bellezza con 5 giorni di completo relax sulle isole di Koh Phangan e Ko Tao, tra indimenticabili beach party, ba.gni nel mare verde smeraldo e uscite di snorkeling sulla variopinta barriera corallina
        </p>
      </section>

      <h2 class="titolo-sezione">Itinerario Viaggio</h2>

      <section class="itinerario-container">
        
        <button class="accordion">Day 1-2: Arrivo a Bangkok</button>
        <div class="panel" style="background-image: url('/Bangkok.jpg');">
            <div class="testo-giorno">
                  <b>Mattina:</b> partenza dalle principali città italiane e volo per Bangkok<br><br>
                <b>Day 2 mattina/pomeriggio:</b>arrivo nel pomeriggio a Bangkok e trasferimento in hotel per check-in <br><br>
                <b>Sera:</b> aperitivo e cena a Bangkok            
	</div>
        </div>

        <button class="accordion">Day 3: Bangkok</button>
        <div class="panel" style="background-image: url('/Bangkok2.jpg');">
            <div class="testo-giorno">
                <b>Mattina:</b>Giro in battello sul fiume Chao Praya, arteria di comunicazione fondamentale per la capitale. Visita del  Wat Pho, tempio del Buddha dormiente, noto per la sua gigantesca statua d’oro raffigurante Buddha in posizione sdraiata. Visita del Wat Arun, il tempio dell’alba <br><br>
                <b>Pomeriggio:</b> pranzo street food e prosecuzione della visita di Bangkok. Ingresso al Wat Phra Kaew, il più sacro e importante tra i templi della capitale, e visita del Palazzo Reale <br><br>
                <b>Sera:</b> aperitivo al Lebua at State Tower, il più bel rooftop di Bangkok per godere di una vista spettacolaresulla citta. Cena e serata a Sukhumvit            
	</div>
        </div>

        <button class="accordion">Day 4: Ayatthaya</button>
        <div class="panel" style="background-image: url('/Ayatthaya.jpg');">
            <div class="testo-giorno">
                   <b>Mattina:</b>olazione e partenza in treno per Ayutthaya. Visita in bici dei principali templi della città, tra cui il Wat Mahathat, tempio della grande reliquia, noto per la testa del Buddha e il Wat Phra Sri Sanphet, il più sacro tra i templi del complesso dell’antico palazzo reale di Ayutthaya <br><br>
                <b>Pomeriggio:</b>pranzo e prosecuzione della visita libera in bici dell’isola di Ayutthaya. Rientro a Bangkok nel tardo pomeriggio <br><br>
                <b>Sera:</b> cena e serata a Bangkok, possibile visita del famoso quartiere a luci rosse di Pat-Pong    
            </div>
        </div>

        <button class="accordion">Day 5: Mercati di Mae Khlong e Amphawa </button>
        <div class="panel" style="background-image: url('/Amphawa.jpg');">
            <div class="testo-giorno">
                   <b>Mattina:</b> partenza in treno verso Amphawa e visita alla famosa ferrovia di Mae Khlong, nota per il fotogenico mercato che si svolge proprio sui binari, che viene prontamente smantellato ad ogni passaggio del treno. Prosecuzione in treno e tuk-tuk per Amphawa<br><br>
                <b>Pomeriggio:</b> arrivo a Amphawa, sede di uno dei più famosi, ma allo stesso tempo autentici, mercati galleggianti della Thailandia. Pranzo a base di street food e possibilità di noleggiare una barca per spostarsi lungo i canali del mercato, e contrattare con i venditori. Rientro a Bangkok nel tardo pomeriggio<br><br>
                <b>Sera:</b> cena libera e serata nei locali della City of Angels   
            </div>
        </div>

        <button class="accordion">Day 6: Doi Tung e Chiang Rai </button>
        <div class="panel" style="background-image: url('/ChiangRai.jpg');">
            <div class="testo-giorno">
               
 		 <b>Mattina:</b> partenza prestissimo per l’aeroporto. Volo interno per Chiang Rai, arrivo e incontro con il nostro driver. Trasferimento verso il confine con il Myanmar e visita di Doi Tung, stupefacente residenza estiva della madre del sovrano thailandese, costruita in stile thai-svizzero e circondata da meravigliosi giardini. Rientro a Chiang Rai<br><br>
                <b>Pomeriggio:</b> visita del Wat Rong Khun, il celebre «tempio bianco» di Chiang Rai, di recente costruzione e tra i più eccentrici (e fotografati) di tutta la Thailandia. Foto all’esterno del tempio e visita dei bizzarri, coloratissimi interni<br><br>
                <b>Sera:</b>  cena nei mercati serali di Chiang Rai, serata nei bar 
             </div>
        </div>

		  	 <button class="accordion">Day 7: Chang Mai  </button>
        <div class="panel" style="background-image: url('/ChangMai.jpg');">
            <div class="testo-giorno">
               
 		 		<b>Mattina:</b>possibilità di assistere alla questua mattutina dei monaci buddhisti a Chiang Dao, e partenza al mattino in direzione di Chiang Mai. Breve sosta per la visita del tempo Wat Ban Den e arrivo a Chiang Mai. Check-in in hotel e pranzo in città  <br><br>
                <b>Pomeriggio:</b>  possibilità di assistere alla questua mattutina dei monaci buddhisti a Chiang Dao, e partenza al mattino in direzione di Chiang Mai. Breve sosta per la visita del tempo Wat Ban Den e arrivo a Chiang Mai. Check-in in hotel e pranzo in città<br><br>
                <b>Sera:</b> cena nei mercati serali di Chiang Mai, serata nei bar
             </div>
        </div>

		   <button class="accordion">Day 8-9-10: Koh Phangan </button>
        <div class="panel" style="background-image: url('/KohPhangan.jpg');">
            <div class="testo-giorno">
 		 		<b>Day 8:</b> sveglia presto e volo da Chiang Mai a Surat Thani (scalo a Bangkok). Transfer in shuttle bus+traghetto, arrivo nel tardo pomeriggio a Koh Phangan, sistemazione in hotel <br><br>
                <b>Day 9-10:</b>relax nelle spiagge di Koh Phangan e esplorazione dell’isola, serate nei bar e party sulla spiaggia<br><br>
             </div>
        </div>

		   <button class="accordion">Day 11-12: Koh Tao  </button>
        <div class="panel" style="background-image: url('/ KohTao.jpg');">
            <div class="testo-giorno">
               
 		 		<b>Day 13:</b> transfer in traghetto a Koh Tao, sistemazione e relax <br><br>
                <b>Day14:</b>snorkeling trip a largo di Koh Tao, presso la barriera corallina più bella, viva e ricca di fauna di tutta la Thailandia<br><br>
                
             </div>
        </div>

		   <button class="accordion">Day 13: Rientro in Italia </button>
        <div class="panel" style="background-image: url('/Thailandia.jpg');">
            <div class="testo-giorno">
               
 		 		<b>Mattina:</b> rientro con traghetto+shuttle a Surat Thani, volo per Bangkok. Compatibilmente con gli orari dei voli, ultima serata a Bangkok e volo per l’Italia. Arrivo in Italia il day 16… e alla prossima avventura! <br><br>
               
             </div>
        </div>

		  

		 
      </section>

      <h2 class="titolo-sezione">Galleria Fotografica</h2>
      <section class="galleria-grid">
          <div class="foto-grid" style="background-image: url('/.jpg');"></div>
          <div class="foto-grid" style="background-image: url('/.jpg');"></div>
          <div class="foto-grid" style="background-image: url('/.jpg');"></div>
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
          <h2 class="modale-titolo">🎒 Prenota: THAILANDIA </h2>
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
