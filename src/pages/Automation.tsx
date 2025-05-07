import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useQuery } from '@tanstack/react-query';
import { supabase, TablesInsert, TablesSelect } from '@/integrations/supabase/client';
import { WebsiteSelector } from '@/components/rank-tracking/WebsiteSelector';
import { 
  Plus, 
  CheckCircle, 
  Clock, 
  RotateCw, 
  AlertTriangle, 
  Calendar, 
  FileText, 
  Settings,
  Trash
} from 'lucide-react';

const taskTypes = [
  { id: 'content_update', name: 'Content Update' },
  { id: 'backlink_building', name: 'Backlink Building' },
  { id: 'technical_seo', name: 'Technical SEO' },
  { id: 'keyword_research', name: 'Keyword Research' },
  { id: 'competitor_analysis', name: 'Competitor Analysis' },
];

const priorityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

const statusOptions = [
  { value: 'pending', label: 'Pending', icon: Clock, color: 'bg-yellow-100 text-yellow-800' },
  { value: 'in_progress', label: 'In Progress', icon: RotateCw, color: 'bg-blue-100 text-blue-800' },
  { value: 'completed', label: 'Completed', icon: CheckCircle, color: 'bg-green-100 text-green-800' },
  { value: 'cancelled', label: 'Cancelled', icon: AlertTriangle, color: 'bg-red-100 text-red-800' },
];

// Define Task type from our TablesSelect definition
type Task = TablesSelect['tasks'];

// Helper function to safely access the tasks table with proper typing
const tasksTable = () => {
  return supabase.from('tasks') as unknown as ReturnType<typeof supabase.from<'tasks'>>;
};

