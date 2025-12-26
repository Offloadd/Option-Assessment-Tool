// firestore.js - Firestore Integration

import { collection, doc, setDoc, getDoc, getDocs, query, orderBy, limit, deleteDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

window.saveToFirestore = async function(entry) {
    if (!state.user) return;
    
    try {
        const userDoc = doc(window.db, 'users', state.user.uid);
        const entriesCollection = collection(userDoc, 'entries');
        const entryDoc = doc(entriesCollection, entry.timestamp);
        
        await setDoc(entryDoc, entry);
        console.log('Entry saved to Firestore');
    } catch (error) {
        console.error('Error saving to Firestore:', error);
    }
}

window.loadFromFirestore = async function() {
    if (!state.user) return;
    
    try {
        // Load life areas
        const userDocRef = doc(window.db, 'users', state.user.uid);
        const userDocSnap = await getDoc(userDocRef);
        
        if (userDocSnap.exists() && userDocSnap.data().lifeAreas) {
            state.lifeAreas = userDocSnap.data().lifeAreas;
            console.log('Loaded life areas from Firestore');
        }
        
        // Load entries
        const entriesCollection = collection(userDocRef, 'entries');
        const q = query(entriesCollection, orderBy('timestamp', 'desc'), limit(100));
        const querySnapshot = await getDocs(q);
        
        state.entries = [];
        querySnapshot.forEach((doc) => {
            state.entries.push(doc.data());
        });
        
        console.log('Loaded', state.entries.length, 'entries from Firestore');
    } catch (error) {
        console.error('Error loading from Firestore:', error);
    }
}

window.saveLifeAreasToFirestore = async function(lifeAreas) {
    if (!state.user) return;
    
    try {
        const userDoc = doc(window.db, 'users', state.user.uid);
        await setDoc(userDoc, { lifeAreas }, { merge: true });
        console.log('Life areas saved to Firestore');
    } catch (error) {
        console.error('Error saving life areas:', error);
    }
}

window.deleteEntryFromFirestore = async function(timestamp) {
    if (!state.user) return;
    
    try {
        const userDoc = doc(window.db, 'users', state.user.uid);
        const entryDoc = doc(collection(userDoc, 'entries'), timestamp);
        await deleteDoc(entryDoc);
        console.log('Entry deleted from Firestore');
    } catch (error) {
        console.error('Error deleting entry:', error);
    }
}
