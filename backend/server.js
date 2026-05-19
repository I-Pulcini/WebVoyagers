// Abbiamo caricato le variabili d'ambiente dal file .env in modo che siano disponibili tramite process.env
require('dotenv').config();
const path = require('path');
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
// Abbiamo detto a Express di fidarsi del proxy di Render (necessario per HTTPS e cookie sicuri)
app.set('trust proxy', 1);
// Abbiamo letto la porta dalla variabile d'ambiente, con valore di fallback 3000 se non definita
const port = process.env.PORT || 3000;
// Abbiamo definito la cartella dove stanno i file statici buildati del frontend
const ROOT = path.join(__dirname, 'dist');

// Abbiamo servito i file statici del frontend (CSS, JS, immagini ecc.)
app.use(express.static(ROOT));
// Abbiamo configurato il server per interpretare automaticamente i dati in formato JSON
app.use(express.json());

// --- 1. CONNESSIONE AL DATABASE SUPABASE ---
// Abbiamo memorizzato l'URL di connessione fornito da Supabase per accedere al nostro database in cloud
// Abbiamo letto la stringa di connessione dal file .env per non esporre la password nel codice sorgente
// Abbiamo creato un nuovo oggetto Pool passando la nostra stringa di connessione
// Connessione al database Supabase tramite connection pooler
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  connectionTimeoutMillis: 15000,
});


// --- 2. VALIDAZIONE JSON SCHEMA (Rif: 18-json-schema.pdf) ---
// Abbiamo definito gli schemi JSON Schema per validare i dati in ingresso alle API principali.
// JSON Schema e uno standard che descrive la struttura e i vincoli dei dati JSON (ECMA 404).

const schemaRegistrazione = {
    type: "object",
    required: ["username", "email", "password"],
    properties: {
        username: { type: "string", minLength: 3, maxLength: 50 },
        email:    { type: "string", pattern: "^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$" },
        password: { type: "string", minLength: 6, maxLength: 100 }
    },
    additionalProperties: false
};

const schemaLogin = {
    type: "object",
    required: ["email", "password"],
    properties: {
        email:    { type: "string", pattern: "^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$" },
        password: { type: "string", minLength: 1 }
    },
    additionalProperties: false
};

const schemaPrenota = {
    type: "object",
    required: ["idViaggio", "numeroViaggiatori", "nomeCompleto", "emailContatto"],
    properties: {
        idViaggio:         { type: "integer", minimum: 1 },
        numeroViaggiatori: { type: "integer", minimum: 1, maximum: 50 },
        nomeCompleto:      { type: "string",  minLength: 2, maxLength: 150 },
        emailContatto:     { type: "string",  pattern: "^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$" },
        telefono:          { type: "string",  maxLength: 50 },
        note:              { type: "string",  maxLength: 1000 }
    }
};

