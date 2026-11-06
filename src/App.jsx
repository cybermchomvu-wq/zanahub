import { useEffect, useRef, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { App as CapacitorApp } from '@capacitor/app';
import AuthPanel from './AuthPanel';
import { AccountDashboard } from './AccountPages';
import Workspace from './Workspace';
import {
  Search,
  MessageCircle,
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
  Film,
  Palette,
} from 'lucide-react';
import './App.css';
import VisitorCounter from './VisitorCounter';
import InfoPage from './InfoPage';
import AIChatbot from './AIChatbot';
import MathMaster from './MathMaster';
import AIWritingAssistant from './AIWritingAssistant';
import AISummarizer from './AISummarizer';
import AITranslator from './AITranslator';
import AIImageGenerator from './AIImageGenerator';
import ImageCompressor from './ImageCompressor';
import BackgroundRemover from './BackgroundRemover';
import PDFMerger from './PDFMerger';
import PDFSplitter from './PDFSplitter';
import ImageResizer from './ImageResizer';
import AIImageUpscaler from './AIImageUpscaler';
import ImageConverter from './ImageConverter';
import WebMToMP4 from './WebMToMP4';
import PassportPhotoMaker from './PassportPhotoMaker';
import PDFToImage from './PDFToImage';
import ImageToPDF from './ImageToPDF';
import WordToPDF from './WordToPDF';
import PDFToWord from './PDFToWord';
import ExcelToPDF from './ExcelToPDF';
import InvoiceGenerator from './InvoiceGenerator';
import ReceiptGenerator from './ReceiptGenerator';
import CurrencyExchange from './CurrencyExchange';
import CVBuilder from './CVBuilder';
import GPACalculator from './GPACalculator';
import ScientificCalculator from './ScientificCalculator';
import ProfitCalculator from './ProfitCalculator';
import NotesGenerator from './NotesGenerator';
import JSONFormatter from './JSONFormatter';
import ColorPaletteGenerator from './ColorPaletteGenerator';
import LogoMaker from './LogoMaker';
import AICodeExplainer from './AICodeExplainer';
import AIBugFinder from './AIBugFinder';
import CodePlayground from './CodePlayground';
import './mobile-responsive.css';

const categories = [
  { name: 'Home', icon: Zap },
  { name: 'All Tools', icon: Layers },
  { name: 'AI Tools', icon: Sparkles },
  { name: 'PDF & Documents', icon: FileText },
  { name: 'Image Tools', icon: Image },
  { name: 'Business', icon: BriefcaseBusiness },
  { name: 'Education', icon: GraduationCap },
  { name: 'Calculators', icon: Calculator },
  { name: 'Coding Tools', icon: Code2 },
  { name: 'Graphic Design', icon: Palette },
];

const tools = [
  {
    name: 'MathMaster',
    description: 'Solve mathematics questions with detailed AI-powered steps and explanations.',
    category: 'Education',
    icon: Calculator,
    color: 'violet',
    tag: 'AI',
    premium: false,
  },
  {
    name: 'AI Chatbot',
    description: 'Chat with AI, ask questions, and explore ideas.',
    category: 'AI Tools',
    icon: MessageCircle,
    color: 'violet',
    tag: 'NEW',
    premium: false,
  },
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
    name: 'Passport Photo Maker',
    description: 'Crop, size, and prepare passport-style photos.',
    category: 'Image Tools',
    icon: Image,
    color: 'violet',
    tag: 'NEW',
    premium: false,
  },
  {
    name: 'AI Image Upscaler',
    description: 'Enlarge images 2× or 4× with high-quality browser processing.',
    category: 'Image Tools',
    icon: Image,
    color: 'violet',
    tag: 'FREE',
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
    name: 'WebM to MP4',
    description: 'Convert WebM videos into compatible MP4 video files.',
    category: 'Image Tools',
    icon: Film,
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
    name: 'Background Remover',
    description: 'Remove image backgrounds with AI and download transparent PNGs.',
    category: 'Image Tools',
    icon: Image,
    color: 'violet',
    tag: 'NEW',
    premium: false,
  },
  {
    name: 'Currency Exchange',
    description: 'Convert between world currencies using online exchange rates.',
    category: 'Business',
    icon: Globe,
    color: 'green',
    tag: 'NEW',
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
    name: 'Receipt Generator',
    description: 'Create and download professional payment receipts.',
    category: 'Business',
    icon: FileText,
    color: 'green',
    tag: 'NEW',
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
    name: 'Scientific Calculator',
    description: 'Calculate with trigonometry, powers, roots, logarithms, and more.',
    category: 'Calculators',
    icon: Calculator,
    color: 'purple',
    tag: 'NEW',
    premium: false,
  },
  {
    name: 'Notes Generator',
    description: 'Generate, edit, save, and print AI-powered study notes.',
    category: 'Education',
    icon: GraduationCap,
    color: 'orange',
    tag: 'NEW',
    premium: false,
  },

  {
    name: 'GPA Calculator',
    description: 'Calculate GPA using subjects, grades, and credit units.',
    category: 'Education',
    icon: GraduationCap,
    color: 'orange',
    tag: 'NEW',
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
  {
    name: 'JSON Formatter',
    description: 'Format, validate, and minify JSON data.',
    category: 'Coding Tools',
    icon: Code2,
    color: 'cyan',
    tag: 'NEW',
    premium: false,
  },
  {
    name: 'Logo Maker',
    description: 'Design custom logos and download them as PNG or SVG.',
    category: 'Graphic Design',
    icon: Palette,
    color: 'violet',
    tag: 'NEW',
    premium: false,
  },
  {
    name: 'Color Palette Generator',
    description: 'Generate, customize, and export beautiful color palettes.',
    category: 'Graphic Design',
    icon: Palette,
    color: 'violet',
    tag: 'NEW',
    premium: false,
  },
  {
    name: 'Code Playground',
    description: 'Write HTML, CSS, and JavaScript with a live preview.',
    category: 'Coding Tools',
    icon: Code2,
    color: 'cyan',
    tag: 'NEW',
    premium: false,
  },
  {
    name: 'AI Code Explainer',
    description: 'Understand code with clear, AI-powered explanations.',
    category: 'Coding Tools',
    icon: Code2,
    color: 'violet',
    tag: 'AI',
    premium: false,
  },
  {
    name: 'AI Bug Finder',
    description: 'Find potential code errors and get suggested fixes with AI.',
    category: 'Coding Tools',
    icon: Code2,
    color: 'red',
    tag: 'AI',
    premium: false,
  },
];


const routableTools = new Set([
  'MathMaster',
  'AI Chatbot',
  'AI Summarizer',
  'AI Writing Assistant',
  'AI Image Generator',
  'AI Translator',
  'AI Bug Finder',
  'AI Code Explainer',
  'Code Playground',
  'Logo Maker',
  'Color Palette Generator',
  'JSON Formatter',
  'Passport Photo Maker',
  'Profit Calculator',
  'Scientific Calculator',
  'Notes Generator',
  'GPA Calculator',
  'CV Builder',
  'Currency Exchange',
  'Invoice Generator',
  'Receipt Generator',
  'AI Image Upscaler',
  'Image Resizer',
  'WebM to MP4',
  'Image Converter',
  'Image Compressor',
  'Background Remover',
  'Excel to PDF',
  'PDF to Word',
  'Word to PDF',
  'Image to PDF',
  'PDF to Image',
  'PDF Splitter',
  'PDF Merger',
]);

function toolSlug(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function getInitialToolFromPath() {
  if (Capacitor.isNativePlatform()) return null;

  const match = window.location.pathname.match(/^\/tools\/([^/]+)\/?$/i);
  if (!match) return null;

  let slug;
  try {
    slug = decodeURIComponent(match[1]).toLowerCase();
  } catch {
    return null;
  }

  const matchedTool = tools.find((tool) => toolSlug(tool.name) === slug);
  const toolName =
    slug === 'pdf-toolkit' ? 'PDF Merger' : matchedTool?.name;

  return routableTools.has(toolName) ? toolName : null;
}

function getPathForView(view) {
  if (view.activeTool && routableTools.has(view.activeTool)) {
    return `/tools/${toolSlug(view.activeTool)}`;
  }

  return '/';
}

function App() {
  const [activeCategory, setActiveCategory] = useState('Home');
  const [search, setSearch] = useState('');
  const [homeSearchOpen, setHomeSearchOpen] = useState(false);
  const homeSearchRef = useRef(null);
  const [sarahSurprise, setSarahSurprise] = useState('');

  useEffect(() => {
    if (!sarahSurprise) return;

    const timer = window.setTimeout(() => {
      if (sarahSurprise === 'hearts') {
        setSarahSurprise('proposal');
      } else {
        setSarahSurprise('');
        setSearch('');
        setHomeSearchOpen(false);
      }
    }, sarahSurprise === 'hearts' ? 3000 : 5000);

    return () => window.clearTimeout(timer);
  }, [sarahSurprise]);

  useEffect(() => {
    function handleHomeSearchOutsideClick(event) {
      if (
        homeSearchRef.current &&
        !homeSearchRef.current.contains(event.target)
      ) {
        setHomeSearchOpen(false);
      }
    }

    document.addEventListener('mousedown', handleHomeSearchOutsideClick);

    return () => {
      document.removeEventListener('mousedown', handleHomeSearchOutsideClick);
    };
  }, []);

  const [menuOpen, setMenuOpen] = useState(false);
  const [notice, setNotice] = useState('');
  const [commandOpen, setCommandOpen] = useState(false);
  const [commandQuery, setCommandQuery] = useState('');
  const [commandSelected, setCommandSelected] = useState(0);
  const commandInputRef = useRef(null);

  useEffect(() => {
    function handleCommandShortcut(event) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setCommandQuery('');
        setCommandSelected(0);
        setCommandOpen((open) => !open);
      }

      if (event.key === 'Escape') {
        setCommandOpen(false);
      }
    }

    window.addEventListener('keydown', handleCommandShortcut);
    return () => window.removeEventListener('keydown', handleCommandShortcut);
  }, []);

  useEffect(() => {
    if (!commandOpen) return;

    const frame = requestAnimationFrame(() => {
      commandInputRef.current?.focus();
    });

    return () => cancelAnimationFrame(frame);
  }, [commandOpen]);

  useEffect(() => {
    setCommandSelected(0);
  }, [commandQuery]);
  const [theme, setTheme] = useState(() => {
    const allowedThemes = ['midnight', 'light', 'ocean', 'emerald', 'rose'];
    const stored = localStorage.getItem('zanahub_theme');
    return allowedThemes.includes(stored) ? stored : 'midnight';
  });

  useEffect(() => {
    localStorage.setItem('zanahub_theme', theme);
  }, [theme]);

  const [recentTools, setRecentTools] = useState(() => {
    try {
      const recent = JSON.parse(
        localStorage.getItem('zanahub_recent_tools') || '[]'
      );
      return Array.isArray(recent)
        ? recent.filter((name) => typeof name === 'string').slice(0, 8)
        : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('zanahub_recent_tools', JSON.stringify(recentTools));
  }, [recentTools]);

  const [savedTools, setSavedTools] = useState(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem('zanahub_saved_tools') || '[]'
      );
      return Array.isArray(saved)
        ? saved.filter((name) => typeof name === 'string')
        : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('zanahub_saved_tools', JSON.stringify(savedTools));
  }, [savedTools]);

  function toggleSavedTool(toolName) {
    setSavedTools((current) =>
      current.includes(toolName)
        ? current.filter((name) => name !== toolName)
        : [...current, toolName]
    );
  }
  const [activeTool, setActiveTool] = useState(getInitialToolFromPath);
  const [activePage, setActivePage] = useState('discover');
  const [accountDetails, setAccountDetails] = useState(null);
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
    window.dispatchEvent(new Event('zanahub-auth-changed'));
  }

  useEffect(() => {
    let cancelled = false;

    async function loadAccount() {
      if (!currentUser) {
        setAccountDetails(null);
        return;
      }

      const token = localStorage.getItem('zanahub_token');
      if (!token) {
        setAccountDetails(null);
        return;
      }


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
        }
      } catch (error) {
        if (!cancelled) {
          setAccountDetails(null);
          console.error('Could not load account details:', error);
        }
      }
    }

    loadAccount();
    return () => {
      cancelled = true;
    };
  }, [currentUser?.id]);


  // Save internal screens in browser history so Back returns to the
  // previous tool or page rather than leaving ZanaHub.
  const navigationReadyRef = useRef(false);
  const navigationSnapshotKey = JSON.stringify({
    activeCategory,
    activeTool,
    activePage,
  });

  useEffect(() => {
    const view = JSON.parse(navigationSnapshotKey);
    const current = window.history.state;
    const currentState =
      current && typeof current === 'object' ? current : {};

    if (!navigationReadyRef.current) {
      window.history.replaceState(
        {
          ...currentState,
          zanaHubNavigation: true,
          zanaHubDepth: 0,
          zanaHubView: view,
        },
        '',
        window.location.href,
      );

      navigationReadyRef.current = true;
      return;
    }

    const savedView = currentState.zanaHubNavigation
      ? JSON.stringify(currentState.zanaHubView)
      : null;

    // A popstate event has already moved history to this view.
    // Don't create a duplicate entry when React restores that view.
    if (savedView === navigationSnapshotKey) return;

    const previousDepth = currentState.zanaHubNavigation
      ? Math.max(0, Number(currentState.zanaHubDepth) || 0)
      : 0;

    window.history.pushState(
      {
        ...currentState,
        zanaHubNavigation: true,
        zanaHubDepth: previousDepth + 1,
        zanaHubView: view,
      },
      '',
      window.location.href,
    );
  }, [navigationSnapshotKey]);

  useEffect(() => {
    function restorePreviousView(event) {
      const view = event.state?.zanaHubNavigation
        ? event.state.zanaHubView
        : null;

      if (!view) return;

      setActiveCategory(view.activeCategory || 'Home');
      setActiveTool(view.activeTool ?? null);
      setActivePage(view.activePage || 'discover');
      setMenuOpen(false);
      setNotice('');

      window.scrollTo({ top: 0, behavior: 'auto' });
    }

    window.addEventListener('popstate', restorePreviousView);

    return () => {
      window.removeEventListener('popstate', restorePreviousView);
    };
  }, []);

  // Android Back follows the same saved navigation history.
  // At the starting screen, Back exits the Android app.
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return undefined;

    let listenerHandle;
    let disposed = false;

    CapacitorApp.addListener('backButton', () => {
      const state = window.history.state;

      // Close the sign-in/register window before considering app exit.
      if (state?.zanaHubAuthPanel === true) {
        window.history.back();
        return;
      }

      const depth = Number(state?.zanaHubDepth) || 0;

      if (state?.zanaHubNavigation && depth > 0) {
        window.history.back();
      } else {
        void CapacitorApp.exitApp();
      }
    })
      .then((handle) => {
        if (disposed) {
          void handle.remove();
        } else {
          listenerHandle = handle;
        }
      })
      .catch((error) => {
        console.error('Could not register Android Back handling:', error);
      });

    return () => {
      disposed = true;
      if (listenerHandle) void listenerHandle.remove();
    };
  }, []);

  function goBack() {
    const state = window.history.state;
    const depth = Number(state?.zanaHubDepth) || 0;

    if (state?.zanaHubNavigation && depth > 0) {
      window.history.back();
      return;
    }

    // Safe fallback if a component opens a screen without a history entry.
    if (activeTool) {
      setActiveTool(null);
    } else if (activePage !== 'discover') {
      setActivePage('discover');
      setActiveTool(null);
    } else if (activeCategory !== 'Home') {
      setActiveCategory('Home');
      setSearch('');
    }
  }

  const filteredTools = tools.filter((tool) => {
    const matchesCategory =
      activePage === 'recent'
        ? recentTools.includes(tool.name)
        : activePage === 'saved'
          ? savedTools.includes(tool.name)
          : activeCategory === 'All Tools' || tool.category === activeCategory;

    const matchesSearch =
      tool.name.toLowerCase().includes(search.toLowerCase()) ||
      tool.description.toLowerCase().includes(search.toLowerCase()) ||
      tool.category.toLowerCase().includes(search.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const homeSearchResults = (
    search.trim()
      ? tools.filter((tool) => {
          const query = search.trim().toLowerCase();
          return (
            tool.name.toLowerCase().includes(query) ||
            tool.description.toLowerCase().includes(query) ||
            tool.category.toLowerCase().includes(query)
          );
        })
      : tools.slice(0, 6)
  ).slice(0, 6);



  function openTool(tool) {
    setRecentTools((current) => [
      tool.name,
      ...current.filter((name) => name !== tool.name),
    ].slice(0, 8));
    setActivePage('discover');
  if (tool.name === 'Logo Maker') {
    setNotice('');
    setActiveTool('Logo Maker');
    setActivePage('discover');
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }

    if (tool.name === 'Color Palette Generator') {
      setNotice('');
      setActiveTool('Color Palette Generator');
      setActivePage('discover');
      setMenuOpen(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }


    if (tool.name === 'AI Bug Finder') {
      setNotice('');
      setActiveTool('AI Bug Finder');
      setActivePage('discover');
      setMenuOpen(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }


    if (tool.name === 'AI Code Explainer') {
      setNotice('');
      setActiveTool('AI Code Explainer');
      setActivePage('discover');
      setMenuOpen(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }


    if (tool.name === 'Code Playground') {
      setNotice('');
      setActiveTool('Code Playground');
      setActivePage('discover');
      setMenuOpen(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }


    if (tool.name === 'JSON Formatter') {
      setNotice('');
      setActiveTool('JSON Formatter');
      setActivePage('discover');
      setMenuOpen(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (tool.name === 'Passport Photo Maker') {
      setNotice('');
      setActiveTool('Passport Photo Maker');
      setMenuOpen(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (tool.name === 'Profit Calculator') {
      setNotice('');
      setActiveTool('Profit Calculator');
      setMenuOpen(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (tool.name === 'MathMaster') {
      setNotice('');
      setActiveTool('MathMaster');
      setMenuOpen(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (tool.name === 'Scientific Calculator') {
      setNotice('');
      setActiveTool('Scientific Calculator');
      setMenuOpen(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (tool.name === 'Notes Generator') {
      setNotice('');
      setActiveTool('Notes Generator');
      setMenuOpen(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (tool.name === 'GPA Calculator') {
      setNotice('');
      setActiveTool('GPA Calculator');
      setMenuOpen(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (tool.name === 'CV Builder') {
      setNotice('');
      setActiveTool('CV Builder');
      setMenuOpen(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }


    if (tool.name === 'Currency Exchange') {
      setNotice('');
      setActiveTool('Currency Exchange');
      setMenuOpen(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (tool.name === 'Invoice Generator') {
      setNotice('');
      setActiveTool('Invoice Generator');
      setMenuOpen(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (tool.name === 'Receipt Generator') {
      setNotice('');
      setActiveTool('Receipt Generator');
      setMenuOpen(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
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

    if (tool.name === 'AI Image Upscaler') {
      setNotice('');
      setActiveTool('AI Image Upscaler');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (tool.name === 'Image Resizer') {
      setNotice('');
      setActiveTool('Image Resizer');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (tool.name === 'WebM to MP4') {
      setNotice('');
      setActiveTool('WebM to MP4');
      setMenuOpen(false);
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

    if (tool.name === 'Background Remover') {
      setNotice('');
      setActiveTool('Background Remover');
      setMenuOpen(false);
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

    if (tool.name === 'AI Chatbot') {
      setNotice('');
      setActiveTool('AI Chatbot');
      setMenuOpen(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setNotice(
      `${tool.name} selected. We will build this tool in a future development step.`,
    );
  }

  const commandResults = [...new Map(
    [
      ...recentTools.map((name) => tools.find((tool) => tool.name === name)),
      ...savedTools.map((name) => tools.find((tool) => tool.name === name)),
      ...tools,
    ]
      .filter(Boolean)
      .map((tool) => [tool.name, tool])
  ).values()].filter((tool) => {
    const query = commandQuery.trim().toLowerCase();

    return (
      !query ||
      tool.name.toLowerCase().includes(query) ||
      tool.description.toLowerCase().includes(query) ||
      tool.category.toLowerCase().includes(query)
    );
  }).slice(0, 12);

  return (
    <div className="app-shell" data-theme={theme}>
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
                  setActiveTool(null);
                  setActivePage('discover');
                  setSearch('');
                  setMenuOpen(false);
                  setNotice('');
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
          className={`category-link ${activePage === 'workspace' ? 'active' : ''}`}
          onClick={() => {
            setActivePage('workspace');
            setActiveTool(null);
            setMenuOpen(false);
            setNotice('');
          }}
        >
          <Cloud size={18} />
          <span>My Workspace</span>
        </button>

        <button
          className={`category-link ${activePage === 'saved' ? 'active' : ''}`}
          onClick={() => {
            setActivePage('saved');
            setActiveTool(null);
            setActiveCategory('All Tools');
            setSearch('');
            setMenuOpen(false);
            setNotice('');
          }}
        >
          <Heart size={18} />
          <span>Saved Tools</span>
          {savedTools.length > 0 && (
            <span className="saved-tools-count">{savedTools.length}</span>
          )}
        </button>


        <button
          className={`category-link ${activePage === 'recent' ? 'active' : ''}`}
          onClick={() => {
            setActivePage('recent');
            setActiveTool(null);
            setActiveCategory('All Tools');
            setSearch('');
            setMenuOpen(false);
            setNotice('');
          }}
        >
          <span className="recent-tools-icon" aria-hidden="true">↻</span>
          <span>Recently Used</span>
          {recentTools.length > 0 && (
            <span className="saved-tools-count">{recentTools.length}</span>
          )}
        </button>

        <div className="sidebar-divider" />

        <div className="sidebar-label">PERSONALIZATION</div>

        <div className="theme-studio">
          <div className="theme-studio-heading">
            <Palette size={17} />
            <span>Theme Studio</span>
          </div>

          <div className="theme-options">
            {[
              { id: 'midnight', name: 'Midnight', color: '#9b7bff' },
              { id: 'light', name: 'Light', color: '#6478d9' },
              { id: 'ocean', name: 'Ocean', color: '#35bde8' },
              { id: 'emerald', name: 'Emerald', color: '#35c995' },
              { id: 'rose', name: 'Rose', color: '#ed78b5' },
            ].map((item) => (
              <button
                key={item.id}
                className={`theme-option ${theme === item.id ? 'selected' : ''}`}
                onClick={() => setTheme(item.id)}
                aria-pressed={theme === item.id}
                title={`${item.name} theme`}
              >
                <span
                  className="theme-swatch"
                  style={{ background: item.color }}
                />
                <span>{item.name}</span>
                {theme === item.id && <span className="theme-check">✓</span>}
              </button>
            ))}
          </div>
        </div>

        <div className="sidebar-bottom">
          <div className="sidebar-glow" />
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

      {commandOpen && (
        <div
          className="command-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setCommandOpen(false);
            }
          }}
        >
          <section
            className="command-palette"
            role="dialog"
            aria-modal="true"
            aria-label="ZanaHub quick search"
          >
            <div className="command-search-row">
              <Search size={21} />
              <input
                ref={commandInputRef}
                type="text"
                value={commandQuery}
                onChange={(event) => setCommandQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'ArrowDown') {
                    event.preventDefault();
                    setCommandSelected((current) =>
                      Math.min(current + 1, commandResults.length - 1)
                    );
                  }

                  if (event.key === 'ArrowUp') {
                    event.preventDefault();
                    setCommandSelected((current) =>
                      Math.max(current - 1, 0)
                    );
                  }

                  if (event.key === 'Enter' && commandResults[commandSelected]) {
                    event.preventDefault();
                    const selectedTool = commandResults[commandSelected];
                    setCommandOpen(false);
                    setCommandQuery('');
                    openTool(selectedTool);
                  }
                }}
                placeholder="Search tools, categories..."
                aria-label="Search ZanaHub tools"
              />
              <button
                type="button"
                className="command-close"
                onClick={() => setCommandOpen(false)}
                aria-label="Close search"
              >
                <X size={19} />
              </button>
            </div>

            <div className="command-results">
              <div className="command-results-heading">
                <span>QUICK ACCESS</span>
                <span>{commandResults.length} RESULTS</span>
              </div>

              {commandResults.length > 0 ? (
                commandResults.map((tool, index) => {
                  const Icon = tool.icon;

                  return (
                    <button
                      type="button"
                      key={tool.name}
                      className={`command-result ${
                        commandSelected === index ? 'selected' : ''
                      }`}
                      onMouseEnter={() => setCommandSelected(index)}
                      onClick={() => {
                        setCommandOpen(false);
                        setCommandQuery('');
                        openTool(tool);
                      }}
                    >
                      <span className={`command-result-icon icon-${tool.color}`}>
                        <Icon size={19} />
                      </span>

                      <span className="command-result-copy">
                        <strong>{tool.name}</strong>
                        <small>{tool.category}</small>
                      </span>

                      <span className="command-result-badges">
                        {recentTools.includes(tool.name) && (
                          <span className="command-badge recent">RECENT</span>
                        )}
                        {savedTools.includes(tool.name) && (
                          <span className="command-badge saved">SAVED</span>
                        )}
                      </span>

                      <ChevronRight size={17} className="command-result-arrow" />
                    </button>
                  );
                })
              ) : (
                <div className="command-empty">
                  <Search size={25} />
                  <strong>No tools found</strong>
                  <span>Try searching for another tool or category.</span>
                </div>
              )}
            </div>

            <div className="command-footer">
              <span><kbd>↑</kbd> <kbd>↓</kbd> Navigate</span>
              <span><kbd>↵</kbd> Open tool</span>
              <span><kbd>Esc</kbd> Close</span>
            </div>
          </section>
        </div>
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
            <button
              className="command-trigger"
              type="button"
              onClick={() => {
                setCommandQuery('');
                setCommandSelected(0);
                setCommandOpen(true);
              }}
              aria-label="Open quick search"
            >
              <Search size={16} />
              <span>Quick search</span>
              <kbd>Ctrl K</kbd>
            </button>

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
          ) : activePage === 'workspace' ? (
            <Workspace currentUser={currentUser} />
          ) : activePage === 'account' ? (
            <AccountDashboard
              currentUser={currentUser}
              accountDetails={accountDetails}
              onBack={goBack}
            />
          ) : activeTool === 'AI Bug Finder' ? (
            <AIBugFinder onBack={goBack} />
          ) : activeTool === 'AI Code Explainer' ? (
            <AICodeExplainer onBack={goBack} />
          ) : activeTool === 'Code Playground' ? (
            <CodePlayground onBack={goBack} />
          ) : activeTool === 'Logo Maker' ? (
    <LogoMaker onBack={goBack} />
) : activeTool === 'Color Palette Generator' ? (
            <ColorPaletteGenerator onBack={goBack} />
          ) : activeTool === 'JSON Formatter' ? (
            <JSONFormatter onBack={goBack} />
          ) : activeTool === 'Profit Calculator' ? (
            <ProfitCalculator onBack={goBack} />
          ) : activeTool === 'MathMaster' ? (
            <MathMaster onBack={goBack} />
          ) : activeTool === 'Scientific Calculator' ? (
            <ScientificCalculator onBack={goBack} />
          ) : activeTool === 'Notes Generator' ? (
            <NotesGenerator onBack={goBack} />
          ) : activeTool === 'GPA Calculator' ? (
            <GPACalculator onBack={goBack} />
          ) : activeTool === 'CV Builder' ? (
            <CVBuilder onBack={goBack} />
          ) : activeTool === 'Currency Exchange' ? (
            <CurrencyExchange onBack={goBack} />
          ) : activeTool === 'Invoice Generator' ? (
            <InvoiceGenerator onBack={goBack} />
          ) : activeTool === 'Receipt Generator' ? (
            <ReceiptGenerator onBack={goBack} />
          ) : activeTool === 'AI Chatbot' ? (
  <AIChatbot onBack={goBack} />
) : activeTool === 'AI Image Generator' ? (
            <AIImageGenerator onBack={goBack} />
          ) : activeTool === 'AI Translator' ? (
            <AITranslator onBack={goBack} />
          ) : activeTool === 'AI Summarizer' ? (
            <AISummarizer onBack={goBack} />
          ) : activeTool === 'AI Writing Assistant' ? (
            <AIWritingAssistant onBack={goBack} />
          ) : activeTool === 'Excel to PDF' ? (
            <ExcelToPDF onBack={goBack} />
          ) : activeTool === 'PDF to Word' ? (
            <PDFToWord onBack={goBack} />
          ) : activeTool === 'Word to PDF' ? (
            <WordToPDF onBack={goBack} />
          ) : activeTool === 'Image to PDF' ? (
            <ImageToPDF onBack={goBack} />
          ) : activeTool === 'PDF to Image' ? (
            <PDFToImage onBack={goBack} />
          ) : activeTool === 'Passport Photo Maker' ? (
            <PassportPhotoMaker onBack={goBack} />
          ) : activeTool === 'WebM to MP4' ? (
            <WebMToMP4 onBack={goBack} />
          ) : activeTool === 'Image Converter' ? (
            <ImageConverter onBack={goBack} />
          ) : activeTool === 'AI Image Upscaler' ? (
            <AIImageUpscaler onBack={goBack} />
          ) : activeTool === 'Image Resizer' ? (
            <ImageResizer onBack={goBack} />
          ) : activeTool === 'PDF Merger' ? (
            <PDFMerger onBack={goBack} />
          ) : activeTool === 'PDF Splitter' ? (
            <PDFSplitter onBack={goBack} />
          ) : activeTool === 'Image Compressor' ? (
            <ImageCompressor onBack={goBack} />
          ) : activeTool === 'Background Remover' ? (
            <BackgroundRemover onBack={goBack} />
          ) : (
          <>

          {activeCategory === 'Home' && (
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

              <div className="hero-search-container" ref={homeSearchRef}>
                <div className="hero-search">
                  <Search size={20} />
                  <input
                    value={search}
                    onFocus={() => setHomeSearchOpen(true)}
                    onChange={(event) => {
                      const value = event.target.value;
                      setSearch(value);

                      if (['sarah', 'berna'].includes(value.trim().toLowerCase())) {
                        setHomeSearchOpen(false);
                        setSarahSurprise('hearts');
                      } else {
                        setHomeSearchOpen(true);
                      }
                    }}
                    onKeyDown={(event) => {
                      if (event.key === 'Escape') {
                        setHomeSearchOpen(false);
                      }

                      if (
                        event.key === 'Enter' &&
                        ['sarah', 'berna'].includes(search.trim().toLowerCase())
                      ) {
                        event.preventDefault();
                        return;
                      }

                      if (event.key === 'Enter' && homeSearchResults[0]) {
                        event.preventDefault();
                        openTool(homeSearchResults[0]);
                        setSearch('');
                        setHomeSearchOpen(false);
                      }
                    }}
                    placeholder="What do you want to accomplish today?"
                    aria-label="Search tools"
                    aria-expanded={homeSearchOpen}
                    aria-controls="home-search-results"
                  />
                  <kbd>SEARCH</kbd>
                </div>

                {homeSearchOpen && (
                  <div
                    className="hero-search-dropdown"
                    id="home-search-results"
                    role="listbox"
                  >
                    <div className="hero-search-dropdown-heading">
                      {search.trim() ? 'SEARCH RESULTS' : 'POPULAR TOOLS'}
                      <span>{homeSearchResults.length} TOOLS</span>
                    </div>

                    {homeSearchResults.length > 0 ? (
                      homeSearchResults.map((tool) => {
                        const ToolIcon = tool.icon;

                        return (
                          <button
                            type="button"
                            className="hero-search-result"
                            key={tool.name}
                            role="option"
                            aria-selected="false"
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={() => {
                              openTool(tool);
                              setSearch('');
                              setHomeSearchOpen(false);
                            }}
                          >
                            <span className={`hero-search-result-icon ${tool.color || ''}`}>
                              <ToolIcon size={17} />
                            </span>

                            <span className="hero-search-result-info">
                              <strong>{tool.name}</strong>
                              <small>{tool.category}</small>
                            </span>

                            <ChevronRight size={16} className="hero-search-result-arrow" />
                          </button>
                        );
                      })
                    ) : (
                      <div className="hero-search-empty">
                        No tools found. Try another search.
                      </div>
                    )}
                  </div>
                )}
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
          </>
          )}

          {notice && (
            <div className="notice" role="status">
              <span>{notice}</span>
              <button aria-label="Dismiss message" onClick={() => setNotice('')}>
                <X size={17} />
              </button>
            </div>
          )}

          {activeCategory === 'Home' && (
          <>
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
            <VisitorCounter />
          </section>
          </>
          )}

          {activeCategory !== 'Home' && (
          <section className="tools-section" id="tools">
            <div className="section-heading">
              <div>
                <div className="section-kicker">THE TOOLBOX</div>
                <h2>
                  {activePage === 'saved'
                    ? 'Your saved tools'
                    : activePage === 'recent'
                      ? 'Recently used tools'
                      : 'Explore your tools'}
                  <span className="heading-period">.</span>
                </h2>
                <p>
                  {activePage === 'saved'
                    ? 'Your favourite tools, all in one place.'
                    : activePage === 'recent'
                      ? 'Pick up where you left off.'
                      : 'Find the right tool for whatever you\'re working on.'}
                </p>
              </div>
              <div className="tool-count">
                <span>{filteredTools.length.toString().padStart(2, '0')}</span>
                {activePage === 'saved'
                  ? 'TOOLS SAVED'
                  : activePage === 'recent'
                    ? 'RECENT TOOLS'
                    : 'TOOLS SHOWN'}
              </div>
            </div>

            <div className="mobile-categories">
              {categories.map((category) => (
                <button
                  key={category.name}
                  className={activeCategory === category.name ? 'active' : ''}
                  onClick={() => {
                    setActiveCategory(category.name);
                    setActivePage('discover');
                  }}
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
                      <button
                        type="button"
                        className={`save-tool-button ${
                          savedTools.includes(tool.name) ? 'saved' : ''
                        }`}
                        aria-label={
                          savedTools.includes(tool.name)
                            ? `Remove ${tool.name} from saved tools`
                            : `Save ${tool.name}`
                        }
                        aria-pressed={savedTools.includes(tool.name)}
                        title={
                          savedTools.includes(tool.name)
                            ? 'Remove from saved tools'
                            : 'Save tool'
                        }
                        onClick={() => toggleSavedTool(tool.name)}
                      >
                        <Heart
                          size={17}
                          fill={
                            savedTools.includes(tool.name)
                              ? 'currentColor'
                              : 'none'
                          }
                        />
                      </button>
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

                  </article>
                );
              })}
            </div>

            {filteredTools.length === 0 && (
              <div className="empty-state">
                <Search size={30} />
                <h3>
                  {activePage === 'saved'
                    ? 'No saved tools yet'
                    : activePage === 'recent'
                      ? 'No recently used tools yet'
                      : 'No tools found'}
                </h3>
                <p>
                  {activePage === 'saved'
                    ? 'Save tools by tapping the heart on any tool card.'
                    : activePage === 'recent'
                      ? 'Tools you open will appear here automatically.'
                      : 'Try another search or choose a different category.'}
                </p>
                <button
                  onClick={() => {
                    setSearch('');
                    setActiveCategory('All Tools');
                    setActivePage('discover');
                  }}
                >
                  Show all tools
                </button>
              </div>
            )}
          </section>
          )}

          {activeCategory === 'Home' && (
          <section className="home-showcase">
            <div className="home-showcase-copy">
              <div className="section-kicker">ONE WORKSPACE, MANY POSSIBILITIES</div>
              <h2>Your everyday work, <span>made simpler.</span></h2>
              <p>
                ZanaHub brings practical digital tools together in one place.
                Organise documents, prepare images, explore AI assistance, and
                make everyday tasks easier without jumping between different
                websites.
              </p>
              <div className="showcase-benefits">
                <div><FileText size={18} /><span>Documents made easier</span></div>
                <div><Image size={18} /><span>Image tools in one hub</span></div>
                <div><Sparkles size={18} /><span>Helpful AI features</span></div>
              </div>
            </div>

            <div className="showcase-visual" aria-label="Animated digital tools illustration">
              <div className="showcase-glow" />
              <div className="showcase-orbit showcase-orbit-one" />
              <div className="showcase-orbit showcase-orbit-two" />
              <div className="showcase-document document-main">
                <div className="document-fold" />
                <FileText size={30} />
                <span>YOUR DOCUMENT</span>
                <i /><i /><i />
                <div className="document-check"><Check size={15} /></div>
              </div>
              <div className="showcase-float showcase-pdf">
                <FileText size={19} /><span>PDF tools</span>
              </div>
              <div className="showcase-float showcase-image">
                <Image size={19} /><span>Image tools</span>
              </div>
              <div className="showcase-float showcase-ai">
                <Sparkles size={19} /><span>AI workspace</span>
              </div>
            </div>
          </section>
          )}

          {activeCategory === 'Home' && (
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
          )}

          <footer className="footer">
            <a
              className="footer-brand"
              href="#home"
              onClick={() => {
                setActivePage('discover');
                setActiveCategory('Home');
                setActiveTool(null);
                setSearch('');
                window.scrollTo({ top: 0, behavior: 'smooth' });
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
      
      {sarahSurprise && (
        <div
          className={`sarah-surprise-overlay ${sarahSurprise}`}
          role="dialog"
          aria-modal="true"
          aria-label="A special surprise"
        >
          <div className="sarah-surprise-glow" />

          {sarahSurprise === 'hearts' ? (
            <div className="sarah-heart-scene" aria-hidden="true">
              <span>💗</span>
              <span>💕</span>
              <span>❤️</span>
              <span>💖</span>
              <span>💘</span>
              <span>💗</span>
              <span>💞</span>
              <span>❤️</span>
              <div className="sarah-heart-center">♥</div>
            </div>
          ) : (
            <div className="sarah-proposal">
              <div className="sarah-proposal-emojis">💖 💍 💖</div>
              <h2>WILL YOU MARRY ME?</h2>
              <div className="sarah-proposal-emojis">🥹 ❤️ 🥰</div>
            </div>
          )}
        </div>
      )}

      </main>
    </div>
  );
}

export default App;
