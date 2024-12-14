document.addEventListener('DOMContentLoaded', () => {
    const userForm = document.getElementById('userForm');
    const usersTableBody = document.getElementById('usersTableBody');

    // Fetch and display users
    const fetchUsers = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/users');
            const data = await response.json();
            usersTableBody.innerHTML = data.data.map(user => `
                <tr>
                    <td>${user.first_name}</td>
                    <td>${user.last_name}</td>
                    <td>${user.email}</td>
                    <td>${user.gender}</td>
                    <td class="actions">
                        <button onclick="editUser('${user._id}')">Edit</button>
                        <button onclick="deleteUser('${user._id}')">Delete</button>
                    </td>
                </tr>
            `).join('');
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    // Add new user
    userForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(userForm);
        const user = Object.fromEntries(formData.entries());

        try {
            await fetch('http://localhost:8000/api/user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(user)
            });
            userForm.reset();
            fetchUsers();
        } catch (error) {
            console.error('Error adding user:', error);
        }
    });

    // Edit user
    window.editUser = async (id) => {
        const user = prompt("Enter new details in the format: first_name,last_name,email,gender");
        if (user) {
            const [first_name, last_name, email, gender] = user.split(',');
            try {
                await fetch(`http://localhost:8000/api/user/${id}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ first_name, last_name, email, gender })
                });
                fetchUsers();
            } catch (error) {
                console.error('Error editing user:', error);
            }
        }
    };

    // Delete user
    window.deleteUser = async (id) => {
        if (confirm("Are you sure you want to delete this user?")) {
            try {
                await fetch(`http://localhost:8000/api/user/${id}`, {
                    method: 'DELETE'
                });
                fetchUsers();
            } catch (error) {
                console.error('Error deleting user:', error);
            }
        }
    };

    // Initial fetch of users
    fetchUsers();
});