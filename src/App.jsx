import { BrowserRouter, Routes, Route } from 'react-router-dom';
import EligibilityMatrix from './EligibilityMatrix';
import PublicLedgerView from './components/PublicLedgerView';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/*" element={<EligibilityMatrix />} />
        <Route path="/ledger/:shareId" element={<PublicLedgerView />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;