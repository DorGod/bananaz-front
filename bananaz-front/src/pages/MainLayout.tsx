import React, { useEffect, useState } from "react";
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import { useAuth } from "../auth/AuthContext";
import {
  getImages,
  createImage,
  getThreadsForImage,
  deleteThread,
  createThread,
} from "../api/images";
import type { ImageItem, ImageThread } from "../types/api";
import { useSearchParams } from "react-router-dom";

export const MainLayout: React.FC = () => {
  const { userName, logout } = useAuth();

  const [searchParams, setSearchParams] = useSearchParams();
  const imageIdFromUrl = searchParams.get("imageId");

  const [commentMode, setCommentMode] = useState(false);
  const [images, setImages] = useState<ImageItem[]>([]);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);

  const [threads, setThreads] = useState<ImageThread[]>([]);
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  const [isLoadingThreads, setIsLoadingThreads] = useState(false);
  const [isCreatingImage, setIsCreatingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- New state for comment dialog ---
  const [pinDialogOpen, setPinDialogOpen] = useState(false);
  const [pendingCoords, setPendingCoords] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [newComment, setNewComment] = useState("");
  const [commentError, setCommentError] = useState<string | null>(null);
  const [isSavingComment, setIsSavingComment] = useState(false);

  // Load images on mount
  useEffect(() => {
    const load = async () => {
      try {
        setIsLoadingImages(true);
        const data = await getImages();
        setImages(data);

        if (data.length === 0) {
          setSelectedImageId(null);
          return;
        }

        // If URL has an imageId and it exists, use that
        if (imageIdFromUrl && data.some((img) => img.id === imageIdFromUrl)) {
          setSelectedImageId(imageIdFromUrl);
        } else {
          // Fallback: first image
          setSelectedImageId((prev) => prev ?? data[0].id);
        }
      } catch (err: unknown) {
        console.error(err instanceof Error ? err : String(err));
        setError("Failed to load images");
      } finally {
        setIsLoadingImages(false);
      }
    };
    load();
  }, [imageIdFromUrl]); // ⬅️ include imageIdFromUrl as dependency

  // Load threads when selected image changes
  useEffect(() => {
    const loadThreads = async () => {
      if (!selectedImageId) {
        setThreads([]);
        return;
      }
      try {
        setIsLoadingThreads(true);
        const data = await getThreadsForImage(selectedImageId);
        setThreads(data);
      } catch (err: unknown) {
        console.error(err instanceof Error ? err : String(err));
        setError("Failed to load comments for this image");
      } finally {
        setIsLoadingThreads(false);
      }
    };
    loadThreads();
  }, [selectedImageId]);

  // Keep ?imageId=... in sync with selectedImageId
  useEffect(() => {
    // avoid touching URL before we even have a selection
    if (!selectedImageId) {
      const current = searchParams.get("imageId");
      if (current) {
        const next = new URLSearchParams(searchParams);
        next.delete("imageId");
        setSearchParams(next, { replace: true });
      }
      return;
    }

    const current = searchParams.get("imageId");
    if (current === selectedImageId) return;

    const next = new URLSearchParams(searchParams);
    next.set("imageId", selectedImageId);
    setSearchParams(next, { replace: true });
  }, [selectedImageId, searchParams, setSearchParams]);

  const handleGenerateImage = async () => {
    try {
      setError(null);
      setIsCreatingImage(true);
      const created = await createImage();

      const newItem: ImageItem = {
        id: created.id,
        url: created.url,
        createdByName: userName ?? "Unknown",
      };

      setImages((prev) => [newItem, ...prev]);
      setSelectedImageId(created.id);
      setThreads([]);
    } catch (err: unknown) {
      console.error(err instanceof Error ? err : String(err));
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
    } catch (err: unknown) {
      console.error(err instanceof Error ? err : String(err));
      setError("Failed to delete comment");
    }
  };

  // --- Image click: open dialog with normalized coordinates ---
  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!commentMode || !selectedImage) return;

    const bounds = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - bounds.left) / bounds.width;
    const y = (e.clientY - bounds.top) / bounds.height;

    const clampedX = Math.min(1, Math.max(0, x));
    const clampedY = Math.min(1, Math.max(0, y));

    setPendingCoords({ x: clampedX, y: clampedY });
    setNewComment("");
    setCommentError(null);
    setPinDialogOpen(true);
  };

  const handleClosePinDialog = () => {
    if (isSavingComment) return;
    setPinDialogOpen(false);
    setPendingCoords(null);
    setNewComment("");
    setCommentError(null);
  };

  const handleSaveComment = async () => {
    if (!selectedImageId || !pendingCoords) return;

    const trimmed = newComment.trim();
    if (!trimmed) {
      setCommentError("Comment is required");
      return;
    }

    try {
      setIsSavingComment(true);
      setCommentError(null);

      const created = await createThread(selectedImageId, {
        x: pendingCoords.x,
        y: pendingCoords.y,
        comment: trimmed,
      });

      setThreads((prev) => [...prev, created]);
      setPinDialogOpen(false);
      setPendingCoords(null);
      setNewComment("");
    } catch (err: unknown) {
      console.error(err instanceof Error ? err : String(err));
      setCommentError("Failed to save comment");
    } finally {
      setIsSavingComment(false);
    }
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
                  paddingTop: "75%", // 4:3 ratio
                  backgroundColor: "#eee",
                  cursor: commentMode ? "crosshair" : "default",
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

                {/* Loading indicator for threads */}
                {isLoadingThreads && (
                  <CircularProgress
                    size={24}
                    sx={{ position: "absolute", top: 8, right: 8 }}
                  />
                )}

                {/* Pins */}
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

      {/* Comment dialog */}
      <Dialog
        open={pinDialogOpen}
        onClose={handleClosePinDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Add comment</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={2}>
            You&apos;re adding a comment at this location on the image.
          </Typography>
          <TextField
            label="Comment"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            fullWidth
            multiline
            minRows={3}
            autoFocus
            error={!!commentError}
            helperText={commentError ?? " "}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePinDialog} disabled={isSavingComment}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveComment}
            variant="contained"
            disabled={isSavingComment}
          >
            {isSavingComment ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
