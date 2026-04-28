<script setup>
import { ref, computed } from 'vue';

const mesi = ['Gennaio','Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];
const meseSelezionato = ref('Gennaio');

const viaggi = ref([
 { id: 1, mese: 'Gennaio', periodo: 'GENNAIO: ', data: '09-17 ', destinazione: ' ESTORIA', prezzo: '1700€', stato: 'sold out', posti: 0},
 { id: 2, mese: 'Febbraio', periodo: 'FEBBRAIO: ', data: '13-21 ', destinazione: ' PUERTO RICO', prezzo: '3300€', stato: 'sold out', posti: 0},
 { id: 3, mese: 'Marzo', periodo: 'MARZO: ', data: '01-11 ', destinazione: ' GIAMAICA', prezzo: '3500€', stato: 'sold out', posti: 0},
 { id: 4, mese: 'Aprile', periodo: 'APRILE: ', data: '18-26 ', destinazione: ' VIETNAM', prezzo: '3300€', stato: 'sold out', posti: 0},
 { id: 5, mese: 'Maggio', periodo: 'OTTOBRE-NOVEMBRE: ', data: '25-04 ', destinazione: ' KENYA', prezzo: '2800€', stato: 'sold out', posti: 0},
 { id: 6, mese: 'Giugno', periodo: 'GIUGNO: ', data: '19-27 ', destinazione: ' TURCHIA', prezzo: '1800€', stato: 'sold out', posti: 0},
 { id: 7, mese: 'Luglio', periodo: 'LUGLIO-AGOSTO: ', data: '21-05 ', destinazione: ' INDONESIA', prezzo: '4200€', stato: 'sold out', posti: 0},
 { id: 8, mese: 'Agosto', periodo: 'AGOSTO: ', data: '08-18 ', destinazione: ' TENERIFE', prezzo: '1900€', stato: 'sold out', posti: 0},
 { id: 9, mese: 'Settembre', periodo: 'SETTEMBRE-OTTOBRE: ', data: '29-07 ', destinazione: ' GIORDANIA', prezzo: '3100€', stato: 'sold out', posti: 0},
 { id: 10, mese: 'Ottobre', periodo: 'OTTOBRE-NOVEMBRE: ', data: '30-07 ', destinazione: ' IRAQ', prezzo: '3800€', stato: 'sold out', posti: 0},
 { id: 11, mese: 'Novembre', periodo: 'NOVEMBRE: ', data: '03-13 ', destinazione: ' CINA', prezzo: '4400€', stato: 'sold out', posti: 0},
 { id: 12, mese: 'Dicembre', periodo: 'DICEMBRE-GENNAIO: ', data: '22-05 ', destinazione: ' GIAPPONE', prezzo: '5200€', stato: 'sold out', posti: 0},
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
     <div class= "overlay-testo">
      <h1 class="fascia-titolo">Viaggi Sold Out</h1>
      <p class="sottotesto-header">
        Queste mete non sono più disponibili, torneranno al più presto!!!<br>
        Ricerca la meta perfetta per te tra i viaggi a disposizione.
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
/* Applica il box-sizing a tutto dentro questo componente per evitare che i padding sfalsino le larghezze */
.ViaggiSoldOut-wrapper,
.ViaggiSoldOut-wrapper * {
  background-color: #f9f9f9; 
  min-height: 100vh;
  width: 100%;
}

/* SFONDO BIANCO TOTALE */
.ViaggiSoldOut-wrapper {
  background-color: white;
  min-height: 100vh;
  width: 100%;
  max-width: 100vw;
  font-family: sans-serif;
  overflow-x: hidden; /* Evita qualsiasi scroll orizzontale imprevisto della pagina */
}

.fascia-foto {
  width: 100%;
  height: 60vh; 
  background-image: url('/Sfondo2.jpg'); 
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

/* MESI IN UNA SOLA RIGA */
.mesi-container {
  display: flex;
  flex-wrap: nowrap; /* FORZA i bottoni a restare su una riga */
  gap: 15px;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 80px;
  overflow-x: auto; /* Se su schermi piccolissimi non entrano, si scrolleranno senza andare a capo */
  padding-bottom: 10px; /* Spazio per l'eventuale barra di scorrimento */
}

.btn-mese {
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 30px;
  padding: 15px 25px; /* Bottoni più grandi */
  cursor: pointer;
  transition: 0.3s;
  font-size: 1.2rem; /* Testo più grande */
  white-space: nowrap; /* Il testo del mese non va mai a capo */
  flex-grow: 1; /* Permette ai bottoni di estendersi uniformemente */
  text-align: center;
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
  padding: 35px 0; /* Riga più alta e ariosa */
  border-bottom: 1px solid #f0f0f0;
  width: 100%;
}

.colonna-date {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.periodo { font-size: 1rem; color: #999; text-transform: uppercase; } /* Ingrandito */
.data-esatta { font-size: 2rem; color: #333; font-weight: bold; } /* Ingrandito e marcato */

.colonna-destinazione { 
  flex: 2; 
  padding-left: 20px; 
  font-size: 1.8rem; /* Destinazione più grande */
}

.colonna-prezzo { 
  flex: 1; 
  font-size: 1.6rem; /* Prezzo più grande */
  color: #444; 
  text-align: center; 
}

.colonna-info { 
  flex: 1; 
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
  padding: 15px 30px; /* Tasto più grande */
  border-radius: 8px; /* Leggermente più squadrato per dargli stabilità */
  font-size: 1.2rem; /* Font del tasto più grande */
  font-weight: bold;
  letter-spacing: 2px;
}

.nessun-viaggio {
  text-align: center;
  padding: 80px;
  font-size: 1.5rem;
  color: #bbb;
  font-style: italic;
  width: 100%;
}
</style>
