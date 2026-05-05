
<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { userStore } from '../stores/userStore'

/* --- VIAGGIO UGANDA --- */

const router = useRouter()


const ID_VIAGGIO_UGANDA = 27

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
        idViaggio: ID_VIAGGIO_UGANDA,
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
  <div class="uganda-wrapper">
    <header class="fascia-foto">
      <h1 class="fascia-titolo"> UGANDA </h1>
    </header>

    <!-- Bottone Prenota in posizione fissa -->
    <div class="prenota-bar">
      <div class="prenota-info">
        <span class="prenota-prezzo">4500€</span>
        <span class="prenota-durata">11 giorni ·Marzo</span>
      </div>
      <button @click="apriModale" class="btn-prenota-grande">
        🎒 Prenota questo viaggio
      </button>
    </div>

    <main>
      <section class="fascia-testo">
        <p style="margin-top: 0;">
       Uganda, la Perla d’Africa: così ebbe a definirla Winston Churchill nel 1907, durante un viaggio in Africa centrale. Oggi l’Uganda, dopo alcuni decenni travagliati, è pronta a svelarci di nuovo le sue meraviglie: un’avventura on the road ammantata di esotismo ci porterà a scoprire l’esplosione della natura più selvaggia dei grandi parchi ugandesi, dallo Ziwa Rhino Sanctuary alle Murchison Falls NP, dai grandi branchi di elefanti, bufali, zebre e i fantastici leoni arrampicatori del Queen Elizabeth NP agli scimpanze di Kyambura e alle Golden Monkey. Ma l’Uganda è soprattutto il paradiso dei gorilla: il trekking con le ultime famiglie di gorilla di montagna nella Foresta Impenetrabile di Bwindi, ai piedi dei Virunga, ci regalerà una delle emozioni più forti delle nostre vite.
        </p>
      </section>

      <h2 class="titolo-sezione">Itinerario Viaggio</h2>

      <section class="itinerario-container">
        
        <button class="accordion">Day 1-2:Kampala e Zhiwa RHina Sanctuary </button>
        <div class="panel" style="background-image: url('/Uganda.jpg');">
            <div class="testo-giorno">
                  <b>Day 1:</b> Partenza dalle principali città italiane e volo con scalo per Entebbe <br><br>
                <b>Day 2:</b> Arrivo ad Entebbe, in relazione all’orario di arrivo possibile check in in hotel e possibile visita di Kampala. Trasferimento verso nord, sosta a metà strada a Ziwa Rhino sanctuary. Unica riserva in Uganda dove è possibile osservare rinoceronti in libertà. Trekking-safari guidato nella riserva. Il santuario di Ziwa , che al momento ospita circa 25 esemplari di rinoceronte ” bianco” , ha lo scopo di consentire la loro futura reintroduzione nei parchi nazionali dell’Uganda: le due sottospecie autoctone, il rinoceronte bianco settentrionale e il rinoceronte nero orientale, sono entrambe estinte in natura dal 1982. Notte al santuario fuori dal parco di Murchison falls  <br><br>
                      
	</div>
        </div>

        <button class="accordion">Day 3-4: Murchison Falls National Park </button>
        <div class="panel" style="background-image: url('/Uganda2.jpg');">
            <div class="testo-giorno">
                <b>Day 3:</b> Safari fotografico nel settore a nord del Nilo dove si concentrano i “game drive” e i primi animali selvatici. Questo parco nazionale ospita una varietà e una quantità di fauna altissima ed essendo “tagliato” a metà dal Nilo e avendo il Lago Albert come confine naturale , offre un paesaggio estremamente verdeggiante e collinare che lo rendono unico e non comparabile ad altri parchi savana in Africa  <br><br>
                <b> Day 4 mattina:</b> Sveglia all’alba e safari fotografico nella parte a nord del Nilo. Nel parco troviamo all’incirca 76 specie di mammiferi: elefanti, bufali, giraffe, leoni, leopardi, antilopi, Uganda kobs e molti altri; inoltre troviamo circa 450 specie di uccelli, alcuni dei quali molto rari. Pranzo al sacco sulle sponde del Nilo<br><br>
                <b> Day 4 pomeriggio:</b> Crociera sul Nilo Vittoria fino ad arrivare a circa 500 metri dal punto in cui le cascate Murchison si immettono nel fiume, potendole ammirare in tutta la loro potenza e maestosità<br><br> 
	</div>
        </div>

        <button class="accordion">Day 4-5:Queen Elizabeth National Park </button>
        <div class="panel" style="background-image: url('/Uganda3.jpg');">
            <div class="testo-giorno">
                   <b>Day 4:</b> Colazione e spostamento verso il Queen Elizabeth NP. Sono circa 95 le specie di mammiferi qui presenti tra cui: leoni, elefanti, leopardi, Uganda kobs (impala), iene maculate, bufali e diverse specie di primati come scimpanzè, colobi blu, rossi,bianchi, neri e babbuini. Nel settore sud del parco denominato “Ishasha” sono presenti i “climbing lions” che si arrampicano sugli alberi dove trascorrono le loro giornate tra una caccia e l’altra <br><br>
                <b>Day 5:</b> Trekking con gli scimpanzé nella foresta di Kyambura che offre una varietà di vegetazione incredibile ed ospita una folta comunità di Scimpanzè. Avvistamento non garantito al 100%.rociera sul Kazinga Channel, che unisce Edward Lake e George Lake, con possibilità di osservare ippopotami, bufali, elefanti che si abbeverano al fiume, antilopi e uccelli anche molto rari.  <br><br>
               
            </div>
        </div>

        <button class="accordion">Day 6-7-8:Leoni Arrampicatori di Ishasha </button>
        <div class="panel" style="background-image: url('/Uganda4.jpg');">
            <div class="testo-giorno">
                   <b>day 6:</b> Trasferimento a sud del parco attraversando la foresta di Maramagambo. Arrivo nel settore di Ishasha in tarda mattinata per ammirare, con un pò di fortuna, i lion climbing, leoni che si arrampicano sui fig trees, alberi che si diramano a pochi metri di altezza e che i leoni usano come loro uffici personali nelle ore più calde della giornata. Pranzo al sacco o a un ristorante a Kihihi <br><br>
                <b>Day 7:</b> Spostamento verso il quartier generale di Bwindi impenetrabile forest per un briefing con i ranger del parco. Due ranger specializzati e i trackers (coloro che seguono e monitorano le famiglie di gorilla dall’alba al tramonto e che permettono questo straordinario processo di conservazione) ci accompagneranno e guideranno nella foresta impenetrabile alla ricerca di una delle famiglie di Gorilla di Montagna da osservare, seguire e contemplare per un’ ora dal momento del primo avvistamento. La durata del Gorilla trekking varia da giorno a giorno e da famiglia di gorilla ad un’altra e non è prevedibile in anticipo.<br><br>
                <b>Day 8:</b> Sveglia all’alba per il trasferimento al Mghainga National Park dove avrà luogo il trekking golden monkey della durata di 3/4 ore. Durante il trekking, con una vista meravigliosa sulle vette del Parco Nazionale dei vulcani, possibilità di vedere anche specie di uccelli come il Ruwenzori Turaco e il colobi<br><br>
            </div>
        </div>

        <button class="accordion">Day 9-10: La linea dell'Equatore </button>
        <div class="panel" style="background-image: url('/Uganda5.jpg');">
            <div class="testo-giorno">
               
 		       <b>Day 9:</b> Colazione e ripartenza verso Kampala con sosta sulla linea dell’Equatore <br><br>
                <b>Day 10:</b> Arrivo ad Entebbe e relax, dipendentemente dal piano voli, transfer per l’aeroporto <br><br>
              
             </div>
        </div>

        
        <button class="accordion">Day 11: Rientro in Italia </button>
        <div class="panel" style="background-image: url('/Uganda6.jpg');">
            <div class="testo-giorno">
               <b> Mattina:</b>: Giornata in volo, arrivo in Italia in serata… E alla prossima avventura!  <br><br>
 		  
              
             </div>
        </div>

      </section>

      <h2 class="titolo-sezione">Galleria Fotografica</h2>
      <section class="galleria-grid">
          <div class="foto-grid" style="background-image: url('/Uganda.jpg');"></div>
          <div class="foto-grid" style="background-image: url('/Uganda3.jpg');"></div>
          <div class="foto-grid" style="background-image: url('/Uganda4.jpg');"></div>
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
          <h2 class="modale-titolo">🎒 Prenota:UGANDA </h2>
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
