import { createTheme, responsiveFontSizes } from "@mui/material";
import { grey } from "@mui/material/colors";

const defaultTheme = createTheme();
let theme = createTheme({
  palette: {
    secondary: { main: grey[600] },
  },
  components: {
    MuiBackdrop: {
      styleOverrides: {
        root: {
          backdropFilter: "blur(4px)",
          zIndex: defaultTheme.zIndex.tooltip + 1,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          fontWeight: "bold",
        },
      },
    },
    MuiTableContainer: {
      styleOverrides: {
        root: {
          boxShadow: 2,
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontWeight: "bold",
        },
      },
    },
    MuiDialogContent: {
      defaultProps: {
        dividers: true,
      },
      styleOverrides: {
        root: {
          paddingTop: "20px",
        },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          paddingLeft: "24px",
          paddingRight: "24px",
          paddingBottom: "16px",
        },
      },
    },
    MuiFormLabel: {
      styleOverrides: {
        asterisk: {
          color: "red",
        },
      },
    },
    MuiFormHelperText: {
      styleOverrides: {
        root: {
          marginLeft: "0px",
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        fullWidth: true,
        variant: "filled",
      },
    },
    MuiButton: {
      defaultProps: {
        variant: "contained",
        type: "button",
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          border: 1,
          backdropFilter: "blur(4px)",
          borderRadius: "6px",
          padding: "8px 16px",
        },
        head: {
          fontWeight: "bold",
          backgroundColor: "transparent",
        },
      },
    },
  },
});
theme = responsiveFontSizes(theme);
export { theme };
