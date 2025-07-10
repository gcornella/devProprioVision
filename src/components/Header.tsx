import React, { useEffect, useState } from 'react';
import './Header.css';
import HamburgerMenu from "./HamburgerMenu";
import { useNavigate, Link } from 'react-router-dom';


const Header: React.FC = () => {
  const navigate = useNavigate();

  const userName = 'Guest'; 
  const [popupVisible, setPopupVisible] = useState<boolean>(false);

  const handleUserClick = () => {
    setPopupVisible(prev => {
      console.log('Toggling popup:', !prev);
      return !prev;
    });
  };

  const handleStats = async () => {
    setPopupVisible(false);
    navigate('/statistics');
  };

  const handleDisclaimer = async () => {
    setPopupVisible(false);
    navigate('/disclaimer');
  };

  const handleOverlayClick = () => {
    setPopupVisible(false);
  };

  return (
    <div className="header">
      <HamburgerMenu/>
      <h1 className="title">Proprio Vision</h1>
      <div className="user-box-wrapper">
        <button className="user-button" onClick={handleUserClick}>
          {userName}
        </button>

        {popupVisible && (
          <>
            <div className = "popup-overlay" 
              style={{backgroundColor:'rgba(0, 0, 0, 0.3)'}} 
              onClick={handleOverlayClick}>
            </div>
            <div className="user-popup">
              <p>Hello Guest!</p>
              <button onClick={handleStats} className="stats-button">Statistics</button>
              <button onClick={handleDisclaimer} className="stats-button">Disclaimer</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Header;
