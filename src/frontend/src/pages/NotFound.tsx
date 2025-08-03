import { Link } from 'react-router-dom';
import { Home, Search, ArrowLeft, FileQuestion } from 'lucide-react';

// Pantry Components
import { Card, CardContent } from '../components/pantry/Card';
import { Button } from '../components/pantry/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-neutral-100 flex items-center justify-center px-4 py-16">
      <div className="max-w-lg w-full">
        <Card variant="elevated" className="shadow-xl">
          <CardContent className="text-center py-12">
            {/* 404 Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center">
                <FileQuestion size={48} className="text-orange-600" />
              </div>
            </div>
            
            {/* Error Code */}
            <h1 className="text-6xl font-bold text-orange-600 mb-4">404</h1>
            
            {/* Title */}
            <h2 className="text-2xl font-semibold text-neutral-900 mb-2">
              Page Not Found
            </h2>
            
            {/* Description */}
            <p className="text-neutral-600 mb-8 leading-relaxed">
              We couldn't find the page you're looking for. It might have been moved, 
              deleted, or you may have mistyped the address.
            </p>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/dashboard">
                <Button 
                  icon={<Home size={16} />}
                  size="lg"
                  fullWidth
                >
                  Go to Dashboard
                </Button>
              </Link>
              
              <Button 
                variant="outline" 
                onClick={() => window.history.back()}
                icon={<ArrowLeft size={16} />}
                size="lg"
                fullWidth
              >
                Go Back
              </Button>
            </div>
            
            {/* Help Text */}
            <div className="mt-8 pt-6 border-t border-neutral-200">
              <p className="text-sm text-neutral-500 mb-4">
                Need help finding what you're looking for?
              </p>
              <div className="flex flex-wrap gap-2 justify-center text-sm">
                <Link 
                  to="/documents" 
                  className="text-orange-600 hover:text-orange-500 hover:underline"
                >
                  Browse Documents
                </Link>
                <span className="text-neutral-300">•</span>
                <Link 
                  to="/search" 
                  className="text-orange-600 hover:text-orange-500 hover:underline"
                >
                  Search Platform
                </Link>
                <span className="text-neutral-300">•</span>
                <Link 
                  to="/support" 
                  className="text-orange-600 hover:text-orange-500 hover:underline"
                >
                  Contact Support
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-neutral-500">
            Spaghetti Platform - AI-Powered Enterprise Documentation
          </p>
        </div>
      </div>
    </div>
  );
}