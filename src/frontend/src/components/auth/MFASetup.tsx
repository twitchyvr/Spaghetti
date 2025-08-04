import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Smartphone, 
  Mail, 
  Key, 
  Copy, 
  Check, 
  Download,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';
import { Button } from '../pantry/Button';
import { Badge } from '../pantry/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../pantry/navigation/Tabs';
import { Alert, AlertDescription, AlertTitle } from '../pantry/Alert';

interface MFASetupProps {
  onComplete?: () => void;
  onCancel?: () => void;
}

interface MFAMethod {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  enabled: boolean;
  primary: boolean;
}

interface SetupStep {
  step: number;
  title: string;
  description: string;
  completed: boolean;
}

export const MFASetup: React.FC<MFASetupProps> = ({ onComplete, onCancel }) => {
  const { user } = useAuth();
  const [selectedMethod, setSelectedMethod] = useState<string>('totp');
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [, setQrCodeUrl] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [copiedCode, setCopiedCode] = useState('');

  const mfaMethods: MFAMethod[] = [
    {
      id: 'totp',
      name: 'Authenticator App',
      description: 'Use Google Authenticator, Authy, or similar apps',
      icon: <Smartphone className="h-5 w-5" />,
      enabled: true,
      primary: true
    },
    {
      id: 'sms',
      name: 'SMS',
      description: 'Receive codes via text message',
      icon: <Mail className="h-5 w-5" />,
      enabled: false,
      primary: false
    },
    {
      id: 'email',
      name: 'Email',
      description: 'Receive codes via email',
      icon: <Mail className="h-5 w-5" />,
      enabled: false,
      primary: false
    }
  ];

  const setupSteps: SetupStep[] = [
    {
      step: 1,
      title: 'Choose Method',
      description: 'Select your preferred MFA method',
      completed: currentStep > 1
    },
    {
      step: 2,
      title: 'Setup',
      description: 'Configure your chosen method',
      completed: currentStep > 2
    },
    {
      step: 3,
      title: 'Verify',
      description: 'Test your setup with a verification code',
      completed: currentStep > 3
    },
    {
      step: 4,
      title: 'Backup Codes',
      description: 'Save your backup recovery codes',
      completed: currentStep > 4
    }
  ];

  useEffect(() => {
    if (selectedMethod === 'totp' && currentStep === 2) {
      setupTOTP();
    }
  }, [selectedMethod, currentStep]);

  const setupTOTP = async () => {
    setIsLoading(true);
    try {
      // In a real implementation, this would call the backend
      // For demo purposes, we'll simulate the setup
      const mockSecretKey = 'JBSWY3DPEHPK3PXP';
      const mockQRCode = `otpauth://totp/${user?.email}?secret=${mockSecretKey}&issuer=Spaghetti`;
      
      setSecretKey(mockSecretKey);
      setQrCodeUrl(mockQRCode);
      
      // Generate mock backup codes
      const mockBackupCodes = Array.from({ length: 10 }, () => 
        Math.random().toString(36).substring(2, 10).toUpperCase()
      );
      setBackupCodes(mockBackupCodes);
      
    } catch (error) {
      toast.error('Failed to setup MFA. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const verifyCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast.error('Please enter a valid 6-digit code');
      return;
    }

    setIsLoading(true);
    try {
      // In a real implementation, this would verify with the backend
      // For demo purposes, we'll simulate verification
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('MFA verification successful!');
      setCurrentStep(4);
    } catch (error) {
      toast.error('Invalid verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCode(text);
      toast.success(`${type} copied to clipboard`);
      setTimeout(() => setCopiedCode(''), 2000);
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const downloadBackupCodes = () => {
    const codesText = backupCodes.join('\n');
    const blob = new Blob([codesText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'spaghetti-backup-codes.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Backup codes downloaded');
  };

  const handleComplete = () => {
    toast.success('Multi-factor authentication has been enabled successfully!');
    onComplete?.();
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-between mb-8">
      {setupSteps.map((step, index) => (
        <div key={step.step} className="flex items-center">
          <div className={`
            flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium
            ${step.completed || currentStep === step.step
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 text-gray-600'
            }
          `}>
            {step.completed ? <Check className="h-4 w-4" /> : step.step}
          </div>
          {index < setupSteps.length - 1 && (
            <div className={`
              w-full h-0.5 mx-4
              ${step.completed ? 'bg-blue-600' : 'bg-gray-200'}
            `} />
          )}
        </div>
      ))}
    </div>
  );

  const renderMethodSelection = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <Shield className="h-12 w-12 mx-auto text-blue-600 mb-4" />
        <h3 className="text-lg font-semibold">Choose Your MFA Method</h3>
        <p className="text-gray-600">Select how you'd like to receive verification codes</p>
      </div>

      <div className="space-y-3">
        {mfaMethods.map((method) => (
          <div
            key={method.id}
            className={`
              p-4 border rounded-lg cursor-pointer transition-colors
              ${selectedMethod === method.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
              }
              ${!method.enabled && 'opacity-50 cursor-not-allowed'}
            `}
            onClick={() => method.enabled && setSelectedMethod(method.id)}
          >
            <div className="flex items-center">
              <div className="mr-3">{method.icon}</div>
              <div className="flex-1">
                <div className="flex items-center">
                  <span className="font-medium">{method.name}</span>
                  {method.primary && (
                    <Badge variant="default" className="ml-2">Recommended</Badge>
                  )}
                  {!method.enabled && (
                    <Badge variant="secondary" className="ml-2">Coming Soon</Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600">{method.description}</p>
              </div>
              <div className={`
                w-4 h-4 rounded-full border-2
                ${selectedMethod === method.id
                  ? 'border-blue-500 bg-blue-500'
                  : 'border-gray-300'
                }
              `}>
                {selectedMethod === method.id && (
                  <div className="w-2 h-2 bg-white rounded-full m-0.5" />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-3 pt-6">
        <Button variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button 
          onClick={() => setCurrentStep(2)} 
          className="flex-1"
          disabled={!selectedMethod}
        >
          Continue
        </Button>
      </div>
    </div>
  );

  const renderTOTPSetup = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Smartphone className="h-12 w-12 mx-auto text-blue-600 mb-4" />
        <h3 className="text-lg font-semibold">Setup Authenticator App</h3>
        <p className="text-gray-600">Scan the QR code with your authenticator app</p>
      </div>

      <Tabs defaultValue="qr" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="qr">QR Code</TabsTrigger>
          <TabsTrigger value="manual">Manual Entry</TabsTrigger>
        </TabsList>
        
        <TabsContent value="qr" className="space-y-4">
          <div className="flex justify-center">
            <div className="p-4 bg-white border rounded-lg">
              {/* In a real implementation, this would be a QR code image */}
              <div className="w-48 h-48 bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <Key className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-sm">QR Code</p>
                </div>
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-600 text-center">
            Open your authenticator app and scan this QR code
          </p>
        </TabsContent>
        
        <TabsContent value="manual" className="space-y-4">
          <div>
            <label htmlFor="secret-key">Manual Entry Key</label>
            <div className="flex gap-2 mt-1">
              <input
                id="secret-key"
                value={secretKey}
                readOnly
                className="font-mono text-sm"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(secretKey, 'Secret key')}
              >
                {copiedCode === secretKey ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Enter this key manually in your authenticator app if you can't scan the QR code.
            </AlertDescription>
          </Alert>
        </TabsContent>
      </Tabs>

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => setCurrentStep(1)} className="flex-1">
          Back
        </Button>
        <Button onClick={() => setCurrentStep(3)} className="flex-1">
          Continue
        </Button>
      </div>
    </div>
  );

  const renderVerification = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Shield className="h-12 w-12 mx-auto text-blue-600 mb-4" />
        <h3 className="text-lg font-semibold">Verify Setup</h3>
        <p className="text-gray-600">Enter the 6-digit code from your authenticator app</p>
      </div>

      <div className="max-w-xs mx-auto">
        <label htmlFor="verification-code">Verification Code</label>
        <input
          id="verification-code"
          value={verificationCode}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          placeholder="000000"
          className="text-center text-lg font-mono tracking-widest"
          maxLength={6}
        />
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => setCurrentStep(2)} className="flex-1">
          Back
        </Button>
        <Button 
          onClick={verifyCode} 
          className="flex-1"
          disabled={verificationCode.length !== 6 || isLoading}
        >
          {isLoading ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Verifying...
            </>
          ) : (
            'Verify'
          )}
        </Button>
      </div>
    </div>
  );

  const renderBackupCodes = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Key className="h-12 w-12 mx-auto text-blue-600 mb-4" />
        <h3 className="text-lg font-semibold">Save Your Backup Codes</h3>
        <p className="text-gray-600">Store these codes safely - you'll need them if you lose access to your device</p>
      </div>

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Each backup code can only be used once. Store them in a secure location.
        </AlertDescription>
      </Alert>

      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="grid grid-cols-2 gap-2 font-mono text-sm">
          {backupCodes.map((code, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
              <span>{code}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(code, 'Backup code')}
              >
                {copiedCode === code ? (
                  <Check className="h-3 w-3" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={downloadBackupCodes} className="flex-1">
          <Download className="h-4 w-4 mr-2" />
          Download Codes
        </Button>
        <Button onClick={handleComplete} className="flex-1">
          Complete Setup
        </Button>
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-lg shadow-md">
      <div className="p-6 border-b">
        <h3 className="text-center text-lg font-semibold">Multi-Factor Authentication Setup</h3>
        {renderStepIndicator()}
      </div>
      <div className="p-6">
        {currentStep === 1 && renderMethodSelection()}
        {currentStep === 2 && selectedMethod === 'totp' && renderTOTPSetup()}
        {currentStep === 3 && renderVerification()}
        {currentStep === 4 && renderBackupCodes()}
      </div>
    </div>
  );
};