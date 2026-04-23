import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { loginAdmin } from '../services/authService';
import { LayoutDashboard, Lock, User, ArrowLeft, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SHOP_CONFIG } from '../shopConfig';

export const Login = () => {
    const { isAdmin } = useStore();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // If already logged in, redirect to admin immediately
    React.useEffect(() => {
        if (isAdmin) navigate('/admin');
    }, [isAdmin, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        
        try {
            await loginAdmin(email, password);
            // navigate('/admin') is handled by the useEffect above once auth state updates
        } catch (err) {
            setError('Invalid credentials. Access denied.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-pine flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Decorative Background Elements */}
            <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-terracotta/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-cream/10 rounded-full blur-3xl animate-pulse"></div>

            <Link to="/" className="absolute top-8 left-8 flex items-center gap-2 text-cream/60 hover:text-terracotta transition-colors font-bold group">
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> Back to Website
            </Link>

            <div className="w-full max-w-md animate-fade-up">
                <div className="bg-white/80 backdrop-blur-xl border border-white/40 rounded-[2.5rem] shadow-2xl p-10 relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-terracotta via-terracotta-light to-terracotta"></div>
                    
                    <div className="text-center mb-10">
                        <div className="w-20 h-20 bg-pine rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-terracotta/30 shadow-inner">
                            <LayoutDashboard size={36} className="text-terracotta" />
                        </div>
                        <h1 className="font-serif text-3xl font-bold text-pine tracking-tight">{SHOP_CONFIG.name.split(' ')[0]} OS</h1>
                        <p className="text-gray-500 mt-2 font-medium">Secured Staff Portal</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                            <div className="relative group">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-terracotta transition-colors">
                                    <User size={20} />
                                </span>
                                <input 
                                    type="email" 
                                    autoFocus
                                    placeholder={`admin@${SHOP_CONFIG.website.replace('https://', '')}`} 
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    className="w-full bg-gray-50 border-2 border-gray-100 focus:border-terracotta/50 focus:bg-white rounded-2xl pl-12 pr-4 py-4 outline-none transition-all shadow-sm"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Password</label>
                            <div className="relative group">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-terracotta transition-colors">
                                    <Lock size={20} />
                                </span>
                                <input 
                                    type="password" 
                                    placeholder="••••••••" 
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    className="w-full bg-gray-50 border-2 border-gray-100 focus:border-terracotta/50 focus:bg-white rounded-2xl pl-12 pr-4 py-4 outline-none transition-all shadow-sm"
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-50 text-red-500 text-sm font-bold p-4 rounded-xl border border-red-100 flex items-center gap-3 animate-head-shake">
                                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                {error}
                            </div>
                        )}

                        <button 
                            type="submit" 
                            disabled={isLoading}
                            className="w-full mt-4 bg-terracotta text-white font-bold py-5 rounded-2xl hover:bg-terracotta-light active:scale-[0.98] transition-all shadow-xl shadow-terracotta/20 disabled:opacity-70 flex items-center justify-center gap-3 relative group overflow-hidden"
                        >
                            <span className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
                            <span className="relative z-10 flex items-center gap-3">
                                {isLoading ? (
                                    <>
                                        <Loader2 className="animate-spin" size={24} />
                                        Authenticating...
                                    </>
                                ) : (
                                    <>
                                        Secure Login <ArrowLeft className="rotate-180" size={20} />
                                    </>
                                )}
                            </span>
                        </button>
                    </form>

                    <p className="text-center mt-10 text-xs text-gray-400 font-medium leading-relaxed">
                        Authorized usage only. Site activities are logged.<br />
                        © 2026 {SHOP_CONFIG.name} OS v2.0
                    </p>
                </div>
            </div>
        </div>
    );
};
