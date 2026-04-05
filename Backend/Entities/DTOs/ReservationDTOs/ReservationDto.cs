namespace Entities.DTOs.ReservationDTOs;

public class ReservationDto
{
    public int Id { get; set; }
    public string UserName { get; set; } = string.Empty; // User tablosundan FirstName + LastName
    public string MachineName { get; set; } = string.Empty; // Machine tablosundan Name
    public string FilamentName { get; set; } = string.Empty; // Filament tablosundan Name
    public string? StudentNumber { get; set; }
    public string? PhoneNumber { get; set; }

    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; } // Hesaplanmış ve yuvarlanmış bitiş saati

    public int ExpectedFilamentUsage { get; set; }
    public string PrintType { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
}