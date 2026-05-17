<script setup>
import { RouterLink } from "vue-router"

/* --- PAGINA DI ERRORE 404 --- */
// Abbiamo creato questa pagina per gestire sia gli URL inesistenti (rotta catch-all)
// sia le ricerche che non trovano risultati (es. mese+destinazione non disponibile).
</script>

<template>
  <div class="error-wrapper">
    <div class="error-container">
      <h1 class="error-title">404</h1>
      <h2>Ops! Pagina non trovata</h2>
      <p>
        La pagina che stai cercando non esiste o il viaggio scelto non è disponibile.
        Forse abbiamo cambiato indirizzo, o forse questo viaggio è ancora in fase di preparazione!
      </p>
      <RouterLink to="/" class="btn-torna">← Torna alla home</RouterLink>
    </div>
  </div>
</template>

<style scoped>
.error-wrapper {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #00c4b4 0%, #00897b 100%);
  padding: 20px;
}

.error-container {
  max-width: 600px;
  background: white;
  padding: 50px 40px;
  border-radius: 20px;
  box-shadow: 0 20px 50px rgba(0,0,0,0.2);
  text-align: center;
}

.error-title {
  font-size: 6rem;
  color: #d81b60;
  margin: 0;
  font-weight: 900;
  line-height: 1;
}

.error-container h2 {
  color: #00897b;
  margin: 20px 0;
  font-size: 1.8rem;
}

.error-container p {
  color: #555;
  line-height: 1.6;
  margin-bottom: 30px;
}

.btn-torna {
  display: inline-block;
  background: linear-gradient(135deg, #00c4b4 0%, #00897b 100%);
  color: white;
  padding: 14px 32px;
  border-radius: 50px;
  text-decoration: none;
  font-weight: bold;
  transition: transform 0.2s, box-shadow 0.3s;
  box-shadow: 0 6px 15px rgba(0,0,0,0.15);
}

.btn-torna:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
}

@media (max-width: 600px) {
  .error-title { font-size: 4rem; }
  .error-container { padding: 35px 25px; }
}
</style>
