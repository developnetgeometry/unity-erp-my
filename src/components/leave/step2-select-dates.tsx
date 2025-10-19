import { useState } from 'react';
import { LeaveRequestData, TeamMember } from '@/types/leave-request';
import { Calendar } from '@/components/ui/calendar';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Users } from 'lucide-react';
import { format, differenceInDays, addDays, isSameDay } from 'date-fns';
import { cn } from '@/lib/utils';

interface Step2Props {
  startDate: Date | null;
  endDate: Date | null;
  duration: LeaveRequestData['duration'];
  onDateChange: (start: Date | null, end: Date | null) => void;
  onDurationChange: (duration: LeaveRequestData['duration']) => void;
  balance: number;
  teamMembers: TeamMember[];
  publicHolidays: Date[];
}

export function Step2SelectDates({
  startDate,
  endDate,
  duration,
  onDateChange,
  onDurationChange,
  balance,
  teamMembers,
  publicHolidays,
}: Step2Props) {
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: startDate || undefined,
    to: endDate || undefined,
  });

  const handleDateSelect = (range: { from: Date | undefined; to: Date | undefined } | undefined) => {
    if (range) {
      setDateRange(range);
      onDateChange(range.from || null, range.to || range.from || null);
    }
  };

  // Calculate days requested
  const daysRequested = startDate && endDate ? differenceInDays(endDate, startDate) + 1 : 0;
  const balanceAfter = balance - daysRequested;

  // Calculate advance notice
  const advanceNoticeDays = startDate ? differenceInDays(startDate, new Date()) : 0;
  const hasShortNotice = advanceNoticeDays < 7;

  // Check team coverage
  const teamMembersOnLeave = teamMembers.filter((member) => {
    if (!member.onLeave || !startDate) return false;
    return (
      (isSameDay(startDate, member.onLeave.start) ||
        (startDate >= member.onLeave.start && startDate <= member.onLeave.end)) ||
      (endDate &&
        (isSameDay(endDate, member.onLeave.end) ||
          (endDate >= member.onLeave.start && endDate <= member.onLeave.end)))
    );
  });

  const coveragePercentage = teamMembers.length > 0 ? (teamMembersOnLeave.length / teamMembers.length) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">Select Dates</h2>
        <p className="text-muted-foreground">Choose your leave dates and check team availability</p>
      </div>

      {/* Calendar */}
      <Card className="p-4">
        <Calendar
          mode="range"
          selected={dateRange}
          onSelect={handleDateSelect}
          numberOfMonths={1}
          disabled={(date) => {
            // Disable past dates
            if (date < new Date()) return true;
            // Disable public holidays
            return publicHolidays.some((holiday) => isSameDay(date, holiday));
          }}
          modifiers={{
            publicHoliday: publicHolidays,
            teamLeave: (date) =>
              teamMembers.some(
                (member) =>
                  member.onLeave &&
                  member.onLeave.status === 'approved' &&
                  date >= member.onLeave.start &&
                  date <= member.onLeave.end
              ),
            teamPending: (date) =>
              teamMembers.some(
                (member) =>
                  member.onLeave &&
                  member.onLeave.status === 'pending' &&
                  date >= member.onLeave.start &&
                  date <= member.onLeave.end
              ),
          }}
          modifiersClassNames={{
            publicHoliday: 'bg-red-100 text-red-900',
            teamLeave: 'bg-amber-100 text-amber-900',
            teamPending: 'bg-amber-50 text-amber-800 line-through',
          }}
          className="pointer-events-auto"
        />
      </Card>

      {/* Balance Display */}
      {startDate && endDate && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Leave Balance</p>
              <p className="text-2xl font-bold">
                {balance} days → {balanceAfter} days
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Days requested</p>
              <p className="text-xl font-semibold">{daysRequested}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Duration Options */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">Duration</Label>
        <RadioGroup value={duration} onValueChange={(value) => onDurationChange(value as any)}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="full" id="full" />
            <Label htmlFor="full" className="cursor-pointer font-normal">
              Full Day
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="morning" id="morning" />
            <Label htmlFor="morning" className="cursor-pointer font-normal">
              Morning Half (9 AM - 1 PM)
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="afternoon" id="afternoon" />
            <Label htmlFor="afternoon" className="cursor-pointer font-normal">
              Afternoon Half (2 PM - 6 PM)
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* Warnings */}
      {hasShortNotice && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Short notice ({advanceNoticeDays} days) - Manager discretion required. Standard policy requires 7-day advance notice.
          </AlertDescription>
        </Alert>
      )}

      {coveragePercentage > 30 && (
        <Alert>
          <Users className="h-4 w-4" />
          <AlertDescription>
            Team coverage: {teamMembersOnLeave.length} of {teamMembers.length} teammates out ({Math.round(coveragePercentage)}%)
          </AlertDescription>
        </Alert>
      )}

      {/* Team Availability */}
      {teamMembersOnLeave.length > 0 && (
        <Card className="p-4">
          <h3 className="font-semibold mb-3">Team Members on Leave</h3>
          <div className="flex flex-wrap gap-2">
            {teamMembersOnLeave.map((member) => (
              <div key={member.id} className="flex items-center gap-2 bg-muted rounded-full px-3 py-1">
                <Avatar className="w-6 h-6">
                  <AvatarImage src={member.avatar} />
                  <AvatarFallback>{member.name[0]}</AvatarFallback>
                </Avatar>
                <span className="text-sm">{member.name}</span>
                {member.onLeave?.status === 'pending' && (
                  <Badge variant="outline" className="text-xs">
                    Pending
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
