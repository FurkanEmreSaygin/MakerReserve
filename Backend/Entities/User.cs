using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Entities
{
    public class User
    {
        public int Id { get; set; }
        public string StudentNumber { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty; 

        // Kullanıcı eğitim videolarını bitirdi mi?
        public bool HasCompletedTraining { get; set; } = false;

        // Rolü: "Student" veya "Admin" olabilir
        public string Role { get; set; } = "Student";

        public string Email { get; set; } = string.Empty; // Öğrencinin mail adresi
        public bool IsEmailVerified { get; set; } = false; // Doğruladı mı?
        public string? EmailVerificationCode { get; set; }
    }
}