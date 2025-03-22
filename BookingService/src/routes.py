from uuid import uuid4
from flask import Blueprint, jsonify, abort, render_template, request
import mysql.connector
from db import db_pool

bp = Blueprint('booking', __name__)

def generate_id():
    return str(uuid4())

@bp.route('/')
def index():
    return render_template("index.html")

@bp.route('/booking/reservations', methods=['GET'])
def get_reservations():
    """
    Get All Reservations
    ---
    tags:
      - Reservations
    operationId: getReservations
    security:
      - BearerAuth: []
    responses:
      200:
        description: A list of reservations.
        schema:
          type: array
          items:
            type: object
    """
    try:
        conn = db_pool.get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM reservations")
        rows = cursor.fetchall()
        return jsonify(rows), 200
    except mysql.connector.Error as err:
        abort(500, description=f"Database error: {err}")
    finally:
        if conn.is_connected():
            conn.close()

@bp.route('/booking/reservations/<reservation_id>', methods=['GET'])
def get_reservation_by_id(reservation_id):
    """
    Get a Single Reservation by ID
    ---
    tags:
      - Reservations
    operationId: getReservationById
    security:
      - BearerAuth: []
    parameters:
      - in: path
        name: reservation_id
        type: string
        required: true
    responses:
      200:
        description: A reservation object.
      404:
        description: Reservation not found.
    """
    try:
        conn = db_pool.get_connection()
        cursor = conn.cursor(dictionary=True)
        sql = "SELECT * FROM reservations WHERE reservation_id = %s"
        cursor.execute(sql, (reservation_id,))
        row = cursor.fetchone()
        if not row:
            abort(404, description="Reservation not found")
        return jsonify(row), 200
    except mysql.connector.Error as err:
        abort(500, description=f"Database error: {err}")
    finally:
        if conn.is_connected():
            conn.close()

@bp.route('/booking/reservations/by-date', methods=['GET'])
def get_reservations_by_date():
    """
    Get Reservations by Date Range
    ---
    tags:
      - Reservations
    operationId: getReservationsByDate
    security:
      - BearerAuth: []
    parameters:
      - in: query
        name: start_date
        type: string
        required: true
        description: Start date in ISO format.
      - in: query
        name: end_date
        type: string
        required: true
        description: End date in ISO format.
    responses:
      200:
        description: List of reservations within the date range.
    """
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    try:
        conn = db_pool.get_connection()
        cursor = conn.cursor(dictionary=True)
        sql = """SELECT * FROM reservations 
                 WHERE start_time BETWEEN %s AND %s"""
        cursor.execute(sql, (start_date, end_date))
        rows = cursor.fetchall()
        return jsonify(rows), 200
    except mysql.connector.Error as err:
        abort(500, description=f"Database error: {err}")
    finally:
        if conn.is_connected():
            conn.close()

@bp.route('/booking/reservations/table/<table_assigned>', methods=['GET'])
def get_reservations_by_table(table_assigned):
    """
    Get Reservations by Table
    ---
    tags:
      - Reservations
    operationId: getReservationsByTable
    security:
      - BearerAuth: []
    parameters:
      - in: path
        name: table_assigned
        type: string
        required: true
        description: Table identifier.
    responses:
      200:
        description: List of reservations for the specified table.
    """
    try:
        conn = db_pool.get_connection()
        cursor = conn.cursor(dictionary=True)
        sql = "SELECT * FROM reservations WHERE table_assigned = %s"
        cursor.execute(sql, (table_assigned,))
        rows = cursor.fetchall()
        return jsonify(rows), 200
    except mysql.connector.Error as err:
        abort(500, description=f"Database error: {err}")
    finally:
        if conn.is_connected():
            conn.close()

@bp.route('/booking/reservations', methods=['POST'])
def create_reservation():
    """
    Create a Reservation
    ---
    tags:
      - Reservations
    operationId: createReservation
    security:
      - BearerAuth: []
    parameters:
      - in: body
        name: reservation
        schema:
          type: object
          required:
            - num_players
            - start_time
            - duration
            - table_assigned
          properties:
            num_players:
              type: integer
            start_time:
              type: string
              format: date-time
            duration:
              type: integer
            table_assigned:
              type: string
    responses:
      201:
        description: Reservation created successfully.
    """
    data = request.get_json()
    reservation_id = generate_id()
    num_players = data.get('num_players')
    start_time = data.get('start_time')
    duration = data.get('duration')
    table_assigned = data.get('table_assigned')
    try:
        conn = db_pool.get_connection()
        cursor = conn.cursor()
        sql = """INSERT INTO reservations (reservation_id, num_players, start_time, duration, table_assigned)
                 VALUES (%s, %s, %s, %s, %s)"""
        cursor.execute(sql, (reservation_id, num_players, start_time, duration, table_assigned))
        conn.commit()
        return jsonify({'reservation_id': reservation_id}), 201
    except mysql.connector.Error as err:
        abort(500, description=f"Database error: {err}")
    finally:
        if conn.is_connected():
            conn.close()

