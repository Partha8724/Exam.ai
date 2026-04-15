import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BookOpen, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function TakeTest() {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [test, setTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTest();
  }, [testId]);

  const fetchTest = async () => {
    try {
      const response = await axios.get(`${API}/tests/${testId}`, { withCredentials: true });
      setTest(response.data.test);
      setQuestions(response.data.questions);
      if (response.data.test.answers) {
        setAnswers(response.data.test.answers);
      }
    } catch (error) {
      console.error('Failed to fetch test:', error);
      toast.error('Failed to load test');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < questions.length) {
      toast.error('Please answer all questions before submitting');
      return;
    }

    setSubmitting(true);
    try {
      await axios.post(
        `${API}/tests/${testId}/submit`,
        { answers },
        { withCredentials: true }
      );
      toast.success('Test submitted successfully!');
      fetchTest();
    } catch (error) {
      console.error('Failed to submit test:', error);
      toast.error('Failed to submit test');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-gold border-r-transparent"></div>
        </div>
      </div>
    );
  }

  const isCompleted = test?.completed_at !== null;

  return (
    <div className="min-h-screen bg-background pb-12">
      <header className="glass-card border-b border-white/10 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/tests">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-6 h-6" />
              </Button>
            </Link>
            <BookOpen className="w-8 h-8 text-gold" />
            <div>
              <h1 className="font-playfair text-xl font-bold">{test?.exam_type} - {test?.subject}</h1>
              <p className="text-sm text-textSecondary">{questions.length} Questions</p>
            </div>
          </div>
          {!isCompleted && (
            <Button
              data-testid="submit-test-btn"
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-gold hover:bg-copper text-black font-semibold"
            >
              {submitting ? 'Submitting...' : 'Submit Test'}
            </Button>
          )}
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 max-w-4xl">
        {isCompleted && (
          <Card className="glass-card border-white/10 mb-8 gold-glow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <CheckCircle className="w-12 h-12 text-success" />
                  <div>
                    <h2 className="font-playfair text-2xl font-bold">Test Completed!</h2>
                    <p className="text-textSecondary">Your Score: <span className="text-gold font-bold text-xl">{Math.round(test.score)}%</span></p>
                  </div>
                </div>
                <Button onClick={() => navigate('/tests')} variant="outline" className="border-gold text-gold">
                  Back to Tests
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-6">
          {questions.map((question, index) => (
            <Card key={question.question_id} className="glass-card border-white/10" data-testid={`question-${index}`}>
              <CardHeader>
                <CardTitle className="font-playfair text-lg">
                  Question {index + 1}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-base leading-relaxed">{question.question_text}</p>
                
                <div className="space-y-2">
                  {question.options.map((option, optIdx) => {
                    const isSelected = answers[question.question_id] === option;
                    const isCorrect = option === question.correct_answer;
                    const showCorrect = isCompleted && isCorrect;
                    const showIncorrect = isCompleted && isSelected && !isCorrect;

                    return (
                      <button
                        key={optIdx}
                        data-testid={`option-${index}-${optIdx}`}
                        onClick={() => !isCompleted && setAnswers({ ...answers, [question.question_id]: option })}
                        disabled={isCompleted}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                          showCorrect
                            ? 'border-success bg-success/10'
                            : showIncorrect
                            ? 'border-error bg-error/10'
                            : isSelected
                            ? 'border-gold bg-goldGlow'
                            : 'border-white/10 hover:border-gold/50'
                        }`}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>

                {isCompleted && (
                  <div className="mt-4 p-4 bg-surface rounded-lg border border-white/10">
                    <p className="text-sm font-semibold mb-2 text-gold">Explanation:</p>
                    <p className="text-sm text-textSecondary leading-relaxed">{question.explanation}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {!isCompleted && questions.length > 0 && (
          <div className="mt-8 flex justify-center">
            <Button
              data-testid="submit-test-bottom-btn"
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-gold hover:bg-copper text-black font-bold px-12 py-6 text-lg"
            >
              {submitting ? 'Submitting...' : 'Submit Test'}
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}