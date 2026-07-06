import CloseIcon from '@mui/icons-material/Close';
import MenuIcon from '@mui/icons-material/Menu';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import UserCard from './UserCard';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../shared/config/routes.config';

interface TopBarProps {
  open: boolean;
  onToggle: () => void;
}

export default function TopBar({ open, onToggle }: TopBarProps) {
  const navigate = useNavigate();

  return (
    <Toolbar
      sx={{
        backgroundColor: '#fbf9fa',
        minHeight: 56,
        px: { xs: 1, sm: 2 },
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Box
        sx={{
          width: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <IconButton
          color="default"
          aria-label="toggle drawer"
          onClick={onToggle}
          edge="start"
          sx={{ width: 44, height: 44 }}
        >
          {open ? <CloseIcon /> : <MenuIcon />}
        </IconButton>
      </Box>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            cursor: 'pointer',
          }}
          onClick={() => navigate(ROUTES.DASHBOARD)}
        >
          <img
            src="/logo.png"
            alt="Tazama Logo"
            style={{ height: 28, width: 'auto' }}
          />
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ fontWeight: 700, color: '#000' }}
          >
            Tazama Config Studio
          </Typography>
        </div>
      </div>

      <Box sx={{ flexGrow: 1 }} />
      <UserCard />
    </Toolbar>
  );
}
