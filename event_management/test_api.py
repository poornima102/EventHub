"""
API Testing Script for Event Management System

This script helps test all API endpoints
Run with: python test_api.py

Make sure the Django server is running on http://localhost:8000
"""
import requests
import json
from datetime import datetime, timedelta

# Base URL for API
BASE_URL = 'http://localhost:8000/api'

# Store tokens and IDs for testing
user_token = None
event_id = None
registration_id = None


def print_section(title):
    """Print a formatted section header"""
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}\n")


def print_response(response, show_body=True):
    """Print response status and body"""
    print(f"Status Code: {response.status_code}")
    if show_body:
        try:
            print(f"Response: {json.dumps(response.json(), indent=2)}")
        except:
            print(f"Response: {response.text}")


def test_registration():
    """Test user registration endpoint"""
    global user_token
    
    print_section("TEST 1: USER REGISTRATION")
    
    url = f"{BASE_URL}/auth/register/"
    payload = {
        "full_name": "John Doe",
        "email": "john@example.com",
        "password": "TestPassword123"
    }
    
    print(f"POST {url}")
    print(f"Payload: {json.dumps(payload, indent=2)}")
    
    response = requests.post(url, json=payload)
    print_response(response)
    
    if response.status_code == 201:
        data = response.json()
        user_token = data['data']['token']
        print(f"\n✓ Registration successful!")
        print(f"Token: {user_token}")
        return True
    else:
        print(f"\n✗ Registration failed!")
        return False


def test_login():
    """Test user login endpoint"""
    global user_token
    
    print_section("TEST 2: USER LOGIN")
    
    url = f"{BASE_URL}/auth/login/"
    payload = {
        "email": "john@example.com",
        "password": "TestPassword123"
    }
    
    print(f"POST {url}")
    print(f"Payload: {json.dumps(payload, indent=2)}")
    
    response = requests.post(url, json=payload)
    print_response(response)
    
    if response.status_code == 200:
        data = response.json()
        user_token = data['data']['token']
        print(f"\n✓ Login successful!")
        print(f"Token: {user_token}")
        return True
    else:
        print(f"\n✗ Login failed!")
        return False


def test_list_events():
    """Test listing events"""
    print_section("TEST 3: LIST EVENTS")
    
    url = f"{BASE_URL}/events/"
    headers = {'Authorization': f'Token {user_token}'}
    
    print(f"GET {url}")
    print(f"Headers: {headers}")
    
    response = requests.get(url, headers=headers)
    print_response(response)
    
    if response.status_code == 200:
        print(f"\n✓ Events retrieved successfully!")
        return True
    else:
        print(f"\n✗ Failed to retrieve events!")
        return False


def test_create_event():
    """Test event creation"""
    global event_id
    
    print_section("TEST 4: CREATE EVENT")
    
    url = f"{BASE_URL}/events/"
    
    # Create event date as tomorrow
    event_date = (datetime.now() + timedelta(days=30)).strftime('%Y-%m-%d')
    
    payload = {
        "title": "Tech Conference 2024",
        "description": "Annual technology conference with industry experts",
        "venue": "Convention Center, Downtown",
        "event_date": event_date,
        "event_time": "09:00:00",
        "total_seats": 100,
        "available_seats": 100,
        "ticket_price": "50.00"
    }
    
    headers = {
        'Authorization': f'Token {user_token}',
        'Content-Type': 'application/json'
    }
    
    print(f"POST {url}")
    print(f"Payload: {json.dumps(payload, indent=2)}")
    
    response = requests.post(url, json=payload, headers=headers)
    print_response(response)
    
    if response.status_code == 201:
        data = response.json()
        event_id = data['data']['id']
        print(f"\n✓ Event created successfully!")
        print(f"Event ID: {event_id}")
        return True
    else:
        print(f"\n✗ Failed to create event!")
        return False


def test_get_event_details():
    """Test getting event details"""
    print_section("TEST 5: GET EVENT DETAILS")
    
    if not event_id:
        print("⚠ Skipping - Event ID not available")
        return False
    
    url = f"{BASE_URL}/events/{event_id}/"
    headers = {'Authorization': f'Token {user_token}'}
    
    print(f"GET {url}")
    
    response = requests.get(url, headers=headers)
    print_response(response)
    
    if response.status_code == 200:
        print(f"\n✓ Event details retrieved successfully!")
        return True
    else:
        print(f"\n✗ Failed to get event details!")
        return False


def test_register_for_event():
    """Test event registration"""
    global registration_id
    
    print_section("TEST 6: REGISTER FOR EVENT")
    
    if not event_id:
        print("⚠ Skipping - Event ID not available")
        return False
    
    url = f"{BASE_URL}/events/{event_id}/register/"
    
    payload = {
        "seats_reserved": 2
    }
    
    headers = {
        'Authorization': f'Token {user_token}',
        'Content-Type': 'application/json'
    }
    
    print(f"POST {url}")
    print(f"Payload: {json.dumps(payload, indent=2)}")
    
    response = requests.post(url, json=payload, headers=headers)
    print_response(response)
    
    if response.status_code == 201:
        data = response.json()
        registration_id = data['data']['registration']['id']
        print(f"\n✓ Registration successful!")
        print(f"Registration ID: {registration_id}")
        print(f"Total Cost: {data['data']['total_cost']}")
        return True
    else:
        print(f"\n✗ Registration failed!")
        return False


