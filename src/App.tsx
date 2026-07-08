import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { BottomNav } from '@/components';
import { 
  Home, 
  AddRecord, 
  VoiceRecord, 
  Stats, 
  Profile, 
  Category, 
  MerchantRules, 
  ExcelImport,
  Budget,
  Export,
  Settings,
} from '@/pages';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-clay-bg">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/add" element={<AddRecord />} />
          <Route path="/voice" element={<VoiceRecord />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/categories" element={<Category />} />
          <Route path="/merchant-rules" element={<MerchantRules />} />
          <Route path="/import" element={<ExcelImport />} />
          <Route path="/budget" element={<Budget />} />
          <Route path="/export" element={<Export />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
        <BottomNav />
      </div>
    </Router>
  );
}

export default App;
