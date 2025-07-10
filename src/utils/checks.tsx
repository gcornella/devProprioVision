// Robust platform and browser detection
export const checkNavigatorAgent = () => {
  const ua = navigator.userAgent || "";
  const vendor = navigator.vendor || "";

  // OS Detection
  const isMac = /Macintosh|Mac OS X/i.test(ua);
  const isWindows = /Windows/i.test(ua);
  const isAndroid = /Android/i.test(ua);

  // iOS detection (also detects iPadOS masquerading as macOS)
  const isiOS =
    /iPhone|iPad|iPod/i.test(ua) ||
    (ua.includes("Macintosh") && "ontouchend" in document);

  // Browser detection
  const isSafari =
    /Safari/i.test(ua) &&
    !/Chrome|CriOS|Edg|Edge|OPR|Firefox/i.test(ua) &&
    vendor === "Apple Computer, Inc.";

  const isChrome =
    (/Chrome|CriOS/i.test(ua) || ua.includes("Chromium")) &&
    /Google Inc/.test(vendor);

  const isEdge = /Edg|Edge/i.test(ua);

  return {
    isMac,
    isWindows,
    isAndroid,
    isiOS,
    isSafari,
    isChrome,
    isEdge,
    userAgent: ua, // for debugging purposes
  };
};



export const checkTutorialFileExists = (directory: string, filesToCheck: string[]) => {
  filesToCheck.forEach((fileName) => {
    const filePath = `${directory}/${fileName}`;

    fetch(filePath, { method: "HEAD" })
      .then((res) => {
        if (!res.ok) {
          console.error(`Video not found: ${filePath}`);
        } else {
          console.log(`Video found: ${filePath}`);
        }
      })
      .catch((error) => {
        console.error(`Error checking file ${filePath}:`, error);
      });
  });
};
  

export function checkWebGLAvailability(canvas:any) {
  const gl = !!(canvas.getContext("webgl") || canvas.getContext("experimental-webgl"));
  if (!gl) {
    console.log('WebGL is not available');
    return false;
  } else {
    console.log('WebGL is available');
    return true;
  }
}


export const checkWebcamVideoReadable = (videoElement: HTMLVideoElement ) => {
  // Check if the videoRef and the srcObject (stream) are set
  if (!videoElement) {
    console.log("videoRef.current is null or undefined");
    return false;
  }
      
  // Check if the video has a stream attached (i.e., srcObject is set)
  if (!videoElement.srcObject) {
    console.log("No video stream attached to the video element");
    return false;
  }

  // Check if the video has enough data loaded to be readable (readyState 4 means video is ready to play)
  if (videoElement.readyState < 4) {
    console.log("Video is not ready to be used for hand tracking (not enough data loaded)");
    return false;
  }

  // Video is ready for handLandmarker detection
  console.log("Webcam video is readable and ready for hand tracking");
  return true;
};