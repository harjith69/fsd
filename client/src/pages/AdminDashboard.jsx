import React, { useState, useEffect } from 'react';
import {
  Building2,
  Users,
  Award,
  FileText,
  Sliders,
  Plus,
  Save,
  CheckCircle2,
  TrendingUp,
  Download,
} from 'lucide-react';
import { analyticsApi, scoringApi, usersApi, departmentsApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  Card,
  StatCard,
  Badge,
  Button,
  Tabs,
  Input,
  Select,
  Modal,
  Table,
  Skeleton,
} from '../components/ui';
import { DepartmentComparisonBarChart } from '../components/charts/DepartmentComparisonBarChart';

export const AdminDashboard = () => {
  const { selectedYear } = useAuth();
  const [activeTab, setActiveTab] = useState('analytics');

  // Institution analytics
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  // Scoring configuration state
  const [scoringConfig, setScoringConfig] = useState(null);
  const [savingConfig, setSavingConfig] = useState(false);
  const [configSuccess, setConfigSuccess] = useState(false);

  // User management state
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: 'Welcome@123',
    role: 'faculty',
    department: '',
    employeeId: '',
    designation: 'Assistant Professor',
    qualification: 'Ph.D.',
  });

  const fetchInstitutionAnalytics = async () => {
    try {
      setAnalyticsLoading(true);
      const res = await analyticsApi.getInstitution(selectedYear?._id);
      if (res.data.success) {
        setAnalytics(res.data);
      }
    } catch (err) {
      console.error('Failed to load institution analytics:', err);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const fetchScoringConfig = async () => {
    try {
      const res = await scoringApi.getConfig();
      if (res.data.success) {
        setScoringConfig(res.data.config);
      }
    } catch (err) {
      console.error('Failed to load scoring config:', err);
    }
  };

  const fetchUsersAndDepts = async () => {
    try {
      setUsersLoading(true);
      const [uRes, dRes] = await Promise.all([
        usersApi.list({ limit: 50 }),
        departmentsApi.list(),
      ]);
      if (uRes.data.success) setUsers(uRes.data.users);
      if (dRes.data.success) setDepartments(dRes.data.departments);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    fetchInstitutionAnalytics();
    fetchScoringConfig();
    fetchUsersAndDepts();
  }, [selectedYear?._id]);

  const handleSaveScoringConfig = async (e) => {
    e.preventDefault();
    try {
      setSavingConfig(true);
      const res = await scoringApi.updateConfig({
        weights: scoringConfig.weights,
        targets: scoringConfig.targets,
        pointsRules: scoringConfig.pointsRules,
      });
      if (res.data.success) {
        setConfigSuccess(true);
        setTimeout(() => setConfigSuccess(false), 3000);
        // Refresh analytics with updated calculations
        fetchInstitutionAnalytics();
      }
    } catch (err) {
      alert(err.message || 'Failed to update scoring rules');
    } finally {
      setSavingConfig(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await usersApi.create(newUser);
      setIsUserModalOpen(false);
      setNewUser({
        name: '',
        email: '',
        password: 'Welcome@123',
        role: 'faculty',
        department: '',
        employeeId: '',
        designation: 'Assistant Professor',
        qualification: 'Ph.D.',
      });
      fetchUsersAndDepts();
    } catch (err) {
      alert(err.message || 'Error creating user');
    }
  };

  const kpis = analytics?.kpis || {};
  const deptList = analytics?.departments || [];

  const tabs = [
    { id: 'analytics', label: 'Institutional Analytics' },
    { id: 'scoring', label: 'Scoring Weights & Targets' },
    { id: 'users', label: 'Faculty & User Management' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-white via-white to-[#EEF0FF]/60 rounded-3xl border border-[#ECEEF7] p-6 sm:p-8 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold text-[#5B6CFF] bg-[#EEF0FF] px-2.5 py-0.5 rounded-full uppercase">
              Institution Administration Portal
            </span>
            <span className="text-xs text-[#8A91AD]">
              Period: <strong>{selectedYear?.label}</strong>
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1B2140] tracking-tight">
            Institutional Performance Dashboard
          </h2>
          <p className="text-xs sm:text-sm text-[#4A5170] mt-1">
            Autonomous Engineering College • Institutional Accreditation Governance
          </p>
        </div>

        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
      </div>

      {/* Tab 1: Institution Analytics */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="College Index Average"
              value={`${kpis.averagePerformanceIndex || 0} / 100`}
              subtitle="NAAC institutional composite score"
              icon={Award}
              accent="indigo"
              trend={{ value: 'A++ Track', isPositive: true }}
            />
            <StatCard
              title="Total Faculty"
              value={`${kpis.totalFaculty || 0}`}
              subtitle={`Across ${kpis.totalDepartments || 0} departments`}
              icon={Users}
              accent="sky"
            />
            <StatCard
              title="Approved Publications"
              value={`${kpis.totalPublications || 0}`}
              subtitle="Scopus, WoS, and SCI indexed"
              icon={FileText}
              accent="mint"
            />
            <StatCard
              title="Consultancy Revenue"
              value={`₹${(kpis.totalConsultancyINR || 0).toLocaleString()}`}
              subtitle="External industry grants & testing"
              icon={Building2}
              accent="peach"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6">
              <Card
                title="Department Performance Comparison"
                subtitle="Average Performance Index benchmark across engineering departments"
              >
                <DepartmentComparisonBarChart data={deptList} />
              </Card>
            </div>

            <div className="lg:col-span-6">
              <Card
                title="Department Contribution Summary"
                subtitle="Accreditation metrics aggregated by academic department"
              >
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-[#4A5170]">
                    <thead className="bg-[#F7F8FC] border-b border-[#ECEEF7] font-semibold text-[#8A91AD] uppercase">
                      <tr>
                        <th className="px-4 py-3">Dept</th>
                        <th className="px-4 py-3">Faculty</th>
                        <th className="px-4 py-3">Avg Index</th>
                        <th className="px-4 py-3">Pubs</th>
                        <th className="px-4 py-3">Consultancy</th>
                        <th className="px-4 py-3">Patents</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#ECEEF7]">
                      {deptList.map((d) => (
                        <tr key={d.id} className="hover:bg-[#F9FAFF]">
                          <td className="px-4 py-3 font-bold text-[#1B2140]">{d.code}</td>
                          <td className="px-4 py-3">{d.facultyCount}</td>
                          <td className="px-4 py-3 font-bold text-[#5B6CFF]">{d.averageIndex}</td>
                          <td className="px-4 py-3">{d.publications}</td>
                          <td className="px-4 py-3">₹{d.consultancyAmount?.toLocaleString()}</td>
                          <td className="px-4 py-3 font-semibold">{d.patents}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Scoring Weights & Targets Configuration */}
      {activeTab === 'scoring' && scoringConfig && (
        <Card
          title="Appraisal Scoring Weight Matrix & Target Benchmarks"
          subtitle="Admin configurable weights (must sum to 100%) and annual targets for the Performance Index engine."
        >
          {configSuccess && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-700 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Scoring configuration saved! All faculty performance indices recalculated.
            </div>
          )}

          <form onSubmit={handleSaveScoringConfig} className="space-y-6">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#1B2140] mb-3">
                1. Category Weights (Total: 100%)
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <Input
                  label="Teaching %"
                  type="number"
                  value={scoringConfig.weights.teaching}
                  onChange={(e) =>
                    setScoringConfig({
                      ...scoringConfig,
                      weights: { ...scoringConfig.weights, teaching: Number(e.target.value) },
                    })
                  }
                  required
                />
                <Input
                  label="Publications %"
                  type="number"
                  value={scoringConfig.weights.publications}
                  onChange={(e) =>
                    setScoringConfig({
                      ...scoringConfig,
                      weights: { ...scoringConfig.weights, publications: Number(e.target.value) },
                    })
                  }
                  required
                />
                <Input
                  label="FDPs %"
                  type="number"
                  value={scoringConfig.weights.fdp}
                  onChange={(e) =>
                    setScoringConfig({
                      ...scoringConfig,
                      weights: { ...scoringConfig.weights, fdp: Number(e.target.value) },
                    })
                  }
                  required
                />
                <Input
                  label="Consultancy %"
                  type="number"
                  value={scoringConfig.weights.consultancy}
                  onChange={(e) =>
                    setScoringConfig({
                      ...scoringConfig,
                      weights: { ...scoringConfig.weights, consultancy: Number(e.target.value) },
                    })
                  }
                  required
                />
                <Input
                  label="Patents %"
                  type="number"
                  value={scoringConfig.weights.patents}
                  onChange={(e) =>
                    setScoringConfig({
                      ...scoringConfig,
                      weights: { ...scoringConfig.weights, patents: Number(e.target.value) },
                    })
                  }
                  required
                />
                <Input
                  label="Feedback %"
                  type="number"
                  value={scoringConfig.weights.feedback}
                  onChange={(e) =>
                    setScoringConfig({
                      ...scoringConfig,
                      weights: { ...scoringConfig.weights, feedback: Number(e.target.value) },
                    })
                  }
                  required
                />
              </div>
            </div>

            <div className="pt-4 border-t border-[#ECEEF7]">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#1B2140] mb-3">
                2. Annual Normalization Target Benchmarks (100% Cap)
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <Input
                  label="Teaching (Hours)"
                  type="number"
                  value={scoringConfig.targets.teachingHours}
                  onChange={(e) =>
                    setScoringConfig({
                      ...scoringConfig,
                      targets: { ...scoringConfig.targets, teachingHours: Number(e.target.value) },
                    })
                  }
                />
                <Input
                  label="Publication Pts"
                  type="number"
                  value={scoringConfig.targets.publicationPoints}
                  onChange={(e) =>
                    setScoringConfig({
                      ...scoringConfig,
                      targets: { ...scoringConfig.targets, publicationPoints: Number(e.target.value) },
                    })
                  }
                />
                <Input
                  label="FDP Points"
                  type="number"
                  value={scoringConfig.targets.fdpPoints}
                  onChange={(e) =>
                    setScoringConfig({
                      ...scoringConfig,
                      targets: { ...scoringConfig.targets, fdpPoints: Number(e.target.value) },
                    })
                  }
                />
                <Input
                  label="Consultancy (₹)"
                  type="number"
                  value={scoringConfig.targets.consultancyAmount}
                  onChange={(e) =>
                    setScoringConfig({
                      ...scoringConfig,
                      targets: { ...scoringConfig.targets, consultancyAmount: Number(e.target.value) },
                    })
                  }
                />
                <Input
                  label="Patent Points"
                  type="number"
                  value={scoringConfig.targets.patentPoints}
                  onChange={(e) =>
                    setScoringConfig({
                      ...scoringConfig,
                      targets: { ...scoringConfig.targets, patentPoints: Number(e.target.value) },
                    })
                  }
                />
                <Input
                  label="Feedback Max"
                  type="number"
                  value={scoringConfig.targets.feedbackScore}
                  onChange={(e) =>
                    setScoringConfig({
                      ...scoringConfig,
                      targets: { ...scoringConfig.targets, feedbackScore: Number(e.target.value) },
                    })
                  }
                />
              </div>
            </div>

            <div className="flex items-center justify-end pt-4 border-t border-[#ECEEF7]">
              <Button type="submit" variant="primary" size="md" icon={Save} loading={savingConfig}>
                Save Scoring Rules & Recompute All Scores
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Tab 3: User Management */}
      {activeTab === 'users' && (
        <Card
          title={`Faculty & User Directory (${users.length})`}
          subtitle="Manage credentials, designations, and department affiliations"
          actions={
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => setIsUserModalOpen(true)}
            >
              Add User
            </Button>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-[#4A5170]">
              <thead className="bg-[#F7F8FC] border-b border-[#ECEEF7] text-xs font-semibold text-[#8A91AD] uppercase">
                <tr>
                  <th className="px-6 py-3.5">Name & ID</th>
                  <th className="px-6 py-3.5">Email</th>
                  <th className="px-6 py-3.5">Role</th>
                  <th className="px-6 py-3.5">Department</th>
                  <th className="px-6 py-3.5">Designation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ECEEF7]">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-[#F9FAFF]">
                    <td className="px-6 py-4">
                      <span className="font-bold text-[#1B2140] text-xs block">{u.name}</span>
                      <span className="text-[11px] text-[#8A91AD]">{u.employeeId}</span>
                    </td>
                    <td className="px-6 py-4 text-xs">{u.email}</td>
                    <td className="px-6 py-4">
                      <Badge variant={u.role === 'admin' ? 'indigo' : u.role === 'hod' ? 'sky' : 'mint'}>
                        {u.role.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold">{u.department?.name || 'Institutional'}</td>
                    <td className="px-6 py-4 text-xs">{u.designation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Add User Modal */}
      <Modal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        title="Create New User Account"
        subtitle="Provision access for Faculty, Department Head, or Institutional Administrator"
      >
        <form onSubmit={handleCreateUser} className="space-y-4">
          <Input
            label="Full Name"
            placeholder="e.g. Dr. Rajesh Sharma"
            value={newUser.name}
            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Email"
              type="email"
              placeholder="e.g. faculty@college.edu"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              required
            />
            <Input
              label="Temporary Password"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="System Role"
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
            >
              <option value="faculty">Faculty Member</option>
              <option value="hod">Head of Department (HoD)</option>
              <option value="admin">Administrator (Dean)</option>
            </Select>

            <Select
              label="Department"
              value={newUser.department}
              onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
            >
              <option value="">Select Department</option>
              {departments.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Employee ID"
              placeholder="e.g. CSE105"
              value={newUser.employeeId}
              onChange={(e) => setNewUser({ ...newUser, employeeId: e.target.value })}
            />
            <Input
              label="Designation"
              placeholder="e.g. Assistant Professor"
              value={newUser.designation}
              onChange={(e) => setNewUser({ ...newUser, designation: e.target.value })}
            />
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#ECEEF7]">
            <Button variant="outline" size="sm" onClick={() => setIsUserModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Create User
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
