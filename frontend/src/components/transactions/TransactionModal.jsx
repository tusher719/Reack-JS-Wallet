import React, { useState, useEffect, useRef, useCallback } from 'react';
import Modal from '../common/Modal';
import { useApp } from '../../contexts/AppContext';
import { transactionAPI, accountAPI } from '../../services/api';
import { PAYMENT_TYPES } from '../../utils/helpers';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import {
  ChevronDown, X, Search, Tag, CheckCircle2, Clock, RefreshCw,
  Plus, RotateCcw, Delete, Calculator as CalcIcon
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';

/* ─── helpers ─────────────────────────────────────────────────────────────── */
const isEmoji = (str) => str && /\p{Emoji}/u.test(str);
const LS_KEY  = 'tx_modal_prefs';
const loadPrefs = () => { try { return JSON.parse(localStorage.getItem(LS_KEY)) || {}; } catch { return {}; } };
const savePrefs = (p)  => { try { localStorage.setItem(LS_KEY, JSON.stringify(p)); } catch {} };
const fmt = (n) => Number(n || 0).toLocaleString('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/* ─── type config ─────────────────────────────────────────────────────────── */
const TYPE_CONFIG = {
  income:   { label:'Income',   sign:'+', activeBg:'bg-emerald-500 text-white', inactiveColor:'text-emerald-500', accent:'#10b981', glow:'rgba(16,185,129,0.10)',  border:'rgba(16,185,129,0.22)', amtClass:'text-emerald-500'  },
  expense:  { label:'Expense',  sign:'−', activeBg:'bg-red-500 text-white',     inactiveColor:'text-red-500',     accent:'#ef4444', glow:'rgba(239,68,68,0.10)',   border:'rgba(239,68,68,0.22)',  amtClass:'text-red-500'      },
  transfer: { label:'Transfer', sign:'⇄', activeBg:'bg-amber-500 text-white',   inactiveColor:'text-amber-500',   accent:'#f59e0b', glow:'rgba(245,158,11,0.10)', border:'rgba(245,158,11,0.22)', amtClass:'text-amber-500'    },
};

/* ─── CategoryIcon ────────────────────────────────────────────────────────── */
function CategoryIcon({ icon, color, size = 16 }) {
  if (!icon) return <span style={{ fontSize: size }}>📁</span>;
  if (isEmoji(icon)) return <span style={{ fontSize: size }}>{icon}</span>;
  const Comp = LucideIcons[icon];
  return Comp ? <Comp size={size} style={{ color }} /> : <span style={{ fontSize: size }}>📁</span>;
}

/* ─── CategoryDropdown ────────────────────────────────────────────────────── */
function CategoryDropdown({ value, onChange, categories, accent }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef(null);
  const flat = [];
  const flatten = (cats, d = 0) => cats.forEach(c => { flat.push({ ...c, depth: d }); if (c.children) flatten(c.children, d + 1); });
  flatten(categories);
  const filtered = search.trim() ? flat.filter(c => c.name.toLowerCase().includes(search.toLowerCase())) : flat;
  const selected = flat.find(c => c._id === value);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button type="button" onClick={() => { setOpen(o => !o); setSearch(''); }}
        className="input w-full flex items-center gap-2.5 cursor-pointer transition-all"
        style={open ? { borderColor: accent, boxShadow: `0 0 0 3px ${accent}22` } : {}}>
        {selected ? (
          <>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: (selected.color || accent) + '22' }}>
              <CategoryIcon icon={selected.icon} color={selected.color || accent} size={15} />
            </div>
            <span className="flex-1 text-left text-sm truncate">{selected.name}</span>
          </>
        ) : (
          <>
            <div className="w-7 h-7 rounded-lg bg-surface-700 flex items-center justify-center shrink-0"><span className="text-surface-400 text-xs">?</span></div>
            <span className="flex-1 text-left text-sm text-surface-400">No category</span>
          </>
        )}
        <ChevronDown size={14} className={`text-surface-400 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1.5 z-[200] rounded-xl border border-surface-700 bg-surface-900 shadow-2xl overflow-hidden" style={{ maxHeight: '280px', display: 'flex', flexDirection: 'column' }}>
          <div className="p-2 border-b border-surface-700 shrink-0">
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-surface-500" />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search categories..."
                className="w-full bg-surface-800 border border-surface-700 rounded-lg pl-7 pr-7 py-1.5 text-xs text-white placeholder-surface-500 outline-none" autoFocus />
              {search && <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-surface-500 hover:text-white"><X size={12} /></button>}
            </div>
          </div>
          <div className="overflow-y-auto py-1">
            {!search && (
              <button type="button" onClick={() => { onChange(''); setOpen(false); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 hover:bg-surface-800 transition-colors ${!value ? 'bg-surface-800' : ''}`}>
                <div className="w-7 h-7 rounded-lg bg-surface-700 flex items-center justify-center shrink-0"><span className="text-surface-400 text-xs">—</span></div>
                <span className="text-sm text-surface-400">No category</span>
                {!value && <span className="ml-auto text-xs" style={{ color: accent }}>✓</span>}
              </button>
            )}
            {filtered.map(c => (
              <button key={c._id} type="button" onClick={() => { onChange(c._id); setOpen(false); setSearch(''); }}
                className={`w-full flex items-center gap-2.5 py-2 text-left hover:bg-surface-800 transition-colors ${value === c._id ? 'bg-surface-800' : ''}`}
                style={{ paddingLeft: `${12 + c.depth * 20}px` }}>
                {c.depth > 0 && <span className="text-surface-600 text-xs shrink-0">└</span>}
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: (c.color || accent) + '22' }}>
                  <CategoryIcon icon={c.icon} color={c.color || accent} size={14} />
                </div>
                <span className={`text-sm truncate ${c.depth > 0 ? 'text-surface-300' : 'text-white font-medium'}`}>{c.name}</span>
                {value === c._id && <span className="ml-auto text-xs shrink-0 pr-3" style={{ color: accent }}>✓</span>}
              </button>
            ))}
            {filtered.length === 0 && <div className="px-3 py-6 text-center text-surface-500 text-xs">No categories found</div>}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── TagsDropdown ────────────────────────────────────────────────────────── */
