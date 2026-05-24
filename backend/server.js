require('dotenv').config();
const path = require('path');
const express = require('express');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const { Pool } = require('pg');
const bcrypt = require('bcrypt');


const app = express();
app.set('trust proxy', 1);
const port = process.env.PORT || 3000;
const ROOT = path.join(__dirname, 'dist');


app.use(express.static(ROOT));
app.use(express.json());

// API 1: CONNESSIONE CON I DATABASE SU SUPABASE
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  connectionTimeoutMillis: 15000,
});





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
    required: ["idViaggio", "numeroViaggiatori", "nomeCompleto", "emailContatto","telefono"],
    properties: {
        idViaggio:         { type: "integer", minimum: 1 },
        numeroViaggiatori: { type: "integer", minimum: 1, maximum: 50 },
        nomeCompleto:      { type: "string",  minLength: 2, maxLength: 150 },
        emailContatto:     { type: "string",  pattern: "^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$" },
        telefono:          { type: "string", pattern: "^[0-9+\\s\\-]+$"},
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

// API 2: CONFIGURAZIONE SESSIONI
app.use(session({  
  
    store: new pgSession({
        pool: pool, 
        tableName: 'session' 
    }),
    
    secret: process.env.SESSION_SECRET,
    resave: false,
    
    saveUninitialized: false,
   
    cookie: { 
       
        maxAge: 30 * 24 * 60 * 60 * 1000, 
     
        httpOnly: true,  
        secure: process.env.NODE_ENV === 'production',  
        sameSite: 'lax'  
    }
}));

// API 3: REGISTRAZIONE UTENTE
app.post('/api/register', async (req, res) => {
    const erroriValidazione = validaSchema(req.body, schemaRegistrazione);
    if (erroriValidazione.length > 0) {
        return res.status(400).json({ error: "Dati non validi.", dettagli: erroriValidazione });
    }
  
    const { username, email, password } = req.body;
    
    try {
        const hashedPassword = await bcrypt.hash(password, 10);  
        
        
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

// API 4: LOGIN
app.post('/api/login', async (req, res) => {
   
    const erroriLogin = validaSchema(req.body, schemaLogin);
    if (erroriLogin.length > 0) {
        return res.status(400).json({ error: "Dati non validi.", dettagli: erroriLogin });
    }
  
    
    const { email, password } = req.body;
   
    try {
        
        const result = await pool.query('SELECT * FROM utenti WHERE email = $1', [email]);
        
       
        if (result.rows.length === 0) {
            
            return res.status(401).json({ error: "Utente non trovato." });
        }

        const user = result.rows[0];
        
        
        const match = await bcrypt.compare(password, user.password_hash);

        
        if (match) {
           
            req.session.userId = user.id;
          
            req.session.username = user.username;
            
            req.session.isAdmin = user.is_admin;
        
            res.json({ 
                message: "Login effettuato con successo!", 
                userId: user.id,
                username: user.username,
                isAdmin: user.is_admin
            });
        } else {
            
            res.status(401).json({ error: "Password errata." });
        }
    } catch (err) {
        
        console.error(err);
        
        res.status(500).json({ error: "Errore durante il login." });
    }
});
// API 5 : VERIFICA SESSIONE ATTIVA 
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

// API 6: LOGOUT

app.post('/api/logout', (req, res) => {
 
    req.session.destroy((err) => {
      
        if (err) {
            console.error("Errore durante il logout:", err);
            return res.status(500).json({ error: "Errore durante il logout." });
        }
        
        res.clearCookie('connect.sid');
      
        res.json({ message: "Logout effettuato con successo!" });
    });
});
// API 7: PRENOTAZIONE VIAGGIO MISTERIOSO 

app.post('/api/prenota-misterioso', async (req, res) => {
 
    if (!req.session.userId) {
        return res.status(401).json({ error: "Devi essere loggato per prenotare un viaggio misterioso." });
    }
    
  
    const erroriMisterioso = validaSchema(req.body, schemaPrenota_Misterioso);
    if (erroriMisterioso.length > 0) {
        return res.status(400).json({ error: "Dati non validi.", dettagli: erroriMisterioso });
    }
    
    
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
    
        let durataMin, durataMax;
        if (durata === '3-5') { durataMin = 3; durataMax = 5; }
        else if (durata === '6-10') { durataMin = 6; durataMax = 10; }
        else if (durata === '11-15') { durataMin = 11; durataMax = 15; }
        else if (durata === '16+') { durataMin = 16; durataMax = 30; }
        else { durataMin = 1; durataMax = 30; }
        
     
        let budgetMin, budgetMax;
        if (budget === 'economico') { budgetMin = 0; budgetMax = 1500; }
        else if (budget === 'medio') { budgetMin = 1500; budgetMax = 3500; }
        else if (budget === 'premium') { budgetMin = 3500; budgetMax = 6000; }
        else if (budget === 'luxury') { budgetMin = 6000; budgetMax = 99999; }
        else { budgetMin = 0; budgetMax = 99999; }
        
        
        let querySQL = `
            SELECT * FROM destinazioni_misteriose 
            WHERE attivo = TRUE 
            AND budget_min <= $1 
            AND budget_max >= $2
            AND durata_min <= $3
            AND durata_max >= $4
        `;
        const parametri = [budgetMax, budgetMin, durataMax, durataMin];
        
       
        if (continente && continente !== 'qualsiasi') {
            querySQL += ` AND continente = $${parametri.length + 1}`;
            parametri.push(continente);
        }
        
       
        if (tipoEsperienza && tipoEsperienza !== 'sorpresa') {
            querySQL += ` AND tipo_esperienza = $${parametri.length + 1}`;
            parametri.push(tipoEsperienza);
        }
        
        
        const risultato = await pool.query(querySQL, parametri);
        
        
        if (risultato.rows.length === 0) {
            return res.status(404).json({ 
                error: "Non abbiamo trovato un viaggio misterioso che combaci con i tuoi criteri. Prova ad allargare le opzioni!" 
            });
        }
        
        
        const destinazioneScelta = risultato.rows[Math.floor(Math.random() * risultato.rows.length)];

      
        const oggiData = new Date();
        oggiData.setHours(0, 0, 0, 0);
        const partenzaDate = new Date(dataPartenza);
        const giorniAllaPartenza = Math.floor((partenzaDate - oggiData) / (1000 * 60 * 60 * 24));

       
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

        
        const viaggioSceltoAnonimo = {
            continente: destinazioneScelta.continente,
            tipo_esperienza: destinazioneScelta.tipo_esperienza,
            indizio_1: destinazioneScelta.indizio_1,
            indizio_2: destinazioneScelta.indizio_2,
            indizio_3: destinazioneScelta.indizio_3
        };
        
       
        const viaggiSimiliAnonimi = distrattoriRows.map(dest => ({
            continente: dest.continente,
            tipo_esperienza: dest.tipo_esperienza,
            indizio_1: dest.indizio_1,
            indizio_2: dest.indizio_2,
            indizio_3: dest.indizio_3
        }));
        
      
        const lettere = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const numeri = '0123456789';
        let codice = 'WV-';
        for (let i = 0; i < 3; i++) {
            codice += lettere.charAt(Math.floor(Math.random() * lettere.length));
        }
        for (let i = 0; i < 4; i++) {
            codice += numeri.charAt(Math.floor(Math.random() * numeri.length));
        }
        
      
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
        
        
        res.status(201).json({ 
            message: "Prenotazione confermata!",
            codice: codice,
            viaggioScelto: viaggioSceltoAnonimo,
            viaggiSimili: viaggiSimiliAnonimi
        });
        
    } catch (err) {
        
        console.error("Errore nella prenotazione del viaggio misterioso:", err);
        
        res.status(500).json({ error: "Errore durante la prenotazione. Riprova più tardi." });
    }
});

// API 8 : ELENCO PRENOTAZIONI MISTERIOSE DELL'UTENTE LOGGATO 

app.get('/api/mie-prenotazioni-misteriose', async (req, res) => {
   
    if (!req.session.userId) {
        return res.status(401).json({ error: "Devi essere loggato per vedere le tue prenotazioni." });
    }
    
    try {
        
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
        
        
        res.json({ prenotazioni: risultato.rows });
        
    } catch (err) {
        
        console.error("Errore nel recupero delle prenotazioni:", err);
        res.status(500).json({ error: "Errore durante il recupero delle prenotazioni." });
    }
});
// API 9 : SCOPRI IL TUO VIAGGIO 

app.get('/api/scopri-viaggio/:codice', async (req, res) => {
    
    const { codice } = req.params;
    
    try {
      
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
        
      
        if (risultato.rows.length === 0) {
            return res.status(404).json({ 
                error: "Codice prenotazione non trovato. Verifica di averlo digitato correttamente." 
            });
        }
        
      
        const prenotazione = risultato.rows[0];
        const giorniMancanti = prenotazione.giorni_alla_partenza;
        
        
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
            
            res.json({
                rivelato: false,
                giorniMancanti: giorniMancanti,
                giorniAllaRivelazione: giorniMancanti - 7
            });
        }
        
    } catch (err) {
       
        console.error("Errore nella ricerca della prenotazione:", err);
        res.status(500).json({ error: "Errore durante la ricerca. Riprova più tardi." });
    }
});
// API 10 : ELENCO VIAGGI PER STATO 

app.get('/api/viaggi/:stato', async (req, res) => {
   
    const { stato } = req.params;
    
  
    const statiAmmessi = ['disponibile', 'sold_out', 'in_arrivo'];
    if (!statiAmmessi.includes(stato)) {
        return res.status(400).json({ error: "Stato viaggio non valido." });
    }
    
    try {
       
        const risultato = await pool.query(
            `SELECT id, mese, periodo, data_visualizzata, destinazione, 
                    prezzo, stato, posti_disponibili, posti_totali, rotta
             FROM viaggi 
             WHERE stato = $1 AND attivo = TRUE
             ORDER BY id ASC`,
            [stato]
        );
        
      
        res.json({ viaggi: risultato.rows });
        
    } catch (err) {
       
        console.error("Errore nel recupero dei viaggi:", err);
        res.status(500).json({ error: "Errore durante il recupero dei viaggi." });
    }
});
// 10b. ENDPOINT PER OTTENERE I DETTAGLI COMPLETI DI UN VIAGGIO
app.get('/api/viaggi/dettaglio/:id', async (req, res) => {
  try {
   
    const idViaggio = parseInt(req.params.id)
    
   
    if (isNaN(idViaggio) || idViaggio < 1) {
      return res.status(400).json({ error: 'ID viaggio non valido.' })
    }
  
    const result = await pool.query(
      `SELECT id, destinazione, mese, periodo, data_visualizzata, prezzo, 
        posti_disponibili, posti_totali, stato, descrizione, 
        itinerario, galleria_foto, foto_header, rotta
        FROM viaggi 
        WHERE id = $1`,
      [idViaggio]
    )
    

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Viaggio non trovato.' })
    }

    res.json(result.rows[0])
    
  } catch (err) {
    console.error('Errore nel recupero dettagli viaggio:', err)
    res.status(500).json({ error: 'Errore del server.' })
  }
})
// 10c. ENDPOINT PER CERCARE UN VIAGGIO PER MESE E DESTINAZIONE

app.post('/api/cerca-viaggio', async (req, res) => {  
  try {
    const { mese, destinazione } = req.body
    
   
    if (!mese || !destinazione) {
      return res.status(400).json({ error: 'Mese e destinazione sono obbligatori.' })
    }
    

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
    
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Nessun viaggio trovato per questa combinazione.' })
    }
    
    
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

// API 11 PRENOTAZIONE VIAGGIO NORMALE 

app.post('/api/prenota-viaggio', async (req, res) => {
   
    if (!req.session.userId) {
        return res.status(401).json({ error: "Devi essere loggato per prenotare un viaggio." });
    }
    
   
    const erroriPrenota = validaSchema(req.body, schemaPrenota);
    if (erroriPrenota.length > 0) {
        return res.status(400).json({ error: "Dati non validi.", dettagli: erroriPrenota });
    }
    
   
    const { 
        idViaggio, 
        numeroViaggiatori, 
        nomeCompleto, 
        emailContatto, 
        telefono, 
        note 
    } = req.body;
    
    
    if (!idViaggio || !numeroViaggiatori || !nomeCompleto || !emailContatto) {
        return res.status(400).json({ error: "Compila tutti i campi obbligatori." });
    }
    
    try {
        
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
        
        
        if (viaggio.stato !== 'disponibile') {
            return res.status(400).json({ 
                error: "Questo viaggio non è prenotabile al momento (sold out o non ancora aperto)." 
            });
        }
        
        
        if (viaggio.posti_disponibili < numeroViaggiatori) {
            return res.status(400).json({ 
                error: `Posti insufficienti! Disponibili: ${viaggio.posti_disponibili}, richiesti: ${numeroViaggiatori}.` 
            });
        }
        
      
        const lettere = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const numeri = '0123456789';
        let codice = 'WV-V-';
        for (let i = 0; i < 3; i++) {
            codice += lettere.charAt(Math.floor(Math.random() * lettere.length));
        }
        for (let i = 0; i < 4; i++) {
            codice += numeri.charAt(Math.floor(Math.random() * numeri.length));
        }
        
      
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
        
        
        await pool.query(
            `UPDATE viaggi SET posti_disponibili = posti_disponibili - $1 WHERE id = $2`,
            [numeroViaggiatori, idViaggio]
        );
        
       
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
        
        
        res.status(201).json({ 
            message: "Prenotazione confermata!",
            codice: codice,
            destinazione: viaggio.destinazione
        });
        
    } catch (err) {
        
        console.error("Errore nella prenotazione del viaggio:", err);
        res.status(500).json({ error: "Errore durante la prenotazione. Riprova più tardi." });
    }
});

// API 12 : ELENCO PRENOTAZIONI VIAGGI NORMALI DELL'UTENTE LOGGATO 

app.get('/api/mie-prenotazioni-viaggi', async (req, res) => {
 
    if (!req.session.userId) {
        return res.status(401).json({ error: "Devi essere loggato per vedere le tue prenotazioni." });
    }
    
    try {
       
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
        
       
        res.json({ prenotazioni: risultato.rows });
        
    } catch (err) {
        console.error("Errore nel recupero delle prenotazioni viaggi:", err);
        res.status(500).json({ error: "Errore durante il recupero delle prenotazioni." });
    }
});

// 12b. ENDPOINT PER ANNULLARE UNA PRENOTAZIONE DI VIAGGIO NORMALE


app.post('/api/annulla-prenotazione', async (req, res) => {
 
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Devi essere loggato per annullare una prenotazione.' })
  }
  
  const { codice } = req.body
  
  if (!codice) {
    return res.status(400).json({ error: 'Codice prenotazione mancante.' })
  }
  

  const client = await pool.connect()
  
  try {
    await client.query('BEGIN')
    
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
    
  
    if (prenotazione.id_utente !== req.session.userId) {
      await client.query('ROLLBACK')
      return res.status(403).json({ error: 'Non puoi annullare una prenotazione che non e tua.' })
    }
    
 
    if (prenotazione.stato === 'annullata') {
      await client.query('ROLLBACK')
      return res.status(400).json({ error: 'Questa prenotazione e gia stata annullata.' })
    }
 
    await client.query(
      `UPDATE prenotazioni_viaggi SET stato = 'annullata' WHERE codice = $1`,
      [codice]
    )
    

    await client.query(
      `UPDATE viaggi 
       SET posti_disponibili = posti_disponibili + $1
       WHERE id = $2`,
      [prenotazione.numero_viaggiatori, prenotazione.id_viaggio]
    )
    
    
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

app.post('/api/annulla-prenotazione-misteriosa', async (req, res) => {
  
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Devi essere loggato per annullare una prenotazione.' })
  }
  
  const { codice } = req.body
  
  if (!codice) {
    return res.status(400).json({ error: 'Codice prenotazione mancante.' })
  }
  
  try {
    
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
   
    if (prenotazione.id_utente !== req.session.userId) {
      return res.status(403).json({ error: 'Non puoi annullare una prenotazione che non e tua.' })
    }
    
    
    if (prenotazione.stato === 'annullata') {
      return res.status(400).json({ error: 'Questa prenotazione e gia stata annullata.' })
    }
    
    
    if (prenotazione.giorni_alla_partenza <= 7) {
      return res.status(400).json({ 
        error: 'Non puoi piu annullare: la destinazione e stata svelata o il viaggio e troppo vicino.' 
      })
    }
    
  
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

// API 13 : PROFILO UTENTE 

app.get('/api/profilo', async (req, res) => {
   
    if (!req.session.userId) {
        return res.status(401).json({ error: "Devi essere loggato per vedere il profilo." });
    }
    
    try {
        
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
        
      
        const countMisterioseResult = await pool.query(
            `SELECT COUNT(*) AS totale FROM prenotazioni_misteriose WHERE id_utente = $1`,
            [req.session.userId]
        );
        
       
        const countViaggiResult = await pool.query(
            `SELECT COUNT(*) AS totale FROM prenotazioni_viaggi WHERE id_utente = $1`,
            [req.session.userId]
        );
        
        
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

//  API 14:  CAMBIO PASSWORD 

app.post('/api/cambia-password', async (req, res) => {
   
    if (!req.session.userId) {
        return res.status(401).json({ error: "Devi essere loggato per cambiare password." });
    }
    
    
    const { passwordAttuale, passwordNuova } = req.body;
    
   
    if (!passwordAttuale || !passwordNuova) {
        return res.status(400).json({ error: "Inserisci sia la password attuale sia quella nuova." });
    }
    
  
    if (passwordNuova.length < 6) {
        return res.status(400).json({ error: "La nuova password deve essere di almeno 6 caratteri." });
    }
    
   
    if (passwordAttuale === passwordNuova) {
        return res.status(400).json({ error: "La nuova password deve essere diversa da quella attuale." });
    }
    
    try {
  
        const result = await pool.query(
            `SELECT password_hash FROM utenti WHERE id = $1`,
            [req.session.userId]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Utente non trovato." });
        }
        
        const hashAttuale = result.rows[0].password_hash;
        
      
        const match = await bcrypt.compare(passwordAttuale, hashAttuale);
        if (!match) {
            return res.status(401).json({ error: "La password attuale non è corretta." });
        }
        
        const nuovoHash = await bcrypt.hash(passwordNuova, 10);
        
       
        await pool.query(
            `UPDATE utenti SET password_hash = $1 WHERE id = $2`,
            [nuovoHash, req.session.userId]
        );
        
    
        res.json({ message: "Password cambiata con successo!" });
        
    } catch (err) {
        console.error("Errore nel cambio password:", err);
        res.status(500).json({ error: "Errore durante il cambio password." });
    }
});

//  MIDDLEWARE 15 : VERIFICA ADMIN 

const verificaAdmin = async (req, res, next) => {
   
    if (!req.session.userId) {
        return res.status(401).json({ error: "Devi essere loggato." });
    }
    
    
    try {
        const result = await pool.query(
            `SELECT is_admin FROM utenti WHERE id = $1`,
            [req.session.userId]
        );
        
        if (result.rows.length === 0 || !result.rows[0].is_admin) {
            return res.status(403).json({ error: "Accesso negato. Permessi insufficienti." });
        }
        
      
        next();
    } catch (err) {
        console.error("Errore nella verifica admin:", err);
        res.status(500).json({ error: "Errore di sistema." });
    }
};

//  API ADMIN 16 : STATISTICHE GLOBALI 

app.get('/api/admin/stats', verificaAdmin, async (req, res) => {
    try {
      
        const [utentiTot, prenViaggi, prenMisteriose, viaggiAttivi, incassoViaggi] = await Promise.all([
            pool.query(`SELECT COUNT(*) AS totale FROM utenti`),
            pool.query(`SELECT COUNT(*) AS totale FROM prenotazioni_viaggi`),
            pool.query(`SELECT COUNT(*) AS totale FROM prenotazioni_misteriose`),
            pool.query(`SELECT COUNT(*) AS totale FROM viaggi WHERE attivo = TRUE`),
            
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

// API ADMIN 17 : TUTTE LE PRENOTAZIONI 

app.get('/api/admin/prenotazioni', verificaAdmin, async (req, res) => {
    try {
       
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

// API ADMIN 18 : LISTA UTENTI 

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

//  API ADMIN 19 : CAMBIA STATO PRENOTAZIONE 

app.post('/api/admin/cambia-stato', verificaAdmin, async (req, res) => {
    const { tipo, id, nuovoStato } = req.body;
    
    
    if (!['viaggio', 'misteriosa'].includes(tipo)) {
        return res.status(400).json({ error: "Tipo di prenotazione non valido." });
    }
    
 
    const statiAmmessi = ['in_attesa', 'confermata', 'completata', 'annullata', 'rivelata'];
    if (!statiAmmessi.includes(nuovoStato)) {
        return res.status(400).json({ error: "Stato non valido." });
    }
    
    try {
        
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

//  API 20 : INVIO MESSAGGIO CONTATTACI 

app.post('/api/contattaci', async (req, res) => {
    
    const { nome, email, telefono, motivo, messaggio } = req.body;
    
    
    if (!nome || !email || !motivo || !messaggio) {
        return res.status(400).json({ error: "Compila tutti i campi obbligatori." });
    }
    
   
    const emailValida = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!emailValida) {
        return res.status(400).json({ error: "Indirizzo email non valido." });
    }
    
    
    if (messaggio.length > 5000) {
        return res.status(400).json({ error: "Il messaggio è troppo lungo (max 5000 caratteri)." });
    }
    
    try {
       
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
        
        
        res.status(201).json({ 
            message: "Messaggio inviato con successo! Ti risponderemo al più presto." 
        });
        
    } catch (err) {
        console.error("Errore nell'invio del messaggio:", err);
        res.status(500).json({ error: "Errore durante l'invio. Riprova più tardi." });
    }
});

// API ADMIN 21: LISTA MESSAGGI CONTATTO 

app.get('/api/admin/messaggi', verificaAdmin, async (req, res) => {
    try {
        
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

// API ADMIN 22: CAMBIA STATO MESSAGGIO

app.post('/api/admin/messaggi/cambia-stato', verificaAdmin, async (req, res) => {
    const { id, nuovoStato } = req.body;
    
    
    const statiAmmessi = ['nuovo', 'letto', 'risolto'];
    if (!statiAmmessi.includes(nuovoStato)) {
        return res.status(400).json({ error: "Stato non valido." });
    }
    
    try {
     
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

//  API 23: ELENCO RECENSIONI PUBBLICATE 

app.get('/api/recensioni', async (req, res) => {
    try {
        
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

// API 24: INVIO NUOVA RECENSIONE 

app.post('/api/recensioni', async (req, res) => {
   
    if (!req.session.userId) {
        return res.status(401).json({ error: "Devi essere loggato per scrivere una recensione." });
    }
    
    
    const { stelle, titolo, testo } = req.body;
    
    
    if (!stelle || stelle < 1 || stelle > 5) {
        return res.status(400).json({ error: "Devi assegnare un voto da 1 a 5 stelle." });
    }
    
    
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
        
      
        await pool.query(
            `INSERT INTO recensioni (id_utente, stelle, titolo, testo, stato) 
             VALUES ($1, $2, $3, $4, 'in_attesa')`,
            [req.session.userId, stelle, titolo, testo]
        );
        
       
        res.status(201).json({ 
            message: "Recensione inviata! Sarà visibile dopo l'approvazione dello staff." 
        });
        
    } catch (err) {
        console.error("Errore nell'invio della recensione:", err);
        res.status(500).json({ error: "Errore durante l'invio. Riprova più tardi." });
    }
});

// API ADMIN 25: LISTA TUTTE LE RECENSIONI

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

// API ADMIN 26: CAMBIA STATO RECENSIONE 

app.post('/api/admin/recensioni/cambia-stato', verificaAdmin, async (req, res) => {
    const { id, nuovoStato } = req.body;
    

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


app.use((req, res) => {
  res.sendFile(path.join(ROOT, 'index.html'));
});


app.listen(port, () => {
   
    console.log(`Server Back-end in esecuzione su http://localhost:${port}`);
});
