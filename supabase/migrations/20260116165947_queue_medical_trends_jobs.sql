-- Migration to queue content generation jobs for 2026 Medical Trends (Refactored to handle FK constraints)

-- Job 1
INSERT INTO jobs (user_id, job_type, type, status, payload)
SELECT id, 'carousel_generate', 'carousel_generate', 'pending', '{"topic": "The Future is Custom-Fit: Personalization in Medical Devices", "language": "Portuguese", "format": "carousel"}'
FROM auth.users ORDER BY (email = 'admin@precisionparts.com') DESC LIMIT 1;

-- Job 2
INSERT INTO jobs (user_id, job_type, type, status, payload)
SELECT id, 'carousel_generate', 'carousel_generate', 'pending', '{"topic": "The Robotic Revolution: Smaller, Smarter Surgical Instruments", "language": "Portuguese", "format": "carousel"}'
FROM auth.users ORDER BY (email = 'admin@precisionparts.com') DESC LIMIT 1;

-- Job 3
INSERT INTO jobs (user_id, job_type, type, status, payload)
SELECT id, 'carousel_generate', 'carousel_generate', 'pending', '{"topic": "The ASC Shift: Rethinking Instrument Design & Efficiency", "language": "Portuguese", "format": "carousel"}'
FROM auth.users ORDER BY (email = 'admin@precisionparts.com') DESC LIMIT 1;

-- Job 4
INSERT INTO jobs (user_id, job_type, type, status, payload)
SELECT id, 'carousel_generate', 'carousel_generate', 'pending', '{"topic": "Beyond the Mechanical Axis: The New Era of Orthopedic Implants", "language": "Portuguese", "format": "carousel"}'
FROM auth.users ORDER BY (email = 'admin@precisionparts.com') DESC LIMIT 1;

-- Job 5
INSERT INTO jobs (user_id, job_type, type, status, payload)
SELECT id, 'carousel_generate', 'carousel_generate', 'pending', '{"topic": "AI & Data-Driven Manufacturing: The Competitive Advantage", "language": "Portuguese", "format": "carousel"}'
FROM auth.users ORDER BY (email = 'admin@precisionparts.com') DESC LIMIT 1;

-- Job 6
INSERT INTO jobs (user_id, job_type, type, status, payload)
SELECT id, 'carousel_generate', 'carousel_generate', 'pending', '{"topic": "Tariffs, Reshoring & Supply Chain Resilience", "language": "Portuguese", "format": "carousel"}'
FROM auth.users ORDER BY (email = 'admin@precisionparts.com') DESC LIMIT 1;

-- Job 7
INSERT INTO jobs (user_id, job_type, type, status, payload)
SELECT id, 'carousel_generate', 'carousel_generate', 'pending', '{"topic": "Remote Patient Monitoring & the Demand for Precision Components", "language": "Portuguese", "format": "carousel"}'
FROM auth.users ORDER BY (email = 'admin@precisionparts.com') DESC LIMIT 1;

-- Job 8
INSERT INTO jobs (user_id, job_type, type, status, payload)
SELECT id, 'carousel_generate', 'carousel_generate', 'pending', '{"topic": "3D Printing & CNC: The Perfect Partnership for Medical Innovation", "language": "Portuguese", "format": "carousel"}'
FROM auth.users ORDER BY (email = 'admin@precisionparts.com') DESC LIMIT 1;
