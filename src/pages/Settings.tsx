
import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';

const Settings = () => {
  return (
    <AppLayout>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Settings</h1>
        </div>
        <p className="text-muted-foreground">
          Configure your account settings and preferences. This feature will be implemented soon.
        </p>
      </div>
    </AppLayout>
  );
};

export default Settings;
