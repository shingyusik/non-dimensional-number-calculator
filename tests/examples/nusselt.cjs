// Nusselt number pages: guide and calculator examples (Korean and English).
// Water properties: IAEA (2008) Table 3.3 (saturated liquid, 20 °C and 60 °C); air k: Table 3.1;
// type 316 stainless steel k at 300 K: Table 6.20.
// Laminar Nu 3.66 / 4.36: INL RELAP-7 eqs (45), (591). Dittus–Boelter C = 0.023, n = 0.4/0.3: eq (46).
// Gnielinski with f = (1.58 ln Re - 3.28)^-2 and f/2: eqs (592), (593).
// Tube diameters, velocities, wall thickness, ΔT, measured h and kcal h are assumed operating conditions.
module.exports = ({calc, shows, printed, example}) => {
    const G = ['guides/nusselt.html', 'en/guides/nusselt.html'];
    const C = ['calculators/nusselt.html', 'en/calculators/nusselt.html'];
    const nu = (h, L, k) => calc('nusselt', {h, L, k});
    const hFromNu = (Nu, k, D) => Nu * k / D;

    // Guide example 1: laminar 20 °C water, D = 4 mm, v = 0.2 m/s (assumed)
    example();
    for (const s of ['998.2', '1.0000×10⁻³', '0.5995', '6.981', '3.66', '4.36']) printed(s, G);
    const Re1 = calc('reynolds', {rho: 998.2, mu: 1.0e-3, v: 0.2, L: 0.004});
    shows(Re1, '798.6', G);
    shows(hFromNu(3.66, 0.5995, 0.004), '548.5', G);
    shows(hFromNu(4.36, 0.5995, 0.004), '653.5', G);
    shows(hFromNu(3.66, 0.5995, 0.008), '274.3', G);
    shows((4.36 / 3.66 - 1) * 100, '19', G);
    shows(0.05 * Re1 * 6.981 * 0.004, '1.11', G);
    shows(0.05 * Re1 * 6.981, '279', G);

    // Guide example 2: turbulent 60 °C water, D = 25 mm, v = 1.0 m/s, ΔT = 10 K (assumed)
    example();
    for (const s of ['983.2', '4.677×10⁻⁴', '0.6510', '3.005']) printed(s, G);
    const Re2 = calc('reynolds', {rho: 983.2, mu: 4.677e-4, v: 1.0, L: 0.025});
    shows(Re2, '52,555', G);
    const NuH = 0.023 * Re2 ** 0.8 * 3.005 ** 0.4, NuC = 0.023 * Re2 ** 0.8 * 3.005 ** 0.3;
    shows(NuH, '213.5', G);
    const hH = hFromNu(NuH, 0.6510, 0.025);
    shows(hH, '5559', G);
    shows(NuC, '191.2', G);
    shows(hFromNu(NuC, 0.6510, 0.025), '4980', G);
    shows((1 - NuC / NuH) * 100, '10', G);
    shows(hH * 10 / 1000, '55.6', G);
    const f = (1.58 * Math.log(Re2) - 3.28) ** -2;
    shows(f, '0.00518', G);
    const NuG = (f / 2) * (Re2 - 1000) * 3.005 / (1 + 12.7 * Math.sqrt(f / 2) * (3.005 ** (2 / 3) - 1));
    shows(NuG, '236.1', G);
    shows(hFromNu(NuG, 0.6510, 0.025), '6148', G);
    shows((1 - NuH / NuG) * 100, '9.6', G);
    shows(hH / hFromNu(4.36, 0.5995, 0.004), '8.5', G);
    shows(hH / hFromNu(3.66, 0.5995, 0.004), '10', G);

    // Guide example 3: Nu vs Bi, 2 mm 316 stainless wall (assumed thickness)
    example();
    printed('14.0', G);
    shows(nu(hH, 0.025, 0.6510), '213.5', G);
    shows(hH * 0.002 / 14.0, '0.79', G);
    shows(nu(hH, 0.025, 14.0), '9.93', G);

    // Thermal-layer scale and comparisons in the guide
    shows(25 / NuH, '0.117', G);
    shows(4 / 3.66, '1.1', ['guides/nusselt.html']);
    shows(0.5995 / 0.0258, '23', G);

    // Calculator example 1: fill example values, then change k
    example();
    shows(nu(50, 0.1, 0.6), '8.33', C);
    shows(nu(50, 0.05, 0.6), '4.17', C);
    shows(nu(50, 0.1, 0.0258), '193.8', C);
    shows(nu(50, 0.1, 14.0), '0.357', C);
    if (!(nu(50, 0.1, 0.0258) / nu(50, 0.1, 14.0) > 500)) throw new Error('air/steel Nu ratio not above 500');

    // Calculator example 2: assumed measured h = 2000 W/(m²·K), D = 10 mm, 20 °C water
    example();
    const NuM = nu(2000, 0.01, 0.5995);
    shows(NuM, '33.4', C);
    shows(NuM / 4.36, '7.7', C);
    shows(NuM / 3.66, '9.1', C);

    // Calculator example 3: assumed h = 1000 kcal/(h·m²·°C), D = 25 mm, 60 °C water
    example();
    shows(1000 * 1.163, '1163', C);
    shows(nu(1163, 0.025, 0.6510), '44.7', C);
    shows(nu(1000, 0.025, 0.6510), '38.4', C);
    shows((1 - nu(1000, 0.025, 0.6510) / nu(1163, 0.025, 0.6510)) * 100, '14', C);

    // Calculator FAQ and note cross-reference
    shows(4 * 0.02 * 0.01 / 0.06, '0.0133', C);
    shows(nu(120, 0.05, 0.6), '10', C);
};
