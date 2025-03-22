import unittest
import os
import json
os.chdir(os.path.abspath(os.path.dirname(__file__)))
from app import app
from db import db_pool

class BookingServiceTestCase(unittest.TestCase):
    def setUp(self):
        self.app = app.test_client()
        self.app.testing = True

        conn = db_pool.get_connection()
        cursor = conn.cursor()

        cursor.execute("DROP TABLE IF EXISTS reservation_assignments;")
        cursor.execute("DROP TABLE IF EXISTS reservations;")

        cursor.execute("""
        CREATE TABLE reservations (
            reservation_id VARCHAR(36) PRIMARY KEY,
            num_players INT NOT NULL,
            start_time DATETIME NOT NULL,
            duration INT NOT NULL,
            table_assigned VARCHAR(50) NOT NULL
        );""")

        cursor.execute("""
        CREATE TABLE reservation_assignments (
            reservation_id VARCHAR(36),
            user_id INT,
            signed_up_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (reservation_id, user_id),
            FOREIGN KEY (reservation_id) REFERENCES reservations(reservation_id) ON DELETE CASCADE
        );""")

        conn.commit()
        cursor.close()
        conn.close()
        
    def tearDown(self):
        conn = db_pool.get_connection()
        cursor = conn.cursor()
        cursor.execute("DROP TABLE IF EXISTS reservation_assignments;")
        cursor.execute("DROP TABLE IF EXISTS reservations;")
        conn.commit()
        cursor.close()
        conn.close()

    def test_index(self):
        response = self.app.get('/')
        self.assertEqual(response.status_code, 200)
        self.assertIn(b'<html>', response.data)

    def test_create_and_get_reservation(self):
        payload = {
            "num_players": 4,
            "start_time": "2025-03-20T15:30:00",
            "duration": 90,
            "table_assigned": "Table-1"
        }
        post_response = self.app.post(
            '/booking/reservations',
            data=json.dumps(payload),
            content_type='application/json'
        )
        self.assertEqual(post_response.status_code, 201)
        data = json.loads(post_response.data)
        self.assertIn('reservation_id', data)
        reservation_id = data['reservation_id']
        
        get_response = self.app.get(f'/booking/reservations/{reservation_id}')
        self.assertEqual(get_response.status_code, 200)
        reservation = json.loads(get_response.data)
        self.assertEqual(reservation['num_players'], 4)
        self.assertEqual(reservation['table_assigned'], "Table-1")

    def test_get_reservations_by_date(self):
        response = self.app.get(
            '/booking/reservations/by-date?start_date=2025-03-01T00:00:00&end_date=2025-04-01T00:00:00'
        )
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIsInstance(data, list)

    def test_get_reservations_by_table(self):
        response = self.app.get('/booking/reservations/table/Table-1')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIsInstance(data, list)

    def test_update_reservation(self):
        payload = {
            "num_players": 2,
            "start_time": "2025-03-21T16:00:00",
            "duration": 60,
            "table_assigned": "Table-2"
        }
        post_response = self.app.post(
            '/booking/reservations',
            data=json.dumps(payload),
            content_type='application/json'
        )
        self.assertEqual(post_response.status_code, 201)
        reservation_id = json.loads(post_response.data)['reservation_id']

        update_payload = {
            "num_players": 3,
            "table_assigned": "Table-3"
        }
        put_response = self.app.put(
            f'/booking/reservations/{reservation_id}',
            data=json.dumps(update_payload),
            content_type='application/json'
        )
        self.assertEqual(put_response.status_code, 200)
        update_data = json.loads(put_response.data)
        self.assertEqual(update_data['message'], 'Reservation updated successfully.')

    def test_delete_reservation(self):
        payload = {
            "num_players": 2,
            "start_time": "2025-03-22T17:00:00",
            "duration": 45,
            "table_assigned": "Table-4"
        }
        post_response = self.app.post(
            '/booking/reservations',
            data=json.dumps(payload),
            content_type='application/json'
        )
        self.assertEqual(post_response.status_code, 201)
        reservation_id = json.loads(post_response.data)['reservation_id']

        del_response = self.app.delete(f'/booking/reservations/{reservation_id}')
        self.assertEqual(del_response.status_code, 200)
        del_data = json.loads(del_response.data)
        self.assertEqual(del_data['message'], 'Reservation deleted successfully.')

    def test_create_and_get_reservation_assignment(self):
        reservation_payload = {
            "num_players": 4,
            "start_time": "2025-03-23T18:00:00",
            "duration": 90,
            "table_assigned": "Table-5"
        }
        res_response = self.app.post(
            '/booking/reservations',
            data=json.dumps(reservation_payload),
            content_type='application/json'
        )
        self.assertEqual(res_response.status_code, 201)
        reservation_id = json.loads(res_response.data)['reservation_id']

        assignment_payload = {
            "reservation_id": reservation_id,
            "user_id": 1
        }
        post_assignment = self.app.post(
            '/booking/reservation_assignments',
            data=json.dumps(assignment_payload),
            content_type='application/json'
        )
        self.assertEqual(post_assignment.status_code, 201)
        assignment_data = json.loads(post_assignment.data)
        self.assertEqual(assignment_data['reservation_id'], reservation_id)
        self.assertEqual(assignment_data['user_id'], 1)

        get_assignment = self.app.get(f'/booking/reservation_assignments/{reservation_id}')
        self.assertEqual(get_assignment.status_code, 200)
        assignments = json.loads(get_assignment.data)
        self.assertIsInstance(assignments, list)
        self.assertTrue(any(a['user_id'] == 1 for a in assignments))

    def test_get_assignments_by_user(self):
        reservation_payload = {
            "num_players": 4,
            "start_time": "2025-03-24T19:00:00",
            "duration": 120,
            "table_assigned": "Table-6"
        }
        res_response = self.app.post(
            '/booking/reservations',
            data=json.dumps(reservation_payload),
            content_type='application/json'
        )
        self.assertEqual(res_response.status_code, 201)
        reservation_id = json.loads(res_response.data)['reservation_id']

        assignment_payload = {
            "reservation_id": reservation_id,
            "user_id": 2
        }
        post_assignment = self.app.post(
            '/booking/reservation_assignments',
            data=json.dumps(assignment_payload),
            content_type='application/json'
        )
        self.assertEqual(post_assignment.status_code, 201)
        get_by_user = self.app.get('/booking/reservation_assignments/user/2')
        self.assertEqual(get_by_user.status_code, 200)
        assignments = json.loads(get_by_user.data)
        self.assertIsInstance(assignments, list)
        self.assertTrue(any(a['user_id'] == 2 for a in assignments))
        
    def test_create_reservation_missing_fields(self):
        payload = {"num_players": 4}
        response = self.app.post(
            '/booking/reservations',
            data=json.dumps(payload),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 500)
        
    def test_get_all_reservations(self):
        response = self.app.get('/booking/reservations')
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(json.loads(response.data), list)
    
    def test_invalid_reservation_date_range(self):
        response = self.app.get(
            '/booking/reservations/by-date?start_date=2025-04-01T00:00:00&end_date=2025-03-01T00:00:00'
        )
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(len(data), 0)
        
    def test_get_assignments_by_nonexistent_user(self):
        response = self.app.get('/booking/reservation_assignments/user/9999')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIsInstance(data, list)
        self.assertEqual(len(data), 0)
        
    def test_update_nonexistent_reservation_assignment(self):
        update_payload = {"signed_up_at": "2025-04-01T20:05:00"}
        response = self.app.put(
            '/booking/reservation_assignments/fake-id/123',
            data=json.dumps(update_payload),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 404)
        
    def test_delete_nonexistent_reservation(self):
        response = self.app.delete('/booking/reservations/nonexistent-id')
        self.assertEqual(response.status_code, 404)

    def test_update_and_delete_reservation_assignment(self):
        reservation_payload = {
            "num_players": 4,
            "start_time": "2025-03-25T20:00:00",
            "duration": 120,
            "table_assigned": "Table-7"
        }
        res_response = self.app.post(
            '/booking/reservations',
            data=json.dumps(reservation_payload),
            content_type='application/json'
        )
        self.assertEqual(res_response.status_code, 201)
        reservation_id = json.loads(res_response.data)['reservation_id']

        assignment_payload = {
            "reservation_id": reservation_id,
            "user_id": 3
        }
        post_assignment = self.app.post(
            '/booking/reservation_assignments',
            data=json.dumps(assignment_payload),
            content_type='application/json'
        )
        self.assertEqual(post_assignment.status_code, 201)

        update_payload = {
            "signed_up_at": "2025-03-25T20:05:00"
        }
        put_response = self.app.put(
            f'/booking/reservation_assignments/{reservation_id}/3',
            data=json.dumps(update_payload),
            content_type='application/json'
        )
        self.assertEqual(put_response.status_code, 200)
        update_data = json.loads(put_response.data)
        self.assertEqual(update_data['message'], 'Reservation assignment updated successfully.')

        del_response = self.app.delete(f'/booking/reservation_assignments/{reservation_id}/3')
        self.assertEqual(del_response.status_code, 200)
        del_data = json.loads(del_response.data)
        self.assertEqual(del_data['message'], 'Reservation assignment deleted successfully.')

if __name__ == '__main__':
    unittest.main()