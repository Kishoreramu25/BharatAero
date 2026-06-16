-- Seeding default drone pilot mock records
-- Target: pilots table

INSERT INTO pilots (
    name, rating, trips, hourly_rate, specialty, location, avatar_url, 
    experience, license_number, availability_status, drone_type, bio, 
    recent_completed_trips, fuel_consumption, average_speed
) VALUES 
(
    'Vikram Malhotra', 4.90, 142, 1500.00, 'Aerial Mapping', 'Bengaluru', 
    'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&auto=format&fit=crop&q=80',
    '5 years', 'UAOP-4291-A', 'Immediate', 'DJI Matrice 300 RTK', 
    'Specialist in industrial inspection, high-accuracy agricultural surveying, and high-altitude mapping operations.',
    98, '0.2 kWh/km', '45 km/h'
),
(
    'Ananya Rao', 4.80, 98, 1800.00, 'Industrial Inspection', 'Mumbai', 
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    '4 years', 'UAOP-8921-B', 'Tomorrow', 'DJI Mavic 3 Enterprise', 
    'Ex-aerospace engineer focusing on high-definition structural audits, thermal analysis, and powerline monitoring.',
    74, '0.15 kWh/km', '38 km/h'
),
(
    'Rohan Das', 4.70, 115, 1200.00, 'Cinematography', 'Delhi NCR', 
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    '6 years', 'UAOP-1042-C', 'Weekend', 'Freefly Alta X', 
    'Award-winning aerial cinematographer. Highly experienced in feature films, dynamic sporting tracking, and landscape shoots.',
    85, '0.25 kWh/km', '55 km/h'
);
