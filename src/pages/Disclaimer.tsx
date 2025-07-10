import React from 'react';
import { useNavigate } from 'react-router-dom';

// Import styles
import './Disclaimer.css';

const Disclaimer: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="disclaimer-container">
      <button
          onClick={() => navigate('/')}
          aria-label="Close and go to home"
          className='closeIntroPopup-button'
      >
          &#10006;
      </button>

      <h1>Proprioception Trainer – Disclaimer</h1>
      <p>
        The goal of this web is to provide a means to challenge and train proprioception of the upper extremities.
        Proprioception is your sixth sense and enables your brain to know where your limbs are in space. Neurologic
        injuries such as stroke, cerebral palsy, or spinal cord injury often affect proprioception. The web uses computer vision to track hand positions and assess your performance.
      </p>

      <h2>⚠️ Disclaimer</h2>
      <p>
        Before you access or use any information provided on this platform, please read the following terms carefully.
        By using this platform, you agree to comply with the terms of this disclaimer:
      </p>

      <ul>
        <li>
          <strong>🩺 Consultation with Healthcare Professionals:</strong> This web is not a substitute for professional
          medical advice. Always consult a qualified healthcare provider regarding any medical condition or treatment.
        </li>
        <li>
          <strong>👤 User Responsibility:</strong> Use of this web is at your own risk. We are not liable for any
          consequences arising from its use.
        </li>
        <li>
          <strong>🚫 No Doctor-Patient Relationship:</strong> Use of this web does not establish a doctor-patient
          relationship.
        </li>
        <li>
          <strong>📊 Accuracy and Completeness:</strong> While we aim to provide accurate and current information, we
          cannot guarantee the accuracy, completeness, or reliability of the content.
        </li>
        <li>
          <strong>🚑 Medical Emergencies:</strong> In case of a medical emergency, contact emergency services
          immediately.
        </li>
        <li>
          <strong>🔗 External Links:</strong> The web may include links to third-party sites. We do not endorse or
          guarantee the content of these sites.
        </li>
        <li>
          <strong>🛠 Modifications:</strong> We may update this disclaimer at any time without notice. Please review it
          periodically.
        </li>
      </ul>

      <p>
        By accessing this web, you acknowledge that you have read, understood, and agree to this disclaimer. If you do
        not agree, please refrain from using the web. We appreciate your attention to these terms and your commitment to
        responsible health practices.
      </p>

      
    </div>
  );
};

export default Disclaimer;
