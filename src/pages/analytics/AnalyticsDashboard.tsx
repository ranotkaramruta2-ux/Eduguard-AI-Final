import { useData } from '@/contexts/DataContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, ScatterChart, Scatter } from 'recharts';
import { RISK_COLORS } from '@/utils/constants';

export default function AnalyticsDashboard() {
  const { students } = useData();

  const riskDist = [
    { name: 'Low', value: students.filter(s => s.riskLevel === 'low').length, fill: RISK_COLORS.low },
    { name: 'Medium', value: students.filter(s => s.riskLevel === 'medium').length, fill: RISK_COLORS.medium },
    { name: 'High', value: students.filter(s => s.riskLevel === 'high').length, fill: RISK_COLORS.high },
  ];

  const attendanceVsRisk = students
    .filter(s => s.riskScore !== undefined)
    .map(s => ({ attendance: s.attendancePercentage, risk: s.riskScore, name: s.name }));

  const marksBuckets = [
    { range: '0-25', low: 0, medium: 0, high: 0 },
    { range: '26-50', low: 0, medium: 0, high: 0 },
    { range: '51-75', low: 0, medium: 0, high: 0 },
    { range: '76-100', low: 0, medium: 0, high: 0 },
  ];
  students.forEach(s => {
    const idx = s.internalMarks <= 25 ? 0 : s.internalMarks <= 50 ? 1 : s.internalMarks <= 75 ? 2 : 3;
    if (s.riskLevel) marksBuckets[idx][s.riskLevel]++;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display text-foreground">Analytics Dashboard</h1>
        <p className="text-muted-foreground text-sm">Data-driven insights on student dropout risk</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Distribution Pie */}
        <div className="stat-card">
          <h3 className="font-semibold text-foreground font-display mb-4">Risk Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={riskDist} cx="50%" cy="50%" outerRadius={90} innerRadius={55} dataKey="value" paddingAngle={4} label={({ name, value }) => `${name}: ${value}`}>
                  {riskDist.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Attendance vs Risk Scatter */}
        <div className="stat-card">
          <h3 className="font-semibold text-foreground font-display mb-4">Attendance vs Risk Score</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="attendance" name="Attendance %" type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
                <YAxis dataKey="risk" name="Risk Score" type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Scatter data={attendanceVsRisk} fill="hsl(var(--primary))" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Marks vs Risk Stacked Bar */}
        <div className="stat-card lg:col-span-2">
          <h3 className="font-semibold text-foreground font-display mb-4">Internal Marks vs Risk Level</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={marksBuckets}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="range" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="low" stackId="a" fill={RISK_COLORS.low} radius={[0, 0, 0, 0]} />
                <Bar dataKey="medium" stackId="a" fill={RISK_COLORS.medium} />
                <Bar dataKey="high" stackId="a" fill={RISK_COLORS.high} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
