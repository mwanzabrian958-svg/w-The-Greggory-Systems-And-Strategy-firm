import { TaskProvider } from '../context/TaskContext';
import TaskManager from '../components/TaskManager';

const TaskManagerPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <TaskProvider>
        <TaskManager />
      </TaskProvider>
    </div>
  );
};

export default TaskManagerPage;
