import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BookOpen, ArrowLeft, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const EXAM_TYPES = ['UPSC', 'APSC', 'ADRE', 'SSC', 'Banking'];
const SUBJECTS = [
  'General Studies',
  'Indian Polity',
  'History',
  'Geography',
  'Economics',
  'Science & Technology',
  'Current Affairs',
  'Reasoning',
  'Quantitative Aptitude',
  'English'
];

export default function GenerateQuestions() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    exam_type: 'UPSC',
    subject: 'General Studies',
    count: 10
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(
        `${API}/questions/generate`,
        formData,
        { withCredentials: true }
      );
      toast.success('Questions generated successfully!');
      navigate('/tests/create');
    } catch (error) {
      console.error('Failed to generate questions:', error);
      toast.error(error.response?.data?.detail || 'Failed to generate questions');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="glass-card border-b border-white/10">
        <div className="container mx-auto px-6 py-4 flex items-center gap-3">
          <Link to="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-6 h-6" />
            </Button>
          </Link>
          <BookOpen className="w-8 h-8 text-gold" />
          <h1 className="font-playfair text-2xl font-bold">AI Question Generator</h1>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 max-w-2xl">
        <Card className="glass-card border-white/10 gold-glow">
          <CardHeader>
            <CardTitle className="font-playfair text-2xl flex items-center gap-2">
              <Sparkles className="w-8 h-8 text-gold" />
              Generate AI-Powered Questions
            </CardTitle>
            <p className="text-textSecondary mt-2">Let AI create high-quality exam questions based on your preferences</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold mb-2">Exam Type</label>
                <select
                  data-testid="gen-exam-type-select"
                  value={formData.exam_type}
                  onChange={(e) => setFormData({ ...formData, exam_type: e.target.value })}
                  className="w-full bg-surface border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-gold"
                >
                  {EXAM_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Subject</label>
                <select
                  data-testid="gen-subject-select"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full bg-surface border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-gold"
                >
                  {SUBJECTS.map(subject => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Number of Questions</label>
                <input
                  data-testid="gen-count-input"
                  type="number"
                  min="5"
                  max="20"
                  value={formData.count}
                  onChange={(e) => setFormData({ ...formData, count: parseInt(e.target.value) })}
                  className="w-full bg-surface border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-gold"
                />
                <p className="text-sm text-textSecondary mt-2">Recommended: 5-20 questions (takes ~30-60 seconds)</p>
              </div>

              <Button
                data-testid="generate-submit-btn"
                type="submit"
                disabled={loading}
                className="w-full bg-gold hover:bg-copper text-black font-bold py-6 text-lg"
              >
                {loading ? 'Generating...' : 'Generate Questions with AI'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}