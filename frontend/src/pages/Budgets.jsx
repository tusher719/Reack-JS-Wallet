import React, { useState, useEffect } from 'react';
import { Plus, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';
import { budgetAPI } from '../services/api';
import { useApp } from '../contexts/AppContext';
import { formatCurrency } from '../utils/helpers';
import Modal from '../components/common/Modal';
import EmptyState from '../components/common/EmptyState';
import Skeleton from '../components/common/Skeleton';
import toast from 'react-hot-toast';
import { format, addMonths, subMonths } from 'date-fns';

const BudgetItem = ({ budget, onEdit, onDelete }) => {
  const pct = Math.min(budget.percentage || 0, 100);
  const isOver = budget.percentage > 100;
  const isWarning = budget.percentage > budget.alertThreshold;

  return (
    <div className="card p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{budget.category?.icon || '📁'}</span>
          <div>
            <p className="font-semibold text-surface-800 dark:text-surface-200">{budget.category?.name || budget.name}</p>
            <p className="text-xs text-surface-400">{formatCurrency(budget.spent)} of {formatCurrency(budget.amount)}</p>
          </div>
        </div>
        <div className="text-right">
          <p className={`text-sm font-bold ${isOver ? 'text-red-600' : 'text-surface-700 dark:text-surface-300'}`}>{budget.percentage || 0}%</p>
          <p className={`text-xs ${budget.remaining >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {budget.remaining >= 0 ? `৳${budget.remaining?.toFixed(0)} left` : `৳${Math.abs(budget.remaining)?.toFixed(0)} over`}
          </p>
        </div>
      </div>
      <div className="w-full h-2.5 bg-surface-100 dark:bg-surface-700 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${isOver ? 'bg-red-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'}`}
          style={{ width: `${pct}%` }} />
      </div>
      <div className="flex justify-between items-center">
        {isWarning && <span className="flex items-center gap-1 text-xs text-amber-600"><AlertTriangle size={11} /> {isOver ? 'Over budget!' : 'Approaching limit'}</span>}
        <div className="flex gap-2 ml-auto">
          <button onClick={() => onEdit(budget)} className="text-xs text-primary-500 hover:underline">Edit</button>
          <button onClick={() => onDelete(budget)} className="text-xs text-red-400 hover:underline">Delete</button>
        </div>
      </div>
    </div>
  );
};

export default function Budgets() {
  const { categories } = useApp();
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [editBudget, setEditBudget] = useState(null);
  const [form, setForm] = useState({ name: '', category: '', amount: '', alertThreshold: 80 });

  const fetchBudgets = async () => {
    setLoading(true);
    try {
      const res = await budgetAPI.getAll({ month: currentDate.getMonth()+1, year: currentDate.getFullYear() });
      setBudgets(res.data.data);
    } catch (e) {} finally { setLoading(false); }
  };

  useEffect(() => { fetchBudgets(); }, [currentDate]); // eslint-disable-line react-hooks/exhaustive-deps

  const flatCategories = [];
  const flatten = (cats, d=0) => cats.forEach(c => { flatCategories.push({...c,d}); if(c.children) flatten(c.children,d+1); });
  flatten(categories.filter(c => !c.type || c.type === 'expense' || c.type === 'both'));

  const handleSave = async () => {
    if (!form.category || !form.amount) return toast.error('Fill all fields');
    try {
      const payload = { ...form, amount: parseFloat(form.amount), month: currentDate.getMonth()+1, year: currentDate.getFullYear(), period: 'monthly' };
      if (editBudget) { await budgetAPI.update(editBudget._id, payload); toast.success('Budget updated'); }
      else { await budgetAPI.create(payload); toast.success('Budget created'); }
      fetchBudgets(); setShowModal(false); setEditBudget(null);
    } catch (e) { toast.error(e.message || 'Failed'); }
  };

  const handleDelete = async (b) => {
    if (!window.confirm('Delete this budget?')) return;
    await budgetAPI.delete(b._id); toast.success('Deleted'); fetchBudgets();
  };

  const totalBudget = budgets.reduce((s, b) => s + b.amount, 0);
  const totalSpent = budgets.reduce((s, b) => s + (b.spent || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold text-surface-900 dark:text-white">Budgets</h1>
        <button onClick={() => { setEditBudget(null); setForm({ name: '', category: '', amount: '', alertThreshold: 80 }); setShowModal(true); }} className="btn-primary"><Plus size={15} /> Add Budget</button>
      </div>

      {/* Month navigator */}
      <div className="flex items-center justify-center gap-4">
        <button onClick={() => setCurrentDate(d => subMonths(d,1))} className="btn-ghost p-2"><ChevronLeft size={18} /></button>
        <p className="font-display font-semibold text-lg w-36 text-center">{format(currentDate, 'MMMM yyyy')}</p>
        <button onClick={() => setCurrentDate(d => addMonths(d,1))} className="btn-ghost p-2"><ChevronRight size={18} /></button>
      </div>

      {/* Summary */}
      {budgets.length > 0 && (
        <div className="card p-5">
          <div className="flex justify-between mb-3">
            <div><p className="text-xs text-surface-400">Total Budget</p><p className="text-xl font-bold font-mono">{formatCurrency(totalBudget)}</p></div>
            <div className="text-right"><p className="text-xs text-surface-400">Spent</p><p className="text-xl font-bold font-mono text-red-600">{formatCurrency(totalSpent)}</p></div>
          </div>
          <div className="w-full h-3 bg-surface-100 dark:bg-surface-700 rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${totalSpent/totalBudget > 1 ? 'bg-red-500' : totalSpent/totalBudget > 0.8 ? 'bg-amber-500' : 'bg-primary-600'}`}
              style={{ width: `${Math.min((totalSpent/totalBudget)*100,100)}%` }} />
          </div>
          <p className="text-xs text-surface-400 mt-2">{((totalSpent/totalBudget)*100 || 0).toFixed(0)}% of total budget used</p>
        </div>
      )}

      {loading ? <Skeleton rows={4} type="card" /> : budgets.length === 0 ? (
        <EmptyState icon="🎯" title="No budgets for this month" description="Set budgets by category to track your spending limits." action={<button onClick={() => setShowModal(true)} className="btn-primary">Create Budget</button>} />
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {budgets.map(b => <BudgetItem key={b._id} budget={b} onEdit={(b) => { setEditBudget(b); setForm({...b, category: b.category?._id||b.category, amount: b.amount}); setShowModal(true); }} onDelete={handleDelete} />)}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editBudget ? 'Edit Budget' : 'New Budget'} size="sm"
        footer={<div className="flex gap-3"><button onClick={() => setShowModal(false)} className="btn-ghost flex-1">Cancel</button><button onClick={handleSave} className="btn-primary flex-1 justify-center">Save</button></div>}>
        <div className="space-y-4">
          <div><label className="label">Budget Name</label><input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} className="input" placeholder="e.g. Food Budget" /></div>
          <div><label className="label">Category</label>
            <select value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value}))} className="input">
              <option value="">Select category</option>
              {flatCategories.map(c => <option key={c._id} value={c._id}>{' '.repeat(c.d*2)}{c.icon} {c.name}</option>)}
            </select>
          </div>
          <div><label className="label">Monthly Limit (৳)</label><input type="number" value={form.amount} onChange={e => setForm(f => ({...f, amount: e.target.value}))} className="input font-mono" placeholder="0.00" /></div>
          <div><label className="label">Alert at ({form.alertThreshold}%)</label><input type="range" min="50" max="100" value={form.alertThreshold} onChange={e => setForm(f => ({...f, alertThreshold: parseInt(e.target.value)}))} className="w-full accent-primary-600" /></div>
        </div>
      </Modal>
    </div>
  );
}