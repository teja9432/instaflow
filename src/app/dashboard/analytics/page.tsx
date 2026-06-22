'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Button,
  Stack,
  Alert,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import RefreshIcon from '@mui/icons-material/Refresh';

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);

  const fetchLogs = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch('/api/analytics', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setLogs(data.logs || []);
    } catch (e) {
      console.error('Error fetching analytics activity log:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchLogs();
  };

  // MUI DataGrid Columns definition
  const columns: GridColDef[] = [
    {
      field: 'timestamp',
      headerName: 'Date / Time',
      width: 180,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ opacity: 0.8 }}>
          {new Date(params.value).toLocaleString()}
        </Typography>
      ),
    },
    {
      field: 'commenterUsername',
      headerName: 'Instagram User',
      width: 140,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          @{params.value}
        </Typography>
      ),
    },
    {
      field: 'commentText',
      headerName: 'Comment Message',
      width: 200,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontStyle: 'italic', opacity: 0.9 }}>
          "{params.value}"
        </Typography>
      ),
    },
    {
      field: 'triggerWord',
      headerName: 'Keyword Trigger',
      width: 130,
      valueGetter: (value, row) => row.automation?.triggerKeyword || 'N/A',
      renderCell: (params) => (
        <Chip label={params.value} size="small" variant="outlined" color="primary" sx={{ fontWeight: 600 }} />
      ),
    },
    {
      field: 'isFollower',
      headerName: 'Follower Status',
      width: 130,
      renderCell: (params) => (
        <Chip
          label={params.value ? 'Following' : 'Not Following'}
          size="small"
          variant="outlined"
          color={params.value ? 'success' : 'error'}
          sx={{ fontWeight: 600 }}
        />
      ),
    },
    {
      field: 'status',
      headerName: 'DM Delivery',
      width: 140,
      renderCell: (params) => (
        <Chip
          label={params.value === 'SENT_SUCCESS' ? 'DELIVERED' : params.value === 'SENT_FALLBACK' ? 'FALLBACK REMINDER' : 'FAILED'}
          size="small"
          color={params.value === 'SENT_SUCCESS' ? 'success' : params.value === 'SENT_FALLBACK' ? 'warning' : 'error'}
          sx={{ fontWeight: 700, fontSize: '0.65rem' }}
        />
      ),
    },
    {
      field: 'errorDetails',
      headerName: 'Execution Notes',
      width: 200,
      renderCell: (params) => (
        <Typography variant="caption" color={params.value ? 'error.main' : 'text.secondary'} sx={{ fontFamily: 'monospace' }}>
          {params.value || 'Processed successfully.'}
        </Typography>
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
      {/* Title / Action headers */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.02em', mb: 0.5 }}>
            Activity Analytics
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Drill down into raw transaction events, commenter behaviors, and webhook notifications.
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
          Refresh Logs
        </Button>
      </Stack>

      {/* Database grid panel card */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ height: 550, width: '100%' }}>
            <DataGrid
              rows={logs}
              columns={columns}
              initialState={{
                pagination: { paginationModel: { pageSize: 10 } },
              }}
              pageSizeOptions={[10, 25, 50]}
              disableRowSelectionOnClick
            />
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
