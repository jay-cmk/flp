import { useEffect, useState } from 'react';
import TextField from '@mui/material/TextField';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { adminLoginUser } from '../../actions/userAction';
import BackdropLoader from '../Layouts/BackdropLoader';
import MetaData from '../Layouts/MetaData';

const AdminLogin = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { isAuthenticated, loading, user } = useSelector((state) => state.user);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (loading === false && isAuthenticated && user?.role === 'admin') {
            navigate('/admin/dashboard', { replace: true });
        }
    }, [isAuthenticated, loading, navigate, user]);

    const handleLogin = async (event) => {
        event.preventDefault();
        setError('');
        setSubmitting(true);

        try {
            await dispatch(adminLoginUser(email, password));
            setSubmitting(false);
            navigate('/admin/dashboard', { replace: true });
        } catch (loginError) {
            setError(
                loginError.response?.data?.message ||
                'Unable to sign in right now. Please try again.'
            );
            setSubmitting(false);
        }
    };

    return (
        <>
            <MetaData title="Admin Login | Flipkart" />
            {(loading || submitting) && <BackdropLoader />}
            <main className="w-full mt-12 sm:pt-20 sm:mt-0 px-4">
                <div className="flex w-full max-w-3xl mx-auto my-8 sm:my-12 bg-white shadow-lg">
                    <section className="hidden sm:flex w-2/5 flex-col gap-4 bg-primary-blue p-10">
                        <h1 className="text-3xl font-medium text-white">Admin Login</h1>
                        <p className="text-lg text-gray-200">
                            Sign in with an authorized administrator account to manage the store.
                        </p>
                    </section>

                    <section className="flex-1 min-w-0 p-6 sm:p-10">
                        <h1 className="mb-2 text-2xl font-medium text-gray-800 sm:hidden">
                            Admin Login
                        </h1>
                        <p className="mb-6 text-sm text-gray-600">
                            This sign-in is separate from customer login and registration.
                        </p>

                        {isAuthenticated && user?.role !== 'admin' && (
                            <p className="mb-4 rounded border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800" role="alert">
                                Your account is not authorized for admin access. Sign out of your customer account and use an authorized admin account.
                            </p>
                        )}

                        {error && (
                            <p className="mb-4 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700" role="alert">
                                {error}
                            </p>
                        )}

                        <form onSubmit={handleLogin}>
                            <div className="flex flex-col gap-4">
                                <TextField
                                    fullWidth
                                    id="admin-email"
                                    label="Admin email"
                                    type="email"
                                    autoComplete="username"
                                    value={email}
                                    onChange={(event) => setEmail(event.target.value)}
                                    required
                                />
                                <TextField
                                    fullWidth
                                    id="admin-password"
                                    label="Password"
                                    type="password"
                                    autoComplete="current-password"
                                    value={password}
                                    onChange={(event) => setPassword(event.target.value)}
                                    required
                                />
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="mt-2 w-full rounded-sm bg-primary-orange py-3 font-medium text-white shadow hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {submitting ? 'Signing in...' : 'Sign in as Admin'}
                                </button>
                            </div>
                        </form>

                        <p className="mt-6 text-center text-sm text-gray-600">
                            Customer?{' '}
                            <Link to="/login" className="font-medium text-primary-blue hover:underline">
                                Go to customer login
                            </Link>
                        </p>
                    </section>
                </div>
            </main>
        </>
    );
};

export default AdminLogin;
