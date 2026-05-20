<script setup>
import { ref } from 'vue'  //importo ref da Vue, ci serve per creare variabili reattive, che cambiano il lavoro
import { useRouter } from 'vue-router'  //importiamo lo strumento di Router Vue di far viaggere l'utente tra le diverse pagine del sito usando il codice JavaScript
import { userStore } from '../stores/userStore'  // importiamo lo store globale dell'utente 


const router = useRouter()  //abbiamo salvato il router in una variabile reattiva cosi da poterlo usare


const isLoginMode = ref(true)  //una variabile reattiva di tipo booleano, se è true  HTML mostrerà il modulo di login. se è false mostrerà il modulo di registrazione

const username = ref('')
const email = ref('')
const password = ref('')
//abbiamo scritto 3 variabili vuote che quando l'utente le scriverà nelle caselle di testo di riempiranno
const messaggio = ref('')   //serve per stampare a schermo eventuali errori
const mostraPassword = ref(false)  //variabile reattiva booleana: se true mostra la password in chiaro, se false la nasconde con i pallini



const toggleMode = () => {   // Abbiamo creato la funzione che cambia tra modalità Login e Registrazione
  isLoginMode.value = !isLoginMode.value  //se è true diventa false e viceversa 
  messaggio.value = ''  //svuotiamo i vecchi messaggi
  password.value = ''   // Svuotiamo il campo della password
}

const gestisciSubmit = async () => {    // Abbiamo creato la funzione asincrona chiamata quando l'utente preme Accedi o Registrati
  
  const url = isLoginMode.value ? '/api/login' : '/api/register'  //se isLoginMode è vero,l'url da chiamare è /login altrimenti è /register
  
  
  const payload = isLoginMode.value //iniziamo la costruzione del pacchetto di dati da spedire tramite la rete
    ? { email: email.value, password: password.value }  // se stiamo nel Login i pacchetto avrà qeuste cose
    : { username: username.value, email: email.value, password: password.value }  //se stiamo in modalità Registrazione

  try {
   
    const response = await fetch(url, {   //await blocca l'esecuzione di questa funzione, aspettadno che il server risponda
      method: 'POST',   // è una chiamata di tipo post perche stimao inviando dati sicuri al server
      headers: { 'Content-Type': 'application/json' },  //stiamo avvisando il server Node.js che il pacco in formato JSON sta arrivando
      credentials: 'include',  // Abbiamo aggiunto questa opzione per inviare e ricevere i cookie di sessione
      body: JSON.stringify(payload)  //trasformaimo in una stringa il testo JSON pronta per viaggiare su internet
    })

  
    const data = await response.json()    // Abbiamo trasformato la risposta JSON ricevuta dal server in oggetto JavaScript

    if (response.ok) {   //se la chiamata è andata a buon fine 
      messaggio.value = data.message   //mostriamo a schermo il messaggio di successo mandato dal tuo file server.js
      
      if (isLoginMode.value) {  //se abbiamo fatto il Login
       
        userStore.setUser(data.userId, data.username)  //aggiorniamo il payload salvandoci ID e l'username dell'utente
        
        // Abbiamo aspettato 1 secondo per far leggere il messaggio, poi reindirizzato alla home
        setTimeout(() => router.push('/'), 1000)
      } else {  //altrimenti abbiamo fatto la registrazione
       
        setTimeout(() => {  //dopo 1,5 secondi cambiamo la visualizzazione passando al forma di login
          isLoginMode.value = true
          messaggio.value = 'Ora puoi effettuare il login!'
        }, 1500)
      }
    } else {  //se respond.ok è false allora ci sta un errore tipo che l'email è gia stata usata
   
      messaggio.value = data.error   
    }
  } catch (err) {

    messaggio.value = "Errore di connessione al server."   //salviamo un errore generico
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
          <div class="input-password-wrapper">
            <input
              :type="mostraPassword ? 'text' : 'password'"
              v-model="password"
              required
              placeholder="Inserisci la password"
            >
            <span class="occhio" @click="mostraPassword = !mostraPassword" :title="mostraPassword ? 'Nascondi password' : 'Mostra password'">
              <!-- occhio aperto -->
              <svg v-if="mostraPassword" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              <!-- occhio chiuso (sbarrato) -->
              <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
            </span>
          </div>
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
  background-image: url('/Socotra2.jpg');
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

.input-password-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-password-wrapper input {
  width: 100%;
  padding-right: 42px;  /* spazio per l'icona */
}

.occhio {
  position: absolute;
  right: 10px;
  cursor: pointer;
  color: #999;
  display: flex;
  align-items: center;
  transition: color 0.2s;
}

.occhio:hover {
  color: #d35400;
}

.occhio svg {
  width: 20px;
  height: 20px;
}
</style>
