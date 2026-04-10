/* =========================================================
   STILI GLOBALI (Validi per tutto il sito)
   ========================================================= */

/* --- STILI BASE --- */
/* Ho impostato un font pulito e rimosso i margini di default del browser 
   per avere un controllo totale sugli spazi. */
body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    margin: 0;
    padding: 0;
    line-height: 1.6;
}

/* =========================================================
   STILI PER LA HOME PAGE (index.html)
   ========================================================= */

/* --- BACKGROUND HOME --- */
/* Sulla Home Page ho applicato questa classe al tag <body> per inserire 
   l'immagine di sfondo fissa (effetto parallasse). */
.home-body {
    background-image: url('web.jpg');
    background-size: cover;
    background-position: center;
    background-attachment: fixed;
}

/* --- TITOLO PRINCIPALE HOME --- */
.main-title { 
    text-align: center;
    color: white;
    font-size: 3.5em; 
    margin-top: 20px; 
    margin-bottom: 0px; 
    font-weight: 900; 
    -webkit-text-stroke: 3px black; 
    text-shadow: 2px 2px 5px rgba(0,0,0,0.5); 
}

/* --- MENU DI NAVIGAZIONE --- */
/* Ho posizionato il contenitore del menu in modo assoluto in alto a destra. */
.menu-container {
    position: absolute; 
    top: 15px;
    right: 20px;
    display: inline-block;
    z-index: 1000;
}

/* Il pulsante Hamburger: ho usato 'user-select: none' per evitare 
   che l'utente evidenzi il testo cliccando velocemente. */
.hamburger {  
    font-size: 35px;
    cursor: pointer; 
    user-select: none;
    color: #ffffff; 
    text-shadow: 1px 1px 4px rgba(0,0,0,0.8); 
}

/* Il menu a tendina è inizialmente nascosto ('display: none'). 
   Verrà mostrato tramite JavaScript aggiungendo la classe '.show'. */
.menu-dropdown { 
    display: none; 
    position: absolute;
    right: 0;
    background-color: #ffffff;
    min-width: 200px;
    box-shadow: 0px 8px 16px rgba(0,0,0,0.2); 
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid #ddd;
}

.menu-dropdown.show { 
    display: block;
}

.menu-dropdown a { 
    color: #333;
    padding: 14px 20px;
    text-decoration: none;
    display: block;
    font-size: 16px;
    border-bottom: 1px solid #eee;
}

.menu-dropdown a:hover {
    background-color: #f1f1f1;
    color: #007bff;
}

/* Sottomenu di esplorazione */
.submenu-content { 
    display: none; 
    background-color: #f8f9fa; 
}

.submenu-content.show {
    display: block; 
}

.submenu-content a { 
    padding: 12px 20px 12px 40px; 
    font-size: 15px;
}

/* --- FORM DI RICERCA (HOME) --- */
/* Ho stilizzato il contenitore del form con un effetto "glassmorphism" 
   (vetro semi-trasparente) per renderlo leggibile sullo sfondo fotografico. */
.main-content {
    margin-top: 25vh; 
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
    background: rgba(100, 100, 100, 0.4); 
    padding: 30px;
    border-radius: 12px;
    box-shadow: 0 8px 20px rgba(0,0,0,0.2);
}

.form-group {
    margin-bottom: 20px;
}

.form-group label {
    display: block;
    font-weight: bold;
    margin-bottom: 8px;
    color: #ffffff; 
}

/* Gli input e le tendine <select> */
.form-group select, .form-group input {
    width: 100%;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
    font-size: 16px;
    box-sizing: border-box; 
}

/* Il bottone di submit del form */
#bottoneCerca {
    width: 100%; 
    padding: 12px; 
    margin-top: 15px; 
    background-color: #007bff; 
    color: white; 
    border: none; 
    border-radius: 5px; 
    font-size: 18px; 
    font-weight: bold; 
    cursor: pointer;
}

/* =========================================================
   STILI PER LA PAGINA DESTINAZIONE (algeria.html)
   ========================================================= */

