import { useCallback, useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import TaskModal from './components/TaskModal';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Board from './pages/Board';
import Team from './pages/Team';
import { fetchIssues, createIssue } from './services/api';
// keep mock user logic for now
import { getPerson } from './data/mockData';
import './App.css';

export default function App() 
{
    const [user, setUser] = useState(null);
    const [page, setPage] = useState('dashboard');
    const [tasks, setTasks] = useState([]);
    const [query, setQuery] = useState('');
    const [modalOpen, setModalOpen] = useState(false);

    // load issues from database when app starts
    useEffect(() => 
    {
        const loadData = async () => 
        {
            const data = await fetchIssues();
            
            // format database items to match UI requirements
            const formattedTasks = data.map(item => ({
                ...item,
                id: item._id,
                assignee: item.assignee ? item.assignee.name : 'unassigned',
                points: 3, 
                due: item.dueDate || '2026-10-10'
            }));
            
            setTasks(formattedTasks);
        };
        
        loadData();
    }, []);

    const closeModal = useCallback(() => setModalOpen(false), []);

    const moveTask = (id, status) => 
    {
        // update status in UI (database update will be added later)
        setTasks((all) => all.map((t) => (t.id === id ? { ...t, status } : t)));
    };

    const handleCreateTask = async (draft) => 
    {
        // send data to backend database
        const newTask = await createIssue({
            title: draft.title,
            description: draft.description || "",
            project: draft.project || "web",
            status: "todo",
            priority: draft.priority || "low"
        });

        if (newTask)
        {
            const taskWithUIId = { 
                ...newTask, 
                id: newTask._id, 
                assignee: 'unassigned', 
                points: 3, 
                due: '2026-10-10' 
            };
            setTasks((all) => [...all, taskWithUIId]);
        }
        
        setModalOpen(false);
        setPage('board');
    };

    if (!user) 
    {
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
            <TaskModal open={modalOpen} onClose={closeModal} onCreate={handleCreateTask} />
        </div>
    );
}
