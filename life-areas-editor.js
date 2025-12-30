// life-areas-editor.js - Life Areas Management

function handleLifeAreaChange(value) {
    if (value === '__edit__') {
        showLifeAreasEditor();
    } else {
        loadLifeArea(value);
    }
}

function showLifeAreasEditor() {
    const modalHTML = `
        <div id="lifeAreasModal" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000;">
            <div style="background: white; border-radius: 8px; padding: 20px; max-width: 500px; width: 90%; max-height: 80vh; overflow-y: auto;">
                <h3 style="margin: 0 0 16px 0;">Manage Life Areas</h3>
                
                <div id="lifeAreasList"></div>
                
                <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
                    <h4 style="margin: 0 0 8px 0; font-size: 14px;">Add New Life Area</h4>
                    <div style="display: flex; gap: 8px;">
                        <input type="text" id="newLifeAreaInput" placeholder="Enter life area name" style="flex: 1; padding: 8px; border: 1px solid #d1d5db; border-radius: 4px; font-size: 14px;">
                        <button onclick="addNewLifeArea()" class="btn" style="padding: 8px 16px; background: #16a34a; color: white; font-weight: 600;">Add</button>
                    </div>
                </div>
                
                <div style="margin-top: 16px; display: flex; gap: 8px; justify-content: flex-end;">
                    <button onclick="closeLifeAreasEditor()" class="btn" style="padding: 8px 16px; background: #6b7280; color: white; font-weight: 600;">Close</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    renderLifeAreasList();
}

function renderLifeAreasList() {
    const listDiv = document.getElementById('lifeAreasList');
    if (!listDiv) return;
    
    const html = Object.keys(state.lifeAreas).map(areaKey => {
        const area = state.lifeAreas[areaKey];
        return `
            <div style="display: flex; align-items: center; gap: 8px; padding: 8px; border: 1px solid #e5e7eb; border-radius: 4px; margin-bottom: 8px;">
                <input type="text" value="${area.label}" onchange="updateLifeAreaLabel('${areaKey}', this.value)" style="flex: 1; padding: 6px; border: 1px solid #d1d5db; border-radius: 3px; font-size: 14px;">
                <label style="display: flex; align-items: center; gap: 4px; font-size: 13px; white-space: nowrap;">
                    <input type="checkbox" ${area.visible ? 'checked' : ''} onchange="toggleLifeAreaVisibility('${areaKey}', this.checked)" style="cursor: pointer;">
                    Visible
                </label>
                <button onclick="deleteLifeArea('${areaKey}')" class="btn" style="padding: 6px 12px; background: #dc2626; color: white; font-size: 12px;">Delete</button>
            </div>
        `;
    }).join('');
    
    listDiv.innerHTML = html || '<p style="color: #6b7280; font-size: 14px;">No life areas yet. Add one below.</p>';
}

function addNewLifeArea() {
    const input = document.getElementById('newLifeAreaInput');
    const label = input.value.trim();
    
    if (!label) {
        alert('Please enter a life area name');
        return;
    }
    
    // Generate unique key
    const key = 'area_' + Date.now();
    
    state.lifeAreas[key] = {
        label: label,
        visible: true
    };
    
    input.value = '';
    const saved = await saveLifeAreasToFirestore(state.lifeAreas);
    if (saved) {
        alert('✓ Life area added and saved to cloud');
    } else {
        alert('✗ ERROR: Failed to save life area. Please try again.');
    }
    renderLifeAreasList();
}

async function updateLifeAreaLabel(areaKey, newLabel) {
    if (state.lifeAreas[areaKey]) {
        state.lifeAreas[areaKey].label = newLabel;
        const saved = await saveLifeAreasToFirestore(state.lifeAreas);
        if (!saved) {
            alert('✗ ERROR: Failed to save changes. Please try again.');
        }
    }
}

async function toggleLifeAreaVisibility(areaKey, visible) {
    if (state.lifeAreas[areaKey]) {
        state.lifeAreas[areaKey].visible = visible;
        const saved = await saveLifeAreasToFirestore(state.lifeAreas);
        if (!saved) {
            alert('✗ ERROR: Failed to save changes. Please try again.');
        }
    }
}

async function deleteLifeArea(areaKey) {
    if (confirm('Delete this life area? This cannot be undone.')) {
        delete state.lifeAreas[areaKey];
        
        // Clear active life area if it was deleted
        if (state.activeLifeArea === areaKey) {
            state.activeLifeArea = null;
        }
        
        const saved = await saveLifeAreasToFirestore(state.lifeAreas);
        if (saved) {
            alert('✓ Life area deleted and saved to cloud');
        } else {
            alert('✗ ERROR: Failed to delete. Please try again.');
        }
        renderLifeAreasList();
    }
}

function closeLifeAreasEditor() {
    const modal = document.getElementById('lifeAreasModal');
    if (modal) {
        modal.remove();
    }
    render(); // Re-render to update dropdown
}
