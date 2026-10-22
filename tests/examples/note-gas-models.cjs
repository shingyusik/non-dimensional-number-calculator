// Calculation note: Mach and Knudsen checks (guides/gas-models.html, en/guides/gas-models.html)
module.exports = ({calc, shows, printed, example}) => {
    const P = ['guides/gas-models.html', 'en/guides/gas-models.html'];
    const g = 1.4;   // NASA Glenn, Specific Heats (standard day air)
    const tRatio = M => 1 + (g - 1) / 2 * M * M;
    const rhoRatio = M => tRatio(M) ** (1 / (g - 1));
    const pRatio = M => tRatio(M) ** (g / (g - 1));
    const qRatio = M => (pRatio(M) - 1) / (g * M * M / 2);

    // Example 1: R = 287 J/(kg K), T = 300 K assumed; Ma 0.3 and 0.8.
    example();
    const c300 = Math.sqrt(g * 287 * 300);
    shows(c300, '347.1887', P);
    shows(0.3 * c300, '104.1566', P);
    shows(0.8 * c300, '277.7510', P);
    shows(calc('mach', {v: 0.3 * c300, c: c300}), '0.3', P);
    shows(tRatio(0.3), '1.018', P);
    shows(rhoRatio(0.3), '1.04561', P);
    shows(pRatio(0.3), '1.06443', P);
    shows(tRatio(0.8), '1.128', P);
    shows(rhoRatio(0.8), '1.35137', P);
    shows(pRatio(0.8), '1.52434', P);
    shows(pRatio(0.3) - 1, '0.06443', P);
    shows(pRatio(0.8) - 1, '0.52434', P);
    shows(qRatio(0.3), '1.0227', P);
    shows(qRatio(0.8), '1.1704', P);
    shows((rhoRatio(0.3) - 1) * 100, '4.56', P);
    shows((qRatio(0.3) - 1) * 100, '2.3', P);

    // Example 2: standard atmosphere 11 000 m (Cornell MAE 5070 Table 1.1); Ma 0.8 assumed.
    example();
    const T = 216.65, p = 22631.70, rho = 0.363912, a = 295.07;
    ['216.65', '22631.70', '0.363912', '295.07'].forEach(s => printed(s, P));
    shows(Math.sqrt(g * 287 * T), '295.04', P);
    shows(a * a / (g * T), '287.05', P);
    shows((1 - Math.sqrt(g * 287 * T) / a) * 100, '0.01', P);
    const v = 0.8 * a;
    shows(v, '236.06', P);
    shows(calc('mach', {v, c: a}), '0.8', P);
    shows(T * tRatio(0.8), '244.38', P);
    const p0 = p * pRatio(0.8);
    shows(p0, '34498', P);
    shows(rho * rhoRatio(0.8), '0.4918', P);
    const q = 0.5 * rho * v * v;
    shows(q, '10139', P);
    shows(p0 - p, '11867', P);
    shows((p0 - p) / q, '1.170', P);
    shows(((p0 - p) / q - 1) * 100, '17', P);

    // Example 3: lambda = 67.3 nm at 23 C, 101.3 kPa (NIST); L = 10 um, 10 kPa and 1 kPa assumed; lambda ~ 1/p.
    example();
    printed('67.3 nm', P);
    shows(calc('knudsen', {lambda: 6.8e-8, L: 0.001}), '6.8×10⁻⁵'.replace('×', ' × '), []);
    printed('6.8×10⁻⁵', P);
    shows(calc('knudsen', {lambda: 6.8e-8, L: 1e-6}), '0.068', P);
    const lam = 67.3e-9, L = 10e-6;
    shows(calc('knudsen', {lambda: lam, L}), '0.00673', P);
    const lam10 = lam * 101.3 / 10, lam1 = lam * 101.3 / 1;
    shows(lam10 * 1e6, '0.6817', P);
    shows(calc('knudsen', {lambda: lam10, L}), '0.0682', P);
    shows(lam1 * 1e6, '6.817', P);
    shows(calc('knudsen', {lambda: lam1, L}), '0.682', P);
};
