<script setup>
import { RouterLink } from 'vue-router'

/* VUE ROUTER: Invece di usare il classico tag <a href="..."> per tornare indietro, 
   in Vue utilizziamo <RouterLink to="...">. Questo permette di cambiare pagina 
   istantaneamente senza ricaricare l'intero sito web dal server. */
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
