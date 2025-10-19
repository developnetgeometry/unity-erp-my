import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InvoiceMatchingData } from '@/types/invoice-matching';
import { Check, AlertCircle, X, FileText, Receipt, FileCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileInvoiceReviewProps {
  data: InvoiceMatchingData;
  onApprove: () => void;
  onReject: () => void;
  onHold: () => void;
}

export function MobileInvoiceReview({
  data,
  onApprove,
  onReject,
  onHold,
}: MobileInvoiceReviewProps) {
  const [activeTab, setActiveTab] = useState('po');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-MY', {
      style: 'currency',
      currency: 'MYR',
    }).format(amount);
  };

  const formatVariance = (variance: { value: number; percentage: number }) => {
    return `${variance.value >= 0 ? '+' : ''}${formatCurrency(variance.value)} (${variance.percentage >= 0 ? '+' : ''}${variance.percentage.toFixed(1)}%)`;
  };

  const hasComplexItems = data.matchedItems.length > 5;

  return (
    <div className="space-y-4 pb-20">
      {/* Variance Summary - Sticky at Top */}
      <Card className="sticky top-0 z-10 border-2">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Variance</p>
              <p className={cn(
                'text-xl font-bold',
                data.totalVariance.status === 'perfect' && 'text-green-600',
                data.totalVariance.status === 'within-tolerance' && 'text-amber-600',
                data.totalVariance.status === 'major-discrepancy' && 'text-destructive'
              )}>
                {formatVariance(data.totalVariance)}
              </p>
            </div>
            {data.withinTolerance ? (
              <Badge variant="secondary" className="gap-1 bg-green-100 text-green-700 border-green-200 text-sm py-1.5 px-3">
                <Check className="w-4 h-4" />
                Within limit
              </Badge>
            ) : (
              <Badge variant="destructive" className="gap-1 text-sm py-1.5 px-3">
                <X className="w-4 h-4" />
                Exceeds limit
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Complex Invoice Warning */}
      {hasComplexItems && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            This invoice has {data.matchedItems.length} line items. <strong>Review on desktop recommended</strong> for detailed comparison.
          </AlertDescription>
        </Alert>
      )}

      {/* Swipeable Document Tabs */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Document Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="po" className="gap-1">
                <FileText className="w-4 h-4" />
                <span className="hidden sm:inline">PO</span>
              </TabsTrigger>
              <TabsTrigger value="receipt" className="gap-1">
                <Receipt className="w-4 h-4" />
                <span className="hidden sm:inline">Receipt</span>
              </TabsTrigger>
              <TabsTrigger value="invoice" className="gap-1">
                <FileCheck className="w-4 h-4" />
                <span className="hidden sm:inline">Invoice</span>
              </TabsTrigger>
            </TabsList>

            {/* Purchase Order */}
            <TabsContent value="po" className="space-y-3 mt-0">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold">{data.po.id}</p>
                  <p className="text-sm text-muted-foreground">{data.po.supplier}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium">
                    {data.po.date.toLocaleDateString('en-MY', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t">
                {data.po.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm p-2 rounded bg-muted">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.description}</p>
                      <p className="text-muted-foreground">
                        {item.quantity} × {formatCurrency(item.unitPrice)}
                      </p>
                    </div>
                    <p className="font-semibold">{formatCurrency(item.total)}</p>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{formatCurrency(data.po.total)}</span>
                </div>
              </div>
            </TabsContent>

            {/* Goods Receipt */}
            <TabsContent value="receipt" className="space-y-3 mt-0">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold">{data.receipt.id}</p>
                  <p className="text-sm text-muted-foreground">Linked to {data.receipt.poId}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Received</p>
                  <p className="font-medium">
                    {data.receipt.date.toLocaleDateString('en-MY', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t">
                {data.receipt.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm p-2 rounded bg-muted">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.description}</p>
                      <p className="text-muted-foreground">Received: {item.quantity} units</p>
                    </div>
                    <p className="font-semibold">{formatCurrency(item.total)}</p>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{formatCurrency(data.receipt.total)}</span>
                </div>
              </div>
            </TabsContent>

            {/* Invoice */}
            <TabsContent value="invoice" className="space-y-3 mt-0">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold">{data.invoice.invoiceNumber}</p>
                  <p className="text-sm text-muted-foreground">{data.invoice.supplier}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Due Date</p>
                  <p className="font-medium">
                    {data.invoice.dueDate.toLocaleDateString('en-MY', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t">
                {data.invoice.items.map((item) => {
                  const matchedItem = data.matchedItems.find(m => m.description === item.description);
                  const hasDiscrepancy = matchedItem?.overallStatus === 'major-discrepancy';

                  return (
                    <div key={item.id} className={cn(
                      "flex justify-between text-sm p-2 rounded",
                      hasDiscrepancy ? 'bg-red-50 border border-red-200' : 'bg-muted'
                    )}>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{item.description}</p>
                        <p className="text-muted-foreground">
                          {item.quantity} × {formatCurrency(item.unitPrice)}
                        </p>
                        {hasDiscrepancy && matchedItem && (
                          <p className="text-xs text-destructive font-medium mt-1">
                            ⚠️ {formatVariance(matchedItem.totalVariance)}
                          </p>
                        )}
                      </div>
                      <p className={cn(
                        'font-semibold',
                        hasDiscrepancy && 'text-destructive'
                      )}>
                        {formatCurrency(item.total)}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-2 pt-3 border-t">
                {data.invoice.gst && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">GST (6%)</span>
                    <span className="font-medium">{formatCurrency(data.invoice.gst)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{formatCurrency(data.invoice.total)}</span>
                </div>
              </div>

              {data.invoice.pdfUrl && (
                <Button variant="outline" className="w-full mt-4" onClick={() => window.open(data.invoice.pdfUrl, '_blank')}>
                  <FileText className="w-4 h-4 mr-2" />
                  View Full Invoice PDF
                </Button>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Matching Status */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Matching Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between items-center p-3 rounded bg-muted">
            <span className="text-sm">Perfect matches</span>
            <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
              {data.matchedItems.filter(i => i.overallStatus === 'perfect').length} items
            </Badge>
          </div>
          <div className="flex justify-between items-center p-3 rounded bg-muted">
            <span className="text-sm">Within tolerance</span>
            <Badge variant="secondary" className="bg-amber-100 text-amber-700 border-amber-200">
              {data.matchedItems.filter(i => i.overallStatus === 'within-tolerance').length} items
            </Badge>
          </div>
          <div className="flex justify-between items-center p-3 rounded bg-muted">
            <span className="text-sm">Major discrepancies</span>
            <Badge variant="destructive">
              {data.matchedItems.filter(i => i.overallStatus === 'major-discrepancy').length} items
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons - Fixed at Bottom */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t space-y-2">
        <Button
          onClick={onApprove}
          disabled={!data.withinTolerance}
          className="w-full h-12 text-base"
        >
          <Check className="w-5 h-5 mr-2" />
          Approve Payment
        </Button>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={onHold}
            className="flex-1"
          >
            Hold for Review
          </Button>
          <Button
            variant="destructive"
            onClick={onReject}
            className="flex-1"
          >
            <X className="w-4 h-4 mr-2" />
            Reject
          </Button>
        </div>
      </div>
    </div>
  );
}
