import Link from 'next/link'
import { useRouter } from 'next/router'

export default function AdminNav({ user }) {
  const router = useRouter()
  const currentPath = router.pathname

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: '📊' },
    { name: 'Products', path: '/admin/products', icon: '📦' },
    { name: 'Orders', path: '/admin/orders', icon: '📋' },
    { name: 'Sellers', path: '/admin/sellers', icon: '🏪' },
    { name: 'Users', path: '/admin/users', icon: '👥' },
    { name: 'Analytics', path: '/admin/analytics', icon: '📈' },
  ]

  return (
    <nav className="bg-black text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/admin/dashboard">
              <h1 className="text-2xl font-bold cursor-pointer">VSTRA Admin</h1>
            </Link>
            <div className="hidden md:flex gap-6">
              {navItems.map((item) => (
                <Link key={item.path} href={item.path}>
                  <span
                    className={`text-sm cursor-pointer transition-colors ${
                      currentPath === item.path
                        ? 'text-white border-b-2 border-white'
                        : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    {item.icon} {item.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/">
              <button className="text-sm bg-white text-black px-4 py-2 hover:bg-gray-200 transition-colors">
                View Site
              </button>
            </Link>
            <span className="text-sm hidden sm:block">
              {user?.name || 'Admin'}
            </span>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden mt-4 flex gap-3 overflow-x-auto pb-2">
          {navItems.map((item) => (
            <Link key={item.path} href={item.path}>
              <span
                className={`text-xs px-3 py-2 rounded whitespace-nowrap cursor-pointer ${
                  currentPath === item.path
                    ? 'bg-white text-black'
                    : 'bg-gray-800 text-gray-300'
                }`}
              >
                {item.icon} {item.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}

