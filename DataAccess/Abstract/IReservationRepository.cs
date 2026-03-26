using Entities;

namespace DataAccess.Abstract;

public interface IReservationRepository
{
    Task<Reservation?> GetByIdAsync(int id);
    Task<List<Reservation>> GetAllAsync();
    Task<List<Reservation>> GetByDateAsync(DateTime date);
    Task<List<Reservation>> GetByUserIdAsync(int userId);
    Task AddAsync(Reservation reservation);
    Task UpdateAsync(Reservation reservation);
    Task DeleteAsync(int id);
}