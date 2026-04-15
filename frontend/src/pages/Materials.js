import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { BookOpen, Upload, FileText, Download, Trash2 } from 'lucide-react';
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

export default function Materials() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadData, setUploadData] = useState({
    title: '',
    exam_type: 'UPSC',
    subject: 'General Studies',
    file: null
  });

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      const response = await axios.get(`${API}/materials`, { withCredentials: true });
      setMaterials(response.data);
    } catch (error) {
      console.error('Failed to fetch materials:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadData.file) {
      toast.error('Please select a file');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', uploadData.file);

    try {
      await axios.post(
        `${API}/materials/upload?title=${encodeURIComponent(uploadData.title)}&exam_type=${uploadData.exam_type}&subject=${uploadData.subject}`,
        formData,
        {
          withCredentials: true,
          headers: { 'Content-Type': 'multipart/form-data' }
        }
      );
      toast.success('Material uploaded successfully!');
      setShowUpload(false);
      setUploadData({ title: '', exam_type: 'UPSC', subject: 'General Studies', file: null });
      fetchMaterials();
    } catch (error) {
      console.error('Failed to upload material:', error);
      toast.error('Failed to upload material');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (materialId) => {
    if (!confirm('Are you sure you want to delete this material?')) return;

    try {
      await axios.delete(`${API}/materials/${materialId}`, { withCredentials: true });
      toast.success('Material deleted');
      fetchMaterials();
    } catch (error) {
      console.error('Failed to delete material:', error);
      toast.error('Failed to delete material');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="glass-card border-b border-white/10">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-gold" />
            <h1 className="font-playfair text-2xl font-bold">Study Materials</h1>
          </Link>
          <Button
            data-testid="show-upload-btn"
            onClick={() => setShowUpload(!showUpload)}
            className="bg-gold hover:bg-copper text-black font-semibold"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload Material
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {showUpload && (
          <Card className="glass-card border-white/10 mb-8" data-testid="upload-form">
            <CardHeader>
              <CardTitle className="font-playfair text-xl">Upload Study Material</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpload} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Title</label>
                  <input
                    data-testid="material-title-input"
                    type="text"
                    value={uploadData.title}
                    onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
                    className="w-full bg-surface border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-gold"
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Exam Type</label>
                    <select
                      data-testid="material-exam-type-select"
                      value={uploadData.exam_type}
                      onChange={(e) => setUploadData({ ...uploadData, exam_type: e.target.value })}
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
                      data-testid="material-subject-select"
                      value={uploadData.subject}
                      onChange={(e) => setUploadData({ ...uploadData, subject: e.target.value })}
                      className="w-full bg-surface border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-gold"
                    >
                      {SUBJECTS.map(subject => (
                        <option key={subject} value={subject}>{subject}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">File (PDF, DOC, etc.)</label>
                  <input
                    data-testid="material-file-input"
                    type="file"
                    onChange={(e) => setUploadData({ ...uploadData, file: e.target.files[0] })}
                    className="w-full bg-surface border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-gold"
                    accept=".pdf,.doc,.docx,.txt"
                    required
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    data-testid="upload-submit-btn"
                    type="submit"
                    disabled={uploading}
                    className="bg-gold hover:bg-copper text-black font-semibold"
                  >
                    {uploading ? 'Uploading...' : 'Upload'}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setShowUpload(false)}
                    variant="outline"
                    className="border-white/20"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-gold border-r-transparent"></div>
          </div>
        ) : materials.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gold mx-auto mb-4" />
            <h2 className="font-playfair text-2xl font-bold mb-2">No Study Materials</h2>
            <p className="text-textSecondary mb-6">Upload your first study material to get started</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {materials.map((material) => (
              <MaterialCard key={material.material_id} material={material} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function MaterialCard({ material, onDelete }) {
  const downloadUrl = `${API}/materials/${material.material_id}/download`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
    >
      <Card className="glass-card border-white/10 hover-lift h-full">
        <CardHeader>
          <CardTitle className="font-playfair text-lg line-clamp-2">{material.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-textSecondary">Exam:</span>
              <span className="font-semibold">{material.exam_type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-textSecondary">Subject:</span>
              <span className="font-semibold">{material.subject}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-textSecondary">Size:</span>
              <span>{(material.size / 1024).toFixed(1)} KB</span>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <a href={downloadUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
              <Button data-testid={`download-${material.material_id}`} className="w-full" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </a>
            <Button
              data-testid={`delete-${material.material_id}`}
              onClick={() => onDelete(material.material_id)}
              variant="outline"
              size="sm"
              className="border-error text-error hover:bg-error/10"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}