// Abbiamo importato il modulo 'express' per creare l'architettura del nostro server web
const express = require('express');
// Abbiamo importato 'express-session' per gestire le sessioni e i cookie degli utenti
const session = require('express-session');
// Abbiamo collegato il gestore delle sessioni al database per salvarle in modo permanente
const pgSession = require('connect-pg-simple')(session);
// Abbiamo importato 'Pool' per gestire una coda di connessioni verso il database PostgreSQL
const { Pool } = require('pg');
// Abbiamo importato 'bcrypt' per gestire la crittografia delle password in modo sicuro
const bcrypt = require('bcrypt');

// Abbiamo inizializzato la nostra applicazione chiamandola 'app'
const app = express();
// Abbiamo definito la porta 3000 come punto di ascolto per il nostro Back-end
const port = 3000;

// Abbiamo configurato il server per interpretare automaticamente i dati in formato JSON
app.use(express.json());

// --- 1. CONNESSIONE AL DATABASE SUPABASE ---
// Abbiamo memorizzato l'URL di connessione fornito da Supabase per accedere al nostro database in cloud
// (Nota: in questa stringa va sostituito [YOUR-PASSWORD] con la password reale del database)
const LINK_DATABASE = "postgresql://postgres:Nkobjivhu26_@db.ctmkhhntdffknbgkvgsk.supabase.co:5432/postgres";

// Abbiamo creato un nuovo oggetto Pool passando la nostra stringa di connessione
const pool = new Pool({
    connectionString: LINK_DATABASE, // Abbiamo indicato al pool dove deve collegarsi fisicamente
});

// --- 2. CONFIGURAZIONE DELLE SESSIONI (Rif: Parte 1.pdf) ---
// Abbiamo attivato il sistema delle sessioni per permettere al sito di riconoscere gli utenti
app.use(session({
    // Abbiamo scelto di salvare le sessioni sul database invece che nella memoria RAM del server
    store: new pgSession({
        pool: pool, // Abbiamo passato il collegamento al database appena creato
        tableName: 'session' // Abbiamo indicato il nome esatto della tabella SQL che abbiamo preparato su Supabase
    }),
    // Abbiamo scelto una frase segreta per criptare i dati contenuti nei nostri cookie
    secret: 'chiave_segreta_webvoyagers_2026',
    // Abbiamo impostato 'resave' su false per evitare di risalvare la sessione se non ci sono state modifiche
    resave: false,
    // Abbiamo impostato 'saveUninitialized' su false per non creare sessioni vuote per gli utenti non loggati
    saveUninitialized: false,
    // Abbiamo stabilito che il login rimanga valido per 30 giorni consecutivi (espressi in millisecondi)
    cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 }
}));

// --- 3. API: REGISTRAZIONE ---
// Abbiamo creato una rotta POST per permettere agli utenti di registrarsi al nostro portale
app.post('/api/register', async (req, res) => {
    // Abbiamo estratto i dati username, email e password dal corpo della richiesta inviata da Vue
    const { username, email, password } = req.body;
    // Abbiamo iniziato un blocco try-catch per gestire eventuali errori durante l'operazione
    try {
        // Abbiamo criptato la password usando bcrypt con un fattore di costo pari a 10 per renderla sicura (Rif: Parte 1.pdf)
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Abbiamo eseguito la query SQL per inserire i dati del nuovo utente nel database
        await pool.query(
            // Abbiamo usato dei segnaposto ($1, $2, $3) per prevenire attacchi di tipo SQL Injection
            'INSERT INTO utenti (username, email, password_hash) VALUES ($1, $2, $3)',
            // Abbiamo passato i valori reali in un array che andranno a sostituire i segnaposto sopra
            [username, email, hashedPassword]
        );
        // Abbiamo inviato una risposta di successo con codice 201 indicando che l'utente è stato creato
        res.status(201).json({ message: "Utente registrato con successo!" });
    } catch (err) {
        // Abbiamo stampato l'errore in console per poter fare debug in caso di problemi
        console.error(err);
        // Abbiamo risposto con un codice 500 informando l'utente che qualcosa è andato storto
        res.status(500).json({ error: "Errore: Forse questa email è già registrata?" });
    }
});

// --- 4. API: LOGIN ---
// Abbiamo creato una rotta POST dedicata alla verifica delle credenziali d'accesso
app.post('/api/login', async (req, res) => {
    // Abbiamo recuperato l'email e la password inserite dall'utente nel form di login
    const { email, password } = req.body;
    // Abbiamo aperto un blocco try per gestire la ricerca dell'utente
    try {
        // Abbiamo cercato nel database l'utente che possiede l'email indicata
        const result = await pool.query('SELECT * FROM utenti WHERE email = $1', [email]);
        
        // Abbiamo controllato se il database ha restituito zero risultati (utente non esistente)
        if (result.rows.length === 0) {
            // Abbiamo risposto con errore 401 se l'email non è presente nei nostri archivi
            return res.status(401).json({ error: "Utente non trovato." });
        }

        // Abbiamo estratto il primo (e unico) utente trovato dalla lista dei risultati
        const user = result.rows[0];
        
        // Abbiamo confrontato la password digitata con quella criptata salvata nel database
        const match = await bcrypt.compare(password, user.password_hash);

        // Abbiamo verificato se il confronto tra le password ha avuto successo
        if (match) {
            // Abbiamo creato la sessione attiva salvando l'ID univoco dell'utente appena loggato
            req.session.userId = user.id;
            // Abbiamo salvato anche lo username nella sessione per poterlo mostrare nel menu di Vue
            req.session.username = user.username;
            // Abbiamo risposto inviando un messaggio di conferma e lo username al Front-end
            res.json({ message: "Login effettuato con successo!", username: user.username });
        } else {
            // Abbiamo risposto con errore 401 se la password non corrisponde a quella salvata
            res.status(401).json({ error: "Password errata." });
        }
    } catch (err) {
        // Abbiamo registrato l'errore nel terminale del server per monitorare il problema
        console.error(err);
        // Abbiamo inviato una risposta di errore generico al client in caso di crash del database
        res.status(500).json({ error: "Errore durante il login." });
    }
});

// Abbiamo impostato il server in modalità ascolto per iniziare a ricevere il traffico web
app.listen(port, () => {
    // Abbiamo stampato un messaggio di conferma che indica su quale indirizzo il server sta girando
    console.log(`Server Back-end in esecuzione su http://localhost:${port}`);
});
