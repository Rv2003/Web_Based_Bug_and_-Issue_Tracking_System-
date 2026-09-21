import { useCallback, useState } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import TaskModal from './components/TaskModal';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Board from './pages/Board';
import Team from './pages/Team';
import { initialTasks, getPerson } from './data/mockData';
import './App.css';

export default function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState('dashboard');
  const [tasks, setTasks] = useState(initialTasks);
  const [query, setQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const closeModal = useCallback(() => setModalOpen(false), []);

  const moveTask = (id, status) =>
    setTasks((all) => all.map((t) => (t.id === id ? { ...t, status } : t)));

  const createTask = (draft) => {
    const next = Math.max(...tasks.map((t) => Number(t.id.split('-')[1]))) + 1;
    setTasks((all) => [...all, { ...draft, id: `TRK-${next}`, status: 'todo' }]);
    setModalOpen(false);
    setPage('board');
  };

  if (!user) {
    return <Login onLogin={() => setUser(getPerson('priya'))} />;
  }

  return (
    <div className="app">
      <Sidebar page={page} onNavigate={setPage} user={user} onSignOut={() => setUser(null)} />
      <div className="app__main">
        <Topbar query={query} onQuery={setQuery} onNewTask={() => setModalOpen(true)} />
        <main className="app__content">
          {page === 'dashboard' && <Dashboard tasks={tasks} onNavigate={setPage} />}
          {page === 'projects' && <Projects query={query} />}
          {page === 'board' && <Board tasks={tasks} onMove={moveTask} query={query} onNewTask={() => setModalOpen(true)} />}
          {page === 'team' && <Team tasks={tasks} />}
        </main>
      </div>
      <TaskModal open={modalOpen} onClose={closeModal} onCreate={createTask} />
    </div>
  );
}
