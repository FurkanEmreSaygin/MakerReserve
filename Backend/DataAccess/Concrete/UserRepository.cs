using DataAccess.Abstract;
using Entities;
using Microsoft.EntityFrameworkCore;

namespace DataAccess.Concrete;

public class UserRepository : IUserRepository
{
    private readonly PrinterDbContext _context;

    // Veritabanı bağlantımızı (DbContext) içeri alıyoruz
    public UserRepository(PrinterDbContext context)
    {
        _context = context;
    }

    public async Task<User?> GetByIdAsync(int id)
    {
        // Veritabanından ID'ye göre ilk kaydı getir, bulamazsa null (boş) dön
        return await _context.Users.FirstOrDefaultAsync(u => u.Id == id);
    }

    public async Task<List<User>> GetAllAsync()
    {
        // Tüm kullanıcıları bir liste olarak getir
        return await _context.Users.ToListAsync();
    }

    public async Task AddAsync(User user)
    {
        // Yeni kullanıcıyı tabloya ekle ve kaydet
        await _context.Users.AddAsync(user);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(User user)
    {
        // Kullanıcıyı güncelle ve kaydet
        _context.Users.Update(user);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        // Önce silinecek kullanıcıyı bul
        var user = await GetByIdAsync(id);
        if (user != null)
        {
            // Varsa tablodan sil ve kaydet
            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
        }
    }

    public async Task<User?> GetByStudentNumberAsync(string studentNumber)
    {
        // Öğrenci numarası eşleşen kullanıcıyı getir
        return await _context.Users.FirstOrDefaultAsync(u => u.StudentNumber == studentNumber);
    }

    public async Task<User?> GetByEmailAsync(string email)
    {
        // E-posta adresi eşleşen kullanıcıyı getir
        return await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
    }
}