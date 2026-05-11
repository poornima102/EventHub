# Event Management System - API Examples

This document provides detailed examples for using the Event Management System API.

---

## Table of Contents

1. [Authentication Examples](#authentication-examples)
2. [Event Management Examples](#event-management-examples)
3. [Registration Examples](#registration-examples)
4. [Search & Filter Examples](#search--filter-examples)
5. [Error Handling Examples](#error-handling-examples)

---

## Authentication Examples

### Example 1: User Registration

**Request**:
```bash
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Alice Johnson",
    "email": "alice.johnson@example.com",
    "password": "SecurePass123!"
  }'
```

**Response (201 Created)**:
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "id": 1,
      "email": "alice.johnson@example.com",
      "full_name": "Alice Johnson",
      "username": "alice.johnson"
    },
    "token": "c9f6e314d941f3c9c6e314d941f3c9c6e314d941"
  }
}
```

**Notes**:
- Password must be at least 6 characters
- Email must be unique
- Token is automatically created for new users
- Store the token for subsequent requests

---

### Example 2: User Login

**Request**:
```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice.johnson@example.com",
    "password": "SecurePass123!"
  }'
```

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "email": "alice.johnson@example.com",
      "full_name": "Alice Johnson",
      "username": "alice.johnson"
    },
    "token": "c9f6e314d941f3c9c6e314d941f3c9c6e314d941"
  }
}
```

---

### Example 3: User Logout

**Request**:
```bash
curl -X POST http://localhost:8000/api/auth/logout/ \
  -H "Authorization: Token c9f6e314d941f3c9c6e314d941f3c9c6e314d941"
```

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Logout successful"
}
```

**Notes**:
- Token is deleted on logout
- Subsequent requests with this token will fail

---

## Event Management Examples

### Example 1: List All Events

**Request** (paginated, with search):
```bash
curl "http://localhost:8000/api/events/?page=1&page_size=10&search=tech" \
  -H "Authorization: Token c9f6e314d941f3c9c6e314d941f3c9c6e314d941"
```

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Events retrieved successfully",
  "count": 25,
  "next": "http://localhost:8000/api/events/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "created_by": {
        "id": 1,
        "email": "alice.johnson@example.com",
        "full_name": "Alice Johnson",
        "username": "alice.johnson"
      },
      "title": "Tech Conference 2024",
      "description": "Annual technology conference",
      "venue": "Convention Center",
      "event_date": "2024-12-15",
      "event_time": "09:00:00",
      "event_datetime": "2024-12-15 09:00:00",
      "total_seats": 100,
      "available_seats": 45,
      "seats_available": 45,
      "ticket_price": "50.00",
      "created_at": "2024-01-10T10:30:00Z",
      "updated_at": "2024-01-10T10:30:00Z",
      "is_event_owner": false
    }
  ]
}
```

---

### Example 2: Create Event

**Request**:
```bash
curl -X POST http://localhost:8000/api/events/ \
  -H "Authorization: Token c9f6e314d941f3c9c6e314d941f3c9c6e314d941" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Web Development Workshop",
    "description": "Learn modern web development with React and Django. 2-day intensive workshop covering frontend and backend development.",
    "venue": "Tech Hub Downtown, Floor 3",
    "event_date": "2024-06-15",
    "event_time": "10:00:00",
    "total_seats": 50,
    "available_seats": 50,
    "ticket_price": "199.99"
  }'
```

**Response (201 Created)**:
```json
{
  "success": true,
  "message": "Event created successfully",
  "data": {
    "id": 5,
    "created_by": {
      "id": 1,
      "email": "alice.johnson@example.com",
      "full_name": "Alice Johnson",
      "username": "alice.johnson"
    },
    "title": "Web Development Workshop",
    "description": "Learn modern web development with React and Django. 2-day intensive workshop covering frontend and backend development.",
    "venue": "Tech Hub Downtown, Floor 3",
    "event_date": "2024-06-15",
    "event_time": "10:00:00",
    "event_datetime": "2024-06-15 10:00:00",
    "total_seats": 50,
    "available_seats": 50,
    "ticket_price": "199.99",
    "created_at": "2024-01-10T11:15:00Z",
    "updated_at": "2024-01-10T11:15:00Z",
    "is_event_owner": true
  }
}
```

