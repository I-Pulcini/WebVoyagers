

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { userStore } from '../stores/userStore'

/* --- VIAGGIO FILIPPINE  --- */

const router = useRouter()

// L'id del viaggio nella tabella viaggi (Algeria è il viaggio numero 8 tra i disponibili)
// Abbiamo dichiarato l'id del viaggio NORVEGIA nel database
const ID_VIAGGIO_FILIPPINE = 31 

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
        idViaggio: ID_VIAGGIO_,
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
  <div class="filippine-wrapper">
    <header class="fascia-foto">
      <h1 class="fascia-titolo">FILIPPINE</h1>
    </header>

    <!-- Bottone Prenota in posizione fissa -->
    <div class="prenota-bar">
      <div class="prenota-info">
        <span class="prenota-prezzo"> 4200€</span>
        <span class="prenota-durata"> 18 giorni ·Luglio</span>
      </div>
      <button @click="apriModale" class="btn-prenota-grande">
        🎒 Prenota questo viaggio
      </button>
    </div>

    <main>
      <section class="fascia-testo">
        <p style="margin-top: 0;">

7.641: questo è il numero delle isole che compongono l’arcipelago delle Filippine: nel nostro viaggio andremo alla scoperta di più di 15 isole, dalle dimensioni e caratteristiche geologiche più disparate. Dalla caotica Manila, ci sposteremo a Bohol, regno dei tarsi, dove faremo un primo tuffo nelle acque cristalline per poi scoprire la meraviglia delle Chocolate Hills. A Palawan, la perla tropicale delle Filippine, resteremo abbagliati dall’infinita bellezza della natura, tra fiumi sotterranei, lunghe spiagge di sabbia finissima, e gite in barca alla scoperta di baie e isolette dalla vegetazione rigogliosa. Il comun denominatore, l’inconfondibile colore turchese del Mare delle Filippine!
        </p>
      </section>

      <h2 class="titolo-sezione">Itinerario Viaggio</h2>

      <section class="itinerario-container">
        
         <button class="accordion">Day 1-2: Partenzza dall'italia </button>
        <div class="panel" style="background-image: url('/Manila.jpg');">
            <div class="testo-giorno">
                 <b>Day1:</b> Partenza dai principali aereoporti italiani<br><br>
                <b>Day 2:</b> Arrivo a Manila e relax in hotel <br><br>
            </div>
        </div>

        <button class="accordion">Day 3: Alla scoperta della capitale - Manila</button>
        <div class="panel" style="background-image: url('/Manila2.jpg');">
            <div class="testo-giorno">
                 <b>Mattina/Pomeriggio:</b> alla scoperta della bellissima e caotica capitale <br><br>
                <b>Sera:</b> cena e serata nella movida di Manila           
        </div>
        </div>

      <button class="accordion">Day 4-5: Partenza per Bohol </button>
        <div class="panel" style="background-image: url('/Bohol.jpg');">
            <div class="testo-giorno">
                 <b>Day 4:</b> sveglia presto e trasferimento all’aeroporto di Manila per il volo con destinazione Bohol. Arrivo sull’isola e trasferimento in hotel.prima giornata di mare! Ci rilasseremo infatti sulle spiagge da cartolina dell’isola di Panglao, collegata a Bohol da un ponte, e famosa per i suoi fondali ricchi di corallo e fauna tropicale. <br><br>
                <b>Day 5:</b> sveglia presto e breve trasferimento verso l’interno dell’isola per ammirare lo spettacolo del viewpoint delle Chocolate Hills prima dell’arrivo dei bus turistici. Trasferimento presso il centro di conservazione dei tarsi, i primati più piccoli al mondo, famosi per i loro occhi giganti <br><br>
            </div>
        </div>

      <button class="accordion">Day 6-7: Verso Puerto Princesa </button>
        <div class="panel" style="background-image: url('/PuertoPrincesa.jpg');">
            <div class="testo-giorno">
                 <b>Day 6:</b> Trasferimento al porto di Bohol, imbarco sul traghetto veloce per l’isola di Cebu. volo da Cebu a Puerto Princesa, il capoluogo dell’isola di Palawan. Arrivo, trasferimento e check-in in hotel  <br><br>
                <b>Day 7:</b>giornata dedicata all’esplorazione del Puerto Princesa Underground River. Situato a circa 50km a nord del capoluogo, si tratta il fiume sotterraneo col tratto navigabile più lungo del mondo, ed è patrimonio dell’umanità UNESCO. Partenza alle 7 da Puerto Princesa, esplorazione in barca del fiume sotterraneo, immerso in uno scenario lussureggiante, dominato da alte rocce e folta vegetazione all’esterno, e da grandi stalattiti e altre particolari formazioni rocciose all’interno  <br><br>
            </div>
        </div>

      <button class="accordion">Day 8-9-10: Destinazione  paradiso - El Nido</button>
        <div class="panel" style="background-image: url('/ElNido.jpg');">
            <div class="testo-giorno">
                 <b>Day 8:</b> partenza in mattinata da Puerto Princesa in direzione di El Nido, vero e proprio paradiso incontaminato situato nel nord di Palawan. Check-in in hotel e free time <br><br>
                <b>Day 9-10:</b> free time nelle spiagge adiacenti il villaggio di El Nido. Tra le più belle, merita sicuramente una citazione quella di Nacpan, che occupa una lunghissima baia semicircolare di sabbia bianca. Rientro a El Nido in serata <br><br>
            </div>
        </div>
        <button class="accordion">Day 11-12-13: Coron </button>
        <div class="panel" style="background-image: url('/Coron.jpg');">
            <div class="testo-giorno">
                 <b>Day 11 :</b> partenza in mattinata da El Nido in direzione Coron.  <br><br>
                <b>Day 12-13:</b> in relazione all’orario di arrivo possibilità di snorkeling al reef di Siete Pecados o trekking sul monte Tapyas per una splendida vista al tramonto della baia di Coron. Relax tra il mare cristallino ed i servizi offerti del hotel <br><br>
            </div>
        </div>

           <button class="accordion">Day 14-15-16: Lago Kayangan e Twin Lagoon </button>
        <div class="panel" style="background-image: url('/TwinLagoon.jpg');">
            <div class="testo-giorno">
                 <b>Day 14 :</b> partenza in mattinata da Coron in direzione Lago Kayangan.  <br><br>
                <b>Day 15-16:</b> ultima, spettacolare giornata di mare alle Filippine. La destinazione odierna è l’isola di Coron vera e propria, a circa un’ora di barca da Coron City: il lago di Kayangan è uno spettacolo che non riusciremo a dimenticare facilmente, e da li ci sposteremo nelle meravigliose spiagge e lagune dei dintorni, come Smith Beach, il vicino coral reef perfetto per lo snorkeling, la Twin Lagoon e il Barracuda Lake. Rientro a Coron nel tardo pomeriggio, relax e free time <br><br>
            </div>
        </div>

          <button class="accordion">Day 17 : Ritorno a Manila prima del rientro verso casa </button>
        <div class="panel" style="background-image: url('/Manila.jpg');">
            <div class="testo-giorno">
                 <b>Day 17 :</b> partenza in mattinata in direzione Manila. Ultima cena e serata a Manila. <br><br>
           
            </div>
        </div>

        <button class="accordion">Day 18: Rientro in Italia </button>
        <div class="panel" style="background-image: url('/Manila2.jpg');">
            <div class="testo-giorno">
                 <b>Day 18 :</b> Si torna casa, alla prossima avventura insieme !!! <br><br>
           
            </div>
        </div>

        </section>

      <h2 class="titolo-sezione">Galleria Fotografica</h2>
      <section class="galleria-grid">
          <div class="foto-grid" style="background-image: url('/ElNido.jpg');"></div>
          <div class="foto-grid" style="background-image: url('/Manila.jpg');"></div>
          <div class="foto-grid" style="background-image: url('/TwinLagoon.jpg');"></div>
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
          <h2 class="modale-titolo">🎒 Prenota: FILIPPINE </h2>
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
