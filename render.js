// render.js - Main Render Function

function render() {
    const container = document.getElementById('mainContent');
    if (!container) return;
    
    const html = `
        <div class="card" style="margin-bottom: 0; padding-bottom: 0; padding-top: 2px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <h2 style="margin: 0; font-size: 18px;">Offload - A window of tolerance check in tool</h2>
                <span style="font-size: 12px; color: #6b7280;">${state.user ? state.user.email : ''}</span>
            </div>
            
            <div style="background: #f0f9ff; border: 2px solid #3b82f6; border-radius: 8px; padding: 0;">
                ${state.saveError ? '<div style="background: #fee2e2; color: #991b1b; padding: 5px 8px; border-radius: 3px; margin: 6px 6px 6px 6px; font-size: 12px; border: 1px solid #fecaca;">' + state.saveError + '</div>' : ''}
                
                <div style="margin: 0 6px 6px 6px;">
                    <label style="display: block; font-weight: 600; margin-bottom: 4px; font-size: 15px;">How are you feeling today?</label>
                </div>
                
                <!-- ALL 3 INPUTS IN ONE ROW -->
                <div style="margin: 0 6px 6px 6px; display: flex; gap: 6px;">
                    <div style="flex: 1;">
                        <label style="display: block; font-weight: 600; margin-bottom: 2px; font-size: 10px;">TOPIC LABEL</label>
                        <input type="text" value="${state.topicLabel}" oninput="state.topicLabel = this.value;" placeholder="e.g., Morning" style="width: 100%; padding: 5px; border: 1px solid #d1d5db; border-radius: 3px; font-size: 12px;">
                    </div>
                    <div style="flex: 1;">
                        <label style="display: block; font-weight: 600; margin-bottom: 2px; font-size: 10px;">LIFE AREA</label>
                        <select onchange="handleLifeAreaChange(this.value)" style="width: 100%; padding: 5px; border: 1px solid #d1d5db; border-radius: 3px; font-size: 12px; background: white;">
                            <option value="">Optional</option>
                            ${Object.keys(state.lifeAreas).filter(key => state.lifeAreas[key].visible).map(areaKey => {
                                const area = state.lifeAreas[areaKey];
                                return '<option value="' + areaKey + '" ' + (state.activeLifeArea === areaKey ? 'selected' : '') + '>' + area.label + '</option>';
                            }).join('')}
                            <option value="__edit__" style="border-top: 1px solid #ccc; margin-top: 4px;">✏️ Edit Life Areas...</option>
                        </select>
                    </div>
                    <div style="flex: 1;">
                        <label style="display: block; font-weight: 600; margin-bottom: 2px; font-size: 10px;">HIJACKING?</label>
                        <select onchange="state.hijackingEvent = this.value; render();" style="width: 100%; padding: 5px; border: 1px solid #d1d5db; border-radius: 3px; font-size: 12px; background: white;">
                            <option value="">Not specified</option>
                            <option value="yes" ${state.hijackingEvent === 'yes' ? 'selected' : ''}>Yes</option>
                            <option value="maybe" ${state.hijackingEvent === 'maybe' ? 'selected' : ''}>Maybe</option>
                            <option value="no" ${state.hijackingEvent === 'no' ? 'selected' : ''}>No</option>
                        </select>
                    </div>
                </div>
                
                <div style="border-top: 1px solid #e5e7eb; padding-top: 4px; margin: 0 6px 4px 6px; display: flex; gap: 6px;">
                    <!-- Sliders section -->
                    <div style="flex: 1;">
                        <div style="margin-bottom: 3px;">
                            <div style="display: flex; gap: 4px; align-items: center; margin-bottom: 1px;">
                                <div style="color: #f44336; font-size: 12px; font-weight: 600; min-width: 75px;">⚠️ Stressors</div>
                                <div style="color: #f44336; font-weight: bold; min-width: 30px; text-align: center; font-size: 14px;">${state.stressorPercent}%</div>
                                <input type="range" min="${MIN_PERCENT}" max="${MAX_PERCENT}" value="${state.stressorPercent}" oninput="updatePercent('stressor', this.value)" style="flex: 1; height: 5px; cursor: pointer; -webkit-appearance: none; background: linear-gradient(to right, #FFFF00, #FF9900, #DC143C);">
                            </div>
                            <textarea placeholder="Notes" oninput="updateNotes('stressor', this.value)" style="width: 100%; padding: 1px 3px; border: 1px solid #d1d5db; border-radius: 3px; font-size: 9.5px; font-family: inherit; min-height: 12px; resize: vertical;">${state.stressorNotes}</textarea>
                        </div>
                        
                        <div style="margin-bottom: 3px;">
                            <div style="display: flex; gap: 4px; align-items: center; margin-bottom: 1px;">
                                <div style="color: #1976d2; font-size: 12px; font-weight: 600; min-width: 75px;">🛡️ Stabilizers</div>
                                <div style="color: #1976d2; font-weight: bold; min-width: 30px; text-align: center; font-size: 14px;">${state.stabilizerPercent}%</div>
                                <input type="range" min="${MIN_PERCENT}" max="${MAX_PERCENT}" value="${state.stabilizerPercent}" oninput="updatePercent('stabilizer', this.value)" style="flex: 1; height: 5px; cursor: pointer; -webkit-appearance: none; background: linear-gradient(to right, #87CEEB, #4682B4, #1E90FF);">
                            </div>
                            <textarea placeholder="Notes" oninput="updateNotes('stabilizer', this.value)" style="width: 100%; padding: 1px 3px; border: 1px solid #d1d5db; border-radius: 3px; font-size: 9.5px; font-family: inherit; min-height: 12px; resize: vertical;">${state.stabilizerNotes}</textarea>
                        </div>
                        
                        <div style="margin-bottom: 3px;">
                            <div style="display: flex; gap: 4px; align-items: center; margin-bottom: 1px;">
                                <div style="color: #4caf50; font-size: 12px; font-weight: 600; min-width: 75px;">💚 Opportunity</div>
                                <div style="color: #4caf50; font-weight: bold; min-width: 30px; text-align: center; font-size: 14px;">${state.opportunityPercent}%</div>
                                <input type="range" min="${MIN_PERCENT}" max="${MAX_PERCENT}" value="${state.opportunityPercent}" oninput="updatePercent('opportunity', this.value)" style="flex: 1; height: 5px; cursor: pointer; -webkit-appearance: none; background: linear-gradient(to right, #32CD32, #7FFF00, #FFFF00);">
                            </div>
                            <textarea placeholder="Notes" oninput="updateNotes('opportunity', this.value)" style="width: 100%; padding: 1px 3px; border: 1px solid #d1d5db; border-radius: 3px; font-size: 9.5px; font-family: inherit; min-height: 12px; resize: vertical;">${state.opportunityNotes}</textarea>
                        </div>
                    </div>
                    
                    <!-- Vertical buttons on right -->
                    <div style="display: flex; flex-direction: column; gap: 3px; justify-content: center;">
                        <button onclick="saveCheckIn()" class="btn" style="writing-mode: vertical-rl; text-orientation: upright; padding: 4px 3px; background: #16a34a; color: white; font-size: 8px; font-weight: 600; letter-spacing: 1px; white-space: nowrap;">💾SAVE</button>
                        <button onclick="resetForm(); render(); updateVisualization();" class="btn" style="writing-mode: vertical-rl; text-orientation: upright; padding: 4px 3px; background: #6b7280; color: white; font-size: 8px; font-weight: 600; letter-spacing: 1px; white-space: nowrap;">🔄CLEAR</button>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="card" style="margin-bottom: 6px; margin-top: 0; padding-top: 0;">
            <div class="visualization" id="visualization"></div>
        </div>
    `;
    
    container.innerHTML = html;
    updateVisualization();
}
