import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  FileText,
  Download,
  Calendar,
  Building,
  User,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usersApi, departmentsApi } from '../api/client';
import { Card, Button, Select, Badge } from '../components/ui';

export const ReportsPage = () => {
  const { user, role, academicYears, selectedYear, setSelectedYear } = useAuth();

  const [departments, setDepartments] = useState([]);
  const [facultyList, setFacultyList] = useState([]);
  const [selectedDept, setSelectedDept] = useState(user?.department?._id || user?.department || '');
  const [selectedFaculty, setSelectedFaculty] = useState(user?._id || '');

  useEffect(() => {
    const loadMetadata = async () => {
      try {
        const [dRes, uRes] = await Promise.all([
          departmentsApi.list(),
          usersApi.list({ role: 'faculty', limit: 100 }),
        ]);
        if (dRes.data.success) {
          setDepartments(dRes.data.departments);
          if (!selectedDept && dRes.data.departments[0]) {
            setSelectedDept(dRes.data.departments[0]._id);
          }
        }
        if (uRes.data.success) {
          setFacultyList(uRes.data.users);
          if (role === 'faculty') {
            setSelectedFaculty(user._id);
          } else if (!selectedFaculty && uRes.data.users[0]) {
            setSelectedFaculty(uRes.data.users[0]._id);
          }
        }
      } catch (err) {
        console.error('Error loading report metadata:', err);
      }
    };

    loadMetadata();
  }, [role, user]);

  const targetFacultyId = role === 'faculty' ? user._id : selectedFaculty;
  const targetYearId = selectedYear?._id;

  const pdfUrl = `/api/reports/faculty/${targetFacultyId}?year=${targetYearId}&format=pdf`;
  const excelUrl = `/api/reports/faculty/${targetFacultyId}?year=${targetYearId}&format=xlsx`;
  const deptExcelUrl = `/api/reports/department/${selectedDept}?year=${targetYearId}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-white via-white to-[#EEF0FF]/60 rounded-3xl border border-[#ECEEF7] p-6 sm:p-8 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold text-[#5B6CFF] bg-[#EEF0FF] px-2.5 py-0.5 rounded-full uppercase">
              NAAC / NBA Accreditation Audits
            </span>
            <span className="text-xs text-[#2EC4A6] font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Certified Formats
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1B2140] tracking-tight">
            Academic Performance & Audit Reports
          </h2>
          <p className="text-xs sm:text-sm text-[#4A5170] mt-1">
            Export official self-appraisal reports, faculty dossiers, and department accreditation records.
          </p>
        </div>
      </div>

      {/* Scope Controls */}
      <Card title="Report Parameters & Scope" subtitle="Choose academic session and target faculty/department.">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Select
            label="Academic Year"
            value={selectedYear?._id || ''}
            onChange={(e) => {
              const yr = academicYears.find((y) => y._id === e.target.value);
              if (yr) setSelectedYear(yr);
            }}
          >
            {academicYears.map((yr) => (
              <option key={yr._id} value={yr._id}>
                {yr.label} {yr.isCurrent ? '(Current)' : ''}
              </option>
            ))}
          </Select>

          {role !== 'faculty' && (
            <>
              <Select
                label="Department Filter"
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
              >
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </Select>

              <Select
                label="Select Faculty Dossier"
                value={selectedFaculty}
                onChange={(e) => setSelectedFaculty(e.target.value)}
              >
                {facultyList
                  .filter((f) => !selectedDept || f.department?._id === selectedDept || f.department === selectedDept)
                  .map((f) => (
                    <option key={f._id} value={f._id}>
                      {f.name} ({f.employeeId || 'ID'})
                    </option>
                  ))}
              </Select>
            </>
          )}
        </div>
      </Card>

      {/* Export Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* PDF Report Card */}
        <Card className="flex flex-col justify-between h-full">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#1B2140]">
              Faculty Appraisal Audit PDF
            </h3>
            <p className="text-xs text-[#8A91AD] mt-1 mb-4 leading-relaxed">
              Consolidated academic performance report including Performance Index (0-100), teaching deliverables, Scopus/SCI publication lists, and verified proofs.
            </p>
            <div className="text-[11px] text-[#4A5170] space-y-1 mb-6">
              <div className="flex items-center gap-1.5 text-emerald-600 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" /> Includes HoD remarks & signatures
              </div>
              <div className="flex items-center gap-1.5 text-emerald-600 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" /> Formatted for NAAC Criteria 2 & 3
              </div>
            </div>
          </div>

          <a href={pdfUrl} target="_blank" rel="noreferrer" className="w-full">
            <Button variant="primary" size="md" icon={Download} className="w-full">
              Download Official PDF
            </Button>
          </a>
        </Card>

        {/* Excel Faculty Dossier */}
        <Card className="flex flex-col justify-between h-full">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#2EC4A6] flex items-center justify-center mb-4">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#1B2140]">
              Individual Activity Excel Workbook
            </h3>
            <p className="text-xs text-[#8A91AD] mt-1 mb-4 leading-relaxed">
              Multi-sheet Excel workbook with individual tabs for Publications (DOI, IF, citations), Teaching Workload, FDPs, Consultancy grants, and Patents.
            </p>
            <div className="text-[11px] text-[#4A5170] space-y-1 mb-6">
              <div className="flex items-center gap-1.5 text-emerald-600 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" /> 6 tabbed Excel sheets (.xlsx)
              </div>
              <div className="flex items-center gap-1.5 text-emerald-600 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" /> Ready for IQAC data consolidation
              </div>
            </div>
          </div>

          <a href={excelUrl} target="_blank" rel="noreferrer" className="w-full">
            <Button variant="outline" size="md" icon={Download} className="w-full">
              Download Excel Workbook
            </Button>
          </a>
        </Card>

        {/* Department Consolidated Excel */}
        {role !== 'faculty' && (
          <Card className="flex flex-col justify-between h-full">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#EEF0FF] text-[#5B6CFF] flex items-center justify-center mb-4">
                <Building className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#1B2140]">
                Department Accreditation Summary
              </h3>
              <p className="text-xs text-[#8A91AD] mt-1 mb-4 leading-relaxed">
                Department-level compilation of all faculty rankings, total publications, industry consultancy funds, and accreditation readiness scores.
              </p>
              <div className="text-[11px] text-[#4A5170] space-y-1 mb-6">
                <div className="flex items-center gap-1.5 text-emerald-600 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Department Leaderboard Matrix
                </div>
                <div className="flex items-center gap-1.5 text-emerald-600 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" /> NBA Tier-1 accreditation compliant
                </div>
              </div>
            </div>

            <a href={deptExcelUrl} target="_blank" rel="noreferrer" className="w-full">
              <Button variant="secondary" size="md" icon={Download} className="w-full">
                Download Department Summary
              </Button>
            </a>
          </Card>
        )}
      </div>
    </div>
  );
};
