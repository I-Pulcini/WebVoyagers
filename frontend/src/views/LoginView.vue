<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Variabili di stato (Reattive)
const isLoginMode = ref(true) // true = mostra Login, false = mostra Registrazione
const username = ref('')
const email = ref('')
const password = ref('')
const messaggio = ref('') // Per mostrare messaggi di errore o successo

// Funzione per passare da Login a Registrazione e viceversa
const toggleMode = () => {
  isLoginMode.value = !isLoginMode.value
  messaggio.value = ''
  password.value = ''
}

// Funzione chiamata al click del pulsante Submit
const gestisciSubmit = async () => {
  // Decidiamo quale URL chiamare in base alla modalità
  const url = isLoginMode.value ? '/api/login' : '/api/register'
  
  // Prepariamo i dati da inviare al server
  const payload = isLoginMode.value 
    ? { email: email.value, password: password.value }
    : { username: username.value, email: email.value, password: password.value }

  try {
    // Effettuiamo la chiamata POST al server (grazie al Proxy, andrà sulla porta 3000)
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    const data = await response.json()

    if (response.ok) {
      // Se va tutto bene, mostriamo il messaggio di successo del server
      messaggio.value = data.message
      
      if (isLoginMode.value) {
        // Se era un login, aspettiamo 1 secondo e lo mandiamo alla Home
        setTimeout(() => router.push('/'), 1000)
      } else {
        // Se era una registrazione, lo passiamo alla schermata di login
        setTimeout(() => {
          isLoginMode.value = true
          messaggio.value = 'Ora puoi effettuare il login!'
        }, 1500)
      }
    } else {
      // Se c'è un errore (es. password errata), mostriamo l'errore del server
      messaggio.value = data.error
    }
  } catch (err) {
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