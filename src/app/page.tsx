'use client';

import React from 'react';
import Link from 'next/link';
import {
  Box,
  Button,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Stack,
} from '@mui/material';
import AutoModeIcon from '@mui/icons-material/AutoMode';
import ForumIcon from '@mui/icons-material/Forum';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

export default function LandingPage() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'radial-gradient(circle at 10% 20%, rgba(121, 14, 139, 0.15) 0%, rgba(7, 10, 19, 0) 45%), radial-gradient(circle at 90% 80%, rgba(0, 229, 255, 0.1) 0%, rgba(7, 10, 19, 0) 50%)',
        color: 'text.primary',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top Navigation */}
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" spacing={1} alignItems="center">
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #ab47bc 0%, #00e5ff 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 15px rgba(171, 71, 188, 0.4)',
              }}
            >
              <AutoModeIcon sx={{ color: '#070a13', fontSize: 20 }} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '-0.02em', background: 'linear-gradient(to right, #ab47bc, #00e5ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              InstaFlow
            </Typography>
          </Stack>

          <Stack direction="row" spacing={2}>
            <Link href="/login" passHref style={{ textDecoration: 'none' }}>
              <Button color="inherit" sx={{ fontWeight: 600 }}>
                Login
              </Button>
            </Link>
            <Link href="/signup" passHref style={{ textDecoration: 'none' }}>
              <Button variant="contained" color="primary">
                Get Started
              </Button>
            </Link>
          </Stack>
        </Stack>
      </Container>

      {/* Hero Section */}
      <Container maxWidth="md" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', pt: 8, pb: 12, textAlign: 'center', position: 'relative', zIndex: 2 }}>
        <Box sx={{ mb: 4 }}>
          <Typography
            component="span"
            sx={{
              display: 'inline-block',
              px: 2,
              py: 0.75,
              borderRadius: '20px',
              backgroundColor: 'rgba(171, 71, 188, 0.1)',
              border: '1px solid rgba(171, 71, 188, 0.2)',
              color: 'primary.light',
              fontWeight: 600,
              fontSize: '0.85rem',
              letterSpacing: '0.05em',
              mb: 3,
            }}
          >
            🔥 TURN COMMENTS INTO REVENUE
          </Typography>
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '2.5rem', md: '4rem' },
              lineHeight: 1.15,
              fontWeight: 800,
              mb: 3,
            }}
          >
            Instagram Comment & DM{' '}
            <Box
              component="span"
              sx={{
                background: 'linear-gradient(135deg, #df78ef 0%, #00e5ff 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Automation
            </Box>{' '}
            SaaS
          </Typography>
          <Typography
            variant="h5"
            color="text.secondary"
            sx={{ maxWidth: '600px', mx: 'auto', lineHeight: 1.5, fontWeight: 400, mb: 5, fontSize: { xs: '1.1rem', md: '1.25rem' } }}
          >
            Connect your page, select posts, define trigger keywords, and verify followers.
            Deliver downloadable PDFs, lead magnets, and custom DMs instantly.
          </Typography>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center" sx={{ mb: 8 }}>
            <Link href="/signup" passHref style={{ textDecoration: 'none' }}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                endIcon={<ArrowForwardIcon />}
                sx={{
                  py: 1.75,
                  px: 4,
                  fontSize: '1.05rem',
                  boxShadow: '0 4px 20px rgba(171, 71, 188, 0.35)',
                }}
              >
                Start Free Trial
              </Button>
            </Link>
            <Link href="/login" passHref style={{ textDecoration: 'none' }}>
              <Button
                variant="outlined"
                color="secondary"
                size="large"
                sx={{
                  py: 1.75,
                  px: 4,
                  fontSize: '1.05rem',
                  borderColor: 'rgba(0, 229, 255, 0.4)',
                  '&:hover': {
                    borderColor: '#00e5ff',
                    backgroundColor: 'rgba(0, 229, 255, 0.05)',
                  },
                }}
              >
                Live Demo Dashboard
              </Button>
            </Link>
          </Stack>
        </Box>

        {/* Feature Grid */}
        <Grid container spacing={3} sx={{ mt: 4 }}>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', transition: 'all 0.3s', '&:hover': { transform: 'translateY(-5px)', borderColor: 'rgba(171, 71, 188, 0.3)' } }}>
              <CardContent sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(171, 71, 188, 0.1)', color: 'primary.light', mb: 2 }}>
                  <ForumIcon sx={{ fontSize: 32 }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                  1. Comment Detection
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Our system listens for keywords (e.g. "PDF", "ASSET") on specific posts using Meta's real-time Webhook API.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', transition: 'all 0.3s', '&:hover': { transform: 'translateY(-5px)', borderColor: 'rgba(0, 229, 255, 0.3)' } }}>
              <CardContent sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(0, 229, 255, 0.1)', color: 'secondary.main', mb: 2 }}>
                  <CheckCircleIcon sx={{ fontSize: 32 }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                  2. Follower Guarding
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Instantly verify if the commenter is following your Instagram account before delivering the reward.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', transition: 'all 0.3s', '&:hover': { transform: 'translateY(-5px)', borderColor: 'rgba(255, 255, 255, 0.15)' } }}>
              <CardContent sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(255, 255, 255, 0.05)', color: '#f3f4f6', mb: 2 }}>
                  <AutoModeIcon sx={{ fontSize: 32 }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                  3. Automated DM
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Deliver the asset to followers instantly. Sends a follow-prompt reminder message to non-followers instead.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Footer */}
      <Box sx={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)', py: 4, mt: 'auto', bgcolor: 'rgba(7, 10, 19, 0.8)' }}>
        <Container maxWidth="lg">
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="center" spacing={2}>
            <Typography variant="body2" color="text.secondary">
              © {new Date().getFullYear()} InstaFlow Automation SaaS. All rights reserved.
            </Typography>
            <Stack direction="row" spacing={3}>
              <Typography variant="body2" color="text.secondary" sx={{ cursor: 'pointer', '&:hover': { color: 'text.primary' } }}>
                Privacy Policy
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ cursor: 'pointer', '&:hover': { color: 'text.primary' } }}>
                Terms of Service
              </Typography>
            </Stack>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}
