namespace Business.Abstract;

public interface IEmailService
{
    Task SendVerificationEmailAsync(string toEmail, string verificationCode);
}