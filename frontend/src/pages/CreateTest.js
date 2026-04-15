import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BookOpen, Plus, ArrowLeft } from 'lucide-react';
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

export default function CreateTest() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    exam_type: 'UPSC',
    subject: 'General Studies',
    question_count: 10
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(
        `${API}/tests/create`,
        null,
        {
          params: formData,
          withCredentials: true
        }
      );
      toast.success('Test created successfully!');
      navigate(`/test/${response.data.test.test_id}`);
    } catch (error) {
      console.error('Failed to create test:', error);
      toast.error(error.response?.data?.detail || 'Failed to create test. Please try generating questions first.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="glass-card border-b border-white/10">
        <div className="container mx-auto px-6 py-4 flex items-center gap-3">
          <Link to="/tests">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-6 h-6" />
            </Button>
          </Link>
          <BookOpen className="w-8 h-8 text-gold" />
          <h1 className="font-playfair text-2xl font-bold">Create Mock Test</h1>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 max-w-2xl">
        <Card className="glass-card border-white/10">
          <CardHeader>
            <CardTitle className="font-playfair text-2xl">Configure Your Test</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold mb-2">Exam Type</label>
                <select
                  data-testid="exam-type-select"
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
                  data-testid="subject-select"
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
                  data-testid="question-count-input"
                  type="number"
                  min="5"
                  max="50"
                  value={formData.question_count}
                  onChange={(e) => setFormData({ ...formData, question_count: parseInt(e.target.value) })}
                  className="w-full bg-surface border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-gold"
                />
              </div>

              <Button
                data-testid="create-test-submit-btn"
                type="submit"
                disabled={loading}
                className="w-full bg-gold hover:bg-copper text-black font-bold py-6 text-lg"
              >
                {loading ? 'Creating...' : 'Create Test'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}