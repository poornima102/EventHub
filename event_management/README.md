# Event Management System - REST API Backend

A complete REST API backend for an Event Management System built with **Django**, **Django REST Framework**, and **MySQL**.

## Features

- **User Authentication**: Token-based authentication (not JWT)
- **Event Management**: Create, update, delete, and view events
- **Event Registration**: Users can register for events with multiple seats
- **Seat Management**: Prevent overbooking with database transactions
- **Permission System**: Event creators can only modify their own events
- **Search & Filtering**: Search events by title, filter by venue and date
- **Pagination**: Organized results with page-based pagination
- **Consistent API Responses**: Standardized JSON response format
- **Error Handling**: Comprehensive error messages with proper HTTP status codes

## Project Structure

```
event_management/
├── event_management/               # Main project configuration
│   ├── __init__.py
│   ├── settings.py                # Django settings with MySQL configuration
│   ├── urls.py                    # Main URL routing
│   ├── wsgi.py                    # WSGI configuration
│   └── asgi.py
├── events/                        # Events app
│   ├── migrations/               # Database migrations
│   ├── __init__.py
│   ├── admin.py                  # Django admin configuration
│   ├── apps.py                   # App configuration
│   ├── models.py                 # Event and Registration models
│   ├── serializers.py            # DRF serializers with validation
│   ├── views.py                  # API views/endpoints
│   ├── urls.py                   # App-level URL routing
│   ├── permissions.py            # Custom permission classes
│   ├── signals.py                # Django signals for auto-token creation
│   └── exceptions.py             # Custom exception handlers
├── manage.py                      # Django management script
├── requirements.txt               # Python dependencies
└── README.md                      # This file
```

## Installation & Setup

### 1. Create Virtual Environment

```bash
python -m venv venv
source venv/Scripts/activate  # On Windows
# or
source venv/bin/activate  # On macOS/Linux
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure MySQL Database

#### Option A: Using existing MySQL server

1. Create a new database:
```sql
CREATE DATABASE event_management_db;
```

2. Update `event_management/settings.py` with your MySQL credentials:
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'event_management_db',
        'USER': 'root',           # Your MySQL username
        'PASSWORD': 'password',   # Your MySQL password
        'HOST': 'localhost',
        'PORT': '3306',
    }
}
```

#### Option B: Using Docker (Optional)

If you want to run MySQL in Docker:

```bash
docker run --name mysql-event-db \
  -e MYSQL_ROOT_PASSWORD=password \
  -e MYSQL_DATABASE=event_management_db \
  -p 3306:3306 \
  -d mysql:8.0
```

### 4. Run Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

This will create all necessary database tables.

### 5. Create Superuser (Optional - for Admin Panel)

```bash
python manage.py createsuperuser
```

Follow the prompts to create an admin user.

### 6. Run Development Server

```bash
python manage.py runserver
```

The API will be available at: `http://localhost:8000/api/`
Admin panel: `http://localhost:8000/admin/`

---

## API Endpoints

### Authentication Endpoints

#### Register User
```
POST /api/auth/register/

Request:
{
    "full_name": "John Doe",
    "email": "john@example.com",
    "password": "secure_password"
}

Response (201):
{
    "success": true,
    "message": "Registration successful",
    "data": {
        "user": {
            "id": 1,
            "email": "john@example.com",
            "full_name": "John Doe",
            "username": "john"
        },
        "token": "abc123def456..."
    }
}
```

#### Login
```
POST /api/auth/login/

Request:
{
    "email": "john@example.com",
    "password": "secure_password"
}

Response (200):
{
    "success": true,
    "message": "Login successful",
    "data": {
        "user": {...},
        "token": "abc123def456..."
    }
}
```

#### Logout
```
POST /api/auth/logout/

Headers:
Authorization: Token abc123def456...

Response (200):
{
    "success": true,
    "message": "Logout successful"
}
```

---

### Event Endpoints

