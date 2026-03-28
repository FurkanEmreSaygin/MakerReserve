using System.Net;
using System.Net.Mail;
using Business.Abstract;
using Microsoft.Extensions.Configuration;

namespace Business.Concrete;

public class EmailService : IEmailService
{
    private readonly IConfiguration _config;

    public EmailService(IConfiguration config)
    {
        _config = config;
    }

    public async Task SendVerificationEmailAsync(string toEmail, string verificationCode)
    {
        var emailSettings = _config.GetSection("EmailSettings");
        var mail = emailSettings["Mail"];
        var pw = emailSettings["Password"];
        var host = emailSettings["Host"];
        var port = int.Parse(emailSettings["Port"]!);
        var displayName = emailSettings["DisplayName"];

        // Mail Sunucusu Ayarları (Gmail)
        var client = new SmtpClient(host, port)
        {
            EnableSsl = true,
            Credentials = new NetworkCredential(mail, pw)
        };

        // Mailin İçeriği (HTML formatında şık bir tasarım)
        var mailMessage = new MailMessage
        {
            From = new MailAddress(mail!, displayName),
            Subject = "MakerReserve - Hesabınızı Doğrulayın",
            IsBodyHtml = true,
            Body = $@"
                <div style='font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 10px; max-width: 500px; margin: auto;'>
                    <h2 style='color: #1976d2; text-align: center;'>MakerReserve'e Hoş Geldiniz!</h2>
                    <p>Merhaba,</p>
                    <p>3D Yazıcı Laboratuvarı randevu sistemine kaydınız başarıyla alındı. Hesabınızı aktifleştirmek için aşağıdaki 6 haneli doğrulama kodunu kullanın:</p>
                    <div style='text-align: center; margin: 30px 0;'>
                        <span style='font-size: 24px; font-weight: bold; background-color: #f4f4f4; padding: 10px 20px; border-radius: 5px; letter-spacing: 5px; color: #333;'>
                            {verificationCode}
                        </span>
                    </div>
                    <p style='color: #777; font-size: 12px; text-align: center;'>Bu kodu kimseyle paylaşmayın. Laboratuvarda iyi çalışmalar dileriz!</p>
                </div>"
        };

        mailMessage.To.Add(toEmail);

        // Maili Gönder
        await client.SendMailAsync(mailMessage);
    }
}