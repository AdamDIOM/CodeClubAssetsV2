import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import List from './pages/Assets/List';
import Form from './pages/Assets/CreateAsset';
import Edit from './pages/Assets/Edit';
import LoanForm from './pages/Loans/Loan-Form';
import Return from './pages/Loans/Return';
import './App.css'
import Error404 from './pages/404';
import RequireAuth from './components/RequireAuth';
import Layout from './components/Layout';
import Loans from './pages/Loans/Loans';
import KitTracking from './pages/KitTracking/List';
import CreateKT from './pages/KitTracking/Create';
import EditKT from './pages/KitTracking/Edit';


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
              <Route path="/loans/new" element={
                <RequireAuth><LoanForm /></RequireAuth>
                } />
              <Route path="/loans/return" element={
                <RequireAuth><Return /></RequireAuth>
                } />

              <Route path="/kit-tracking" element={
                <RequireAuth><KitTracking /></RequireAuth>
              } />
              <Route path="/kit-tracking/new" element={
                <RequireAuth><CreateKT /></RequireAuth>
              } />
              <Route path="/kit-tracking/:id/edit" element={
                <RequireAuth><EditKT /></RequireAuth>
                } />

            <Route path="/*" element={<Error404 />} />
          </Routes>
        </Layout>
      </Router>
    </>
  )
}

export default App
