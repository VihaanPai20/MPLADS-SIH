export function Audit() {
  const auditLogs = [
    { time: '10:45 AM', user: 'Admin User', action: 'Resolved Alert', target: 'ALT-12903', status: 'SUCCESS' },
    { time: '10:42 AM', user: 'Admin User', action: 'Viewed Risk Details', target: 'MEMBER-492', status: 'SUCCESS' },
    { time: '10:30 AM', user: 'System Engine', action: 'Generated Risk Analysis', target: 'ALL_MEMBERS', status: 'SUCCESS' },
    { time: '10:29 AM', user: 'Admin User', action: 'Changed House Filter', target: 'LOK_SABHA', status: 'SUCCESS' },
    { time: '09:15 AM', user: 'Admin User', action: 'Session Login', target: 'SYSTEM', status: 'SUCCESS' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-charcoal">System Audit Trail</h1>
        <p className="text-mutedText mt-1 text-sm">
          Prototype session logs. Real persistence requires backend integration.
        </p>
      </div>

      <div className="bg-white rounded-lg border border-brandBorder shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-secondaryText">
            <thead className="bg-white text-charcoal font-semibold border-b border-brandBorder">
              <tr>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">Actor</th>
                <th className="px-6 py-4">Action</th>
                <th className="px-6 py-4">Target Object</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 font-mono text-xs">
              {auditLogs.map((log, i) => (
                <tr key={i} className="hover:bg-white">
                  <td className="px-6 py-3">{log.time}</td>
                  <td className="px-6 py-3">{log.user}</td>
                  <td className="px-6 py-3 text-charcoal font-semibold">{log.action}</td>
                  <td className="px-6 py-3">{log.target}</td>
                  <td className="px-6 py-3 text-risk-low font-bold">{log.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
