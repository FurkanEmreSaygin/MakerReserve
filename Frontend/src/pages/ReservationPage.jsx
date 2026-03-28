import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../services/api";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Divider,
  CircularProgress,
  Alert,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Card,
  TextField,
  InputAdornment,
  IconButton, // Yukarı taşıdık
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import QueryBuilderIcon from "@mui/icons-material/QueryBuilder";

// İLK YÜKLEMEDE HAFTA SONUNU ATLAYAN FONKSİYON
const getInitialWorkingDay = () => {
  const today = new Date();
  if (today.getDay() === 6) today.setDate(today.getDate() + 2); // Cmt -> Pzt
  if (today.getDay() === 0) today.setDate(today.getDate() + 1); // Pzr -> Pzt
  return today;
};

const ReservationPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // STATELER
  const [machine, setMachine] = useState(null);
  const [filaments, setFilaments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(getInitialWorkingDay());
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedFilament, setSelectedFilament] = useState("");

  const [duration, setDuration] = useState("");
  const [filamentUsage, setFilamentUsage] = useState("");

  const [dailyReservations, setDailyReservations] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);

  // DİNAMİK KOTA STATELERİ
  const [maxQuota, setMaxQuota] = useState(480); // Varsayılanı 480 tutuyoruz ama DB'den ezilecek
  const [remainingQuota, setRemainingQuota] = useState(480);

  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const maxAllowedDate = new Date();
  maxAllowedDate.setDate(maxAllowedDate.getDate() + 14);

  // 1. İLK YÜKLEME: Makine, Filament, Randevular VE Ayarları Getir
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Ayarları da Promise.all içine ekledik
        const [machineRes, filamentRes, myRes, settingsRes] = await Promise.all(
          [
            api.get("/machine/active"),
            api.get("/filament"),
            api.get("/reservation/my-reservations"),
            api.get("/settings"), // YENİ: Dinamik limitimizi çekiyoruz
          ],
        );

        const foundMachine = machineRes.data.find((m) => m.id === parseInt(id));
        if (foundMachine) setMachine(foundMachine);
        else setError("Makine bulunamadı.");

        setFilaments(filamentRes.data);

        // Dinamik Kotayı Ayarla
        const fetchedMaxQuota = settingsRes.data.maxActiveReservationMinutes;
        setMaxQuota(fetchedMaxQuota);

        // Kullanılan Kotayı Hesapla
        const now = new Date();
        const activeMinutesUsed = myRes.data
          .filter((r) => new Date(r.endTime) > now && r.status !== "Cancelled")
          .reduce((total, r) => {
            const start = new Date(r.startTime);
            const end = new Date(r.endTime);
            return total + (end - start) / 60000;
          }, 0);

        // Kalan Kotayı Dinamik Limitten Çıkararak Bul
        setRemainingQuota(fetchedMaxQuota - activeMinutesUsed);
      } catch (err) {
        setError("Veriler yüklenirken bir sorun oluştu.");
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, [id]);

  // 2. TARİH DEĞİŞTİKÇE
  useEffect(() => {
    const fetchDailySchedule = async () => {
      try {
        const dateString = format(selectedDate, "yyyy-MM-dd");
        const res = await api.get(`/reservation/daily/${dateString}`);
        const machineReservations = res.data.filter(
          (r) => r.machineName === machine?.name && r.status !== "Cancelled",
        );
        setDailyReservations(machineReservations);
        generateTimeSlots(machineReservations);
      } catch (err) {
        console.error("Günlük plan çekilemedi:", err);
      }
    };

    if (machine) fetchDailySchedule();
  }, [selectedDate, machine]);

  // SAAT ÜRETİCİ
  const generateTimeSlots = (reservations) => {
    const slots = [];
    let currentTime = new Date(selectedDate);
    currentTime.setHours(10, 0, 0, 0);
    const endTime = new Date(selectedDate);
    endTime.setHours(17, 0, 0, 0);

    while (currentTime < endTime) {
      const slotTimeText = format(currentTime, "HH:mm");
      let isFull = false;
      for (let res of reservations) {
        const resStart = new Date(res.startTime);
        const resEnd = new Date(res.endTime);
        if (currentTime >= resStart && currentTime < resEnd) {
          isFull = true;
          break;
        }
      }
      slots.push({ time: slotTimeText, isFull });
      currentTime.setMinutes(currentTime.getMinutes() + 30);
    }
    setTimeSlots(slots);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setSelectedSlot(null);
  };

  // RANDEVUYU BACKEND'E GÖNDERME
  const handleSubmitReservation = async () => {
    setSubmitLoading(true);
    setError("");
    setSuccess("");

    try {
      const [hours, minutes] = selectedSlot.split(":");
      const startDateTime = new Date(selectedDate);
      startDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      const offset = startDateTime.getTimezoneOffset() * 60000;
      const localISOTime = new Date(startDateTime.getTime() - offset)
        .toISOString()
        .slice(0, -1);

      await api.post("/reservation", {
        machineId: machine.id,
        filamentId: selectedFilament,
        startTime: localISOTime,
        estimatedDurationInMinutes: parseInt(duration),
        expectedFilamentUsage: parseInt(filamentUsage),
        printType: "Student Project",
      });

      setSuccess("Randevunuz başarıyla oluşturuldu! Yönlendiriliyorsunuz...");

      setTimeout(() => {
        navigate("/profile");
      }, 2000);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Randevu alınırken bir hata oluştu. Lütfen saati kontrol edin.",
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading)
    return (
      <Box textAlign="center" mt={10}>
        <CircularProgress />
      </Box>
    );

  // Dinamik Kota Saat/Dakika Hesaplamaları
  const maxHours = Math.floor(maxQuota / 60);
  const remainingHours = Math.floor(remainingQuota / 60);
  const remainingMins = Math.round(remainingQuota % 60);

  return (
    <>
      <Navbar />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 4, gap: 2 }}>
          <IconButton
            onClick={() => navigate("/")}
            color="primary"
            sx={{ border: "1px solid", borderColor: "divider" }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" fontWeight="bold">
            Randevu Al
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        {/* DİNAMİK KOTA GÖSTERGESİ */}
        <Alert
          severity={remainingQuota <= 60 ? "warning" : "info"}
          sx={{ mb: 4, fontSize: "1.1rem", alignItems: "center" }}
        >
          Aynı anda alabileceğiniz maksimum aktif baskı süresi:{" "}
          <b>
            {maxHours} Saat ({maxQuota} dk)
          </b>
          . Şu an kullanılabilir hakkınız:{" "}
          <b style={{ fontSize: "1.2rem", color: "#d32f2f" }}>
            {remainingHours} Saat {remainingMins} Dakika
          </b>
        </Alert>

        <Paper
          elevation={2}
          sx={{
            p: 2,
            mb: 4,
            borderRadius: 3,
            backgroundColor: "#fcfcfc",
            border: "1px solid #eee",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <img
              src={machine.machinePhoto || "https://via.placeholder.com/80"}
              alt={machine.name}
              style={{
                width: 60,
                height: 60,
                objectFit: "cover",
                borderRadius: 8,
              }}
            />
            <Box>
              <Typography variant="h6" fontWeight="bold">
                {machine.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Randevu işlemi aşağıdan tamamlanacak.
              </Typography>
            </Box>
          </Box>
        </Paper>

        <Box
          sx={{
            display: "flex",
            gap: 3,
            flexWrap: { xs: "wrap", md: "nowrap" },
          }}
        >
          <Paper
            elevation={3}
            sx={{
              p: 3,
              borderRadius: 3,
              flex: "0 1 auto",
              maxWidth: { md: "360px" },
              maxHeight: "420px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Typography
              variant="h6"
              fontWeight="bold"
              gutterBottom
              sx={{ alignSelf: "flex-start" }}
            >
              Tarih Seçin
            </Typography>
            <Calendar
              onChange={handleDateChange}
              value={selectedDate}
              minDate={new Date()}
              maxDate={maxAllowedDate}
              tileDisabled={({ date }) =>
                date.getDay() === 0 || date.getDay() === 6
              }
              className="custom-calendar"
            />
          </Paper>

          <Paper elevation={3} sx={{ p: 3, borderRadius: 3, flex: "1 1 auto" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <QueryBuilderIcon color="primary" />
              <Typography variant="h6" fontWeight="bold">
                {format(selectedDate, "d MMMM yyyy, EEEE", { locale: tr })}
              </Typography>
            </Box>

            <Divider sx={{ mb: 3 }} />

            <Typography variant="body1" fontWeight="medium" gutterBottom>
              1. Uygun Saatler (Başlangıç Saati)
            </Typography>
            <Grid container spacing={1} sx={{ mb: 4 }}>
              {timeSlots.map((slot) => (
                <Grid item xs={4} sm={3} md={2} key={slot.time}>
                  <Card
                    elevation={0}
                    onClick={() => !slot.isFull && setSelectedSlot(slot.time)}
                    sx={{
                      p: 1.5,
                      textAlign: "center",
                      borderRadius: 2,
                      cursor: slot.isFull ? "not-allowed" : "pointer",
                      border: "1px solid",
                      borderColor: slot.isFull
                        ? "#ffcccc"
                        : selectedSlot === slot.time
                          ? "primary.main"
                          : "#e0e0e0",
                      backgroundColor: slot.isFull
                        ? "#ffebee"
                        : selectedSlot === slot.time
                          ? "primary.light"
                          : "#f9f9f9",
                      color: slot.isFull
                        ? "#d32f2f"
                        : selectedSlot === slot.time
                          ? "primary.contrastText"
                          : "text.primary",
                      transition: "0.2s",
                      "&:hover": {
                        backgroundColor: slot.isFull
                          ? "#ffebee"
                          : selectedSlot === slot.time
                            ? "primary.light"
                            : "#f0f0f0",
                      },
                    }}
                  >
                    <Typography variant="body1" fontWeight="bold">
                      {slot.time}
                    </Typography>
                    <Typography variant="caption">
                      {slot.isFull ? "Dolu" : "Boş"}
                    </Typography>
                  </Card>
                </Grid>
              ))}
            </Grid>

            <Typography variant="body1" fontWeight="medium" gutterBottom>
              2. Baskı Detayları
            </Typography>
            <Grid container spacing={2} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  type="number"
                  label="Tahmini Süre"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">Dakika</InputAdornment>
                    ),
                  }}
                  helperText="Sistem otomatik olarak 30 dakikalık bloklara yuvarlayacaktır."
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  type="number"
                  label="Kullanılacak Filament"
                  value={filamentUsage}
                  onChange={(e) => setFilamentUsage(e.target.value)}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">Gram</InputAdornment>
                    ),
                  }}
                  helperText="Dilimleyici (Slicer) programında yazan tahmini gramajı giriniz."
                />
              </Grid>
            </Grid>

            <Typography variant="body1" fontWeight="medium" gutterBottom>
              3. Filament Seçimi
            </Typography>
            <FormControl fullWidth sx={{ mb: 4 }}>
              <InputLabel id="filament-select-label">
                Renk/Malzeme Seçin
              </InputLabel>
              <Select
                labelId="filament-select-label"
                value={selectedFilament}
                label="Renk/Malzeme Seçin"
                onChange={(e) => setSelectedFilament(e.target.value)}
              >
                {filaments.length === 0 ? (
                  <MenuItem disabled>Henüz filament eklenmemiş</MenuItem>
                ) : (
                  filaments.map((f) => (
                    <MenuItem
                      key={f.id}
                      value={f.id}
                      disabled={f.currentWeight < parseInt(filamentUsage || 0)}
                    >
                      <b>{f.name}</b> &nbsp;-&nbsp; {f.code} &nbsp; (
                      {f.currentWeight} gr kaldı)
                      {f.currentWeight < parseInt(filamentUsage || 0) &&
                        " (Yetersiz)"}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>

            <Divider sx={{ mb: 3 }} />

            <Button
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              onClick={handleSubmitReservation}
              disabled={
                !selectedSlot ||
                !selectedFilament ||
                !duration ||
                !filamentUsage ||
                submitLoading ||
                success
              }
              sx={{ borderRadius: 2, py: 1.5 }}
            >
              {submitLoading ? "Randevu İşleniyor..." : "Randevuyu Tamamla"}
            </Button>
          </Paper>
        </Box>
      </Container>
    </>
  );
};

export default ReservationPage;
