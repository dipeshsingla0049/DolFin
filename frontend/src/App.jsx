import { useEffect, useMemo, useState } from 'react';
import {
  ArrowDownToLine,
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  CircleDollarSign,
  Database,
  LogOut,
  Search,
  Sparkles,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import './App.css';
import { api } from './api';

const TOKEN_KEY = 'dolfin.accessToken';
const EMAIL_KEY = 'dolfin.email';

const stockGroups = [
  {
    title: 'Market snapshot',
    icon: TrendingUp,
    fields: [
      ['id', 'Record ID'],
      ['price', 'Latest price'],
      ['last_price_date', 'Price date'],
      ['market_cap', 'Market capitalization'],
      ['price_to_sales', 'Price to sales'],
    ],
  },
  {
    title: 'Performance',
    icon: BarChart3,
    fields: [
      ['gross_margin', 'Gross margin'],
      ['operating_margin', 'Operating margin'],
      ['return_on_assets', 'Return on assets'],
      ['return_on_equity', 'Return on equity'],
    ],
  },
  {
    title: 'Income statement',
    icon: CircleDollarSign,
    fields: [
      ['revenue', 'Revenue'],
      ['ebitda', 'EBITDA'],
      ['pat', 'Net income (PAT)'],
    ],
  },
  {
    title: 'Balance sheet',
    icon: Wallet,
    fields: [
      ['total_cash', 'Total cash'],
      ['total_debt', 'Total debt'],
      ['debt_to_equity', 'Debt to equity'],
      ['current_ratio', 'Current ratio'],
    ],
  },
  {
    title: 'Reporting period',
    icon: Database,
    fields: [
      ['year', 'Fiscal year end'],
      ['quarter', 'Most recent quarter'],
    ],
  },
];

const exportFields = [
  ['id', 'Record ID'],
  ['ticker', 'Ticker'],
  ['name', 'Company'],
  ['price', 'Price'],
  ['last_price_date', 'Price date'],
  ['market_cap', 'Market capitalization'],
  ['price_to_sales', 'Price to sales'],
  ['year', 'Fiscal year end'],
  ['quarter', 'Most recent quarter'],
  ['gross_margin', 'Gross margin'],
  ['operating_margin', 'Operating margin'],
  ['return_on_assets', 'Return on assets'],
  ['return_on_equity', 'Return on equity'],
  ['revenue', 'Revenue'],
  ['ebitda', 'EBITDA'],
  ['pat', 'Net income (PAT)'],
  ['total_cash', 'Total cash'],
  ['total_debt', 'Total debt'],
  ['debt_to_equity', 'Debt to equity'],
  ['current_ratio', 'Current ratio'],
];

function formatNumber(value, compact = false) {
  const number = Number(value);
  if (!Number.isFinite(number)) return '—';
  return new Intl.NumberFormat(undefined, {
    notation: compact ? 'compact' : 'standard',
    maximumFractionDigits: compact ? 2 : 3,
  }).format(number);
}

function formatDate(value) {
  if (!value) return '—';
  const datePart = String(value).match(/^\d{4}-\d{2}-\d{2}/)?.[0];
  const date = new Date(datePart ? `${datePart}T12:00:00` : value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

function formatExportValue(key, value) {
  if (value === null || value === undefined) return '';
  if (['last_price_date', 'year', 'quarter'].includes(key)) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? String(value) : date.toISOString().slice(0, 10);
  }
  if (key === 'id') return Number(value);
  const number = Number(value);
  return Number.isFinite(number) ? number : String(value);
}

function AuthScreen({ onAuthenticated }) {
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const isRegistering = mode === 'register';

  async function handleSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setError('');

    try {
      if (isRegistering) {
        await api.register({ name: name.trim(), email: email.trim(), password });
      }
      const session = await api.login({ email: email.trim(), password });
      onAuthenticated(session, email.trim());
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  function changeMode(nextMode) {
    setMode(nextMode);
    setError('');
  }

  return (
    <main className="auth-page">
      <div className="auth-orb auth-orb-one" />
      <div className="auth-orb auth-orb-two" />
      <header className="auth-brand">
        <div className="brand-mark"><span /></div>
        <span>dolfin</span>
      </header>

      <div className="auth-layout">
        <section className="auth-story">
          <div className="eyebrow"><Sparkles size={15} /> PERSONAL MARKET INTELLIGENCE</div>
          <h1>Make room for a <em>clearer</em> view.</h1>
          <p className="auth-intro">
            Keep the companies you care about close. Dolfin brings your stock research
            together in one calm, organized workspace.
          </p>
          <div className="auth-benefits">
            <div><span className="benefit-icon"><Database size={17} /></span><span><b>Your own watchlist</b><small>Every lookup stays in your collection</small></span></div>
            <div><span className="benefit-icon"><BarChart3 size={17} /></span><span><b>Company fundamentals</b><small>See the full picture in one place</small></span></div>
            <div><span className="benefit-icon"><ArrowDownToLine size={17} /></span><span><b>Ready to take with you</b><small>Export your data to an Excel workbook</small></span></div>
          </div>
          <div className="auth-footnote"><span className="live-dot" /> A thoughtful home for your research</div>
        </section>

        <section className="auth-card">
          <div className="auth-card-top">
            <span className="card-kicker">{isRegistering ? 'GET STARTED' : 'WELCOME BACK'}</span>
            <h2>{isRegistering ? 'Create your account' : 'Sign in to Dolfin'}</h2>
            <p>{isRegistering ? 'Your watchlist starts with one good idea.' : 'Your market workspace is right where you left it.'}</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {isRegistering && (
              <label>
                <span>Your name</span>
                <input autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Darsh" required />
              </label>
            )}
            <label>
              <span>Email address</span>
              <input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required />
            </label>
            <label>
              <span>Password</span>
              <input type="password" autoComplete={isRegistering ? 'new-password' : 'current-password'} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" required />
            </label>
            {error && <div className="form-error" role="alert">{error}</div>}
            <button className="button button-primary auth-submit" type="submit" disabled={busy}>
              {busy ? 'Please wait…' : isRegistering ? 'Create account' : 'Sign in'}
              {!busy && <ArrowRight size={17} />}
            </button>
          </form>

          <div className="auth-switch">
            {isRegistering ? 'Already have an account?' : 'New to Dolfin?'}
            <button type="button" onClick={() => changeMode(isRegistering ? 'login' : 'register')}>
              {isRegistering ? 'Sign in' : 'Create an account'}
            </button>
          </div>
          <div className="auth-secure"><span /> Your data is private to your account</div>
        </section>
      </div>
      <footer className="auth-footer">DOLFIN <span>·</span> A clearer view of your market</footer>
    </main>
  );
}

function MetricGroup({ group, stock }) {
  const Icon = group.icon;
  return (
    <section className="metric-group">
      <h3><span><Icon size={16} /></span>{group.title}</h3>
      <dl>
        {group.fields.map(([key, label]) => {
          const value = stock[key];
          const rendered = ['last_price_date', 'year', 'quarter'].includes(key)
            ? formatDate(value)
            : key === 'market_cap' || key === 'revenue' || key === 'total_cash' || key === 'total_debt'
              ? formatNumber(value, true)
              : formatNumber(value);
          return (
            <div className="metric-row" key={key}>
              <dt>{label}</dt>
              <dd title={value ?? ''}>{rendered}</dd>
            </div>
          );
        })}
      </dl>
    </section>
  );
}

function App() {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || '');
  const [email, setEmail] = useState(() => localStorage.getItem(EMAIL_KEY) || '');
  const [stocks, setStocks] = useState([]);
  const [selectedStock, setSelectedStock] = useState(null);
  const [ticker, setTicker] = useState('');
  const [loadingDashboard, setLoadingDashboard] = useState(Boolean(token));
  const [fetching, setFetching] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (!token) return undefined;

    let active = true;
    api.dashboard(token)
      .then((result) => {
        if (!active) return;
        setStocks(result.stocks);
        setSelectedStock((current) => (
          current ? result.stocks.find((stock) => stock.ticker === current.ticker) || current : result.stocks[0] || null
        ));
        setError('');
      })
      .catch((requestError) => {
        if (!active) return;
        setError(requestError.message);
        if (requestError.status === 401 || requestError.status === 403) {
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(EMAIL_KEY);
          setToken('');
          setEmail('');
          setStocks([]);
          setSelectedStock(null);
          setLoadingDashboard(false);
        }
      })
      .finally(() => {
        if (active) setLoadingDashboard(false);
      });

    return () => { active = false; };
  }, [token]);

  const portfolioSummary = useMemo(() => {
    const totalMarketCap = stocks.reduce((sum, stock) => sum + (Number(stock.market_cap) || 0), 0);
    const totalCash = stocks.reduce((sum, stock) => sum + (Number(stock.total_cash) || 0), 0);
    const returns = stocks.map((stock) => Number(stock.return_on_equity)).filter(Number.isFinite);
    const averageReturn = returns.length
      ? returns.reduce((sum, value) => sum + value, 0) / returns.length
      : null;
    return { totalMarketCap, totalCash, averageReturn };
  }, [stocks]);

  function handleAuthenticated(session, userEmail) {
    localStorage.setItem(TOKEN_KEY, session.token);
    localStorage.setItem(EMAIL_KEY, userEmail);
    setEmail(userEmail);
    setLoadingDashboard(true);
    setToken(session.token);
    setNotice('Welcome to your Dolfin workspace.');
    setError('');
  }

  function handleLogout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(EMAIL_KEY);
    setToken('');
    setEmail('');
    setStocks([]);
    setSelectedStock(null);
    setLoadingDashboard(false);
    setNotice('');
    setError('');
  }

  async function handleFetchStock(event) {
    event.preventDefault();
    const requestedTicker = ticker.trim().toUpperCase();
    if (!requestedTicker) return;

    setFetching(true);
    setError('');
    setNotice('');
    try {
      const stock = await api.fetchStock(requestedTicker, token);
      setSelectedStock(stock);
      const dashboard = await api.dashboard(token);
      setStocks(dashboard.stocks);
      setSelectedStock(dashboard.stocks.find((item) => item.ticker === stock.ticker) || stock);
      setTicker('');
      setNotice(`${stock.ticker} is ready in your watchlist.`);
    } catch (requestError) {
      setError(requestError.message);
      if (requestError.status === 401 || requestError.status === 403) handleLogout();
    } finally {
      setFetching(false);
    }
  }

  async function handleExport() {
    if (!stocks.length) return;
    setExporting(true);
    try {
      const xlsxModule = await import('xlsx');
      const XLSX = xlsxModule.default ?? xlsxModule;
      const rows = stocks.map((stock) => Object.fromEntries(
        exportFields.map(([key, label]) => [label, formatExportValue(key, stock[key])]),
      ));
      const worksheet = XLSX.utils.json_to_sheet(rows, {
        header: exportFields.map(([, label]) => label),
      });
      worksheet['!cols'] = exportFields.map(([, label]) => ({ wch: Math.max(label.length + 2, 18) }));
      worksheet['!autofilter'] = { ref: worksheet['!ref'] };

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'My Stocks');
      XLSX.writeFile(workbook, `dolfin-stocks-${new Date().toISOString().slice(0, 10)}.xlsx`);
      setNotice(`Exported ${stocks.length} ${stocks.length === 1 ? 'stock' : 'stocks'} to Excel.`);
    } catch {
      setError('The Excel file could not be created. Please try again.');
    } finally {
      setExporting(false);
    }
  }

  if (!token) {
    return <AuthScreen onAuthenticated={handleAuthenticated} />;
  }

  const userLabel = email ? email.split('@')[0] : 'Investor';

  return (
    <div className="workspace">
      <aside className="sidebar">
        <a className="brand" href="#top" aria-label="Dolfin home">
          <span className="brand-mark"><span /></span>
          <span>dolfin</span>
        </a>
        <div className="sidebar-label">WORKSPACE</div>
        <a className="nav-link active" href="#overview"><BarChart3 size={18} /> Overview</a>
        <a className="nav-link" href="#watchlist"><BriefcaseBusiness size={18} /> My watchlist <span className="nav-count">{stocks.length}</span></a>
        <div className="sidebar-bottom">
          <div className="sidebar-note">
            <span className="note-icon"><Sparkles size={16} /></span>
            <b>Research, remembered.</b>
            <p>Your fetched stocks stay connected to your account.</p>
          </div>
          <div className="profile-row">
            <div className="avatar">{userLabel.slice(0, 1).toUpperCase()}</div>
            <div className="profile-copy"><b>{userLabel}</b><span>Personal workspace</span></div>
            <button className="icon-button logout-button" type="button" onClick={handleLogout} aria-label="Sign out" title="Sign out"><LogOut size={17} /></button>
          </div>
        </div>
      </aside>

      <main className="main-panel" id="top">
        <header className="topbar">
          <div className="breadcrumb"><span>Workspace</span><i>/</i><b>Overview</b></div>
          <div className="topbar-right">
            <span className="market-status"><span className="live-dot" /> Your personal market desk</span>
            <div className="avatar avatar-small">{userLabel.slice(0, 1).toUpperCase()}</div>
          </div>
        </header>

        <div className="page-content" id="overview">
          <section className="page-heading">
            <div>
              <p className="eyebrow">YOUR RESEARCH, AT A GLANCE</p>
              <h1>Good to see you, {userLabel}.</h1>
              <p className="heading-subtitle">A little more clarity for the companies on your mind.</p>
            </div>
            <button className="button button-secondary export-button" type="button" onClick={handleExport} disabled={!stocks.length || exporting}>
              <ArrowDownToLine size={17} />
              {exporting ? 'Preparing…' : 'Export to Excel'}
            </button>
          </section>

          {error && <div className="notice notice-error" role="alert">{error}</div>}
          {notice && !error && <div className="notice notice-success" role="status">{notice}</div>}

          <section className="hero-panel">
            <div className="hero-copy">
              <span className="hero-tag"><Sparkles size={14} /> YOUR MARKET, MADE PERSONAL</span>
              <h2>Start with a ticker.<br /><em>See the whole story.</em></h2>
              <p>Look up a company to explore its fundamentals. Your research is saved to your watchlist for next time.</p>
              <form className="ticker-search" onSubmit={handleFetchStock}>
                <Search size={19} />
                <input
                  aria-label="Stock ticker"
                  value={ticker}
                  onChange={(event) => setTicker(event.target.value)}
                  placeholder="Search a ticker, e.g. AAPL"
                  required
                />
                <button className="button button-search" type="submit" disabled={fetching}>
                  {fetching ? 'Looking…' : 'Explore'} {!fetching && <ArrowRight size={16} />}
                </button>
              </form>
              <div className="search-hint"><span>POPULAR</span><button type="button" onClick={() => setTicker('AAPL')}>AAPL</button><button type="button" onClick={() => setTicker('MSFT')}>MSFT</button><button type="button" onClick={() => setTicker('NVDA')}>NVDA</button></div>
            </div>
            <div className="hero-art" aria-hidden="true">
              <div className="art-ring art-ring-one" />
              <div className="art-ring art-ring-two" />
              <div className="art-line art-line-one" />
              <div className="art-line art-line-two" />
              <div className="art-card">
                <span className="art-card-label">YOUR WATCHLIST</span>
                <div className="art-card-value"><TrendingUp size={18} /> {stocks.length.toString().padStart(2, '0')} <small>stocks tracked</small></div>
                <div className="art-sparkline"><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /></div>
                <div className="art-card-footer"><span>Research that stays with you</span><span className="art-dot" /></div>
              </div>
              <div className="art-orbit-dot" />
            </div>
          </section>

          <section className="summary-grid" aria-label="Watchlist summary">
            <article className="summary-card">
              <div className="summary-top"><span className="summary-icon icon-lilac"><BriefcaseBusiness size={18} /></span><span className="summary-label">IN YOUR WATCHLIST</span></div>
              <strong>{loadingDashboard ? '—' : stocks.length.toString().padStart(2, '0')}</strong>
              <span className="summary-caption">companies you’ve researched</span>
            </article>
            <article className="summary-card">
              <div className="summary-top"><span className="summary-icon icon-mint"><CircleDollarSign size={18} /></span><span className="summary-label">COMBINED MARKET CAP</span></div>
              <strong>{loadingDashboard ? '—' : formatNumber(portfolioSummary.totalMarketCap, true)}</strong>
              <span className="summary-caption">across your saved companies</span>
            </article>
            <article className="summary-card">
              <div className="summary-top"><span className="summary-icon icon-peach"><Wallet size={18} /></span><span className="summary-label">COMBINED CASH</span></div>
              <strong>{loadingDashboard ? '—' : formatNumber(portfolioSummary.totalCash, true)}</strong>
              <span className="summary-caption">reported by tracked companies</span>
            </article>
            <article className="summary-card">
              <div className="summary-top"><span className="summary-icon icon-blue"><TrendingUp size={18} /></span><span className="summary-label">AVG. RETURN ON EQUITY</span></div>
              <strong>{loadingDashboard || portfolioSummary.averageReturn === null ? '—' : formatNumber(portfolioSummary.averageReturn)}</strong>
              <span className="summary-caption">reported values, across your list</span>
            </article>
          </section>

          <div className="content-grid">
            <section className="detail-panel">
              <div className="section-heading">
                <div><p className="eyebrow">COMPANY DEEP DIVE</p><h2>{selectedStock ? 'The details that matter.' : 'Your next research stop.'}</h2></div>
                {selectedStock && <span className="record-pill"><span /> SAVED COMPANY</span>}
              </div>
              {selectedStock ? (
                <>
                  <div className="stock-heading">
                    <div className="stock-monogram">{selectedStock.ticker?.slice(0, 1) || '?'}</div>
                    <div className="stock-title"><span>{selectedStock.ticker}</span><h3>{selectedStock.name}</h3><small>Price data · {formatDate(selectedStock.last_price_date)}</small></div>
                    <div className="stock-price"><span>Latest price</span><strong>{formatNumber(selectedStock.price)}</strong><small>per share</small></div>
                  </div>
                  <div className="metric-groups">
                    {stockGroups.map((group) => <MetricGroup key={group.title} group={group} stock={selectedStock} />)}
                  </div>
                </>
              ) : (
                <div className="empty-detail">
                  <div className="empty-illustration"><Search size={24} /></div>
                  <h3>{loadingDashboard ? 'Loading your workspace…' : 'Your watchlist is a blank canvas.'}</h3>
                  <p>{loadingDashboard ? 'We’re gathering your saved companies.' : 'Search for a ticker above. We’ll bring back the company’s available market and financial data.'}</p>
                </div>
              )}
            </section>

            <aside className="watchlist-panel" id="watchlist">
              <div className="watchlist-heading">
                <div><p className="eyebrow">YOUR COLLECTION</p><h2>Watchlist <span>{stocks.length}</span></h2></div>
                <button className="text-button" type="button" onClick={handleExport} disabled={!stocks.length} title="Export your watchlist"><ArrowDownToLine size={17} /></button>
              </div>
              {loadingDashboard ? (
                <div className="watchlist-loading"><span className="spinner" /> Loading saved stocks</div>
              ) : stocks.length ? (
                <div className="watchlist-list">
                  {stocks.map((stock) => (
                    <button className={`watchlist-item ${selectedStock?.ticker === stock.ticker ? 'selected' : ''}`} type="button" key={stock.id ?? stock.ticker} onClick={() => setSelectedStock(stock)}>
                      <span className="watchlist-monogram">{stock.ticker?.slice(0, 1) || '?'}</span>
                      <span className="watchlist-copy"><b>{stock.ticker}</b><small>{stock.name}</small></span>
                      <span className="watchlist-value"><b>{formatNumber(stock.price)}</b><small>{formatNumber(stock.market_cap, true)} cap</small></span>
                      <ArrowRight className="watchlist-arrow" size={15} />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="watchlist-empty">
                  <div className="empty-illustration small"><BriefcaseBusiness size={20} /></div>
                  <b>No companies saved yet</b>
                  <p>Search a ticker to fetch it and add it to your personal collection.</p>
                </div>
              )}
              <div className="watchlist-footer"><span><Database size={14} /> Synced to your account</span><span>Excel ready</span></div>
            </aside>
          </div>

          <footer className="page-footer"><span>Dolfin <i>·</i> Your research, thoughtfully organized</span><span>Market data is provided for informational purposes.</span></footer>
        </div>
      </main>
    </div>
  );
}

export default App;