---

### Example 3: Get Event Details

**Request**:
```bash
curl http://localhost:8000/api/events/5/ \
  -H "Authorization: Token c9f6e314d941f3c9c6e314d941f3c9c6e314d941"
```

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Event details retrieved",
  "data": {
    "id": 5,
    "created_by": {
      "id": 1,
      "email": "alice.johnson@example.com",
      "full_name": "Alice Johnson",
      "username": "alice.johnson"
    },
    "title": "Web Development Workshop",
    "description": "Learn modern web development with React and Django.",
    "venue": "Tech Hub Downtown, Floor 3",
    "event_date": "2024-06-15",
    "event_time": "10:00:00",
    "event_datetime": "2024-06-15 10:00:00",
    "total_seats": 50,
    "available_seats": 32,
    "seats_available": 32,
    "ticket_price": "199.99",
    "created_at": "2024-01-10T11:15:00Z",
    "updated_at": "2024-01-10T12:00:00Z",
    "is_event_owner": true,
    "total_registrations": 18,
    "confirmed_registrations": 18
  }
}
```

---

### Example 4: Update Event (Full Update)

**Request**:
```bash
curl -X PUT http://localhost:8000/api/events/5/ \
  -H "Authorization: Token c9f6e314d941f3c9c6e314d941f3c9c6e314d941" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Advanced Web Development Workshop",
    "description": "Learn modern web development with React, Django, and PostgreSQL. 3-day intensive workshop.",
    "venue": "Tech Hub Downtown, Floor 4",
    "event_date": "2024-06-20",
    "event_time": "10:00:00",
    "total_seats": 60,
    "available_seats": 42,
    "ticket_price": "249.99"
  }'
```

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Event updated",
  "data": {
    "id": 5,
    "title": "Advanced Web Development Workshop",
    "total_seats": 60,
    "available_seats": 42,
    "ticket_price": "249.99"
  }
}
```

---

### Example 5: Partial Update Event (PATCH)

**Request**:
```bash
curl -X PATCH http://localhost:8000/api/events/5/ \
  -H "Authorization: Token c9f6e314d941f3c9c6e314d941f3c9c6e314d941" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Ultimate Web Development Workshop",
    "ticket_price": "299.99"
  }'
```

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Event updated",
  "data": {
    "id": 5,
    "title": "Ultimate Web Development Workshop",
    "ticket_price": "299.99"
  }
}
```

**Notes**:
- PATCH only requires fields to update
- PUT requires all fields
- Only event creator can update

---

### Example 6: Delete Event

**Request**:
```bash
curl -X DELETE http://localhost:8000/api/events/5/ \
  -H "Authorization: Token c9f6e314d941f3c9c6e314d941f3c9c6e314d941"
```

**Response (204 No Content)**:
```
(Empty response)
```

**Notes**:
- Returns 204 with empty body on success
- Only event creator can delete
- All registrations for the event are also deleted

---

## Registration Examples

### Example 1: Register for Event

**Request**:
```bash
curl -X POST http://localhost:8000/api/events/5/register/ \
  -H "Authorization: Token c9f6e314d941f3c9c6e314d941f3c9c6e314d941" \
  -H "Content-Type: application/json" \
  -d '{
    "seats_reserved": 3
  }'
