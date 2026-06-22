'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
  Typography,
  Switch,
  Card,
  CardContent,
  Stack,
  TextField,
  Grid,
  CardMedia,
  CardActionArea,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  IconButton,
  Chip,
  Alert,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';

const steps = ['Select Instagram Post', 'Configure Rule Trigger', 'Setup Custom Messages'];

export default function AutomationsPage() {
  const [loading, setLoading] = useState(true);
  const [automations, setAutomations] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState('');
  
  // Create Dialog & Stepper states
  const [open, setOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  
  // Wizard Media Grid states
  const [posts, setPosts] = useState<any[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  
  // Wizard Form states
  const [selectedPost, setSelectedPost] = useState<any | null>(null);
  const [triggerKeyword, setTriggerKeyword] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');
  const [successMessage, setSuccessMessage] = useState('Hi {username}! Thanks for following. Here is your download link: {link}');
  const [fallbackMessage, setFallbackMessage] = useState('Hi {username}! To unlock this download, please make sure you follow our account first!');
  const [wizardError, setWizardError] = useState<string | null>(null);

  const fetchAutomationsAndAccounts = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      // 1. Fetch connected accounts
      const accountsRes = await fetch('/api/instagram/accounts', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const accountsData = await accountsRes.json();
      setAccounts(accountsData.accounts || []);
      
      if (accountsData.accounts?.length > 0) {
        setSelectedAccountId(accountsData.accounts[0].id);
      }

      // 2. Fetch automations
      const automationsRes = await fetch('/api/automations', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const automationsData = await automationsRes.json();
      setAutomations(automationsData.automations || []);
    } catch (e) {
      console.error('Error loading page components:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAutomationsAndAccounts();
  }, []);

  // Fetch recent posts from chosen Instagram Account when opening Dialog / changing account
  const fetchPostsForAccount = async (accId: string) => {
    if (!accId) return;
    setPostsLoading(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/instagram/posts?accountId=${accId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setPosts(data.posts || []);
    } catch (err) {
      console.error('Error fetching posts:', err);
    } finally {
      setPostsLoading(false);
    }
  };

  const handleOpenWizard = () => {
    setOpen(true);
    setActiveStep(0);
    setSelectedPost(null);
    setTriggerKeyword('');
    setPdfUrl('');
    setWizardError(null);
    if (selectedAccountId) {
      fetchPostsForAccount(selectedAccountId);
    }
  };

  const handleCloseWizard = () => {
    setOpen(false);
  };

  const handleNext = () => {
    if (activeStep === 0 && !selectedPost) {
      setWizardError('Please select a post to attach automation rules.');
      return;
    }
    if (activeStep === 1 && (!triggerKeyword || !pdfUrl)) {
      setWizardError('Trigger Keyword and Asset Download URL are required.');
      return;
    }
    setWizardError(null);
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setWizardError(null);
    setActiveStep((prev) => prev - 1);
  };

  // Submit and create automation rule
  const handleCreateAutomation = async () => {
    if (!selectedAccountId || !selectedPost || !triggerKeyword || !pdfUrl) return;

    const token = localStorage.getItem('token');
    setLoading(true);

    try {
      const res = await fetch('/api/automations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          instagramAccountId: selectedAccountId,
          postId: selectedPost.id,
          postMediaUrl: selectedPost.media_url,
          postCaption: selectedPost.caption || 'Instagram Post',
          triggerKeyword,
          successMessage,
          fallbackMessage: successMessage,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create rule.');

      // Refresh listings
      await fetchAutomationsAndAccounts();
      setOpen(false);
    } catch (err: any) {
      setWizardError(err.message);
      setLoading(false);
    }
  };

  // Toggle IsActive status
  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/automations/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (!res.ok) throw new Error('Toggle status update failed.');

      // Update local state instantly
      setAutomations((prev) =>
        prev.map((aut) => (aut.id === id ? { ...aut, isActive: !currentStatus } : aut))
      );
    } catch (e) {
      console.error(e);
    }
  };

  // Delete automation
  const handleDeleteAutomation = async (id: string) => {
    if (!confirm('Are you sure you want to delete this automation rule?')) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/automations/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Failed to delete rule.');

      setAutomations((prev) => prev.filter((aut) => aut.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  // MUI DataGrid Columns definition
  const columns: GridColDef[] = [
    {
      field: 'postMediaUrl',
      headerName: 'Post Preview',
      width: 120,
      renderCell: (params) => (
        <Box sx={{ py: 1, display: 'flex', alignItems: 'center', height: '100%' }}>
          {params.value ? (
            <img
              src={params.value}
              alt="IG preview"
              style={{ width: 44, height: 44, borderRadius: 6, objectFit: 'cover' }}
            />
          ) : (
            <Box sx={{ width: 44, height: 44, bgcolor: '#161c2d', borderRadius: 6 }} />
          )}
        </Box>
      ),
    },
    { field: 'postId', headerName: 'Instagram Post ID', width: 150 },
    {
      field: 'triggerKeyword',
      headerName: 'Keyword Trigger',
      width: 150,
      renderCell: (params) => (
        <Chip label={params.value} color="primary" variant="outlined" sx={{ fontWeight: 700 }} />
      ),
    },
    {
      field: 'pdfUrl',
      headerName: 'Delivered Asset',
      width: 250,
      renderCell: (params) => (
        <Typography variant="body2" color="secondary.main" sx={{ fontStyle: 'italic' }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'isActive',
      headerName: 'Active Status',
      width: 130,
      renderCell: (params) => (
        <Switch
          checked={params.value}
          onChange={() => handleToggleActive(params.row.id, params.value)}
          color="secondary"
        />
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      sortable: false,
      renderCell: (params) => (
        <IconButton color="error" onClick={() => handleDeleteAutomation(params.row.id)}>
          <DeleteIcon />
        </IconButton>
      ),
    },
  ];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', height: '50vh', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  return (
    <Box>
      {/* Title & Actions bar */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.02em', mb: 0.5 }}>
            Manage Automations
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Set up granular triggers linking comments to direct asset messages.
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenWizard}
          sx={{ boxShadow: '0 4px 15px rgba(171, 71, 188, 0.35)' }}
        >
          Create Automation
        </Button>
      </Stack>

      {/* Main Automations Table Card */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ height: 500, width: '100%' }}>
            <DataGrid
              rows={automations}
              columns={columns}
              initialState={{
                pagination: { paginationModel: { pageSize: 10 } },
              }}
              pageSizeOptions={[5, 10, 20]}
              disableRowSelectionOnClick
            />
          </Box>
        </CardContent>
      </Card>

      {/* CREATE AUTOMATION WIZARD DIALOG */}
      <Dialog open={open} onClose={handleCloseWizard} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 1 }}>
          <AutoFixHighIcon color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            New Automation Rule Wizard
          </Typography>
        </DialogTitle>
        
        <DialogContent dividers sx={{ minHeight: 450, py: 4 }}>
          {/* Progress stepper */}
          <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {wizardError && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {wizardError}
            </Alert>
          )}

          {/* STEP 1: Select IG Post */}
          {activeStep === 0 && (
            <Box>
              <Stack direction="row" spacing={3} alignItems="center" sx={{ mb: 3 }}>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  Select Connected Instagram Profile:
                </Typography>
                <FormControl sx={{ minWidth: 200 }} size="small">
                  <InputLabel>Account</InputLabel>
                  <Select
                    value={selectedAccountId}
                    label="Account"
                    onChange={(e) => {
                      setSelectedAccountId(e.target.value);
                      fetchPostsForAccount(e.target.value);
                    }}
                  >
                    {accounts.map((acc) => (
                      <MenuItem key={acc.id} value={acc.id}>
                        @{acc.username}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Click to target a specific recent post from your grid:
              </Typography>

              {postsLoading ? (
                <Stack alignItems="center" py={6}>
                  <CircularProgress size={32} />
                  <Typography variant="caption" sx={{ mt: 1 }} color="text.secondary">
                    Retrieving recent posts...
                  </Typography>
                </Stack>
              ) : posts.length === 0 ? (
                <Alert severity="info" sx={{ borderRadius: 2 }}>
                  No posts found. Verify your Meta connect configuration or import some test mock articles.
                </Alert>
              ) : (
                <Grid container spacing={2} sx={{ maxHeight: 350, overflowY: 'auto', p: 1 }}>
                  {posts.map((post) => {
                    const isSelected = selectedPost?.id === post.id;
                    return (
                      <Grid item xs={6} sm={4} md={3} key={post.id}>
                        <Card
                          sx={{
                            border: isSelected ? '2px solid #00e5ff' : '2px solid transparent',
                            transform: isSelected ? 'scale(0.98)' : 'none',
                            transition: 'all 0.2s',
                          }}
                        >
                          <CardActionArea onClick={() => setSelectedPost(post)}>
                            <CardMedia
                              component="img"
                              height="120"
                              image={post.media_url}
                              alt="ig post"
                              sx={{ objectFit: 'cover' }}
                            />
                            {isSelected && (
                              <Box
                                sx={{
                                  position: 'absolute',
                                  top: 8,
                                  right: 8,
                                  bgcolor: '#070a13',
                                  borderRadius: '50%',
                                  color: 'secondary.main',
                                  display: 'flex',
                                }}
                              >
                                <CheckCircleIcon sx={{ fontSize: 24 }} />
                              </Box>
                            )}
                            <Box sx={{ p: 1 }}>
                              <Typography variant="caption" color="text.secondary" sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', height: 32 }}>
                                {post.caption || 'No Caption'}
                              </Typography>
                            </Box>
                          </CardActionArea>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
              )}
            </Box>
          )}

          {/* STEP 2: Configure Keywords & asset url */}
          {activeStep === 1 && (
            <Stack spacing={3}>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                  Trigger Keyword
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  When someone comments this exact word (case-insensitive), the automation fires.
                </Typography>
                <TextField
                  fullWidth
                  label="Trigger Keyword (e.g. PDF, REWARD)"
                  value={triggerKeyword}
                  onChange={(e) => setTriggerKeyword(e.target.value)}
                  InputProps={{ style: { borderRadius: 8 } }}
                />
              </Box>

              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                  Downloadable Asset Link
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  The URL of the PDF, video guide, or Google Drive folder that will be dispatched.
                </Typography>
                <TextField
                  fullWidth
                  label="PDF Asset URL (e.g. https://drive.google.com/...)"
                  value={pdfUrl}
                  onChange={(e) => setPdfUrl(e.target.value)}
                  placeholder="https://"
                  InputProps={{ style: { borderRadius: 8 } }}
                />
              </Box>
            </Stack>
          )}

          {/* STEP 3: Setup Message logical templates */}
          {activeStep === 2 && (
            <Stack spacing={3}>
              <Alert severity="info" sx={{ borderRadius: 2 }}>
                <strong>Meta API Follower Guard Policy Update:</strong> Follower relationship checking is disabled to comply with Meta privacy guidelines and prevent Graph API rate limits. All commenters who trigger the keyword will receive this Direct Message immediately.
              </Alert>

              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                  Direct Message Content
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                  The message template sent to commenters. Use tags: <code>{'{username}'}</code> for commenter handle, <code>{'{link}'}</code> for download url.
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="DM Message Content"
                  value={successMessage}
                  onChange={(e) => setSuccessMessage(e.target.value)}
                  InputProps={{ style: { borderRadius: 8 } }}
                />
              </Box>
            </Stack>
          )}
        </DialogContent>

        {/* Navigation Action Buttons */}
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleCloseWizard} color="inherit">
            Cancel
          </Button>
          <Box sx={{ flex: '1 1 auto' }} />
          <Button disabled={activeStep === 0} onClick={handleBack} color="inherit" sx={{ mr: 1 }}>
            Back
          </Button>
          {activeStep === steps.length - 1 ? (
            <Button variant="contained" color="secondary" onClick={handleCreateAutomation}>
              Complete & Launch
            </Button>
          ) : (
            <Button variant="contained" color="primary" onClick={handleNext}>
              Next
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}
