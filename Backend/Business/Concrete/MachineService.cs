using Business.Abstract;
using DataAccess.Abstract;
using Entities;
using Entities.DTOs.MachineDTOs;

namespace Business.Concrete;

public class MachineService : IMachineService
{
    private readonly IMachineRepository _machineRepository;

    public MachineService(IMachineRepository machineRepository)
    {
        _machineRepository = machineRepository;
    }

    public async Task<List<MachineDto>> GetAllMachinesAsync()
    {
        var machines = await _machineRepository.GetAllAsync();
        return machines.Select(m => new MachineDto { Id = m.Id, Name = m.Name, MachinePhoto = m.MachinePhoto, IsActive = m.IsActive }).ToList();
    }

    public async Task<List<MachineDto>> GetActiveMachinesAsync()
    {
        var machines = await _machineRepository.GetActiveMachinesAsync();
        return machines.Select(m => new MachineDto { Id = m.Id, Name = m.Name, MachinePhoto = m.MachinePhoto, IsActive = m.IsActive }).ToList();
    }

    public async Task<MachineDto> AddMachineAsync(MachineCreateDto machineDto)
    {
        var machine = new Machine { Name = machineDto.Name, MachinePhoto = machineDto.MachinePhoto, IsActive = true };
        await _machineRepository.AddAsync(machine);
        return new MachineDto { Id = machine.Id, Name = machine.Name, MachinePhoto = machine.MachinePhoto, IsActive = machine.IsActive };
    }

    public async Task ToggleMachineStatusAsync(int id)
    {
        var machine = await _machineRepository.GetByIdAsync(id);
        if (machine == null) throw new Exception("Makine bulunamadı.");

        machine.IsActive = !machine.IsActive; // True ise false, false ise true yap
        await _machineRepository.UpdateAsync(machine);
    }

    public async Task DeleteMachineAsync(int id) => await _machineRepository.DeleteAsync(id);
}