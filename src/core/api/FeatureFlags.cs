using System.Collections.Concurrent;

namespace EnterpriseDocsCore.API
{
    /// <summary>
    /// Feature Flag Management for Sprint 7 Deployment Architecture Optimization
    /// Manages toggling of Sprint 6 advanced features during gradual reintegration
    /// </summary>
    public class FeatureFlags
    {
        private static readonly ConcurrentDictionary<string, bool> _flags = new()
        {
            // Sprint 6 Advanced Collaboration Features (Feature Flagged)
            ["RealTimeCollaboration"] = false,
            ["DocumentLocking"] = false,
            ["PresenceAwareness"] = false,
            ["CollaborativeEditing"] = false,
            
            // Sprint 6 Workflow Automation Features (Feature Flagged)
            ["WorkflowAutomation"] = false,
            ["VisualWorkflowDesigner"] = false,
            ["WorkflowExecution"] = false,
            ["ApprovalProcesses"] = false,
            
            // Sprint 6 PWA Features (Enabled)
            ["PWACapabilities"] = true,
            ["OfflineSupport"] = true,
            ["ServiceWorker"] = true,
            
            // Core Platform Features (Always Enabled)
            ["BasicDocumentManagement"] = true,
            ["UserAuthentication"] = true,
            ["TenantIsolation"] = true,
            ["HealthMonitoring"] = true,
            ["DatabaseOperations"] = true,
            
            // Sprint 7 Features (In Development)
            ["SimplifiedAPI"] = true,
            ["FeatureFlagSystem"] = true,
            ["IncrementalDeployment"] = true
        };

        /// <summary>
        /// Get the status of a feature flag
        /// </summary>
        public static bool IsEnabled(string featureName)
        {
            return _flags.GetValueOrDefault(featureName, false);
        }

        /// <summary>
        /// Enable a feature flag
        /// </summary>
        public static void Enable(string featureName)
        {
            _flags.AddOrUpdate(featureName, true, (key, oldValue) => true);
        }

        /// <summary>
        /// Disable a feature flag
        /// </summary>
        public static void Disable(string featureName)
        {
            _flags.AddOrUpdate(featureName, false, (key, oldValue) => false);
        }

        /// <summary>
        /// Get all feature flags and their current status
        /// </summary>
        public static Dictionary<string, bool> GetAllFlags()
        {
            return new Dictionary<string, bool>(_flags);
        }

        /// <summary>
        /// Get feature flags grouped by category
        /// </summary>
        public static object GetFlagsByCategory()
        {
            return new
            {
                Sprint6AdvancedFeatures = new
                {
                    RealTimeCollaboration = IsEnabled("RealTimeCollaboration"),
                    DocumentLocking = IsEnabled("DocumentLocking"),
                    PresenceAwareness = IsEnabled("PresenceAwareness"),
                    CollaborativeEditing = IsEnabled("CollaborativeEditing"),
                    WorkflowAutomation = IsEnabled("WorkflowAutomation"),
                    VisualWorkflowDesigner = IsEnabled("VisualWorkflowDesigner"),
                    WorkflowExecution = IsEnabled("WorkflowExecution"),
                    ApprovalProcesses = IsEnabled("ApprovalProcesses")
                },
                PWAFeatures = new
                {
                    PWACapabilities = IsEnabled("PWACapabilities"),
                    OfflineSupport = IsEnabled("OfflineSupport"),
                    ServiceWorker = IsEnabled("ServiceWorker")
                },
                CorePlatform = new
                {
                    BasicDocumentManagement = IsEnabled("BasicDocumentManagement"),
                    UserAuthentication = IsEnabled("UserAuthentication"),
                    TenantIsolation = IsEnabled("TenantIsolation"),
                    HealthMonitoring = IsEnabled("HealthMonitoring"),
                    DatabaseOperations = IsEnabled("DatabaseOperations")
                },
                Sprint7Features = new
                {
                    SimplifiedAPI = IsEnabled("SimplifiedAPI"),
                    FeatureFlagSystem = IsEnabled("FeatureFlagSystem"),
                    IncrementalDeployment = IsEnabled("IncrementalDeployment")
                }
            };
        }

        /// <summary>
        /// Gradual rollout plan for Sprint 6 features
        /// </summary>
        public static void EnablePhase1Features()
        {
            // Phase 1: Basic collaboration features
            Enable("DocumentLocking");
            Enable("PresenceAwareness");
        }

        public static void EnablePhase2Features()
        {
            // Phase 2: Real-time collaboration
            EnablePhase1Features();
            Enable("RealTimeCollaboration");
            Enable("CollaborativeEditing");
        }

        public static void EnablePhase3Features()
        {
            // Phase 3: Full workflow automation
            EnablePhase2Features();
            Enable("WorkflowAutomation");
            Enable("VisualWorkflowDesigner");
            Enable("WorkflowExecution");
            Enable("ApprovalProcesses");
        }
    }
}