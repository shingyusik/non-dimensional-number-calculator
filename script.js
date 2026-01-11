/**
 * Dimensionless Number Calculator Logic
 * 
 * Formulas:
 * - Reynolds (Re) = (density * velocity * length) / dynamic_viscosity
 * - Mach (Ma) = velocity / speed_of_sound
 * - Nusselt (Nu) = (convective_h * length) / thermal_conductivity
 * - Prandtl (Pr) = (dynamic_viscosity * specific_heat) / thermal_conductivity
 */

const calculators = {
    reynolds: {
        title: "Reynolds Number",
        inputs: [
            { id: 'v', label: 'Velocity (v) [m/s]', placeholder: 'e.g. 2.0' },
            { id: 'rho', label: 'Density (ρ) [kg/m³]', placeholder: 'e.g. 1000' },
            { id: 'L', label: 'Characteristic Length (L) [m]', placeholder: 'e.g. 0.5' },
            { id: 'mu', label: 'Dynamic Viscosity (μ) [Pa·s]', placeholder: 'e.g. 0.001' }
        ],
        calculate: (vals) => (vals.rho * vals.v * vals.L) / vals.mu,
        getInfo: (res) => {
            if (res < 2300) return "Laminar Flow (층류)";
            if (res > 4000) return "Turbulent Flow (난류)";
            return "Transitional Flow (천이 구역)";
        }
    },
    mach: {
        title: "Mach Number",
        inputs: [
            { id: 'v', label: 'Flow Velocity (v) [m/s]', placeholder: 'e.g. 340' },
            { id: 'c', label: 'Speed of Sound (c) [m/s]', placeholder: 'e.g. 340' }
        ],
        calculate: (vals) => vals.v / vals.c,
        getInfo: (res) => {
            if (res < 0.8) return "Subsonic (아음속)";
            if (res < 1.2) return "Transonic (천음속)";
            if (res < 5.0) return "Supersonic (초음속)";
            return "Hypersonic (극초음속)";
        }
    },
    nusselt: {
        title: "Nusselt Number",
        inputs: [
            { id: 'h', label: 'Convective Heat Transfer Coeff (h) [W/m²K]', placeholder: 'e.g. 50' },
            { id: 'L', label: 'Characteristic Length (L) [m]', placeholder: 'e.g. 0.1' },
            { id: 'k', label: 'Thermal Conductivity (k) [W/mK]', placeholder: 'e.g. 0.6' }
        ],
        calculate: (vals) => (vals.h * vals.L) / vals.k,
        getInfo: (res) => "Nu > 1: Convection is more effective than conduction."
    },
    prandtl: {
        title: "Prandtl Number",
        inputs: [
            { id: 'mu', label: 'Dynamic Viscosity (μ) [Pa·s]', placeholder: 'e.g. 0.001' },
            { id: 'cp', label: 'Specific Heat Capacity (c_p) [J/kgK]', placeholder: 'e.g. 4180' },
            { id: 'k', label: 'Thermal Conductivity (k) [W/mK]', placeholder: 'e.g. 0.6' }
        ],
        calculate: (vals) => (vals.mu * vals.cp) / vals.k,
        getInfo: (res) => `Pr ≈ ${res.toFixed(1)}: Fluid property characteristic.`
    }
};

let currentCalculator = null;

function openModal(type) {
    const calc = calculators[type];
    if (!calc) return;
    
    currentCalculator = type;
    const body = document.getElementById('modalBody');
    const resultContainer = document.getElementById('resultContainer');
    
    resultContainer.classList.remove('active');
    
    let html = `<h2>${calc.title}</h2>`;
    calc.inputs.forEach(input => {
        html += `
            <div class="input-group">
                <label for="${input.id}">${input.label}</label>
                <input type="number" id="${input.id}" placeholder="${input.placeholder}" step="any">
            </div>
        `;
    });
    html += `<button class="calculate-btn" onclick="runCalculation()">Calculate</button>`;
    
    body.innerHTML = html;
    document.getElementById('calculatorModal').classList.add('active');
}

function closeModal() {
    document.getElementById('calculatorModal').classList.remove('active');
    currentCalculator = null;
}

function runCalculation() {
    if (!currentCalculator) return;
    
    const calc = calculators[currentCalculator];
    const vals = {};
    let allFilled = true;
    
    calc.inputs.forEach(input => {
        const val = parseFloat(document.getElementById(input.id).value);
        if (isNaN(val)) {
            allFilled = false;
        } else {
            vals[input.id] = val;
        }
    });
    
    if (!allFilled) {
        alert("모든 값을 입력해 주세요.");
        return;
    }
    
    const result = calc.calculate(vals);
    const resultContainer = document.getElementById('resultContainer');
    const resultValue = document.getElementById('resultValue');
    const resultInfo = document.getElementById('resultInfo');
    
    resultValue.innerText = result.toLocaleString(undefined, { maximumFractionDigits: 4 });
    resultInfo.innerText = calc.getInfo(result);
    
    resultContainer.classList.add('active');
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('calculatorModal');
    if (event.target == modal) {
        closeModal();
    }
}