```

**Response (201 Created)**:
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "registration": {
      "id": 12,
      "user": {
        "id": 1,
        "email": "alice.johnson@example.com",
        "full_name": "Alice Johnson",
        "username": "alice.johnson"
      },
      "event": 5,
      "event_title": "Web Development Workshop",
      "event_date": "2024-06-15",
      "event_time": "10:00:00",
      "seats_reserved": 3,
      "registration_status": "CONFIRMED",
      "registered_at": "2024-01-10T13:30:00Z",
      "total_cost": "599.97"
    },
    "total_cost": 599.97
  }
}
```

**Notes**:
- User can only register once per event
- Seats are automatically reserved (available_seats decreases)
- Registration uses database transaction for atomicity

---

### Example 2: Get User's Registrations

**Request**:
```bash
curl "http://localhost:8000/api/my-registrations/?status=CONFIRMED&page=1" \
  -H "Authorization: Token c9f6e314d941f3c9c6e314d941f3c9c6e314d941"
```

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "User registrations retrieved successfully",
  "count": 5,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 12,
      "user": {
        "id": 1,
        "email": "alice.johnson@example.com",
        "full_name": "Alice Johnson",
        "username": "alice.johnson"
      },
      "event": 5,
      "event_title": "Web Development Workshop",
      "event_date": "2024-06-15",
      "event_time": "10:00:00",
      "seats_reserved": 3,
      "registration_status": "CONFIRMED",
      "registered_at": "2024-01-10T13:30:00Z",
      "total_cost": "599.97"
    }
  ]
}
```

---

### Example 3: Get User's Created Events

**Request**:
```bash
curl "http://localhost:8000/api/my-events/?page=1&page_size=5" \
  -H "Authorization: Token c9f6e314d941f3c9c6e314d941f3c9c6e314d941"
```

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "User events retrieved successfully",
  "count": 8,
  "next": "http://localhost:8000/api/my-events/?page=2",
  "previous": null,
  "results": [
    {
      "id": 5,
      "created_by": {
        "id": 1,
        "email": "alice.johnson@example.com",
        "full_name": "Alice Johnson",
        "username": "alice.johnson"
      },
      "title": "Web Development Workshop",
      "available_seats": 29,
      "total_seats": 50,
      "ticket_price": "199.99",
      "total_registrations": 18,
      "confirmed_registrations": 18
    }
  ]
}
```

---

### Example 4: Get Event Registrations (Creator Only)

**Request**:
```bash
curl "http://localhost:8000/api/events/5/registrations/?status=CONFIRMED&page=1" \
  -H "Authorization: Token c9f6e314d941f3c9c6e314d941f3c9c6e314d941"
```

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Event registrations retrieved successfully",
  "count": 18,
  "next": "http://localhost:8000/api/events/5/registrations/?page=2",
  "previous": null,
  "results": [
    {
      "id": 12,
      "user": {
        "id": 2,
        "email": "bob@example.com",
        "full_name": "Bob Smith",
        "username": "bob.smith"
      },
      "event": 5,
      "event_title": "Web Development Workshop",
      "event_date": "2024-06-15",
      "event_time": "10:00:00",
      "seats_reserved": 3,
      "registration_status": "CONFIRMED",
      "registered_at": "2024-01-10T13:30:00Z"
    },
    {
      "id": 13,
      "user": {
        "id": 3,
        "email": "carol@example.com",
        "full_name": "Carol White",
        "username": "carol.white"
      },
      "event": 5,
      "event_title": "Web Development Workshop",
      "event_date": "2024-06-15",
      "event_time": "10:00:00",
      "seats_reserved": 2,
      "registration_status": "CONFIRMED",
      "registered_at": "2024-01-10T14:00:00Z"
    }
  ],
  "statistics": {
    "confirmed_registrations": 18,
    "cancelled_registrations": 2,
    "total_seats_reserved": 42
  }
}
```

---

### Example 5: Cancel Registration

**Request**:
```bash
curl -X POST http://localhost:8000/api/registrations/12/cancel/ \
  -H "Authorization: Token c9f6e314d941f3c9c6e314d941f3c9c6e314d941"
