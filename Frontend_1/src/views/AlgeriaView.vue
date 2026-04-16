<script setup>
import { onMounted } from 'vue'

/* --- SINTASSI VUE: LIFECYCLE HOOKS --- */
/* In Vue non possiamo manipolare il DOM finché questo non è stato effettivamente 
   "disegnato" (montato) sullo schermo. Per questo uso l'hook onMounted(). 
   Al suo interno ho inserito la logica JS originale dell'accordion che avevamo preparato. */
onMounted(() => {
  const accordions = document.getElementsByClassName("accordion");

  for (let i = 0; i < accordions.length; i++) {
    accordions[i].addEventListener("click", function() {
      this.classList.toggle("active");
      
      let panel = this.nextElementSibling;
      
      if (panel.style.display === "block") {
        panel.style.display = "none";
      } else {
        panel.style.display = "block";
      }
    });
  }
})
</script>

<template>
  <div class="algeria-wrapper">
    <header class="fascia-foto">
      <h1 class="fascia-titolo">ALGERIA</h1>
    </header>

    <main>
      <section class="fascia-testo">
        <p style="margin-top: 0;">
          L’Algeria è un paese immenso. A nord, si affaccia sull’Europa con la costa mediterranea, a latitudini maggiori di quelle della Sicilia; a sud, si protende tra Mali e Niger, incuneandosi nel profondo dell’Africa nera. Nel mezzo, la vastità del deserto del Sahara domina la scena. Partendo dalla capitale Algeri e dalla sua bianca Casbah che si tuffa nel Mediterraneo, ci lanceremo, a bordo di 4×4 guidati da driver locali, in un on the road leggendario lungo la N1, la mitica Transahariana, da Ghardaïa a Tamanrasset. Qui, nel profondo sud, andremo alla scoperta dell’Assekrem, la «Fine del Mondo» dei touareg, tra gli incredibili scenari del massiccio dell’Hoggar: trascorreremo una notte in rifugio a 2600 metri, e ammireremo il tramonto e l’alba più belli di tutto il Sahara.
        </p>
      </section>

      <h2 class="titolo-sezione">Itinerario Viaggio</h2>

      <section class="itinerario-container">
        
        <button class="accordion">Day 1: Arrivo ad Algeri</button>
        <div class="panel" style="background-image: url('/algeri.jpg');">
            <div class="testo-giorno">
                <b>Mattina/Pomeriggio:</b> volo dall’Italia, arrivo ad Algeri, capitale dell’Algeria, spostamento in centro e check-in in hotel<br><br>
                <b>Sera:</b> cena in ristorante tradizionale del centro di Algeri.
            </div>
        </div>

        <button class="accordion">Day 2: Algeri</button>
        <div class="panel" style="background-image: url('/elhamma.jpg');">
            <div class="testo-giorno">
                <b>Mattina:</b> visita della città nuova di Algeri. L’esplorazione inizierà da… un ufficio postale! La sede delle Poste Centrali di Algeri è infatti uno degli edifici più belli della città, con un bell’esterno neo-moresco e meravigliosi interni decorati con stucchi e finissimi mosaici. Dopo la vista di Algeri dall’alto del Giardino dell’Orologio Fiorito, visita del MAMA, interessante museo di arte moderno ospitato in un elegante edificio neo-moresco. Pranzo rapido in centro<br><br>
                <b>Pomeriggio:</b> da piazza Port Said, su cui si affaccia il teatro nazionale, spostamento verso la zona est del centro di Algeri, per la visita del bel giardino botanico El Hamma, affacciato sul mar Mediterraneo. Spostamento e visita del colossale Memoriale dei Martiri dell’indipendenza<br><br>
                <b>Sera:</b> cena in ristorante tradizionale del centro di Algeri
            </div>
        </div>

        <button class="accordion">Day 3: Casbah di Algeri</button>
        <div class="panel" style="background-image: url('/martiri.jpg');">
            <div class="testo-giorno">
                <b>Mattina:</b> itinerario a piedi alla scoperta della Casbah di Algeri. Da piazza dei Martiri, immersione nei vicoli della parte bassa della Casbah, visita del palazzo Dar Aziza e, da fuori, della moschea Ketchaoua, risalente al XVII secolo. Vista della Casbah di Algeri dall’alto, prosecuzione dell’esplorazione dei tortuosi vicoli tra i bianchi palazzi decadenti con porte colorate e pranzo a base di street food<br><br>
                <b>Pomeriggio:</b> discesa verso la costa, ai margini della Casbah, con visita al Palais des Rais. Trasferimento in aeroporto a metà pomeriggio per il volo interno per Ghardaïa<br><br>
                <b>Sera:</b> arrivo a Ghardaïa, check-in in hotel e cena
            </div>
        </div>

        <button class="accordion">Day 4: Ghardaïa e valle dello M'zab</button>
        <div class="panel" style="background-image: url('/ghardaia.jpg');">
            <div class="testo-giorno">
                <b>Mattina:</b> visita di Ghardaïa, capitale della Pentapoli mozabita, i 5 villaggi fortificati del Wadi M’zab, a partire dalla splendida piazza del mercato, che si trova ai piedi della città, abbarbicata su un colle dominato dalla moschea<br><br>
                <b>Pomeriggio:</b> visita degli altri villaggi della Pentapoli, in particolare El Atteuf, Bou Noura e la città santa Beni Isguen: tutte le città della valle dello M’zab sono costruite secondo lo stesso schema, con la moschea, fulcro della vita spirituale, posta in alto, e il centro del villaggio che degrada armoniosamente verso il basso. La Pentapoli mozabita è considerata un capolavoro di urbanistica antica, e ha ispirato i lavori del grande urbanista francese Le Corbusier. Relax nelle fresche oasi ai piedi dei villaggi mozabiti<br><br>
                <b>Sera:</b> cena e serata a Ghardaïa
            </div>
        </div>

        <button class="accordion">Day 5: El Menia</button>
        <div class="panel" style="background-image: url('/menia.jpg');">
            <div class="testo-giorno">
                <b>Mattina:</b> partenza in 4×4 verso sud, addentrandoci nel profondo del Sahara lungo la N1, la leggendaria strada transahariana che attraversa l’Algeria da nord a sud, in direzione dell’oasi di El Menia, un tempo nota come El Goléa. Arrivo in tarda mattinata, check-in in hotel e pranzo<br><br>
                <b>Pomeriggio:</b> visita dell’imponente ksar (fortezza) berbero e della chiesa di San Giuseppe, nel cui cortile si trova la tomba di Charles de Foucauld: soldato, esploratore, e in seguito prete cristiano, Foucauld si ritirò in eremitaggio presso le comunità touareg del Sahara algerino. Assassinato nel 1916, è considerato un martire della Chiesa cattolica, nonché beato dal 2005 e prossimo alla santificazione<br><br>
                <b>Sera:</b> cena e serata a El Menia
            </div>
        </div>

        <button class="accordion">Day 6: N1 - Transahariana on the road</button>
        <div class="panel" style="background-image: url('/salah.jpg');">
            <div class="testo-giorno">
                <b>Mattina:</b> giornata dedicata al trasferimento in 4×4 lungo la N1 verso In Salah. Pranzo durante il tragitto<br><br>
                <b>Pomeriggio:</b> prosecuzione del trasferimento transahariano e arrivo a In Salah nel pomeriggio, Check-in in hotel e visita del villaggio, che sorge in corrispondenza di un’oasi ai margini dell’altopiano di Tademaït, nei pressi delle rovine di un antico ksar. Free time per l’esplorazione di In Salah e per dare un’occhiata da vicino alla vita nelle città remote, non turistiche, del Sahara algerino<br><br>
                <b>Sera:</b> cena e serata a In Salah
            </div>
        </div>

        <button class="accordion">Day 7: Road to Tamanrasset e Hoggar</button>
        <div class="panel" style="background-image: url('/tamanrasset.jpg');">
            <div class="testo-giorno">
                <b>Mattina:</b> partenza in 4×4 lungo la N1 verso Tamanrasset, la mitica città del Sahara algerino lungo le vie carovaniere che portano verso il Niger e il profondo dell’Africa Nera<br><br>
                <b>Pomeriggio:</b> attraversati aridi deserti di sabbia e roccia e altopiani, si raggiunge la catena montuosa dell’Hoggar, che si erge fino ai 2918 metri del monte Tahat (il più alto di tutta l’Algeria) in uno scenario roccioso di rara e struggente bellezza. Arrivo alla capitale dei touareg, Tamanrasset, e check-in in hotel<br><br>
                <b>Sera:</b> cena e serata a Tamanrasset
            </div>
        </div>

        <button class="accordion">Day 8: Assekrem</button>
        <div class="panel" style="background-image: url('/assekrem.jpg');">
            <div class="testo-giorno">
                <b>Mattina:</b> salita in 4×4 all’Assekrem, «Fine del Mondo» nella lingua dei touareg, stupendo altopiano incastonato tra le vette dell’Hoggar. Ascesa su una pista sterrata costeggiando il picco Adaouda e il monte Akar Akar, attraverso paesaggi straordinari di montagna desertica e antiche sorgenti e wadi<br><br>
                <b>Pomeriggio:</b> arrivo al piccolo rifugio di montagna, posto a circa 2600 metri di altitudine, e check-in. Con un trekking di circa un’ora, salita sino all’eremo di padre Foucauld, del 1911: sito a 2725 metri, è in una posizione meravigliosa con affaccio sulla vetta del monte Tahat, che si colora di rosso nel tardo pomeriggio per lo spettacolo del tramonto, tra i più belli del Sahara e del pianeta<br><br>
                <b>Sera:</b> cena e sguardo al cielo per ammirare la meravigliosa notte stellata dal rifugio sull’Assekrem
            </div>
        </div>

        <button class="accordion">Day 9: Hoggar e rientro a Tamanrasset</button>
        <div class="panel" style="background-image: url('/hoggar.jpg');">
            <div class="testo-giorno">
                <b>Mattina:</b> alba indimenticabile sulle pareti del massiccio dell’Hoggar, e rientro in 4×4 verso Tamanrasset, passando per una pista differente da quella dell’andata. Lungo il tragitto, si passa intorno al monte Ilamane e si attraversa il villaggio di pastori di Terhenanet, circondato da giardini<br><br>
                <b>Pomeriggio:</b> rientro verso Tamanrasset attraverso magnifici scenari desertici e arrivo nel pomeriggio a Tamanrasset. Check-in in hotel e visita della capitale tuareg<br><br>
                <b>Sera:</b> cena e serata a Tamanrasset
            </div>
        </div>

        <button class="accordion">Day 10: Tamekrest e Tamanrasset</button>
        <div class="panel" style="background-image: url('/tuareg.jpg');">
            <div class="testo-giorno">
                <b>Mattina:</b> partenza in 4×4 lungo la pista desertica per la regione del Tamekrest. Visita dei villaggi touareg del deserto e relax con pic-nic alla cascata del Tamekrest<br><br>
                <b>Pomeriggio:</b> rientro a Tamanrasset e visita della città. Free time nello splendido Marché Africain (mercato africano), dove i souk tradizionali touareg incontrano l’Africa nera, con possibilità di contrattare per splendidi manufatti e oggetti di artigianato locale<br><br>
                <b>Sera:</b> cena a Tamanresset e a letto presto per il volo dell’indomani
            </div>
        </div>

        <button class="accordion">Day 11: Rientro ad Algeri e Tipasa</button>
        <div class="panel" style="background-image: url('/tipasa.jpg');">
            <div class="testo-giorno">
                <b>Mattina:</b> sveglia molto presto e volo da Tamanrasset ad Algeri (possibile scalo tecnico a Djanet). Arrivo ad Algeri alle prime luci del mattino, trasferimento in centro e check-in in hotel. Giornata a disposizione, con possibilità di organizzare un’escursione a Tipasa. Partenza in bus lungo la costa ovest, arrivo a Tipasa e visita del Mausoleo reale di Mauretania, affascinante tomba numidica del I secolo a.C<br><br>
                <b>Pomeriggio:</b> visita delle splendide rovine romane di Tipasa, affacciate sul mar Mediterraneo, e relax nella spiaggia di Chenoua, con bagno nelle limpide acque del Mediterraneo. Rientro ad Algeri in bus nel tardo pomeriggio<br><br>
                <b>Sera:</b> cena in ristorante tradizionale del centro di Algeri
            </div>
        </div>

        <button class="accordion">Day 12: Rientro in Italia</button>
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
    </main>
  </div>
</template>

<style scoped>
/* Il CSS globale è già in main.css, qui mettiamo solo regole specifiche 
   se dovessero servire un domani per questa singola vista. */
</style>