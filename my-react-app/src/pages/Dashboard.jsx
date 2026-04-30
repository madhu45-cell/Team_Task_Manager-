import { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import api from '../services/api';
import { format } from 'date-fns';
import { 
  ChartBarIcon, 
  CheckCircleIcon, 
  ClockIcon,
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline';

export const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/dashboard/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">Loading...</div>
      </Layout>
    );
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'To Do': return 'bg-red-100 text-red-800';
      case 'In Progress': return 'bg-yellow-100 text-yellow-800';
      case 'Done': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'High': return 'text-red-600';
      case 'Medium': return 'text-yellow-600';
      case 'Low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ChartBarIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Tasks</dt>
                    <dd className="text-lg font-semibold text-gray-900">{stats.total_tasks}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircleIcon className="h-6 w-6 text-green-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Completed</dt>
                    <dd className="text-lg font-semibold text-gray-900">
                      {stats.tasks_by_status.find(s => s.status === 'Done')?.count || 0}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ClockIcon className="h-6 w-6 text-yellow-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">In Progress</dt>
                    <dd className="text-lg font-semibold text-gray-900">
                      {stats.tasks_by_status.find(s => s.status === 'In Progress')?.count || 0}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ExclamationTriangleIcon className="h-6 w-6 text-red-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Overdue Tasks</dt>
                    <dd className="text-lg font-semibold text-gray-900">{stats.overdue_tasks.length}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Tasks by Status</h2>
          <div className="space-y-3">
            {stats.tasks_by_status.map((item) => (
              <div key={item.status}>
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>{item.status}</span>
                  <span>{item.count}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-indigo-600 h-2 rounded-full"
                    style={{ width: `${stats.total_tasks ? (item.count / stats.total_tasks) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Tasks per User</h2>
          <div className="space-y-3">
            {stats.tasks_per_user.map((user) => (
              <div key={user.user_id}>
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>{user.user_name}</span>
                  <span>{user.task_count} tasks</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: `${stats.total_tasks ? (user.task_count / stats.total_tasks) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {stats.overdue_tasks.length > 0 && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-red-600 mb-4">⚠️ Overdue Tasks</h2>
            <div className="space-y-4">
              {stats.overdue_tasks.map((task) => (
                <div key={task.id} className="border-l-4 border-red-500 pl-4">
                  <h3 className="font-medium text-gray-900">{task.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                  <div className="flex space-x-4 mt-2 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                      {task.status}
                    </span>
                    <span className={`font-medium ${getPriorityColor(task.priority)}`}>
                      {task.priority} Priority
                    </span>
                    <span className="text-red-600">
                      Due: {task.due_date ? format(new Date(task.due_date), 'MMM dd, yyyy') : 'No date'}
                    </span>
                    {task.assignee_name && (
                      <span className="text-gray-600">Assignee: {task.assignee_name}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};