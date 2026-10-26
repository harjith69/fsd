import React from 'react';
import { Link } from 'react-router-dom';
import { Home, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-[#F7F8FC] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 rounded-3xl bg-[#EEF0FF] text-[#5B6CFF] flex items-center justify-center mb-6 shadow-sm">
        <AlertCircle className="w-10 h-10" />
      </div>
      <h1 className="text-4xl font-extrabold text-[#1B2140] tracking-tight mb-2">404</h1>
      <h2 className="text-lg font-bold text-[#1B2140] mb-2">Page Not Found</h2>
      <p className="text-xs text-[#8A91AD] max-w-sm mb-6">
        The academic portal page you are looking for does not exist or has been relocated.
      </p>
      <Link to="/dashboard">
        <Button variant="primary" size="md" icon={Home}>
          Return to Dashboard
        </Button>
      </Link>
    </div>
  );
};
