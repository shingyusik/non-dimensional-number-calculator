// Calculation note: pipe pressure loss (guides/pipe-energy.html, en/guides/pipe-energy.html)
module.exports = ({calc, shows, printed, example}) => {
    const P = ['guides/pipe-energy.html', 'en/guides/pipe-energy.html'];
    const g = 9.81;
    // Colebrook–White in the form given by TU Delft / LibreTexts 3.2: 1/sqrt(f) = -2 log10(2.51/(Re sqrt f) + 0.27 eps/D)
    const colebrook = (Re, eD, n = 200, f = 0.02) => { for (let i = 0; i < n; i++) f = 1 / (2 * Math.log10(2.51 / (Re * Math.sqrt(f)) + 0.27 * eD)) ** 2; return f; };
    const swameeJain = (Re, eD) => 0.25 / Math.log10(eD / 3.7 + 5.74 / Re ** 0.9) ** 2;

    // Example 1: laminar, rounded illustrative constants.
    example();
    {
        const rho = 1000, mu = 0.001, D = 0.01, l = 2, v = 0.1;
        const Re = calc('reynolds', {rho, mu, v, L: D}), Q = Math.PI * D * D * v / 4, dp = 32 * mu * l * v / D ** 2;
        shows(Re, '1000', P);
        shows(Q, '7.85398 × 10⁻⁶', P);
        shows(dp, '64', P);
        shows((64 / Re) * (l / D) * rho * v * v / 2, '64', P);
        shows(64 / Re, '0.064', P);
        shows(dp / (rho * g), '0.006524', P);
        shows(dp * D / (4 * l), '0.08', P);
        shows(dp * Q, '0.00050265', P);
        shows(0.065 * Re * D, '0.65', P);
    }

    // Example 2: same pipe, IAEA Table 3.3 water at 60 °C.
    example();
    {
        const rho = 983.2, mu = 4.677e-4, D = 0.01, l = 2, v = 0.1;
        printed('983.2 kg/m³', P); printed('4.677 × 10⁻⁴ Pa·s', P);
        const Re = calc('reynolds', {rho, mu, v, L: D}), dp = 32 * mu * l * v / D ** 2, Q = Math.PI * D * D * v / 4;
        shows(Re, '2102.2', P);
        shows(dp, '29.93', P);
        shows(dp / 64, '0.4677', P);
        shows(dp * D / (4 * l), '0.0374', P);
        shows(dp * Q, '0.000235', P);
        shows(0.065 * Re * D, '1.37', P);
    }

    // Example 3: turbulent, IAEA water 20 °C; assumed D=0.05 m, v=1.5 m/s, l=10 m, eps/D = 0 and 0.001.
    example();
    {
        const rho = 998.2, mu = 1.0e-3, D = 0.05, v = 1.5, l = 10;
        const Re = calc('reynolds', {rho, mu, v, L: D}), q = rho * v * v / 2, Q = Math.PI * D * D * v / 4;
        shows(Re, '74,865', P);
        shows(l / D, '200', P);
        shows(q, '1123', P);
        const fs = colebrook(Re, 0), fr = colebrook(Re, 0.001);
        shows(fs, '0.01913', P);
        shows(colebrook(Re, 0, 4), '0.0191', P);
        shows(fr, '0.0228', P);
        shows(0.3164 * Re ** -0.25, '0.01913', P);
        shows(swameeJain(Re, 0), '0.0190', P);
        shows(swameeJain(Re, 0.001), '0.0230', P);
        const dps = fs * (l / D) * q, dpr = fr * (l / D) * q;
        shows(dps / 1000, '4.30', P);
        shows(dps / (rho * g), '0.439', P);
        shows(dps * D / (4 * l), '5.37', P);
        shows(fs / 8 * rho * v * v, '5.37', P);
        shows(dpr / 1000, '5.13', P);
        shows(100 * (dpr / dps - 1), '19', P);
        shows(Q, '2.945 × 10⁻³', P);
        shows(dps * Q, '12.7', P);
        shows(dpr * Q, '15.1', P);
        shows(64 / Re, '0.000855', P);
        shows((64 / Re) * (l / D) * q, '192', P);
        shows(fs / (64 / Re), '22.4', P);
    }
};
