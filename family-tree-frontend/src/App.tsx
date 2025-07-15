import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { FamilyTreeProvider } from './contexts/FamilyTreeContext';
import { ErrorProvider } from './contexts/ErrorContext';
import { ErrorBoundary } from './components/error/ErrorBoundary';
import { ErrorNotifications } from './components/error/ErrorNotifications';
import { TreeView } from './pages/TreeView';
import './App.css';

function App() {
  return (
    <ErrorProvider>
      <ErrorBoundary>
        <FamilyTreeProvider>
          <Router>
            <div className="app">
              <header className="app-header">
                <h1>Family Tree</h1>
                <nav className="app-nav">
                  {/* Navigation will be enhanced in later tasks */}
                </nav>
              </header>
              
              <main className="app-main">
                <ErrorBoundary>
                  <Routes>
                    <Route path="/" element={<Navigate to="/tree" replace />} />
                    <Route path="/tree" element={<TreeView />} />
                    {/* Additional routes will be added in later tasks */}
                  </Routes>
                </ErrorBoundary>
              </main>
              
              <ErrorNotifications />
            </div>
          </Router>
        </FamilyTreeProvider>
      </ErrorBoundary>
    </ErrorProvider>
  );
}

export default App;
