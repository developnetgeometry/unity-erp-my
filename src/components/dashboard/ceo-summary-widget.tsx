import * as React from "react";
import { ChevronDown, TrendingUp, TrendingDown, Clock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface CEOSummaryWidgetProps {
  cashPosition: {
    amount: number;
    trendData: number[]; // 7-day array
    runwayDays: number;
  };
  pendingApprovals: {
    total: number;
    aging: number; // Days since oldest
    breakdown: {
      leave: number;
      expenses: number;
      invoices: number;
    };
  };
  nextDeadline: {
    name: string;
    date: Date;
    daysUntil: number;
    status: 'draft' | 'ready' | 'submitted';
  };
  onCashClick?: () => void;
  onApprovalsClick?: (type: 'leave' | 'expenses' | 'invoices') => void;
  onDeadlineClick?: () => void;
}

export function CEOSummaryWidget({
  cashPosition,
  pendingApprovals,
  nextDeadline,
  onCashClick,
  onApprovalsClick,
  onDeadlineClick,
}: CEOSummaryWidgetProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-MY', {
      style: 'currency',
      currency: 'MYR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Calculate trend direction
  const trendDirection = React.useMemo(() => {
    if (cashPosition.trendData.length < 2) return 'flat';
    const first = cashPosition.trendData[0];
    const last = cashPosition.trendData[cashPosition.trendData.length - 1];
    return last > first ? 'up' : last < first ? 'down' : 'flat';
  }, [cashPosition.trendData]);

  // Mini sparkline SVG
  const renderSparkline = () => {
    const data = cashPosition.trendData;
    if (data.length < 2) return null;

    const width = 60;
    const height = 30;
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;

    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${x},${y}`;
    }).join(' ');

    const color = trendDirection === 'up' ? '#047857' : trendDirection === 'down' ? '#EF4444' : '#6B7280';

    return (
      <svg width={width} height={height} className="inline-block">
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  };

  // Status badge colors
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-700';
      case 'ready': return 'bg-amber-100 text-amber-700';
      case 'submitted': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <Card
      className={cn(
        "border-l-4 border-primary transition-all duration-200 cursor-pointer sticky top-0 z-10",
        isExpanded ? "shadow-md" : "shadow-sm"
      )}
      onClick={() => setIsExpanded(!isExpanded)}
      role="button"
      aria-expanded={isExpanded}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setIsExpanded(!isExpanded);
        }
      }}
    >
      {/* Collapsed State - Always Visible */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700">Executive Summary</h3>
          <ChevronDown
            className={cn(
              "h-5 w-5 text-gray-500 transition-transform duration-200",
              isExpanded && "rotate-180"
            )}
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          {/* Cash Position */}
          <div className="text-center">
            <div className="text-xs text-gray-500 mb-1">Cash</div>
            <div className="font-semibold text-sm text-gray-900 mb-1">
              {formatCurrency(cashPosition.amount)}
            </div>
            {renderSparkline()}
          </div>

          {/* Pending Approvals */}
          <div className="text-center border-x border-gray-200">
            <div className="text-xs text-gray-500 mb-1">Approvals</div>
            <div className="flex items-center justify-center gap-1 mb-2">
              <Badge variant="secondary" className="text-base font-bold">
                {pendingApprovals.total}
              </Badge>
              {pendingApprovals.aging > 3 && (
                <div className="h-2 w-2 bg-red-500 rounded-full" title="Items over 3 days old" />
              )}
            </div>
          </div>

          {/* Next Deadline */}
          <div className="text-center">
            <div className="text-xs text-gray-500 mb-1">Deadline</div>
            <div className="font-semibold text-sm text-gray-900 mb-1">
              {nextDeadline.daysUntil === 0 ? 'Today' : `In ${nextDeadline.daysUntil}d`}
            </div>
            <div className="text-xs text-gray-600 truncate">
              {nextDeadline.name}
            </div>
          </div>
        </div>
      </div>

      {/* Expanded State - Detailed View */}
      {isExpanded && (
        <div className="border-t border-gray-200 p-4 space-y-4 animate-accordion-down">
          {/* Cash Position Details */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-gray-900">Cash Position</h4>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  onCashClick?.();
                }}
              >
                View Details
              </Button>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(cashPosition.amount)}
              </div>
              {trendDirection !== 'flat' && (
                trendDirection === 'up' ? (
                  <TrendingUp className="h-5 w-5 text-green-600" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-red-600" />
                )
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              <span>Runway: {cashPosition.runwayDays} days at current burn rate</span>
            </div>
          </div>

          {/* Pending Approvals Breakdown */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Pending Approvals</h4>
            <div className="flex gap-2 flex-wrap">
              {pendingApprovals.breakdown.leave > 0 && (
                <Badge
                  variant="outline"
                  className="cursor-pointer hover:bg-primary/10"
                  onClick={(e) => {
                    e.stopPropagation();
                    onApprovalsClick?.('leave');
                  }}
                >
                  Leave: {pendingApprovals.breakdown.leave}
                </Badge>
              )}
              {pendingApprovals.breakdown.expenses > 0 && (
                <Badge
                  variant="outline"
                  className="cursor-pointer hover:bg-primary/10"
                  onClick={(e) => {
                    e.stopPropagation();
                    onApprovalsClick?.('expenses');
                  }}
                >
                  Expenses: {pendingApprovals.breakdown.expenses}
                </Badge>
              )}
              {pendingApprovals.breakdown.invoices > 0 && (
                <Badge
                  variant="outline"
                  className="cursor-pointer hover:bg-primary/10"
                  onClick={(e) => {
                    e.stopPropagation();
                    onApprovalsClick?.('invoices');
                  }}
                >
                  Invoices: {pendingApprovals.breakdown.invoices}
                </Badge>
              )}
            </div>
            {pendingApprovals.aging > 3 && (
              <div className="flex items-center gap-2 mt-2 text-sm text-amber-700">
                <AlertCircle className="h-4 w-4" />
                <span>Oldest item: {pendingApprovals.aging} days</span>
              </div>
            )}
          </div>

          {/* Compliance Deadline */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Next Compliance Deadline</h4>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900">{nextDeadline.name}</div>
                <div className="text-sm text-gray-600">
                  {nextDeadline.date.toLocaleDateString('en-MY', { 
                    day: 'numeric', 
                    month: 'short', 
                    year: 'numeric' 
                  })}
                </div>
              </div>
              <Button
                size="sm"
                className={getStatusColor(nextDeadline.status)}
                onClick={(e) => {
                  e.stopPropagation();
                  onDeadlineClick?.();
                }}
              >
                {nextDeadline.status === 'draft' && 'Complete Now'}
                {nextDeadline.status === 'ready' && 'Review'}
                {nextDeadline.status === 'submitted' && 'View'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
