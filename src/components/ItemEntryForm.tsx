import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2 } from "lucide-react";

export interface InvoiceItem {
  id: string;
  item_id?: string;
  item_name: string;
  quantity: number;
  rate: number;
  discount_percent: number;
  tax_rate: number;
  amount: number;
}

interface ItemEntryFormProps {
  items: any[];
  invoiceItems: InvoiceItem[];
  onItemsChange: (items: InvoiceItem[]) => void;
}

export const ItemEntryForm = ({ items, invoiceItems, onItemsChange }: ItemEntryFormProps) => {
  const [currentItem, setCurrentItem] = useState({
    item_id: '',
    item_name: '',
    quantity: 1,
    rate: 0,
    discount_percent: 0,
    tax_rate: 0,
  });

  const calculateAmount = (qty: number, rate: number, discount: number, tax: number) => {
    const subtotal = qty * rate;
    const afterDiscount = subtotal - (subtotal * discount / 100);
    const total = afterDiscount + (afterDiscount * tax / 100);
    return parseFloat(total.toFixed(2));
  };

  const handleItemSelect = (itemId: string) => {
    const selectedItem = items.find(i => i.id === itemId);
    if (selectedItem) {
      setCurrentItem({
        item_id: selectedItem.id,
        item_name: selectedItem.name,
        quantity: 1,
        rate: parseFloat(selectedItem.rate),
        discount_percent: 0,
        tax_rate: parseFloat(selectedItem.tax_rate || 0),
      });
    }
  };

  const handleAddItem = () => {
    if (!currentItem.item_name || currentItem.quantity <= 0 || currentItem.rate <= 0) {
      return;
    }

    const amount = calculateAmount(
      currentItem.quantity,
      currentItem.rate,
      currentItem.discount_percent,
      currentItem.tax_rate
    );

    const newItem: InvoiceItem = {
      id: Math.random().toString(),
      ...currentItem,
      amount,
    };

    onItemsChange([...invoiceItems, newItem]);
    
    // Reset form
    setCurrentItem({
      item_id: '',
      item_name: '',
      quantity: 1,
      rate: 0,
      discount_percent: 0,
      tax_rate: 0,
    });
  };

  const handleRemoveItem = (id: string) => {
    onItemsChange(invoiceItems.filter(item => item.id !== id));
  };

  const totals = invoiceItems.reduce((acc, item) => {
    const subtotal = item.quantity * item.rate;
    const discount = subtotal * item.discount_percent / 100;
    const taxable = subtotal - discount;
    const tax = taxable * item.tax_rate / 100;
    
    return {
      subtotal: acc.subtotal + subtotal,
      discount: acc.discount + discount,
      taxable: acc.taxable + taxable,
      tax: acc.tax + tax,
      total: acc.total + item.amount,
    };
  }, { subtotal: 0, discount: 0, taxable: 0, tax: 0, total: 0 });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-6 gap-3 p-4 border rounded-lg bg-muted/50">
        <div className="space-y-2">
          <Label className="text-xs">Select Item</Label>
          <Select value={currentItem.item_id} onValueChange={handleItemSelect}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Choose..." />
            </SelectTrigger>
            <SelectContent>
              {items.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-xs">Item Name</Label>
          <Input
            placeholder="Item name"
            value={currentItem.item_name}
            onChange={(e) => setCurrentItem({ ...currentItem, item_name: e.target.value })}
            className="h-9"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs">Qty</Label>
          <Input
            type="number"
            step="0.001"
            placeholder="0"
            value={currentItem.quantity || ''}
            onChange={(e) => setCurrentItem({ ...currentItem, quantity: parseFloat(e.target.value) || 0 })}
            className="h-9 text-right"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs">Rate</Label>
          <Input
            type="number"
            step="0.01"
            placeholder="0.00"
            value={currentItem.rate || ''}
            onChange={(e) => setCurrentItem({ ...currentItem, rate: parseFloat(e.target.value) || 0 })}
            className="h-9 text-right font-mono"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs">Disc %</Label>
          <Input
            type="number"
            step="0.01"
            placeholder="0"
            value={currentItem.discount_percent || ''}
            onChange={(e) => setCurrentItem({ ...currentItem, discount_percent: parseFloat(e.target.value) || 0 })}
            className="h-9 text-right"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs">Tax %</Label>
          <Input
            type="number"
            step="0.01"
            placeholder="0"
            value={currentItem.tax_rate || ''}
            onChange={(e) => setCurrentItem({ ...currentItem, tax_rate: parseFloat(e.target.value) || 0 })}
            className="h-9 text-right"
          />
        </div>

        <div className="md:col-span-6 flex gap-2">
          <Button onClick={handleAddItem} size="sm" className="w-full">
            <Plus className="w-4 h-4 mr-1" />
            Add Item
          </Button>
        </div>
      </div>

      {invoiceItems.length > 0 && (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40%]">Item</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Rate</TableHead>
                <TableHead className="text-right">Disc%</TableHead>
                <TableHead className="text-right">Tax%</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoiceItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.item_name}</TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell className="text-right font-mono">₹{item.rate.toFixed(2)}</TableCell>
                  <TableCell className="text-right">{item.discount_percent}%</TableCell>
                  <TableCell className="text-right">{item.tax_rate}%</TableCell>
                  <TableCell className="text-right font-mono font-semibold">₹{item.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveItem(item.id)}
                      className="h-8 w-8 p-0"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="bg-muted/50 font-semibold">
                <TableCell colSpan={5} className="text-right">Subtotal:</TableCell>
                <TableCell className="text-right font-mono">₹{totals.subtotal.toFixed(2)}</TableCell>
                <TableCell></TableCell>
              </TableRow>
              {totals.discount > 0 && (
                <TableRow className="bg-muted/50 font-semibold">
                  <TableCell colSpan={5} className="text-right">Discount:</TableCell>
                  <TableCell className="text-right font-mono text-destructive">-₹{totals.discount.toFixed(2)}</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              )}
              <TableRow className="bg-muted/50 font-semibold">
                <TableCell colSpan={5} className="text-right">Tax:</TableCell>
                <TableCell className="text-right font-mono">₹{totals.tax.toFixed(2)}</TableCell>
                <TableCell></TableCell>
              </TableRow>
              <TableRow className="bg-primary/10 font-bold text-lg">
                <TableCell colSpan={5} className="text-right">Grand Total:</TableCell>
                <TableCell className="text-right font-mono">₹{totals.total.toFixed(2)}</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};
