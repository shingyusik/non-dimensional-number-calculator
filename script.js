/**
 * Dimensionless Number Calculator Logic
 * Supported Languages: 'ko', 'en'
 */

let currentLang = 'ko'; // Default language

const translations = {
    ko: {
        page_title: "무차원수 계산기",
        page_subtitle: "유동·열전달·물질전달·계면·기체 문제의 무차원수 10종을 계산하고 해석합니다",
        intro_title: "이 사이트에서 할 수 있는 일",
        intro_text: "calctool.cc는 유체역학과 열·물질전달에서 쓰는 무차원수 10종을 계산하는 개인 프로젝트입니다. 계산기마다 전용 페이지가 있어 공식, 변수와 SI 단위, 단위를 바꿀 때 자주 틀리는 부분, 결과를 읽는 기준을 계산과 함께 확인할 수 있습니다.",
        intro_text2: "무차원수는 크기나 조건이 다른 두 문제를 같은 잣대로 비교하게 해 주지만, 특성 길이와 물성값을 어떻게 정했는지에 따라 같은 이름의 수도 다른 뜻이 됩니다. 그래서 이 사이트는 숫자 하나를 내놓는 데서 멈추지 않고 그 숫자가 어떤 가정에서 의미가 있는지를 함께 적어 둡니다. 계산은 브라우저에서 이루어지며, 공식은 공개 저장소의 자동 검사로 예제 값과 대조합니다.",
        intro_step1: "아래 분야에서 필요한 무차원수를 찾아 계산기 페이지를 엽니다.",
        intro_step2: "입력 단위를 SI로 맞춰 계산하고, 결과 아래의 해석 문장과 적용 범위를 확인합니다.",
        intro_step3: "설계나 실험에 쓴다면 원래 물성 자료와 경계 조건을 다시 확인하고, 계산 노트에서 다른 무차원수와 교차검산합니다.",
        intro_more: "사이트를 만든 이유와 계산식 검증 방법은 소개 페이지에 정리했습니다.",
        intro_more_link: "소개 보기",
        jump_label: "분야 바로가기:",
        open_calculator: "계산기 열기",
        notes_label: "관련 계산 노트",
        all_guides: "전체 해설 목록 보기",
        limits_title: "계산기가 하지 않는 일",
        limits_text: "이 도구는 입력한 값으로 무차원 비를 계산합니다. 물성값이나 열전달 계수를 자동 예측하지 않습니다. 예제는 학습용 가정이며 실제 측정 자료로 바꾸어 계산해야 합니다.",
        result_label: "결과",
        calculate_btn: "계산하기",
        alert_fill_all: "모든 값을 입력해 주세요.",
        alert_invalid_values: "0으로 나눌 수 없으며 음수 입력은 사용할 수 없습니다. 값을 확인해 주세요.",
        footer_home: "홈",
        footer_guides: "해설 목록",
        footer_about: "소개",
        footer_contact: "문의",
        privacy_policy: "개인정보처리방침",
        terms_service: "이용약관",
        copyright: "© 2026 무차원수 계산기 · calctool.cc",
        reynolds_short_desc: "유체의 관성력과 점성력의 비를 나타내며, 유동이 층류인지 난류인지 판단하는 지표입니다.",
        name_reynolds: "레이놀즈 수 (Re)",
        mach_short_desc: "유체의 속도와 음속의 비를 나타내며, 압축성 유동의 특성을 결정합니다.",
        name_mach: "마하 수 (Ma)",
        nusselt_short_desc: "대류 열전달과 전도 열전달의 비를 나타내며, 대류가 열전달에 기여하는 정도를 결정합니다.",
        name_nusselt: "누셀트 수 (Nu)",
        prandtl_short_desc: "운동량 확산과 열 확산의 비를 나타내며, 유체의 물리적 특성만으로 결정됩니다.",
        name_prandtl: "프란틀 수 (Pr)",
        schmidt_short_desc: "운동량 확산율과 물질의 분자 확산율을 비교합니다.",
        name_schmidt: "슈미트 수 (Sc)",
        peclet_short_desc: "유동에 의한 이송(Advection)과 확산(Diffusion)의 비를 나타냅니다.",
        name_peclet: "페클레 수 (Pe)",
        strouhal_short_desc: "비정상 유동(Unsteady flow)의 진동 특성을 나타내는 무차원수입니다.",
        name_strouhal: "스트로할 수 (St)",
        froude_short_desc: "관성력과 중력의 비를 나타내며, 개수로 유동이나 선박 공학에서 중요합니다.",
        name_froude: "프루드 수 (Fr)",
        weber_short_desc: "관성력과 표면장력의 비를 나타내며, 액적의 분열이나 기포 형성 분석에 사용됩니다.",
        name_weber: "웨버 수 (We)",
        knudsen_short_desc: "분자 평균 자유 행로와 특성 길이의 비를 나타내며, 연속체 가설의 타당성을 판단합니다.",
        name_knudsen: "누센 수 (Kn)",
        cat_flow_title: "유동",
        cat_flow_desc: "관성·점성·중력의 균형과 흐름 속에서 반복되는 진동을 다룹니다. 관 속 흐름, 개수로, 축소 모형 실험, 원기둥 뒤 와류 방출이 대표적인 예입니다.",
        cat_heat_title: "열전달",
        cat_heat_desc: "열이 흐름에 실려 이동하는지, 유체 속으로 확산하는지, 표면에서 얼마나 전달되는지를 서로 다른 비율로 나눠 봅니다.",
        cat_mass_title: "물질전달",
        cat_mass_desc: "용질이나 기체 성분의 농도가 퍼지는 문제입니다. 열 대신 특정 성분의 분자 확산 계수 D를 쓴다는 점이 열전달과 다릅니다.",
        cat_interface_title: "계면",
        cat_interface_desc: "액적, 기포, 분무처럼 두 유체의 경계면 모양이 결과를 좌우하는 경우 관성과 표면장력을 비교합니다.",
        cat_gas_title: "기체·압축성",
        cat_gas_desc: "기체의 밀도 변화가 중요한지(마하 수)와 분자 크기 척도를 무시할 수 있는지(누센 수)를 따로 확인합니다.",
        note_pipe_flow: "관 유동에서 Re·Pr·Pe를 함께 검산하기",
        note_model_similarity: "축소 모형에서 Re와 Fr을 동시에 맞출 수 있을까?",
        note_pipe_energy: "관의 압력손실: 보존법칙에서 포아죄유 해까지",
        note_transport_scales: "열·물질 확산과 경계층: Pr·Sc·Pe·Nu의 다른 역할",
        note_gas_models: "기체 유동 모델 선택: 마하 수와 누센 수를 따로 확인하기",
        note_interface_time_scales: "표면장력과 비정상 유동: 힘의 비와 시간의 비 연결하기"
    },
    en: {
        page_title: "Dimensionless Number Calculator",
        page_subtitle: "Calculate and interpret ten dimensionless numbers for flow, heat, mass, interface and gas problems",
        intro_title: "What this site does",
        intro_text: "calctool.cc is a personal project for calculating ten dimensionless numbers used in fluid mechanics and heat and mass transfer. Each calculator has its own page showing the formula, variables and SI units, common unit-conversion mistakes and how to read the result, right next to the calculation.",
        intro_text2: "Dimensionless numbers let you compare problems of different size and conditions on one scale, but the same named number can mean different things depending on the chosen length and properties. So the site does not stop at a single number; it also states the assumptions under which that number is meaningful. Calculations run in your browser, and the formulas are checked against worked examples by automated tests in the public repository.",
        intro_step1: "Find the number you need in the fields below and open its calculator page.",
        intro_step2: "Enter values in SI units, then read the explanation and limits shown under the result.",
        intro_step3: "For design or experiments, recheck the source properties and boundary conditions, and cross-check with other numbers in the calculation notes.",
        intro_more: "Why the site exists and how its formulas are checked are described on the about page.",
        intro_more_link: "Read the about page",
        jump_label: "Jump to a field:",
        open_calculator: "Open calculator",
        notes_label: "Related calculation notes",
        all_guides: "See all guides",
        limits_title: "What the calculators do not do",
        limits_text: "The calculators evaluate dimensionless ratios from your inputs. They do not predict material properties or heat-transfer coefficients. The worked inputs are illustrative and must be replaced with data for your conditions.",
        result_label: "Result",
        calculate_btn: "Calculate",
        alert_fill_all: "Please enter all values.",
        alert_invalid_values: "Check the values: negative inputs and division by zero are not supported.",
        footer_home: "Home",
        footer_guides: "Guides",
        footer_about: "About",
        footer_contact: "Contact",
        privacy_policy: "Privacy Policy",
        terms_service: "Terms of Use",
        copyright: "© 2026 Dimensionless Number Calculator · calctool.cc",
        reynolds_short_desc: "Ratio of inertial forces to viscous forces, determining if flow is laminar or turbulent.",
        name_reynolds: "Reynolds number (Re)",
        mach_short_desc: "Ratio of flow velocity to the speed of sound, determining compressibility effects.",
        name_mach: "Mach number (Ma)",
        nusselt_short_desc: "Ratio of convective to conductive heat transfer, indicating the effectiveness of convection.",
        name_nusselt: "Nusselt number (Nu)",
        prandtl_short_desc: "Ratio of momentum diffusivity to thermal diffusivity, determined solely by fluid properties.",
        name_prandtl: "Prandtl number (Pr)",
        schmidt_short_desc: "Ratio of momentum diffusivity to mass diffusivity, describing convective mass transfer.",
        name_schmidt: "Schmidt number (Sc)",
        peclet_short_desc: "Ratio of advection to diffusion rates.",
        name_peclet: "Péclet number (Pe)",
        strouhal_short_desc: "Describes oscillating flow mechanisms in unsteady flow.",
        name_strouhal: "Strouhal number (St)",
        froude_short_desc: "Ratio of flow inertia to external field (gravity), important in open-channel flow.",
        name_froude: "Froude number (Fr)",
        weber_short_desc: "Ratio of inertia to surface tension, used in analyzing droplet formation.",
        name_weber: "Weber number (We)",
        knudsen_short_desc: "Ratio of mean free path to characteristic length, determining validity of continuum assumption.",
        name_knudsen: "Knudsen number (Kn)",
        cat_flow_title: "Fluid flow",
        cat_flow_desc: "Balances between inertia, viscosity and gravity, plus periodic motion inside a flow: pipe flow, open channels, scale-model tests and vortex shedding behind cylinders.",
        cat_heat_title: "Heat transfer",
        cat_heat_desc: "Separate ratios for heat carried by the flow, heat diffusing through the fluid, and heat exchanged at a surface.",
        cat_mass_title: "Mass transfer",
        cat_mass_desc: "Spreading of a dissolved or gaseous species. The molecular diffusivity D of that species takes the place of thermal diffusivity.",
        cat_interface_title: "Interfaces",
        cat_interface_desc: "Droplets, bubbles and sprays, where the shape of the boundary between two fluids depends on inertia versus surface tension.",
        cat_gas_title: "Gases and compressibility",
        cat_gas_desc: "Two separate checks for gases: whether density changes matter (Mach number) and whether molecular length scales can be ignored (Knudsen number).",
        note_pipe_flow: "Cross-check Re, Pr and Pe for pipe flow",
        note_model_similarity: "Can a scale model match both Re and Fr?",
        note_pipe_energy: "Pipe pressure loss: from conservation laws to Poiseuille flow",
        note_transport_scales: "Thermal and mass diffusion: the distinct roles of Pr, Sc, Pe and Nu",
        note_gas_models: "Choosing gas-flow models: check Mach and Knudsen numbers separately",
        note_interface_time_scales: "Surface tension and unsteady flow: connect force ratios to time ratios"
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

    document.querySelectorAll('[data-guide]').forEach(link => {
        const type = link.dataset.guide;
        if (!calculators[type]) return;
        if (!link.dataset.koLabel) link.dataset.koLabel = link.textContent;
        link.textContent = currentLang === 'ko' ? link.dataset.koLabel : `${calculators[type].title} guide & example`;
        link.href = currentLang === 'ko' ? `/guides/${type}` : `/en/guides/${type}`;
    });

    document.querySelectorAll('[data-calc]').forEach(link => {
        link.href = currentLang === 'ko' ? `/calculators/${link.dataset.calc}` : `/en/calculators/${link.dataset.calc}`;
    });

    // Links with an English counterpart keep the Korean URL in href until switched.
    document.querySelectorAll('[data-en-href]').forEach(link => {
        if (!link.dataset.koHref) link.dataset.koHref = link.getAttribute('href');
        link.href = currentLang === 'ko' ? link.dataset.koHref : link.dataset.enHref;
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
    if (Object.values(vals).some(value => value < 0) || !Number.isFinite(result)) {
        alert(translations[currentLang].alert_invalid_values);
        return;
    }
    const resultContainer = document.getElementById('resultContainer');
    const resultValue = document.getElementById('resultValue');
    const resultInfo = document.getElementById('resultInfo');
    
    resultValue.innerText = formatResult(result);
    
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

// Older links such as /#reynolds still open the calculator in a modal.
function openCalculatorFromHash() {
    const type = location.hash.slice(1);
    if (calculators[type]) openModal(type);
}
window.addEventListener('hashchange', openCalculatorFromHash);
openCalculatorFromHash();
