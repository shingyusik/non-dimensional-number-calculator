// Reynolds guide and calculator page examples (ko/en share the same printed values).
// Properties: IAEA (2008) Table 3.3 saturated water, Table 3.1 dry air at 98.1 kPa (density scaled to 1 atm as an
// ideal gas). Aorta velocity/diameter (Table 1) and whole-blood viscosity ~4 cP: MIT HST.542J notes.
// Blood density 1050 kg/m^3, pipe/duct sizes, velocities and the cylinder case are assumptions stated on the pages.
module.exports = ({calc, shows, printed, example}) => {
    const G = ['guides/reynolds.html', 'en/guides/reynolds.html'];
    const C = ['calculators/reynolds.html', 'en/calculators/reynolds.html'];
    const w20 = {rho: 998.2, mu: 1.0e-3, nu: 1.0020e-6};
    const w60 = {rho: 983.2, mu: 4.677e-4, nu: 4.757e-7};
    const rhoAir = 1.166 * 101325 / 98100, muAir = 1.819e-5;
    const nuAir = 1.5104e-5, nuAir981 = 15.61e-6;
    shows(rhoAir, '1.2043', [...G, ...C]);
    shows(muAir / rhoAir, '1.5104 × 10⁻⁵', []);     // printed on the pages as 1.5104×10⁻⁵
    printed('1.5104×10⁻⁵', G);

    // Guide table: Re at vL = 0.01 m^2/s
    shows(0.01 / w20.nu, '9,980', G);
    shows(0.01 / w60.nu, '21,022', G);
    shows(0.01 / nuAir, '662', G);
    shows(0.01 / nuAir981, '641', G);
    shows(1050 * 0.01 / 0.004, '2,625', G);
    shows(0.004 / 1050 * 1e6, '3.81', G);

    // Guide example 1: household pipe, D = 15 mm, v = 1.2 m/s (assumed), water 20 C
    example();
    const Re1 = calc('reynolds', {rho: w20.rho, mu: w20.mu, v: 1.2, L: 0.015});
    shows(Re1, '17,968', G);
    shows(1.2 * 0.015 / w20.nu, '17,964', G);
    shows(w20.mu / w20.rho * 1e6, '1.0018', G);
    shows(Math.PI / 4 * 0.015 ** 2 * 1.2 * 60000, '12.7', G);
    const vLam = 2300 * w20.mu / (w20.rho * 0.015);
    shows(vLam, '0.154', G);
    shows(calc('reynolds', {rho: w20.rho, mu: w20.mu, v: vLam, L: 0.015}), '2300', G);
    shows(Math.PI / 4 * 0.015 ** 2 * vLam * 60000, '1.63', G);
    const Re1h = calc('reynolds', {rho: w60.rho, mu: w60.mu, v: 1.2, L: 0.015});
    shows(Re1h, '37,840', G);
    shows(Re1h / Re1, '2.1', G);

    // Guide example 2: human aorta (MIT HST Table 1), blood density assumed
    example();
    shows(calc('reynolds', {rho: 1050, mu: 0.004, v: 0.48, L: 0.025}), '3,150', G);
    shows(calc('reynolds', {rho: 1000, mu: 0.004, v: 0.48, L: 0.025}), '3,000', G);
    shows(calc('reynolds', {rho: 1100, mu: 0.004, v: 0.48, L: 0.025}), '3,300', G);
    printed('48 cm/s', G);
    printed('2.5 cm', G);
    printed('4500', G);

    // Guide example 3: 400 x 200 mm duct, 4 m/s (assumed), air 20 C 1 atm
    example();
    const A = 0.4 * 0.2, P = 2 * (0.4 + 0.2), Dh = 4 * A / P;
    shows(A, '0.08', G);
    shows(P, '1.2', G);
    shows(Dh, '0.267', G);
    shows(4 * Dh / nuAir, '70,621', G);
    shows(4 * Dh / nuAir981, '68,332', G);
    shows(4 * 0.2 / nuAir, '52,966', G);
    shows(4 * 0.4 / nuAir, '105,932', G);
    shows(0.065 * 2000, '130', G);

    // Calculator default example and the exact-4000 boundary
    shows(calc('reynolds', {rho: 1000, mu: 0.001, v: 0.2, L: 0.01}), '2000', C);

    // Calculator example 1: 60 C water, D = 25 mm, v = 0.5 m/s (assumed), mu in cP
    example();
    const ReC1 = calc('reynolds', {rho: 983.2, mu: 0.0004677, v: 0.5, L: 0.025});
    shows(ReC1, '26,278', C);
    shows(calc('reynolds', {rho: 983.2, mu: 0.4677, v: 0.5, L: 0.025}), '26.3', C);
    shows(2300 * 4.677e-4 / (983.2 * 0.025), '0.0438', C);

    // Calculator example 2: exactly 4000 is labelled transitional (strict comparisons in calculators.js)
    example();
    const Re4000 = calc('reynolds', {rho: 1000, mu: 0.001, v: 0.4, L: 0.01});
    shows(Re4000, '4000', C);
    shows(calc('reynolds', {rho: 1000, mu: 0.001, v: 0.4001, L: 0.01}), '4,001', C);

    // Calculator example 3: 25 mm cylinder in 20 C air at 5 m/s (assumed)
    example();
    shows(calc('reynolds', {rho: 1.2043, mu: 1.819e-5, v: 5, L: 0.025}), '8,276', C);
    printed('150', C);
};
