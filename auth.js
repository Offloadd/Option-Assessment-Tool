// auth.js - Authentication

import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

window.handleLogin = async function() {
    const email = document.getElementById('emailInput').value;
    const password = document.getElementById('passwordInput').value;
    
    if (!email || !password) {
        showAuthMessage('Please enter both email and password');
        return;
    }

    try {
        await signInWithEmailAndPassword(window.auth, email, password);
    } catch (error) {
        showAuthMessage('Error: ' + error.message);
    }
};

window.handleSignup = async function() {
    const email = document.getElementById('emailInput').value;
    const password = document.getElementById('passwordInput').value;
    
    if (!email || !password) {
        showAuthMessage('Please enter both email and password');
        return;
    }

    try {
        await createUserWithEmailAndPassword(window.auth, email, password);
    } catch (error) {
        showAuthMessage('Error: ' + error.message);
    }
};

function showAuthMessage(message) {
    document.getElementById('authMessage').textContent = message;
}

window.handleLogout = async function() {
    try {
        await signOut(window.auth);
        window.location.reload();
    } catch (error) {
        console.error('Logout error:', error);
    }
};

// Auth state observer
onAuthStateChanged(window.auth, async (user) => {
    if (user) {
        state.user = user;
        document.getElementById('authContainer').style.display = 'none';
        document.getElementById('app').style.display = 'block';
        document.getElementById('userEmail').textContent = user.email;
        
        await loadFromFirestore();
        render();
        displayEntries();
    } else {
        state.user = null;
        document.getElementById('authContainer').style.display = 'flex';
        document.getElementById('app').style.display = 'none';
    }
});
