namespace Entities.DTOs.ReservationDTOs;

public class ReservationCreateDto
{
    // Not: UserId'yi buraya koymuyoruz çünkü API katmanında Token'dan alıp Servise biz vereceğiz! Güvenlik!
    public int MachineId { get; set; }
    public int FilamentId { get; set; }

    public DateTime StartTime { get; set; } // Öğrencinin takvimden seçtiği başlangıç saati
    public int EstimatedDurationInMinutes { get; set; } // Girilen ham süre (Örn: 205 dakika)
    public int ExpectedFilamentUsage { get; set; } // Tahmini harcanacak gramaj
    public string PrintType { get; set; } = string.Empty; // "Odev" veya "Kisisel"
}