import Navbar from "../components/Navbar";
import { Container, Typography, Box, Card, CardContent } from "@mui/material";

// EKLEMEK İSTEDİĞİN VİDEOLARI BURAYA GİR
const videos = [
  {
    id: 1,
    title: "1. 3D Yazıcı Temel Kullanımı ve İş Güvenliği",
    description:
      "Laboratuvara ilk defa girecek öğrencilerin dikkat etmesi gereken temel kurallar.",
    url: "https://www.youtube.com/embed/59xZGr05_TY?si=_UyTI21qH_t4pXJs",
  },
  {
    id: 2,
    title: "2. Doğru Filament Takma ve Çıkarma",
    description:
      "Cihaza zarar vermeden filament değişiminin nasıl yapılacağını öğrenin.",
    url: "https://www.youtube.com/embed/tarihli_diger_video_id", // Buraya diğer videonun embed linkini koyarsın
  },
  {
    id: 3,
    title: "3. Tabla Ayarı (Bed Leveling) Nasıl Yapılır?",
    description:
      "Baskınızın tablaya yapışması için ilk katman ayarı çok önemlidir.",
    url: "https://www.youtube.com/embed/baska_bir_video_id", // Buraya diğer videonun embed linkini koyarsın
  },
];

const TrainingPage = () => {
  return (
    <>
      <Navbar />
      <Container maxWidth="md" sx={{ mt: 5, mb: 8 }}>
        <Typography
          variant="h3"
          fontWeight="bold"
          color="primary"
          gutterBottom
          align="center"
        >
          Laboratuvar Eğitim Serisi
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          align="center"
          sx={{ mb: 6 }}
        >
          Laboratuvarımızdaki cihazları daha verimli ve güvenli kullanmak için
          hazırladığımız eğitim videolarını aşağıdan izleyebilirsiniz.
        </Typography>

        {videos.map((video) => (
          <Card
            key={video.id}
            elevation={4}
            sx={{ mb: 5, borderRadius: 3, overflow: "hidden" }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                backgroundColor: "#000",
              }}
            >
              <iframe
                width="100%"
                height="450"
                src={video.url}
                title={video.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </Box>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                {video.title}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {video.description}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Container>
    </>
  );
};

export default TrainingPage;
