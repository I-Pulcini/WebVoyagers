<script setup>
import { ref, computed } from 'vue';

const mesi = ['Gennaio','Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];
const meseSelezionato = ref('Gennaio');

const viaggi = ref([
  { id: 1, mese: 'Gennaio', periodo: 'GENNAIO: ', data: '11-16 ', destinazione: ' >TROMSO', prezzo: '2700€', stato: 'in arrivo', posti: 12},
  { id: 2, mese: 'Febbraio', periodo: 'FEBBRAIO: ', data: '13-21 ', destinazione: ' PUERTO RICO', prezzo: '3300€', stato: 'in arrivo ', posti: 10},
  { id: 3, mese: 'Marzo', periodo: 'MARZO: ', data: '01-11 ', destinazione: ' GIAMAICA', prezzo: '3500€', stato: 'in arrivo', posti: 0},
  { id: 4, mese: 'Aprile', periodo: 'APRILE: ', data: '18-26 ', destinazione: ' VIETNAM', prezzo: '3300€', stato: 'in arrivo', posti: 0},
  { id: 5, mese: 'Maggio', periodo: 'MAGGIO: ', data: '25-04 ', destinazione: ' KENYA', prezzo: '2800€', stato: 'in arrivo', posti: 0},
  { id: 6, mese: 'Giugno', periodo: 'GIUGNO: ', data: '19-27 ', destinazione: ' TURCHIA', prezzo: '1800€', stato: 'in arrivo', posti: 0},
  { id: 7, mese: 'Luglio', periodo: 'LUGLIO-AGOSTO: ', data: '21-05 ', destinazione: ' INDONESIA', prezzo: '4200€', stato: 'in arrivo', posti: 0},
  { id: 8, mese: 'Agosto', periodo: 'AGOSTO: ', data: '08-18 ', destinazione: ' TENERIFE', prezzo: '1900€', stato: 'in arrivo', posti: 0},
  { id: 9, mese: 'Settembre', periodo: 'SETTEMBRE-OTTOBRE: ', data: '29-07 ', destinazione: ' GIORDANIA', prezzo: '3100€', stato: 'in arrivo', posti: 0},
  { id: 10, mese: 'Ottobre', periodo: 'OTTOBRE-NOVEMBRE: ', data: '30-07 ', destinazione: ' IRAQ', prezzo: '3800€', stato: 'in arrivo', posti: 0},
  { id: 11, mese: 'Novembre', periodo: 'NOVEMBRE: ', data: '03-13 ', destinazione: ' CINA', prezzo: '4400€', stato: 'in arrivo', posti: 0},
  { id: 12, mese: 'Dicembre', periodo: 'DICEMBRE-GENNAIO: ', data: '22-05 ', destinazione: ' GIAPPONE', prezzo: '5200€', stato: 'in arrivo', posti: 0},
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

    <header class="fascia-foto">
      <div class="overlay-testo">
        <h1 class="fascia-titolo">VIAGGI SOLD OUT</h1>
        <p class="sottotitolo-header">
          Queste mete non sono più disponibili, torneranno al più presto!
          Nel frattempo, scopri la meta perfetta per te tra i viaggi a disposizione.
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

          <div class="colonna-info"></div>

          <div class="colonna-azione">
            <button class="btn-soldout">SOLD OUT</button>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.ViaggiSoldOut-wrapper,
.ViaggiSoldOut-wrapper * {
  box-sizing: border-box;
}

.ViaggiSoldOut-wrapper {
  background-color: #f9f9f9;
  min-height: 100vh;
  width: 100%;
  font-family: sans-serif;
  overflow-x: hidden;
}

/* Fascia foto a tutta larghezza */
.fascia-foto {
  width: 100%;
  height: 70vh;
  background-image: url('/Sfondo2.jpg');
  background-size: cover;
  background-position: center;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

/* Sfumatura scura in alto, per far risaltare il menu hamburger */
.fascia-foto::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 120px;
  background: linear-gradient(to bottom, rgba(0,0,0,0.35), rgba(0,0,0,0));
  pointer-events: none;
  z-index: 1;
}

.overlay-testo {
  padding: 40px 20px;
  width: 100%;
  color: white;
  position: relative;
  z-index: 2;
}

.fascia-titolo {
  font-size: clamp(2rem, 5vw, 4rem);
  font-weight: bold;
  letter-spacing: 5px;
  margin-bottom: 20px;
  text-transform: uppercase;
  white-space: nowrap;
  text-shadow: 2px 2px 8px rgba(0,0,0,0.5);
}

.sottotitolo-header {
  font-size: clamp(0.9rem, 1.3vw, 1.2rem);
  max-width: 1100px;
  margin: 0 auto;
  line-height: 1.6;
  text-shadow: 1px 1px 4px rgba(0,0,0,0.5);
}

.contenuto-principale {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 5%;
}

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
  gap: 15px;
}

.colonna-date {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.periodo {
  font-size: 0.85rem;
  color: #999;
  text-transform: uppercase;
}

.data-esatta {
  font-size: 1.1rem;
  color: #333;
  font-weight: bold;
}

.colonna-destinazione {
  flex: 2;
  font-size: 1.2rem;
  padding-left: 20px;
}

.colonna-prezzo {
  flex: 1;
  font-size: 1.1rem;
  text-align: center;
  color: #444;
}

.colonna-info {
  flex: 2;
  text-align: center;
}

.colonna-azione {
  flex: 1;
  display: flex;
  justify-content: flex-end;
}

.btn-soldout {
  background-color: transparent;
  color: #d81b60;
  border: 2px solid #d81b60;
  padding: 12px 25px;
  border-radius: 30px;
  font-size: 0.95rem;
  font-weight: bold;
  letter-spacing: 2px;
  cursor: default;
}

.nessun-viaggio {
  text-align: center;
  padding: 60px;
  font-size: 1.1rem;
  color: #bbb;
  font-style: italic;
}

@media (max-width: 768px) {
  .fascia-foto {
    height: 50vh;
  }
  .fascia-titolo {
    letter-spacing: 2px;
    white-space: normal;
  }
  .riga-viaggio {
    flex-wrap: wrap;
  }
}
</style>