```

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Registration cancelled successfully"
}
```

**Notes**:
- Seats are automatically freed up
- Only registration owner can cancel
- Registration status changes to CANCELLED
- Available seats increase for the event

---

## Search & Filter Examples

### Example 1: Search Events by Title

**Request**:
```bash
curl "http://localhost:8000/api/events/?search=web" \
  -H "Authorization: Token c9f6e314d941f3c9c6e314d941f3c9c6e314d941"
```

Returns all events with "web" in title, description, or venue.

---

### Example 2: Filter by Venue

**Request**:
```bash
curl "http://localhost:8000/api/events/?venue=downtown" \
  -H "Authorization: Token c9f6e314d941f3c9c6e314d941f3c9c6e314d941"
```

Returns events at venues containing "downtown".

---

### Example 3: Filter by Date Range

**Request**:
```bash
curl "http://localhost:8000/api/events/?date_from=2024-06-01&date_to=2024-06-30" \
  -H "Authorization: Token c9f6e314d941f3c9c6e314d941f3c9c6e314d941"
```

Returns events between June 1 and June 30, 2024.

---

### Example 4: Sort by Price (Ascending)

**Request**:
```bash
curl "http://localhost:8000/api/events/?ordering=ticket_price" \
  -H "Authorization: Token c9f6e314d941f3c9c6e314d941f3c9c6e314d941"
```

Sorts events by ticket price in ascending order.

---

### Example 5: Sort by Price (Descending)

**Request**:
```bash
curl "http://localhost:8000/api/events/?ordering=-ticket_price" \
  -H "Authorization: Token c9f6e314d941f3c9c6e314d941f3c9c6e314d941"
```

Sorts events by ticket price in descending order.

---

### Example 6: Combined Search and Filter

**Request**:
```bash
curl "http://localhost:8000/api/events/?search=workshop&date_from=2024-06-01&date_to=2024-06-30&ordering=ticket_price&page_size=20" \
  -H "Authorization: Token c9f6e314d941f3c9c6e314d941f3c9c6e314d941"
```

Searches for "workshop", filters by June 2024, sorts by price, with 20 items per page.

---

## Error Handling Examples

### Example 1: Registration Fails - User Already Registered

**Request**:
```bash
curl -X POST http://localhost:8000/api/events/5/register/ \
  -H "Authorization: Token c9f6e314d941f3c9c6e314d941f3c9c6e314d941" \
  -H "Content-Type: application/json" \
  -d '{"seats_reserved": 2}'
```

**Response (400 Bad Request)**:
```json
{
  "success": false,
  "message": "You already have an active registration for this event"
}
```

---

### Example 2: Registration Fails - Not Enough Seats

**Request**:
```bash
curl -X POST http://localhost:8000/api/events/5/register/ \
  -H "Authorization: Token c9f6e314d941f3c9c6e314d941f3c9c6e314d941" \
  -H "Content-Type: application/json" \
  -d '{"seats_reserved": 100}'
```

**Response (400 Bad Request)**:
```json
{
  "success": false,
  "message": "Not enough seats available. Only 29 seats left"
}
```

---

### Example 3: Missing Authentication Token

**Request**:
```bash
curl http://localhost:8000/api/events/
```

**Response (401 Unauthorized)**:
```json
{
  "detail": "Authentication credentials were not provided."
}
```

---

### Example 4: Invalid Token

**Request**:
```bash
curl http://localhost:8000/api/events/ \
  -H "Authorization: Token invalid_token_here"
```

**Response (401 Unauthorized)**:
```json
{
  "detail": "Invalid token."
}
```

---

### Example 5: Permission Denied - Not Event Creator

**Request**:
```bash
curl -X PUT http://localhost:8000/api/events/5/ \
  -H "Authorization: Token different_user_token" \
  -H "Content-Type: application/json" \
  -d '{"title": "New Title"}'
```