const schemaPrenota_Misterioso = {
    type: "object",
    required: ["dataPartenza", "durata", "budget", "tipoEsperienza", "numeroViaggiatori"],
    properties: {
        continente:        { type: "string", enum: ["europa","asia","africa","americhe","oceania","qualsiasi",""] },
        dataPartenza:      { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$" },
        durata:            { type: "string", enum: ["3-5","6-10","11-15","16+"] },
        budget:            { type: "string", enum: ["economico","medio","premium","luxury","qualsiasi",""] },
        tipoEsperienza:    { type: "string", enum: ["cultura","avventura","mare","metropoli","cibo","sorpresa","qualsiasi",""] },
        numeroViaggiatori: { type: "integer", minimum: 1, maximum: 50 },
        note:              { type: "string",  maxLength: 1000 }
    }
};

// Funzione di validazione: verifica che i dati ricevuti rispettino lo schema JSON Schema dichiarato.
// Controlla: tipo del valore, campi required, minLength/maxLength, pattern regex, enum, min/max numerici.
function validaSchema(dati, schema) {
    const errori = [];
    if (schema.type === "object" && (typeof dati !== "object" || dati === null || Array.isArray(dati))) {
        return ["Il corpo della richiesta deve essere un oggetto JSON valido."];
    }
    if (schema.required) {
        for (const campo of schema.required) {
            if (dati[campo] === undefined || dati[campo] === null || dati[campo] === "") {
                errori.push("Il campo " + campo + " e obbligatorio.");
            }
        }
    }
    if (schema.properties) {
        for (const [campo, regole] of Object.entries(schema.properties)) {
            const valore = dati[campo];
            if (valore === undefined || valore === null) continue;
            if (regole.type === "string" && typeof valore !== "string") {
                errori.push("Il campo " + campo + " deve essere una stringa."); continue;
            }
            if (regole.type === "integer" && !Number.isInteger(valore)) {
                errori.push("Il campo " + campo + " deve essere un numero intero."); continue;
            }
            if (typeof valore === "string") {
                if (regole.minLength !== undefined && valore.length < regole.minLength)
                    errori.push("Il campo " + campo + " deve avere almeno " + regole.minLength + " caratteri.");
                if (regole.maxLength !== undefined && valore.length > regole.maxLength)
                    errori.push("Il campo " + campo + " non puo superare " + regole.maxLength + " caratteri.");
                if (regole.pattern && !new RegExp(regole.pattern).test(valore))
                    errori.push("Il campo " + campo + " non rispetta il formato richiesto.");
            }
            if (typeof valore === "number") {
                if (regole.minimum !== undefined && valore < regole.minimum)
                    errori.push("Il campo " + campo + " deve essere almeno " + regole.minimum + ".");
                if (regole.maximum !== undefined && valore > regole.maximum)
                    errori.push("Il campo " + campo + " non puo superare " + regole.maximum + ".");
            }
            if (regole.enum && !regole.enum.includes(valore))
                errori.push("Il campo " + campo + " contiene un valore non ammesso.");
        }
    }
    if (schema.additionalProperties === false && schema.properties) {
        for (const campo of Object.keys(dati)) {
            if (!schema.properties[campo]) errori.push("Il campo " + campo + " non e ammesso.");
        }
    }
    return errori;
}

// --- 3. CONFIGURAZIONE DELLE SESSIONI (Rif: Parte 1.pdf) ---
// Abbiamo attivato il sistema delle sessioni per permettere al sito di riconoscere gli utenti
app.use(session({
    // Abbiamo scelto di salvare le sessioni sul database invece che nella memoria RAM del server
    store: new pgSession({
        pool: pool, // Abbiamo passato il collegamento al database appena creato
        tableName: 'session' // Abbiamo indicato il nome esatto della tabella SQL che abbiamo preparato su Supabase
    }),
    // Abbiamo letto la chiave segreta dal file .env per maggiore sicurezza
    secret: process.env.SESSION_SECRET,
    // Abbiamo impostato 'resave' su false per evitare di risalvare la sessione se non ci sono state modifiche
    resave: false,
    // Abbiamo impostato 'saveUninitialized' su false per non creare sessioni vuote per gli utenti non loggati
    saveUninitialized: false,
    // Abbiamo configurato le proprietà del cookie di sessione che il browser conserverà
    cookie: { 
        // Abbiamo stabilito che il login rimanga valido per 30 giorni consecutivi (espressi in millisecondi)
        maxAge: 30 * 24 * 60 * 60 * 1000,
        // Abbiamo reso il cookie accessibile solo dal server, mai dal codice JavaScript del browser (sicurezza)
        httpOnly: true,
        // Abbiamo impostato secure in base all'ambiente: 'auto' usa HTTPS in produzione e HTTP in locale
        secure: process.env.NODE_ENV === 'production',
        // Abbiamo permesso al cookie di essere inviato in richieste cross-origin moderate (necessario per il proxy di Vite)
        sameSite: 'lax'
    }
}));

// --- 3. API: REGISTRAZIONE ---
// Abbiamo creato una rotta POST per permettere agli utenti di registrarsi al nostro portale
app.post('/api/register', async (req, res) => {
    // Abbiamo validato i dati in ingresso usando il nostro schema JSON Schema (Rif: 18-json-schema.pdf)
    const erroriValidazione = validaSchema(req.body, schemaRegistrazione);
    if (erroriValidazione.length > 0) {
        return res.status(400).json({ error: "Dati non validi.", dettagli: erroriValidazione });
    }
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
    // Abbiamo validato i dati in ingresso usando il nostro schema JSON Schema (Rif: 18-json-schema.pdf)
    const erroriLogin = validaSchema(req.body, schemaLogin);
    if (erroriLogin.length > 0) {
        return res.status(400).json({ error: "Dati non validi.", dettagli: erroriLogin });
    }
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
            // Abbiamo salvato anche il flag admin nella sessione, così possiamo verificare i permessi
            req.session.isAdmin = user.is_admin;
            // Abbiamo risposto inviando un messaggio di conferma, lo username e il flag admin al Front-end
            res.json({ 
                message: "Login effettuato con successo!", 
                userId: user.id,
                username: user.username,
                isAdmin: user.is_admin
            });
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
// --- 5. API: VERIFICA SESSIONE ATTIVA ---
// Abbiamo creato una rotta GET che il frontend chiamerà per sapere se c'è un utente loggato
app.get('/api/me', (req, res) => {
    if (req.session.userId) {
        res.json({
            loggato: true,
            userId: req.session.userId,
            username: req.session.username,
            isAdmin: req.session.isAdmin || false
        });
    } else {
        res.json({ loggato: false });
    }
});
// --- 6. API: LOGOUT ---
// Abbiamo creato una rotta POST per permettere all'utente di disconnettersi dal sito
app.post('/api/logout', (req, res) => {
    // Abbiamo distrutto la sessione corrente, eliminando tutti i dati dell'utente dal database
    req.session.destroy((err) => {
        // Abbiamo gestito l'eventuale errore che si potrebbe verificare durante la distruzione della sessione
        if (err) {
            console.error("Errore durante il logout:", err);
            return res.status(500).json({ error: "Errore durante il logout." });
        }
        // Abbiamo cancellato anche il cookie dal browser dell'utente per completare il logout
        res.clearCookie('connect.sid');
        // Abbiamo inviato una risposta di conferma al frontend
        res.json({ message: "Logout effettuato con successo!" });
    });
});
// --- 7. API: PRENOTAZIONE VIAGGIO MISTERIOSO ---
// Abbiamo creato una rotta POST che riceve i criteri di ricerca dal form Vue,
// pesca una destinazione adatta dal database, salva la prenotazione e restituisce il codice
// insieme alle 3 opzioni "indizio" (la vera + 2 simili)
app.post('/api/prenota-misterioso', async (req, res) => {
    // Abbiamo verificato subito che l'utente sia loggato controllando la sessione
    if (!req.session.userId) {
        return res.status(401).json({ error: "Devi essere loggato per prenotare un viaggio misterioso." });
    }
    
    // Abbiamo validato i dati in ingresso usando JSON Schema (Rif: 18-json-schema.pdf)
    const erroriMisterioso = validaSchema(req.body, schemaPrenota_Misterioso);
    if (erroriMisterioso.length > 0) {
        return res.status(400).json({ error: "Dati non validi.", dettagli: erroriMisterioso });
    }
    
    // Abbiamo estratto i criteri di ricerca inviati dal form di Vue
    const { 
        continente, 
        dataPartenza, 
        durata, 
        budget, 
        tipoEsperienza, 
        numeroViaggiatori, 
        note 
    } = req.body;
    
    try {
        // Abbiamo convertito la durata testuale (es. "6-10") nei valori numerici min e max
        let durataMin, durataMax;
        if (durata === '3-5') { durataMin = 3; durataMax = 5; }
        else if (durata === '6-10') { durataMin = 6; durataMax = 10; }
        else if (durata === '11-15') { durataMin = 11; durataMax = 15; }
        else if (durata === '16+') { durataMin = 16; durataMax = 30; }
        else { durataMin = 1; durataMax = 30; }
        
        // Abbiamo convertito la fascia di budget in valori numerici min e max
        let budgetMin, budgetMax;
        if (budget === 'economico') { budgetMin = 0; budgetMax = 1500; }
        else if (budget === 'medio') { budgetMin = 1500; budgetMax = 3500; }
        else if (budget === 'premium') { budgetMin = 3500; budgetMax = 6000; }
        else if (budget === 'luxury') { budgetMin = 6000; budgetMax = 99999; }
        else { budgetMin = 0; budgetMax = 99999; }
        
        // Abbiamo costruito una query dinamica che cerca destinazioni che combaciano con i criteri.
        // Se l'utente ha scelto "qualsiasi" continente o "sorpresa" per esperienza, non filtriamo su quel campo
        let querySQL = `
            SELECT * FROM destinazioni_misteriose 
            WHERE attivo = TRUE 
            AND budget_min <= $1 
            AND budget_max >= $2
            AND durata_min <= $3
            AND durata_max >= $4
        `;
        const parametri = [budgetMax, budgetMin, durataMax, durataMin];
        
        // Abbiamo aggiunto il filtro continente solo se l'utente ne ha scelto uno specifico
        if (continente && continente !== 'qualsiasi') {
            querySQL += ` AND continente = $${parametri.length + 1}`;
            parametri.push(continente);
        }
        
        // Abbiamo aggiunto il filtro tipo esperienza solo se diverso da "sorpresa"
        if (tipoEsperienza && tipoEsperienza !== 'sorpresa') {
            querySQL += ` AND tipo_esperienza = $${parametri.length + 1}`;
            parametri.push(tipoEsperienza);
        }
        
        // Abbiamo eseguito la query sul database per trovare le destinazioni compatibili
        const risultato = await pool.query(querySQL, parametri);
        
        // Abbiamo controllato se ci sono destinazioni disponibili che combaciano con i criteri
        if (risultato.rows.length === 0) {
            return res.status(404).json({ 
                error: "Non abbiamo trovato un viaggio misterioso che combaci con i tuoi criteri. Prova ad allargare le opzioni!" 
            });
        }
        
        // Abbiamo scelto una destinazione casuale tra quelle compatibili (è il viaggio "vero" assegnato all'utente)
        const destinazioneScelta = risultato.rows[Math.floor(Math.random() * risultato.rows.length)];

        // Calcoliamo quanti giorni mancano alla partenza per decidere se mostrare i distrattori
        const oggiData = new Date();
        oggiData.setHours(0, 0, 0, 0);
        const partenzaDate = new Date(dataPartenza);
        const giorniAllaPartenza = Math.floor((partenzaDate - oggiData) / (1000 * 60 * 60 * 24));

        // I distrattori vengono mostrati solo se la partenza è tra più di 7 giorni
        // e rispettano gli stessi filtri scelti dall'utente (continente, budget, durata)
        let distrattoriRows = [];
        if (giorniAllaPartenza > 7) {
            let distrattoriSQL = `
                SELECT * FROM destinazioni_misteriose
                WHERE attivo = TRUE
                AND id != $1
                AND budget_min <= $2
                AND budget_max >= $3
                AND durata_min <= $4
                AND durata_max >= $5
            `;
            const distrattoriParams = [destinazioneScelta.id, budgetMax, budgetMin, durataMax, durataMin];

            if (continente && continente !== 'qualsiasi') {
                distrattoriSQL += ` AND continente = $${distrattoriParams.length + 1}`;
                distrattoriParams.push(continente);
            }
            if (tipoEsperienza && tipoEsperienza !== 'sorpresa') {
                distrattoriSQL += ` AND tipo_esperienza = $${distrattoriParams.length + 1}`;
                distrattoriParams.push(tipoEsperienza);
            }

            distrattoriSQL += ` ORDER BY RANDOM() LIMIT 2`;
            const distrattoriQuery = await pool.query(distrattoriSQL, distrattoriParams);
            distrattoriRows = distrattoriQuery.rows;
        }

        // Abbiamo costruito la versione "anonima" del viaggio scelto: solo indizi, niente nome
        const viaggioSceltoAnonimo = {
            continente: destinazioneScelta.continente,
            tipo_esperienza: destinazioneScelta.tipo_esperienza,
            indizio_1: destinazioneScelta.indizio_1,
            indizio_2: destinazioneScelta.indizio_2,
            indizio_3: destinazioneScelta.indizio_3
        };
        
        // Abbiamo costruito la versione anonima dei 2 distrattori, sempre con i soli indizi
        const viaggiSimiliAnonimi = distrattoriRows.map(dest => ({
            continente: dest.continente,
            tipo_esperienza: dest.tipo_esperienza,
            indizio_1: dest.indizio_1,
            indizio_2: dest.indizio_2,
            indizio_3: dest.indizio_3
        }));
        
        // Abbiamo generato un codice prenotazione univoco da mostrare all'utente
        const lettere = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const numeri = '0123456789';
        let codice = 'WV-';
        for (let i = 0; i < 3; i++) {
            codice += lettere.charAt(Math.floor(Math.random() * lettere.length));
        }
        for (let i = 0; i < 4; i++) {
            codice += numeri.charAt(Math.floor(Math.random() * numeri.length));
        }
        
        // Abbiamo salvato la prenotazione nel database collegandola all'utente loggato e alla destinazione assegnata
        await pool.query(
            `INSERT INTO prenotazioni_misteriose 
                (codice, id_utente, id_destinazione, continente_richiesto, data_partenza, durata, budget, tipo_esperienza, numero_viaggiatori, note, stato) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'confermata')`,
            [
                codice,
                req.session.userId,
                destinazioneScelta.id,
                continente,
                dataPartenza,
                durata,
                budget,
                tipoEsperienza,
                numeroViaggiatori,
                note || null
            ]
        );
        
        // Abbiamo risposto al frontend con il codice di prenotazione,
        // il viaggio scelto (anonimo) e i 2 viaggi simili: tutti senza il nome esatto della destinazione,
        // così l'utente vede 3 indizi senza sapere quale dei tre è il proprio
        res.status(201).json({ 
            message: "Prenotazione confermata!",
            codice: codice,
            viaggioScelto: viaggioSceltoAnonimo,
            viaggiSimili: viaggiSimiliAnonimi
        });
        
    } catch (err) {
        // Abbiamo stampato l'errore nel terminale del server per il debug
        console.error("Errore nella prenotazione del viaggio misterioso:", err);
        // Abbiamo restituito un messaggio generico al client per non esporre dettagli interni
        res.status(500).json({ error: "Errore durante la prenotazione. Riprova più tardi." });
    }
});

// --- 8. API: ELENCO PRENOTAZIONI MISTERIOSE DELL'UTENTE LOGGATO ---
// Abbiamo creato una rotta GET che restituisce tutte le prenotazioni dell'utente attualmente loggato
app.get('/api/mie-prenotazioni-misteriose', async (req, res) => {
    // Abbiamo verificato che l'utente sia loggato prima di restituire dati personali
    if (!req.session.userId) {
        return res.status(401).json({ error: "Devi essere loggato per vedere le tue prenotazioni." });
    }
    
    try {
        // Abbiamo eseguito una query con JOIN per recuperare anche il nome della destinazione assegnata.
        // Mostriamo il nome della destinazione SOLO se mancano meno di 7 giorni alla partenza (il "mistero" si svela)
        const risultato = await pool.query(
            `SELECT 
                p.id, 
                p.codice, 
                p.continente_richiesto, 
                p.data_partenza, 
                p.durata, 
                p.budget, 
                p.tipo_esperienza, 
                p.numero_viaggiatori, 
                p.stato, 
                p.data_prenotazione,
                CASE 
                    WHEN p.data_partenza - CURRENT_DATE <= 7 THEN d.nome 
                    ELSE NULL 
                END AS destinazione_rivelata,
                p.data_partenza - CURRENT_DATE AS giorni_alla_partenza
             FROM prenotazioni_misteriose p
             LEFT JOIN destinazioni_misteriose d ON p.id_destinazione = d.id
             WHERE p.id_utente = $1
             ORDER BY p.data_partenza ASC`,
            [req.session.userId]
        );
        
        // Abbiamo restituito l'elenco delle prenotazioni al frontend
        res.json({ prenotazioni: risultato.rows });
        
    } catch (err) {
        // Abbiamo registrato l'errore nel terminale del server
        console.error("Errore nel recupero delle prenotazioni:", err);
        res.status(500).json({ error: "Errore durante il recupero delle prenotazioni." });
    }
});
// --- 9. API: SCOPRI IL TUO VIAGGIO ---
// Abbiamo creato una rotta GET che riceve un codice prenotazione e restituisce
// la destinazione SOLO se mancano 7 giorni o meno alla partenza.
// Altrimenti restituisce il numero di giorni che ancora mancano.
app.get('/api/scopri-viaggio/:codice', async (req, res) => {
    // Abbiamo estratto il codice prenotazione dai parametri dell'URL
    const { codice } = req.params;
    
    try {
        // Abbiamo cercato la prenotazione facendo un JOIN con la tabella destinazioni per avere il nome
        const risultato = await pool.query(
            `SELECT 
                p.codice,
                p.data_partenza,
                p.numero_viaggiatori,
                p.durata,
                d.nome AS nome_destinazione,
                d.descrizione AS descrizione_destinazione,
                d.continente,
                d.tipo_esperienza,
                p.data_partenza - CURRENT_DATE AS giorni_alla_partenza
             FROM prenotazioni_misteriose p
             LEFT JOIN destinazioni_misteriose d ON p.id_destinazione = d.id
             WHERE p.codice = $1`,
            [codice]
        );
        
        // Abbiamo controllato se il codice esiste nel database
        if (risultato.rows.length === 0) {
            return res.status(404).json({ 
                error: "Codice prenotazione non trovato. Verifica di averlo digitato correttamente." 
            });
        }
        
        // Abbiamo estratto i dati della prenotazione trovata
        const prenotazione = risultato.rows[0];
        const giorniMancanti = prenotazione.giorni_alla_partenza;
        
        // Abbiamo verificato se mancano 7 giorni o meno: in tal caso riveliamo la destinazione
        if (giorniMancanti <= 7) {
            res.json({
                rivelato: true,
                codice: prenotazione.codice,
                dataPartenza: prenotazione.data_partenza,
                numeroViaggiatori: prenotazione.numero_viaggiatori,
                durata: prenotazione.durata,
                giorniMancanti: giorniMancanti,
                destinazione: {
                    nome: prenotazione.nome_destinazione,
                    descrizione: prenotazione.descrizione_destinazione,
                    continente: prenotazione.continente,
                    tipo_esperienza: prenotazione.tipo_esperienza
                }
            });
        } else {
            // Abbiamo restituito solo il numero di giorni che ancora mancano alla rivelazione
            res.json({
                rivelato: false,
                giorniMancanti: giorniMancanti,
                giorniAllaRivelazione: giorniMancanti - 7
            });
        }
        
    } catch (err) {
        // Abbiamo registrato l'errore nel terminale del server
        console.error("Errore nella ricerca della prenotazione:", err);
        res.status(500).json({ error: "Errore durante la ricerca. Riprova più tardi." });
    }
});
// --- 10. API: ELENCO VIAGGI PER STATO ---
// Abbiamo creato una rotta GET che restituisce tutti i viaggi filtrati per stato
// (disponibile, sold_out, in_arrivo). Lo stato viene passato come parametro nell'URL.
app.get('/api/viaggi/:stato', async (req, res) => {
    // Abbiamo estratto lo stato richiesto dai parametri dell'URL
    const { stato } = req.params;
    
    // Abbiamo verificato che lo stato richiesto sia uno di quelli ammessi (sicurezza anti-injection)
    const statiAmmessi = ['disponibile', 'sold_out', 'in_arrivo'];
    if (!statiAmmessi.includes(stato)) {
        return res.status(400).json({ error: "Stato viaggio non valido." });
    }
    
    try {
        // Abbiamo eseguito la query per ottenere tutti i viaggi attivi con lo stato richiesto
        const risultato = await pool.query(
            `SELECT id, mese, periodo, data_visualizzata, destinazione, 
                    prezzo, stato, posti_disponibili, posti_totali, rotta
             FROM viaggi 
             WHERE stato = $1 AND attivo = TRUE
             ORDER BY id ASC`,
            [stato]
        );
        
        // Abbiamo restituito l'elenco dei viaggi al frontend
        res.json({ viaggi: risultato.rows });
        
    } catch (err) {
        // Abbiamo registrato l'errore nel terminale del server
        console.error("Errore nel recupero dei viaggi:", err);
        res.status(500).json({ error: "Errore durante il recupero dei viaggi." });
    }
});
// 10b. ENDPOINT PER OTTENERE I DETTAGLI COMPLETI DI UN VIAGGIO
// Abbiamo creato questo endpoint per la pagina dinamica del singolo viaggio.
// Restituisce TUTTI i campi del viaggio: id, destinazione, mese, prezzo, durata,
// posti_disponibili, descrizione, itinerario (JSONB) e galleria_foto (array).
app.get('/api/viaggi/dettaglio/:id', async (req, res) => {
  try {
    // Abbiamo letto l'id dal parametro dell'URL e lo abbiamo convertito in numero
    const idViaggio = parseInt(req.params.id)
    
    // Abbiamo controllato che sia un numero valido
    if (isNaN(idViaggio) || idViaggio < 1) {
      return res.status(400).json({ error: 'ID viaggio non valido.' })
    }
    
    // Abbiamo eseguito la query per ottenere il viaggio dal database
    const result = await pool.query(
      `SELECT id, destinazione, mese, periodo, data_visualizzata, prezzo, 
        posti_disponibili, posti_totali, stato, descrizione, 
        itinerario, galleria_foto, foto_header, rotta
        FROM viaggi 
        WHERE id = $1`,
      [idViaggio]
    )
    
    // Abbiamo verificato se il viaggio esiste
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Viaggio non trovato.' })
    }
    
    // Abbiamo restituito il viaggio al frontend
    res.json(result.rows[0])
    
  } catch (err) {
    console.error('Errore nel recupero dettagli viaggio:', err)
    res.status(500).json({ error: 'Errore del server.' })
  }
})
// 10c. ENDPOINT PER CERCARE UN VIAGGIO PER MESE E DESTINAZIONE
// Abbiamo creato questo endpoint per la barra di ricerca della HomeView.
// Cerchiamo nel DB un viaggio nel mese scelto la cui destinazione contenga (o sia contenuta in) 
// la parola scelta dall'utente. Per esempio "Svezia" matcha "LAPPONIA SVEDESE", e
// "Regno Unito" matcha "LONDRA" se aggiunto come parola chiave.
app.post('/api/cerca-viaggio', async (req, res) => {
  try {
    const { mese, destinazione } = req.body
    
    // Abbiamo controllato che entrambi i parametri siano stati forniti
    if (!mese || !destinazione) {
      return res.status(400).json({ error: 'Mese e destinazione sono obbligatori.' })
    }
    
    // Abbiamo cercato il viaggio nel DB con confronto case-insensitive
    // ILIKE permette pattern matching senza distinguere maiuscole/minuscole
    const result = await pool.query(
      `SELECT id, stato, destinazione, mese
       FROM viaggi 
       WHERE LOWER(mese) = LOWER($1) 
       AND (
         LOWER(destinazione) = LOWER($2)
         OR LOWER(destinazione) LIKE '%' || LOWER($2) || '%'
         OR LOWER($2) LIKE '%' || LOWER(destinazione) || '%'
       )
       ORDER BY 
         CASE 
           WHEN stato = 'disponibile' THEN 1
           WHEN stato = 'in_arrivo' THEN 2
           WHEN stato = 'sold_out' THEN 3
         END
       LIMIT 1`,
      [mese, destinazione]
    )
    
    // Se non troviamo il viaggio, restituiamo 404
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Nessun viaggio trovato per questa combinazione.' })
    }
    
    // Abbiamo restituito l'id del viaggio trovato
    res.json({ 
      id: result.rows[0].id, 
      stato: result.rows[0].stato,
      destinazione: result.rows[0].destinazione
    })
    
  } catch (err) {
    console.error('Errore nella ricerca viaggio:', err)
    res.status(500).json({ error: 'Errore del server.' })
  }
})

// --- 11. API: PRENOTAZIONE VIAGGIO NORMALE ---
// Abbiamo creato una rotta POST che permette all'utente loggato di prenotare un viaggio del catalogo.
// Riceve l'id del viaggio + dati personali del cliente, salva nel database e restituisce un codice
app.post('/api/prenota-viaggio', async (req, res) => {
    // Abbiamo verificato subito che l'utente sia loggato
    if (!req.session.userId) {
        return res.status(401).json({ error: "Devi essere loggato per prenotare un viaggio." });
    }
    
    // Abbiamo validato i dati in ingresso usando JSON Schema (Rif: 18-json-schema.pdf)
    const erroriPrenota = validaSchema(req.body, schemaPrenota);
    if (erroriPrenota.length > 0) {
        return res.status(400).json({ error: "Dati non validi.", dettagli: erroriPrenota });
    }
    
    // Abbiamo estratto i dati dal corpo della richiesta
    const { 
        idViaggio, 
        numeroViaggiatori, 
        nomeCompleto, 
        emailContatto, 
        telefono, 
        note 
    } = req.body;
    
    // Abbiamo verificato che i campi obbligatori siano presenti
    if (!idViaggio || !numeroViaggiatori || !nomeCompleto || !emailContatto) {
        return res.status(400).json({ error: "Compila tutti i campi obbligatori." });
    }
    
    try {
        // Abbiamo verificato che il viaggio richiesto esista e sia ancora disponibile (non sold out)
        const viaggioCheck = await pool.query(
            `SELECT id, destinazione, posti_disponibili, stato 
             FROM viaggi 
             WHERE id = $1 AND attivo = TRUE`,
            [idViaggio]
        );
        
        if (viaggioCheck.rows.length === 0) {
            return res.status(404).json({ error: "Viaggio non trovato." });
        }
        
        const viaggio = viaggioCheck.rows[0];
        
        // Abbiamo verificato che il viaggio sia prenotabile (solo se è 'disponibile')
        if (viaggio.stato !== 'disponibile') {
            return res.status(400).json({ 
                error: "Questo viaggio non è prenotabile al momento (sold out o non ancora aperto)." 
            });
        }
        
        // Abbiamo verificato che ci siano abbastanza posti per il numero richiesto di viaggiatori
        if (viaggio.posti_disponibili < numeroViaggiatori) {
            return res.status(400).json({ 
                error: `Posti insufficienti! Disponibili: ${viaggio.posti_disponibili}, richiesti: ${numeroViaggiatori}.` 
            });
        }
        
        // Abbiamo generato un codice prenotazione univoco con prefisso WV-V (V = Viaggio)
        const lettere = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const numeri = '0123456789';
        let codice = 'WV-V-';
        for (let i = 0; i < 3; i++) {
            codice += lettere.charAt(Math.floor(Math.random() * lettere.length));
        }
        for (let i = 0; i < 4; i++) {
            codice += numeri.charAt(Math.floor(Math.random() * numeri.length));
        }
        
        // Abbiamo salvato la prenotazione nel database collegandola all'utente loggato
        await pool.query(
            `INSERT INTO prenotazioni_viaggi 
                (codice, id_utente, id_viaggio, numero_viaggiatori, nome_completo, email_contatto, telefono, note, stato) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'confermata')`,
            [
                codice,
                req.session.userId,
                idViaggio,
                numeroViaggiatori,
                nomeCompleto,
                emailContatto,
                telefono || null,
                note || null
            ]
        );
        
        // Abbiamo aggiornato i posti disponibili sul viaggio (li sottraiamo)
        await pool.query(
            `UPDATE viaggi SET posti_disponibili = posti_disponibili - $1 WHERE id = $2`,
            [numeroViaggiatori, idViaggio]
        );
        
        // Abbiamo verificato se il viaggio è esaurito dopo questa prenotazione: in tal caso lo segniamo sold out
        const checkSoldOut = await pool.query(
            `SELECT posti_disponibili FROM viaggi WHERE id = $1`,
            [idViaggio]
        );
        if (checkSoldOut.rows[0].posti_disponibili <= 0) {
            await pool.query(
                `UPDATE viaggi SET stato = 'sold_out' WHERE id = $1`,
                [idViaggio]
            );
        }
        
        // Abbiamo risposto al frontend con il codice prenotazione e il nome della destinazione
        res.status(201).json({ 
            message: "Prenotazione confermata!",
            codice: codice,
            destinazione: viaggio.destinazione
        });
        
    } catch (err) {
        // Abbiamo registrato l'errore nel terminale del server per il debug
        console.error("Errore nella prenotazione del viaggio:", err);
        res.status(500).json({ error: "Errore durante la prenotazione. Riprova più tardi." });
    }
});

// --- 12. API: ELENCO PRENOTAZIONI VIAGGI NORMALI DELL'UTENTE LOGGATO ---
// Abbiamo creato una rotta GET che restituisce tutte le prenotazioni di viaggi normali dell'utente
app.get('/api/mie-prenotazioni-viaggi', async (req, res) => {
    // Abbiamo verificato che l'utente sia loggato prima di restituire dati personali
    if (!req.session.userId) {
        return res.status(401).json({ error: "Devi essere loggato per vedere le tue prenotazioni." });
    }
    
    try {
        // Abbiamo eseguito una query con JOIN per recuperare anche i dettagli del viaggio prenotato
        const risultato = await pool.query(
            `SELECT 
                p.id, 
                p.codice, 
                p.numero_viaggiatori, 
                p.nome_completo,
                p.email_contatto,
                p.telefono,
                p.note,
                p.stato, 
                p.data_prenotazione,
                v.destinazione,
                v.mese,
                v.periodo,
                v.data_visualizzata,
                v.prezzo,
                v.rotta
             FROM prenotazioni_viaggi p
             LEFT JOIN viaggi v ON p.id_viaggio = v.id
             WHERE p.id_utente = $1
             ORDER BY p.data_prenotazione DESC`,
            [req.session.userId]
        );
        
        // Abbiamo restituito l'elenco delle prenotazioni al frontend
        res.json({ prenotazioni: risultato.rows });
        
    } catch (err) {
        console.error("Errore nel recupero delle prenotazioni viaggi:", err);
        res.status(500).json({ error: "Errore durante il recupero delle prenotazioni." });
    }
});
// 12b. ENDPOINT PER ANNULLARE UNA PRENOTAZIONE DI VIAGGIO NORMALE
// Abbiamo creato questo endpoint per permettere all'utente di annullare una propria
// prenotazione. La prenotazione resta nel DB ma viene marcata come 'annullata',
// e i posti vengono restituiti al viaggio.
app.post('/api/annulla-prenotazione', async (req, res) => {
  // Abbiamo verificato che l'utente sia loggato
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Devi essere loggato per annullare una prenotazione.' })
  }
  
  const { codice } = req.body
  
  if (!codice) {
    return res.status(400).json({ error: 'Codice prenotazione mancante.' })
  }
  
  // Abbiamo iniziato una transazione per garantire che tutte le operazioni
  // (cambio stato + restituzione posti + eventuale ripristino disponibilita) avvengano insieme
  const client = await pool.connect()
  
  try {
    await client.query('BEGIN')
    
    // Abbiamo cercato la prenotazione e verificato che appartenga all'utente loggato
    const prenotazioneResult = await client.query(
      `SELECT id, id_viaggio, numero_viaggiatori, stato, id_utente
       FROM prenotazioni_viaggi
       WHERE codice = $1`,
      [codice]
    )
    
    if (prenotazioneResult.rows.length === 0) {
      await client.query('ROLLBACK')
      return res.status(404).json({ error: 'Prenotazione non trovata.' })
    }
    
    const prenotazione = prenotazioneResult.rows[0]
    
    // Abbiamo verificato che la prenotazione appartenga all'utente loggato
    if (prenotazione.id_utente !== req.session.userId) {
      await client.query('ROLLBACK')
      return res.status(403).json({ error: 'Non puoi annullare una prenotazione che non e tua.' })
    }
    
    // Abbiamo verificato che la prenotazione non sia gia annullata
    if (prenotazione.stato === 'annullata') {
      await client.query('ROLLBACK')
      return res.status(400).json({ error: 'Questa prenotazione e gia stata annullata.' })
    }
    
    // Abbiamo aggiornato lo stato della prenotazione ad 'annullata'
    await client.query(
      `UPDATE prenotazioni_viaggi SET stato = 'annullata' WHERE codice = $1`,
      [codice]
    )
    
    // Abbiamo restituito i posti al viaggio
    await client.query(
      `UPDATE viaggi 
       SET posti_disponibili = posti_disponibili + $1
       WHERE id = $2`,
      [prenotazione.numero_viaggiatori, prenotazione.id_viaggio]
    )
    
    // Se il viaggio era sold_out, lo riportiamo a 'disponibile'
    // (perche ora ci sono di nuovo posti liberi)
    await client.query(
      `UPDATE viaggi 
       SET stato = 'disponibile'
       WHERE id = $1 AND stato = 'sold_out' AND posti_disponibili > 0`,
      [prenotazione.id_viaggio]
    )
    
    await client.query('COMMIT')
    
    res.json({ 
      success: true, 
      message: 'Prenotazione annullata con successo.',
      codice: codice
    })
    
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('Errore annullamento prenotazione:', err)
    res.status(500).json({ error: 'Errore del server durante l\'annullamento.' })
  } finally {
    client.release()
  }
})
// 12c. ENDPOINT PER ANNULLARE UNA PRENOTAZIONE MISTERIOSA
// Abbiamo creato questo endpoint per permettere all'utente di annullare una propria
// prenotazione misteriosa. La prenotazione resta nel DB ma viene marcata come 'annullata'.
// Non e possibile annullare se la destinazione e gia stata svelata (mancano <= 7 giorni).
app.post('/api/annulla-prenotazione-misteriosa', async (req, res) => {
  // Abbiamo verificato che l'utente sia loggato
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Devi essere loggato per annullare una prenotazione.' })
  }
  
  const { codice } = req.body
  
  if (!codice) {
    return res.status(400).json({ error: 'Codice prenotazione mancante.' })
  }
  
  try {
    // Abbiamo cercato la prenotazione e calcolato i giorni alla partenza
    const prenotazioneResult = await pool.query(
      `SELECT id, id_utente, stato, data_partenza,
              data_partenza - CURRENT_DATE AS giorni_alla_partenza
       FROM prenotazioni_misteriose
       WHERE codice = $1`,
      [codice]
    )
    
    if (prenotazioneResult.rows.length === 0) {
      return res.status(404).json({ error: 'Prenotazione non trovata.' })
    }
    
    const prenotazione = prenotazioneResult.rows[0]
    
    // Abbiamo verificato che la prenotazione appartenga all'utente loggato
    if (prenotazione.id_utente !== req.session.userId) {
      return res.status(403).json({ error: 'Non puoi annullare una prenotazione che non e tua.' })
    }
    
    // Abbiamo verificato che la prenotazione non sia gia annullata
    if (prenotazione.stato === 'annullata') {
      return res.status(400).json({ error: 'Questa prenotazione e gia stata annullata.' })
    }
    
    // Abbiamo verificato che la destinazione non sia gia stata svelata
    // (regola di business: dopo la rivelazione non si puo piu annullare)
    if (prenotazione.giorni_alla_partenza <= 7) {
      return res.status(400).json({ 
        error: 'Non puoi piu annullare: la destinazione e stata svelata o il viaggio e troppo vicino.' 
      })
    }
    
    // Abbiamo aggiornato lo stato della prenotazione ad 'annullata'
    await pool.query(
      `UPDATE prenotazioni_misteriose SET stato = 'annullata' WHERE codice = $1`,
      [codice]
    )
    
    res.json({ 
      success: true, 
      message: 'Prenotazione misteriosa annullata con successo.',
      codice: codice
    })
    
  } catch (err) {
    console.error('Errore annullamento prenotazione misteriosa:', err)
    res.status(500).json({ error: 'Errore del server durante l\'annullamento.' })
  }
})
// --- 13. API: PROFILO UTENTE ---
// Abbiamo creato una rotta GET che restituisce i dati del profilo dell'utente loggato
// insieme alle sue statistiche personali (totale prenotazioni)
app.get('/api/profilo', async (req, res) => {
    // Abbiamo verificato che l'utente sia loggato
    if (!req.session.userId) {
        return res.status(401).json({ error: "Devi essere loggato per vedere il profilo." });
    }
    
    try {
        // Abbiamo recuperato i dati base dell'utente dal database
        const utenteResult = await pool.query(
            `SELECT id, username, email, data_registrazione 
             FROM utenti 
             WHERE id = $1`,
            [req.session.userId]
        );
        
        if (utenteResult.rows.length === 0) {
            return res.status(404).json({ error: "Utente non trovato." });
        }
        
        const utente = utenteResult.rows[0];
        
        // Abbiamo contato il numero di prenotazioni misteriose dell'utente
        const countMisterioseResult = await pool.query(
            `SELECT COUNT(*) AS totale FROM prenotazioni_misteriose WHERE id_utente = $1`,
            [req.session.userId]
        );
        
        // Abbiamo contato il numero di prenotazioni di viaggi normali dell'utente
        const countViaggiResult = await pool.query(
            `SELECT COUNT(*) AS totale FROM prenotazioni_viaggi WHERE id_utente = $1`,
            [req.session.userId]
        );
        
        // Abbiamo restituito tutti i dati al frontend
        res.json({
            id: utente.id,
            username: utente.username,
            email: utente.email,
            dataRegistrazione: utente.data_registrazione,
            statistiche: {
                prenotazioniMisteriose: parseInt(countMisterioseResult.rows[0].totale),
                prenotazioniViaggi: parseInt(countViaggiResult.rows[0].totale)
            }
        });
        
    } catch (err) {
        console.error("Errore nel recupero del profilo:", err);
        res.status(500).json({ error: "Errore durante il recupero del profilo." });
    }
});

