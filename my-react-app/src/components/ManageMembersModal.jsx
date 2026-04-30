import { useState } from 'react';
import { XMarkIcon, UserPlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import api from '../services/api';
import toast from 'react-hot-toast';

export const ManageMembersModal = ({ isOpen, onClose, projectId, members, onMemberAdded, onMemberRemoved }) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');
  const [loading, setLoading] = useState(false);

  const handleAddMember = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post(`/projects/${projectId}/members`, { email, role });
      toast.success('Member added successfully');
      setEmail('');
      onMemberAdded();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to add member');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!confirm('Are you sure you want to remove this member?')) return;
    try {
      await api.delete(`/projects/${projectId}/members/${userId}`);
      toast.success('Member removed');
      onMemberRemoved();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to remove member');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Manage Members</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        
        <form onSubmit={handleAddMember} className="mb-6">
          <div className="flex space-x-2">
            <input
              type="email"
              placeholder="Member email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <UserPlusIcon className="h-4 w-4 mr-1" />
              Add
            </button>
          </div>
        </form>

        <div className="space-y-2 max-h-64 overflow-y-auto">
          {members.map(member => (
            <div key={member.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">{member.name}</p>
                <p className="text-sm text-gray-500">{member.email}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  member.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {member.role}
                </span>
              </div>
              <button
                onClick={() => handleRemoveMember(member.id)}
                className="text-red-600 hover:text-red-800"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
          ))}
          {members.length === 0 && (
            <p className="text-center text-gray-500 py-4">No members yet</p>
          )}
        </div>
      </div>
    </div>
  );
};