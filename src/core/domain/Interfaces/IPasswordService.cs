namespace EnterpriseDocsCore.Domain.Interfaces;

/// <summary>
/// Password hashing and verification service interface
/// </summary>
public interface IPasswordService
{
    /// <summary>
    /// Hash a password using a secure algorithm
    /// </summary>
    string HashPassword(string password);
    
    /// <summary>
    /// Verify a password against its hash
    /// </summary>
    bool VerifyPassword(string password, string hash);
    
    /// <summary>
    /// Check if a password meets complexity requirements
    /// </summary>
    bool IsPasswordValid(string password, out List<string> errors);
    
    /// <summary>
    /// Generate a secure random password
    /// </summary>
    string GenerateSecurePassword(int length = 16);
    
    /// <summary>
    /// Generate a password reset token
    /// </summary>
    string GeneratePasswordResetToken();
    
    /// <summary>
    /// Validate a password reset token
    /// </summary>
    bool IsPasswordResetTokenValid(string token, DateTime createdAt, int validityHours = 24);
}