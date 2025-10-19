import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CurrencyInput } from '@/components/erp/currency-input';
import { DatePicker } from '@/components/erp/date-picker';
import { OCRResult, ExpenseCategory, ExpenseItem } from '@/types/expense-submission';
import { Check, AlertCircle, RotateCcw, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OCRReviewProps {
  image: string;
  onConfirm: (item: Omit<ExpenseItem, 'id' | 'receipt'>) => void;
  onRetake: () => void;
  categories: ExpenseCategory[];
}

export function OCRReview({ image, onConfirm, onRetake, categories }: OCRReviewProps) {
  const [isProcessing, setIsProcessing] = useState(true);
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null);
  
  const [merchant, setMerchant] = useState('');
  const [amount, setAmount] = useState(0);
  const [date, setDate] = useState<Date>(new Date());
  const [category, setCategory] = useState('');
  const [gst, setGst] = useState<number | undefined>();
  const [notes, setNotes] = useState('');

  const [merchantConfidence, setMerchantConfidence] = useState(0);
  const [amountConfidence, setAmountConfidence] = useState(0);
  const [dateConfidence, setDateConfidence] = useState(0);

  useEffect(() => {
    // Simulate OCR processing
    simulateOCR();
  }, []);

  const simulateOCR = async () => {
    setIsProcessing(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock OCR result
    const mockResult: OCRResult = {
      merchant: { value: 'ABC Restaurant Sdn Bhd', confidence: 0.92 },
      amount: { value: 45.50, confidence: 0.88 },
      date: { value: new Date(), confidence: 0.95 },
      gst: { value: 2.73, confidence: 0.85 },
    };

    setOcrResult(mockResult);
    setMerchant(mockResult.merchant.value);
    setAmount(mockResult.amount.value);
    setDate(mockResult.date.value);
    setGst(mockResult.gst?.value);
    setMerchantConfidence(mockResult.merchant.confidence);
    setAmountConfidence(mockResult.amount.confidence);
    setDateConfidence(mockResult.date.confidence);
    setIsProcessing(false);

    // Auto-suggest category
    if (mockResult.merchant.value.toLowerCase().includes('restaurant')) {
      setCategory('meals');
    }
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.8) {
      return (
        <Badge variant="secondary" className="gap-1 bg-green-100 text-green-700 border-green-200">
          <Check className="w-3 h-3" />
          Looks good
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="gap-1 bg-amber-100 text-amber-700 border-amber-200">
        <AlertCircle className="w-3 h-3" />
        Tap to verify
      </Badge>
    );
  };

  const selectedCategory = categories.find(cat => cat.id === category);
  const policyCompliant = selectedCategory 
    ? !selectedCategory.limit || amount <= selectedCategory.limit
    : true;
  
  const policyWarning = selectedCategory?.limit && amount > selectedCategory.limit
    ? `Exceeds RM${selectedCategory.limit} ${selectedCategory.name} limit - Justification required`
    : selectedCategory?.policyNote;

  const handleConfirm = () => {
    if (!category || amount <= 0) return;

    onConfirm({
      merchant,
      amount,
      date,
      category,
      gst,
      notes,
      policyCompliant,
      policyWarning,
    });
  };

  if (isProcessing) {
    return (
      <Card className="w-full">
        <CardContent className="flex flex-col items-center justify-center py-16 space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
          <div className="text-center">
            <h3 className="font-semibold text-lg">Processing Receipt</h3>
            <p className="text-sm text-muted-foreground">Extracting information...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Receipt Image Thumbnail */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <img
              src={image}
              alt="Receipt"
              className="w-20 h-20 object-cover rounded border cursor-pointer hover:opacity-80"
              onClick={() => window.open(image, '_blank')}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">Receipt captured</p>
              <p className="text-xs text-muted-foreground">Tap to view full size</p>
            </div>
            <Button variant="ghost" size="icon" onClick={onRetake}>
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* OCR Review Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Review Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Merchant */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="merchant">Merchant</Label>
              {getConfidenceBadge(merchantConfidence)}
            </div>
            <Input
              id="merchant"
              value={merchant}
              onChange={(e) => setMerchant(e.target.value)}
              placeholder="e.g., ABC Restaurant Sdn Bhd"
              className={cn(merchantConfidence < 0.8 && 'border-amber-300')}
            />
          </div>

          {/* Amount & GST */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="amount">Amount</Label>
                {getConfidenceBadge(amountConfidence)}
              </div>
              <CurrencyInput
                id="amount"
                value={amount}
                onChange={setAmount}
                className={cn(amountConfidence < 0.8 && 'border-amber-300')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gst">GST (6%)</Label>
              <CurrencyInput
                id="gst"
                value={gst || 0}
                onChange={setGst}
              />
            </div>
          </div>

          {/* Date */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="date">Date</Label>
              {getConfidenceBadge(dateConfidence)}
            </div>
            <DatePicker
              id="date"
              label="Receipt Date"
              value={date}
              onChange={(d) => d && setDate(d)}
              maxDate={new Date()}
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>Category</Label>
            <div className="space-y-2">
              {/* Pinned categories (most used) */}
              <div>
                <p className="text-xs text-muted-foreground mb-2">Quick select:</p>
                <div className="flex flex-wrap gap-2">
                  {categories.slice(0, 3).map((cat) => (
                    <Badge
                      key={cat.id}
                      variant={category === cat.id ? 'default' : 'outline'}
                      className="cursor-pointer text-sm py-1.5 px-3"
                      onClick={() => setCategory(cat.id)}
                    >
                      <span className="mr-1">{cat.icon}</span>
                      {cat.name}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* All categories */}
              <div>
                <p className="text-xs text-muted-foreground mb-2">Other categories:</p>
                <div className="flex flex-wrap gap-2">
                  {categories.slice(3).map((cat) => (
                    <Badge
                      key={cat.id}
                      variant={category === cat.id ? 'default' : 'outline'}
                      className="cursor-pointer text-sm py-1.5 px-3"
                      onClick={() => setCategory(cat.id)}
                    >
                      <span className="mr-1">{cat.icon}</span>
                      {cat.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Policy Compliance Alert */}
          {policyWarning && (
            <Alert variant={policyCompliant ? 'default' : 'destructive'}>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{policyWarning}</AlertDescription>
            </Alert>
          )}

          {!policyCompliant && (
            <div className="space-y-2">
              <Label htmlFor="notes">Justification (Required)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Explain why this expense exceeds policy limits..."
                rows={3}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-2 sticky bottom-0 bg-background pt-2 pb-4">
        <Button variant="outline" onClick={onRetake} className="flex-1">
          <X className="w-4 h-4 mr-2" />
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={!category || amount <= 0 || (!policyCompliant && !notes.trim())}
          className="flex-1"
        >
          <Check className="w-4 h-4 mr-2" />
          Confirm
        </Button>
      </div>
    </div>
  );
}
