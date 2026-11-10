import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
});

// Attach JWT token from localStorage if present
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// login user
export const loginUser = async ({ email, password }) => {
    try {
        const response = await api.post('/users/login', { email, password });
        return { success: true, data: response.data };
    } catch (error) {
        const message = error.response?.data?.message || error.message || 'Login failed';
        return { success: false, error: message };
    }
};

// register user
export const registerUser = async (userData) => {
    try {
        const response = await api.post('/users/register', userData);
        return { success: true, data: response.data };
    } catch (error) {
        const message = error.response?.data?.message || error.message || 'Registration failed';
        return { success: false, error: message };
    }
};

// get all issues from database
export const fetchIssues = async () => {
    try {
        const response = await api.get('/issues');
        return response.data;
    } catch (error) {
        console.error('Error fetching issues', error);
        return null;
    }
};

// add new issue to database
export const createIssue = async (issueData) => {
    try {
        const response = await api.post('/issues', issueData);
        return response.data;
    } catch (error) {
        console.error('Error creating issue', error);
        return null;
    }
};

// update issue by id
export const updateIssue = async (id, updateData) => {
    try {
        const response = await api.put(`/issues/${id}`, updateData);
        return response.data;
    } catch (error) {
        console.error('Error updating issue', error);
        return null;
    }
};

// delete issue by id
export const deleteIssue = async (id) => {
    try {
        const response = await api.delete(`/issues/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting issue', error);
        return null;
    }
};

// get all users
export const fetchUsers = async () => {
    try {
        const response = await api.get('/users');
        return response.data;
    } catch (error) {
        console.error('Error fetching users', error);
        return null;
    }
};

// Admin: create user directly
export const adminCreateUser = async (userData) => {
    try {
        const response = await api.post('/users', userData);
        return { success: true, data: response.data };
    } catch (error) {
        const message = error.response?.data?.message || error.message || 'Failed to create user';
        return { success: false, error: message };
    }
};

// Admin: update user details and permissions
export const adminUpdateUser = async (id, userData) => {
    try {
        const response = await api.put(`/users/${id}`, userData);
        return { success: true, data: response.data };
    } catch (error) {
        const message = error.response?.data?.message || error.message || 'Failed to update user';
        return { success: false, error: message };
    }
};

// Admin: delete user
export const adminDeleteUser = async (id) => {
    try {
        const response = await api.delete(`/users/${id}`);
        return { success: true, data: response.data };
    } catch (error) {
        const message = error.response?.data?.message || error.message || 'Failed to delete user';
        return { success: false, error: message };
    }
};

// Admin: toggle or set status (active / suspended)
export const adminUpdateStatus = async (id, status) => {
    try {
        const response = await api.patch(`/users/${id}/status`, { status });
        return { success: true, data: response.data };
    } catch (error) {
        const message = error.response?.data?.message || error.message || 'Failed to update status';
        return { success: false, error: message };
    }
};

// Admin: update permissions and systemRole
export const adminUpdatePermissions = async (id, { systemRole, permissions }) => {
    try {
        const response = await api.patch(`/users/${id}/permissions`, { systemRole, permissions });
        return { success: true, data: response.data };
    } catch (error) {
        const message = error.response?.data?.message || error.message || 'Failed to update permissions';
        return { success: false, error: message };
    }
};
