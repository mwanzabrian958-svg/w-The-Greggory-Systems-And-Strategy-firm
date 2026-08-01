import React from 'react';
import { Instagram, Twitter, Facebook } from 'lucide-react';

// TikTok SVG icon (not in lucide-react)
const TikTokIcon = ({ size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z"/>
  </svg>
);

const SocialMediaIcons = ({ className = "", iconSize = 20, iconColor = "text-gray-300", hoverColor = "hover:text-teal-400", showLabels = false }) => {
  const socialLinks = [
    {
      name: 'Instagram',
      icon: <Instagram size={iconSize} className={`${iconColor} ${hoverColor} transition-colors`} />,
      url: 'https://www.instagram.com/thegreggorysystemsandstrategyfirmltd/',
      target: '_blank',
      rel: 'noopener noreferrer'
    },
    {
      name: 'Twitter',
      icon: <Twitter size={iconSize} className={`${iconColor} ${hoverColor} transition-colors`} />,
      url: 'https://x.com/martin_set48712',
      target: '_blank',
      rel: 'noopener noreferrer'
    },
    {
      name: 'Facebook',
      icon: <Facebook size={iconSize} className={`${iconColor} ${hoverColor} transition-colors`} />,
      url: 'https://www.facebook.com/profile.php?id=61583677166945',
      target: '_blank',
      rel: 'noopener noreferrer'
    },
    {
      name: 'TikTok',
      icon: (
        <span className={`${iconColor} ${hoverColor} transition-colors`}>
          <TikTokIcon size={iconSize} />
        </span>
      ),
      url: 'https://vm.tiktok.com/ZS9FQhk1WNr1U-sNsyX/',
      target: '_blank',
      rel: 'noopener noreferrer'
    }
  ];

  return (
    <div className={`flex flex-wrap gap-4 ${className}`}>
      {socialLinks.map((social) => (
        <div key={social.name} className="flex items-center">
          <a
            href={social.url}
            target={social.target || '_blank'}
            rel={social.rel || 'noopener noreferrer'}
            className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title={social.name}
          >
            <div className="p-2 rounded-full bg-white dark:bg-gray-700 shadow-sm">
              {social.icon}
            </div>
            {showLabels && <span className="text-sm font-medium">{social.name}</span>}
          </a>
        </div>
      ))}
    </div>
  );
};

export default SocialMediaIcons;
