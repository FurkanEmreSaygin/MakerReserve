using Entities;

namespace DataAccess.Abstract;

public interface IFilamentRepository
{
    Task<Filament?> GetByIdAsync(int id);
    Task<List<Filament>> GetAllAsync();
    Task AddAsync(Filament filament);
    Task UpdateAsync(Filament filament);
    Task DeleteAsync(int id);
}