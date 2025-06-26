// This helper module sets the time zone to new work and usa

module.exports = () => {
  // Get the current time in the "America/New_York" timezone
  const newYorkDateString = new Date().toLocaleString("en-US", {
    timeZone: "America/New_York",
  });

  // Construct a Date instance using that localized string
  return new Date(newYorkDateString);
};
