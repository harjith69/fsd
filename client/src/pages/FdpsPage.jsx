import React, { useState, useEffect } from 'react';
import { Plus, Search, Award, Send, Trash2, Edit2, Upload, CheckCircle, FileCheck } from 'lucide-react';
import { activitiesApi, uploadApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Card, Button, Input, Select, Badge, Table, Drawer } from '../components/ui';

export const FdpsPage = () => {
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
    title: '',
    role: 'Attended',
    organizer: '',
    mode: 'Offline',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
    durationDays: 5,
    certificateUrl: '',
  });

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const res = await activitiesApi.list('fdps', {
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
      console.error('Failed to load FDPs:', err);
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
        title: record.title || '',
        role: record.role || 'Attended',
        organizer: record.organizer || '',
        mode: record.mode || 'Offline',
        startDate: record.startDate ? record.startDate.split('T')[0] : '',
        endDate: record.endDate ? record.endDate.split('T')[0] : '',
        durationDays: record.durationDays || 5,
        certificateUrl: record.certificateUrl || '',
      });
    } else {
      setEditId(null);
      setFormData({
        title: '',
        role: 'Attended',
        organizer: '',
        mode: 'Offline',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
        durationDays: 5,
        certificateUrl: '',
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
        setFormData((prev) => ({ ...prev, certificateUrl: res.data.fileUrl }));
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
        await activitiesApi.update('fdps', editId, payload);
      } else {
        await activitiesApi.create('fdps', payload);
      }
      setIsDrawerOpen(false);
      fetchRecords();
    } catch (err) {
      alert(err.message || 'Error saving FDP');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitForApproval = async (id) => {
    if (!confirm('Submit this FDP record to HoD for approval?')) return;
    try {
      await activitiesApi.submit('fdps', id);
      fetchRecords();
    } catch (err) {
      alert(err.message || 'Submission failed');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this draft FDP?')) return;
    try {
      await activitiesApi.delete('fdps', id);
      fetchRecords();
    } catch (err) {
      alert(err.message || 'Deletion failed');
    }
  };

  const columns = [
    {
      title: 'Program Title',
      key: 'title',
      render: (row) => (
        <div>
          <span className="font-bold text-[#1B2140] text-xs">{row.title}</span>
          <div className="text-[11px] text-[#8A91AD] mt-0.5">
            Organized by: {row.organizer}
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
      title: 'Role & Mode',
      key: 'role',
      render: (row) => (
        <div className="space-y-1">
          <Badge variant={row.role === 'Organized' ? 'primary' : row.role === 'Resource Person' ? 'mint' : 'default'}>
            {row.role}
          </Badge>
          <span className="text-[11px] text-[#8A91AD] block font-medium">
            {row.mode} • {row.durationDays} Days
          </span>
        </div>
      ),
    },
    {
      title: 'Certificate',
      key: 'certificateUrl',
      render: (row) =>
        row.certificateUrl ? (
          <a
            href={row.certificateUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-[#5B6CFF] font-semibold hover:underline inline-flex items-center gap-1"
          >
            <FileCheck className="w-3.5 h-3.5" /> Certificate
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
            FDPs & Professional Development
          </h2>
          <p className="text-xs text-[#8A91AD] mt-0.5">
            Faculty Development Programmes, workshops, and STTPs for NAAC Criteria 6.3
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={Plus}
          onClick={() => handleOpenDrawer()}
        >
          Add FDP Record
        </Button>
      </div>

      <Card noPadding>
        <div className="p-4 flex flex-col md:flex-row items-center justify-between gap-4 border-b border-[#ECEEF7]">
          <div className="w-full md:w-80">
            <Input
              icon={Search}
              placeholder="Search title or organizer..."
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
          emptyMessage="No FDP records found."
        />
      </Card>

      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={editId ? 'Edit FDP Record' : 'Record FDP Participation / Organization'}
        subtitle="Upload participation certificate for accreditation verification."
      >
        <form onSubmit={handleSubmitForm} className="space-y-4">
          <Input
            label="Program Title"
            placeholder="e.g. AICTE ATAL FDP on Quantum Machine Learning"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Role"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            >
              <option value="Attended">Attended</option>
              <option value="Organized">Organized (Coordinator)</option>
              <option value="Resource Person">Resource Person / Speaker</option>
            </Select>

            <Select
              label="Mode"
              value={formData.mode}
              onChange={(e) => setFormData({ ...formData, mode: e.target.value })}
            >
              <option value="Offline">Offline / In-person</option>
              <option value="Online">Online / Hybrid</option>
            </Select>
          </div>

          <Input
            label="Host Institution / Organizing Body"
            placeholder="e.g. IIT Madras / IEEE"
            value={formData.organizer}
            onChange={(e) => setFormData({ ...formData, organizer: e.target.value })}
            required
          />

          <div className="grid grid-cols-3 gap-3">
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
            <Input
              label="Days"
              type="number"
              min="1"
              value={formData.durationDays}
              onChange={(e) => setFormData({ ...formData, durationDays: Number(e.target.value) })}
              required
            />
          </div>

          <div className="pt-2">
            <label className="block text-xs font-semibold text-[#1B2140] mb-1.5">
              Certificate / Participation Proof (PDF / Image)
            </label>
            <div className="border border-dashed border-[#ECEEF7] rounded-xl p-4 text-center bg-[#F7F8FC]">
              {formData.certificateUrl ? (
                <div className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-[#ECEEF7]">
                  <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4" /> Certificate Uploaded
                  </span>
                  <a
                    href={formData.certificateUrl}
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
                    {uploadingProof ? 'Uploading file...' : 'Upload Certificate (Max 5MB)'}
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
