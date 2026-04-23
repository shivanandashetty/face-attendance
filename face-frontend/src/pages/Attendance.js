import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Dialog,
  DialogContent,
  Paper
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

const BASE_URL = "http://127.0.0.1:5000";

const glass = {
  backdropFilter: "blur(12px)",
  background: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(255,255,255,0.15)",
  borderRadius: 3
};

function Attendance() {
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");
  const [date, setDate] = useState("");
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState("");

  const loadData = async () => {
    const res = await fetch(`${BASE_URL}/api/attendance`);
    const data = await res.json();
    setRows(data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredRows = rows.filter(
    (row) =>
      row.name.toLowerCase().includes(search.toLowerCase()) &&
      (date === "" || row.date === date)
  );

  const exportPDF = () => {
    const doc = new jsPDF();

    doc.text("Attendance Report", 14, 15);

    autoTable(doc, {
      startY: 25,
      head: [["ID", "Name", "Date", "Time"]],
      body: filteredRows.map((r) => [r.id, r.name, r.date, r.time]),
      styles: { fontSize: 10 }
    });

    doc.save("attendance_report.pdf");
  };

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Attendance");
    XLSX.writeFile(wb, "attendance.xlsx");
  };

  const columns = [
    { field: "id", headerName: "ID", width: 80 },
    { field: "name", headerName: "Name", width: 150 },
    { field: "date", headerName: "Date", width: 150 },
    { field: "time", headerName: "Time", width: 150 },
    {
      field: "image_path",
      headerName: "Photo",
      width: 200,
      renderCell: (params) => (
        <Button
          variant="outlined"
          onClick={() => {
            const idx = params.value.toLowerCase().indexOf("captures");
            const relativePath = params.value.substring(idx).replace(/\\/g, "/");
            setPreview(`${BASE_URL}/${relativePath}`);
            setOpen(true);
          }}
        >
          View
        </Button>
      )
    }
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        📄 Attendance Records
      </Typography>

      <Box display="flex" gap={2} mb={2} flexWrap="wrap">
        <TextField label="Search" value={search} onChange={(e) => setSearch(e.target.value)} />
        <TextField type="date" InputLabelProps={{ shrink: true }} value={date} onChange={(e) => setDate(e.target.value)} />

        <Button variant="contained" onClick={loadData}>🔄 Refresh</Button>
        <Button variant="outlined" onClick={exportPDF}>📄 Export PDF</Button>
        <Button variant="outlined" onClick={exportExcel}>📊 Export Excel</Button>
      </Box>

      <Paper sx={{ ...glass, p: 2 }}>
        <div style={{ height: 520, width: "100%" }}>
          <DataGrid rows={filteredRows} columns={columns} pageSize={8} />
        </div>
      </Paper>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md">
        <DialogContent>
          <img src={preview} alt="preview" style={{ width: "100%", borderRadius: 10 }} />
        </DialogContent>
      </Dialog>
    </Box>
  );
}

export default Attendance;
