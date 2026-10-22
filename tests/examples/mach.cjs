// Mach number examples: guides/mach.html, en/guides/mach.html,
// calculators/mach.html, en/calculators/mach.html.
// Sources: Cornell MAE 5070 standard atmosphere Table 1.1 (0 m: 288.15 K, 340.29 m/s;
// 5000 m: 255.65 K, 320.53 m/s; 11000 m: 216.65 K, 295.07 m/s), OpenStax 17.2
// (343 m/s at 20 C, Table 17.1 sound speeds, R = 8.31 J/(mol K), M = 0.02897 kg/mol),
// NASA Glenn Specific Heats (gamma = 1.4), NASA Glenn isentropic relations.
module.exports = ({calc, shows, printed, example}) => {
    const G = ['guides/mach.html', 'en/guides/mach.html'];
    const C = ['calculators/mach.html', 'en/calculators/mach.html'];
    const g = 1.4, R = 287;
    const ratio = M => 1 + (g - 1) / 2 * M * M;

    // Derivation section and inputs.
    shows(0.8 ** 2, '0.64', G);
    shows(0.8 ** 2 / 0.1 ** 2, '64', G);
    shows(8.31 / 0.02897, '287', G);
    shows(calc('mach', {v: 170, c: 340}), '0.5', G);
    printed('340.29 m/s', G);

    // Table: Mach number of a 100 m/s flow.
    for (const [c, out] of [[340.29, '0.2939'], [343, '0.2915'], [331, '0.3021'], [295.07, '0.3389'],
        [259, '0.3861'], [965, '0.1036'], [1480, '0.0676']]) shows(calc('mach', {v: 100, c}), out, G);

    // Guide example 1: airliner at 11 000 m, assumed TAS 250 m/s.
    example();
    const M1 = calc('mach', {v: 250, c: 295.07});
    const M1sl = calc('mach', {v: 250, c: 340.29});
    shows(250 * 3.6, '900', G);
    shows(M1, '0.8473', G);
    shows(M1sl, '0.7347', G);
    shows(295.07 / 340.29, '0.8671', G);
    shows(Math.sqrt(216.65 / 288.15), '0.8671', G);
    shows(M1 / M1sl, '1.153', G);
    shows(g / 2 * M1 * M1, '0.50', G);

    // Guide example 2: 20 C duct, assumed 100 m/s.
    example();
    const T20 = 273.15 + 20;
    shows(g * R * T20, '117,787.67', G);
    shows(Math.sqrt(g * R * T20), '343.2', G);
    const M2 = calc('mach', {v: 100, c: 343});
    shows(M2, '0.2915', G);
    const r2 = ratio(M2);
    shows(r2, '1.0170', G);
    shows(r2 ** 2.5, '1.0430', G);
    shows(r2 ** 3.5, '1.0608', G);
    shows((r2 ** 2.5 - 1) * 100, '4.3', G);

    // Guide example 3: choked converging nozzle, assumed T0 = 293.15 K, p0 = 101325 Pa.
    example();
    const r3 = ratio(1);
    shows(r3, '1.2', G);
    shows(1 / r3, '0.8333', G);
    const Ts = T20 / r3;
    shows(Ts, '244.29', G);
    shows(r3 ** -3.5, '0.5283', G);
    shows(101325 * r3 ** -3.5, '53,528', G);
    shows(101325 * r3 ** -3.5 / 1000, '53.5', G);
    shows(r3 ** -2.5, '0.6339', G);
    shows(Math.sqrt(g * R * Ts), '313.3', G);

    // FAQ: 343 vs 340.29.
    shows(343 / 340.29, '1.0080', G);
    shows((343 / 340.29 - 1) * 100, '0.8', G);

    // Calculator page: OpenStax approximation and default example.
    shows(331 * Math.sqrt(T20 / 273), '343.0', C);
    shows(calc('mach', {v: 170, c: 340}), '0.5', C);
    shows(calc('mach', {v: 170, c: 300}), '0.567', C);
    shows(Math.sqrt(g * R * 300), '347', C);

    // Calculator example 1: assumed 300 kn TAS at 5 000 m.
    example();
    const v1 = 300 * 1852 / 3600;
    shows(1852 / 3600, '0.5144', C);
    shows(v1, '154.33', C);
    const Mk = calc('mach', {v: 154.33, c: 320.53});
    shows(Mk, '0.4815', C);
    const Mksl = calc('mach', {v: 154.33, c: 340.29});
    shows(Mksl, '0.4535', C);
    shows(Mk / Mksl, '1.062', C);

    // Calculator example 2: assumed 150 m/s, 400 K at a duct inlet.
    example();
    const c400 = Math.sqrt(g * R * 400);
    shows(c400, '400.9', C);
    const Mi = calc('mach', {v: 150, c: 400.9});
    shows(Mi, '0.3742', C);
    shows(ratio(Mi), '1.0280', C);
    shows(400 * ratio(Mi), '411.2', C);
    const cp = g * R / (g - 1);
    shows(cp, '1004.5', C);
    shows(150 ** 2 / (2 * cp), '11.20', C);
    const Tst = 400 - 150 ** 2 / (2 * cp);
    shows(Tst, '388.80', C);
    shows(Math.sqrt(g * R * Tst), '395.2', C);
    shows(150 / Math.sqrt(g * R * Tst), '0.3795', C);
    shows((150 / Math.sqrt(g * R * Tst)) / Mi * 100 - 100, '1.4', C);
    shows(400 * ratio(Mi) - 400, '11', C);

    // Calculator FAQ.
    shows(Math.sqrt(g * R * T20), '343.2', C);
    shows(g / 2 * 0.8 ** 2, '0.448', C);
};
