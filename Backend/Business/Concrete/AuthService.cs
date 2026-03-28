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
        var existingUser = await _userRepository.GetByStudentNumberAsync(registerDto.StudentNumber);
        if (existingUser != null)
            throw new Exception("Bu öğrenci numarası ile zaten kayıt olunmuş.");

        // 6 Haneli Rastgele Doğrulama Kodu Üret
        string verificationCode = new Random().Next(100000, 999999).ToString();

        var user = new User
        {
            StudentNumber = registerDto.StudentNumber,
            FirstName = registerDto.FirstName,
            LastName = registerDto.LastName,
            PhoneNumber = registerDto.PhoneNumber,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(registerDto.Password),
            Role = "Student",
            HasCompletedTraining = false,

            // YENİ: Mail doğrulama alanları
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
        var user = await _userRepository.GetByStudentNumberAsync(loginDto.StudentNumber);
        if (user == null)
            throw new Exception("Kullanıcı bulunamadı.");

        bool isPasswordValid = BCrypt.Net.BCrypt.Verify(loginDto.Password, user.PasswordHash);
        if (!isPasswordValid)
            throw new Exception("Şifre hatalı.");

        // YENİ: Mail onayı yapılmamışsa girişi engelle!
        if (!user.IsEmailVerified)
            throw new Exception("Lütfen giriş yapmadan önce e-posta adresinize gelen kodu onaylayın.");

        return GenerateJwtToken(user);
    }

    // YENİ: E-posta Doğrulama Metodu
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

    // YENİ: Eğitimi Tamamlama Metodu
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
            // YENİ: Eğitim durumunu token'a ekledik
            new Claim("HasCompletedTraining", user.HasCompletedTraining.ToString())
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
}