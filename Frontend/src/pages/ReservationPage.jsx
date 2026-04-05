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
  IconButton,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import QueryBuilderIcon from "@mui/icons-material/QueryBuilder";

const getInitialWorkingDay = () => {
  const today = new Date();
  if (today.getDay() === 6) today.setDate(today.getDate() + 2);
  if (today.getDay() === 0) today.setDate(today.getDate() + 1);
  return today;
};

const ReservationPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [machine, setMachine] = useState(null);
  const [filaments, setFilaments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(getInitialWorkingDay());
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedFilament, setSelectedFilament] = useState("");
  const [duration, setDuration] = useState("");
  const [filamentUsage, setFilamentUsage] = useState("");
  const [dailyReservations, setDailyReservations] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);

  const [maxQuota, setMaxQuota] = useState(480);
  const [remainingQuota, setRemainingQuota] = useState(480);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const maxAllowedDate = new Date();
  maxAllowedDate.setDate(maxAllowedDate.getDate() + 14);

  // YENİ: Öğrencinin Sınıfını Token'dan Alıyoruz
  let userGrade = 0;
  const token = localStorage.getItem("token");
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      userGrade = parseInt(payload.Grade || 0);
    } catch (e) {
      console.error("Token okuma hatası");
    }
  }

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [machineRes, filamentRes, myRes, settingsRes] = await Promise.all(
          [
            api.get("/machine/active"),
            api.get("/filament"),
            api.get("/reservation/my-reservations"),
            api.get("/settings"),
          ],
        );

        const foundMachine = machineRes.data.find((m) => m.id === parseInt(id));
        if (foundMachine) setMachine(foundMachine);
        else setError("Makine bulunamadı.");

        setFilaments(filamentRes.data);

        const fetchedMaxQuota = settingsRes.data.maxActiveReservationMinutes;
        setMaxQuota(fetchedMaxQuota);

        const now = new Date();
        const activeMinutesUsed = myRes.data
          .filter((r) => new Date(r.endTime) > now && r.status !== "Cancelled")
          .reduce(
            (total, r) =>
              total + (new Date(r.endTime) - new Date(r.startTime)) / 60000,
            0,
          );

        setRemainingQuota(fetchedMaxQuota - activeMinutesUsed);
      } catch (err) {
        setError("Veriler yüklenirken bir sorun oluştu.");
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, [id]);

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
      } catch (err) {}
    };
    if (machine) fetchDailySchedule();
  }, [selectedDate, machine]);

  // YENİ: Dolu saatlerde ismi (bookedBy) alıyoruz
  const generateTimeSlots = (reservations) => {
    const slots = [];
    let currentTime = new Date(selectedDate);
    currentTime.setHours(10, 0, 0, 0);
    const endTime = new Date(selectedDate);
    endTime.setHours(17, 0, 0, 0);

    while (currentTime < endTime) {
      const slotTimeText = format(currentTime, "HH:mm");
      let isFull = false;
      let bookedBy = "";

      for (let res of reservations) {
        const resStart = new Date(res.startTime);
        const resEnd = new Date(res.endTime);
        if (currentTime >= resStart && currentTime < resEnd) {
          isFull = true;
          bookedBy = res.userName; // Backend'den gelen isim (veya Dolu yazısı)
          break;
        }
      }
      slots.push({ time: slotTimeText, isFull, bookedBy });
      currentTime.setMinutes(currentTime.getMinutes() + 30);
    }
    setTimeSlots(slots);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setSelectedSlot(null);
  };

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
      setTimeout(() => navigate("/profile"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Hata oluştu.");
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

        <Paper
          elevation={3}
          sx={{
            p: 3,
            mb: 4,
            borderRadius: 3,
            display: "flex",
            flexWrap: "wrap",
            gap: 4,
          }}
        >
          <Box flex={1}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              1. Tarih Seçin
            </Typography>
            <Calendar
              onChange={handleDateChange}
              value={selectedDate}
              minDate={new Date()}
              maxDate={maxAllowedDate}
              tileDisabled={({ date }) =>
                date.getDay() === 0 || date.getDay() === 6
              }
            />
          </Box>
          <Box flex={2}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              2. Saat Seçimi (
              {format(selectedDate, "d MMMM yyyy", { locale: tr })})
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
                    }}
                  >
                    <Typography
                      variant="body1"
                      fontWeight="bold"
                      color={
                        slot.isFull
                          ? "#d32f2f"
                          : selectedSlot === slot.time
                            ? "primary.contrastText"
                            : "text.primary"
                      }
                    >
                      {slot.time}
                    </Typography>

                    {/* YENİ: Doluysa kişiyi göster */}
                    <Typography
                      variant="caption"
                      color={slot.isFull ? "#d32f2f" : "inherit"}
                    >
                      {slot.isFull ? `(${slot.bookedBy})` : "Boş"}
                    </Typography>
                  </Card>
                </Grid>
              ))}
            </Grid>

            <Typography variant="h6" fontWeight="bold" gutterBottom>
              3. Baskı Detayları
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
                      <InputAdornment position="end">Dk</InputAdornment>
                    ),
                  }}
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
                      <InputAdornment position="end">Gr</InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>

            <Typography variant="h6" fontWeight="bold" gutterBottom>
              4. Filament Seçimi (Sınıf:{" "}
              {userGrade === 0 ? "Hazırlık" : userGrade + ". Sınıf"})
            </Typography>
            <FormControl fullWidth sx={{ mb: 4 }}>
              <InputLabel>Renk/Malzeme Seçin</InputLabel>
              <Select
                value={selectedFilament}
                label="Renk/Malzeme Seçin"
                onChange={(e) => setSelectedFilament(e.target.value)}
              >
                {/* YENİ: Sadece Kendi Sınıfının Filamentlerini Göster */}
                {filaments.filter((f) => f.targetGrade === userGrade).length ===
                0 ? (
                  <MenuItem disabled>
                    Sınıfınıza uygun filament bulunmamaktadır.
                  </MenuItem>
                ) : (
                  filaments
                    .filter((f) => f.targetGrade === userGrade)
                    .map((f) => (
                      <MenuItem
                        key={f.id}
                        value={f.id}
                        disabled={
                          f.currentWeight < parseInt(filamentUsage || 0)
                        }
                      >
                        <b>{f.name}</b> &nbsp;-&nbsp; {f.code} &nbsp; (
                        {f.currentWeight} gr kaldı)
                      </MenuItem>
                    ))
                )}
              </Select>
            </FormControl>

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
          </Box>
        </Paper>
      </Container>
    </>
  );
};

export default ReservationPage;
