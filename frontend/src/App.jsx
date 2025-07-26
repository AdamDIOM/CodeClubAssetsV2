import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import List from './pages/List';
import Form from './pages/Form';
import Loan from './pages/Loan';
import Return from './pages/Return';
import './App.css'
import Error404 from './pages/404';
import AuthButtons from './components/AuthButtons';
import RequireAuth from './components/RequireAuth';


function App() {
  return (
    <>
      <AuthButtons />
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />

            <Route path="/view" element={
              <RequireAuth><List /></RequireAuth>
              } />
            <Route path="/new" element={
              <RequireAuth><Form /></RequireAuth>
              } />
            <Route path="/edit/:id" element={
              <RequireAuth><Form /></RequireAuth>
              } />
            <Route path="/loan" element={
              <RequireAuth><Loan /></RequireAuth>
              } />
            <Route path="/return" element={
              <RequireAuth><Return /></RequireAuth>
              } />
          
          <Route path="/*" element={<Error404 />} />
        </Routes>
      </Router>
    </>
  )
}

export default App
