import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import api from "../services/api";
import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Switch,
  Alert,
  IconButton,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
} from "@mui/material";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SettingsIcon from "@mui/icons-material/Settings";
import UpgradeIcon from "@mui/icons-material/Upgrade";

const AdminPage = () => {
  const [machines, setMachines] = useState([]);
  const [filaments, setFilaments] = useState([]);

  const [newMachine, setNewMachine] = useState({ name: "", machinePhoto: "" });
  const [newFilament, setNewFilament] = useState({
    name: "",
    code: "",
    initialWeight: "",
    filamentPhoto: "",
    targetGrade: 1, // YENİ: Varsayılan Sınıf 1
  });

  const [openWeightDialog, setOpenWeightDialog] = useState(false);
  const [selectedFilament, setSelectedFilament] = useState(null);
  const [newWeightInput, setNewWeightInput] = useState("");

  const [maxMinutes, setMaxMinutes] = useState(480);
  const [settingLoading, setSettingLoading] = useState(false);

  const [activeReservations, setActiveReservations] = useState([]);
  const [resLoading, setResLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchMachines();
    fetchFilaments();
    fetchSettings();
    fetchActiveReservations();
  }, []);

  const fetchActiveReservations = async () => {
    setResLoading(true);
    try {
      const res = await api.get("/reservation/admin/active");
      setActiveReservations(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setResLoading(false);
    }
  };

  const handleAdminCancel = async (id) => {
    if (window.confirm("Bu randevuyu iptal etmek istediğinize emin misiniz?")) {
      try {
        await api.put(`/reservation/admin/cancel/${id}`);
        fetchActiveReservations();
      } catch (err) {
        alert("İptal işlemi başarısız oldu.");
      }
    }
  };

  const fetchMachines = async () => {
    try {
      const res = await api.get("/machine");
      setMachines(res.data);
    } catch (err) {}
  };

  const fetchFilaments = async () => {
    try {
      const res = await api.get("/filament");
      setFilaments(res.data);
    } catch (err) {}
  };

  const fetchSettings = async () => {
    try {
      const res = await api.get("/settings");
      setMaxMinutes(res.data.maxActiveReservationMinutes);
    } catch (err) {}
  };

  const handleUpdateSettings = async () => {
    setSettingLoading(true);
    try {
      await api.put("/settings", { newLimit: parseInt(maxMinutes) });
      alert("Ayarlar güncellendi!");
    } catch (err) {
      alert("Hata oluştu.");
    } finally {
      setSettingLoading(false);
    }
  };

  // YENİ: SINIF ATLATMA SİSTEMİ
  const handleUpgradeGrades = async () => {
    if (
      window.confirm(
        "DİKKAT: Tüm öğrencileri bir üst sınıfa aktarmak istediğinize emin misiniz? (4. sınıflar mezun edilecektir). Bu işlem geri alınamaz!",
      )
    ) {
      try {
        await api.post("/auth/upgrade-grades"); // Backend'de eklenmeli
        alert("Tüm öğrenciler başarıyla bir üst sınıfa aktarıldı!");
      } catch (err) {
        alert("İşlem sırasında bir hata oluştu.");
      }
    }
  };

  const handlePhotoUpload = (e, type) => {
    const file = e.target.files[0];
    if (!file || file.size > 2 * 1024 * 1024) {
      setError("Fotoğraf boyutu en fazla 2 MB olabilir!");
      return;
    }
    setError("");
    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === "machine")
        setNewMachine({ ...newMachine, machinePhoto: reader.result });
      if (type === "filament")
        setNewFilament({ ...newFilament, filamentPhoto: reader.result });
    };
    reader.readAsDataURL(file);
  };

  const handleAddMachine = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/machine", newMachine);
      setNewMachine({ name: "", machinePhoto: "" });
      fetchMachines();
    } catch (err) {
      setError("Makine eklenemedi.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleMachineStatus = async (id) => {
    try {
      await api.patch(`/machine/${id}/toggle`);
      fetchMachines();
    } catch (err) {}
  };

  const handleDeleteMachine = async (id) => {
    if (window.confirm("Bu makineyi silmek istediğinize emin misiniz?")) {
      try {
        await api.delete(`/machine/${id}`);
        fetchMachines();
      } catch (err) {
        setError("Makine silinemedi.");
      }
    }
  };

  const handleAddFilament = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/filament", newFilament);
      setNewFilament({
        name: "",
        code: "",
        initialWeight: "",
        filamentPhoto: "",
        targetGrade: 1,
      });
      fetchFilaments();
    } catch (err) {
      setError("Filament eklenemedi.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFilament = async (id) => {
    if (window.confirm("Bu filamenti silmek istediğinize emin misiniz?")) {
      try {
        await api.delete(`/filament/${id}`);
        fetchFilaments();
      } catch (err) {
        setError("Filament silinemedi.");
      }
    }
  };

  const handleOpenWeightDialog = (filament) => {
    setSelectedFilament(filament);
    setNewWeightInput(filament.currentWeight);
    setOpenWeightDialog(true);
  };
  const handleCloseWeightDialog = () => {
    setOpenWeightDialog(false);
    setSelectedFilament(null);
    setNewWeightInput("");
  };
  const handleUpdateWeight = async () => {
    try {
      await api.put("/filament/update-weight", {
        id: selectedFilament.id,
        newWeight: parseInt(newWeightInput),
      });
      fetchFilaments();
      handleCloseWeightDialog();
    } catch (err) {
      setError("Gramaj güncellenemedi.");
      handleCloseWeightDialog();
    }
  };

  const getGradeName = (grade) => {
    if (grade === 0) return "Hazırlık";
    return `${grade}. Sınıf`;
  };

  return (
    <>
      <Navbar />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
        <Typography variant="h4" gutterBottom fontWeight="bold" color="primary">
          Admin Paneli
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* --- SİSTEM AYARLARI --- */}
        <Box sx={{ mb: 6 }}>
          <Typography
            variant="h5"
            sx={{
              mb: 2,
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
            }}
          >
            <SettingsIcon sx={{ mr: 1 }} /> 1. Sistem Ayarları
          </Typography>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
            <Grid container spacing={4} alignItems="center">
              <Grid item xs={12} sm={6}>
                <Typography variant="body1" fontWeight="bold">
                  Kişi Başı Maksimum Aktif Kota (Dakika)
                </Typography>
                <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
                  <TextField
                    type="number"
                    value={maxMinutes}
                    onChange={(e) => setMaxMinutes(e.target.value)}
                    size="small"
                  />
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={handleUpdateSettings}
                    disabled={settingLoading}
                  >
                    {settingLoading ? "Kaydediliyor..." : "Kaydet"}
                  </Button>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body1" fontWeight="bold" color="error">
                  Yıllık Sınıf Atlatma İşlemi
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  Her eğitim yılı başında öğrencileri 1 üst sınıfa kaydırır.
                </Typography>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<UpgradeIcon />}
                  onClick={handleUpgradeGrades}
                >
                  TÜM SINIFLARI ATLAT
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Box>
        <Divider sx={{ my: 4 }} />

        {/* --- MAKİNELER (Mevcut kod ile aynı) --- */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>
            2. Makineler
          </Typography>
          <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
            <Box component="form" onSubmit={handleAddMachine}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={5}>
                  <TextField
                    fullWidth
                    required
                    label="Makine Adı"
                    value={newMachine.name}
                    onChange={(e) =>
                      setNewMachine({ ...newMachine, name: e.target.value })
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={5}>
                  <Button
                    variant={newMachine.machinePhoto ? "contained" : "outlined"}
                    color={newMachine.machinePhoto ? "success" : "primary"}
                    component="label"
                    fullWidth
                    startIcon={<PhotoCameraIcon />}
                    sx={{ height: "56px" }}
                  >
                    {newMachine.machinePhoto
                      ? "Fotoğraf Seçildi"
                      : "Makine Fotoğrafı"}{" "}
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={(e) => handlePhotoUpload(e, "machine")}
                    />
                  </Button>
                </Grid>
                <Grid item xs={12} sm={2}>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={loading || !newMachine.name}
                    sx={{ height: "56px" }}
                  >
                    Ekle
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Paper>
          <TableContainer
            component={Paper}
            elevation={3}
            sx={{ borderRadius: 2 }}
          >
            <Table>
              <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
                <TableRow>
                  <TableCell>
                    <b>ID</b>
                  </TableCell>
                  <TableCell>
                    <b>Fotoğraf</b>
                  </TableCell>
                  <TableCell>
                    <b>Makine Adı</b>
                  </TableCell>
                  <TableCell align="center">
                    <b>Durum</b>
                  </TableCell>
                  <TableCell align="right">
                    <b>İşlem</b>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {machines.map((machine) => (
                  <TableRow key={machine.id} hover>
                    <TableCell>{machine.id}</TableCell>
                    <TableCell>
                      {machine.machinePhoto ? (
                        <img
                          src={machine.machinePhoto}
                          alt={machine.name}
                          style={{
                            width: 50,
                            height: 50,
                            objectFit: "cover",
                            borderRadius: 4,
                          }}
                        />
                      ) : (
                        "Yok"
                      )}
                    </TableCell>
                    <TableCell>{machine.name}</TableCell>
                    <TableCell align="center">
                      <Switch
                        checked={machine.isActive}
                        onChange={() => handleToggleMachineStatus(machine.id)}
                        color="success"
                      />
                      <Typography variant="caption" display="block">
                        {machine.isActive ? "Açık" : "Kapalı"}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        color="error"
                        onClick={() => handleDeleteMachine(machine.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
        <Divider sx={{ my: 4 }} />

        {/* --- FİLAMENTLER --- */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>
            3. Filamentler
          </Typography>
          <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
            <Box component="form" onSubmit={handleAddFilament}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    required
                    label="Renk/Ad"
                    value={newFilament.name}
                    onChange={(e) =>
                      setNewFilament({ ...newFilament, name: e.target.value })
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={2}>
                  <TextField
                    fullWidth
                    required
                    label="Kodu"
                    value={newFilament.code}
                    onChange={(e) =>
                      setNewFilament({ ...newFilament, code: e.target.value })
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={1.5}>
                  <TextField
                    fullWidth
                    required
                    label="Gramaj"
                    type="number"
                    value={newFilament.initialWeight}
                    onChange={(e) =>
                      setNewFilament({
                        ...newFilament,
                        initialWeight: e.target.value,
                      })
                    }
                  />
                </Grid>
                {/* YENİ: Sınıf Seçimi */}
                <Grid item xs={12} sm={1.5}>
                  <TextField
                    select
                    fullWidth
                    label="Hedef Sınıf"
                    value={newFilament.targetGrade}
                    onChange={(e) =>
                      setNewFilament({
                        ...newFilament,
                        targetGrade: e.target.value,
                      })
                    }
                  >
                    <MenuItem value={0}>Hazırlık</MenuItem>
                    <MenuItem value={1}>1. Sınıf</MenuItem>
                    <MenuItem value={2}>2. Sınıf</MenuItem>
                    <MenuItem value={3}>3. Sınıf</MenuItem>
                    <MenuItem value={4}>4. Sınıf</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={2}>
                  <Button
                    variant={
                      newFilament.filamentPhoto ? "contained" : "outlined"
                    }
                    color={newFilament.filamentPhoto ? "success" : "primary"}
                    component="label"
                    fullWidth
                    startIcon={<PhotoCameraIcon />}
                    sx={{ height: "56px" }}
                  >
                    {newFilament.filamentPhoto ? "Seçildi" : "Foto"}{" "}
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={(e) => handlePhotoUpload(e, "filament")}
                    />
                  </Button>
                </Grid>
                <Grid item xs={12} sm={2}>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={
                      loading || !newFilament.name || !newFilament.initialWeight
                    }
                    sx={{ height: "56px" }}
                  >
                    Ekle
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Paper>
          <TableContainer
            component={Paper}
            elevation={3}
            sx={{ borderRadius: 2 }}
          >
            <Table>
              <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
                <TableRow>
                  <TableCell>
                    <b>ID</b>
                  </TableCell>
                  <TableCell>
                    <b>Fotoğraf</b>
                  </TableCell>
                  <TableCell>
                    <b>Ad / Renk</b>
                  </TableCell>
                  <TableCell>
                    <b>Kod</b>
                  </TableCell>
                  <TableCell>
                    <b>Hedef Sınıf</b>
                  </TableCell>
                  <TableCell align="center">
                    <b>Kalan</b>
                  </TableCell>
                  <TableCell align="right">
                    <b>İşlem</b>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filaments.map((filament) => (
                  <TableRow key={filament.id} hover>
                    <TableCell>{filament.id}</TableCell>
                    <TableCell>
                      {filament.filamentPhoto ? (
                        <img
                          src={filament.filamentPhoto}
                          alt={filament.name}
                          style={{
                            width: 50,
                            height: 50,
                            objectFit: "cover",
                            borderRadius: 4,
                          }}
                        />
                      ) : (
                        "Yok"
                      )}
                    </TableCell>
                    <TableCell>{filament.name}</TableCell>
                    <TableCell>{filament.code}</TableCell>
                    <TableCell>
                      <b>{getGradeName(filament.targetGrade)}</b>
                    </TableCell>
                    <TableCell align="center">
                      <Typography
                        fontWeight="bold"
                        color={
                          filament.currentWeight < 200
                            ? "error"
                            : "success.main"
                        }
                      >
                        {filament.currentWeight} gr
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        color="primary"
                        onClick={() => handleOpenWeightDialog(filament)}
                        sx={{ mr: 1 }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDeleteFilament(filament.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        {/* --- AKTİF RANDEVULAR (Mevcut Kodla Aynı) --- */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>
            4. Tüm Aktif Randevular
          </Typography>
          <TableContainer
            component={Paper}
            elevation={3}
            sx={{ borderRadius: 2 }}
          >
            <Table>
              <TableHead sx={{ backgroundColor: "#1565c0" }}>
                <TableRow>
                  <TableCell sx={{ color: "white" }}>
                    <b>Tarih/Saat</b>
                  </TableCell>
                  <TableCell sx={{ color: "white" }}>
                    <b>Öğrenci Bilgileri</b>
                  </TableCell>
                  <TableCell sx={{ color: "white" }}>
                    <b>Makine/Filament</b>
                  </TableCell>
                  <TableCell align="right" sx={{ color: "white" }}>
                    <b>İşlem</b>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {resLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      Yükleniyor...
                    </TableCell>
                  </TableRow>
                ) : (
                  activeReservations.map((res) => (
                    <TableRow key={res.id} hover>
                      <TableCell>
                        <b>
                          {format(new Date(res.startTime), "d MMM yyyy", {
                            locale: tr,
                          })}
                        </b>
                        <br />
                        {format(new Date(res.startTime), "HH:mm")} -{" "}
                        {format(new Date(res.endTime), "HH:mm")}
                      </TableCell>
                      <TableCell>
                        <b>{res.userName}</b>
                        <br />
                        <span style={{ fontSize: "0.85rem", color: "#555" }}>
                          No: {res.studentNumber}
                        </span>
                        <br />
                        <span style={{ fontSize: "0.85rem", color: "#555" }}>
                          Tel: {res.phoneNumber}
                        </span>
                      </TableCell>
                      <TableCell>
                        {res.machineName}
                        <br />
                        {res.filamentName} ({res.expectedFilamentUsage} gr)
                      </TableCell>
                      <TableCell align="right">
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={() => handleAdminCancel(res.id)}
                        >
                          İPTAL ET
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        <Dialog
          open={openWeightDialog}
          onClose={handleCloseWeightDialog}
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle>Gramajı Güncelle</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Yeni Gramaj (gr)"
              type="number"
              fullWidth
              variant="outlined"
              value={newWeightInput}
              onChange={(e) => setNewWeightInput(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseWeightDialog}>İptal</Button>
            <Button
              onClick={handleUpdateWeight}
              variant="contained"
              color="primary"
            >
              Kaydet
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
};

export default AdminPage;
