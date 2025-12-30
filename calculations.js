// calculations.js - Slider Calculations and Save Logic

const MIN_VALUE = 1;
const MAX_VALUE = 20;

// Update a slider value (1-10 scale, independent)
function updateValue(type, newValue) {
    newValue = Math.max(MIN_VALUE, Math.min(MAX_VALUE, parseInt(newValue)));
    
    if (type === 'stressor') state.stressorValue = newValue;
    else if (type === 'stabilizer') state.stabilizerValue = newValue;
    else if (type === 'opportunity') state.opportunityValue = newValue;
    
    updateVisualization();
}

// Calculate percentages from values for visualization
function getPercentages() {
    const total = state.stressorValue + state.stabilizerValue + state.opportunityValue;
    return {
        stressorPercent: (state.stressorValue / total) * 100,
        stabilizerPercent: (state.stabilizerValue / total) * 100,
        opportunityPercent: (state.opportunityValue / total) * 100
    };
}

function updateNotes(type, text) {
    if (type === 'stressor') state.stressorNotes = text;
    else if (type === 'stabilizer') state.stabilizerNotes = text;
    else if (type === 'opportunity') state.opportunityNotes = text;
    updateVisualization(); // Update visualization to show notes
}

function validateSave() {
    const errors = [];
    
    if (!state.topicLabel || !state.topicLabel.trim()) {
        errors.push('Please enter a Topic Label');
    }
    
    return errors;
}

async function saveCheckIn() {
    const errors = validateSave();
    
    if (errors.length > 0) {
        state.saveError = errors.join(', ');
        render();
        return;
    }
    
    state.saveError = null;
    
    const percentages = getPercentages();
    const entry = {
        timestamp: new Date().toISOString(),
        topicLabel: state.topicLabel,
        lifeArea: state.activeLifeArea,
        hijackingEvent: state.hijackingEvent,
        stressorValue: state.stressorValue,
        stabilizerValue: state.stabilizerValue,
        opportunityValue: state.opportunityValue,
        stressorPercent: Math.round(percentages.stressorPercent),
        stabilizerPercent: Math.round(percentages.stabilizerPercent),
        opportunityPercent: Math.round(percentages.opportunityPercent),
        stressorNotes: state.stressorNotes,
        stabilizerNotes: state.stabilizerNotes,
        opportunityNotes: state.opportunityNotes
    };
    
    state.entries.unshift(entry);
    
    const saved = await saveToFirestore(entry);
    
    if (saved) {
        alert('✓ Check-in saved to cloud successfully!');
        resetForm();
        render();
        displayEntries();
    } else {
        alert('✗ ERROR: Failed to save check-in to cloud. Your data was NOT saved. Please try again.');
        // Remove from local state since it didn't save
        state.entries.shift();
    }
}

function resetForm() {
    state.stressorValue = 10;
    state.stabilizerValue = 10;
    state.opportunityValue = 10;
    state.stressorNotes = '';
    state.stabilizerNotes = '';
    state.opportunityNotes = '';
    state.topicLabel = '';
    state.hijackingEvent = '';
    state.activeLifeArea = null;
    state.saveError = null;
}

function resetAllSliders() {
    resetForm();
    render();
    updateVisualization();
}
