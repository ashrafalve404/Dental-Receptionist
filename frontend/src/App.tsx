import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import ChatReceptionist from './pages/ChatReceptionist';
import BookAppointment from './pages/BookAppointment';
import ManageAppointment from './pages/ManageAppointment';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminPatients from './pages/admin/AdminPatients';
import AdminAppointments from './pages/admin/AdminAppointments';
import AdminConversations from './pages/admin/AdminConversations';
import AdminFAQs from './pages/admin/AdminFAQs';
import AdminSettings from './pages/admin/AdminSettings';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/chat" element={<ChatReceptionist />} />
        <Route path="/book" element={<BookAppointment />} />
        <Route path="/manage" element={<ManageAppointment />} />
        <Route path="/dashboard" element={<Dashboard />} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/patients" element={<AdminPatients />} />
          <Route path="/admin/appointments" element={<AdminAppointments />} />
          <Route path="/admin/conversations" element={<AdminConversations />} />
          <Route path="/admin/faqs" element={<AdminFAQs />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
        </Route>
        
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}
