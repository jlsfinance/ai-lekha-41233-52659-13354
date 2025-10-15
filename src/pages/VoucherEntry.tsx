import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, CalendarIcon, Save } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { db } from "@/utils/supabaseHelper";
import { useToast } from "@/hooks/use-toast";
import { ItemEntryForm, InvoiceItem } from "@/components/ItemEntryForm";

const VoucherEntry = () => {
  const { type } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [date, setDate] = useState<Date>(new Date());
  const [accounts, setAccounts] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);
  
  const [formData, setFormData] = useState({
    referenceNumber: '',
    debitAccount: '',
    creditAccount: '',
    party: '',
    amount: '',
    description: '',
  });

  useEffect(() => {
    fetchData();
    
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.altKey && e.key === 'g') {
        e.preventDefault();
        navigate('/gateway');
      } else if (e.key === 'Escape') {
        navigate('/vouchers');
      } else if (e.ctrlKey && e.key === 'a') {
        e.preventDefault();
        handleSave();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [navigate]);

  const fetchData = async () => {
    const { data: accountsData } = await db.from('accounts').select('*');
    const { data: clientsData } = await db.from('clients').select('*');
    const { data: vendorsData } = await db.from('vendors').select('*');
    const { data: itemsData } = await db.from('items').select('*');
    
    setAccounts(accountsData || []);
    setClients(clientsData || []);
    setVendors(vendorsData || []);
    setItems(itemsData || []);
  };

  const handleSave = async () => {
    const totalAmount = invoiceItems.reduce((sum, item) => sum + item.amount, 0);
    
    if (invoiceItems.length === 0 && !formData.amount) {
      toast({
        title: "Missing Information",
        description: "Please add items or enter an amount",
        variant: "destructive",
      });
      return;
    }

    if (!formData.debitAccount || !formData.creditAccount) {
      toast({
        title: "Missing Information",
        description: "Please select debit and credit accounts",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const finalAmount = invoiceItems.length > 0 ? totalAmount : parseFloat(formData.amount);
      
      const { data: transaction, error: txError } = await db
        .from('transactions')
        .insert({
          user_id: user?.id,
          type: type as any,
          reference_number: formData.referenceNumber,
          date: format(date, 'yyyy-MM-dd'),
          debit_account_id: formData.debitAccount,
          credit_account_id: formData.creditAccount,
          client_id: type === 'sales' ? formData.party : null,
          vendor_id: type === 'purchase' ? formData.party : null,
          amount: finalAmount,
          description: formData.description,
        })
        .select()
        .single();

      if (txError) throw txError;

      // Save invoice items if any
      if (invoiceItems.length > 0 && transaction) {
        const itemsToInsert = invoiceItems.map(item => ({
          transaction_id: transaction.id,
          item_id: item.item_id,
          item_name: item.item_name,
          quantity: item.quantity,
          rate: item.rate,
          discount_percent: item.discount_percent,
          tax_rate: item.tax_rate,
          amount: item.amount,
        }));

        const { error: itemsError } = await db
          .from('invoice_items')
          .insert(itemsToInsert);

        if (itemsError) throw itemsError;
      }

      toast({
        title: "Success!",
        description: "Transaction saved successfully",
      });
      
      // Reset form
      setFormData({
        referenceNumber: '',
        debitAccount: '',
        creditAccount: '',
        party: '',
        amount: '',
        description: '',
      });
      setInvoiceItems([]);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const voucherTitles: any = {
    payment: 'Payment Voucher',
    receipt: 'Receipt Voucher',
    journal: 'Journal Voucher',
    sales: 'Sales Voucher',
    purchase: 'Purchase Voucher',
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50 px-4 py-3">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate('/vouchers')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back (Esc)
          </Button>
          <span className="text-sm text-muted-foreground">Press Ctrl+A to Save</span>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{voucherTitles[type || 'journal']}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Voucher No.</Label>
                <Input
                  placeholder="Auto-generated"
                  value={formData.referenceNumber}
                  onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Date (Alt+D)</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={(d) => d && setDate(d)}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Debit Account *</Label>
                <Select value={formData.debitAccount} onValueChange={(v) => setFormData({ ...formData, debitAccount: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((acc) => (
                      <SelectItem key={acc.id} value={acc.id}>
                        {acc.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Credit Account *</Label>
                <Select value={formData.creditAccount} onValueChange={(v) => setFormData({ ...formData, creditAccount: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((acc) => (
                      <SelectItem key={acc.id} value={acc.id}>
                        {acc.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {(type === 'sales' || type === 'purchase') && (
                <div className="space-y-2">
                  <Label>{type === 'sales' ? 'Client' : 'Vendor'}</Label>
                  <Select value={formData.party} onValueChange={(v) => setFormData({ ...formData, party: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder={`Select ${type === 'sales' ? 'client' : 'vendor'}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {(type === 'sales' ? clients : vendors).map((party) => (
                        <SelectItem key={party.id} value={party.id}>
                          {party.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {(type === 'journal' || type === 'payment' || type === 'receipt') && (
                <div className="space-y-2">
                  <Label>Amount</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="text-right font-mono"
                  />
                </div>
              )}
            </div>

            {(type === 'sales' || type === 'purchase') && (
              <div className="space-y-2">
                <Label className="text-lg font-semibold">Invoice Items</Label>
                <ItemEntryForm
                  items={items}
                  invoiceItems={invoiceItems}
                  onItemsChange={setInvoiceItems}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Narration</Label>
              <Textarea
                placeholder="Enter description..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleSave} disabled={loading} className="flex-1">
                <Save className="w-4 h-4 mr-2" />
                Save (Ctrl+A)
              </Button>
              <Button variant="outline" onClick={() => navigate('/vouchers')}>
                Cancel (Esc)
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default VoucherEntry;