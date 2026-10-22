// Calculation note: pipe-flow Re, Pr, Pe cross-check (guides/pipe-flow.html, en/guides/pipe-flow.html)
module.exports = ({calc, shows, printed, example}) => {
    const P = ['guides/pipe-flow.html', 'en/guides/pipe-flow.html'];
    const v = 0.2, L = 0.01; // assumed operating conditions in all three examples

    // Example 1: rounded illustrative constants.
    example();
    {
        const rho = 1000, mu = 0.001, cp = 4200, k = 0.6;
        const alpha = k / (rho * cp);
        const Re = calc('reynolds', {rho, mu, v, L}), Pr = calc('prandtl', {mu, cp, k}), Pe = calc('peclet', {v, L, alpha});
        shows(Re, '2000', P);
        shows(Pr, '7', P);
        printed('1.428571… × 10⁻⁷', P);
        shows(alpha, '1.4286 × 10⁻⁷', P);
        shows(Pe, '14000', P);
        shows(Re * Pr, '14000', P);
        shows(v * L / 1.43e-7, '13986', P);
        shows(L / v, '0.05', P);
        shows(L * L / alpha, '700', P);
        shows(calc('reynolds', {rho, mu, v: 0.4, L}), '4000', P);
        shows(calc('peclet', {v: 0.4, L, alpha}), '28000', P);
        // Laminar entrance length, MIT HST eq. (26): Le/D = 0.065 Re
        shows(0.065 * Re, '130', P);
        shows(0.065 * Re * L, '1.3', P);
    }

    // Example 2: IAEA Table 3.3 saturated water, 20 °C.
    example();
    {
        const rho = 998.2, mu = 1.0e-3, cp = 4185, k = 0.5995, nuTable = 1.0020e-6;
        printed('998.2 kg/m³', P); printed('0.5995 W/(m·K)', P); printed('6.981', P); printed('1.435 × 10⁻⁷', P);
        const alpha = k / (rho * cp);
        const Re = calc('reynolds', {rho, mu, v, L}), Pr = calc('prandtl', {mu, cp, k}), Pe = calc('peclet', {v, L, alpha});
        shows(Re, '1996.4', P);
        shows(v * L / nuTable, '1996.0', P);
        shows(mu / rho, '1.0018 × 10⁻⁶', P);
        shows(Pr, '6.9808', P);
        shows(alpha, '1.4351 × 10⁻⁷', P);
        shows(Pe, '13936.5', P);
        shows(Re * Pr, '13936.5', P);
        shows(L * L / alpha, '696.8', P);
    }

    // Example 3: IAEA Table 3.3 saturated water, 60 °C, same pipe and speed.
    example();
    {
        const rho = 983.2, mu = 4.677e-4, cp = 4183, k = 0.6510;
        printed('983.2 kg/m³', P); printed('4.677 × 10⁻⁴ Pa·s', P); printed('3.005', P); printed('1.583 × 10⁻⁷', P);
        const alpha = k / (rho * cp);
        const Re = calc('reynolds', {rho, mu, v, L}), Pr = calc('prandtl', {mu, cp, k}), Pe = calc('peclet', {v, L, alpha});
        shows(Re, '4204.4', P);
        shows(Pr, '3.0052', P);
        shows(alpha, '1.5829 × 10⁻⁷', P);
        shows(Pe, '12635', P);
        shows(Re * Pr, '12635', P);
        shows(L * L / alpha, '631.8', P);
        // Prose ratios relative to Example 2: Pe drops about 9%, alpha rises about 10%.
        const alpha20 = 0.5995 / (998.2 * 4185), Pe20 = v * L / alpha20;
        shows(100 * (1 - Pe / Pe20), '9', P);
        shows(100 * (alpha / alpha20 - 1), '10', P);
        shows(100 * (0.6510 / 0.5995 - 1), '9', ['guides/pipe-flow.html']);
    }
};
