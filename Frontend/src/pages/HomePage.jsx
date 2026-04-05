import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../services/api";
import YouTube from "react-youtube"; // YENİ: Kütüphaneyi ekledik
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  CircularProgress,
  Alert,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";

const HomePage = () => {
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // EĞİTİM VİDEOSU İÇİN STATE'LER
  const [showTraining, setShowTraining] = useState(false);
  const [trainingLoading, setTrainingLoading] = useState(false);
  const [isVideoWatched, setIsVideoWatched] = useState(false); // YENİ: Videonun bitip bitmediğini tutar

  const navigate = useNavigate();

  useEffect(() => {
    // 1. KULLANICI EĞİTİMİ TAMAMLAMIŞ MI KONTROL ET
    const checkTrainingStatus = () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split(".")[1]));
          if (payload.HasCompletedTraining === "False") {
            setShowTraining(true);
          }
        } catch (e) {
          console.error("Token okunamadı", e);
        }
      }
    };

    // 2. MAKİNELERİ ÇEK
    const fetchActiveMachines = async () => {
      try {
        const response = await api.get("/machine/active");
        setMachines(response.data);
      } catch (err) {
        setError("Makineler yüklenirken bir sorun oluştu.");
      } finally {
        setLoading(false);
      }
    };

    checkTrainingStatus();
    fetchActiveMachines();
  }, []);

  // --- YOUTUBE VİDEO AYARLARI VE FONKSİYONLARI ---
  const onVideoEnd = () => {
    setIsVideoWatched(true); // Video gerçekten bittiğinde kilidi aç
  };

  const videoOptions = {
    height: "400",
    width: "100%",
    playerVars: {
      autoplay: 0,
      rel: 0, // İlgisiz videoları önermeyi kapatır
      modestbranding: 1, // YouTube logosunu gizler
      controls: 0, // İŞTE SİHİR BU! İlerleme çubuğunu tamamen gizler
      disablekb: 1, // Klavyedeki yön tuşlarıyla ileri sarmayı engeller
      fs: 0, // Tam ekran modunu kapatır (Modal dışına çıkmasınlar diye)
    },
  };

  // EĞİTİMİ TAMAMLA BUTONUNA BASILINCA
  const handleCompleteTraining = async () => {
    setTrainingLoading(true);
    try {
      const res = await api.post("/auth/complete-training");
      localStorage.setItem("token", res.data.token);
      setShowTraining(false);
      window.location.reload();
    } catch (err) {
      alert("Eğitim tamamlanırken bir hata oluştu.");
      setTrainingLoading(false);
    }
  };

  const handleOpenReservation = (machine) => {
    navigate(`/reserve/${machine.id}`);
  };

  return (
    <>
      <Navbar />
      <Container maxWidth="xl" sx={{ mt: 4, mb: 8 }}>
        <Box sx={{ textAlign: "center", mb: 6 }}>
          <Typography
            variant="h3"
            fontWeight="bold"
            color="primary"
            gutterBottom
          >
            Laboratuvara Hoş Geldin
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Projeni hayata geçirmek için aşağıdaki aktif 3D yazıcılardan birini
            seç ve randevunu al.
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
            <CircularProgress size={60} />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {machines.length === 0 ? (
              <Grid item xs={12}>
                <Alert severity="info">
                  Şu anda kullanıma açık bir makine bulunmuyor.
                </Alert>
              </Grid>
            ) : (
              machines.map((machine) => (
                <Grid item key={machine.id} xs={12} sm={6} md={4} lg={3}>
                  <Card
                    elevation={3}
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      borderRadius: 3,
                      transition: "transform 0.2s",
                      "&:hover": { transform: "scale(1.02)" },
                    }}
                  >
                    <CardMedia
                      component="img"
                      height="200"
                      image={
                        machine.machinePhoto ||
                        "https://via.placeholder.com/400x200?text=Fotograf+Yok"
                      }
                      alt={machine.name}
                      sx={{ objectFit: "cover" }}
                    />
                    <CardContent sx={{ flexGrow: 1, p: 2 }}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          mb: 1,
                        }}
                      >
                        <Typography
                          gutterBottom
                          variant="h6"
                          component="h2"
                          fontWeight="bold"
                          sx={{ m: 0 }}
                        >
                          {machine.name}
                        </Typography>
                        <Chip
                          label="Aktif"
                          color="success"
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        Hemen uygun saatleri kontrol edip yerini ayırtabilirsin.
                      </Typography>
                    </CardContent>

                    <CardActions sx={{ p: 2, pt: 0 }}>
                      <Button
                        fullWidth
                        variant="contained"
                        color="primary"
                        startIcon={<CalendarMonthIcon />}
                        onClick={() => handleOpenReservation(machine)}
                        sx={{ borderRadius: 2 }}
                      >
                        RANDEVU AL
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))
            )}
          </Grid>
        )}
      </Container>

      {/* ==================== EĞİTİM VİDEOSU MODALI ==================== */}
      <Dialog
        open={showTraining}
        disableEscapeKeyDown // ESC tuşu ile kapatmayı engeller
        maxWidth="md"
        fullWidth
      >
        <DialogTitle
          sx={{ fontWeight: "bold", color: "#d32f2f", textAlign: "center" }}
        >
          ⚠️ Zorunlu İş Güvenliği ve Kullanım Eğitimi
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 3, textAlign: "center" }}>
            Laboratuvardaki 3D yazıcıları kullanabilmek ve randevu alabilmek
            için aşağıdaki eğitim videosunu <b>sonuna kadar</b> izlemeniz ve
            kuralları kabul etmeniz gerekmektedir. (Not: Videoyu ileri
            saramazsınız).
          </Typography>

          <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
            <YouTube
              videoId="59xZGr05_TY"
              opts={videoOptions}
              onEnd={onVideoEnd}
              style={{
                width: "100%",
                borderRadius: "8px",
                overflow: "hidden",
                border: "2px solid #eee",
              }}
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3, justifyContent: "center" }}>
          <Button
            variant="contained"
            color={isVideoWatched ? "success" : "inherit"} // İzlenmediyse gri durur
            size="large"
            startIcon={<VerifiedUserIcon />}
            onClick={handleCompleteTraining}
            disabled={!isVideoWatched || trainingLoading} // İzlenmediyse buton KİLİTLİ
            sx={{ px: 4, py: 1.5, borderRadius: 2 }}
          >
            {trainingLoading
              ? "Onaylanıyor..."
              : !isVideoWatched
                ? "LÜTFEN VİDEOYU SONUNA KADAR İZLEYİN"
                : "VİDEOYU İZLEDİM VE KURALLARI KABUL EDİYORUM"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default HomePage;
