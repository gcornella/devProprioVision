import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "font-awesome/css/font-awesome.min.css";
import "./HamburgerMenu.css"; // Import the CSS file


const HamburgerMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => {
   
    const nextRoute = isOpen ? '/' : '/settings'; // use isOpen BEFORE it's toggled
    setIsOpen(!isOpen); // toggle icon

    // If redirected to settings, restart the state of the toggle
    if (nextRoute === '/settings') {
      setIsOpen(false)
    }
  
    navigate(nextRoute); // navigate right away

  
  };

  return (
  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
    <button className="settings-button" onClick={toggleMenu}>
      <i className="fa fa-cog hamburger-icon"></i>
    </button>

    <button className="settings-button" onClick={() => navigate('/')}>
      <i className="fa fa-home hamburger-icon"></i>
    </button>
  </div>
);

};

export default HamburgerMenu;
