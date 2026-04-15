import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { BookOpen, Target, TrendingUp, Award, Brain, GraduationCap, MessageCircle, Briefcase, Users, Sparkles, ChevronDown } from 'lucide-react';
import { Button } from '../components/ui/button';
import Book3D from '../components/Book3D';
import FuturisticGrid from '../components/FuturisticGrid';
import KnowledgeLogo from '../components/KnowledgeLogo';

const EXAM_TOPICS = [
  { name: 'UPSC Civil Services', icon: GraduationCap, desc: 'Prelims, Mains & Interview Prep' },
  { name: 'APSC (Assam PSC)', icon: Award, desc: 'CCE, Junior Grade & Allied Services' },
  { name: 'ADRE (Assam DRE)', icon: Users, desc: 'Grade III & IV Exam Preparation' },
  { name: 'State PSC Exams', icon: Target, desc: 'All Indian State PSC Exams' },
  { name: 'SSC Exams', icon: BookOpen, desc: 'CGL, CHSL, MTS & CPO' },
  { name: 'Banking Exams', icon: Briefcase, desc: 'IBPS PO/Clerk, SBI & RBI' },
];

const FEATURES = [
  { icon: Brain, title: 'AI Question Prediction', desc: 'Our AI analyzes past 10 years of exam patterns to predict the most likely questions for upcoming exams' },
  { icon: Target, title: 'Weakness Detection', desc: 'Instantly identify your weak subjects. AI creates a personalized study plan to improve where it matters most' },
  { icon: MessageCircle, title: 'AI Teacher Chat', desc: 'Ask any doubt, any time. Our AI teacher explains complex topics like a personal tutor, tailored to your level' },
  { icon: Briefcase, title: 'Interview Preparation', desc: 'Practice mock interviews with AI. Get feedback on answers for government job interviews across all positions' },
  { icon: TrendingUp, title: 'Progress Analytics', desc: 'Track your improvement across subjects with beautiful charts. Know exactly where you stand before exam day' },
  { icon: Sparkles, title: 'Smart Study Materials', desc: 'Upload your notes and PDFs. AI organizes and recommends the most relevant resources for your target exam' },
];

const STATS = [
  { value: '10+', label: 'Exam Categories' },
  { value: 'AI', label: 'Powered by Claude' },
  { value: '1000+', label: 'Practice Questions' },
  { value: '24/7', label: 'AI Teacher Access' },
];

function AnimatedCounter({ value, label }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="text-center"
    >
      <div className="font-playfair text-4xl sm:text-5xl font-bold text-gradient">{value}</div>
      <p className="text-sm text-[#A1A1AA] mt-2 uppercase tracking-[0.15em] font-outfit">{label}</p>
    </motion.div>
  );
}

