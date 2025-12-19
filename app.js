// State object - simplified for option assessment
const state = {
    // Active assessment
    activeLifeArea: null,
    activeOptionText: '',
    
    // Assessment sliders (0-10 scale)
    opportunity: { value: 0, why: '' },
    stressor: { value: 0, why: '' },
    stabilizer: { value: 0, why: '' },
    
    // Life areas - what options you're considering
    lifeAreas: {
        work: { label: 'Work/Projects', visible: true, custom: false },
        homeImprovement: { label: 'Home Improvements', visible: true, custom: false },
        moneyHandling: { label: 'Money/Resources', visible: true, custom: false },
        relationships: { label: 'Relationships', visible: true, custom: false },
        healthExercise: { label: 'Health/Exercise', visible: true, custom: false },
        learning: { label: 'Learning/Growth', visible: true, custom: false }
    },
    
    // Saved entries
    entries: [],
    saveError: ''
};

// Load a life area into assessment zone
function loadLifeArea(areaKey) {
    // If clicking the same area, deselect it
    if (state.activeLifeArea === areaKey) {
        state.activeLifeArea = null;
        state.activeOptionText = '';
        resetAssessment();
    } else {
        state.activeLifeArea = areaKey;
        state.activeOptionText = '';
        resetAssessment();
    }
    render();
}

// Reset assessment sliders
function resetAssessment() {
    state.opportunity = { value: 0, why: '' };
    state.stressor = { value: 0, why: '' };
    state.stabilizer = { value: 0, why: '' };
}

// Update assessment slider
function updateAssessment(type, value) {
    state[type].value = parseInt(value);
    updateVisualization();
}

// Update assessment text
function updateAssessmentText(type, text) {
    state[type].why = text;
}

// Update option text
function updateOptionText(text) {
    state.activeOptionText = text;
}

// Toggle textarea visibility
function toggleTextArea(type) {
    const textarea = document.getElementById(type + 'Text');
    if (textarea) {
        textarea.style.display = textarea.style.display === 'none' ? 'block' : 'none';
    }
}

// Add custom life area
function addLifeArea() {
    const label = prompt('Enter name for new life area:');
    if (!label || !label.trim()) return;
    
    const key = 'custom_' + Date.now();
    state.lifeAreas[key] = {
        label: label.trim(),
        visible: true,
        custom: true
    };
    saveLifeAreas();
    render();
}

// Edit life area
function editLifeArea(areaKey) {
    const area = state.lifeAreas[areaKey];
    const newLabel = prompt('Edit life area name:', area.label);
    if (!newLabel || !newLabel.trim()) return;
    
    area.label = newLabel.trim();
    saveLifeAreas();
    render();
}

// Delete life area
function deleteLifeArea(areaKey) {
    if (!confirm('Delete this life area?')) return;
    
    // If this area is currently active, deselect it
    if (state.activeLifeArea === areaKey) {
        state.activeLifeArea = null;
        state.activeOptionText = '';
        resetAssessment();
    }
    
    delete state.lifeAreas[areaKey];
    saveLifeAreas();
    render();
}

// Toggle life area visibility
function toggleLifeAreaVisible(areaKey) {
    state.lifeAreas[areaKey].visible = !state.lifeAreas[areaKey].visible;
    saveLifeAreas();
    render();
}

// Save life areas to localStorage
function saveLifeAreas() {
    localStorage.setItem('offloadLifeAreas', JSON.stringify(state.lifeAreas));
}

// Load life areas from localStorage
function loadLifeAreas() {
    try {
        const saved = localStorage.getItem('offloadLifeAreas');
        if (saved) {
            state.lifeAreas = JSON.parse(saved);
        }
    } catch (e) {
        console.error('Error loading life areas:', e);
    }
}

// Get slider gradient
function getAssessmentGradient(type) {
    if (type === 'stressor') {
        return 'linear-gradient(to right, #ffeb3b 0%, #ff9800 50%, #f44336 100%)';
    } else if (type === 'stabilizer') {
        return 'linear-gradient(to right, #bbdefb 0%, #1976d2 100%)';
    } else if (type === 'opportunity') {
        return 'linear-gradient(to right, #c8e6c9 0%, #4caf50 50%, #cddc39 100%)';
    }
    return 'linear-gradient(to right, #d1d5db 0%, #d1d5db 100%)';
}

