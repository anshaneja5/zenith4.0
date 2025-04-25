import React, { useState } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  ListItemIcon,
  ListItemText,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  Divider,
  useTheme,
  useMediaQuery,
  Badge,
  Tooltip,
  alpha,
  Container
} from '@mui/material';
import {
  Menu as MenuIcon,
  School as SchoolIcon,
  Gavel as GavelIcon,
  Description as DescriptionIcon,
  Timeline as TimelineIcon,
  AccountBalance as NGOIcon,
  Psychology as CounselingIcon,
  Support as SupportIcon,
  Person as LawyerIcon,
  LocalHospital as ClinicIcon,
  Description as DocumentIcon,
  Forum as ForumIcon,
  Close as CloseIcon,
  KeyboardArrowDown as ArrowDownIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  PersonOutline as ProfileIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { styled } from '@mui/material/styles';

// Custom styled components
const GradientAppBar = styled(AppBar)(({ theme }) => ({
  background: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
}));

const NavButton = styled(Button)(({ theme, active }) => ({
  color: 'white',
  borderRadius: 8,
  padding: '6px 16px',
  transition: 'all 0.3s ease',
  position: 'relative',
  overflow: 'hidden',
  fontWeight: 500,
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.15)',
    transform: 'translateY(-2px)',
  },
  ...(active && {
    background: 'rgba(255, 255, 255, 0.15)',
    fontWeight: 600,
    '&::after': {
      content: '""',
      position: 'absolute',
      bottom: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      width: '50%',
      height: 3,
      borderRadius: 1.5,
      backgroundColor: 'white',
    }
  })
}));

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: 8,
  padding: '6px 16px',
  fontWeight: 600,
  boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 6px 15px rgba(0, 0, 0, 0.15)',
    transform: 'translateY(-2px)',
  }
}));

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: theme.palette.error.main,
    color: theme.palette.error.contrastText,
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    '&::after': {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      animation: 'ripple 1.2s infinite ease-in-out',
      border: '1px solid currentColor',
      content: '""',
    },
  },
  '@keyframes ripple': {
    '0%': {
      transform: 'scale(.8)',
      opacity: 1,
    },
    '100%': {
      transform: 'scale(2.4)',
      opacity: 0,
    },
  },
}));

