import React from 'react';
import { Instagram, Twitter, Facebook } from 'lucide-react';

const SocialMediaIcons = ({ className = "", iconSize = 20, iconColor = "text-gray-300", hoverColor = "hover:text-teal-400", showLabels = false }) => {
  const socialLinks = [
    {
      name: 'Instagram',
      icon: <Instagram size={iconSize} className={`${iconColor} ${hoverColor} transition-colors`} />,
      url: 'https://www.instagram.com/greggoryfoundationltd/',
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
