import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Typography,
  Switch,
  FormControlLabel,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import CustomTable from '../../../common/Tables/CustomTable';
import Loader from '../../../shared/components/ui/Loader';
import { useToast } from '../../../shared/providers/ToastProvider';
import { configApi, type PaginatedResponse } from '../services/configApi';

interface NetworkMapRecord {
  name: string;
  cfg: string;
  active: boolean;
  messages: string;
  tenantId: string;
  __rowId?: string;
}

const PAGE_LIMIT = 20;

const NetworkMapPage: React.FC = () => {
  const { showSuccess, showError } = useToast();
  const [records, setRecords] = useState<NetworkMapRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);

  // Dialog state
  const [dialogMode, setDialogMode] = useState<'create' | 'edit' | 'view'>('create');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<NetworkMapRecord | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<NetworkMapRecord | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Form fields
  const [formData, setFormData] = useState({
    name: '',
    cfg: '1.0.0',
    active: true,
    messages: '[]',
    tenantId: 'DEFAULT',
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await configApi.list<NetworkMapRecord>('network_map', {
        limit: PAGE_LIMIT,
        offset: page * PAGE_LIMIT,
      });
      setRecords(result.data.map((r, idx) => ({ ...r, __rowId: r.name || `row-${idx}-${r.cfg}` } as NetworkMapRecord & { __rowId: string })));
      setTotalRecords(result.meta.total);
    } catch (err) {
      showError('Failed to load network maps', err instanceof Error ? err.message : undefined);
    } finally {
      setLoading(false);
    }
  }, [page, showError]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreateClick = () => {
    setDialogMode('create');
    setFormData({ name: '', cfg: '1.0.0', active: true, messages: '[]', tenantId: 'DEFAULT' });
    setDialogOpen(true);
  };

  const handleEditClick = (record: NetworkMapRecord) => {
    setDialogMode('edit');
    setSelectedRecord(record);
    setFormData({
      name: record.name,
      cfg: record.cfg,
      active: record.active,
      messages: typeof record.messages === 'string' ? record.messages : JSON.stringify(record.messages ?? [], null, 2),
      tenantId: record.tenantId ?? 'DEFAULT',
    });
    setDialogOpen(true);
  };

  const handleViewClick = (record: NetworkMapRecord) => {
    setDialogMode('view');
    setSelectedRecord(record);
    setFormData({
      name: record.name,
      cfg: record.cfg,
      active: record.active,
      messages: typeof record.messages === 'string' ? record.messages : JSON.stringify(record.messages ?? [], null, 2),
      tenantId: record.tenantId ?? 'DEFAULT',
    });
    setDialogOpen(true);
  };

  const handleDeleteClick = (record: NetworkMapRecord) => {
    setRecordToDelete(record);
    setDeleteDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      showError('Validation error', 'Name is required');
      return;
    }
    let parsedMessages: unknown = [];
    try {
      parsedMessages = JSON.parse(formData.messages || '[]');
    } catch {
      showError('Validation error', 'Messages must be valid JSON');
      return;
    }
    setActionLoading(true);
    try {
      const payload = {
        name: formData.name,
        cfg: formData.cfg,
        active: formData.active,
        messages: parsedMessages,
        tenantId: formData.tenantId,
      };
      if (dialogMode === 'create') {
        await configApi.create('network_map', payload);
        showSuccess('Network map created successfully');
      } else if (dialogMode === 'edit' && selectedRecord) {
        await configApi.update('network_map', selectedRecord.name, selectedRecord.cfg, payload);
        showSuccess('Network map updated successfully');
      }
      setDialogOpen(false);
      fetchData();
    } catch (err) {
      showError('Failed to save network map', err instanceof Error ? err.message : undefined);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!recordToDelete) return;
    setActionLoading(true);
    try {
      await configApi.delete('network_map', recordToDelete.name, recordToDelete.cfg);
      showSuccess('Network map deleted successfully');
      setDeleteDialogOpen(false);
      setRecordToDelete(null);
      fetchData();
    } catch (err) {
      showError('Failed to delete network map', err instanceof Error ? err.message : undefined);
    } finally {
      setActionLoading(false);
    }
  };

  const isReadOnly = dialogMode === 'view';

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Name', flex: 1, minWidth: 200 },
    { field: 'cfg', headerName: 'Config Version', width: 130 },
    {
      field: 'active',
      headerName: 'Active',
      width: 100,
      renderCell: (params: GridRenderCellParams) => (
        <span style={{ color: params.value ? '#10b981' : '#ef4444', fontWeight: 600 }}>
          {params.value ? 'Yes' : 'No'}
        </span>
      ),
    },
    { field: 'messages', headerName: 'Messages', flex: 1, minWidth: 150, renderCell: (params: GridRenderCellParams) => {
      const val = params.value;
      if (Array.isArray(val)) return `${val.length} message(s)`;
      return typeof val === 'string' ? val : '';
    }},
    { field: 'tenantId', headerName: 'Tenant ID', width: 130 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => {
        const record = params.row as NetworkMapRecord;
        return (
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Tooltip title="View">
              <IconButton size="small" onClick={() => handleViewClick(record)}>
                <ViewIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Edit">
              <IconButton size="small" onClick={() => handleEditClick(record)}>
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton size="small" color="error" onClick={() => handleDeleteClick(record)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        );
      },
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, color: '#374151' }}>
          Network Map Configuration
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateClick}
          sx={{ backgroundColor: '#3b82f6', '&:hover': { backgroundColor: '#2563eb' } }}
        >
          Create New
        </Button>
      </Box>

      {loading || actionLoading ? (
        <Loader />
      ) : (
        <CustomTable
          columns={columns}
          rows={records}
          uniqueId="__rowId"
          pagination={{
            page,
            limit: PAGE_LIMIT,
            totalRecords,
            setPage,
          }}
        />
      )}

      {/* Create / Edit / View Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {dialogMode === 'create' ? 'Create Network Map' : dialogMode === 'edit' ? 'Edit Network Map' : 'View Network Map'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled={isReadOnly || dialogMode === 'edit'}
              required
              fullWidth
              helperText={dialogMode === 'edit' ? 'Name cannot be changed' : undefined}
            />
            <TextField
              label="Config Version"
              value={formData.cfg}
              onChange={(e) => setFormData({ ...formData, cfg: e.target.value })}
              disabled={isReadOnly || dialogMode === 'edit'}
              required
              fullWidth
              helperText={dialogMode === 'edit' ? 'Config version cannot be changed' : undefined}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  disabled={isReadOnly}
                />
              }
              label="Active"
            />
            <TextField
              label="Messages (JSON array)"
              value={formData.messages}
              onChange={(e) => setFormData({ ...formData, messages: e.target.value })}
              disabled={isReadOnly}
              fullWidth
              multiline
              rows={4}
              placeholder='[{"id":"004@1.0.0","cfg":"1.0.0","txTp":"pacs.002.001.12","typologies":""}]'
            />
            <TextField
              label="Tenant ID"
              value={formData.tenantId}
              onChange={(e) => setFormData({ ...formData, tenantId: e.target.value })}
              disabled={isReadOnly}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>
            {isReadOnly ? 'Close' : 'Cancel'}
          </Button>
          {!isReadOnly && (
            <Button variant="contained" onClick={handleSave} disabled={actionLoading}>
              {dialogMode === 'create' ? 'Create' : 'Save'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the network map{' '}
            <strong>{recordToDelete?.name}</strong> (cfg: {recordToDelete?.cfg})?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDeleteConfirm} disabled={actionLoading}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default NetworkMapPage;
