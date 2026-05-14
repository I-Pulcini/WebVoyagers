<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { userStore } from '../stores/userStore'

/* --- VUE ROUTER --- */
// Abbiamo importato il router per poter spostare l'utente da una pagina all'altra dopo il login
const router = useRouter()

/* --- VARIABILI REATTIVE --- */
// Abbiamo creato la variabile che decide se mostrare il form di Login o quello di Registrazione
const isLoginMode = ref(true)
// Abbiamo creato le variabili reattive che si legano ai campi del form tramite v-model
const username = ref('')
const email = ref('')
const password = ref('')
// Abbiamo creato la variabile che mostra messaggi di errore o successo all'utente
const messaggio = ref('')

/* --- FUNZIONI --- */
// Abbiamo creato la funzione che cambia tra modalità Login e Registrazione
const toggleMode = () => {
  isLoginMode.value = !isLoginMode.value
  messaggio.value = ''
  password.value = ''
}

// Abbiamo creato la funzione asincrona chiamata quando l'utente preme Submit
const gestisciSubmit = async () => {
  // Abbiamo deciso quale URL chiamare in base alla modalità (login o registrazione)
  const url = isLoginMode.value ? '/api/login' : '/api/register'
  
  // Abbiamo preparato i dati da inviare al server in base alla modalità
  const payload = isLoginMode.value 
    ? { email: email.value, password: password.value }
    : { username: username.value, email: email.value, password: password.value }

  try {
    // Abbiamo effettuato la chiamata POST al server includendo i cookie di sessione
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',  // Abbiamo aggiunto questa opzione per inviare e ricevere i cookie di sessione
      body: JSON.stringify(payload)
    })

    // Abbiamo trasformato la risposta JSON ricevuta dal server in oggetto JavaScript
    const data = await response.json()

    if (response.ok) {
      // Abbiamo mostrato il messaggio di successo restituito dal backend
      messaggio.value = data.message
      
      if (isLoginMode.value) {
        // Abbiamo salvato i dati dell'utente nello store globale così tutta l'app sa che è loggato
        userStore.setUser(data.userId, data.username)
        
        // Abbiamo aspettato 1 secondo per far leggere il messaggio, poi reindirizzato alla home
        setTimeout(() => router.push('/'), 1000)
      } else {
        // Abbiamo gestito il caso registrazione: passiamo automaticamente alla schermata di login
        setTimeout(() => {
          isLoginMode.value = true
          messaggio.value = 'Ora puoi effettuare il login!'
        }, 1500)
      }
    } else {
      // Abbiamo mostrato il messaggio di errore restituito dal backend (es. password sbagliata)
      messaggio.value = data.error
    }
  } catch (err) {
    // Abbiamo gestito gli errori di rete che impediscono la comunicazione col server
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

.login-box {
  background-color: rgba(255, 255, 255, 0.95);
  padding: 40px;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.2);
  width: 100%;
  max-width: 400px;
  text-align: center;
}

.login-box h2 {
  color: #d35400;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 15px;
  text-align: left;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.form-group input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
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

.btn-submit:hover {
  background-color: #e67e22;
}

.toggle-text {
  margin-top: 20px;
  font-size: 14px;
}

.toggle-link {
  color: #d35400;
  cursor: pointer;
  font-weight: bold;
  text-decoration: underline;
}

.messaggio-alert {
  background-color: #f8d7da;
  color: #721c24;
  padding: 10px;
  border-radius: 5px;
  margin-bottom: 15px;
  font-weight: bold;
}
</style>