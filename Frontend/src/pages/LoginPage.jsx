import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Paper,
} from "@mui/material";
import PrintIcon from "@mui/icons-material/Print";

const LoginPage = () => {
  // Formdaki verileri tutacağımız state'ler
  const [studentNumber, setStudentNumber] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Context'ten giriş yapma fonksiyonunu ve yönlendirme aracını alıyoruz
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault(); // Sayfanın yenilenmesini engeller
    setError("");
    setLoading(true);

    try {
      // Backend'e giriş isteği atıyoruz
      const response = await api.post("/auth/login", {
        studentNumber,
        password,
      });

      // Başarılı olursa token'ı context'e kaydedip anasayfaya yönlendiriyoruz
      login(response.data.token);
      navigate("/");
    } catch (err) {
      // Hata varsa (yanlış şifre vb.) C#'tan gelen hata mesajını ekrana yazdırıyoruz
      setError(
        err.response?.data?.message ||
          "Giriş yapılamadı. Lütfen tekrar deneyin.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xs">
      <Box
        sx={{
          mt: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {/* Yuvarlak şık bir Logo ve Başlık alanı */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            mb: 3,
            color: "primary.main",
          }}
        >
          <PrintIcon sx={{ fontSize: 40, mr: 1 }} />
          <Typography component="h1" variant="h4" fontWeight="bold">
            MakerReserve
          </Typography>
        </Box>

        <Paper
          elevation={4}
          sx={{ padding: 4, width: "100%", borderRadius: 3 }}
        >
          <Typography
            component="h2"
            variant="h5"
            align="center"
            gutterBottom
            fontWeight="medium"
          >
            Giriş Yap
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              margin="normal"
              required
              fullWidth
              label="E-posta Adresiniz veya Öğrenci Numaranız"
              name="studentNumber"
              autoFocus
              value={studentNumber}
              onChange={(e) => setStudentNumber(e.target.value)}
              placeholder="örn: ********@gmail.com veya 123456789"
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Şifre"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              sx={{ mt: 3, mb: 2, py: 1.5, borderRadius: 2 }}
              disabled={loading}
            >
              {loading ? "Giriş Yapılıyor..." : "Giriş Yap"}
            </Button>

            {/* Kayıt sayfasına geçiş butonu/linki */}
            <Box textAlign="center" mt={2}>
              <Typography variant="body2" color="text.secondary">
                Hesabınız yok mu?{" "}
                <Link
                  to="/register"
                  style={{
                    color: "#1976d2",
                    textDecoration: "none",
                    fontWeight: "bold",
                  }}
                >
                  Hemen Kayıt Olun
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default LoginPage;
