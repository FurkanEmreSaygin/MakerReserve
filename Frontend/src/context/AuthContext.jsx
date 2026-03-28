import { createContext, useState, useEffect } from "react";

import { jwtDecode } from "jwt-decode"; 

// 1. Context'imizi oluşturuyoruz
// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext();

// 2. Uygulamamızı sarmalayacak Provider bileşeni
export const AuthProvider = ({ children }) => {
  // Kullanıcı bilgisini ve token'ı state'te tutuyoruz
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(true); // Sayfa yenilendiğinde bekletmek için

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);

        // Token'ın süresi dolmuş mu kontrolü
        const currentTime = Date.now() / 1000;
        if (decoded.exp < currentTime) {
          logout(); // Süre dolduysa çıkış yap
        } else {
          // .NET'in uzun claim isimlerini değişkenlere atayalım
          const roleClaim =
            "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";
          const nameClaim =
            "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name";

          setUser({
            id: decoded.sub || decoded.nameid,
            // Eğer uzun isim varsa onu al, yoksa kısa name'i al
            name: decoded[nameClaim] || decoded.unique_name || decoded.name,
            // Eğer uzun role varsa onu al, yoksa kısa role'ü al, o da yoksa Student yap
            role: decoded[roleClaim] || decoded.role || "Student",
            studentNumber: decoded.StudentNumber,
          });
        }
      } catch (error) {
        console.error("Token çözülemedi:", error);
        logout();
      }
    }
    setLoading(false);
  }, [token]);

  // Giriş yapma fonksiyonu (Login sayfasında çağıracağız)
  const login = (newToken) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
  };

  // Çıkış yapma fonksiyonu (Navbar'da çağıracağız)
  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  // Alt bileşenler
  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {!loading && children} 
    </AuthContext.Provider>
  );
};