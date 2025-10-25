import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import List from './pages/List';
import Form from './pages/CreateAsset';
import Edit from './pages/Edit';
import LoanForm from './pages/Loan-Form';
import Return from './pages/Return';
import './App.css'
import Error404 from './pages/404';
import RequireAuth from './components/RequireAuth';
import Layout from './components/Layout';
import Loans from './pages/Loans';


function App() {
  return (
    <>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />

              <Route path="/assets" element={
                <RequireAuth><List /></RequireAuth>
                } />
              <Route path="/assets/new" element={
                <RequireAuth><Form /></RequireAuth>
                } />
              <Route path="/assets/:id/edit" element={
                <RequireAuth><Edit /></RequireAuth>
                } />
              <Route path="/loans" element={
                <RequireAuth><Loans /></RequireAuth>
                } />
              <Route path="/loans/loan" element={
                <RequireAuth><LoanForm /></RequireAuth>
                } />
              <Route path="/loans/return" element={
                <RequireAuth><Return /></RequireAuth>
                } />
            
            <Route path="/*" element={<Error404 />} />
          </Routes>
        </Layout>
      </Router>
    </>
  )
}

export default App
