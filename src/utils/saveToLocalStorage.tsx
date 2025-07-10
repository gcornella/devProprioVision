const GUEST_ID = "guest";

// Save guest login info to localStorage
export const saveToLocalStorage = async () => {
  const userData = {
    uid: GUEST_ID,
    email: "guest@example.com",
    displayName: "Guest User",
    photoURL: "",
    createdAt: new Date().toISOString(),
  };

  try {
    localStorage.setItem(`user_${GUEST_ID}_loginInfo`, JSON.stringify(userData));
    console.log("✅ Guest user saved to localStorage.");
  } catch (error) {
    console.error("❌ Error saving guest user:", error);
  }
};

// Retrieve HandSize value from localStorage
export const getHandSize = async (): Promise<number | null> => {
  try {
    const dataStr = localStorage.getItem(`user_${GUEST_ID}_profile`);
    if (!dataStr) {
      console.log("📭 No hand size data found.");
      return null;
    }

    const data = JSON.parse(dataStr);
    const handSize = data?.targetHandSize;

    if (handSize !== undefined) {
      console.log("🖐️ Retrieved HandSize:", handSize);
      return handSize;
    } else {
      console.log("ℹ️ HandSize not set.");
      return null;
    }
  } catch (error) {
    console.error("❌ Error retrieving HandSize:", error);
    return null;
  }
};

// Save hand size to localStorage under specific key
export const saveUserHandSize = async (
  handSize: number,
  targetOrPointing: 'targetHandSize' | 'pointingHandSize'
): Promise<void> => {
  try {
    const profileKey = `user_${GUEST_ID}_profile`;
    const existingProfile = localStorage.getItem(profileKey);
    const parsedProfile = existingProfile ? JSON.parse(existingProfile) : {};

    // Save hand size in the appropriate field
    parsedProfile[targetOrPointing] = handSize;

    localStorage.setItem(profileKey, JSON.stringify(parsedProfile));
    console.log(`✍️ ${targetOrPointing} (${handSize}) saved in guest profile.`);
  } catch (error) {
    console.error("❌ Error saving handSize to profile:", error);
  }
};

// Save guest profile to localStorage
export const saveUserProfile = async (
  impairedHand: string,
  spasticitySeverity: string,
  selectedAge: number,
  selectedSex: string
): Promise<void> => {
  try {
    const profileKey = `user_${GUEST_ID}_profile`;
    const existingProfile = localStorage.getItem(profileKey);
    const parsedProfile = existingProfile ? JSON.parse(existingProfile) : {};

    // Merge the new data with existing fields
    const updatedProfile = {
      ...parsedProfile,
      impairedHand,
      spasticitySeverity,
      age: selectedAge,
      sex: selectedSex,
    };

    localStorage.setItem(profileKey, JSON.stringify(updatedProfile));
    console.log("✅ Guest profile saved to localStorage (merged).");
  } catch (error) {
    console.error("❌ Error saving profile:", error);
  }
};


// Save assessment results (e.g. pointing errors) to localStorage
export const saveResultsData = async (
  assessmentName: string,
  sessionId: string,
  resultsMetrics: any
): Promise<void> => {
  try {
    const key = `user_${GUEST_ID}_${assessmentName}_${sessionId}`;
    const result = {
      data: resultsMetrics,
      timestamp: new Date().toISOString(),
    };

    localStorage.setItem(key, JSON.stringify(result));
    console.log(`📌 Results saved under ${key}`);
  } catch (error) {
    console.error("❌ Error saving results:", error);
  }
};
