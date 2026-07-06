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
import { configApi } from '../services/configApi';

interface RuleRecord {
  id: string;
  cfg: string;
  config: {
    parameters?: Record<string, unknown>;
    exitConditions?: Array<{ subRuleRef: string; reason: string }>;
    bands?: Array<{ subRuleRef: string; reason: string; lowerLimit?: number; upperLimit?: number }>;
    cases?: unknown;
  };
  desc?: string;
  tenantId?: string;
  __rowId?: string;
}

const PAGE_LIMIT = 20;

const RulePage: React.FC = () => {
  const { showSuccess, showError } = useToast();
  const [records, setRecords] = useState<RuleRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);

  // Dialog state
  const [dialogMode, setDialogMode] = useState<'create' | 'edit' | 'view'>('create');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<RuleRecord | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<RuleRecord | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Form fields
  const [formData, setFormData] = useState({
    id: '',
    cfg: '1.0.0',
    desc: '',
    config: '{}',
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await configApi.list<RuleRecord>('rule', {
        limit: PAGE_LIMIT,
        offset: page * PAGE_LIMIT,
      });
      setRecords(result.data.map((r, idx) => ({ ...r, __rowId: r.id || `row-${idx}-${r.cfg}` })));
      setTotalRecords(result.meta.total);
    } catch (err) {
      showError('Failed to load rules', err instanceof Error ? err.message : undefined);
    } finally {
      setLoading(false);
    }
  }, [page, showError]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreateClick = () => {
    setDialogMode('create');
    setFormData({ id: '', cfg: '1.0.0', desc: '', config: '{}' });
    setDialogOpen(true);
  };

  const handleEditClick = (record: RuleRecord) => {
    setDialogMode('edit');
    setSelectedRecord(record);
    setFormData({
      id: record.id,
      cfg: record.cfg,
      desc: record.desc ?? '',
      config: JSON.stringify(record.config ?? {}, null, 2),
    });
    setDialogOpen(true);
  };

  const handleViewClick = (record: RuleRecord) => {
    setDialogMode('view');
    setSelectedRecord(record);
    setFormData({
      id: record.id,
      cfg: record.cfg,
      desc: record.desc ?? '',
      config: JSON.stringify(record.config ?? {}, null, 2),
    });
    setDialogOpen(true);
  };

  const handleDeleteClick = (record: RuleRecord) => {
    setRecordToDelete(record);
    setDeleteDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.id.trim()) {
      showError('Validation error', 'ID is required');
      return;
    }
    let parsedConfig: unknown = {};
    try {
      parsedConfig = JSON.parse(formData.config || '{}');
    } catch {
      showError('Validation error', 'Config must be valid JSON');
      return;
    }
    setActionLoading(true);
    try {
      const payload = {
        id: formData.id,
        cfg: formData.cfg,
        desc: formData.desc,
        config: parsedConfig,
      };
      if (dialogMode === 'create') {
        await configApi.create('rule', payload);
        showSuccess('Rule created successfully');
      } else if (dialogMode === 'edit' && selectedRecord) {
        await configApi.update('rule', selectedRecord.id, selectedRecord.cfg, payload);
        showSuccess('Rule updated successfully');
      }
      setDialogOpen(false);
      fetchData();
    } catch (err) {
      showError('Failed to save rule', err instanceof Error ? err.message : undefined);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!recordToDelete) return;
    setActionLoading(true);
    try {
      await configApi.delete('rule', recordToDelete.id, recordToDelete.cfg);
      showSuccess('Rule deleted successfully');
      setDeleteDialogOpen(false);
      setRecordToDelete(null);
      fetchData();
    } catch (err) {
      showError('Failed to delete rule', err instanceof Error ? err.message : undefined);
    } finally {
      setActionLoading(false);
    }
  };

  const isReadOnly = dialogMode === 'view';

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', flex: 1, minWidth: 150 },
    { field: 'cfg', headerName: 'Config Version', width: 130 },
    { field: 'desc', headerName: 'Description', flex: 1.5, minWidth: 200 },
    {
      field: 'config',
      headerName: 'Config',
      flex: 1,
      minWidth: 150,
      renderCell: (params: GridRenderCellParams) => {
        const config = params.value;
        if (!config) return '';
        const parts: string[] = [];
        if (config.parameters && Object.keys(config.parameters).length > 0) parts.push('parameters');
        if (config.exitConditions?.length) parts.push(`${config.exitConditions.length} exit conditions`);
        if (config.bands?.length) parts.push(`${config.bands.length} bands`);
        if (config.cases) parts.push('cases');
        return parts.join(', ') || 'empty';
      },
    },
    { field: 'tenantId', headerName: 'Tenant ID', width: 130 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => {
        const record = params.row as RuleRecord;
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
          Rule Configuration
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateClick}
          sx={{ backgroundColor: '#10b981', '&:hover': { backgroundColor: '#059669' } }}
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
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {dialogMode === 'create' ? 'Create Rule' : dialogMode === 'edit' ? 'Edit Rule' : 'View Rule'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="ID"
              value={formData.id}
              onChange={(e) => setFormData({ ...formData, id: e.target.value })}
              disabled={isReadOnly || dialogMode === 'edit'}
              required
              fullWidth
              helperText={dialogMode === 'edit' ? 'ID cannot be changed' : undefined}
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
            <TextField
              label="Description"
              value={formData.desc}
              onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
              disabled={isReadOnly}
              fullWidth
            />
            <TextField
              label="Config (JSON)"
              value={formData.config}
              onChange={(e) => setFormData({ ...formData, config: e.target.value })}
              disabled={isReadOnly}
              fullWidth
              multiline
              rows={10}
              placeholder='{"parameters":{},"exitConditions":[],"bands":[]}'
              sx={{ '& .MuiInputBase-input': { fontFamily: 'monospace', fontSize: '0.85rem' } }}
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
            Are you sure you want to delete the rule{' '}
            <strong>{recordToDelete?.id}</strong> (cfg: {recordToDelete?.cfg})?
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

export default RulePage;