// --- 14. API: CAMBIO PASSWORD ---
// Abbiamo creato una rotta POST che permette all'utente di cambiare la propria password.
// Per sicurezza richiede sia la vecchia password (per verifica) sia quella nuova
app.post('/api/cambia-password', async (req, res) => {
    // Abbiamo verificato che l'utente sia loggato
    if (!req.session.userId) {
        return res.status(401).json({ error: "Devi essere loggato per cambiare password." });
    }
    
    // Abbiamo estratto le password dalla richiesta
    const { passwordAttuale, passwordNuova } = req.body;
    
    // Abbiamo verificato che entrambe le password siano state inviate
    if (!passwordAttuale || !passwordNuova) {
        return res.status(400).json({ error: "Inserisci sia la password attuale sia quella nuova." });
    }
    
    // Abbiamo verificato che la nuova password sia abbastanza lunga (sicurezza minima)
    if (passwordNuova.length < 6) {
        return res.status(400).json({ error: "La nuova password deve essere di almeno 6 caratteri." });
    }
    
    // Abbiamo verificato che la nuova password sia diversa dalla vecchia
    if (passwordAttuale === passwordNuova) {
        return res.status(400).json({ error: "La nuova password deve essere diversa da quella attuale." });
    }
    
    try {
        // Abbiamo recuperato l'hash della password attuale dal database
        const result = await pool.query(
            `SELECT password_hash FROM utenti WHERE id = $1`,
            [req.session.userId]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Utente non trovato." });
        }
        
        const hashAttuale = result.rows[0].password_hash;
        
        // Abbiamo verificato che la password attuale inserita combaci con quella salvata
        const match = await bcrypt.compare(passwordAttuale, hashAttuale);
        if (!match) {
            return res.status(401).json({ error: "La password attuale non è corretta." });
        }
        
        // Abbiamo criptato la nuova password con bcrypt (cost 10, come per la registrazione)
        const nuovoHash = await bcrypt.hash(passwordNuova, 10);
        
        // Abbiamo aggiornato l'hash della password nel database
        await pool.query(
            `UPDATE utenti SET password_hash = $1 WHERE id = $2`,
            [nuovoHash, req.session.userId]
        );
        
        // Abbiamo risposto con conferma di successo
        res.json({ message: "Password cambiata con successo!" });
        
    } catch (err) {
        console.error("Errore nel cambio password:", err);
        res.status(500).json({ error: "Errore durante il cambio password." });
    }
});
// --- 15. MIDDLEWARE: VERIFICA ADMIN ---
// Abbiamo creato un middleware che verifica se l'utente è admin prima di permettere l'accesso
// agli endpoint protetti. Lo riutilizziamo in tutte le rotte admin per non duplicare il codice
const verificaAdmin = async (req, res, next) => {
    // Abbiamo verificato prima che l'utente sia loggato
    if (!req.session.userId) {
        return res.status(401).json({ error: "Devi essere loggato." });
    }
    
    // Abbiamo verificato che l'utente loggato sia effettivamente admin (controllo dal database)
    // Non ci affidiamo solo alla sessione per maggiore sicurezza
    try {
        const result = await pool.query(
            `SELECT is_admin FROM utenti WHERE id = $1`,
            [req.session.userId]
        );
        
        if (result.rows.length === 0 || !result.rows[0].is_admin) {
            return res.status(403).json({ error: "Accesso negato. Permessi insufficienti." });
        }
        
        // Abbiamo passato il controllo, l'utente è admin: proseguiamo con la rotta
        next();
    } catch (err) {
        console.error("Errore nella verifica admin:", err);
        res.status(500).json({ error: "Errore di sistema." });
    }
};

