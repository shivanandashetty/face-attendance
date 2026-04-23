import { createTheme } from "@mui/material/styles";

export const darkGlassTheme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#00e5ff" },
    secondary: { main: "#ff4081" },
    background: {
      default: "#0f172a",
      paper: "rgba(255,255,255,0.08)"
    }
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backdropFilter: "blur(12px)",
          borderRadius: 16,
          border: "1px solid rgba(255,255,255,0.15)",
          backgroundImage: "none"
        }
      }
    }
  }
});
