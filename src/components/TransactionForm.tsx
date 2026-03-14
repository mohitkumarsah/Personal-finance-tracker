import { useState } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { TransactionType, DEFAULT_CATEGORIES } from '@/types/finance';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';

interface Props {
  editTransaction?: { id: string; amount: number; type: TransactionType; category: string; description: string; date: string } | null;
  onClose?: () => void;
  open?: boolean;
}

export function TransactionForm({ editTransaction, onClose, open: controlledOpen }: Props) {
  const { addTransaction, updateTransaction } = useFinance();
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;

  const [type, setType] = useState<TransactionType>(editTransaction?.type || 'expense');
  const [amount, setAmount] = useState(editTransaction?.amount?.toString() || '');
  const [category, setCategory] = useState(editTransaction?.category || '');
  const [description, setDescription] = useState(editTransaction?.description || '');
  const [date, setDate] = useState(editTransaction?.date || new Date().toISOString().split('T')[0]);

  const filteredCategories = DEFAULT_CATEGORIES.filter(c => c.type === type || c.type === 'both');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = { amount: parseFloat(amount), type, category, description, date };

    if (editTransaction) {
      updateTransaction(editTransaction.id, data);
    } else {
      addTransaction(data);
    }

    resetForm();
    if (isControlled) onClose?.();
    else setInternalOpen(false);
  };

  const resetForm = () => {
    setType('expense');
    setAmount('');
    setCategory('');
    setDescription('');
    setDate(new Date().toISOString().split('T')[0]);
  };

  const handleOpenChange = (v: boolean) => {
    if (isControlled) { if (!v) onClose?.(); }
    else setInternalOpen(v);
    if (!v) resetForm();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      {!isControlled && (
        <DialogTrigger asChild>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Add Transaction
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading">{editTransaction ? 'Edit' : 'Add'} Transaction</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2">
            <Button type="button" variant={type === 'income' ? 'default' : 'outline'} className="flex-1" onClick={() => setType('income')}>Income</Button>
            <Button type="button" variant={type === 'expense' ? 'destructive' : 'outline'} className="flex-1" onClick={() => setType('expense')}>Expense</Button>
          </div>
          <div>
            <Label>Amount</Label>
            <Input type="number" step="0.01" min="0.01" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} required />
          </div>
          <div>
            <Label>Category</Label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
              <SelectContent>
                {filteredCategories.map(c => (
                  <SelectItem key={c.id} value={c.name}>{c.icon} {c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Description</Label>
            <Input placeholder="What's this for?" value={description} onChange={e => setDescription(e.target.value)} required maxLength={200} />
          </div>
          <div>
            <Label>Date</Label>
            <Input type="date" value={date} onChange={e => setDate(e.target.value)} required />
          </div>
          <Button type="submit" className="w-full">{editTransaction ? 'Update' : 'Add'} Transaction</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
