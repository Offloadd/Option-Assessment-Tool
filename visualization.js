// visualization.js - Window of Tolerance Visualization

function updateVisualization() {
    const vizDiv = document.getElementById('visualization');
    if (!vizDiv) return;
    
    const height = 300;
    
    // Calculate heights based on percentages
    const stressHeight = (state.stressorPercent / 100) * height;
    const regulatedHeight = (state.stabilizerPercent / 100) * height;
    const opportunityHeight = (state.opportunityPercent / 100) * height;
    
    vizDiv.innerHTML = `
        <div class="color-legend">
            <div style="padding: 8px 4px; color: black; font-size: 8px; font-weight: bold; line-height: 1.3; text-align: center; z-index: 12; display: flex; flex-direction: column; justify-content: space-evenly; height: 100%;">
                <div>Hopelessness<br>Powerlessness<br>Overwhelmed<br>Anger/Resentful<br>Easily Agitated</div>
                <div style="margin-top: 15px;">Drivenness<br>Worry/Anxiety<br>Hypervigilance<br>On Edge<br>Fear of Failure</div>
                <div style="margin-top: 15px;">Rest is Forced<br>Deeper Sleep<br>Grounded<br>Calm/Regulated<br>Recovering</div>
                <div style="margin-top: 15px;">Flexibility<br>Joy/Enthusiasm<br>Expansiveness<br>Opportunity<br>Freedom</div>
            </div>
        </div>
        
        <!-- Stress zone (top) -->
        <div style="position: absolute; top: 0; left: 0; right: 0; height: ${stressHeight}px; background: linear-gradient(to bottom, #8B0000 0%, #DC143C 50%, #CD5C5C 100%); border-radius: 8px 8px 0 0; transition: height 0.3s ease;"></div>
        
        <!-- Regulated zone (middle) -->
        <div style="position: absolute; top: ${stressHeight}px; left: 0; right: 0; height: ${regulatedHeight}px; background: linear-gradient(to bottom, #87CEEB 0%, #4682B4 50%, #1E90FF 100%); transition: all 0.3s ease;"></div>
        
        <!-- Opportunity zone (bottom) -->
        <div style="position: absolute; bottom: 0; left: 0; right: 0; height: ${opportunityHeight}px; background: linear-gradient(to top, #006400 0%, #228B22 50%, #32CD32 100%); border-radius: 0 0 8px 8px; transition: height 0.3s ease;"></div>
        
        <!-- Percentage labels -->
        <div style="position: absolute; top: ${stressHeight / 2}px; right: 10px; color: white; font-weight: bold; font-size: 18px; text-shadow: 2px 2px 4px rgba(0,0,0,0.5); transform: translateY(-50%);">
            Stress - ${state.stressorPercent}%
        </div>
        
        <div style="position: absolute; top: ${stressHeight + regulatedHeight / 2}px; right: 10px; color: white; font-weight: bold; font-size: 18px; text-shadow: 2px 2px 4px rgba(0,0,0,0.5); transform: translateY(-50%);">
            Regulated Processing<br>Capacity - ${state.stabilizerPercent}%
        </div>
        
        <div style="position: absolute; bottom: ${opportunityHeight / 2}px; right: 10px; color: white; font-weight: bold; font-size: 18px; text-shadow: 2px 2px 4px rgba(0,0,0,0.5); transform: translateY(50%);">
            Opportunity - ${state.opportunityPercent}%
        </div>
    `;
}
