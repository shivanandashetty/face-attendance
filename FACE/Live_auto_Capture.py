#Webcam capture + face detection
import cv2
#Save & load trained data
import pickle
#Advanced face recognition
import insightface
#cosine distance for face comparison
from scipy.spatial.distance import cosine
from datetime import datetime
import os
import sqlite3
#Voice output
import pyttsx3
import time
#Beep sound alerts
import winsound

# -------------------- Voice Engine --------------------
engine = pyttsx3.init()
engine.setProperty('rate', 170)

# -------------------- Setup --------------------
script_dir = os.path.dirname(os.path.abspath(__file__))
project_root = script_dir

# Root folder to save captures
captures_root = os.path.join(project_root, "captures")
os.makedirs(captures_root, exist_ok=True)

emb_path = os.path.join(project_root, "embeddings.pkl")
db_path = os.path.join(project_root, "attendance.db")

# -------------------- Load embeddings --------------------
if os.path.exists(emb_path):
    with open(emb_path, "rb") as f:
        known_embeddings = pickle.load(f)
else:
    known_embeddings = {}
    print("⚠️ No embeddings found. Known faces will not be recognized.")

# -------------------- Initialize InsightFace --------------------
app = insightface.app.FaceAnalysis(name="buffalo_l")
app.prepare(ctx_id=0)

# -------------------- Database --------------------
conn = sqlite3.connect(db_path)
c = conn.cursor()
c.execute("""
CREATE TABLE IF NOT EXISTS attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    image_path TEXT NOT NULL
)
""")
conn.commit()

# -------------------- Video Capture --------------------
cap = cv2.VideoCapture(0)
THRESHOLD = 0.65
last_seen = {}     # for DB duplicate control
last_spoken = {}   # for voice / alarm control

print("Press Q to quit")

while True:
    ret, frame = cap.read()
    if not ret:
        break

    faces = app.get(frame)

    screen_message = "No Face Detected"
    screen_color = (0, 255, 255)

    for face in faces:
        emb = face.embedding
        name = "Unknown"
        min_dist = 1.0

        # -------------------- Check for known faces --------------------
        for person, known_emb in known_embeddings.items():
            dist = cosine(emb, known_emb)
            if dist < min_dist and dist < THRESHOLD:
                min_dist = dist
                name = person

        # -------------------- Draw box --------------------
        x1, y1, x2, y2 = map(int, face.bbox)
        cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
        cv2.putText(frame, name, (x1, y1 - 10),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 255, 0), 2)

        # -------------------- Welcome / Unknown Message --------------------
        now = datetime.now()

        if name != "Unknown":
            screen_message = f"Welcome {name}"
            screen_color = (0, 255, 0)

            # 🔊 Speak only once every 20 seconds per person
            if name not in last_spoken or (now - last_spoken[name]).seconds > 20:
                last_spoken[name] = now
                engine.say(f"Welcome {name}")
                engine.runAndWait()

        else:
            screen_message = "Unknown Person"
            screen_color = (0, 0, 255)

            # 🚨 Beep alarm every 10 seconds for unknown
            if "Unknown" not in last_spoken or (now - last_spoken["Unknown"]).seconds > 10:
                last_spoken["Unknown"] = now
                winsound.Beep(1000, 700)  # frequency, duration

        # -------------------- Date & Time --------------------
        date_str = now.strftime("%Y-%m-%d")
        time_str = now.strftime("%H:%M:%S")
        ts_filename = now.strftime("%Y-%m-%d_%H-%M-%S")

        # -------------------- DB & Image save (10 sec rule) --------------------
        if name not in last_seen or (now - last_seen[name]).seconds > 10:
            last_seen[name] = now

            # Create person folder
            person_folder = os.path.join(captures_root, name)
            os.makedirs(person_folder, exist_ok=True)

            # Save image
            file_name = f"{ts_filename}.jpg"
            file_path = os.path.join(person_folder, file_name)
            cv2.imwrite(file_path, frame)

            # Insert into database
            c.execute(
                "INSERT INTO attendance (name, date, time, image_path) VALUES (?, ?, ?, ?)",
                (name, date_str, time_str, file_path)
            )
            conn.commit()

            print(f"✅ Logged {name} on {date_str} at {time_str}")

    # -------------------- Show big message --------------------
    cv2.putText(frame, screen_message, (30, 50),
                cv2.FONT_HERSHEY_SIMPLEX, 1.2, screen_color, 3)

    cv2.imshow("Live Auto Face Recognition", frame)
    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

cap.release()
cv2.destroyAllWindows()
conn.close()
