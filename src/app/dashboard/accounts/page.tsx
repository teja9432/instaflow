'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Avatar,
  Stack,
  CircularProgress,
  Grid,
  Alert,
  Divider,
} from '@mui/material';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

export default function ConnectedAccountsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [alertInfo, setAlertInfo] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Check URL parameters for OAuth redirection status
  useEffect(() => {
    const success = searchParams.get('success');
    const error = searchParams.get('error');

    if (success) {
      setAlertInfo({
        type: 'success',
        msg: 'Successfully connected your Instagram Business Account!',
      });
    } else if (error) {
      setAlertInfo({
        type: 'error',
        msg: `Failed to link account: ${decodeURIComponent(error)}`,
      });
    }

    fetchAccounts();
  }, [searchParams]);

  const fetchAccounts = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch('/api/instagram/accounts', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setAccounts(data.accounts || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Trigger Meta Graph OAuth Initiation redirection
  const handleConnectInstagram = async () => {
    setActionLoading(true);
    setAlertInfo(null);
    const token = localStorage.getItem('token');

    try {
      const res = await fetch('/api/instagram/connect', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to initialize connection.');

      // Redirect to Meta Authorization Dialog
      window.location.href = data.url;
    } catch (err: any) {
      setAlertInfo({ type: 'error', msg: err.message });
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', height: '50vh', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.02em', mb: 0.5 }}>
          Connected Accounts
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Link your Meta Business Page and Instagram Business Account to authorize webhook notifications and DMs.
        </Typography>
      </Box>

      {alertInfo && (
        <Alert severity={alertInfo.type} sx={{ mb: 4, borderRadius: 2 }} onClose={() => setAlertInfo(null)}>
          {alertInfo.msg}
        </Alert>
      )}

      {accounts.length === 0 ? (
        // Empty state connect card
        <Card sx={{ maxWidth: 600, mx: 'auto', mt: 4, textAlign: 'center', border: '1px dashed rgba(255, 255, 255, 0.15)' }}>
          <CardContent sx={{ p: 5 }}>
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                bgcolor: 'rgba(224, 64, 251, 0.1)',
                color: '#e040fb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 3,
              }}
            >
              <InstagramIcon sx={{ fontSize: 36 }} />
            </Box>

            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1.5 }}>
              No Instagram Accounts Connected
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400, mx: 'auto', mb: 4 }}>
              To begin sending comment automated triggers, you must link your Instagram Creator or Business profile via Meta OAuth.
            </Typography>

            <Button
              variant="contained"
              color="primary"
              size="large"
              startIcon={actionLoading ? <CircularProgress size={20} color="inherit" /> : <AddCircleOutlineIcon />}
              onClick={handleConnectInstagram}
              disabled={actionLoading}
              sx={{ py: 1.5, px: 4, boxShadow: '0 4px 15px rgba(171, 71, 188, 0.3)' }}
            >
              Connect with Facebook / Meta
            </Button>
          </CardContent>
        </Card>
      ) : (
        // Connected profiles grid list
        <Grid container spacing={3}>
          {accounts.map((acc) => (
            <Grid item xs={12} md={6} key={acc.id}>
              <Card sx={{ border: '1px solid rgba(171, 71, 188, 0.2)' }}>
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" spacing={2.5} alignItems="center">
                    <Avatar
                      src={acc.profilePicture}
                      alt={acc.username}
                      sx={{ width: 68, height: 68, bgcolor: 'primary.main', border: '2px solid rgba(171, 71, 188, 0.3)' }}
                    >
                      {acc.username[0].toUpperCase()}
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                        @{acc.username}
                        <InstagramIcon sx={{ color: '#e040fb', fontSize: 20 }} />
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Linked Facebook Page ID: {acc.pageId}
                      </Typography>
                      <Box sx={{ mt: 1 }}>
                        <Typography
                          variant="caption"
                          sx={{
                            display: 'inline-block',
                            px: 1.5,
                            py: 0.25,
                            borderRadius: '12px',
                            bgcolor: 'rgba(76, 175, 80, 0.1)',
                            border: '1px solid rgba(76, 175, 80, 0.2)',
                            color: '#4caf50',
                            fontWeight: 600,
                          }}
                        >
                          ● Live Webhooks Active
                        </Typography>
                      </Box>
                    </Box>
                  </Stack>

                  <Divider sx={{ my: 2.5, borderColor: 'rgba(255, 255, 255, 0.05)' }} />

                  {/* Summary statistics */}
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        Active Campaigns
                      </Typography>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                        {acc._count?.automations || 0} Triggers
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        Comments Logged
                      </Typography>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                        {acc._count?.logs || 0} Processed
                      </Typography>
                    </Grid>
                  </Grid>

                  <Button
                    variant="outlined"
                    color="error"
                    fullWidth
                    startIcon={<LinkOffIcon />}
                    sx={{
                      borderColor: 'rgba(244, 67, 54, 0.2)',
                      '&:hover': {
                        borderColor: '#f44336',
                        backgroundColor: 'rgba(244, 67, 54, 0.04)',
                      },
                    }}
                    onClick={() => {
                      alert('Account disconnection endpoint simulation. In full production, this deletes tokens and cancels Meta webhook subscriptions.');
                    }}
                  >
                    Disconnect Profile
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}

          {/* Add another profile link card */}
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px dashed rgba(255, 255, 255, 0.12)',
                backgroundColor: 'rgba(255, 255, 255, 0.01)',
              }}
            >
              <CardContent sx={{ p: 4, textAlign: 'center' }}>
                <Button
                  variant="outlined"
                  color="inherit"
                  startIcon={<AddCircleOutlineIcon />}
                  onClick={handleConnectInstagram}
                  disabled={actionLoading}
                  sx={{ borderColor: 'rgba(255, 255, 255, 0.15)' }}
                >
                  Link Additional Profile
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}
