// calculations.js - Slider Calculations and Save Logic

const MIN_PERCENT = 10;
const MAX_PERCENT = 80;

// Update a percentage slider and rebalance others
function updatePercent(type, newValue) {
    newValue = Math.max(MIN_PERCENT, Math.min(MAX_PERCENT, parseInt(newValue)));
    
    if (type === 'stressor') {
        state.stressorPercent = newValue;
        // Distribute remaining between stabilizer and opportunity
        const remaining = 100 - newValue;
        const ratio = state.stabilizerPercent / (state.stabilizerPercent + state.opportunityPercent);
        state.stabilizerPercent = Math.max(MIN_PERCENT, Math.min(MAX_PERCENT, Math.round(remaining * ratio)));
        state.opportunityPercent = 100 - state.stressorPercent - state.stabilizerPercent;
    } else if (type === 'stabilizer') {
        state.stabilizerPercent = newValue;
        const remaining = 100 - newValue;
        const ratio = state.stressorPercent / (state.stressorPercent + state.opportunityPercent);
        state.stressorPercent = Math.max(MIN_PERCENT, Math.min(MAX_PERCENT, Math.round(remaining * ratio)));
        state.opportunityPercent = 100 - state.stabilizerPercent - state.stressorPercent;
    } else if (type === 'opportunity') {
        state.opportunityPercent = newValue;
        const remaining = 100 - newValue;
        const ratio = state.stressorPercent / (state.stressorPercent + state.stabilizerPercent);
        state.stressorPercent = Math.max(MIN_PERCENT, Math.min(MAX_PERCENT, Math.round(remaining * ratio)));
        state.stabilizerPercent = 100 - state.opportunityPercent - state.stressorPercent;
    }
    
    // Ensure all are within bounds and sum to 100
    normalizePercents();
    updateVisualization();
    render();
}

function normalizePercents() {
    // Ensure each is at least MIN_PERCENT
    state.stressorPercent = Math.max(MIN_PERCENT, state.stressorPercent);
    state.stabilizerPercent = Math.max(MIN_PERCENT, state.stabilizerPercent);
    state.opportunityPercent = Math.max(MIN_PERCENT, state.opportunityPercent);
    
    // Adjust to sum to 100
    const total = state.stressorPercent + state.stabilizerPercent + state.opportunityPercent;
    if (total !== 100) {
        const diff = 100 - total;
        // Add/subtract from the largest one
        if (state.stressorPercent >= state.stabilizerPercent && state.stressorPercent >= state.opportunityPercent) {
            state.stressorPercent += diff;
        } else if (state.stabilizerPercent >= state.opportunityPercent) {
            state.stabilizerPercent += diff;
        } else {
            state.opportunityPercent += diff;
        }
    }
}

function updateNotes(type, text) {
    if (type === 'stressor') state.stressorNotes = text;
    else if (type === 'stabilizer') state.stabilizerNotes = text;
    else if (type === 'opportunity') state.opportunityNotes = text;
}

function validateSave() {
    const errors = [];
    
    if (!state.topicLabel || !state.topicLabel.trim()) {
        errors.push('Please enter a Topic Label');
    }
    
    const total = state.stressorPercent + state.stabilizerPercent + state.opportunityPercent;
    if (Math.abs(total - 100) > 1) {
        errors.push('Percentages must sum to 100%');
    }
    
    return errors;
}

async function saveCheckIn() {
    const errors = validateSave();
    if (errors.length > 0) {
        state.saveError = errors.join('<br>');
        render();
        setTimeout(() => {
            const errorDiv = document.getElementById('saveError');
            if (errorDiv) errorDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
        return;
    }

    state.saveError = null;

    const entry = {
        timestamp: new Date().toISOString(),
        topicLabel: state.topicLabel,
        lifeArea: state.activeLifeArea ? state.lifeAreas[state.activeLifeArea].label : 'General',
        hijackingEvent: state.hijackingEvent || 'not specified',
        stressorPercent: state.stressorPercent,
        stabilizerPercent: state.stabilizerPercent,
        opportunityPercent: state.opportunityPercent,
        stressorNotes: state.stressorNotes,
        stabilizerNotes: state.stabilizerNotes,
        opportunityNotes: state.opportunityNotes
    };

    await saveToFirestore(entry);
    
    state.entries.unshift(entry);
    saveToUserStorage('entries', JSON.stringify(state.entries));

    // Reset form
    resetForm();
    render();
    displayEntries();
}

function resetForm() {
    state.topicLabel = '';
    state.activeLifeArea = null;
    state.hijackingEvent = '';
    state.stressorPercent = 34;
    state.stabilizerPercent = 33;
    state.opportunityPercent = 33;
    state.stressorNotes = '';
    state.stabilizerNotes = '';
    state.opportunityNotes = '';
    state.saveError = null;
}

// Local storage helpers
function saveToUserStorage(key, value) {
    if (state.user) {
        localStorage.setItem(state.user.uid + '_' + key, value);
    }
}

function loadFromUserStorage(key) {
    if (state.user) {
        return localStorage.getItem(state.user.uid + '_' + key);
    }
    return null;
}
