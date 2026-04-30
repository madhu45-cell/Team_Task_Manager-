import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { TaskCard } from '../components/TaskCard';
import { CreateTaskModal } from '../components/CreateTaskModal';
import { ManageMembersModal } from '../components/ManageMembersModal';
import api from '../services/api';
import toast from 'react-hot-toast';
import { PlusIcon, UserGroupIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

export const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetchProjectData();
  }, [id]);

  const fetchProjectData = async () => {
    try {
      const [projectRes, tasksRes, membersRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/tasks/projects/${id}/tasks`),
        api.get(`/projects/${id}/members`)
      ]);
      setProject(projectRes.data);
      setTasks(tasksRes.data);
      setMembers(membersRes.data);
      setIsAdmin(projectRes.data.role === 'admin');
    } catch (error) {
      toast.error('Failed to load project');
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  };

  // ✅ FIX: Robust error extraction
  const handleCreateTask = async (taskData) => {
    try {
      const response = await api.post(`/tasks/projects/${id}/tasks`, taskData);
      setTasks([response.data, ...tasks]);
      toast.success('Task created successfully');
    } catch (error) {
      let errorMessage = 'Failed to create task';
      if (error.response?.data?.detail) {
        const detail = error.response.data.detail;
        if (Array.isArray(detail)) {
          // Extract messages from each validation error
          errorMessage = detail.map(err => err.msg).join(', ');
        } else if (typeof detail === 'string') {
          errorMessage = detail;
        } else {
          errorMessage = JSON.stringify(detail);
        }
      }
      toast.error(errorMessage);
    }
  };

  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    try {
      const response = await api.put(`/tasks/${taskId}`, { status: newStatus });
      setTasks(tasks.map(t => t.id === taskId ? response.data : t));
      toast.success('Task updated');
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks(tasks.filter(t => t.id !== taskId));
      toast.success('Task deleted');
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };

  // Placeholder for edit – you can implement a modal later
  const handleEditTask = (task) => {
    toast('Edit functionality coming soon');
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">Loading...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button onClick={() => navigate('/projects')} className="text-gray-600 hover:text-gray-900">
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
              <p className="text-gray-500 mt-1">{project.description}</p>
            </div>
          </div>
          <div className="flex space-x-3">
            {isAdmin && (
              <button
                onClick={() => setShowMembersModal(true)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <UserGroupIcon className="h-5 w-5 mr-2" />
                Members ({members.length})
              </button>
            )}
            <button
              onClick={() => setShowTaskModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Add Task
            </button>
          </div>
        </div>

        {/* Task Board */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {['To Do', 'In Progress', 'Done'].map((status) => (
            <div key={status} className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">{status}</h3>
              <div className="space-y-3">
                {tasks.filter(t => t.status === status).map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    isAdmin={isAdmin}
                    onEdit={handleEditTask}
                    onDelete={handleDeleteTask}
                    onStatusChange={handleUpdateTaskStatus}
                  />
                ))}
                {tasks.filter(t => t.status === status).length === 0 && (
                  <p className="text-gray-500 text-sm text-center py-4">No tasks</p>
                )}
              </div>
            </div>
          ))}
        </div>

        <CreateTaskModal
          isOpen={showTaskModal}
          onClose={() => setShowTaskModal(false)}
          onSubmit={handleCreateTask}
          members={members}
        />

        <ManageMembersModal
          isOpen={showMembersModal}
          onClose={() => setShowMembersModal(false)}
          projectId={id}
          members={members}
          onMemberAdded={fetchProjectData}
          onMemberRemoved={fetchProjectData}
        />
      </div>
    </Layout>
  );
};