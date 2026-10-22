// Strouhal number examples (guides/strouhal, calculators/strouhal; Korean and English).
// nu: water 20 °C 1.0020e-6 m²/s (IAEA Table 3.3); air 20 °C mu = 1.819e-5 Pa·s (IAEA Table 3.1)
// over 1.2043 kg/m³ (1.166 kg/m³ at 98.1 kPa scaled to 101.325 kPa).
// NPARC: D = 1.0 m, U = 66.8163 m/s, nondimensional period 31.0, a_r = 334.01 m/s, experiment 0.179-0.182.
module.exports = ({calc, shows, printed, example}) => {
    const G = ['guides/strouhal.html', 'en/guides/strouhal.html'];
    const C = ['calculators/strouhal.html', 'en/calculators/strouhal.html'];
    const nuA = 1.819e-5 / 1.2043, nuW = 1.0020e-6;
    shows(nuA, '1.5104 × 10⁻⁵', [...G, ...C]);
    const nuR = 1.5104e-5;  // the pages compute Re with the rounded value
    printed('1.0020 × 10⁻⁶', G);
    printed('0.179–0.182', [...G, ...C]);
    shows(2 * Math.PI, '6.28', [...G, ...C]);

    // Guide example 1: 30 mm cable, 36 km/h wind (assumed).
    example();
    const U1 = 36 / 3.6;
    printed('36 km/h', G);
    shows(U1 * 0.03 / nuR, '19,862', G);
    const f1 = 0.2 * U1 / 0.03;
    shows(f1, '66.7', [...G, 'calculators/strouhal.html', 'en/calculators/strouhal.html']);
    shows(calc('strouhal', {f: f1, L: 0.03, v: U1}), '0.2', G);
    shows(1 / f1, '0.015', G);
    shows(0.2 * 15 / 0.03, '100', G);
    shows(20 * 2 / nuR, '2.65 × 10⁶', G);
    shows(0.2 * 20 / 2, '2', G);

    // Guide example 2: 10 mm thermowell in 20 °C water at 2 m/s and 8 m/s (assumed).
    example();
    shows(2 * 0.01 / nuW, '19,960', G);
    shows(0.2 * 2 / 0.01, '40', G);
    shows(2 * 0.2 * 2 / 0.01, '80', G);
    shows(8 * 0.01 / nuW, '79,840', G);
    shows(0.2 * 8 / 0.01, '160', G);

    // Guide example 3: NASA NPARC cylinder, Run A.
    example();
    const t = 31.0 * 1.0 / 334.01, f3 = 1 / t;
    shows(t, '0.0928', G);
    shows(f3, '10.77', G);
    shows(66.8163 / 334.01, '0.200', G);
    shows(calc('strouhal', {f: f3, L: 1.0, v: 66.8163}), '0.161', G);
    shows(calc('strouhal', {f: 10.77, L: 1, v: 66.8163}), '0.161', G);
    shows(0.179 * 66.8163, '11.96', G);
    shows(0.182 * 66.8163, '12.16', G);
    shows((0.161 / 0.1805 - 1) * -100, '11', G);
    shows((1 - 0.18 / 0.2) * 100, '10', G);

    // Calculator example 1: fill-in values.
    example();
    shows(calc('strouhal', {f: 10, L: 0.1, v: 5}), '0.2', C);
    shows(5 * 0.1 / nuR, '33,104', C);
    shows(0.2 * 15 / 0.1, '30', C);
    shows(3000 / 60, '50', C);

    // Calculator example 2: omega and drag-signal mistakes, 20 mm cylinder at 12 m/s (assumed).
    example();
    const f5 = 754 / (2 * Math.PI);
    shows(2 * Math.PI, '6.2832', C);
    shows(f5, '120.0', C);
    shows(calc('strouhal', {f: f5, L: 0.02, v: 12}), '0.200', C);
    shows(12 * 0.02 / nuR, '15,890', C);
    shows(calc('strouhal', {f: 754, L: 0.02, v: 12}), '1.257', C);
    shows(2 * f5, '240.0', C);
    shows(calc('strouhal', {f: 2 * f5, L: 0.02, v: 12}), '0.400', C);
};
