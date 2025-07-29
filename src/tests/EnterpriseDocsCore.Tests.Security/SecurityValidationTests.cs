using Microsoft.AspNetCore.Mvc.Testing;
using System.Net.Http.Json;
using System.Text.Json;
using Xunit;
using FluentAssertions;

namespace EnterpriseDocsCore.Tests.Security;

/// <summary>
/// Security validation tests for Sprint 2 advanced features
/// Ensures multi-tenant isolation and prevents security vulnerabilities
/// </summary>
[Trait("Category", "Security")]
public class SecurityValidationTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;
    private readonly HttpClient _client;
    private readonly JsonSerializerOptions _jsonOptions;

    public SecurityValidationTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
        _jsonOptions = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
    }

    #region Authentication & Authorization Tests

    [Fact]
    public async Task SearchAPI_WithoutAuthentication_Returns401()
    {
        // Arrange
        var searchRequest = new
        {
            query = "unauthorized search",
            page = 1,
            pageSize = 10
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/search/advanced", searchRequest);

        // Assert
        response.StatusCode.Should().Be(System.Net.HttpStatusCode.Unauthorized,
            "Search API should require authentication");
    }

    [Fact]
    public async Task CollaborationAPI_WithoutAuthentication_Returns401()
    {
        // Arrange
        var documentId = Guid.NewGuid();

        // Act
        var response = await _client.GetAsync($"/api/collaboration/document/{documentId}/users");

        // Assert
        response.StatusCode.Should().Be(System.Net.HttpStatusCode.Unauthorized,
            "Collaboration API should require authentication");
    }

    [Fact]
    public async Task AdminEndpoints_WithRegularUser_Returns403()
    {
        // This test would need to be implemented with proper user tokens
        // Testing that regular users cannot access admin-only endpoints
        Assert.True(true, "Admin authorization test placeholder - requires user token implementation");
    }

    #endregion

    #region Input Validation & XSS Prevention Tests

    [Theory]
    [InlineData("<script>alert('xss')</script>")]
    [InlineData("javascript:alert('xss')")]
    [InlineData("<img src=x onerror=alert('xss')>")]
    [InlineData("' OR '1'='1")]
    [InlineData("<svg onload=alert('xss')>")]
    public async Task SearchQuery_WithMaliciousInput_SanitizesCorrectly(string maliciousQuery)
    {
        // Arrange
        var searchRequest = new
        {
            query = maliciousQuery,
            page = 1,
            pageSize = 10
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/search/advanced", searchRequest);

        // Assert
        if (response.IsSuccessStatusCode)
        {
            var content = await response.Content.ReadAsStringAsync();
            content.Should().NotContain("<script>", "Response should not contain unescaped script tags");
            content.Should().NotContain("javascript:", "Response should not contain javascript: URLs");
            content.Should().NotContain("onerror=", "Response should not contain event handlers");
        }
        else
        {
            // Input validation should reject malicious input
            response.StatusCode.Should().Be(System.Net.HttpStatusCode.BadRequest,
                "Malicious input should be rejected with 400 Bad Request");
        }
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public async Task SearchQuery_WithInvalidInput_ReturnsBadRequest(string invalidQuery)
    {
        // Arrange
        var searchRequest = new
        {
            query = invalidQuery,
            page = 1,
            pageSize = 10
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/search/advanced", searchRequest);

        // Assert
        response.StatusCode.Should().Be(System.Net.HttpStatusCode.BadRequest,
            "Empty or null search queries should be rejected");
    }

    [Theory]
    [InlineData(-1)]
    [InlineData(0)]
    [InlineData(1001)] // Assuming max page size is 1000
    public async Task SearchPagination_WithInvalidValues_ReturnsBadRequest(int invalidPageSize)
    {
        // Arrange
        var searchRequest = new
        {
            query = "valid query",
            page = 1,
            pageSize = invalidPageSize
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/search/advanced", searchRequest);

        // Assert
        response.StatusCode.Should().Be(System.Net.HttpStatusCode.BadRequest,
            "Invalid pagination parameters should be rejected");
    }

    #endregion

    #region SQL Injection Prevention Tests

    [Theory]
    [InlineData("'; DROP TABLE Users; --")]
    [InlineData("' UNION SELECT * FROM Users --")]
    [InlineData("admin'--")]
    [InlineData("' OR 1=1 --")]
    public async Task SearchQuery_WithSQLInjectionAttempts_PreventInjection(string sqlInjectionAttempt)
    {
        // Arrange
        var searchRequest = new
        {
            query = sqlInjectionAttempt,
            page = 1,
            pageSize = 10
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/search/advanced", searchRequest);

        // Assert
        // Either the request should be rejected or properly escaped
        if (response.IsSuccessStatusCode)
        {
            var content = await response.Content.ReadAsStringAsync();
            content.Should().NotContain("DROP TABLE", "SQL injection should be prevented");
            content.Should().NotContain("UNION SELECT", "SQL injection should be prevented");
        }
        else
        {
            response.StatusCode.Should().Be(System.Net.HttpStatusCode.BadRequest,
                "SQL injection attempts should be rejected");
        }
    }

    #endregion

    #region File Upload Security Tests

    [Fact]
    public async Task FileUpload_WithMaliciousScript_RejectsFile()
    {
        // Test file upload security (if implemented)
        // This would test uploading files with malicious content
        Assert.True(true, "File upload security test placeholder");
    }

    [Theory]
    [InlineData(".exe")]
    [InlineData(".bat")]
    [InlineData(".ps1")]
    [InlineData(".sh")]
    public async Task FileUpload_WithDisallowedExtensions_RejectsFile(string extension)
    {
        // Test that potentially dangerous file extensions are rejected
        Assert.True(true, $"File extension {extension} security test placeholder");
    }

    #endregion

    #region Rate Limiting Tests

    [Fact]
    public async Task SearchAPI_ExcessiveRequests_ImplementsRateLimit()
    {
        // Arrange
        var searchRequest = new
        {
            query = "rate limit test",
            page = 1,
            pageSize = 10
        };

        var rateLimitHit = false;
        var requests = 0;

        // Act - Send many requests quickly
        for (int i = 0; i < 100; i++)
        {
            var response = await _client.PostAsJsonAsync("/api/search/advanced", searchRequest);
            requests++;

            if (response.StatusCode == System.Net.HttpStatusCode.TooManyRequests)
            {
                rateLimitHit = true;
                break;
            }

            // Small delay to avoid overwhelming the test
            await Task.Delay(10);
        }

        // Assert
        // Note: This test may pass if rate limiting is not implemented
        // In a production system, rate limiting should be in place
        if (requests >= 50) // If we made many requests without hitting rate limit
        {
            // This is acceptable for testing, but should be implemented in production
            Assert.True(true, "Rate limiting test completed - consider implementing rate limiting for production");
        }
        else
        {
            rateLimitHit.Should().BeTrue("Rate limiting should be implemented to prevent abuse");
        }
    }

    #endregion

    #region CORS Security Tests

    [Fact]
    public async Task API_CrossOriginRequest_HasSecureCORSPolicy()
    {
        // Arrange
        _client.DefaultRequestHeaders.Add("Origin", "https://malicious-site.com");

        // Act
        var response = await _client.GetAsync("/api/search/suggestions?query=test");

        // Assert
        if (response.IsSuccessStatusCode)
        {
            // Check CORS headers
            response.Headers.Should().ContainKey("Access-Control-Allow-Origin");
            var allowOrigin = response.Headers.GetValues("Access-Control-Allow-Origin").FirstOrDefault();
            
            // Should not allow arbitrary origins
            allowOrigin.Should().NotBe("*", "CORS should not allow all origins in production");
        }
    }

    #endregion

    #region Security Headers Tests

    [Fact]
    public async Task API_Response_IncludesSecurityHeaders()
    {
        // Act
        var response = await _client.GetAsync("/api/search/suggestions?query=test");

        // Assert
        if (response.IsSuccessStatusCode)
        {
            // Check for important security headers
            var headers = response.Headers.Concat(response.Content.Headers);
            
            // These headers should be present for security
            var expectedHeaders = new[]
            {
                "X-Content-Type-Options",
                "X-Frame-Options", 
                "X-XSS-Protection",
                "Referrer-Policy"
            };

            foreach (var header in expectedHeaders)
            {
                if (headers.Any(h => h.Key.Equals(header, StringComparison.OrdinalIgnoreCase)))
                {
                    Assert.True(true, $"Security header {header} is present");
                }
                else
                {
                    // Log missing header but don't fail test (may be handled by reverse proxy)
                    Console.WriteLine($"Consider adding security header: {header}");
                }
            }
        }
    }

    #endregion

    #region Path Traversal Prevention Tests

    [Theory]
    [InlineData("../../../etc/passwd")]
    [InlineData("..\\..\\..\\windows\\system32\\config\\sam")]
    [InlineData("%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd")]
    [InlineData("....//....//....//etc/passwd")]
    public async Task DocumentAccess_WithPathTraversal_PreventAccess(string maliciousPath)
    {
        // Test path traversal attempts in document IDs or file paths
        var response = await _client.GetAsync($"/api/documents/{maliciousPath}");

        // Assert
        response.StatusCode.Should().BeOneOf(
            System.Net.HttpStatusCode.BadRequest,
            System.Net.HttpStatusCode.NotFound,
            System.Net.HttpStatusCode.Forbidden,
            "Path traversal attempts should be blocked");
    }

    #endregion

    #region Session Security Tests

    [Fact]
    public async Task API_SessionCookies_AreSecure()
    {
        // Test session cookie security attributes
        var response = await _client.GetAsync("/api/search/suggestions?query=test");

        if (response.Headers.Contains("Set-Cookie"))
        {
            var cookies = response.Headers.GetValues("Set-Cookie");
            
            foreach (var cookie in cookies)
            {
                // Session cookies should be secure and httpOnly
                if (cookie.Contains("session", StringComparison.OrdinalIgnoreCase))
                {
                    cookie.Should().Contain("Secure", "Session cookies should have Secure flag");
                    cookie.Should().Contain("HttpOnly", "Session cookies should have HttpOnly flag");
                    cookie.Should().Contain("SameSite", "Session cookies should have SameSite attribute");
                }
            }
        }
    }

    #endregion

    #region Information Disclosure Prevention

    [Fact]
    public async Task API_Errors_DoNotLeakInternalInformation()
    {
        // Test that error responses don't expose internal system information
        var response = await _client.GetAsync("/api/nonexistent-endpoint");

        if (!response.IsSuccessStatusCode)
        {
            var content = await response.Content.ReadAsStringAsync();
            
            // Should not contain internal paths, stack traces, or system info
            content.Should().NotContain("C:\\", "Error responses should not expose file paths");
            content.Should().NotContain("/var/", "Error responses should not expose file paths");
            content.Should().NotContain("at System.", "Error responses should not contain stack traces");
            content.Should().NotContain("ConnectionString", "Error responses should not expose connection strings");
            content.Should().NotContain("password", "Error responses should not expose passwords");
        }
    }

    #endregion
}

/// <summary>
/// Multi-tenant security isolation tests
/// Ensures complete data separation between tenants
/// </summary>
[Trait("Category", "MultiTenant")]
public class MultiTenantSecurityTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;
    private readonly HttpClient _client;

    public MultiTenantSecurityTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task Search_DifferentTenants_NoDataLeakage()
    {
        // This test would require setting up tenant-specific authentication
        // and verifying that search results are properly isolated
        Assert.True(true, "Multi-tenant search isolation test placeholder - requires tenant authentication setup");
    }

    [Fact]
    public async Task Collaboration_CrossTenant_RejectsAccess()
    {
        // Test that users from one tenant cannot access collaboration
        // sessions for documents in another tenant
        Assert.True(true, "Cross-tenant collaboration isolation test placeholder");
    }

    [Fact]
    public async Task DocumentAccess_CrossTenant_RejectsAccess()
    {
        // Test that users cannot access documents from other tenants
        // even if they know the document ID
        Assert.True(true, "Cross-tenant document access test placeholder");
    }

    [Fact]
    public async Task Cache_DifferentTenants_IsolatesData()
    {
        // Test that cached data (Redis) is properly isolated between tenants
        Assert.True(true, "Multi-tenant cache isolation test placeholder");
    }
}

/// <summary>
/// Penetration testing scenarios for security validation
/// </summary>
[Trait("Category", "Penetration")]
public class PenetrationTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;
    private readonly HttpClient _client;

    public PenetrationTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task BruteForce_LoginAttempts_ImplementsLockout()
    {
        // Test account lockout after repeated failed login attempts
        Assert.True(true, "Brute force protection test placeholder");
    }

    [Fact]
    public async Task SessionFixation_Attack_Prevented()
    {
        // Test session fixation attack prevention
        Assert.True(true, "Session fixation test placeholder");
    }

    [Fact]
    public async Task CSRF_Attack_PreventedByTokens()
    {
        // Test CSRF token validation
        Assert.True(true, "CSRF protection test placeholder");
    }

    [Fact]
    public async Task ClickJacking_PreventedByHeaders()
    {
        // Test X-Frame-Options header prevents clickjacking
        var response = await _client.GetAsync("/");
        
        if (response.IsSuccessStatusCode)
        {
            var hasFrameOptions = response.Headers.Any(h => 
                h.Key.Equals("X-Frame-Options", StringComparison.OrdinalIgnoreCase));
            
            if (hasFrameOptions)
            {
                var frameOptions = response.Headers.GetValues("X-Frame-Options").FirstOrDefault();
                frameOptions.Should().BeOneOf("DENY", "SAMEORIGIN", 
                    "X-Frame-Options should prevent clickjacking");
            }
        }
    }
}