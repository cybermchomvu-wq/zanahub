import fs from 'node:fs';
import path from 'node:path';

const SITE = 'https://zanahub.vercel.app';

const pages = [
  ['AI Chatbot', 'Chat with AI, ask questions, explore ideas and get help with everyday tasks.', 'AI Tools'],
  ['AI Summarizer', 'Summarize long text into clear, concise and useful summaries with AI.', 'AI Tools'],
  ['AI Writing Assistant', 'Write, improve, rewrite and refine text with an AI writing assistant.', 'AI Tools'],
  ['AI Image Generator', 'Create images from text prompts with the ZanaHub AI image generator.', 'AI Tools'],
  ['AI Translator', 'Translate text between languages with an AI-powered translation tool.', 'AI Tools'],
  ['AI Bug Finder', 'Find potential coding errors and get suggestions for improving your code.', 'Developer Tools'],
  ['AI Code Explainer', 'Understand programming code with clear AI-powered explanations.', 'Developer Tools'],
  ['Code Playground', 'Experiment with code in an online coding playground.', 'Developer Tools'],
  ['Logo Maker', 'Create logos and explore visual branding ideas with the online logo maker.', 'Graphic Design'],
  ['Color Palette Generator', 'Generate color palettes and discover color combinations for design projects.', 'Graphic Design'],
  ['JSON Formatter', 'Format, organize and make JSON data easier to read.', 'Developer Tools'],
  ['Passport Photo Maker', 'Prepare passport-style photos with an online photo tool.', 'Image Tools'],
  ['Profit Calculator', 'Calculate business costs, revenue and profit with a simple calculator.', 'Business Tools'],
  ['Scientific Calculator', 'Perform scientific and mathematical calculations online.', 'Calculators'],
  ['Notes Generator', 'Organize ideas and generate useful notes with ZanaHub.', 'Education'],
  ['GPA Calculator', 'Calculate your grade point average using your course grades.', 'Education'],
  ['CV Builder', 'Create and prepare a professional CV with an online CV builder.', 'Career Tools'],
  ['Currency Exchange', 'Convert currencies with the ZanaHub currency exchange tool.', 'Calculators'],
  ['Invoice Generator', 'Create professional invoices for business transactions.', 'Business Tools'],
  ['Receipt Generator', 'Generate receipts for business and everyday transactions.', 'Business Tools'],
  ['Image Resizer', 'Resize images online to suit different dimensions and requirements.', 'Image Tools'],
  ['WebM to MP4', 'Convert WebM video files into MP4 format online.', 'Media Tools'],
  ['Image Converter', 'Convert images between supported image file formats.', 'Image Tools'],
  ['Image Compressor', 'Compress images online to reduce file size.', 'Image Tools'],
  ['Excel to PDF', 'Convert Excel spreadsheets and CSV files into PDF documents.', 'PDF Tools'],
  ['PDF to Word', 'Convert PDF documents into editable Word files.', 'PDF Tools'],
  ['Word to PDF', 'Convert Word documents into PDF files online.', 'PDF Tools'],
  ['Image to PDF', 'Combine images into a downloadable PDF document.', 'PDF Tools'],
  ['PDF to Image', 'Convert PDF pages into downloadable PNG or JPG images.', 'PDF Tools'],
  ['PDF Splitter', 'Extract pages or split PDF documents into separate files.', 'PDF Tools'],
  ['PDF Merger', 'Combine multiple PDF documents into one PDF file.', 'PDF Tools'],
];

function slugify(value) {
  return value.toLowerCase().trim()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[char]);
}

const dist = path.resolve('dist');
const templatePath = path.join(dist, 'index.html');

if (!fs.existsSync(templatePath)) {
  throw new Error('dist/index.html not found. Run the Vite build first.');
}

const template = fs.readFileSync(templatePath, 'utf8');

function createPage(title, description, url, category, name = 'ZanaHub') {
  const safeTitle = escapeHtml(title);
  const safeDescription = escapeHtml(description);

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name,
    description,
    url,
    applicationCategory: category,
    operatingSystem: 'Web',
    isPartOf: {
      '@type': 'WebSite',
      name: 'ZanaHub',
      url: SITE,
    },
  };

  const metadata = `
    <meta name="description" content="${safeDescription}" />
    <link rel="canonical" href="${url}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="ZanaHub" />
    <meta property="og:title" content="${safeTitle}" />
    <meta property="og:description" content="${safeDescription}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:image" content="${SITE}/zanahub-icon.svg" />
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:title" content="${safeTitle}" />
    <meta name="twitter:description" content="${safeDescription}" />
    <script type="application/ld+json">${JSON.stringify(structuredData)}</script>
  `;

  return template
    .replace(/<title>[\s\S]*?<\/title>/i, `<title>${safeTitle}</title>`)
    .replace('</head>', `${metadata}\n  </head>`);
}

// Give the homepage its own metadata.
const homepageDescription =
  'Discover practical AI, PDF, image, coding, business and education tools in one digital workspace.';

fs.writeFileSync(
  templatePath,
  createPage(
    'ZanaHub – Online AI, PDF, Image and Business Tools',
    homepageDescription,
    `${SITE}/`,
    'UtilitiesApplication',
  ),
);

// Generate a dedicated HTML entry point for every working tool route.
const sitemapUrls = [`${SITE}/`];

for (const [name, description, category] of pages) {
  const slug = slugify(name);
  const url = `${SITE}/tools/${slug}`;
  const directory = path.join(dist, 'tools', slug);

  fs.mkdirSync(directory, { recursive: true });

  fs.writeFileSync(
    path.join(directory, 'index.html'),
    createPage(
      `${name} Online Tool | ZanaHub`,
      description,
      url,
      category,
      name,
    ),
  );

  sitemapUrls.push(url);
}

// Generate sitemap.xml.
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls.map((url) => `  <url><loc>${url}</loc></url>`).join('\n')}
</urlset>
`;

fs.writeFileSync(path.join(dist, 'sitemap.xml'), sitemap);

console.log(`Generated ${pages.length} tool SEO pages.`);
console.log('Generated homepage metadata and sitemap.xml.');
