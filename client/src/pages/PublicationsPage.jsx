import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Filter,
  FileText,
  Upload,
  CheckCircle,
  ExternalLink,
  Send,
  Trash2,
  Edit2,
  FileCheck,
} from 'lucide-react';
import { activitiesApi, uploadApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  Card,
  Button,
  Input,
  Select,
  Badge,
  Table,
  Drawer,
  EmptyState,
} from '../components/ui';

export const PublicationsPage = () => {
  const { user, role, selectedYear } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Drawer form state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingProof, setUploadingProof] = useState(false);
  const [editId, setEditId] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    type: 'Journal',
    venueName: '',
    indexing: 'Scopus',
    publishedDate: new Date().toISOString().split('T')[0],
    doi: '',
    issnIsbn: '',
    coAuthors: '',
    impactFactor: 0,
    citations: 0,
    proofUrl: '',
  });

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const res = await activitiesApi.list('publications', {
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
      console.error('Failed to load publications:', err);
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
        type: record.type || 'Journal',
        venueName: record.venueName || '',
        indexing: record.indexing || 'Scopus',
        publishedDate: record.publishedDate ? record.publishedDate.split('T')[0] : '',
        doi: record.doi || '',
        issnIsbn: record.issnIsbn || '',
        coAuthors: Array.isArray(record.coAuthors) ? record.coAuthors.join(', ') : '',
        impactFactor: record.impactFactor || 0,
        citations: record.citations || 0,
        proofUrl: record.proofUrl || '',
      });
    } else {
      setEditId(null);
      setFormData({
        title: '',
        type: 'Journal',
        venueName: '',
        indexing: 'Scopus',
        publishedDate: new Date().toISOString().split('T')[0],
        doi: '',
        issnIsbn: '',
        coAuthors: '',
        impactFactor: 0,
        citations: 0,
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
      alert(err.message || 'File upload failed. Only PDF/JPG/PNG max 5MB allowed.');
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
        coAuthors: formData.coAuthors
          ? formData.coAuthors.split(',').map((s) => s.trim()).filter(Boolean)
          : [],
      };

      if (editId) {
        await activitiesApi.update('publications', editId, payload);
      } else {
        await activitiesApi.create('publications', payload);
      }

      setIsDrawerOpen(false);
      fetchRecords();
    } catch (err) {
      alert(err.message || 'Error saving record');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitForApproval = async (id) => {
    if (!confirm('Submit this publication to the HoD for official accreditation verification?')) return;
    try {
      await activitiesApi.submit('publications', id);
      fetchRecords();
    } catch (err) {
      alert(err.message || 'Submission failed');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this draft publication?')) return;
    try {
      await activitiesApi.delete('publications', id);
      fetchRecords();
    } catch (err) {
      alert(err.message || 'Deletion failed');
    }
  };

  const columns = [
    {
      title: 'Publication Details',
      key: 'title',
      render: (row) => (
        <div className="max-w-md">
          <div className="font-bold text-[#1B2140] text-xs hover:text-[#5B6CFF] transition-colors">
            {row.title}
          </div>
          <div className="text-[11px] text-[#8A91AD] mt-0.5">
            {row.venueName} • {row.doi ? `DOI: ${row.doi}` : 'No DOI'}
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
      title: 'Category & Indexing',
      key: 'indexing',
      render: (row) => (
        <div className="space-y-1">
          <span className="text-xs font-semibold text-[#1B2140] block">{row.type}</span>
          <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EEF0FF] text-[#5B6CFF]">
            {row.indexing}
          </span>
        </div>
      ),
    },
    {
      title: 'Metrics',
      key: 'citations',
      render: (row) => (
        <div className="text-xs">
          <span className="text-[#4A5170]">IF: <strong>{row.impactFactor || 0}</strong></span>
          <span className="text-[#8A91AD] ml-2">Citations: <strong>{row.citations || 0}</strong></span>
        </div>
      ),
    },
    {
      title: 'Proof',
      key: 'proofUrl',
      render: (row) =>
        row.proofUrl ? (
          <a
            href={row.proofUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-[#5B6CFF] font-semibold hover:underline inline-flex items-center gap-1"
          >
            <FileCheck className="w-3.5 h-3.5" /> View Proof
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
                title="Submit for HoD Approval"
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
            <span className="text-[11px] text-[#8A91AD] italic">Locked</span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#1B2140] tracking-tight">
            Research & Publications
          </h2>
          <p className="text-xs text-[#8A91AD] mt-0.5">
            Journals, conference proceedings, books, and book chapters for NAAC Criteria 3.4
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={Plus}
          onClick={() => handleOpenDrawer()}
        >
          Add Publication
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card noPadding>
        <div className="p-4 flex flex-col md:flex-row items-center justify-between gap-4 border-b border-[#ECEEF7]">
          {/* Search Box */}
          <div className="w-full md:w-80">
            <Input
              icon={Search}
              placeholder="Search title, venue, or DOI..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>

          {/* Status Filter */}
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

        {/* Data Table */}
        <Table
          columns={columns}
          data={records}
          loading={loading}
          page={page}
          totalPages={totalPages}
          total={total}
          onPageChange={setPage}
          emptyMessage="No publications found matching your search or filters."
        />
      </Card>

      {/* Add / Edit Drawer */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={editId ? 'Edit Publication Record' : 'Record New Publication'}
        subtitle="Provide full citation metadata and proof document for accreditation audit."
      >
        <form onSubmit={handleSubmitForm} className="space-y-4">
          <Input
            label="Publication Title"
            placeholder="e.g. Federated Learning in Edge Computing..."
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Publication Type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            >
              <option value="Journal">Journal</option>
              <option value="Conference">Conference</option>
              <option value="Book Chapter">Book Chapter</option>
              <option value="Book">Book</option>
            </Select>

            <Select
              label="Indexing Category"
              value={formData.indexing}
              onChange={(e) => setFormData({ ...formData, indexing: e.target.value })}
            >
              <option value="Scopus">Scopus</option>
              <option value="SCI">SCI / SCIE</option>
              <option value="WoS">Web of Science</option>
              <option value="UGC">UGC-CARE</option>
              <option value="Other">Peer-Reviewed / Other</option>
            </Select>
          </div>

          <Input
            label="Venue / Journal / Publisher Name"
            placeholder="e.g. IEEE Transactions on Computers"
            value={formData.venueName}
            onChange={(e) => setFormData({ ...formData, venueName: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="DOI (Digital Object Identifier)"
              placeholder="e.g. 10.1109/TC.2025.10123"
              value={formData.doi}
              onChange={(e) => setFormData({ ...formData, doi: e.target.value })}
            />

            <Input
              label="ISSN / ISBN"
              placeholder="e.g. 1234-5678"
              value={formData.issnIsbn}
              onChange={(e) => setFormData({ ...formData, issnIsbn: e.target.value })}
            />
          </div>

          <Input
            label="Co-Authors (comma-separated)"
            placeholder="e.g. Dr. A. Raman, Prof. K. Sundar"
            value={formData.coAuthors}
            onChange={(e) => setFormData({ ...formData, coAuthors: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Impact Factor (Clarivate / JCR)"
              type="number"
              step="0.1"
              value={formData.impactFactor}
              onChange={(e) => setFormData({ ...formData, impactFactor: Number(e.target.value) })}
            />

            <Input
              label="Citations Count"
              type="number"
              value={formData.citations}
              onChange={(e) => setFormData({ ...formData, citations: Number(e.target.value) })}
            />
          </div>

          {/* Proof Upload */}
          <div className="pt-2">
            <label className="block text-xs font-semibold text-[#1B2140] mb-1.5">
              Proof Document (First Page / Indexing Certificate PDF or JPG)
            </label>
            <div className="border border-dashed border-[#ECEEF7] rounded-xl p-4 text-center bg-[#F7F8FC]">
              {formData.proofUrl ? (
                <div className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-[#ECEEF7]">
                  <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4" /> Proof Uploaded
                  </span>
                  <a
                    href={formData.proofUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-[#5B6CFF] underline"
                  >
                    Preview
                  </a>
                </div>
              ) : (
                <label className="cursor-pointer">
                  <Upload className="w-6 h-6 text-[#5B6CFF] mx-auto mb-1" />
                  <span className="text-xs font-semibold text-[#5B6CFF] hover:underline">
                    {uploadingProof ? 'Uploading file...' : 'Choose Proof File (Max 5MB)'}
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

          {/* Form action buttons */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#ECEEF7]">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDrawerOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={submitting}
            >
              {editId ? 'Save Changes' : 'Save as Draft'}
            </Button>
          </div>
        </form>
      </Drawer>
    </div>
  );
};
