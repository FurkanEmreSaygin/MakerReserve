import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import api from "../services/api";
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Chip,
  Button,
} from "@mui/material";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

const ProfilePage = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchMyReservations = async () => {
    try {
      const response = await api.get("/reservation/my-reservations");
      const sortedData = response.data.sort(
        (a, b) => new Date(b.startTime) - new Date(a.startTime),
      );
      setReservations(sortedData);
    } catch (err) {
      setError("Randevularınız çekilirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyReservations();
  }, []);

  // İPTAL ETME FONKSİYONU
  const handleCancel = async (id) => {
    if (
      window.confirm(
        "Bu randevuyu iptal etmek istediğinize emin misiniz? Filament ve zaman kotanız iade edilecektir.",
      )
    ) {
      try {
        await api.put(`/reservation/cancel/${id}`);
        fetchMyReservations(); // İptalden sonra listeyi yenile
      } catch (err) {
        alert(err.response?.data?.message || "İptal işlemi başarısız oldu.");
      }
    }
  };

  const getStatusChip = (status) => {
    switch (status) {
      case "Pending":
        return <Chip label="Bekliyor" color="warning" size="small" />;
      case "Active":
        return <Chip label="Aktif/Baskıda" color="info" size="small" />;
      case "Completed":
        return <Chip label="Tamamlandı" color="success" size="small" />;
      case "Cancelled":
        return <Chip label="İptal Edildi" color="error" size="small" />;
      default:
        return <Chip label={status} size="small" />;
    }
  };

  return (
    <>
      <Navbar />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
        <Typography variant="h4" fontWeight="bold" color="primary" gutterBottom>
          Randevularım
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Geçmiş ve gelecek tüm 3D yazıcı randevularınızı buradan takip
          edebilirsiniz.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box textAlign="center" mt={5}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer
            component={Paper}
            elevation={3}
            sx={{ borderRadius: 3 }}
          >
            <Table>
              <TableHead sx={{ backgroundColor: "#f8f9fa" }}>
                <TableRow>
                  <TableCell>
                    <b>Tarih</b>
                  </TableCell>
                  <TableCell>
                    <b>Saat</b>
                  </TableCell>
                  <TableCell>
                    <b>Makine</b>
                  </TableCell>
                  <TableCell>
                    <b>Filament (Gram)</b>
                  </TableCell>
                  <TableCell align="center">
                    <b>Durum</b>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reservations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                      Henüz hiç randevu almamışsınız.
                    </TableCell>
                  </TableRow>
                ) : (
                  reservations.map((res) => {
                    const isFuture = new Date(res.startTime) > new Date();
                    const canCancel = res.status !== "Cancelled" && isFuture;

                    return (
                      <TableRow key={res.id} hover>
                        <TableCell>
                          {format(new Date(res.startTime), "d MMMM yyyy", {
                            locale: tr,
                          })}
                        </TableCell>
                        <TableCell>
                          {format(new Date(res.startTime), "HH:mm")} -{" "}
                          {format(new Date(res.endTime), "HH:mm")}
                        </TableCell>
                        <TableCell>{res.machineName}</TableCell>
                        <TableCell>
                          {res.filamentName} ({res.expectedFilamentUsage} gr)
                        </TableCell>
                        <TableCell align="center">
                          {getStatusChip(res.status)}

                          {/* İPTAL BUTONU SADECE GELECEKTEKİ RANDEVULARDA ÇIKAR */}
                          {canCancel && (
                            <Button
                              size="small"
                              color="error"
                              variant="outlined"
                              sx={{ ml: 2 }}
                              onClick={() => handleCancel(res.id)}
                            >
                              İPTAL ET
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Container>
    </>
  );
};

export default ProfilePage;
