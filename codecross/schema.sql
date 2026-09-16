CREATE DATABASE IF NOT EXISTS code_reviewer
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE code_reviewer;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(32) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(100) NOT NULL,
    language VARCHAR(30) NOT NULL,
    summary TEXT,
    status ENUM('pending', 'processing', 'completed', 'failed')
        NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_reviews_user
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE review_files (
    id INT AUTO_INCREMENT PRIMARY KEY,
    review_id INT NOT NULL,
    filename VARCHAR(255) NOT NULL,
    language VARCHAR(30) NOT NULL,
    content LONGTEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_review_files_review
        FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE
);

CREATE TABLE review_issues (
    id INT AUTO_INCREMENT PRIMARY KEY,
    review_id INT NOT NULL,
    file_id INT,
    severity ENUM('critical', 'high', 'medium', 'low', 'suggestion') NOT NULL,
    category ENUM('bug', 'security', 'performance', 'quality', 'architecture') NOT NULL,
    line_start INT,
    line_end INT,
    title VARCHAR(255) NOT NULL,
    explanation TEXT NOT NULL,
    suggestion TEXT,
    corrected_code TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_review_issues_review
        FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE,
    CONSTRAINT fk_review_issues_file
        FOREIGN KEY (file_id) REFERENCES review_files(id) ON DELETE SET NULL
);

CREATE TABLE analysis_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(30) NOT NULL UNIQUE
);

CREATE TABLE review_analysis_types (
    review_id INT NOT NULL,
    analysis_type_id INT NOT NULL,
    PRIMARY KEY (review_id, analysis_type_id),
    CONSTRAINT fk_review_analysis_types_review
        FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE,
    CONSTRAINT fk_review_analysis_types_type
        FOREIGN KEY (analysis_type_id) REFERENCES analysis_types(id) ON DELETE CASCADE
);

INSERT INTO analysis_types (name) VALUES
    ('bug'),
    ('security'),
    ('performance'),
    ('quality'),
    ('architecture');
