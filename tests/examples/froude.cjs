// Froude number page examples. Fr = v/sqrt(gL), g = 9.81 m/s^2. All flow conditions are
// assumed operating conditions stated on the pages; similitude rules from MIT 2.154 / UT Austin;
// water nu at 20 degC from IAEA Table 3.3.
module.exports = ({calc, shows, printed, example}) => {
    const G = ['guides/froude.html', 'en/guides/froude.html'];
    const C = ['calculators/froude.html', 'en/calculators/froude.html'];
    const g = 9.81, fr = (v, L) => calc('froude', {v, g, L});

    // Shallow-water wave speed table (guide)
    shows(Math.sqrt(g * 0.1), '0.990', G);
    shows(Math.sqrt(g * 0.5), '2.21', G);
    shows(Math.sqrt(g * 1), '3.13', G);
    shows(Math.sqrt(g * 2), '4.43', G);
    shows(Math.sqrt(g * 5), '7.00', G);
    shows(fr(3, 5), '0.43', G);

    // Guide example 1: 6 m3/s in 3 m wide channel, y1 = 0.4 m
    example();
    const q = 6 / 3, y1 = 0.4, U1 = q / y1, F1 = fr(U1, y1);
    shows(U1, '5', G);
    shows(Math.sqrt(g * y1), '1.98', G);
    shows(F1, '2.52', G);
    shows(F1 * F1, '6.37', G);
    shows(Math.cbrt(q * q / g), '0.742', G);
    const r = 0.5 * (Math.sqrt(1 + 8 * F1 * F1) - 1), y2 = r * y1;
    shows(r, '3.10', G);
    shows(y2, '1.24', G);
    shows(q / y2, '1.61', G);
    shows(fr(q / y2, y2), '0.461', G);

    // Guide example 2: 120 m ship at 16 kn, 1:25 model
    example();
    const kn = 1852 / 3600, U = 16 * kn, L = 120, Lm = L / 25, Um = U / 5;
    shows(kn, '0.5144', G);
    shows(U, '8.23', G);
    shows(Lm, '4.8', G);
    shows(fr(U, L), '0.240', G);
    shows(Um, '1.65', G);
    shows(fr(Um, Lm), '0.240', G);
    shows(25 ** -1.5, '0.008', G);
    printed('1.0020 × 10⁻⁶', G);
    shows(Um * Lm / 1.0020e-6, '7.89 × 10⁶', G);
    shows(U * L / 1.0020e-6, '9.86 × 10⁸', G);
    shows(2 * Math.PI * fr(U, L) ** 2, '0.362', G);
    shows(2 * Math.PI * U * U / g, '43.4', G);

    // Guide example 3: 1:36 spillway model, 1.2 m/s, 0.05 m, 10 L/s
    example();
    shows(fr(1.2, 0.05), '1.71', G);
    shows(1.2 * 6, '7.2', G);
    shows(0.05 * 36, '1.8', G);
    shows(fr(7.2, 1.8), '1.71', G);
    shows(36 ** 2.5, '7776', G);
    shows(0.010 * 36 ** 2.5, '77.76', G);
    shows(36 ** 1.5, '216', G);
    // Depth error sensitivity: 10% depth -> about 5% Fr
    shows((1 - 1 / Math.sqrt(1.1)) * 100, '5', G);

    // Calculator default example and 1:10 model
    shows(fr(3, 5), '0.43', C);
    shows(5 * Math.sqrt(0.1), '1.58', C);
    shows(0.1 ** 1.5, '0.0316', C);

    // Calculator example 1: trapezoidal channel b = 2 m, 1:1 slopes, y = 1 m, Q = 6 m3/s
    example();
    const A = (2 + 1) * 1, T = 2 + 2 * 1, D = A / T;
    shows(A, '3', C);
    shows(T, '4', C);
    shows(D, '0.75', C);
    shows(6 / A, '2', C);
    shows(fr(2, D), '0.737', C);
    shows(fr(2, 1), '0.639', C);
    shows((1 - fr(2, 1) / fr(2, D)) * 100, '13', C);

    // Calculator example 2: 14.4 km/h, depth 1.5 m +/- 10%
    example();
    shows(14.4 / 3.6, '4', C);
    shows(fr(4, 1.5), '1.04', C);
    shows(fr(4, 1.65), '0.994', C);
    shows(fr(4, 1.35), '1.10', C);
    shows(fr(4, 1.5) ** 2, '1.09', C);
};
