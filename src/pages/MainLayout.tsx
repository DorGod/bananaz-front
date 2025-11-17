import React from "react";
import {
  AppBar,
  Box,
  Button,
  Container,
  IconButton,
  Switch,
  Toolbar,
  Typography,
} from "@mui/material";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import { useAuth } from "../auth/AuthContext";

export const MainLayout: React.FC = () => {
  const { userName, logout } = useAuth();
  const [commentMode, setCommentMode] = React.useState(false);

  // TODO: later hook this up to POST /images and list /images, /images/:id/threads

  const handleGenerateImage = () => {
    // we'll implement API call later
    console.log("Generate image clicked");
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <Box display="flex" flexDirection="column" height="100vh">
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Bananaz – Image Tagger
          </Typography>

          <Box display="flex" alignItems="center" gap={2} mr={2}>
            <Typography>Comment mode</Typography>
            <Switch
              checked={commentMode}
              onChange={(e) => setCommentMode(e.target.checked)}
              color="default"
            />
          </Box>

          <IconButton color="inherit" onClick={handleGenerateImage}>
            <AddPhotoAlternateIcon />
          </IconButton>

          <Box ml={3} display="flex" alignItems="center" gap={1}>
            <Typography variant="body1">
              {userName ? `Welcome, ${userName}!` : ""}
            </Typography>
            <Button color="inherit" onClick={handleLogout}>
              Sign out
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Box flex={1} display="flex" minHeight={0}>
        {/* Sidebar: images list (to be implemented) */}
        <Box
          width={280}
          borderRight="1px solid rgba(0,0,0,0.12)"
          p={2}
          overflow="auto"
        >
          <Typography variant="subtitle1">Images</Typography>
          {/* TODO: render list of images here */}
        </Box>

        {/* Main content: image viewer + pins (to be implemented) */}
        <Box flex={1} p={2} overflow="auto">
          <Container maxWidth="lg">
            <Typography variant="h6" gutterBottom>
              Image viewer
            </Typography>
            {/* TODO: show selected image + pins here */}
          </Container>
        </Box>
      </Box>
    </Box>
  );
};
