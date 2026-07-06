import React from 'react';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Tooltip from '@mui/material/Tooltip';
import { useNavigate, useLocation } from 'react-router-dom';
import { ROUTES } from '../../../shared/config/routes.config';
import NavListItemButton from './NavListItemButton';
import { useAuth } from '../../auth/contexts/AuthContext';
import { DatabaseIcon, ActivityIcon, PackageIcon, Layout, LogOutIcon } from 'lucide-react';

interface SideNavProps {
  open: boolean;
  onClose?: () => void;
}

export default function SideNav({ open, onClose }: SideNavProps) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const location = useLocation();

  const items = [
    {
      id: 'dashboard',
      text: 'Dashboard',
      path: ROUTES.DASHBOARD,
      icon: <Layout size={18} />,
      color: '#7c3aed',
    },
    {
      id: 'network-map',
      text: 'Network Map',
      path: ROUTES.NETWORK_MAP,
      icon: <DatabaseIcon size={18} />,
      color: '#3b82f6',
    },
    {
      id: 'rule',
      text: 'Rule',
      path: ROUTES.RULE,
      icon: <ActivityIcon size={18} />,
      color: '#10b981',
    },
    {
      id: 'typology',
      text: 'Typology',
      path: ROUTES.TYPOLOGY,
      icon: <PackageIcon size={18} />,
      color: '#f59e0b',
    },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          msOverflowStyle: 'none',
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
          pt: open ? 4 : 2,
        }}
      >
        <List>
          {items.map((item) => {
            const isActive =
              location.pathname === item.path ||
              location.pathname.startsWith(item.path + '/');
            return (
              <ListItem key={item.id} disablePadding sx={{ display: 'block' }}>
                <Tooltip
                  title={item.text}
                  placement="right"
                  arrow
                  disableHoverListener={open}
                  slotProps={{
                    popper: {
                      modifiers: [
                        {
                          name: 'offset',
                          options: {
                            offset: [0, -8],
                          },
                        },
                      ],
                    },
                  }}
                >
                  <NavListItemButton
                    open={open}
                    onClick={() => {
                      navigate(item.path);
                      if (onClose) onClose();
                    }}
                    aria-label={`Navigate to ${item.text}`}
                    sx={{
                      py: 1,
                      transition: 'background-color 150ms, color 150ms',
                      backgroundColor: isActive
                        ? `${item.color}18`
                        : 'transparent',
                      '&:hover': {
                        backgroundColor: `${item.color}14`,
                        '& .MuiListItemText-primary': { color: item.color },
                        '& .icon-box': {
                          borderColor: `${item.color}55`,
                          bgcolor: `${item.color}10`,
                        },
                      },
                      '& .MuiListItemText-primary': isActive
                        ? { color: item.color, fontWeight: 700 }
                        : {},
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 0,
                        justifyContent: 'center',
                        mr: open ? 2.5 : 'auto',
                      }}
                    >
                      <Box
                        className="icon-box"
                        sx={{
                          width: 34,
                          height: 34,
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: `1px solid ${isActive ? item.color + '66' : item.color + '33'}`,
                          bgcolor: isActive ? `${item.color}14` : '#fbf9fa',
                        }}
                      >
                        {React.cloneElement(item.icon as any, {
                          color: item.color,
                        })}
                      </Box>
                    </ListItemIcon>
                    <ListItemText
                      primary={item.text}
                      sx={{
                        opacity: open ? 1 : 0,
                        '& .MuiListItemText-primary': { fontSize: 13 },
                      }}
                    />
                  </NavListItemButton>
                </Tooltip>
              </ListItem>
            );
          })}
        </List>
      </Box>

      <Box sx={{ borderTop: '1px solid', borderColor: 'divider' }}>
        <List>
          <ListItem disablePadding sx={{ display: 'block' }}>
            <NavListItemButton
              open={open}
              onClick={() => {
                logout();
                navigate(ROUTES.LOGIN);
                if (onClose) onClose();
              }}
              aria-label="Logout"
              sx={{ py: 1 }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  justifyContent: 'center',
                  mr: open ? 2.5 : 'auto',
                }}
              >
                <Box
                  sx={{
                    width: 34,
                    height: 34,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid #ef444433',
                    bgcolor: '#fbf9fa',
                  }}
                >
                  <LogOutIcon size={18} color="#ef4444" />
                </Box>
              </ListItemIcon>
              <ListItemText
                primary="Logout"
                sx={{
                  opacity: open ? 1 : 0,
                  '& .MuiListItemText-primary': { fontSize: 13 },
                }}
              />
            </NavListItemButton>
          </ListItem>
        </List>
      </Box>
    </Box>
  );
}
