import React, { useState } from 'react';
import { User, Lock, Mail, Phone, Building, Award, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/client';
import { Card, Input, Button, Badge } from '../components/ui';

export const ProfilePage = () => {
  const { user, refreshUser } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStatus, setPasswordStatus] = useState(null); // { type: 'success' | 'error', message }
  const [changingPassword, setChangingPassword] = useState(false);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordStatus(null);

    if (newPassword !== confirmPassword) {
      setPasswordStatus({ type: 'error', message: 'New passwords do not match.' });
      return;
    }

    try {
      setChangingPassword(true);
      const res = await authApi.changePassword({ currentPassword, newPassword });
      if (res.data.success) {
        setPasswordStatus({ type: 'success', message: 'Password updated successfully!' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      setPasswordStatus({ type: 'error', message: err.message || 'Failed to update password.' });
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Profile Header */}
      <div className="bg-white rounded-3xl border border-[#ECEEF7] p-6 sm:p-8 shadow-card flex flex-col sm:flex-row items-center gap-6">
        <div className="w-20 h-20 rounded-2xl bg-[#EEF0FF] border-2 border-[#5B6CFF]/20 flex items-center justify-center text-[#5B6CFF] text-2xl font-extrabold uppercase shadow-inner">
          {user?.name?.charAt(0) || 'U'}
        </div>

        <div className="text-center sm:text-left flex-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
            <h2 className="text-2xl font-bold text-[#1B2140] tracking-tight">{user?.name}</h2>
            <Badge variant="primary">{user?.role?.toUpperCase()}</Badge>
          </div>
          <p className="text-xs text-[#4A5170]">
            {user?.designation} • {user?.department?.name || 'Academic Institution'}
          </p>
          <p className="text-[11px] text-[#8A91AD] mt-0.5">
            Employee ID: {user?.employeeId || 'N/A'} • {user?.qualification || 'Ph.D.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Personal Details Card */}
        <div className="md:col-span-6">
          <Card title="Academic Profile Details" subtitle="Official faculty affiliation credentials">
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[#8A91AD] font-semibold block">Full Name</span>
                <span className="text-[#1B2140] font-bold text-sm">{user?.name}</span>
              </div>
              <div>
                <span className="text-[#8A91AD] font-semibold block">Institutional Email</span>
                <span className="text-[#1B2140] font-medium">{user?.email}</span>
              </div>
              <div>
                <span className="text-[#8A91AD] font-semibold block">Department</span>
                <span className="text-[#1B2140] font-medium">{user?.department?.name || 'Institution-wide'} ({user?.department?.code})</span>
              </div>
              <div>
                <span className="text-[#8A91AD] font-semibold block">Designation & Rank</span>
                <span className="text-[#1B2140] font-medium">{user?.designation}</span>
              </div>
              <div>
                <span className="text-[#8A91AD] font-semibold block">Highest Qualification</span>
                <span className="text-[#1B2140] font-medium">{user?.qualification}</span>
              </div>
              <div>
                <span className="text-[#8A91AD] font-semibold block">Contact Phone</span>
                <span className="text-[#1B2140] font-medium">{user?.phone || 'Not provided'}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Change Password Card */}
        <div className="md:col-span-6">
          <Card title="Security & Password" subtitle="Update your portal login authentication password">
            {passwordStatus && (
              <div
                className={`mb-4 p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                  passwordStatus.type === 'success'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}
              >
                {passwordStatus.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-500" />
                )}
                {passwordStatus.message}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-3">
              <Input
                label="Current Password"
                type="password"
                placeholder="••••••••••••"
                icon={Lock}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />

              <Input
                label="New Password"
                type="password"
                placeholder="Minimum 6 characters"
                icon={Lock}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />

              <Input
                label="Confirm New Password"
                type="password"
                placeholder="Re-enter new password"
                icon={Lock}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  className="w-full"
                  loading={changingPassword}
                >
                  Update Password
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};
