namespace Business.Abstract;

using Entities.DTOs.UserDTOs;

public interface IAuthService
{
    Task<UserDto> RegisterAsync(UserRegisterDto registerDto);
    Task<string> LoginAsync(UserLoginDto loginDto);
    Task VerifyEmailAsync(string studentNumber, string code);
    Task<string> CompleteTrainingAsync(int userId);
}