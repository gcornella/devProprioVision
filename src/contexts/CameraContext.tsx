import React, {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useContext,
  useRef,
  useCallback,
} from "react";

// Types
interface CameraSettings {
  connectedCameras: MediaDeviceInfo[];
  cameraId: string;
}

interface CameraContextType {
  cameraSettings: CameraSettings;
  setCameraSettings: (settings: CameraSettings) => void;
  loading: boolean;
  refreshCameras: () => Promise<void>;
}

interface CameraProviderProps {
  children: ReactNode;
}

// Context
const CameraContext = createContext<CameraContextType | null>(null);

// Provider
export const CameraProvider: React.FC<CameraProviderProps> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [cameraSettings, setCameraSettingsState] = useState<CameraSettings>({
    connectedCameras: [],
    cameraId: '',
  });

  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    const initializeCamera = async () => {
      await requestCameraAccess();
      if (isMountedRef.current) {
        await refreshCameras();
      }
    };

    initializeCamera();

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const requestCameraAccess = async () => {
    try {
      const permission = await navigator.permissions.query({
        name: "camera" as PermissionName,
      });

      if (permission.state === "granted" || permission.state === "prompt") {
        console.log(`📷 Camera permission: ${permission.state}`);
        await navigator.mediaDevices.getUserMedia({ video: true });
        console.log("📷✅ Webcam access granted!");
      } else {
        showCameraBlockedWarning();
      }
    } catch (error) {
      console.error("📷❌ Error requesting webcam:", error);
      showCameraBlockedWarning();
    }
  };

  const showCameraBlockedWarning = () => {
    alert(
      "📷❌ Your browser or device is blocking camera access. Please enable it.\n\nLearn more: https://support.google.com/chrome/answer/2693767"
    );
  };

  const refreshCameras = useCallback(async () => {
    setLoading(true);
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(
        (device) => device.kind === "videoinput" && device.deviceId !== ""
      );

      if (videoDevices.length === 0) {
        console.warn("📷 No cameras found.");
        return;
      }

      const savedCameraId = localStorage.getItem("selectedCameraId");
      const defaultCameraId = savedCameraId && videoDevices.some(d => d.deviceId === savedCameraId)
        ? savedCameraId
        : videoDevices[0].deviceId;

      setCameraSettingsState({
        connectedCameras: videoDevices,
        cameraId: defaultCameraId,
      });
    } catch (error) {
      console.error("📷❌ Failed to enumerate devices:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // This wrapper saves to both state and localStorage
  const setCameraSettings = (settings: CameraSettings) => {
    setCameraSettingsState(settings);
    localStorage.setItem("selectedCameraId", settings.cameraId);
  };

  return (
    <CameraContext.Provider
      value={{ cameraSettings, setCameraSettings, loading, refreshCameras }}
    >
      {children}
    </CameraContext.Provider>
  );
};

// Hook
export const useCamera = (): CameraContextType => {
  const context = useContext(CameraContext);
  if (!context) {
    throw new Error("useCamera must be used within a CameraProvider");
  }
  return context;
};
