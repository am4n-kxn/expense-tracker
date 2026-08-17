import { useEffect, useMemo, useState } from 'react';
import {
  PieChart, Pie, Cell,
  BarChart, Bar,
  LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

const CHART_COLORS = [
  'var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)',
  'var(--chart-4)', 'var(--chart-5)', 'var(--chart-6)',
];

const ANALYZE_OPTIONS = [
  { value: 'category', label: 'Category' },
  { value: 'paymentType', label: 'Payment Type' },
  { value: 'time', label: 'Time' },
];

const PERIOD_OPTIONS = [
  { value: 'month', label: 'This Month' },
  { value: '3months', label: 'Last 3 Months' },
  { value: 'year', label: 'This Year' },
  { value: 'all', label: 'All Time' },
];

const CHART_TYPES_BY_MODE = {
  category: ['donut', 'bar'],
  paymentType: ['donut', 'bar'],
  time: ['line', 'bar'],
};

const CHART_LABELS = { donut: 'Donut', bar: 'Bar', line: 'Line' };

const tooltipStyle = {
  contentStyle: {
    background: 'var(--paper-raised)',
    border: '1px solid var(--rule)',
    borderRadius: '3px',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.78rem',
    color: 'var(--ink)',
  },
  labelStyle: { color: 'var(--ink-soft)' },
};

function currency(value) {
  return `₹${Number(value).toFixed(2)}`;
}

function filterByPeriod(transactions, period) {
  if (period === 'all') return transactions;
  const now = new Date();
  let cutoff;
  if (period === 'month') {
    cutoff = new Date(now.getFullYear(), now.getMonth(), 1);
  } else if (period === '3months') {
    cutoff = new Date(now);
    cutoff.setDate(cutoff.getDate() - 90);
  } else if (period === 'year') {
    cutoff = new Date(now.getFullYear(), 0, 1);
  }
  return transactions.filter((t) => new Date(t.date) >= cutoff);
}

function groupByField(transactions, field) {
  const map = new Map();
  transactions
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      const key = field === 'category' ? t.category : t.account;
      map.set(key, (map.get(key) || 0) + t.amount);
    });
  return [...map.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

function getBucket(dateStr, period) {
  const d = new Date(dateStr);
  if (period === 'month') {
    const key = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
    return { key, label, sort: d.getTime() };
  }
  if (period === '3months') {
    const day = d.getDay();
    const diff = (day === 0 ? -6 : 1) - day;
    const monday = new Date(d);
    monday.setDate(d.getDate() + diff);
    const key = monday.toISOString().slice(0, 10);
    const label = `Wk ${monday.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}`;
    return { key, label, sort: monday.getTime() };
  }
  const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  const label = d.toLocaleDateString('en-IN', {
    month: 'short',
    year: period === 'all' ? '2-digit' : undefined,
  });
  return { key, label, sort: new Date(d.getFullYear(), d.getMonth(), 1).getTime() };
}

function buildTimeSeries(transactions, period) {
  const map = new Map();
  transactions.forEach((t) => {
    const { key, label, sort } = getBucket(t.date, period);
    if (!map.has(key)) map.set(key, { label, sort, income: 0, expense: 0 });
    const bucket = map.get(key);
    if (t.type === 'income') bucket.income += t.amount;
    else bucket.expense += t.amount;
  });
  return [...map.values()].sort((a, b) => a.sort - b.sort);
}

export default function AnalyticsSection({ transactions }) {
  const [analyzeBy, setAnalyzeBy] = useState('category');
  const [period, setPeriod] = useState('month');
  const [chartType, setChartType] = useState('donut');

  const allowedCharts = CHART_TYPES_BY_MODE[analyzeBy];

  useEffect(() => {
    if (!allowedCharts.includes(chartType)) {
      setChartType(allowedCharts[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [analyzeBy]);

  const filtered = useMemo(
    () => filterByPeriod(transactions, period),
    [transactions, period]
  );

  const groupedData = useMemo(
    () => (analyzeBy !== 'time' ? groupByField(filtered, analyzeBy) : []),
    [filtered, analyzeBy]
  );

  const timeSeries = useMemo(
    () => (analyzeBy === 'time' ? buildTimeSeries(filtered, period) : []),
    [filtered, analyzeBy, period]
  );

  const hasData = analyzeBy === 'time' ? timeSeries.length > 0 : groupedData.length > 0;

  return (
    <div className="ledger-card">
      <h2>Explore your spending</h2>

      <div className="analytics-controls">
        <div className="analytics-field">
          <label htmlFor="analyze-by">Analyze by</label>
          <select
            id="analyze-by"
            value={analyzeBy}
            onChange={(e) => setAnalyzeBy(e.target.value)}
          >
            {ANALYZE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div className="analytics-field">
          <label htmlFor="time-period">Time period</label>
          <select
            id="time-period"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          >
            {PERIOD_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div className="analytics-field">
          <label>Chart</label>
          <div className="chart-toggle">
            {allowedCharts.map((type) => (
              <button
                key={type}
                className={chartType === type ? 'active' : ''}
                onClick={() => setChartType(type)}
              >
                {CHART_LABELS[type]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {!hasData && (
        <div className="empty-state">
          <div className="empty-mark">— · —</div>
          <p>Not enough data for this view yet. Add a few transactions first.</p>
        </div>
      )}

      {hasData && analyzeBy !== 'time' && chartType === 'donut' && (
        <div className="chart-area">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={groupedData}
                dataKey="value"
                nameKey="name"
                innerRadius="55%"
                outerRadius="80%"
                paddingAngle={2}
              >
                {groupedData.map((entry, i) => (
                  <Cell key={entry.name} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => currency(value)} {...tooltipStyle} />
              <Legend wrapperStyle={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--ink-soft)' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {hasData && analyzeBy !== 'time' && chartType === 'bar' && (
        <div className="chart-area">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={groupedData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--rule)" />
              <XAxis dataKey="name" tick={{ fill: 'var(--ink-soft)', fontSize: 11 }} />
              <YAxis tick={{ fill: 'var(--ink-soft)', fontSize: 11 }} />
              <Tooltip formatter={(value) => currency(value)} {...tooltipStyle} />
              <Bar dataKey="value" fill="var(--chart-1)" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {hasData && analyzeBy === 'time' && chartType === 'line' && (
        <div className="chart-area">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timeSeries}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--rule)" />
              <XAxis dataKey="label" tick={{ fill: 'var(--ink-soft)', fontSize: 11 }} />
              <YAxis tick={{ fill: 'var(--ink-soft)', fontSize: 11 }} />
              <Tooltip formatter={(value) => currency(value)} {...tooltipStyle} />
              <Legend wrapperStyle={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--ink-soft)' }} />
              <Line type="monotone" dataKey="income" name="Income" stroke="var(--credit)" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="expense" name="Expense" stroke="var(--debit)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {hasData && analyzeBy === 'time' && chartType === 'bar' && (
        <div className="chart-area">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={timeSeries}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--rule)" />
              <XAxis dataKey="label" tick={{ fill: 'var(--ink-soft)', fontSize: 11 }} />
              <YAxis tick={{ fill: 'var(--ink-soft)', fontSize: 11 }} />
              <Tooltip formatter={(value) => currency(value)} {...tooltipStyle} />
              <Legend wrapperStyle={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--ink-soft)' }} />
              <Bar dataKey="income" name="Income" fill="var(--credit)" radius={[3, 3, 0, 0]} />
              <Bar dataKey="expense" name="Expense" fill="var(--debit)" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
