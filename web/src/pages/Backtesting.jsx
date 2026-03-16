import { useState, useEffect } from 'react'
import { apiFetch } from '../lib/api.js'
import { Play, LineChart, TrendingUp, AlertTriangle, Info, CheckCircle2 } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function Backtesting() {
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState(null)
    const [params, setParams] = useState({
        coin_id: 'bitcoin',
        initial_capital: 10000,
        days: 365,
        strategy: 'buy_and_hold'
    })

    const runBacktest = async () => {
        setLoading(true)
        try {
            const data = await apiFetch(`/api/portfolio/backtest?coin_id=${params.coin_id}&initial_capital=${params.initial_capital}&days=${params.days}&strategy=${params.strategy}`, { auth: true })
            setResult(data.data)
        } catch (err) {
            console.error('Backtest error:', err)
            alert('Failed to run backtest: ' + err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="page-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
            <header style={{ marginBottom: '2.5rem' }}>
                <h1 style={{ fontSize: '2.4rem', fontWeight: 800, marginBottom: '0.5rem' }}>Strategy Backtesting</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Simulate trading strategies on historical market data to validate your performance.</p>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
                {/* Settings Panel */}
                <div className="card" style={{ padding: '2rem', borderRadius: '24px', height: 'fit-content' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Play size={20} color="var(--primary)" /> Simulation Settings
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>Asset to Test</label>
                            <select
                                value={params.coin_id}
                                onChange={(e) => setParams({ ...params, coin_id: e.target.value })}
                                style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                            >
                                <option value="bitcoin">Bitcoin (BTC)</option>
                                <option value="ethereum">Ethereum (ETH)</option>
                                <option value="solana">Solana (SOL)</option>
                                <option value="cardano">Cardano (ADA)</option>
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>Initial Capital (USD)</label>
                            <input
                                type="number"
                                value={params.initial_capital}
                                onChange={(e) => setParams({ ...params, initial_capital: parseFloat(e.target.value) })}
                                style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>Timeframe (Days)</label>
                            <select
                                value={params.days}
                                onChange={(e) => setParams({ ...params, days: parseInt(e.target.value) })}
                                style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                            >
                                <option value="30">30 Days</option>
                                <option value="90">90 Days</option>
                                <option value="180">180 Days</option>
                                <option value="365">1 Year</option>
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>Trading Strategy</label>
                            <select
                                value={params.strategy}
                                onChange={(e) => setParams({ ...params, strategy: e.target.value })}
                                style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                            >
                                <option value="buy_and_hold">Buy and Hold</option>
                                <option value="moving_average_crossover">SMA Crossover (10/30)</option>
                            </select>
                        </div>

                        <button
                            onClick={runBacktest}
                            disabled={loading}
                            className="btn-primary"
                            style={{ width: '100%', marginTop: '1rem', padding: '14px', borderRadius: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                        >
                            {loading ? 'Simulating...' : <><Play size={18} fill="currentColor" /> Run Simulation</>}
                        </button>
                    </div>
                </div>

                {/* Results Panel */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {!result && !loading && (
                        <div className="card" style={{ padding: '4rem 2rem', borderRadius: '24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                            <LineChart size={48} style={{ marginBottom: '1.5rem', opacity: 0.3 }} />
                            <p style={{ fontSize: '1.1rem' }}>Configure the settings and run a simulation to see the performance analysis.</p>
                        </div>
                    )}

                    {loading && (
                        <div className="card" style={{ padding: '6rem 2rem', borderRadius: '24px', textAlign: 'center' }}>
                            <div className="loading-spinner" style={{ margin: '0 auto 1.5rem' }}></div>
                            <p>Aggregating historical market data and running strategy logic...</p>
                        </div>
                    )}

                    {result && (
                        <>
                            {/* Summary Metrics */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                                <div className="stat-card" style={{ padding: '1.5rem', borderRadius: '20px' }}>
                                    <span className="stat-label">FINAL VALUE</span>
                                    <div className="stat-value" style={{ fontSize: '1.8rem' }}>${result.final_value?.toLocaleString()}</div>
                                </div>
                                <div className="stat-card" style={{ padding: '1.5rem', borderRadius: '20px' }}>
                                    <span className="stat-label">TOTAL P&L</span>
                                    <div className={`stat-value ${result.total_pnl >= 0 ? 'positive' : 'negative'}`} style={{ fontSize: '1.8rem' }}>
                                        {result.total_pnl >= 0 ? '+' : ''}${result.total_pnl?.toLocaleString()}
                                    </div>
                                </div>
                                <div className="stat-card" style={{ padding: '1.5rem', borderRadius: '20px' }}>
                                    <span className="stat-label">RETURN %</span>
                                    <div className={`stat-value ${result.pnl_percentage >= 0 ? 'positive' : 'negative'}`} style={{ fontSize: '1.8rem' }}>
                                        {result.pnl_percentage?.toFixed(2)}%
                                    </div>
                                </div>
                            </div>

                            {/* Equity Curve Chart */}
                            <div className="card" style={{ padding: '2rem', borderRadius: '24px' }}>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '2rem' }}>Portfolio Equity Curve</h3>
                                <div style={{ height: '350px' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={result.history}>
                                            <defs>
                                                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                            <XAxis
                                                dataKey="date"
                                                stroke="rgba(255,255,255,0.3)"
                                                fontSize={12}
                                                tickLine={false}
                                                axisLine={false}
                                                minTickGap={30}
                                            />
                                            <YAxis
                                                stroke="rgba(255,255,255,0.3)"
                                                fontSize={12}
                                                tickLine={false}
                                                axisLine={false}
                                                tickFormatter={(val) => `$${val >= 1000 ? (val / 1000).toFixed(0) + 'k' : val}`}
                                            />
                                            <Tooltip
                                                contentStyle={{ background: '#0d1b2a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                                itemStyle={{ color: 'var(--primary)', fontWeight: 700 }}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="value"
                                                stroke="var(--primary)"
                                                strokeWidth={3}
                                                fillOpacity={1}
                                                fill="url(#colorValue)"
                                                animationDuration={1500}
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
