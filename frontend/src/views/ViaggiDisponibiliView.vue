<script setup>

  import {ref, computed} form 'vue';
  const mesi = ['Gennaio','Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];
  const meseSelezionao = ref('Gennaio');


  //creimao il database con i viaggi disponibili
const viaggi = ref([
 { id: 1, mese: 'Gennaio', periodo: 'GENNAIO', data: '03-07', destinazione: 'NORVEGIA', prezzo: '3100€', stato: 'Vedi Viaggio>', posti: 4},
  { id: 2, mese: 'Febbraio', periodo: 'FEBBRAIO', data: '10-15', destinazione: 'LAPPONIA SVEDESE', prezzo: '3700€', stato: 'Vedi Viaggio>', posti: 2 },
  { id: 3, mese: 'Marzo', periodo: 'MARZO', data: '15-19', destinazione: 'LONDRA', prezzo: '1500€', stato: 'Vedi Viaggio>', posti: 1},
  { id: 4, mese: 'Aprile', periodo: 'APRILE', data: '22-27', destinazione: 'TUNISIA', prezzo: '1200€', stato: 'Vedi viaggio >', posti: 4 },
  { id: 5, mese: 'Maggio', periodo: 'OTTOBRE-NOVEMBRE', data: '28-06', destinazione: 'MAROCCO', prezzo: '2400€', stato: 'Vedi Viaggio >', posti: 8 },
  { id: 6, mese: 'Giugno', periodo: 'GIUGNO', data: '18-28', destinazione: 'PERU', prezzo: '5900€', stato: 'Vedi Viaggio >', posti: 6 },
   { id: 7, mese: 'Luglio', periodo: 'LUGLIO-AGOSTO', data: '24-05', destinazione: 'THAILANDIA', prezzo: '4200€', stato: 'Vedi Viaggio >', posti: 9},
  { id: 8, mese: 'Agosto', periodo: 'AGOSTO', data: '08-20', destinazione: 'ALGERIA', prezzo: '3300€', stato: 'Vedi Viaggio>', posti: 7},
  { id: 9, mese: 'Settembre', periodo: 'SETTEMBRE-OTTOBRE', data: '27-07', destinazione: 'OMAN', prezzo: '2800€', stato: 'Vedi Viaggio>', posti: 3 },
  { id: 10, mese: 'Ottobre', periodo: 'OTTOBRE-NOVEMBRE', data: '28-06', destinazione: 'MAROCCO', prezzo: '2400€', stato: 'Vedi Viaggio >', posti: 8 },
  { id: 11, mese: 'Novembre', periodo: 'NOVEMBRE', data: '21-29', destinazione: 'COREA DEL SUD', prezzo: '4200€', stato: 'Vedi Viaggio >', posti: 1 },
   { id: 12, mese: 'Dicembre', periodo: 'DICEMBRE-GENNAIO', data: '21-02', destinazione: 'CAPO VERDE', prezzo: '3600€', stato: 'Vedi Viaggio >', posti: 2},
]);
 
  
</script>

<template>
  <div class="ViaggiDisponibili-wrapper">
    
    <header class="fascia-foto">
      <h1 class="fascia-titolo">Prossime Partenze</h1>
    </header>

    <main>
      <section class="fascia-testo">
        <p style="margin-top: 0;">
           WebVoyagers ti offre viaggi organizzati verso destinazioni poco cononsciute,creando insieme un itinerario personalizzato.
           Unisci a noi per un'esperienza indimenticabile. 
           Prenota il tuo viaggio e vivi l'avventura dei tuoi sogni.
        </p>
      </section>

      <h2 class="titolo-sezione">Scegli un mese</h2>

      <section class="itinerario-container">
        
        <button class="checked">Gennaio</button>
        <button class="checked">Febbraio</button>
        <button class="checked">Marzo</button>
         <button class="checked">Aprile</button>
        <button class="checked">Maggio</button>
        <button class="checked">Giugno</button>
         <button class="checked">Luglio</button>
        <button class="checked">Agosto</button>
        <button class="checked">Settembre</button>
         <button class="checked">Ottobre</button>
        <button class="checked">Novembre</button>
        <button class="checked">Dicembre</button>
        </section>
    </main>
  </div>
</template>

<style scoped>
/* Abbiamo usato l'attributo 'scoped' per assicurarci che eventuali stili scritti qui 
   non vadano a influenzare le altre pagine del sito. */
</style>