// Calculate loads for visualization
function getThreatLoad() {
    return state.stressor.value;
}

function getOpportunityLoad() {
    return state.opportunity.value;
}

function getRegulatedLoad() {
    return state.stabilizer.value;
}

// Save entry
function saveEntry() {
    if (!state.activeLifeArea) {
        state.saveError = 'Please select a life area to assess';
        render();
        return;
    }
    
    if (!state.activeOptionText.trim()) {
        state.saveError = 'Please describe the specific option you\'re considering';
        render();
        return;
    }
    
    const hasData = state.opportunity.value > 0 || state.stressor.value > 0 || state.stabilizer.value > 0;
    if (!hasData) {
        state.saveError = 'Please rate at least one assessment slider';
        render();
        return;
    }
    
    state.saveError = '';
    
    const entry = {
        timestamp: new Date().toISOString(),
        lifeArea: state.lifeAreas[state.activeLifeArea].label,
        optionText: state.activeOptionText,
        opportunity: { value: state.opportunity.value, why: state.opportunity.why },
        stressor: { value: state.stressor.value, why: state.stressor.why },
        stabilizer: { value: state.stabilizer.value, why: state.stabilizer.why },
        threatLoad: getThreatLoad(),
        opportunityLoad: getOpportunityLoad(),
        regulatedLoad: getRegulatedLoad()
    };
    
    state.entries.unshift(entry);
    localStorage.setItem('offloadEntries', JSON.stringify(state.entries));
    
    // Reset assessment
    state.activeLifeArea = null;
    state.activeOptionText = '';
    resetAssessment();
    
    render();
}

// Load entries from localStorage
function loadEntries() {
    try {
        const saved = localStorage.getItem('offloadEntries');
        if (saved) {
            state.entries = JSON.parse(saved);
        }
    } catch (e) {
        console.error('Error loading entries:', e);
    }
}

// Copy entries
function copyEntries() {
    const text = state.entries.map(e => {
        const date = new Date(e.timestamp).toLocaleString();
        return '=== ' + date + ' ===\n' +
               'Life Area: ' + e.lifeArea + '\n' +
               'Option: ' + e.optionText + '\n' +
               'Opportunity: ' + e.opportunity.value + ' - ' + e.opportunity.why + '\n' +
               'Stressor: ' + e.stressor.value + ' - ' + e.stressor.why + '\n' +
               'Stabilizer: ' + e.stabilizer.value + ' - ' + e.stabilizer.why;
    }).join('\n\n');
    navigator.clipboard.writeText(text);
    alert('Entries copied to clipboard!');
}

// Clear entries
function clearEntries() {
    if (confirm('Clear all saved entries? This cannot be undone.')) {
        state.entries = [];
        localStorage.removeItem('offloadEntries');
        render();
    }
}

// Delete single entry
function deleteEntry(index) {
    if (confirm('Delete this entry?')) {
        state.entries.splice(index, 1);
        localStorage.setItem('offloadEntries', JSON.stringify(state.entries));
        render();
    }
}

