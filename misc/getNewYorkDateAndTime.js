// This helper module sets the time zone to new work and usa

module.exports = () => {
  let date = new Date();
  let timeZoneOffset = date.getTimezoneOffset() * 60000; // Get local offset in milliseconds
  let newDate = new Date(date.getTime() - timeZoneOffset);
  return newDate;
};