// --- 16. API ADMIN: STATISTICHE GLOBALI ---
// Abbiamo creato una rotta GET che restituisce le statistiche del sito (solo per admin)
app.get('/api/admin/stats', verificaAdmin, async (req, res) => {
    try {
        // Abbiamo eseguito le query in parallelo per essere più veloci
        const [utentiTot, prenViaggi, prenMisteriose, viaggiAttivi, incassoViaggi] = await Promise.all([
            pool.query(`SELECT COUNT(*) AS totale FROM utenti`),
            pool.query(`SELECT COUNT(*) AS totale FROM prenotazioni_viaggi`),
            pool.query(`SELECT COUNT(*) AS totale FROM prenotazioni_misteriose`),
            pool.query(`SELECT COUNT(*) AS totale FROM viaggi WHERE attivo = TRUE`),
            // Abbiamo calcolato l'incasso totale moltiplicando prezzo per numero viaggiatori
            pool.query(`
                SELECT COALESCE(SUM(v.prezzo * p.numero_viaggiatori), 0) AS totale 
                FROM prenotazioni_viaggi p 
                LEFT JOIN viaggi v ON p.id_viaggio = v.id 
                WHERE p.stato = 'confermata'
            `)
        ]);
        
        res.json({
            utenti: parseInt(utentiTot.rows[0].totale),
            prenotazioniViaggi: parseInt(prenViaggi.rows[0].totale),
            prenotazioniMisteriose: parseInt(prenMisteriose.rows[0].totale),
            viaggiAttivi: parseInt(viaggiAttivi.rows[0].totale),
            incassoTotale: parseInt(incassoViaggi.rows[0].totale)
        });
        
    } catch (err) {
        console.error("Errore nel recupero statistiche admin:", err);
        res.status(500).json({ error: "Errore durante il recupero delle statistiche." });
    }
});

