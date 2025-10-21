import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronDown, ChevronUp } from 'lucide-react';

export function SessionDebug() {
  const [isExpanded, setIsExpanded] = useState(false);
  const { session, user, loading } = useAuth();

  // Only show in development
  if (import.meta.env.PROD) {
    return null;
  }

  const getTokenExpiration = () => {
    if (!session?.expires_at) return 'N/A';
    const expiresAt = new Date(session.expires_at * 1000);
    const now = new Date();
    const minutesUntilExpiry = Math.floor((expiresAt.getTime() - now.getTime()) / 1000 / 60);
    
    return `${expiresAt.toLocaleTimeString()} (${minutesUntilExpiry} min)`;
  };

  const getStatus = () => {
    if (loading) return { label: 'Loading', color: 'text-yellow-600' };
    if (!session) return { label: 'No Session', color: 'text-red-600' };
    if (session.expires_at && (session.expires_at * 1000) < Date.now()) {
      return { label: 'Expired', color: 'text-red-600' };
    }
    return { label: 'Active', color: 'text-green-600' };
  };

  const status = getStatus();

  return (
    <Card className="mb-4 border-dashed border-2 border-yellow-500 bg-yellow-50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-mono">
            🔍 Session Debug (Dev Only)
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="space-y-2 text-xs font-mono">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="font-semibold">Status:</span>
            </div>
            <div className={status.color}>
              {status.label}
            </div>

            <div>
              <span className="font-semibold">User ID:</span>
            </div>
            <div className="truncate">
              {user?.id || 'N/A'}
            </div>

            <div>
              <span className="font-semibold">Email:</span>
            </div>
            <div className="truncate">
              {user?.email || 'N/A'}
            </div>

            <div>
              <span className="font-semibold">Token Expires:</span>
            </div>
            <div>
              {getTokenExpiration()}
            </div>

            <div>
              <span className="font-semibold">Access Token:</span>
            </div>
            <div className="truncate">
              {session?.access_token ? `${session.access_token.substring(0, 20)}...` : 'N/A'}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
