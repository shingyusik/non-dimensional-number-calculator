// Calculation note: scale models, Re vs Fr (guides/model-similarity.html, en/guides/model-similarity.html)
module.exports = ({calc, shows, printed, example}) => {
    const P = ['guides/model-similarity.html', 'en/guides/model-similarity.html'];
    const g = 9.81;

    // Example 1: illustrative 1:10 body, rounded constants rho=1000, mu=0.001.
    example();
    {
        const rho = 1000, mu = 0.001, lam = 0.1, vm = 5 * Math.sqrt(lam);
        shows(calc('reynolds', {rho, mu, v: 5, L: 10}), '50,000,000', P);
        shows(calc('froude', {v: 5, g, L: 10}), '0.5048', P);
        shows(vm, '1.5811', P);
        shows(calc('froude', {v: vm, g, L: 1}), '0.5048', P);
        shows(calc('reynolds', {rho, mu, v: vm, L: 1}), '1,581,139', P);
        shows(lam ** 1.5, '0.03162', P);
        shows(100 * lam ** 1.5, '3.16', P);
        shows(5 * 10 / 1, '50', P);
        shows(calc('froude', {v: 50, g, L: 1}), '15.9638', P);
        shows(calc('froude', {v: 50, g, L: 1}) / calc('froude', {v: 5, g, L: 10}), '31.62', P);
        shows(calc('reynolds', {rho, mu, v: 5, L: 1}), '5,000,000', P);
        shows(calc('froude', {v: 5, g, L: 1}), '1.5964', P);
        shows(lam ** 1.5 * 1e-6, '3.1623×10⁻⁸', P);
        shows(lam ** 1.5 * 1e-6, '3.16 × 10⁻⁸', P);
        shows(1 / lam ** 1.5, '32', ['guides/model-similarity.html']);
        shows(50 / 5, '10', P);
    }

    // Example 2: 1:25 ship model; assumed L=100 m, U=7.5 m/s; IAEA water 20 °C, sigma 0.0728 N/m (UCF/OpenStax).
    example();
    {
        const nu = 1.0020e-6, rho = 998.2, sigma = 0.0728, Lp = 100, Up = 7.5, lam = 1 / 25, Lm = Lp * lam;
        printed('1.0020 × 10⁻⁶ m²/s', P); printed('0.0728 N/m', P);
        const Um = Up * Math.sqrt(lam);
        shows(calc('froude', {v: Up, g, L: Lp}), '0.2395', P);
        shows(calc('froude', {v: Um, g, L: Lm}), '0.2395', P);
        shows(Um, '1.5', P);
        shows(Up * Lp / nu, '7.49 × 10⁸', P);
        shows(Um * Lm / nu, '5.99 × 10⁶', P);
        shows((Um * Lm) / (Up * Lp), '0.008', P);
        shows((Up * Lp) / (Um * Lm), '125', P);
        shows(lam ** 1.5 * nu, '8.016 × 10⁻⁹', P);
        shows(lam ** 1.5 * nu, '8.0 × 10⁻⁹', P);
        shows(Up * Lp / Lm, '187.5', P);
        shows(calc('weber', {rho, v: Um, L: Lm, sigma}), '1.23 × 10⁵', P);
        shows(1 / lam ** 3, '15,625', P);
        shows(1 / Math.sqrt(lam), '5', ['guides/model-similarity.html']);
        shows(Math.sqrt(lam), '0.2', P);
        shows(10 * Math.sqrt(lam), '2', P);
    }

    // Example 3: 1:30 spillway; assumed Q=600 m³/s, v=12 m/s, depth 1.5 m; IAEA water 20 °C.
    example();
    {
        const nu = 1.0020e-6, rho = 998.2, sigma = 0.0728, lam = 1 / 30, Qp = 600, vp = 12, hp = 1.5;
        const Qm = Qp * lam ** 2.5, vm = vp * Math.sqrt(lam), hm = hp * lam;
        shows(1 / lam ** 2.5, '4929.5', P);
        shows(Qm, '0.1217', P);
        shows(Qm * 1000, '121.7', P);
        shows(Qm * 1000, '122', ['guides/model-similarity.html']);
        shows(vm, '2.191', P);
        shows(hm, '0.05', P);
        shows(calc('froude', {v: vp, g, L: hp}), '3.128', P);
        shows(calc('froude', {v: vm, g, L: hm}), '3.128', P);
        shows(vp * hp / nu, '1.80 × 10⁷', P);
        shows(vm * hm / nu, '1.09 × 10⁵', P);
        shows((vp * hp) / (vm * hm), '164.3', P);
        shows(calc('weber', {rho, v: vm, L: hm, sigma}), '3291', P);
        shows(60 * Math.sqrt(lam), '10.95', P);
    }
};
