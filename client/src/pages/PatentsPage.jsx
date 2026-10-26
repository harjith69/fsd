import React, { useState, useEffect } from 'react';
import { Plus, Search, Lightbulb, Send, Trash2, Edit2, Upload, CheckCircle, FileCheck } from 'lucide-react';
import { activitiesApi, uploadApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Card, Button, Input, Select, Badge, Table, Drawer } from '../components/ui';

export const PatentsPage = () => {
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
    applicationNumber: '',
    type: 'Filed',
    filingDate: new Date().toISOString().split('T')[0],
    grantDate: '',
    coInventors: '',
    country: 'India',
    proofUrl: '',
  });

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const res = await activitiesApi.list('patents', {
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
      console.error('Failed to load patents:', err);
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
        applicationNumber: record.applicationNumber || '',
        type: record.type || 'Filed',
        filingDate: record.filingDate ? record.filingDate.split('T')[0] : '',
        grantDate: record.grantDate ? record.grantDate.split('T')[0] : '',
        coInventors: Array.isArray(record.coInventors) ? record.coInventors.join(', ') : '',
        country: record.country || 'India',
        proofUrl: record.proofUrl || '',
      });
    } else {
      setEditId(null);
      setFormData({
        title: '',
        applicationNumber: '',
        type: 'Filed',
        filingDate: new Date().toISOString().split('T')[0],
        grantDate: '',
        coInventors: '',
        country: 'India',
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
      const payload = {
        ...formData,
        academicYear: selectedYear?._id,
        coInventors: formData.coInventors
          ? formData.coInventors.split(',').map((s) => s.trim()).filter(Boolean)
          : [],
        grantDate: formData.grantDate ? formData.grantDate : null,
      };

      if (editId) {
        await activitiesApi.update('patents', editId, payload);
      } else {
        await activitiesApi.create('patents', payload);
      }
      setIsDrawerOpen(false);
      fetchRecords();
    } catch (err) {
      alert(err.message || 'Error saving patent');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitForApproval = async (id) => {
    if (!confirm('Submit patent entry for accreditation approval?')) return;
    try {
      await activitiesApi.submit('patents', id);
      fetchRecords();
    } catch (err) {
      alert(err.message || 'Submission failed');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this draft patent?')) return;
    try {
      await activitiesApi.delete('patents', id);
      fetchRecords();
    } catch (err) {
      alert(err.message || 'Deletion failed');
    }
  };

  const columns = [
    {
      title: 'Patent Title',
      key: 'title',
      render: (row) => (
        <div>
          <span className="font-bold text-[#1B2140] text-xs">{row.title}</span>
          <div className="text-[11px] text-[#8A91AD] mt-0.5">
            App No: <strong>{row.applicationNumber}</strong> • {row.country}
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
      title: 'Stage & Dates',
      key: 'type',
      render: (row) => (
        <div className="space-y-1">
          <Badge variant={row.type === 'Granted' ? 'approved' : row.type === 'Published' ? 'sky' : 'default'}>
            {row.type}
          </Badge>
          <span className="text-[11px] text-[#8A91AD] block font-medium">
            Filed: {new Date(row.filingDate).toLocaleDateString()}
            {row.grantDate ? ` • Granted: ${new Date(row.grantDate).toLocaleDateString()}` : ''}
          </span>
        </div>
      ),
    },
    {
      title: 'Gazette Proof',
      key: 'proofUrl',
      render: (row) =>
        row.proofUrl ? (
          <a
            href={row.proofUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-[#5B6CFF] font-semibold hover:underline inline-flex items-center gap-1"
          >
            <FileCheck className="w-3.5 h-3.5" /> Gazette Copy
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
                title="Submit for HoD Verification"
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
            Patents & Intellectual Property
          </h2>
          <p className="text-xs text-[#8A91AD] mt-0.5">
            Filed, published, and granted patents under NAAC Criteria 3.4 & NBA Tier-1 metrics
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={Plus}
          onClick={() => handleOpenDrawer()}
        >
          Add Patent Record
        </Button>
      </div>

      <Card noPadding>
        <div className="p-4 flex flex-col md:flex-row items-center justify-between gap-4 border-b border-[#ECEEF7]">
          <div className="w-full md:w-80">
            <Input
              icon={Search}
              placeholder="Search patent title or app number..."
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
          emptyMessage="No patent records found."
        />
      </Card>

      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={editId ? 'Edit Patent' : 'Record New Patent'}
        subtitle="Provide patent gazette registration details and verification copy."
      >
        <form onSubmit={handleSubmitForm} className="space-y-4">
          <Input
            label="Patent Title"
            placeholder="e.g. An IoT-Based Non-Invasive Continuous Glucose Monitor"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Application / Grant Number"
              placeholder="e.g. 202441018921 A"
              value={formData.applicationNumber}
              onChange={(e) => setFormData({ ...formData, applicationNumber: e.target.value })}
              required
            />

            <Select
              label="Patent Stage"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            >
              <option value="Filed">Filed / Application Submitted</option>
              <option value="Published">Published in Gazette</option>
              <option value="Granted">Granted / Awarded</option>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Filing Date"
              type="date"
              value={formData.filingDate}
              onChange={(e) => setFormData({ ...formData, filingDate: e.target.value })}
              required
            />

            <Input
              label="Grant Date (if granted)"
              type="date"
              value={formData.grantDate}
              onChange={(e) => setFormData({ ...formData, grantDate: e.target.value })}
            />
          </div>

          <Input
            label="Co-Inventors (comma-separated)"
            placeholder="e.g. Dr. Rajesh Ramanathan, Prof. A. Sen"
            value={formData.coInventors}
            onChange={(e) => setFormData({ ...formData, coInventors: e.target.value })}
          />

          <Input
            label="Country Jurisdiction"
            value={formData.country}
            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
          />

          <div className="pt-2">
            <label className="block text-xs font-semibold text-[#1B2140] mb-1.5">
              Patent Gazette Notification / Certificate (PDF / Image)
            </label>
            <div className="border border-dashed border-[#ECEEF7] rounded-xl p-4 text-center bg-[#F7F8FC]">
              {formData.proofUrl ? (
                <div className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-[#ECEEF7]">
                  <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4" /> Gazette Proof Uploaded
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
                    {uploadingProof ? 'Uploading file...' : 'Upload Gazette Proof (Max 5MB)'}
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
