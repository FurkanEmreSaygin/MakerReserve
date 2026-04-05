using System.ComponentModel.DataAnnotations;

namespace Entities.DTOs.UserDTOs;

public class UserRegisterDto
{
    [Required(ErrorMessage = "Öğrenci numarası zorunludur.")]
    [StringLength(15, ErrorMessage = "Öğrenci numarası en fazla 15 karakter olabilir.")]
    public string StudentNumber { get; set; } = string.Empty;

    [Required(ErrorMessage = "Ad zorunludur.")]
    [MaxLength(50, ErrorMessage = "Ad en fazla 50 karakter olabilir.")]
    public string FirstName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Soyad zorunludur.")]
    [MaxLength(50, ErrorMessage = "Soyad en fazla 50 karakter olabilir.")]
    public string LastName { get; set; } = string.Empty;

    [Phone(ErrorMessage = "Lütfen geçerli bir telefon numarası giriniz.")]
    [MaxLength(15, ErrorMessage = "Telefon numarası en fazla 15 karakter olabilir.")]
    public string PhoneNumber { get; set; } = string.Empty;

    [Required(ErrorMessage = "Şifre zorunludur.")]
    [StringLength(50, MinimumLength = 8, ErrorMessage = "Şifre en az 8, en fazla 50 karakter uzunluğunda olmalıdır.")]
    public string Password { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public int Grade { get; set; }
}