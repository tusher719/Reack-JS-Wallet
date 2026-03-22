import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';
import { categoryAPI, tagAPI } from '../services/api';
import { COLORS, CATEGORY_ICONS, NATURE_TYPES } from '../utils/helpers';
import { APP_VERSION, BUILD_DATE, CHANGELOG } from '../version';
import Modal from '../components/common/Modal';
import toast from 'react-hot-toast';
import { Plus, Trash2, Edit2, User, Bell, Shield, Palette, Tag as TagIcon, Layers, Info } from 'lucide-react';

const TABS = [
  { id: 'profile',    label: 'Profile',     icon: User },
  { id: 'categories', label: 'Categories',  icon: Layers },
  { id: 'tags',       label: 'Tags',        icon: TagIcon },
  { id: 'security',   label: 'Security',    icon: Shield },
  { id: 'about',      label: 'About',       icon: Info },
];

function ProfileSettings() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ name: user?.name||'', currency: user?.currency||'BDT', timezone: user?.timezone||'Asia/Dhaka' });
  const save = () => updateUser(form).catch(e => toast.error(e.message));
  return (
    <div className="space-y-5 max-w-md">
      <div><label className="label">Full Name</label><input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} className="input" /></div>
      <div><label className="label">Email</label><input value={user?.email} disabled className="input opacity-50 cursor-not-allowed" /></div>
      <div><label className="label">Currency</label>
        <select value={form.currency} onChange={e=>setForm(f=>({...f,currency:e.target.value}))} className="input">
          <option value="BDT">৳ BDT - Bangladeshi Taka</option>
          <option value="USD">$ USD - US Dollar</option>
          <option value="EUR">€ EUR - Euro</option>
          <option value="GBP">£ GBP - British Pound</option>
          <option value="INR">₹ INR - Indian Rupee</option>
        </select>
      </div>
      <button onClick={save} className="btn-primary">Save Changes</button>
    </div>
  );
}