/* --- APPLICAZIONE FLEXBOX (Rif: 03-responsive-design.pdf) --- */
/* Ho usato Flexbox sull'header per centrare dinamicamente il nome del paese 
   rispetto allo schermo, indipendentemente dalla risoluzione. */
.fascia-foto {
    background-image: url('algeria.jpg');
    background-size: cover;
    background-position: center;
    background-attachment: fixed; 
    width: 100%;
    height: 75vh; 
    display: flex; 
    justify-content: center; 
    align-items: center; 
}   

.fascia-titolo {  
    text-align: center;
    color: white;
    font-size: 5em; 
    margin: 0; 
    font-weight: 900; 
    -webkit-text-stroke: 3px black; 
    text-shadow: 2px 2px 5px rgba(0,0,0,0.5); 
}

.fascia-testo {
    padding: 60px 40px; 
    max-width: 1000px; 
    margin: 0 auto; 
    line-height: 1.8; 
    font-size: 1.2em; 
    text-align: justify; 
    color: #333; 
}

.titolo-sezione {
    text-align: center;
    font-size: 2em;
    color: #333;
    margin-top: 40px;
    margin-bottom: 30px;
    font-weight: bold;
    text-transform: uppercase;
}

/* --- STILI ACCORDION (ITINERARIO) --- */
.itinerario-container {
    max-width: 1000px;
    margin: 0 auto 80px auto; 
    background-color: white;
    box-shadow: 0 4px 10px rgba(0,0,0,0.05); 
}

.accordion {
    background-color: white;
    color: #20b2aa; 
    cursor: pointer;
    padding: 20px;
    width: 100%;
    text-align: left;
    border: none;
    border-bottom: 1px solid #eee; 
    outline: none;
    font-size: 1.2em;
    font-weight: bold;
    display: flex;
    justify-content: space-between; 
    align-items: center;
    transition: 0.3s;
}

.accordion:hover { background-color: #f9f9f9; }

.accordion:after {
    content: '\002B'; 
    font-size: 1.5em;
    font-weight: normal;
    color: #20b2aa;
}

.active:after { content: "\2212"; }

.panel {
    display: none; 
    background-size: cover;
    background-position: center;
    background-attachment: fixed; 
    border-bottom: 1px solid #eee;
}

.testo-giorno {
    background-color: rgba(255, 255, 255, 0.6); 
    margin: 30px; 
    padding: 25px;
    border-radius: 8px;
    color: #333;
    line-height: 1.6;
    font-size: 1.1em;
    text-shadow: 1px 1px 1px rgba(255,255,255,0.5);
}

.testo-giorno b { color: #000; }

/* --- APPLICAZIONE CSS GRID (Rif: 03-responsive-design.pdf) --- */
/* Ho implementato la CSS Grid per impaginare la galleria fotografica. 
   Questo mi garantisce 3 colonne perfettamente uguali gestite in modo nativo dal browser. */
.galleria-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr); 
    gap: 20px; 
    max-width: 1000px;
    margin: 0 auto 50px auto;
    padding: 0 20px;
}

.foto-grid {
    height: 250px;
    background-size: cover;
    background-position: center;
    border-radius: 10px;
}

/* =========================================================
   MEDIA QUERIES E RESPONSIVE DESIGN (Rif: 03-responsive-design.pdf)
   ========================================================= */
/* Ho impostato un breakpoint a 768px (misura tipica dei tablet verticali e smartphone). 
   Le regole qui sotto sovrascrivono quelle precedenti se lo schermo è più piccolo. */
@media screen and (max-width: 768px) {
    
    /* Ridimensiono i titoli giganti di entrambe le pagine */
    .main-title, .fascia-titolo {
        font-size: 2.5em; 
    }
    
    /* Sulla Home, il form deve allargarsi per occupare bene lo schermo piccolo */
    .main-content {
        width: 90%; 
        padding: 20px;
        margin-top: 15vh;
    }
    
    /* Sulla pagina destinazione, linearizzo la CSS Grid passando da 3 colonne a 1 colonna singola */
    .galleria-grid {
        grid-template-columns: 1fr; 
    }
}
