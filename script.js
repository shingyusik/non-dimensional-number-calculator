/**
 * Dimensionless Number Calculator Logic
 * Supported Languages: 'ko', 'en'
 */

let currentLang = 'ko'; // Default language

const translations = {
    ko: {
        page_title: "Dimensionless Numbers",
        page_subtitle: "물리적 현상의 핵심을 파악하는 무차원수 계산기",
        reynolds_short_desc: "유체의 관성력과 점성력의 비를 나타내며, 유동이 층류인지 난류인지 판단하는 지표입니다.",
        mach_short_desc: "유체의 속도와 음속의 비를 나타내며, 압축성 유동의 특성을 결정합니다.",
        nusselt_short_desc: "대류 열전달과 전도 열전달의 비를 나타내며, 대류가 열전달에 기여하는 정도를 결정합니다.",
        prandtl_short_desc: "운동량 확산과 열 확산의 비를 나타내며, 유체의 물리적 특성만으로 결정됩니다.",
        schmidt_short_desc: "점성 확산율과 분자 확산율의 비를 나타내며, 유동 내의 대류 질량전달을 설명합니다.",
        peclet_short_desc: "유동에 의한 이송(Advection)과 확산(Diffusion)의 비를 나타냅니다.",
        strouhal_short_desc: "비상시 유동(Unsteady flow)의 진동 특성을 나타내는 무차원수입니다.",
        froude_short_desc: "관성력과 중력의 비를 나타내며, 개수로 유동이나 선박 공학에서 중요합니다.",
        weber_short_desc: "관성력과 표면장력의 비를 나타내며, 액적의 분열이나 기포 형성 분석에 사용됩니다.",
        knudsen_short_desc: "분자 평균 자유 행로와 특성 길이의 비를 나타내며, 연속체 가설의 타당성을 판단합니다.",
        result_label: "결과",
        privacy_policy: "개인정보처리방침",
        terms_service: "이용약관",
        calculate_btn: "계산하기",
        alert_fill_all: "모든 값을 입력해 주세요."
    },
    en: {
        page_title: "Dimensionless Numbers",
        page_subtitle: "Calculator for dimensionless numbers finding the core of physical phenomena",
        reynolds_short_desc: "Ratio of inertial forces to viscous forces, determining if flow is laminar or turbulent.",
        mach_short_desc: "Ratio of flow velocity to the speed of sound, determining compressibility effects.",
        nusselt_short_desc: "Ratio of convective to conductive heat transfer, indicating the effectiveness of convection.",
        prandtl_short_desc: "Ratio of momentum diffusivity to thermal diffusivity, determined solely by fluid properties.",
        schmidt_short_desc: "Ratio of momentum diffusivity to mass diffusivity, describing convective mass transfer.",
        peclet_short_desc: "Ratio of advection to diffusion rates.",
        strouhal_short_desc: "Describes oscillating flow mechanisms in unsteady flow.",
        froude_short_desc: "Ratio of flow inertia to external field (gravity), important in open-channel flow.",
        weber_short_desc: "Ratio of inertia to surface tension, used in analyzing droplet formation.",
        knudsen_short_desc: "Ratio of mean free path to characteristic length, determining validity of continuum assumption.",
        result_label: "Result",
        privacy_policy: "Privacy Policy",
        terms_service: "Terms of Service",
        calculate_btn: "Calculate",
        alert_fill_all: "Please enter all values."
    }
};