@bp.route('/booking/reservations/<reservation_id>', methods=['PUT'])
def update_reservation(reservation_id):
    """
    Update a Reservation
    ---
    tags:
      - Reservations
    operationId: updateReservation
    security:
      - BearerAuth: []
    parameters:
      - in: path
        name: reservation_id
        type: string
        required: true
      - in: body
        name: reservation
        schema:
          type: object
          properties:
            num_players:
              type: integer
            start_time:
              type: string
              format: date-time
            duration:
              type: integer
            table_assigned:
              type: string
    responses:
      200:
        description: Reservation updated successfully.
      404:
        description: Reservation not found.
    """
    data = request.get_json()
    num_players = data.get('num_players')
    start_time = data.get('start_time')
    duration = data.get('duration')
    table_assigned = data.get('table_assigned')
    try:
        conn = db_pool.get_connection()
        cursor = conn.cursor()
        sql = """UPDATE reservations
                 SET num_players = COALESCE(%s, num_players),
                     start_time = COALESCE(%s, start_time),
                     duration = COALESCE(%s, duration),
                     table_assigned = COALESCE(%s, table_assigned)
                 WHERE reservation_id = %s"""
        cursor.execute(sql, (num_players, start_time, duration, table_assigned, reservation_id))
        conn.commit()
        if cursor.rowcount == 0:
            abort(404, description="Reservation not found")
        return jsonify({'message': 'Reservation updated successfully.'}), 200
    except mysql.connector.Error as err:
        abort(500, description=f"Database error: {err}")
    finally:
        if conn.is_connected():
            conn.close()

@bp.route('/booking/reservations/<reservation_id>', methods=['DELETE'])
def delete_reservation(reservation_id):
    """
    Delete a Reservation
    ---
    tags:
      - Reservations
    operationId: deleteReservation
    security:
      - BearerAuth: []
    parameters:
      - in: path
        name: reservation_id
        type: string
        required: true
    responses:
      200:
        description: Reservation deleted successfully.
      404:
        description: Reservation not found.
    """
    try:
        conn = db_pool.get_connection()
        cursor = conn.cursor()
        sql_assign = "DELETE FROM reservation_assignments WHERE reservation_id = %s"
        cursor.execute(sql_assign, (reservation_id,))
        sql_reservation = "DELETE FROM reservations WHERE reservation_id = %s"
        cursor.execute(sql_reservation, (reservation_id,))
        conn.commit()
        if cursor.rowcount == 0:
            abort(404, description="Reservation not found")
        return jsonify({'message': 'Reservation deleted successfully.'}), 200
    except mysql.connector.Error as err:
        abort(500, description=f"Database error: {err}")
    finally:
        if conn.is_connected():
            conn.close()

@bp.route('/booking/reservation_assignments', methods=['GET'])
def get_reservation_assignments():
    """
    Get All Reservation Assignments
    ---
    tags:
      - Reservation Assignments
    operationId: getReservationAssignments
    security:
      - BearerAuth: []
    responses:
      200:
        description: A list of reservation assignments.
        schema:
          type: array
          items:
            type: object
    """
    try:
        conn = db_pool.get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM reservation_assignments")
        rows = cursor.fetchall()
        return jsonify(rows), 200
    except mysql.connector.Error as err:
        abort(500, description=f"Database error: {err}")
    finally:
        if conn.is_connected():
            conn.close()

@bp.route('/booking/reservation_assignments/<reservation_id>', methods=['GET'])
def get_assignments_by_reservation(reservation_id):
    """
    Get Reservation Assignments for a Specific Reservation
    ---
    tags:
      - Reservation Assignments
    operationId: getAssignmentsByReservation
    security:
      - BearerAuth: []
    parameters:
      - in: path
        name: reservation_id
        type: string
        required: true
    responses:
      200:
        description: A list of assignments for the specified reservation.
    """
    try:
        conn = db_pool.get_connection()
        cursor = conn.cursor(dictionary=True)
        sql = "SELECT * FROM reservation_assignments WHERE reservation_id = %s"
        cursor.execute(sql, (reservation_id,))
        rows = cursor.fetchall()
        return jsonify(rows), 200
    except mysql.connector.Error as err:
        abort(500, description=f"Database error: {err}")
    finally:
        if conn.is_connected():
            conn.close()

