// Schmidt number examples: guides/schmidt.html, en/guides/schmidt.html,
// calculators/schmidt.html, en/calculators/schmidt.html.
// Sources: IAEA THPH Table 3.3 saturated water (20, 40, 60 C) and Table 3.1 dry air at
// 98.1 kPa (20, 60 C); Cornell oxygen diffusion in water (Wilke-Chang, 0.0000197 /
// 0.0000324 / 0.0000482 cm2/s at 20 / 40 / 60 C); Cornell oxygen diffusion in air
// (O2-N2 0.219 / 0.274 cm2/s at 20 / 60 C, 1 atm); CRAN marelac (CO2 seawater 20 C, about 660);
// MIT 3.185 eq. (118) delta_u/delta_T = 0.975 Pr^(1/3).
module.exports = ({calc, shows, printed, example}) => {
    const G = ['guides/schmidt.html', 'en/guides/schmidt.html'];
    const C = ['calculators/schmidt.html', 'en/calculators/schmidt.html'];
    const ratio = x => 0.975 * Math.cbrt(x);

    // Default calculator example and unit conversion.
    shows(calc('schmidt', {mu: 0.001, rho: 1000, D: 1e-9}), '1000', G);
    shows(0.0000197e-4, '1.97 × 10⁻⁹', G);
    printed('0.0000197 cm²/s', G);
    printed('약 660', ['guides/schmidt.html']);
    printed('about 660', ['en/guides/schmidt.html']);

    // Table and guide example 1: O2 in water at 20 C.
    example();
    const Sc20 = calc('schmidt', {mu: 1.0000e-3, rho: 998.2, D: 1.97e-9});
    shows(Sc20, '508.5', G);
    shows(1.0020e-6 / 1.97e-9, '508.6', G);
    shows(Sc20 / 6.981, '72.84', G);
    shows(Sc20 / 6.981, '73', G);
    shows(ratio(Sc20), '7.78', G);
    shows(ratio(6.981), '1.86', G);
    shows(ratio(Sc20) / ratio(6.981), '4.2', G);
    shows(Sc20 / 1.1, '462', G);
    shows(Sc20 / 0.9, '565', G);

    // Guide example 2: O2 in water at 60 C.
    example();
    const Sc60 = calc('schmidt', {mu: 4.677e-4, rho: 983.2, D: 4.82e-9});
    shows(Sc60, '98.69', G);
    shows(4.757e-7 / 4.82e-9, '98.69', G);
    shows(Sc20 / Sc60, '5.15', G);
    shows(4.82 / 1.97, '2.45', G);
    shows(1.0020 / 0.4757, '2.11', G);
    shows(ratio(Sc60), '4.51', G);

    // Guide example 3: O2 in air at 20 C, air approximated as N2, 1 atm.
    example();
    shows(1.166 * 101325 / 98100, '1.2043', G);
    shows(1.819e-5 / 1.2043, '1.5104 × 10⁻⁵', G);
    const ScAir = calc('schmidt', {mu: 1.5104e-5, rho: 1, D: 2.19e-5});
    shows(ScAir, '0.690', G);
    shows(2.19e-5 / 1.97e-9, '11,117', G);
    shows(ratio(0.690), '0.862', G);

    // Calculator example 1: O2 in water at 40 C.
    example();
    shows(0.0000324e-4, '3.24×10⁻⁹', C);
    const Sc40 = calc('schmidt', {mu: 6.529e-4, rho: 992.2, D: 3.24e-9});
    shows(Sc40, '203.1', C);
    shows(0.6581e-6 / 3.24e-9, '203.1', C);
    shows(Sc40 / 4.341, '46.79', C);
    shows(Sc40 / 4.341, '47', C);
    shows(calc('schmidt', {mu: 6.529e-4, rho: 992.2, D: 3.24e-5}), '0.0203', C);
    shows(calc('schmidt', {mu: 0.6581e-6, rho: 1, D: 3.24e-9}), '203.1', C);

    // Calculator example 2: O2 in air at 60 C, pressure-matched to IAEA 98.1 kPa.
    example();
    const D98 = 2.74e-5 * 101.325 / 98.1;
    shows(D98, '2.830×10⁻⁵', C);
    const ScA60 = calc('schmidt', {mu: 20.10e-6, rho: 1.026, D: 2.830e-5});
    shows(ScA60, '0.692', C);
    const ScMixed = calc('schmidt', {mu: 20.10e-6, rho: 1.026, D: 2.74e-5});
    shows(ScMixed, '0.715', C);
    shows((ScMixed / ScA60 - 1) * 100, '3.3', C);
    shows(ScAir, '0.690', C);
    shows(Sc20 / Sc60, '5', C);
};
