<script setup>
// Abbiamo importato 'ref' per gestire la reattività dei campi del form
import { ref } from 'vue'
// Abbiamo importato 'useRouter' per poter reindirizzare l'utente alla Home dopo il login
import { useRouter } from 'vue-router'

// Abbiamo inizializzato il router per gestire gli spostamenti tra le pagine
const router = useRouter()

/* COMPOSITION API: Abbiamo creato delle variabili reattive per monitorare lo stato del form. 
   Grazie a ref(), ogni lettera digitata dall'utente viene memorizzata istantaneamente. */
const isLoginMode = ref(true) // Abbiamo usato questo booleano per scambiare tra vista Login e Registrazione
const username = ref('') // Qui salviamo lo username (usato solo in registrazione)
const email = ref('') // Qui salviamo l'email per l'autenticazione
const password = ref('') // Qui salviamo la password digitata
const messaggio = ref('') // Abbiamo creato questa variabile per mostrare avvisi di errore o successo all'utente

// Abbiamo definito questa funzione per pulire i campi e cambiare la modalità del form
const toggleMode = () => {
  // Abbiamo invertito il valore (se era login diventa registrazione e viceversa)
  isLoginMode.value = !isLoginMode.value
  // Abbiamo resettato i messaggi e la password per sicurezza quando si cambia modalità
  messaggio.value = ''
  password.value = ''
}

// Abbiamo creato la funzione principale (asincrona) che gestisce l'invio dei dati al server
const gestisciSubmit = async () => {
  // Abbiamo deciso dinamicamente a quale endpoint del server inviare i dati
  const url = isLoginMode.value ? '/api/login' : '/api/register'
  
  // Abbiamo preparato l'oggetto (payload) con i dati necessari in base alla modalità scelta
  const payload = isLoginMode.value 
    ? { email: email.value, password: password.value }
    : { username: username.value, email: email.value, password: password.value }

  // Abbiamo aperto un blocco try-catch per gestire la comunicazione con il Back-end
  try {
    // Abbiamo effettuato la chiamata POST inviando i dati in formato JSON
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload) // Abbiamo convertito l'oggetto JavaScript in stringa JSON
    })

    // Abbiamo aspettato e convertito la risposta del server in un oggetto leggibile
    const data = await response.json()

    // Abbiamo controllato se la risposta del server è positiva (status 200 o 201)
    if (response.ok) {
      // Abbiamo mostrato all'utente il messaggio di successo restituito dal server
      messaggio.value = data.message
      
      if (isLoginMode.value) {
        // Se l'utente ha appena fatto il login, abbiamo impostato un timer di 1 secondo per mandarlo alla Home
        setTimeout(() => router.push('/'), 1000)
      } else {
        // Se l'utente si è appena registrato, dopo 1,5 secondi lo riportiamo automaticamente al Login
        setTimeout(() => {
          isLoginMode.value = true
          messaggio.value = 'Ora puoi effettuare il login!'
        }, 1500)
      }
    } else {
      // Se il server risponde con un errore (es. password errata), lo mostriamo nell'alert
      messaggio.value = data.error
    }
  } catch (err) {
    // Abbiamo previsto un messaggio di riserva nel caso in cui il server fosse spento o irraggiungibile
    messaggio.value = "Errore di connessione al server."
  }
}
</script>

<template>
  <div class="login-wrapper">
    <div class="login-box">
      <h2>{{ isLoginMode ? 'Bentornato!' : 'Crea un Account' }}</h2>
      
      <p v-if="messaggio" class="messaggio-alert">{{ messaggio }}</p>

      <form @submit.prevent="gestisciSubmit">
        <div class="form-group" v-if="!isLoginMode">
          <label>Username</label>
          <input type="text" v-model="username" required placeholder="Scegli uno username">
        </div>

        <div class="form-group">
          <label>Email</label>
          <input type="email" v-model="email" required placeholder="Inserisci la tua email">
        </div>

        <div class="form-group">
          <label>Password</label>
          <input type="password" v-model="password" required placeholder="Inserisci la password">
        </div>

        <button type="submit" class="btn-submit">
          {{ isLoginMode ? 'Accedi' : 'Registrati' }}
        </button>
      </form>

      <p class="toggle-text">
        {{ isLoginMode ? 'Non hai un account?' : 'Hai già un account?' }}
        <span @click="toggleMode" class="toggle-link">
          {{ isLoginMode ? 'Registrati qui' : 'Accedi qui' }}
        </span>
      </p>
    </div>
  </div>
</template>

<style scoped>
/* Abbiamo usato l'attributo scoped per fare in modo che questi stili non influenzino le altre pagine */
.login-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-image: url('/web.jpg');
  background-size: cover;
  background-position: center;
  padding-top: 60px;
}

/* Abbiamo stilizzato il box del login per renderlo moderno, con angoli arrotondati e ombra */
.login-box {
  background-color: rgba(255, 255, 255, 0.95);
  padding: 40px;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.2);
  width: 100%;
  max-width: 400px;
  text-align: center;
}

/* Abbiamo scelto un colore arancione scuro per richiamare i toni caldi del nostro sito di viaggi */
.login-box h2 {
  color: #d35400;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 15px;
  text-align: left;
}

.btn-submit {
  width: 100%;
  padding: 12px;
  background-color: #d35400;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
  margin-top: 10px;
}

/* Abbiamo aggiunto un effetto di hover per rendere il pulsante più interattivo */
.btn-submit:hover {
  background-color: #e67e22;
}

.messaggio-alert {
  /* Abbiamo scelto un colore rosso chiaro per far risaltare gli avvisi o gli errori */
  background-color: #f8d7da;
  color: #721c24;
  padding: 10px;
  border-radius: 5px;
  margin-bottom: 15px;
  font-weight: bold;
}
</style>
