import * as React from "react";
import { CEOSummaryWidget } from "@/components/dashboard/ceo-summary-widget";
import { BottomTabBar } from "@/components/mobile/bottom-tab-bar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

type TabValue = 'dashboard' | 'leave' | 'approvals' | 'more' | 'profile';

export default function MobileDashboard() {
  const [activeTab, setActiveTab] = React.useState<TabValue>('dashboard');
  const { toast } = useToast();

  // Sample data
  const ceoData = {
    cashPosition: {
      amount: 150000,
      trendData: [145000, 148000, 150000, 152000, 150000, 148000, 150000],
      runwayDays: 45,
    },
    pendingApprovals: {
      total: 10,
      aging: 5,
      breakdown: {
        leave: 3,
        expenses: 5,
        invoices: 2,
      },
    },
    nextDeadline: {
      name: 'EPF Submission',
      date: new Date('2025-11-15'),
      daysUntil: 5,
      status: 'draft' as const,
    },
  };

  const handleCashClick = () => {
    toast({
      title: "Cash Position",
      description: "Navigating to financial reports...",
    });
  };

  const handleApprovalsClick = (type: 'leave' | 'expenses' | 'invoices') => {
    toast({
      title: "Pending Approvals",
      description: `Showing ${type} approvals...`,
    });
  };

  const handleDeadlineClick = () => {
    toast({
      title: "Compliance Deadline",
      description: "Opening EPF submission form...",
    });
  };

  const handleTabChange = (tab: TabValue) => {
    setActiveTab(tab);
    toast({
      title: "Navigation",
      description: `Navigated to ${tab}`,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Mobile Dashboard Content */}
      <div className="p-4 space-y-4">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-600">Welcome back, Sarah</p>
        </div>

        {/* CEO Summary Widget */}
        <CEOSummaryWidget
          cashPosition={ceoData.cashPosition}
          pendingApprovals={ceoData.pendingApprovals}
          nextDeadline={ceoData.nextDeadline}
          onCashClick={handleCashClick}
          onApprovalsClick={handleApprovalsClick}
          onDeadlineClick={handleDeadlineClick}
        />

        {/* Demo Cards */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-gray-700">Leave request approved</span>
                <span className="text-xs text-gray-500">2 hours ago</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-gray-700">Expense claim submitted</span>
                <span className="text-xs text-gray-500">5 hours ago</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-gray-700">Invoice payment processed</span>
                <span className="text-xs text-gray-500">1 day ago</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <button className="p-4 bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors">
                <div className="text-sm font-medium text-primary">Submit Leave</div>
              </button>
              <button className="p-4 bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors">
                <div className="text-sm font-medium text-primary">Add Expense</div>
              </button>
              <button className="p-4 bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors">
                <div className="text-sm font-medium text-primary">View Payslip</div>
              </button>
              <button className="p-4 bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors">
                <div className="text-sm font-medium text-primary">Team Calendar</div>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Current Tab Info */}
        <Card>
          <CardHeader>
            <CardTitle>Current Tab</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700">
              Active tab: <span className="font-semibold text-primary">{activeTab}</span>
            </p>
            <p className="text-xs text-gray-500 mt-2">
              The bottom navigation bar is only visible on mobile screens. 
              Resize your browser or use mobile view to see it.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Tab Navigation */}
      <BottomTabBar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        badges={{
          leave: 2,
          approvals: 10,
        }}
        userAvatar="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop"
        userName="Sarah Tan"
      />
    </div>
  );
}
