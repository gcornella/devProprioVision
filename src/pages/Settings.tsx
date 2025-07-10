import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Import external functions
import { saveUserProfile } from '../utils/saveToLocalStorage';

// Import contexts
import { useUser } from "../contexts/UserContext"; 
import { useCamera } from "../contexts/CameraContext";

// Import styles
import './SharedStyles.css'
import './Settings.css'

const Settings = () => {
  const navigate = useNavigate();

 // Import camera settings
  const {cameraSettings, loading: cameraSettingsLoading, setCameraSettings} = useCamera();
  const [cameraSettingsLoaded, setCameraSettingsLoaded] = useState(false);

  // User context
  const {userSettings, loading: userSettingsLoading, refreshUserSettings} = useUser();
  const [userSettingsLoaded, setUserSettingsLoaded] = useState(false);
  const [selectedHand, setSelectedHand] = useState<string>('none');
  const [selectedFingertips, setSelectedFingertips] = useState<string>('none');
  const [selectedAge, setSelectedAge] = useState<number>(0); 
  const [selectedSex, setSelectedSex] = useState<string>('Prefer not to say');
  const [isHandSizeInLocalStorage, setIsHandSizeInLocalStorage] = useState(false); 

  // Webcam and Canvas 
  const webcamVideoRef = useRef<HTMLVideoElement>(null);
  
  // The camera settings have been loaded
  useEffect(() => {
    if (!cameraSettingsLoading && cameraSettings) {
      setCameraSettingsLoaded(true);
      console.log('✅️📷 Camera settings loaded: ', cameraSettings);
    }
  }, [cameraSettingsLoading, cameraSettings]);

  // Check if camera settings are loaded and cameraId is available, then initialize webcam
  useEffect(() => {
    const initializeWebcam = async () => {
      if (cameraSettings.cameraId && cameraSettings.cameraId !== "defaultCamera") {
        console.log('📷 selectedCameraId: ', cameraSettings.cameraId);
        await startWebcam(cameraSettings.cameraId); // Start webcam with the selected camera
      }else{ //ensure that any previously running webcam stream is stopped and cleared if a valid camera isn't selected.
        if (webcamVideoRef.current && webcamVideoRef.current.srcObject) {
          console.warn('⚠️📷 Problem might be here');
          const stream = webcamVideoRef.current.srcObject as MediaStream;
          stream.getTracks().forEach(track => track.stop());
          webcamVideoRef.current.srcObject = null;
        }
      }
    };
    if (cameraSettingsLoaded && cameraSettings) {
        initializeWebcam();
    }
  }, [cameraSettingsLoaded, cameraSettings]); 


  // On mount or user change, force a refresh
  useEffect(() => {
      console.log("🔄 Forcing refresh of user settings on Settings page mount...");
      refreshUserSettings();
  }, []);

  // Once userSettings has data, load it into local state
  useEffect(() => {
    if (!userSettingsLoading && userSettings) {
      setSelectedHand(userSettings.impairedHand);
      setSelectedFingertips(userSettings.spasticitySeverity);
      setSelectedAge(userSettings.age);
      setSelectedSex(userSettings.sex);
      setUserSettingsLoaded(true);
      console.log('✅️👤 User settings loaded: ', userSettings);
    }
  }, [userSettingsLoading, userSettings]);

  // Reactively check for targetHandSize
  useEffect(() => {
    if (userSettingsLoaded && userSettings) {
      const size = userSettings.targetHandSize;
      if (size && size > 0) {
        console.log('✅️‍🔥 User has hand size saved in Local Storage:', size);
        setIsHandSizeInLocalStorage(true);
      } else {
        console.warn('⚠️‍🔥 User does not have hand size saved in Local Storage');
        setIsHandSizeInLocalStorage(false);
      }
    }
  }, [userSettingsLoaded, userSettings?.targetHandSize]);


  
  // Start webcam with selected camera
  const startWebcam = async (cameraId: string) => {
    try {
      console.log('📷 Requesting startwebcam')
      const constraints = {
        video: {
          deviceId: { exact: cameraId },
          width: { ideal: 1080 }, // request the highest resolution
          height: { ideal: 720 },
          frameRate: { ideal: 9999 },
        },
        audio: false
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      // console.log('📷 Stream:', stream);
      // const track = stream.getVideoTracks()[0];  // Get the first video track
      // const settings = track.getSettings();      // Access the track settings
      if (webcamVideoRef.current) {
        webcamVideoRef.current.srcObject = stream;
        webcamVideoRef.current.play(); // Ensure the video plays
        // To ensure that width and height are defined and accurate, you should use the 'loadedmetadata' event
        webcamVideoRef.current.addEventListener('loadedmetadata', () => {
          const width = webcamVideoRef.current!.videoWidth;
          const height = webcamVideoRef.current!.videoHeight;
          console.log('✅📷 Webcam loadedmetadata with resolution:', width, 'x', height);      
        });
      }
    } catch (error) {
      console.error('❌📷 Error accessing webcam:', error);
      alert("❌📷 Error accessing webcam. Please enable your webcam and reload this page.");
    }
  };
  
  // Save changes
  // Save changes
  const handleContinue = async () => {
    console.log('Handle continue clicked: ', selectedHand, selectedFingertips, selectedAge, selectedSex)

   
    if (selectedHand === "none") {
      alert("Please select your most impaired hand. This will be used in some games and assessments.");
      return;
    }

    if (selectedFingertips === "none") {
      alert("Please select the image that best depicts your hand spasticity.");
      return;
    }

    if (selectedAge === 0) {
      alert("Please select your age using the slider.");
      return;
    }

    try {
      await saveUserProfile(selectedHand, selectedFingertips, selectedAge, selectedSex);
      await refreshUserSettings();

      
    } catch (error) {
      console.error("❌ Error saving profile:", error);
      alert("There was an error saving your profile. Please try again.");
    }

    // Navigate depending on whether hand size is saved
    if (!isHandSizeInLocalStorage) {
      navigate("/recordhandsize");
    } else {
      navigate("/");
    }
  };

 


  return (
  <div className="settings-container">
    <div className="popup-overlay">
      <div className="popup-container">
        {/* Cross to return to menu */}
        
        <div>
          <button
            onClick={handleContinue}
            aria-label="Close and go to home"
            className="closeIntroPopup-button"
          >
            &#10006;
          </button>
        </div>
        

        {/* Hand selection */}
        <div className="hand-selection">
          <h2 className="popup-title-text">Which is your most impaired hand?</h2>
          {(userSettingsLoaded && userSettings && selectedHand) ? (
            <div className="hand-buttons">
              {['Left', 'Right'].map((hand) => (
                <button
                  key={hand}
                  className={`popup-button ${selectedHand === hand ? 'selected' : ''}`}
                  onClick={() => setSelectedHand(hand)}
                  style={{
                    backgroundColor: selectedHand === hand ? '#4c51bf' : '',
                    color: selectedHand === hand ? 'white' : 'black',
                  }}
                >
                  {hand} Hand
                </button>
              ))}
            </div>
          ) : (
            <p>Loading hand preferences...</p>
          )}
        </div>

        {/* Spasticity severity */}
        <div className="spasticity-selection">
          <h2 className="popup-title-text">Describe your hand spasticity severity</h2>
          {(userSettingsLoaded && userSettings && selectedFingertips) ? (
            <div className="fingertips-buttons">
              {['knuckles', 'midknuckles', 'fingertips'].map((type) => (
                <img
                  key={type}
                  src={`/assets/${type}.jpg`}
                  alt={`Hand Spasticity ${type}`}
                  onClick={() => setSelectedFingertips(type)}
                  style={{
                    width: '200px',
                    height: 'auto',
                    border: `5px solid ${selectedFingertips === type ? '#4c51bf' : 'transparent'}`,
                    borderRadius: '20px',
                    cursor:'pointer',
                  }}
                />
              ))}
            </div>
           ) : (
            <p>Loading spasticity preferences...</p>
          )}
        </div>

        {/* Age slider */}
        <div className="age-selection">
          <h2 className="popup-title-text">How old are you?</h2>
          
          <div className="ageSlider-container">
             <div className = "ageBox">
              {selectedAge} yrs
            </div>
            <input
              type="range"
              min="5"
              max="100"
              value={selectedAge}
              onChange={(e) => setSelectedAge(Number(e.target.value))}
              style={{
                flex: 1,
                accentColor: '#4c51bf',
                minHeight: '10px',
                minWidth: '200px'
              }}
            />
           
          </div>
        </div>

        {/* Sex selection */}
        <div className="sex-selection">
          <h2 className="popup-title-text">Sex assigned at birth</h2>
          {(userSettingsLoaded && userSettings && selectedSex) ? (
            <div className="sex-buttons">
              {['Female', 'Male', 'Prefer not to say'].map((option) => (
                <button
                  key={option}
                  className={`popup-button ${selectedSex === option ? 'selected' : ''}`}
                  onClick={() => setSelectedSex(option)}
                  style={{
                    backgroundColor: selectedSex === option ? '#4c51bf' : '',
                    color: selectedSex === option ? 'white' : 'black',
                  }}
                >
                  {option}
                </button>
              ))}
            </div>
          ) : (
            <p>Loading sex preference...</p>
          )}
        </div>

        
        {/* Hand size section */}
        <div className="handSize-selection">
          <h2 className="popup-title-text">Calculate hand size</h2>
          <div className="handSize-buttons">
            {userSettingsLoaded && userSettings && isHandSizeInLocalStorage ? (
              <div className="sizeAndButton-container">
                <div className="ageBox">
                  Already calculated
                </div>
                <button
                  className="popup-button"
                  onClick={() => navigate("/recordhandsize")}
                >
                  Recalculate
                </button>
              </div>
            ) : (
              <button
                className="popup-button"
                onClick={() => handleContinue()}
              >
                Calculate hand size
              </button>
            )}
          </div>
        </div>

        {/* Camera preference */}
        <div className="camera-selection">
          <h2 className="popup-title-text">Choose your camera</h2>
          <select
            className="camera-dropdown"
            onChange={(e) => {
                setCameraSettings({ ...cameraSettings, cameraId: e.target.value });
            }}
            value={cameraSettings.cameraId || ''}
          >
            {cameraSettings.connectedCameras.map((camera) => (
              <option key={camera.deviceId} value={camera.deviceId}>
                🎦 {camera.label || `Camera ${camera.deviceId}`}
              </option>
            ))}
          </select>
        </div>

        {/* Wecam small video showing selected camera */}
        <div className="camera-preview">
          <video
            ref={webcamVideoRef}    
            playsInline
            muted
            className="small-video" 
          />
        </div>

        {/* Save Button */}
        <div className="popup-buttons-container">
          <button
            className="popup-button"
            onClick={handleContinue}
            style={{
              fontSize: '2.2rem',
              backgroundColor: '#4c51bf',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '10px',
              marginTop: '50px',
            }}
          >
            {isHandSizeInLocalStorage ? 'Save settings' : 'Continue to hand size'}
          </button>
        </div>
      </div>
    </div>
  </div>
);

};

export default Settings;

