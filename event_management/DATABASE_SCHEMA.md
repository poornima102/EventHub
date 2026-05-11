# Event Management System - Database Schema

## Overview

The Event Management System uses a MySQL database with the following main tables:

- `auth_user` - Django built-in User model
- `authtoken_token` - Token authentication tokens
- `events_event` - Event information
- `events_registration` - Event registration records

---

## Table Schemas

### 1. auth_user (Django Built-in)

**Purpose**: Store user account information

```sql
CREATE TABLE auth_user (
    id INT PRIMARY KEY AUTO_INCREMENT,
    password VARCHAR(128) NOT NULL,
    last_login DATETIME,
    is_superuser BOOLEAN DEFAULT FALSE,
    username VARCHAR(150) UNIQUE NOT NULL,
    first_name VARCHAR(150),
    last_name VARCHAR(150),
    email VARCHAR(254) UNIQUE NOT NULL,
    is_staff BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    date_joined DATETIME NOT NULL
);
```

**Fields**:
- `id`: Primary key
- `username`: Unique username
- `email`: User email (must be unique)
- `first_name`: User's first name
- `last_name`: User's last name
- `password`: Hashed password
- `is_active`: Whether user account is active
- `is_staff`: Whether user has staff permissions
- `is_superuser`: Whether user is admin
- `date_joined`: When user registered

---

### 2. authtoken_token

**Purpose**: Store authentication tokens for token-based authentication

```sql
CREATE TABLE authtoken_token (
    key VARCHAR(40) PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    created DATETIME NOT NULL,
    FOREIGN KEY (user_id) REFERENCES auth_user(id)
);
```

**Fields**:
- `key`: The authentication token (40 character unique string)
- `user_id`: Foreign key to the user
- `created`: When the token was created

**Note**: One token per user. Token is generated automatically when user registers.

---

### 3. events_event

**Purpose**: Store event information

```sql
CREATE TABLE events_event (
    id INT PRIMARY KEY AUTO_INCREMENT,
    created_by_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description LONGTEXT NOT NULL,
    venue VARCHAR(255) NOT NULL,
    event_date DATE NOT NULL,
    event_time TIME NOT NULL,
    total_seats INT NOT NULL,
    available_seats INT NOT NULL,
    ticket_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL AUTO_TIMESTAMP,
    updated_at DATETIME NOT NULL AUTO_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by_id) REFERENCES auth_user(id),
    INDEX idx_event_date_available (event_date, available_seats),
    INDEX idx_created_by (created_by_id)
);
```

**Fields**:
- `id`: Primary key
- `created_by_id`: Foreign key to the user who created the event
- `title`: Event title (max 255 characters)
- `description`: Detailed event description
- `venue`: Event location/venue
- `event_date`: Date of the event
- `event_time`: Time of the event
- `total_seats`: Total seats for the event
- `available_seats`: Currently available seats (decrements on registration)
- `ticket_price`: Price per ticket in decimal format
- `created_at`: Timestamp when event was created
- `updated_at`: Timestamp when event was last modified

**Constraints**:
- `total_seats` > 0
- `available_seats` >= 0 and <= `total_seats`
- `ticket_price` >= 0
- `event_date` cannot be in the past

**Indexes**:
- `(event_date, available_seats)` - For filtering future events with available seats
- `(created_by_id)` - For quick lookup of events by creator

---

### 4. events_registration

**Purpose**: Store event registration records

```sql
CREATE TABLE events_registration (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    event_id INT NOT NULL,
    seats_reserved INT NOT NULL,
    registration_status VARCHAR(20) NOT NULL DEFAULT 'CONFIRMED',
    registered_at DATETIME NOT NULL AUTO_TIMESTAMP,
    UNIQUE KEY unique_user_event (user_id, event_id),
    FOREIGN KEY (user_id) REFERENCES auth_user(id),
    FOREIGN KEY (event_id) REFERENCES events_event(id),
    INDEX idx_user_status (user_id, registration_status),
    INDEX idx_event_status (event_id, registration_status)
);
```

**Fields**:
- `id`: Primary key
- `user_id`: Foreign key to the user who registered
- `event_id`: Foreign key to the event
- `seats_reserved`: Number of seats reserved
- `registration_status`: Status of registration ('CONFIRMED' or 'CANCELLED')
- `registered_at`: Timestamp when registration was made

**Constraints**:
- `seats_reserved` > 0
- One user can only have one active (CONFIRMED) registration per event
- Unique constraint on `(user_id, event_id)` pair

**Indexes**:
- `(user_id, registration_status)` - For finding user's registrations by status
- `(event_id, registration_status)` - For finding event registrations by status

---

## Relationships

### User to Event (One-to-Many)
- One user can create multiple events
- Relationship: `User.events` (reverse: `Event.created_by`)

### User to Registration (One-to-Many)
- One user can have multiple registrations
- Relationship: `User.registrations` (reverse: `Registration.user`)

### Event to Registration (One-to-Many)
- One event can have multiple registrations
- Relationship: `Event.registrations` (reverse: `Registration.event`)

### Event Diagram

```
User (id, username, email, ...)
  |
  ├─── (One-to-Many) ──── Event (id, created_by_id, title, available_seats, ...)
  |                           |
  |                           └─── (One-to-Many) ──── Registration (id, event_id, seats_reserved, ...)
  |                                                        |
  └─── (One-to-Many) ──────────────────────────────────────┘
```

---

## Database Transactions

### Seat Reservation Transaction

When a user registers for an event:

```
BEGIN TRANSACTION;
  1. Check if registration already exists for this user/event
  2. Verify enough seats are available
  3. Create Registration record
  4. Update Event.available_seats -= seats_reserved
COMMIT;
```

This ensures atomicity and prevents race conditions.

### Registration Cancellation Transaction

When a user cancels registration:

```
BEGIN TRANSACTION;
  1. Verify user owns the registration
  2. Mark registration as CANCELLED
  3. Update Event.available_seats += seats_reserved
COMMIT;
```

---

## Indexes and Performance

### Recommended Indexes

1. **Event Table**
   - `(event_date, available_seats)` - Filter future events with available seats
   - `(created_by_id)` - Find events by creator

2. **Registration Table**
   - `(user_id, registration_status)` - Get user's registrations filtered by status
   - `(event_id, registration_status)` - Get event registrations filtered by status
   - Primary key index on `id`

### Query Performance

**Fast Queries**:
```sql
-- Find all future events with available seats
SELECT * FROM events_event 
WHERE event_date >= CURDATE() AND available_seats > 0
ORDER BY event_date;

-- Find user's active registrations
SELECT * FROM events_registration 
WHERE user_id = ? AND registration_status = 'CONFIRMED';

-- Count registrations for an event
SELECT COUNT(*) FROM events_registration
WHERE event_id = ? AND registration_status = 'CONFIRMED';
```

---

## Migrations

Migrations are Python scripts that define schema changes:

```
events/migrations/
├── 0001_initial.py       # Create Event and Registration models
├── 0002_auto_...py       # Future schema changes
└── __init__.py
```

### Running Migrations

```bash
# Create migration files from model changes
python manage.py makemigrations

# Apply migrations to database
python manage.py migrate

# Check migration status
python manage.py showmigrations

# Reverse migrations (use carefully)
python manage.py migrate events 0001
```

---

## Data Integrity

### Constraints Enforced

1. **Foreign Keys**
   - `events_event.created_by_id` → `auth_user.id` (CASCADE on delete)
   - `events_registration.user_id` → `auth_user.id` (CASCADE on delete)
   - `events_registration.event_id` → `events_event.id` (CASCADE on delete)

2. **Unique Constraints**
   - `auth_user.username` - Unique username
   - `auth_user.email` - Unique email
   - `authtoken_token.user_id` - One token per user
   - `events_registration.unique_user_event` - One registration per user per event

3. **Data Validation** (enforced in Django models and serializers)
   - Event fields validated before save
   - Registration fields validated before save

### Cascade Behavior

- If user is deleted → All their events and registrations are deleted
- If event is deleted → All registrations for that event are deleted

---

## Backup & Recovery

### Backup MySQL Database

```bash
# Export database
mysqldump -u root -p event_management_db > backup.sql

# Backup specific table
mysqldump -u root -p event_management_db events_event > events_backup.sql
```

### Restore MySQL Database

```bash
# Import backup
mysql -u root -p event_management_db < backup.sql

# Restore specific table
mysql -u root -p event_management_db < events_backup.sql
```

---

## Monitoring & Maintenance

### Check Table Sizes

```sql
SELECT 
    TABLE_NAME,
    ROUND(((DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024), 2) AS SIZE_MB
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = 'event_management_db'
ORDER BY DATA_LENGTH DESC;
```

### Optimize Tables

```sql
-- Optimize all tables
OPTIMIZE TABLE events_event, events_registration, auth_user;

-- Check table integrity
CHECK TABLE events_event, events_registration, auth_user;
```

### View Table Statistics

```sql
-- Show registration statistics
SELECT 
    registration_status,
    COUNT(*) as count,
    AVG(seats_reserved) as avg_seats
FROM events_registration
GROUP BY registration_status;

-- Show events statistics
SELECT 
    COUNT(*) as total_events,
    AVG(total_seats) as avg_seats,
    AVG(ticket_price) as avg_price
FROM events_event
WHERE event_date >= CURDATE();
```

---

## Example Queries

### Find Events Created by User

```sql
SELECT * FROM events_event 
WHERE created_by_id = 5 
ORDER BY created_at DESC;
```

### Find User's Registrations with Event Details

```sql
SELECT 
    r.id,
    u.email,
    e.title,
    r.seats_reserved,
    r.registration_status,
    r.registered_at
FROM events_registration r
JOIN auth_user u ON r.user_id = u.id
JOIN events_event e ON r.event_id = e.id
WHERE r.user_id = 5
ORDER BY r.registered_at DESC;
```

### Find Upcoming Events with Available Seats

```sql
SELECT 
    id,
    title,
    event_date,
    total_seats,
    available_seats,
    ticket_price
FROM events_event
WHERE event_date >= CURDATE() AND available_seats > 0
ORDER BY event_date ASC;
```

### Calculate Total Revenue for an Event

```sql
SELECT 
    e.id,
    e.title,
    SUM(r.seats_reserved) as total_seats_sold,
    SUM(r.seats_reserved * e.ticket_price) as total_revenue
FROM events_event e
JOIN events_registration r ON e.id = r.event_id
WHERE r.registration_status = 'CONFIRMED'
GROUP BY e.id, e.title;
```

---

## Database Best Practices

1. **Regular Backups**
   - Create daily backups
   - Store backups in secure location
   - Test restore procedure regularly

2. **Monitoring**
   - Monitor table sizes
   - Monitor query performance
   - Set up alerts for errors

3. **Maintenance**
   - Optimize tables regularly
   - Clean up old/cancelled registrations (optional)
   - Archive old events (optional)

4. **Security**
   - Use strong database passwords
   - Limit database access by IP
   - Use SSL for database connections
   - Regular security audits

5. **Performance**
   - Maintain indexes
   - Monitor slow queries
   - Use connection pooling in production
   - Consider read replicas for scale

---

## Schema Version

- **Version**: 1.0
- **Created**: 2024-01-10
- **Last Updated**: 2024-01-10
- **Python**: 3.9+
- **Django**: 4.2.0
- **MySQL**: 8.0+

---

For more information, see:
- [README.md](README.md) - API documentation
- [setup-guide.txt](setup-guide.txt) - Setup instructions
- Django ORM Documentation: https://docs.djangoproject.com/en/4.2/
