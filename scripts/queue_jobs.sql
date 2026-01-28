-- Get a valid user_id
DO $$
DECLARE
    target_user_id uuid;
BEGIN
    SELECT user_id INTO target_user_id FROM admin_permissions WHERE is_super_admin = true LIMIT 1;
    IF target_user_id IS NULL THEN
        target_user_id := '00000000-0000-0000-0000-000000000000';
    END IF;

    -- Job 1
    INSERT INTO jobs (user_id, job_type, status, payload)
    VALUES (target_user_id, 'carousel_generate', 'pending', '{"topic": "The Future is Custom-Fit: Personalization in Medical Devices", "language": "Portuguese", "format": "carousel"}');

    -- Job 2
    INSERT INTO jobs (user_id, job_type, status, payload)
    VALUES (target_user_id, 'carousel_generate', 'pending', '{"topic": "The Robotic Revolution: Smaller, Smarter Surgical Instruments", "language": "Portuguese", "format": "carousel"}');

    -- Job 3
    INSERT INTO jobs (user_id, job_type, status, payload)
    VALUES (target_user_id, 'carousel_generate', 'pending', '{"topic": "The ASC Shift: Rethinking Instrument Design & Efficiency", "language": "Portuguese", "format": "carousel"}');

    -- Job 4
    INSERT INTO jobs (user_id, job_type, status, payload)
    VALUES (target_user_id, 'carousel_generate', 'pending', '{"topic": "Beyond the Mechanical Axis: The New Era of Orthopedic Implants", "language": "Portuguese", "format": "carousel"}');

    -- Job 5
    INSERT INTO jobs (user_id, job_type, status, payload)
    VALUES (target_user_id, 'carousel_generate', 'pending', '{"topic": "AI & Data-Driven Manufacturing: The Competitive Advantage", "language": "Portuguese", "format": "carousel"}');

    -- Job 6
    INSERT INTO jobs (user_id, job_type, status, payload)
    VALUES (target_user_id, 'carousel_generate', 'pending', '{"topic": "Tariffs, Reshoring & Supply Chain Resilience", "language": "Portuguese", "format": "carousel"}');

    -- Job 7
    INSERT INTO jobs (user_id, job_type, status, payload)
    VALUES (target_user_id, 'carousel_generate', 'pending', '{"topic": "Remote Patient Monitoring & the Demand for Precision Components", "language": "Portuguese", "format": "carousel"}');

    -- Job 8
    INSERT INTO jobs (user_id, job_type, status, payload)
    VALUES (target_user_id, 'carousel_generate', 'pending', '{"topic": "3D Printing & CNC: The Perfect Partnership for Medical Innovation", "language": "Portuguese", "format": "carousel"}');

END $$;
