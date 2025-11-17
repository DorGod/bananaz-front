import React, { useState } from "react";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Link,
  Alert,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../api/auth";
import { useAuth } from "../auth/AuthContext";

export const LoginPage: React.FC = () => {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmed = name.trim();
    if (!trimmed) {
      setError("Name is required");
      return;
    }

    try {
      setIsSubmitting(true);
      await loginUser(trimmed);
      login(trimmed);
      navigate("/app");
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ?? "Invalid username or user not found.";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container maxWidth="xs">
      <Box mt={8} display="flex" flexDirection="column" gap={3}>
        <Typography variant="h4" component="h1" align="center">
          Log in
        </Typography>

        {error && <Alert severity="error">{error}</Alert>}

        <Box
          component="form"
          onSubmit={handleSubmit}
          display="flex"
          flexDirection="column"
          gap={2}
        >
          <TextField
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            fullWidth
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={isSubmitting}
          >
            {isSubmitting ? "Logging in..." : "Log in"}
          </Button>
        </Box>

        <Typography align="center">
          New here?{" "}
          <Link component="button" onClick={() => navigate("/signup")}>
            Create an account
          </Link>
        </Typography>
      </Box>
    </Container>
  );
};