function TagsDropdown({ value, onChange, tags, accent }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef(null);
  const filtered = search.trim() ? tags.filter(t => t.name.toLowerCase().includes(search.toLowerCase())) : tags;
  const selectedTags = tags.filter(t => value.includes(t._id));
  const toggle = (id) => onChange(value.includes(id) ? value.filter(v => v !== id) : [...value, id]);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button type="button" onClick={() => { setOpen(o => !o); setSearch(''); }}
        className="input w-full flex items-center gap-2 cursor-pointer transition-all min-h-[42px]"
        style={open ? { borderColor: accent, boxShadow: `0 0 0 3px ${accent}22` } : {}}>
        <Tag size={14} className="text-surface-400 shrink-0" />
        {selectedTags.length === 0 ? <span className="text-sm text-surface-400 flex-1 text-left">No tags</span> : (
          <div className="flex flex-wrap gap-1 flex-1">
            {selectedTags.map(t => (
              <span key={t._id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold text-white" style={{ backgroundColor: t.color }}>
                {t.name}
                <span onClick={(e) => { e.stopPropagation(); toggle(t._id); }} className="cursor-pointer hover:opacity-70"><X size={10} /></span>
              </span>
            ))}
          </div>
        )}
        <ChevronDown size={14} className={`text-surface-400 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1.5 z-[200] rounded-xl border border-surface-700 bg-surface-900 shadow-2xl overflow-hidden" style={{ maxHeight: '240px', display: 'flex', flexDirection: 'column' }}>
          <div className="p-2 border-b border-surface-700 shrink-0">
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-surface-500" />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tags..."
                className="w-full bg-surface-800 border border-surface-700 rounded-lg pl-7 pr-7 py-1.5 text-xs text-white placeholder-surface-500 outline-none" autoFocus />
              {search && <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-surface-500 hover:text-white"><X size={12} /></button>}
            </div>
          </div>
          <div className="overflow-y-auto py-1">
            {filtered.map(t => {
              const isSel = value.includes(t._id);
              return (
                <button key={t._id} type="button" onClick={() => toggle(t._id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 hover:bg-surface-800 transition-colors ${isSel ? 'bg-surface-800' : ''}`}>
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: t.color }} />
                  <span className="text-sm text-white flex-1 text-left">{t.name}</span>
                  {isSel && <span className="text-xs shrink-0" style={{ color: accent }}>✓</span>}
                </button>
              );
            })}
            {filtered.length === 0 && <div className="px-3 py-5 text-center text-surface-500 text-xs">No tags found</div>}
          </div>
          {value.length > 0 && (
            <div className="px-3 py-2 border-t border-surface-700 shrink-0">
              <button type="button" onClick={() => onChange([])} className="text-xs text-surface-400 hover:text-white transition-colors">Clear all ({value.length})</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── StatusDropdown ──────────────────────────────────────────────────────── */
const STATUS_CONFIG = {
  cleared:    { label: 'Cleared',    icon: CheckCircle2, color: '#10b981' },
  uncleared:  { label: 'Uncleared',  icon: Clock,        color: '#f59e0b' },
  reconciled: { label: 'Reconciled', icon: RefreshCw,    color: '#6175f4' },
};
function StatusDropdown({ value, onChange, accent }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const cur = STATUS_CONFIG[value] || STATUS_CONFIG.cleared;
  const CurIcon = cur.icon;
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);
  return (
    <div className="relative" ref={ref}>
      <button type="button" onClick={() => setOpen(o => !o)}
        className="input w-full flex items-center gap-2.5 cursor-pointer transition-all"
        style={open ? { borderColor: accent, boxShadow: `0 0 0 3px ${accent}22` } : {}}>
        <CurIcon size={15} style={{ color: cur.color }} className="shrink-0" />
        <span className="flex-1 text-left text-sm">{cur.label}</span>
        <ChevronDown size={14} className={`text-surface-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1.5 z-[200] rounded-xl border border-surface-700 bg-surface-900 shadow-2xl overflow-hidden">
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
            const Icon = cfg.icon;
            return (
              <button key={key} type="button" onClick={() => { onChange(key); setOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 hover:bg-surface-800 transition-colors ${value === key ? 'bg-surface-800' : ''}`}>
                <Icon size={15} style={{ color: cfg.color }} className="shrink-0" />
                <span className="text-sm text-white flex-1 text-left">{cfg.label}</span>
                {value === key && <span className="text-xs shrink-0" style={{ color: accent }}>✓</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─── Calculator Popup ────────────────────────────────────────────────────── */
function CalcPopup({ initialValue, accent, onInsert, onCancel }) {
  const [expression, setExpression] = useState(initialValue > 0 ? initialValue.toString() : '');
  const [result, setResult]         = useState(initialValue || 0);
  const [justEvaled, setJustEvaled] = useState(false);

  const evaluate = (expr) => {
    if (!expr) return 0;
    try {
      const clean = expr.replace(/×/g, '*').replace(/÷/g, '/').replace(/[+\-*/]$/, '');
      if (!clean) return 0;
      // eslint-disable-next-line no-new-func
      const r = Function('"use strict"; return (' + clean + ')')();
      return isFinite(r) ? Math.round(r * 100) / 100 : null;
    } catch { return null; }
  };

  const key = useCallback((k) => {
    if (k === 'C')  { setExpression(''); setResult(0); setJustEvaled(false); return; }
    if (k === '⌫') {
      if (justEvaled) { setExpression(''); setResult(0); setJustEvaled(false); return; }
      const n = expression.slice(0, -1);
      setExpression(n);
      const r = evaluate(n); if (r !== null) setResult(r);
      return;
    }
    if (k === '=') {
      const r = evaluate(expression);
      if (r === null) { setExpression('Error'); return; }
      setExpression(r.toString()); setResult(r); setJustEvaled(true); return;
    }
    const isOp = ['+','-','×','÷'].includes(k);
    let next;
    if (justEvaled) { next = isOp ? result.toString() + k : k; setJustEvaled(false); }
    else {
      const last = expression.slice(-1);
      const lastIsOp = ['+','-','×','÷'].includes(last);
      next = isOp && lastIsOp ? expression.slice(0, -1) + k : expression + k;
    }
    setExpression(next);
    if (!isOp) { const r = evaluate(next); if (r !== null) setResult(r); }
  }, [expression, result, justEvaled]);

  const keys = [
    ['7','8','9','÷'],
    ['4','5','6','×'],
    ['1','2','3','-'],
    ['C','0','.','+'],
    [null, null,'⌫','='],
  ];

  return (
    <div className="rounded-2xl overflow-hidden shadow-2xl border border-surface-700"
      style={{ background: 'linear-gradient(145deg, #1e2433, #151922)' }}>
      {/* Display */}
      <div className="px-5 py-4 select-none" style={{ background: 'rgba(0,0,0,0.3)' }}>
        <div className="text-surface-500 text-xs font-mono min-h-[16px] truncate text-right">
          {expression && expression !== result.toString() ? expression : ''}
        </div>
        <div className="font-mono font-bold text-3xl mt-1 text-right transition-all" style={{ color: accent }}>
          {fmt(result)}
        </div>
        <div className="text-surface-500 text-xs text-right mt-0.5">৳</div>
      </div>

      {/* Keys */}
      <div className="grid grid-cols-4 gap-1.5 p-3">
        {keys.flat().map((k, i) => {
          if (!k) return <div key={i} />;
          const isOp  = ['÷','×','-','+'].includes(k);
          const isEq  = k === '=';
          const isDel = k === '⌫';
          const isC   = k === 'C';
          return (
            <button key={i} onClick={() => key(k)}
              className={`h-12 rounded-xl font-semibold text-base transition-all active:scale-95 select-none ${
                isEq  ? 'text-white col-span-1' :
                isOp  ? 'bg-surface-700/60 hover:bg-surface-700' :
                isDel ? 'bg-red-900/30 text-red-400 hover:bg-red-900/50' :
                isC   ? 'bg-surface-700/60 text-amber-400 hover:bg-surface-700' :
                        'bg-surface-700/40 text-white hover:bg-surface-700/70'
              }`}
              style={isEq ? { backgroundColor: accent } : isOp ? { color: accent } : {}}>
              {isDel ? <Delete size={15} className="mx-auto" /> : k}
            </button>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex gap-2 px-3 pb-3">
        <button onClick={onCancel}
          className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-surface-700/50 text-surface-300 hover:bg-surface-700 transition-all">
          Cancel
        </button>
        <button onClick={() => onInsert(result)}
          className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
          style={{ backgroundColor: accent }}>
          Insert ৳{fmt(result)}
        </button>
      </div>
    </div>
  );
}

/* ─── AmountInput ─────────────────────────────────────────────────────────── */
function AmountInput({ value, onChange, cfg }) {
  const [showCalc, setShowCalc] = useState(false);
  const popupRef  = useRef(null);
  const triggerRef = useRef(null);

  // close on outside click
  useEffect(() => {
    if (!showCalc) return;
    const h = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target) && !triggerRef.current?.contains(e.target))
        setShowCalc(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [showCalc]);

  return (
    <div>
      <label className="label">Amount</label>

      {/* Amount display — click opens calc popup */}
      <div className="relative">
        <button ref={triggerRef} type="button"
          onClick={() => setShowCalc(o => !o)}
          className="w-full flex items-center rounded-xl border transition-all px-4 py-3 gap-3 text-left"
          style={{
            borderColor: showCalc ? cfg.accent : 'rgba(100,116,139,0.35)',
            background: showCalc ? cfg.glow : 'rgba(0,0,0,0.2)',
            boxShadow: showCalc ? `0 0 0 3px ${cfg.accent}22` : 'none',
          }}>
          {/* Sign badge */}
          <span className="text-xl font-bold w-6 text-center shrink-0" style={{ color: cfg.accent }}>{cfg.sign}</span>

          {/* Number */}
          <span className={`flex-1 font-mono font-bold text-2xl ${value > 0 ? cfg.amtClass : 'text-surface-500'}`}>
            {value > 0 ? fmt(value) : '0.00'}
          </span>

          {/* ৳ + calc icon */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="font-semibold text-sm" style={{ color: cfg.accent }}>৳</span>
            <CalcIcon size={16} style={{ color: showCalc ? cfg.accent : '#64748b' }} />
          </div>
        </button>

        {/* Calc popup */}
        {showCalc && (
          <div ref={popupRef}
            className="absolute top-full left-0 right-0 mt-2 z-[300]"
            style={{ filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.5))' }}>
            <CalcPopup
              initialValue={value}
              accent={cfg.accent}
              onInsert={(v) => { onChange(v); setShowCalc(false); }}
              onCancel={() => setShowCalc(false)}
            />
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── AccountSelector with live balance ───────────────────────────────────── */
function AccountSelector({ value, onChange, accounts, label = 'Account', excludeId }) {
  const filteredAccounts = excludeId ? accounts.filter(a => a._id !== excludeId) : accounts;
  // find live balance from accounts array (re-renders when accounts changes)
  const selected = accounts.find(a => a._id === value);

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="label mb-0">{label}</label>
        {selected && (
          <span className="text-xs font-mono font-semibold"
            style={{ color: selected.currentBalance >= 0 ? '#10b981' : '#ef4444' }}>
            Balance: ৳{fmt(selected.currentBalance)}
          </span>
        )}
      </div>
      <select value={value} onChange={e => onChange(e.target.value)} className="input">
        <option value="">Select account</option>
        {filteredAccounts.map(a => (
          <option key={a._id} value={a._id}>{a.name} — ৳{fmt(a.currentBalance)}</option>
        ))}
      </select>
    </div>
  );
}

/* ─── Main Modal ──────────────────────────────────────────────────────────── */
const BLANK = { amount: 0, note: '', payer: '', tags: [] };

export default function TransactionModal({ isOpen, onClose, transaction, onSuccess }) {
  const { accounts, categories, tags, loadAccounts } = useApp();
  const [tab,     setTab]     = useState(() => loadPrefs().type || 'expense');
  const [loading, setLoading] = useState(false);
  const [liveAccounts, setLiveAccounts] = useState(accounts);

  const cfg = TYPE_CONFIG[tab] || TYPE_CONFIG.expense;

  // keep liveAccounts in sync with context (refreshed after each save)
  useEffect(() => { setLiveAccounts(accounts); }, [accounts]);

  // also refresh from API when modal opens
  useEffect(() => {
    if (isOpen) loadAccounts();
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  const getDefault = (type) => {
    const p = loadPrefs();
    return { type: type || p.type || 'expense', amount: 0, account: p.account || '', toAccount: '', category: p.category || '', tags: [], note: '', payer: '', date: format(new Date(), "yyyy-MM-dd'T'HH:mm"), paymentType: p.paymentType || 'Cash', status: p.status || 'cleared' };
  };

  const [form, setForm] = useState(getDefault);

  useEffect(() => {
    if (!isOpen) return;
    if (transaction) {
      setForm({ ...transaction, date: format(new Date(transaction.date), "yyyy-MM-dd'T'HH:mm"), tags: transaction.tags?.map(t => t._id || t) || [], account: transaction.account?._id || transaction.account, category: transaction.category?._id || transaction.category, payer: transaction.payer || '' });
      setTab(transaction.type);
    } else {
      setForm(getDefault(tab));
    }
  }, [transaction, isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  const setType = (type) => { setTab(type); setForm(f => ({ ...f, type })); savePrefs({ ...loadPrefs(), type }); };
  const set = (key, val)  => {
    setForm(f => ({ ...f, [key]: val }));
    if (['account','category','paymentType','status'].includes(key)) savePrefs({ ...loadPrefs(), [key]: val });
  };

  const handleSubmit = async (andAnother = false) => {
    if (!form.amount || form.amount <= 0) return toast.error('Enter a valid amount');
    if (!form.account) return toast.error('Select an account');
    setLoading(true);
    try {
      if (transaction) {
        await transactionAPI.update(transaction._id, form);
        toast.success('Transaction updated');
        await loadAccounts();       // refresh live balance
        onSuccess?.(); onClose();
      } else {
        await transactionAPI.create(form);
        toast.success('Record added!');
        await loadAccounts();       // refresh live balance immediately
        onSuccess?.();
        if (andAnother) setForm(f => ({ ...f, ...BLANK }));
        else onClose();
      }
    } catch (e) { toast.error(e.message || 'Failed'); }
    finally { setLoading(false); }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={transaction ? 'Edit Transaction' : 'New Transaction'} size="md"
      footer={
        <div className="flex gap-2">
          {!transaction && (
            <button onClick={() => handleSubmit(true)} disabled={loading}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all"
              style={{ borderColor: cfg.border, color: cfg.accent, backgroundColor: cfg.glow }}>
              <RotateCcw size={13} /> Another Record
            </button>
          )}
          <button onClick={() => handleSubmit(false)} disabled={loading}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all flex items-center justify-center gap-1.5"
            style={{ backgroundColor: cfg.accent }}>
            <Plus size={15} />
            {loading ? 'Saving...' : transaction ? 'Update' : 'Add Record'}
          </button>
        </div>
      }>

      {/* ── Type Tabs ── */}
      <div className="flex gap-1 rounded-xl p-1 mb-5 transition-all duration-300"
        style={{ backgroundColor: cfg.glow, border: `1px solid ${cfg.border}` }}>
        {Object.entries(TYPE_CONFIG).map(([key, t]) => (
          <button key={key} onClick={() => setType(key)}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${tab === key ? t.activeBg : `${t.inactiveColor} hover:bg-white/5`}`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {/* ── Amount (popup calc) ── */}
        <AmountInput value={form.amount} onChange={(v) => set('amount', v)} cfg={cfg} />

        {/* ── Account ── */}
        <AccountSelector
          value={form.account}
          onChange={(v) => set('account', v)}
          accounts={liveAccounts}
          label="Account"
        />

        {form.type === 'transfer' && (
          <AccountSelector
            value={form.toAccount}
            onChange={(v) => set('toAccount', v)}
            accounts={liveAccounts}
            label="To Account"
            excludeId={form.account}
          />
        )}

        {/* ── Category ── */}
        {form.type !== 'transfer' && (
          <div>
            <label className="label">Category</label>
            <CategoryDropdown value={form.category} onChange={(v) => set('category', v)} categories={categories} accent={cfg.accent} />
          </div>
        )}

        {/* ── Note ── */}
        <div>
          <label className="label">Note</label>
          <textarea value={form.note} onChange={e => set('note', e.target.value)} className="input resize-none" rows={2} placeholder="Add a note..." />
        </div>

        {/* ── Payer ── */}
        <div>
          <label className="label">Payer</label>
          <input value={form.payer || ''} onChange={e => set('payer', e.target.value)} className="input" placeholder="Who paid / received?" />
        </div>

        {/* ── Tags ── */}
        {tags.length > 0 && (
          <div>
            <label className="label">Tags</label>
            <TagsDropdown value={form.tags} onChange={(v) => set('tags', v)} tags={tags} accent={cfg.accent} />
          </div>
        )}

        {/* ── Date & Payment ── */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Date & Time</label>
            <input type="datetime-local" value={form.date} onChange={e => set('date', e.target.value)} className="input text-sm" />
          </div>
          <div>
            <label className="label">Payment Type</label>
            <select value={form.paymentType} onChange={e => set('paymentType', e.target.value)} className="input">
              {PAYMENT_TYPES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>

        {/* ── Status ── */}
        <div>
          <label className="label">Status</label>
          <StatusDropdown value={form.status} onChange={(v) => set('status', v)} accent={cfg.accent} />
        </div>
      </div>
    </Modal>
  );
}