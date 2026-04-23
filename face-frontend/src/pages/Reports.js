import React from "react";
import { Box, Typography, Button } from "@mui/material";

function Reports() {
  return (
    <Box>
      <Typography variant="h4" fontWeight="bold">🧾 Reports</Typography>

      <Button variant="contained" sx={{ mt: 3 }}>
        📤 Export Attendance
      </Button>
    </Box>
  );
}

export default Reports;
