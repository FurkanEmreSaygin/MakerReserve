import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
} from "@mui/material";
import PrintIcon from "@mui/icons-material/Print";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import CloseIcon from "@mui/icons-material/Close";

const Navbar = () => {
  const navigate = useNavigate();
  const userToken = localStorage.getItem("token");

  // Video Modalının açık/kapalı durumu
  const [videoOpen, setVideoOpen] = useState(false);

  let user = null;
  if (userToken) {
    try {
      user = JSON.parse(atob(userToken.split(".")[1]));
    } catch (e) {
      console.error("Token çözülemedi", e);
    }
  }

const handleLogout = () => {
  localStorage.removeItem("token");
  window.location.href = "/login";
};

  return (
    <>
      <AppBar
        position="sticky"
        elevation={3}
        sx={{ backgroundColor: "#1565c0" }}
      >
        <Toolbar>
          <PrintIcon sx={{ mr: 2, fontSize: 30 }} />
          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{
              flexGrow: 1,
              textDecoration: "none",
              color: "inherit",
              fontWeight: "bold",
              letterSpacing: 1,
            }}
          >
            MakerReserve
          </Typography>

          {user ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {/* HER ZAMAN ERİŞİLEBİLİR EĞİTİM BUTONU */}
              <Button
                color="inherit"
                startIcon={<PlayCircleOutlineIcon />}
                onClick={() => setVideoOpen(true)}
                sx={{
                  fontWeight: "bold",
                  backgroundColor: "rgba(255,255,255,0.1)",
                  "&:hover": { backgroundColor: "rgba(255,255,255,0.2)" },
                }}
              >
                Eğitim
              </Button>

              {user.role === "Admin" && (
                <Button
                  component={Link}
                  to="/admin"
                  color="inherit"
                  sx={{ border: "1px solid rgba(255,255,255,0.5)" }}
                >
                  Admin Paneli
                </Button>
              )}

              <Button
                component={Link}
                to="/profile"
                color="inherit"
                startIcon={<PersonIcon />}
              >
                Profilim
              </Button>

              <Button
                color="inherit"
                onClick={handleLogout}
                endIcon={<LogoutIcon />}
              >
                Çıkış
              </Button>
            </Box>
          ) : (
            <Box>
              <Button
                color="inherit"
                component={Link}
                to="/login"
                sx={{ fontWeight: "bold" }}
              >
                Giriş Yap
              </Button>
              <Button
                color="inherit"
                component={Link}
                to="/register"
                variant="outlined"
                sx={{
                  ml: 1,
                  borderColor: "white",
                  borderWidth: 2,
                  "&:hover": { borderWidth: 2 },
                }}
              >
                Kayıt Ol
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* --- VİDEO MODALI (SADECE NAVBAR'DAN ÇAĞRILIR) --- */}
      <Dialog
        open={videoOpen}
        onClose={() => setVideoOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontWeight: "bold",
            color: "#1565c0",
          }}
        >
          Laboratuvar Eğitim Videosu
          <IconButton onClick={() => setVideoOpen(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ backgroundColor: "#f9f9f9" }}>
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <iframe
              width="100%"
              height="450"
              src="https://youtu.be/Sagg08DrO5U?list=RDSagg08DrO5U"
              title="Eğitim Videosu"
              frameBorder="0"
              allowFullScreen
              style={{
                borderRadius: "12px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
              }}
            ></iframe>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Navbar;
