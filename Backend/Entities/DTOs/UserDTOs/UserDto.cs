namespace Entities.DTOs.UserDTOs;

public class UserDto
{
    public int Id { get; set; }
    public string StudentNumber { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public bool HasCompletedTraining { get; set; }
    public string Role { get; set; } = string.Empty;
}