// Update visualization
function updateVisualization() {
    const visualization = document.getElementById('visualization');
    if (!visualization) return;

    const gateShapeTop = document.getElementById('gateShapeTop');
    const gateShapeBottom = document.getElementById('gateShapeBottom');
    const gateTextTop = document.getElementById('gateTextTop');
    const gateTextBottom = document.getElementById('gateTextBottom');
    const riverChannel = document.getElementById('riverChannel');
    const riverWater = document.getElementById('riverWater');
    const riverText = document.getElementById('riverText');

    const threatLoad = getThreatLoad();
    const opportunityLoad = getOpportunityLoad();
    const regulatedLoad = getRegulatedLoad();

    const height = 300;
    const maxLoad = 50;
    const minGateHeight = 30;

    // Calculate reduction from regulated load
    const regulatedReduction = regulatedLoad * 2;

    // Gates grow based on loads, reduced by stabilizer
    let topGateHeight = minGateHeight + Math.max(0, Math.min((threatLoad / maxLoad) * height * 1.8, height * 0.9) - regulatedReduction);
    let bottomGateHeight = minGateHeight + Math.max(0, Math.min((opportunityLoad / maxLoad) * height * 1.8, height * 0.9) - regulatedReduction);

    const combinedHeight = topGateHeight + bottomGateHeight;
    const maxCombined = height * 0.9;

    if (combinedHeight > maxCombined) {
        const scaleFactor = maxCombined / combinedHeight;
        topGateHeight = Math.max(minGateHeight, topGateHeight * scaleFactor);
        bottomGateHeight = Math.max(minGateHeight, bottomGateHeight * scaleFactor);
    }

    gateShapeTop.style.height = topGateHeight + 'px';
    gateShapeBottom.style.height = bottomGateHeight + 'px';

    const availableSpace = height - topGateHeight - bottomGateHeight;

    const topPercent = Math.round((topGateHeight / height) * 100);
    const bottomPercent = Math.round((bottomGateHeight / height) * 100);
    const middlePercent = Math.round((availableSpace / height) * 100);

    gateTextTop.textContent = 'Stress - ' + topPercent + '%';
    gateTextBottom.textContent = 'Opportunity - ' + bottomPercent + '%';

    const percentagesDisplay = document.getElementById('currentPercentages');
    if (percentagesDisplay) {
        percentagesDisplay.textContent = 'Stress: ' + topPercent + '% | Regulated: ' + middlePercent + '% | Opportunity: ' + bottomPercent + '%';
    }

    const regulatedFactor = regulatedLoad / 30;

    const maxThreatForColor = 40;
    const maxOppForColor = 40;
    const maxRegForColor = 30;

    const threatIntensity = Math.min(threatLoad / maxThreatForColor, 1);
    const opportunityIntensity = Math.min(opportunityLoad / maxOppForColor, 1);
    const regulatedIntensity = Math.min(regulatedLoad / maxRegForColor, 1);

    let threatR, threatG, threatB;
    if (threatIntensity === 0) {
        threatR = 255; threatG = 240; threatB = 150;
    } else if (threatIntensity < 0.5) {
        const factor = threatIntensity * 2;
        threatR = 255;
        threatG = Math.round(240 - (80 * factor));
        threatB = Math.round(150 - (90 * factor));
    } else {
        const factor = (threatIntensity - 0.5) * 2;
        threatR = 255;
        threatG = Math.round(160 - (92 * factor));
        threatB = Math.round(60 - (60 * factor));
    }

    let riverR, riverG, riverB;
    if (regulatedIntensity === 0) {
        riverR = 180; riverG = 180; riverB = 180;
    } else {
        riverR = Math.round(180 - (112 * regulatedIntensity));
        riverG = Math.round(180 - (44 * regulatedIntensity));
        riverB = Math.round(180 + (75 * regulatedIntensity));
    }

    let oppR, oppG, oppB;
    if (opportunityIntensity === 0) {
        oppR = 180; oppG = 230; oppB = 180;
    } else if (opportunityIntensity < 0.5) {
        const factor = opportunityIntensity * 2;
        oppR = Math.round(200 - (132 * factor));
        oppG = Math.round(230 - (25 * factor));
        oppB = Math.round(200 - (132 * factor));
    } else {
        const factor = (opportunityIntensity - 0.5) * 2;
        oppR = Math.round(68 + (137 * factor));
        oppG = Math.round(205 + (30 * factor));
        oppB = Math.round(68 - (9 * factor));
    }

    visualization.style.background = 'linear-gradient(to bottom, ' +
        'rgb(' + threatR + ', ' + threatG + ', ' + threatB + ') 0%, ' +
        'rgb(' + threatR + ', ' + threatG + ', ' + threatB + ') ' + ((topGateHeight / height) * 100) + '%, ' +
        'rgb(' + riverR + ', ' + riverG + ', ' + riverB + ') ' + ((topGateHeight / height) * 100) + '%, ' +
        'rgb(' + riverR + ', ' + riverG + ', ' + riverB + ') ' + (((height - bottomGateHeight) / height) * 100) + '%, ' +
        'rgb(' + oppR + ', ' + oppG + ', ' + oppB + ') ' + (((height - bottomGateHeight) / height) * 100) + '%, ' +
        'rgb(' + oppR + ', ' + oppG + ', ' + oppB + ') 100%)';

    const width = 600;
    const riverTop = topGateHeight;
    const riverBottom = height - bottomGateHeight;
    const riverHeight = riverBottom - riverTop;

    const spaceFactor = availableSpace / height;
    const maxChannelWidth = height * 0.5;
    const minChannelWidth = height * 0.08;

    let channelWidth = minChannelWidth + (spaceFactor * (maxChannelWidth - minChannelWidth));
    const regulatedBonus = regulatedFactor * (height * 0.4);
    channelWidth = Math.min(channelWidth + regulatedBonus, riverHeight * 0.95);

    const waterWidth = channelWidth * 0.85;

    const channelTopY = riverTop;
    const channelBottomY = riverBottom;

    const channelPath = 'M 0,' + channelTopY + ' L ' + width + ',' + channelTopY + ' L ' + width + ',' + channelBottomY + ' L 0,' + channelBottomY + ' Z';

    const waterTopY = riverTop + (riverHeight - waterWidth) / 2;
    const waterBottomY = waterTopY + waterWidth;
    const waterPath = 'M 0,' + waterTopY + ' L ' + width + ',' + waterTopY + ' L ' + width + ',' + waterBottomY + ' L 0,' + waterBottomY + ' Z';

    riverChannel.setAttribute('d', channelPath);
    riverWater.setAttribute('d', waterPath);

    const centerY = topGateHeight + (availableSpace / 2);
    riverText.style.top = centerY + 'px';

    riverText.innerHTML = 'Regulated<br>Processing<br>Capacity - ' + middlePercent + '%';

    const availablePercent = availableSpace / height;

    if (availablePercent < 0.3) {
        const fontSize = Math.max(8, availablePercent * 40);
        const letterSpacing = Math.max(0, (0.3 - availablePercent) * 10);
        riverText.style.fontSize = fontSize + 'px';
        riverText.style.letterSpacing = letterSpacing + 'px';
    } else {
        riverText.style.fontSize = '14px';
        riverText.style.letterSpacing = '0px';
    }
}

