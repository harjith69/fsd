import React, { useState, useEffect } from 'react';
import {
  Users,
  Award,
  FileText,
  Briefcase,
  CheckCircle2,
  XCircle,
  Clock,
  CheckSquare,
  Search,
  ExternalLink,
  Download,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { analyticsApi, activitiesApi } from '../api/client';
import { Card, StatCard, Badge, Button, Table, Modal, Input, Skeleton } from '../components/ui';

export const HodDashboard = () => {
  const { user, selectedYear } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  // Approval queue items across modules
  const [approvalQueue, setApprovalQueue] = useState([]);
  const [queueLoading, setQueueLoading] = useState(true);

  // Modal for Approve/Reject remarks
  const [activeAction, setActiveAction] = useState(null); // { type: 'approve' | 'reject', item }
  const [remarks, setRemarks] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDepartmentData = async () => {
    if (!user?.department) return;
    const deptId = user.department._id || user.department;
    try {
      setLoading(true);
      const res = await analyticsApi.getDepartment(deptId, selectedYear?._id);
      if (res.data.success) {
        setAnalytics(res.data);
      }
    } catch (err) {
      console.error('Failed to load department analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingQueue = async () => {
    try {
      setQueueLoading(true);
      const modules = ['publications', 'teaching', 'fdps', 'consultancy', 'patents'];
      const requests = modules.map((m) =>
        activitiesApi.list(m, {
          status: 'Submitted',
          academicYear: selectedYear?._id,
          limit: 25,
        })
      );
      const responses = await Promise.allSettled(requests);
      const allItems = [];

      responses.forEach((res, index) => {
        if (res.status === 'fulfilled' && res.value.data.success) {
          const modName = modules[index];
          res.value.data.records.forEach((rec) => {
            allItems.push({ ...rec, module: modName });
          });
        }
      });

      // Sort newest first
      allItems.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      setApprovalQueue(allItems);
    } catch (err) {
      console.error('Error fetching approval queue:', err);
    } finally {
      setQueueLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartmentData();
    fetchPendingQueue();
  }, [user?.department, selectedYear?._id]);

  const handleOpenActionModal = (type, item) => {
    setActiveAction({ type, item });
    setRemarks(type === 'approve' ? 'Approved for accreditation record.' : 'Clarification needed on uploaded document.');
  };

  const handleExecuteAction = async () => {
    if (!activeAction) return;
    const { type, item } = activeAction;

    try {
      setActionLoading(true);
      if (type === 'approve') {
        await activitiesApi.approve(item.module, item._id, remarks);
      } else {
        await activitiesApi.reject(item.module, item._id, remarks);
      }

      setActiveAction(null);
      // Refresh department metrics & queue
      fetchPendingQueue();
      fetchDepartmentData();
    } catch (err) {
      alert(err.message || 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton variant="rectangular" height="100px" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} variant="rectangular" height="110px" />
          ))}
        </div>
      </div>
    );
  }

  const kpis = analytics?.kpis || {};
  const leaderboard = analytics?.leaderboard || [];

  return (
    <div className="space-y-6">
      {/* 1. Header with Department Summary */}
      <div className="bg-gradient-to-r from-white via-white to-[#EEF0FF]/60 rounded-3xl border border-[#ECEEF7] p-6 sm:p-8 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold text-[#5B6CFF] bg-[#EEF0FF] px-2.5 py-0.5 rounded-full uppercase">
              {analytics?.department?.code} Department Head Portal
            </span>
            <span className="text-xs text-[#8A91AD]">
              Academic Year: <strong>{selectedYear?.label}</strong>
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1B2140] tracking-tight">
            {analytics?.department?.name}
          </h2>
          <p className="text-xs sm:text-sm text-[#4A5170] mt-1">
            Department Head: {user?.name} • Supervising {kpis.totalFaculty || 0} Faculty Members
          </p>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-3">
          <a
            href={`/api/reports/department/${analytics?.department?._id}?year=${selectedYear?._id}`}
            target="_blank"
            rel="noreferrer"
          >
            <Button variant="outline" size="sm" icon={Download}>
              Export Department Excel
            </Button>
          </a>
        </div>
      </div>

      {/* 2. Department KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Avg Performance Index"
          value={`${kpis.averagePerformanceIndex || 0} / 100`}
          subtitle="Department accreditation average"
          icon={Award}
          accent="indigo"
          trend={{ value: `${leaderboard.length} Faculty`, isPositive: true }}
        />

        <StatCard
          title="Verified Publications"
          value={`${kpis.totalPublications || 0}`}
          subtitle="Indexed in Scopus / WoS / SCI"
          icon={FileText}
          accent="mint"
        />

        <StatCard
          title="Consultancy Generated"
          value={`₹${(kpis.totalConsultancyINR || 0).toLocaleString()}`}
          subtitle="Funded industry projects"
          icon={Briefcase}
          accent="peach"
        />

        <StatCard
          title="Pending Approvals"
          value={`${approvalQueue.length}`}
          subtitle="Awaiting HoD verification"
          icon={Clock}
          accent={approvalQueue.length > 0 ? 'rose' : 'mint'}
        />
      </div>

      {/* 3. HoD Approval Queue */}
      <Card
        title={`Accreditation Verification Queue (${approvalQueue.length})`}
        subtitle="Review proof documents, verify indexing criteria, and approve or request revisions with remarks."
      >
        {queueLoading ? (
          <div className="py-8 text-center text-xs text-[#8A91AD] animate-pulse">
            Loading approval queue...
          </div>
        ) : approvalQueue.length === 0 ? (
          <div className="py-12 text-center text-xs text-emerald-600 font-semibold bg-emerald-50/50 rounded-2xl border border-emerald-100">
            <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
            All submitted faculty records in your department have been reviewed and approved!
          </div>
        ) : (
          <div className="divide-y divide-[#ECEEF7]">
            {approvalQueue.map((item) => (
              <div
                key={item._id}
                className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#EEF0FF] text-[#5B6CFF]">
                      {item.module}
                    </span>
                    <span className="text-xs font-bold text-[#1B2140]">
                      {item.faculty?.name || 'Faculty Member'}
                    </span>
                    <span className="text-[11px] text-[#8A91AD]">
                      ({item.faculty?.employeeId || 'ID'})
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-[#1B2140] truncate max-w-xl">
                    {item.title || item.courseName || item.projectTitle}
                  </p>

                  <div className="text-[11px] text-[#8A91AD] flex items-center gap-3">
                    <span>Submitted: {new Date(item.updatedAt).toLocaleDateString()}</span>
                    {item.proofUrl && (
                      <a
                        href={item.proofUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#5B6CFF] font-semibold underline inline-flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" /> View Submitted Proof
                      </a>
                    )}
                  </div>
                </div>

                {/* Approve / Reject Buttons */}
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-rose-600 hover:bg-rose-50 border-rose-200"
                    icon={XCircle}
                    onClick={() => handleOpenActionModal('reject', item)}
                  >
                    Reject
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    className="bg-[#2EC4A6] hover:bg-[#28ad93] text-white"
                    icon={CheckCircle2}
                    onClick={() => handleOpenActionModal('approve', item)}
                  >
                    Approve
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* 4. Faculty Performance Leaderboard */}
      <Card
        title="Department Faculty Performance Leaderboard"
        subtitle="Ranked by Consolidated Performance Index (0 - 100) based strictly on verified records"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[#4A5170]">
            <thead className="bg-[#F7F8FC] border-b border-[#ECEEF7] text-xs font-semibold text-[#8A91AD] uppercase">
              <tr>
                <th className="px-6 py-3.5">Rank</th>
                <th className="px-6 py-3.5">Faculty Member</th>
                <th className="px-6 py-3.5">Designation</th>
                <th className="px-6 py-3.5">Performance Index</th>
                <th className="px-6 py-3.5">Accreditation Grade</th>
                <th className="px-6 py-3.5">Teaching %</th>
                <th className="px-6 py-3.5">Publications %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ECEEF7]">
              {leaderboard.map((item, index) => (
                <tr key={item.faculty._id} className="hover:bg-[#F9FAFF] transition-colors">
                  <td className="px-6 py-4 font-bold text-[#1B2140]">
                    #{index + 1}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-[#1B2140] text-xs">
                      {item.faculty.name}
                    </div>
                    <div className="text-[11px] text-[#8A91AD]">
                      {item.faculty.employeeId} • {item.faculty.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs">{item.faculty.designation}</td>
                  <td className="px-6 py-4">
                    <span className="text-base font-extrabold text-[#5B6CFF]">
                      {item.performanceIndex}
                    </span>
                    <span className="text-xs text-[#8A91AD]"> / 100</span>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={item.performanceIndex >= 85 ? 'approved' : item.performanceIndex >= 70 ? 'sky' : 'warning'}>
                      {item.grade}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-xs font-semibold">
                    {item.score?.categories?.teaching?.score || 0}%
                  </td>
                  <td className="px-6 py-4 text-xs font-semibold">
                    {item.score?.categories?.publications?.score || 0}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Approve / Reject Remark Modal */}
      <Modal
        isOpen={!!activeAction}
        onClose={() => setActiveAction(null)}
        title={activeAction?.type === 'approve' ? 'Approve Record for Accreditation' : 'Reject Record with Remarks'}
        subtitle={`Module: ${activeAction?.item?.module?.toUpperCase()} • Faculty: ${activeAction?.item?.faculty?.name}`}
      >
        <div className="space-y-4">
          <Input
            label="HoD Remarks / Audit Notes"
            placeholder="Provide official remarks or justification..."
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            required
          />

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#ECEEF7]">
            <Button variant="outline" size="sm" onClick={() => setActiveAction(null)}>
              Cancel
            </Button>
            <Button
              variant={activeAction?.type === 'approve' ? 'primary' : 'danger'}
              size="sm"
              loading={actionLoading}
              onClick={handleExecuteAction}
            >
              {activeAction?.type === 'approve' ? 'Confirm Approval' : 'Confirm Rejection'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
