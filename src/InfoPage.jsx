import { ArrowLeft, Mail, ShieldCheck, FileText, Info } from 'lucide-react';

const pageContent = {
  about: {
    icon: Info,
    eyebrow: 'GET TO KNOW US',
    title: 'About ZanaHub',
    subtitle: 'Practical digital tools, all in one place.',
    sections: [
      {
        title: 'Our mission',
        text: 'ZanaHub aims to make everyday digital tasks simpler by bringing useful tools together in one convenient workspace.',
      },
      {
        title: 'What you can do',
        text: 'Explore tools for documents, images, writing, education, business and other everyday tasks. Available tools and features may change as the platform develops.',
      },
      {
        title: 'Our approach',
        text: 'We aim to make our tools straightforward and accessible. We continue to improve the platform and welcome constructive feedback from our users.',
      },
    ],
  },
  contact: {
    icon: Mail,
    eyebrow: 'WE ARE HERE TO HELP',
    title: 'Contact Us',
    subtitle: 'Questions, feedback or a problem with a tool? We want to hear from you.',
    sections: [
      {
        title: 'Get in touch',
        text: 'Email us at sajultds.support@gmail.com for questions, feedback or help with ZanaHub.',
        email: 'sajultds.support@gmail.com',
      },
      {
        title: 'Useful details',
        text: 'When reporting a problem, describe which tool you were using and what happened. Do not send passwords, payment card details or other sensitive information.',
      },
    ],
  },
  privacy: {
    icon: ShieldCheck,
    eyebrow: 'YOUR PRIVACY MATTERS',
    title: 'Privacy Policy',
    subtitle: 'Effective 26 October 2026. How ZanaHub handles information.',
    sections: [
      {
        title: 'Information you provide',
        text: 'If you create an account, we process information such as your name and email address. Passwords are stored as password hashes in our database rather than as plain-text passwords. The website also stores an authentication token and account information in your browser local storage to support account features. For privacy questions, email sajultds.support@gmail.com.',
      },
      {
        title: 'How tools process your content',
        text: 'AI writing, summarising and translation requests are sent to our backend, which forwards the submitted prompt to Google Gemini to generate a result. AI image-generation prompts are forwarded to Hugging Face. These external providers process submitted inputs to provide the requested output and may handle them under their own terms and privacy policies. Avoid submitting confidential or sensitive information.',
      },
      {
        title: 'Cookies and local storage',
        text: 'ZanaHub uses browser local storage to support account sessions and store account-related information. Google AdSense and other third-party services may also use cookies or similar technologies for advertising, functionality or measurement. You can manage browser storage and cookies through your browser settings, although blocking them may affect some features.',
      },
      {
        title: 'Advertising',
        text: 'ZanaHub includes Google AdSense advertising code. If ads are served, Google and its partners may use cookies or similar technologies and process information such as browser identifiers or IP addresses to deliver, measure, limit repetition of or personalise ads where permitted. Their practices depend on settings, applicable consent requirements and whether ads are actually served. See the Google advertising information below.',
      },
      {
        title: 'Google advertising information',
        text: 'Learn how Google uses information from sites and apps that use its services and how its advertising technologies work.',
        links: [
          {
            label: 'How Google uses information from partner sites',
            url: 'https://policies.google.com/technologies/partner-sites',
          },
          {
            label: 'How AdSense uses cookies',
            url: 'https://support.google.com/adsense/answer/7549925',
          },
          {
            label: 'Google advertising and privacy',
            url: 'https://policies.google.com/technologies/ads',
          },
        ],
      },
      {
        title: 'Third-party services',
        text: 'ZanaHub relies on external providers for hosting, authentication, AI processing and advertising. Those providers may process information under their own terms and privacy policies. Providers and configurations may change as the website develops.',
      },
      {
        title: 'Data security and retention',
        text: 'We aim to protect information using reasonable safeguards, but no online service can guarantee absolute security. Information retention depends on the data, the feature used, our backend configuration and relevant third-party providers. Contact us with questions about a particular type of information or request.',
      },
      {
        title: 'Your choices and questions',
        text: 'You can choose what information you submit and stop using the tools at any time. For privacy questions or requests concerning personal information, email sajultds.support@gmail.com. We will review requests and respond as appropriate under applicable requirements.',
      },
      {
        title: 'Policy updates',
        text: 'This policy may be updated as ZanaHub changes. Any revised version will be published on this page with an updated effective date.',
      },
    ],
  },
  terms: {
    icon: FileText,
    eyebrow: 'PLEASE READ',
    title: 'Terms of Service',
    subtitle: 'The basic terms for using ZanaHub.',
    sections: [
      {
        title: 'Using the website',
        text: 'You may use ZanaHub for lawful purposes and in accordance with these terms. You are responsible for ensuring that your use of the tools complies with applicable laws and the rights of others.',
      },
      {
        title: 'Your content',
        text: 'You remain responsible for the text, images, documents and other content you submit. Only upload content you have the right to use. Do not submit unlawful content or content that infringes another person’s rights.',
      },
      {
        title: 'Tool results',
        text: 'Tools are provided to assist with everyday tasks. Results may contain mistakes, omissions or formatting differences. Review important results before relying on them, sharing them or using them for important decisions.',
      },
      {
        title: 'Acceptable use',
        text: 'Do not misuse the website, attempt to disrupt its operation, bypass security controls, interfere with other users or use the service for unlawful activities.',
      },
      {
        title: 'Availability and changes',
        text: 'Features may be changed, suspended or removed as the platform develops. We aim to keep the service useful but cannot guarantee uninterrupted availability or that every tool will always work without errors.',
      },
      {
        title: 'Third-party services and advertising',
        text: 'Some features may depend on third-party services. Advertisements may appear on the website. Third-party services and advertisements may be subject to their own terms and policies.',
      },
      {
        title: 'Disclaimer',
        text: 'To the extent permitted by applicable law, ZanaHub is provided on an “as available” basis without a guarantee that every feature or result will meet your requirements. Nothing in these terms excludes rights or protections that cannot legally be excluded.',
      },
      {
        title: 'Changes to these terms',
        text: 'We may update these terms as the website develops. Continued use after updated terms are published is subject to the revised terms to the extent permitted by applicable law.',
      },
    ],
  },
};

