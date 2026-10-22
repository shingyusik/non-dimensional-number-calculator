// Numbers quoted on the about and contact pages.
module.exports = ({calc, shows, example}) => {
    // Contact: a hypothetical report where a 25 mm diameter was entered as 25 m (water at 20 °C, IAEA table 3.3).
    example();
    const contact = ['contact.html', 'en/contact.html'];
    shows(calc('reynolds', {rho: 998.2, v: 1.2, L: 25, mu: 0.001}), '2.99 × 10⁷', contact);
    shows(calc('reynolds', {rho: 998.2, v: 1.2, L: 0.025, mu: 0.001}), '29,946', [...contact, 'about.html', 'en/about.html']);
};
