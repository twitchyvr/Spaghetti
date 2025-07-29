using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace EnterpriseDocsCore.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class EnhanceDocumentManagementSystem : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Tenants",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Subdomain = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    Tier = table.Column<int>(type: "integer", nullable: false),
                    SuspensionReason = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    SuspendedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Billing_SubscriptionId = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Billing_PlanId = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Billing_SubscriptionStartDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Billing_SubscriptionEndDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Billing_NextBillingDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Billing_MonthlyRate = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    Billing_Currency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    Billing_IsTrialActive = table.Column<bool>(type: "boolean", nullable: false),
                    Billing_TrialEndDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Billing_PaymentStatus = table.Column<int>(type: "integer", nullable: false),
                    Billing_DocumentsCreatedThisMonth = table.Column<int>(type: "integer", nullable: false),
                    Billing_APICallsThisMonth = table.Column<int>(type: "integer", nullable: false),
                    Billing_StorageUsedBytes = table.Column<long>(type: "bigint", nullable: false),
                    Billing_BillingMetadata = table.Column<string>(type: "text", nullable: false),
                    Configuration_RequireMFA = table.Column<bool>(type: "boolean", nullable: false),
                    Configuration_RequireSSO = table.Column<bool>(type: "boolean", nullable: false),
                    Configuration_PasswordExpiryDays = table.Column<int>(type: "integer", nullable: false),
                    Configuration_SessionTimeoutMinutes = table.Column<int>(type: "integer", nullable: false),
                    Configuration_DocumentRetentionDays = table.Column<int>(type: "integer", nullable: false),
                    Configuration_AuditLogRetentionDays = table.Column<int>(type: "integer", nullable: false),
                    Configuration_EnableDataExport = table.Column<bool>(type: "boolean", nullable: false),
                    Configuration_EnableAIFeatures = table.Column<bool>(type: "boolean", nullable: false),
                    Configuration_EnableAutoDocumentation = table.Column<bool>(type: "boolean", nullable: false),
                    Configuration_EnableVoiceCapture = table.Column<bool>(type: "boolean", nullable: false),
                    Configuration_EnableScreenCapture = table.Column<bool>(type: "boolean", nullable: false),
                    Configuration_EnabledIntegrations = table.Column<string>(type: "text", nullable: false),
                    Configuration_ComplianceFrameworks = table.Column<string>(type: "text", nullable: false),
                    Configuration_EnableAuditLogging = table.Column<bool>(type: "boolean", nullable: false),
                    Configuration_EnableDataEncryption = table.Column<bool>(type: "boolean", nullable: false),
                    Configuration_DefaultTimeZone = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Configuration_DefaultLanguage = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Configuration_CustomSettings = table.Column<string>(type: "text", nullable: false),
                    Quotas_MaxStorageBytes = table.Column<long>(type: "bigint", nullable: false),
                    Quotas_UsedStorageBytes = table.Column<long>(type: "bigint", nullable: false),
                    Quotas_MaxUsers = table.Column<int>(type: "integer", nullable: false),
                    Quotas_ActiveUsers = table.Column<int>(type: "integer", nullable: false),
                    Quotas_MaxDocumentsPerMonth = table.Column<int>(type: "integer", nullable: false),
                    Quotas_DocumentsCreatedThisMonth = table.Column<int>(type: "integer", nullable: false),
                    Quotas_MaxAPICallsPerMonth = table.Column<int>(type: "integer", nullable: false),
                    Quotas_APICallsThisMonth = table.Column<int>(type: "integer", nullable: false),
                    Quotas_MaxAIProcessingMinutesPerMonth = table.Column<int>(type: "integer", nullable: false),
                    Quotas_AIProcessingMinutesUsedThisMonth = table.Column<int>(type: "integer", nullable: false),
                    Quotas_ModuleQuotas = table.Column<string>(type: "text", nullable: false),
                    Quotas_QuotaResetDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Branding_CompanyName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Branding_LogoUrl = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    Branding_FaviconUrl = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    Branding_PrimaryColor = table.Column<string>(type: "character varying(7)", maxLength: 7, nullable: true),
                    Branding_SecondaryColor = table.Column<string>(type: "character varying(7)", maxLength: 7, nullable: true),
                    Branding_AccentColor = table.Column<string>(type: "character varying(7)", maxLength: 7, nullable: true),
                    Branding_FontFamily = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Branding_CustomCSS = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Branding_HidePlatformBranding = table.Column<bool>(type: "boolean", nullable: false),
                    Branding_CustomDomain = table.Column<bool>(type: "boolean", nullable: false),
                    Branding_CustomDomainName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Branding_CustomLabels = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tenants", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Roles",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    IsSystemRole = table.Column<bool>(type: "boolean", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Roles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Roles_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "TenantModules",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    ModuleName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    IsEnabled = table.Column<bool>(type: "boolean", nullable: false),
                    EnabledAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    EnabledBy = table.Column<Guid>(type: "uuid", nullable: false),
                    Configuration = table.Column<string>(type: "text", nullable: false),
                    AdditionalCost = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: true),
                    ExpiresAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TenantModules", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TenantModules_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    FirstName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    LastName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Email = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    UserType = table.Column<int>(type: "integer", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    LastLoginAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    SessionId = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    SessionExpiresAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: true),
                    Profile_JobTitle = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Profile_Department = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Profile_Industry = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Profile_PhoneNumber = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    Profile_Bio = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Profile_AvatarUrl = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    Profile_TimeZone = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    Profile_Language = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: true),
                    Profile_CustomFields = table.Column<string>(type: "text", nullable: false),
                    Settings_EnableAIAssistance = table.Column<bool>(type: "boolean", nullable: false),
                    Settings_EnableAutoDocumentation = table.Column<bool>(type: "boolean", nullable: false),
                    Settings_EnableVoiceCapture = table.Column<bool>(type: "boolean", nullable: false),
                    Settings_EnableScreenCapture = table.Column<bool>(type: "boolean", nullable: false),
                    Settings_EnableFileMonitoring = table.Column<bool>(type: "boolean", nullable: false),
                    Settings_PrivacyLevel = table.Column<int>(type: "integer", nullable: false),
                    Settings_AllowDataRetention = table.Column<bool>(type: "boolean", nullable: false),
                    Settings_DataRetentionDays = table.Column<int>(type: "integer", nullable: false),
                    Settings_EnableEmailNotifications = table.Column<bool>(type: "boolean", nullable: false),
                    Settings_EnablePushNotifications = table.Column<bool>(type: "boolean", nullable: false),
                    Settings_EnableSlackNotifications = table.Column<bool>(type: "boolean", nullable: false),
                    Settings_EnableTeamsNotifications = table.Column<bool>(type: "boolean", nullable: false),
                    Settings_Theme = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Settings_DefaultDocumentType = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Settings_FavoriteAgents = table.Column<string>(type: "text", nullable: false),
                    Settings_ModuleSettings = table.Column<string>(type: "text", nullable: false),
                    Settings_CustomSettings = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Users_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "RolePermissions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    RoleId = table.Column<Guid>(type: "uuid", nullable: false),
                    Permission = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Resource = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    IsGranted = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RolePermissions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RolePermissions_Roles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "Roles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Documents",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Title = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    Content = table.Column<string>(type: "text", nullable: false),
                    DocumentType = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Industry = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    PublicAccessLevel = table.Column<int>(type: "integer", nullable: false),
                    PublicSlug = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    PublishedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    PublishedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    MetaDescription = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    MetaKeywords = table.Column<string>(type: "text", nullable: false),
                    IndexBySearchEngines = table.Column<bool>(type: "boolean", nullable: false),
                    PublicViewCount = table.Column<int>(type: "integer", nullable: false),
                    LastPublicViewAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: true),
                    Metadata_Properties = table.Column<string>(type: "text", nullable: false),
                    Metadata_SourceModule = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Metadata_SourceAgent = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Metadata_SourceCaptureTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Metadata_SourceLocation = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Metadata_Keywords = table.Column<string>(type: "text", nullable: false),
                    Metadata_Summary = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Metadata_WordCount = table.Column<int>(type: "integer", nullable: false),
                    Metadata_Language = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: true),
                    FileName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    ContentType = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    FileSize = table.Column<long>(type: "bigint", nullable: true),
                    FilePath = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    FileHash = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Version = table.Column<int>(type: "integer", nullable: false),
                    IsLatestVersion = table.Column<bool>(type: "boolean", nullable: false),
                    ParentDocumentId = table.Column<Guid>(type: "uuid", nullable: true),
                    ParentDocumentId1 = table.Column<Guid>(type: "uuid", nullable: true),
                    VersionNotes = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    AIMetadata_ModelUsed = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    AIMetadata_ConfidenceScore = table.Column<float>(type: "real", nullable: true),
                    AIMetadata_ProcessedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    AIMetadata_ProcessingResults = table.Column<string>(type: "text", nullable: true),
                    AIMetadata_PromptUsed = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    AIMetadata_SuggestedTags = table.Column<string>(type: "text", nullable: true),
                    AIMetadata_AutoGeneratedSummary = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    TenantId1 = table.Column<Guid>(type: "uuid", nullable: true),
                    UserId = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Documents", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Documents_Documents_ParentDocumentId",
                        column: x => x.ParentDocumentId,
                        principalTable: "Documents",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Documents_Documents_ParentDocumentId1",
                        column: x => x.ParentDocumentId1,
                        principalTable: "Documents",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Documents_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Documents_Tenants_TenantId1",
                        column: x => x.TenantId1,
                        principalTable: "Tenants",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Documents_Users_CreatedBy",
                        column: x => x.CreatedBy,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Documents_Users_PublishedBy",
                        column: x => x.PublishedBy,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Documents_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "ImpersonationSessions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    AdminUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    AdminUserEmail = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    TargetUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    TargetUserEmail = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    TargetTenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    Reason = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    StartedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    EndedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ExpiresAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    EndReason = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    AdminIPAddress = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    AdminUserAgent = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ImpersonationSessions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ImpersonationSessions_Tenants_TargetTenantId",
                        column: x => x.TargetTenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ImpersonationSessions_Users_AdminUserId",
                        column: x => x.AdminUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ImpersonationSessions_Users_TargetUserId",
                        column: x => x.TargetUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PlatformAdminAuditLogs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    AdminUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    Action = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    TargetEntityType = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    TargetEntityId = table.Column<Guid>(type: "uuid", nullable: true),
                    Details = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    IPAddress = table.Column<string>(type: "character varying(45)", maxLength: 45, nullable: true),
                    UserAgent = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Timestamp = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Metadata = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Severity = table.Column<int>(type: "integer", nullable: false),
                    IsSuccessful = table.Column<bool>(type: "boolean", nullable: false),
                    ErrorMessage = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PlatformAdminAuditLogs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PlatformAdminAuditLogs_Users_AdminUserId",
                        column: x => x.AdminUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "RefreshTokens",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Token = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    RevokedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    RevokedByIp = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    RevokedReason = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RefreshTokens", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RefreshTokens_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TenantAuditEntries",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    Action = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Timestamp = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: true),
                    Details = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    OldValue = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    NewValue = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    IPAddress = table.Column<string>(type: "character varying(45)", maxLength: 45, nullable: true),
                    UserAgent = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Severity = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TenantAuditEntries", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TenantAuditEntries_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_TenantAuditEntries_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "UserAuditEntries",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    Action = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Timestamp = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Details = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    IPAddress = table.Column<string>(type: "character varying(45)", maxLength: 45, nullable: true),
                    UserAgent = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    IsSuccess = table.Column<bool>(type: "boolean", nullable: false),
                    ErrorMessage = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserAuditEntries", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserAuditEntries_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserAuthentications",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    Provider = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    ExternalId = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    LastUsedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    ProviderData = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserAuthentications", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserAuthentications_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserRoles",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    RoleId = table.Column<Guid>(type: "uuid", nullable: false),
                    AssignedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    AssignedBy = table.Column<Guid>(type: "uuid", nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserRoles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserRoles_Roles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "Roles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserRoles_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "DocumentAttachments",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    DocumentId = table.Column<Guid>(type: "uuid", nullable: false),
                    FileName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    ContentType = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    FileSize = table.Column<long>(type: "bigint", nullable: false),
                    StoragePath = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    UploadedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UploadedBy = table.Column<Guid>(type: "uuid", nullable: false),
                    Description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    Type = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DocumentAttachments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DocumentAttachments_Documents_DocumentId",
                        column: x => x.DocumentId,
                        principalTable: "Documents",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "DocumentAuditEntries",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    DocumentId = table.Column<Guid>(type: "uuid", nullable: false),
                    Action = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Timestamp = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    Details = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    OldValue = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    NewValue = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    IPAddress = table.Column<string>(type: "character varying(45)", maxLength: 45, nullable: true),
                    UserAgent = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    DocumentId1 = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DocumentAuditEntries", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DocumentAuditEntries_Documents_DocumentId",
                        column: x => x.DocumentId,
                        principalTable: "Documents",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_DocumentAuditEntries_Documents_DocumentId1",
                        column: x => x.DocumentId1,
                        principalTable: "Documents",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_DocumentAuditEntries_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "DocumentPermissions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    DocumentId = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: true),
                    RoleId = table.Column<Guid>(type: "uuid", nullable: true),
                    Permission = table.Column<int>(type: "integer", nullable: false),
                    GrantedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    GrantedBy = table.Column<Guid>(type: "uuid", nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DocumentId1 = table.Column<Guid>(type: "uuid", nullable: true),
                    RoleId1 = table.Column<Guid>(type: "uuid", nullable: true),
                    UserId1 = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DocumentPermissions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DocumentPermissions_Documents_DocumentId",
                        column: x => x.DocumentId,
                        principalTable: "Documents",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_DocumentPermissions_Documents_DocumentId1",
                        column: x => x.DocumentId1,
                        principalTable: "Documents",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_DocumentPermissions_Roles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "Roles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_DocumentPermissions_Roles_RoleId1",
                        column: x => x.RoleId1,
                        principalTable: "Roles",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_DocumentPermissions_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_DocumentPermissions_Users_UserId1",
                        column: x => x.UserId1,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "DocumentTags",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    DocumentId = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Category = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    IsSystemGenerated = table.Column<bool>(type: "boolean", nullable: false),
                    Confidence = table.Column<float>(type: "real", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DocumentTags", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DocumentTags_Documents_DocumentId",
                        column: x => x.DocumentId,
                        principalTable: "Documents",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "Roles",
                columns: new[] { "Id", "CreatedAt", "Description", "IsActive", "IsSystemRole", "Name", "TenantId" },
                values: new object[,]
                {
                    { new Guid("11111111-1111-1111-1111-111111111111"), new DateTime(2025, 7, 28, 5, 19, 36, 210, DateTimeKind.Utc).AddTicks(7280), "Full system administration access", true, true, "System Administrator", null },
                    { new Guid("22222222-2222-2222-2222-222222222222"), new DateTime(2025, 7, 28, 5, 19, 36, 210, DateTimeKind.Utc).AddTicks(7280), "Full tenant administration access", true, true, "Tenant Administrator", null },
                    { new Guid("33333333-3333-3333-3333-333333333333"), new DateTime(2025, 7, 28, 5, 19, 36, 210, DateTimeKind.Utc).AddTicks(7290), "Standard user access", true, true, "User", null }
                });

            migrationBuilder.InsertData(
                table: "RolePermissions",
                columns: new[] { "Id", "IsGranted", "Permission", "Resource", "RoleId" },
                values: new object[,]
                {
                    { new Guid("0cf4d27b-6ec6-4411-b2f1-46b0a60beb1c"), true, "User.Admin", null, new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("2c4b934f-7d9b-4d1e-bff7-16fbc668ae16"), true, "Document.Admin", null, new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("54654dfb-d339-46c3-9e24-f40f77bc0ef2"), true, "User.Read", null, new Guid("33333333-3333-3333-3333-333333333333") },
                    { new Guid("6b5612b9-d634-430a-8453-cdf85e7c1b1e"), true, "Module.Admin", null, new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("87e4325a-18c6-40c5-823b-14772ee26ad6"), true, "Module.Configure", null, new Guid("22222222-2222-2222-2222-222222222222") },
                    { new Guid("8a27a956-18f0-44c6-a32a-b426b54fa4db"), true, "Document.Admin", null, new Guid("22222222-2222-2222-2222-222222222222") },
                    { new Guid("9cc5d6c7-45f7-482e-b67c-51b092004513"), true, "Document.Write", null, new Guid("33333333-3333-3333-3333-333333333333") },
                    { new Guid("a26098dc-8f2c-47c8-af80-8ba4dcabc659"), true, "Tenant.Admin", null, new Guid("22222222-2222-2222-2222-222222222222") },
                    { new Guid("a9eafd13-def4-41eb-846c-bcd61d9dc7fb"), true, "User.Admin", null, new Guid("22222222-2222-2222-2222-222222222222") },
                    { new Guid("d2f4ab9a-17f5-4b4a-8c5d-45f438e70047"), true, "Tenant.Admin", null, new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("d4e32fd1-e67c-4400-953b-04605a155e43"), true, "Document.Read", null, new Guid("33333333-3333-3333-3333-333333333333") },
                    { new Guid("dcd9d73f-f45d-42c5-95e6-d9a1e5c87a88"), true, "System.Admin", null, new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("e6e53777-1b70-4b16-a764-d8337f587cbc"), true, "Document.Create", null, new Guid("33333333-3333-3333-3333-333333333333") }
                });

            migrationBuilder.CreateIndex(
                name: "IX_DocumentAttachments_DocumentId",
                table: "DocumentAttachments",
                column: "DocumentId");

            migrationBuilder.CreateIndex(
                name: "IX_DocumentAuditEntries_DocumentId_Timestamp",
                table: "DocumentAuditEntries",
                columns: new[] { "DocumentId", "Timestamp" });

            migrationBuilder.CreateIndex(
                name: "IX_DocumentAuditEntries_DocumentId1",
                table: "DocumentAuditEntries",
                column: "DocumentId1");

            migrationBuilder.CreateIndex(
                name: "IX_DocumentAuditEntries_UserId",
                table: "DocumentAuditEntries",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_DocumentPermissions_DocumentId_RoleId",
                table: "DocumentPermissions",
                columns: new[] { "DocumentId", "RoleId" });

            migrationBuilder.CreateIndex(
                name: "IX_DocumentPermissions_DocumentId_UserId",
                table: "DocumentPermissions",
                columns: new[] { "DocumentId", "UserId" });

            migrationBuilder.CreateIndex(
                name: "IX_DocumentPermissions_DocumentId1",
                table: "DocumentPermissions",
                column: "DocumentId1");

            migrationBuilder.CreateIndex(
                name: "IX_DocumentPermissions_RoleId",
                table: "DocumentPermissions",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "IX_DocumentPermissions_RoleId1",
                table: "DocumentPermissions",
                column: "RoleId1");

            migrationBuilder.CreateIndex(
                name: "IX_DocumentPermissions_UserId",
                table: "DocumentPermissions",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_DocumentPermissions_UserId1",
                table: "DocumentPermissions",
                column: "UserId1");

            migrationBuilder.CreateIndex(
                name: "IX_Documents_ContentType_TenantId",
                table: "Documents",
                columns: new[] { "ContentType", "TenantId" },
                filter: "ContentType IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Documents_CreatedBy",
                table: "Documents",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_Documents_DocumentType_Industry",
                table: "Documents",
                columns: new[] { "DocumentType", "Industry" });

            migrationBuilder.CreateIndex(
                name: "IX_Documents_ParentDocumentId",
                table: "Documents",
                column: "ParentDocumentId");

            migrationBuilder.CreateIndex(
                name: "IX_Documents_ParentDocumentId1",
                table: "Documents",
                column: "ParentDocumentId1");

            migrationBuilder.CreateIndex(
                name: "IX_Documents_PublishedBy",
                table: "Documents",
                column: "PublishedBy");

            migrationBuilder.CreateIndex(
                name: "IX_Documents_TenantId_FileHash",
                table: "Documents",
                columns: new[] { "TenantId", "FileHash" },
                filter: "FileHash IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Documents_TenantId_FileName",
                table: "Documents",
                columns: new[] { "TenantId", "FileName" },
                filter: "FileName IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Documents_TenantId_IsLatestVersion_ParentDocumentId",
                table: "Documents",
                columns: new[] { "TenantId", "IsLatestVersion", "ParentDocumentId" },
                filter: "ParentDocumentId IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Documents_TenantId_Status_UpdatedAt",
                table: "Documents",
                columns: new[] { "TenantId", "Status", "UpdatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_Documents_TenantId_Version_ParentDocumentId",
                table: "Documents",
                columns: new[] { "TenantId", "Version", "ParentDocumentId" },
                filter: "ParentDocumentId IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Documents_TenantId1",
                table: "Documents",
                column: "TenantId1");

            migrationBuilder.CreateIndex(
                name: "IX_Documents_UserId",
                table: "Documents",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_DocumentTags_DocumentId_Name",
                table: "DocumentTags",
                columns: new[] { "DocumentId", "Name" });

            migrationBuilder.CreateIndex(
                name: "IX_DocumentTags_Name_Category",
                table: "DocumentTags",
                columns: new[] { "Name", "Category" });

            migrationBuilder.CreateIndex(
                name: "IX_ImpersonationSessions_AdminUserId_IsActive",
                table: "ImpersonationSessions",
                columns: new[] { "AdminUserId", "IsActive" });

            migrationBuilder.CreateIndex(
                name: "IX_ImpersonationSessions_ExpiresAt",
                table: "ImpersonationSessions",
                column: "ExpiresAt");

            migrationBuilder.CreateIndex(
                name: "IX_ImpersonationSessions_TargetTenantId",
                table: "ImpersonationSessions",
                column: "TargetTenantId");

            migrationBuilder.CreateIndex(
                name: "IX_ImpersonationSessions_TargetUserId_StartedAt",
                table: "ImpersonationSessions",
                columns: new[] { "TargetUserId", "StartedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_PlatformAdminAuditLogs_Action_Timestamp",
                table: "PlatformAdminAuditLogs",
                columns: new[] { "Action", "Timestamp" });

            migrationBuilder.CreateIndex(
                name: "IX_PlatformAdminAuditLogs_AdminUserId_Timestamp",
                table: "PlatformAdminAuditLogs",
                columns: new[] { "AdminUserId", "Timestamp" });

            migrationBuilder.CreateIndex(
                name: "IX_PlatformAdminAuditLogs_TargetEntityType_TargetEntityId",
                table: "PlatformAdminAuditLogs",
                columns: new[] { "TargetEntityType", "TargetEntityId" });

            migrationBuilder.CreateIndex(
                name: "IX_RefreshTokens_ExpiresAt",
                table: "RefreshTokens",
                column: "ExpiresAt");

            migrationBuilder.CreateIndex(
                name: "IX_RefreshTokens_RevokedAt",
                table: "RefreshTokens",
                column: "RevokedAt");

            migrationBuilder.CreateIndex(
                name: "IX_RefreshTokens_Token",
                table: "RefreshTokens",
                column: "Token",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_RefreshTokens_UserId",
                table: "RefreshTokens",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_RolePermissions_RoleId_Permission",
                table: "RolePermissions",
                columns: new[] { "RoleId", "Permission" });

            migrationBuilder.CreateIndex(
                name: "IX_Roles_TenantId",
                table: "Roles",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_TenantAuditEntries_TenantId_Timestamp",
                table: "TenantAuditEntries",
                columns: new[] { "TenantId", "Timestamp" });

            migrationBuilder.CreateIndex(
                name: "IX_TenantAuditEntries_UserId",
                table: "TenantAuditEntries",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_TenantModules_TenantId_ModuleName",
                table: "TenantModules",
                columns: new[] { "TenantId", "ModuleName" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Tenants_Status",
                table: "Tenants",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_Tenants_Subdomain",
                table: "Tenants",
                column: "Subdomain",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_UserAuditEntries_UserId_Timestamp",
                table: "UserAuditEntries",
                columns: new[] { "UserId", "Timestamp" });

            migrationBuilder.CreateIndex(
                name: "IX_UserAuthentications_Provider_ExternalId",
                table: "UserAuthentications",
                columns: new[] { "Provider", "ExternalId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_UserAuthentications_UserId",
                table: "UserAuthentications",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_UserRoles_RoleId",
                table: "UserRoles",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "IX_UserRoles_UserId_RoleId_IsActive",
                table: "UserRoles",
                columns: new[] { "UserId", "RoleId", "IsActive" });

            migrationBuilder.CreateIndex(
                name: "IX_Users_Email",
                table: "Users",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_LastLoginAt",
                table: "Users",
                column: "LastLoginAt");

            migrationBuilder.CreateIndex(
                name: "IX_Users_TenantId_IsActive",
                table: "Users",
                columns: new[] { "TenantId", "IsActive" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DocumentAttachments");

            migrationBuilder.DropTable(
                name: "DocumentAuditEntries");

            migrationBuilder.DropTable(
                name: "DocumentPermissions");

            migrationBuilder.DropTable(
                name: "DocumentTags");

            migrationBuilder.DropTable(
                name: "ImpersonationSessions");

            migrationBuilder.DropTable(
                name: "PlatformAdminAuditLogs");

            migrationBuilder.DropTable(
                name: "RefreshTokens");

            migrationBuilder.DropTable(
                name: "RolePermissions");

            migrationBuilder.DropTable(
                name: "TenantAuditEntries");

            migrationBuilder.DropTable(
                name: "TenantModules");

            migrationBuilder.DropTable(
                name: "UserAuditEntries");

            migrationBuilder.DropTable(
                name: "UserAuthentications");

            migrationBuilder.DropTable(
                name: "UserRoles");

            migrationBuilder.DropTable(
                name: "Documents");

            migrationBuilder.DropTable(
                name: "Roles");

            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.DropTable(
                name: "Tenants");
        }
    }
}
