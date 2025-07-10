import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Lottie from 'lottie-react';
import { HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

// Import external functions
import { drawLandmarks_simple, calculateDistance, calculateSpeed, calculateHandSizePX, applyGlowEffect, getGlowColor, calculateMeanDistance, generateSessionId, checkMovementStopped} from '../utils/utils';
import { checkNavigatorAgent, checkWebGLAvailability} from '../utils/checks';
import { saveResultsData } from '../utils/saveToLocalStorage';

// Import contexts
import { useUser } from "../contexts/UserContext"; 
import { useCamera } from "../contexts/CameraContext";

// Import styles
import './SharedStyles.css'
import './YourProject.css'
import '../utils/glowEffect.css';
import explosionAnimation from '../assets/explosion.json';
import ImpairmentScale from "../components/ImpairmentScale"; 

const YourProject = () => {
  const navigate = useNavigate();

  // Import camera settings
  const {cameraSettings, loading: cameraSettingsLoading} = useCamera();
  const [cameraSettingsLoaded, setCameraSettingsLoaded] = useState(false);

  // Import user settings
  const {userSettings, loading: userSettingsLoading} = useUser();
  const [userSettingsLoaded, setUserSettingsLoaded] = useState(false); // State to manage user settings loading

  // A task is an individual action that the user has to perform, like pointing with a finger
  const totalNumberOfTasks: number = 3; // Total number of tasks to perform in a session
  const taskRepsRef = useRef(1);        // Iterative counter for the number of task repetitions
  const taskFinishedRef = useRef(false);           // Ref to manage task completion
  const [taskResult, setTaskResult] = useState<number>(0); // State to manage the final outcome

  // A session is a collection of tasks that the user has to perform, like a training session
  const sessionIdRef = useRef<string>(generateSessionId());       // Ref to manage session ID
  const [startNewSession, setStartNewSession] = useState(false);  // State to manage session start
  const [sessionFinished, setSessionFinished] = useState(false);  // State to manage session completion
  const sessionFinishedRef = useRef(sessionFinished);             // Ref to manage session completion state
  const sessionResultsRef = useRef<number[]>([])                  // Ref to manage session results

  // Manage end of a session
  const [showConfetti, setShowConfetti] = useState(false);
  const [showResultsBox, setshowResultsBox] = useState(false);
  const resultsContainerRef = useRef<HTMLDivElement>(null); 

  // Webcam and Canvas states
  const webcamVideoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);                // canvasRef.current refers to the actual <canvas> element in the DOM.
  const canvasCtx = useRef<CanvasRenderingContext2D | null>(null);  // canvasCtx.current refers to the 2D rendering context of the canvas.
  const [webcamRunning, setWebcamRunning] = useState(false);
  const [canvasRunning, setCanvasRunning] = useState(false);

  // Hand-related states (models, landmarks, type of hand, etc)
  const handLandmarker = useRef<HandLandmarker | null>(null);
  const handSizeCMRef = useRef<number|null>(null); // Ref for storing distances
  const handSizePXRef = useRef<number>(0); // Ref for storing distances
  const [selectedHand, setSelectedHand] = useState<string>('Left'); // Ref to manage selected hand
  const selectedHandRef = useRef(selectedHand); // Ref to manage selected hand
  useEffect(() => {selectedHandRef.current = selectedHand;}, [selectedHand]); // Keep track of selectedHand changes
  const [selectedFingertips, setSelectedFingertips] = useState<string>('fingertips'); // State to manage selected fingertips
  const selectedFingertipsRef = useRef(selectedFingertips);
  useEffect(() => {selectedFingertipsRef.current = selectedFingertips;}, [selectedFingertips]);
 
  // UI-related states
  const [showIntroPopup, setShowIntroPopup] = useState(true); // State to manage the intro popup
  const [isWebGLAvailable, setWebGLAvailable] = useState<boolean>(true);

  // tutorial/instructions related states
  const [instructionsText, setInstructionsText] = useState('Example: Touch both index fingertips together');
  const [instructionsBigText, setInstructionsBigText] = useState<string>('Both hands'); // State to manage the label text

  // Detect the navigator agent
  const { isMac, isWindows, isAndroid, isiOS, isSafari, isChrome, isEdge } = checkNavigatorAgent(); // Check the user agent to determine the OS and browser

  // YourProject-specific states (proprioceptive metric, distance, speed, etc [fill with your own metrics])
  const resultsRef = useRef<number[]>([]); // This is an example on how to set a variable for storing results

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
          console.warn('⚠️‍🔥 User does not have hand size saved in Firestore');
        } else {
          console.log('✅️‍🔥 User has hand size saved in Firestore');
        }
        handSizeCMRef.current = retrievedHandSize;
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
   
    // Check for WebGL availability, and it not available show a popup
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

    if (userSettingsLoaded && !showIntroPopup){
      console.log("🚀🖐🏻 Starting hand prediction with predictWebcam()");
      predictWebcam();
    } 
  }, [webcamRunning, handLandmarker, showIntroPopup]);
  
  
  useEffect(() => { 
    console.log('🏁 Finished the session', sessionFinished);
    sessionFinishedRef.current = sessionFinished;
    if (sessionFinishedRef.current && canvasCtx.current){
      canvasCtx.current.clearRect(0, 0, canvasCtx.current.canvas.width, canvasCtx.current.canvas.height);
    }
    predictWebcam(); // Restart the prediction loop
  }, [sessionFinished]); 
 
  useEffect(() => { 
    if (startNewSession === true){
      console.log('🪜 Starting new session');
      sessionIdRef.current = generateSessionId(); // create new session ID
      
      sessionFinishedRef.current = false;
      taskRepsRef.current = 1;
      sessionResultsRef.current = []; // Reset session results

      setSessionFinished(false); // Reset session finished state
      setStartNewSession(false); 
    }
  }, [startNewSession]); // Reset session results when starting a new session

  useEffect(() => {
    if (showResultsBox) {
      const color = getGlowColor(taskResult);
      applyGlowEffect(resultsContainerRef.current, color);
    }
  }, [showResultsBox]);

  // Start webcam with the selected camera
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




  // For every frame, run the hand tracking model and the OpenPoint code
  const predictWebcam = async () => {
    // Check if the video element, handLandmarker, canvas context, and canvas context are defined
    const ctx = canvasCtx.current;
    if (!webcamVideoRef.current || !handLandmarker.current || !ctx) return;
    if (sessionFinishedRef.current) return;

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

        // At startup, check if the user's hand size was saved in their DB
     
      if (handSizeCMRef.current === null) {
        console.warn('User does not have hand size saved in Local Storage')
        navigate('/recordhandsize'); // Redirect to hand size calibration page
      }

      // Check if two hands are detected and if they are different hands
      if (results.handedness[0][0].categoryName !== results.handedness[1][0].categoryName){
        // console.log('🖐🏻🖐🏻 Two different hands detected');
        try {
          let fillColor = ''
          let targetHand: typeof results.landmarks[0] = results.landmarks[0];
          let pointingHand: typeof results.landmarks[0] = results.landmarks[0];

          ctx.save(); // Save the current state of the canvas (e.g., transformations like scale and translate)
          ctx.scale(-1, 1); // Flip the canvas horizontally
          ctx.translate(-ctx.canvas.width, 0); // Translate the canvas to adjust for the horizontal flip
          
          for (let i = 0; i < results.landmarks.length; i++) { // iterate for every hand
            // Access landmarks for the current hand
            const handLandmarks = results.landmarks[i];
           
            // Set the color based on handedness (Left or Right)
            if (results.handedness[i][0].categoryName === 'Right') {  // should be left but video is mirrored
              if (selectedHandRef.current === 'Left') {
                fillColor = 'rgb(64, 224, 208)';
                targetHand = handLandmarks; // Store the left hand landmarks as targetHand
              } else {
                fillColor = 'rgb(95, 224, 90)';
                pointingHand = handLandmarks; // Store the left hand landmarks as pointingHand
              }
            } else {
              if (selectedHandRef.current === 'Right') { 
                fillColor = 'rgb(64, 224, 208)';
                targetHand = handLandmarks; // Store the right hand landmarks as targetHand
              } else {
                fillColor = 'rgb(95, 224, 90)';
                pointingHand = handLandmarks; // Store the right hand landmarks as pointingHand
              }
            }
            // Pass the color and landmarks to drawLandmarks
            drawLandmarks_simple(ctx, handLandmarks, fillColor)
          }

          // Example of how to get the coordinates of the pointing hand's index finger tip in x and y
          const pointingHandX = webcamVideoRef.current.videoWidth * (1 - pointingHand[8].x);
          const pointingHandY = webcamVideoRef.current.videoHeight * pointingHand[8].y;
          
          // Get both fingertips coordinates
          let idx1 = [webcamVideoRef.current.videoWidth*(1-pointingHand[8].x), webcamVideoRef.current.videoHeight*pointingHand[8].y];
          let idx2 = [webcamVideoRef.current.videoWidth*(1-targetHand[8].x), webcamVideoRef.current.videoHeight*targetHand[8].y];

          // TODO -> Choose which landmarks to use for your proprioceptive metric
          
          // IMPLEMENT YOUR CODE HERE
          // TODO -> Implement your proprioceptive metric here
          /// **** The following code is just an example of how to calculate a proprioceptive metric **** ///

          // For example, calculate the distance between the two fingertips
          const score = calculateDistance(idx1, idx2);

          // Manage the end of the task based on a threshold or your own conditions
          if (score < 100 && taskFinishedRef.current === false) { // If the distance is less than 100 pixels and the task is not finished
            setTaskResult(score); 
            console.log('🏁🖐🏻 Task finished');
            taskFinishedRef.current = true;
            
            setshowResultsBox(true);
            if (taskRepsRef.current < totalNumberOfTasks) {
              setTimeout(() => {
                setshowResultsBox(false);
                taskFinishedRef.current = false;
              }, 3000); // Hide box after 3 seconds
            }
            taskRepsRef.current += 1;
            
            // Manage screen feedback if score is good
            if (score < 8) {
              setShowConfetti(true);
              setTimeout(() => setShowConfetti(false), 1000);
            }

            // Save results
            sessionResultsRef.current.push(score);
            saveResultsData("YourProject", sessionIdRef.current, sessionResultsRef.current);
          }
          /// **** End example **** ///
 
        } catch (error) {
          console.error('Error during hand landmark detection:', error);
        }
      }else{
        console.log('🖐🏻=🖐🏻 Both hands are the same, skipping frame');
      }
    } else {
      console.log('🖐🏻🖐🏻🖐🏻+ More than 2 hands detected, skipping frame');
    }

    ctx.restore(); // Restore the canvas state
    requestAnimationFrame(predictWebcam);
      
  };


  
  return (
    
    <div className="yourproject-container" style={isiOS ? { background: "black" } : {}}> 
    
      {!isWebGLAvailable ? (
        <div className="popupDebugContainer" >
        <div className="bg-red-500 text-white p-2 rounded">
          ⚠️ WebGL is disabled!  
          <br />
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

      {/* When your metric is good, show some confetti animation */}
      {showConfetti && (
        <div className="confettiContainer">
        <Lottie
          animationData={explosionAnimation}
          loop={true}
          autoplay
          style={{ width: '100%', height: '100%' }}
        />
      </div>
      )}

      {/* After each movement, show the results. Also show the sessionr esults when all tasks are finished */}
      {showResultsBox && (
        <div className="resultsContainer" ref={resultsContainerRef}>
          {taskRepsRef.current <= totalNumberOfTasks ? (
            <>
              <label className="resultsText">{taskResult.toFixed(2)}</label>
              
            </>
          ) : (
            <div className="resultsInColumn">
              <label className="resultsText">
                Mean: {calculateMeanDistance(sessionResultsRef.current)}
              </label>
              {sessionResultsRef.current.map((score, index) => {
                let color = '';
                // TODO -> Change these thresholds to your own metric thresholds
                if (score < 2) {
                  color = 'green';
                } else if (score < 5) {
                  color = 'orange';
                } else {
                  color = 'red';
                }

                return (
                  <label
                    key={index}
                    className="resultsTextInches"
                    style={{ color }}
                  >
                    {score.toFixed(2)}
                  </label>
                );
              })}

              <button
                onClick={() => {
                  setStartNewSession(true); 
                  setshowResultsBox(false);
                  taskFinishedRef.current = false;
                 
                  
                }}
                className="popup-button"
              >
                Restart Session
              </button>
            </div>
          )}



        </div>
      )}
  
      {/* Choose between Assessment or Game mode */}
      {showIntroPopup && (
        <div className="popup-overlay" >
          <div className="popup-container">
            <div>
              <button
                onClick={() => navigate('/')}
                aria-label="Close and go to home"
                className='closeIntroPopup-button'
              >
                &#10006;
              </button>
              <h2 className="popup-title-text">Are you ready?</h2>
              
              <button 
                className={`introPopup-button`} 
                onClick={() => setShowIntroPopup(false)}
                disabled={!(webcamRunning && canvasRunning)}
                style={{ 
                  opacity: (webcamRunning && canvasRunning) ? 1 : 0.3,
                  cursor: (webcamRunning && canvasRunning) ? 'pointer' : 'not-allowed',
                  fontSize: '2rem'
                }}
              >
              Start
              </button>
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
        <canvas ref={canvasRef} className="canvas show" />      
      </div>

      {/* Tutorial video and instructions */}
        <div className='tutorialContainer'>
          <img
            className='imgTutorial'
            src={"/assets/yourproject-instructions.png"}
          />

          {/* Instructions or Blender File */}
          <div className="instructionsContainer">
              <p className="instructions_text">{instructionsText}</p>  
          </div>

          {/* TODO -> Change the thresholds for your impairment scale to provide feedback on the proprioceptive accuracy */}
          <ImpairmentScale error={calculateMeanDistance(sessionResultsRef.current)} />


          {!isiOS && (
            <div> 
              <label className="fingerLabelBig_text">
                {instructionsBigText}
              </label>  
            </div>
          )}
        </div>   
    </div>
  );

};

export default YourProject;

