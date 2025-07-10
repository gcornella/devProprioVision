import React from 'react';
import './Footer.css'; // Import the CSS file

interface FooterProps {
  text: string;
}

const Footer: React.FC<FooterProps> = ({ text }) => {
  return (
    <div className="footer">
      <p className="footer-text">{text}</p>
    </div>
  );
};

export default Footer;
