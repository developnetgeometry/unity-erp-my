import { format } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import { cn } from '@/lib/utils';

interface SidebarCalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  className?: string;
}

export const SidebarCalendar = ({ selectedDate, onDateSelect, className }: SidebarCalendarProps) => {
  const today = new Date();
  const isToday = (date: Date) => 
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();

  const isSelected = (date: Date) =>
    date.getDate() === selectedDate.getDate() &&
    date.getMonth() === selectedDate.getMonth() &&
    date.getFullYear() === selectedDate.getFullYear();

  return (
    <div className={cn('flex flex-col h-full', className)}>
      <DayPicker
        mode="single"
        selected={selectedDate}
        onSelect={(date) => date && onDateSelect(date)}
        className="flex-1"
        classNames={{
          months: 'flex flex-col space-y-4 h-full',
          month: 'space-y-4 flex-1',
          caption: 'flex justify-between items-center px-2 mb-2',
          caption_label: 'text-base font-medium text-[#4B5563]',
          nav: 'flex items-center gap-1',
          nav_button: cn(
            'h-8 w-8 bg-transparent p-0 opacity-80 hover:opacity-100 inline-flex items-center justify-center rounded-md transition-opacity'
          ),
          nav_button_previous: 'absolute left-1',
          nav_button_next: 'absolute right-1',
          table: 'w-full border-collapse',
          head_row: 'flex justify-between mb-2',
          head_cell: 'text-muted-foreground rounded-md w-9 font-normal text-xs flex-1 text-center',
          row: 'flex w-full justify-between mb-1',
          cell: cn(
            'relative p-0 text-center text-sm focus-within:relative focus-within:z-20 flex-1',
            '[&:has([aria-selected])]:bg-transparent'
          ),
          day: cn(
            'h-9 w-9 p-0 font-normal rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(330,81%,50%)] focus-visible:ring-offset-2'
          ),
          day_selected: cn(
            'bg-[hsl(330,81%,50%)] text-white font-semibold hover:bg-[hsl(330,81%,50%)] hover:text-white',
            'shadow-[0_2px_8px_rgba(233,30,147,0.3)]'
          ),
          day_today: 'border-2 border-[hsl(330,81%,50%)] font-medium',
          day_outside: 'text-muted-foreground opacity-50',
          day_disabled: 'text-muted-foreground opacity-30 cursor-not-allowed',
          day_hidden: 'invisible',
        }}
        components={{
          IconLeft: () => <ChevronLeft className="h-4 w-4 text-[hsl(330,81%,50%)]" />,
          IconRight: () => <ChevronRight className="h-4 w-4 text-[hsl(330,81%,50%)]" />,
        }}
        modifiers={{
          today: today,
        }}
        modifiersClassNames={{
          today: !isSelected(today) ? 'border-2 border-[hsl(330,81%,50%)]' : '',
        }}
      />
      
      {/* Selected Date Badge */}
      <div className="mt-auto pt-4 border-t">
        <div className="bg-[hsl(330,81%,50%)] text-white rounded-xl px-4 py-2 text-center">
          <p className="text-xs font-medium mb-1 opacity-90">Selected Date</p>
          <p className="text-sm font-semibold">
            {format(selectedDate, 'EEEE, MMMM dd, yyyy')}
          </p>
        </div>
      </div>
    </div>
  );
};
