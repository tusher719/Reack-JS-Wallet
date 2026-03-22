// ─── WalletOS Version Config ──────────────────────────────────────────────────
// Convention:
//   MAJOR.MINOR.PATCH
//   MAJOR → বড় feature বা redesign
//   MINOR → নতুন feature যোগ
//   PATCH → bug fix, small UI tweak
//
// Example: bug fix হলে 1.0.0 → 1.0.1
//          নতুন feature হলে 1.0.1 → 1.1.0
//          বড় redesign হলে 1.1.0 → 2.0.0

export const APP_VERSION = '1.1.0';
export const BUILD_DATE  = 'March 2026';

export const CHANGELOG = [
  {
    version: '1.1.0',
    date: 'March 2026',
    changes: [
      'Calculator popup — amount input click করলে popup খোলে',
      'Live account balance modal-এর ভেতরে real-time দেখায়',
      'Amount input redesign — sign badge, right-aligned number',
      'Calculator bugs fix (double operator, post-= behavior)',
      'Tab-wise accent color সব UI-তে',
    ],
  },
  {
    version: '1.0.0',
    date: 'March 2026',
    changes: [
      'LucideIcon style prop fix — icon color কাজ করে',
      'Category dropdown — icon + search + nested indent',
      'Tags dropdown — search সহ multi-select',
      'Status dropdown — icon সহ Cleared/Uncleared/Reconciled',
      'Payer input field যোগ',
      '"Add Record" + "Another Record" button',
      'LocalStorage-এ Account/Category/Status persist',
      'Add করার পর Amount/Note/Payer/Tags blank হয়',
      'Income/Expense/Transfer tab color theming',
      'Seeder re-run করলে পুরনো data clean হয়',
      'ESLint warnings fix',
      'Settings → About tab',
    ],
  },
];