// --- 17. API ADMIN: TUTTE LE PRENOTAZIONI ---
// Abbiamo creato una rotta GET che restituisce TUTTE le prenotazioni di TUTTI gli utenti (solo admin)
app.get('/api/admin/prenotazioni', verificaAdmin, async (req, res) => {
    try {
        // Abbiamo recuperato tutte le prenotazioni di viaggi normali con JOIN su utenti e viaggi
        const prenViaggi = await pool.query(`
            SELECT 
                p.id, p.codice, p.numero_viaggiatori, p.nome_completo, 
                p.email_contatto, p.telefono, p.note, p.stato, p.data_prenotazione,
                u.username, u.email AS utente_email,
                v.destinazione, v.prezzo, v.periodo, v.data_visualizzata
            FROM prenotazioni_viaggi p
            LEFT JOIN utenti u ON p.id_utente = u.id
            LEFT JOIN viaggi v ON p.id_viaggio = v.id
            ORDER BY p.data_prenotazione DESC
        `);
        
        // Abbiamo recuperato tutte le prenotazioni misteriose con JOIN su utenti e destinazioni
        const prenMisteriose = await pool.query(`
            SELECT 
                p.id, p.codice, p.numero_viaggiatori, p.continente_richiesto,
                p.data_partenza, p.durata, p.budget, p.tipo_esperienza,
                p.note, p.stato, p.data_prenotazione,
                u.username, u.email AS utente_email,
                d.nome AS destinazione_nome
            FROM prenotazioni_misteriose p
            LEFT JOIN utenti u ON p.id_utente = u.id
            LEFT JOIN destinazioni_misteriose d ON p.id_destinazione = d.id
            ORDER BY p.data_prenotazione DESC
        `);
        
        res.json({
            prenotazioniViaggi: prenViaggi.rows,
            prenotazioniMisteriose: prenMisteriose.rows
        });
        
    } catch (err) {
        console.error("Errore nel recupero prenotazioni admin:", err);
        res.status(500).json({ error: "Errore durante il recupero delle prenotazioni." });
    }
});

