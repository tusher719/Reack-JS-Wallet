import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, X, ChevronDown } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

// ─── Icon Registry ────────────────────────────────────────────────────────────
export const ICON_CATEGORIES = {
  'Finance & Money': [
    { name: 'Wallet',            label: 'wallet'             },
    { name: 'CreditCard',        label: 'credit card'        },
    { name: 'Banknote',          label: 'banknote cash'      },
    { name: 'Coins',             label: 'coins money'        },
    { name: 'PiggyBank',         label: 'piggy bank savings' },
    { name: 'Receipt',           label: 'receipt bill'       },
    { name: 'Landmark',          label: 'bank landmark'      },
    { name: 'BadgeDollarSign',   label: 'dollar badge'       },
    { name: 'CircleDollarSign',  label: 'dollar circle'      },
    { name: 'DollarSign',        label: 'dollar sign'        },
    { name: 'HandCoins',         label: 'hand coins payment' },
    { name: 'TrendingUp',        label: 'trending up growth' },
    { name: 'TrendingDown',      label: 'trending down loss' },
    { name: 'BarChart2',         label: 'bar chart stats'    },
    { name: 'BarChart3',         label: 'bar chart'          },
    { name: 'LineChart',         label: 'line chart graph'   },
    { name: 'PieChart',          label: 'pie chart'          },
    { name: 'Percent',           label: 'percent interest'   },
    { name: 'Calculator',        label: 'calculator math'    },
    { name: 'Briefcase',         label: 'briefcase business' },
    { name: 'Building2',         label: 'building office'    },
    { name: 'Gem',               label: 'gem diamond luxury' },
    { name: 'Crown',             label: 'crown premium'      },
  ],
  'Shopping & Retail': [
    { name: 'ShoppingCart',   label: 'shopping cart'         },
    { name: 'ShoppingBag',    label: 'shopping bag'          },
    { name: 'ShoppingBasket', label: 'shopping basket'       },
    { name: 'Store',          label: 'store shop retail'     },
    { name: 'Tag',            label: 'tag label price'       },
    { name: 'Ticket',         label: 'ticket coupon'         },
    { name: 'Package',        label: 'package delivery'      },
    { name: 'Gift',           label: 'gift present'          },
    { name: 'Shirt',          label: 'shirt clothes fashion' },
    { name: 'Watch',          label: 'watch accessories'     },
    { name: 'Glasses',        label: 'glasses eyewear'       },
  ],
  'Food & Dining': [
    { name: 'Utensils',         label: 'utensils dining'     },
    { name: 'UtensilsCrossed',  label: 'restaurant food'     },
    { name: 'Coffee',           label: 'coffee cafe drink'   },
    { name: 'Pizza',            label: 'pizza fast food'     },
    { name: 'Apple',            label: 'apple fruit healthy' },
    { name: 'Beef',             label: 'beef meat food'      },
    { name: 'Fish',             label: 'fish seafood'        },
    { name: 'Salad',            label: 'salad healthy food'  },
    { name: 'Sandwich',         label: 'sandwich lunch'      },
    { name: 'Wine',             label: 'wine drink'          },
    { name: 'Beer',             label: 'beer drink'          },
    { name: 'CupSoda',          label: 'soda drink beverage' },
    { name: 'IceCream',         label: 'ice cream dessert'   },
    { name: 'Cake',             label: 'cake birthday'       },
    { name: 'Cookie',           label: 'cookie snack'        },
    { name: 'Flame',            label: 'flame fire cooking'  },
  ],
  'Transport': [
    { name: 'Car',           label: 'car vehicle drive'      },
    { name: 'Bus',           label: 'bus public transport'   },
    { name: 'Train',         label: 'train rail commute'     },
    { name: 'Plane',         label: 'plane flight travel'    },
    { name: 'Bike',          label: 'bike bicycle'           },
    { name: 'Truck',         label: 'truck delivery'         },
    { name: 'Ship',          label: 'ship boat ferry'        },
    { name: 'Fuel',          label: 'fuel petrol gas'        },
    { name: 'ParkingCircle', label: 'parking lot'            },
    { name: 'Navigation',    label: 'navigation gps'         },
    { name: 'MapPin',        label: 'map pin location'       },
    { name: 'Route',         label: 'route direction path'   },
    { name: 'Compass',       label: 'compass direction'      },
  ],
  'Home & Bills': [
    { name: 'Home',       label: 'home house rent'           },
    { name: 'Building',   label: 'building apartment'        },
    { name: 'Hotel',      label: 'hotel accommodation'       },
    { name: 'Warehouse',  label: 'warehouse storage'         },
    { name: 'Sofa',       label: 'sofa furniture'            },
    { name: 'Lamp',       label: 'lamp electricity light'    },
    { name: 'Bath',       label: 'bath bathroom water'       },
    { name: 'BedDouble',  label: 'bed bedroom sleep'         },
    { name: 'Tv',         label: 'tv television cable'       },
    { name: 'Wifi',       label: 'wifi internet broadband'   },
    { name: 'Plug',       label: 'plug electric utility'     },
    { name: 'Wrench',     label: 'wrench repair maintenance' },
    { name: 'Hammer',     label: 'hammer construction'       },
    { name: 'Paintbrush', label: 'paint renovation'          },
    { name: 'TreePine',   label: 'tree garden outdoor'       },
  ],
  'Health & Fitness': [
    { name: 'Heart',          label: 'heart love health'     },
    { name: 'HeartPulse',     label: 'heart pulse medical'   },
    { name: 'Activity',       label: 'activity fitness'      },
    { name: 'Pill',           label: 'pill medicine drug'    },
    { name: 'Stethoscope',    label: 'stethoscope doctor'    },
    { name: 'Hospital',       label: 'hospital clinic'       },
    { name: 'Syringe',        label: 'syringe vaccine'       },
    { name: 'Thermometer',    label: 'thermometer fever'     },
    { name: 'Brain',          label: 'brain mental health'   },
    { name: 'Eye',            label: 'eye optical vision'    },
    { name: 'Smile',          label: 'smile dental teeth'    },
    { name: 'Dumbbell',       label: 'dumbbell gym workout'  },
    { name: 'PersonStanding', label: 'person fitness yoga'   },
    { name: 'Baby',           label: 'baby child care'       },
  ],
  'Education & Tech': [
    { name: 'GraduationCap', label: 'graduation school uni' },
    { name: 'BookOpen',      label: 'book open reading'     },
    { name: 'Book',          label: 'book study'            },
    { name: 'Pencil',        label: 'pencil writing school' },
    { name: 'School',        label: 'school education'      },
    { name: 'Library',       label: 'library books'         },
    { name: 'Microscope',    label: 'microscope research'   },
    { name: 'Globe',         label: 'globe world internet'  },
    { name: 'Languages',     label: 'language course'       },
    { name: 'Cpu',           label: 'cpu processor tech'    },
    { name: 'Monitor',       label: 'monitor computer'      },
    { name: 'Laptop',        label: 'laptop notebook'       },
    { name: 'Smartphone',    label: 'smartphone phone'      },
    { name: 'Tablet',        label: 'tablet ipad'           },
    { name: 'Headphones',    label: 'headphones audio music'},
    { name: 'Gamepad2',      label: 'gamepad gaming'        },
  ],
  'Work & Office': [
    { name: 'Presentation', label: 'presentation slides'    },
    { name: 'FileText',     label: 'file document report'   },
    { name: 'FolderOpen',   label: 'folder files'           },
    { name: 'Printer',      label: 'printer office'         },
    { name: 'Phone',        label: 'phone call'             },
    { name: 'Mail',         label: 'mail email'             },
    { name: 'Calendar',     label: 'calendar schedule'      },
    { name: 'Clock',        label: 'clock time'             },
    { name: 'Timer',        label: 'timer countdown'        },
    { name: 'Target',       label: 'target goal'            },
    { name: 'Lightbulb',    label: 'lightbulb idea'         },
    { name: 'Rocket',       label: 'rocket startup launch'  },
    { name: 'Zap',          label: 'zap energy fast'        },
  ],
  'Nature & Environment': [
    { name: 'Leaf',      label: 'leaf nature green eco'     },
    { name: 'Flower2',   label: 'flower garden nature'      },
    { name: 'Sun',       label: 'sun solar energy'          },
    { name: 'Moon',      label: 'moon night'                },
    { name: 'Cloud',     label: 'cloud weather'             },
    { name: 'Umbrella',  label: 'umbrella rain weather'     },
    { name: 'Droplets',  label: 'droplets water'            },
    { name: 'Wind',      label: 'wind air'                  },
    { name: 'Snowflake', label: 'snowflake winter cold'     },
    { name: 'Mountain',  label: 'mountain travel hiking'    },
    { name: 'Sprout',    label: 'sprout growth plant'       },
    { name: 'Globe2',    label: 'globe world earth'         },
  ],
  'General & Other': [
    { name: 'Star',      label: 'star favorite rating'      },
    { name: 'Shield',    label: 'shield security insurance' },
    { name: 'Lock',      label: 'lock security safe'        },
    { name: 'Key',       label: 'key access unlock'         },
    { name: 'Bell',      label: 'bell notification alert'   },
    { name: 'Settings',  label: 'settings gear config'      },
    { name: 'User',      label: 'user person account'       },
    { name: 'Users',     label: 'users group family'        },
    { name: 'Dog',       label: 'dog pet animal'            },
    { name: 'Cat',       label: 'cat pet animal'            },
    { name: 'Music',     label: 'music song entertainment'  },
    { name: 'Camera',    label: 'camera photo'              },
    { name: 'Palette',   label: 'palette art color'         },
    { name: 'Sparkles',  label: 'sparkles special premium'  },
    { name: 'Flag',      label: 'flag country goal'         },
    { name: 'Map',       label: 'map location travel'       },
  ],
};

