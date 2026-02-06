
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import TraceList from './components/TraceList';
import TraceViewer from './components/TraceViewer';
import './App.css';

function App() {
  return (
    <Router basename={import.meta.env.BASE_URL}>
      <div className="app-container">
        <header className="app-header">
          <div className="header-left">
            <h1>Service Mesh Tracing Framework</h1>
            <nav>
              <Link to="/">Traces</Link>
            </nav>
          </div>
          <div className="header-right">
            <button
              className={`demo-toggle ${localStorage.getItem('useMock') === 'true' ? 'active' : ''}`}
              onClick={() => {
                const current = localStorage.getItem('useMock') === 'true';
                localStorage.setItem('useMock', (!current).toString());
                window.location.reload();
              }}
            >
              {localStorage.getItem('useMock') === 'true' ? 'Disable Demo' : 'Enable Demo Mode'}
            </button>
          </div>
        </header>
        <main>
          <Routes>
            <Route path="/" element={<TraceList />} />
            <Route path="/trace/:traceId" element={<TraceViewer />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
