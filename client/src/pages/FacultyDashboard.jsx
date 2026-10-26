import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Award,
  BookOpen,
  FileText,
  Briefcase,
  Lightbulb,
  Clock,
  AlertCircle,
  TrendingUp,
  Download,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { analyticsApi } from '../api/client';
import { Card, StatCard, Badge, Button, Skeleton } from '../components/ui';
import { RadarCategoryChart } from '../components/charts/RadarCategoryChart';
import { YoYTrendLineChart } from '../components/charts/YoYTrendLineChart';
import { PublicationDonutChart } from '../components/charts/PublicationDonutChart';

export const FacultyDashboard = () => {
  const { user, selectedYear } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!user?._id) return;
      try {
        setLoading(true);
        setError(null);
        const res = await analyticsApi.getFaculty(user._id, selectedYear?._id);
        if (res.data.success) {
          setData(res.data);
        }
      } catch (err) {
        setError(err.message || 'Failed to load faculty metrics');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [user?._id, selectedYear?._id]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton variant="rectangular" height="120px" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} variant="rectangular" height="110px" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton variant="rectangular" height="320px" />
          <Skeleton variant="rectangular" height="320px" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-[#ECEEF7]">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-2" />
        <h3 className="text-base font-bold text-[#1B2140]">Unable to load dashboard</h3>
        <p className="text-xs text-[#8A91AD] mt-1">{error || 'Unknown error'}</p>
      </div>
    );
  }

  const { score, rank, yoyTrends, pubTypeDistribution, pendingApprovalsCount, timeline } = data;

  return (
    <div className="space-y-6">
      {/* 1. Aesthetic Welcome Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-white via-white to-[#EEF0FF]/60 rounded-3xl border border-[#ECEEF7] p-6 sm:p-8 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Soft Background Accent Blob */}
        <div className="absolute right-0 top-0 w-80 h-80 bg-[#5B6CFF]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold text-[#5B6CFF] uppercase tracking-wider bg-[#EEF0FF] px-2.5 py-0.5 rounded-full">
              {data.academicYear?.label || 'Academic Year'} Appraisal Period
            </span>
            {pendingApprovalsCount > 0 && (
              <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200/60 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {pendingApprovalsCount} Pending Approval
              </span>
            )}
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1B2140] tracking-tight">
            Welcome back, {user?.name}
          </h2>
          <p className="text-xs sm:text-sm text-[#4A5170] mt-1 max-w-xl">
            {user?.designation} • {user?.department?.name || 'Department'} (Emp ID: {user?.employeeId})
          </p>
        </div>

        {/* Quick Report Download CTA */}
        <div className="relative z-10 flex items-center gap-3">
          <Link to="/reports">
            <Button variant="outline" size="sm" icon={Download}>
              Export Audit PDF
            </Button>
          </Link>
          <Link to="/teaching">
            <Button variant="primary" size="sm" icon={Sparkles}>
              + Add Record
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Key Performance Indicators (KPI Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Performance Index */}
        <StatCard
          title="Performance Index"
          value={`${score?.performanceIndex || 0}`}
          subtitle={`Grade: ${score?.grade || 'N/A'} • Rank #${rank?.rank || 1} in Dept`}
          icon={Award}
          accent="indigo"
          trend={{ value: `${score?.grade}`, isPositive: score?.performanceIndex >= 70 }}
        />

        {/* Publications */}
        <StatCard
          title="Publications"
          value={`${score?.counts?.publications || 0}`}
          subtitle={`${score?.categories?.publications?.score || 0}% of target points`}
          icon={FileText}
          accent="mint"
        />

        {/* Teaching Delivered Hours */}
        <StatCard
          title="Teaching Hours"
          value={`${score?.categories?.teaching?.raw || 0} hrs`}
          subtitle={`Target: ${score?.categories?.teaching?.target || 120} hrs/sem`}
          icon={BookOpen}
          accent="sky"
        />

        {/* FDPs & Training */}
        <StatCard
          title="FDPs & Training"
          value={`${score?.counts?.fdp || 0}`}
          subtitle={`${score?.categories?.fdp?.score || 0}% target reached`}
          icon={Calendar}
          accent="peach"
        />

        {/* Consultancy Revenue */}
        <StatCard
          title="Consultancy"
          value={`₹${(score?.categories?.consultancy?.raw || 0).toLocaleString()}`}
          subtitle={`${score?.counts?.consultancy || 0} active/completed projects`}
          icon={Briefcase}
          accent="indigo"
        />

        {/* Patents */}
        <StatCard
          title="Patents & IP"
          value={`${score?.counts?.patents || 0}`}
          subtitle={`${score?.categories?.patents?.score || 0}% target achieved`}
          icon={Lightbulb}
          accent="rose"
        />
      </div>

      {/* 3. Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Radar Chart: Category Breakdown (0-100) */}
        <div className="lg:col-span-6">
          <Card
            title="Accreditation Category Breakdown"
            subtitle="Normalized scores (0 - 100%) against academic performance benchmarks"
          >
            <RadarCategoryChart categories={score?.categories} />

            {/* Quick Metrics Breakdown Table */}
            <div className="mt-4 pt-4 border-t border-[#ECEEF7] grid grid-cols-3 gap-3 text-center">
              <div className="p-2.5 rounded-xl bg-[#F7F8FC]">
                <span className="text-[10px] text-[#8A91AD] font-semibold block">Teaching Workload</span>
                <span className="text-sm font-bold text-[#1B2140]">{score?.categories?.teaching?.score}%</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#F7F8FC]">
                <span className="text-[10px] text-[#8A91AD] font-semibold block">Publications</span>
                <span className="text-sm font-bold text-[#1B2140]">{score?.categories?.publications?.score}%</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#F7F8FC]">
                <span className="text-[10px] text-[#8A91AD] font-semibold block">Student Feedback</span>
                <span className="text-sm font-bold text-[#1B2140]">{score?.categories?.feedback?.raw}/5.0</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Line Chart: Year-over-Year Performance Index Progression */}
        <div className="lg:col-span-6">
          <Card
            title="Year-over-Year Progression"
            subtitle="Annual Performance Index trend across consecutive academic cycles"
          >
            <YoYTrendLineChart data={yoyTrends} />

            <div className="mt-4 pt-4 border-t border-[#ECEEF7] flex items-center justify-between text-xs text-[#4A5170]">
              <span>Current Status: <strong className="text-[#1B2140]">{score?.grade}</strong></span>
              <span className="text-[#2EC4A6] font-semibold flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> NAAC Criterion 2.4 & 3.4 Compliant
              </span>
            </div>
          </Card>
        </div>
      </div>

      {/* 4. Bottom Grid: Publication Types & Recent Activity Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Publication Types Donut */}
        <div className="lg:col-span-5">
          <Card
            title="Research & Publication Portfolio"
            subtitle="Distribution by publication category"
          >
            <PublicationDonutChart data={pubTypeDistribution} />
          </Card>
        </div>

        {/* Activity Timeline */}
        <div className="lg:col-span-7">
          <Card
            title="Recent Activity Timeline"
            subtitle="Latest submissions and accreditation verification statuses"
            actions={
              <Link to="/publications">
                <Button variant="ghost" size="sm">
                  View All Records →
                </Button>
              </Link>
            }
          >
            {timeline.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#8A91AD]">
                No recent activity recorded yet.
              </div>
            ) : (
              <div className="space-y-4">
                {timeline.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-start justify-between gap-4 p-3 rounded-xl hover:bg-[#F9FAFF] border border-transparent hover:border-[#ECEEF7] transition-all"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-[#EEF0FF] text-[#5B6CFF] flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                        {item.module.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#1B2140] truncate">
                          {item.title}
                        </p>
                        <p className="text-[11px] text-[#8A91AD] mt-0.5">
                          {item.module} • {new Date(item.updatedAt).toLocaleDateString()}
                          {item.remarks ? ` — "${item.remarks}"` : ''}
                        </p>
                      </div>
                    </div>

                    <Badge variant={item.status}>{item.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