// --- 18. API ADMIN: LISTA UTENTI ---
// Abbiamo creato una rotta GET che restituisce tutti gli utenti registrati (solo admin)
app.get('/api/admin/utenti', verificaAdmin, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT id, username, email, is_admin, data_registrazione
            FROM utenti
            ORDER BY data_registrazione DESC
        `);
        
        res.json({ utenti: result.rows });
        
    } catch (err) {
        console.error("Errore nel recupero utenti admin:", err);
        res.status(500).json({ error: "Errore durante il recupero degli utenti." });
    }
});

// --- 19. API ADMIN: CAMBIA STATO PRENOTAZIONE ---
// Abbiamo creato una rotta POST che permette all'admin di cambiare lo stato di una prenotazione
app.post('/api/admin/cambia-stato', verificaAdmin, async (req, res) => {
    const { tipo, id, nuovoStato } = req.body;
    
    // Abbiamo verificato che il tipo di prenotazione sia valido
    if (!['viaggio', 'misteriosa'].includes(tipo)) {
        return res.status(400).json({ error: "Tipo di prenotazione non valido." });
    }
    
    // Abbiamo verificato che il nuovo stato sia uno di quelli permessi
    const statiAmmessi = ['in_attesa', 'confermata', 'completata', 'annullata', 'rivelata'];
    if (!statiAmmessi.includes(nuovoStato)) {
        return res.status(400).json({ error: "Stato non valido." });
    }
    
    try {
        // Abbiamo scelto la tabella corretta in base al tipo di prenotazione
        const tabella = tipo === 'viaggio' ? 'prenotazioni_viaggi' : 'prenotazioni_misteriose';
        
        const result = await pool.query(
            `UPDATE ${tabella} SET stato = $1 WHERE id = $2 RETURNING id, codice, stato`,
            [nuovoStato, id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Prenotazione non trovata." });
        }
        
        res.json({ 
            message: "Stato aggiornato con successo!",
            prenotazione: result.rows[0]
        });
        
    } catch (err) {
        console.error("Errore nel cambio stato prenotazione:", err);
        res.status(500).json({ error: "Errore durante l'aggiornamento dello stato." });
    }
});
// --- 20. API: INVIO MESSAGGIO CONTATTACI ---
// Abbiamo creato una rotta POST che riceve i dati dal form Contattaci e li salva nel database.
// Non richiede autenticazione: anche i visitatori non loggati possono scrivere.
// Se l'utente è loggato, salviamo anche l'id_utente per collegare il messaggio al profilo
app.post('/api/contattaci', async (req, res) => {
    // Abbiamo estratto i dati dal corpo della richiesta
    const { nome, email, telefono, motivo, messaggio } = req.body;
    
    // Abbiamo verificato che i campi obbligatori siano stati compilati
    if (!nome || !email || !motivo || !messaggio) {
        return res.status(400).json({ error: "Compila tutti i campi obbligatori." });
    }
    
    // Abbiamo verificato che l'email abbia un formato base corretto
    const emailValida = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!emailValida) {
        return res.status(400).json({ error: "Indirizzo email non valido." });
    }
    
    // Abbiamo limitato la lunghezza del messaggio per evitare abusi
    if (messaggio.length > 5000) {
        return res.status(400).json({ error: "Il messaggio è troppo lungo (max 5000 caratteri)." });
    }
    
    try {
        // Abbiamo salvato il messaggio nel database, includendo id_utente solo se l'utente è loggato
        await pool.query(
            `INSERT INTO messaggi_contatto 
                (nome, email, telefono, motivo, messaggio, id_utente, stato) 
             VALUES ($1, $2, $3, $4, $5, $6, 'nuovo')`,
            [
                nome,
                email,
                telefono || null,
                motivo,
                messaggio,
                req.session.userId || null
            ]
        );
        
        // Abbiamo risposto con conferma di ricezione
        res.status(201).json({ 
            message: "Messaggio inviato con successo! Ti risponderemo al più presto." 
        });
        
    } catch (err) {
        console.error("Errore nell'invio del messaggio:", err);
        res.status(500).json({ error: "Errore durante l'invio. Riprova più tardi." });
    }
});

// --- 21. API ADMIN: LISTA MESSAGGI CONTATTO ---
// Abbiamo creato una rotta GET che restituisce tutti i messaggi ricevuti (solo admin)
app.get('/api/admin/messaggi', verificaAdmin, async (req, res) => {
    try {
        // Abbiamo recuperato i messaggi con LEFT JOIN su utenti per avere lo username (se loggato al momento dell'invio)
        const result = await pool.query(`
            SELECT 
                m.id, m.nome, m.email, m.telefono, m.motivo, m.messaggio,
                m.stato, m.data_invio, m.id_utente,
                u.username
            FROM messaggi_contatto m
            LEFT JOIN utenti u ON m.id_utente = u.id
            ORDER BY m.data_invio DESC
        `);
        
        res.json({ messaggi: result.rows });
        
    } catch (err) {
        console.error("Errore nel recupero messaggi:", err);
        res.status(500).json({ error: "Errore durante il recupero dei messaggi." });
    }
});

// --- 22. API ADMIN: CAMBIA STATO MESSAGGIO ---
// Abbiamo creato una rotta POST che permette all'admin di marcare un messaggio come letto/risolto
app.post('/api/admin/messaggi/cambia-stato', verificaAdmin, async (req, res) => {
    const { id, nuovoStato } = req.body;
    
    // Abbiamo verificato che il nuovo stato sia tra quelli ammessi
    const statiAmmessi = ['nuovo', 'letto', 'risolto'];
    if (!statiAmmessi.includes(nuovoStato)) {
        return res.status(400).json({ error: "Stato non valido." });
    }
    
    try {
        // Abbiamo aggiornato lo stato del messaggio
        const result = await pool.query(
            `UPDATE messaggi_contatto SET stato = $1 WHERE id = $2 RETURNING id, stato`,
            [nuovoStato, id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Messaggio non trovato." });
        }
        
        res.json({ 
            message: "Stato messaggio aggiornato!",
            messaggio: result.rows[0]
        });
        
    } catch (err) {
        console.error("Errore cambio stato messaggio:", err);
        res.status(500).json({ error: "Errore durante l'aggiornamento." });
    }
});
// --- 23. API: ELENCO RECENSIONI PUBBLICATE ---
// Abbiamo creato una rotta GET pubblica (non serve essere loggati) che restituisce
// solo le recensioni con stato 'pubblicata'. Mostriamo anche lo username dell'autore tramite JOIN
app.get('/api/recensioni', async (req, res) => {
    try {
        // Abbiamo recuperato le recensioni pubblicate con JOIN su utenti per avere lo username
        const result = await pool.query(`
            SELECT 
                r.id, r.stelle, r.titolo, r.testo, r.data_creazione,
                u.username
            FROM recensioni r
            LEFT JOIN utenti u ON r.id_utente = u.id
            WHERE r.stato = 'pubblicata'
            ORDER BY r.data_creazione DESC
            LIMIT 12
        `);
        
        res.json({ recensioni: result.rows });
        
    } catch (err) {
        console.error("Errore nel recupero recensioni:", err);
        res.status(500).json({ error: "Errore durante il recupero delle recensioni." });
    }
});

// --- 24. API: INVIO NUOVA RECENSIONE ---
// Abbiamo creato una rotta POST che permette agli utenti loggati di scrivere una recensione.
// Per scrivere serve avere almeno una prenotazione (regola anti-spam molto importante)
app.post('/api/recensioni', async (req, res) => {
    // Abbiamo verificato che l'utente sia loggato
    if (!req.session.userId) {
        return res.status(401).json({ error: "Devi essere loggato per scrivere una recensione." });
    }
    
    // Abbiamo estratto i dati dalla richiesta
    const { stelle, titolo, testo } = req.body;
    
    // Abbiamo validato le stelle (devono essere tra 1 e 5)
    if (!stelle || stelle < 1 || stelle > 5) {
        return res.status(400).json({ error: "Devi assegnare un voto da 1 a 5 stelle." });
    }
    
    // Abbiamo validato titolo e testo
    if (!titolo || !testo) {
        return res.status(400).json({ error: "Compila sia il titolo che il testo della recensione." });
    }
    
    if (titolo.length > 150) {
        return res.status(400).json({ error: "Il titolo è troppo lungo (max 150 caratteri)." });
    }
    
    if (testo.length > 2000) {
        return res.status(400).json({ error: "Il testo è troppo lungo (max 2000 caratteri)." });
    }
    
    try {
        // Abbiamo verificato che l'utente abbia almeno una prenotazione (anti-spam)
        const prenCheck = await pool.query(`
            SELECT 
                (SELECT COUNT(*) FROM prenotazioni_viaggi WHERE id_utente = $1) +
                (SELECT COUNT(*) FROM prenotazioni_misteriose WHERE id_utente = $1) AS totale
        `, [req.session.userId]);
        
        if (parseInt(prenCheck.rows[0].totale) === 0) {
            return res.status(403).json({ 
                error: "Per scrivere una recensione devi prima aver prenotato almeno un viaggio con noi!" 
            });
        }
        
        // Abbiamo inserito la nuova recensione con stato 'in_attesa' (l'admin la approverà poi)
        await pool.query(
            `INSERT INTO recensioni (id_utente, stelle, titolo, testo, stato) 
             VALUES ($1, $2, $3, $4, 'in_attesa')`,
            [req.session.userId, stelle, titolo, testo]
        );
        
        // Abbiamo risposto con conferma
        res.status(201).json({ 
            message: "Recensione inviata! Sarà visibile dopo l'approvazione dello staff." 
        });
        
    } catch (err) {
        console.error("Errore nell'invio della recensione:", err);
        res.status(500).json({ error: "Errore durante l'invio. Riprova più tardi." });
    }
});

// --- 25. API ADMIN: LISTA TUTTE LE RECENSIONI ---
// Abbiamo creato una rotta GET che restituisce TUTTE le recensioni indipendentemente dallo stato (solo admin)
app.get('/api/admin/recensioni', verificaAdmin, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                r.id, r.stelle, r.titolo, r.testo, r.stato, r.data_creazione,
                u.username, u.email
            FROM recensioni r
            LEFT JOIN utenti u ON r.id_utente = u.id
            ORDER BY r.data_creazione DESC
        `);
        
        res.json({ recensioni: result.rows });
        
    } catch (err) {
        console.error("Errore nel recupero recensioni admin:", err);
        res.status(500).json({ error: "Errore durante il recupero delle recensioni." });
    }
});

