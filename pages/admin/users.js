import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useAuthStore } from '../../store/useStore'
import toast, { Toaster } from 'react-hot-toast'
import axios from 'axios'

export default function AdminUsers() {
  const router = useRouter()
  const { isAuthenticated, user } = useAuthStore()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      router.push('/admin/login')
      return
    }
    fetchUsers()
  }, [isAuthenticated, user])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await axios.get('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setUsers(response.data.users)
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const handleRoleChange = async (userId, newRole) => {
    // Prevent demoting the only admin
    const adminCount = users.filter(u => u.role === 'admin').length
    const targetUser = users.find(u => u._id === userId)
    
    if (adminCount === 1 && targetUser.role === 'admin' && newRole === 'user') {
      toast.error('Cannot demote the only admin. Promote another user to admin first.')
      return
    }

    try {
      const token = localStorage.getItem('token')
      console.log('Updating user role:', { userId, newRole })
      
      const response = await axios.put(`/api/admin/users/${userId}`, 
        { role: newRole },
        { headers: { Authorization: `Bearer ${token}` }}
      )
      
      console.log('Role update response:', response.data)
      toast.success(`User role updated to ${newRole}`)
      fetchUsers()
    } catch (error) {
      console.error('Role update error:', error.response?.data || error.message)
      toast.error(error.response?.data?.message || 'Failed to update user role')
    }
  }

  const handleDeleteUser = async (userId) => {
    const targetUser = users.find(u => u._id === userId)
    
    // Prevent deleting admin
    if (targetUser.role === 'admin') {
      toast.error('Cannot delete admin account. Demote to user first.')
      return
    }

    // Prevent deleting yourself
    if (userId === user?._id) {
      toast.error('Cannot delete your own account.')
      return
    }

    if (!confirm('Are you sure you want to delete this user?')) return

    try {
      const token = localStorage.getItem('token')
      await axios.delete(`/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      toast.success('User deleted')
      fetchUsers()
    } catch (error) {
      toast.error('Failed to delete user')
    }
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return null
  }

  return (
    <>
      <Head>
        <title>Manage Users - VSTRA Admin</title>
      </Head>
      <Toaster position="top-center" />

      <div className="min-h-screen bg-gray-50">
        <nav className="bg-black text-white shadow-lg">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-8">
                <Link href="/admin/dashboard">
                  <h1 className="text-2xl font-bold cursor-pointer">VSTRA Admin</h1>
                </Link>
                <div className="hidden md:flex gap-6">
                  <Link href="/admin/dashboard">
                    <span className="text-sm hover:text-gray-300 cursor-pointer">Dashboard</span>
                  </Link>
                  <Link href="/admin/products">
                    <span className="text-sm hover:text-gray-300 cursor-pointer">Products</span>
                  </Link>
                  <Link href="/admin/orders">
                    <span className="text-sm hover:text-gray-300 cursor-pointer">Orders</span>
                  </Link>
                  <Link href="/admin/users">
                    <span className="text-sm text-gray-300 border-b-2 border-white cursor-pointer">Users</span>
                  </Link>
                </div>
              </div>
              <Link href="/">
                <button className="text-sm bg-white text-black px-4 py-2 hover:bg-gray-200">
                  View Site
                </button>
              </Link>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-6 py-12">
          <h2 className="text-4xl font-bold mb-8">Manage Users</h2>

          <div className="bg-white shadow-lg">
            {loading ? (
              <div className="text-center py-20">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">👥</div>
                <p className="text-gray-600 text-lg mb-4">No users yet</p>
                <p className="text-sm text-gray-500">Users will appear here when they register</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100 border-b">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Name</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Email</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Role</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Joined</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u._id} className="border-b hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <p className="font-semibold">{u.name}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-gray-600">{u.email}</p>
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={u.role}
                            onChange={(e) => handleRoleChange(u._id, e.target.value)}
                            disabled={u._id === user?._id}
                            className={`px-3 py-1 rounded text-sm font-semibold border cursor-pointer ${
                              u.role === 'admin' 
                                ? 'bg-purple-100 text-purple-800' 
                                : 'bg-gray-100 text-gray-800'
                            } ${u._id === user?._id ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                          </select>
                          {u.role === 'admin' && (
                            <span className="ml-2 text-xs text-purple-600">👑</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleDeleteUser(u._id)}
                            disabled={u._id === user?._id || u.role === 'admin'}
                            className={`px-3 py-1 text-white text-sm ${
                              u._id === user?._id || u.role === 'admin'
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-red-600 hover:bg-red-700'
                            }`}
                          >
                            {u.role === 'admin' ? 'Protected' : 'Delete'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {!loading && users.length > 0 && (
            <div className="mt-6 text-center text-gray-600">
              Total Users: {users.length}
            </div>
          )}
        </main>
      </div>
    </>
  )
}

