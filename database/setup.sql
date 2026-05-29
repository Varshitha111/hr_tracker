-- SIMS Database Setup Script
-- Run this in SQL Server Management Studio or Azure Data Studio

-- Create Database
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'SIMSDB')
BEGIN
    CREATE DATABASE SIMSDB;
END
GO

USE SIMSDB;
GO

-- Tables are auto-created by Entity Framework Core on first run
-- The seeder adds a default admin user:
--   Email: admin@sims.com
--   Password: Admin@123

-- Optional: Manual table creation if EF migration is not used

CREATE TABLE IF NOT EXISTS HrUsers (
    HrId INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(200) NOT NULL,
    Email NVARCHAR(200) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(MAX) NOT NULL,
    CreatedAt DATETIME2 DEFAULT GETUTCDATE()
);

CREATE TABLE IF NOT EXISTS Candidates (
    CandidateId INT IDENTITY(1,1) PRIMARY KEY,
    FullName NVARCHAR(200) NOT NULL,
    Email NVARCHAR(200) NOT NULL,
    PhoneNumber NVARCHAR(20),
    Skills NVARCHAR(1000),
    Experience INT DEFAULT 0,
    AppliedRole NVARCHAR(200),
    ResumePath NVARCHAR(500),
    Status NVARCHAR(50) DEFAULT 'Scheduled',
    CreatedAt DATETIME2 DEFAULT GETUTCDATE()
);

CREATE TABLE IF NOT EXISTS Interviews (
    InterviewId INT IDENTITY(1,1) PRIMARY KEY,
    CandidateId INT NOT NULL FOREIGN KEY REFERENCES Candidates(CandidateId) ON DELETE CASCADE,
    Role NVARCHAR(200),
    InterviewDate DATE NOT NULL,
    InterviewTime TIME NOT NULL,
    InterviewMode NVARCHAR(20) DEFAULT 'Online',
    InterviewerName NVARCHAR(200),
    MeetingLink NVARCHAR(500),
    Status NVARCHAR(50) DEFAULT 'Scheduled',
    CreatedAt DATETIME2 DEFAULT GETUTCDATE()
);

CREATE TABLE IF NOT EXISTS Feedbacks (
    FeedbackId INT IDENTITY(1,1) PRIMARY KEY,
    CandidateId INT NOT NULL FOREIGN KEY REFERENCES Candidates(CandidateId) ON DELETE CASCADE,
    TechnicalRating INT CHECK (TechnicalRating BETWEEN 1 AND 10),
    CommunicationRating INT CHECK (CommunicationRating BETWEEN 1 AND 10),
    OverallRating INT CHECK (OverallRating BETWEEN 1 AND 10),
    Remarks NVARCHAR(MAX),
    FinalDecision NVARCHAR(20) DEFAULT 'Hold',
    CreatedAt DATETIME2 DEFAULT GETUTCDATE()
);
GO
