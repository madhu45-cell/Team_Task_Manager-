import { format } from 'date-fns';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

export const TaskCard = ({ task, isAdmin, onEdit, onDelete, onStatusChange }) => {
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
      case 'High': return 'text-red-600 border-red-200 bg-red-50';
      case 'Medium': return 'text-yellow-600 border-yellow-200 bg-yellow-50';
      case 'Low': return 'text-green-600 border-green-200 bg-green-50';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h4 className="font-medium text-gray-900">{task.title}</h4>
          {task.description && (
            <p className="text-sm text-gray-500 mt-1">{task.description}</p>
          )}
        </div>
        <div className="flex space-x-2">
          {isAdmin && (
            <>
              <button onClick={() => onEdit(task)} className="text-gray-400 hover:text-indigo-600">
                <PencilIcon className="h-4 w-4" />
              </button>
              <button onClick={() => onDelete(task.id)} className="text-gray-400 hover:text-red-600">
                <TrashIcon className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      </div>
      
      <div className="mt-3 flex flex-wrap gap-2">
        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(task.status)}`}>
          {task.status}
        </span>
        <span className={`px-2 py-1 text-xs rounded-full border ${getPriorityColor(task.priority)}`}>
          {task.priority}
        </span>
        {task.due_date && (
          <span className="text-xs text-gray-500">
            Due: {format(new Date(task.due_date), 'MMM dd, yyyy')}
          </span>
        )}
        {task.assignee_name && (
          <span className="text-xs text-gray-500">
            Assigned to: {task.assignee_name}
          </span>
        )}
      </div>

      {!isAdmin && (
        <div className="mt-3">
          <select
            value={task.status}
            onChange={(e) => onStatusChange(task.id, e.target.value)}
            className="text-sm border rounded-md px-2 py-1"
          >
            <option value="To Do">To Do</option>
            <option value="In Progress">In Progress</option>
            <option value="Done">Done</option>
          </select>
        </div>
      )}
    </div>
  );
};