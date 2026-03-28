using Entities.DTOs.MachineDTOs;

namespace Business.Abstract;

public interface IMachineService
{
    Task<List<MachineDto>> GetAllMachinesAsync();
    Task<List<MachineDto>> GetActiveMachinesAsync(); // Öğrenciler sadece bunu görecek
    Task<MachineDto> AddMachineAsync(MachineCreateDto machineDto);
    Task DeleteMachineAsync(int id);
    Task ToggleMachineStatusAsync(int id); // Admin'in makineyi açıp/kapatması için
}