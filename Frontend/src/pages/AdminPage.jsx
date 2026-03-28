import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
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
} from "@mui/material";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SettingsIcon from "@mui/icons-material/Settings";

const AdminPage = () => {
  // --- STATE'LER ---
  const [machines, setMachines] = useState([]);
  const [filaments, setFilaments] = useState([]);

  const [newMachine, setNewMachine] = useState({ name: "", machinePhoto: "" });
  const [newFilament, setNewFilament] = useState({
    name: "",
    code: "",
    initialWeight: "",
    filamentPhoto: "",
  });

  // Gramaj Güncelleme İçin State'ler
  const [openWeightDialog, setOpenWeightDialog] = useState(false);
  const [selectedFilament, setSelectedFilament] = useState(null);
  const [newWeightInput, setNewWeightInput] = useState("");

  // --- SİSTEM AYARLARI İÇİN STATE'LER ---
  const [maxMinutes, setMaxMinutes] = useState(480);
  const [settingLoading, setSettingLoading] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchMachines();
    fetchFilaments();
    fetchSettings(); // Sayfa açıldığında ayarları da çek
  }, []);

  const fetchMachines = async () => {
    try {
      const res = await api.get("/machine");
      setMachines(res.data);
    } catch (err) {
      console.error("Makineler çekilemedi", err);
    }
  };

  const fetchFilaments = async () => {
    try {
      const res = await api.get("/filament");
      setFilaments(res.data);
    } catch (err) {
      console.error("Filamentler çekilemedi", err);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await api.get("/settings");
      setMaxMinutes(res.data.maxActiveReservationMinutes);
    } catch (err) {
      console.error("Ayarlar çekilemedi", err);
    }
  };

  // --- SİSTEM AYARLARINI GÜNCELLEME ---
  const handleUpdateSettings = async () => {
    setSettingLoading(true);
    try {
      await api.put("/settings", { newLimit: parseInt(maxMinutes) });
      alert("Sistem ayarları başarıyla güncellendi!");
    } catch (err) {
      alert("Ayarlar güncellenirken bir hata oluştu.");
    } finally {
      setSettingLoading(false);
    }
  };

  // --- ORTAK FOTOĞRAF YÜKLEME (Base64) ---
  const handlePhotoUpload = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
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

  // --- MAKİNE İŞLEMLERİ ---
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
    } catch (err) {
      console.error("Durum değişmedi", err);
    }
  };

  const handleDeleteMachine = async (id) => {
    if (window.confirm("Bu makineyi silmek istediğinize emin misiniz?")) {
      try {
        await api.delete(`/machine/${id}`);
        fetchMachines();
      } catch (err) {
        setError("Makine silinemedi. (Randevusu olan makineler silinemez)");
      }
    }
  };

  // --- FİLAMENT İŞLEMLERİ ---
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

  // --- FİLAMENT GRAMAJ GÜNCELLEME İŞLEMLERİ ---
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

        {/* ==================== SİSTEM AYARLARI ==================== */}
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
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={8}>
                <Typography variant="body1" fontWeight="bold">
                  Kişi Başı Maksimum Aktif Kota (Dakika)
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Öğrencilerin ileriye dönük aynı anda alabileceği toplam
                  maksimum baskı süresi. (Örn: 8 Saat = 480 Dakika)
                </Typography>
              </Grid>
              <Grid item xs={12} sm={2}>
                <TextField
                  fullWidth
                  type="number"
                  value={maxMinutes}
                  onChange={(e) => setMaxMinutes(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={2}>
                <Button
                  fullWidth
                  variant="contained"
                  color="secondary"
                  onClick={handleUpdateSettings}
                  disabled={settingLoading}
                  sx={{ height: "56px" }}
                >
                  {settingLoading ? "Kaydediliyor..." : "Kaydet"}
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Box>

        <Divider sx={{ my: 4 }} />

        {/* ==================== MAKİNE YÖNETİMİ ==================== */}
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
                    label="Makine Adı (Örn: Ender 3 V2)"
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
                      : "Makine Fotoğrafı (Max 2MB)"}
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

        {/* ==================== FİLAMENT YÖNETİMİ ==================== */}
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
                    label="Renk/Ad (Örn: Kırmızı PLA)"
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
                    label="Kodu (Örn: PLA-RED)"
                    value={newFilament.code}
                    onChange={(e) =>
                      setNewFilament({ ...newFilament, code: e.target.value })
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={2}>
                  <TextField
                    fullWidth
                    required
                    label="Gramaj (gr)"
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
                <Grid item xs={12} sm={3}>
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
                    {newFilament.filamentPhoto
                      ? "Fotoğraf Seçildi"
                      : "Filament Foto"}
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
                  <TableCell align="center">
                    <b>Kalan Gramaj</b>
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

        {/* --- GRAMAJ GÜNCELLEME DİALOG'U --- */}
        <Dialog
          open={openWeightDialog}
          onClose={handleCloseWeightDialog}
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle fontWeight="bold">Gramajı Güncelle</DialogTitle>
          <DialogContent>
            <Typography variant="body2" sx={{ mb: 2, mt: 1 }}>
              <b>{selectedFilament?.name}</b> için yeni kalan gramaj miktarını
              giriniz.
            </Typography>
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
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleCloseWeightDialog} color="inherit">
              İptal
            </Button>
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
