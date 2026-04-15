import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { BookOpen, Target, TrendingUp, FileText, Plus, LogOut, Brain, Award, MessageCircle, Briefcase } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Progress } from '../components/ui/progress';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, recsRes] = await Promise.all([
        axios.get(`${API}/dashboard/stats`, { withCredentials: true }),
        axios.get(`${API}/analysis/recommendations`, { withCredentials: true })
      ]);
      setStats(statsRes.data);
      setRecommendations(recsRes.data.recommendations || []);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${API}/auth/logout`, {}, { withCredentials: true });
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#050505' }}>
        <div className="text-center">
          <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-solid border-[#D4AF37] border-r-transparent"></div>
          <p className="mt-4 text-[#A1A1AA] font-outfit">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const chartData = stats?.progress?.slice(0, 6).map(p => ({
    name: p.subject?.length > 12 ? p.subject.substring(0, 12) + '...' : p.subject,
    score: Math.round(p.average_score)
  })) || [];

  return (
    <div className="min-h-screen" style={{ background: '#050505' }}>
      {/* Header */}
      <header className="glass-card border-b border-[rgba(255,255,255,0.1)] sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-[#D4AF37]" />
            <h1 className="font-playfair text-2xl font-bold">Exam Prep Hub</h1>
          </div>
          <nav className="hidden md:flex items-center gap-6 font-outfit text-sm">
            <Link to="/dashboard" className="text-[#D4AF37] font-semibold">Dashboard</Link>
            <Link to="/tests" className="text-[#A1A1AA] hover:text-[#D4AF37] transition-colors">Tests</Link>
            <Link to="/ai-teacher" className="text-[#A1A1AA] hover:text-[#D4AF37] transition-colors">AI Teacher</Link>
            <Link to="/interview" className="text-[#A1A1AA] hover:text-[#D4AF37] transition-colors">Interview</Link>
            <Link to="/materials" className="text-[#A1A1AA] hover:text-[#D4AF37] transition-colors">Materials</Link>
            <Link to="/analysis" className="text-[#A1A1AA] hover:text-[#D4AF37] transition-colors">Analysis</Link>
          </nav>
          <Button
            data-testid="logout-btn"
            onClick={handleLogout}
            variant="outline"
            className="border-[#D4AF37] text-[#D4AF37] hover:bg-[rgba(212,175,55,0.1)] font-outfit"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      {/* Mobile Nav */}
      <div className="md:hidden glass-card border-b border-[rgba(255,255,255,0.05)] overflow-x-auto">
        <div className="flex gap-4 px-6 py-3 font-outfit text-sm whitespace-nowrap">
          <Link to="/dashboard" className="text-[#D4AF37] font-semibold">Dashboard</Link>
          <Link to="/tests" className="text-[#A1A1AA]">Tests</Link>
          <Link to="/ai-teacher" className="text-[#A1A1AA]">AI Teacher</Link>
          <Link to="/interview" className="text-[#A1A1AA]">Interview</Link>
          <Link to="/materials" className="text-[#A1A1AA]">Materials</Link>
          <Link to="/analysis" className="text-[#A1A1AA]">Analysis</Link>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Welcome Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-3xl p-8 mb-8 gold-glow"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="font-playfair text-2xl sm:text-3xl font-bold mb-2">
                Welcome to Your <span className="text-gradient">Success Dashboard</span>
              </h2>
              <p className="text-[#A1A1AA] font-outfit">Track progress, ace exams, land your dream government job</p>
            </div>
            <Award className="w-16 h-16 text-[#D4AF37] hidden sm:block" />
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={<Target className="w-7 h-7 text-[#D4AF37]" />} title="Tests Done" value={stats?.total_tests || 0} />
          <StatCard icon={<TrendingUp className="w-7 h-7 text-[#D4AF37]" />} title="Avg Score" value={`${stats?.average_score || 0}%`} />
          <StatCard icon={<FileText className="w-7 h-7 text-[#D4AF37]" />} title="Materials" value={stats?.total_materials || 0} />
          <StatCard icon={<Brain className="w-7 h-7 text-[#D4AF37]" />} title="Subjects" value={stats?.progress?.length || 0} />
        </div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Performance Chart */}
          <Card className="lg:col-span-2 glass-card border-[rgba(255,255,255,0.1)]" data-testid="performance-chart">
            <CardHeader>
              <CardTitle className="font-playfair text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#D4AF37]" />
                Subject Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={chartData}>
                    <XAxis dataKey="name" stroke="#A1A1AA" fontSize={11} />
                    <YAxis stroke="#A1A1AA" fontSize={11} />
                    <Tooltip
                      contentStyle={{ background: '#09090b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '13px' }}
                      labelStyle={{ color: '#FFFFFF' }}
                    />
                    <Bar dataKey="score" fill="#D4AF37" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-64 flex items-center justify-center text-[#A1A1AA]">
                  <div className="text-center">
                    <Target className="w-10 h-10 mx-auto mb-3 opacity-40" />
                    <p className="font-outfit text-sm">Take your first test to see performance data</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="glass-card border-[rgba(255,255,255,0.1)]" data-testid="quick-actions">
            <CardHeader>
              <CardTitle className="font-playfair text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link to="/tests/create" className="block">
                <Button data-testid="start-mock-test-btn" className="w-full bg-[#D4AF37] hover:bg-[#B87333] text-black font-semibold font-outfit justify-start">
                  <Plus className="w-4 h-4 mr-2" />
                  Start Mock Test
                </Button>
              </Link>
              <Link to="/questions/generate" className="block">
                <Button data-testid="generate-questions-btn" variant="outline" className="w-full border-[#D4AF37] text-[#D4AF37] hover:bg-[rgba(212,175,55,0.1)] font-outfit justify-start">
                  <Brain className="w-4 h-4 mr-2" />
                  Generate AI Questions
                </Button>
              </Link>
              <Link to="/ai-teacher" className="block">
                <Button data-testid="ai-teacher-btn" variant="outline" className="w-full border-[rgba(255,255,255,0.15)] hover:border-[#D4AF37] font-outfit justify-start">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Ask AI Teacher
                </Button>
              </Link>
              <Link to="/interview" className="block">
                <Button data-testid="interview-prep-btn" variant="outline" className="w-full border-[rgba(255,255,255,0.15)] hover:border-[#D4AF37] font-outfit justify-start">
                  <Briefcase className="w-4 h-4 mr-2" />
                  Interview Prep
                </Button>
              </Link>
              <Link to="/materials" className="block">
                <Button data-testid="upload-material-btn" variant="outline" className="w-full border-[rgba(255,255,255,0.15)] hover:border-[#D4AF37] font-outfit justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  Upload Study Material
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* AI Recommendations */}
        {recommendations.length > 0 && (
          <Card className="glass-card border-[rgba(255,255,255,0.1)]" data-testid="ai-recommendations">
            <CardHeader>
              <CardTitle className="font-playfair text-lg flex items-center gap-2">
                <Brain className="w-5 h-5 text-[#D4AF37]" />
                AI Study Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[rgba(212,175,55,0.15)] border border-[rgba(212,175,55,0.3)] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-[#D4AF37] text-xs font-bold">{idx + 1}</span>
                    </div>
                    <p className="text-[#A1A1AA] text-sm leading-relaxed font-outfit">{rec}</p>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}

function StatCard({ icon, title, value }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card rounded-xl p-5 hover-lift"
    >
      <div className="mb-3">{icon}</div>
      <h3 className="text-[#A1A1AA] text-xs uppercase tracking-wider font-outfit mb-1">{title}</h3>
      <p className="font-playfair text-2xl font-bold">{value}</p>
    </motion.div>
  );
}
