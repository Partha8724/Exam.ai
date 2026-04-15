import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { BookOpen, Brain, TrendingUp, Target, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Progress } from '../components/ui/progress';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function Analysis() {
  const [progress, setProgress] = useState([]);
  const [recommendations, setRecommendations] = useState({ recommendations: [], weak_topics: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalysis();
  }, []);

  const fetchAnalysis = async () => {
    try {
      const [progressRes, recsRes] = await Promise.all([
        axios.get(`${API}/analysis/progress`, { withCredentials: true }),
        axios.get(`${API}/analysis/recommendations`, { withCredentials: true })
      ]);
      setProgress(progressRes.data);
      setRecommendations(recsRes.data);
    } catch (error) {
      console.error('Failed to fetch analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="glass-card border-b border-white/10">
        <div className="container mx-auto px-6 py-4 flex items-center gap-3">
          <Link to="/dashboard">
            <BookOpen className="w-8 h-8 text-gold" />
          </Link>
          <h1 className="font-playfair text-2xl font-bold">Performance Analysis</h1>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-gold border-r-transparent"></div>
          </div>
        ) : progress.length === 0 ? (
          <div className="text-center py-12">
            <Brain className="w-16 h-16 text-gold mx-auto mb-4" />
            <h2 className="font-playfair text-2xl font-bold mb-2">No Analysis Available</h2>
            <p className="text-textSecondary mb-6">Complete some tests to see your performance analysis</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* AI Recommendations */}
            {recommendations.recommendations.length > 0 && (
              <Card className="glass-card border-white/10 gold-glow" data-testid="recommendations-card">
                <CardHeader>
                  <CardTitle className="font-playfair text-2xl flex items-center gap-2">
                    <Brain className="w-8 h-8 text-gold" />
                    AI Study Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    {recommendations.recommendations.map((rec, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-gold flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-black text-sm font-bold">{idx + 1}</span>
                        </div>
                        <p className="text-base leading-relaxed pt-1">{rec}</p>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Weak Topics */}
            {recommendations.weak_topics?.length > 0 && (
              <Card className="glass-card border-white/10 border-error/30" data-testid="weak-topics-card">
                <CardHeader>
                  <CardTitle className="font-playfair text-xl flex items-center gap-2">
                    <AlertCircle className="w-6 h-6 text-error" />
                    Areas Needing Improvement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {recommendations.weak_topics.map((topic, idx) => (
                      <span key={idx} className="px-4 py-2 bg-error/10 border border-error/30 rounded-full text-sm">
                        {topic}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Subject-wise Progress */}
            <Card className="glass-card border-white/10" data-testid="progress-card">
              <CardHeader>
                <CardTitle className="font-playfair text-xl flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-gold" />
                  Subject-wise Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {progress.map((item) => (
                    <motion.div
                      key={`${item.exam_type}-${item.subject}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-2"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-semibold">{item.subject}</h4>
                          <p className="text-sm text-textSecondary">{item.exam_type} • {item.total_tests} tests</p>
                        </div>
                        <span className="text-2xl font-bold text-gold">{Math.round(item.average_score)}%</span>
                      </div>
                      <Progress value={item.average_score} className="h-2" />
                      
                      {(item.strong_topics?.length > 0 || item.weak_topics?.length > 0) && (
                        <div className="flex gap-4 text-sm pt-2">
                          {item.strong_topics?.length > 0 && (
                            <div className="flex items-center gap-2">
                              <Target className="w-4 h-4 text-success" />
                              <span className="text-textSecondary">Strong: {item.strong_topics.join(', ')}</span>
                            </div>
                          )}
                          {item.weak_topics?.length > 0 && (
                            <div className="flex items-center gap-2">
                              <AlertCircle className="w-4 h-4 text-error" />
                              <span className="text-textSecondary">Weak: {item.weak_topics.join(', ')}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}