export const createPageUrl = (pageName) => {
  const pageMap = {
    Home: "/",
    Upload: "/upload",
    Scripts: "/scripts",
    Performance: "/performance",
    Rehearsal: "/rehearsal",
    ScriptDetail: "/script-detail",
  };

  // Check if pageName contains query parameters
  if (pageName.includes("?")) {
    const [basePage, queryString] = pageName.split("?");
    const baseUrl = pageMap[basePage] || "/";
    return `${baseUrl}?${queryString}`;
  }

  return pageMap[pageName] || "/";
};

// Data storage utilities
export const getStorageInfo = () => {
  const scripts = localStorage.getItem("linecoach_scripts");
  const sessions = localStorage.getItem("linecoach_sessions");

  const scriptsData = scripts ? JSON.parse(scripts) : [];
  const sessionsData = sessions ? JSON.parse(sessions) : [];

  const totalSize = new Blob([scripts, sessions].filter(Boolean)).size;
  const maxSize = 5 * 1024 * 1024; // 5MB typical localStorage limit

  return {
    scripts: scriptsData.length,
    sessions: sessionsData.length,
    totalSize: totalSize,
    maxSize: maxSize,
    usagePercentage: (totalSize / maxSize) * 100,
    storageUsed: `${(totalSize / 1024 / 1024).toFixed(2)}MB`,
    storageLimit: `${(maxSize / 1024 / 1024).toFixed(2)}MB`,
  };
};

export const clearAllData = () => {
  localStorage.removeItem("linecoach_scripts");
  localStorage.removeItem("linecoach_sessions");
  return true;
};

export const formatExpirationDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Clear all LineCoach data from localStorage
export const clearAllLineCoachData = () => {
  const keysToRemove = ["linecoach_scripts", "linecoach_sessions"];

  keysToRemove.forEach((key) => {
    localStorage.removeItem(key);
  });

  console.log("All LineCoach data cleared from localStorage");
};

// Get storage usage information
export const getStorageUsage = () => {
  const scripts = localStorage.getItem("linecoach_scripts");
  const sessions = localStorage.getItem("linecoach_sessions");

  const scriptsSize = scripts ? new Blob([scripts]).size : 0;
  const sessionsSize = sessions ? new Blob([sessions]).size : 0;

  return {
    scripts: {
      size: scriptsSize,
      sizeKB: (scriptsSize / 1024).toFixed(2),
      count: scripts ? JSON.parse(scripts).length : 0,
    },
    sessions: {
      size: sessionsSize,
      sizeKB: (sessionsSize / 1024).toFixed(2),
      count: sessions ? JSON.parse(sessions).length : 0,
    },
    totalSize: scriptsSize + sessionsSize,
    totalSizeKB: ((scriptsSize + sessionsSize) / 1024).toFixed(2),
  };
};
