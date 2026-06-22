'use client';

import React, { useEffect, useState } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Stack,
  Button,
  TextField,
  MenuItem,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
} from '@mui/material';
import CommentIcon from '@mui/icons-material/Comment';
import SendIcon from '@mui/icons-material/Send';
import PercentIcon from '@mui/icons-material/Percent';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import RefreshIcon from '@mui/icons-material/Refresh';

// Register Chart.js elements
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title as ChartTitle,
  Tooltip as ChartTooltip,
  Legend as ChartLegend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ChartTitle, ChartTooltip, ChartLegend);

export default function DashboardHome() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<any>(null);
  const [automations, setAutomations] = useState<any[]>([]);

  // Simulation Form States
  const [simPostId, setSimPostId] = useState('');
  const [simText, setSimText] = useState('');
  const [simUsername, setSimUsername] = useState('john_follower');
  const [simLoading, setSimLoading] = useState(false);
  const [simResult, setSimResult] = useState<any>(null);

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      // 1. Fetch Analytics Metrics
      const analyticsRes = await fetch('/api/analytics', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const analyticsData = await analyticsRes.json();

      // 2. Fetch Automations List
      const automationsRes = await fetch('/api/automations', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const automationsData = await automationsRes.json();

      setData(analyticsData);
      setAutomations(automationsData.automations || []);
      
      // Auto-set the first post ID for simulation
      if (automationsData.automations?.length > 0 && !simPostId) {
        setSimPostId(automationsData.automations[0].postId);
        setSimText(automationsData.automations[0].triggerKeyword);
      }
    } catch (e) {
      console.error('Error fetching dashboard statistics:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
  };

  const handleSimulate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!simPostId || !simText || !simUsername) return;

    setSimLoading(true);
    setSimResult(null);

    const token = localStorage.getItem('token');
    
    try {
      const res = await fetch('/api/test-webhook-simulate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          postId: simPostId,
          commentText: simText,
          commenterUsername: simUsername,
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Simulation failed.');

      setSimResult(result);
      // Refresh analytics logs below after simulation
      fetchData();
    } catch (err: any) {
      setSimResult({ error: err.message });
    } finally {
      setSimLoading(false);
    }
  };

  // Helper to prefill trigger keywords when post changes in simulator dropdown
  const handleSimPostChange = (postId: string) => {
    setSimPostId(postId);
    const chosen = automations.find((a) => a.postId === postId);
    if (chosen) {
      setSimText(chosen.triggerKeyword);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', height: '50vh', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  const { metrics, chartData, logs } = data || {
    metrics: { totalProcessed: 0, totalDmsSent: 0, conversionRate: 0 },
    chartData: { labels: [], datasets: [] },
    logs: [],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: { color: '#9ca3af', font: { family: 'Outfit' } },
      },
    },
    scales: {
      x: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#9ca3af' } },
      y: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#9ca3af', stepSize: 1 } },
    },
  };

  return (
    <Box>
      {/* Top Welcome Title */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.02em', mb: 0.5 }}>
            Dashboard Overview
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Monitor real-time campaign performance and execute comment-to-DM simulations.
          </Typography>
        </Box>
        <Button
          variant="outlined"
          color="primary"
          startIcon={refreshing ? <CircularProgress size={16} /> : <RefreshIcon />}
          onClick={handleRefresh}
          disabled={refreshing}
          sx={{ borderColor: 'rgba(171, 71, 188, 0.3)' }}
        >
          Refresh Statistics
        </Button>
      </Stack>

      {/* KPI Cards row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600 }}>
                    Comments Processed
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 800, mt: 1, color: 'text.primary' }}>
                    {metrics.totalProcessed}
                  </Typography>
                </Box>
                <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(156, 39, 176, 0.1)', color: 'primary.light' }}>
                  <CommentIcon sx={{ fontSize: 28 }} />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600 }}>
                    Automated DMs Sent
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 800, mt: 1, color: 'text.primary' }}>
                    {metrics.totalDmsSent}
                  </Typography>
                </Box>
                <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(0, 229, 255, 0.1)', color: 'secondary.main' }}>
                  <SendIcon sx={{ fontSize: 28 }} />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600 }}>
                    Asset Conversion Rate
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 800, mt: 1, color: 'text.primary' }}>
                    {metrics.conversionRate}%
                  </Typography>
                </Box>
                <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(76, 175, 80, 0.1)', color: '#4caf50' }}>
                  <PercentIcon sx={{ fontSize: 28 }} />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Main Timeline Chart */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ height: '100%', p: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                Activity Timeline (Last 7 Days)
              </Typography>
              <Box sx={{ height: 300, position: 'relative' }}>
                {chartData.labels?.length > 0 ? (
                  <Line data={chartData} options={chartOptions} />
                ) : (
                  <Stack height="100%" alignItems="center" justifyContent="center">
                    <Typography color="text.secondary">No historical activity data recorded yet.</Typography>
                  </Stack>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Webhook Comment-DM Simulator Panel */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ border: '1px solid rgba(0, 229, 255, 0.15)', height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: 'secondary.main' }}>
                Webhook Lead Simulator
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Simulate an Instagram user commenting on your active posts to test flow triggers instantly.
              </Typography>

              {automations.length === 0 ? (
                <Alert severity="warning" sx={{ borderRadius: 2 }}>
                  You have no active automations. Create one in the <strong>Automations</strong> tab to use this simulator.
                </Alert>
              ) : (
                <form onSubmit={handleSimulate}>
                  <Stack spacing={2.5}>
                    <TextField
                      select
                      label="Select Targeted Automation Post"
                      fullWidth
                      value={simPostId}
                      onChange={(e) => handleSimPostChange(e.target.value)}
                      disabled={simLoading}
                      InputProps={{ style: { borderRadius: 8 } }}
                    >
                      {automations.map((aut) => (
                        <MenuItem key={aut.id} value={aut.postId}>
                          Post: {aut.postId} (Word: "{aut.triggerKeyword}")
                        </MenuItem>
                      ))}
                    </TextField>

                    <TextField
                      label="Comment Text Trigger"
                      placeholder="e.g. PDF"
                      fullWidth
                      value={simText}
                      onChange={(e) => setSimText(e.target.value)}
                      disabled={simLoading}
                      required
                      InputProps={{ style: { borderRadius: 8 } }}
                    />

                    <TextField
                      select
                      label="Simulated Commenter Profile"
                      fullWidth
                      value={simUsername}
                      onChange={(e) => setSimUsername(e.target.value)}
                      disabled={simLoading}
                      InputProps={{ style: { borderRadius: 8 } }}
                    >
                      <MenuItem value="sarah_follows">Sarah (Follower status = TRUE)</MenuItem>
                      <MenuItem value="matt_unfollow">Matt (Follower status = FALSE)</MenuItem>
                    </TextField>

                    <Button
                      type="submit"
                      variant="contained"
                      color="secondary"
                      startIcon={<PlayArrowIcon />}
                      disabled={simLoading}
                      fullWidth
                      sx={{ py: 1.25 }}
                    >
                      {simLoading ? <CircularProgress size={20} color="inherit" /> : 'Execute Webhook Trigger'}
                    </Button>
                  </Stack>
                </form>
              )}

              {/* Simulation Result feedback logs */}
              {simResult && (
                <Box sx={{ mt: 3, p: 2, borderRadius: 2, bgcolor: '#070a13', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  {simResult.error ? (
                    <Typography color="error" variant="caption" sx={{ fontFamily: 'monospace' }}>
                      Error: {simResult.error}
                    </Typography>
                  ) : (
                    <Box>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                        <Chip
                          size="small"
                          label={simResult.processedLog?.status === 'SENT_SUCCESS' ? 'SUCCESS' : 'FALLBACK'}
                          color={simResult.processedLog?.status === 'SENT_SUCCESS' ? 'success' : 'warning'}
                          sx={{ fontWeight: 700, fontSize: '0.65rem' }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          DM delivered successfully
                        </Typography>
                      </Stack>
                      <Typography variant="body2" sx={{ fontSize: '0.75rem', fontFamily: 'monospace', opacity: 0.8 }} color="text.secondary">
                        <strong>Logged Msg:</strong> "{simResult.processedLog?.isFollower ? simResult.processedLog?.automation?.successMessage.replace('{link}', simResult.processedLog?.automation?.pdfUrl) : simResult.processedLog?.automation?.fallbackMessage}"
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Recent logs short table */}
        <Grid item xs={12}>
          <Card sx={{ mt: 1 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                Recent Automation Events
              </Typography>

              {logs.length === 0 ? (
                <Stack py={4} alignItems="center">
                  <Typography color="text.secondary">No triggers processed yet. Run a simulator test!</Typography>
                </Stack>
              ) : (
                <TableContainer component={Paper} sx={{ bgcolor: 'transparent', boxShadow: 'none' }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Commenter</TableCell>
                        <TableCell>Comment Message</TableCell>
                        <TableCell>Target Post ID</TableCell>
                        <TableCell>Relationship Check</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Date / Time</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {logs.slice(0, 5).map((log: any) => (
                        <TableRow key={log.id}>
                          <TableCell sx={{ fontWeight: 600 }}>@{log.commenterUsername}</TableCell>
                          <TableCell sx={{ opacity: 0.85 }}>"{log.commentText}"</TableCell>
                          <TableCell>{log.automation?.postId || 'Grid Post'}</TableCell>
                          <TableCell>
                            <Chip
                              size="small"
                              label={log.isFollower ? 'Following' : 'Not Following'}
                              color={log.isFollower ? 'success' : 'error'}
                              variant="outlined"
                              sx={{ fontWeight: 600 }}
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              size="small"
                              label={log.status}
                              color={log.status === 'SENT_SUCCESS' ? 'success' : log.status === 'SENT_FALLBACK' ? 'warning' : 'error'}
                              sx={{ fontWeight: 700, fontSize: '0.7rem' }}
                            />
                          </TableCell>
                          <TableCell color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                            {new Date(log.timestamp).toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
