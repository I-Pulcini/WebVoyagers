

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { userStore } from '../stores/userStore'

/* --- VIAGGIO  INDIA  --- */

const router = useRouter()

// L'id del viaggio nella tabella viaggi (Algeria è il viaggio numero 8 tra i disponibili)
// Abbiamo dichiarato l'id del viaggio NORVEGIA nel database
const ID_VIAGGIO_INDIA = 33

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
        idViaggio: ID_VIAGGIO_INDIA,
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
  <div class="india-wrapper">
    <header class="fascia-foto">
      <h1 class="fascia-titolo"> INDIA</h1>
    </header>

    <!-- Bottone Prenota in posizione fissa -->
    <div class="prenota-bar">
      <div class="prenota-info">
        <span class="prenota-prezzo">3109€</span>
        <span class="prenota-durata"> 11 giorni ·Settembre</span>
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
        
         <button class="accordion">Day 1: Arrivo a Delhi </button>
        <div class="panel" style="background-image: url('/Delhi.jpg');">
            <div class="testo-giorno">
                
                <b>Pomeriggio:</b> Arrivo in hotel, check-in e riposo<br><br>
                    
            </div>
        </div>

         <button class="accordion">Day 2-3: Visita di Delhi  </button>
        <div class="panel" style="background-image: url('/Delhi2.jpg');">
            <div class="testo-giorno">
                 <b> Day 2:</b> compatibilmente con l’operativo voli arrivo in nottata a Delhi, disbrigo delle pratiche d’ingresso nel paese e trasferimento in città.  Check-in e ultime ore della notte in hotel. Con i suoi quasi trenta milioni di abitanti questa enigmatica città del nord, è la più popolosa dell’India e tra le più popolose al mondo. Colazione in hotel e intera giornata dedicata all’esplorazione della caotica ed affascinante parte vecchia di Delhi, quella che tra le metà del Diciassettesimo e del Diciannovesimo secolo è stata la capitale del potente Impero Moghul. Visita in mattinata del maestoso Forte Rosso <br><br>
                <b> Day 3 mattina/pomeriggio:</b> immersione completa nel frenetico andirivieni della moltitudine di persone che affollano il mercato tradizionale di Chandni Chowk e successiva visita della Jama Masjid, la moschea più importante di Delhi e più grande dell’India<br><br>
                <b> day 3 sera:</b> partenza del treno notturno per Jodhpur. Notte in treno        
        </div>
        </div>
            
        <button class="accordion">Day 4-5-6: Jodhpur ed il tempio di Giainistra di Ranakpur </button>
        <div class="panel" style="background-image: url('/Jodhpur.jpg');">
            <div class="testo-giorno">
                 <b> Day 4:</b> arrivo alla stazione di Jodhpur, seconda città per popolazione dello stato nord-occidentale del Rajasthan. Colazione e intera giornata dedicata alla scoperta del dedalo di vicoli della coloratissima città blu dell’India, sormontata dall’imponente Forte di Mehrangarh.cena, serata e notte in hotel a Jodhpur  <br><br>
                <b> Day 5 mattina:</b>colazione e partenza al mattino con minivan privato in direzione Udaipur<br><br>  
               <b> Day 5 pomeriggio/sera :</b> pranzo lungo il tragitto e sosta nel pomeriggio per ammirare il maestoso tempio di Ranakpur, appartenente all’antica religione del Giainismo, sostenuto da oltre mille colonne di marmo, scolpite nei più minimi dettagli. Arrivo nel pomeriggio a Udaipur, check-in in hotel e free-time.cena e notte in hotel a Udaipur <br><br>
              <b> Day 6:</b> dopo la città blu di Jodhpur, giunge il momento di conoscere Udaipur, la città dei laghi, o la città bianca. Intera giornata alla scoperta di questo luogo fiabesco nato su due laghi, il Pichola e il Fateh Sargar. La bellezza dei suoi magnificenti palazzi nobiliari dell’Era Rajput, tra cui spicca il City Palace, e dei suoi templi hinduisti si riflette con vanità negli specchi d’acqua dei due laghi cittadini, creando immagini di austera ed esotica eleganza.cena e serata a Udaipur. <br><br>  
        </div>
        </div>

      <button class="accordion">Day 7-8-9: verso Jaipur e l'Amber Fort di Jaipur </button>
        <div class="panel" style="background-image: url('/Jaipur.jpg');">
            <div class="testo-giorno">
                 <b> Day 7 mattina: </b>colazione e partenza in minivan in direzione Jaipur   <br><br>
                   <b> Day 7 pomeriggio/sera: </b> arrivo in tarda mattinata a Jaipur, la città rosa, la capitale dello stato del Rajasthan. Check-in in hotel e pranzo. Visita dell’antico osservatorio astronomico Jantar Mantar e dell’iconico Hava Mahal, chiamato Il Palazzo dei Venti.cena e serata a Jaipur.  <br><br>
                <b> Day 8: </b>spostamento ad Amer e visita del maestoso Amber Fort, una delle principali fortezze storiche del Rajasthan, nota per il suo complesso tentacolare di cortili e sale in stile tradizionale <br><br>  
               <b> Day 9: </b> <br><br>ientro a Jaipur, breve giro a piedi, recupero dei bagagli in hotel e trasferimento in minivan in direzione Agra.
              
        </div>
        </div>
        
       <button class="accordion">Day 10: Alla scoperta di una delle sette meravilgie del mondo - Taj Mahal </button>
        <div class="panel" style="background-image: url('/TajMahal.jpg');">
            <div class="testo-giorno">
              <b>Mattina:</b> sveglia molto presto per ammirare il sorgere del sole sulle pietre incastonate nel marmo bianco del Taj Mahal. Tempo a disposizione per ammirare una delle 7 meraviglie del mondo, costruita da 20.000 uomini in 22 anni per volere dell’imperatore Shah Jahan, in memoria della sua amata moglie Mumtaz Mahal <br><br>
                <b>Pomeriggio:</b> visita del Forte Rosso di Agra, immensa fortezza in arenaria rossa costruita nel 16° secolo e fiorita sotto il regno di Shah Jahan. Recupero bagagli e trasferimento presso la stazione ferroviari <br><br>
                  <b>Sera:</b> partenza del treno notturno per Dehli e notte in treno   
            </div>
        </div>

        <button class="accordion">Day 11: Ritorno in Italia </button>
        <div class="panel" style="background-image: url('/Dehli.jpg');">
            <div class="testo-giorno">
              <b>Mattina:</b> Arrivo in mattinata nei principali scali italiani e… pronti, partenza e via!!! Alla prossima. <br><br>
                
            </div>
        </div>

        </section>

      <h2 class="titolo-sezione">Galleria Fotografica</h2>
      <section class="galleria-grid">
          <div class="foto-grid" style="background-image: url('/TajMahal.jpg');"></div>
          <div class="foto-grid" style="background-image: url('/Dehli.jpg');"></div>
          <div class="foto-grid" style="background-image: url('/Jaipur.jpg');"></div>
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
          <h2 class="modale-titolo">🎒 Prenota: INDIA </h2>
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
