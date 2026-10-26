import { useEffect, useState } from 'react';
import AuthPanel from './AuthPanel';
import { AccountDashboard, ProDashboard } from './AccountPages';
import {
  Search,
  Sparkles,
  FileText,
  Scissors,
  Image,
  BriefcaseBusiness,
  GraduationCap,
  Calculator,
  Code2,
  ArrowUpRight,
  Zap,
  ShieldCheck,
  Cloud,
  Menu,
  X,
  Crown,
  ChevronRight,
  Wrench,
  Globe,
  Layers,
  Heart,
  Check,
} from 'lucide-react';
import './App.css';
import InfoPage from './InfoPage';
import AIWritingAssistant from './AIWritingAssistant';
import AISummarizer from './AISummarizer';
import AITranslator from './AITranslator';
import AIImageGenerator from './AIImageGenerator';
import ImageCompressor from './ImageCompressor';
import PDFMerger from './PDFMerger';
import PDFSplitter from './PDFSplitter';
import ImageResizer from './ImageResizer';
import ImageConverter from './ImageConverter';
import PDFToImage from './PDFToImage';
import ImageToPDF from './ImageToPDF';
import WordToPDF from './WordToPDF';
import PDFToWord from './PDFToWord';
import ExcelToPDF from './ExcelToPDF';

const categories = [
  { name: 'All Tools', icon: Layers },
  { name: 'AI Tools', icon: Sparkles },
  { name: 'PDF & Documents', icon: FileText },
  { name: 'Image Tools', icon: Image },
  { name: 'Business', icon: BriefcaseBusiness },
  { name: 'Education', icon: GraduationCap },
  { name: 'Calculators', icon: Calculator },
];

const tools = [
  {
    name: 'AI Summarizer',
    description: 'Turn long text into clear, useful summaries with AI.',
    category: 'AI Tools',
    icon: FileText,
    color: 'violet',
    tag: 'NEW',
    premium: true,
  },
  {
    name: 'AI Writing Assistant',
    description: 'Write, improve, and refine your text with AI.',
    category: 'AI Tools',
    icon: Sparkles,
    color: 'violet',
    tag: 'POPULAR',
    premium: true,
  },
  {
    name: 'PDF Toolkit',
    description: 'Organise and manage your PDF documents.',
    category: 'PDF & Documents',
    icon: FileText,
    color: 'blue',
    tag: 'ESSENTIAL',
    premium: false,
  },
  {
    name: 'PDF to Image',
    description: 'Convert PDF pages into downloadable PNG or JPG images.',
    category: 'PDF & Documents',
    icon: Image,
    color: 'violet',
    tag: 'NEW',
    premium: false,
  },
  {
    name: 'PDF Splitter',
    description: 'Extract pages or split PDFs into separate files.',
    category: 'PDF & Documents',
    icon: Scissors,
    color: 'violet',
    tag: 'NEW',
    premium: false,
  },
  {
    name: 'Word to PDF',
    description: 'Convert Word documents into downloadable PDF files.',
    category: 'PDF & Documents',
    icon: FileText,
    color: 'blue',
    tag: 'NEW',
    premium: false,
  },
  {
    name: 'PDF to Word',
    description: 'Convert PDF text into an editable Word document.',
    category: 'PDF & Documents',
    icon: FileText,
    color: 'blue',
    tag: 'NEW',
    premium: false,
  },
  {
    name: 'Excel to PDF',
    description: 'Convert Excel spreadsheets and CSV files into PDF documents.',
    category: 'PDF & Documents',
    icon: FileText,
    color: 'blue',
    tag: 'NEW',
    premium: false,
  },
  {
    name: 'Image to PDF',
    description: 'Combine multiple JPG and PNG images into one PDF.',
    category: 'PDF & Documents',
    icon: FileText,
    color: 'violet',
    tag: 'NEW',
    premium: false,
  },
  {
    name: 'Image Resizer',
    description: 'Resize images to custom dimensions and formats.',
    category: 'Image Tools',
    icon: Image,
    color: 'violet',
    tag: 'NEW',
    premium: false,
  },
  {
    name: 'Image Converter',
    description: 'Convert images between PNG, JPG, and WebP.',
    category: 'Image Tools',
    icon: Image,
    color: 'blue',
    tag: 'NEW',
    premium: false,
  },
  {
    name: 'Image Compressor',
    description: 'Reduce image file sizes while preserving quality.',
    category: 'Image Tools',
    icon: Image,
    color: 'pink',
    tag: null,
    premium: false,
  },
  {
    name: 'Invoice Generator',
    description: 'Create professional invoices for your business.',
    category: 'Business',
    icon: BriefcaseBusiness,
    color: 'green',
    tag: 'BUSINESS',
    premium: false,
  },
  {
    name: 'Grade Calculator',
    description: 'Calculate grades and track academic results.',
    category: 'Education',
    icon: GraduationCap,
    color: 'orange',
    tag: null,
    premium: false,
  },
  {
    name: 'Profit Calculator',
    description: 'Calculate costs, revenue, and profit margins.',
    category: 'Calculators',
    icon: Calculator,
    color: 'cyan',
    tag: null,
    premium: false,
  },
  {
    name: 'CV Builder',
    description: 'Create a professional CV for your next opportunity.',
    category: 'Business',
    icon: FileText,
    color: 'blue',
    tag: 'CAREER',
    premium: true,
  },
  {
    name: 'AI Image Generator',
    description: 'Turn your ideas into original AI-generated images.',
    category: 'AI Tools',
    icon: Image,
    color: 'violet',
    tag: 'NEW',
    premium: true,
  },
  {
    name: 'AI Translator',
    description: 'Translate text and communicate across languages.',
    category: 'AI Tools',
    icon: Globe,
    color: 'violet',
    tag: null,
    premium: true,
  },
];

