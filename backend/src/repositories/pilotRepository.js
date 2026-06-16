const db = require('../config/db');

// In-memory mock fallback to keep the scaffold testable without database configuration
const MOCK_PILOTS = [
  {
    id: 1,
    name: "Vikram Malhotra",
    rating: 4.9,
    trips: 142,
    hourlyRate: 1500,
    specialty: "Aerial Mapping",
    location: "Bengaluru",
    avatar: "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&auto=format&fit=crop&q=80",
    experience: "5 years",
    license: "UAOP-4291-A",
    availability: "Immediate",
    droneType: "DJI Matrice 300 RTK",
    bio: "Specialist in industrial inspection, high-accuracy agricultural surveying, and high-altitude mapping operations.",
    recentCompleted: 98,
    fuelConsumption: "0.2 kWh/km",
    averageSpeed: "45 km/h"
  },
  {
    id: 2,
    name: "Ananya Rao",
    rating: 4.8,
    trips: 98,
    hourlyRate: 1800,
    specialty: "Industrial Inspection",
    location: "Mumbai",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    experience: "4 years",
    license: "UAOP-8921-B",
    availability: "Tomorrow",
    droneType: "DJI Mavic 3 Enterprise",
    bio: "Ex-aerospace engineer focusing on high-definition structural audits, thermal analysis, and powerline monitoring.",
    recentCompleted: 74,
    fuelConsumption: "0.15 kWh/km",
    averageSpeed: "38 km/h"
  },
  {
    id: 3,
    name: "Rohan Das",
    rating: 4.7,
    trips: 115,
    hourlyRate: 1200,
    specialty: "Cinematography",
    location: "Delhi NCR",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    experience: "6 years",
    license: "UAOP-1042-C",
    availability: "Weekend",
    droneType: "Freefly Alta X",
    bio: "Award-winning aerial cinematographer. Highly experienced in feature films, dynamic sporting tracking, and landscape shoots.",
    recentCompleted: 85,
    fuelConsumption: "0.25 kWh/km",
    averageSpeed: "55 km/h"
  }
];

exports.findPilots = async (filters) => {
  try {
    let sql = 'SELECT * FROM pilots WHERE deleted_at IS NULL';
    const params = [];
    
    if (filters.specialty) {
      params.push(`%${filters.specialty}%`);
      sql += ` AND specialty ILIKE $${params.length}`;
    }
    if (filters.location) {
      params.push(`%${filters.location}%`);
      sql += ` AND location ILIKE $${params.length}`;
    }
    
    sql += ' ORDER BY rating DESC';
    const result = await db.query(sql, params);
    return result.rows;
  } catch (error) {
    console.warn('[Database Warning] SQL query failed, falling back to mock database payload. Error:', error.message);
    
    // Fallback logic
    return MOCK_PILOTS.filter(p => {
      let match = true;
      if (filters.specialty) {
        match = match && p.specialty.toLowerCase().includes(filters.specialty.toLowerCase());
      }
      if (filters.location) {
        match = match && p.location.toLowerCase().includes(filters.location.toLowerCase());
      }
      return match;
    });
  }
};

exports.findPilotById = async (id) => {
  try {
    const result = await db.query('SELECT * FROM pilots WHERE id = $1 AND deleted_at IS NULL', [id]);
    return result.rows[0] || null;
  } catch (error) {
    console.warn('[Database Warning] SQL query failed, falling back to mock database payload. Error:', error.message);
    return MOCK_PILOTS.find(p => p.id === id) || null;
  }
};
