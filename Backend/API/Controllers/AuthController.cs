using Business.Abstract;
using Entities.DTOs.UserDTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(UserRegisterDto registerDto)
        {
            try
            {
                var result = await _authService.RegisterAsync(registerDto);
                return Ok(new { message = "Kayıt başarılı. Lütfen e-postanıza gelen 6 haneli kod ile hesabınızı doğrulayın.", user = result });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(UserLoginDto loginDto)
        {
            try
            {
                var token = await _authService.LoginAsync(loginDto);
                return Ok(new { token = token });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // YENİ: MAİL ONAY LİNKİ
        [HttpPost("verify-email")]
        public async Task<IActionResult> VerifyEmail([FromBody] VerifyEmailDto dto)
        {
            try
            {
                await _authService.VerifyEmailAsync(dto.StudentNumber, dto.Code);
                return Ok(new { message = "E-posta adresiniz başarıyla doğrulandı. Artık giriş yapabilirsiniz!" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // YENİ: EĞİTİM TAMAMLAMA LİNKİ
        [HttpPost("complete-training")]
        [Authorize] // Sadece sisteme girenler (token'ı olanlar) bu isteği atabilir
        public async Task<IActionResult> CompleteTraining()
        {
            try
            {
                var userIdStr = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                var newToken = await _authService.CompleteTrainingAsync(int.Parse(userIdStr!));

                return Ok(new { token = newToken, message = "Eğitim başarıyla tamamlandı!" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
        
        [HttpPost("upgrade-grades")]
        [Authorize(Roles = "Admin")] // Sadece Adminler sınıf atlatabilir
        public async Task<IActionResult> UpgradeGrades()
        {
            try
            {
                await _authService.UpgradeAllGradesAsync();
                return Ok(new { message = "Tüm öğrencilerin sınıfları başarıyla yükseltildi." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
    

    // E-posta doğrulama için gerekli DTO (Aynı dosyanın en altında durabilir)
    public class VerifyEmailDto
    {
        public string StudentNumber { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
    }
}