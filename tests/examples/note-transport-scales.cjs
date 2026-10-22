// Calculation note: thermal and mass diffusion scales (guides/transport-scales.html, en/guides/transport-scales.html)
module.exports = ({calc, shows, printed, example}) => {
    const P = ['guides/transport-scales.html', 'en/guides/transport-scales.html'];

    // Example 1: round-number set (rho=1000, mu=0.001, k=0.6, cp=3000), v=0.2 m/s, L=0.05 m.
    example();
    const nu1 = 1e-6, alpha1 = 0.6 / (1000 * 3000), D1 = 1e-9, v1 = 0.2, L1 = 0.05;
    const tAdv = L1 / v1;
    shows(tAdv, '0.25', P);
    shows(Math.sqrt(nu1 * tAdv) * 1e3, '0.500', P);
    shows(Math.sqrt(alpha1 * tAdv) * 1e3, '0.2236', P);
    shows(Math.sqrt(D1 * tAdv) * 1e3, '0.01581', P);
    shows(calc('reynolds', {rho: 1000, mu: 0.001, v: v1, L: L1}), '10000', P);
    shows(calc('prandtl', {mu: 0.001, cp: 3000, k: 0.6}), '5', P);
    shows(calc('schmidt', {mu: 0.001, rho: 1000, D: D1}), '1000', P);
    shows(calc('peclet', {v: v1, L: L1, alpha: alpha1}), '50000', P);
    shows(calc('peclet', {v: v1, L: L1, alpha: D1}), '10000000', P);
    shows(L1 / Math.sqrt(50000) * 1e3, '0.2236', P);

    // Example 2: water 20 C and 60 C (IAEA Table 3.3), O2 diffusivity in water (Cornell, Wilke-Chang), t = 1 s assumed.
    example();
    const rho = 998.2, mu = 1.0000e-3, nu = 1.0020e-6, k = 0.5995, cp = 4185, D20 = 1.97e-9;
    ['998.2', '1.0020 × 10⁻⁶', '0.5995', '4185', '6.981', '1.97 × 10⁻⁹', '983.2', '4.757 × 10⁻⁷', '0.6510', '4183', '3.005', '4.82 × 10⁻⁹'].forEach(s => printed(s, P));
    const alpha = k / (rho * cp);
    shows(alpha, '1.4351 × 10⁻⁷', P);
    shows(nu / alpha, '6.982', P);
    shows(calc('prandtl', {mu, cp, k}), '6.981', P);
    const Sc20 = nu / D20;
    shows(Sc20, '508.6', P);
    shows(Math.sqrt(nu) * 1e3, '1.001', P);
    shows(Math.sqrt(alpha) * 1e3, '0.3788', P);
    shows(Math.sqrt(D20) * 1e3, '0.0444', P);
    shows(Math.sqrt(6.981), '2.642', P);
    shows(Math.sqrt(Sc20), '22.55', P);
    shows(0.975 * Math.cbrt(6.981), '1.863', P);
    const Sc60 = 4.757e-7 / 4.82e-9;
    shows(Sc60, '98.69', P);
    shows(Sc20 / Sc60, '5.2', P);
    shows(Math.sqrt(nu) / Math.sqrt(D20), '23', P);

    // Example 3A: supplied h = 120 W/(m2 K), k = 0.6, L = 0.05 m, dT = 20 K.
    example();
    const Nu = calc('nusselt', {h: 120, L: 0.05, k: 0.6});
    shows(Nu, '10', P);
    shows(120 * 20, '2400', P);
    // Example 3B: water 20 C, assumed v = 0.1 m/s, d = 10 mm; laminar Nu 3.66 / 4.36 (INL RELAP-7 eqs. 45, 591).
    const d = 0.01, v = 0.1;
    const Re = calc('reynolds', {rho, mu, v, L: d});
    shows(Re, '998.2', P);
    shows(Re * 6.981, '6968', P);
    const h366 = 3.66 * k / d, h436 = 4.36 * k / d;
    shows(h366, '219.4', P);
    shows(h436, '261.4', P);
    shows((h436 / h366 - 1) * 100, '19', P);
    shows(d / 3.66 * 1e3, '2.732', P);
    shows(0.05 * Re * 6.981 * d, '3.48', P);
};
