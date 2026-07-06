import * as React from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import { useAuth } from '../../auth/contexts/AuthContext';

export default function UserCard() {
  const { user } = useAuth();

  const username = user?.username ?? 'user';
  const initials = username
    .split('@')[0]
    .split(/[-._]/)
    .map((s) => s.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 1 }}>
      <Avatar
        sx={{
          width: 32,
          height: 32,
          bgcolor: '#51BE99',
          fontSize: 13,
          fontWeight: 700,
        }}
      >
        {initials}
      </Avatar>
      <Typography variant="body2" sx={{ fontWeight: 600, color: '#374151' }}>
        {username}
      </Typography>
    </Box>
  );
}