const Navbar = () => {
  const { user, logout } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuAnchorEl, setUserMenuAnchorEl] = useState(null);
  const [userToolsMenuAnchorEl, setUserToolsMenuAnchorEl] = useState(null);
  const [notificationsAnchorEl, setNotificationsAnchorEl] = useState(null);
  
  const isActive = (path) => location.pathname === path;
  
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  
  const handleUserMenuOpen = (event) => {
    setUserMenuAnchorEl(event.currentTarget);
  };
  
  const handleUserMenuClose = () => {
    setUserMenuAnchorEl(null);
  };
  
  const handleUserToolsMenuOpen = (event) => {
    setUserToolsMenuAnchorEl(event.currentTarget);
  };
  
  const handleUserToolsMenuClose = () => {
    setUserToolsMenuAnchorEl(null);
  };
  
  const handleNotificationsOpen = (event) => {
    setNotificationsAnchorEl(event.currentTarget);
  };
  
  const handleNotificationsClose = () => {
    setNotificationsAnchorEl(null);
  };
  
  const handleLogout = () => {
    handleUserMenuClose();
    logout();
  };
  
  const navItems = [
    { 
      name: 'Educational Content', 
      path: '/educational-content', 
      icon: <SchoolIcon /> 
    },
    { 
      name: 'Legal Guidance', 
      path: '/legal-guidance', 
      icon: <GavelIcon /> 
    },
    { 
      name: 'Legal Resources', 
      path: '/legal-resources', 
      icon: <NGOIcon /> 
    },
    { 
      name: 'Document Hub', 
      path: '/documents', 
      icon: <DocumentIcon /> 
    }
  ];
  
  const userNavItems = [
    { 
      name: 'Community Forum', 
      path: '/forum', 
      icon: <ForumIcon /> 
    },
    { 
      name: 'Create Report', 
      path: '/report/create', 
      icon: <DescriptionIcon /> 
    },
    { 
      name: 'Report Tracker', 
      path: '/report/tracker', 
      icon: <TimelineIcon /> 
    }
  ];

  const drawer = (
    <Box sx={{ width: 280, pt: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1 }}>
        <Typography variant="h6" component={RouterLink} to="/" sx={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}>
          <Box 
            component="span" 
            sx={{ 
              mr: 1, 
              display: 'inline-flex', 
              p: 0.5, 
              borderRadius: '50%', 
              background: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            }}
          >
            <GavelIcon sx={{ color: 'white' }} />
          </Box>
          Nyaay.AI
        </Typography>
        <IconButton onClick={handleDrawerToggle} edge="end">
          <CloseIcon />
        </IconButton>
      </Box>
      
      <Divider sx={{ my: 1 }} />
      
      {user && (
        <Box sx={{ px: 2, py: 2, display: 'flex', alignItems: 'center' }}>
          <Avatar
            alt={user.name}
            src={user.avatar}
            sx={{ 
              width: 40, 
              height: 40,
              background: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            }}
          >
            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </Avatar>
          <Box sx={{ ml: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {user.name || 'User'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {user.email}
            </Typography>
          </Box>
        </Box>
      )}
      
      <List>
        {navItems.map((item) => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton
              component={RouterLink}
              to={item.path}
              selected={isActive(item.path)}
              onClick={handleDrawerToggle}
              sx={{
                borderRadius: 2,
                mx: 1,
                mb: 0.5,
                '&.Mui-selected': {
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  color: theme.palette.primary.main,
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.15),
                  },
                  '& .MuiListItemIcon-root': {
                    color: theme.palette.primary.main,
                  }
                }
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.name} />
            </ListItemButton>
          </ListItem>
        ))}
        
        {user && (
          <>
            <Divider sx={{ my: 1 }}>
              <Typography variant="caption" color="text.secondary">
                User Tools
              </Typography>
            </Divider>
            
            {userNavItems.map((item) => (
              <ListItem key={item.path} disablePadding>
                <ListItemButton
                  component={RouterLink}
                  to={item.path}
                  selected={isActive(item.path)}
                  onClick={handleDrawerToggle}
                  sx={{
                    borderRadius: 2,
                    mx: 1,
                    mb: 0.5,
                    '&.Mui-selected': {
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      color: theme.palette.primary.main,
                      '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.15),
                      },
                      '& .MuiListItemIcon-root': {
                        color: theme.palette.primary.main,
                      }
                    }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.name} />
                </ListItemButton>
              </ListItem>
            ))}
          </>
        )}
      </List>
      
      <Divider sx={{ my: 1 }} />
      
      <Box sx={{ px: 2, py: 2 }}>
        {user ? (
          <Button
            fullWidth
            variant="outlined"
            color="primary"
            onClick={logout}
            startIcon={<LogoutIcon />}
            sx={{ borderRadius: 2 }}
          >
            Logout
          </Button>
        ) : (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              fullWidth
              variant="outlined"
              color="primary"
              component={RouterLink}
              to="/login"
              sx={{ borderRadius: 2 }}
            >
              Login
            </Button>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              component={RouterLink}
              to="/signup"
              sx={{ 
                borderRadius: 2,
                background: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              }}
            >
              Sign Up
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );

  return (
    <>
      <GradientAppBar position="sticky">
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ minHeight: { xs: 64, sm: 70 } }}>
            {/* Logo */}
            <Typography
              variant="h6"
              component={RouterLink}
              to="/"
              sx={{
                mr: 3,
                textDecoration: 'none',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                fontWeight: 700,
                letterSpacing: 0.5
              }}
            >
              <Box 
                component="span" 
                sx={{ 
                  mr: 1, 
                  display: 'inline-flex', 
                  p: 0.5, 
                  borderRadius: '50%', 
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                }}
              >
                <GavelIcon sx={{ color: 'white' }} />
              </Box>
              Nyaay.AI
            </Typography>

            {/* Desktop Navigation */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, flexGrow: 1, gap: 1 }}>
              {navItems.map((item) => (
                <NavButton
                  key={item.path}
                  component={RouterLink}
                  to={item.path}
                  startIcon={item.icon}
                  active={isActive(item.path) ? 1 : 0}
                >
                  {item.name}
                </NavButton>
              ))}
              
              {user && (
                <Box sx={{ position: 'relative', ml: 1 }}>
                  <NavButton
                    endIcon={<ArrowDownIcon />}
                    onClick={handleUserToolsMenuOpen}
                    active={userNavItems.some(item => isActive(item.path)) ? 1 : 0}
                  >
                    User Tools
                  </NavButton>
                  <Menu
                    anchorEl={userToolsMenuAnchorEl}
                    open={Boolean(userToolsMenuAnchorEl)}
                    onClose={handleUserToolsMenuClose}
                    PaperProps={{
                      elevation: 3,
                      sx: { 
                        mt: 1.5, 
                        borderRadius: 2,
                        minWidth: 200,
                        overflow: 'visible',
                        '&:before': {
                          content: '""',
                          display: 'block',
                          position: 'absolute',
                          top: 0,
                          right: 14,
                          width: 10,
                          height: 10,
                          bgcolor: 'background.paper',
                          transform: 'translateY(-50%) rotate(45deg)',
                          zIndex: 0,
                        },
                      }
                    }}
                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                  >
                    {userNavItems.map((item) => (
                      <MenuItem
                        key={item.path}
                        component={RouterLink}
                        to={item.path}
                        onClick={handleUserToolsMenuClose}
                        selected={isActive(item.path)}
                        sx={{ 
                          borderRadius: 1,
                          mx: 0.5,
                          '&.Mui-selected': {
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            color: theme.palette.primary.main,
                          }
                        }}
                      >
                        <ListItemIcon>
                          {item.icon}
                        </ListItemIcon>
                        <ListItemText>{item.name}</ListItemText>
                      </MenuItem>
                    ))}
                  </Menu>
                </Box>
              )}
            </Box>

            {/* Mobile Menu Toggle */}
            <Box sx={{ display: { xs: 'flex', md: 'none' }, flexGrow: 1 }}>
              <IconButton
                size="large"
                edge="start"
                color="inherit"
                aria-label="menu"
                onClick={handleDrawerToggle}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
            </Box>

            {/* User Actions */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
              {user && (
                <>
                  <Tooltip title="Notifications">
                    <IconButton 
                      color="inherit"
                      onClick={handleNotificationsOpen}
                      sx={{ 
                        bgcolor: 'rgba(255, 255, 255, 0.1)',
                        '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.2)' }
                      }}
                    >
                      <StyledBadge badgeContent={3} color="error">
                        <NotificationsIcon />
                      </StyledBadge>
                    </IconButton>
                  </Tooltip>
                  
                  <Menu
                    anchorEl={notificationsAnchorEl}
                    open={Boolean(notificationsAnchorEl)}
                    onClose={handleNotificationsClose}
                    PaperProps={{
                      elevation: 3,
                      sx: { 
                        mt: 1.5, 
                        borderRadius: 2,
                        minWidth: 320,
                        maxWidth: 360,
                        overflow: 'visible',
                        '&:before': {
                          content: '""',
                          display: 'block',
                          position: 'absolute',
                          top: 0,
                          right: 14,
                          width: 10,
                          height: 10,
                          bgcolor: 'background.paper',
                          transform: 'translateY(-50%) rotate(45deg)',
                          zIndex: 0,
                        },
                      }
                    }}
                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                  >
                    <Box sx={{ px: 2, py: 1.5, borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.1)}` }}>
                      <Typography variant="subtitle1" fontWeight={600}>
                        Notifications
                      </Typography>
                    </Box>
                    
                    <MenuItem onClick={handleNotificationsClose} sx={{ px: 2, py: 1.5 }}>
                      <ListItemIcon>
                        <Badge color="success" variant="dot">
                          <ForumIcon fontSize="small" />
                        </Badge>
                      </ListItemIcon>
                      <ListItemText 
                        primary="New response in your forum thread" 
                        secondary="Workplace harassment discussion - 15 minutes ago"
                        primaryTypographyProps={{ fontWeight: 500 }}
                      />
                    </MenuItem>
                    
                    <MenuItem onClick={handleNotificationsClose} sx={{ px: 2, py: 1.5 }}>
                      <ListItemIcon>
                        <Badge color="success" variant="dot">
                          <DescriptionIcon fontSize="small" />
                        </Badge>
                      </ListItemIcon>
                      <ListItemText 
                        primary="Your report status has been updated" 
                        secondary="Report #12345 - 2 hours ago"
                        primaryTypographyProps={{ fontWeight: 500 }}
                      />
                    </MenuItem>
                    
                    <MenuItem onClick={handleNotificationsClose} sx={{ px: 2, py: 1.5 }}>
                      <ListItemIcon>
                        <Badge color="success" variant="dot">
                          <GavelIcon fontSize="small" />
                        </Badge>
                      </ListItemIcon>
                      <ListItemText 
                        primary="New legal resources available" 
                        secondary="Domestic violence support - 1 day ago"
                        primaryTypographyProps={{ fontWeight: 500 }}
                      />
                    </MenuItem>
                    
                    <Box sx={{ p: 1.5, textAlign: 'center', borderTop: `1px solid ${alpha(theme.palette.primary.main, 0.1)}` }}>
                      <Button 
                        size="small" 
                        sx={{ 
                          borderRadius: 4,
                          color: theme.palette.primary.main,
                          '&:hover': {
                            bgcolor: alpha(theme.palette.primary.main, 0.1)
                          }
                        }}
                      >
                        View all notifications
                      </Button>
                    </Box>
                  </Menu>
                </>
              )}
              
              {user ? (
                <>
                  <Box 
                    onClick={handleUserMenuOpen}
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      cursor: 'pointer',
                      py: 0.5,
                      px: { xs: 1, sm: 1.5 },
                      borderRadius: 8,
                      bgcolor: 'rgba(255, 255, 255, 0.1)',
                      '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.2)' }
                    }}
                  >
                    <Avatar
                      alt={user.name}
                      src={user.avatar}
                      sx={{ 
                        width: 32, 
                        height: 32,
                        border: '2px solid rgba(255, 255, 255, 0.8)'
                      }}
                    >
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </Avatar>
                    <Box sx={{ ml: 1, display: { xs: 'none', sm: 'block' } }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                        {user.name || 'User'}
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.8, lineHeight: 1.2 }}>
                        Member
                      </Typography>
                    </Box>
                    <ArrowDownIcon sx={{ ml: 0.5, fontSize: 18, opacity: 0.8 }} />
                  </Box>
                  
                  <Menu
                    anchorEl={userMenuAnchorEl}
                    open={Boolean(userMenuAnchorEl)}
                    onClose={handleUserMenuClose}
                    PaperProps={{
                      elevation: 3,
                      sx: { 
                        mt: 1.5, 
                        borderRadius: 2,
                        minWidth: 220,
                        overflow: 'visible',
                        '&:before': {
                          content: '""',
                          display: 'block',
                          position: 'absolute',
                          top: 0,
                          right: 14,
                          width: 10,
                          height: 10,
                          bgcolor: 'background.paper',
                          transform: 'translateY(-50%) rotate(45deg)',
                          zIndex: 0,
                        },
                      }
                    }}
                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                  >
                    <Box sx={{ px: 2, py: 1.5, borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.1)}` }}>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {user.name || 'User'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {user.email}
                      </Typography>
                    </Box>
                    
                    <MenuItem onClick={handleUserMenuClose} component={RouterLink} to="/profile">
                      <ListItemIcon>
                        <ProfileIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText>My Profile</ListItemText>
                    </MenuItem>
                    
                    <MenuItem onClick={handleUserMenuClose} component={RouterLink} to="/settings">
                      <ListItemIcon>
                        <SettingsIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText>Settings</ListItemText>
                    </MenuItem>
                    
                    <Divider />
                    
                    <MenuItem onClick={handleLogout}>
                      <ListItemIcon>
                        <LogoutIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText>Logout</ListItemText>
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <>
                  <ActionButton
                    variant="text"
                    color="inherit"
                    component={RouterLink}
                    to="/login"
                    sx={{ 
                      display: { xs: 'none', sm: 'flex' },
                      bgcolor: 'rgba(255, 255, 255, 0.1)',
                      '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.2)' }
                    }}
                  >
                    Login
                  </ActionButton>
                  
                  <ActionButton
                    variant="contained"
                    component={RouterLink}
                    to="/signup"
                    sx={{ 
                      bgcolor: 'white',
                      color: theme.palette.primary.main,
                      '&:hover': {
                        bgcolor: 'white',
                      }
                    }}
                  >
                    Sign Up
                  </ActionButton>
                </>
              )}
            </Box>
          </Toolbar>
        </Container>
      </GradientAppBar>
      
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better mobile performance
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 280 },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default Navbar;
