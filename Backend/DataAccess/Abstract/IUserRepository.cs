using Entities;

namespace DataAccess.Abstract;

public interface IUserRepository
{
    // Temel CRUD İşlemleri
    Task<User?> GetByIdAsync(int id);
    Task<List<User>> GetAllAsync();
    Task AddAsync(User user);
    Task UpdateAsync(User user);
    Task DeleteAsync(int id);

    // Öğrenci numarasına göre kullanıcıyı bulma
    Task<User?> GetByStudentNumberAsync(string studentNumber);
}