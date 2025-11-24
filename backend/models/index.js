javascript
// Central export for all models
module.exports = {
  User: require('./User'),
  Restaurant: require('./Restaurant'),
  Booking: require('./Booking'),
  MenuItem: require('./MenuItem'),
  TimeSlot: require('./TimeSlot'),
  Review: require('./Review'),
  DietaryPreference: require('./DietaryPreference')
};