#### List All Events (with pagination, search, filter)
```
GET /api/events/

Query Parameters:
- page: Page number (default: 1)
- page_size: Items per page (default: 10)
- search: Search by title, description, venue
- ordering: Sort by event_date, ticket_price, created_at
- venue: Filter by venue
- date_from: Filter events from date (YYYY-MM-DD)
- date_to: Filter events until date (YYYY-MM-DD)

Headers:
Authorization: Token abc123def456...

Response (200):
{
    "success": true,
    "message": "Events retrieved successfully",
    "results": [
        {
            "id": 1,
            "created_by": {...},
            "title": "Tech Conference 2024",
            "description": "Annual tech conference",
            "venue": "Convention Center",
            "event_date": "2024-06-15",
            "event_time": "09:00:00",
            "event_datetime": "2024-06-15 09:00:00",
            "total_seats": 100,
            "available_seats": 45,
            "seats_available": 45,
            "ticket_price": "50.00",
            "created_at": "2024-01-10T10:30:00Z",
            "updated_at": "2024-01-10T10:30:00Z",
            "is_event_owner": false
        }
    ],
    "count": 25,
    "next": "http://localhost:8000/api/events/?page=2",
    "previous": null
}
```

#### Create Event
```
POST /api/events/

Headers:
Authorization: Token abc123def456...

Request:
{
    "title": "Tech Conference 2024",
    "description": "Annual technology conference with industry experts",
    "venue": "Convention Center, Downtown",
    "event_date": "2024-06-15",
    "event_time": "09:00:00",
    "total_seats": 100,
    "available_seats": 100,
    "ticket_price": "50.00"
}

Response (201):
{
    "success": true,
    "message": "Event created successfully",
    "data": {...}
}
```

#### Get Event Details
```
GET /api/events/<event_id>/

Headers:
Authorization: Token abc123def456...

Response (200):
{
    "success": true,
    "message": "Event details retrieved",
    "data": {
        "id": 1,
        "created_by": {...},
        "title": "Tech Conference 2024",
        ...
        "total_registrations": 55,
        "confirmed_registrations": 55
    }
}
```

#### Update Event (Creator Only)
```
PUT /api/events/<event_id>/

Headers:
Authorization: Token abc123def456...

Request: (All fields required)
{
    "title": "Updated Title",
    "description": "Updated description",
    "venue": "New Venue",
    "event_date": "2024-06-20",
    "event_time": "10:00:00",
    "total_seats": 120,
    "available_seats": 120,
    "ticket_price": "60.00"
}

Response (200): Updated event data
```

#### Partial Update Event (Creator Only)
```
PATCH /api/events/<event_id>/

Headers:
Authorization: Token abc123def456...

Request: (Only fields to update)
{
    "title": "Updated Title",
    "ticket_price": "75.00"
}

Response (200): Updated event data
```

#### Delete Event (Creator Only)
```
DELETE /api/events/<event_id>/

Headers:
Authorization: Token abc123def456...

Response (204): No content
```

---

### Registration Endpoints

#### Register for Event
```
POST /api/events/<event_id>/register/

Headers:
Authorization: Token abc123def456...

Request:
{
    "seats_reserved": 2
}

Response (201):
{
    "success": true,
    "message": "Registration successful",
    "data": {
        "registration": {
            "id": 5,
            "user": {...},
            "event": 1,
            "event_title": "Tech Conference 2024",
            "event_date": "2024-06-15",
            "event_time": "09:00:00",
            "seats_reserved": 2,
            "registration_status": "CONFIRMED",
            "registered_at": "2024-01-10T11:00:00Z",
            "total_cost": "100.00"
        },
        "total_cost": 100.00
    }
}
```

#### Get My Registrations
```
GET /api/my-registrations/

Query Parameters:
- status: Filter by CONFIRMED or CANCELLED
- page: Page number

Headers:
Authorization: Token abc123def456...

Response (200):
{
    "success": true,
    "message": "User registrations retrieved successfully",
    "results": [
        {
            "id": 5,
            "user": {...},
            "event": 1,
            "event_title": "Tech Conference 2024",
            "event_date": "2024-06-15",
            "seats_reserved": 2,
            "registration_status": "CONFIRMED",
            "registered_at": "2024-01-10T11:00:00Z",
            "total_cost": "100.00"
        }
    ],
    "count": 3,
    "next": null,
    "previous": null
}
```

