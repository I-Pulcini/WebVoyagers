<script setup>
// Abbiamo importato onMounted per eseguire il codice JavaScript solo dopo che la pagina è stata caricata nel browser
import { onMounted } from 'vue'

/* --- SINTASSI VUE: LIFECYCLE HOOKS --- */
/* Abbiamo usato l'hook onMounted perché in Vue non possiamo cercare elementi nell'HTML (DOM) 
   finché il componente non è stato effettivamente "disegnato" sullo schermo. */
onMounted(() => {
  // Abbiamo recuperato tutti i bottoni con classe "accordion" presenti nella pagina
  const accordions = document.getElementsByClassName("accordion");

  // Abbiamo fatto un ciclo per assegnare a ogni singolo bottone un "ascoltatore" di eventi
  for (let i = 0; i < accordions.length; i++) {
    accordions[i].addEventListener("click", function() {
      // Al clic, abbiamo aggiunto o rimosso la classe "active" per cambiare l'icona (+ o -)
      this.classList.toggle("active");
      
      // Abbiamo individuato il "pannello" (il div con il testo) che si trova subito dopo il bottone cliccato
      let panel = this.nextElementSibling;
      
      // Abbiamo creato una logica condizionale: se il pannello è visibile lo nascondiamo, altrimenti lo mostriamo
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
          L’Algeria è un paese immenso... [Testo descrittivo del viaggio]
        </p>
      </section>

      <h2 class="titolo-sezione">Itinerario Viaggio</h2>

      <section class="itinerario-container">
        
        <button class="accordion">Day 1: Arrivo ad Algeri</button>
        <div class="panel" style="background-image: url('/algeri.jpg');">
            <div class="testo-giorno">
                <b>Mattina/Pomeriggio:</b> volo dall’Italia, arrivo ad Algeri...<br><br>
                <b>Sera:</b> cena in ristorante tradizionale.
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
/* Abbiamo usato l'attributo 'scoped' per assicurarci che eventuali stili scritti qui 
   non vadano a influenzare le altre pagine del sito. */
</style>
