
import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';

const Clients = () => {
  return (
    <AppLayout>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Clients</h1>
        </div>
        <p className="text-muted-foreground">
          Manage your client profiles and website assignments. This feature will be implemented soon.
        </p>
      </div>
    </AppLayout>
  );
};

export default Clients;