const Automation = () => {
  const { toast } = useToast();
  const [selectedWebsiteId, setSelectedWebsiteId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = useState(false);
  const [newTask, setNewTask] = useState<Omit<TablesInsert['tasks'], 'id' | 'created_at' | 'updated_at'>>({
    title: '',
    description: '',
    task_type: 'content_update',
    priority: 'medium',
    status: 'pending',
    website_id: ''
  });

  // Fetch tasks for the selected website
  const { data: tasks, isLoading, refetch } = useQuery<Task[]>({
    queryKey: ['tasks', selectedWebsiteId],
    queryFn: async () => {
      if (!selectedWebsiteId) return [];
      
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('website_id', selectedWebsiteId) as any;
        
      if (error) {
        toast({
          title: 'Error fetching tasks',
          description: error.message,
          variant: 'destructive'
        });
        return [];
      }
      
      return (data || []) as Task[];
    },
    enabled: !!selectedWebsiteId
  });

  // Filter tasks based on active tab
  const filteredTasks = tasks?.filter(task => {
    if (!task || typeof task !== 'object' || !('status' in task)) return false;
    
    if (activeTab === 'all') return true;
    if (activeTab === 'completed') return task.status === 'completed';
    if (activeTab === 'pending') return task.status === 'pending';
    if (activeTab === 'in_progress') return task.status === 'in_progress';
    return true;
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewTask(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setNewTask(prev => ({ ...prev, [name]: value }));
  };

  const handleAddTask = async () => {
    if (!selectedWebsiteId || !newTask.title) {
      toast({
        title: 'Validation Error',
        description: 'Please select a website and enter a task title',
        variant: 'destructive'
      });
      return;
    }

    try {
      const taskToInsert: TablesInsert['tasks'] = {
        ...newTask,
        website_id: selectedWebsiteId
      };

      const { error } = await supabase
        .from('tasks')
        .insert(taskToInsert) as any;

      if (error) throw error;

      toast({
        title: 'Task Created',
        description: 'Your SEO task has been created successfully.'
      });
      
      setNewTask({
        title: '',
        description: '',
        task_type: 'content_update',
        priority: 'medium',
        status: 'pending',
        website_id: ''
      });
      setIsAddTaskDialogOpen(false);
      refetch();
    } catch (error: any) {
      toast({
        title: 'Error Creating Task',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      const updateData: Partial<TablesInsert['tasks']> = { status: newStatus };
      
      if (newStatus === 'completed') {
        updateData.completed_at = new Date().toISOString();
      }
      
      const { error } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', taskId) as any;

      if (error) throw error;

      toast({
        title: 'Task Updated',
        description: `Task status updated to ${newStatus}.`
      });
      
      refetch();
    } catch (error: any) {
      toast({
        title: 'Error Updating Task',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId) as any;

      if (error) throw error;

      toast({
        title: 'Task Deleted',
        description: 'The task has been deleted.'
      });
      
      refetch();
    } catch (error: any) {
      toast({
        title: 'Error Deleting Task',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusOption = statusOptions.find(option => option.value === status);
    if (!statusOption) return null;
    
    const Icon = statusOption.icon;
    
    return (
      <Badge variant="outline" className={`${statusOption.color} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {statusOption.label}
      </Badge>
    );
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Automation</h1>
          <Button 
            onClick={() => setIsAddTaskDialogOpen(true)}
            disabled={!selectedWebsiteId}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create New Task
          </Button>
        </div>

        <WebsiteSelector 
          selectedWebsiteId={selectedWebsiteId}
          setSelectedWebsiteId={setSelectedWebsiteId}
        />

        <Card>
          <CardHeader>
            <CardTitle>SEO Tasks</CardTitle>
            <CardDescription>Create and manage automated SEO tasks for your website</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="all">All Tasks</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="in_progress">In Progress</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>
              
              <TabsContent value={activeTab} className="mt-0">
                {isLoading ? (
                  <div className="text-center py-4">Loading tasks...</div>
                ) : filteredTasks && filteredTasks.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Task</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTasks.map((task) => (
                        <TableRow key={task.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{task.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {task.description?.length > 60 
                                  ? task.description.substring(0, 60) + '...' 
                                  : task.description}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            {taskTypes.find(type => type.id === task.task_type)?.name || task.task_type}
                          </TableCell>
                          <TableCell>
                            <Badge variant={task.priority === 'high' ? 'destructive' : task.priority === 'medium' ? 'default' : 'secondary'}>
                              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(task.status)}
                          </TableCell>
                          <TableCell>
                            {task.created_at ? new Date(task.created_at).toLocaleDateString() : 'N/A'}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              {task.status !== 'completed' && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => updateTaskStatus(task.id, 'completed')}
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                              )}
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => deleteTask(task.id)}
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : selectedWebsiteId ? (
                  <div className="text-center py-8">
                    <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-lg text-muted-foreground mb-2">No tasks found</p>
                    <p className="text-sm text-muted-foreground mb-4">Create your first SEO task</p>
                    <Button onClick={() => setIsAddTaskDialogOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Your First Task
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Select a website to view tasks</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Add Task Dialog */}
        <Dialog open={isAddTaskDialogOpen} onOpenChange={setIsAddTaskDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New SEO Task</DialogTitle>
              <DialogDescription>
                Add a new task to track your SEO optimization progress.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Task Title</Label>
                <Input 
                  id="title"
                  name="title"
                  placeholder="e.g., Update meta descriptions"
                  value={newTask.title}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Input 
                  id="description"
                  name="description"
                  placeholder="Task description"
                  value={newTask.description || ''}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="task_type">Task Type</Label>
                  <select
                    id="task_type"
                    name="task_type"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={newTask.task_type}
                    onChange={(e) => handleSelectChange('task_type', e.target.value)}
                  >
                    {taskTypes.map(type => (
                      <option key={type.id} value={type.id}>{type.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <select
                    id="priority"
                    name="priority"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={newTask.priority}
                    onChange={(e) => handleSelectChange('priority', e.target.value)}
                  >
                    {priorityOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  name="status"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={newTask.status}
                  onChange={(e) => handleSelectChange('status', e.target.value)}
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddTaskDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAddTask}>Create Task</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default Automation;
