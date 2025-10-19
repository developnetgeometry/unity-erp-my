import { useState } from 'react';
import { LeaveRequestData, TeamMember } from '@/types/leave-request';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Search, Check, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Step3Props {
  coverageDelegate: LeaveRequestData['coverageDelegate'];
  onSelectDelegate: (delegate: LeaveRequestData['coverageDelegate']) => void;
  teamMembers: TeamMember[];
  suggestions: TeamMember[];
}

export function Step3Coverage({ coverageDelegate, onSelectDelegate, teamMembers, suggestions }: Step3Props) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTeamMembers = searchQuery
    ? teamMembers.filter((member) => member.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : suggestions;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">Coverage Delegation</h2>
        <p className="text-muted-foreground">Who can cover for you during your leave? (Optional)</p>
      </div>

      <Alert>
        <Users className="h-4 w-4" />
        <AlertDescription>
          Selecting a coverage delegate helps ensure smooth operations and faster approval. You can skip this step if not applicable.
        </AlertDescription>
      </Alert>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Search for a team member..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Selected Delegate */}
      {coverageDelegate && (
        <Card className="p-4 border-primary">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="w-12 h-12">
                <AvatarImage src={coverageDelegate.avatar} />
                <AvatarFallback>{coverageDelegate.name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{coverageDelegate.name}</p>
                <p className="text-sm text-muted-foreground">Selected as coverage</p>
              </div>
            </div>
            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
              <Check className="w-4 h-4 text-primary-foreground" />
            </div>
          </div>
        </Card>
      )}

      {/* Suggested Team Members */}
      <div className="space-y-3">
        {!searchQuery && suggestions.length > 0 && (
          <h3 className="font-semibold text-sm text-muted-foreground">Suggested (Same role/project)</h3>
        )}

        <div className="space-y-2">
          {filteredTeamMembers.map((member) => {
            const isSelected = coverageDelegate?.id === member.id;

            return (
              <Card
                key={member.id}
                className={cn(
                  'p-4 cursor-pointer transition-all hover:shadow-md',
                  isSelected && 'border-primary bg-primary/5'
                )}
                onClick={() =>
                  onSelectDelegate(
                    isSelected
                      ? undefined
                      : {
                          id: member.id,
                          name: member.name,
                          avatar: member.avatar,
                        }
                  )
                }
              >
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={member.avatar} />
                    <AvatarFallback>{member.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-semibold">{member.name}</p>
                    <p className="text-sm text-muted-foreground">{member.role}</p>
                  </div>
                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-4 h-4 text-primary-foreground" />
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {filteredTeamMembers.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No team members found</p>
        </div>
      )}
    </div>
  );
}
