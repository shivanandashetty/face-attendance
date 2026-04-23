import React, { useState } from "react";
import { Box, Typography, TextField, Button, Paper } from "@mui/material";

const BASE_URL = "http://127.0.0.1:5000";

const glass = {
  backdropFilter: "blur(12px)",
  background: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(255,255,255,0.15)",
  borderRadius: 3,
};

function Persons() {
  const [name, setName] = useState("");
  const [streaming, setStreaming] = useState(false);

  // ================= CREATE PERSON =================
  const createPerson = async () => {
    if (!name) {
      alert("Enter person name");
      return;
    }

    const res = await fetch(`${BASE_URL}/api/create-person`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    const data = await res.json();
    alert(data.message || "Done");
  };

  // ================= REGISTER FACE =================
  const registerFace = async () => {
    if (!name) {
      alert("Enter person name first");
      return;
    }

    const res = await fetch(`${BASE_URL}/api/register-face`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    const data = await res.json();
    alert(data.message || "Camera started");
  };

  // ================= START LIVE STREAM =================
  const startStream = () => {
    setStreaming(true);
  };

  // ================= STOP LIVE STREAM =================
  const stopStream = async () => {
    await fetch(`${BASE_URL}/api/stop-stream`, { method: "POST" });
    setStreaming(false);
  };

  // ================= OLD ATTENDANCE SYSTEM =================
  const startCamera = async () => {
    const res = await fetch(`${BASE_URL}/api/start-capture`, { method: "POST" });
    const data = await res.json();
    alert(data.message);
  };

  const stopCamera = async () => {
    const res = await fetch(`${BASE_URL}/api/stop-capture`, { method: "POST" });
    const data = await res.json();
    alert(data.message);
  };

  // ================= TRAIN MODEL =================
  const trainModel = async () => {
    const res = await fetch(`${BASE_URL}/api/train`, { method: "POST" });
    const data = await res.json();
    alert(data.message);
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" mb={3}>
        👤 Person Management
      </Typography>

      {/* ================= ADD PERSON ================= */}
      <Paper sx={{ ...glass, p: 3, maxWidth: 420, mb: 3 }}>
        <Typography variant="h6">➕ Add Person</Typography>

        <TextField
          fullWidth
          label="Person Name"
          sx={{ mt: 2 }}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <Button fullWidth sx={{ mt: 2 }} variant="contained" onClick={createPerson}>
          📁 CREATE FOLDER
        </Button>

        <Button
          fullWidth
          sx={{ mt: 2 }}
          color="secondary"
          variant="contained"
          onClick={registerFace}
        >
          📸 REGISTER FACE (Capture Dataset)
        </Button>
      </Paper>

      {/* ================= LIVE CAMERA ================= */}
      <Paper sx={{ ...glass, p: 3, maxWidth: 600, mb: 3 }}>
        <Typography variant="h6">🎥 Live Camera (Browser Preview)</Typography>

        {!streaming ? (
          <Button
            fullWidth
            sx={{ mt: 2 }}
            variant="contained"
            onClick={startStream}
          >
            START LIVE CAMERA
          </Button>
        ) : (
          <>
            <Box
              sx={{
                mt: 2,
                borderRadius: 2,
                overflow: "hidden",
                border: "1px solid rgba(255,255,255,0.2)",
              }}
            >
              <img
                src={`${BASE_URL}/api/start-stream`}
                alt="Live Camera"
                style={{ width: "100%" }}
              />
            </Box>

            <Button
              fullWidth
              sx={{ mt: 2 }}
              variant="outlined"
              color="error"
              onClick={stopStream}
            >
              STOP LIVE CAMERA
            </Button>
          </>
        )}
      </Paper>

      {/* ================= ATTENDANCE AUTO SYSTEM ================= */}
      <Paper sx={{ ...glass, p: 3, maxWidth: 420, mb: 3 }}>
        <Typography variant="h6">📷 Attendance Camera (Auto)</Typography>

        <Button fullWidth sx={{ mt: 2 }} variant="contained" onClick={startCamera}>
          ▶ START ATTENDANCE CAMERA
        </Button>

        <Button fullWidth sx={{ mt: 2 }} variant="outlined" onClick={stopCamera}>
          ⏹ STOP ATTENDANCE CAMERA
        </Button>
      </Paper>

      {/* ================= TRAIN ================= */}
      <Paper sx={{ ...glass, p: 3, maxWidth: 420 }}>
        <Typography variant="h6">🧠 Train AI Model</Typography>

        <Button fullWidth sx={{ mt: 2 }} variant="contained" onClick={trainModel}>
          🚀 TRAIN NOW
        </Button>
      </Paper>
    </Box>
  );
}

export default Persons;
