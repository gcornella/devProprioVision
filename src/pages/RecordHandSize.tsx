import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

// Import external functions
import { drawLandmarks_simple, calculateHandSizeCM } from '../utils/utils';
import { checkNavigatorAgent, checkWebGLAvailability} from '../utils/checks';
import { saveUserHandSize } from '../utils/saveToLocalStorage';

// Import contexts
import { useUser } from "../contexts/UserContext";
import { useCamera } from "../contexts/CameraContext";

// Import styles
import './SharedStyles.css'
import './RecordHandSize.css'

const RecordHandSize = () => {
  const navigate = useNavigate();

  // Import camera settings
  const {cameraSettings, loading: cameraSettingsLoading} = useCamera();
  const [cameraSettingsLoaded, setCameraSettingsLoaded] = useState(false);

  // User context
  const {userSettings, loading: userSettingsLoading, refreshUserSettings} = useUser();
  const [userSettingsLoaded, setUserSettingsLoaded] = useState(false);

  // Start and End of a session states
  const [showStartBox, setShowStartBox] = useState(true);         // When true, show a container with a "start" button
  const [start, setStart] = useState(false);                      // True when all elements are ready (camera, hand model, canvas, etc)
  const [showFinishedBox, setShowFinishedBox] = useState(false);  // When true, show a container with a "back to home" button

  // Webcam and Canvas 
  const webcamVideoRef = useRef<HTMLVideoElement>(null);          // Webcam <video> element reference
  const canvasRef = useRef<HTMLCanvasElement>(null);              // Drawing <canvas> element reference - the actual <canvas> element in the DOM.
  const canvasCtx = useRef<CanvasRenderingContext2D | null>(null);// 2D canvas context reference - the 2D rendering context of the canvas.
  const [webcamRunning, setWebcamRunning] = useState(false);      // Flag to store whether webcam is active (all metadata has been loaded)
  const [canvasRunning, setCanvasRunning] = useState(false);      // True if canvas for drawing is properly initialized

  // Hand-related states (models, landmarks, type of hand, etc)
  const handLandmarker = useRef<HandLandmarker | null>(null);     // Hand tracking model instance 
  const handSizesTargetArrayRef = useRef<number[]>([]);           // Store 10 seconds of target hand sizes in an array, to calculate the mean
  const handSizeTargetCMRef = useRef<number|null>(null);          // The final calculated target hand size (in centimeters)
  const handSizesPointingArrayRef = useRef<number[]>([]);         // Store 10 seconds of pointing hand sizes in an array, to calculate the mean
  const handSizePointingCMRef = useRef<number|null>(null);        // The final calculated pointing hand size (in centimeters)
  const [selectedHand, setSelectedHand] = useState<string>('Left');
  const selectedHandRef = useRef<string | null>(null);
  useEffect(() => {selectedHandRef.current = selectedHand;}, [selectedHand]);
  const [selectedFingertips, setSelectedFingertips] = useState<string>('fingertips');
  const selectedFingertipsRef = useRef<string | null>(null);
  useEffect(() => {selectedFingertipsRef.current = selectedFingertips;}, [selectedFingertips]);

  // UI-related states
  const [isWebGLAvailable, setWebGLAvailable] = useState<boolean>(true);
  const [, forceRender] = useState(0);

  // Tutorial related states
  const instructionsText = 'Show your hands to the camera for 10 seconds';
  const instructionsBigText = 'Show both hands';

  // RecordHandSize-specific variables
  const handSizeLoadingRef = useRef(0);
  const [progress, setProgress] = useState(0); // value from 0 to 400

  // Detect navigator agents
  const { isMac, isWindows, isAndroid, isiOS, isSafari, isChrome, isEdge } = checkNavigatorAgent();

  // The camera settings have been loaded
  useEffect(() => {
    if (!cameraSettingsLoading && cameraSettings) {
      setCameraSettingsLoaded(true);
      console.log('✅️📷 Camera settings loaded: ', cameraSettings);
    }
  }, [cameraSettingsLoading, cameraSettings]);

  // Check if camera settings are loaded and cameraId is available, then initialize webcam
  useEffect(() => {
    let cleanupListener: (() => void) | undefined;

    const initializeWebcam = async () => {
      if (cameraSettings.cameraId && cameraSettings.cameraId !== "defaultCamera") {
        console.log('📷 selectedCameraId: ', cameraSettings.cameraId);
        cleanupListener = await startWebcam(cameraSettings.cameraId); // Store cleanup function
      } else {
        if (webcamVideoRef.current && webcamVideoRef.current.srcObject) {
          console.warn('⚠📷 Problem might be here');
          const stream = webcamVideoRef.current.srcObject as MediaStream;
          stream.getTracks().forEach(track => track.stop());
          webcamVideoRef.current.srcObject = null;
        }
      }
    };

    if (cameraSettingsLoaded && cameraSettings) {
      initializeWebcam();
    }

    return () => {
      if (cleanupListener) {
        cleanupListener();
      }
    };
  }, [cameraSettingsLoaded, cameraSettings]);

  // The user settings have been loaded
  useEffect(() => {
    if (!userSettingsLoading && userSettings) {
      setSelectedHand(userSettings.impairedHand);
      setSelectedFingertips(userSettings.spasticitySeverity);
      setUserSettingsLoaded(true);
      console.log('✅️👤 User settings loaded: ', userSettings);
    }
  }, [userSettingsLoading, userSettings]);

  // Check if user settings are loaded and currentUser is available, then check if hand size is saved in userSettings
  useEffect(() => {
    const checkHandSizeIsSaved = async () => {
      if (userSettings) {
        const retrievedHandSize = userSettings.targetHandSize;
        if (retrievedHandSize === 0) {
          console.warn('⚠️‍🔥 User does not have hand size saved in Local Storage');
        } else {
          console.log('✅️‍🔥 User has hand size saved in Local Storage');
        }
        handSizeTargetCMRef.current = retrievedHandSize;
        }
    }
    if (userSettingsLoaded) {
      checkHandSizeIsSaved();
    }
  }, [userSettingsLoaded]); 

  // Detect OS and browser
  useEffect(() => {
    console.log('💻 isMac: ', isMac);
    console.log('📱 isIOS: ', isiOS);
    console.log('💻 isWindows: ', isWindows);
    console.log('📱 isAndroid: ', isAndroid);
    console.log("👨🏼‍💻 Safari:", isSafari);
    console.log("👨🏼‍💻 Chrome:", isChrome);
    console.log("👨🏼‍💻 Edge:", isEdge);
  }, []); 

  // Initialization
  useEffect(() => {
    const initializeCanvas = async () => {
      if (canvasRef.current) {
        canvasCtx.current = canvasRef.current.getContext('2d');
        setCanvasRunning(true);
        console.log('✅️📜 Canvas context initialized');
      }else{
        console.error('❌📜 CanvasRef element not found');
        setCanvasRunning(false);
      }
    };

    // Check for WebGL availability, and if not available show a popup
    setWebGLAvailable(checkWebGLAvailability(document.createElement("canvas")));   
    // Create the hand landmarker
    createHandLandmarker(); 
    // Add event listener to resize the canvas on window resize
    window.addEventListener('resize', resizeCanvas);
    // Initialize the canvasCtx if canvasRef exists
    initializeCanvas();
    
    return () => {
      window.removeEventListener('resize', resizeCanvas ); // Clean up the event listener when the component unmounts
      console.log('📜 Removed canvas event listener')
      
      // Cleanup function to stop the video stream
      if (webcamVideoRef.current && webcamVideoRef.current.srcObject) {
        const stream = webcamVideoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        webcamVideoRef.current.srcObject = null;
      }
    };   
  }, []); 

  // Trigger rerender to detect change in state for ref variables
  useEffect(() => {
    const interval = setInterval(() => {
      forceRender(prev => prev + 1); // just triggers re-render
    }, 100); // every 100ms – smooth and not too frequent
    return () => clearInterval(interval);
  }, []);

  // Checks before starting the hand predictions
  useEffect(() => {
    if (!webcamRunning) {return}
    
    console.log("✅📝 webcamRunning is true");
  
    const video = webcamVideoRef.current;
    const ctx = canvasCtx.current;
    const canvas = canvasRef.current;
  
    // Check if required video elements exist
    if (!video) {console.error("❌ - webcamVideoRef is null or undefined");return;}
    if (!video.srcObject) {console.error("❌ No video stream attached to video element.");return;}
    if (video.readyState < 4) {console.error("❌ Video is not ready for hand tracking (readyState < 4).");return;}
    if (video.videoWidth === 0 || video.videoHeight === 0) {console.error("❌ Video dimensions are 0 (width or height).");return;}
    console.log("📝 Video dimensions are AVAILABLE, and not 0");

    // Check if hand landmarker exists
    if (!handLandmarker) {console.error("❌ - handLandmarker is not initialized");return;}
    console.log("📝 Hand Landmark Model is AVAILABLE.");

    // Check if canvas and context exist
    if (!canvas || !ctx) {console.error("❌ - canvas or canvasCtx is null or undefined");return;}
    console.log("📝 Canvas is AVAILABLE.");

    // Set initial canvas size
    resizeCanvas();

    if (userSettingsLoaded && start){
      console.log("🚀🖐🏻 Starting hand prediction with predictWebcam()");
      predictWebcam();
    } 
  }, [webcamRunning, handLandmarker, start]);
  
  // Request webcam access using a specified camera ID, play the video stream in a video element, logs its resolution, and set up a listener to update state when the video is ready, returning a cleanup function to remove the listener.
  const startWebcam = async (cameraId: string): Promise<(() => void) | undefined> => {
    try {
      console.log('📷 Starting webcam...');
      const constraints = {
        video: {
          deviceId: { exact: cameraId },
          width: { ideal: 1080 },
          height: { ideal: 720 },
          frameRate: { ideal: 9999 },
        },
        audio: false
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      const track = stream.getVideoTracks()[0];
      const settings = track.getSettings();
      console.log('📷 Video Resolution:', settings.width, 'x', settings.height);

      if (webcamVideoRef.current) {
        const videoEl = webcamVideoRef.current;
        videoEl.srcObject = stream;
        videoEl.play();

        const handleLoadedData = () => {
          console.log('📷✅ Webcam started');
          setWebcamRunning(true);
        };

        videoEl.addEventListener('loadedmetadata', handleLoadedData);

        // Return cleanup function
        return () => {
          videoEl.removeEventListener('loadedmetadata', handleLoadedData);
        };
      }

      // If webcamVideoRef.current is null, return undefined
      return undefined;

    } catch (error) {
      console.error('📷❌ Error accessing webcam:', error);
      alert("📷❌ Error accessing webcam. Please enable your webcam and reload this page.");
      // Return undefined on error
      return undefined;
    }
  };

  // Create the Hand Landmarker 
  const createHandLandmarker = async () => {
    if (handLandmarker.current) return; // Prevent re-creating if already exists
    // Load and prepare the WebAssembly (WASM) runtime from the given CDN to run MediaPipe Vision tasks (like hand tracking) in the browser.
    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
    );
    // Initialize the actual hand tracking model using the vision runtime, and configure how it should behave.
    const model = await HandLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
        delegate: "GPU",
      },
      runningMode: "VIDEO",
      numHands: 2,
    });
    handLandmarker.current = model;
    console.log("🖐🏻Hand landmarker created", model);
  };

  // Function to resize the canvas based on the webcam video dimensions
  const resizeCanvas = () => {
    console.log('📜Canvas resize called');
    // Check if webcam video and canvas references are available
    if (webcamVideoRef.current && canvasRef.current  && canvasCtx.current) {
      // Log the video dimensions to ensure they are correct
      console.log(`📷 Video dimensions - Width: ${webcamVideoRef.current.videoWidth}, Height: ${webcamVideoRef.current.videoHeight}`);
      // Set canvas size to match the video size
      canvasRef.current.width = webcamVideoRef.current.videoWidth;
      canvasRef.current.height = webcamVideoRef.current.videoHeight;
      console.log(`📜Canvas resized - Width: ${canvasRef.current.width}, Height: ${canvasRef.current.height}`);
      // Resize the canvas context to match the updated canvas size
      canvasCtx.current.canvas.width = webcamVideoRef.current.videoWidth;
      canvasCtx.current.canvas.height = webcamVideoRef.current.videoHeight;
      console.log(`📜Canvas context resized - Width: ${canvasCtx.current.canvas.width}, Height: ${canvasCtx.current.canvas.height}`);
    } else {
      console.error('❌📜Canvas or webcam video reference is missing!');
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(handSizeLoadingRef.current);
    }, 100); // update every 100ms

    return () => clearInterval(interval);
  }, []);

  // Get the hand size at every frame of the hand tracking detection, and store in an array
  const calculateAndSaveHandSize = async (handLandmarksW: any, isTargetHand: boolean ) => {
   
    if (isTargetHand){
      const handSizeTargetCM = calculateHandSizeCM(handLandmarksW); // Calculate hand size in cm
      handSizesTargetArrayRef.current.push(handSizeTargetCM); // Store the hand size in the array
      //setProgress(handSizesTargetArrayRef.current.length); // trigger rerender
      handSizeLoadingRef.current = handSizesTargetArrayRef.current.length;  // Ref to store the size of the filled array, to display a progress bar
    }else{
      const handSizePointingCM = calculateHandSizeCM(handLandmarksW);
      handSizesPointingArrayRef.current.push(handSizePointingCM); 
    }
    
    // If array is filled (approx. 400 frames)
    if(handSizesTargetArrayRef.current.length >= 400) {
      const handSizeTargetMean = handSizesTargetArrayRef.current.reduce((a, b) => a + b, 0) / handSizesTargetArrayRef.current.length; // Calculate the mean of the target hand sizes
      const handSizePointingMean = handSizesPointingArrayRef.current.reduce((a, b) => a + b, 0) / handSizesPointingArrayRef.current.length; // Calculate the mean of the pointing hand sizes
      handSizeTargetCMRef.current = handSizeTargetMean; // Store the mean in the target ref
      handSizePointingCMRef.current = handSizePointingMean; // Store the mean in the pointing ref
      
      console.log('🖐🏻 Target Hand size mean in cm is: ', handSizeTargetMean)
      console.log('🖐🏻 Pointing Hand size mean in cm is: ', handSizeTargetMean)

      // Save to Local Storage
      console.log('️‍🔥 Saving hand size to Local Storage');
      saveUserHandSize(handSizeTargetMean, 'targetHandSize'); 
      saveUserHandSize(handSizePointingMean, 'pointingHandSize'); 
      console.log('️‍🔥✅ Data saved properly')
      
      setShowFinishedBox(true);

      // Reset the arrays
      handSizesTargetArrayRef.current = []; 
      handSizesPointingArrayRef.current = []; 
      handSizeLoadingRef.current = 400;
    } 
  } 

  // Function to handle when the "start" button is pressed
  const handleSessionStart = () => {
    setStart(true);
    setShowStartBox(false); 
  }


  const handleFinish = async () => {
    try {
      await refreshUserSettings();
      navigate("/");
    } catch (error) {
      console.error("❌ Failed to refresh user settings:", error);
      alert("Could not finish loading. Please try again.");
    }
  };

                  
  // For every frame, run the hand tracking model and the OpenPoint code
  const predictWebcam = async () => {
    // Double check if the video element, handLandmarker, canvas context, and canvas context are defined
    const ctx = canvasCtx.current;
    if (!webcamVideoRef.current || !handLandmarker.current || !ctx) return;
    
    // Clear the entire canvas
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
   
    // Run the hand landmark model for this frame
    const results = await handLandmarker.current.detectForVideo(webcamVideoRef.current, performance.now());

    // No hands detected
    if (results.handedness.length==0){
      // Add a warning to let the user know he has to show both hands
    } 
    // Just one hand detected
    else if (results.handedness.length==1){
      // console.log('🖐🏻 One hand detected, and its handedness is: ', results.handedness[0][0].categoryName==='Right' ? 'Left': 'Right');
    }else if(results.handedness.length==2){
      // Check if two hands are detected and if they are different hands
      if (results.handedness[0][0].categoryName !== results.handedness[1][0].categoryName){
        // console.log('🖐🏻🖐🏻 Two different hands detected');
        try {
          let fillColor = ''
          let thisIterationHand = ''
          ctx.save();                           // Save the current state of the canvas (e.g., transformations like scale and translate)
          ctx.scale(-1, 1);                     // Flip the canvas horizontally
          ctx.translate(-ctx.canvas.width, 0);  // Translate the canvas to adjust for the horizontal flip
          // iterate for every hand
          for (let i = 0; i < results.landmarks.length; i++) { 
            //console.log('Selected hand as target is: ', selectedHandRef.current)
            
            const handLandmarks = results.landmarks[i];       // Access Landmarks for the current hand
            const handLandmarksW = results.worldLandmarks[i]; // Access World landmarks for the current hand

            // Set the color based on handedness (Left or Right)
            if (results.handedness[i][0].categoryName === 'Right') {  // should be left but video is mirrored
              thisIterationHand = 'Left'
              if (selectedHandRef.current === 'Left') {
                fillColor = 'rgb(64, 224, 208)';
              } else {
                fillColor = 'rgb(95, 224, 90)';
              }
            } else {
              thisIterationHand = 'Right'
              if (selectedHandRef.current === 'Right') { 
                fillColor = 'rgb(64, 224, 208)';
              } else {
                fillColor = 'rgb(95, 224, 90)';
              }
            }
            // Pass the color and landmarks to drawLandmarks, and just draw the dots on top of the landmarks in a simple way
            drawLandmarks_simple(ctx, handLandmarks, fillColor)
            
            // Get HAND SIZE form either the target or the pointing hand if not saved previously
            calculateAndSaveHandSize(handLandmarksW, thisIterationHand===selectedHand); 
          }
        } catch (error) {
          console.error('❌🖐🏻 Error during hand landmark detection:', error);
        }
      }else{
        console.warn('⚠️🖐🏻=🖐🏻 Both hands are the same, skipping frame');
      }
    } else {
      console.warn('⚠️🖐🏻🖐🏻🖐🏻+ More than 2 hands detected, skipping frame');
    }
    ctx.restore(); // Restore the canvas state
    requestAnimationFrame(predictWebcam);   
  };

  return (
    <div className="secondarypage-container"> 
       {/* Conditionally displays a red warning popup with a WebGL enablement guide link only if isWebGLAvailable is false*/}
      {!isWebGLAvailable ? (
        <div className="popupDebugContainer">
          <div className="bg-red-500 text-white p-2 rounded">
            ⚠️ WebGL is disabled!  
            <br/>
            ➡️ Enable it in your browser to use the hand tracking model:  
            <a
              href="https://help.constructiononline.com/en/scheduling-webgl-and-hardware-acceleration"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-300 underline"
            >
              WebGL & Hardware Acceleration Guide
            </a>
          </div>
        </div>
      ) : null}

      {/* A "start" container with a button to make sure that all the elements have been loaded before starting to record hand size */}
      {showStartBox && (
        <div className="popup-overlay" >
          <div className="popup-container">
            <div>
              
              <button 
                className="introPopup-button" 
                onClick={handleSessionStart}
                disabled={!(webcamRunning && canvasRunning && handLandmarker)}
              >
                Record hand size
              </button>
            </div>
          </div>
        </div>
      )}

       {/* A "finish" container that informs when hand size is recorded with a button that return to the main page*/}
      {showFinishedBox && (
        <div className="popup-overlay" >
          <div className="popup-container">
            <div>
              
              <div style={{display: 'flex', flexDirection: 'column'}}>
                <label className="resultsText"> Hand size recorded!</label>
                <button 
                  className="introPopup-button" 
                  onClick={() => {
                    handleFinish()
                  
                  }}
                >
                  Back to main menu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
 
      {/* The webcam video and canvas */}
      <div className="video-canvas-overlay">
        <video 
          ref={webcamVideoRef}    
          playsInline
          muted 
          className="video show" 
          style={{ filter: 'grayscale(100%)', transform: 'scaleX(-1)' }} //
        />
        <canvas 
          ref={canvasRef} 
          className="canvas show" 
        />  
      </div> 

      {/* Tutorial video and instructions */}
      {webcamRunning &&(
        <div className='tutorialContainer'>
          <img
            className='imgTutorial'
            src={"/assets/HandCalibAnimation.png"}
          />
          {/* Instructions or Blender File */}
          <div className="instructionsContainer">
              <p className="instructions_text">{instructionsText}</p>  
          </div>
          <div>
            <label className="fingerLabelBig_text">{instructionsBigText}</label>  
          </div>
          {!showFinishedBox &&(
            <div className="progress-bar-container">
              <div 
                className="progress-bar-fill"
                style={{ width: `${progress/400*100}%`}}
              >
                
              </div>
            </div>
          )}
        </div>
      )}   
    </div>
  );
};

export default RecordHandSize;

