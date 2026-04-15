import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { BookOpen, ArrowLeft, Briefcase, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const EXAM_TYPES = ['UPSC', 'APSC', 'ADRE', 'SSC', 'Banking'];
const POSITIONS = [
  'IAS Officer', 'IPS Officer', 'IFS Officer',
  'State Civil Service Officer', 'Assistant Commissioner',
  'Junior Administrative Grade', 'Grade III Employee',
  'Bank PO', 'Bank Clerk', 'SSC CGL Officer'
];
const QUESTION_TYPES = ['general', 'technical', 'behavioral', 'situational', 'current_affairs'];

export default function InterviewPrep() {
  const [formData, setFormData] = useState({
    exam_type: 'UPSC',
    position: 'IAS Officer',
    question_type: 'general'
  });
  const [loading, setLoading] = useState(false);
  const [currentInterview, setCurrentInterview] = useState(null);
  const [history, setHistory] = useState([]);
  const [expandedQ, setExpandedQ] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await axios.get(`${API}/interview/history`, { withCredentials: true });
      setHistory(response.data);
    } catch (error) {
      console.error('Failed to fetch interview history:', error);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${API}/interview/generate`, formData, { withCredentials: true });
      setCurrentInterview(response.data);
      setExpandedQ(0);
      toast.success('Interview questions generated!');
      fetchHistory();
    } catch (error) {
      console.error('Failed to generate questions:', error);
      toast.error('Failed to generate questions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: '#050505' }}>
      {/* Header */}
      <header className="glass-card border-b border-[rgba(255,255,255,0.1)]">
        <div className="container mx-auto px-6 py-4 flex items-center gap-3">
          <Link to="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-6 h-6" />
            </Button>
          </Link>
          <Briefcase className="w-8 h-8 text-[#D4AF37]" />
          <h1 className="font-playfair text-2xl font-bold">Interview Preparation</h1>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 max-w-5xl">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <Card className="glass-card border-[rgba(255,255,255,0.1)] lg:col-span-1 h-fit" data-testid="interview-form">
            <CardHeader>
              <CardTitle className="font-playfair text-xl flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#D4AF37]" />
                Generate Questions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleGenerate} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 font-outfit">Exam Type</label>
                  <select
                    data-testid="interview-exam-select"
                    value={formData.exam_type}
                    onChange={(e) => setFormData({ ...formData, exam_type: e.target.value })}
                    className="w-full bg-[#09090b] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-3 focus:outline-none focus:border-[#D4AF37] font-outfit text-sm"
                  >
                    {EXAM_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 font-outfit">Position</label>
                  <select
                    data-testid="interview-position-select"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="w-full bg-[#09090b] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-3 focus:outline-none focus:border-[#D4AF37] font-outfit text-sm"
                  >
                    {POSITIONS.map(pos => (
                      <option key={pos} value={pos}>{pos}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 font-outfit">Question Type</label>
                  <select
                    data-testid="interview-type-select"
                    value={formData.question_type}
                    onChange={(e) => setFormData({ ...formData, question_type: e.target.value })}
                    className="w-full bg-[#09090b] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-3 focus:outline-none focus:border-[#D4AF37] font-outfit text-sm capitalize"
                  >
                    {QUESTION_TYPES.map(type => (
                      <option key={type} value={type}>{type.replace('_', ' ')}</option>
                    ))}
                  </select>
                </div>

                <Button
                  data-testid="generate-interview-btn"
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#D4AF37] hover:bg-[#B87333] text-black font-bold py-5 font-outfit"
                >
                  {loading ? 'Generating...' : 'Generate Questions'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Questions Display */}
          <div className="lg:col-span-2 space-y-4">
            {currentInterview ? (
              <>
                <div className="text-center mb-6">
                  <h2 className="font-playfair text-2xl font-bold mb-1">
                    {formData.position} Interview
                  </h2>
                  <p className="text-[#A1A1AA] text-sm font-outfit">{formData.exam_type} | {formData.question_type.replace('_', ' ')} questions</p>
                </div>

                {currentInterview.questions.map((q, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Card className="glass-card border-[rgba(255,255,255,0.1)]" data-testid={`interview-q-${idx}`}>
                      <CardContent className="pt-6">
                        <button
                          onClick={() => setExpandedQ(expandedQ === idx ? null : idx)}
                          className="w-full text-left flex items-start justify-between gap-4"
                        >
                          <div className="flex items-start gap-3">
                            <span className="w-8 h-8 rounded-full bg-[rgba(212,175,55,0.15)] flex items-center justify-center flex-shrink-0 text-sm font-bold text-[#D4AF37]">
                              {idx + 1}
                            </span>
                            <p className="font-outfit font-semibold leading-relaxed pt-1">{q.question}</p>
                          </div>
                          {expandedQ === idx ? (
                            <ChevronUp className="w-5 h-5 text-[#D4AF37] flex-shrink-0" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-[#A1A1AA] flex-shrink-0" />
                          )}
                        </button>

                        {expandedQ === idx && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mt-4 ml-11 space-y-4"
                          >
                            <div className="p-4 rounded-lg bg-[rgba(212,175,55,0.05)] border border-[rgba(212,175,55,0.15)]">
                              <h4 className="text-sm font-semibold text-[#D4AF37] mb-2 font-outfit">Model Answer</h4>
                              <p className="text-sm text-[#A1A1AA] leading-relaxed font-outfit">{q.model_answer}</p>
                            </div>

                            {q.key_points && q.key_points.length > 0 && (
                              <div className="p-4 rounded-lg bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)]">
                                <h4 className="text-sm font-semibold mb-2 font-outfit">Key Points</h4>
                                <ul className="space-y-1">
                                  {q.key_points.map((point, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm text-[#A1A1AA] font-outfit">
                                      <span className="text-[#D4AF37] mt-1">&#x2022;</span>
                                      {point}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {q.tips && (
                              <div className="p-4 rounded-lg bg-[rgba(42,157,143,0.05)] border border-[rgba(42,157,143,0.15)]">
                                <h4 className="text-sm font-semibold text-[#2A9D8F] mb-2 font-outfit">Pro Tips</h4>
                                <p className="text-sm text-[#A1A1AA] leading-relaxed font-outfit">{q.tips}</p>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </>
            ) : history.length > 0 ? (
              <div className="space-y-4">
                <h3 className="font-playfair text-lg font-bold">Previous Sessions</h3>
                {history.slice(0, 5).map((item, idx) => (
                  <Card
                    key={idx}
                    className="glass-card border-[rgba(255,255,255,0.1)] cursor-pointer hover-lift"
                    onClick={() => setCurrentInterview(item)}
                  >
                    <CardContent className="pt-4 pb-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold font-outfit">{item.position}</p>
                          <p className="text-sm text-[#A1A1AA] font-outfit">{item.exam_type} | {item.questions?.length || 0} questions</p>
                        </div>
                        <Briefcase className="w-5 h-5 text-[#D4AF37]" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <Briefcase className="w-16 h-16 text-[#D4AF37] mx-auto mb-6" />
                <h2 className="font-playfair text-2xl font-bold mb-3">Interview Preparation</h2>
                <p className="text-[#A1A1AA] font-outfit max-w-md mx-auto">
                  Select an exam type and position, then generate AI-powered interview questions with model answers and expert tips.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
