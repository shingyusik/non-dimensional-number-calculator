const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '..', 'script.js'), 'utf8');
const context = vm.createContext({localStorage: {getItem: () => 'ko'}});
vm.runInContext(source.split('let currentCalculator = null;')[0] + '\nthis.formulas = calculators;', context);
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
