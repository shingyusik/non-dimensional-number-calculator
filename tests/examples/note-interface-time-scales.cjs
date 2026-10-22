// Calculation note: interface force and time ratios (guides/interface-time-scales.html, en/...)
module.exports = ({calc, shows, printed, example}) => {
    const P = ['guides/interface-time-scales.html', 'en/guides/interface-time-scales.html'];
    const g = 9.81;

    // Example 1: round values rho=1000, mu=0.001, sigma=0.072, L=0.002 m, v=0.5 m/s, f=50 Hz (assumed).
    example();
    const r1 = 1000, m1 = 0.001, s1 = 0.072, L1 = 0.002, v1 = 0.5;
    const Re = calc('reynolds', {rho: r1, mu: m1, v: v1, L: L1});
    const We = calc('weber', {rho: r1, v: v1, L: L1, sigma: s1});
    const Fr = calc('froude', {v: v1, g, L: L1});
    shows(Re, '1000', P);
    shows(We, '6.94444', P);
    shows(Fr, '3.56961', P);
    shows(calc('strouhal', {f: 50, L: L1, v: v1}), '0.2', P);
    shows(We / Re, '0.00694444', P);
    shows(Math.sqrt(We) / Re, '0.00263523', P);
    shows(We / Fr ** 2, '0.545', P);
    shows(4 * s1 / L1, '144', P);
    shows(L1 / v1, '0.004', P);
    const tcap1 = Math.sqrt(r1 * L1 ** 3 / s1);
    shows(tcap1, '0.010541', P);
    shows(1 / 50, '0.020', P);

    // Example 2: water 20 C, rho=998.2, mu=1.0000e-3 (IAEA Table 3.3), sigma=0.0728 N/m (UCF/OpenStax); L = 2 mm, 100 um assumed.
    example();
    const rho = 998.2, mu = 1.0e-3, s = 0.0728;
    ['998.2', '0.0728 N/m'].forEach(x => printed(x, P));
    shows(Math.sqrt(s / (rho * g)) * 1e3, '2.727', P);
    const row = L => ({
        Bo: rho * g * L * L / s, Oh: mu / Math.sqrt(rho * s * L), dp: 4 * s / L,
        tcap: Math.sqrt(rho * L ** 3 / s), tvc: mu * L / s,
    });
    const a = row(0.002), b = row(1e-4);
    shows(a.Bo, '0.538', P); shows(b.Bo, '0.001345', P);
    shows(a.Oh, '0.002623', P); shows(b.Oh, '0.01173', P);
    shows(a.dp, '145.6', P); shows(b.dp, '2912', P);
    shows(a.tcap, '0.010473', P); shows(b.tcap, '1.171 × 10⁻⁴', P);
    shows(a.tvc, '2.747 × 10⁻⁵', P); shows(b.tvc, '1.374 × 10⁻⁶', P);
    shows(a.Bo / b.Bo, '400', P);
    shows(b.dp / a.dp, '20', P);
    shows(a.tvc / a.tcap, a.Oh.toFixed(6), P);   // identity t_vc / t_cap = Oh

    // Example 3: gas-based We (Ansys CFX definition); air 1.166 kg/m3 at 98.1 kPa (IAEA Table 3.1) scaled to 101.325 kPa;
    // d = 2 mm, slip 10 m/s assumed.
    example();
    const rg = 1.166 * 101325 / 98100;
    shows(rg, '1.2043', P);
    shows(calc('weber', {rho: rg, v: 10, L: 0.002, sigma: s}), '3.309', P);
    shows(Math.sqrt(12 * s / (rg * 0.002)), '19.04', P);
    shows(Math.sqrt(50 * s / (rg * 0.002)), '38.87', P);
    shows(Math.sqrt(12 * s / (rg * 1e-4)), '85.17', P);
    shows(rho / 1.2043, '829', P);
};
