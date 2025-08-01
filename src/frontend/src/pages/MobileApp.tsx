import React from 'react';
import { Smartphone, Apple, Play, Star, Users, FileText, Zap } from 'lucide-react';

const MobileApp: React.FC = () => {
  // const [selectedPlatform, setSelectedPlatform] = useState<'ios' | 'android'>('ios');

  const appFeatures = [
    {
      icon: <FileText className="h-6 w-6 text-blue-600" />,
      title: 'Offline Document Access',
      description: 'Access and edit documents even without internet connection'
    },
    {
      icon: <Users className="h-6 w-6 text-green-600" />,
      title: 'Real-time Collaboration',
      description: 'Collaborate with team members in real-time on mobile devices'
    },
    {
      icon: <Zap className="h-6 w-6 text-purple-600" />,
      title: 'AI-Powered Features',
      description: 'Document classification and smart suggestions on the go'
    },
    {
      icon: <Smartphone className="h-6 w-6 text-indigo-600" />,
      title: 'Native Performance',
      description: 'Optimized native experience for iOS and Android'
    }
  ];

  const appStats = {
    downloads: '25K+',
    rating: 4.8,
    reviews: 1247,
    lastUpdate: '2025-07-28'
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Enterprise Mobile App</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Take the power of our enterprise platform with you. Access documents, collaborate with teams, 
          and manage workflows from anywhere with our native mobile applications.
        </p>
      </div>

      {/* App Preview and Download Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* App Info */}
          <div>
            <h2 className="text-3xl font-bold mb-4">Download Our Mobile App</h2>
            <p className="text-indigo-100 mb-6">
              Experience seamless document management and collaboration on your mobile device with 
              our feature-rich native app.
            </p>
            
            {/* App Statistics */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold">{appStats.downloads}</div>
                <div className="text-indigo-200 text-sm">Downloads</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold flex items-center justify-center">
                  {appStats.rating} <Star className="h-5 w-5 ml-1 fill-current" />
                </div>
                <div className="text-indigo-200 text-sm">Rating</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{appStats.reviews}</div>
                <div className="text-indigo-200 text-sm">Reviews</div>
              </div>
            </div>

            {/* Download Buttons */}
            <div className="flex space-x-4">
              <button className="flex items-center bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors">
                <Apple className="h-6 w-6 mr-2" />
                <div className="text-left">
                  <div className="text-xs">Download on the</div>
                  <div className="font-semibold">App Store</div>
                </div>
              </button>
              <button className="flex items-center bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors">
                <Play className="h-6 w-6 mr-2" />
                <div className="text-left">
                  <div className="text-xs">Get it on</div>
                  <div className="font-semibold">Google Play</div>
                </div>
              </button>
            </div>
          </div>

          {/* Phone Mockup */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-64 h-96 bg-gray-900 rounded-3xl p-2 shadow-2xl">
                <div className="w-full h-full bg-white rounded-2xl overflow-hidden">
                  {/* Mock App Interface */}
                  <div className="bg-indigo-600 h-20 flex items-center justify-center">
                    <h3 className="text-white font-semibold">Enterprise Docs</h3>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="bg-gray-100 h-16 rounded-lg flex items-center px-3">
                      <FileText className="h-8 w-8 text-blue-600 mr-3" />
                      <div>
                        <div className="font-medium text-sm">Service Agreement</div>
                        <div className="text-xs text-gray-500">Modified 2h ago</div>
                      </div>
                    </div>
                    <div className="bg-gray-100 h-16 rounded-lg flex items-center px-3">
                      <FileText className="h-8 w-8 text-green-600 mr-3" />
                      <div>
                        <div className="font-medium text-sm">Legal Brief</div>
                        <div className="text-xs text-gray-500">Shared by Sarah</div>
                      </div>
                    </div>
                    <div className="bg-gray-100 h-16 rounded-lg flex items-center px-3">
                      <FileText className="h-8 w-8 text-purple-600 mr-3" />
                      <div>
                        <div className="font-medium text-sm">Policy Document</div>
                        <div className="text-xs text-gray-500">In review</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Floating notification */}
              <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                3 new
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Mobile App Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {appFeatures.map((feature, index) => (
            <div key={index} className="text-center p-6 bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="flex justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Progressive Web App Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Progressive Web App (PWA)</h2>
            <p className="text-gray-600 mb-6">
              Can't download the native app? No problem! Our Progressive Web App provides 
              a native-like experience directly in your mobile browser with offline capabilities.
            </p>
            <div className="space-y-3">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-700">Works offline</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-700">Install to home screen</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-700">Push notifications</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-700">Automatic updates</span>
              </div>
            </div>
            <button className="mt-6 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors">
              Try PWA Now
            </button>
          </div>
          <div className="text-center">
            <div className="inline-block p-4 bg-indigo-100 rounded-full">
              <Smartphone className="h-16 w-16 text-indigo-600" />
            </div>
          </div>
        </div>
      </div>

      {/* System Requirements */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">System Requirements</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
              <Apple className="h-5 w-5 mr-2" />
              iOS Requirements
            </h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• iOS 14.0 or later</li>
              <li>• iPhone 8 or newer</li>
              <li>• 100 MB available storage</li>
              <li>• Internet connection required</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
              <Play className="h-5 w-5 mr-2" />
              Android Requirements
            </h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Android 8.0 (API level 26) or higher</li>
              <li>• 100 MB available storage</li>
              <li>• Internet connection required</li>
              <li>• Supports phones and tablets</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Coming Soon Features */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Coming Soon</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border border-gray-200 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Biometric Authentication</h3>
            <p className="text-sm text-gray-600">Touch ID and Face ID support for secure access</p>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Voice Transcription</h3>
            <p className="text-sm text-gray-600">Convert voice notes to text using AI</p>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Document Scanning</h3>
            <p className="text-sm text-gray-600">Scan physical documents with your camera</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileApp;