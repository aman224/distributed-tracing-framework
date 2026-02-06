
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import TraceList from './components/TraceList';
import TraceViewer from './components/TraceViewer';
import './App.css';

function App() {
  return (
    <Router basename={import.meta.env.BASE_URL}>
      <div className="app-container">
        <div className="logo-section">
          <h1>Service Mesh Tracing Framework</h1>
          {/* <button
            className={`demo-toggle ${localStorage.getItem('useMock') === 'true' ? 'active' : ''}`}
            onClick={() => {
              const current = localStorage.getItem('useMock') === 'true';
              localStorage.setItem('useMock', (!current).toString());
              window.location.reload();
            }}
          >
            {localStorage.getItem('useMock') === 'true' ? 'Disable Demo' : 'Enable Demo Mode'}
          </button> */}
        </div>
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
