import React, { useState } from 'react';
import { mlApi } from '../services/api';
import './ExpenseForecast.css';

interface MonthlyForecast {
    month: string;
    predicted_expense: number;
    confidence_low: number;
    confidence_high: number;
}

interface ForecastResponse {
    forecasts: MonthlyForecast[];
    total_forecasted: number;
    average_monthly: number;
    trend: string;
    recommendations: string[];
}

/**
 * Premium UI for the Expense‑Forecasting ML model.
 * Users enter their income/expenses and get a beautiful
 * card‑based forecast with trend badge & recommendations.
 */
export const ExpenseForecast: React.FC = () => {
    const [income, setIncome] = useState<number>(0);
    const [expenses, setExpenses] = useState<number>(0);
    const [months, setMonths] = useState<number>(3);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<ForecastResponse | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setData(null);
        try {
            const resp = await mlApi.forecastExpenses({
                monthlyIncome: income,
                currentExpenses: expenses,
                months,
            });
            setData(resp);
        } catch (err: any) {
            setError(err?.message ?? 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    /** Helper to colour‑code the trend badge */
    const trendColor = (trend: string) => {
        switch (trend) {
            case 'increasing':
                return 'trend-badge--red';
            case 'decreasing':
                return 'trend-badge--green';
            default:
                return 'trend-badge--blue';
        }
    };

    return (
        <div className="expense-forecast-page">
            <h1 className="page-title">💰 Expense Forecast</h1>

            {/* ── INPUT FORM ── */}
            <form className="forecast-form" onSubmit={handleSubmit}>
                <div className="form-row">
                    <label>Monthly Income</label>
                    <input
                        type="number"
                        min="0"
                        required
                        value={income}
                        onChange={(e) => setIncome(Number(e.target.value))}
                        placeholder="e.g. 8000"
                    />
                </div>

                <div className="form-row">
                    <label>Current Expenses</label>
                    <input
                        type="number"
                        min="0"
                        required
                        value={expenses}
                        onChange={(e) => setExpenses(Number(e.target.value))}
                        placeholder="e.g. 5000"
                    />
                </div>

                <div className="form-row">
                    <label>Months to Forecast</label>
                    <input
                        type="number"
                        min="1"
                        max="12"
                        required
                        value={months}
                        onChange={(e) => setMonths(Number(e.target.value))}
                    />
                </div>

                <button type="submit" className="btn-submit" disabled={loading}>
                    {loading ? 'Calculating…' : 'Forecast'}
                </button>
            </form>

            {/* ── FEEDBACK ── */}
            {error && <div className="error-msg">{error}</div>}

            {/* ── LOADING SPINNER ── */}
            {loading && (
                <div className="spinner">
                    <div className="dot dot1" />
                    <div className="dot dot2" />
                    <div className="dot dot3" />
                </div>
            )}

            {/* ── RESULT SECTION ── */}
            {data && (
                <section className="forecast-result">
                    {/* Trend badge */}
                    <div className={`trend-badge ${trendColor(data.trend)}`}>
                        Trend: {data.trend}
                    </div>

                    {/* Summary cards */}
                    <div className="summary-cards">
                        <div className="card glass">
                            <h3>Total Forecast</h3>
                            <p>{data.total_forecasted.toLocaleString()} ₹</p>
                        </div>
                        <div className="card glass">
                            <h3>Average / month</h3>
                            <p>{data.average_monthly.toLocaleString()} ₹</p>
                        </div>
                    </div>

                    {/* Monthly forecast grid */}
                    <div className="monthly-grid">
                        {data.forecasts.map((f) => (
                            <div key={f.month} className="card glass month-card">
                                <h4>{f.month}</h4>
                                <p className="big-number">
                                    {f.predicted_expense.toLocaleString()} ₹
                                </p>
                                <p className="range">
                                    ( {f.confidence_low.toLocaleString()} –{' '}
                                    {f.confidence_high.toLocaleString()} ₹ )
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Recommendations */}
                    <div className="recommendations">
                        <h3>💡 Recommendations</h3>
                        <ul>
                            {data.recommendations.map((rec, i) => (
                                <li key={i}>{rec}</li>
                            ))}
                        </ul>
                    </div>
                </section>
            )}
        </div>
    );
};

export default ExpenseForecast;
