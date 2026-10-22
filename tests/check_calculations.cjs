const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '..', 'calculators.js'), 'utf8');
const context = vm.createContext({localStorage: {getItem: () => 'ko'}});
vm.runInContext(source + '\nthis.formulas = calculators;', context);
const calc = (name, values) => context.formulas[name].calculate(values);
const near = (a, b) => assert.ok(Math.abs(a-b) <= Math.max(1, Math.abs(b))*1e-12, `${a} != ${b}`);
const rho=1000, mu=0.001, v=0.2, L=0.01, cp=4200, k=0.6;
const alpha=k/(rho*cp);
const Re=calc('reynolds',{rho,mu,v,L}), Pr=calc('prandtl',{mu,cp,k}), Pe=calc('peclet',{v,L,alpha});
near(Re,2000); near(Pr,7); near(Pe,14000); near(Pe,Re*Pr);
near(L/v,0.05); near(L*L/alpha,700);
near(calc('reynolds',{rho,mu,v:0.4,L}),4000);
near(calc('peclet',{v:0.4,L,alpha}),28000);
for (const [name,values,result] of [
 ['mach',{v:170,c:340},0.5], ['nusselt',{h:50,L:0.1,k:0.6},50/6],
 ['schmidt',{mu,rho,D:1e-9},1000], ['strouhal',{f:10,L:0.1,v:5},0.2],
 ['weber',{rho,v:2,L:0.01,sigma:0.072},5000/9], ['knudsen',{lambda:6.8e-8,L:0.001},6.8e-5],
]) near(calc(name,values),result);
const modelSpeed=5*Math.sqrt(0.1);
near(calc('reynolds',{rho,mu,v:5,L:10}),50000000);
near(calc('reynolds',{rho,mu,v:modelSpeed,L:1}),50000000*Math.pow(0.1,1.5));
near(calc('froude',{v:modelSpeed,g:9.81,L:1}),calc('froude',{v:5,g:9.81,L:10}));
near(calc('reynolds',{rho,mu,v:50,L:1}),50000000);
near(calc('froude',{v:50,g:9.81,L:1})/calc('froude',{v:5,g:9.81,L:10}),Math.pow(0.1,-1.5));
console.log('PASS: all 10 calculator formulas, pipe-flow cross-checks, sensitivity and model-similarity ratios');

// Independent dimensional and numerical checks for the constructed theory examples.
const diameter=0.01, pipeLength=2, pipeSpeed=0.1;
const pipeQ=Math.PI*diameter**2*pipeSpeed/4;
const deltaP=128*mu*pipeLength*pipeQ/(Math.PI*diameter**4);
near(deltaP,64);
near((64/calc('reynolds',{rho,mu,v:pipeSpeed,L:diameter}))*(pipeLength/diameter)*rho*pipeSpeed**2/2,deltaP);
near(deltaP*diameter/(4*pipeLength),0.08);
near(deltaP*pipeQ,0.0005026548245743669);
near(deltaP/(rho*9.81),0.006523955147808359);
const thermalAlpha=0.6/(1000*3000), speciesD=1e-9, exposure=0.05/0.2;
const thermalPe=calc('peclet',{v:0.2,L:0.05,alpha:thermalAlpha});
const massPe=calc('peclet',{v:0.2,L:0.05,alpha:speciesD});
near(thermalPe,50000); near(massPe,10000000);
near(thermalPe,calc('reynolds',{rho,mu,v:0.2,L:0.05})*calc('prandtl',{mu,cp:3000,k:0.6}));
near(massPe,calc('reynolds',{rho,mu,v:0.2,L:0.05})*calc('schmidt',{rho,mu,D:speciesD}));
near(Math.sqrt(thermalAlpha*exposure),0.00022360679774997898);
near(Math.sqrt(speciesD*exposure),0.000015811388300841896);
near(calc('nusselt',{h:120,L:0.05,k:0.6}),10);
const soundSpeed=Math.sqrt(1.4*287*300);
for (const [M,temperatureRatio,densityRatio,pressureRatio] of [
    [0.3,1.018,1.0456093184213537,1.0644302861529382],
    [0.8,1.128,1.3513652567009293,1.5243400095586486],
]) {
    near(calc('mach',{v:M*soundSpeed,c:soundSpeed}),M);
    near(1+0.2*M*M,temperatureRatio);
    near(temperatureRatio**2.5,densityRatio);
    near(temperatureRatio**3.5,pressureRatio);
}
near(calc('knudsen',{lambda:6.8e-8,L:1e-6}),0.068);
const interfaceRe=calc('reynolds',{rho,mu,v:0.5,L:0.002});
const interfaceWe=calc('weber',{rho,v:0.5,L:0.002,sigma:0.072});
const interfaceFr=calc('froude',{v:0.5,L:0.002,g:9.81});
const capillaryTime=Math.sqrt(rho*0.002**3/0.072);
near(interfaceRe,1000); near(interfaceWe,125/18);
near(interfaceWe/interfaceRe,mu*0.5/0.072);
near(Math.sqrt(interfaceWe)/interfaceRe,mu/Math.sqrt(rho*0.072*0.002));
near(interfaceWe/interfaceFr**2,0.545);
near((capillaryTime/(0.002/0.5))**2,interfaceWe);
near(calc('strouhal',{f:50,L:0.002,v:0.5}),(0.002/0.5)/(1/50));
near(2*0.072/(0.002/2),144);
// Catch accidental changes to rounded results published in either language.
for (const [slug,results] of Object.entries({
    'pipe-energy':['64 Pa','0.08 Pa','0.00050265 W'],
    'transport-scales':['0.2236 mm','0.01581 mm','2400 W/m²'],
    'gas-models':['1.04561','1.35137','1.52434'],
    'interface-time-scales':['6.94444','0.00263523','144 Pa','0.010541 s'],
})) for (const prefix of ['', 'en/']) {
    const page=fs.readFileSync(path.join(__dirname,'..',prefix,'guides',slug+'.html'),'utf8');
    for (const result of results) assert.ok(page.includes(result),`${prefix}${slug}: missing published result ${result}`);
}
console.log('PASS: four theory examples, independent pressure-loss calculation, thermal/species identities, ideal-gas ratios, interface/time identities and bilingual published values');

