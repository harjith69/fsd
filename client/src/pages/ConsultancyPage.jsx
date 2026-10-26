import React, { useState, useEffect } from 'react';
import { Plus, Search, Briefcase, Send, Trash2, Edit2, Upload, CheckCircle, FileCheck } from 'lucide-react';
import { activitiesApi, uploadApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Card, Button, Input, Select, Badge, Table, Drawer } from '../components/ui';

export const ConsultancyPage = () => {
  const { selectedYear } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingProof, setUploadingProof] = useState(false);
  const [editId, setEditId] = useState(null);

  const [formData, setFormData] = useState({
    projectTitle: '',
    clientOrganization: '',
    role: 'PI',
    amountEarned: 100000,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 180 * 86400000).toISOString().split('T')[0],
    projectStatus: 'Ongoing',
    proofUrl: '',
  });

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const res = await activitiesApi.list('consultancy', {
        academicYear: selectedYear?._id,
        search,
        status: statusFilter,
        page,
        limit: 10,
      });
      if (res.data.success) {
        setRecords(res.data.records);
        setTotalPages(res.data.totalPages || 1);
        setTotal(res.data.total || 0);
      }
    } catch (err) {
      console.error('Failed to load consultancy:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [selectedYear?._id, search, statusFilter, page]);

  const handleOpenDrawer = (record = null) => {
    if (record) {
      setEditId(record._id);
      setFormData({
        projectTitle: record.projectTitle || '',
        clientOrganization: record.clientOrganization || '',
        role: record.role || 'PI',
        amountEarned: record.amountEarned || 0,
        startDate: record.startDate ? record.startDate.split('T')[0] : '',
        endDate: record.endDate ? record.endDate.split('T')[0] : '',
        projectStatus: record.projectStatus || 'Ongoing',
        proofUrl: record.proofUrl || '',
      });
    } else {
      setEditId(null);
      setFormData({
        projectTitle: '',
        clientOrganization: '',
        role: 'PI',
        amountEarned: 100000,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 180 * 86400000).toISOString().split('T')[0],
        projectStatus: 'Ongoing',
        proofUrl: '',
      });
    }
    setIsDrawerOpen(true);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploadingProof(true);
      const res = await uploadApi.uploadProof(file);
      if (res.data.success) {
        setFormData((prev) => ({ ...prev, proofUrl: res.data.fileUrl }));
      }
    } catch (err) {
      alert(err.message || 'File upload failed');
    } finally {
      setUploadingProof(false);
    }
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const payload = { ...formData, academicYear: selectedYear?._id };
      if (editId) {
        await activitiesApi.update('consultancy', editId, payload);
      } else {
        await activitiesApi.create('consultancy', payload);
      }
      setIsDrawerOpen(false);
      fetchRecords();
    } catch (err) {
      alert(err.message || 'Error saving consultancy project');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitForApproval = async (id) => {
    if (!confirm('Submit consultancy details for HoD verification?')) return;
    try {
      await activitiesApi.submit('consultancy', id);
      fetchRecords();
    } catch (err) {
      alert(err.message || 'Submission failed');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this draft project?')) return;
    try {
      await activitiesApi.delete('consultancy', id);
      fetchRecords();
    } catch (err) {
      alert(err.message || 'Deletion failed');
    }
  };

  const columns = [
    {
      title: 'Consultancy Project',
      key: 'projectTitle',
      render: (row) => (
        <div>
          <span className="font-bold text-[#1B2140] text-xs">{row.projectTitle}</span>
          <div className="text-[11px] text-[#8A91AD] mt-0.5">
            Client: <strong>{row.clientOrganization}</strong>
          </div>
          {row.remarks && (
            <div className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded mt-1 max-w-fit">
              Remarks: {row.remarks}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Role & Status',
      key: 'role',
      render: (row) => (
        <div className="space-y-1">
          <Badge variant={row.role === 'PI' ? 'primary' : 'sky'}>{row.role}</Badge>
          <span className="text-[11px] text-[#8A91AD] block font-medium">
            Project: {row.projectStatus}
          </span>
        </div>
      ),
    },
    {
      title: 'Sanctioned Amount',
      key: 'amountEarned',
      render: (row) => (
        <div className="text-xs font-bold text-[#1B2140]">
          ₹{(row.amountEarned || 0).toLocaleString()}
        </div>
      ),
    },
    {
      title: 'Sanction Letter',
      key: 'proofUrl',
      render: (row) =>
        row.proofUrl ? (
          <a
            href={row.proofUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-[#5B6CFF] font-semibold hover:underline inline-flex items-center gap-1"
          >
            <FileCheck className="w-3.5 h-3.5" /> Sanction Letter
          </a>
        ) : (
          <span className="text-xs text-[#8A91AD]">None</span>
        ),
    },
    {
      title: 'Status',
      key: 'status',
      render: (row) => <Badge variant={row.status}>{row.status}</Badge>,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          {row.status === 'Draft' || row.status === 'Rejected' ? (
            <>
              <button
                onClick={() => handleSubmitForApproval(row._id)}
                title="Submit for Approval"
                className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleOpenDrawer(row)}
                title="Edit Record"
                className="p-1.5 rounded-lg text-[#5B6CFF] hover:bg-[#EEF0FF] transition-colors"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              {row.status === 'Draft' && (
                <button
                  onClick={() => handleDelete(row._id)}
                  title="Delete Draft"
                  className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </>
          ) : (
            <span className="text-[11px] text-[#8A91AD] italic">Verified</span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#1B2140] tracking-tight">
            Consultancy & Industry Projects
          </h2>
          <p className="text-xs text-[#8A91AD] mt-0.5">
            Industry collaboration, testing, and revenue generation under NAAC Criteria 3.5
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={Plus}
          onClick={() => handleOpenDrawer()}
        >
          Add Consultancy
        </Button>
      </div>

      <Card noPadding>
        <div className="p-4 flex flex-col md:flex-row items-center justify-between gap-4 border-b border-[#ECEEF7]">
          <div className="w-full md:w-80">
            <Input
              icon={Search}
              placeholder="Search title or client..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <Select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-40"
            >
              <option value="">All Statuses</option>
              <option value="Approved">Approved</option>
              <option value="Submitted">Submitted</option>
              <option value="Draft">Draft</option>
              <option value="Rejected">Rejected</option>
            </Select>
          </div>
        </div>

        <Table
          columns={columns}
          data={records}
          loading={loading}
          page={page}
          totalPages={totalPages}
          total={total}
          onPageChange={setPage}
          emptyMessage="No consultancy projects recorded."
        />
      </Card>

      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={editId ? 'Edit Consultancy Project' : 'Record Consultancy / Testing Project'}
        subtitle="Upload institutional sanction copy or client agreement for audit proof."
      >
        <form onSubmit={handleSubmitForm} className="space-y-4">
          <Input
            label="Project Title"
            placeholder="e.g. Smart Automated Quality Inspection..."
            value={formData.projectTitle}
            onChange={(e) => setFormData({ ...formData, projectTitle: e.target.value })}
            required
          />

          <Input
            label="Client Organization / Company"
            placeholder="e.g. TVS Motor Company Ltd."
            value={formData.clientOrganization}
            onChange={(e) => setFormData({ ...formData, clientOrganization: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Investigator Role"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            >
              <option value="PI">Principal Investigator (PI)</option>
              <option value="Co-PI">Co-Principal Investigator (Co-PI)</option>
            </Select>

            <Select
              label="Project Status"
              value={formData.projectStatus}
              onChange={(e) => setFormData({ ...formData, projectStatus: e.target.value })}
            >
              <option value="Ongoing">Ongoing</option>
              <option value="Completed">Completed</option>
            </Select>
          </div>

          <Input
            label="Sanctioned Amount Earned (₹ INR)"
            type="number"
            min="0"
            value={formData.amountEarned}
            onChange={(e) => setFormData({ ...formData, amountEarned: Number(e.target.value) })}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Date"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              required
            />
            <Input
              label="End Date"
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              required
            />
          </div>

          <div className="pt-2">
            <label className="block text-xs font-semibold text-[#1B2140] mb-1.5">
              Sanction Letter / Client MoU Proof (PDF / Image)
            </label>
            <div className="border border-dashed border-[#ECEEF7] rounded-xl p-4 text-center bg-[#F7F8FC]">
              {formData.proofUrl ? (
                <div className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-[#ECEEF7]">
                  <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4" /> Sanction Document Uploaded
                  </span>
                  <a
                    href={formData.proofUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-[#5B6CFF] underline"
                  >
                    View
                  </a>
                </div>
              ) : (
                <label className="cursor-pointer">
                  <Upload className="w-6 h-6 text-[#5B6CFF] mx-auto mb-1" />
                  <span className="text-xs font-semibold text-[#5B6CFF] hover:underline">
                    {uploadingProof ? 'Uploading file...' : 'Upload Proof (Max 5MB)'}
                  </span>
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    className="hidden"
                    onChange={handleFileUpload}
                    disabled={uploadingProof}
                  />
                </label>
              )}
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#ECEEF7]">
            <Button variant="outline" size="sm" onClick={() => setIsDrawerOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={submitting}>
              {editId ? 'Save Changes' : 'Save as Draft'}
            </Button>
          </div>
        </form>
      </Drawer>
    </div>
  );
};
