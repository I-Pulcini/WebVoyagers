
<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { userStore } from '../stores/userStore'

/* --- VIAGGIO MAROCCO  --- */

const router = useRouter()


const ID_VIAGGIO_MAROCCO = 5

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
        idViaggio: ID_VIAGGIO_MAROCCO,
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
  <div class="marocco-wrapper">
    <header class="fascia-foto">
      <h1 class="fascia-titolo"> MAROCCO </h1>
    </header>

    <!-- Bottone Prenota in posizione fissa -->
    <div class="prenota-bar">
      <div class="prenota-info">
        <span class="prenota-prezzo">2400€</span>
        <span class="prenota-durata"> 10 giorni ·Maggio</span>
      </div>
      <button @click="apriModale" class="btn-prenota-grande">
        🎒 Prenota questo viaggio
      </button>
    </div>

    <main>
      <section class="fascia-testo">
        <p style="margin-top: 0;">
       Pochi luoghi come il Marocco, con il caos dei souq e i silenzi delle kasbe, l’infinita palette di colori e i profumi inebrianti, sono in grado di stuzzicare la fantasia dei viaggiatori. Nel nostro on the road, la realtà supererà la fantasia: ci addentreremo, accompagnati da sapienti guide locali, nelle affollate medine delle città imperiali di Marrakech e Fes, attraverseremo vallate desertiche, oasi verdissime e foreste di montagna,  e passeremo una notte indimenticabile in un camp tra le dune del Sahara. Ciliegina sulla torta, una serata all’insegna del relax e del divertimento a Chefchaouen, la celebre «città blu»
        </p>
      </section>

      <h2 class="titolo-sezione">Itinerario Viaggio</h2>

      <section class="itinerario-container">
        
        <button class="accordion">Day 1:Arrivo a Marrakech </button>
        <div class="panel" style="background-image: url('/Marrakech.jpg');">
            <div class="testo-giorno">
                  <b>Mattina:</b> Partenza dall’Italia e arrivo a Marrakech, trasferimento in riad nel centro della medina <br><br>
                <b>Pomeriggio:</b> Prima esplorazione dei souq della medina di Marrakech, dei giardini della Koutoubia e della piazza Jemaa el Fna, patrimonio dell’umanità UNESCO, in un festante caos di cartomanti, giocolieri, incantatori di serpenti, venditori di lumache, cantastorie. Tè al tramonto in uno dei rooftop sovrastanti la piazza <br><br>
                <b>Sera:</b> Cena a base di street food negli stand di piazza Jemaa el Fna           
	</div>
        </div>

        <button class="accordion">Day 2:Marrakech </button>
        <div class="panel" style="background-image: url('/Marrakech2.jpg');">
            <div class="testo-giorno">
                <b>Mattina:</b> Visita della “città rossa” di Marrakech con guida parlante italiano: visita dell’antico quartiere ebraico della Mellah, il Palazzo Bahia, capolavoro dell’architettura arabo-andalusa, e visita dei labirintici souq degli artigiani del ferro e del cuoio<br><br>
                <b>Pomeriggio:</b> Pranzo in caratteristico ristorante rooftop con affaccio sul souq delle spezie nella medina, e visita dei giardini Majorelle<br><br>
                <b>Sera:</b> Cena in ristorante tipico per gustare le specialità marocchine. Serata nei locali di Marrakech.            
	</div>
        </div>

        <button class="accordion">Day 3: Ait Ben Haddou </button>
        <div class="panel" style="background-image: url('/Haddou.jpg');">
            <div class="testo-giorno">
                   <b>Mattina:</b> Partenza per Ouarzazate. Rapida e tortuosa salita verso il passo Tichka, uno dei più alti della catena dell’Atlante (2260 m), immersi in un magnifico scenario lunare. Trasferimento a Telouet e pranzo a base di tajine gourmet<br><br>
                <b>Pomeriggio:</b> Scenic drive lungo la spettacolare valle di Ounila, dove il verdissimo fondovalle crea un fantastico contrasto cromatico con il rosso delle montagne, visita al tramonto del sito UNESCO dello ksar di Ait Ben Haddou,  Tramonto e trasferimento in riad<br><br>
                <b>Sera:</b> Cena e pernottamento in riad
            </div>
        </div>

        <button class="accordion">Day 4:Valle del Dades e Merzouga </button>
        <div class="panel" style="background-image: url('/Merzouga.jpg');">
            <div class="testo-giorno">
                   <b>Mattina:</b> Partenza per la Valle delle Rose e il villaggio di Skoura, attraverso la strada delle Mille Kasbah, puntellata di oasi brulicanti di vita. Sosta con pranzo al sacco panoramico presso il famoso viewpoint della valle del Dadès<br><br>
                <b>Pomeriggio:</b> Arrivo a Merzouga e tour nel deserto dell’Erg Chebbi, famoso per le sue dune di sabbia che si stagliano altissime al confine con l’Algeria<br><br>
                <b>Sera:</b> Notte indimenticabile in tenda nomade nel mezzo delle dune, serata al ritmo della musica, canti e danze del folclore berbero sotto a milioni di stelle   
            </div>
        </div>

        <button class="accordion">Day 5:Valle del Ziz, Azrou e Ifrane </button>
        <div class="panel" style="background-image: url('/Azrou.jpg');">
            <div class="testo-giorno">
 		         <b>Mattina:</b> Sveglia presto per vedere il magnifico spettacolo dell’alba nel deserto, rientro a Merzouga e partenza per Fes attraverso il “serpentone verde” della Valle dello Ziz <br><br>
                <b>Pomeriggio:</b> Immersi in un surreale scenario alpino, visita  della foresta incantata di Azrou, dove le bertucce vivono in libertà tra i boschi di cedro. Attraversamento della cittadina universitaria di Ifrane, conosciuta come la Svizzera marocchina. Cena e arrivo in serata a Fes <br><br>
                <b>Sera:</b> Sistemazione in riad a Fes
             </div>
        </div>
      
        <button class="accordion">Day 6:Fes </button>
        <div class="panel" style="background-image: url('/Fes.jpg');">
            <div class="testo-giorno">
 		         <b>Mattina:</b> Visita guidata in italiano della capitale religiosa, intellettuale e artistica del Marocco, tra i tortuosi labirinti dei souq, antichi caravanserrai e scuole coraniche  <br><br>
                <b>Pomeriggio:</b> Visita all’affascinante quartiere dei tintori e alle famose concerie della medina, con possibilità di acquistare articoli in pura pelle a prezzi vantaggiosi. Free time e possibilità di relax in un hammam tipico (opzionale, non incluso)  <br><br>
                <b>Sera:</b> Cena in ristorante marocchino e pernottamento in riad
             </div>
        </div>

        
        <button class="accordion">Day 7:Chefchaouen </button>
        <div class="panel" style="background-image: url('/Chefchaouen.jpg');">
            <div class="testo-giorno">
 		         <b>Mattina:</b> Prosecuzione verso nord, attraverso paesaggi di montagna simil-alpini, alla volta di Chefchaouen, la splendida città blu marocchina <br><br>
                <b>Pomeriggio:</b> Arrivo a Chefchaouen, autentico gioiellino a lungo tenuto protetto dagli sguardi stranieri. Free time immersi negli stretti vicoli della medina,  tra le tipiche case di un abbagliante colore azzurro, adornate di massicce porte chiodate  <br><br>
                <b>Sera:</b> Cena e pernottamento a Chefchaouen
             </div>
        </div>

        
        <button class="accordion">Day 8:Rabat </button>
        <div class="panel" style="background-image: url('/Rabat.jpg');">
            <div class="testo-giorno">
 		         <b>Mattina:</b> Partenza per Rabat, la capitale amministrativa e centro politico del Marocco. Spostamento in hotel e check in <br><br>
                <b>Pomeriggio:</b> Arrivo a Rabat, passeggiata nella medina e visita dei vicoli dipinti di azzurro della Kasbah degli Oudaya, terminando nella bellissima terrazza affacciata sull’Oceano Atlantico  <br><br>
                <b>Sera:</b> Cena e serata a Rabat
             </div>
        </div>

        
        <button class="accordion">Day 9:Tanger </button>
        <div class="panel" style="background-image: url('/Tanger.jpg');">
            <div class="testo-giorno">
 		        <b>Mattina:</b> Partenza per Tanger, si prende un treno da Rabat e si arriva a dedstinazione.Spostamento in hotel e check in <br><br>
                <b>Pomeriggio:</b> Dopo pranzo, giro alla medina e al porto di Tanger <br><br>
                <b>Sera:</b> Cena e serata a Tanger
             </div>
        </div>

        
        <button class="accordion">Day 10: Rientro in Italia</button>
        <div class="panel" style="background-image: url('/Casablanca.jpg');">
            <div class="testo-giorno">
 		         <b>Mattina/Pomeriggio:</b> A seconda dell’operativo voli, spostamento verso Marrakech o Casablanca per il volo di rientro. Trasferimento in aeroporto per il volo di rientro in Italia… e alla prossima avventura!  <br><br>
                <b>Sera:</b> Arrivo in Italia
             </div>
        </div>


        
      </section>

      <h2 class="titolo-sezione">Galleria Fotografica</h2>
      <section class="galleria-grid">
          <div class="foto-grid" style="background-image: url('/Tanger.jpg');"></div>
          <div class="foto-grid" style="background-image: url('/Marrakech.jpg');"></div>
          <div class="foto-grid" style="background-image: url('/Casablanca.jpg');"></div>
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
          <h2 class="modale-titolo">🎒 Prenota: MAROCCO</h2>
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
