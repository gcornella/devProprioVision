import React from "react";
import "./ImpairmentScale.css";
import { checkNavigatorAgent} from '../utils/checks';


type ImpairmentScaleProps = {
  error: number; // Input: 0 to 20 (cm), but display capped at 10
};

const ImpairmentScale: React.FC<ImpairmentScaleProps> = ({ error }) => {
  // Detect the navigator agent
  const {isiOS} = checkNavigatorAgent(); // Check the user agent to determine the OS and browser
  // Clamp error to a max of 10cm
  const clampedError = Math.min(Math.max(error, 0), 10);
  // Right = 0cm (normal), Left = 10cm (severe)
  const ballPosition = (1 - clampedError / 10) * 100;
  const sections = ["Can Improve", "Good", "Great"]; // left to right

  return (
    <div className="impairment-container-horizontal">
      <div className="impairment-bar-horizontal">
        <div
          className="impairment-ball-horizontal"
          style={{ left: `${ballPosition}%` }}
        />
      </div>
      <div className="impairment-labels-horizontal">
        {sections.map((label) => (
          <div 
            key={label} 
            className="impairment-label-horizontal"
            style={isiOS ? { color: "white" } : {}}
          >
            {label}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImpairmentScale;
