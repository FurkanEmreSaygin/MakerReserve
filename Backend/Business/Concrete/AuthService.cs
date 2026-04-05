using Business.Abstract;
using DataAccess.Abstract;
using Entities;
using Entities.DTOs.UserDTOs;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Business.Concrete;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly IConfiguration _configuration;
    private readonly IEmailService _emailService;

    public AuthService(IUserRepository userRepository, IConfiguration configuration, IEmailService emailService)
    {
        _userRepository = userRepository;
        _configuration = configuration;
        _emailService = emailService;
    }

    public async Task<UserDto> RegisterAsync(UserRegisterDto registerDto)
    {
        // 6 Haneli Rastgele Doğrulama Kodu Üret
        string verificationCode = new Random().Next(100000, 999999).ToString();

        // 1. Kullanıcıyı Öğrenci Numarası veya Email ile ara
        var existingUserByNumber = await _userRepository.GetByStudentNumberAsync(registerDto.StudentNumber);
        var existingUserByEmail = await _userRepository.GetByEmailAsync(registerDto.Email);

        // Kullanıcının sistemde herhangi bir şekilde (email veya no) kaydı var mı?
        var existingUser = existingUserByNumber ?? existingUserByEmail;

        if (existingUser != null)
        {
            if (existingUser.IsEmailVerified)
            {
                // Kullanıcı var ve DOĞRULANMIŞSA hata ver
                throw new Exception("Bu e-posta adresi veya öğrenci numarası zaten kullanımda.");
            }
            else
            {
                existingUser.FirstName = registerDto.FirstName;
                existingUser.LastName = registerDto.LastName;
                existingUser.PasswordHash = BCrypt.Net.BCrypt.HashPassword(registerDto.Password);
                existingUser.Grade = registerDto.Grade;
                existingUser.StudentNumber = registerDto.StudentNumber;
                existingUser.Email = registerDto.Email;

                existingUser.EmailVerificationCode = verificationCode;

                await _userRepository.UpdateAsync(existingUser);

                await _emailService.SendVerificationEmailAsync(existingUser.Email, verificationCode);

                return new UserDto
                {
                    Id = existingUser.Id,
                    StudentNumber = existingUser.StudentNumber,
                    FirstName = existingUser.FirstName,
                    LastName = existingUser.LastName,
                    PhoneNumber = existingUser.PhoneNumber,
                    Role = existingUser.Role,
                    HasCompletedTraining = existingUser.HasCompletedTraining
                };
            }
        }

        // 2. Eğer kullanıcı hiç yoksa, sıfırdan oluşturma kısmı
        var user = new User
        {
            StudentNumber = registerDto.StudentNumber,
            FirstName = registerDto.FirstName,
            LastName = registerDto.LastName,
            PhoneNumber = registerDto.PhoneNumber,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(registerDto.Password),
            Role = "Student",
            HasCompletedTraining = false,
            Grade = registerDto.Grade,
            Email = registerDto.Email,
            IsEmailVerified = false,
            EmailVerificationCode = verificationCode
        };

        await _userRepository.AddAsync(user);

        // Arka planda maili gönder
        await _emailService.SendVerificationEmailAsync(user.Email, verificationCode);

        return new UserDto
        {
            Id = user.Id,
            StudentNumber = user.StudentNumber,
            FirstName = user.FirstName,
            LastName = user.LastName,
            PhoneNumber = user.PhoneNumber,
            Role = user.Role,
            HasCompletedTraining = user.HasCompletedTraining
        };
    }

    public async Task<string> LoginAsync(UserLoginDto loginDto)
    {
        User user;

        // İçinde @ işareti varsa Email, yoksa Öğrenci Numarası olarak arayacağız
        if (loginDto.StudentNumber.Contains("@"))
        {
            user = await _userRepository.GetByEmailAsync(loginDto.StudentNumber);
        }
        else
        {
            user = await _userRepository.GetByStudentNumberAsync(loginDto.StudentNumber);
        }

        if (user == null)
            throw new Exception("Kullanıcı bulunamadı. Girdiğiniz bilgileri kontrol edin.");

        bool isPasswordValid = BCrypt.Net.BCrypt.Verify(loginDto.Password, user.PasswordHash);
        if (!isPasswordValid)
            throw new Exception("Şifre hatalı.");

        if (!user.IsEmailVerified)
        {
            string newCode = new Random().Next(100000, 999999).ToString();

            user.EmailVerificationCode = newCode;
            await _userRepository.UpdateAsync(user);

            await _emailService.SendVerificationEmailAsync(user.Email, newCode);

            throw new Exception("UNVERIFIED_USER");
        }

        return GenerateJwtToken(user);
    }

    // E-posta Doğrulama Metodu
    public async Task VerifyEmailAsync(string studentNumber, string code)
    {
        var user = await _userRepository.GetByStudentNumberAsync(studentNumber);

        if (user == null)
            throw new Exception("Kullanıcı bulunamadı.");

        if (user.IsEmailVerified)
            throw new Exception("Hesabınız zaten doğrulanmış.");

        if (user.EmailVerificationCode != code)
            throw new Exception("Hatalı doğrulama kodu girdiniz.");

        // Kod doğruysa hesabı onayla ve kodu temizle
        user.IsEmailVerified = true;
        user.EmailVerificationCode = null;

        await _userRepository.UpdateAsync(user);
    }

    // Eğitimi Tamamlama Metodu
    public async Task<string> CompleteTrainingAsync(int userId)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null) throw new Exception("Kullanıcı bulunamadı.");

        user.HasCompletedTraining = true;
        await _userRepository.UpdateAsync(user);

        // Eğitim tamamlandığı için yeni Token veriyoruz
        return GenerateJwtToken(user);
    }

    private string GenerateJwtToken(User user)
    {
        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.FirstName),
            new Claim(ClaimTypes.Role, user.Role),
            new Claim("StudentNumber", user.StudentNumber),
            new Claim("HasCompletedTraining", user.HasCompletedTraining.ToString()),
            new Claim("Grade", user.Grade.ToString())
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"] ?? "VarsayilanCokGizliBirAnahtarGirmelisinBuraya123!"));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"],
            audience: _configuration["Jwt:Audience"],
            claims: claims,
            expires: DateTime.Now.AddDays(7),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    // Yıllık Sınıf Atlatma Metodu
    public async Task UpgradeAllGradesAsync()
    {
        var users = await _userRepository.GetAllAsync();

        foreach (var user in users)
        {
            // Sadece öğrencileri etkilesin, Adminlerin sınıfı değişmez
            if (user.Role == "Admin") continue;

            if (user.Grade < 4)
            {
                user.Grade += 1; // Sınıfı 1 arttır
                await _userRepository.UpdateAsync(user);
            }
        }
    }
}