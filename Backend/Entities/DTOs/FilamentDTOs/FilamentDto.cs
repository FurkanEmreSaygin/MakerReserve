namespace Entities.DTOs.FilamentDTOs;

public class FilamentDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string FilamentPhoto { get; set; } = string.Empty;
    public int CurrentWeight { get; set; }
    public int TargetGrade { get; set; }
}