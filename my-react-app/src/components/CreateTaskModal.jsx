import { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

export const CreateTaskModal = ({ isOpen, onClose, onSubmit, members }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [assigneeId, setAssigneeId] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Build payload with proper null values
    const payload = {
      title,
      description: description || null,
      due_date: dueDate ? new Date(dueDate).toISOString() : null,
      priority,
      assignee_id: assigneeId ? parseInt(assigneeId) : null,
    };
    onSubmit(payload);
    reset();
    onClose();
  };

  const reset = () => {
    setTitle('');
    setDescription('');
    setDueDate('');
    setPriority('Medium');
    setAssigneeId('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <div className="flex justify-between mb-4">
          <h2 className="text-xl font-semibold">Create Task</h2>
          <button onClick={onClose}><XMarkIcon className="h-6 w-6" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            required
            placeholder="Title"
            className="w-full border rounded p-2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            placeholder="Description"
            rows="3"
            className="w-full border rounded p-2"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <input
            type="date"
            className="w-full border rounded p-2"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
          <select
            className="w-full border rounded p-2"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>
          <select
            className="w-full border rounded p-2"
            value={assigneeId}
            onChange={(e) => setAssigneeId(e.target.value)}
          >
            <option value="">Unassigned</option>
            {members.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
          <div className="flex justify-end space-x-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded">Create</button>
          </div>
        </form>
      </div>
    </div>
  );
};