// Render function
function render() {
    const html =
        // Header
        '<div class="card" style="padding: 12px;">' +
            '<div style="display: flex; align-items: center; justify-content: space-between; gap: 12px;">' +
                '<div>' +
                    '<h1 style="margin-bottom: 4px;">Offload - Option Assessment</h1>' +
                    '<div style="font-size: 13px; color: #6b7280;">Rate how options feel across 3 dimensions</div>' +
                '</div>' +
            '</div>' +
        '</div>' +

        // Life Areas Section
        '<div class="card">' +
            '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">' +
                '<h2 style="margin: 0;">Life Areas & Options</h2>' +
                '<button class="btn" onclick="addLifeArea()" style="background: #16a34a; color: white; font-size: 12px;">+ Add Life Area</button>' +
            '</div>' +
            '<div style="font-size: 13px; color: #6b7280; margin-bottom: 12px;">Click a life area to assess a specific option</div>' +
            '<div class="life-areas-grid">' +
                Object.keys(state.lifeAreas).filter(key => state.lifeAreas[key].visible).map(areaKey => {
                    const area = state.lifeAreas[areaKey];
                    const isActive = state.activeLifeArea === areaKey;
                    return '<div class="life-area-row">' +
                           '<div class="life-area-item ' + (isActive ? 'active' : '') + '" ' +
                           'onclick="loadLifeArea(\'' + areaKey + '\')" style="flex: 1; margin: 0;">' +
                           area.label +
                           (isActive ? ' ✓' : '') +
                           '</div>' +
                           '<button class="btn" onclick="event.stopPropagation(); editLifeArea(\'' + areaKey + '\')" ' +
                                   'style="background: #3b82f6; color: white; padding: 4px 8px; font-size: 11px; flex-shrink: 0;">✏️</button>' +
                           (area.custom ?
                               '<button class="btn" onclick="event.stopPropagation(); deleteLifeArea(\'' + areaKey + '\')" ' +
                                       'style="background: #dc2626; color: white; padding: 4px 8px; font-size: 11px; flex-shrink: 0;">🗑️</button>' :
                               '<button class="btn" onclick="event.stopPropagation(); toggleLifeAreaVisible(\'' + areaKey + '\')" ' +
                                       'style="background: #6b7280; color: white; padding: 4px 8px; font-size: 11px; flex-shrink: 0;">👁️</button>') +
                           '</div>';
                }).join('') +
            '</div>' +
            (Object.keys(state.lifeAreas).filter(key => !state.lifeAreas[key].visible).length > 0 ?
                '<div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #e5e7eb;">' +
                    '<div style="font-size: 12px; font-weight: 600; color: #6b7280; margin-bottom: 6px;">Hidden Areas:</div>' +
                    Object.keys(state.lifeAreas).filter(key => !state.lifeAreas[key].visible).map(areaKey => {
                        const area = state.lifeAreas[areaKey];
                        return '<div style="display: inline-block; margin: 2px;">' +
                               '<button class="btn" onclick="toggleLifeAreaVisible(\'' + areaKey + '\')" ' +
                                       'style="background: #f3f4f6; color: #6b7280; padding: 4px 8px; font-size: 11px; border: 1px solid #d1d5db;">' +
                                   area.label + ' (Show)' +
                               '</button>' +
                               '</div>';
                    }).join('') +
                '</div>' : '') +
        '</div>' +

        // Assessment Zone (Section 4) - Always visible but sliders disabled until life area selected
        '<div class="card">' +
            '<h2 style="margin-bottom: 12px;">' + 
                (state.activeLifeArea ? '🎯 Assessing: ' + state.lifeAreas[state.activeLifeArea].label : 'Select a Life Area to Begin Assessment') +
            '</h2>' +
            '<div class="assessment-container">' +
                '<div style="margin-bottom: 8px;">' +
                    '<label style="display: block; font-weight: 600; margin-bottom: 4px; font-size: 14px;">What specific option are you considering?</label>' +
                    '<input type="text" ' +
                           'value="' + state.activeOptionText + '" ' +
                           'oninput="updateOptionText(this.value);" ' +
                           (state.activeLifeArea ? '' : 'disabled ') +
                           'placeholder="' + (state.activeLifeArea ? 'e.g., Accept Isaac\'s excavation project or Install new kitchen faucet' : 'Select a life area first') + '">' +
                '</div>' +
                
                // Opportunity slider
                '<div class="slider-group">' +
                    '<div style="display: flex; gap: 8px; align-items: center; margin-bottom: 2px;">' +
                        '<div class="slider-label" style="color: #4caf50; white-space: nowrap; font-size: 13px;">💚 Opportunity</div>' +
                        '<div class="slider-value" style="color: #4caf50; font-weight: bold; min-width: 24px; text-align: center;">' + state.opportunity.value + '</div>' +
                        '<div style="flex: 1; max-width: 90%;">' +
                            '<input type="range" min="0" max="10" value="' + state.opportunity.value + '" ' +
                                   'oninput="updateAssessment(\'opportunity\', this.value)" ' +
                                   (state.activeLifeArea ? '' : 'disabled ') +
                                   'style="background: ' + getAssessmentGradient('opportunity') + '; ' + (state.activeLifeArea ? '' : 'opacity: 0.5; cursor: not-allowed;') + '">' +
                        '</div>' +
                        '<button class="btn" onclick="toggleTextArea(\'opportunity\')" ' +
                                (state.activeLifeArea ? '' : 'disabled ') +
                                'style="background: #e5e7eb; color: #374151; padding: 4px 8px; font-size: 11px; white-space: nowrap; ' +
                                (state.activeLifeArea ? '' : 'opacity: 0.5; cursor: not-allowed;') + '">text</button>' +
                    '</div>' +
                    '<textarea id="opportunityText" style="display: none;" ' +
                           'placeholder="Why does this feel like an opportunity? What positive energy or potential does it have?" ' +
                           (state.activeLifeArea ? '' : 'disabled ') +
                           'oninput="updateAssessmentText(\'opportunity\', this.value)">' + state.opportunity.why + '</textarea>' +
                '</div>' +
                
                // Stressor slider
                '<div class="slider-group">' +
                    '<div style="display: flex; gap: 8px; align-items: center; margin-bottom: 2px;">' +
                        '<div class="slider-label" style="color: #f44336; white-space: nowrap; font-size: 13px;">⚠️ Stressor</div>' +
                        '<div class="slider-value" style="color: #f44336; font-weight: bold; min-width: 24px; text-align: center;">' + state.stressor.value + '</div>' +
                        '<div style="flex: 1; max-width: 90%;">' +
                            '<input type="range" min="0" max="10" value="' + state.stressor.value + '" ' +
                                   'oninput="updateAssessment(\'stressor\', this.value)" ' +
                                   (state.activeLifeArea ? '' : 'disabled ') +
                                   'style="background: ' + getAssessmentGradient('stressor') + '; ' + (state.activeLifeArea ? '' : 'opacity: 0.5; cursor: not-allowed;') + '">' +
                        '</div>' +
                        '<button class="btn" onclick="toggleTextArea(\'stressor\')" ' +
                                (state.activeLifeArea ? '' : 'disabled ') +
                                'style="background: #e5e7eb; color: #374151; padding: 4px 8px; font-size: 11px; white-space: nowrap; ' +
                                (state.activeLifeArea ? '' : 'opacity: 0.5; cursor: not-allowed;') + '">text</button>' +
                    '</div>' +
                    '<textarea id="stressorText" style="display: none;" ' +
                           'placeholder="Why does this feel stressful? What threatens or overwhelms you?" ' +
                           (state.activeLifeArea ? '' : 'disabled ') +
                           'oninput="updateAssessmentText(\'stressor\', this.value)">' + state.stressor.why + '</textarea>' +
                '</div>' +
                
                // Stabilizer slider
                '<div class="slider-group">' +
                    '<div style="display: flex; gap: 8px; align-items: center; margin-bottom: 2px;">' +
                        '<div class="slider-label" style="color: #1976d2; white-space: nowrap; font-size: 13px;">🛡️ Stabilizer</div>' +
                        '<div class="slider-value" style="color: #1976d2; font-weight: bold; min-width: 24px; text-align: center;">' + state.stabilizer.value + '</div>' +
                        '<div style="flex: 1; max-width: 90%;">' +
                            '<input type="range" min="0" max="10" value="' + state.stabilizer.value + '" ' +
                                   'oninput="updateAssessment(\'stabilizer\', this.value)" ' +
                                   (state.activeLifeArea ? '' : 'disabled ') +
                                   'style="background: ' + getAssessmentGradient('stabilizer') + '; ' + (state.activeLifeArea ? '' : 'opacity: 0.5; cursor: not-allowed;') + '">' +
                        '</div>' +
                        '<button class="btn" onclick="toggleTextArea(\'stabilizer\')" ' +
                                (state.activeLifeArea ? '' : 'disabled ') +
                                'style="background: #e5e7eb; color: #374151; padding: 4px 8px; font-size: 11px; white-space: nowrap; ' +
                                (state.activeLifeArea ? '' : 'opacity: 0.5; cursor: not-allowed;') + '">text</button>' +
                    '</div>' +
                    '<textarea id="stabilizerText" style="display: none;" ' +
                           'placeholder="Why does this feel stabilizing? What grounds, supports, or regulates you?" ' +
                           (state.activeLifeArea ? '' : 'disabled ') +
                           'oninput="updateAssessmentText(\'stabilizer\', this.value)">' + state.stabilizer.why + '</textarea>' +
                '</div>' +
            '</div>' +
        '</div>' +

        // Visualization
        '<div class="card">' +
            '<h2 style="margin-bottom: 12px;">Window of Tolerance</h2>' +
            '<div class="visualization" id="visualization">' +
                '<div class="color-legend">' +
                    '<div style="position: absolute; top: 1.3%; left: 50%; transform: translateX(-50%); color: black; font-size: 10px; font-weight: bold; text-align: center; z-index: 12; width: 90%; padding: 4px;">' +
                        'Threat<br>Fear, Anger<br>Activated' +
                    '</div>' +
                    '<div style="position: absolute; top: 26.3%; left: 50%; transform: translateX(-50%); color: black; font-size: 10px; font-weight: bold; text-align: center; z-index: 12; width: 90%; padding: 4px;">' +
                        'Worry<br>Anxious<br>Overwhelm' +
                    '</div>' +
                    '<div style="position: absolute; top: 51.3%; left: 50%; transform: translateX(-50%); color: black; font-size: 10px; font-weight: bold; text-align: center; z-index: 12; width: 90%; padding: 4px;">' +
                        'Regulated<br>Calm<br>Grounded' +
                    '</div>' +
                    '<div style="position: absolute; top: 76.3%; left: 50%; transform: translateX(-50%); color: black; font-size: 10px; font-weight: bold; text-align: center; z-index: 12; width: 90%; padding: 4px;">' +
                        'Opportunity<br>Joy, Enthusiasm<br>Expansive' +
                    '</div>' +
                '</div>' +
                '<svg viewBox="0 0 600 300" preserveAspectRatio="none">' +
                    '<defs>' +
                        '<linearGradient id="waterGradient" x1="0%" y1="0%" x2="0%" y2="100%">' +
                            '<stop offset="0%" style="stop-color:#0088ff;stop-opacity:0.4" />' +
                            '<stop offset="100%" style="stop-color:#0088ff;stop-opacity:0.9" />' +
                        '</linearGradient>' +
                    '</defs>' +
                    '<path id="riverChannel" class="river-channel" d=""/>' +
                    '<path id="riverWater" class="river-water" d=""/>' +
                '</svg>' +
                '<div class="gate-top">' +
                    '<div class="gate-shape-top" id="gateShapeTop">' +
                        '<div class="gate-interior-top"></div>' +
                        '<div class="gate-outline-top"></div>' +
                    '</div>' +
                '</div>' +
                '<div class="gate-bottom">' +
                    '<div class="gate-shape-bottom" id="gateShapeBottom">' +
                        '<div class="gate-interior-bottom"></div>' +
                        '<div class="gate-outline-bottom"></div>' +
                    '</div>' +
                '</div>' +
                '<div class="gate-text-top" id="gateTextTop">Stress - 0%</div>' +
                '<div class="gate-text-bottom" id="gateTextBottom">Opportunity - 0%</div>' +
                '<div class="river-text" id="riverText">Regulated<br>Processing<br>Capacity</div>' +
            '</div>' +
        '</div>' +

        // Save Entry
        '<div class="card" style="border: 2px solid #16a34a;">' +
            '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">' +
                '<h2 style="margin: 0;">💾 Save This Assessment</h2>' +
                '<button class="btn" onclick="saveEntry()" ' +
                        (state.activeLifeArea ? '' : 'disabled ') +
                        'style="background: ' + (state.activeLifeArea ? '#16a34a' : '#d1d5db') + '; color: white; padding: 10px 20px; ' +
                        (state.activeLifeArea ? '' : 'cursor: not-allowed;') + '">' +
                    'Save Entry' +
                '</button>' +
            '</div>' +
            (state.saveError ? '<div style="color: #dc2626; margin-bottom: 12px;">' + state.saveError + '</div>' : '') +
            '<div style="font-size: 14px; color: #6b7280;" id="currentPercentages">' +
                'Stress: 0% | Regulated: 100% | Opportunity: 0%' +
            '</div>' +
        '</div>' +

        // Saved Entries
        '<div class="card">' +
            '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">' +
                '<h2 style="margin: 0;">Saved Assessments: ' + state.entries.length + '</h2>' +
                '<div style="display: flex; gap: 8px;">' +
                    '<button class="btn" onclick="copyEntries()" ' +
                            (state.entries.length === 0 ? 'disabled ' : '') +
                            'style="background: ' + (state.entries.length === 0 ? '#d1d5db' : '#3b82f6') + '; color: white; ' +
                            (state.entries.length === 0 ? 'cursor: not-allowed;' : '') + '">' +
                        '📋 Copy' +
                    '</button>' +
                    '<button class="btn" onclick="clearEntries()" ' +
                            (state.entries.length === 0 ? 'disabled ' : '') +
                            'style="background: ' + (state.entries.length === 0 ? '#d1d5db' : '#dc2626') + '; color: white; ' +
                            (state.entries.length === 0 ? 'cursor: not-allowed;' : '') + '">' +
                        '🗑️ Clear' +
                    '</button>' +
                '</div>' +
            '</div>' +
            (state.entries.length === 0 ? 
                '<div style="text-align: center; padding: 36px 0; color: #6b7280;">No saved assessments yet</div>' :
                '<div>' +
                    state.entries.map((entry, index) => {
                        const date = new Date(entry.timestamp).toLocaleString();
                        const totalPercent = entry.threatLoad + entry.opportunityLoad + entry.regulatedLoad;
                        const threatPercent = totalPercent > 0 ? Math.round((entry.threatLoad / totalPercent) * 100) : 0;
                        const oppPercent = totalPercent > 0 ? Math.round((entry.opportunityLoad / totalPercent) * 100) : 0;
                        const regPercent = totalPercent > 0 ? Math.round((entry.regulatedLoad / totalPercent) * 100) : 0;
                        
                        return '<div style="background: #f9fafb; padding: 12px; border-radius: 6px; margin-bottom: 8px; border-left: 4px solid #3b82f6;">' +
                            '<div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">' +
                                '<div>' +
                                    '<div style="font-weight: 600; color: #111827; margin-bottom: 4px;">' + entry.lifeArea + '</div>' +
                                    '<div style="font-size: 13px; color: #374151; margin-bottom: 4px;">' + entry.optionText + '</div>' +
                                    '<div style="font-size: 11px; color: #6b7280;">' + date + '</div>' +
                                '</div>' +
                                '<button class="btn" onclick="deleteEntry(' + index + ')" ' +
                                        'style="background: #dc2626; color: white; padding: 4px 8px; font-size: 11px;">Delete</button>' +
                            '</div>' +
                            '<div style="font-size: 12px; margin-bottom: 6px;">' +
                                '<strong>Stress:</strong> ' + threatPercent + '% | ' +
                                '<strong>Regulated:</strong> ' + regPercent + '% | ' +
                                '<strong>Opportunity:</strong> ' + oppPercent + '%' +
                            '</div>' +
                            (entry.opportunity.value > 0 || entry.opportunity.why ?
                                '<div style="font-size: 12px; margin-bottom: 4px;">' +
                                    '<span style="color: #4caf50; font-weight: 600;">💚 Opportunity (' + entry.opportunity.value + '):</span> ' +
                                    (entry.opportunity.why || '<em>No notes</em>') +
                                '</div>' : '') +
                            (entry.stressor.value > 0 || entry.stressor.why ?
                                '<div style="font-size: 12px; margin-bottom: 4px;">' +
                                    '<span style="color: #f44336; font-weight: 600;">⚠️ Stressor (' + entry.stressor.value + '):</span> ' +
                                    (entry.stressor.why || '<em>No notes</em>') +
                                '</div>' : '') +
                            (entry.stabilizer.value > 0 || entry.stabilizer.why ?
                                '<div style="font-size: 12px;">' +
                                    '<span style="color: #1976d2; font-weight: 600;">🛡️ Stabilizer (' + entry.stabilizer.value + '):</span> ' +
                                    (entry.stabilizer.why || '<em>No notes</em>') +
                                '</div>' : '') +
                        '</div>';
                    }).join('') +
                '</div>'
            ) +
        '</div>';

    document.getElementById('app').innerHTML = html;

    // Update visualization after render
    setTimeout(() => updateVisualization(), 0);
}

// Initial setup
loadLifeAreas();
loadEntries();
render();
