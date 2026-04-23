import React, { useEffect, useState } from "react";
import { Box, Typography, Grid, Card, CardMedia, Dialog, DialogContent } from "@mui/material";

const glass = {
  backdropFilter: "blur(10px)",
  background: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(255,255,255,0.15)",
  borderRadius: 3
};

function Gallery() {
  const [folders, setFolders] = useState({});
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState("");

  useEffect(() => {
    fetch("http://127.0.0.1:5000/api/gallery")
      .then((res) => res.json())
      .then((data) => setFolders(data));
  }, []);

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold">🖼 Face Gallery</Typography>

      {Object.keys(folders).map((person) => (
        <Box key={person} mb={4}>
          <Typography variant="h6">📁 {person}</Typography>

          <Grid container spacing={2}>
            {folders[person].map((img, idx) => (
              <Grid item xs={12} sm={3} md={2} key={idx}>
                <Card
                  sx={{ ...glass, cursor: "pointer" }}
                  onClick={() => {
                    setPreview("http://127.0.0.1:5000" + img);
                    setOpen(true);
                  }}
                >
                  <CardMedia component="img" height="140" image={"http://127.0.0.1:5000" + img} />
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      ))}

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md">
        <DialogContent>
          <img src={preview} alt="preview" style={{ width: "100%", borderRadius: 10 }} />
        </DialogContent>
      </Dialog>
    </Box>
  );
}

export default Gallery;
