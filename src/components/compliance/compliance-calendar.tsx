import * as React from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export interface ComplianceDeadline {
  id: string;
  name: string;
  description: string;
  dueDate: Date;
  category: 'EPF' | 'SOCSO' | 'LHDN' | 'EIS' | 'Custom';
  recurrence: 'monthly' | 'quarterly' | 'annual' | 'once';
  status: 'draft' | 'ready' | 'submitted' | 'confirmed' | 'overdue';
  legalReference?: string;
  penalty?: string;
  formUrl?: string;
}

export interface ComplianceCalendarProps {
  year: number;
  month: number;
  deadlines: ComplianceDeadline[];
  onDeadlineClick: (deadline: ComplianceDeadline) => void;
  view?: 'monthly' | 'annual';
}

type UrgencyLevel = 'safe' | 'warning' | 'urgent' | 'overdue';

interface CountdownResult {
  text: string;
  urgency: UrgencyLevel;
}

function getCountdown(dueDate: Date): CountdownResult {
  const diffDays = Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return { text: `Overdue by ${Math.abs(diffDays)} days`, urgency: 'overdue' };
  if (diffDays === 0) return { text: 'Due today', urgency: 'urgent' };
  if (diffDays === 1) return { text: 'Due tomorrow', urgency: 'urgent' };
  if (diffDays <= 3) return { text: `In ${diffDays} days`, urgency: 'urgent' };
  if (diffDays <= 7) return { text: `In ${diffDays} days`, urgency: 'warning' };
  return { text: `In ${diffDays} days`, urgency: 'safe' };
}

const urgencyColors: Record<UrgencyLevel, { bg: string; border: string; text: string }> = {
  safe: { bg: 'bg-green-50', border: 'border-l-4 border-green-500', text: 'text-green-800' },
  warning: { bg: 'bg-amber-50', border: 'border-l-4 border-amber-500', text: 'text-amber-800' },
  urgent: { bg: 'bg-red-50', border: 'border-l-4 border-red-500', text: 'text-red-800' },
  overdue: { bg: 'bg-red-100', border: 'border-l-4 border-red-700', text: 'text-red-900' },
};

const statusColors: Record<ComplianceDeadline['status'], string> = {
  draft: 'bg-gray-500',
  ready: 'bg-amber-500',
  submitted: 'bg-green-500',
  confirmed: 'bg-blue-500',
  overdue: 'bg-red-500',
};

const categoryIcons: Record<ComplianceDeadline['category'], string> = {
  EPF: '🏦',
  SOCSO: '🛡️',
  LHDN: '📋',
  EIS: '💼',
  Custom: '📌',
};

export const ComplianceCalendar: React.FC<ComplianceCalendarProps> = ({
  year,
  month,
  deadlines,
  onDeadlineClick,
  view = 'monthly',
}) => {
  const [currentDate, setCurrentDate] = React.useState(new Date(year, month - 1));
  const [filterCategory, setFilterCategory] = React.useState<ComplianceDeadline['category'] | 'all'>('all');

  const filteredDeadlines = React.useMemo(() => {
    return filterCategory === 'all' 
      ? deadlines 
      : deadlines.filter(d => d.category === filterCategory);
  }, [deadlines, filterCategory]);

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Pad calendar to start on Sunday
  const firstDayOfWeek = monthStart.getDay();
  const paddingDays = Array.from({ length: firstDayOfWeek }, (_, i) => {
    const date = new Date(monthStart);
    date.setDate(date.getDate() - (firstDayOfWeek - i));
    return date;
  });

  const allCalendarDays = [...paddingDays, ...calendarDays];

  const getDeadlinesForDate = (date: Date) => {
    return filteredDeadlines.filter(d => isSameDay(d.dueDate, date));
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          {format(currentDate, 'MMMM yyyy')}
        </h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handlePrevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <Button
          variant={filterCategory === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilterCategory('all')}
        >
          All
        </Button>
        {(['EPF', 'SOCSO', 'LHDN', 'EIS'] as const).map(cat => (
          <Button
            key={cat}
            variant={filterCategory === cat ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterCategory(cat)}
          >
            {categoryIcons[cat]} {cat}
          </Button>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-2 text-center text-xs font-semibold text-gray-700">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7">
          {allCalendarDays.map((date, idx) => {
            const dayDeadlines = getDeadlinesForDate(date);
            const isCurrentMonth = isSameMonth(date, currentDate);
            const isToday = isSameDay(date, new Date());

            return (
              <div
                key={idx}
                className={cn(
                  'min-h-[100px] p-2 border-b border-r border-gray-200',
                  !isCurrentMonth && 'bg-gray-50'
                )}
              >
                {/* Date Number */}
                <div className={cn(
                  'text-sm font-medium mb-1',
                  isToday && 'inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white',
                  !isCurrentMonth && 'text-gray-400'
                )}>
                  {format(date, 'd')}
                </div>

                {/* Deadline Cards */}
                <div className="space-y-1">
                  {dayDeadlines.map(deadline => {
                    const countdown = getCountdown(deadline.dueDate);
                    const colors = urgencyColors[countdown.urgency];

                    return (
                      <button
                        key={deadline.id}
                        onClick={() => onDeadlineClick(deadline)}
                        className={cn(
                          'w-full text-left p-2 rounded-md text-xs transition-all hover:shadow-md',
                          colors.bg,
                          colors.border,
                          'focus:outline-none focus:ring-2 focus:ring-primary'
                        )}
                      >
                        <div className="flex items-start gap-1">
                          <span className="text-sm">{categoryIcons[deadline.category]}</span>
                          <div className="flex-1 min-w-0">
                            <div className={cn('font-semibold truncate', colors.text)}>
                              {deadline.name}
                            </div>
                            <div className={cn('text-xs', colors.text)}>
                              {countdown.text}
                            </div>
                            <Badge
                              className={cn(
                                'mt-1 text-white text-xs',
                                statusColors[deadline.status]
                              )}
                            >
                              {deadline.status}
                            </Badge>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-3">
          <div className="text-2xl font-bold text-green-600">
            {filteredDeadlines.filter(d => d.status === 'confirmed').length}
          </div>
          <div className="text-xs text-gray-600">Completed</div>
        </Card>
        <Card className="p-3">
          <div className="text-2xl font-bold text-amber-600">
            {filteredDeadlines.filter(d => d.status === 'draft' || d.status === 'ready').length}
          </div>
          <div className="text-xs text-gray-600">In Progress</div>
        </Card>
        <Card className="p-3">
          <div className="text-2xl font-bold text-red-600">
            {filteredDeadlines.filter(d => getCountdown(d.dueDate).urgency === 'urgent').length}
          </div>
          <div className="text-xs text-gray-600">Urgent</div>
        </Card>
        <Card className="p-3">
          <div className="text-2xl font-bold text-red-800">
            {filteredDeadlines.filter(d => d.status === 'overdue').length}
          </div>
          <div className="text-xs text-gray-600">Overdue</div>
        </Card>
      </div>
    </div>
  );
};
