import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";

// Sayfalarımızı içe aktarıyoruz
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import AdminPage from "./pages/AdminPage";
import RegisterPage from "./pages/RegisterPage";
import ReservationPage from "./pages/ReservationPage";
import ProfilePage from "./pages/ProfilePage";
import TrainingPage from "./pages/TrainingPage";

function App() {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div>Yükleniyor...</div>; // Uygulama ilk açıldığında token çözülene kadar bekletiriz
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={user ? <HomePage /> : <Navigate to="/login" />}
        />
        <Route
          path="/login"
          element={!user ? <LoginPage /> : <Navigate to="/" />}
        />

        {/* YENİ KAYIT ROTASI: Giriş yapmamışsa Register'a girebilir, yapmışsa Anasayfaya atılır */}
        <Route
          path="/register"
          element={!user ? <RegisterPage /> : <Navigate to="/" />}
        />

        <Route
          path="/admin"
          element={user?.role === "Admin" ? <AdminPage /> : <Navigate to="/" />}
        />

        <Route
          path="/reserve/:id"
          element={user ? <ReservationPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/profile"
          element={user ? <ProfilePage /> : <Navigate to="/login" />}
        />

        <Route path="/training" element={<TrainingPage />} />
        
      </Routes>
    </Router>
  );
}

export default App;