def test_my_registrations():
    """Test getting user's registrations"""
    print_section("TEST 7: GET MY REGISTRATIONS")
    
    url = f"{BASE_URL}/my-registrations/"
    headers = {'Authorization': f'Token {user_token}'}
    
    print(f"GET {url}")
    
    response = requests.get(url, headers=headers)
    print_response(response)
    
    if response.status_code == 200:
        print(f"\n✓ User registrations retrieved successfully!")
        return True
    else:
        print(f"\n✗ Failed to get user registrations!")
        return False


def test_my_events():
    """Test getting user's created events"""
    print_section("TEST 8: GET MY EVENTS")
    
    url = f"{BASE_URL}/my-events/"
    headers = {'Authorization': f'Token {user_token}'}
    
    print(f"GET {url}")
    
    response = requests.get(url, headers=headers)
    print_response(response)
    
    if response.status_code == 200:
        print(f"\n✓ User events retrieved successfully!")
        return True
    else:
        print(f"\n✗ Failed to get user events!")
        return False


def test_event_registrations():
    """Test getting event registrations (creator only)"""
    print_section("TEST 9: GET EVENT REGISTRATIONS")
    
    if not event_id:
        print("⚠ Skipping - Event ID not available")
        return False
    
    url = f"{BASE_URL}/events/{event_id}/registrations/"
    headers = {'Authorization': f'Token {user_token}'}
    
    print(f"GET {url}")
    
    response = requests.get(url, headers=headers)
    print_response(response)
    
    if response.status_code == 200:
        print(f"\n✓ Event registrations retrieved successfully!")
        return True
    else:
        print(f"\n✗ Failed to get event registrations!")
        return False


def test_update_event():
    """Test updating an event"""
    print_section("TEST 10: UPDATE EVENT")
    
    if not event_id:
        print("⚠ Skipping - Event ID not available")
        return False
    
    url = f"{BASE_URL}/events/{event_id}/"
    
    # Create event date as tomorrow
    event_date = (datetime.now() + timedelta(days=35)).strftime('%Y-%m-%d')
    
    payload = {
        "title": "Updated Tech Conference 2024",
        "description": "Updated annual technology conference",
        "venue": "Updated Convention Center",
        "event_date": event_date,
        "event_time": "10:00:00",
        "total_seats": 120,
        "available_seats": 120,
        "ticket_price": "75.00"
    }
    
    headers = {
        'Authorization': f'Token {user_token}',
        'Content-Type': 'application/json'
    }
    
    print(f"PUT {url}")
    print(f"Payload: {json.dumps(payload, indent=2)}")
    
    response = requests.put(url, json=payload, headers=headers)
    print_response(response)
    
    if response.status_code == 200:
        print(f"\n✓ Event updated successfully!")
        return True
    else:
        print(f"\n✗ Failed to update event!")
        return False


def test_cancel_registration():
    """Test canceling a registration"""
    print_section("TEST 11: CANCEL REGISTRATION")
    
    if not registration_id:
        print("⚠ Skipping - Registration ID not available")
        return False
    
    url = f"{BASE_URL}/registrations/{registration_id}/cancel/"
    
    headers = {
        'Authorization': f'Token {user_token}',
        'Content-Type': 'application/json'
    }
    
    print(f"POST {url}")
    
    response = requests.post(url, headers=headers)
    print_response(response)
    
    if response.status_code == 200:
        print(f"\n✓ Registration cancelled successfully!")
        return True
    else:
        print(f"\n✗ Failed to cancel registration!")
        return False


def test_logout():
    """Test user logout"""
    print_section("TEST 12: USER LOGOUT")
    
    url = f"{BASE_URL}/auth/logout/"
    headers = {'Authorization': f'Token {user_token}'}
    
    print(f"POST {url}")
    
    response = requests.post(url, headers=headers)
    print_response(response)
    
    if response.status_code == 200:
        print(f"\n✓ Logout successful!")
        return True
    else:
        print(f"\n✗ Failed to logout!")
        return False


def run_all_tests():
    """Run all tests"""
    print("\n" + "="*60)
    print("  EVENT MANAGEMENT SYSTEM - API TEST SUITE")
    print("="*60)
    print("\nMake sure:")
    print("1. Django server is running on http://localhost:8000")
    print("2. MySQL database is configured and running")
    print("3. Migrations have been run (python manage.py migrate)")
    
    tests = [
        ("Registration", test_registration),
        ("Login", test_login),
        ("List Events", test_list_events),
        ("Create Event", test_create_event),
        ("Get Event Details", test_get_event_details),
        ("Register for Event", test_register_for_event),
        ("Get My Registrations", test_my_registrations),
        ("Get My Events", test_my_events),
        ("Get Event Registrations", test_event_registrations),
        ("Update Event", test_update_event),
        ("Cancel Registration", test_cancel_registration),
        ("Logout", test_logout),
    ]
    
    results = []
    for test_name, test_func in tests:
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"\n✗ Test failed with error: {str(e)}")
            results.append((test_name, False))
    
    # Print summary
    print_section("TEST SUMMARY")
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✓ PASSED" if result else "✗ FAILED"
        print(f"{test_name:.<40} {status}")
    
    print(f"\n{'TOTAL':.<40} {passed}/{total} tests passed")
    
    if passed == total:
        print("\n🎉 All tests passed!")
    else:
        print(f"\n⚠ {total - passed} test(s) failed. Check the output above.")


if __name__ == '__main__':
    try:
        run_all_tests()
    except KeyboardInterrupt:
        print("\n\nTest interrupted by user.")
    except Exception as e:
        print(f"\n\nUnexpected error: {str(e)}")
