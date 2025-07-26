import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import List from './pages/List';
import Form from './pages/Form';
import Loan from './pages/Loan';
import Return from './pages/Return';
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/view" element={<List />} />
        <Route path="/new" element={<Form />} />
        <Route path="/edit/:id" element={<Form />} />
        <Route path="/loan" element={<Loan />} />
        <Route path="/return" element={<Return />} />
      </Routes>
    </Router>
  )
}

export default App