function App() {
  const [activeCategory, setActiveCategory] = useState('All Tools');
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [notice, setNotice] = useState('');
  const [activeTool, setActiveTool] = useState(null);
  const [activePage, setActivePage] = useState('discover');
  const [accountDetails, setAccountDetails] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);
  const [subscriptionError, setSubscriptionError] = useState('');
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('zanahub_user') || 'null');
    } catch {
      return null;
    }
  });

  useEffect(() => {
    function syncAuth() {
      try {
        setCurrentUser(
          JSON.parse(localStorage.getItem('zanahub_user') || 'null')
        );
      } catch {
        setCurrentUser(null);
      }
    }

    window.addEventListener('zanahub-auth-changed', syncAuth);
    return () => {
      window.removeEventListener('zanahub-auth-changed', syncAuth);
    };
  }, []);

  function logout() {
    localStorage.removeItem('zanahub_token');
    localStorage.removeItem('zanahub_user');
    setCurrentUser(null);
  }

  useEffect(() => {
    let cancelled = false;

    async function loadAccount() {
      if (!currentUser) {
        setAccountDetails(null);
        setSubscription(null);
        setSubscriptionError('');
        setSubscriptionLoading(false);
        return;
      }

      const token = localStorage.getItem('zanahub_token');
      if (!token) {
        setAccountDetails(null);
        setSubscription(null);
        setSubscriptionError('Please sign in again to load your account details.');
        setSubscriptionLoading(false);
        return;
      }

      setSubscriptionLoading(true);
      setSubscriptionError('');

      try {
        const apiBase =
          import.meta.env.VITE_API_URL ||
          `${window.location.protocol}//${window.location.hostname}:3001`;

        const response = await fetch(`${apiBase}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Could not load account details.');
        }

        if (!cancelled) {
          setAccountDetails(data.user || null);
          setSubscription(data.subscription || { plan: 'free', status: 'active' });
        }
      } catch (error) {
        if (!cancelled) {
          setAccountDetails(null);
          setSubscription(null);
          setSubscriptionError(
            error.message || 'Could not connect to the account service.'
          );
        }
      } finally {
        if (!cancelled) setSubscriptionLoading(false);
      }
    }

    loadAccount();
    return () => {
      cancelled = true;
    };
  }, [currentUser?.id]);

  const filteredTools = tools.filter((tool) => {
    const matchesCategory =
      activeCategory === 'All Tools' || tool.category === activeCategory;

    const matchesSearch =
      tool.name.toLowerCase().includes(search.toLowerCase()) ||
      tool.description.toLowerCase().includes(search.toLowerCase()) ||
      tool.category.toLowerCase().includes(search.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  function openTool(tool) {
    // Premium tools require a verified, active Pro subscription.
    if (tool.premium) {
      if (!currentUser || !localStorage.getItem('zanahub_token')) {
        setActiveTool(null);
        setNotice('Please sign in to access ZanaHub Pro tools.');
        setActivePage('pro');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      if (subscriptionLoading) {
        setNotice('Checking your ZanaHub Pro subscription. Please try again in a moment.');
        return;
      }

      if (subscriptionError || !subscription || subscription.plan !== 'pro') {
        setActiveTool(null);
        setNotice('This tool requires ZanaHub Pro. Upgrade to unlock premium AI tools.');
        setActivePage('pro');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }

    if (tool.name === 'AI Image Generator') {
      setNotice('');
      setActiveTool('AI Image Generator');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (tool.name === 'AI Translator') {
      setNotice('');
      setActiveTool('AI Translator');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (tool.name === 'AI Summarizer') {
      setNotice('');
      setActiveTool('AI Summarizer');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (tool.name === 'AI Writing Assistant') {
      setNotice('');
      setActiveTool('AI Writing Assistant');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (tool.name === 'Image Resizer') {
      setNotice('');
      setActiveTool('Image Resizer');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (tool.name === 'Image Converter') {
      setNotice('');
      setActiveTool('Image Converter');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (tool.name === 'Image Compressor') {
      setNotice('');
      setActiveTool('Image Compressor');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (tool.name === 'Excel to PDF') {
      setNotice('');
      setActiveTool('Excel to PDF');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (tool.name === 'PDF to Word') {
      setNotice('');
      setActiveTool('PDF to Word');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (tool.name === 'Word to PDF') {
      setNotice('');
      setActiveTool('Word to PDF');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (tool.name === 'Image to PDF') {
      setNotice('');
      setActiveTool('Image to PDF');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (tool.name === 'PDF to Image') {
      setActiveTool('PDF to Image');
      return;
    }

    if (tool.name === 'PDF Splitter') {
      setNotice('');
      setActiveTool('PDF Splitter');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (tool.name === 'PDF Toolkit' || tool.name === 'PDF Merger') {
      setNotice('');
      setActiveTool('PDF Merger');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setNotice(
      `${tool.name} selected. We will build this tool in a future development step.`,
    );
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${menuOpen ? 'sidebar-open' : ''}`}>
        <a className="brand" href="#home" onClick={() => setMenuOpen(false)}>
          <span className="brand-mark">
            <Wrench size={23} strokeWidth={2.4} />
          </span>
          <span className="brand-name">
            zana<span>hub</span>
            <small>YOUR DIGITAL WORKSPACE</small>
          </span>
        </a>

        <div className="sidebar-label">WORKSPACE</div>

        <nav className="category-nav" aria-label="Tool categories">
          {categories.map((category) => {
            const Icon = category.icon;
            const active = activeCategory === category.name;

            return (
              <button
                key={category.name}
                className={`category-link ${active ? 'active' : ''}`}
                onClick={() => {
                  setActiveCategory(category.name);
                  setMenuOpen(false);
                }}
              >
                <Icon size={18} />
                <span>{category.name}</span>
                {active && <span className="active-dot" />}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-divider" />

        <div className="sidebar-label">YOUR ACCOUNT</div>

        <button
          className="category-link"
          onClick={() => {
            setActivePage('account');
            setMenuOpen(false);
            setNotice('');
          }}
        >
          <Cloud size={18} />
          <span>My Workspace</span>
        </button>

        <button
          className="category-link"
          onClick={() => setNotice('Your saved tools feature is coming soon.')}
        >
          <Heart size={18} />
          <span>Saved Tools</span>
        </button>

        <div className="sidebar-bottom">
          <div className="sidebar-glow" />
          <div className="mini-crown">
            <Crown size={21} />
          </div>
          <h3>Unlock more with Pro</h3>
          <p>Get access to premium tools and unlock your productivity.</p>
          <button
            className="upgrade-button"
            onClick={() => {
              setActivePage('pro');
              setMenuOpen(false);
              setNotice('');
            }}
          >
            Explore Pro <ArrowUpRight size={16} />
          </button>
          <div className="sidebar-version">ZANAHUB · VERSION 0.1</div>
        </div>
      </aside>

      {menuOpen && (
        <button
          className="mobile-overlay"
          aria-label="Close menu"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <main className="main-content" id="home">
        <header className="topbar">
          <button
            className="mobile-menu-button"
            aria-label="Toggle navigation"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          <div className="breadcrumb">
            Workspace <ChevronRight size={15} /> <span>Discover Tools</span>
          </div>

          <div className="topbar-right">
            <div className="status-indicator">
              <span /> All systems ready
            </div>
            {currentUser ? (
              <div className="account-area">
                <div className="account-name">
                  <div className="avatar">
                    {(currentUser.name || currentUser.email || 'U')
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                  <span>{currentUser.name || currentUser.email}</span>
                </div>
                <button className="signout-button" onClick={logout}>
                  Sign out
                </button>
              </div>
            ) : (
              <AuthPanel />
            )}
          </div>
        </header>

        <div className="page-content">
          {['about', 'contact', 'privacy', 'terms'].includes(activePage) ? (
            <InfoPage
              page={activePage}
              onBack={() => {
                setActivePage('discover');
                setActiveTool(null);
              }}
              onNavigate={(page) => {
                setActivePage(page);
                setActiveTool(null);
              }}
            />
          ) : activePage === 'account' ? (
            <AccountDashboard
              currentUser={currentUser}
              accountDetails={accountDetails}
              subscription={subscription}
              loading={subscriptionLoading}
              error={subscriptionError}
              onBack={() => setActivePage('discover')}
              onUpgrade={() => setActivePage('pro')}
            />
          ) : activePage === 'pro' ? (
            <ProDashboard
              subscription={subscription}
              loading={subscriptionLoading}
              error={subscriptionError}
              onBack={() => setActivePage('discover')}
            />
          ) : activeTool === 'AI Image Generator' ? (
            <AIImageGenerator onBack={() => setActiveTool(null)} />
          ) : activeTool === 'AI Translator' ? (
            <AITranslator onBack={() => setActiveTool(null)} />
          ) : activeTool === 'AI Summarizer' ? (
            <AISummarizer onBack={() => setActiveTool(null)} />
          ) : activeTool === 'AI Writing Assistant' ? (
            <AIWritingAssistant onBack={() => setActiveTool(null)} />
          ) : activeTool === 'Excel to PDF' ? (
            <ExcelToPDF onBack={() => setActiveTool(null)} />
          ) : activeTool === 'PDF to Word' ? (
            <PDFToWord onBack={() => setActiveTool(null)} />
          ) : activeTool === 'Word to PDF' ? (
            <WordToPDF onBack={() => setActiveTool(null)} />
          ) : activeTool === 'Image to PDF' ? (
            <ImageToPDF onBack={() => setActiveTool(null)} />
          ) : activeTool === 'PDF to Image' ? (
            <PDFToImage onBack={() => setActiveTool(null)} />
          ) : activeTool === 'Image Converter' ? (
            <ImageConverter onBack={() => setActiveTool(null)} />
          ) : activeTool === 'Image Resizer' ? (
            <ImageResizer onBack={() => setActiveTool(null)} />
          ) : activeTool === 'PDF Merger' ? (
            <PDFMerger onBack={() => setActiveTool(null)} />
          ) : activeTool === 'PDF Splitter' ? (
            <PDFSplitter onBack={() => setActiveTool(null)} />
          ) : activeTool === 'Image Compressor' ? (
            <ImageCompressor onBack={() => setActiveTool(null)} />
          ) : (
          <>

          <section className="hero">
            <div className="hero-orb orb-one" />
            <div className="hero-orb orb-two" />
            <div className="hero-grid" />

            <div className="hero-content">
              <div className="eyebrow">
                <Sparkles size={14} />
                <span>YOUR ALL-IN-ONE DIGITAL TOOLBOX</span>
              </div>

              <h1>
                Everything you need.
                <br />
                <span>One powerful hub.</span>
              </h1>

              <p className="hero-description">
                Work smarter with tools built for your ideas, your business,
                and your everyday life.
              </p>

              <div className="hero-search">
                <Search size={20} />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="What do you want to accomplish today?"
                  aria-label="Search tools"
                />
                <kbd>SEARCH</kbd>
              </div>

              <div className="hero-footnote">
                <span><Check size={14} /> Simple to use</span>
                <span><Check size={14} /> Built for everyone</span>
                <span><Check size={14} /> Made to save time</span>
              </div>
            </div>

            <div className="hero-decoration" aria-hidden="true">
              <div className="decoration-ring ring-one" />
              <div className="decoration-ring ring-two" />
              <div className="decoration-core">
                <Zap size={36} fill="currentColor" />
              </div>
              <div className="floating-card floating-card-top">
                <Sparkles size={17} />
                <span>Work smarter</span>
              </div>
              <div className="floating-card floating-card-bottom">
                <Layers size={17} />
                <span>All in one place</span>
              </div>
            </div>
          </section>

          {notice && (
            <div className="notice" role="status">
              <span>{notice}</span>
              <button aria-label="Dismiss message" onClick={() => setNotice('')}>
                <X size={17} />
              </button>
            </div>
          )}

          <section className="stats-row" aria-label="Platform highlights">
            <div className="stat-item">
              <div className="stat-icon stat-violet"><Layers size={19} /></div>
              <div><strong>All in one</strong><span>Your digital workspace</span></div>
            </div>
            <div className="stat-item">
              <div className="stat-icon stat-blue"><Zap size={19} /></div>
              <div><strong>Work smarter</strong><span>Save time every day</span></div>
            </div>
            <div className="stat-item">
              <div className="stat-icon stat-green"><ShieldCheck size={19} /></div>
              <div><strong>Built for you</strong><span>Simple and accessible</span></div>
            </div>
          </section>

          <section className="tools-section" id="tools">
            <div className="section-heading">
              <div>
                <div className="section-kicker">THE TOOLBOX</div>
                <h2>Explore your tools <span className="heading-period">.</span></h2>
                <p>Find the right tool for whatever you're working on.</p>
              </div>
              <div className="tool-count">
                <span>{filteredTools.length.toString().padStart(2, '0')}</span>
                TOOLS SHOWN
              </div>
            </div>

            <div className="mobile-categories">
              {categories.map((category) => (
                <button
                  key={category.name}
                  className={activeCategory === category.name ? 'active' : ''}
                  onClick={() => setActiveCategory(category.name)}
                >
                  {category.name}
                </button>
              ))}
            </div>

            <div className="tools-grid">
              {filteredTools.map((tool) => {
                const Icon = tool.icon;

                return (
                  <article className="tool-card" key={tool.name}>
                    <div className="card-top">
                      <div className={`tool-icon icon-${tool.color}`}>
                        <Icon size={22} />
                      </div>
                      {tool.tag && <span className="tool-tag">{tool.tag}</span>}
                    </div>

                    <h3>{tool.name}</h3>
                    <p>{tool.description}</p>

                    <div className="card-bottom">
                      <span className="tool-category">{tool.category}</span>
                      <button
                        className="open-tool"
                        aria-label={`Open ${tool.name}`}
                        onClick={() => openTool(tool)}
                      >
                        <ArrowUpRight size={19} />
                      </button>
                    </div>

                    {tool.premium && (
                      <span
                        className="premium-indicator"
                        title="Requires ZanaHub Pro"
                        aria-label="Requires ZanaHub Pro"
                      >
                        <Crown size={12} />
                      </span>
                    )}
                  </article>
                );
              })}
            </div>

            {filteredTools.length === 0 && (
              <div className="empty-state">
                <Search size={30} />
                <h3>No tools found</h3>
                <p>Try another search or choose a different category.</p>
                <button
                  onClick={() => {
                    setSearch('');
                    setActiveCategory('All Tools');
                  }}
                >
                  Show all tools
                </button>
              </div>
            )}
          </section>

          <section className="premium-banner">
            <div className="premium-art">
              <div className="premium-art-ring" />
              <Sparkles size={39} />
            </div>
            <div className="premium-copy">
              <div className="premium-eyebrow">
                <Heart size={13} /> WELCOME TO ZANAHUB
              </div>
              <h2>Useful tools. <span>One free hub.</span></h2>
              <p>Explore our growing collection of tools for everyday tasks.</p>
            </div>
            <div className="premium-action">
              <button
                onClick={() => {
                  setActivePage('discover');
                  setActiveTool(null);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                Explore tools <ArrowUpRight size={17} />
              </button>
            </div>
          </section>

          <footer className="footer">
            <a
              className="footer-brand"
              href="#home"
              onClick={() => {
                setActivePage('discover');
                setActiveTool(null);
              }}
            >
              zana<span>hub</span>
            </a>
            <span>Tools for your everyday possibilities.</span>
            <nav className="footer-links" aria-label="Information pages">
              <button onClick={() => { setActivePage('about'); setActiveTool(null); }}>About Us</button>
              <button onClick={() => { setActivePage('contact'); setActiveTool(null); }}>Contact</button>
              <button onClick={() => { setActivePage('privacy'); setActiveTool(null); }}>Privacy Policy</button>
              <button onClick={() => { setActivePage('terms'); setActiveTool(null); }}>Terms</button>
            </nav>
            <span>© {new Date().getFullYear()} ZanaHub</span>
          </footer>
          </>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