// Flat list for search
export const ALL_ICONS = Object.entries(ICON_CATEGORIES).flatMap(([cat, icons]) =>
  icons.map(i => ({ ...i, category: cat }))
);

// Render a single lucide icon by name
export const LucideIcon = ({ name, size = 18, className = '', style }) => {
  const Comp = LucideIcons[name];
  if (!Comp) return null;
  return <Comp size={size} className={className} style={style} />;
};

// ─── IconPicker Component ────────────────────────────────────────────────────
const IconPicker = ({ value, onChange, label = 'Icon', placeholder = 'Select icon' }) => {
  const [open, setOpen]   = useState(false);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const wrapRef  = useRef(null);
  const searchRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Focus search when opens
  useEffect(() => {
    if (open) setTimeout(() => searchRef.current?.focus(), 60);
  }, [open]);

  const categories = ['All', ...Object.keys(ICON_CATEGORIES)];

  const filtered = useMemo(() => {
    let list = ALL_ICONS;
    if (activeCategory !== 'All') {
      list = list.filter(i => i.category === activeCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(i => i.label.includes(q) || i.name.toLowerCase().includes(q));
    }
    return list;
  }, [search, activeCategory]);

  const handleSelect = (iconName) => {
    onChange(iconName);
    setOpen(false);
    setSearch('');
  };

  const SelectedIcon = value ? LucideIcons[value] : null;

  return (
    <div className="relative" ref={wrapRef}>
      {label && <label className="label">{label}</label>}

      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="input flex items-center gap-3 cursor-pointer hover:border-primary-500 transition-colors w-full"
      >
        <div className="w-7 h-7 rounded-lg bg-[var(--bg3)] flex items-center justify-center shrink-0">
          {SelectedIcon
            ? <SelectedIcon size={16} className="text-[var(--text)]" />
            : <span className="text-[var(--text3)] text-xs">?</span>
          }
        </div>
        <span className="flex-1 text-left text-sm text-[var(--text2)]">
          {value ? value : placeholder}
        </span>
        <ChevronDown size={15} className={`text-[var(--text3)] transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Popup */}
      {open && (
        <div
          className="absolute top-full left-0 mt-2 z-[100] rounded-2xl shadow-modal border border-[var(--border)] bg-gray-600 overflow-hidden animate-scale-in"
          style={{
            width: '330px',
            maxWidth: 'calc(100vw - 32px)',
          }}
        >
          {/* Search bar */}
          <div className="p-3 border-b border-[var(--border)]" style={{ backgroundColor: 'var(--bg2)' }}>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text3)]" />
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={e => { setSearch(e.target.value); setActiveCategory('All'); }}
                placeholder="Search icons… wallet, food, car, health…"
                className="input pl-8 pr-8 py-2 text-sm"
                style={{ backgroundColor: 'var(--bg3)' }}
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text3)] hover:text-[var(--text)]">
                  <X size={13} />
                </button>
              )}
            </div>
          </div>

          {/* Category tabs — scrollable */}
          {!search && (
            <div
              className="flex gap-1 px-2 py-2 overflow-x-auto border-b border-[var(--border)]"
              style={{ backgroundColor: 'var(--bg2)' }}
            >
              {categories.map(cat => {
                const shortLabel = cat === 'All' ? 'All'
                  : cat === 'Finance & Money' ? 'Finance'
                  : cat === 'Shopping & Retail' ? 'Shopping'
                  : cat === 'Food & Dining' ? 'Food'
                  : cat === 'Home & Bills' ? 'Home'
                  : cat === 'Health & Fitness' ? 'Health'
                  : cat === 'Education & Tech' ? 'Edu/Tech'
                  : cat === 'Work & Office' ? 'Work'
                  : cat === 'Nature & Environment' ? 'Nature'
                  : cat === 'General & Other' ? 'Other'
                  : cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategory(cat)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                      activeCategory === cat
                        ? 'bg-primary-600 text-white'
                        : 'text-[var(--text2)] hover:bg-[var(--bg3)]'
                    }`}
                  >
                    {shortLabel}
                  </button>
                );
              })}
            </div>
          )}

          {/* Icon grid */}
          <div
            className="overflow-y-auto p-2"
            style={{ maxHeight: '240px', backgroundColor: 'var(--bg2)' }}
          >
            {filtered.length === 0 ? (
              <div className="py-8 text-center" style={{ backgroundColor: 'var(--bg2)' }}>
                <p className="text-sm text-[var(--text3)]">No icons found for "{search}"</p>
                <p className="text-xs text-[var(--text3)] mt-1">Try: wallet, food, car, health…</p>
              </div>
            ) : (
              <div className="grid grid-cols-8 gap-0.5">
                {filtered.map((item) => {
                  const Comp = LucideIcons[item.name];
                  if (!Comp) return null;
                  const isSelected = value === item.name;
                  return (
                    <button
                      key={item.name}
                      type="button"
                      title={item.name}
                      onClick={() => handleSelect(item.name)}
                      className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all hover:scale-110 active:scale-95 ${
                        isSelected
                          ? 'bg-primary-600 text-white shadow-glow'
                          : 'text-[var(--text2)] hover:bg-[var(--bg3)] hover:text-[var(--text)]'
                      }`}
                    >
                      <Comp size={18} />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer count */}
          <div
            className="px-3 py-2 border-t border-[var(--border)] flex items-center justify-between"
            style={{ backgroundColor: 'var(--bg2)' }}
          >
            <p className="text-xs text-[var(--text3)]">{filtered.length} icons</p>
            {value && (
              <p className="text-xs text-primary-500 font-medium">Selected: {value}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default IconPicker;