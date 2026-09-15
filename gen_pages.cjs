const fs = require('fs');

const pages = [
  { name: 'RiskAnalysis', title: 'Risk Analysis', desc: 'Prototype Intelligence Layer' },
  { name: 'Alerts', title: 'Risk & Alert Center', desc: 'Prototype Intelligence Layer' },
  { name: 'Compliance', title: 'Compliance Dashboard', desc: 'Prototype Intelligence Layer' },
  { name: 'Analytics', title: 'Analytics', desc: 'Derived analytics from unified datasets' },
  { name: 'Geographic', title: 'Geographic Overview', desc: 'Geographic hierarchy visualization' },
  { name: 'Assistant', title: 'AI Assistant', desc: 'Prototype deterministic responses' },
  { name: 'Reports', title: 'Reports', desc: 'Report configuration UI' },
  { name: 'Audit', title: 'Audit Trail', desc: 'Frontend workflow placeholder' }
];

pages.forEach(p => {
  const content = `export function ${p.name}() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-slate-900">${p.title}</h1>
      <p className="text-slate-500 mt-2">${p.desc}</p>
    </div>
  );
}
`;
  fs.writeFileSync(`src/pages/${p.name}.tsx`, content);
});
