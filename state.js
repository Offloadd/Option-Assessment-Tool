// state.js - Application State

const state = {
    user: null,
    
    // Check-in state
    topicLabel: '',
    activeLifeArea: null,
    hijackingEvent: '',
    
    // Slider values (1-10 scale, independent)
    stressorValue: 5,
    stabilizerValue: 5,
    opportunityValue: 5,
    
    // Detail notes for each zone
    stressorNotes: '',
    stabilizerNotes: '',
    opportunityNotes: '',
    
    // Life areas
    lifeAreas: {
        work: { label: 'Work', visible: true, custom: false },
        relationships: { label: 'Relationships', visible: true, custom: false },
        health: { label: 'Health', visible: true, custom: false },
        finances: { label: 'Finances', visible: true, custom: false },
        personal: { label: 'Personal Growth', visible: true, custom: false },
        home: { label: 'Home/Living', visible: true, custom: false }
    },
    
    entries: [],
    saveError: null
};

// Initialize app
function initApp() {
    console.log('State initialized - waiting for authentication');
}

// Call init
initApp();
