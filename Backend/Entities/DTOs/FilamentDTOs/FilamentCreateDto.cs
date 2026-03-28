namespace Entities.DTOs.FilamentDTOs;

public class FilamentCreateDto
{
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string FilamentPhoto { get; set; } = string.Empty;
    public int InitialWeight { get; set; } // Başlangıç gramajı
}