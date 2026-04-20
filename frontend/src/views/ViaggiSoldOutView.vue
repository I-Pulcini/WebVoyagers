<script setup>
import { ref, computed } from 'vue';

const mesi = ['Gennaio','Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];
const meseSelezionato = ref('Gennaio');

const viaggi = ref([
 { id: 1, mese: 'Gennaio', periodo: 'GENNAIO', data: '09-17', destinazione: 'ESTORIA', prezzo: '1700€', stato: 'sold out', posti: 0},
 { id: 2, mese: 'Febbraio', periodo: 'FEBBRAIO', data: '13-21', destinazione: 'PUERTO RICO', prezzo: '3300€', stato: 'sold out', posti: 0},
 { id: 3, mese: 'Marzo', periodo: 'MARZO', data: '01-11', destinazione: 'GIAMAICA', prezzo: '3500€', stato: 'sold out', posti: 0},
 { id: 4, mese: 'Aprile', periodo: 'APRILE', data: '18-26', destinazione: 'VIETNAM', prezzo: '3300€', stato: 'sold out', posti: 0},
 { id: 5, mese: 'Maggio', periodo: 'OTTOBRE-NOVEMBRE', data: '25-04', destinazione: 'KENYA', prezzo: '2800€', stato: 'sold out', posti: 0},
 { id: 6, mese: 'Giugno', periodo: 'GIUGNO', data: '19-27', destinazione: 'TURCHIA', prezzo: '1800€', stato: 'sold out', posti: 0},
 { id: 7, mese: 'Luglio', periodo: 'LUGLIO-AGOSTO', data: '21-05', destinazione: 'INDONESIA', prezzo: '4200€', stato: 'sold out', posti: 0},
 { id: 8, mese: 'Agosto', periodo: 'AGOSTO', data: '08-18', destinazione: 'TENERIFE', prezzo: '1900€', stato: 'sold out', posti: 0},
 { id: 9, mese: 'Settembre', periodo: 'SETTEMBRE-OTTOBRE', data: '29-07', destinazione: 'GIORDANIA', prezzo: '3100€', stato: 'sold out', posti: 0},
 { id: 10, mese: 'Ottobre', periodo: 'OTTOBRE-NOVEMBRE', data: '30-07', destinazione: 'IRAQ', prezzo: '3800€', stato: 'sold out', posti: 0},
 { id: 11, mese: 'Novembre', periodo: 'NOVEMBRE', data: '03-13', destinazione: 'CINA', prezzo: '4400€', stato: 'sold out', posti: 0},
 { id: 12, mese: 'Dicembre', periodo: 'DICEMBRE-GENNAIO', data: '22-05', destinazione: 'GIAPPONE', prezzo: '5200€', stato: 'sold out', posti: 0},
]);

const viaggiFiltrati = computed(() => {
 return viaggi.value.filter(viaggio => viaggio.mese === meseSelezionato.value);
});

const cambiaMese = (nuovoMese) => {
 meseSelezionato.value = nuovoMese;
};
</script>

<template>
  <div class="ViaggiSoldOut-wrapper">
    
    <header class="header-pulito">
      <h1 class="titolo-orizzontale">Viaggi Sold Out</h1>
      <p class="testo-descrizione">
        Queste mete non sono più disponibili, torneranno al più presto!!!<br>
        Ricerca la meta perfetta per te tra i viaggi a disposizione.
      </p>
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
          Nessun viaggio sold out registrato per {{ meseSelezionato }}.
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
             </div>

          <div class="colonna-azione">
            <button class="btn-soldout">SOLD OUT</button>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
/* SFONDO BIANCO TOTALE */
.ViaggiSoldOut-wrapper {
  background-color: white;
  min-height: 100vh;
  font-family: sans-serif;
}

.header-pulito {
  padding: 80px 20px 40px 20px;
  text-align: center;
}

.titolo-orizzontale {
  font-size: 3rem;
  color: #333;
  margin-bottom: 20px;
}

.testo-descrizione {
  font-size: 1.1rem;
  color: #666;
  max-width: 800px;
  margin: 0 auto;
  line-height: 1.6;
}

.contenuto-principale {
  max-width: 1100px;
  margin: 0 auto;
  padding: 20px;
}

.mesi-container {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
  margin-bottom: 60px;
}

.btn-mese {
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 25px;
  padding: 8px 18px;
  cursor: pointer;
  transition: 0.3s;
}

.btn-mese.selezionato {
  background-color: #00c4b4;
  color: white;
  border-color: #00c4b4;
  font-weight: bold;
}

/* LISTA VIAGGI */
.riga-viaggio {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 25px 0;
  border-bottom: 1px solid #f0f0f0;
}

.colonna-date {
  display: flex;
  flex-direction: column;
}

.periodo { font-size: 0.8rem; color: #999; text-transform: uppercase; }
.data-esatta { font-size: 1.4rem; color: #333; }

.colonna-destinazione { flex: 2; padding-left: 40px; font-size: 1.2rem; }
.colonna-prezzo { flex: 1; font-size: 1.1rem; color: #444; }
.colonna-info { flex: 2; }

.btn-soldout {
  background-color: transparent;
  color: #d81b60;
  border: 2px solid #d81b60;
  padding: 10px 20px;
  border-radius: 5px;
  font-weight: bold;
  letter-spacing: 1px;
}

.nessun-viaggio {
  text-align: center;
  padding: 60px;
  color: #bbb;
  font-style: italic;
}
</style>
