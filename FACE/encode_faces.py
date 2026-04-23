import cv2
import os
import pickle
import insightface
import numpy as np

# -------------------- Initialize InsightFace --------------------
app = insightface.app.FaceAnalysis(name="buffalo_l")
app.prepare(ctx_id=0)

# -------------------- Paths --------------------
dataset_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "dataset")
embeddings = {}

# -------------------- Check dataset --------------------
if not os.path.exists(dataset_path):
    print("❌ Dataset folder not found!")
    exit()

# -------------------- Loop through each person folder --------------------
for person_name in os.listdir(dataset_path):
    person_folder = os.path.join(dataset_path, person_name)

    if not os.path.isdir(person_folder):
        continue

    print(f"\n📂 Processing person: {person_name}")

    person_embeddings = []

    for file in os.listdir(person_folder):
        if not file.lower().endswith((".jpg", ".png", ".jpeg")):
            continue

        img_path = os.path.join(person_folder, file)

        try:
            img = cv2.imread(img_path)
            if img is None:
                print(f"❌ Cannot read image: {img_path}")
                continue

            faces = app.get(img)
            if len(faces) == 0:
                print(f"⚠️ No face found in: {img_path}")
                continue

            # Take first face only
            face = faces[0]

            # Normalize embedding
            emb = face.embedding / np.linalg.norm(face.embedding)

            person_embeddings.append(emb)
            print(f"  ✅ Encoded {file}")

        except Exception as e:
            print(f"❌ Error in {img_path}: {e}")

    # -------------------- Average all embeddings for this person --------------------
    if len(person_embeddings) > 0:
        avg_emb = np.mean(person_embeddings, axis=0)
        avg_emb = avg_emb / np.linalg.norm(avg_emb)

        embeddings[person_name] = avg_emb
        print(f"✅ Saved embedding for {person_name}")
    else:
        print(f"❌ No valid faces for {person_name}")

# -------------------- Save embeddings --------------------
with open("embeddings.pkl", "wb") as f:
    pickle.dump(embeddings, f)

print("\n🎉 Face encoding completed!")
print(f"👥 Total persons encoded: {len(embeddings)}")
