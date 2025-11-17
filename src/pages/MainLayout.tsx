/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import {
  AppBar,
  Box,
  Button,
  CircularProgress,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Switch,
  Toolbar,
  Typography,
  Tooltip,
  Paper,
} from "@mui/material";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import { useAuth } from "../auth/AuthContext";
import {
  getImages,
  createImage,
  getThreadsForImage,
  deleteThread,
} from "../api/images";
import type { ImageItem, ImageThread } from "../types/api";

export const MainLayout: React.FC = () => {
  const { userName, logout } = useAuth();

  const [commentMode, setCommentMode] = React.useState(false);
  const [images, setImages] = React.useState<ImageItem[]>([]);
  const [selectedImageId, setSelectedImageId] = React.useState<string | null>(
    null
  );

  const [threads, setThreads] = React.useState<ImageThread[]>([]);
  const [isLoadingImages, setIsLoadingImages] = React.useState(false);
  const [isLoadingThreads, setIsLoadingThreads] = React.useState(false);
  const [isCreatingImage, setIsCreatingImage] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Load images on mount
  React.useEffect(() => {
    const load = async () => {
      try {
        setIsLoadingImages(true);
        const data = await getImages();
        setImages(data);
        if (data.length > 0) {
          setSelectedImageId((prev) => prev ?? data[0].id);
        }
      } catch (err: any) {
        console.error(err);
        setError("Failed to load images");
      } finally {
        setIsLoadingImages(false);
      }
    };
    load();
  }, []);

  // Load threads when selected image changes
  React.useEffect(() => {
    const loadThreads = async () => {
      if (!selectedImageId) {
        setThreads([]);
        return;
      }
      try {
        setIsLoadingThreads(true);
        const data = await getThreadsForImage(selectedImageId);
        setThreads(data);
      } catch (err: any) {
        console.error(err);
        setError("Failed to load comments for this image");
      } finally {
        setIsLoadingThreads(false);
      }
    };
    loadThreads();
  }, [selectedImageId]);

  const handleGenerateImage = async () => {
    try {
      setError(null);
      setIsCreatingImage(true);
      const created = await createImage();

      // Backend returns only { id, url }, so we synthesize creator name on UI if needed
      const newItem: ImageItem = {
        id: created.id,
        url: created.url,
        createdByName: userName ?? "Unknown",
      };

      setImages((prev) => [newItem, ...prev]);
      setSelectedImageId(created.id);
    } catch (err: any) {
      console.error(err);
      setError("Failed to create image");
    } finally {
      setIsCreatingImage(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  const selectedImage =
    images.find((img) => img.id === selectedImageId) ?? null;

  const handleDeleteThread = async (threadId: string) => {
    try {
      await deleteThread(threadId);
      setThreads((prev) => prev.filter((t) => t.id !== threadId));
    } catch (err: any) {
      console.error(err);
      setError("Failed to delete comment");
    }
  };

  // For now, commentMode will just be wired later into click-to-add-pin.
  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!commentMode || !selectedImage) return;
    // We'll implement pin creation in the next step
    console.log("Image clicked (comment mode ON) at", {
      clientX: e.clientX,
      clientY: e.clientY,
    });
  };

  return (
    <Box display="flex" flexDirection="column" height="100vh">
      {/* Top App Bar */}
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Bananaz – Image Tagger
          </Typography>

          <Box display="flex" alignItems="center" gap={1} mr={2}>
            <Typography>Comment mode</Typography>
            <Switch
              checked={commentMode}
              onChange={(e) => setCommentMode(e.target.checked)}
              color="default"
            />
          </Box>

          <Tooltip title="Generate new random image">
            <span>
              <IconButton
                color="inherit"
                onClick={handleGenerateImage}
                disabled={isCreatingImage}
              >
                {isCreatingImage ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  <AddPhotoAlternateIcon />
                )}
              </IconButton>
            </span>
          </Tooltip>

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

      {/* Content */}
      <Box flex={1} display="flex" minHeight={0}>
        {/* Sidebar: image list */}
        <Box
          width={280}
          borderRight="1px solid rgba(0,0,0,0.12)"
          p={2}
          overflow="auto"
        >
          <Typography variant="subtitle1" gutterBottom>
            Images
          </Typography>

          {isLoadingImages && <CircularProgress size={24} />}

          {!isLoadingImages && images.length === 0 && (
            <Typography variant="body2" color="text.secondary">
              No images yet. Click the camera icon to create one.
            </Typography>
          )}

          <List dense>
            {images.map((img) => (
              <ListItemButton
                key={img.id}
                selected={img.id === selectedImageId}
                onClick={() => setSelectedImageId(img.id)}
              >
                <ListItemText
                  primary={`Image ${img.id.slice(0, 6)}…`}
                  secondary={`by ${img.createdByName}`}
                />
              </ListItemButton>
            ))}
          </List>
        </Box>

        {/* Main area: image viewer */}
        <Box flex={1} p={2} overflow="auto">
          {error && (
            <Typography color="error" gutterBottom>
              {error}
            </Typography>
          )}

          {!selectedImage && (
            <Typography variant="body1">
              Select an image from the left or create a new one.
            </Typography>
          )}

          {selectedImage && (
            <Paper
              sx={{
                position: "relative",
                maxWidth: "900px",
                margin: "0 auto",
                overflow: "hidden",
                p: 2,
              }}
              elevation={3}
            >
              <Typography variant="subtitle1" gutterBottom>
                Image {selectedImage.id}
              </Typography>

              <Box
                sx={{
                  position: "relative",
                  width: "100%",
                  // Maintain some aspect ratio box; image will fit inside
                  paddingTop: "75%", // 4:3 ratio
                  backgroundColor: "#eee",
                }}
                onClick={handleImageClick}
              >
                {/* Actual image */}
                <Box
                  component="img"
                  src={selectedImage.url}
                  alt={`Image ${selectedImage.id}`}
                  sx={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />

                {/* Pins (assuming X & Y are normalized 0–1) */}
                {isLoadingThreads && (
                  <CircularProgress
                    size={24}
                    sx={{ position: "absolute", top: 8, right: 8 }}
                  />
                )}

                {threads.map((thread) => {
                  const initials =
                    (thread.createdByName?.trim().split(/\s+/) ?? [])
                      .map((part) => part[0]?.toUpperCase() ?? "")
                      .join("")
                      .slice(0, 2) || "?";

                  return (
                    <Tooltip
                      key={thread.id}
                      title={
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            {thread.createdByName}
                          </Typography>
                          <Typography variant="body2">
                            {thread.comment}
                          </Typography>
                          {userName &&
                            thread.createdByName.toLowerCase() ===
                              userName.toLowerCase() && (
                              <Button
                                size="small"
                                color="error"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteThread(thread.id);
                                }}
                                sx={{ mt: 1 }}
                              >
                                Delete
                              </Button>
                            )}
                        </Box>
                      }
                    >
                      <Box
                        sx={{
                          position: "absolute",
                          left: `${thread.x * 100}%`,
                          top: `${thread.y * 100}%`,
                          transform: "translate(-50%, -50%)",
                          width: 28,
                          height: 28,
                          borderRadius: "50%",
                          backgroundColor: "primary.main",
                          color: "primary.contrastText",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 12,
                          fontWeight: 700,
                          boxShadow: 2,
                          cursor: "pointer",
                        }}
                      >
                        {initials}
                      </Box>
                    </Tooltip>
                  );
                })}
              </Box>
            </Paper>
          )}
        </Box>
      </Box>
    </Box>
  );
};