const calculators = {
    reynolds: {
        title: "Reynolds Number",
        description: {
            ko: "레이놀즈 수(Reynolds Number)는 유체 역학에서 가장 중요한 무차원수 중 하나로, 관성력과 점성력의 비를 나타냅니다. 이 수는 유동이 층류(Laminar)인지 난류(Turbulent)인지를 예측하는 데 사용됩니다.<br><br><strong>공식:</strong> Re = ρvL / μ<br>여기서 ρ는 밀도, v는 속도, L은 특성 길이, μ는 동점성 계수입니다.<br><br>일반적으로 파이프 유동에서 Re < 2300이면 층류, Re > 4000이면 난류로 간주하며, 그 사이는 천이 구역입니다.",
            en: "Reynolds Number is the ratio of inertial forces to viscous forces within a fluid which is subjected to relative internal movement due to different fluid velocities. It is used to predict flow patterns in different fluid flow situations.<br><br><strong>Formula:</strong> Re = ρvL / μ<br>Where ρ is density, v is velocity, L is characteristic length, and μ is dynamic viscosity.<br><br>Generally, for pipe flow, Re < 2300 indicates laminar flow, and Re > 4000 indicates turbulent flow."
        },
        inputs: [
            { id: 'v', label: { ko: '속도 (v) [m/s]', en: 'Velocity (v) [m/s]' }, placeholder: 'e.g. 2.0' },
            { id: 'rho', label: { ko: '밀도 (ρ) [kg/m³]', en: 'Density (ρ) [kg/m³]' }, placeholder: 'e.g. 1000' },
            { id: 'L', label: { ko: '특성 길이 (L) [m]', en: 'Characteristic Length (L) [m]' }, placeholder: 'e.g. 0.5' },
            { id: 'mu', label: { ko: '동점성 계수 (μ) [Pa·s]', en: 'Dynamic Viscosity (μ) [Pa·s]' }, placeholder: 'e.g. 0.001' }
        ],
        calculate: (vals) => (vals.rho * vals.v * vals.L) / vals.mu,
        getInfo: (res) => {
            if (res < 2300) return { ko: "층류 (Laminar Flow)", en: "Laminar Flow" };
            if (res > 4000) return { ko: "난류 (Turbulent Flow)", en: "Turbulent Flow" };
            return { ko: "천이 구역 (Transitional Flow)", en: "Transitional Flow" };
        }
    },
    mach: {
        title: "Mach Number",
        description: {
            ko: "마하 수(Mach Number)는 유체의 속도와 그 매질에서의 음속의 비를 나타냅니다. 고속 공기역학에서 압축성 효과를 고려할 때 필수적인 지표입니다.<br><br><strong>공식:</strong> Ma = v / c<br>Ma < 1 은 아음속, Ma > 1 은 초음속을 의미합니다. 초음속 유동에서는 충격파(Shock wave)와 같은 불연속적인 현상이 발생할 수 있습니다.",
            en: "Mach Number is a dimensionless quantity in fluid dynamics representing the ratio of flow velocity past a boundary to the local speed of sound.<br><br><strong>Formula:</strong> Ma = v / c<br>Ma < 1 is subsonic, Ma > 1 is supersonic. Supersonic flows can lead to shock waves."
        },
        inputs: [
            { id: 'v', label: { ko: '유속 (v) [m/s]', en: 'Flow Velocity (v) [m/s]' }, placeholder: 'e.g. 340' },
            { id: 'c', label: { ko: '음속 (c) [m/s]', en: 'Speed of Sound (c) [m/s]' }, placeholder: 'e.g. 340' }
        ],
        calculate: (vals) => vals.v / vals.c,
        getInfo: (res) => {
            if (res < 0.8) return { ko: "아음속 (Subsonic)", en: "Subsonic" };
            if (res < 1.2) return { ko: "천음속 (Transonic)", en: "Transonic" };
            if (res < 5.0) return { ko: "초음속 (Supersonic)", en: "Supersonic" };
            return { ko: "극초음속 (Hypersonic)", en: "Hypersonic" };
        }
    },
    nusselt: {
        title: "Nusselt Number",
        description: {
            ko: "누셀트 수(Nusselt Number)는 경계면에서의 대류 열전달과 전도 열전달의 비율을 나타냅니다. 이 값이 클수록 대류에 의한 열전달이 활발함을 의미합니다.<br><br><strong>공식:</strong> Nu = hL / k<br>여기서 h는 대류 열전달 계수, L은 특성 길이, k는 유체의 열전도율입니다. Nu = 1 이면 순수 전도만 일어나는 상태에 가깝습니다.",
            en: "Nusselt Number is the ratio of convective to conductive heat transfer at a boundary in a fluid. A larger Nusselt number corresponds to more active convection.<br><br><strong>Formula:</strong> Nu = hL / k<br>Where h is convective heat transfer coefficient, L is characteristic length, k is thermal conductivity."
        },
        inputs: [
            { id: 'h', label: { ko: '대류 열전달 계수 (h) [W/m²K]', en: 'Convective Heat Transfer Coeff (h) [W/m²K]' }, placeholder: 'e.g. 50' },
            { id: 'L', label: { ko: '특성 길이 (L) [m]', en: 'Characteristic Length (L) [m]' }, placeholder: 'e.g. 0.1' },
            { id: 'k', label: { ko: '열전도율 (k) [W/mK]', en: 'Thermal Conductivity (k) [W/mK]' }, placeholder: 'e.g. 0.6' }
        ],
        calculate: (vals) => (vals.h * vals.L) / vals.k,
        getInfo: (res) => ({
            ko: "Nu > 1: 전도보다 대류가 우세함",
            en: "Nu > 1: Convection is more effective than conduction."
        })
    },
    prandtl: {
        title: "Prandtl Number",
        description: {
            ko: "프란틀 수(Prandtl Number)는 운동량 확산(점성)과 열 확산(열전도)의 비율을 나타내는 무차원수입니다. 이는 유체의 고유한 물성치로 결정되며, 속도 경계층과 온도 경계층의 상대적 두께를 비교하는 데 사용됩니다.<br><br><strong>공식:</strong> Pr = μc_p / k = ν / α",
            en: "Prandtl Number is the ratio of momentum diffusivity (kinematic viscosity) to thermal diffusivity. It depends only on the fluid type and its state.<br><br><strong>Formula:</strong> Pr = μc_p / k = ν / α"
        },
        inputs: [
            { id: 'mu', label: { ko: '동점성 계수 (μ) [Pa·s]', en: 'Dynamic Viscosity (μ) [Pa·s]' }, placeholder: 'e.g. 0.001' },
            { id: 'cp', label: { ko: '비열 (c_p) [J/kgK]', en: 'Specific Heat Capacity (c_p) [J/kgK]' }, placeholder: 'e.g. 4180' },
            { id: 'k', label: { ko: '열전도율 (k) [W/mK]', en: 'Thermal Conductivity (k) [W/mK]' }, placeholder: 'e.g. 0.6' }
        ],
        calculate: (vals) => (vals.mu * vals.cp) / vals.k,
        getInfo: (res) => ({
            ko: `Pr ≈ ${res.toFixed(1)}: 유체 고유 특성`,
            en: `Pr ≈ ${res.toFixed(1)}: Fluid property characteristic.`
        })
    },
    schmidt: {
        title: "Schmidt Number",
        description: {
            ko: "슈미트 수(Schmidt Number)는 운동량 확산율(점성)과 질량 확산율의 비를 나타냅니다. 프란틀 수의 질량 전달 대응물이라고 볼 수 있으며, 속도 경계층과 농도 경계층의 상대적 두께를 결정합니다.",
            en: "Schmidt Number is a dimensionless number defined as the ratio of momentum diffusivity (kinematic viscosity) and mass diffusivity. It relates the relative thickness of the hydrodynamic layer and mass-transfer boundary layer."
        },
        inputs: [
            { id: 'mu', label: { ko: '동점성 계수 (μ) [Pa·s]', en: 'Dynamic Viscosity (μ) [Pa·s]' }, placeholder: 'e.g. 0.001' },
            { id: 'rho', label: { ko: '밀도 (ρ) [kg/m³]', en: 'Density (ρ) [kg/m³]' }, placeholder: 'e.g. 1000' },
            { id: 'D', label: { ko: '질량 확산 계수 (D) [m²/s]', en: 'Mass Diffusivity (D) [m²/s]' }, placeholder: 'e.g. 1e-9' }
        ],
        calculate: (vals) => vals.mu / (vals.rho * vals.D),
        getInfo: (res) => ({
            ko: "Sc는 운동량 확산과 질량 확산의 관계를 나타냄",
            en: "Sc relates momentum and mass diffusivity."
        })
    },
    peclet: {
        title: "Peclet Number",
        description: {
            ko: "페클레 수(Peclet Number)는 유동에 의한 이송(Advection)과 확산(Diffusion)의 비율을 나타냅니다. 열전달이나 질량전달 문제에서 대류의 중요성을 판단하는 척도가 됩니다.",
            en: "Peclet Number is a dimensionless number defined to be the ratio of the rate of advection of a physical quantity by the flow to the rate of diffusion of the same quantity."
        },
        inputs: [
            { id: 'v', label: { ko: '속도 (v) [m/s]', en: 'Velocity (v) [m/s]' }, placeholder: 'e.g. 2.0' },
            { id: 'L', label: { ko: '특성 길이 (L) [m]', en: 'Characteristic Length (L) [m]' }, placeholder: 'e.g. 0.5' },
            { id: 'alpha', label: { ko: '열확산 계수 (α) [m²/s]', en: 'Thermal Diffusivity (α) [m²/s]' }, placeholder: 'e.g. 1e-7' }
        ],
        calculate: (vals) => (vals.v * vals.L) / vals.alpha,
        getInfo: (res) => ({
            ko: "Pe > 100: 확산보다 이송이 지배적임",
            en: "Pe > 100: Advection dominates over diffusion."
        })
    },
    strouhal: {
        title: "Strouhal Number",
        description: {
            ko: "스트로할 수(Strouhal Number)는 비상시 유동(Unsteady flow)에서의 진동 특성을 나타냅니다. 예를 들어, 바람에 흔들리는 전선이나 카르만 와류(Karman Vortex Street) 현상을 분석할 때 중요합니다.",
            en: "Strouhal Number represents the oscillating flow mechanisms. It is often used to describe oscillating flow mechanisms such as Karman vortex street."
        },
        inputs: [
            { id: 'f', label: { ko: '와류 방출 주파수 (f) [Hz]', en: 'Frequency (f) [Hz]' }, placeholder: 'e.g. 10' },
            { id: 'L', label: { ko: '특성 길이 (L) [m]', en: 'Characteristic Length (L) [m]' }, placeholder: 'e.g. 0.1' },
            { id: 'v', label: { ko: '속도 (v) [m/s]', en: 'Velocity (v) [m/s]' }, placeholder: 'e.g. 5' }
        ],
        calculate: (vals) => (vals.f * vals.L) / vals.v,
        getInfo: (res) => ({
            ko: "비정상 유동의 진동 특성을 나타냄",
            en: "St represents non-steady flow oscillations."
        })
    },
    froude: {
        title: "Froude Number",
        description: {
            ko: "프루드 수(Froude Number)는 유체의 관성력과 중력의 비율을 나타냅니다. 개수로(Open channel) 유동이나 선박의 조파 저항 등을 해석할 때 필수적인 무차원수입니다.",
            en: "Froude Number is a dimensionless number defined as the ratio of the flow inertia to the external field (the latter in many applications simply being gravity)."
        },
        inputs: [
            { id: 'v', label: { ko: '속도 (v) [m/s]', en: 'Velocity (v) [m/s]' }, placeholder: 'e.g. 3.0' },
            { id: 'L', label: { ko: '특성 길이 (L) [m]', en: 'Characteristic Length (L) [m]' }, placeholder: 'e.g. 5.0' },
            { id: 'g', label: { ko: '중력 가속도 (g) [m/s²]', en: 'Gravity (g) [m/s²]' }, placeholder: '9.81' }
        ],
        calculate: (vals) => vals.v / Math.sqrt(vals.g * vals.L),
        getInfo: (res) => {
            if (res < 1) return { ko: "상류 (Subcritical flow)", en: "Subcritical flow" };
            if (res === 1) return { ko: "한계류 (Critical flow)", en: "Critical flow" };
            return { ko: "사류 (Supercritical flow)", en: "Supercritical flow" };
        }
    },
    weber: {
        title: "Weber Number",
        description: {
            ko: "웨버 수(Weber Number)는 관성력과 표면장력의 비율을 나타냅니다. 잉크젯 프린팅, 연료 분사, 기포 형성 등 표면장력이 중요한 다상 유동에서 주로 사용됩니다.",
            en: "Weber Number is a dimensionless number that is often useful in analyzing fluid flows where there is an interface between two different fluids, especially for multiphase flows with strongly curved surfaces."
        },
        inputs: [
            { id: 'rho', label: { ko: '밀도 (ρ) [kg/m³]', en: 'Density (ρ) [kg/m³]' }, placeholder: 'e.g. 1000' },
            { id: 'v', label: { ko: '속도 (v) [m/s]', en: 'Velocity (v) [m/s]' }, placeholder: 'e.g. 2.0' },
            { id: 'L', label: { ko: '특성 길이 (L) [m]', en: 'Characteristic Length (L) [m]' }, placeholder: 'e.g. 0.01' },
            { id: 'sigma', label: { ko: '표면장력 (σ) [N/m]', en: 'Surface Tension (σ) [N/m]' }, placeholder: 'e.g. 0.072' }
        ],
        calculate: (vals) => (vals.rho * Math.pow(vals.v, 2) * vals.L) / vals.sigma,
        getInfo: (res) => ({
            ko: "관성력과 표면장력의 관계",
            en: "We relates inertia to surface tension."
        })
    },
    knudsen: {
        title: "Knudsen Number",
        description: {
            ko: "누센 수(Knudsen Number)는 분자의 평균 자유 행로와 시스템의 특성 길이의 비율입니다. 이 수가 매우 작으면(Kn < 0.01) 유체를 연속체로 가정할 수 있지만, 크면 희박 기체 역학(Rarefied Gas Dynamics)을 적용해야 합니다.",
            en: "Knudsen Number is a dimensionless number defined as the ratio of the molecular mean free path length to a representative physical length scale."
        },
        inputs: [
            { id: 'lambda', label: { ko: '평균 자유 행로 (λ) [m]', en: 'Mean Free Path (λ) [m]' }, placeholder: 'e.g. 6.8e-8' },
            { id: 'L', label: { ko: '특성 길이 (L) [m]', en: 'Characteristic Length (L) [m]' }, placeholder: 'e.g. 0.001' }
        ],
        calculate: (vals) => vals.lambda / vals.L,
        getInfo: (res) => {
            if (res < 0.01) return { ko: "연속체 유동 (Continuum flow)", en: "Continuum flow" };
            if (res < 0.1) return { ko: "미끄럼 유동 (Slip flow)", en: "Slip flow" };
            return { ko: "천이/자유 분자 유동 (Transition/Free molecular flow)", en: "Transition/Free molecular flow" };
        }
    }
};

