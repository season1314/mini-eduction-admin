-- --------------------------------------------------
-- template_schema.sql
-- --------------------------------------------------

CREATE SCHEMA IF NOT EXISTS template_schema;

-- ------------------------
-- enumeration
-- ------------------------
CREATE TYPE template_schema."Status" AS ENUM ('ACTIVE', 'BANNED');
CREATE TYPE template_schema."Role" AS ENUM ('SUPER', 'ADMIN', 'USER');
CREATE TYPE template_schema."Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER', 'UNKNOWN');
CREATE TYPE template_schema."MembershipStatus" AS ENUM ('ACTIVE', 'EXPIRED');
CREATE TYPE template_schema."ScheduleStatus" AS ENUM ('SCHEDULED', 'COMPLETED', 'CANCELLED');
CREATE TYPE template_schema."VipType" AS ENUM ('online', 'offline');

-- ------------------------
-- Admin
-- ------------------------
CREATE TABLE template_schema."Admin" (
    id SERIAL PRIMARY KEY,
    name TEXT,
    email TEXT UNIQUE NOT NULL,
    avatar TEXT,
    password TEXT NOT NULL,
    permission TEXT[] DEFAULT '{}',
    role template_schema."Role" NOT NULL,
    status template_schema."Status" NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    created_id INTEGER DEFAULT 0,
    created_by TEXT
);

-- ------------------------
-- Student
-- ------------------------
CREATE TABLE template_schema."Student" (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    student_number VARCHAR(255) UNIQUE NOT NULL,
    birth_date DATE,
    gender template_schema."Gender" DEFAULT 'UNKNOWN',
    phone_number TEXT,
    email TEXT,
    status template_schema."Status" DEFAULT 'ACTIVE',
    contact TEXT,
    des TEXT,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    created_id INTEGER,
    created_by TEXT
);

-- ------------------------
-- Teacher
-- ------------------------
CREATE TABLE template_schema."Teacher" (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    color TEXT,
    birth_date DATE,
    gender  template_schema."Gender" DEFAULT 'UNKNOWN',
    phone_number TEXT,
    email TEXT,
    status template_schema."Status" DEFAULT 'ACTIVE',
    contact TEXT,
    des TEXT,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    created_id INTEGER,
    created_by TEXT
);

-- ------------------------
-- Class
-- ------------------------
CREATE TABLE template_schema."Class" (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    teacher_id INT,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    created_id INTEGER,
    created_by TEXT
);

-- ------------------------
-- Class student relationship
-- ------------------------

CREATE TABLE IF NOT EXISTS template_schema."ClassStudent" (
    class_id INT REFERENCES template_schema."Class"(id) ON DELETE CASCADE,
    student_id INT REFERENCES template_schema."Student"(id) ON DELETE CASCADE,
    joined_at TIMESTAMP DEFAULT now(),
    PRIMARY KEY (class_id, student_id)
);

