// entries.js - Display Saved Entries

function displayEntries() {
    const container = document.getElementById('entriesContainer');
    const countSpan = document.getElementById('entryCount');
    
    if (!container) return;
    
    countSpan.textContent = state.entries.length;
    
    if (state.entries.length === 0) {
        container.innerHTML = '<p style="color: #6b7280; text-align: center; padding: 20px;">No check-ins saved yet.</p>';
        return;
    }
    
    const html = state.entries.map(entry => renderEntry(entry)).join('');
    container.innerHTML = html;
}

function renderEntry(entry) {
    const date = new Date(entry.timestamp);
    const dateStr = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    
    // Hijacking badge
    const hijackingBadge = entry.hijackingEvent && entry.hijackingEvent !== 'not specified' 
        ? `<span style="display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; 
            ${entry.hijackingEvent === 'yes' ? 'background: #fee2e2; color: #991b1b;' : 
              entry.hijackingEvent === 'maybe' ? 'background: #fef3c7; color: #92400e;' : 
              'background: #dbeafe; color: #1e40af;'}">
            Hijacking: ${entry.hijackingEvent}
          </span>`
        : '';
    
    return `
        <div class="entry-card">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                <div style="flex: 1;">
                    <div style="font-weight: 600; font-size: 15px; color: #111827; margin-bottom: 4px;">
                        ${entry.topicLabel || 'Check-In'}
                    </div>
                    <div style="font-size: 13px; color: #6b7280;">
                        ${entry.lifeArea} • ${dateStr}
                        ${hijackingBadge}
                    </div>
                </div>
                <div style="display: flex; gap: 4px;">
                    <button onclick="loadEntry('${entry.timestamp}')" style="padding: 4px 12px; background: #2563eb; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: 600;">View</button>
                    <button onclick="deleteEntry('${entry.timestamp}')" style="padding: 4px 8px; background: #ef4444; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">Delete</button>
                </div>
            </div>
            
            <!-- Percentages -->
            <div style="display: flex; gap: 12px; margin-bottom: 8px; font-size: 13px;">
                <div style="color: #f44336;">⚠️ Stressors: <strong>${entry.stressorPercent}%</strong></div>
                <div style="color: #1976d2;">🛡️ Stabilizers: <strong>${entry.stabilizerPercent}%</strong></div>
                <div style="color: #4caf50;">💚 Opportunity: <strong>${entry.opportunityPercent}%</strong></div>
            </div>
            
            <!-- Notes -->
            ${entry.stressorNotes ? '<div style="font-size: 12px; color: #374151; margin-bottom: 4px;"><strong style="color: #f44336;">Stressors:</strong> ' + entry.stressorNotes + '</div>' : ''}
            ${entry.stabilizerNotes ? '<div style="font-size: 12px; color: #374151; margin-bottom: 4px;"><strong style="color: #1976d2;">Stabilizers:</strong> ' + entry.stabilizerNotes + '</div>' : ''}
            ${entry.opportunityNotes ? '<div style="font-size: 12px; color: #374151;"><strong style="color: #4caf50;">Opportunity:</strong> ' + entry.opportunityNotes + '</div>' : ''}
        </div>
    `;
}

async function deleteEntry(timestamp) {
    if (!confirm('Delete this check-in?')) return;
    
    state.entries = state.entries.filter(e => e.timestamp !== timestamp);
    saveToUserStorage('entries', JSON.stringify(state.entries));
    await deleteEntryFromFirestore(timestamp);
    displayEntries();
}

function exportEntries() {
    // Prompt user for how many entries or days
    const input = prompt('How many entries to export?\nExamples: "50" (50 entries) or "7d" (last 7 days) or "all"');
    
    if (!input) return; // User cancelled
    
    let entriesToExport = [];
    
    if (input.toLowerCase() === 'all') {
        entriesToExport = state.entries;
    } else if (input.toLowerCase().endsWith('d')) {
        // Days mode: "7d" = last 7 days
        const days = parseInt(input);
        if (isNaN(days) || days <= 0) {
            alert('Invalid format. Use a number like "7d" for 7 days.');
            return;
        }
        
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        
        entriesToExport = state.entries.filter(entry => {
            const entryDate = new Date(entry.timestamp);
            return entryDate >= cutoffDate;
        });
        
        if (entriesToExport.length === 0) {
            alert(`No entries found in the last ${days} days.`);
            return;
        }
    } else {
        // Number mode: "50" = 50 entries
        const count = parseInt(input);
        if (isNaN(count) || count <= 0) {
            alert('Invalid format. Use a number like "50" or "7d" for days.');
            return;
        }
        
        entriesToExport = state.entries.slice(0, count);
    }
    
    if (entriesToExport.length === 0) {
        alert('No entries to export');
        return;
    }
    
    let csv = 'Timestamp,Topic,Life Area,Hijacking,Stressors %,Stabilizers %,Opportunity %,Stressors Notes,Stabilizers Notes,Opportunity Notes\n';
    
    entriesToExport.forEach(entry => {
        const row = [
            entry.timestamp,
            entry.topicLabel,
            entry.lifeArea,
            entry.hijackingEvent,
            entry.stressorPercent,
            entry.stabilizerPercent,
            entry.opportunityPercent,
            '"' + (entry.stressorNotes || '').replace(/"/g, '""') + '"',
            '"' + (entry.stabilizerNotes || '').replace(/"/g, '""') + '"',
            '"' + (entry.opportunityNotes || '').replace(/"/g, '""') + '"'
        ];
        csv += row.join(',') + '\n';
    });
    
    navigator.clipboard.writeText(csv).then(() => {
        alert(`${entriesToExport.length} entries copied to clipboard as CSV!`);
    }).catch(() => {
        alert('Failed to copy to clipboard');
    });
}

function loadEntry(timestamp) {
    const entry = state.entries.find(e => e.timestamp === timestamp);
    if (!entry) return;
    
    // Load all data back into the form
    state.topicLabel = entry.topicLabel || '';
    state.activeLifeArea = entry.lifeArea || null;
    state.hijackingEvent = entry.hijackingEvent || '';
    
    // Load slider values (use the raw values if available, otherwise fall back to percentages)
    state.stressorValue = entry.stressorValue || 10;
    state.stabilizerValue = entry.stabilizerValue || 10;
    state.opportunityValue = entry.opportunityValue || 10;
    
    // Load notes
    state.stressorNotes = entry.stressorNotes || '';
    state.stabilizerNotes = entry.stabilizerNotes || '';
    state.opportunityNotes = entry.opportunityNotes || '';
    
    // Re-render everything
    render();
    updateVisualization();
    
    // Scroll to top so user can see the visualization
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