let currentCalculator = null;

function updateStaticText() {
    const langData = translations[currentLang];
    
    // Update data-i18n elements
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (langData[key]) {
            el.innerText = langData[key];
        }
    });

    // Update Language Toggle Button text
    document.getElementById('langToggle').innerText = currentLang === 'ko' ? "EN" : "한글";
    
    // Update html lang attribute
    document.documentElement.setAttribute('lang', currentLang);
}

function openModal(type) {
    const calc = calculators[type];
    if (!calc) return;
    
    currentCalculator = type;
    const body = document.getElementById('modalBody');
    const resultContainer = document.getElementById('resultContainer');
    
    resultContainer.classList.remove('active');
    
    let html = `<h2>${calc.title}</h2>`;
    
    // Use correct language description
    if (calc.description) {
        html += `<div class="calc-description" style="color: var(--text-secondary); margin-bottom: 1.5rem; line-height: 1.5; font-size: 0.95rem;">
            ${calc.description[currentLang]}
        </div>`;
    }

    calc.inputs.forEach(input => {
        html += `
            <div class="input-group">
                <label for="${input.id}">${input.label[currentLang]}</label>
                <input type="number" id="${input.id}" placeholder="${input.placeholder}" step="any">
            </div>
        `;
    });
    
    const btnText = translations[currentLang].calculate_btn;
    html += `<button class="calculate-btn" onclick="runCalculation()">${btnText}</button>`;
    
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
        alert(translations[currentLang].alert_fill_all);
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
    
    // Get info text based on language
    const infoData = calc.getInfo(result);
    // Handle both object return and potentially simple string (though we refactored to object)
    if (typeof infoData === 'object' && infoData[currentLang]) {
        resultInfo.innerText = infoData[currentLang];
    } else {
        resultInfo.innerText = infoData;
    }
    
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

/**
 * Language Toggle Logic
 */
const langToggleBtn = document.getElementById('langToggle');

function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('lang', lang);
    updateStaticText();
    // If modal is open, refresh it
    if (currentCalculator) {
        openModal(currentCalculator);
    }
}

langToggleBtn.addEventListener('click', () => {
    setLanguage(currentLang === 'ko' ? 'en' : 'ko');
});

// Initialize Language
const savedLang = localStorage.getItem('lang');
if (savedLang) {
    setLanguage(savedLang);
} else {
    // Detect browser language
    const browserLang = navigator.language.startsWith('ko') ? 'ko' : 'en';
    setLanguage(browserLang); 
}
