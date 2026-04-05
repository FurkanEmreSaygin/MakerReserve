using Microsoft.EntityFrameworkCore;

namespace Entities
{
    [Index(nameof(Email), IsUnique = true)]
    [Index(nameof(StudentNumber), IsUnique = true)]
    public class User
    {
        public int Id { get; set; }
        public string StudentNumber { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public int Grade { get; set; }

        // Kullanıcı eğitim videolarını bitirdi mi?
        public bool HasCompletedTraining { get; set; } = false;

        // Rolü: "Student" veya "Admin" olabilir
        public string Role { get; set; } = "Student";

        public string Email { get; set; } = string.Empty; // Öğrencinin mail adresi
        public bool IsEmailVerified { get; set; } = false; // Doğruladı mı?
        public string? EmailVerificationCode { get; set; }
    }
}