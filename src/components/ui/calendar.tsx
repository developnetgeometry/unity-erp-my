import * as React from "react";
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from "lucide-react";
import { DayPicker, CaptionProps } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

// Custom caption component with year picker
function CustomCaption({ displayMonth, onMonthChange }: CaptionProps & { onMonthChange?: (month: Date) => void }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const currentYear = displayMonth.getFullYear();
  const currentMonth = displayMonth.getMonth();
  
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  
  // Generate years from 1900 to current year + 10
  const years = React.useMemo(() => {
    const currentYear = new Date().getFullYear();
    const yearList = [];
    for (let i = 1900; i <= currentYear + 10; i++) {
      yearList.push(i);
    }
    return yearList;
  }, []);

  const handleYearSelect = (year: number) => {
    const newDate = new Date(year, currentMonth, 1);
    onMonthChange?.(newDate);
    setIsOpen(false);
  };

  const handlePrevMonth = () => {
    const newDate = new Date(currentYear, currentMonth - 1, 1);
    onMonthChange?.(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentYear, currentMonth + 1, 1);
    onMonthChange?.(newDate);
  };

  return (
    <div className="flex justify-between items-center px-2 py-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={handlePrevMonth}
        className="h-7 w-7"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            className="font-medium hover:bg-accent"
          >
            {months[currentMonth]} {currentYear}
            <ChevronDown className="ml-1 h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[320px] p-0" align="center">
          <div className="p-4 border-b">
            <div className="text-sm font-medium text-center">Select Year</div>
          </div>
          <ScrollArea className="h-[280px]">
            <div className="grid grid-cols-4 gap-2 p-4">
              {years.map((year) => (
                <Button
                  key={year}
                  variant={year === currentYear ? "default" : "ghost"}
                  onClick={() => handleYearSelect(year)}
                  className={cn(
                    "h-10 w-full",
                    year === currentYear && "bg-primary text-primary-foreground"
                  )}
                >
                  {year}
                </Button>
              ))}
            </div>
          </ScrollArea>
        </PopoverContent>
      </Popover>

      <Button
        variant="ghost"
        size="icon"
        onClick={handleNextMonth}
        className="h-7 w-7"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  const [month, setMonth] = React.useState<Date>(props.month || new Date());
  React.useEffect(() => {
    if (props.month) {
      setMonth(props.month);
    }
  }, [props.month]);

  const handleMonthChange = (newMonth: Date) => {
    setMonth(newMonth);
    props.onMonthChange?.(newMonth);
  };

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      month={month}
      onMonthChange={handleMonthChange}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "hidden", // Hide default caption label
        nav: "hidden", // Hide default navigation
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(buttonVariants({ variant: "ghost" }), "h-9 w-9 p-0 font-normal aria-selected:opacity-100"),
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside:
          "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        Caption: (captionProps) => <CustomCaption {...captionProps} onMonthChange={handleMonthChange} />,
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
