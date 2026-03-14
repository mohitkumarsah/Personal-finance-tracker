import { useState } from 'react';
import { motion } from 'framer-motion';
import { useFinance } from '@/context/FinanceContext';
import { formatCurrency, exportToCSV, downloadCSV } from '@/utils/finance';
import { DEFAULT_CATEGORIES } from '@/types/finance';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Download, Search } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function HistoryPage() {
  const { transactions, currency } = useFinance();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const filtered = transactions
    .filter(t => {
      if (search && !t.description.toLowerCase().includes(search.toLowerCase())) return false;
      if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;
      if (dateFrom && t.date < dateFrom) return false;
      if (dateTo && t.date > dateTo) return false;
      return true;
    })
    .sort((a, b) => b.date.localeCompare(a.date));

  const handleExport = () => {
    const csv = exportToCSV(filtered, currency);
    downloadCSV(csv, `transactions-${new Date().toISOString().split('T')[0]}.csv`);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-heading font-bold">Transaction History</h1>
        <Button variant="outline" onClick={handleExport} className="gap-2">
          <Download className="w-4 h-4" />
          Export CSV
        </Button>
      </div>

      <div className="glass-card rounded-xl p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {DEFAULT_CATEGORIES.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Input type="date" placeholder="From" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="w-full sm:w-40" />
        <Input type="date" placeholder="To" value={dateTo} onChange={e => setDateTo(e.target.value)} className="w-full sm:w-40" />
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-10 text-muted-foreground">No transactions found</TableCell></TableRow>
            ) : (
              filtered.map(tx => (
                <TableRow key={tx.id}>
                  <TableCell className="text-sm">{tx.date}</TableCell>
                  <TableCell className="text-sm font-medium">{tx.description}</TableCell>
                  <TableCell className="text-sm">{DEFAULT_CATEGORIES.find(c => c.name === tx.category)?.icon} {tx.category}</TableCell>
                  <TableCell>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${tx.type === 'income' ? 'bg-income/10 text-income' : 'bg-expense/10 text-expense'}`}>
                      {tx.type}
                    </span>
                  </TableCell>
                  <TableCell className={`text-right font-heading font-semibold ${tx.type === 'income' ? 'text-income' : 'text-expense'}`}>
                    {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount, currency)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </motion.div>

      <p className="text-xs text-muted-foreground text-center">{filtered.length} transaction{filtered.length !== 1 ? 's' : ''}</p>
    </div>
  );
}
