const pilotRepository = require('../repositories/pilotRepository');

exports.getPilots = async (filters) => {
  // Business logic: e.g. validate filter bounds, sanitize strings
  if (filters.specialty) {
    filters.specialty = filters.specialty.trim();
  }
  if (filters.location) {
    filters.location = filters.location.trim();
  }
  
  return await pilotRepository.findPilots(filters);
};

exports.getPilotById = async (id) => {
  if (id <= 0) {
    throw new Error('Invalid pilot identifier');
  }
  
  return await pilotRepository.findPilotById(id);
};
