using Entities;

namespace DataAccess.Abstract;

public interface IMachineRepository
{
    Task<Machine?> GetByIdAsync(int id);
    Task<List<Machine>> GetAllAsync();
    Task<List<Machine>> GetActiveMachinesAsync(); // Sadece aktif makineleri getirmek için
    Task AddAsync(Machine machine);
    Task UpdateAsync(Machine machine);
    Task DeleteAsync(int id);
}