'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Stack,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import AutoModeIcon from '@mui/icons-material/AutoMode';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed.');
      }

      // Save token to localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'An error occurred during login.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    // Fill credentials and trigger login
    setEmail('demo@instaflow.com');
    setPassword('demopass123');
    setError(null);
    
    // To trigger submit after state update finishes, we can call it in a small timeout
    setTimeout(() => {
      setLoading(true);
      fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: 'demo@instaflow.com', password: 'demopass123' }),
      })
        .then(async (res) => {
          const data = await res.json();
          if (!res.ok) {
            // If demo account doesn't exist yet, we try to auto-signup the demo account!
            // This is a Bulletproof Demo strategy.
            return fetch('/api/auth/signup', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: 'demo@instaflow.com',
                password: 'demopass123',
                name: 'Demo Creator',
              }),
            }).then(async (signupRes) => {
              const signupData = await signupRes.json();
              if (!signupRes.ok) throw new Error(signupData.error);
              return signupData;
            });
          }
          return data;
        })
        .then((data) => {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          router.push('/dashboard');
        })
        .catch((err) => {
          setError('Failed to connect to backend: ' + err.message);
          setLoading(false);
        });
    }, 100);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle at 50% 50%, rgba(0, 229, 255, 0.08) 0%, rgba(7, 10, 19, 0) 60%)',
        p: 2,
      }}
    >
      <Card sx={{ maxWidth: 450, width: '100%', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <CardContent sx={{ p: 4 }}>
          {/* Logo Header */}
          <Stack alignItems="center" spacing={1} sx={{ mb: 4 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #ab47bc 0%, #00e5ff 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 15px rgba(0, 229, 255, 0.3)',
              }}
            >
              <AutoModeIcon sx={{ color: '#070a13', fontSize: 24 }} />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
              Welcome Back
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Login to manage your Instagram comment automations
            </Typography>
          </Stack>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Stack spacing={2.5}>
              <TextField
                label="Email Address"
                variant="outlined"
                type="email"
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
                InputProps={{
                  style: { borderRadius: 8 },
                }}
              />
              <TextField
                label="Password"
                variant="outlined"
                type="password"
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
                InputProps={{
                  style: { borderRadius: 8 },
                }}
              />

              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                fullWidth
                disabled={loading}
                sx={{ py: 1.5, fontSize: '1rem', borderRadius: 2 }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Login'}
              </Button>
            </Stack>
          </form>

          <Box sx={{ my: 3 }}>
            <Divider>
              <Typography variant="caption" color="text.secondary">
                OR
              </Typography>
            </Divider>
          </Box>

          <Button
            variant="outlined"
            color="secondary"
            fullWidth
            onClick={handleDemoLogin}
            disabled={loading}
            sx={{
              py: 1.25,
              borderRadius: 2,
              borderColor: 'rgba(0, 229, 255, 0.4)',
              '&:hover': {
                borderColor: '#00e5ff',
                backgroundColor: 'rgba(0, 229, 255, 0.05)',
              },
            }}
          >
            Sign In with Demo Creator
          </Button>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Don't have an account?{' '}
              <Link href="/signup" style={{ color: '#ab47bc', textDecoration: 'none', fontWeight: 600 }}>
                Sign up here
              </Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
