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
        description: "레이놀즈 수(Reynolds Number)는 유체 역학에서 가장 중요한 무차원수 중 하나로, 관성력과 점성력의 비를 나타냅니다. 이 수는 유동이 층류(Laminar)인지 난류(Turbulent)인지를 예측하는 데 사용됩니다.<br><br><strong>공식:</strong> Re = ρvL / μ<br>여기서 ρ는 밀도, v는 속도, L은 특성 길이, μ는 동점성 계수입니다.<br><br>일반적으로 파이프 유동에서 Re < 2300이면 층류, Re > 4000이면 난류로 간주하며, 그 사이는 천이 구역입니다.",
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
        description: "마하 수(Mach Number)는 유체의 속도와 그 매질에서의 음속의 비를 나타냅니다. 고속 공기역학에서 압축성 효과를 고려할 때 필수적인 지표입니다.<br><br><strong>공식:</strong> Ma = v / c<br>Ma < 1 은 아음속, Ma > 1 은 초음속을 의미합니다. 초음속 유동에서는 충격파(Shock wave)와 같은 불연속적인 현상이 발생할 수 있습니다.",
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
        description: "누셀트 수(Nusselt Number)는 경계면에서의 대류 열전달과 전도 열전달의 비율을 나타냅니다. 이 값이 클수록 대류에 의한 열전달이 활발함을 의미합니다.<br><br><strong>공식:</strong> Nu = hL / k<br>여기서 h는 대류 열전달 계수, L은 특성 길이, k는 유체의 열전도율입니다. Nu = 1 이면 순수 전도만 일어나는 상태에 가깝습니다.",
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
        description: "프란틀 수(Prandtl Number)는 운동량 확산(점성)과 열 확산(열전도)의 비율을 나타내는 무차원수입니다. 이는 유체의 고유한 물성치로 결정되며, 속도 경계층과 온도 경계층의 상대적 두께를 비교하는 데 사용됩니다.<br><br><strong>공식:</strong> Pr = μc_p / k = ν / α",
        inputs: [
            { id: 'mu', label: 'Dynamic Viscosity (μ) [Pa·s]', placeholder: 'e.g. 0.001' },
            { id: 'cp', label: 'Specific Heat Capacity (c_p) [J/kgK]', placeholder: 'e.g. 4180' },
            { id: 'k', label: 'Thermal Conductivity (k) [W/mK]', placeholder: 'e.g. 0.6' }
        ],
        calculate: (vals) => (vals.mu * vals.cp) / vals.k,
        getInfo: (res) => `Pr ≈ ${res.toFixed(1)}: Fluid property characteristic.`
    },
    schmidt: {
        title: "Schmidt Number",
        description: "슈미트 수(Schmidt Number)는 운동량 확산율(점성)과 질량 확산율의 비를 나타냅니다. 프란틀 수의 질량 전달 대응물이라고 볼 수 있으며, 속도 경계층과 농도 경계층의 상대적 두께를 결정합니다.",
        inputs: [
            { id: 'mu', label: 'Dynamic Viscosity (μ) [Pa·s]', placeholder: 'e.g. 0.001' },
            { id: 'rho', label: 'Density (ρ) [kg/m³]', placeholder: 'e.g. 1000' },
            { id: 'D', label: 'Mass Diffusivity (D) [m²/s]', placeholder: 'e.g. 1e-9' }
        ],
        calculate: (vals) => vals.mu / (vals.rho * vals.D),
        getInfo: (res) => "Sc relates momentum and mass diffusivity."
    },
    peclet: {
        title: "Peclet Number",
        description: "페클레 수(Peclet Number)는 유동에 의한 이송(Advection)과 확산(Diffusion)의 비율을 나타냅니다. 열전달이나 질량전달 문제에서 대류의 중요성을 판단하는 척도가 됩니다.",
        inputs: [
            { id: 'v', label: 'Velocity (v) [m/s]', placeholder: 'e.g. 2.0' },
            { id: 'L', label: 'Characteristic Length (L) [m]', placeholder: 'e.g. 0.5' },
            { id: 'alpha', label: 'Thermal Diffusivity (α) [m²/s]', placeholder: 'e.g. 1e-7' }
        ],
        calculate: (vals) => (vals.v * vals.L) / vals.alpha,
        getInfo: (res) => "Pe > 100: Advection dominates over diffusion."
    },
    strouhal: {
        title: "Strouhal Number",
        description: "스트로할 수(Strouhal Number)는 비상시 유동(Unsteady flow)에서의 진동 특성을 나타냅니다. 예를 들어, 바람에 흔들리는 전선이나 카르만 와류(Karman Vortex Street) 현상을 분석할 때 중요합니다.",
        inputs: [
            { id: 'f', label: 'Frequency of vortex shedding (f) [Hz]', placeholder: 'e.g. 10' },
            { id: 'L', label: 'Characteristic Length (L) [m]', placeholder: 'e.g. 0.1' },
            { id: 'v', label: 'Velocity (v) [m/s]', placeholder: 'e.g. 5' }
        ],
        calculate: (vals) => (vals.f * vals.L) / vals.v,
        getInfo: (res) => "St represents non-steady flow oscillations."
    },
    froude: {
        title: "Froude Number",
        description: "프루드 수(Froude Number)는 유체의 관성력과 중력의 비율을 나타냅니다. 개수로(Open channel) 유동이나 선박의 조파 저항 등을 해석할 때 필수적인 무차원수입니다.",
        inputs: [
            { id: 'v', label: 'Velocity (v) [m/s]', placeholder: 'e.g. 3.0' },
            { id: 'L', label: 'Characteristic Length (L) [m]', placeholder: 'e.g. 5.0' },
            { id: 'g', label: 'Gravity (g) [m/s²]', placeholder: '9.81' }
        ],
        calculate: (vals) => vals.v / Math.sqrt(vals.g * vals.L),
        getInfo: (res) => {
            if (res < 1) return "Subcritical flow (상류)";
            if (res === 1) return "Critical flow (한계류)";
            return "Supercritical flow (사류)";
        }
    },
    weber: {
        title: "Weber Number",
        description: "웨버 수(Weber Number)는 관성력과 표면장력의 비율을 나타냅니다. 잉크젯 프린팅, 연료 분사, 기포 형성 등 표면장력이 중요한 다상 유동에서 주로 사용됩니다.",
        inputs: [
            { id: 'rho', label: 'Density (ρ) [kg/m³]', placeholder: 'e.g. 1000' },
            { id: 'v', label: 'Velocity (v) [m/s]', placeholder: 'e.g. 2.0' },
            { id: 'L', label: 'Characteristic Length (L) [m]', placeholder: 'e.g. 0.01' },
            { id: 'sigma', label: 'Surface Tension (σ) [N/m]', placeholder: 'e.g. 0.072' }
        ],
        calculate: (vals) => (vals.rho * Math.pow(vals.v, 2) * vals.L) / vals.sigma,
        getInfo: (res) => "We relates inertia to surface tension."
    },
    knudsen: {
        title: "Knudsen Number",
        description: "누센 수(Knudsen Number)는 분자의 평균 자유 행로와 시스템의 특성 길이의 비율입니다. 이 수가 매우 작으면(Kn < 0.01) 유체를 연속체로 가정할 수 있지만, 크면 희박 기체 역학(Rarefied Gas Dynamics)을 적용해야 합니다.",
        inputs: [
            { id: 'lambda', label: 'Mean Free Path (λ) [m]', placeholder: 'e.g. 6.8e-8' },
            { id: 'L', label: 'Characteristic Length (L) [m]', placeholder: 'e.g. 0.001' }
        ],
        calculate: (vals) => vals.lambda / vals.L,
        getInfo: (res) => {
            if (res < 0.01) return "Continuum flow (연속체 유동)";
            if (res < 0.1) return "Slip flow (미끄럼 유동)";
            return "Transition/Free molecular flow";
        }
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
    
    // Add description if available
    if (calc.description) {
        html += `<div class="calc-description" style="color: var(--text-secondary); margin-bottom: 1.5rem; line-height: 1.5; font-size: 0.95rem;">${calc.description}</div>`;
    }

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
    
    // Improved formatting for small and large numbers
    if (Math.abs(result) < 0.0001 || Math.abs(result) > 1000000) {
        resultValue.innerText = result.toExponential(4);
    } else {
        resultValue.innerText = result.toLocaleString(undefined, { maximumFractionDigits: 4 });
    }
    
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

/**
 * Theme Toggle Logic
 */
const themeToggleBtn = document.getElementById('themeToggle');
const sunIcon = document.getElementById('sunIcon');
const moonIcon = document.getElementById('moonIcon');
const htmlEl = document.documentElement;

// Function to set theme
function setTheme(theme) {
    if (theme === 'light') {
        htmlEl.setAttribute('data-theme', 'light');
        sunIcon.style.display = 'none';
        moonIcon.style.display = 'block';
    } else {
        htmlEl.removeAttribute('data-theme');
        sunIcon.style.display = 'block';
        moonIcon.style.display = 'none';
    }
    localStorage.setItem('theme', theme);
}

// Initial check
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
    setTheme(savedTheme);
} else {
    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
        setTheme('light');
    } else {
        setTheme('dark');
    }
}

// Event Listener
themeToggleBtn.addEventListener('click', () => {
    const currentTheme = htmlEl.getAttribute('data-theme');
    if (currentTheme === 'light') {
        setTheme('dark');
    } else {
        setTheme('light');
    }
});
