import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { useRole, type RoleSelection } from '../contexts/RoleContext';

export function Login() {
  const navigate = useNavigate();
  const { setRole } = useRole();
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const formData = new URLSearchParams();
      formData.append('username', userId);
      formData.append('password', password);

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Invalid credentials');
      }

      const data = await response.json();
      localStorage.setItem('token', data.access_token);
      
      // Decode JWT to set Role
      try {
        const payload = JSON.parse(atob(data.access_token.split('.')[1]));
        const roles: Record<string, RoleSelection> = {
          'ministry': 'Ministry',
          'state_nodal_authority': 'State Nodal Authority',
          'district_authority': 'District Authority',
          'member_of_parliament': 'Member of Parliament',
          'administrator': 'Administrator'
        };
        if (payload.role && roles[payload.role]) {
          setRole(roles[payload.role]);
        }
      } catch (e) {
        console.error("Failed to parse token payload", e);
      }

      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAutoFill = (u: string, p: string) => {
    setUserId(u);
    setPassword(p);
  };

  return (
    <div className="min-h-screen bg-forest-deep flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="h-16 w-16 bg-forest-primary rounded-xl flex items-center justify-center shadow-lg">
            <ShieldCheck className="w-10 h-10 text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white tracking-tight">
          MPLADS Intelligence
        </h2>
        <p className="mt-2 text-center text-sm text-mutedText">
          AI-Powered Monitoring & Decision Support
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-lg sm:px-10 border border-brandBorder">
          <form className="space-y-6" onSubmit={handleLogin}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}
            
            <div>
              <label htmlFor="userId" className="block text-sm font-medium text-charcoal">
                User ID
              </label>
              <div className="mt-1">
                <input
                  id="userId"
                  name="userId"
                  type="text"
                  required
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-brandBorder rounded-md shadow-sm placeholder-mutedText focus:outline-none focus:ring-forest-primary focus:border-forest-primary sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-charcoal">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-brandBorder rounded-md shadow-sm placeholder-mutedText focus:outline-none focus:ring-forest-primary focus:border-forest-primary sm:text-sm"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-forest-primary hover:bg-forest-deep focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-forest-primary transition-colors disabled:opacity-50"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </div>
          </form>
          
          <div className="mt-6">
            <div className="relative mb-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-brandBorder" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-mutedText">
                  Select a Demo Role
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <button onClick={() => handleAutoFill('ministry1', 'ministry123')} className="w-full text-left text-sm px-3 py-2 rounded-md hover:bg-white border border-brandBorder transition-colors">
                <span className="font-semibold text-charcoal">Ministry:</span> <span className="text-forest-primary">ministry1</span> / <span className="text-mutedText">ministry123</span>
              </button>
              <button onClick={() => handleAutoFill('state1', 'state123')} className="w-full text-left text-sm px-3 py-2 rounded-md hover:bg-white border border-brandBorder transition-colors">
                <span className="font-semibold text-charcoal">State Nodal:</span> <span className="text-forest-primary">state1</span> / <span className="text-mutedText">state123</span>
              </button>
              <button onClick={() => handleAutoFill('district1', 'district123')} className="w-full text-left text-sm px-3 py-2 rounded-md hover:bg-white border border-brandBorder transition-colors">
                <span className="font-semibold text-charcoal">District:</span> <span className="text-forest-primary">district1</span> / <span className="text-mutedText">district123</span>
              </button>
              <button onClick={() => handleAutoFill('mp1', 'mp123')} className="w-full text-left text-sm px-3 py-2 rounded-md hover:bg-white border border-brandBorder transition-colors">
                <span className="font-semibold text-charcoal">MP:</span> <span className="text-forest-primary">mp1</span> / <span className="text-mutedText">mp123</span>
              </button>
              <button onClick={() => handleAutoFill('admin1', 'admin123')} className="w-full text-left text-sm px-3 py-2 rounded-md hover:bg-white border border-brandBorder transition-colors">
                <span className="font-semibold text-charcoal">Admin:</span> <span className="text-forest-primary">admin1</span> / <span className="text-mutedText">admin123</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
