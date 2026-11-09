import { useCallback, useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import TaskModal from './components/TaskModal';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Board from './pages/Board';
import Team from './pages/Team';
import AdminDashboard from './pages/AdminDashboard';
import { 
    fetchIssues, 
    createIssue, 
    updateIssue, 
    loginUser, 
    registerUser, 
    fetchUsers,
    adminCreateUser,
    adminUpdateUser,
    adminDeleteUser,
    adminUpdateStatus
} from './services/api';
import { initialTasks, people, ROLE_PRESETS } from './data/mockData';
import './App.css';

// Helper to normalize user attributes
const normalizeUser = (rawUser) => {
    if (!rawUser) return null;
    const sysRole = rawUser.systemRole || (rawUser.email === 'admin@example.com' || rawUser.email === 'priya@example.com' ? 'admin' : 'member');
    const perms = (rawUser.permissions && rawUser.permissions.length > 0)
        ? rawUser.permissions
        : (ROLE_PRESETS[sysRole]?.permissions || ROLE_PRESETS.member.permissions);
    return {
        ...rawUser,
        systemRole: sysRole,
        permissions: perms,
        status: rawUser.status || 'active',
        capacity: rawUser.capacity || 14
    };
};

export default function App() 
{
    // Restore authenticated user from localStorage if present
    const [user, setUser] = useState(() => {
        try {
            const saved = localStorage.getItem('currentUser');
            return saved ? normalizeUser(JSON.parse(saved)) : null;
        } catch {
            return null;
        }
    });

    const [authMode, setAuthMode] = useState('login');
    const [members, setMembers] = useState(people);
    const [page, setPage] = useState(() => user?.systemRole === 'admin' ? 'admin' : 'dashboard');
    const [tasks, setTasks] = useState(initialTasks);
    const [query, setQuery] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [bannerAlert, setBannerAlert] = useState(null);

    const triggerAlert = (message) => {
        setBannerAlert(message);
        setTimeout(() => setBannerAlert(null), 3500);
    };

    // Permission checks for currently logged-in user
    const canCreateTask = user?.systemRole === 'admin' || user?.permissions?.includes('create_tasks');
    const canEditTask = user?.systemRole === 'admin' || user?.permissions?.includes('edit_tasks');

    // load issues and team members from database when app starts
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

        const loadUsers = async () => {
            const dbUsers = await fetchUsers();
            setMembers(dbUsers === null ? people : dbUsers.map(normalizeUser));
        };
        
        loadData();
        loadUsers();
    }, []);

    const closeModal = useCallback(() => setModalOpen(false), []);

    const handleLogin = async (email, password) => {
        const res = await loginUser({ email, password });
        if (res.success) {
            const normUser = normalizeUser(res.data.user);
            setUser(normUser);
            setPage(normUser.systemRole === 'admin' ? 'admin' : 'dashboard');
            localStorage.setItem('currentUser', JSON.stringify(normUser));
            if (res.data.token) {
                localStorage.setItem('token', res.data.token);
            }
            return { success: true };
        } else {
            return { success: false, error: res.error };
        }
    };

    const handleRegister = async (userData) => {
        const res = await registerUser(userData);
        if (res.success) {
            const normUser = normalizeUser(res.data.user);
            setUser(normUser);
            localStorage.setItem('currentUser', JSON.stringify(normUser));
            if (res.data.token) {
                localStorage.setItem('token', res.data.token);
            }
            setMembers((prev) => {
                const exists = prev.some((m) => m.id === normUser.id || m.email === normUser.email);
                return exists ? prev : [normUser, ...prev];
            });
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
        if (!canEditTask) {
            triggerAlert('Permission denied: You do not have permission to edit or move tasks.');
            return;
        }

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
        if (!canCreateTask) {
            triggerAlert('Permission denied: You do not have permission to create tasks.');
            return;
        }

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

    // -----------------------------------------------------------------
    // Admin Management Handlers
    // -----------------------------------------------------------------
    const handleAddUser = async (newUserData) => {
        const res = await adminCreateUser(newUserData);
        let createdUser;
        if (res.success && res.data) {
            createdUser = normalizeUser(res.data);
        } else {
            // Local fallback
            const localId = newUserData.email.split('@')[0].toLowerCase();
            createdUser = normalizeUser({
                ...newUserData,
                id: localId,
                _id: localId
            });
        }

        setMembers(prev => [createdUser, ...prev]);
        return createdUser;
    };

    const handleUpdateUser = async (id, updatedData) => {
        const res = await adminUpdateUser(id, updatedData);
        const resolved = (res.success && res.data) ? normalizeUser(res.data) : normalizeUser({ ...updatedData, id });

        setMembers(prev => prev.map(m => (m.id === id || m._id === id ? { ...m, ...resolved } : m)));

        // If the admin modified their own account, update session
        if (user && (user.id === id || user._id === id || user.email === updatedData.email)) {
            const updatedSelf = { ...user, ...resolved };
            setUser(updatedSelf);
            localStorage.setItem('currentUser', JSON.stringify(updatedSelf));
        }

        return resolved;
    };

    const handleDeleteUser = async (id) => {
        const res = await adminDeleteUser(id);
        if (!res.success && res.error && !res.error.includes('Network Error')) {
            throw new Error(res.error);
        }
        setMembers(prev => prev.filter(m => m.id !== id && m._id !== id));
        return true;
    };

    const handleToggleStatus = async (id, nextStatus) => {
        const res = await adminUpdateStatus(id, nextStatus);
        setMembers(prev => prev.map(m => {
            if (m.id === id || m._id === id) {
                return { ...m, status: nextStatus };
            }
            return m;
        }));

        if (user && (user.id === id || user._id === id)) {
            const updatedSelf = { ...user, status: nextStatus };
            setUser(updatedSelf);
            localStorage.setItem('currentUser', JSON.stringify(updatedSelf));
        }

        return res;
    };

    if (!user) 
    {
        return authMode === 'register' ? (
            <Register onRegister={handleRegister} onSwitchToLogin={() => setAuthMode('login')} />
        ) : (
            <Login onLogin={handleLogin} onSwitchToRegister={() => setAuthMode('register')} />
        );
    }

    return (
        <div className="app">
            {bannerAlert && (
                <div style={{
                    position: 'fixed',
                    top: '16px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 9999,
                    backgroundColor: '#fee2e2',
                    color: '#991b1b',
                    border: '1px solid #f87171',
                    borderRadius: '6px',
                    padding: '10px 18px',
                    fontSize: '14px',
                    fontWeight: '600',
                    boxShadow: '0 4px 14px rgba(0,0,0,0.1)'
                }}>
                    {bannerAlert}
                </div>
            )}

            <Sidebar page={page} onNavigate={setPage} user={user} onSignOut={handleSignOut} />
            <div className="app__main">
                <Topbar 
                    query={query} 
                    onQuery={setQuery} 
                    onNewTask={() => {
                        if (!canCreateTask) {
                            triggerAlert('Permission denied: You do not have permission to create tasks.');
                            return;
                        }
                        setModalOpen(true);
                    }}
                    canCreateTask={canCreateTask}
                />
                <main className="app__content">
                    {page === 'dashboard' && <Dashboard tasks={tasks} onNavigate={setPage} />}
                    {page === 'projects' && <Projects query={query} />}
                    {page === 'board' && (
                        <Board 
                            tasks={tasks} 
                            onMove={moveTask} 
                            query={query} 
                            onNewTask={() => {
                                if (!canCreateTask) {
                                    triggerAlert('Permission denied: You do not have permission to create tasks.');
                                    return;
                                }
                                setModalOpen(true);
                            }} 
                        />
                    )}
                    {page === 'team' && <Team tasks={tasks} members={members} />}
                    {page === 'admin' && (
                        <AdminDashboard 
                            currentUser={user}
                            users={members}
                            onAddUser={handleAddUser}
                            onUpdateUser={handleUpdateUser}
                            onDeleteUser={handleDeleteUser}
                            onToggleStatus={handleToggleStatus}
                        />
                    )}
                </main>
            </div>
            <TaskModal open={modalOpen} onClose={closeModal} onCreate={handleCreateTask} members={members} />
        </div>
    );
}
