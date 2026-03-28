import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  Grid,
} from "@mui/material";
import PrintIcon from "@mui/icons-material/Print";

const RegisterPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    studentNumber: "",
    phoneNumber: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [verifyLoading, setVerifyLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/auth/register", formData);
      setSuccess(
        res.data.message ||
          "Kayıt başarılı! Lütfen mailinize gelen kodu giriniz.",
      );
      setIsVerifying(true);
    } catch (err) {
      setError(err.response?.data?.message || "Kayıt olurken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setVerifyLoading(true);
    setError("");
    try {
      await api.post("/auth/verify-email", {
        studentNumber: formData.studentNumber,
        code: verificationCode,
      });
      alert("E-postanız başarıyla doğrulandı! Şimdi giriş yapabilirsiniz.");
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Doğrulama kodu hatalı.");
    } finally {
      setVerifyLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
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
          {!isVerifying ? (
            <>
              <Typography
                variant="h5"
                align="center"
                gutterBottom
                fontWeight="bold"
              >
                Yeni Hesap Oluştur
              </Typography>

              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}

              <Box component="form" onSubmit={handleRegister}>
                <Grid container spacing={2}>
                  {/* 1. SATIR: Ad ve Soyad (xs={6}) */}
                  <Grid item xs={6}>
                    <TextField
                      name="firstName"
                      required
                      fullWidth
                      label="Ad"
                      autoFocus
                      value={formData.firstName}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      name="lastName"
                      required
                      fullWidth
                      label="Soyad"
                      value={formData.lastName}
                      onChange={handleChange}
                    />
                  </Grid>

                  {/* 2. SATIR: Öğrenci No ve Telefon (xs={6}) */}
                  <Grid item xs={6}>
                    <TextField
                      name="studentNumber"
                      required
                      fullWidth
                      label="Öğrenci Numarası"
                      value={formData.studentNumber}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      name="phoneNumber"
                      fullWidth
                      label="Telefon Numarası"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                    />
                  </Grid>

                  {/* 3. SATIR: E-posta ve Şifre (xs={6}) */}
                  <Grid item xs={6}>
                    <TextField
                      name="email"
                      required
                      fullWidth
                      label="E-posta Adresi"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      helperText="Doğrulama kodu bu adrese gönderilir."
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      name="password"
                      required
                      fullWidth
                      label="Şifre (En az 8 karakter)"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                    />
                  </Grid>
                </Grid>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  sx={{ mt: 4, mb: 2, py: 1.5, borderRadius: 2 }}
                  disabled={loading}
                >
                  {loading
                    ? "KAYDEDİLİYOR VE MAİL GÖNDERİLİYOR..."
                    : "KAYIT OL"}
                </Button>

                <Typography align="center" variant="body2">
                  Zaten bir hesabınız var mı?{" "}
                  <Link
                    to="/login"
                    style={{ textDecoration: "none", fontWeight: "bold" }}
                  >
                    Giriş Yapın
                  </Link>
                </Typography>
              </Box>
            </>
          ) : (
            <>
              <Typography
                variant="h5"
                align="center"
                gutterBottom
                fontWeight="bold"
                color="primary"
              >
                E-posta Doğrulama
              </Typography>

              <Alert severity="success" sx={{ mb: 3 }}>
                {success}
              </Alert>
              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}

              <Typography variant="body1" align="center" sx={{ mb: 4 }}>
                <b>{formData.email}</b> adresine gönderdiğimiz 6 haneli
                doğrulama kodunu aşağıya giriniz.
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
                  sx={{ mt: 4, py: 1.5, borderRadius: 2 }}
                  disabled={verifyLoading || verificationCode.length !== 6}
                >
                  {verifyLoading ? "DOĞRULANIYOR..." : "HESABIMI DOĞRULA"}
                </Button>
              </Box>
            </>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default RegisterPage;
