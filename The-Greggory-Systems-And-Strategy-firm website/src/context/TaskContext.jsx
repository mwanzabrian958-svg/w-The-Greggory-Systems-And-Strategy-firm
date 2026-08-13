import { createContext, useContext, useReducer, useEffect } from 'react';

const TaskContext = createContext();

const initialState = {
  tasks: [],
  loading: true,
  error: null
};

const taskReducer = (state, action) => {
  switch (action.type) {
    case 'SET_TASKS':
      return { ...state, tasks: action.payload, loading: false };
    case 'ADD_TASK':
      return { ...state, tasks: [...state.tasks, action.payload] };
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.id ? { ...task, ...action.payload } : task
        )
      };
    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter(task => task.id !== action.payload)
      };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    default:
      return state;
  }
};

export const TaskProvider = ({ children }) => {
  const [state, dispatch] = useReducer(taskReducer, initialState);

  // Load tasks from localStorage on initial render
  useEffect(() => {
    try {
      const savedTasks = localStorage.getItem('greggory_tasks');
      if (savedTasks) {
        dispatch({ type: 'SET_TASKS', payload: JSON.parse(savedTasks) });
      } else {
        // Initialize with empty array if no tasks exist
        localStorage.setItem('greggory_tasks', JSON.stringify([]));
        dispatch({ type: 'SET_TASKS', payload: [] });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Error loading tasks' });
    }
  }, []);

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    if (state.tasks.length > 0 || state.tasks.length === 0) {
      localStorage.setItem('greggory_tasks', JSON.stringify(state.tasks));
    }
  }, [state.tasks]);

  const addTask = (task) => {
    const newTask = {
      ...task,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    dispatch({ type: 'ADD_TASK', payload: newTask });
    return newTask;
  };

  const updateTask = (id, updates) => {
    dispatch({
      type: 'UPDATE_TASK',
      payload: { id, ...updates, updatedAt: new Date().toISOString() }
    });
  };

  const deleteTask = (id) => {
    dispatch({ type: 'DELETE_TASK', payload: id });
  };

  return (
    <TaskContext.Provider
      value={{
        tasks: state.tasks,
        loading: state.loading,
        error: state.error,
        addTask,
        updateTask,
        deleteTask
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
};
