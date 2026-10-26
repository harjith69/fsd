import React, { useState, useEffect } from 'react';
import { Plus, Search, BookOpen, Send, Trash2, Edit2 } from 'lucide-react';
import { activitiesApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Card, Button, Input, Select, Badge, Table, Drawer } from '../components/ui';

export const TeachingPage = () => {
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
  const [editId, setEditId] = useState(null);

  const [formData, setFormData] = useState({
    courseCode: '',
    courseName: '',
    program: 'B.Tech CSE',
    semester: 'Odd',
    type: 'Theory',
    hoursPerWeek: 3,
    totalHoursDelivered: 45,
    studentsCount: 60,
    passPercentage: 90,
    feedbackScore: 4.5,
  });

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const res = await activitiesApi.list('teaching', {
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
      console.error('Failed to load teaching records:', err);
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
        courseCode: record.courseCode || '',
        courseName: record.courseName || '',
        program: record.program || 'B.Tech CSE',
        semester: record.semester || 'Odd',
        type: record.type || 'Theory',
        hoursPerWeek: record.hoursPerWeek || 3,
        totalHoursDelivered: record.totalHoursDelivered || 45,
        studentsCount: record.studentsCount || 60,
        passPercentage: record.passPercentage || 90,
        feedbackScore: record.feedbackScore || 4.5,
      });
    } else {
      setEditId(null);
      setFormData({
        courseCode: '',
        courseName: '',
        program: 'B.Tech CSE',
        semester: 'Odd',
        type: 'Theory',
        hoursPerWeek: 3,
        totalHoursDelivered: 45,
        studentsCount: 60,
        passPercentage: 90,
        feedbackScore: 4.5,
      });
    }
    setIsDrawerOpen(true);
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const payload = { ...formData, academicYear: selectedYear?._id };
      if (editId) {
        await activitiesApi.update('teaching', editId, payload);
      } else {
        await activitiesApi.create('teaching', payload);
      }
      setIsDrawerOpen(false);
      fetchRecords();
    } catch (err) {
      alert(err.message || 'Error saving teaching workload');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitForApproval = async (id) => {
    if (!confirm('Submit this teaching record to HoD for verification?')) return;
    try {
      await activitiesApi.submit('teaching', id);
      fetchRecords();
    } catch (err) {
      alert(err.message || 'Submission failed');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this draft record?')) return;
    try {
      await activitiesApi.delete('teaching', id);
      fetchRecords();
    } catch (err) {
      alert(err.message || 'Deletion failed');
    }
  };

  const columns = [
    {
      title: 'Course',
      key: 'courseCode',
      render: (row) => (
        <div>
          <span className="font-bold text-[#1B2140] text-xs">
            [{row.courseCode}] {row.courseName}
          </span>
          <div className="text-[11px] text-[#8A91AD] mt-0.5">
            {row.program} • {row.semester} Sem
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
      title: 'Type & Hours',
      key: 'type',
      render: (row) => (
        <div className="text-xs">
          <Badge variant="sky">{row.type}</Badge>
          <div className="text-[11px] text-[#4A5170] mt-1 font-semibold">
            {row.totalHoursDelivered} hrs delivered ({row.hoursPerWeek} hrs/wk)
          </div>
        </div>
      ),
    },
    {
      title: 'Performance & Feedback',
      key: 'passPercentage',
      render: (row) => (
        <div className="text-xs space-y-0.5">
          <div className="text-[#4A5170]">
            Pass Rate: <strong>{row.passPercentage}%</strong> ({row.studentsCount} students)
          </div>
          <div className="text-[#5B6CFF] font-semibold">
            Student Feedback: <strong>{row.feedbackScore} / 5.0</strong>
          </div>
        </div>
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
            Teaching Workload & Delivery
          </h2>
          <p className="text-xs text-[#8A91AD] mt-0.5">
            Theory, laboratories, and student feedback compliance under NAAC Criterion 2.2
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={Plus}
          onClick={() => handleOpenDrawer()}
        >
          Add Course Workload
        </Button>
      </div>

      <Card noPadding>
        <div className="p-4 flex flex-col md:flex-row items-center justify-between gap-4 border-b border-[#ECEEF7]">
          <div className="w-full md:w-80">
            <Input
              icon={Search}
              placeholder="Search course code or name..."
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
          emptyMessage="No teaching records found for this academic period."
        />
      </Card>

      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={editId ? 'Edit Teaching Workload' : 'Record Teaching Delivery'}
        subtitle="Enter syllabus details, delivered contact hours, and outcomes."
      >
        <form onSubmit={handleSubmitForm} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Course Code"
              placeholder="e.g. CS301"
              value={formData.courseCode}
              onChange={(e) => setFormData({ ...formData, courseCode: e.target.value })}
              required
            />
            <Input
              label="Program"
              placeholder="e.g. B.Tech CSE"
              value={formData.program}
              onChange={(e) => setFormData({ ...formData, program: e.target.value })}
              required
            />
          </div>

          <Input
            label="Course Name"
            placeholder="e.g. Design and Analysis of Algorithms"
            value={formData.courseName}
            onChange={(e) => setFormData({ ...formData, courseName: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Semester"
              value={formData.semester}
              onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
            >
              <option value="Odd">Odd Semester</option>
              <option value="Even">Even Semester</option>
              <option value="Summer">Summer Term</option>
            </Select>

            <Select
              label="Instruction Type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            >
              <option value="Theory">Theory</option>
              <option value="Lab">Laboratory</option>
              <option value="Tutorial">Tutorial</option>
              <option value="Project">Project / Capstone</option>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Hours Per Week"
              type="number"
              value={formData.hoursPerWeek}
              onChange={(e) => setFormData({ ...formData, hoursPerWeek: Number(e.target.value) })}
              required
            />
            <Input
              label="Total Hours Delivered"
              type="number"
              value={formData.totalHoursDelivered}
              onChange={(e) => setFormData({ ...formData, totalHoursDelivered: Number(e.target.value) })}
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Enrolled Students"
              type="number"
              value={formData.studentsCount}
              onChange={(e) => setFormData({ ...formData, studentsCount: Number(e.target.value) })}
            />
            <Input
              label="Pass %"
              type="number"
              min="0"
              max="100"
              value={formData.passPercentage}
              onChange={(e) => setFormData({ ...formData, passPercentage: Number(e.target.value) })}
            />
            <Input
              label="Feedback (0-5)"
              type="number"
              step="0.1"
              min="0"
              max="5"
              value={formData.feedbackScore}
              onChange={(e) => setFormData({ ...formData, feedbackScore: Number(e.target.value) })}
            />
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
