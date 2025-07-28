using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;
using EnterpriseDocsCore.Domain.Interfaces;

namespace EnterpriseDocsCore.Infrastructure.Services;

/// <summary>
/// Password hashing and verification service using BCrypt
/// </summary>
public class PasswordService : IPasswordService
{
    private readonly ILogger<PasswordService> _logger;
    private readonly int _workFactor;
    
    // Password complexity requirements
    private readonly int _minLength;
    private readonly bool _requireUppercase;
    private readonly bool _requireLowercase;
    private readonly bool _requireDigits;
    private readonly bool _requireSpecialChars;

    public PasswordService(IConfiguration configuration, ILogger<PasswordService> logger)
    {
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        
        var passwordSection = configuration.GetSection("Security:Password");
        _workFactor = int.TryParse(passwordSection["BCryptWorkFactor"], out var workFactor) ? workFactor : 12;
        _minLength = int.TryParse(passwordSection["MinLength"], out var minLength) ? minLength : 8;
        _requireUppercase = bool.TryParse(passwordSection["RequireUppercase"], out var requireUpper) ? requireUpper : true;
        _requireLowercase = bool.TryParse(passwordSection["RequireLowercase"], out var requireLower) ? requireLower : true;
        _requireDigits = bool.TryParse(passwordSection["RequireDigits"], out var requireDigits) ? requireDigits : true;
        _requireSpecialChars = bool.TryParse(passwordSection["RequireSpecialChars"], out var requireSpecial) ? requireSpecial : true;
    }

    public string HashPassword(string password)
    {
        if (string.IsNullOrEmpty(password))
        {
            throw new ArgumentException("Password cannot be null or empty", nameof(password));
        }

        try
        {
            // Use BCrypt for secure password hashing
            var hash = BCrypt.Net.BCrypt.HashPassword(password, _workFactor);
            _logger.LogDebug("Password hashed successfully with work factor {WorkFactor}", _workFactor);
            return hash;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to hash password");
            throw;
        }
    }

    public bool VerifyPassword(string password, string hash)
    {
        if (string.IsNullOrEmpty(password))
        {
            return false;
        }

        if (string.IsNullOrEmpty(hash))
        {
            return false;
        }

        try
        {
            var isValid = BCrypt.Net.BCrypt.Verify(password, hash);
            _logger.LogDebug("Password verification result: {IsValid}", isValid);
            return isValid;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to verify password");
            return false;
        }
    }

    public bool IsPasswordValid(string password, out List<string> errors)
    {
        errors = new List<string>();

        if (string.IsNullOrEmpty(password))
        {
            errors.Add("Password is required");
            return false;
        }

        if (password.Length < _minLength)
        {
            errors.Add($"Password must be at least {_minLength} characters long");
        }

        if (_requireUppercase && !password.Any(char.IsUpper))
        {
            errors.Add("Password must contain at least one uppercase letter");
        }

        if (_requireLowercase && !password.Any(char.IsLower))
        {
            errors.Add("Password must contain at least one lowercase letter");
        }

        if (_requireDigits && !password.Any(char.IsDigit))
        {
            errors.Add("Password must contain at least one digit");
        }

        if (_requireSpecialChars && !Regex.IsMatch(password, @"[!@#$%^&*()_+\-=\[\]{};':"",.<>?]"))
        {
            errors.Add("Password must contain at least one special character");
        }

        // Check for common weak patterns
        if (Regex.IsMatch(password, @"^(.)\1+$")) // All same character
        {
            errors.Add("Password cannot be all the same character");
        }

        if (Regex.IsMatch(password, @"^(012|123|234|345|456|567|678|789|890|abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)", RegexOptions.IgnoreCase))
        {
            errors.Add("Password cannot contain sequential characters");
        }

        var isValid = errors.Count == 0;
        _logger.LogDebug("Password validation result: {IsValid}, errors: {ErrorCount}", isValid, errors.Count);
        
        return isValid;
    }

    public string GenerateSecurePassword(int length = 16)
    {
        if (length < 8)
        {
            throw new ArgumentException("Password length must be at least 8 characters", nameof(length));
        }

        const string uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const string lowercase = "abcdefghijklmnopqrstuvwxyz";
        const string digits = "0123456789";
        const string specialChars = "!@#$%^&*()_+-=[]{}|;:,.<>?";
        
        var allChars = uppercase + lowercase + digits + specialChars;
        var password = new StringBuilder();
        
        using var rng = RandomNumberGenerator.Create();
        
        // Ensure at least one character from each required category
        if (_requireUppercase)
        {
            password.Append(GetRandomChar(uppercase, rng));
        }
        
        if (_requireLowercase)
        {
            password.Append(GetRandomChar(lowercase, rng));
        }
        
        if (_requireDigits)
        {
            password.Append(GetRandomChar(digits, rng));
        }
        
        if (_requireSpecialChars)
        {
            password.Append(GetRandomChar(specialChars, rng));
        }

        // Fill the rest with random characters
        for (int i = password.Length; i < length; i++)
        {
            password.Append(GetRandomChar(allChars, rng));
        }

        // Shuffle the password to avoid predictable patterns
        var shuffled = password.ToString().ToCharArray();
        for (int i = shuffled.Length - 1; i > 0; i--)
        {
            var j = GetRandomInt(0, i + 1, rng);
            (shuffled[i], shuffled[j]) = (shuffled[j], shuffled[i]);
        }

        var result = new string(shuffled);
        _logger.LogDebug("Generated secure password of length {Length}", length);
        
        return result;
    }

    public string GeneratePasswordResetToken()
    {
        try
        {
            var tokenBytes = new byte[32];
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(tokenBytes);
            
            var token = Convert.ToBase64String(tokenBytes);
            _logger.LogDebug("Generated password reset token");
            
            return token;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to generate password reset token");
            throw;
        }
    }

    public bool IsPasswordResetTokenValid(string token, DateTime createdAt, int validityHours = 24)
    {
        if (string.IsNullOrEmpty(token))
        {
            return false;
        }

        var expiresAt = createdAt.AddHours(validityHours);
        var isValid = DateTime.UtcNow <= expiresAt;
        
        _logger.LogDebug("Password reset token validation: {IsValid}, created: {CreatedAt}, expires: {ExpiresAt}", 
            isValid, createdAt, expiresAt);
        
        return isValid;
    }

    private static char GetRandomChar(string chars, RandomNumberGenerator rng)
    {
        var index = GetRandomInt(0, chars.Length, rng);
        return chars[index];
    }

    private static int GetRandomInt(int min, int max, RandomNumberGenerator rng)
    {
        var bytes = new byte[4];
        rng.GetBytes(bytes);
        var value = Math.Abs(BitConverter.ToInt32(bytes, 0));
        return min + (value % (max - min));
    }
}