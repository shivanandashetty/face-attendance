from flask import Flask, jsonify, send_from_directory, request, Response
from flask_cors import CORS
import sqlite3
import os
import subprocess
import jwt
import datetime
import cv2
import threading
import atexit

app = Flask(__name__)
CORS(app)

# ================== CONFIG ==================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "attendance.db")
CAPTURES_DIR = os.path.join(BASE_DIR, "captures")
DATASET_DIR = os.path.join(BASE_DIR, "dataset")

# IMPORTANT: faceenv python path
PYTHON_EXE = os.path.join(BASE_DIR, "faceenv", "Scripts", "python.exe")

os.makedirs(CAPTURES_DIR, exist_ok=True)
os.makedirs(DATASET_DIR, exist_ok=True)

app.config["SECRET_KEY"] = "face_ai_super_secret_123"

# ================== GLOBAL CAMERA CONTROL ==================
camera_process = None   # Auto capture (attendance)
camera = None           # Live stream
camera_lock = threading.Lock()

# ================== CLEANUP ==================
def cleanup():
    global camera, camera_process
    if camera:
        camera.release()
        camera = None
    if camera_process:
        camera_process.terminate()
        camera_process = None

atexit.register(cleanup)

# ================== DB ==================
def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

# ================== LOGIN ==================
@app.route("/api/login", methods=["POST"])
def login():
    data = request.json
    if data.get("username") == "admin" and data.get("password") == "admin123":
        token = jwt.encode({
            "user": "admin",
            "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=8)
        }, app.config["SECRET_KEY"], algorithm="HS256")

        return jsonify({"success": True, "token": token})

    return jsonify({"success": False, "message": "Invalid login"}), 401

# ================== ATTENDANCE ==================
@app.route("/api/attendance", methods=["GET"])
def get_attendance():
    conn = get_db()
    rows = conn.execute("SELECT * FROM attendance ORDER BY id DESC").fetchall()
    conn.close()

    data = []
    for row in rows:
        row = dict(row)
        if row.get("image_path"):
            filename = os.path.basename(row["image_path"])
            person = os.path.basename(os.path.dirname(row["image_path"]))
            row["image_path"] = f"/captures/{person}/{filename}"
        data.append(row)

    return jsonify(data)

# ================== CREATE PERSON ==================
@app.route("/api/create-person", methods=["POST"])
def create_person():
    name = request.json.get("name")
    if not name:
        return jsonify({"error": "Name required"}), 400

    os.makedirs(os.path.join(CAPTURES_DIR, name), exist_ok=True)
    os.makedirs(os.path.join(DATASET_DIR, name), exist_ok=True)

    return jsonify({"message": "Person folder created"})

# ================= REGISTER FACE =================
@app.route("/api/register-face", methods=["POST"])
def register_face():
    name = request.json.get("name")
    if not name:
        return jsonify({"error": "Name required"}), 400

    subprocess.Popen([PYTHON_EXE, "register_capture.py", name], cwd=BASE_DIR, creationflags=subprocess.CREATE_NEW_CONSOLE)
    return jsonify({"message": f"Register camera started for {name}"})

# ================= AUTO ATTENDANCE =================
@app.route("/api/start-capture", methods=["POST"])
def start_capture():
    global camera_process, camera
    with camera_lock:
        if camera is not None:
            return jsonify({"error": "Stop live stream first"}), 400

        if camera_process is None:
            camera_process = subprocess.Popen(
                [PYTHON_EXE, "Live_auto_Capture.py"],
                cwd=BASE_DIR,
                creationflags=subprocess.CREATE_NEW_CONSOLE
            )
            return jsonify({"message": "Attendance camera started"})

        return jsonify({"message": "Already running"})

@app.route("/api/stop-capture", methods=["POST"])
def stop_capture():
    global camera_process
    with camera_lock:
        if camera_process:
            camera_process.terminate()
            camera_process = None
            return jsonify({"message": "Attendance camera stopped"})
        return jsonify({"message": "Not running"})

# ================= TRAIN =================
@app.route("/api/train", methods=["POST"])
def train_model():
    subprocess.Popen([PYTHON_EXE, "encode_faces.py"], cwd=BASE_DIR, creationflags=subprocess.CREATE_NEW_CONSOLE)
    return jsonify({"message": "Training started"})

# ================= IMAGES =================
@app.route("/captures/<path:filename>")
def serve_image(filename):
    return send_from_directory(CAPTURES_DIR, filename)

# ================= GALLERY =================
@app.route("/api/gallery")
def get_gallery():
    data = {}
    for person in os.listdir(CAPTURES_DIR):
        person_folder = os.path.join(CAPTURES_DIR, person)
        if os.path.isdir(person_folder):
            images = []
            for f in os.listdir(person_folder):
                if f.lower().endswith(".jpg"):
                    images.append(f"/captures/{person}/{f}")
            data[person] = images
    return jsonify(data)

# ================= LIVE STREAM =================
def generate_frames():
    global camera
    while True:
        with camera_lock:
            if camera is None:
                break
            success, frame = camera.read()
            if not success:
                break

        ret, buffer = cv2.imencode(".jpg", frame)
        frame = buffer.tobytes()
        yield (b"--frame\r\n"
               b"Content-Type: image/jpeg\r\n\r\n" + frame + b"\r\n")

@app.route("/api/start-stream")
def start_stream():
    global camera, camera_process
    with camera_lock:
        if camera_process is not None:
            return jsonify({"error": "Stop attendance camera first"}), 400
        if camera is None:
            camera = cv2.VideoCapture(0)

    return Response(generate_frames(), mimetype="multipart/x-mixed-replace; boundary=frame")

@app.route("/api/stop-stream", methods=["POST"])
def stop_stream():
    global camera
    with camera_lock:
        if camera:
            camera.release()
            camera = None
    return jsonify({"message": "Live stream stopped"})

# ================= RUN =================
if __name__ == "__main__":
    app.run(debug=True, port=5000)