function CategorySettings() {
  const { categories, fetchCategories } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [editCat, setEditCat] = useState(null);
  const [form, setForm] = useState({ name:'', color:'#6366f1', icon:'📁', nature:'None', type:'expense', parent:'' });

  const allCats = [];
  const flatten = (cats, d=0) => cats.forEach(c => { allCats.push({...c,d}); if(c.children) flatten(c.children,d+1); });
  flatten(categories);

  const openAdd = (parent = null) => {
    setEditCat(null);
    setForm({ name:'', color: parent?.color || '#6366f1', icon:'📁', nature:'None', type:'expense', parent: parent?._id || '' });
    setShowModal(true);
  };

  const openEdit = (cat) => {
    setEditCat(cat);
    setForm({ name:cat.name, color:cat.color, icon:cat.icon, nature:cat.nature, type:cat.type, parent:cat.parent||'' });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name) return toast.error('Name required');
    try {
      if (editCat) { await categoryAPI.update(editCat._id, form); toast.success('Updated'); }
      else { await categoryAPI.create(form); toast.success('Created'); }
      await fetchCategories(); setShowModal(false);
    } catch (e) { toast.error(e.message || 'Failed'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Hide this category?')) return;
    await categoryAPI.delete(id); await fetchCategories(); toast.success('Category hidden');
  };

  const renderCats = (cats, depth=0) => cats.map(cat => (
    <div key={cat._id}>
      <div className={`flex items-center gap-3 p-3 rounded-xl hover:bg-surface-50 dark:hover:bg-surface-800/50 group transition-colors`} style={{ paddingLeft: `${12 + depth * 20}px` }}>
        <span className="text-xl w-7 text-center">{cat.icon}</span>
        <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
        <p className="flex-1 text-sm font-medium text-surface-700 dark:text-surface-300">{cat.name}</p>
        <span className="text-xs text-surface-400 bg-surface-100 dark:bg-surface-800 px-2 py-0.5 rounded-full">{cat.nature}</span>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {depth < 2 && <button onClick={() => openAdd(cat)} className="p-1.5 rounded-lg hover:bg-primary-50 text-primary-500"><Plus size={12} /></button>}
          <button onClick={() => openEdit(cat)} className="p-1.5 rounded-lg hover:bg-surface-200 dark:hover:bg-surface-700 text-surface-400"><Edit2 size={12} /></button>
          <button onClick={() => handleDelete(cat._id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-400"><Trash2 size={12} /></button>
        </div>
      </div>
      {cat.children?.length > 0 && renderCats(cat.children, depth+1)}
    </div>
  ));

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-surface-400">{allCats.length} categories</p>
        <button onClick={() => openAdd()} className="btn-primary text-xs py-2"><Plus size={13} /> Add Category</button>
      </div>
      <div className="card divide-y divide-surface-50 dark:divide-surface-800">
        {renderCats(categories)}
        {categories.length === 0 && <p className="text-center text-surface-400 text-sm py-8">No categories. Add your first one!</p>}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editCat ? 'Edit Category' : 'New Category'} size="sm"
        footer={<div className="flex gap-3"><button onClick={() => setShowModal(false)} className="btn-ghost flex-1">Cancel</button><button onClick={handleSave} className="btn-primary flex-1 justify-center">Save</button></div>}>
        <div className="space-y-4">
          <div><label className="label">Name</label><input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} className="input" placeholder="Category name" /></div>
          <div><label className="label">Icon</label>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto scrollbar-thin">
              {CATEGORY_ICONS.map(icon => (
                <button key={icon} onClick={() => setForm(f=>({...f,icon}))}
                  className={`w-9 h-9 rounded-lg text-xl transition-all ${form.icon === icon ? 'bg-primary-100 dark:bg-primary-900/30 ring-2 ring-primary-500' : 'hover:bg-surface-100 dark:hover:bg-surface-800'}`}>
                  {icon}
                </button>
              ))}
            </div>
          </div>
          <div><label className="label">Color</label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map(c => <button key={c} onClick={() => setForm(f=>({...f,color:c}))} className={`w-8 h-8 rounded-lg ${form.color===c?'ring-2 ring-offset-2 ring-primary-500 scale-110':''}`} style={{backgroundColor:c}} />)}
            </div>
          </div>
          <div><label className="label">Nature</label>
            <div className="flex gap-2">
              {NATURE_TYPES.map(n => <button key={n} onClick={() => setForm(f=>({...f,nature:n}))} className={`flex-1 py-2 rounded-xl text-xs font-semibold ${form.nature===n?'bg-primary-600 text-white':'bg-surface-100 dark:bg-surface-900 text-surface-500'}`}>{n}</button>)}
            </div>
          </div>
          <div><label className="label">Type</label>
            <select value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))} className="input">
              <option value="expense">Expense</option><option value="income">Income</option><option value="both">Both</option>
            </select>
          </div>
          {!editCat && <div><label className="label">Parent (optional)</label>
            <select value={form.parent} onChange={e=>setForm(f=>({...f,parent:e.target.value}))} className="input">
              <option value="">Top level</option>
              {allCats.filter(c=>c.d<2).map(c=><option key={c._id} value={c._id}>{' '.repeat(c.d*2)}{c.icon} {c.name}</option>)}
            </select>
          </div>}
        </div>
      </Modal>
    </div>
  );
}

function TagSettings() {
  const { tags, fetchTags } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [editTag, setEditTag] = useState(null);
  const [form, setForm] = useState({ name:'', color:'#10b981', autoAssign:false });

  const handleSave = async () => {
    if (!form.name) return toast.error('Name required');
    try {
      if (editTag) { await tagAPI.update(editTag._id, form); toast.success('Updated'); }
      else { await tagAPI.create(form); toast.success('Tag created'); }
      await fetchTags(); setShowModal(false);
    } catch (e) { toast.error(e.message || 'Failed'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-surface-400">{tags.length} tags</p>
        <button onClick={() => { setEditTag(null); setForm({ name:'', color:'#10b981', autoAssign:false }); setShowModal(true); }} className="btn-primary text-xs py-2"><Plus size={13} /> Add Tag</button>
      </div>
      <div className="flex flex-wrap gap-3">
        {tags.map(tag => (
          <div key={tag._id} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: tag.color }} />
            <span className="text-sm font-medium text-surface-700 dark:text-surface-300">{tag.name}</span>
            {tag.autoAssign && <span className="text-[10px] font-semibold text-primary-500 bg-primary-50 dark:bg-primary-900/20 px-1.5 py-0.5 rounded-full">auto</span>}
            <button onClick={() => { setEditTag(tag); setForm({...tag}); setShowModal(true); }} className="text-surface-400 hover:text-primary-600 ml-1"><Edit2 size={11} /></button>
            <button onClick={async () => { await tagAPI.delete(tag._id); fetchTags(); }} className="text-surface-400 hover:text-red-500"><Trash2 size={11} /></button>
          </div>
        ))}
        {tags.length === 0 && <p className="text-sm text-surface-400">No tags yet.</p>}
      </div>
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editTag ? 'Edit Tag' : 'New Tag'} size="sm"
        footer={<div className="flex gap-3"><button onClick={() => setShowModal(false)} className="btn-ghost flex-1">Cancel</button><button onClick={handleSave} className="btn-primary flex-1 justify-center">Save</button></div>}>
        <div className="space-y-4">
          <div><label className="label">Tag Name</label><input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} className="input" /></div>
          <div><label className="label">Color</label><div className="flex flex-wrap gap-2">{COLORS.map(c => <button key={c} onClick={() => setForm(f=>({...f,color:c}))} className={`w-8 h-8 rounded-lg ${form.color===c?'ring-2 ring-offset-2 ring-primary-500 scale-110':''}`} style={{backgroundColor:c}} />)}</div></div>
          <label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" checked={form.autoAssign} onChange={e=>setForm(f=>({...f,autoAssign:e.target.checked}))} className="w-4 h-4 rounded accent-primary-600" /><span className="text-sm text-surface-700 dark:text-surface-300">Auto-assign to transactions</span></label>
        </div>
      </Modal>
    </div>
  );
}

