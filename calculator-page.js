/**
 * Calculator pages (/calculators/<name>, /en/calculators/<name>).
 * Uses the shared formulas in calculators.js; guide.js handles theme and language.
 */
(function () {
    const form = document.getElementById('calcForm');
    if (!form) return;
    const type = form.dataset.calculator;
    const calc = calculators[type];
    const lang = document.documentElement.lang === 'en' ? 'en' : 'ko';
    const text = {
        ko: {
            fill: '모든 값을 입력해 주세요.',
            invalid: '0으로 나눌 수 없으며 음수 입력은 사용할 수 없습니다. 값을 확인해 주세요.'
        },
        en: {
            fill: 'Please enter all values.',
            invalid: 'Check the values: negative inputs and division by zero are not supported.'
        }
    }[lang];

    // One sentence per calculator that restates the result in terms of the inputs.
    const explain = {
        reynolds: (re) => {
            const range = re < 2300
                ? { ko: '원형 관 내부 유동이고 L이 안지름이라면 층류 쪽 안내값(2300 미만)입니다.', en: 'For flow inside a circular pipe with L as the inner diameter, this is in the laminar guide range (below 2300).' }
                : re > 4000
                    ? { ko: '원형 관 내부 유동이고 L이 안지름이라면 난류 쪽 안내값(4000 초과)입니다.', en: 'For flow inside a circular pipe with L as the inner diameter, this is in the turbulent guide range (above 4000).' }
                    : { ko: '원형 관 기준 2300~4000 사이의 천이 구간입니다. 입구 조건, 교란, 벽 거칠기에 따라 층류로도 난류로도 나타날 수 있습니다.', en: 'This lies between 2300 and 4000, the transitional band for circular pipes. Inlet conditions, disturbances and wall roughness decide what actually appears.' };
            return {
                ko: `${range.ko} 관이 아닌 형상에는 이 경계를 그대로 쓰지 마세요.`,
                en: `${range.en} Do not apply these pipe thresholds to other geometries.`
            };
        },
        mach: (ma) => ({
            ko: `유속이 입력한 음속의 ${formatResult(ma)}배입니다. 아음속·천음속 같은 구간 이름은 자유류 기준의 대략적인 구분이며, 물체 표면의 국소 마하 수는 이보다 클 수 있습니다.`,
            en: `The flow speed is ${formatResult(ma)} times the speed of sound you entered. The regime label is a rough free-stream classification; local Mach numbers on a body surface can be higher.`
        }),
        nusselt: (nu) => ({
            ko: `입력한 h가 같은 길이에서의 전도 척도 k/L의 ${formatResult(nu)}배입니다. 형상과 L의 정의가 같은 경우끼리만 비교하세요.`,
            en: `The h you entered is ${formatResult(nu)} times the conduction scale k/L over the same length. Compare only cases with the same geometry and definition of L.`
        }),
        prandtl: (pr) => ({
            ko: `운동량 확산율 ν가 열확산율 α의 ${formatResult(pr)}배입니다. 속도나 길이를 바꿔도 이 값은 변하지 않으며, 온도가 바뀌어 물성이 달라질 때 변합니다.`,
            en: `Momentum diffusivity ν is ${formatResult(pr)} times thermal diffusivity α. The value does not depend on speed or length; it changes when temperature changes the properties.`
        }),
        schmidt: (sc) => ({
            ko: `운동량 확산율 ν가 입력한 성분의 분자 확산 계수 D의 ${formatResult(sc)}배입니다. 성분과 매질 조합이 바뀌면 D부터 다시 찾아야 합니다.`,
            en: `Momentum diffusivity ν is ${formatResult(sc)} times the molecular diffusivity D you entered. A different solute or solvent needs its own D.`
        }),
        peclet: (pe) => ({
            ko: `선택한 길이에서 열확산 시간 L²/α가 이송 시간 L/v의 ${formatResult(pe)}배입니다. 1보다 훨씬 크면 이 길이에서는 흐름에 실려 가는 효과가 확산보다 빠릅니다.`,
            en: `At the chosen length, the diffusion time L²/α is ${formatResult(pe)} times the transit time L/v. Values far above 1 mean advection outpaces diffusion at that length.`
        }),
        strouhal: (st) => ({
            ko: `유체가 길이 L을 지나는 시간 L/v가 진동 주기 1/f의 ${formatResult(st)}배입니다. f가 어떤 진동의 주파수인지 함께 기록해야 다른 결과와 비교할 수 있습니다.`,
            en: `The transit time L/v is ${formatResult(st)} times the oscillation period 1/f. Record which oscillation f refers to before comparing with other results.`
        }),
        froude: (fr) => ({
            ko: `유속이 중력 파동 속도 척도 √(gL)의 ${formatResult(fr)}배입니다. 상류·사류 구분은 L이 개수로의 수심 척도일 때만 쓸 수 있습니다.`,
            en: `The flow speed is ${formatResult(fr)} times the gravity-wave speed scale √(gL). The subcritical/supercritical labels only apply when L is an open-channel depth scale.`
        }),
        weber: (we) => ({
            ko: `관성 압력 척도 ρv²가 표면장력 압력 척도 σ/L의 ${formatResult(we)}배입니다. 액적이 쪼개지는지는 이 값 하나로 정해지지 않으므로 같은 L 정의를 쓴 실험·문헌과 비교하세요.`,
            en: `The inertial pressure scale ρv² is ${formatResult(we)} times the surface-tension pressure scale σ/L. Breakup is not decided by this number alone; compare with data that use the same L.`
        }),
        knudsen: (kn) => ({
            ko: `평균 자유 행로가 특성 길이의 ${formatResult(kn)}배입니다. 표시된 구간 경계(0.01, 0.1)는 문헌마다 조금씩 다른 대략적인 기준입니다.`,
            en: `The mean free path is ${formatResult(kn)} times the characteristic length. The displayed regime limits (0.01 and 0.1) are approximate and vary between references.`
        })
    };

    const error = document.getElementById('calcError');
    const result = document.getElementById('calcResult');

    function showError(message) {
        error.textContent = message;
        error.hidden = false;
        result.classList.remove('active');
    }

    const exampleButton = document.getElementById('fillExample');
    if (exampleButton) {
        exampleButton.addEventListener('click', () => {
            calc.inputs.forEach(input => {
                const field = document.getElementById(`in-${input.id}`);
                field.value = field.dataset.example;
            });
            form.requestSubmit();
        });
    }

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const vals = {};
        for (const input of calc.inputs) {
            const value = parseFloat(document.getElementById(`in-${input.id}`).value);
            if (isNaN(value)) return showError(text.fill);
            vals[input.id] = value;
        }
        const value = calc.calculate(vals);
        if (Object.values(vals).some(v => v < 0) || !Number.isFinite(value)) return showError(text.invalid);

        error.hidden = true;
        document.getElementById('resultValue').textContent = formatResult(value);
        document.getElementById('resultInfo').textContent = calc.getInfo(value)[lang];
        document.getElementById('resultExplain').textContent = explain[type](value)[lang];
        result.classList.add('active');
    });
})();
