// visualization.js - Window of Tolerance Visualization

function updateVisualization() {
    const vizDiv = document.getElementById('visualization');
    if (!vizDiv) return;
    
    const height = 274;
    
    // Calculate heights based on percentages
    const stressHeight = (state.stressorPercent / 100) * height;
    const regulatedHeight = (state.stabilizerPercent / 100) * height;
    const opportunityHeight = (state.opportunityPercent / 100) * height;
    
    // Dynamic stress gradient: low stress = YELLOW, high stress = red
    // At 10-40% -> YELLOW, at 40-60% -> orange, at 60%+ -> red
    const stressGradient = state.stressorPercent <= 40 
        ? 'linear-gradient(to bottom, #FFFF00 0%, #FFFF33 50%, #FFCC00 100%)' // Low stress: YELLOW
        : state.stressorPercent <= 60
        ? 'linear-gradient(to bottom, #FFCC00 0%, #FF9900 50%, #FF6600 100%)' // Medium stress: orange
        : 'linear-gradient(to bottom, #FF4500 0%, #DC143C 50%, #B22222 100%)'; // High stress: red
    
    // Blue zone stays blue
    const regulatedGradient = 'linear-gradient(to bottom, #87CEEB 0%, #4682B4 50%, #1E90FF 100%)';
    
    // Dynamic opportunity gradient: low = light green, high = yellow-green
    // At 10-50% -> light green, at 50-65% -> brighter green, at 65%+ -> yellow-green
    const opportunityGradient = state.opportunityPercent <= 50
        ? 'linear-gradient(to top, #32CD32 0%, #3CB371 50%, #90EE90 100%)' // Low opportunity: lime to light green
        : state.opportunityPercent <= 65
        ? 'linear-gradient(to top, #3CB371 0%, #7FFF00 50%, #ADFF2F 100%)' // Medium opportunity: sea green to chartreuse
        : 'linear-gradient(to top, #7FFF00 0%, #ADFF2F 50%, #FFFF00 100%)'; // High opportunity: chartreuse to yellow
    
    vizDiv.innerHTML = `
        <div class="color-legend">
            <div style="padding: 8px 4px; color: black; font-size: 9.5px; font-weight: bold; line-height: 1.1; text-align: center; z-index: 12; display: flex; flex-direction: column; justify-content: space-evenly; height: 100%;">
                <div>Hopelessness<br>Powerlessness<br>Overwhelmed<br>Anger/Resentful<br>Easily Agitated</div>
                <div>Drivenness<br>Worry/Anxiety<br>Hypervigilance<br>On Edge<br>Fear of Failure</div>
                <div>Rest is Forced<br>Deeper Sleep<br>Grounded<br>Calm/Regulated<br>Recovering</div>
                <div>Flexibility<br>Joy/Enthusiasm<br>Expansiveness<br>Opportunity<br>Freedom</div>
            </div>
        </div>
        
        <!-- Stress zone (top) -->
        <div style="position: absolute; top: 0; left: 0; right: 0; height: ${stressHeight}px; background: ${stressGradient}; border-radius: 8px 8px 0 0; transition: all 0.3s ease;"></div>
        
        <!-- Regulated zone (middle) -->
        <div style="position: absolute; top: ${stressHeight}px; left: 0; right: 0; height: ${regulatedHeight}px; background: ${regulatedGradient}; transition: all 0.3s ease;"></div>
        
        <!-- Opportunity zone (bottom) -->
        <div style="position: absolute; bottom: 0; left: 0; right: 0; height: ${opportunityHeight}px; background: ${opportunityGradient}; border-radius: 0 0 8px 8px; transition: all 0.3s ease;"></div>
        
        <!-- Percentage labels -->
        <div style="position: absolute; top: ${stressHeight / 2}px; right: 10px; color: white; font-weight: bold; font-size: 18px; text-shadow: 2px 2px 4px rgba(0,0,0,0.5); transform: translateY(-50%);">
            Stressors - ${state.stressorPercent}%
        </div>
        
        <div style="position: absolute; top: ${stressHeight + regulatedHeight / 2}px; right: 10px; color: white; font-weight: bold; font-size: 18px; text-shadow: 2px 2px 4px rgba(0,0,0,0.5); transform: translateY(-50%);">
            Stabilizers - ${state.stabilizerPercent}%
        </div>
        
        <div style="position: absolute; bottom: ${opportunityHeight / 2}px; right: 10px; color: white; font-weight: bold; font-size: 18px; text-shadow: 2px 2px 4px rgba(0,0,0,0.5); transform: translateY(50%);">
            Opportunity - ${state.opportunityPercent}%
        </div>
    `;
}