// --- 26. API ADMIN: CAMBIA STATO RECENSIONE ---
// Abbiamo creato una rotta POST che permette all'admin di approvare o nascondere una recensione
app.post('/api/admin/recensioni/cambia-stato', verificaAdmin, async (req, res) => {
    const { id, nuovoStato } = req.body;
    
    // Abbiamo verificato che il nuovo stato sia tra quelli ammessi
    const statiAmmessi = ['in_attesa', 'pubblicata', 'nascosta'];
    if (!statiAmmessi.includes(nuovoStato)) {
        return res.status(400).json({ error: "Stato non valido." });
    }
    
    try {
        const result = await pool.query(
            `UPDATE recensioni SET stato = $1 WHERE id = $2 RETURNING id, stato`,
            [nuovoStato, id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Recensione non trovata." });
        }
        
        res.json({ 
            message: "Stato recensione aggiornato!",
            recensione: result.rows[0]
        });
        
    } catch (err) {
        console.error("Errore cambio stato recensione:", err);
        res.status(500).json({ error: "Errore durante l'aggiornamento." });
    }
});
// Per ogni richiesta GET non gestita dagli endpoint sopra, restituiamo index.html
// così Vue Router può gestire le rotte client-side
app.use((req, res) => {
  res.sendFile(path.join(ROOT, 'index.html'));
});

// Abbiamo impostato il server in modalità ascolto per iniziare a ricevere il traffico web
app.listen(port, () => {
    // Abbiamo stampato un messaggio di conferma che indica su quale indirizzo il server sta girando
    console.log(`Server Back-end in esecuzione su http://localhost:${port}`);
});