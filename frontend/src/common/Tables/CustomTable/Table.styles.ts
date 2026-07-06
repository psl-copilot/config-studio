import { Box, Pagination as MuiPagination, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { DataGrid } from '@mui/x-data-grid';

export const TableOuter = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'paddingValue',
})<{ paddingValue: string }>(
  ({ paddingValue }) => ({
    padding: paddingValue,
  }),
);

export const TableWrapper = styled(Box)(() => ({
  width: '100%',
  backgroundColor: '#fff',
  border: '1px solid #e5e7eb',
  borderRadius: 8,
}));

export const PaginationContainer = styled(Box)(() => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '12px 16px',
  borderTop: '1px solid #e5e7eb',
}));

export const PaginationText = styled(Typography)(() => ({
  fontSize: 13,
  color: '#6b7280',
}));

export const PaginationBold = styled('span')(() => ({
  fontWeight: 600,
  color: '#374151',
}));

export const StyledDataGrid = styled(DataGrid, {
  shouldForwardProp: (prop) =>
    ![
      'multilineHeader',
      'horizontalScroll',
      'horizontalScrollTextAlign',
    ].includes(prop as string),
})<{
  multilineHeader?: boolean;
  horizontalScroll?: boolean;
  horizontalScrollTextAlign?: 'left' | 'center' | 'right';
}>(({ multilineHeader, horizontalScroll, horizontalScrollTextAlign }) => ({
  border: 'none',

  '& .MuiDataGrid-columnHeaderTitle': {
    fontSize: 14,
    fontWeight: 600,
  },

  '& .MuiDataGrid-cell': {
    fontSize: 12,
    overflow: 'visible',
  },

  ...(multilineHeader && {
    '& .MuiDataGrid-columnHeaderTitle': {
      whiteSpace: 'normal',
      wordBreak: 'break-word',
      lineHeight: 1.2,
      textAlign: 'center',
      padding: 4,
      fontSize: 9,
    },
    '& .MuiDataGrid-cell': {
      fontSize: 10,
    },
  }),

  ...(horizontalScroll && {
    '& .MuiDataGrid-columnHeaderTitle': {
      whiteSpace: 'normal',
      wordBreak: 'break-word',
      lineHeight: 1.2,
      textAlign: 'center',
      padding: 4,
      fontSize: 11.5,
      fontWeight: 600,
    },
    '& .MuiDataGrid-cell': {
      fontSize: 11.5,
      whiteSpace: 'normal',
      textAlign: horizontalScrollTextAlign,
    },
  }),

  '& .MuiDataGrid-columnHeader': {
    backgroundColor: '#fbf9fa',
    color: '#374151',
    textTransform: 'none',
    paddingLeft: 12,
    paddingRight: 12,
  },

  '& .MuiDataGrid-columnHeaderTitleContainerContent': {
    width: '100%',
    height: '100%',
  },

  '& .MuiDataGrid-columnHeader:focus-within, & .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within':
    {
      outline: 'none',
    },

  '& .MuiDataGrid-row': {
    cursor: 'pointer',
    overflow: 'visible',
  },

  '& .MuiDataGrid-row:hover': {
    backgroundColor: '#f9fafb80',
  },

  '& .MuiDataGrid-row.Mui-selected, & .MuiDataGrid-row.Mui-selected:hover': {
    backgroundColor: '#e0f2fe',
  },
}));