-- ------------------------
-- Lecture
-- ------------------------
CREATE TABLE template_schema."Lecture" (
    id SERIAL PRIMARY KEY,
    course_name TEXT NOT NULL,
    type TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- ------------------------
-- Membership 
-- ------------------------
CREATE TABLE template_schema."Membership" (
    id SERIAL PRIMARY KEY,
    membership_expiry TIMESTAMP NOT NULL,
    start_time TIMESTAMP NOT NULL,
    status template_schema."MembershipStatus" NOT NULL,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    student_id INT UNIQUE NOT NULL
);

-- ------------------------
-- MembershipOrder 
-- ------------------------
CREATE TABLE template_schema."MembershipOrder" (
    id BIGSERIAL PRIMARY KEY,
    months_added INT DEFAULT 0,
    old_expiry TIMESTAMP,
    new_expiry TIMESTAMP NOT NULL,
    note TEXT,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    student_id INT,
    student_record JSONB NOT NULL,
    created_id INT,
    created_record JSONB NOT NULL
);

-- ------------------------
-- LectureOrder 
-- ------------------------
CREATE TABLE template_schema."LectureOrder" (
    id BIGSERIAL PRIMARY KEY,
    months_added INT DEFAULT 0,
    note TEXT,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    student_id INT,
    student_record JSONB NOT NULL,
    created_id INT,
    created_record JSONB NOT NULL,
    lecture_record JSONB NOT NULL
);

-- ------------------------
-- StudentLecture
-- ------------------------
CREATE TABLE template_schema."StudentLecture" (
    id SERIAL PRIMARY KEY,
    student_id INT NOT NULL,
    lecture_id INT NOT NULL,
    total_lessons INT DEFAULT 0,
    remained_lessons INT DEFAULT 0,
    status template_schema."Status" DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    UNIQUE(student_id, lecture_id)
);

-- ------------------------
-- ClassSchedule
-- ------------------------
CREATE TABLE template_schema."ClassSchedule" (
    id SERIAL PRIMARY KEY,
    class_id INT NOT NULL,
    lecture_id INT,
    is_deductible BOOLEAN DEFAULT TRUE,
    deduct_amount FLOAT DEFAULT 1.0,
    teacher_id INT,
    date DATE NOT NULL,
    begin VARCHAR(255) NOT NULL,
    finish  VARCHAR(255) NOT NULL,
    classroom TEXT,
    status template_schema."ScheduleStatus" DEFAULT 'SCHEDULED',
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    admin_id INT
);

-- ------------------------
-- VipSchedule
-- ------------------------
CREATE TABLE template_schema."VipSchedule" (
    id SERIAL PRIMARY KEY,
    date DATE,
    begin VARCHAR(255),
    finish  VARCHAR(255),
    student_id INT,
    lecture_id INT,
    teacher_id INT,
    subtitle VARCHAR(255),
    status template_schema."ScheduleStatus" DEFAULT 'SCHEDULED',
    type template_schema."VipType" DEFAULT 'offline',
    classroom VARCHAR(255),
    count FLOAT DEFAULT 0,
    count_add VARCHAR(255),
    time_zone TIMESTAMP NOT NULL,
    online_type VARCHAR(255),
    content VARCHAR(255),
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- ------------------------
-- Foreign Key Constraint
-- ------------------------
ALTER TABLE template_schema."Student" ADD CONSTRAINT fk_student_creator FOREIGN KEY (created_id) REFERENCES template_schema."Admin"(id) ON DELETE SET NULL;
-- ALTER TABLE template_schema."Student" ADD CONSTRAINT fk_student_class FOREIGN KEY (class_id) REFERENCES template_schema."Class"(id) ON DELETE SET NULL;

ALTER TABLE template_schema."Teacher" ADD CONSTRAINT fk_teacher_creator FOREIGN KEY (created_id) REFERENCES template_schema."Admin"(id) ON DELETE SET NULL;

ALTER TABLE template_schema."Membership" ADD CONSTRAINT fk_membership_student FOREIGN KEY (student_id) REFERENCES template_schema."Student"(id) ON DELETE CASCADE;

ALTER TABLE template_schema."MembershipOrder" ADD CONSTRAINT fk_membershiporder_student FOREIGN KEY (student_id) REFERENCES template_schema."Student"(id) ON DELETE SET NULL;
ALTER TABLE template_schema."MembershipOrder" ADD CONSTRAINT fk_membershiporder_creator FOREIGN KEY (created_id) REFERENCES template_schema."Admin"(id) ON DELETE SET NULL;

ALTER TABLE template_schema."LectureOrder" ADD CONSTRAINT fk_lectureorder_student FOREIGN KEY (student_id) REFERENCES template_schema."Student"(id) ON DELETE SET NULL;
ALTER TABLE template_schema."LectureOrder" ADD CONSTRAINT fk_lectureorder_creator FOREIGN KEY (created_id) REFERENCES template_schema."Admin"(id) ON DELETE SET NULL;

ALTER TABLE template_schema."StudentLecture" ADD CONSTRAINT fk_studentlecture_student FOREIGN KEY (student_id) REFERENCES template_schema."Student"(id) ON DELETE CASCADE;
ALTER TABLE template_schema."StudentLecture" ADD CONSTRAINT fk_studentlecture_lecture FOREIGN KEY (lecture_id) REFERENCES template_schema."Lecture"(id) ON DELETE CASCADE;

ALTER TABLE template_schema."Class" ADD CONSTRAINT fk_class_teacher FOREIGN KEY (teacher_id) REFERENCES template_schema."Teacher"(id) ON DELETE SET NULL;

ALTER TABLE template_schema."ClassSchedule" ADD CONSTRAINT fk_classschedule_class FOREIGN KEY (class_id) REFERENCES template_schema."Class"(id) ON DELETE CASCADE;
ALTER TABLE template_schema."ClassSchedule" ADD CONSTRAINT fk_classschedule_lecture FOREIGN KEY (lecture_id) REFERENCES template_schema."Lecture"(id) ON DELETE CASCADE;
ALTER TABLE template_schema."ClassSchedule" ADD CONSTRAINT fk_classschedule_teacher FOREIGN KEY (teacher_id) REFERENCES template_schema."Teacher"(id) ON DELETE SET NULL;
ALTER TABLE template_schema."ClassSchedule" ADD CONSTRAINT fk_classschedule_admin FOREIGN KEY (admin_id) REFERENCES template_schema."Admin"(id) ON DELETE SET NULL;

ALTER TABLE template_schema."VipSchedule" ADD CONSTRAINT fk_vipschedule_student FOREIGN KEY (student_id) REFERENCES template_schema."Student"(id) ON DELETE SET NULL;
ALTER TABLE template_schema."VipSchedule" ADD CONSTRAINT fk_vipschedule_lecture FOREIGN KEY (lecture_id) REFERENCES template_schema."Lecture"(id) ON DELETE SET NULL;
ALTER TABLE template_schema."VipSchedule" ADD CONSTRAINT fk_vipschedule_teacher FOREIGN KEY (teacher_id) REFERENCES template_schema."Teacher"(id) ON DELETE SET NULL;

-- ------------------------
-- index
-- ------------------------
CREATE UNIQUE INDEX idx_admin_email ON template_schema."Admin"(email);
CREATE UNIQUE INDEX idx_student_student_number ON template_schema."Student"(student_number);
CREATE UNIQUE INDEX idx_membership_student ON template_schema."Membership"(student_id);
CREATE UNIQUE INDEX idx_studentlecture_student_lecture ON template_schema."StudentLecture"(student_id, lecture_id);
CREATE UNIQUE INDEX idx_class_name ON template_schema."Class"(name);

-- End of template_schema.sql
