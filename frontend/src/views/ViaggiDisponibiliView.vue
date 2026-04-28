<script setup>
import { ref, computed } from 'vue';

const mesi = ['Gennaio','Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];
const meseSelezionato = ref('Gennaio');

const viaggi = ref([
 { id: 1, mese: 'Gennaio', periodo: 'GENNAIO: ', data: '03-07 ', destinazione: 'NORVEGIA', prezzo: '3100€', stato: 'Vedi Viaggio>', posti: 4},
 { id: 2, mese: 'Febbraio', periodo: 'FEBBRAIO: ', data: '10-15 ', destinazione: 'LAPPONIA SVEDESE', prezzo: '3700€', stato: 'Vedi Viaggio>', posti: 2 },
 { id: 3, mese: 'Marzo', periodo: 'MARZO: ', data: '15-19 ', destinazione: 'LONDRA', prezzo: '1500€', stato: 'Vedi Viaggio>', posti: 1},
 { id: 4, mese: 'Aprile', periodo: 'APRILE: ', data: '22-27 ', destinazione: 'TUNISIA', prezzo: '1200€', stato: 'Vedi viaggio >', posti: 4 },
 { id: 5, mese: 'Maggio', periodo: 'OTTOBRE-NOVEMBRE: ', data: '28-06 ', destinazione: 'MAROCCO', prezzo: '2400€', stato: 'Vedi Viaggio >', posti: 8 },
 { id: 6, mese: 'Giugno', periodo: 'GIUGNO: ', data: '18-28 ', destinazione: 'PERU', prezzo: '5900€', stato: 'Vedi Viaggio >', posti: 6 },
 { id: 7, mese: 'Luglio', periodo: 'LUGLIO-AGOSTO: ', data: '24-05 ', destinazione: 'THAILANDIA', prezzo: '4200€', stato: 'Vedi Viaggio >', posti: 9},
 { id: 8, mese: 'Agosto', periodo: 'AGOSTO: ', data: '08-20 ', destinazione: 'ALGERIA', prezzo: '3300€', stato: 'Vedi Viaggio>', posti: 7},
 { id: 9, mese: 'Settembre', periodo: 'SETTEMBRE-OTTOBRE: ', data: '27-07 ', destinazione: 'OMAN', prezzo: '2800€', stato: 'Vedi Viaggio>', posti: 3 },
 { id: 10, mese: 'Ottobre', periodo: 'OTTOBRE-NOVEMBRE: ', data: '28-06 ', destinazione: 'MAROCCO', prezzo: '2400€', stato: 'Vedi Viaggio >', posti: 8 },
 { id: 11, mese: 'Novembre', periodo: 'NOVEMBRE: ', data: '21-29 ', destinazione: 'COREA DEL SUD', prezzo: '4200€', stato: 'Vedi Viaggio >', posti: 1 },
 { id: 12, mese: 'Dicembre', periodo: 'DICEMBRE-GENNAIO: ', data: '21-02 ', destinazione: 'CAPO VERDE', prezzo: '3600€', stato: 'Vedi Viaggio >', posti: 2},
]);

const viaggiFiltrati = computed(() => {
 return viaggi.value.filter(viaggio => viaggio.mese === meseSelezionato.value);
});

const cambiaMese = (nuovoMese) => {
 meseSelezionato.value = nuovoMese;
};
</script>

<template>
 <div class="ViaggiDisponibili-wrapper">
   
   <header class="fascia-foto">
     <div class="overlay-testo">
       <h1 class="fascia-titolo">PROSSIME PARTENZE</h1>
       <p class="sottotitolo-header">
         WebVoyagers ti offre viaggi organizzati verso destinazioni poco conosciute, creando insieme un itinerario personalizzato. 
         Unisci a noi per un'esperienza indimenticabile. Prenota il tuo viaggio e vivi l'avventura dei tuoi sogni.
       </p>
     </div>
   </header>

   <main class="contenuto-principale">
     
     <section class="mesi-container">
       <button
         v-for="mese in mesi" 
         :key="mese" 
         @click="cambiaMese(mese)"
         :class="['btn-mese', { 'selezionato': mese === meseSelezionato }]"
       >
         {{ mese }}
       </button>
     </section>

     <section class="lista-viaggi">
       <div v-if="viaggiFiltrati.length === 0" class="nessun-viaggio">
         Nessun viaggio in programma per {{ meseSelezionato }}.
       </div>

       <div v-for="viaggio in viaggiFiltrati" :key="viaggio.id" class="riga-viaggio">
         <div class="colonna-date">
           <span class="periodo">{{ viaggio.periodo }}</span>
           <span class="data-esatta">{{ viaggio.data }}</span>
         </div>

         <div class="colonna-destinazione">
           <strong>{{ viaggio.destinazione }}</strong>
         </div>

         <div class="colonna-prezzo">
           <strong>{{ viaggio.prezzo }}</strong>
         </div>

         <div class="colonna-info">
           <span v-if="viaggio.posti > 0">Posti rimasti a questo prezzo: <strong style="color: #d81b60;">{{ viaggio.posti }}</strong></span>
         </div>

         <div class="colonna-azione">
           <button v-if="viaggio.stato === 'sold out'" class="btn-soldout">sold out</button>
           <span v-else-if="viaggio.stato === 'no sito'" class="testo-nosito">no sito</span>
           <button v-else class="btn-vediviaggio">{{ viaggio.stato }}</button>
         </div>
       </div>
     </section>
   </main>
 </div>
</template>

<style scoped>
/* 1. Abbiamo rimosso la foto da qui: ora la pagina torna bianca/grigia fuori dall'header */
.ViaggiDisponibili-wrapper {
  background-color: #f9f9f9; 
  min-height: 100vh;
  width: 100%;
}

/* 2. Abbiamo messo la foto SOLO nel riquadro del titolo */
.fascia-foto {
  width: 100%;
  height: 60vh; 
  background-image: url('/sfondo.jpg'); 
  background-size: cover;
  background-position: center;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.overlay-testo {
  background-color: rgba(0, 0, 0, 0);   
  padding: 40px;
  width: 100%;
  color: white;
}

/* Abbiamo forzato il titolo su una riga sola */
.fascia-titolo {
  font-size: 4rem;
  font-weight: bold;
  letter-spacing: 5px;
  margin-bottom: 20px;
  text-transform: uppercase;
  white-space: nowrap; 
}

/* Abbiamo allungato la descrizione orizzontalmente */
.sottotitolo-header {
  font-size: 1.2rem;
  max-width: 1100px; 
  margin: 0 auto; 
  line-height: 1.6;
}

.contenuto-principale {
  max-width: 1400px; 
  margin: 0 auto;
  padding: 40px 20px;
}

/* I mesi restano tutti belli lunghi in fila */
.mesi-container {
  display: flex;
  flex-wrap: nowrap; 
  overflow-x: auto; 
  gap: 15px;
  justify-content: space-between;
  margin-bottom: 50px;
  padding-bottom: 10px;
}

.btn-mese {
  background-color: white;
  border: 1px solid #ccc;
  border-radius: 25px;
  padding: 10px 20px;
  cursor: pointer;
  white-space: nowrap; 
  font-size: 0.95rem;
  min-width: 100px;
  transition: 0.3s;
}

.btn-mese.selezionato {
  background-color: #00c4b4;
  color: white;
  border-color: #00c4b4;
  font-weight: bold;
}

.riga-viaggio {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 25px 0;
  border-bottom: 1px solid #eee;
}

.colonna-destinazione { font-size: 1.2rem; flex: 2; }
.colonna-prezzo { font-size: 1.1rem; flex: 1; text-align: center;}
.colonna-info { flex: 2; text-align: center;}

.btn-vediviaggio {
  background-color: #d81b60;
  color: white;
  padding: 12px 25px;
  border-radius: 30px;
  border: none;
  font-weight: bold;
  cursor: pointer;
}
</style>
