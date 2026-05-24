import { reactive } from 'vue'
 

export const userStore = reactive({
    
    loggato: false,
    
    userId: null,
    username: null,
    isAdmin: false,

    setUser(userId, username, isAdmin = false) {
        this.loggato = true;
        this.userId = userId;
        this.username = username;
        this.isAdmin = isAdmin;
    },

    clearUser() {
        this.loggato = false;
        this.userId = null;
        this.username = null;
        this.isAdmin = false;
    },

    async logout() {
        try {
           
            await fetch('/api/logout', {
                method: 'POST',
                credentials: 'include'
            });
        } catch (err) {
            console.error('Errore durante il logout:', err);
        }
        this.clearUser();
    }
});
