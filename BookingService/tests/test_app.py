import unittest
import json
from datetime import datetime, timedelta

from src.app import app

class BookingServiceTestCase(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = app.test_client()
        cls.test_reservation_id = None
        cls.test_assignment_user_id = 999 
        cls.test_assignment_reservation_id = None

    def test_01_index_page(self):
        response = self.client.get('/')
        self.assertEqual(response.status_code, 200, "Index page should return 200 OK")
        self.assertIn(b'<html>', response.data, "Index page should contain HTML")

    def test_02_create_reservation(self):
        payload = {
            "num_players": 4,
            "start_time": "2030-01-01T12:00:00",
            "duration": 120,
            "table_assigned": "TestTable1"
        }
        response = self.client.post(
            '/booking/reservations',
            data=json.dumps(payload),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 201, "POST /booking/reservations should return 201 Created")
        data = json.loads(response.data)
        self.assertIn("reservation_id", data, "Response should contain a reservation_id")
        BookingServiceTestCase.test_reservation_id = data["reservation_id"]

    def test_03_get_reservation_by_id(self):
        self.assertIsNotNone(self.test_reservation_id, "Reservation ID must exist from create test")
        url = f'/booking/reservations/{self.test_reservation_id}'
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200, "GET /booking/reservations/<id> should return 200 OK")
        data = json.loads(response.data)
        self.assertEqual(data["reservation_id"], self.test_reservation_id, "IDs should match")

    def test_04_update_reservation(self):
        self.assertIsNotNone(self.test_reservation_id, "Reservation ID must exist from create test")
        url = f'/booking/reservations/{self.test_reservation_id}'
        update_payload = {
            "num_players": 6,
            "duration": 90,
            "table_assigned": "UpdatedTable"
        }
        response = self.client.put(
            url,
            data=json.dumps(update_payload),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 200, "PUT /booking/reservations/<id> should return 200 OK")
        get_response = self.client.get(url)
        updated_data = json.loads(get_response.data)
        self.assertEqual(updated_data["num_players"], 6)
        self.assertEqual(updated_data["duration"], 90)
        self.assertEqual(updated_data["table_assigned"], "UpdatedTable")

    def test_05_get_reservations_by_date(self):
        start_date = "2030-01-01T00:00:00"
        end_date = "2030-01-02T00:00:00"
        response = self.client.get(f'/booking/reservations/by-date?start_date={start_date}&end_date={end_date}')
        self.assertEqual(response.status_code, 200, "GET /booking/reservations/by-date should return 200 OK")
        data = json.loads(response.data)
        self.assertTrue(any(r["reservation_id"] == self.test_reservation_id for r in data),
                        "Expected our test reservation in the returned date range.")

    def test_06_get_reservations_by_table(self):
        response = self.client.get('/booking/reservations/table/UpdatedTable')
        self.assertEqual(response.status_code, 200, "GET /booking/reservations/table/<table> should return 200 OK")
        data = json.loads(response.data)
        self.assertTrue(any(r["reservation_id"] == self.test_reservation_id for r in data),
                        "Expected our test reservation under the updated table name.")

    def test_07_create_reservation_assignment(self):
        self.assertIsNotNone(self.test_reservation_id, "Reservation ID must exist from create test")
        payload = {
            "reservation_id": self.test_reservation_id,
            "user_id": self.test_assignment_user_id
        }
        response = self.client.post(
            '/booking/reservation_assignments',
            data=json.dumps(payload),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 201, "POST /booking/reservation_assignments should return 201 Created")
        data = json.loads(response.data)
        BookingServiceTestCase.test_assignment_reservation_id = data["reservation_id"]
        self.assertEqual(data["user_id"], self.test_assignment_user_id)

    def test_08_get_assignments_by_reservation(self):
        self.assertIsNotNone(self.test_assignment_reservation_id, "Reservation ID must be stored from assignment creation")
        url = f'/booking/reservation_assignments/{self.test_assignment_reservation_id}'
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200, "GET /booking/reservation_assignments/<res_id> should return 200 OK")
        data = json.loads(response.data)
        self.assertTrue(len(data) > 0, "Expected at least one assignment for this reservation.")
        self.assertEqual(data[0]["reservation_id"], self.test_assignment_reservation_id)

    def test_09_get_assignments_by_user(self):
        url = f'/booking/reservation_assignments/user/{self.test_assignment_user_id}'
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200, "GET /booking/reservation_assignments/user/<user_id> should return 200 OK")
        data = json.loads(response.data)
        self.assertTrue(len(data) > 0, "Expected at least one assignment for this user.")
        self.assertEqual(data[0]["user_id"], self.test_assignment_user_id)

    def test_10_update_reservation_assignment(self):
        self.assertIsNotNone(self.test_assignment_reservation_id, "Reservation ID must be stored from assignment creation")
        url = f'/booking/reservation_assignments/{self.test_assignment_reservation_id}/{self.test_assignment_user_id}'
        payload = {
            "signed_up_at": "2030-01-01T10:00:00"
        }
        response = self.client.put(
            url,
            data=json.dumps(payload),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 200, "PUT /booking/reservation_assignments/<res_id>/<user_id> should return 200 OK")
        get_response = self.client.get(
            f'/booking/reservation_assignments/{self.test_assignment_reservation_id}'
        )
        data = json.loads(get_response.data)
        self.assertTrue(any(a.get("signed_up_at") == "2030-01-01T10:00:00" for a in data),
                        "Expected signed_up_at to be updated.")

    def test_11_delete_reservation_assignment(self):
        url = f'/booking/reservation_assignments/{self.test_assignment_reservation_id}/{self.test_assignment_user_id}'
        response = self.client.delete(url)
        self.assertEqual(response.status_code, 200, "DELETE /booking/reservation_assignments/<res_id>/<user_id> should return 200 OK")
        get_response = self.client.get(
            f'/booking/reservation_assignments/{self.test_assignment_reservation_id}'
        )
        data = json.loads(get_response.data)
        self.assertFalse(any(a["user_id"] == self.test_assignment_user_id for a in data),
                         "Expected the assignment to be deleted.")

    def test_12_delete_reservation(self):
        self.assertIsNotNone(self.test_reservation_id, "Reservation ID must exist")
        url = f'/booking/reservations/{self.test_reservation_id}'
        response = self.client.delete(url)
        self.assertEqual(response.status_code, 200, "DELETE /booking/reservations/<id> should return 200 OK")
        get_response = self.client.get(url)
        self.assertEqual(get_response.status_code, 404, "GET on a deleted reservation should return 404 Not Found")


if __name__ == '__main__':
    unittest.main()