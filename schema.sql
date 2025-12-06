-- ===================================
-- Drop triggers and tables if they exist
-- ===================================
DROP TRIGGER IF EXISTS trg_add_student_homecomings ON students CASCADE;
DROP TRIGGER IF EXISTS trg_add_homecoming_students ON events CASCADE;

DROP TABLE IF EXISTS event_contribution CASCADE;
DROP TABLE IF EXISTS event_participation CASCADE;
DROP TABLE IF EXISTS attendees CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS students CASCADE;
DROP TABLE IF EXISTS section CASCADE;
DROP TABLE IF EXISTS admin CASCADE;
DROP TABLE IF EXISTS app_user CASCADE;

-- ==============================
-- Admin table
-- ==============================
CREATE TABLE admin (
    aid SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==============================
-- App user table
-- ==============================
CREATE TABLE app_user (
    uid SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==============================
-- Section table
-- ==============================
CREATE TABLE section (
    section_id SERIAL PRIMARY KEY,
    section_name VARCHAR(100) NOT NULL UNIQUE,
    grade_level VARCHAR(50),
    academic_year VARCHAR(20),
    adviser VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==============================
-- Students table
-- ==============================
CREATE TABLE students (
    sid VARCHAR(12) PRIMARY KEY,
    last_name VARCHAR(50) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    middle_name VARCHAR(50),
    suffix VARCHAR(10),
    sex VARCHAR(20) NOT NULL,
    section_id INT REFERENCES section(section_id) ON DELETE CASCADE,
    email VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==============================
-- Events table
-- ==============================
CREATE TABLE events (
    eid SERIAL PRIMARY KEY,
    event_name VARCHAR(100) NOT NULL UNIQUE,
    type VARCHAR(50) NOT NULL DEFAULT 'General',
    theme VARCHAR(255),
    location VARCHAR(255),
    start_date DATE NOT NULL,
    end_date DATE,
    date_time TIMESTAMP,
    amount DECIMAL(10,2) DEFAULT 0.00 CHECK (amount >= 0),
    payment_due DATE,
    payment_instructions TEXT,
    is_published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==============================
-- Attendees table
-- ==============================
CREATE TABLE attendees (
    eid INT REFERENCES events(eid) ON DELETE CASCADE,
    sid VARCHAR(12) REFERENCES students(sid) ON DELETE CASCADE,
    attending BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (eid, sid)
);

-- ==============================
-- Event Participation table
-- ==============================
CREATE TABLE event_participation (
    pid SERIAL PRIMARY KEY,
    sid VARCHAR(12) NOT NULL,
    eid INT NOT NULL,
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    attended BOOLEAN DEFAULT FALSE,
    paid BOOLEAN DEFAULT FALSE,
    remarks TEXT,
    proof_of_payment_url TEXT,
    verification_status VARCHAR(20) DEFAULT 'Pending' CHECK (verification_status IN ('Pending', 'Verified', 'Rejected')),
    payment_method VARCHAR(50) DEFAULT 'GCASH',

    CONSTRAINT fk_student FOREIGN KEY (sid) REFERENCES students(sid) ON DELETE CASCADE,
    CONSTRAINT fk_event FOREIGN KEY (eid) REFERENCES events(eid) ON DELETE CASCADE,
    CONSTRAINT unique_student_event UNIQUE (sid, eid)
);

-- ==============================
-- Event Contribution table
-- ==============================
CREATE TABLE event_contribution (
    cid SERIAL PRIMARY KEY,
    sid VARCHAR(12) NOT NULL,
    eid INT NOT NULL,
    contribution_type VARCHAR(50) NOT NULL,
    amount DECIMAL(10,2) DEFAULT 0.00 CHECK (amount >= 0),
    hours_contributed DECIMAL(5,2) DEFAULT 0.00 CHECK (hours_contributed >= 0),
    contribution_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    remarks TEXT,

    CONSTRAINT fk_student_contrib FOREIGN KEY (sid) REFERENCES students(sid) ON DELETE CASCADE,
    CONSTRAINT fk_event_contrib FOREIGN KEY (eid) REFERENCES events(eid) ON DELETE CASCADE,
    CONSTRAINT unique_student_event_contrib UNIQUE (sid, eid, contribution_type)
);

-- ==============================
-- Triggers for Homecoming participation
-- ==============================
CREATE OR REPLACE FUNCTION register_new_student_to_homecomings()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO event_participation (sid, eid)
    SELECT NEW.sid, e.eid
    FROM events e
    WHERE e.type = 'Homecoming'
    ON CONFLICT (sid, eid) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_add_student_homecomings
AFTER INSERT ON students
FOR EACH ROW
EXECUTE FUNCTION register_new_student_to_homecomings();

CREATE OR REPLACE FUNCTION register_existing_students_to_homecoming()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO event_participation (sid, eid)
    SELECT s.sid, NEW.eid
    FROM students s
    ON CONFLICT (sid, eid) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_add_homecoming_students
AFTER INSERT ON events
FOR EACH ROW
WHEN (NEW.type = 'Homecoming')
EXECUTE FUNCTION register_existing_students_to_homecoming();

-- ==============================
-- Sample Data
-- ==============================
-- Admins
INSERT INTO admin (username, password)
VALUES ('maagut', 'P@ssw0rd'), ('admin', 'admin');

-- App Users
INSERT INTO app_user (username, password)
VALUES 
('user', 'user'),
('mariacruz@example.com', 'user1'),
('markreyes@example.com', 'user2'),
('annasantos@example.com', 'user3'),
('kevinlim@example.com', 'user4');

-- Sections
INSERT INTO section (section_name, grade_level, academic_year, adviser)
VALUES
('Red', '12', '2020-2021', 'Mx. Lorielee Mae S. Solmayor'),
('IT201', '2nd Year', '2025-2026', 'Ms. Santos');

-- Students
INSERT INTO students (sid, last_name, first_name, middle_name, sex, section_id, email)
VALUES
--Grade 12 - Section Red Male Students
('100000000000', 'Abogado', 'Gerson', '', 'Male', 1, 'ga@gmail.com'),
('100000000001', 'Abrera', 'Joshua', 'V.', 'Male', 1, 'aj@gmail.com'),
('100000000002', 'Avestruz', 'Jhon Kenneth', 'P.', 'Male', 1, 'ajk@gmail.com'),
('100000000003', 'Avila', 'Lenard', 'M.', 'Male', 1, 'al@gmail.com'),
('100000000004', 'Binay', 'Rhodemel', 'A.', 'Male', 1, 'br@gmail.com'),
('100000000005', 'Cabello', 'Justine', 'A.', 'Male', 1, 'cj@gmail.com'),
('100000000006', 'Cabeltis', 'Noe Gregory', 'C.', 'Male', 1, 'cg@gmail.com'),
('100000000007', 'Indita Jr.', 'Romeo', 'D.', 'Male', 1, 'ir@gmail.com'),
('100000000008', 'Lopez', 'Radgie', 'B.', 'Male', 1, 'lr@gmail.com'),
('100000000009', 'Morales', 'Ron Stephen', 'B.', 'Male', 1, 'mrs@gmail.com'),
('100000000010', 'Solar', 'Matthew', 'B.', 'Male', 1, 'sm@gmail.com'),
('100000000011', 'Urmeneta', 'Mark Jelou', 'C.', 'Male', 1, 'um@gmail.com'),

--Grade 12 - Section Red Female Students
('100000000012', 'Agosto', 'Starlet', 'B.', 'Female', 1, 'as@gmail.com'),
('100000000013', 'Arpon', 'Eva Mae', 'C.', 'Female', 1, 'aem@gmail.com'),
('100000000014', 'Babiano', 'Via', 'A.', 'Female', 1, 'bv@gmail.com');

-- General event
INSERT INTO events (event_name, type, theme, location, start_date, end_date, amount, payment_due, payment_instructions, is_published)
VALUES (
    'Foundation Day',
    'General',
    'Celebrating our Legacy',
    'University Grounds',
    '2025-10-01',
    '2025-10-03',
    500.00,
    '2025-09-25',
    'Send to GCASH: 09XXXXXXXXX',
    TRUE
);

-- Homecoming event
INSERT INTO events (event_name, type, theme, location, start_date, end_date, date_time, amount, is_published)
VALUES (
    'Homecoming 2025',
    'Homecoming',
    'Bringing the Past to the Present',
    'University Main Hall',
    '2025-11-15',
    '2025-11-15',
    '2025-11-15 18:00:00',
    0.00,
    TRUE
);

-- Sample contribution
INSERT INTO event_contribution (sid, eid, contribution_type, amount, hours_contributed, remarks)
VALUES ('121026100090', 1, 'Donation', 200.00, 0, 'Contributed to Foundation Day fundraising');
