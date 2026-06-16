const pilotService = require('../services/pilotService');

exports.listPilots = async (req, res, next) => {
  try {
    const filters = {
      specialty: req.query.specialty,
      location: req.query.location
    };
    
    const pilots = await pilotService.getPilots(filters);
    
    return res.status(200).json({
      success: true,
      data: pilots
    });
  } catch (error) {
    next(error);
  }
};

exports.getPilotDetails = async (req, res, next) => {
  try {
    const pilotId = parseInt(req.params.id, 10);
    if (isNaN(pilotId)) {
      return res.status(400).json({
        success: false,
        error: { message: 'Invalid pilot ID parameter' }
      });
    }

    const pilot = await pilotService.getPilotById(pilotId);
    if (!pilot) {
      return res.status(404).json({
        success: false,
        error: { message: 'Pilot profile not found' }
      });
    }

    return res.status(200).json({
      success: true,
      data: pilot
    });
  } catch (error) {
    next(error);
  }
};