export default function Landing() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll();

  useEffect(() => {
    const handleScroll = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
      setScrollProgress(Math.min(progress, 1));
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.95]);

  return (
    <div ref={containerRef} className="relative" style={{ background: '#050505' }}>
      {/* Futuristic Grid Background Animation */}
      <FuturisticGrid scrollProgress={scrollProgress} />

      {/* 3D Book Canvas */}
      <Book3D scrollProgress={scrollProgress} />

      {/* Gradient Overlays */}
      <div className="fixed inset-0 z-[2] pointer-events-none" style={{
        background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(212,175,55,0.06) 0%, transparent 60%)'
      }} />
      <div className="fixed bottom-0 left-0 right-0 h-40 z-[2] pointer-events-none" style={{
        background: 'linear-gradient(to top, #050505, transparent)'
      }} />

      {/* ===== Content Sections ===== */}
      <div className="relative z-[3]">

        {/* === HERO Section === */}
        <motion.section
          style={{ opacity: heroOpacity, scale: heroScale }}
          className="min-h-screen flex flex-col justify-center px-6 lg:px-20"
        >
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="max-w-2xl"
          >
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-[rgba(212,175,55,0.3)] bg-[rgba(212,175,55,0.08)] mb-8">
              <KnowledgeLogo size={20} />
              <span className="text-sm font-outfit text-[#D4AF37] tracking-wide">AI-Powered Exam Mastery</span>
            </div>

            <h1 className="font-playfair text-4xl sm:text-5xl lg:text-7xl font-bold mb-6 tracking-tight leading-[1.05]">
              Crack Any <span className="text-gradient">Government Exam</span><br />
              With AI Precision
            </h1>
            <p className="text-base sm:text-lg text-[#A1A1AA] mb-10 max-w-xl font-outfit leading-relaxed">
              UPSC, APSC, ADRE, SSC, Banking &mdash; our AI predicts questions, finds your weaknesses, 
              and guides you like a personal teacher. All in one premium platform.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link to="/login">
                <Button
                  data-testid="get-started-btn"
                  className="bg-[#D4AF37] hover:bg-[#B87333] text-black px-10 py-7 text-lg font-bold rounded-full transition-all duration-300 hover:shadow-[0_0_40px_rgba(212,175,55,0.5)] font-outfit"
                >
                  Start Preparing Free
                </Button>
              </Link>
              <Link to="/login">
                <Button
                  variant="outline"
                  className="border-2 border-[#D4AF37] text-[#D4AF37] hover:bg-[rgba(212,175,55,0.1)] px-10 py-7 text-lg font-bold rounded-full transition-all duration-300 font-outfit"
                >
                  Sign In
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            className="absolute bottom-10"
          >
            <ChevronDown className="w-8 h-8 text-[#D4AF37] opacity-60" />
          </motion.div>
        </motion.section>

        {/* === Stats Section === */}
        <section className="min-h-[50vh] flex items-center justify-center px-6 py-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-20 max-w-4xl mx-auto">
            {STATS.map((stat, idx) => (
              <AnimatedCounter key={idx} {...stat} />
            ))}
          </div>
        </section>

        {/* === Features Section === */}
        <section className="min-h-screen flex items-center py-20 px-6">
          <div className="container mx-auto max-w-6xl">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="font-playfair text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 tracking-tight">
                Everything You Need to <span className="text-gradient">Succeed</span>
              </h2>
              <p className="text-base text-[#A1A1AA] max-w-xl mx-auto font-outfit">
                Powered by Claude AI, designed by exam toppers
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {FEATURES.map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  whileHover={{ y: -6, transition: { duration: 0.2 } }}
                  className="glass-card rounded-2xl p-8 hover-lift group"
                >
                  <div className="w-14 h-14 rounded-xl bg-[rgba(212,175,55,0.1)] border border-[rgba(212,175,55,0.2)] flex items-center justify-center mb-5 group-hover:bg-[rgba(212,175,55,0.2)] transition-colors duration-300">
                    <feature.icon className="w-7 h-7 text-[#D4AF37]" />
                  </div>
                  <h3 className="font-playfair text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-[#A1A1AA] text-sm leading-relaxed font-outfit">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* === Exam Types Section === */}
        <section className="min-h-screen flex items-center py-20 px-6">
          <div className="container mx-auto max-w-6xl">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="font-playfair text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 tracking-tight">
                All Major <span className="text-gradient">Indian Government Exams</span>
              </h2>
              <p className="text-base text-[#A1A1AA] max-w-xl mx-auto font-outfit">
                Comprehensive coverage from prelims to interview
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {EXAM_TOPICS.map((exam, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: idx % 2 === 0 ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.08 }}
                  whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
                  className="glass-card rounded-2xl p-6 border-2 border-transparent hover:border-[#D4AF37] transition-all duration-300 cursor-pointer group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-[rgba(212,175,55,0.1)] flex items-center justify-center group-hover:bg-[rgba(212,175,55,0.2)] transition-colors">
                      <exam.icon className="w-6 h-6 text-[#D4AF37]" />
                    </div>
                    <div>
                      <h4 className="font-playfair text-lg font-bold">{exam.name}</h4>
                      <p className="text-sm text-[#A1A1AA] font-outfit">{exam.desc}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* === AI Teacher Preview === */}
        <section className="min-h-[60vh] flex items-center py-20 px-6">
          <div className="container mx-auto max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="glass-card rounded-3xl p-10 md:p-16 gold-glow"
            >
              <div className="grid md:grid-cols-2 gap-10 items-center">
                <div>
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[rgba(212,175,55,0.3)] bg-[rgba(212,175,55,0.08)] mb-6">
                    <Brain className="w-4 h-4 text-[#D4AF37]" />
                    <span className="text-xs font-outfit text-[#D4AF37] uppercase tracking-wider">AI Teacher</span>
                  </div>
                  <h2 className="font-playfair text-2xl sm:text-3xl font-bold mb-4">
                    Your Personal <span className="text-gradient">AI Mentor</span>
                  </h2>
                  <p className="text-[#A1A1AA] leading-relaxed mb-6 font-outfit">
                    Ask doubts anytime, get instant explanations with Indian exam context. 
                    Prepare for interviews with AI mock sessions. Like having a topper as your study partner.
                  </p>
                  <Link to="/login">
                    <Button data-testid="try-ai-teacher-btn" className="bg-[#D4AF37] hover:bg-[#B87333] text-black font-bold rounded-full px-8 py-4 font-outfit">
                      Try AI Teacher
                    </Button>
                  </Link>
                </div>
                <div className="space-y-4">
                  <ChatBubble from="student" text="Explain Article 370 for UPSC Prelims" />
                  <ChatBubble from="ai" text="Article 370 granted special autonomous status to Jammu & Kashmir. Key points for UPSC: It was a 'temporary provision' in Part XXI, allowed J&K its own constitution..." />
                  <ChatBubble from="student" text="What questions can come from this?" />
                  <ChatBubble from="ai" text="High probability questions: 1) Constitutional basis of Article 370, 2) Comparison with Article 371, 3) Abrogation process in 2019..." />
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* === CTA Section === */}
        <section className="min-h-[60vh] flex items-center py-20 px-6">
          <div className="container mx-auto max-w-4xl text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <GraduationCap className="w-20 h-20 text-[#D4AF37] mx-auto mb-8" />
              <h2 className="font-playfair text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 tracking-tight">
                Your Dream Government Job<br />
                <span className="text-gradient">Starts Here</span>
              </h2>
              <p className="text-lg text-[#A1A1AA] mb-10 max-w-2xl mx-auto font-outfit">
                Join thousands of aspirants who are already using AI to crack their exams. 
                Don't let another attempt go unprepared.
              </p>
              <Link to="/login">
                <Button
                  data-testid="cta-get-started-btn"
                  className="bg-[#D4AF37] hover:bg-[#B87333] text-black px-14 py-8 text-xl font-bold rounded-full transition-all duration-300 hover:shadow-[0_0_60px_rgba(212,175,55,0.5)] font-outfit"
                >
                  Launch Your Preparation Now
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-[rgba(255,255,255,0.05)] py-10 px-6">
          <div className="container mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <KnowledgeLogo size={32} />
              <span className="font-playfair text-lg font-bold">Exam Prep Hub</span>
            </div>
            <p className="text-sm text-[#A1A1AA] font-outfit">AI-Powered Government Exam Preparation Platform</p>
          </div>
        </footer>
      </div>
    </div>
  );
}

function ChatBubble({ from, text }) {
  const isAI = from === 'ai';
  return (
    <motion.div
      initial={{ opacity: 0, x: isAI ? 20 : -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className={`flex ${isAI ? 'justify-start' : 'justify-end'}`}
    >
      <div className={`max-w-[85%] rounded-2xl px-5 py-3 text-sm font-outfit ${
        isAI
          ? 'bg-[rgba(212,175,55,0.1)] border border-[rgba(212,175,55,0.2)] text-white'
          : 'bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.1)] text-[#A1A1AA]'
      }`}>
        {isAI && <span className="text-[#D4AF37] text-xs font-semibold block mb-1">AI Teacher</span>}
        {text}
      </div>
    </motion.div>
  );
}