function SecuritySettings() {
  const { user } = useAuth();
  const [form, setForm] = useState({ currentPassword:'', newPassword:'', confirmPassword:'' });
  const { changePassword } = useAuth();
  const handleChange = async () => {
    if (form.newPassword !== form.confirmPassword) return toast.error('Passwords do not match');
    try { await changePassword?.(form.currentPassword, form.newPassword); toast.success('Password changed'); setForm({currentPassword:'',newPassword:'',confirmPassword:''}); }
    catch (e) { toast.error(e.message || 'Failed'); }
  };
  return (
    <div className="space-y-5 max-w-md">
      <div className="card p-4"><p className="text-sm text-surface-500 dark:text-surface-400">Role: <span className="font-semibold text-surface-800 dark:text-surface-200 capitalize">{user?.role}</span></p><p className="text-sm text-surface-500 dark:text-surface-400 mt-1">Last login: <span className="font-semibold text-surface-800 dark:text-surface-200">{user?.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'N/A'}</span></p></div>
      <h3 className="font-semibold text-surface-800 dark:text-surface-200">Change Password</h3>
      <div><label className="label">Current Password</label><input type="password" value={form.currentPassword} onChange={e=>setForm(f=>({...f,currentPassword:e.target.value}))} className="input" /></div>
      <div><label className="label">New Password</label><input type="password" value={form.newPassword} onChange={e=>setForm(f=>({...f,newPassword:e.target.value}))} className="input" /></div>
      <div><label className="label">Confirm New Password</label><input type="password" value={form.confirmPassword} onChange={e=>setForm(f=>({...f,confirmPassword:e.target.value}))} className="input" /></div>
      <button onClick={handleChange} className="btn-primary">Update Password</button>
    </div>
  );
}

