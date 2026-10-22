// Knudsen number page examples. Reference mean free path: NIST (Kim et al. 2005),
// air lambda0 = 67.3 nm at 23 degC, 101.3 kPa; Willeke relation eq. (11).
module.exports = ({calc, shows, printed, example}) => {
    const G = ['guides/knudsen.html', 'en/guides/knudsen.html'];
    const C = ['calculators/knudsen.html', 'en/calculators/knudsen.html'];
    const l0 = 67.3e-9, p0 = 101300;
    const lam = p => l0 * p0 / p;   // same temperature: lambda ~ 1/p

    // Pressure table (guide)
    printed('67.3 nm', G);
    shows(lam(10130) * 1e9, '673', G);
    shows(lam(1013) * 1e6, '6.73', G);
    shows(lam(101.3) * 1e6, '67.3', G);
    shows(lam(10) * 1e3, '0.682', G);
    shows(lam(1) * 1e3, '6.82', G);
    shows(calc('knudsen', {lambda: lam(101300), L: 1e-3}), '6.73 × 10⁻⁵', G);
    shows(calc('knudsen', {lambda: lam(10130), L: 1e-3}), '6.73 × 10⁻⁴', G);
    shows(calc('knudsen', {lambda: lam(1013), L: 1e-3}), '0.00673', G);
    shows(calc('knudsen', {lambda: lam(101.3), L: 1e-3}), '0.0673', G);
    shows(calc('knudsen', {lambda: lam(10), L: 1e-3}), '0.682', G);
    shows(calc('knudsen', {lambda: lam(1), L: 1e-3}), '6.82', G);
    shows(calc('knudsen', {lambda: lam(101300), L: 0.025}), '2.69 × 10⁻⁶', G);
    shows(calc('knudsen', {lambda: lam(10130), L: 0.025}), '2.69 × 10⁻⁵', G);
    shows(calc('knudsen', {lambda: lam(1013), L: 0.025}), '2.69 × 10⁻⁴', G);
    shows(calc('knudsen', {lambda: lam(101.3), L: 0.025}), '0.00269', G);
    shows(calc('knudsen', {lambda: lam(10), L: 0.025}), '0.0273', G);
    shows(calc('knudsen', {lambda: lam(1), L: 0.025}), '0.273', G);

    // Guide example 1: assumed 5 um gap at 101.3 kPa
    example();
    shows(calc('knudsen', {lambda: l0, L: 5e-6}), '0.0135', G);
    shows(l0 / 0.01 * 1e6, '6.73', G);
    shows(l0 / 0.1 * 1e6, '0.673', G);

    // Guide example 2: assumed 10 Pa chamber, 25 mm line, 1 mm gap
    example();
    shows(101.3 / 0.01, '10,130', G);
    shows(lam(10), '6.82 × 10⁻⁴', G);
    shows(calc('knudsen', {lambda: lam(10), L: 0.025}), '0.0273', G);
    shows(calc('knudsen', {lambda: lam(10), L: 0.001}), '0.682', G);

    // Guide example 3: NASA MGS report, local lambda ~3 cm, shunt 12 x 2 x 1 in
    example();
    shows(12 * 0.0254, '0.3048', G);
    shows(2 * 0.0254, '0.0508', G);
    shows(calc('knudsen', {lambda: 0.03, L: 12 * 0.0254}), '0.0984', G);
    shows(calc('knudsen', {lambda: 0.03, L: 2 * 0.0254}), '0.591', G);
    shows(calc('knudsen', {lambda: 0.03, L: 0.0254}), '1.18', G);

    // Calculator default example
    shows(calc('knudsen', {lambda: 6.8e-8, L: 0.001}), '6.8×10⁻⁵', C);

    // Calculator example 1: NIST 8.27 kPa, 19.90 nm particle, 296.15 K
    example();
    shows(101.3 / 8.27, '12.25', C);
    shows(lam(8270) * 1e9, '824', C);
    shows(lam(8270), '8.24 × 10⁻⁷', C);
    shows(calc('knudsen', {lambda: 8.24e-7, L: 1.99e-8}), '41.4', C);
    shows(2 * lam(8270) / 19.90e-9, '83', C);
    printed('82.934', C);

    // Calculator example 2: Cornell standard atmosphere 11 000 m, assumed 10 um wire
    example();
    const T = 216.65, T0 = 296.15;
    const fT = T / T0, fp = p0 / 22631.70, fs = (1 + 110.4 / T0) / (1 + 110.4 / T);
    shows(fT, '0.7316', C);
    shows(fp, '4.476', C);
    shows(fs, '0.9094', C);
    shows(l0 * fT * fp * fs * 1e9, '200', C);
    shows(l0 * fp * 1e9, '301', C);
    shows(calc('knudsen', {lambda: 2.00e-7, L: 1e-5}), '0.0200', C);
};
