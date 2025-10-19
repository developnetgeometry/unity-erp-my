import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { InvoiceMatchingData, MatchedLineItem, MatchStatus } from '@/types/invoice-matching';
import { Check, AlertCircle, X, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ThreeWayComparisonTableProps {
  data: InvoiceMatchingData;
}

export function ThreeWayComparisonTable({ data }: ThreeWayComparisonTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [showVarianceAs, setShowVarianceAs] = useState<'percentage' | 'amount' | 'both'>('both');

  const toggleRow = (itemId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedRows(newExpanded);
  };

  const getStatusBadge = (status: MatchStatus) => {
    switch (status) {
      case 'perfect':
        return (
          <Badge variant="secondary" className="gap-1 bg-green-100 text-green-700 border-green-200">
            <Check className="w-3 h-3" />
            Match
          </Badge>
        );
      case 'within-tolerance':
        return (
          <Badge variant="secondary" className="gap-1 bg-amber-100 text-amber-700 border-amber-200">
            <AlertCircle className="w-3 h-3" />
            Variance
          </Badge>
        );
      case 'major-discrepancy':
        return (
          <Badge variant="destructive" className="gap-1">
            <X className="w-3 h-3" />
            Discrepancy
          </Badge>
        );
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-MY', {
      style: 'currency',
      currency: 'MYR',
    }).format(amount);
  };

  const formatVariance = (variance: { value: number; percentage: number }) => {
    if (showVarianceAs === 'percentage') {
      return `${variance.percentage >= 0 ? '+' : ''}${variance.percentage.toFixed(1)}%`;
    }
    if (showVarianceAs === 'amount') {
      return `${variance.value >= 0 ? '+' : ''}${formatCurrency(variance.value)}`;
    }
    return `${variance.value >= 0 ? '+' : ''}${formatCurrency(variance.value)} (${variance.percentage >= 0 ? '+' : ''}${variance.percentage.toFixed(1)}%)`;
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            variant={showVarianceAs === 'percentage' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowVarianceAs('percentage')}
          >
            % Only
          </Button>
          <Button
            variant={showVarianceAs === 'amount' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowVarianceAs('amount')}
          >
            RM Only
          </Button>
          <Button
            variant={showVarianceAs === 'both' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowVarianceAs('both')}
          >
            Both
          </Button>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Tolerance:</span>
          <Badge variant="secondary">
            {data.toleranceConfig.tiers[0].percentageTolerance}% / {formatCurrency(data.toleranceConfig.tiers[0].absoluteTolerance)}
          </Badge>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-[200px] sticky left-0 bg-muted/50 z-10">Description</TableHead>
                <TableHead className="text-center" colSpan={2}>
                  PO ({data.po.id})
                </TableHead>
                <TableHead className="text-center" colSpan={2}>
                  Receipt ({data.receipt.id})
                </TableHead>
                <TableHead className="text-center" colSpan={2}>
                  Invoice ({data.invoice.invoiceNumber})
                </TableHead>
                <TableHead className="text-center w-[120px]">Variance</TableHead>
                <TableHead className="text-center w-[100px]">Status</TableHead>
              </TableRow>
              <TableRow className="bg-muted/30">
                <TableHead className="sticky left-0 bg-muted/30 z-10"></TableHead>
                <TableHead className="text-center text-xs">Qty</TableHead>
                <TableHead className="text-center text-xs">Total</TableHead>
                <TableHead className="text-center text-xs">Qty</TableHead>
                <TableHead className="text-center text-xs">Total</TableHead>
                <TableHead className="text-center text-xs">Qty</TableHead>
                <TableHead className="text-center text-xs">Total</TableHead>
                <TableHead></TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.matchedItems.map((item) => (
                <TooltipProvider key={item.id}>
                  <TableRow
                    className={cn(
                      'cursor-pointer hover:bg-muted/50',
                      item.overallStatus === 'major-discrepancy' && 'bg-red-50'
                    )}
                    onClick={() => toggleRow(item.id)}
                  >
                    <TableCell className="sticky left-0 bg-background z-10 font-medium">
                      <div className="flex items-center gap-2">
                        {expandedRows.has(item.id) ? (
                          <ChevronUp className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        )}
                        <span className="truncate max-w-[150px]">{item.description}</span>
                      </div>
                    </TableCell>

                    {/* PO */}
                    <TableCell className="text-center">{item.po.quantity}</TableCell>
                    <TableCell className="text-center">{formatCurrency(item.po.total)}</TableCell>

                    {/* Receipt */}
                    <TableCell
                      className={cn(
                        'text-center',
                        item.quantityVariance.status === 'major-discrepancy' && 'text-destructive font-semibold'
                      )}
                    >
                      {item.receipt.quantity}
                    </TableCell>
                    <TableCell className="text-center">{formatCurrency(item.receipt.total)}</TableCell>

                    {/* Invoice */}
                    <TableCell
                      className={cn(
                        'text-center',
                        item.quantityVariance.status === 'major-discrepancy' && 'text-destructive font-semibold'
                      )}
                    >
                      {item.invoice.quantity}
                    </TableCell>
                    <TableCell
                      className={cn(
                        'text-center',
                        item.priceVariance.status === 'major-discrepancy' && 'text-destructive font-semibold'
                      )}
                    >
                      {formatCurrency(item.invoice.total)}
                    </TableCell>

                    {/* Variance */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <TableCell
                          className={cn(
                            'text-center font-medium',
                            item.totalVariance.value === 0 && 'text-green-600',
                            item.totalVariance.status === 'within-tolerance' && 'text-amber-600',
                            item.totalVariance.status === 'major-discrepancy' && 'text-destructive'
                          )}
                        >
                          {formatVariance(item.totalVariance)}
                        </TableCell>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="space-y-1 text-xs">
                          <p>
                            <strong>Qty:</strong> {item.po.quantity} → {item.receipt.quantity} → {item.invoice.quantity}
                          </p>
                          <p>
                            <strong>Price:</strong> {formatCurrency(item.po.unitPrice)} → {formatCurrency(item.invoice.unitPrice)}
                          </p>
                          <p className="font-semibold pt-1 border-t">
                            Total: {formatVariance(item.totalVariance)}
                          </p>
                        </div>
                      </TooltipContent>
                    </Tooltip>

                    {/* Status */}
                    <TableCell className="text-center">
                      {getStatusBadge(item.overallStatus)}
                    </TableCell>
                  </TableRow>

                  {/* Expanded Details */}
                  {expandedRows.has(item.id) && (
                    <TableRow className="bg-muted/30">
                      <TableCell colSpan={9} className="p-4">
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="font-semibold mb-2">Quantity Variance</p>
                            <p className="text-muted-foreground">
                              Ordered: {item.po.quantity}, Received: {item.receipt.quantity}, Invoiced: {item.invoice.quantity}
                            </p>
                            <p className={cn(
                              'font-medium mt-1',
                              item.quantityVariance.status === 'perfect' && 'text-green-600',
                              item.quantityVariance.status === 'within-tolerance' && 'text-amber-600',
                              item.quantityVariance.status === 'major-discrepancy' && 'text-destructive'
                            )}>
                              {formatVariance(item.quantityVariance)}
                            </p>
                          </div>

                          <div>
                            <p className="font-semibold mb-2">Price Variance</p>
                            <p className="text-muted-foreground">
                              PO: {formatCurrency(item.po.unitPrice)}, Invoice: {formatCurrency(item.invoice.unitPrice)}
                            </p>
                            <p className={cn(
                              'font-medium mt-1',
                              item.priceVariance.status === 'perfect' && 'text-green-600',
                              item.priceVariance.status === 'within-tolerance' && 'text-amber-600',
                              item.priceVariance.status === 'major-discrepancy' && 'text-destructive'
                            )}>
                              {formatVariance(item.priceVariance)}
                            </p>
                          </div>

                          <div>
                            <p className="font-semibold mb-2">Total Variance</p>
                            <p className="text-muted-foreground">
                              PO Total: {formatCurrency(item.po.total)}, Invoice: {formatCurrency(item.invoice.total)}
                            </p>
                            <p className={cn(
                              'font-medium mt-1',
                              item.totalVariance.status === 'perfect' && 'text-green-600',
                              item.totalVariance.status === 'within-tolerance' && 'text-amber-600',
                              item.totalVariance.status === 'major-discrepancy' && 'text-destructive'
                            )}>
                              {formatVariance(item.totalVariance)}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TooltipProvider>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Summary Footer */}
      <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Total Variance</p>
          <p className={cn(
            'text-2xl font-bold',
            data.totalVariance.status === 'perfect' && 'text-green-600',
            data.totalVariance.status === 'within-tolerance' && 'text-amber-600',
            data.totalVariance.status === 'major-discrepancy' && 'text-destructive'
          )}>
            {formatVariance(data.totalVariance)}
          </p>
        </div>

        <div className="text-right">
          <p className="text-sm text-muted-foreground">
            Invoice: {formatCurrency(data.invoice.total)} vs PO: {formatCurrency(data.po.total)}
          </p>
          <div className="mt-2">
            {data.withinTolerance ? (
              <Badge variant="secondary" className="gap-1 bg-green-100 text-green-700 border-green-200">
                <Check className="w-4 h-4" />
                Within Tolerance
              </Badge>
            ) : (
              <Badge variant="destructive" className="gap-1">
                <X className="w-4 h-4" />
                Exceeds Tolerance
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
