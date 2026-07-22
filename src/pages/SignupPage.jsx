import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Sparkles, Users } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const SignupPage = () => {
    const { signup } = useAuth();
    const navigate = useNavigate();

    const [displayName, setDisplayName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!displayName.trim() || !email.trim() || !password.trim()) {
            toast.error("Please fill in all fields");
            return;
        }
        setLoading(true);
        try {
            await signup({ displayName, email, password });
            toast.success("Account created!");
            navigate("/"); // becomes "/dashboard" once Dashboard is built
        } catch (err) {
            toast.error(err?.response?.data || "Could not create account");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
            <div className="w-full max-w-4xl flex rounded-2xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800">

                <div className="hidden md:flex md:w-1/2 flex-col items-center justify-center gap-4 bg-white dark:bg-slate-900 p-10 text-center">
                    <div className="h-14 w-14 rounded-xl bg-indigo-100 dark:bg-indigo-500/10 flex items-center justify-center">
                        <Sparkles className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-wide text-indigo-600 dark:text-indigo-400">SYNORA</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">AI-Powered Real-Time Team Collaboration</p>
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 rounded-full px-3 py-1">
                        <Users className="h-3.5 w-3.5" />
                        Live sync for modern teams
                    </div>
                </div>

                <div className="w-full md:w-1/2 bg-white dark:bg-slate-900 p-8 sm:p-10">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="h-10 w-10 rounded-lg bg-indigo-100 dark:bg-indigo-500/10 flex items-center justify-center">
                            <Sparkles className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Create your account</h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Start collaborating with your team</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Display Name</label>
                            <input
                                type="text"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                placeholder="Your name"
                                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@company.com"
                                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Create a password"
                                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-medium py-2.5 transition-colors"
                        >
                            {loading ? "Creating account..." : "Sign Up"}
                        </button>
                    </form>

                    <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
                        Already have an account?{" "}
                        <Link to="/login" className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
                            Login
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SignupPage;