// Auth.js - Handles real user accounts via Supabase Auth
// Uses the same SUPABASE_URL / SUPABASE_ANON_KEY defined in supabase.js
// IMPORTANT: this file must be loaded AFTER supabase.js on every page

const AUTH_URL = SUPABASE_URL + '/auth/v1';

const Auth = {
    session: null,

    async signUp(name, email, password) {
        const res = await fetch(`${AUTH_URL}/signup`, {
            method: 'POST',
            headers: { 'apikey': SUPABASE_ANON_KEY, 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, data: { name } })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.msg || data.error_description || 'Sign up failed');
        if (data.access_token) this.setSession(data);
        return data;
    },

    async signIn(email, password) {
        const res = await fetch(`${AUTH_URL}/token?grant_type=password`, {
            method: 'POST',
            headers: { 'apikey': SUPABASE_ANON_KEY, 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error_description || data.msg || 'Invalid email or password');
        this.setSession(data);
        return data;
    },

    setSession(data) {
        const session = {
            access_token: data.access_token,
            refresh_token: data.refresh_token,
            user: data.user
        };
        localStorage.setItem('devbridge_session', JSON.stringify(session));
        this.session = session;
    },

    getSession() {
        if (this.session) return this.session;
        const raw = localStorage.getItem('devbridge_session');
        if (raw) {
            try { this.session = JSON.parse(raw); } catch (e) { this.session = null; }
        }
        return this.session;
    },

    isLoggedIn() {
        return !!this.getSession()?.access_token;
    },

    signOut() {
        localStorage.removeItem('devbridge_session');
        localStorage.removeItem('devbridge_data');
        this.session = null;
        window.location.href = 'login.html';
    },

    // Fetch the person's row from the profiles table (name, is_admin, etc.)
    async getProfile() {
        const session = this.getSession();
        if (!session) return null;
        const res = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${session.user.id}`, {
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${session.access_token}`
            }
        });
        if (!res.ok) return null;
        const rows = await res.json();
        return rows[0] || null;
    }
};

// Redirect to login if not signed in. Call this at the top of any page that requires login.
function requireLogin() {
    if (!Auth.isLoggedIn()) {
        window.location.href = 'login.html';
    }
}