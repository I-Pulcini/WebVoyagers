<script setup>
import { ref } from 'vue'  
import { useRouter } from 'vue-router' 
import { userStore } from '../stores/userStore'  


const router = useRouter()  


const isLoginMode = ref(true)  

const username = ref('')
const email = ref('')
const password = ref('')
const messaggio = ref('')   
const mostraPassword = ref(false)  



const toggleMode = () => {  
  isLoginMode.value = !isLoginMode.value  
  messaggio.value = '' 
  password.value = ''  
}

const gestisciSubmit = async () => {   
  
  const url = isLoginMode.value ? '/api/login' : '/api/register'  
  
  
  const payload = isLoginMode.value 
    ? { email: email.value, password: password.value }  
    : { username: username.value, email: email.value, password: password.value }  

  try {
   
    const response = await fetch(url, {   
      method: 'POST',   
      headers: { 'Content-Type': 'application/json' },  
      credentials: 'include', 
      body: JSON.stringify(payload)  
    })

  
    const data = await response.json()    
    if (response.ok) {   
      messaggio.value = data.message   
      
      if (isLoginMode.value) {  
       
        userStore.setUser(data.userId, data.username)  
        
        setTimeout(() => router.push('/'), 1000)

// quando l' utente decide di accedere o registrarsi al nostro sito web, le opzioni sono due. Se entriamo nel file LoginView.vue, possiamo notare che abbiamo la funzione fetch(url). Qui usiamo la parola chiave await che congela momentaneamente l'esecuzione di questa funzione all'interno del componente, aspettando che il server risponda, trattandosi di un'operazione asincrona di rete. Questo URL dipende dallo stato dell'utente: se l'utente è già registrato nei nostri archivi, l'URL punterà a /api/login, portandoci all'API numero 4 del server. Se invece non ha mai creato un account, punterà a /api/register.Analizziamo il caso in cui l'utente sia già registrato e debba semplicemente fare l'accesso.
//Il client invia questa richiesta tramite fetch. Quando questo pacchetto arriva al server nel file server.js, l'API 4 intercetta i dati. All'interno dell'oggetto req.body (il Request Body) troviamo l'email e la password inserite in chiaro nel form. A questo punto, il server comunica direttamente e manualmente con il database PostgreSQL, in particolare con la tabella utenti, per cercare la riga in cui l'email corrisponde a quella ricevuta. Se il database restituisce zero righe e non trova nessuna corrispondenza, l'API si interrompe restituendo un errore. Se invece l'utente viene trovato, passiamo al controllo della password. La password digitata nel form è in chiaro, mentre quella memorizzata nel database è una stringa cifrata irreversibile. Per confrontarle, utilizziamo la funzione bcrypt.compare() che verifica se la password digitata coincide con l'hash del database. Se il controllo fallisce, il server restituisce un errore.
// Se invece il controllo ha successo, il login va a buon fine ed entra in gioco il middleware dell'API 2 per la gestione dello stato: valorizzando le proprietà req.session.userId, req.session.username e req.session.isAdmin, il middleware genera una sessione persistente sul database e crea un cookie crittografato contenente l'ID di sessione. Tutte queste informazioni di profilo vengono incapsulate dentro res.json() in formato JSON. Questo pacchetto, che contiene il messaggio di successo, l'ID, lo username e il flag admin, viene rispedito indietro insieme al cookie appena generato dal middleware.
// Il pacchetto viaggia dal server al client sotto forma di Response HTTP. A questo punto si riapre la logica di LoginView.vue: il codice riceve la risposta, controlla che sia andata a buon fine (response.ok), estrae i dati e invoca lo store globale per salvare l'ID e lo username dell'utente. Infine, dopo un timer di 1 secondo inserito per dare il tempo di leggere il messaggio di successo, il router reindirizza automaticamente l'utente alla Homepage
     
      } else {  
       
        setTimeout(() => {  
          isLoginMode.value = true
          messaggio.value = 'Ora puoi effettuare il login!'
        }, 1500)

        // Nel file login view.vue abbiamo una chiamata a fetch con scritto una variabile url. Questa variabile url dipende se l'utente ha fatto il login o se l'utente non l'ha mai fatto. Se l'utente non ha mai fatto il login, allora andiamo a finire nell'api register e quindi nell'api 3. Quindi abbiamo un collegamento client server. Il client invia nel body della richiesta il pacchetto JSON con i dati compilati, quindi username, email e password. E oltre al body abbiamo anche il cookie che è stato aggiunto dal browser. Successivamente, quando arriverà al server questo pacchetto, l'api 3 prende la password, la la cripta, trasformandola in password_hash e inserirà manualmente al database l'username, email e password cifrata. Se il database accetterà il nuovo utente, il server creerà una variabile response con stato 201 e inserisce in rest.json solo il messaggio di di successo, nient'altro, né l'username, né l'email, né la password, solo il messaggio di successo. Questo pacchetto è JSON con il messaggio di successo tornerà indietro al client, il pacchetto quindi tornerà in login view.vue sotto forma di response, se il response è ok, allora vuol dire che ci siamo registrati con successo e dopo 1,5 secondi cambierà automaticamente la visualizzazione passando in modalità login
      }
    } else {  
   
      messaggio.value = data.error   
    }
  } catch (err) {

    messaggio.value = "Errore di connessione al server."   
  }
}
</script>

<template>
  <div class="login-wrapper">
    <div class="login-box">  //riguardo bianco che contiene tutti i campi
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
              //creo l'occhio aperto qui
              <svg v-if="mostraPassword" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
             //occhio chiuso
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
        </span> //contenitore generico in-line, non va a capo
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
  padding-right: 42px;  
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