export default function InfoPage({ page, onBack, onNavigate }) {
  const content = pageContent[page];

  if (!content) {
    return (
      <section className="info-page">
        <button className="info-back" onClick={onBack}>
          <ArrowLeft size={17} /> Back to tools
        </button>
        <h1>Page not found</h1>
        <p>This information page could not be found.</p>
      </section>
    );
  }

  const PageIcon = content.icon;

  return (
    <section className="info-page">
      <button className="info-back" onClick={onBack}>
        <ArrowLeft size={17} /> Back to tools
      </button>

      <header className="info-hero">
        <div className="info-icon">
          <PageIcon size={25} />
        </div>
        <div className="info-eyebrow">{content.eyebrow}</div>
        <h1>{content.title}</h1>
        <p>{content.subtitle}</p>
      </header>

      <div className="info-sections">
        {content.sections.map((section) => (
          <article className="info-card" key={section.title}>
            <h2>{section.title}</h2>
            <p>
              {section.text}
              {section.email && (
                <>
                  {' '}
                  <a className="info-email-link" href={`mailto:${section.email}`}>
                    {section.email}
                  </a>
                </>
              )}
            </p>
            {section.links && (
              <ul className="info-policy-links">
                {section.links.map((link) => (
                  <li key={link.url}>
                    <a href={link.url} target="_blank" rel="noopener noreferrer">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </article>
        ))}
      </div>

      <footer className="info-footer">
        <span>© {new Date().getFullYear()} ZanaHub</span>
        <nav aria-label="Information pages">
          <button onClick={() => onNavigate('about')}>About</button>
          <button onClick={() => onNavigate('contact')}>Contact</button>
          <button onClick={() => onNavigate('privacy')}>Privacy</button>
          <button onClick={() => onNavigate('terms')}>Terms</button>
        </nav>
      </footer>
    </section>
  );
}
