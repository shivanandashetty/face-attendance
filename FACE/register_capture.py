import cv2
import os
import sys
import time

name = sys.argv[1]

base_dir = os.path.dirname(os.path.abspath(__file__))
dataset_dir = os.path.join(base_dir, "dataset", name)

os.makedirs(dataset_dir, exist_ok=True)

cap = cv2.VideoCapture(0)

count = 0
max_images = 30

print(f"📸 Registering face for: {name}")
print("Press Q to stop early")

while True:
    ret, frame = cap.read()
    if not ret:
        break

    cv2.imshow("Register Face", frame)

    if count < max_images:
        img_path = os.path.join(dataset_dir, f"{name}_{count}.jpg")
        cv2.imwrite(img_path, frame)
        print(f"✅ Saved {img_path}")
        count += 1
        time.sleep(0.3)

    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

    if count >= max_images:
        break

cap.release()
cv2.destroyAllWindows()

print("🎉 Registration completed!")
