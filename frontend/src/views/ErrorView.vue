<script setup>
// Abbiamo importato 'RouterLink' dalla libreria ufficiale del router di Vue
import { RouterLink } from 'vue-router'

/* VUE ROUTER: Abbiamo scelto di non usare il classico tag <a href="..."> per tornare alla Home.
   In Vue utilizziamo <RouterLink to="..."> perché gestisce la navigazione interna alla SPA.
   Questo ci permette di cambiare pagina istantaneamente senza ricaricare l'intero sito web dal server,
   rendendo l'esperienza dell'utente molto più fluida e veloce. */
</script>

<template>
  <div class="error-body">
    
    <main class="error-container" style="margin-top: 15vh;">
        <section>
            <h1 class="error-title">Mi dispiace! 🌍</h1>
            
            <p>Al momento non abbiamo ancora organizzato un viaggio per questa destinazione nel mese che hai scelto.</p>
            <p>Stiamo lavorando per aggiungere sempre nuove mete. Riprova con un'altra combinazione!</p>
            
            <RouterLink to="/" class="back-link">Torna alla ricerca</RouterLink>
        </section>
    </main>
  </div>
</template>

<style>
/* Abbiamo deciso di non inserire CSS qui poiché questa pagina utilizza esclusivamente 
   le classi semantiche che abbiamo già centralizzato nel nostro foglio di stile globale. */
</style>