#### Get My Events (Created by User)
```
GET /api/my-events/

Headers:
Authorization: Token abc123def456...

Response (200):
{
    "success": true,
    "message": "User events retrieved successfully",
    "results": [
        {
            "id": 1,
            "created_by": {...},
            "title": "Tech Conference 2024",
            ...
            "total_registrations": 55,
            "confirmed_registrations": 55
        }
    ]
}
```

#### Get Event Registrations (Creator Only)
```
GET /api/events/<event_id>/registrations/

Query Parameters:
- status: Filter by CONFIRMED or CANCELLED
- page: Page number

Headers:
Authorization: Token abc123def456...

Response (200):
{
    "success": true,
    "message": "Event registrations retrieved successfully",
    "results": [
        {
            "id": 5,
            "user": {...},
            "event": 1,
            "event_title": "Tech Conference 2024",
            "seats_reserved": 2,
            "registration_status": "CONFIRMED",
            "registered_at": "2024-01-10T11:00:00Z"
        }
    ],
    "statistics": {
        "confirmed_registrations": 55,
        "cancelled_registrations": 2,
        "total_seats_reserved": 55
    }
}
```

#### Cancel Registration
```
POST /api/registrations/<registration_id>/cancel/

Headers:
Authorization: Token abc123def456...

Response (200):
{
    "success": true,
    "message": "Registration cancelled successfully"
}
```

---

## Database Models

### Event Model
```python
- id: Primary key
- created_by: ForeignKey to User (event creator)
- title: CharField (255)
- description: TextField
- venue: CharField (255)
- event_date: DateField
- event_time: TimeField
- total_seats: PositiveIntegerField
- available_seats: PositiveIntegerField
- ticket_price: DecimalField (10,2)
- created_at: DateTimeField (auto)
- updated_at: DateTimeField (auto)
```

### Registration Model
```python
- id: Primary key
- user: ForeignKey to User
- event: ForeignKey to Event
- seats_reserved: PositiveIntegerField
- registration_status: CharField (CONFIRMED, CANCELLED)
- registered_at: DateTimeField (auto)
```

---

## Validation Rules

### Event Validation
- `total_seats` must be > 0
- `available_seats` must be >= 0 and <= total_seats
- `ticket_price` must be >= 0
- `event_date` cannot be in the past
- Only event creator can edit/delete

### Registration Validation
- `seats_reserved` must be > 0
- Must have enough available seats
- User can only have one active registration per event
- Only registration owner can cancel

---

## Authentication

All protected endpoints require token authentication via the `Authorization` header:

```bash
Authorization: Token <your-token-here>
```

### Getting Your Token

1. Register or login to get a token
2. Use the token in the `Authorization` header for all subsequent requests

Example with curl:
```bash
curl -H "Authorization: Token abc123def456..." \
  http://localhost:8000/api/events/
```

Example with Python requests:
```python
import requests

headers = {
    'Authorization': 'Token abc123def456...'
}

response = requests.get('http://localhost:8000/api/events/', headers=headers)
```

---

## Error Handling

### Standard Error Response
```json
{
    "success": false,
    "message": "Error description",
    "data": {
        "field_name": ["Error message"]
    }
}
```

### Common HTTP Status Codes
- `200 OK`: Successful GET request
- `201 CREATED`: Successful resource creation
- `204 NO CONTENT`: Successful DELETE request
- `400 BAD REQUEST`: Validation error or missing required fields
- `401 UNAUTHORIZED`: Missing or invalid authentication token
- `403 FORBIDDEN`: User lacks permission for this action
- `404 NOT FOUND`: Resource not found
- `500 INTERNAL SERVER ERROR`: Server error

---

## Pagination

All list endpoints are paginated with 10 items per page by default.

### Pagination Parameters
```
?page=1           # Get first page
?page_size=20     # Change items per page
```

### Pagination Response
```json
{
    "count": 25,
    "next": "http://localhost:8000/api/events/?page=2",
    "previous": null,
    "results": [...]
}
```

