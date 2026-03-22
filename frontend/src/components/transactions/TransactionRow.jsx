import React from 'react';
import { Edit2, Trash2, ArrowUpRight, ArrowDownLeft, ArrowLeftRight } from 'lucide-react';
import { formatCurrency, formatDateTime, typeSign } from '../../utils/helpers';
import Badge from '../common/Badge';
import * as LucideIcons from 'lucide-react';

// emoji কিনা check করে
const isEmoji = (str) => /\p{Emoji}/u.test(str);

function CategoryIcon({ icon, type }) {
  const typeIcons = { income: ArrowDownLeft, expense: ArrowUpRight, transfer: ArrowLeftRight };
  const iconColors = { income: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20', expense: 'text-red-500 bg-red-50 dark:bg-red-900/20', transfer: 'text-amber-500 bg-amber-50 dark:bg-amber-900/20' };
  const FallbackIcon = typeIcons[type] || ArrowLeftRight;

  if (!icon) {
    return (
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconColors[type]}`}>
        <FallbackIcon size={16} />
      </div>
    );
  }

  if (isEmoji(icon)) {
    return (
      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-lg">
        {icon}
      </div>
    );
  }

  // Lucide icon name
  const LucideComp = LucideIcons[icon];
  if (LucideComp) {
    return (
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconColors[type]}`}>
        <LucideComp size={18} />
      </div>
    );
  }

  // কিছুই না পেলে fallback
  return (
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconColors[type]}`}>
      <FallbackIcon size={16} />
    </div>
  );
}

export default function TransactionRow({ transaction: tx, onEdit, onDelete }) {

  return (
    <div className="flex items-center gap-3 px-4 py-3.5 hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors group rounded-xl">
      {/* Icon */}
      <CategoryIcon icon={tx.category?.icon} type={tx.type} />

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-surface-800 dark:text-surface-200 truncate">{tx.note || tx.category?.name || tx.type}</p>
          {tx.status === 'uncleared' && <span className="w-1.5 h-1.5 bg-amber-500 rounded-full shrink-0" title="Uncleared" />}
          {tx.status === 'reconciled' && <span className="w-1.5 h-1.5 bg-blue-500 rounded-full shrink-0" title="Reconciled" />}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <p className="text-xs text-surface-400">{formatDateTime(tx.date)}</p>
          {tx.account && <span className="text-xs text-surface-300 dark:text-surface-600">•</span>}
          {tx.account && <p className="text-xs text-surface-400 truncate">{tx.account.name}</p>}
        </div>
        {tx.tags?.length > 0 && (
          <div className="flex gap-1 mt-1.5">
            {tx.tags.map(tag => (
              <span key={tag._id} className="px-2 py-0.5 rounded-full text-[10px] font-semibold text-white" style={{ backgroundColor: tag.color }}>{tag.name}</span>
            ))}
          </div>
        )}
      </div>

      {/* Amount */}
      <div className="text-right shrink-0">
        <p className={`text-sm font-bold font-mono ${tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : tx.type === 'expense' ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'}`}>
          {typeSign(tx.type)}{formatCurrency(tx.amount)}
        </p>
        {tx.paymentType && <p className="text-[10px] text-surface-400">{tx.paymentType}</p>}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
        <button onClick={() => onEdit(tx)} className="p-1.5 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 text-surface-400 hover:text-primary-600 transition-colors">
          <Edit2 size={13} />
        </button>
        <button onClick={() => onDelete(tx)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-surface-400 hover:text-red-500 transition-colors">
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}