function AboutSettings() {

  const PENDING_TASKS = [
    { id: 1, label: 'Transaction list-এ icon দেখানো', status: 'done' },
    { id: 2, label: 'Category dropdown — icon + search UI', status: 'done' },
    { id: 3, label: 'Tags search dropdown', status: 'done' },
    { id: 4, label: 'Status custom dropdown', status: 'done' },
    { id: 5, label: 'Tab-wise modal color theming', status: 'done' },
    { id: 6, label: 'Amount UI redesign + sign badge', status: 'done' },
    { id: 7, label: 'Calculator popup (click-to-open)', status: 'done' },
    { id: 8, label: 'Calculator bugs fix', status: 'done' },
    { id: 9, label: 'Payer field যোগ', status: 'done' },
    { id: 10, label: 'Add Record + Another Record button', status: 'done' },
    { id: 11, label: 'LocalStorage-এ preferences persist', status: 'done' },
    { id: 12, label: 'Live account balance modal-এ', status: 'done' },
    { id: 13, label: 'Settings → About page', status: 'done' },
    { id: 14, label: 'Version system (version.js)', status: 'done' },
    { id: 15, label: 'Dashboard charts উন্নত করা', status: 'pending' },
    { id: 16, label: 'Debt tracker page improve করা', status: 'pending' },
    { id: 17, label: 'Export to Excel / PDF', status: 'pending' },
    { id: 18, label: 'Budget over-alert notification', status: 'pending' },
    { id: 19, label: 'Dark/Light theme manual toggle', status: 'pending' },
    { id: 20, label: 'Search by amount range / date range', status: 'pending' },
    { id: 21, label: 'Recurring transaction auto-create', status: 'pending' },
    { id: 22, label: 'Mobile PWA install support', status: 'pending' },
  ];

  const FUTURE_FEATURES = [
    {
      icon: '📱',
      title: 'Mobile App (PWA)',
      desc: 'Browser থেকে "Add to Home Screen" করলেই app-এর মতো কাজ করবে। Push notification, offline mode support।',
      steps: ['manifest.json আপডেট করো', 'Service Worker যোগ করো', 'Offline cache setup করো'],
    },
    {
      icon: '🖥️',
      title: 'Desktop App (Electron)',
      desc: 'Electron দিয়ে Windows/Mac/Linux desktop app বানানো যাবে। System tray, local backup সহ।',
      steps: ['electron + electron-builder install করো', 'main.js entry point বানাও', 'npm run build করে package করো'],
    },
    {
      icon: '📊',
      title: 'Advanced Reports',
      desc: 'Monthly/yearly comparison, category-wise spending trend, net worth tracker, custom date range charts।',
      steps: ['নতুন /api/stats/advanced endpoint বানাও', 'Recharts-এ AreaChart/ComposedChart যোগ করো', 'PDF export (jsPDF) যোগ করো'],
    },
    {
      icon: '🔔',
      title: 'Smart Notifications',
      desc: 'Budget limit পৌঁছালে, debt due date আসলে, বড় transaction হলে — email বা in-app alert।',
      steps: ['nodemailer setup করো backend-এ', 'Cron job already আছে — alert logic যোগ করো', 'Frontend notification center improve করো'],
    },
    {
      icon: '🌐',
      title: 'Multi-Currency',
      desc: 'BDT, USD, EUR — যেকোনো currency-তে transaction রাখো। Live exchange rate API দিয়ে auto convert।',
      steps: ['Exchange rate API (exchangerate-api.com) যোগ করো', 'Transaction model-এ currency field যোগ করো', 'Dashboard-এ currency switcher বানাও'],
    },
    {
      icon: '👥',
      title: 'Multi-User / Family',
      desc: 'একই account-এ পরিবারের সবাই access করতে পারবে। Role-based permission সহ।',
      steps: ['User model-এ family/group concept যোগ করো', 'Invite system বানাও (email link)', 'Permission middleware আপডেট করো'],
    },
  ];

  const done    = PENDING_TASKS.filter(t => t.status === 'done');
  const pending = PENDING_TASKS.filter(t => t.status === 'pending');
  const pct     = Math.round((done.length / PENDING_TASKS.length) * 100);

  return (
    <div className="space-y-6">

      {/* ── App Header ── */}
      <div className="rounded-2xl p-6 text-center"
        style={{ background: 'linear-gradient(135deg, rgba(97,117,244,0.15) 0%, rgba(16,185,129,0.10) 100%)', border: '1px solid rgba(97,117,244,0.25)' }}>
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3 text-3xl"
          style={{ background: 'linear-gradient(135deg, #6175f4, #10b981)' }}>💰</div>
        <h2 className="text-xl font-bold text-surface-900 dark:text-white font-display">WalletOS</h2>
        <p className="text-surface-400 text-sm mt-0.5">Personal Finance Manager</p>
        <div className="inline-flex items-center gap-2 mt-3 px-3 py-1 rounded-full text-xs font-semibold"
          style={{ backgroundColor: 'rgba(97,117,244,0.15)', color: '#6175f4', border: '1px solid rgba(97,117,244,0.3)' }}>
          v{APP_VERSION} · {BUILD_DATE}
        </div>
      </div>

      {/* ── Tech Stack ── */}
      <div className="card p-4">
        <h3 className="text-sm font-semibold text-surface-700 dark:text-surface-300 mb-3">Tech Stack</h3>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: 'Frontend', value: 'React 18 + Tailwind CSS' },
            { label: 'Backend',  value: 'Node.js + Express'       },
            { label: 'Database', value: 'MongoDB + Mongoose'       },
            { label: 'Auth',     value: 'JWT + bcrypt'             },
            { label: 'Charts',   value: 'Recharts'                 },
            { label: 'Icons',    value: 'Lucide React'             },
          ].map(item => (
            <div key={item.label} className="bg-surface-50 dark:bg-surface-800 rounded-xl px-3 py-2">
              <p className="text-[10px] text-surface-400 uppercase tracking-wide">{item.label}</p>
              <p className="text-xs font-semibold text-surface-700 dark:text-surface-200 mt-0.5">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Task Progress ── */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-surface-700 dark:text-surface-300">Task Progress</h3>
          <span className="text-xs font-bold" style={{ color: '#6175f4' }}>{done.length}/{PENDING_TASKS.length} done</span>
        </div>
        {/* Progress bar */}
        <div className="w-full h-2 bg-surface-100 dark:bg-surface-700 rounded-full overflow-hidden mb-4">
          <div className="h-full rounded-full transition-all duration-700"
            style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #6175f4, #10b981)' }} />
        </div>

        <div className="grid grid-cols-1 gap-1.5">
          {PENDING_TASKS.map(task => (
            <div key={task.id} className="flex items-center gap-2.5 py-1">
              <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 text-[10px] ${
                task.status === 'done'
                  ? 'bg-emerald-500/20 text-emerald-500'
                  : 'bg-amber-500/15 text-amber-500'
              }`}>
                {task.status === 'done' ? '✓' : '○'}
              </div>
              <p className={`text-xs flex-1 ${task.status === 'done' ? 'text-surface-400 line-through' : 'text-surface-600 dark:text-surface-300'}`}>
                {task.label}
              </p>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold shrink-0 ${
                task.status === 'done'
                  ? 'bg-emerald-500/15 text-emerald-500'
                  : 'bg-amber-500/15 text-amber-500'
              }`}>
                {task.status === 'done' ? 'Done' : 'Pending'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Future Improvements (Grid) ── */}
      <div className="card p-4">
        <h3 className="text-sm font-semibold text-surface-700 dark:text-surface-300 mb-4">
          🚀 কীভাবে App আরো উন্নত করা যায়
        </h3>
        <div className="grid grid-cols-1 gap-3">
          {FUTURE_FEATURES.map(f => (
            <div key={f.title} className="rounded-xl p-3.5"
              style={{ background: 'rgba(97,117,244,0.06)', border: '1px solid rgba(97,117,244,0.12)' }}>
              <div className="flex items-start gap-3">
                <span className="text-2xl shrink-0">{f.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-surface-800 dark:text-surface-100">{f.title}</p>
                  <p className="text-xs text-surface-500 dark:text-surface-400 mt-0.5 leading-relaxed">{f.desc}</p>
                  <div className="mt-2 space-y-1">
                    {f.steps.map((step, i) => (
                      <div key={i} className="flex items-start gap-1.5">
                        <span className="text-[10px] font-bold text-primary-500 shrink-0 mt-0.5">{i + 1}.</span>
                        <p className="text-[11px] text-surface-500 dark:text-surface-400">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Changelog ── */}
      <div className="card p-4">
        <h3 className="text-sm font-semibold text-surface-700 dark:text-surface-300 mb-4">📋 Changelog</h3>
        <div className="space-y-4">
          {CHANGELOG.map((release, i) => (
            <div key={release.version}>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 rounded-full text-xs font-bold"
                  style={{ backgroundColor: i === 0 ? 'rgba(97,117,244,0.15)' : 'rgba(100,116,139,0.1)', color: i === 0 ? '#6175f4' : '#94a3b8', border: `1px solid ${i === 0 ? 'rgba(97,117,244,0.3)' : 'rgba(100,116,139,0.2)'}` }}>
                  v{release.version}
                </span>
                <span className="text-xs text-surface-400">{release.date}</span>
                {i === 0 && <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-500 font-semibold">Latest</span>}
              </div>
              <div className="space-y-1 pl-2">
                {release.changes.map(ch => (
                  <div key={ch} className="flex items-start gap-2">
                    <span className="text-primary-500 text-xs mt-0.5 shrink-0">•</span>
                    <p className="text-xs text-surface-500 dark:text-surface-400">{ch}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="text-center text-xs text-surface-400">Built with ❤️ · {new Date().getFullYear()}</p>
    </div>
  );
}

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile');
  const CONTENT = { profile: ProfileSettings, categories: CategorySettings, tags: TagSettings, security: SecuritySettings, about: AboutSettings };
  const Content = CONTENT[activeTab];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-bold text-surface-900 dark:text-white">Settings</h1>
      <div className="flex flex-col sm:flex-row gap-6">
        <div className="sm:w-48 shrink-0">
          <nav className="space-y-1">
            {TABS.map(t => {
              const Icon = t.icon;
              return (
                <button key={t.id} onClick={() => setActiveTab(t.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-left transition-all ${activeTab === t.id ? 'bg-primary-600 text-white' : 'text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800'}`}>
                  <Icon size={15} /> {t.label}
                </button>
              );
            })}
          </nav>
        </div>
        <div className="flex-1 min-w-0">
          <div className="card p-6"><Content /></div>
        </div>
      </div>
    </div>
  );
}