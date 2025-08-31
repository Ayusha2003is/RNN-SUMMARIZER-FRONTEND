import React, { useState, useEffect } from 'react';
import { FaPlus, FaTrash, FaSignInAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

function ToDoList() {
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState('');
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        loadUserTodos(parsedUser.email || parsedUser.username);
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    } else {
      // Demo user (not logged in)
      setUser(null);
      setTasks([
        { id: 1, text: 'Welcome to the demo list!', createdAt: new Date().toISOString() },
        { id: 2, text: 'Login to save your tasks permanently.', createdAt: new Date().toISOString() },
      ]);
    }

    setIsLoading(false);
  }, []);

  const loadUserTodos = (userIdentifier) => {
    const savedTodos = localStorage.getItem(`todos_${userIdentifier}`);
    if (savedTodos) setTasks(JSON.parse(savedTodos));
  };

  const saveUserTodos = (updatedTasks, userIdentifier) => {
    localStorage.setItem(`todos_${userIdentifier}`, JSON.stringify(updatedTasks));
  };

  const addTask = () => {
    if (input.trim()) {
      const updatedTasks = [
        ...tasks,
        { id: Date.now(), text: input.trim(), createdAt: new Date().toISOString() },
      ];
      setTasks(updatedTasks);
      setInput('');

      // Only save if logged in
      if (user) {
        saveUserTodos(updatedTasks, user.email || user.username);
      }
    }
  };

  const removeTask = (taskId) => {
    const updatedTasks = tasks.filter((task) => task.id !== taskId);
    setTasks(updatedTasks);

    if (user) {
      saveUserTodos(updatedTasks, user.email || user.username);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') addTask();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600 font-mono">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-12 font-mono flex flex-col items-center text-gray-900">
      <h1 className="text-4xl font-bold mb-6 flex items-center gap-3 mt-9">
        <span>My To-Do List</span>
      </h1>

      <div className="bg-white shadow-lg rounded-xl p-6 w-full max-w-2xl border border-gray-200">
        {/* Input Row */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter a task..."
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-800 transition"
          />
          <button
            onClick={addTask}
            disabled={!input.trim()}
            className={`px-4 py-2 rounded-md flex items-center gap-2 transition-colors duration-200 ${
              input.trim()
                ? 'bg-gray-900 hover:bg-gray-800 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <FaPlus /> Add Task
          </button>
        </div>

        {/* Task List */}
        <ul className="space-y-3">
          {tasks.map((task) => (
            <li
              key={task.id}
              className="bg-gray-50 border border-gray-200 p-3 rounded-lg flex justify-between items-center group hover:bg-gray-100 transition-colors duration-200"
            >
              <div className="flex-1">
                <span className="text-gray-800">{task.text}</span>
                {task.createdAt && (
                  <div className="text-xs text-gray-500 mt-1">
                    Added: {new Date(task.createdAt).toLocaleDateString()}
                  </div>
                )}
              </div>
              <button
                onClick={() => removeTask(task.id)}
                className="text-gray-400 hover:text-red-600 transition-colors duration-200 opacity-70 group-hover:opacity-100"
                title="Delete task"
              >
                <FaTrash />
              </button>
            </li>
          ))}
        </ul>

        {tasks.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-400 text-lg mb-2">No tasks added yet!</p>
            <p className="text-gray-500 text-sm">Add your first task above to get started.</p>
          </div>
        )}

        {tasks.length > 0 && (
          <div className="mt-6 text-center text-gray-600 text-sm">
            {tasks.length} task{tasks.length !== 1 ? 's' : ''} in your list
          </div>
        )}

        <div className="mt-4 text-center text-xs text-gray-500">
          ✓ Your tasks {user ? 'are automatically saved' : 'are only temporary (demo mode)'}
        </div>

        {/* Show login button if user is not logged in */}
        {!user && (
          <div className="mt-6 flex justify-center">
            <button
              onClick={() => navigate('/login')}
              className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-6 py-2 rounded-md transition-colors duration-200"
            >
              <FaSignInAlt /> Login to Save Tasks
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ToDoList;