// Page examples: each file in tests/examples computes its inputs -> outputs and
// checks that the rounded strings printed on the pages match the computed values.
const SUPERSCRIPT = {'⁰':'0','¹':'1','²':'2','³':'3','⁴':'4','⁵':'5','⁶':'6','⁷':'7','⁸':'8','⁹':'9','⁻':'-'};
// Parse a printed number such as "29,946", "0.0316", "1.51 × 10⁻⁵" or "6.8e-5".
// Returns the value and half a unit of the last printed digit.
function parsePrinted(text) {
    const match = text.replace(/\u2212/g, '-').match(/^(-?[\d,]*\.?\d+)(?:\s*(?:×\s*10([⁻⁰¹²³⁴⁵⁶⁷⁸⁹]+)|×\s*10\^(-?\d+)|e(-?\d+)))?$/);
    assert.ok(match, `Cannot parse printed number "${text}"`);
    const mantissa = match[1].replace(/,/g, '');
    const exponent = match[2] ? Number([...match[2]].map(c => SUPERSCRIPT[c]).join('')) : Number(match[3] ?? match[4] ?? 0);
    const decimals = mantissa.includes('.') ? mantissa.split('.')[1].length : 0;
    return {value: Number(mantissa) * 10 ** exponent, half: 0.5 * 10 ** (exponent - decimals)};
}
const pageCache = {};
const readPage = file => pageCache[file] ??= fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
let exampleCount = 0, printedCount = 0;
const examples = {
    calc, near,
    // Assert that `value` rounds to `printed` and that `printed` appears on every page in `files`.
    shows(value, printed, files) {
        const {value: shown, half} = parsePrinted(printed);
        assert.ok(Math.abs(value - shown) <= half * (1 + 1e-9), `${printed} does not match computed ${value}`);
        for (const file of files) assert.ok(readPage(file).includes(printed), `${file}: missing published value ${printed}`);
        printedCount++;
    },
    // Assert that a literal string (an input or a quoted value) appears on every page in `files`.
    printed(text, files) {
        for (const file of files) assert.ok(readPage(file).includes(text), `${file}: missing text ${text}`);
    },
    example() { exampleCount++; },
};
const exampleDir = path.join(__dirname, 'examples');
const exampleFiles = fs.existsSync(exampleDir) ? fs.readdirSync(exampleDir).filter(f => f.endsWith('.cjs')).sort() : [];
for (const file of exampleFiles) require(path.join(exampleDir, file))(examples);
console.log(`PASS: ${exampleCount} page examples in ${exampleFiles.length} files, ${printedCount} published rounded values checked`);
