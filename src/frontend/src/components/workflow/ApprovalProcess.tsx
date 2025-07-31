import React, { useState } from 'react';
import { 
  Check, 
  X, 
  Clock, 
  User, 
  AlertCircle, 
  FileText,
  Calendar,
  Send
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface ApprovalStep {
  id: string;
  name: string;
  description: string;
  assignedTo: string[];
  assignedToNames: string[];
  status: ApprovalStatus;
  approvers: ApprovalAction[];
  requiredApprovals: number;
  dueDate?: string;
  completedAt?: string;
  order: number;
}

interface ApprovalAction {
  userId: string;
  userName: string;
  action: 'approved' | 'rejected' | 'pending';
  comments?: string;
  timestamp?: string;
}

interface ApprovalProcessProps {
  processId: string;
  documentId: string;
  documentTitle: string;
  steps: ApprovalStep[];
  overallStatus: ApprovalStatus;
  onApprove: (stepId: string, comments?: string) => Promise<void>;
  onReject: (stepId: string, comments: string) => Promise<void>;
  onRequestChanges: (stepId: string, comments: string) => Promise<void>;
  onReassign: (stepId: string, newAssignees: string[]) => Promise<void>;
  className?: string;
}

enum ApprovalStatus {
  Pending = 'pending',
  InProgress = 'in_progress',  
  Approved = 'approved',
  Rejected = 'rejected',
  ChangesRequested = 'changes_requested',
  Cancelled = 'cancelled',
  Expired = 'expired'
}

export const ApprovalProcess: React.FC<ApprovalProcessProps> = ({
  documentTitle,
  steps,
  overallStatus,
  onApprove,
  onReject,
  onRequestChanges,
  className = ''
}) => {
  const { user } = useAuth();
  const [actioningStepId, setActioningStepId] = useState<string | null>(null);
  const [comments, setComments] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'changes' | null>(null);

  const currentStep = steps.find(step => 
    step.status === ApprovalStatus.InProgress || step.status === ApprovalStatus.Pending
  );

  const canUserActOnStep = (step: ApprovalStep): boolean => {
    if (!user?.id) return false;
    return step.assignedTo.includes(user.id) && 
           step.status !== ApprovalStatus.Approved && 
           step.status !== ApprovalStatus.Rejected;
  };

  const getUserActionOnStep = (step: ApprovalStep): ApprovalAction | null => {
    return step.approvers.find(approver => approver.userId === user?.id) || null;
  };

  const getStepProgress = (step: ApprovalStep): number => {
    const approvedCount = step.approvers.filter(a => a.action === 'approved').length;
    return (approvedCount / step.requiredApprovals) * 100;
  };

  const handleAction = async (stepId: string, action: 'approve' | 'reject' | 'changes') => {
    setActioningStepId(stepId);
    setActionType(action);
    
    if (action === 'approve' && !showComments) {
      // Allow approval without comments
      await executeAction(stepId, action);
    } else {
      setShowComments(true);
    }
  };

  const executeAction = async (stepId: string, action: 'approve' | 'reject' | 'changes') => {
    try {
      switch (action) {
        case 'approve':
          await onApprove(stepId, comments || undefined);
          break;
        case 'reject':
          await onReject(stepId, comments);
          break;
        case 'changes':
          await onRequestChanges(stepId, comments);
          break;
      }
      
      setComments('');
      setShowComments(false);
      setActioningStepId(null);
      setActionType(null);
    } catch (error) {
      console.error('Error executing approval action:', error);
    }
  };

  const getStatusIcon = (status: ApprovalStatus) => {
    switch (status) {
      case ApprovalStatus.Approved:
        return <Check className="w-5 h-5 text-green-500" />;
      case ApprovalStatus.Rejected:
        return <X className="w-5 h-5 text-red-500" />;
      case ApprovalStatus.InProgress:
        return <Clock className="w-5 h-5 text-blue-500" />;
      case ApprovalStatus.ChangesRequested:
        return <AlertCircle className="w-5 h-5 text-orange-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: ApprovalStatus) => {
    switch (status) {
      case ApprovalStatus.Approved:
        return 'bg-green-100 text-green-800 border-green-200';
      case ApprovalStatus.Rejected:
        return 'bg-red-100 text-red-800 border-red-200';
      case ApprovalStatus.InProgress:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case ApprovalStatus.ChangesRequested:
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case ApprovalStatus.Expired:
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isOverdue = (dueDateString?: string) => {
    if (!dueDateString) return false;
    return new Date(dueDateString) < new Date();
  };

  return (
    <div className={`approval-process bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Approval Process</h2>
              <p className="text-gray-600 mt-1">{documentTitle}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(overallStatus)}`}>
                  {getStatusIcon(overallStatus)}
                  <span className="ml-2 capitalize">{overallStatus.replace('_', ' ')}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Steps */}
      <div className="p-6">
        <div className="space-y-6">
          {steps.map((step, index) => {
            const userAction = getUserActionOnStep(step);
            const canAct = canUserActOnStep(step);
            const progress = getStepProgress(step);
            const isCurrentStep = step.id === currentStep?.id;

            return (
              <div key={step.id} className="relative">
                {/* Connection line */}
                {index < steps.length - 1 && (
                  <div className="absolute left-6 top-12 w-0.5 h-16 bg-gray-200" />
                )}

                <div className={`border rounded-lg p-4 ${isCurrentStep ? 'border-blue-200 bg-blue-50' : 'border-gray-200'}`}>
                  <div className="flex items-start gap-4">
                    {/* Step indicator */}
                    <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                      step.status === ApprovalStatus.Approved ? 'bg-green-100' :
                      step.status === ApprovalStatus.Rejected ? 'bg-red-100' :
                      isCurrentStep ? 'bg-blue-100' : 'bg-gray-100'
                    }`}>
                      {getStatusIcon(step.status)}
                    </div>

                    {/* Step content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">{step.name}</h3>
                          {step.description && (
                            <p className="text-gray-600 mt-1">{step.description}</p>
                          )}
                        </div>
                        <div className="text-right text-sm text-gray-500">
                          <div>Step {step.order} of {steps.length}</div>
                          {step.dueDate && (
                            <div className={`flex items-center gap-1 mt-1 ${
                              isOverdue(step.dueDate) ? 'text-red-500' : ''
                            }`}>
                              <Calendar className="w-4 h-4" />
                              Due: {formatDate(step.dueDate)}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Progress bar */}
                      {step.requiredApprovals > 1 && (
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                            <span>Progress</span>
                            <span>{step.approvers.filter(a => a.action === 'approved').length} of {step.requiredApprovals} approvals</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Assignees */}
                      <div className="mt-3">
                        <div className="text-sm text-gray-600 mb-2">Assigned to:</div>
                        <div className="flex flex-wrap gap-2">
                          {step.assignedToNames.map((name, idx) => {
                            const userId = step.assignedTo[idx];
                            const userAction = step.approvers.find(a => a.userId === userId);
                            return (
                              <div key={userId} className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                                userAction?.action === 'approved' ? 'bg-green-100 text-green-800' :
                                userAction?.action === 'rejected' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                <User className="w-4 h-4 mr-1" />
                                {name}
                                {userAction?.action === 'approved' && <Check className="w-4 h-4 ml-1" />}
                                {userAction?.action === 'rejected' && <X className="w-4 h-4 ml-1" />}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* User actions */}
                      {canAct && (
                        <div className="mt-4 p-3 bg-white border border-blue-200 rounded-lg">
                          <div className="text-sm text-gray-700 mb-3">Your action required:</div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleAction(step.id, 'approve')}
                              disabled={actioningStepId === step.id}
                              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                            >
                              <Check className="w-4 h-4" />
                              Approve
                            </button>
                            <button
                              onClick={() => handleAction(step.id, 'changes')}
                              disabled={actioningStepId === step.id}
                              className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
                            >
                              <AlertCircle className="w-4 h-4" />
                              Request Changes
                            </button>
                            <button
                              onClick={() => handleAction(step.id, 'reject')}
                              disabled={actioningStepId === step.id}
                              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                            >
                              <X className="w-4 h-4" />
                              Reject
                            </button>
                          </div>
                        </div>
                      )}

                      {/* User's previous action */}
                      {userAction && userAction.action !== 'pending' && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-start gap-2">
                            <div className={`p-1 rounded ${
                              userAction.action === 'approved' ? 'bg-green-100' : 'bg-red-100'
                            }`}>
                              {userAction.action === 'approved' ? 
                                <Check className="w-4 h-4 text-green-600" /> :
                                <X className="w-4 h-4 text-red-600" />
                              }
                            </div>
                            <div className="flex-1">
                              <div className="text-sm font-medium text-gray-900">
                                You {userAction.action} this step
                              </div>
                              {userAction.timestamp && (
                                <div className="text-sm text-gray-500">
                                  {formatDate(userAction.timestamp)}
                                </div>
                              )}
                              {userAction.comments && (
                                <div className="text-sm text-gray-700 mt-2 p-2 bg-white rounded border">
                                  {userAction.comments}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Comments from other approvers */}
                      {step.approvers.filter(a => a.comments && a.userId !== user?.id).length > 0 && (
                        <div className="mt-3">
                          <div className="text-sm text-gray-600 mb-2">Comments:</div>
                          <div className="space-y-2">
                            {step.approvers
                              .filter(a => a.comments && a.userId !== user?.id)
                              .map((approver, idx) => (
                                <div key={idx} className="p-2 bg-gray-50 rounded border text-sm">
                                  <div className="font-medium text-gray-900">{approver.userName}:</div>
                                  <div className="text-gray-700">{approver.comments}</div>
                                  {approver.timestamp && (
                                    <div className="text-gray-500 text-xs mt-1">
                                      {formatDate(approver.timestamp)}
                                    </div>
                                  )}
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Comments modal */}
      {showComments && actioningStepId && actionType && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">
                {actionType === 'approve' ? 'Approve Step' :
                 actionType === 'reject' ? 'Reject Step' :
                 'Request Changes'}
              </h3>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder={`${actionType === 'approve' ? 'Optional comments...' : 'Please provide your feedback...'}`}
                className="w-full p-3 border border-gray-300 rounded-lg resize-none h-32 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required={actionType !== 'approve'}
              />
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => executeAction(actioningStepId, actionType)}
                  disabled={actionType !== 'approve' && !comments.trim()}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  Submit
                </button>
                <button
                  onClick={() => {
                    setShowComments(false);
                    setComments('');
                    setActioningStepId(null);
                    setActionType(null);
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};