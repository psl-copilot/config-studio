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

interface TypologyRecord {
  id: string;
  cfg: string;
  desc?: string;
  rules?: Array<{ id: string; cfg: string; wghts: unknown[]; termId: string }>;
  expression?: unknown[];
  workflow?: {
    alertThreshold: number;
    interdictionThreshold?: number;
    flowProcessor?: string;
  };
  tenantId?: string;
  typology_name?: string;
  __rowId?: string;
}

const PAGE_LIMIT = 20;

const TypologyPage: React.FC = () => {
  const { showSuccess, showError } = useToast();
  const [records, setRecords] = useState<TypologyRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);

  // Dialog state
  const [dialogMode, setDialogMode] = useState<'create' | 'edit' | 'view'>('create');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<TypologyRecord | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<TypologyRecord | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Form fields — complex fields (rules, expression, workflow) as JSON
  const [formData, setFormData] = useState({
    id: '',
    cfg: '',
    desc: '',
    rules: '[]',
    expression: '[]',
    workflow: '{}',
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await configApi.list<TypologyRecord>('typology', {
        limit: PAGE_LIMIT,
        offset: page * PAGE_LIMIT,
      });
      setRecords(result.data.map((r, idx) => ({ ...r, __rowId: `${r.id}-${r.cfg}` || `row-${idx}` })));
      setTotalRecords(result.meta.total);
    } catch (err) {
      showError('Failed to load typologies', err instanceof Error ? err.message : undefined);
    } finally {
      setLoading(false);
    }
  }, [page, showError]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreateClick = () => {
    setDialogMode('create');
    setFormData({ id: '', cfg: '', desc: '', rules: '[]', expression: '[]', workflow: '{}' });
    setDialogOpen(true);
  };

  const handleEditClick = (record: TypologyRecord) => {
    setDialogMode('edit');
    setSelectedRecord(record);
    setFormData({
      id: record.id,
      cfg: record.cfg,
      desc: record.desc ?? '',
      rules: JSON.stringify(record.rules ?? [], null, 2),
      expression: JSON.stringify(record.expression ?? [], null, 2),
      workflow: JSON.stringify(record.workflow ?? {}, null, 2),
    });
    setDialogOpen(true);
  };

  const handleViewClick = (record: TypologyRecord) => {
    setDialogMode('view');
    setSelectedRecord(record);
    setFormData({
      id: record.id,
      cfg: record.cfg,
      desc: record.desc ?? '',
      rules: JSON.stringify(record.rules ?? [], null, 2),
      expression: JSON.stringify(record.expression ?? [], null, 2),
      workflow: JSON.stringify(record.workflow ?? {}, null, 2),
    });
    setDialogOpen(true);
  };

  const handleDeleteClick = (record: TypologyRecord) => {
    setRecordToDelete(record);
    setDeleteDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.id.trim()) {
      showError('Validation error', 'ID is required');
      return;
    }
    if (!formData.cfg.trim()) {
      showError('Validation error', 'Config Version is required');
      return;
    }
    let parsedRules: unknown = [];
    let parsedExpression: unknown = [];
    let parsedWorkflow: unknown = {};
    try {
      parsedRules = JSON.parse(formData.rules || '[]');
      parsedExpression = JSON.parse(formData.expression || '[]');
      parsedWorkflow = JSON.parse(formData.workflow || '{}');
    } catch {
      showError('Validation error', 'Rules, Expression, and Workflow must be valid JSON');
      return;
    }
    setActionLoading(true);
    try {
      const payload = {
        id: formData.id,
        cfg: formData.cfg,
        desc: formData.desc,
        rules: parsedRules,
        expression: parsedExpression,
        workflow: parsedWorkflow,
      };
      if (dialogMode === 'create') {
        await configApi.create('typology', payload);
        showSuccess('Typology created successfully');
      } else if (dialogMode === 'edit' && selectedRecord) {
        await configApi.update('typology', selectedRecord.id, selectedRecord.cfg, payload);
        showSuccess('Typology updated successfully');
      }
      setDialogOpen(false);
      fetchData();
    } catch (err) {
      showError('Failed to save typology', err instanceof Error ? err.message : undefined);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!recordToDelete) return;
    setActionLoading(true);
    try {
      await configApi.delete('typology', recordToDelete.id, recordToDelete.cfg);
      showSuccess('Typology deleted successfully');
      setDeleteDialogOpen(false);
      setRecordToDelete(null);
      fetchData();
    } catch (err) {
      showError('Failed to delete typology', err instanceof Error ? err.message : undefined);
    } finally {
      setActionLoading(false);
    }
  };

  const isReadOnly = dialogMode === 'view';

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', flex: 1, minWidth: 180 },
    { field: 'cfg', headerName: 'Config Version', width: 140 },
    { field: 'typology_name', headerName: 'Typology Name', flex: 1.2, minWidth: 200 },
    { field: 'desc', headerName: 'Description', flex: 1, minWidth: 150 },
    {
      field: 'rules',
      headerName: 'Rules',
      width: 100,
      renderCell: (params: GridRenderCellParams) => {
        const rules = params.value;
        return Array.isArray(rules) ? `${rules.length} rule(s)` : '';
      },
    },
    {
      field: 'workflow',
      headerName: 'Alert Threshold',
      width: 130,
      renderCell: (params: GridRenderCellParams) => {
        const wf = params.value;
        return wf?.alertThreshold != null ? String(wf.alertThreshold) : '';
      },
    },
    { field: 'tenantId', headerName: 'Tenant ID', width: 120 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => {
        const record = params.row as TypologyRecord;
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
          Typology Configuration
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateClick}
          sx={{ backgroundColor: '#f59e0b', '&:hover': { backgroundColor: '#d97706' } }}
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
          {dialogMode === 'create' ? 'Create Typology' : dialogMode === 'edit' ? 'Edit Typology' : 'View Typology'}
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
              label="Rules (JSON array)"
              value={formData.rules}
              onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
              disabled={isReadOnly}
              fullWidth
              multiline
              rows={6}
              sx={{ '& .MuiInputBase-input': { fontFamily: 'monospace', fontSize: '0.85rem' } }}
            />
            <TextField
              label="Expression (JSON array)"
              value={formData.expression}
              onChange={(e) => setFormData({ ...formData, expression: e.target.value })}
              disabled={isReadOnly}
              fullWidth
              multiline
              rows={3}
              sx={{ '& .MuiInputBase-input': { fontFamily: 'monospace', fontSize: '0.85rem' } }}
            />
            <TextField
              label="Workflow (JSON object)"
              value={formData.workflow}
              onChange={(e) => setFormData({ ...formData, workflow: e.target.value })}
              disabled={isReadOnly}
              fullWidth
              multiline
              rows={4}
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
            Are you sure you want to delete the typology{' '}
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

export default TypologyPage;
