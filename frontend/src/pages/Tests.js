import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { BookOpen, Plus, PlayCircle, CheckCircle, Clock } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function Tests() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      const response = await axios.get(`${API}/tests`, { withCredentials: true });
      setTests(response.data);
    } catch (error) {
      console.error('Failed to fetch tests:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="glass-card border-b border-white/10">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-gold" />
            <h1 className="font-playfair text-2xl font-bold">Mock Tests</h1>
          </Link>
          <Link to="/tests/create">
            <Button data-testid="create-test-btn" className="bg-gold hover:bg-copper text-black font-semibold">
              <Plus className="w-4 h-4 mr-2" />
              Create New Test
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-gold border-r-transparent"></div>
          </div>
        ) : tests.length === 0 ? (
          <div className="text-center py-12">
            <PlayCircle className="w-16 h-16 text-gold mx-auto mb-4" />
            <h2 className="font-playfair text-2xl font-bold mb-2">No Tests Yet</h2>
            <p className="text-textSecondary mb-6">Create your first mock test to start practicing</p>
            <Link to="/tests/create">
              <Button data-testid="create-first-test-btn" className="bg-gold hover:bg-copper text-black font-semibold">
                Create Your First Test
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tests.map((test) => (
              <TestCard key={test.test_id} test={test} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function TestCard({ test }) {
  const navigate = useNavigate();
  const isCompleted = test.completed_at !== null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
    >
      <Card className="glass-card border-white/10 hover-lift h-full">
        <CardHeader>
          <CardTitle className="font-playfair text-xl flex items-center justify-between">
            <span>{test.exam_type}</span>
            {isCompleted ? (
              <CheckCircle className="w-6 h-6 text-success" />
            ) : (
              <Clock className="w-6 h-6 text-warning" />
            )}
          </CardTitle>
          <p className="text-textSecondary text-sm">{test.subject}</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-textSecondary">Questions:</span>
              <span className="font-semibold">{test.questions.length}</span>
            </div>
            {isCompleted && (
              <div className="flex justify-between text-sm">
                <span className="text-textSecondary">Score:</span>
                <span className="font-bold text-gold">{Math.round(test.score)}%</span>
              </div>
            )}
            <Button
              data-testid={`view-test-${test.test_id}`}
              onClick={() => navigate(`/test/${test.test_id}`)}
              className="w-full mt-4"
              variant={isCompleted ? "outline" : "default"}
            >
              {isCompleted ? 'View Results' : 'Start Test'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}