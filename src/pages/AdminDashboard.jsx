import { useState } from 'react';
import { Shield } from 'lucide-react';
import CampaignApproval from '../components/admin/CampaignApproval';

const AdminDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#4a6359] text-white py-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8" />
            <div>
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-sm opacity-90">Manage campaigns and approvals</p>
            </div>
          </div>
        </div>
      </div>

      <CampaignApproval />
    </div>
  );
};

export default AdminDashboard;