---

## Search & Filtering

### Event Search/Filter Examples

```bash
# Search by title
GET /api/events/?search=conference

# Filter by venue
GET /api/events/?venue=downtown

# Filter by date range
GET /api/events/?date_from=2024-06-01&date_to=2024-06-30

# Sort by event date (ascending)
GET /api/events/?ordering=event_date

# Sort by price descending
GET /api/events/?ordering=-ticket_price

# Combine filters
GET /api/events/?search=tech&venue=downtown&date_from=2024-06-01&page_size=20
```

---

## Admin Panel

Access the Django admin at: `http://localhost:8000/admin/`

Features:
- View and manage users
- Create/edit/delete events
- View registrations
- User account management
- Django ORM administration

---

## Development Tips

### Using the Browsable API

Django REST Framework provides a browsable API interface. Access any endpoint in your browser:
```
http://localhost:8000/api/events/
http://localhost:8000/api/auth/login/
```

### Testing Endpoints with curl

```bash
# Register
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'

# Login
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'

# Get events with token
curl -H "Authorization: Token your-token-here" \
  http://localhost:8000/api/events/
```

### Testing with Postman

1. Open Postman
2. Create a new Collection "Event Management API"
3. For each endpoint, set:
   - Method (GET, POST, etc.)
   - URL
   - Headers: `Authorization: Token <your-token>`
   - Body (for POST/PUT/PATCH requests)

---

## Performance Optimizations

### Database Indexes
- Event model has indexes on `event_date`, `available_seats`, and `created_by`
- Registration model has indexes on `user`/`registration_status` and `event`/`registration_status`

### Query Optimization
- Use `.select_related()` for foreign keys
- Use `.prefetch_related()` for reverse relations
- Pagination prevents loading all records

### Caching (Optional)
To add caching, install `django-redis`:
```bash
pip install django-redis
```

Then add to `settings.py`:
```python
CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': 'redis://127.0.0.1:6379/1',
    }
}
```

---

## Production Deployment

### 1. Update Settings for Production

In `settings.py`:
```python
DEBUG = False
ALLOWED_HOSTS = ['yourdomain.com', 'www.yourdomain.com']
SECRET_KEY = 'generate-a-secure-random-key'
```

### 2. Use Production Database

Update MySQL credentials in `settings.py` for production database.

### 3. Run Gunicorn

```bash
gunicorn event_management.wsgi:application --bind 0.0.0.0:8000
```

### 4. Use Nginx as Reverse Proxy

Create `/etc/nginx/sites-available/event-api`:
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 5. Enable HTTPS with Let's Encrypt

```bash
sudo certbot --nginx -d yourdomain.com
```

---

## Troubleshooting

### MySQL Connection Error
```
Error: No module named 'MySQLdb'
```
Solution: `pip install mysqlclient`

### Migration Error
```
Error: no such table
```
Solution: Run `python manage.py migrate`

### Permission Denied Error
```
Error: User lacks permission for this action
```
Solution: Ensure you're using the correct token and are the resource owner

### Seat Availability Issue
- Check `available_seats` field in Event model
- Verify registrations haven't overboooked
- Use database transactions to prevent race conditions

---

## API Response Format

All responses follow a consistent format:

### Success Response
```json
{
    "success": true,
    "message": "Operation completed successfully",
    "data": {...}  // or "results": [...] for paginated responses
}
```

### Error Response
```json
{
    "success": false,
    "message": "Error description",
    "data": {...}  // or "errors": {...} for validation errors
}
```

---

## Contributing

To contribute to this project:

1. Create a new branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

---

## License

MIT License - Feel free to use this project for personal and commercial purposes.

---

## Support

For issues, questions, or suggestions, please open an issue in the repository.

---

## Next Steps

1. Test all endpoints with Postman or curl
2. Deploy to production with proper security settings
3. Add additional features (notifications, analytics, etc.)
4. Implement frontend application to consume this API
5. Add comprehensive unit tests
6. Set up CI/CD pipeline for automated deployments

---

**Happy coding! 🚀**
