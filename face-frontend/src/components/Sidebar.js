import React from "react";
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Toolbar } from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import TableChartIcon from "@mui/icons-material/TableChart";
import ImageIcon from "@mui/icons-material/Image";

const drawerWidth = 240;

const Sidebar = () => {
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: "border-box" },
      }}
    >
      <Toolbar />
      <List>
        <ListItem button component="a" href="/">
          <ListItemIcon><DashboardIcon /></ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItem>

        <ListItem button component="a" href="/attendance">
          <ListItemIcon><TableChartIcon /></ListItemIcon>
          <ListItemText primary="Attendance" />
        </ListItem>

        <ListItem button component="a" href="/gallery">
          <ListItemIcon><ImageIcon /></ListItemIcon>
          <ListItemText primary="Gallery" />
        </ListItem>
      </List>
    </Drawer>
  );
};

export default Sidebar;
