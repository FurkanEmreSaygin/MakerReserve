using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Entities
{
    public class Reservation
    {
        public int Id { get; set; }

        // --- Yabancı Anahtarlar (Foreign Keys) ---
        public int UserId { get; set; }
        public int MachineId { get; set; }
        public int FilamentId { get; set; }

        // --- Gezinme Özellikleri (Navigation Properties) ---
        // Entity Framework'ün ilişkileri anlaması ve verileri getirmesi için
        public User User { get; set; } = null!;
        public Machine Machine { get; set; } = null!;
        public Filament Filament { get; set; } = null!;

        // --- Randevu Detayları ---
        // Randevu başlangıç ve bitiş zamanı
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }

        // Öğrencinin girdiği tahmini süre (dakika cinsinden)
        public int EstimatedDurationInMinutes { get; set; }

        // Kullanılacak filament gramajı
        public int ExpectedFilamentUsage { get; set; }

        // Baskı türü: "Odev" veya "Kisisel"
        public string PrintType { get; set; } = string.Empty;

        // Randevu durumu: "Pending" (Bekliyor), "Completed" (Bitti), "Cancelled" (İptal)
        public string Status { get; set; } = "Pending";
    }
}