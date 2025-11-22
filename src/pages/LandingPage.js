import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, TrendingUp, Target, Zap } from 'lucide-react';

import { useNavigate } from 'react-router-dom';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function LandingPage({ user }) {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden"
      >
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{
              y: [0, -20, 0],
              rotate: [0, 5, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-20 left-10 w-64 h-64 bg-blue-200 rounded-full opacity-20 blur-3xl"
          />
          <motion.div
            animate={{
              y: [0, 20, 0],
              rotate: [0, -5, 0],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute bottom-20 right-10 w-80 h-80 bg-teal-200 rounded-full opacity-20 blur-3xl"
          />
        </div>

        <div className="max-w-6xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mb-6"
          >
            <span className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold mb-6">
              AI-Powered Career Analysis
            </span>
          </motion.div>

          <motion.h1
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
          >
            Discover Your
            <br />
            <span className="gradient-text">Job Readiness Level</span>
          </motion.h1>

          <motion.p
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-lg sm:text-xl text-slate-600 mb-10 max-w-2xl mx-auto"
          >
            Get AI-powered insights on your skills, personalized learning roadmaps,
            and professional tools to accelerate your developer career.
          </motion.p>

          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <button
              onClick={handleGetStarted}
              data-testid="get-started-btn"
              className="btn-primary flex items-center gap-2 text-lg"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </button>
            <button className="btn-secondary text-lg">
              Watch Demo
            </button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8"
          >
            {[
              { label: "Readiness Score", value: "0-100", icon: Target },
              { label: "Skill Categories", value: "3 Levels", icon: TrendingUp },
              { label: "AI Tools", value: "Resume, Email, Letter", icon: Zap },
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.05 }}
                className="glass rounded-2xl p-6 backdrop-blur-xl"
              >
                <stat.icon className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
                <div className="text-sm text-slate-600 mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">How It Works</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Three simple steps to understand and improve your job readiness
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Submit Your Profile",
                description: "Share your skills, experience, projects, and resume for comprehensive analysis.",
                icon: "📝"
              },
              {
                step: "02",
                title: "AI Analysis",
                description: "Our AI evaluates your profile across skill categories and calculates your readiness score.",
                icon: "🤖"
              },
              {
                step: "03",
                title: "Get Your Roadmap",
                description: "Receive personalized learning paths, resume tips, and job application tools.",
                icon: "🚀"
              },
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.6 }}
                whileHover={{ y: -10 }}
                className="card-hover bg-slate-50 rounded-2xl p-8 border border-slate-200"
              >
                <div className="text-5xl mb-4">{feature.icon}</div>
                <div className="text-sm font-bold text-blue-600 mb-2">{feature.step}</div>
                <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                <p className="text-slate-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 px-6 bg-gradient-to-br from-blue-50 to-teal-50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">Why Developers Love Us</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Everything you need to stand out in your job search
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              "Accurate skill assessment across multiple domains",
              "Explainable readiness scoring (0-100 scale)",
              "Personalized learning roadmaps with resources",
              "AI-generated resume optimization",
              "Tailored cover letters for job applications",
              "Cold email templates for recruiter outreach",
              "Track progress and skill development",
              "Free to use with no hidden costs",
            ].map((benefit, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05, duration: 0.5 }}
                className="flex items-start gap-3 bg-white rounded-xl p-5 border border-slate-200"
              >
                <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                <span className="text-slate-700 font-medium">{benefit}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-gradient-to-r from-blue-600 to-teal-500 text-white">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center"
        >
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            Ready to Level Up Your Career?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join developers who are using AI to accelerate their career growth
          </p>
          <button
            onClick={handleGetStarted}
            data-testid="cta-get-started-btn"
            className="bg-white text-blue-600 px-10 py-4 rounded-full text-lg font-bold hover:bg-slate-100 transition-all inline-flex items-center gap-2"
          >
            Start Your Analysis
            <ArrowRight className="w-5 h-5" />
          </button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-slate-400">
            © 2025 Job Readiness Analyzer. Built with AI to help developers succeed.
          </p>
        </div>
      </footer>
    </div>
  );
}
