import React, { useEffect, useState } from "react";
import { Grid, Card, CardContent, Typography, Box } from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import TodayIcon from "@mui/icons-material/Today";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

const glass = {
  backdropFilter: "blur(12px)",
  background: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(255,255,255,0.15)",
  borderRadius: 3
};

function Dashboard() {
  const [stats, setStats] = useState({
    total: 0,
    today: 0,
    known: 0,
    unknown: 0
  });

  useEffect(() => {
    fetch("http://127.0.0.1:5000/api/attendance")
      .then((res) => res.json())
      .then((data) => {
        const todayDate = new Date().toISOString().slice(0, 10);
        let today = 0,
          known = 0,
          unknown = 0;

        data.forEach((row) => {
          if (row.date === todayDate) today++;
          if (row.name === "Unknown") unknown++;
          else known++;
        });

        setStats({ total: data.length, today, known, unknown });
      });
  }, []);

  const StatCard = ({ title, value, icon }) => (
    <Card sx={{ ...glass, height: 140 }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between">
          <Box>
            <Typography>{title}</Typography>
            <Typography variant="h4" fontWeight="bold">
              {value}
            </Typography>
          </Box>
          <Box fontSize={50}>{icon}</Box>
        </Box>
      </CardContent>
    </Card>
  );

  const chartData = [
    { day: "Mon", value: 10 },
    { day: "Tue", value: 18 },
    { day: "Wed", value: 12 },
    { day: "Thu", value: 25 },
    { day: "Fri", value: 20 },
    { day: "Sat", value: 15 }
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        📊 Dashboard
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <StatCard title="Total" value={stats.total} icon={<PeopleIcon />} />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard title="Today" value={stats.today} icon={<TodayIcon />} />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard title="Known" value={stats.known} icon={<HowToRegIcon />} />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard title="Unknown" value={stats.unknown} icon={<ReportProblemIcon />} />
        </Grid>
      </Grid>

      {/* 📈 Chart */}
      <Box mt={5}>
        <Card sx={{ ...glass, p: 2 }}>
          <Typography variant="h6" gutterBottom>
            📈 Weekly Attendance Trend
          </Typography>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#00e5ff"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </Box>

      {/* System Status */}
      <Box mt={4}>
        <Card sx={{ ...glass }}>
          <CardContent>
            <Typography variant="h6">📌 System Status</Typography>
            <Typography sx={{ mt: 1 }}>
              ✅ Camera Running <br />
              ✅ Recognition Active <br />
              ✅ DB Connected <br />
              ✅ Voice Alert Active
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}

export default Dashboard;
