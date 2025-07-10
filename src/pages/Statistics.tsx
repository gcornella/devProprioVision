import './Statistics.css';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';

interface YourProjectSessionData {
  sessionId: string;
  timestamp: Date;
  meanError: number;
}

type Filter = 'all' | 'day' | 'week' | 'month';

const Statistics = () => {
  const navigate = useNavigate();
  const [yourProjectData, setYourProjectData] = useState<YourProjectSessionData[]>([]);
  const [filteredData, setFilteredData] = useState<YourProjectSessionData[]>([]);
  const [filter, setFilter] = useState<Filter>('all');

  const STORAGE_PREFIX = 'user_guest_YourProject_';

  // Load sessions from localStorage
  useEffect(() => {
    const sessionResults: YourProjectSessionData[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_PREFIX)) {
        const raw = localStorage.getItem(key);
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            const timestamp = new Date(parsed.timestamp);
            const sessionData = parsed.data;

            if (sessionData) {
              const allValues = Object.values(sessionData).flat() as number[];
              const mean = allValues.length
                ? allValues.reduce((a, b) => a + b, 0) / allValues.length
                : 0;

              sessionResults.push({
                sessionId: key.replace(STORAGE_PREFIX, ''),
                timestamp,
                meanError: mean,
              });
            }
          } catch (e) {
            console.warn(`⚠️ Failed to parse data for ${key}`);
          }
        }
      }
    }

    sessionResults.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    setYourProjectData(sessionResults);
  }, []);

  // Filter by time window
  useEffect(() => {
    const now = new Date();
    let filtered = yourProjectData;

    if (filter === 'day') {
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      filtered = filtered.filter((d) => d.timestamp >= oneDayAgo);
    } else if (filter === 'week') {
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter((d) => d.timestamp >= oneWeekAgo);
    } else if (filter === 'month') {
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter((d) => d.timestamp >= oneMonthAgo);
    }

    setFilteredData(filtered);
  }, [filter, yourProjectData]);

  const handleBack = () => navigate('/');

  return (
    <div className="statistics-container">
      <div className="statistics-inner">
        <h1 className="statistics-title">📊 YourProject</h1>
        <p className="developer-info">Track how your metrics change over time.</p>

        <div className="filter-buttons">
          {['day', 'week', 'month', 'all'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as Filter)}
              className={filter === f ? 'active' : ''}
            >
              {f === 'all' ? 'All' : `Last ${f.charAt(0).toUpperCase() + f.slice(1)}`}
            </button>
          ))}
        </div>

        <div className="chart-container">
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={filteredData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="timestamp"
                tickFormatter={(tick) => new Date(tick).toLocaleDateString()}
              />
              <YAxis
                label={{ value: 'TODO -> Change units', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip labelFormatter={(label) => new Date(label).toLocaleString()} />
              <Line
                type="monotone"
                dataKey="meanError"
                stroke="#8884d8"
                strokeWidth={3}
                dot={{ r: 3 }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Statistics;
