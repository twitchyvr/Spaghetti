using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using EnterpriseDocsCore.Infrastructure.Data;
using EnterpriseDocsCore.Domain.Entities;

namespace EnterpriseDocsCore.Infrastructure.Services;

public class DatabaseSeedingService
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<DatabaseSeedingService> _logger;

    public DatabaseSeedingService(ApplicationDbContext context, ILogger<DatabaseSeedingService> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Seeds the database with comprehensive sample data for demo purposes
    /// </summary>
    public async Task SeedSampleDataAsync()
    {
        try
        {
            _logger.LogInformation("Starting database seeding with sample data...");

            // Check if sample data already exists
            if (await _context.Tenants.AnyAsync(t => t.Subdomain == "demo-legal"))
            {
                _logger.LogInformation("Sample data already exists, skipping seeding");
                return;
            }

            await using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                // 1. Create system roles if they don't exist
                await CreateSystemRolesIfNotExist();
                
                // 2. Create demo tenants
                var demoTenants = CreateDemoTenants();
                _context.Tenants.AddRange(demoTenants);
                await _context.SaveChangesAsync();

                // 3. Create sample users
                var sampleUsers = CreateSampleUsers(demoTenants);
                _context.Users.AddRange(sampleUsers);
                await _context.SaveChangesAsync();

                // 4. Assign user roles
                var userRoles = CreateUserRoles(sampleUsers);
                _context.UserRoles.AddRange(userRoles);
                await _context.SaveChangesAsync();

                // 5. Create sample documents
                var sampleDocuments = CreateSampleDocuments(sampleUsers, demoTenants);
                _context.Documents.AddRange(sampleDocuments);
                await _context.SaveChangesAsync();

                // 6. Create document tags
                var documentTags = CreateDocumentTags(sampleDocuments);
                _context.DocumentTags.AddRange(documentTags);
                await _context.SaveChangesAsync();

                // 7. Create document permissions
                var documentPermissions = CreateDocumentPermissions(sampleDocuments, sampleUsers);
                _context.DocumentPermissions.AddRange(documentPermissions);
                await _context.SaveChangesAsync();

                // 8. Create tenant modules
                var tenantModules = CreateTenantModules(demoTenants, sampleUsers.First());
                _context.TenantModules.AddRange(tenantModules);
                await _context.SaveChangesAsync();

                // 9. Create audit entries for realistic activity
                var auditEntries = CreateAuditEntries(sampleUsers, sampleDocuments, demoTenants);
                _context.DocumentAuditEntries.AddRange(auditEntries.DocumentAudits);
                _context.UserAuditEntries.AddRange(auditEntries.UserAudits);
                _context.TenantAuditEntries.AddRange(auditEntries.TenantAudits);
                await _context.SaveChangesAsync();

                await transaction.CommitAsync();
                _logger.LogInformation("Successfully seeded database with sample data");
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Error occurred while seeding sample data");
                throw;
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to seed database with sample data");
            throw;
        }
    }

    /// <summary>
    /// Clears all data from the database for production deployment
    /// </summary>
    public async Task ClearAllDataAsync()
    {
        try
        {
            _logger.LogInformation("Starting to clear all data from database...");

            await using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                // Clear in dependency order to avoid foreign key constraints
                await _context.Database.ExecuteSqlRawAsync("DELETE FROM DocumentAuditEntries");
                await _context.Database.ExecuteSqlRawAsync("DELETE FROM UserAuditEntries");
                await _context.Database.ExecuteSqlRawAsync("DELETE FROM TenantAuditEntries");
                await _context.Database.ExecuteSqlRawAsync("DELETE FROM DocumentPermissions");
                await _context.Database.ExecuteSqlRawAsync("DELETE FROM DocumentTags");
                await _context.Database.ExecuteSqlRawAsync("DELETE FROM DocumentAttachments");
                await _context.Database.ExecuteSqlRawAsync("DELETE FROM Documents");
                await _context.Database.ExecuteSqlRawAsync("DELETE FROM TenantModules");
                await _context.Database.ExecuteSqlRawAsync("DELETE FROM UserRoles WHERE RoleId NOT IN (SELECT Id FROM Roles WHERE IsSystemRole = true)");
                await _context.Database.ExecuteSqlRawAsync("DELETE FROM UserAuthentications");
                await _context.Database.ExecuteSqlRawAsync("DELETE FROM Users");
                await _context.Database.ExecuteSqlRawAsync("DELETE FROM Roles WHERE IsSystemRole = false");
                await _context.Database.ExecuteSqlRawAsync("DELETE FROM Tenants");

                await transaction.CommitAsync();
                _logger.LogInformation("Successfully cleared all data from database");
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Error occurred while clearing database data");
                throw;
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to clear database data");
            throw;
        }
    }

    private List<Tenant> CreateDemoTenants()
    {
        return new List<Tenant>
        {
            new Tenant
            {
                Id = Guid.Parse("10000000-0000-0000-0000-000000000001"),
                Name = "Acme Legal Services",
                Subdomain = "demo-legal",
                Description = "Full-service legal firm specializing in corporate law and litigation",
                Status = TenantStatus.Active,
                Tier = TenantTier.Professional,
                Billing = new TenantBilling
                {
                    PlanId = "professional-monthly",
                    MonthlyRate = 299.99m,
                    Currency = "USD",
                    PaymentStatus = PaymentStatus.Current,
                    DocumentsCreatedThisMonth = 47,
                    APICallsThisMonth = 892,
                    StorageUsedBytes = 2147483648 // 2 GB
                },
                Configuration = new TenantConfiguration
                {
                    RequireMFA = true,
                    EnableAIFeatures = true,
                    EnableAutoDocumentation = true,
                    ComplianceFrameworks = new List<string> { "SOC2", "ISO27001" },
                    EnabledIntegrations = new Dictionary<string, bool>
                    {
                        ["slack"] = true,
                        ["teams"] = false,
                        ["sharepoint"] = true,
                        ["googledrive"] = false
                    }
                },
                Branding = new TenantBranding
                {
                    CompanyName = "Acme Legal Services",
                    PrimaryColor = "#1f2937",
                    SecondaryColor = "#6b7280",
                    AccentColor = "#3b82f6"
                }
            },
            new Tenant
            {
                Id = Guid.Parse("10000000-0000-0000-0000-000000000002"),
                Name = "TechStart Inc",
                Subdomain = "demo-techstart",
                Description = "Fast-growing technology startup focused on fintech solutions",
                Status = TenantStatus.Trial,
                Tier = TenantTier.Starter,
                Billing = new TenantBilling
                {
                    IsTrialActive = true,
                    TrialEndDate = DateTime.UtcNow.AddDays(14),
                    MonthlyRate = 99.99m,
                    Currency = "USD",
                    PaymentStatus = PaymentStatus.Current,
                    DocumentsCreatedThisMonth = 12,
                    APICallsThisMonth = 156
                },
                Configuration = new TenantConfiguration
                {
                    EnableAIFeatures = true,
                    EnableAutoDocumentation = false,
                    ComplianceFrameworks = new List<string> { "GDPR" }
                }
            },
            new Tenant
            {
                Id = Guid.Parse("10000000-0000-0000-0000-000000000003"),
                Name = "Global Consulting Group",
                Subdomain = "demo-consulting",
                Description = "International consulting firm serving Fortune 500 companies",
                Status = TenantStatus.Active,
                Tier = TenantTier.Enterprise,
                Billing = new TenantBilling
                {
                    PlanId = "enterprise-annual",
                    MonthlyRate = 999.99m,
                    Currency = "USD",
                    PaymentStatus = PaymentStatus.Current,
                    DocumentsCreatedThisMonth = 234,
                    APICallsThisMonth = 4567,
                    StorageUsedBytes = 10737418240 // 10 GB
                },
                Configuration = new TenantConfiguration
                {
                    RequireMFA = true,
                    RequireSSO = true,
                    EnableAIFeatures = true,
                    EnableAutoDocumentation = true,
                    EnableVoiceCapture = true,
                    EnableScreenCapture = true,
                    ComplianceFrameworks = new List<string> { "SOC2", "ISO27001", "HIPAA", "GDPR" }
                }
            }
        };
    }

    private List<User> CreateSampleUsers(List<Tenant> tenants)
    {
        var users = new List<User>();
        var baseDate = DateTime.UtcNow.AddDays(-30);

        // Demo user (matches frontend auth bypass)
        users.Add(new User
        {
            Id = Guid.NewGuid(),
            FirstName = "Demo",
            LastName = "User",
            Email = "demo@enterprise-docs.com",
            IsActive = true,
            TenantId = tenants[0].Id,
            LastLoginAt = DateTime.UtcNow.AddMinutes(-15),
            Profile = new UserProfile
            {
                JobTitle = "Platform Administrator",
                Department = "IT",
                Industry = "Legal",
                TimeZone = "UTC",
                Language = "en"
            },
            Settings = new UserSettings
            {
                EnableAIAssistance = true,
                EnableAutoDocumentation = true,
                Theme = "dark"
            }
        });

        // Acme Legal users
        users.AddRange(new[]
        {
            new User
            {
                Id = Guid.NewGuid(),
                FirstName = "Sarah",
                LastName = "Johnson",
                Email = "sarah.johnson@acmelegal.com",
                TenantId = tenants[0].Id,
                LastLoginAt = DateTime.UtcNow.AddHours(-2),
                Profile = new UserProfile
                {
                    JobTitle = "Senior Partner",
                    Department = "Corporate Law",
                    Industry = "Legal",
                    PhoneNumber = "+1-555-0123"
                }
            },
            new User
            {
                Id = Guid.NewGuid(),
                FirstName = "Michael",
                LastName = "Chen",
                Email = "michael.chen@acmelegal.com",
                TenantId = tenants[0].Id,
                LastLoginAt = DateTime.UtcNow.AddDays(-1),
                Profile = new UserProfile
                {
                    JobTitle = "Associate Attorney",
                    Department = "Litigation",
                    Industry = "Legal"
                }
            },
            new User
            {
                Id = Guid.NewGuid(),
                FirstName = "Emily",
                LastName = "Rodriguez",
                Email = "emily.rodriguez@acmelegal.com",
                TenantId = tenants[0].Id,
                LastLoginAt = DateTime.UtcNow.AddHours(-6),
                Profile = new UserProfile
                {
                    JobTitle = "Legal Secretary",
                    Department = "Administration",
                    Industry = "Legal"
                }
            }
        });

        // TechStart users
        users.AddRange(new[]
        {
            new User
            {
                Id = Guid.NewGuid(),
                FirstName = "Alex",
                LastName = "Thompson",
                Email = "alex@techstart.com",
                TenantId = tenants[1].Id,
                LastLoginAt = DateTime.UtcNow.AddHours(-1),
                Profile = new UserProfile
                {
                    JobTitle = "CEO & Founder",
                    Department = "Executive",
                    Industry = "Technology"
                }
            },
            new User
            {
                Id = Guid.NewGuid(),
                FirstName = "Jamie",
                LastName = "Park",
                Email = "jamie@techstart.com",
                TenantId = tenants[1].Id,
                LastLoginAt = DateTime.UtcNow.AddDays(-2),
                Profile = new UserProfile
                {
                    JobTitle = "Head of Product",
                    Department = "Product",
                    Industry = "Technology"
                }
            }
        });

        // Global Consulting users
        users.AddRange(new[]
        {
            new User
            {
                Id = Guid.NewGuid(),
                FirstName = "Dr. Robert",
                LastName = "Williams",
                Email = "robert.williams@globalconsulting.com",
                TenantId = tenants[2].Id,
                LastLoginAt = DateTime.UtcNow.AddMinutes(-30),
                Profile = new UserProfile
                {
                    JobTitle = "Managing Director",
                    Department = "Strategy",
                    Industry = "Consulting"
                }
            },
            new User
            {
                Id = Guid.NewGuid(),
                FirstName = "Lisa",
                LastName = "Davis",
                Email = "lisa.davis@globalconsulting.com",
                TenantId = tenants[2].Id,
                LastLoginAt = DateTime.UtcNow.AddHours(-4),
                Profile = new UserProfile
                {
                    JobTitle = "Senior Consultant",
                    Department = "Operations",
                    Industry = "Consulting"
                }
            }
        });

        return users;
    }

    private List<UserRole> CreateUserRoles(List<User> users)
    {
        var userRoles = new List<UserRole>();
        
        // Get system roles
        var systemAdminRoleId = Guid.Parse("11111111-1111-1111-1111-111111111111");
        var tenantAdminRoleId = Guid.Parse("22222222-2222-2222-2222-222222222222");
        var userRoleId = Guid.Parse("33333333-3333-3333-3333-333333333333");

        // Assign demo user as system admin
        userRoles.Add(new UserRole
        {
            UserId = users[0].Id, // Demo user
            RoleId = systemAdminRoleId,
            AssignedBy = users[0].Id
        });

        // Assign first user from each tenant as tenant admin
        var tenantGroups = users.Skip(1).GroupBy(u => u.TenantId).ToList();
        foreach (var group in tenantGroups)
        {
            var firstUser = group.First();
            userRoles.Add(new UserRole
            {
                UserId = firstUser.Id,
                RoleId = tenantAdminRoleId,
                AssignedBy = users[0].Id
            });

            // Assign others as regular users
            foreach (var user in group.Skip(1))
            {
                userRoles.Add(new UserRole
                {
                    UserId = user.Id,
                    RoleId = userRoleId,
                    AssignedBy = firstUser.Id
                });
            }
        }

        return userRoles;
    }

    private List<Document> CreateSampleDocuments(List<User> users, List<Tenant> tenants)
    {
        var documents = new List<Document>();
        var random = new Random();

        // Legal documents for Acme Legal
        var legalUsers = users.Where(u => u.TenantId == tenants[0].Id).ToList();
        documents.AddRange(new[]
        {
            new Document
            {
                Title = "Corporate Merger Agreement - Acme Corp & Beta LLC",
                Content = GenerateLegalDocumentContent("merger"),
                DocumentType = "Contract",
                Industry = "Legal",
                Status = DocumentStatus.Approved,
                CreatedBy = legalUsers[0].Id,
                TenantId = tenants[0].Id,
                CreatedAt = DateTime.UtcNow.AddDays(-15),
                UpdatedAt = DateTime.UtcNow.AddDays(-10),
                Version = 3,
                Metadata = new DocumentMetadata
                {
                    Keywords = new List<string> { "merger", "corporate", "acquisition", "due diligence" },
                    Summary = "Comprehensive merger agreement detailing terms and conditions for corporate acquisition",
                    WordCount = 12500,
                    SourceAgent = "Legal Document Generator"
                }
            },
            new Document
            {
                Title = "Employment Contract Template - Senior Associates",
                Content = GenerateLegalDocumentContent("employment"),
                DocumentType = "Template",
                Industry = "Legal",
                Status = DocumentStatus.Published,
                CreatedBy = legalUsers[1].Id,
                TenantId = tenants[0].Id,
                CreatedAt = DateTime.UtcNow.AddDays(-8),
                UpdatedAt = DateTime.UtcNow.AddDays(-3),
                Metadata = new DocumentMetadata
                {
                    Keywords = new List<string> { "employment", "contract", "template", "senior associate" },
                    Summary = "Standardized employment contract template for senior associate positions",
                    WordCount = 3200
                }
            },
            new Document
            {
                Title = "Client Meeting Notes - Tech Startup Due Diligence",
                Content = GenerateLegalDocumentContent("meeting_notes"),
                DocumentType = "Meeting Notes",
                Industry = "Legal",
                Status = DocumentStatus.Draft,
                CreatedBy = legalUsers[2].Id,
                TenantId = tenants[0].Id,
                CreatedAt = DateTime.UtcNow.AddDays(-2),
                UpdatedAt = DateTime.UtcNow.AddHours(-6),
                Metadata = new DocumentMetadata
                {
                    Keywords = new List<string> { "due diligence", "tech startup", "meeting notes", "client" },
                    Summary = "Detailed notes from client meeting regarding tech startup acquisition due diligence",
                    WordCount = 1850,
                    SourceModule = "Voice Capture",
                    SourceCaptureTime = DateTime.UtcNow.AddDays(-2)
                }
            }
        });

        // Tech startup documents
        var techUsers = users.Where(u => u.TenantId == tenants[1].Id).ToList();
        documents.AddRange(new[]
        {
            new Document
            {
                Title = "Product Requirements Document - Mobile Banking App",
                Content = GenerateTechDocumentContent("prd"),
                DocumentType = "Product Spec",
                Industry = "Technology",
                Status = DocumentStatus.InReview,
                CreatedBy = techUsers[0].Id,
                TenantId = tenants[1].Id,
                CreatedAt = DateTime.UtcNow.AddDays(-5),
                UpdatedAt = DateTime.UtcNow.AddDays(-1),
                Metadata = new DocumentMetadata
                {
                    Keywords = new List<string> { "mobile", "banking", "app", "fintech", "requirements" },
                    Summary = "Comprehensive product requirements for new mobile banking application",
                    WordCount = 4200
                }
            },
            new Document
            {
                Title = "Go-to-Market Strategy Q2 2024",
                Content = GenerateTechDocumentContent("gtm"),
                DocumentType = "Strategy",
                Industry = "Technology",
                Status = DocumentStatus.Approved,
                CreatedBy = techUsers[1].Id,
                TenantId = tenants[1].Id,
                CreatedAt = DateTime.UtcNow.AddDays(-12),
                UpdatedAt = DateTime.UtcNow.AddDays(-7),
                Metadata = new DocumentMetadata
                {
                    Keywords = new List<string> { "go-to-market", "strategy", "Q2", "launch", "marketing" },
                    Summary = "Strategic plan for Q2 2024 product launch and market penetration",
                    WordCount = 2800
                }
            }
        });

        // Consulting documents
        var consultingUsers = users.Where(u => u.TenantId == tenants[2].Id).ToList();
        documents.AddRange(new[]
        {
            new Document
            {
                Title = "Digital Transformation Roadmap - Fortune 500 Client",
                Content = GenerateConsultingDocumentContent("transformation"),
                DocumentType = "Strategic Plan",
                Industry = "Consulting",
                Status = DocumentStatus.Published,
                CreatedBy = consultingUsers[0].Id,
                TenantId = tenants[2].Id,
                CreatedAt = DateTime.UtcNow.AddDays(-20),
                UpdatedAt = DateTime.UtcNow.AddDays(-15),
                Metadata = new DocumentMetadata
                {
                    Keywords = new List<string> { "digital transformation", "roadmap", "enterprise", "technology" },
                    Summary = "Comprehensive digital transformation strategy for large enterprise client",
                    WordCount = 8900
                }
            },
            new Document
            {
                Title = "Operations Efficiency Analysis - Manufacturing Sector",
                Content = GenerateConsultingDocumentContent("operations"),
                DocumentType = "Analysis Report",
                Industry = "Consulting",
                Status = DocumentStatus.Approved,
                CreatedBy = consultingUsers[1].Id,
                TenantId = tenants[2].Id,
                CreatedAt = DateTime.UtcNow.AddDays(-6),
                UpdatedAt = DateTime.UtcNow.AddDays(-2),
                Metadata = new DocumentMetadata
                {
                    Keywords = new List<string> { "operations", "efficiency", "manufacturing", "analysis" },
                    Summary = "Detailed analysis of manufacturing operations with efficiency recommendations",
                    WordCount = 6700
                }
            }
        });

        return documents;
    }

    private List<DocumentTag> CreateDocumentTags(List<Document> documents)
    {
        var tags = new List<DocumentTag>();

        foreach (var document in documents)
        {
            var keywordTags = document.Metadata.Keywords.Select(keyword => new DocumentTag
            {
                DocumentId = document.Id,
                Name = keyword,
                Category = "keyword",
                IsSystemGenerated = true,
                Confidence = 0.95f
            });

            tags.AddRange(keywordTags);

            // Add industry-specific tags
            var industryTag = new DocumentTag
            {
                DocumentId = document.Id,
                Name = document.Industry.ToLower(),
                Category = "industry",
                IsSystemGenerated = true,
                Confidence = 1.0f
            };
            tags.Add(industryTag);

            // Add document type tag
            var typeTag = new DocumentTag
            {
                DocumentId = document.Id,
                Name = document.DocumentType.ToLower().Replace(" ", "-"),
                Category = "type",
                IsSystemGenerated = true,
                Confidence = 1.0f
            };
            tags.Add(typeTag);
        }

        return tags;
    }

    private List<DocumentPermission> CreateDocumentPermissions(List<Document> documents, List<User> users)
    {
        var permissions = new List<DocumentPermission>();

        foreach (var document in documents)
        {
            // Creator gets admin permission
            permissions.Add(new DocumentPermission
            {
                DocumentId = document.Id,
                UserId = document.CreatedBy,
                Permission = PermissionType.Admin,
                GrantedBy = document.CreatedBy
            });

            // Other users in same tenant get read permission
            var tenantUsers = users.Where(u => u.TenantId == document.TenantId && u.Id != document.CreatedBy).ToList();
            foreach (var user in tenantUsers.Take(2)) // Limit to first 2 users
            {
                permissions.Add(new DocumentPermission
                {
                    DocumentId = document.Id,
                    UserId = user.Id,
                    Permission = PermissionType.Read,
                    GrantedBy = document.CreatedBy
                });
            }
        }

        return permissions;
    }

    private List<TenantModule> CreateTenantModules(List<Tenant> tenants, User enabledBy)
    {
        var modules = new List<TenantModule>();
        var moduleNames = new[] { "Voice Capture", "Screen Capture", "Slack Integration", "SharePoint Integration", "AI Assistant" };

        foreach (var tenant in tenants)
        {
            foreach (var moduleName in moduleNames)
            {
                var isEnabled = tenant.Tier == TenantTier.Enterprise || 
                              (tenant.Tier == TenantTier.Professional && moduleName != "Screen Capture") ||
                              (tenant.Tier == TenantTier.Starter && moduleName == "AI Assistant");

                modules.Add(new TenantModule
                {
                    TenantId = tenant.Id,
                    ModuleName = moduleName,
                    IsEnabled = isEnabled,
                    EnabledBy = enabledBy.Id,
                    Configuration = new Dictionary<string, object>
                    {
                        ["enabled"] = isEnabled,
                        ["configuredAt"] = DateTime.UtcNow
                    }
                });
            }
        }

        return modules;
    }

    private (List<DocumentAuditEntry> DocumentAudits, List<UserAuditEntry> UserAudits, List<TenantAuditEntry> TenantAudits)
        CreateAuditEntries(List<User> users, List<Document> documents, List<Tenant> tenants)
    {
        var documentAudits = new List<DocumentAuditEntry>();
        var userAudits = new List<UserAuditEntry>();
        var tenantAudits = new List<TenantAuditEntry>();

        // Document audit entries
        foreach (var document in documents.Take(5)) // Limit for performance
        {
            documentAudits.AddRange(new[]
            {
                new DocumentAuditEntry
                {
                    DocumentId = document.Id,
                    Action = "Created",
                    Timestamp = document.CreatedAt,
                    UserId = document.CreatedBy,
                    Details = $"Document '{document.Title}' created",
                    IPAddress = "192.168.1.100"
                },
                new DocumentAuditEntry
                {
                    DocumentId = document.Id,
                    Action = "Updated",
                    Timestamp = document.UpdatedAt,
                    UserId = document.CreatedBy,
                    Details = "Document content updated",
                    IPAddress = "192.168.1.100"
                }
            });
        }

        // User audit entries
        foreach (var user in users.Take(5))
        {
            userAudits.AddRange(new[]
            {
                new UserAuditEntry
                {
                    UserId = user.Id,
                    Action = "Login",
                    Timestamp = user.LastLoginAt ?? DateTime.UtcNow.AddHours(-1),
                    Details = "User logged in successfully",
                    IPAddress = "192.168.1.101",
                    IsSuccess = true
                },
                new UserAuditEntry
                {
                    UserId = user.Id,
                    Action = "ProfileUpdate",
                    Timestamp = DateTime.UtcNow.AddDays(-3),
                    Details = "User profile information updated",
                    IPAddress = "192.168.1.101",
                    IsSuccess = true
                }
            });
        }

        // Tenant audit entries
        foreach (var tenant in tenants)
        {
            tenantAudits.AddRange(new[]
            {
                new TenantAuditEntry
                {
                    TenantId = tenant.Id,
                    Action = "TenantCreated",
                    Timestamp = tenant.CreatedAt,
                    Details = $"Tenant '{tenant.Name}' created",
                    Severity = AuditSeverity.Information
                },
                new TenantAuditEntry
                {
                    TenantId = tenant.Id,
                    Action = "ConfigurationUpdated",
                    Timestamp = DateTime.UtcNow.AddDays(-5),
                    Details = "Tenant configuration settings updated",
                    Severity = AuditSeverity.Information
                }
            });
        }

        return (documentAudits, userAudits, tenantAudits);
    }

    private string GenerateLegalDocumentContent(string type)
    {
        return type switch
        {
            "merger" => @"MERGER AGREEMENT

This Merger Agreement (""Agreement"") is entered into on [DATE] between Acme Corporation, a [STATE] corporation (""Acme""), and Beta LLC, a [STATE] limited liability company (""Beta"").

WHEREAS, the parties desire to combine their respective businesses through a merger transaction;
WHEREAS, the Board of Directors of each party has approved this transaction;

NOW, THEREFORE, in consideration of the mutual covenants contained herein, the parties agree as follows:

1. MERGER TRANSACTION
   1.1 Structure: Beta shall merge with and into Acme
   1.2 Effective Date: [DATE]
   1.3 Surviving Entity: Acme Corporation

2. CONSIDERATION
   2.1 Cash Consideration: $[AMOUNT]
   2.2 Stock Consideration: [SHARES] shares of Acme common stock
   2.3 Earnout Provisions: Additional consideration based on performance metrics

3. REPRESENTATIONS AND WARRANTIES
   [Detailed representations and warranties of each party]

4. COVENANTS
   [Operating covenants and agreements]

5. CONDITIONS TO CLOSING
   [Conditions that must be satisfied before closing]

This agreement represents a significant step forward for both organizations...",

            "employment" => @"EMPLOYMENT AGREEMENT - SENIOR ASSOCIATE

This Employment Agreement (""Agreement"") is entered into between [COMPANY NAME] (""Company"") and [EMPLOYEE NAME] (""Employee"").

1. POSITION AND DUTIES
   Employee shall serve as Senior Associate in the [DEPARTMENT] department, reporting to [SUPERVISOR].

2. COMPENSATION
   2.1 Base Salary: $[AMOUNT] per year
   2.2 Bonus Eligibility: Up to [PERCENTAGE]% of base salary
   2.3 Benefits: Health, dental, vision, 401(k) with company match

3. CONFIDENTIALITY
   Employee agrees to maintain strict confidentiality regarding all client information and proprietary business information.

4. NON-COMPETE
   During employment and for [PERIOD] thereafter, Employee agrees not to compete with Company in the same geographic area.

5. TERMINATION
   Either party may terminate this agreement with [NOTICE PERIOD] written notice.

This agreement reflects our commitment to attracting top legal talent...",

            "meeting_notes" => @"CLIENT MEETING NOTES
Date: [DATE]
Attendees: [NAMES]
Subject: Tech Startup Due Diligence Review

AGENDA ITEMS DISCUSSED:

1. CORPORATE STRUCTURE REVIEW
   - Delaware C-Corporation status confirmed
   - Cap table analysis completed
   - Outstanding option grants reviewed

2. INTELLECTUAL PROPERTY AUDIT
   - 15 patents filed, 8 granted
   - Trademark portfolio comprehensive
   - No outstanding IP disputes identified

3. FINANCIAL DUE DILIGENCE
   - Revenue growth: 150% YoY
   - Burn rate: $200K/month
   - 18 months runway at current burn

4. REGULATORY COMPLIANCE
   - GDPR compliance measures in place
   - Financial services regulations reviewed
   - No outstanding regulatory issues

5. NEXT STEPS
   - Complete contract review by [DATE]
   - Schedule management presentations
   - Finalize purchase agreement terms

The client appears well-positioned for acquisition with minimal legal risks identified...",

            _ => "Sample legal document content would be generated here based on document type and requirements."
        };
    }

    private string GenerateTechDocumentContent(string type)
    {
        return type switch
        {
            "prd" => @"PRODUCT REQUIREMENTS DOCUMENT
Mobile Banking Application

1. EXECUTIVE SUMMARY
This document outlines the requirements for our new mobile banking application targeting millennial and Gen-Z users.

2. PRODUCT OVERVIEW
   2.1 Vision: Simplest, most intuitive mobile banking experience
   2.2 Target Users: Ages 18-35, tech-savvy, mobile-first
   2.3 Key Features: Instant transfers, budgeting tools, investment options

3. FUNCTIONAL REQUIREMENTS
   3.1 Account Management
       - Real-time balance updates
       - Transaction history with search/filter
       - Account alerts and notifications
   
   3.2 Money Movement
       - Instant P2P transfers
       - Bill pay functionality
       - Mobile check deposit
   
   3.3 Financial Insights
       - Spending categorization
       - Budget tracking and alerts
       - Credit score monitoring

4. NON-FUNCTIONAL REQUIREMENTS
   4.1 Security: Biometric authentication, encryption
   4.2 Performance: <2 second load times
   4.3 Availability: 99.9% uptime SLA

5. SUCCESS METRICS
   - Daily active users: 10K within 6 months
   - User retention: 80% at 30 days
   - App store rating: 4.5+ stars

This product will differentiate us in the competitive fintech market...",

            "gtm" => @"GO-TO-MARKET STRATEGY Q2 2024

1. MARKET OPPORTUNITY
   1.1 Total Addressable Market: $50B
   1.2 Target Segments: SMBs, Enterprise startups
   1.3 Competitive Landscape: 3 major players, opportunity for disruption

2. PRODUCT POSITIONING
   - Primary Value Prop: 50% faster implementation
   - Key Differentiators: AI-powered automation, intuitive UX
   - Pricing Strategy: Freemium model with premium tiers

3. LAUNCH STRATEGY
   3.1 Phase 1 (Weeks 1-4): Beta launch with select customers
   3.2 Phase 2 (Weeks 5-8): Public launch with PR campaign
   3.3 Phase 3 (Weeks 9-12): Scale and optimize

4. MARKETING CHANNELS
   4.1 Digital: Content marketing, SEM, social media
   4.2 Events: Industry conferences, webinars
   4.3 Partnerships: Integration partners, resellers

5. SALES STRATEGY
   - Inside sales team for SMB segment
   - Field sales for enterprise accounts
   - Channel partner program

6. SUCCESS METRICS
   - 1,000 signups in Q2
   - $500K ARR by end of Q2
   - 25% conversion from trial to paid

Our innovative approach positions us for rapid market penetration...",

            _ => "Sample tech document content would be generated here."
        };
    }

    private string GenerateConsultingDocumentContent(string type)
    {
        return type switch
        {
            "transformation" => @"DIGITAL TRANSFORMATION ROADMAP
Fortune 500 Manufacturing Client

EXECUTIVE SUMMARY
This roadmap outlines a comprehensive digital transformation strategy to modernize operations, enhance customer experience, and drive competitive advantage.

CURRENT STATE ASSESSMENT
- Legacy ERP systems with limited integration
- Manual processes consuming 40% of employee time
- Customer satisfaction score: 3.2/5.0
- Digital maturity score: 2.1/5.0

TRANSFORMATION VISION
Create an integrated, data-driven organization that delivers exceptional customer experiences while optimizing operational efficiency.

STRATEGIC PILLARS

1. TECHNOLOGY MODERNIZATION
   - Cloud migration strategy
   - API-first architecture
   - Data lake implementation
   - Investment: $15M over 24 months

2. PROCESS AUTOMATION
   - RPA implementation for routine tasks
   - Workflow optimization
   - AI-powered decision support
   - Expected efficiency gains: 35%

3. CUSTOMER EXPERIENCE ENHANCEMENT
   - Omnichannel platform
   - Personalization engine
   - Self-service capabilities
   - Target CSAT: 4.5/5.0

4. DATA & ANALYTICS
   - Real-time dashboards
   - Predictive analytics
   - Machine learning models
   - Data governance framework

IMPLEMENTATION ROADMAP
Phase 1 (Months 1-6): Foundation and Quick Wins
Phase 2 (Months 7-12): Core System Transformation
Phase 3 (Months 13-18): Advanced Analytics and AI
Phase 4 (Months 19-24): Optimization and Scale

EXPECTED OUTCOMES
- 25% reduction in operational costs
- 40% improvement in customer satisfaction
- 50% faster time-to-market for new products
- ROI: 300% over 3 years

This transformation will position the client as an industry leader...",

            "operations" => @"OPERATIONS EFFICIENCY ANALYSIS
Manufacturing Sector Client

1. EXECUTIVE SUMMARY
Comprehensive analysis of manufacturing operations identifying opportunities for 30% efficiency improvement through process optimization and technology adoption.

2. CURRENT STATE ANALYSIS
   2.1 Production Metrics
       - Overall Equipment Effectiveness: 68%
       - First Pass Yield: 82%
       - Defect Rate: 3.2%
       - Changeover Time: 45 minutes average

   2.2 Cost Structure Analysis
       - Labor: 35% of total costs
       - Materials: 45% of total costs
       - Overhead: 20% of total costs

   2.3 Bottleneck Identification
       - Assembly line station 3: 15% capacity constraint
       - Quality control checkpoint: 8-minute average delay
       - Material handling: 20% of operator time

3. IMPROVEMENT OPPORTUNITIES
   3.1 Lean Manufacturing Implementation
       - 5S workplace organization
       - Kanban pull system
       - Value stream mapping
       - Expected impact: 15% efficiency gain

   3.2 Automation and Technology
       - Automated quality inspection
       - Predictive maintenance system
       - Real-time production monitoring
       - Expected impact: 20% efficiency gain

   3.3 Workforce Optimization
       - Cross-training program
       - Performance management system
       - Continuous improvement culture
       - Expected impact: 10% productivity increase

4. IMPLEMENTATION PLAN
   Phase 1: Quick wins and foundation (Months 1-3)
   Phase 2: Technology implementation (Months 4-9)
   Phase 3: Culture and process refinement (Months 10-12)

5. FINANCIAL IMPACT
   - Annual cost savings: $2.3M
   - Implementation cost: $800K
   - Payback period: 4.2 months
   - 3-year NPV: $5.8M

This analysis provides a clear path to operational excellence...",

            _ => "Sample consulting document content would be generated here."
        };
    }

    private async Task CreateSystemRolesIfNotExist()
    {
        var systemAdminRoleId = Guid.Parse("11111111-1111-1111-1111-111111111111");
        var tenantAdminRoleId = Guid.Parse("22222222-2222-2222-2222-222222222222");
        var userRoleId = Guid.Parse("33333333-3333-3333-3333-333333333333");

        // Check if system roles already exist
        if (await _context.Roles.AnyAsync(r => r.Id == systemAdminRoleId))
        {
            return; // System roles already exist
        }

        var systemRoles = new List<Role>
        {
            new Role
            {
                Id = systemAdminRoleId,
                Name = "System Administrator",
                Description = "Full system access with all permissions",
                IsSystemRole = true,
                IsActive = true
            },
            new Role
            {
                Id = tenantAdminRoleId,
                Name = "Tenant Administrator",
                Description = "Administrative access within tenant scope",
                IsSystemRole = true,
                IsActive = true
            },
            new Role
            {
                Id = userRoleId,
                Name = "User",
                Description = "Standard user access with basic permissions",
                IsSystemRole = true,
                IsActive = true
            }
        };

        _context.Roles.AddRange(systemRoles);
        await _context.SaveChangesAsync();
    }
}