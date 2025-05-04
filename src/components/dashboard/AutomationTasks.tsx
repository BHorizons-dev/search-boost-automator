
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, AlertTriangle, Clock } from 'lucide-react';

export function AutomationTasks() {
  const tasks = [
    {
      id: 1,
      title: "Backlink opportunity detected",
      website: "client1.com",
      status: "pending",
      priority: "high",
    },
    {
      id: 2,
      title: "Content update recommended",
      website: "client2.com",
      status: "in_progress",
      priority: "medium",
    },
    {
      id: 3,
      title: "Meta description optimization",
      website: "client3.com",
      status: "completed",
      priority: "low",
    },
    {
      id: 4,
      title: "Mobile performance issues",
      website: "client1.com",
      status: "pending",
      priority: "high",
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-amber-500" />;
      case 'pending':
        return <AlertTriangle className="h-4 w-4 text-seo-orange" />;
      default:
        return null;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive">High</Badge>;
      case 'medium':
        return <Badge variant="secondary">Medium</Badge>;
      case 'low':
        return <Badge variant="outline">Low</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Automation Tasks</CardTitle>
        <Button size="sm" variant="outline">View All</Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tasks.map((task) => (
            <div key={task.id} className="flex items-start justify-between p-3 border rounded-md">
              <div className="flex items-start gap-3">
                {getStatusIcon(task.status)}
                <div>
                  <p className="font-medium">{task.title}</p>
                  <p className="text-sm text-muted-foreground">{task.website}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                {getPriorityBadge(task.priority)}
                <Button size="sm" variant="secondary">Run</Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