@bp.route('/booking/reservation_assignments/user/<int:user_id>', methods=['GET'])
def get_assignments_by_user(user_id):
    """
    Get Reservations Assigned to a Specific User
    ---
    tags:
      - Reservation Assignments
    operationId: getAssignmentsByUser
    security:
      - BearerAuth: []
    parameters:
      - in: path
        name: user_id
        type: integer
        required: true
    responses:
      200:
        description: A list of reservations for the specified user.
    """
    try:
        conn = db_pool.get_connection()
        cursor = conn.cursor(dictionary=True)
        sql = "SELECT * FROM reservation_assignments WHERE user_id = %s"
        cursor.execute(sql, (user_id,))
        rows = cursor.fetchall()
        return jsonify(rows), 200
    except mysql.connector.Error as err:
        abort(500, description=f"Database error: {err}")
    finally:
        if conn.is_connected():
            conn.close()

@bp.route('/booking/reservation_assignments', methods=['POST'])
def create_reservation_assignment():
    """
    Create a Reservation Assignment
    ---
    tags:
      - Reservation Assignments
    operationId: createReservationAssignment
    security:
      - BearerAuth: []
    parameters:
      - in: body
        name: assignment
        schema:
          type: object
          required:
            - reservation_id
            - user_id
          properties:
            reservation_id:
              type: string
            user_id:
              type: integer
    responses:
      201:
        description: Reservation assignment created successfully.
    """
    data = request.get_json()
    reservation_id = data.get('reservation_id')
    user_id = data.get('user_id')
    try:
        conn = db_pool.get_connection()
        cursor = conn.cursor()
        sql = """INSERT INTO reservation_assignments (reservation_id, user_id)
                 VALUES (%s, %s)"""
        cursor.execute(sql, (reservation_id, user_id))
        conn.commit()
        return jsonify({'reservation_id': reservation_id, 'user_id': user_id}), 201
    except mysql.connector.Error as err:
        abort(500, description=f"Database error: {err}")
    finally:
        if conn.is_connected():
            conn.close()

@bp.route('/booking/reservation_assignments/<reservation_id>/<int:user_id>', methods=['PUT'])
def update_reservation_assignment(reservation_id, user_id):
    """
    Update a Reservation Assignment
    ---
    tags:
      - Reservation Assignments
    operationId: updateReservationAssignment
    security:
      - BearerAuth: []
    parameters:
      - in: path
        name: reservation_id
        type: string
        required: true
      - in: path
        name: user_id
        type: integer
        required: true
      - in: body
        name: assignment
        schema:
          type: object
          properties:
            signed_up_at:
              type: string
              format: date-time
    responses:
      200:
        description: Reservation assignment updated successfully.
      404:
        description: Reservation assignment not found.
    """
    data = request.get_json()
    signed_up_at = data.get('signed_up_at')
    try:
        conn = db_pool.get_connection()
        cursor = conn.cursor()
        sql = """UPDATE reservation_assignments
                 SET signed_up_at = COALESCE(%s, signed_up_at)
                 WHERE reservation_id = %s AND user_id = %s"""
        cursor.execute(sql, (signed_up_at, reservation_id, user_id))
        conn.commit()
        if cursor.rowcount == 0:
            abort(404, description="Reservation assignment not found")
        return jsonify({'message': 'Reservation assignment updated successfully.'}), 200
    except mysql.connector.Error as err:
        abort(500, description=f"Database error: {err}")
    finally:
        if conn.is_connected():
            conn.close()

@bp.route('/booking/reservation_assignments/<reservation_id>/<int:user_id>', methods=['DELETE'])
def delete_reservation_assignment(reservation_id, user_id):
    """
    Delete a Reservation Assignment
    ---
    tags:
      - Reservation Assignments
    operationId: deleteReservationAssignment
    security:
      - BearerAuth: []
    parameters:
      - in: path
        name: reservation_id
        type: string
        required: true
      - in: path
        name: user_id
        type: integer
        required: true
    responses:
      200:
        description: Reservation assignment deleted successfully.
      404:
        description: Reservation assignment not found.
    """
    try:
        conn = db_pool.get_connection()
        cursor = conn.cursor()
        sql = "DELETE FROM reservation_assignments WHERE reservation_id = %s AND user_id = %s"
        cursor.execute(sql, (reservation_id, user_id))
        conn.commit()
        if cursor.rowcount == 0:
            abort(404, description="Reservation assignment not found")
        return jsonify({'message': 'Reservation assignment deleted successfully.'}), 200
    except mysql.connector.Error as err:
        abort(500, description=f"Database error: {err}")
    finally:
        if conn.is_connected():
            conn.close()