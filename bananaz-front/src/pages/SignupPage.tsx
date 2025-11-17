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
import { createUser } from "../api/auth";
import { useAuth } from "../auth/AuthContext";

export const SignupPage: React.FC = () => {
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
      await createUser(trimmed);
      // auto-login
      login(trimmed);
      navigate("/app");
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ??
        "Could not create user. Maybe it already exists?";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container maxWidth="xs">
      <Box mt={8} display="flex" flexDirection="column" gap={3}>
        <Typography variant="h4" component="h1" align="center">
          Sign up
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
            {isSubmitting ? "Signing up..." : "Sign up"}
          </Button>
        </Box>

        <Typography align="center">
          Already have an account?{" "}
          <Link component="button" onClick={() => navigate("/login")}>
            Log in
          </Link>
        </Typography>
      </Box>
    </Container>
  );
};
