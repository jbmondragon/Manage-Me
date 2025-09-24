DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS admin;
DROP TABLE IF EXISTS app_user;  -- if you have a renamed user table

-- Admin table with auto-increment ID
CREATE TABLE admin (
    aid SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    password VARCHAR(255) NOT NULL
);

-- Renamed "user" table to avoid reserved keyword conflict
CREATE TABLE app_user (
    uid SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    password VARCHAR(255) NOT NULL
);

-- Students table
CREATE TABLE students (
    sid SERIAL PRIMARY KEY, -- make it auto-increment
    last_name VARCHAR(50) NOT NULL,
    first_name VARCHAR(50) NOT NULL, 
    middle_name VARCHAR(50),
    suffix VARCHAR(50),
    sex VARCHAR(20) NOT NULL,
    section VARCHAR(50) NOT NULL
);

-- Insert data into admin (no need to provide aid)
INSERT INTO admin(username, password)
VALUES ('maagut', 'P@ssw0rd');

-- Insert data into app_user
INSERT INTO app_user(username, password)
VALUES ('maagut', 'P@ssw0rd');

-- Example insert into students
INSERT INTO students(last_name, first_name, middle_name, suffix, sex, section)
VALUES ('Doe', 'John', 'A', '', 'Male', 'CS101');
