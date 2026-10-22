// Prandtl number pages: guide and calculator examples (Korean and English).
// Property inputs: IAEA (2008) Thermophysical Properties of Materials for Nuclear Engineering,
// Table 3.1 (dry air, 98.1 kPa), Table 3.3 (saturated water), Table 3.10 (sodium, liquid 450 °C).
// Boundary-layer ratios: MIT OCW 3.185 notes, eqs (112) and (118).
module.exports = ({calc, shows, printed, example}) => {
    const G = ['guides/prandtl.html', 'en/guides/prandtl.html'];
    const C = ['calculators/prandtl.html', 'en/calculators/prandtl.html'];
    const ALL = [...G, ...C];
    const pr = (mu, cp, k) => calc('prandtl', {mu, cp, k});

    // Property table (guide)
    for (const s of ['1.7920 × 10⁻³', '0.5620', '13.456', '1.0000 × 10⁻³', '4185', '0.5995', '6.981',
        '4.677 × 10⁻⁴', '4183', '0.6510', '3.005', '2.807 × 10⁻⁴', '4217', '0.6777', '1.747',
        '1.819 × 10⁻⁵', '0.0258', '0.71', '4.899 × 10⁻⁵', '1180', '0.0784', '0.74', '1272', '71.2', '0.0045']) printed(s, G);
    shows(3e-7 * 844, '2.532 × 10⁻⁴', ALL);
    shows(13.456 / 1.747, '7.70', G);
    shows(1.7920e-3 / 2.807e-4, '6.4', G);
    shows((0.6777 / 0.5620 - 1) * 100, '21', G);

    // Guide example 1: water 20 °C
    example();
    printed('998.2', G); printed('1.0020×10⁻⁶', G);
    shows(pr(1.0000e-3, 4185, 0.5995), '6.981', G);
    const alpha20 = 0.5995 / (998.2 * 4185);
    shows(alpha20, '1.435 × 10⁻⁷', G);
    shows(1.0020e-6 / 1.435e-7, '6.983', G);

    // Guide example 2: water 60 °C
    example();
    const pr20 = pr(1.0000e-3, 4185, 0.5995), pr60 = pr(4.677e-4, 4183, 0.6510);
    shows(pr60, '3.005', ALL);
    shows(6.981 / 3.005, '2.32', G);
    shows(pr20 / pr60, '2.32', G);
    shows(1.0000e-3 / 4.677e-4, '2.14', G);
    shows(0.6510 / 0.5995, '1.086', G);
    shows((6.981 / 3.005) ** 0.4, '1.40', G);

    // Guide example 3: air 20 °C
    example();
    shows(pr(1.819e-5, 1000, 0.0258), '0.705', G);
    shows(15.61 / 22.0, '0.710', G);
    shows((0.71 / pr(1.819e-5, 1000, 0.0258) - 1) * 100, '0.7', G);

    // Boundary-layer thickness ratios (MIT 3.185)
    shows(0.975 * Math.cbrt(6.981), '1.86', G);
    shows(0.975 * Math.cbrt(3.005), '1.41', G);
    shows(0.975 * Math.cbrt(0.71), '0.87', G);
    shows(0.72 * Math.sqrt(0.0045), '0.048', G);
    shows(1 / (0.72 * Math.sqrt(0.0045)), '21', G);

    // Unit traps in the guide (20 °C water)
    shows(pr(1.0000e-3, 4.185, 0.5995), '0.00698', G);
    shows(pr(1.0, 4185, 0.5995), '6981', G);
    shows(pr(1.0020e-6, 4185, 0.5995), '0.00699', G);

    // Engineering-unit trap (1 kcal/(m·h·°C) = 1.163 W/(m·K), 1 kcal/(kg·°C) = 4186.8 J/(kg·K))
    shows(1.0000e-3 * 3600, '3.6', G);
    shows(4185 / 4186.8, '0.9996', G);
    shows(0.5995 / 1.163, '0.5155', G);
    shows(pr(3.6, 0.9996, 0.5155), '6.981', G);
    shows(pr(1.0000e-3, 4185, 0.5155), '8.12', G);
    printed('9.432', G); printed('7.937', G);
    // Laminar plate Nu ratio water/air (MIT 3.185 eq 119) and conductivity ratio
    shows((6.981 / 0.71) ** 0.343, '2.19', G);
    shows(0.5995 / 0.0258, '23', G);
    shows(2.138 * 1.0859 * (4185 / 4183), '2.32', G);
    printed('2.14 × 1.086 × 1.0005', G);
    shows(4185 / 4183, '1.0005', G);

    // Calculator example 1: "Fill example values"
    example();
    shows(pr(0.001, 4180, 0.6), '6.97', C);
    shows(pr20, '6.981', C);
    shows((1 - pr(0.001, 4180, 0.6) / pr20) * 100, '0.2', C);

    // Calculator example 2: sodium 450 °C
    example();
    printed('3×10⁻⁷', C); printed('844', C); printed('1.272', C); printed('0.0002532', C);
    const prNa = pr(3e-7 * 844, 1272, 71.2);
    shows(prNa, '0.00452', C);
    shows(1.0000e-3 / (3e-7 * 844), '4', C);
    if (!(71.2 / 0.5995 > 100)) throw new Error('sodium/water conductivity ratio is not above 100');  // "more than 100 times": 118.8
    if (Math.round(6.981 / prNa / 100) !== 15) throw new Error('sodium Pr is not about 1/1500 of water');  // 1544
    printed('1/1500', C);

    // Calculator example 3: unit traps with 60 °C water
    example();
    printed('0.0004677', C);
    shows(pr(4.677e-4, 4.183, 0.6510), '0.003005', C);
    shows(pr(0.4677, 4183, 0.6510), '3005', C);
};
