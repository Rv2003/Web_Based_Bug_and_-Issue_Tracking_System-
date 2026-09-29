import { useCallback, useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import TaskModal from './components/TaskModal';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Board from './pages/Board';
import Team from './pages/Team';
import { fetchIssues, createIssue, updateIssue, loginUser } from './services/api';
import { initialTasks } from './data/mockData';
import './App.css';

export default function App() 
{
    // Restore authenticated user from localStorage if present
    const [user, setUser] = useState(() => {
        try {
            const saved = localStorage.getItem('currentUser');
            return saved ? JSON.parse(saved) : null;
        } catch {
            return null;
        }
    });

    const [page, setPage] = useState('dashboard');
    const [tasks, setTasks] = useState(initialTasks);
    const [query, setQuery] = useState('');
    const [modalOpen, setModalOpen] = useState(false);

    // load issues from database when app starts
    useEffect(() => 
    {
        const loadData = async () => 
        {
            const data = await fetchIssues();
            
            if (data && data.length > 0)
            {
                // format database items to match UI requirements
                const formattedTasks = data.map(item => ({
                    ...item,
                    id: item._id,
                    assignee: item.assignee || 'unassigned',
                    points: item.points || 3, 
                    due: item.dueDate ? item.dueDate.slice(0, 10) : (item.due || '2026-10-10')
                }));
                
                setTasks(formattedTasks);
            }
        };
        
        loadData();
    }, []);

    const closeModal = useCallback(() => setModalOpen(false), []);

    const handleLogin = async (email, password) => {
        const res = await loginUser({ email, password });
        if (res.success) {
            setUser(res.data.user);
            localStorage.setItem('currentUser', JSON.stringify(res.data.user));
            if (res.data.token) {
                localStorage.setItem('token', res.data.token);
            }
            return { success: true };
        } else {
            return { success: false, error: res.error };
        }
    };

    const handleSignOut = () => {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('token');
        setUser(null);
    };

    const moveTask = async (id, status) => 
    {
        // update status in UI immediately
        setTasks((all) => all.map((t) => (t.id === id ? { ...t, status } : t)));

        // persist to database if it's a MongoDB ID
        if (id && id.length === 24)
        {
            await updateIssue(id, { status });
        }
    };

    const handleCreateTask = async (draft) => 
    {
        // send data to backend database
        const newTask = await createIssue({
            title: draft.title,
            description: draft.description || "",
            project: draft.project || "web",
            status: "todo",
            priority: draft.priority || "low",
            assignee: draft.assignee || "unassigned",
            points: draft.points || 3,
            dueDate: draft.due || "2026-10-10"
        });

        if (newTask)
        {
            const taskWithUIId = { 
                ...newTask, 
                id: newTask._id, 
                assignee: newTask.assignee || draft.assignee || 'unassigned', 
                points: newTask.points || draft.points || 3, 
                due: draft.due || '2026-10-10' 
            };
            setTasks((all) => [taskWithUIId, ...all]);
        }
        else
        {
            const localTask = {
                ...draft,
                id: `TRK-${Math.floor(100 + Math.random() * 900)}`,
                status: 'todo'
            };
            setTasks((all) => [localTask, ...all]);
        }
        
        setModalOpen(false);
        setPage('board');
    };

    if (!user) 
    {
        return <Login onLogin={handleLogin} />;
    }

    return (
        <div className="app">
            <Sidebar page={page} onNavigate={setPage} user={user} onSignOut={handleSignOut} />
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
