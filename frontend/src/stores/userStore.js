import { reactive } from 'vue'

// STORE GLOBALE UTENTE 
// Abbiamo creato un oggetto reattivo condiviso tra tutti i componenti dell'app.
 

export const userStore = reactive({
    // Abbiamo definito la variabile che dice se l'utente è loggato o meno
    loggato: false,
    // Abbiamo definito la variabile che conserva l'ID dell'utente nel database
    userId: null,
    // Abbiamo definito la variabile che conserva lo username da mostrare nel menu
    username: null,
    // Abbiamo definito la variabile che indica se l'utente loggato è admin
    isAdmin: false,

    // Abbiamo creato una funzione per impostare l'utente al momento del login
    setUser(userId, username, isAdmin = false) {
        this.loggato = true;
        this.userId = userId;
        this.username = username;
        this.isAdmin = isAdmin;
    },

    // Abbiamo creato una funzione per svuotare lo store al momento del logout
    clearUser() {
        this.loggato = false;
        this.userId = null;
        this.username = null;
        this.isAdmin = false;
    },

    // Abbiamo creato una funzione asincrona che esegue il logout completo 
    async logout() {
        try {
            // Abbiamo chiamato l'endpoint di logout del backend includendo i cookie di sessione
            await fetch('/api/logout', {
                method: 'POST',
                credentials: 'include'
            });
        } catch (err) {
            // Abbiamo registrato eventuali errori in console 
            console.error('Errore durante il logout:', err);
        }
        // Abbiamo svuotato lo store locale per aggiornare  l'interfaccia
        this.clearUser();
    }
});
