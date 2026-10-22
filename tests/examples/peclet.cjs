// Péclet guide and calculator page examples (ko/en share the same printed values).
// Properties: IAEA Thermophysical Properties (2008) Table 3.3 saturated water, Table 3.1 dry air (98.1 kPa,
// density scaled to 1 atm as an ideal gas); O2 diffusivity in water: Cornell (Wilke-Chang estimate).
// Pipe sizes, velocities, column parameters and grid spacing are assumed operating conditions.
module.exports = ({calc, shows, printed, example}) => {
    const G = ['guides/peclet.html', 'en/guides/peclet.html'];
    const C = ['calculators/peclet.html', 'en/calculators/peclet.html'];
    const GC = [...G, ...C];
    const w20 = {rho: 998.2, mu: 1.0e-3, nu: 1.0020e-6, k: 0.5995, cp: 4185, Pr: 6.981};
    const w60 = {rho: 983.2, mu: 4.677e-4, k: 0.6510, cp: 4183, Pr: 3.005};
    const air = {rho: 1.166 * 101325 / 98100, nu: 1.5104e-5, k: 0.0258, cp: 1000};
    const DO2 = 1.97e-9;
    const a20 = w20.k / (w20.rho * w20.cp), a60 = w60.k / (w60.rho * w60.cp), aAir = air.k / (air.rho * air.cp);
    printed('1.2043', GC);
    shows(air.rho, '1.2043', GC);
    shows(a20, '1.435 × 10⁻⁷', GC);
    shows(a60, '1.583 × 10⁻⁷', GC);
    shows(aAir, '2.142 × 10⁻⁵', GC);

    // Guide table: Pe at vL = 1e-3 m^2/s
    shows(1e-3 / a20, '6,968', G);
    shows(1e-3 / a60, '6,318', G);
    shows(1e-3 / aAir, '46.7', G);
    shows(1e-3 / DO2, '507,614', G);
    shows(w20.nu / DO2, '509', G);
    shows(0.01 / 0.1, '0.1', G);              // transit time over 10 mm at 0.1 m/s
    shows(0.01 ** 2 / a20, '697', G);         // diffusion time over 10 mm
    shows(2 / 0.02, '100', G);                // 2 m vs 20 mm length ratio

    // Guide example 1: 20 C water, D = 20 mm, U = 0.1 m/s (assumed)
    example();
    const Re1 = calc('reynolds', {rho: w20.rho, mu: w20.mu, v: 0.1, L: 0.02});
    const Pe1 = calc('peclet', {v: 0.1, L: 0.02, alpha: a20});
    shows(Pe1, '13,937', G);
    shows(Re1, '1,996.4', G);
    shows(Re1 * w20.Pr, '13,937', G);
    shows(0.05 * Pe1 * 0.02, '13.9', G);
    printed('3.66', G);

    // Guide example 2: dissolved O2 in the same flow
    example();
    const Pem = calc('peclet', {v: 0.1, L: 0.02, alpha: DO2});
    shows(Pem, '1.02 × 10⁶', G);
    shows(Re1 * calc('schmidt', {mu: w20.mu, rho: w20.rho, D: DO2}), '1.02 × 10⁶', G);
    shows(a20 / DO2, '72.8', G);
    shows(1 / 0.1, '10', G);
    shows(Math.sqrt(a20 * 10) * 1000, '1.20', G);
    shows(Math.sqrt(DO2 * 10) * 1000, '0.140', G);

    // Guide example 3: porous column (all assumed), Penn State Pe = Lu/(phi Dh)
    example();
    const L3 = 0.3, u = 2e-6, phi = 0.4, Dh = 1e-8;
    const ta = phi * L3 / u, td = L3 ** 2 / Dh;
    shows(ta, '60,000', G);
    shows(ta / 3600, '16.7', G);
    shows(td, '9,000,000', G);
    shows(td / 86400, '104', G);
    shows(td / ta, '150', G);
    shows(u / phi, '5e-6', []);
    printed('5×10⁻⁶', G);
    shows(calc('peclet', {v: u / phi, L: L3, alpha: Dh}), '150', G);
    shows(calc('peclet', {v: u, L: L3, alpha: Dh}), '60', G);
    shows(10 ** 4, '10,000', GC);
    shows(3.6 / Math.sqrt(1e4) * 100, '3.6', G);
    shows(air.nu * air.rho * air.cp / air.k, '0.705', GC);   // mu*cp/k with 1 atm-consistent values

    // Calculator default example (data-example values)
    shows(calc('peclet', {v: 0.01, L: 0.1, alpha: 1e-7}), '10,000', C);

    // Calculator example 1: 60 C water, D = 15 mm, U = 0.5 m/s (assumed)
    example();
    const PeC1 = calc('peclet', {v: 0.5, L: 0.015, alpha: 1.583e-7});
    shows(PeC1, '47,378', C);
    const ReC1 = calc('reynolds', {rho: w60.rho, mu: w60.mu, v: 0.5, L: 0.015});
    shows(ReC1, '15,767', C);
    shows(ReC1 * w60.Pr, '47,378', C);
    shows(0.015 / 0.5, '0.03', C);
    shows(0.015 ** 2 / 1.583e-7, '1,421', C);

    // Calculator example 2: air duct, L = 0.2 m, U = 2 m/s (assumed)
    example();
    const PeC2 = calc('peclet', {v: 2, L: 0.2, alpha: 2.142e-5});
    shows(PeC2, '18,674', C);
    const ReC2 = calc('reynolds', {rho: air.rho, mu: air.rho * air.nu, v: 2, L: 0.2});
    shows(ReC2, '26,483', C);
    shows(air.nu / aAir, '0.705', C);
    shows(ReC2 * air.nu / aAir, '1.87 × 10⁴', C);
    shows(1 - PeC2 / ReC2, '0.3', []);

    // Calculator example 3: cell Pe, spacing 0.5 mm (assumed)
    example();
    shows(calc('peclet', {v: 0.1, L: 0.0005, alpha: 1.435e-7}), '348', C);
    shows(calc('peclet', {v: 0.1, L: 0.0005, alpha: DO2}), '2.54 × 10⁴', C);
    shows(2 * 1.435e-7 / 0.1 * 1e6, '2.87', C);
    shows(a20 / DO2, '73', []);
};
