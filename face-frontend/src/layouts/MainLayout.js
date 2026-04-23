import React from "react";
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Divider,
  Button,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";

import DashboardIcon from "@mui/icons-material/Dashboard";
import ListAltIcon from "@mui/icons-material/ListAlt";
import PhotoLibraryIcon from "@mui/icons-material/PhotoLibrary";
import AssessmentIcon from "@mui/icons-material/Assessment";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person";   // ✅ NEW

const drawerWidth = 230;

function MainLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { text: "Dashboard", path: "/", icon: <DashboardIcon /> },
    { text: "Attendance", path: "/attendance", icon: <ListAltIcon /> },
    { text: "Gallery", path: "/gallery", icon: <PhotoLibraryIcon /> },
    { text: "Persons", path: "/persons", icon: <PersonIcon /> },   // ✅ NEW
    { text: "Reports", path: "/reports", icon: <AssessmentIcon /> },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <Box sx={{ display: "flex" }}>
      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            background: "linear-gradient(180deg, #020617, #020617)",
            color: "white",
            borderRight: "1px solid rgba(255,255,255,0.08)",
          },
        }}
      >
        <Toolbar />

        {/* Logo */}
        <Box sx={{ px: 2, pb: 2 }}>
          <Typography
            variant="h6"
            fontWeight="bold"
            sx={{
              color: "#00e5ff",
              textAlign: "center",
              letterSpacing: 1,
              textShadow: "0 0 12px rgba(0,229,255,0.6)",
            }}
          >
            FACE AI
          </Typography>
        </Box>

        <Divider sx={{ borderColor: "rgba(255,255,255,0.08)" }} />

        {/* Menu */}
        <List>
          {menuItems.map((item) => {
            const active = location.pathname === item.path;

            return (
              <ListItemButton
                key={item.text}
                onClick={() => navigate(item.path)}
                sx={{
                  mx: 1,
                  my: 0.7,
                  borderRadius: 2,
                  background: active
                    ? "linear-gradient(90deg, rgba(0,229,255,0.25), rgba(0,229,255,0.05))"
                    : "transparent",
                  border: active
                    ? "1px solid rgba(0,229,255,0.4)"
                    : "1px solid transparent",
                  backdropFilter: "blur(10px)",
                  transition: "0.25s",

                  "&:hover": {
                    background: "rgba(0,229,255,0.12)",
                    transform: "translateX(4px)",
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: active ? "#00e5ff" : "white",
                    minWidth: 40,
                    filter: active ? "drop-shadow(0 0 6px #00e5ff)" : "none",
                  }}
                >
                  {item.icon}
                </ListItemIcon>

                <ListItemText
                  primary={item.text}
                  sx={{
                    color: active ? "#00e5ff" : "white",
                    fontWeight: active ? "bold" : "normal",
                  }}
                />
              </ListItemButton>
            );
          })}
        </List>

        <Box sx={{ flexGrow: 1 }} />

        <Divider sx={{ borderColor: "rgba(255,255,255,0.08)" }} />

        {/* Logout */}
        <Box sx={{ p: 2 }}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            sx={{
              color: "#ff5252",
              borderColor: "rgba(255,82,82,0.5)",
              "&:hover": {
                borderColor: "#ff5252",
                background: "rgba(255,82,82,0.08)",
              },
            }}
          >
            Logout
          </Button>
        </Box>

        {/* Footer */}
        <Box sx={{ pb: 1, textAlign: "center", opacity: 0.5, fontSize: 12 }}>
          Face AI v1.0
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}

export default MainLayout;
