'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Stack,
  CircularProgress,
  Button,
} from '@mui/material';
import AutoModeIcon from '@mui/icons-material/AutoMode';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';
import ContactPageIcon from '@mui/icons-material/ContactPage';
import BarChartIcon from '@mui/icons-material/BarChart';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import InstagramIcon from '@mui/icons-material/Instagram';

const drawerWidth = 260;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ name?: string; email?: string } | null>(null);

  useEffect(() => {
    // 1. Verify token exists
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (!token) {
      router.push('/login');
      return;
    }

    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {}
    }

    // 2. Fetch session from server to verify JWT hasn't expired
    fetch('/api/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error('Session expired');
        }
        return res.json();
      })
      .then((data) => {
        setUser(data.user);
        setLoading(false);
      })
      .catch(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');
      });
  }, [router]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleSignOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Automations', icon: <SettingsSuggestIcon />, path: '/dashboard/automations' },
    { text: 'Connected Accounts', icon: <ContactPageIcon />, path: '/dashboard/accounts' },
    { text: 'Analytics', icon: <BarChartIcon />, path: '/dashboard/analytics' },
  ];

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#0b0f19', color: '#f3f4f6' }}>
      {/* Brand logo */}
      <Stack direction="row" spacing={1} alignItems="center" sx={{ px: 3, py: 3.5 }}>
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #ab47bc 0%, #00e5ff 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 10px rgba(171, 71, 188, 0.4)',
          }}
        >
          <AutoModeIcon sx={{ color: '#070a13', fontSize: 16 }} />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '-0.02em', background: 'linear-gradient(to right, #ab47bc, #00e5ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          InstaFlow
        </Typography>
      </Stack>
      
      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.05)' }} />

      {/* Navigation List */}
      <List sx={{ px: 2, py: 3, flexGrow: 1 }}>
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
              <Link href={item.path} passHref style={{ textDecoration: 'none', width: '100%' }}>
                <ListItemButton
                  sx={{
                    borderRadius: 2,
                    bgcolor: isActive ? 'rgba(171, 71, 188, 0.15)' : 'transparent',
                    border: isActive ? '1px solid rgba(171, 71, 188, 0.25)' : '1px solid transparent',
                    color: isActive ? 'primary.light' : 'text.secondary',
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.03)',
                      color: 'text.primary',
                    },
                    '&:hover .MuiListItemIcon-root': {
                      color: 'text.primary',
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: isActive ? 'primary.light' : 'text.secondary', minWidth: 40 }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.text} primaryTypographyProps={{ fontWeight: isActive ? 700 : 500 }} />
                </ListItemButton>
              </Link>
            </ListItem>
          );
        })}
      </List>

      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.05)' }} />

      {/* Bottom Profile and Signout */}
      <Box sx={{ p: 2 }}>
        {user && (
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ px: 1, py: 1.5, mb: 1 }}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36, fontWeight: 700, fontSize: '0.9rem' }}>
              {user.name ? user.name[0].toUpperCase() : 'U'}
            </Avatar>
            <Box sx={{ overflow: 'hidden' }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                {user.name || 'User Account'}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                {user.email || 'user@saas.com'}
              </Typography>
            </Box>
          </Stack>
        )}
        <Button
          fullWidth
          variant="outlined"
          color="inherit"
          startIcon={<LogoutIcon />}
          onClick={handleSignOut}
          sx={{
            borderColor: 'rgba(255, 255, 255, 0.08)',
            color: 'text.secondary',
            '&:hover': {
              borderColor: 'rgba(255, 255, 255, 0.2)',
              color: '#ff1744',
            },
          }}
        >
          Sign Out
        </Button>
      </Box>
    </Box>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', height: '100vh', width: '100vw', alignItems: 'center', justifyContent: 'center', bgcolor: '#070a13' }}>
        <Stack spacing={2} alignItems="center">
          <CircularProgress color="primary" />
          <Typography color="text.secondary" variant="body2">
            Loading your dashboard session...
          </Typography>
        </Stack>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#070a13' }}>
      {/* Mobile Drawer (Responsive Sidebar) */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, border: 'none' },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop Sidebar Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: '1px solid rgba(255, 255, 255, 0.05)' },
        }}
        open
      >
        {drawerContent}
      </Drawer>

      {/* Main Content Area */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', width: { md: `calc(100% - ${drawerWidth}px)` } }}>
        <AppBar
          position="static"
          color="transparent"
          elevation={0}
          sx={{
            borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
            bgcolor: 'rgba(7, 10, 19, 0.5)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <Toolbar sx={{ justifyContent: 'space-between', py: 1 }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>

            {/* Left Header Info */}
            <Box>
              <Typography variant="subtitle2" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.75rem' }}>
                Tenancy Workspace
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Active Campaign Dashboard
                </Typography>
              </Stack>
            </Box>

            {/* Right Header Badges */}
            <Stack direction="row" spacing={2} alignItems="center">
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{
                  px: 2,
                  py: 0.75,
                  borderRadius: 2,
                  bgcolor: 'rgba(0, 229, 255, 0.08)',
                  border: '1px solid rgba(0, 229, 255, 0.15)',
                  color: 'secondary.main',
                }}
              >
                <InstagramIcon sx={{ fontSize: 18 }} />
                <Typography variant="caption" sx={{ fontWeight: 700 }}>
                  Meta Sandbox Connected
                </Typography>
              </Stack>
            </Stack>
          </Toolbar>
        </AppBar>

        {/* Dashboard page panel render */}
        <Box sx={{ p: { xs: 2, md: 4 }, flexGrow: 1, overflowY: 'auto' }}>{children}</Box>
      </Box>
    </Box>
  );
}
