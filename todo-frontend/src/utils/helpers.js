export const slug = (value) => value.toLowerCase().replace(/\s+/g, "-");

// Turns DRF validation errors ({ title: ["This field is required."] }) into readable text
export const getErrorMessage = (error) => {
  const data = error.response?.data;
  if (data && typeof data === "object") {
    return Object.entries(data)
      .map(([field, msg]) => `${field}: ${Array.isArray(msg) ? msg.join(" ") : msg}`)
      .join(" | ");
  }
  return error.message || "Something went wrong";
};

export const formatDate = (isoDate) =>
  new Date(`${isoDate}T00:00:00`).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

// YYYY-MM-DD in the user's local timezone, so string comparison is safe
export const todayISO = () => new Date().toLocaleDateString("en-CA");