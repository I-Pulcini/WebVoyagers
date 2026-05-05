<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { userStore } from '../stores/userStore'

   
/* --- VIAGGIO ALGERIA --- */
/* Abbiamo creato la pagina di dettaglio del viaggio Algeria, completa di itinerario,
   galleria fotografica e modale di prenotazione che si apre cliccando il bottone in alto. */

const router = useRouter()

// L'id del viaggio nella tabella viaggi (Algeria è il viaggio numero 8 tra i disponibili)
// Abbiamo dichiarato l'id del viaggio Algeria nel database
const ID_VIAGGIO_ALGERIA = 8

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
        idViaggio: ID_VIAGGIO_ALGERIA,
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
  <div class="algeria-wrapper">
    <header class="fascia-foto">
      <h1 class="fascia-titolo">ALGERIA</h1>
    </header>

    <!-- Bottone Prenota in posizione fissa -->
    <div class="prenota-bar">
      <div class="prenota-info">
        <span class="prenota-prezzo">3.300€</span>
        <span class="prenota-durata">12 giorni ·Agosto</span>
      </div>
      <button @click="apriModale" class="btn-prenota-grande">
        🎒 Prenota questo viaggio
      </button>
    </div>

    <main>
      <section class="fascia-testo">
        <p style="margin-top: 0;">
          L'Algeria è un paese immenso. A nord, si affaccia sull'Europa con la costa mediterranea, a latitudini maggiori di quelle della Sicilia; a sud, si protende tra Mali e Niger, incuneandosi nel profondo dell'Africa nera. Nel mezzo, la vastità del deserto del Sahara domina la scena. Partendo dalla capitale Algeri e dalla sua bianca Casbah che si tuffa nel Mediterraneo, ci lanceremo, a bordo di 4×4 guidati da driver locali, in un on the road leggendario lungo la N1, la mitica Transahariana, da Ghardaïa a Tamanrasset. Qui, nel profondo sud, andremo alla scoperta dell'Assekrem, la «Fine del Mondo» dei touareg, tra gli incredibili scenari del massiccio dell'Hoggar: trascorreremo una notte in rifugio a 2600 metri, e ammireremo il tramonto e l'alba più belli di tutto il Sahara.
        </p>
      </section>

      <h2 class="titolo-sezione">Itinerario Viaggio</h2>

      <section class="itinerario-container">
        
        <button class="accordion">Day 1: Arrivo ad Algeri </button>
        <div class="panel" style="background-image: url('/algeri.jpg');">
            <div class="testo-giorno">
                <b>Mattina/Pomeriggio:</b> Volo dall'Italia, arrivo ad Algeri, capitale dell'Algeria, spostamento in centro e check-in in hotel<br><br>
                <b>Sera:</b> Cena in ristorante tradizionale del centro di Algeri.
            </div>
        </div>

        <button class="accordion">Day 2: Alla scoperta della capitale - Algeri </button>
        <div class="panel" style="background-image: url('/elhamma.jpg');">
            <div class="testo-giorno">
                <b>Mattina:</b> Cisita della città nuova di Algeri. L'esplorazione inizierà da… un ufficio postale! La sede delle Poste Centrali di Algeri è infatti uno degli edifici più belli della città, con un bell'esterno neo-moresco e meravigliosi interni decorati con stucchi e finissimi mosaici. Dopo la vista di Algeri dall'alto del Giardino dell'Orologio Fiorito, visita del MAMA, interessante museo di arte moderno ospitato in un elegante edificio neo-moresco. Pranzo rapido in centro<br><br>
                <b>Pomeriggio:</b> Da piazza Port Said, su cui si affaccia il teatro nazionale, spostamento verso la zona est del centro di Algeri, per la visita del bel giardino botanico El Hamma, affacciato sul mar Mediterraneo. Spostamento e visita del colossale Memoriale dei Martiri dell'indipendenza<br><br>
                <b>Sera:</b> C in ristorante tradizionale del centro di Algeri
            </div>
        </div>

        <button class="accordion">Day 3: Casbah di Algeri </button>
        <div class="panel" style="background-image: url('/martiri.jpg');">
            <div class="testo-giorno">
                <b>Mattina:</b> Itinerario a piedi alla scoperta della Casbah di Algeri. Da piazza dei Martiri, immersione nei vicoli della parte bassa della Casbah, visita del palazzo Dar Aziza e, da fuori, della moschea Ketchaoua, risalente al XVII secolo. Vista della Casbah di Algeri dall'alto, prosecuzione dell'esplorazione dei tortuosi vicoli tra i bianchi palazzi decadenti con porte colorate e pranzo a base di street food<br><br>
                <b>Pomeriggio:</b> Discesa verso la costa, ai margini della Casbah, con visita al Palais des Rais. Trasferimento in aeroporto a metà pomeriggio per il volo interno per Ghardaïa<br><br>
                <b>Sera:</b> Arrivo a Ghardaïa, check-in in hotel e cena
            </div>
        </div>

        <button class="accordion">Day 4: Ghardaïa e valle dello M'zab </button>
        <div class="panel" style="background-image: url('/ghardaia.jpg');">
            <div class="testo-giorno">
                <b>Mattina:</b> Visita di Ghardaïa, capitale della Pentapoli mozabita, i 5 villaggi fortificati del Wadi M'zab, a partire dalla splendida piazza del mercato, che si trova ai piedi della città, abbarbicata su un colle dominato dalla moschea<br><br>
                <b>Pomeriggio:</b> Visita degli altri villaggi della Pentapoli, in particolare El Atteuf, Bou Noura e la città santa Beni Isguen: tutte le città della valle dello M'zab sono costruite secondo lo stesso schema, con la moschea, fulcro della vita spirituale, posta in alto, e il centro del villaggio che degrada armoniosamente verso il basso. La Pentapoli mozabita è considerata un capolavoro di urbanistica antica, e ha ispirato i lavori del grande urbanista francese Le Corbusier. Relax nelle fresche oasi ai piedi dei villaggi mozabiti<br><br>
                <b>Sera:</b> Cena e serata a Ghardaïa
            </div>
        </div>

        <button class="accordion">Day 5: El Menia </button>
        <div class="panel" style="background-image: url('/menia.jpg');">
            <div class="testo-giorno">
                <b>Mattina:</b> Partenza in 4×4 verso sud, addentrandoci nel profondo del Sahara lungo la N1, la leggendaria strada transahariana che attraversa l'Algeria da nord a sud, in direzione dell'oasi di El Menia, un tempo nota come El Goléa. Arrivo in tarda mattinata, check-in in hotel e pranzo<br><br>
                <b>Pomeriggio:</b> Visita dell'imponente ksar (fortezza) berbero e della chiesa di San Giuseppe, nel cui cortile si trova la tomba di Charles de Foucauld: soldato, esploratore, e in seguito prete cristiano, Foucauld si ritirò in eremitaggio presso le comunità touareg del Sahara algerino. Assassinato nel 1916, è considerato un martire della Chiesa cattolica, nonché beato dal 2005 e prossimo alla santificazione<br><br>
                <b>Sera:</b> Cena e serata a El Menia
            </div>
        </div>

        <button class="accordion">Day 6: N1 - Transahariana on the road </button>
        <div class="panel" style="background-image: url('/salah.jpg');">
            <div class="testo-giorno">
                <b>Mattina:</b> Giornata dedicata al trasferimento in 4×4 lungo la N1 verso In Salah. Pranzo durante il tragitto<br><br>
                <b>Pomeriggio:</b> P del trasferimento transahariano e arrivo a In Salah nel pomeriggio, Check-in in hotel e visita del villaggio, che sorge in corrispondenza di un'oasi ai margini dell'altopiano di Tademaït, nei pressi delle rovine di un antico ksar. Free time per l'esplorazione di In Salah e per dare un'occhiata da vicino alla vita nelle città remote, non turistiche, del Sahara algerino<br><br>
                <b>Sera:</b> Cena e serata a In Salah
            </div>
        </div>

        <button class="accordion">Day 7: Road to Tamanrasset e Hoggar </button>
        <div class="panel" style="background-image: url('/tamanrasset.jpg');">
            <div class="testo-giorno">
                <b>Mattina:</b> Partenza in 4×4 lungo la N1 verso Tamanrasset, la mitica città del Sahara algerino lungo le vie carovaniere che portano verso il Niger e il profondo dell'Africa Nera<br><br>
                <b>Pomeriggio:</b> Attraversati aridi deserti di sabbia e roccia e altopiani, si raggiunge la catena montuosa dell'Hoggar, che si erge fino ai 2918 metri del monte Tahat (il più alto di tutta l'Algeria) in uno scenario roccioso di rara e struggente bellezza. Arrivo alla capitale dei touareg, Tamanrasset, e check-in in hotel<br><br>
                <b>Sera:</b> Cena e serata a Tamanrasset
            </div>
        </div>

        <button class="accordion">Day 8: Assekrem </button>
        <div class="panel" style="background-image: url('/assekrem.jpg');">
            <div class="testo-giorno">
                <b>Mattina:</b> Salita in 4×4 all'Assekrem, «Fine del Mondo» nella lingua dei touareg, stupendo altopiano incastonato tra le vette dell'Hoggar. Ascesa su una pista sterrata costeggiando il picco Adaouda e il monte Akar Akar, attraverso paesaggi straordinari di montagna desertica e antiche sorgenti e wadi<br><br>
                <b>Pomeriggio:</b> Arrivo al piccolo rifugio di montagna, posto a circa 2600 metri di altitudine, e check-in. Con un trekking di circa un'ora, salita sino all'eremo di padre Foucauld, del 1911: sito a 2725 metri, è in una posizione meravigliosa con affaccio sulla vetta del monte Tahat, che si colora di rosso nel tardo pomeriggio per lo spettacolo del tramonto, tra i più belli del Sahara e del pianeta<br><br>
                <b>Sera:</b> Cena e sguardo al cielo per ammirare la meravigliosa notte stellata dal rifugio sull'Assekrem
            </div>
        </div>

        <button class="accordion">Day 9: Hoggar e rientro a Tamanrasset </button>
        <div class="panel" style="background-image: url('/hoggar.jpg');">
            <div class="testo-giorno">
                <b>Mattina:</b> Alba indimenticabile sulle pareti del massiccio dell'Hoggar, e rientro in 4×4 verso Tamanrasset, passando per una pista differente da quella dell'andata. Lungo il tragitto, si passa intorno al monte Ilamane e si attraversa il villaggio di pastori di Terhenanet, circondato da giardini<br><br>
                <b>Pomeriggio:</b> Rientro verso Tamanrasset attraverso magnifici scenari desertici e arrivo nel pomeriggio a Tamanrasset. Check-in in hotel e visita della capitale tuareg<br><br>
                <b>Sera:</b> Cena e serata a Tamanrasset
            </div>
        </div>

        <button class="accordion">Day 10: Tamekrest e Tamanrasset </button>
        <div class="panel" style="background-image: url('/tuareg.jpg');">
            <div class="testo-giorno">
                <b>Mattina:</b> Partenza in 4×4 lungo la pista desertica per la regione del Tamekrest. Visita dei villaggi touareg del deserto e relax con pic-nic alla cascata del Tamekrest<br><br>
                <b>Pomeriggio:</b> Rientro a Tamanrasset e visita della città. Free time nello splendido Marché Africain (mercato africano), dove i souk tradizionali touareg incontrano l'Africa nera, con possibilità di contrattare per splendidi manufatti e oggetti di artigianato locale<br><br>
                <b>Sera:</b> Cena a Tamanresset e a letto presto per il volo dell'indomani
            </div>
        </div>

        <button class="accordion">Day 11: Rientro ad Algeri e Tipasa </button>
        <div class="panel" style="background-image: url('/tipasa.jpg');">
            <div class="testo-giorno">
                <b>Mattina:</b> Sveglia molto presto e volo da Tamanrasset ad Algeri (possibile scalo tecnico a Djanet). Arrivo ad Algeri alle prime luci del mattino, trasferimento in centro e check-in in hotel. Giornata a disposizione, con possibilità di organizzare un'escursione a Tipasa. Partenza in bus lungo la costa ovest, arrivo a Tipasa e visita del Mausoleo reale di Mauretania, affascinante tomba numidica del I secolo a.C<br><br>
                <b>Pomeriggio:</b> Visita delle splendide rovine romane di Tipasa, affacciate sul mar Mediterraneo, e relax nella spiaggia di Chenoua, con bagno nelle limpide acque del Mediterraneo. Rientro ad Algeri in bus nel tardo pomeriggio<br><br>
                <b>Sera:</b> Cena in ristorante tradizionale del centro di Algeri
            </div>
        </div>

        <button class="accordion">Day 12: Rientro in Italia </button>
        <div class="panel" style="background-image: url('/italia.jpg');">
            <div class="testo-giorno">
                <b>Mattina:</b> Trasferimento in aeroporto per il volo di ritorno.<br><br>
                <b>Pomeriggio:</b> Arrivo in Italia.<br><br>
            </div>
        </div>

      </section>

      <h2 class="titolo-sezione">Galleria Fotografica</h2>
      <section class="galleria-grid">
          <div class="foto-grid" style="background-image: url('/ghardaia.jpg');"></div>
          <div class="foto-grid" style="background-image: url('/tamanrasset.jpg');"></div>
          <div class="foto-grid" style="background-image: url('/hoggar.jpg');"></div>
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
          <h2 class="modale-titolo">🎒 Prenota: Algeria</h2>
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
