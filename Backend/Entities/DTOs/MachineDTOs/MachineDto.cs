namespace Entities.DTOs.MachineDTOs;

public class MachineDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string MachinePhoto { get; set; } = string.Empty;
    public bool IsActive { get; set; }
}