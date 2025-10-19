import * as React from "react";
import { CEOSummaryWidget } from "@/components/dashboard/ceo-summary-widget";
import { BottomTabBar } from "@/components/mobile/bottom-tab-bar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast as newToast } from "@/lib/toast-api";
import { modal } from "@/lib/modal-api";
import { Modal } from "@/components/overlay/modal";
import { useToast } from "@/hooks/use-toast";

type TabValue = 'dashboard' | 'leave' | 'approvals' | 'more' | 'profile';

export default function MobileDashboard() {
  const [activeTab, setActiveTab] = React.useState<TabValue>('dashboard');
  const [showCustomModal, setShowCustomModal] = React.useState(false);
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
            <CardTitle>Toast Notifications Demo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => newToast.success('Leave Approved!', { description: 'Sarah has been notified via email' })}
                className="bg-green-600 hover:bg-green-700"
              >
                Success
              </Button>
              <Button
                onClick={() => newToast.error('Submission Failed', {
                  description: 'Please check your connection',
                  action: { label: 'Retry', onClick: () => console.log('Retry clicked') }
                })}
                className="bg-red-600 hover:bg-red-700"
              >
                Error
              </Button>
              <Button
                onClick={() => newToast.warning('Low Balance', { description: 'Only 2 leave days remaining' })}
                className="bg-amber-600 hover:bg-amber-700"
              >
                Warning
              </Button>
              <Button
                onClick={() => newToast.info('System Update', { description: 'Scheduled maintenance tonight at 10 PM' })}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Info
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Modal Demo Section */}
        <Card>
          <CardHeader>
            <CardTitle>Modal System Demo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={async () => {
                  const confirmed = await modal.confirm({
                    title: 'Delete Employee',
                    message: 'This action cannot be undone. Are you sure you want to delete this employee?',
                    confirmLabel: 'Delete',
                    cancelLabel: 'Cancel',
                    variant: 'danger',
                  });
                  if (confirmed) {
                    newToast.success('Employee deleted successfully');
                  }
                }}
                variant="destructive"
              >
                Danger
              </Button>

              <Button
                onClick={async () => {
                  const confirmed = await modal.confirm({
                    title: 'Submit Leave Request',
                    message: 'Your leave request will be sent to your manager for approval.',
                    confirmLabel: 'Submit',
                    cancelLabel: 'Cancel',
                    variant: 'default',
                  });
                  if (confirmed) {
                    newToast.success('Leave request submitted');
                  }
                }}
              >
                Default
              </Button>

              <Button
                onClick={async () => {
                  const confirmed = await modal.confirm({
                    title: 'Approve Expense',
                    message: 'This expense is RM500 over budget. Do you still want to approve?',
                    confirmLabel: 'Approve Anyway',
                    cancelLabel: 'Cancel',
                    variant: 'warning',
                  });
                  if (confirmed) {
                    newToast.success('Expense approved');
                  }
                }}
                variant="outline"
              >
                Warning
              </Button>

              <Button
                onClick={() => setShowCustomModal(true)}
                variant="outline"
              >
                Custom
              </Button>
            </div>
          </CardContent>
        </Card>

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

      {/* Custom Modal Example */}
      <Modal
        isOpen={showCustomModal}
        onClose={() => setShowCustomModal(false)}
        title="Employee Details"
        description="Review employee information"
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowCustomModal(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              newToast.success('Changes saved');
              setShowCustomModal(false);
            }}>
              Save Changes
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              defaultValue="Sarah Tan"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              defaultValue="Finance"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              defaultValue="Senior Accountant"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
