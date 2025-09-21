import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { TripDetailPage } from './pages/TripDetailPage';
import { DashboardPage } from './pages/DashboardPage';
import { RequireUploader } from './components/RequireAuth';

const App = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/trip/:id" element={<TripDetailPage />} />
        <Route
          path="/dashboard"
          element={
            <RequireUploader>
              <DashboardPage />
            </RequireUploader>
          }
        />
      </Routes>
    </Layout>
  );
};

export default App;
