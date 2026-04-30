import { useNavigate } from 'react-router-dom';
import { FolderIcon, UserGroupIcon } from '@heroicons/react/24/outline';

export const ProjectCard = ({ project }) => {
  const navigate = useNavigate();

  return (
    <div 
      onClick={() => navigate(`/projects/${project.id}`)}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center">
          <FolderIcon className="h-8 w-8 text-indigo-500" />
          <div className="ml-3">
            <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
              {project.description || 'No description'}
            </p>
          </div>
        </div>
        <span className={`px-2 py-1 text-xs rounded-full ${
          project.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {project.role}
        </span>
      </div>
      <div className="mt-4 flex items-center text-sm text-gray-500">
        <UserGroupIcon className="h-4 w-4 mr-1" />
        <span>Project Member</span>
      </div>
    </div>
  );
};