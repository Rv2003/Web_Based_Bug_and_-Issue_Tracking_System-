import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api'
});

// get all issues from database
export const fetchIssues = async () =>
{
    try 
    {
        const response = await api.get('/issues');
        return response.data;
    } 
    catch (error) 
    {
        console.error('Error fetching issues', error);
        return [];
    }
};

// add new issue to database
export const createIssue = async (issueData) =>
{
    try 
    {
        const response = await api.post('/issues', issueData);
        return response.data;
    } 
    catch (error) 
    {
        console.error('Error creating issue', error);
        return null;
    }
};

// get all users
export const fetchUsers = async () =>
{
    try 
    {
        const response = await api.get('/users');
        return response.data;
    } 
    catch (error) 
    {
        console.error('Error fetching users', error);
        return [];
    }
};
