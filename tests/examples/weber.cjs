// Weber number examples (guides/weber, calculators/weber; Korean and English).
// Properties: water 20 °C rho = 998.2 kg/m³, mu = 1.0000e-3 Pa·s (IAEA Table 3.3);
// sigma = 0.0728 N/m (OpenStax via UCF Pressbooks); air 20 °C 1.166 kg/m³ at 98.1 kPa
// (IAEA Table 3.1) scaled to 101.325 kPa as an ideal gas -> 1.2043 kg/m³.
module.exports = ({calc, shows, printed, example}) => {
    const G = ['guides/weber.html', 'en/guides/weber.html'];
    const C = ['calculators/weber.html', 'en/calculators/weber.html'];
    const rhoW = 998.2, rhoA = 1.2043, sigma = 0.0728, muW = 1.0e-3, g = 9.81;
    for (const t of ['998.2 kg/m³', '1.2043 kg/m³', '0.0728 N/m', '72.70 mN/m']) printed(t, G);
    shows(1.166 * 101.325 / 98.1, '1.2043', G);
    shows(0.07270, '0.0727', G);
    shows(rhoW / rhoA, '829', G);

    // Size table: sigma/L and the speed for We = 1 with air and water density.
    const table = [[1e-5, '7,280', '77.7', '2.70'], [1e-4, '728', '24.6', '0.854'],
                   [1e-3, '72.8', '7.77', '0.270'], [1e-2, '7.28', '2.46', '0.0854']];
    for (const [L, p, va, vw] of table) {
        shows(sigma / L, p, G);
        const vA = Math.sqrt(sigma / (rhoA * L)), vW = Math.sqrt(sigma / (rhoW * L));
        shows(vA, va, G); shows(vW, vw, G);
        shows(calc('weber', {rho: rhoA, v: vA, L, sigma}), '1', []);
    }

    // Guide example 1: 0.5 mm water drop, 30 m/s slip in air (assumed conditions).
    example();
    const d1 = 0.5e-3;
    printed('0.0005 m', G);
    shows(rhoA * 30 ** 2, '1,084', G);
    shows(sigma / d1, '145.6', G);
    shows(calc('weber', {rho: rhoA, v: 30, L: d1, sigma}), '7.44', G);
    shows(Math.sqrt(12 * sigma / (rhoA * d1)), '38.1', [...G, ...C]);
    shows(Math.sqrt(50 * sigma / (rhoA * d1)), '77.7', G);
    shows(calc('weber', {rho: rhoA, v: 30, L: d1 / 2, sigma}), '3.72', G);
    shows(calc('weber', {rho: rhoW, v: 30, L: d1, sigma}), '6,170', G);
    shows(muW / Math.sqrt(rhoW * sigma * d1), '0.0052', G);

    // Guide example 2: falling raindrop scaling (MIT Bush slides), radius a = 1 mm and 3 mm.
    example();
    const rain = a => { const U = Math.sqrt(rhoW * g * a / rhoA); return {U, We: calc('weber', {rho: rhoA, v: U, L: a, sigma}), Bo: rhoW * g * a * a / sigma}; };
    const r1 = rain(0.001), r3 = rain(0.003);
    shows(r1.U, '2.85', G); shows(r1.We, '0.135', G); shows(r1.Bo, '0.135', G);
    shows(r3.U, '4.94', G); shows(r3.We, '1.21', G);
    shows(2 * r1.We, '0.269', G); shows(2 * r3.We, '2.42', G);
    shows(Math.sqrt(sigma / (rhoW * g)) * 1000, '2.73', G);

    // Guide example 3: tap jet, 4 L/min through a 10 mm outlet (assumed).
    example();
    const Q = 4e-3 / 60, A = Math.PI * 0.01 ** 2 / 4, vj = Q / A;
    shows(Q, '6.67 × 10⁻⁵', G); shows(A, '7.85 × 10⁻⁵', G); shows(vj, '0.849', G);
    shows(calc('weber', {rho: rhoW, v: vj, L: 0.01, sigma}), '98.8', G);
    shows(rhoW * vj ** 2, '719', G);
    shows(sigma / 0.005, '14.56', G);
    shows(calc('weber', {rho: rhoA, v: vj, L: 0.01, sigma}), '0.119', G);

    // Calculator example 1: fill-in values versus tabulated properties.
    example();
    const Wf = calc('weber', {rho: 1000, v: 2, L: 0.01, sigma: 0.072});
    const Wt = calc('weber', {rho: rhoW, v: 2, L: 0.01, sigma});
    shows(Wf, '555.56', C); shows(Wt, '548.46', C);
    shows(calc('weber', {rho: 1000, v: 1, L: 0.01, sigma: 0.072}), '138.89', C);
    shows((Wf / Wt - 1) * 100, '1.3', C);

    // Calculator example 2: 50 μm drop, speed for We = 12 in air.
    example();
    const d2 = 50e-6;
    printed('0.00005 m', C);
    shows(sigma / d2, '1456', C);
    shows(Math.sqrt(12 * sigma / (rhoA * d2)), '120.4', C);
    shows(calc('weber', {rho: rhoA, v: 120.4, L: d2, sigma}), '11.99', C);
    shows(Math.sqrt(10), '3.16', C);
};