**Response (403 Forbidden)**:
```json
{
  "success": false,
  "message": "You do not have permission to perform this action."
}
```

---

### Example 6: Resource Not Found

**Request**:
```bash
curl http://localhost:8000/api/events/999/ \
  -H "Authorization: Token c9f6e314d941f3c9c6e314d941f3c9c6e314d941"
```

**Response (404 Not Found)**:
```json
{
  "detail": "Not found."
}
```

---

### Example 7: Validation Error - Invalid Data

**Request**:
```bash
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "John",
    "email": "invalid-email",
    "password": "short"
  }'
```

**Response (400 Bad Request)**:
```json
{
  "success": false,
  "message": "Validation error",
  "data": {
    "email": ["Enter a valid email address."],
    "password": ["Ensure this field has at least 6 characters."]
  }
}
```

---

### Example 8: Event Date in Past

**Request**:
```bash
curl -X POST http://localhost:8000/api/events/ \
  -H "Authorization: Token c9f6e314d941f3c9c6e314d941f3c9c6e314d941" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Past Event",
    "description": "This event is in the past",
    "venue": "Somewhere",
    "event_date": "2020-01-01",
    "event_time": "10:00:00",
    "total_seats": 50,
    "available_seats": 50,
    "ticket_price": "50.00"
  }'
```

**Response (400 Bad Request)**:
```json
{
  "success": false,
  "message": "Validation error",
  "data": {
    "event_date": ["Event date cannot be in the past"]
  }
}
```

---

## Using with Python Requests

### Example: Full Registration and Event Booking Flow

```python
import requests
import json
from datetime import datetime, timedelta

BASE_URL = 'http://localhost:8000/api'

# Step 1: Register a new user
print("1. Registering user...")
response = requests.post(
    f'{BASE_URL}/auth/register/',
    json={
        'full_name': 'John Doe',
        'email': 'john@example.com',
        'password': 'SecurePass123!'
    }
)
data = response.json()
token = data['data']['token']
print(f"✓ Registered! Token: {token}")

# Step 2: Create an event
print("\n2. Creating event...")
tomorrow = (datetime.now() + timedelta(days=30)).strftime('%Y-%m-%d')
response = requests.post(
    f'{BASE_URL}/events/',
    headers={'Authorization': f'Token {token}'},
    json={
        'title': 'Python Workshop',
        'description': 'Learn Python programming',
        'venue': 'Tech Hub',
        'event_date': tomorrow,
        'event_time': '10:00:00',
        'total_seats': 50,
        'available_seats': 50,
        'ticket_price': '99.99'
    }
)
event_data = response.json()['data']
event_id = event_data['id']
print(f"✓ Event created! Event ID: {event_id}")

# Step 3: List all events
print("\n3. Listing events...")
response = requests.get(
    f'{BASE_URL}/events/',
    headers={'Authorization': f'Token {token}'}
)
events = response.json()['results']
print(f"✓ Found {len(events)} events")

# Step 4: Register for the event
print("\n4. Registering for event...")
response = requests.post(
    f'{BASE_URL}/events/{event_id}/register/',
    headers={'Authorization': f'Token {token}'},
    json={'seats_reserved': 2}
)
reg_data = response.json()['data']
print(f"✓ Registered! Total cost: ${reg_data['total_cost']}")

# Step 5: Get my registrations
print("\n5. Getting my registrations...")
response = requests.get(
    f'{BASE_URL}/my-registrations/',
    headers={'Authorization': f'Token {token}'}
)
registrations = response.json()['results']
print(f"✓ You have {len(registrations)} registrations")

# Step 6: Logout
print("\n6. Logging out...")
requests.post(
    f'{BASE_URL}/auth/logout/',
    headers={'Authorization': f'Token {token}'}
)
print("✓ Logged out!")
```

---

For more examples and API documentation, see [README.md](README.md)
