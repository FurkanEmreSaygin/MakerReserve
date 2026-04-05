import { Link } from "react-router-dom";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import PrintIcon from "@mui/icons-material/Print";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";

const Navbar = () => {
  const userToken = localStorage.getItem("token");

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
    <AppBar position="sticky" elevation={3} sx={{ backgroundColor: "#1565c0" }}>
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
            {/* YENİ: Başka bir sayfaya yönlendiren buton */}
            <Button
              component={Link}
              to="/training"
              color="inherit"
              startIcon={<PlayCircleOutlineIcon />}
              sx={{
                fontWeight: "bold",
                backgroundColor: "rgba(255,255,255,0.1)",
                "&:hover": { backgroundColor: "rgba(255,255,255,0.2)" },
              }}
            >
              Eğitim Videoları
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
  );
};

export default Navbar;
