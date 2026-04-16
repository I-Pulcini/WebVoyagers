const express = require('express');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const app = express();
const port = 3000;

app.use(express.json());

// --- 1. CONNESSIONE AL DATABASE SUPABASE ---
// INCOLLA QUI IL TUO LINK E SOSTITUISCI [YOUR-PASSWORD] CON LA TUA VERA PASSWORD
const LINK_DATABASE = "postgresql://postgres:Nkobjivhu26_@db.ctmkhhntdffknbgkvgsk.supabase.co:5432/postgres";

const pool = new Pool({
    connectionString: LINK_DATABASE,
});

// --- 2. CONFIGURAZIONE DELLE SESSIONI (Rif: Parte 1.pdf) ---
app.use(session({
    store: new pgSession({
        pool: pool,
        tableName: 'session' // La tabella che abbiamo creato su Supabase
    }),
    secret: 'chiave_segreta_webvoyagers_2026', // Serve per criptare i cookie
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 } // Il login dura 30 giorni
}));

// --- 3. API: REGISTRAZIONE ---
app.post('/api/register', async (req, res) => {
    const { username, email, password } = req.body;
    try {
        // Criptiamo la password prima di salvarla (Rif: Parte 1.pdf)
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Salviamo l'utente nel database
        await pool.query(
            'INSERT INTO utenti (username, email, password_hash) VALUES ($1, $2, $3)',
            [username, email, hashedPassword]
        );
        res.status(201).json({ message: "Utente registrato con successo!" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Errore: Forse questa email è già registrata?" });
    }
});

// --- 4. API: LOGIN ---
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        // Cerchiamo l'utente nel database tramite email
        const result = await pool.query('SELECT * FROM utenti WHERE email = $1', [email]);
        
        if (result.rows.length === 0) {
            return res.status(401).json({ error: "Utente non trovato." });
        }

        const user = result.rows[0];
        
        // Confrontiamo la password inserita con quella criptata nel database
        const match = await bcrypt.compare(password, user.password_hash);

        if (match) {
            // Se la password è corretta, creiamo la sessione!
            req.session.userId = user.id;
            req.session.username = user.username;
            res.json({ message: "Login effettuato con successo!", username: user.username });
        } else {
            res.status(401).json({ error: "Password errata." });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Errore durante il login." });
    }
});

app.listen(port, () => {
    console.log(`Server Back-end in esecuzione su http://localhost:${port}`);
});