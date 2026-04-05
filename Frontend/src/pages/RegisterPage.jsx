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
  Checkbox,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  MenuItem, // HATA BURADAYDI, EKLENDİ!
} from "@mui/material";
import PrintIcon from "@mui/icons-material/Print";
import CloseIcon from "@mui/icons-material/Close";

const RegisterPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    studentNumber: "",
    phoneNumber: "",
    email: "",
    password: "",
    grade: "", // SINIF BİLGİSİ
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [verifyLoading, setVerifyLoading] = useState(false);

  // --- KVKK İÇİN YENİ STATE'LER ---
  const [kvkkAccepted, setKvkkAccepted] = useState(false);
  const [kvkkModalOpen, setKvkkModalOpen] = useState(false);

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
                  <Grid item xs={12} sm={6}>
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
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="lastName"
                      required
                      fullWidth
                      label="Soyad"
                      value={formData.lastName}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="studentNumber"
                      required
                      fullWidth
                      label="Öğrenci Numarası"
                      value={formData.studentNumber}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="phoneNumber"
                      fullWidth
                      label="Telefon Numarası"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="email"
                      required
                      fullWidth
                      label="E-posta Adresi"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      helperText="Doğrulama kodu gönderilecektir."
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
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

                  {/* SINIF SEÇİM ALANI */}
                  <Grid item xs={12} sm={12}>
                    <TextField
                      select
                      fullWidth
                      required
                      label="Sınıfınız"
                      name="grade"
                      value={formData.grade}
                      onChange={handleChange}
                      helperText="Filament haklarınız sınıfınıza göre belirlenecektir."
                    >
                      <MenuItem value={0}>Hazırlık</MenuItem>
                      <MenuItem value={1}>1. Sınıf</MenuItem>
                      <MenuItem value={2}>2. Sınıf</MenuItem>
                      <MenuItem value={3}>3. Sınıf</MenuItem>
                      <MenuItem value={4}>4. Sınıf</MenuItem>
                    </TextField>
                  </Grid>
                </Grid>

                {/* --- KVKK ONAY KUTUSU --- */}
                <Box
                  sx={{ mt: 3, mb: 1, display: "flex", alignItems: "center" }}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={kvkkAccepted}
                        onChange={(e) => setKvkkAccepted(e.target.checked)}
                        color="primary"
                      />
                    }
                    label={
                      <Typography variant="body2">
                        <span
                          style={{
                            color: "#1976d2",
                            cursor: "pointer",
                            textDecoration: "underline",
                            fontWeight: "bold",
                          }}
                          onClick={(e) => {
                            e.preventDefault();
                            setKvkkModalOpen(true);
                          }}
                        >
                          KVKK Aydınlatma Metni
                        </span>
                        'ni okudum ve onaylıyorum.
                      </Typography>
                    }
                  />
                </Box>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading || !kvkkAccepted}
                  sx={{ mt: 2, mb: 2, py: 1.5, borderRadius: 2 }}
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
            // DOĞRULAMA KISMI
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

      {/* KVKK MODALI */}
      <Dialog
        open={kvkkModalOpen}
        onClose={() => setKvkkModalOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontWeight: "bold",
          }}
        >
          Kişisel Verilerin İşlenmesine İlişkin Aydınlatma Metni
          <IconButton onClick={() => setKvkkModalOpen(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ backgroundColor: "#fafafa" }}>
          <Typography variant="body2" paragraph>
            <strong>1. Veri Sorumlusunun Kimliği</strong>
            <br />
            MakerReserve 3D Laboratuvar Randevu Sistemi olarak, kişisel
            verilerinizin güvenliğine ve gizliliğine en üst düzeyde önem
            vermekteyiz.
          </Typography>
          <Typography variant="body2" paragraph>
            <strong>2. Kişisel Verilerin İşlenme Amacı</strong>
            <br />
            Sistemimize kayıt olurken paylaştığınız bilgileriniz cihaz
            kullanımlarının takibi amacıyla işlenmektedir.
          </Typography>
          <Typography variant="body2" paragraph>
            <strong>3. Kişisel Verilerin Aktarımı</strong>
            <br />
            Kişisel verileriniz hiçbir üçüncü şahısla paylaşılmamaktadır.
          </Typography>
          <Typography variant="body2" paragraph>
            <strong>4. İlgili Kişinin Hakları</strong>
            <br />
            KVKK'nın 11. maddesi uyarınca silinmesini talep etme hakkına
            sahipsiniz.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setKvkkModalOpen(false)} color="inherit">
            Kapat
          </Button>
          <Button
            onClick={() => {
              setKvkkModalOpen(false);
              setKvkkAccepted(true);
            }}
            variant="contained"
            color="primary"
          >
            OKUDUM VE ONAYLIYORUM
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default RegisterPage;
