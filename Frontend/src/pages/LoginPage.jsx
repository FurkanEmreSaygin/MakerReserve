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
  Paper,
  Alert,
} from "@mui/material";
import PrintIcon from "@mui/icons-material/Print";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  // Normal Giriş State'leri
  const [formData, setFormData] = useState({ studentNumber: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Doğrulama Ekranı State'leri
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [verifyLoading, setVerifyLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- GİRİŞ YAPMA İŞLEMİ ---
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/auth/login", formData);
      login(res.data.token);
      navigate("/");
    } catch (err) {
      const errorMessage = err.response?.data?.message;

      // EĞER BACKEND BİZE "UNVERIFIED_USER" DÖNDÜYSE
      if (errorMessage === "UNVERIFIED_USER") {
        setError(""); // Hatayı temizle
        setSuccess(
          "Hesabınız doğrulanmamış. E-posta adresinize YENİ bir kod gönderdik!",
        );
        setIsVerifying(true); // Ekranı doğrulama moduna geçir
      } else {
        // Normal bir hataysa (Şifre yanlış vs.) ekrana yazdır
        setError(errorMessage || "Giriş başarısız.");
      }
    } finally {
      setLoading(false);
    }
  };

  // --- KODU DOĞRULAMA İŞLEMİ ---
  const handleVerify = async (e) => {
    e.preventDefault();
    setVerifyLoading(true);
    setError("");
    try {
      // Backend'e kodu gönderiyoruz
      await api.post("/auth/verify-email", {
        studentNumber: formData.studentNumber, // Giriş yaparken yazdığı Öğrenci No veya E-posta
        code: verificationCode,
      });

      alert("Hesabınız başarıyla doğrulandı! Şimdi giriş yapabilirsiniz.");

      // Başarılı olunca normal giriş ekranına geri döndür (şifresini tekrar girip girsin)
      setIsVerifying(false);
      setSuccess("Lütfen giriş yapınız.");
      setVerificationCode("");
    } catch (err) {
      setError(err.response?.data?.message || "Doğrulama kodu hatalı.");
    } finally {
      setVerifyLoading(false);
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
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            mb: 3,
            color: "primary.main",
          }}
        >
          <PrintIcon sx={{ fontSize: 40, mr: 1 }} />
          <Typography variant="h4" fontWeight="bold">
            MakerReserve
          </Typography>
        </Box>

        <Paper elevation={4} sx={{ p: 4, width: "100%", borderRadius: 3 }}>
          {/* EĞER DOĞRULAMA EKRANINDA DEĞİLSEK NORMAL GİRİŞ FORMUNU GÖSTER */}
          {!isVerifying ? (
            <>
              <Typography
                variant="h5"
                align="center"
                gutterBottom
                fontWeight="bold"
              >
                Giriş Yap
              </Typography>

              {success && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  {success}
                </Alert>
              )}
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              <Box component="form" onSubmit={handleLogin}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  label="Öğrenci Numarası veya E-posta"
                  name="studentNumber"
                  autoFocus
                  value={formData.studentNumber}
                  onChange={handleChange}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Şifre"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{ mt: 3, mb: 2, py: 1.5, borderRadius: 2 }}
                >
                  {loading ? "Giriş Yapılıyor..." : "Giriş Yap"}
                </Button>

                <Typography align="center" variant="body2">
                  Hesabınız yok mu?{" "}
                  <Link
                    to="/register"
                    style={{ textDecoration: "none", fontWeight: "bold" }}
                  >
                    Kayıt Olun
                  </Link>
                </Typography>
              </Box>
            </>
          ) : (
            // EĞER "UNVERIFIED_USER" YAKALANDIYSA DOĞRULAMA EKRANINI GÖSTER
            <>
              <Typography
                variant="h5"
                align="center"
                gutterBottom
                fontWeight="bold"
                color="primary"
              >
                Hesabı Doğrula
              </Typography>

              {success && (
                <Alert severity="success" sx={{ mb: 3 }}>
                  {success}
                </Alert>
              )}
              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}

              <Typography variant="body2" align="center" sx={{ mb: 3 }}>
                Girdiğiniz bilgilere ait e-posta adresine 6 haneli yeni bir kod
                gönderdik. Lütfen aşağıya giriniz.
              </Typography>

              <Box component="form" onSubmit={handleVerify}>
                <TextField
                  required
                  fullWidth
                  label="6 Haneli Kodu Girin"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  inputProps={{
                    maxLength: 6,
                    style: {
                      textAlign: "center",
                      fontSize: "24px",
                      letterSpacing: "8px",
                      fontWeight: "bold",
                    },
                  }}
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="success"
                  size="large"
                  sx={{ mt: 4, mb: 2, py: 1.5, borderRadius: 2 }}
                  disabled={verifyLoading || verificationCode.length !== 6}
                >
                  {verifyLoading ? "DOĞRULANIYOR..." : "HESABIMI DOĞRULA"}
                </Button>

                <Button
                  fullWidth
                  variant="text"
                  onClick={() => setIsVerifying(false)}
                >
                  Giriş Ekranına Dön
                </Button>
              </Box>
            </>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default LoginPage;
