import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { toast } from 'sonner';
import { TrendingUp, Target, BookOpen, FileText, Mail, LogOut, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function DashboardPage({ user, logout }) {
  const [analysis, setAnalysis] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [domain, setDomain] = useState('web');
  const [roleInput, setRoleInput] = useState('');
  const [marketTemplate, setMarketTemplate] = useState(null);
  const [refreshingTemplate, setRefreshingTemplate] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [contentType, setContentType] = useState('');

  // Generation params
  const [jobRole, setJobRole] = useState('');
  const [company, setCompany] = useState('');
  const [position, setPosition] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [recruiterName, setRecruiterName] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [profileRes, analysisRes] = await Promise.all([
        axios.get(`${API}/profile`),
        axios.get(`${API}/analysis/latest`)
      ]);

      setProfile(profileRes.data);
      setAnalysis(analysisRes.data);
    } catch (error) {
      console.error('Load data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshMarketTemplate = async () => {
    setRefreshingTemplate(true);
    try {
      const role = roleInput && roleInput.trim() ? roleInput.trim() : (profile?.roles?.[0] || '');
      const response = await axios.post(`${API}/analyze/refresh-template`, { domain, role });

      if (response.data.template) {
        setMarketTemplate({
          ...response.data.template,
          role: role || 'general',
          domain: domain
        });
        toast.success('Market template refreshed with latest data!');
      }
    } catch (error) {
      console.error('Refresh template error:', error);
      toast.error('Failed to refresh market template');
    } finally {
      setRefreshingTemplate(false);
    }
  };

  const runAnalysis = async () => {
    setAnalyzing(true);
    try {
      // send domain + role in body for market template
      const payload = { domain };
      // Use roleInput if provided, otherwise use profile role
      if (roleInput && roleInput.trim()) {
        payload.role = roleInput.trim();
      } else if (profile?.roles?.[0]) {
        payload.role = profile.roles[0];
      }

      const response = await axios.post(`${API}/analyze`, payload, { timeout: 120000 });
      setAnalysis(response.data);

      // Store market template info if returned
      if (response.data.market_template) {
        setMarketTemplate(response.data.market_template);
      }

      toast.success('Analysis completed!');
    } catch (error) {
      console.error('Analysis error:', error);

      // friendly error messages for quota/billing
      const err = error?.response?.data || error;
      const errorMsg = err?.error || err?.message || '';

      if (errorMsg.includes('insufficient_quota') || errorMsg.includes('quota') || err?.type === 'insufficient_quota') {
        toast.error('OpenAI quota exhausted. Please add a payment method at platform.openai.com/account/billing or check your usage limits.', {
          duration: 6000
        });
      } else if (errorMsg.includes('invalid_api_key') || errorMsg.includes('Incorrect API key')) {
        toast.error('Invalid OpenAI API key. Please update your API key in backend/.env', {
          duration: 6000
        });
      } else {
        toast.error(errorMsg || 'Failed to run analysis');
      }
    } finally {
      setAnalyzing(false);
    }
  };


  const generateContent = async (type) => {
    setGenerating(true);
    setContentType(type);
    try {
      let response;
      if (type === 'resume') {
        response = await axios.post(`${API}/generate/resume`, { job_role: jobRole || 'Software Developer' });
      } else if (type === 'cover_letter') {
        response = await axios.post(`${API}/generate/cover-letter`, {
          company: company || 'the company',
          position: position || 'Software Developer',
          job_description: jobDescription
        });
      } else if (type === 'cold_email') {
        response = await axios.post(`${API}/generate/cold-email`, {
          recruiter_name: recruiterName,
          company: company || 'your company'
        });
      }

      setGeneratedContent(response.data.content);
      toast.success('Content generated!');
    } catch (error) {
      console.error('Generation error:', error);
      toast.error('Failed to generate content');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  // Prepare chart data
  const scoreBreakdownData = analysis ? [
    { name: 'Skill Match', value: analysis.score_breakdown.skill_match, max: 40 },
    { name: 'Experience', value: analysis.score_breakdown.experience, max: 30 },
    { name: 'Recency', value: analysis.score_breakdown.recency, max: 15 },
    { name: 'Projects', value: analysis.score_breakdown.projects, max: 15 }
  ] : [];

  const skillCategoryData = analysis ? [
    { category: 'Bare Minimum', skills: analysis.category_results.bare_minimum.length, maxSkills: 5 },
    { category: 'Intermediate', skills: analysis.category_results.intermediate.length, maxSkills: 7 },
    { category: 'Standout', skills: analysis.category_results.standout.length, maxSkills: 7 }
  ] : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50" data-testid="dashboard-page">
      {/* Header */}
      <header className="glass border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Job Readiness Dashboard</h1>
            <p className="text-sm text-slate-600">Welcome back, {user?.name}</p>
          </div>
          <Button variant="outline" onClick={logout} data-testid="logout-btn">
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Analysis Section */}
        {!analysis ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-3xl p-8 text-center mb-8"
          >
            <Target className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-4">Ready to Analyze Your Profile?</h2>
            <p className="text-slate-600 mb-6 max-w-2xl mx-auto">
              Get a comprehensive readiness score, skill breakdown, and personalized learning roadmap.
            </p>

            <div className="max-w-2xl mx-auto mb-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="domain-select" className="mb-2 block">Select Domain</Label>
                  <Select value={domain} onValueChange={setDomain}>
                    <SelectTrigger id="domain-select" data-testid="domain-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="web">Web Development</SelectItem>
                      <SelectItem value="data">Data Science</SelectItem>
                      <SelectItem value="cloud">Cloud Engineering</SelectItem>
                      <SelectItem value="mobile">Mobile Development</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="role-input" className="mb-2 block">Your Role (Optional)</Label>
                  <Input
                    id="role-input"
                    data-testid="role-input"
                    value={roleInput}
                    onChange={(e) => setRoleInput(e.target.value)}
                    placeholder={profile?.roles?.[0] || "e.g., Frontend Developer"}
                    className="w-full"
                  />
                  <p className="text-xs text-slate-500 mt-1">Leave empty to use profile role</p>
                </div>
              </div>
            </div>

            <Button
              onClick={runAnalysis}
              disabled={analyzing}
              className="btn-primary"
              data-testid="run-analysis-btn"
            >
              {analyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Run Analysis
                </>
              )}
            </Button>
          </motion.div>
        ) : (
          <>
            {/* Score Overview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid md:grid-cols-3 gap-6 mb-8"
            >
              <Card className="col-span-2">
                <CardHeader>
                  <CardTitle>Readiness Score</CardTitle>
                  <CardDescription>Your overall job readiness for {analysis.domain} development</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-8">
                    <div className="relative">
                      <div className="text-6xl font-bold gradient-text">{analysis.level}</div>
                      <div className="text-sm text-slate-600 mt-1">out of 100</div>
                    </div>
                    <div className="flex-1">
                      <Progress value={analysis.level} className="h-3 mb-4" />
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-slate-600">Skills Matched</div>
                          <div className="font-semibold">{analysis.score_breakdown.matched_skills_count} / {analysis.score_breakdown.total_required_skills}</div>
                        </div>
                        <div>
                          <div className="text-slate-600">Category</div>
                          <div className="font-semibold">
                            {analysis.level >= 70 ? 'Advanced' : analysis.level >= 40 ? 'Intermediate' : 'Beginner'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Actions</CardTitle>
                  <CardDescription>Improve your profile</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={runAnalysis}
                    disabled={analyzing}
                    data-testid="rerun-analysis-btn"
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Re-run Analysis
                  </Button>
                  <Select value={domain} onValueChange={setDomain}>
                    <SelectTrigger data-testid="change-domain-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="web">Web Development</SelectItem>
                      <SelectItem value="data">Data Science</SelectItem>
                      <SelectItem value="cloud">Cloud Engineering</SelectItem>
                      <SelectItem value="mobile">Mobile Development</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={refreshMarketTemplate}
                    disabled={refreshingTemplate}
                    size="sm"
                  >
                    {refreshingTemplate ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Refreshing...</>
                    ) : (
                      <>🔄 Refresh Market Data</>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Market Signals Display */}
            {(analysis?.market_template || marketTemplate) && (
              <div className="mt-4 mb-6 p-4 bg-slate-50 rounded-xl border">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-slate-700">
                    Market signals (generated: {
                      analysis?.market_template?.generated_at ||
                      analysis?.market_template?.generatedAt ||
                      marketTemplate?.generated_at ||
                      marketTemplate?.generatedAt ||
                      '—'
                    })
                  </div>
                  <div className="text-xs text-slate-500">
                    Role: {
                      analysis?.market_template?.role ||
                      marketTemplate?.role ||
                      roleInput ||
                      analysis?.domain ||
                      'general'
                    }
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {((analysis?.market_template?.top_keywords || marketTemplate?.top_keywords) || []).map((k, i) => (
                    <span key={i} className="px-2 py-1 text-xs bg-white border rounded">{k}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Score Breakdown Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid md:grid-cols-2 gap-6 mb-8"
            >
              <Card>
                <CardHeader>
                  <CardTitle>Score Breakdown</CardTitle>
                  <CardDescription>How your score is calculated</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={scoreBreakdownData}>
                      <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                      <YAxis stroke="#64748b" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar dataKey="value" fill="url(#colorGradient)" radius={[8, 8, 0, 0]} />
                      <defs>
                        <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#0B69FF" />
                          <stop offset="100%" stopColor="#00C2A8" />
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Skill Categories</CardTitle>
                  <CardDescription>Skills matched per category</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={skillCategoryData} layout="vertical">
                      <XAxis type="number" stroke="#64748b" fontSize={12} />
                      <YAxis dataKey="category" type="category" stroke="#64748b" fontSize={12} width={100} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar dataKey="skills" fill="#0B69FF" radius={[0, 8, 8, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>

            {/* Skills & Roadmap Tabs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Tabs defaultValue="skills" className="glass rounded-3xl p-6">
                <TabsList className="grid w-full grid-cols-2 max-w-md">
                  <TabsTrigger value="skills" data-testid="skills-tab">Skills</TabsTrigger>
                  <TabsTrigger value="roadmap" data-testid="roadmap-tab">Learning Roadmap</TabsTrigger>
                </TabsList>

                <TabsContent value="skills" className="mt-6">
                  <div className="space-y-6">
                    {/* Bare Minimum */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                        Bare Minimum Skills
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {analysis.category_results.bare_minimum.map((skill, idx) => (
                          <span key={idx} className="skill-badge bg-green-50 border-green-200 text-green-700">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Intermediate */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                        Intermediate Skills
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {analysis.category_results.intermediate.map((skill, idx) => (
                          <span key={idx} className="skill-badge bg-blue-50 border-blue-200 text-blue-700">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Standout */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <span className="w-3 h-3 bg-purple-500 rounded-full"></span>
                        Standout Skills
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {analysis.category_results.standout.map((skill, idx) => (
                          <span key={idx} className="skill-badge bg-purple-50 border-purple-200 text-purple-700">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Missing Skills */}
                    {analysis.missing_skills.length > 0 && (
                      <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                        <h3 className="text-lg font-semibold mb-3 text-orange-900">
                          Skills to Learn Next
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {analysis.missing_skills.map((skill, idx) => (
                            <span key={idx} className="skill-badge bg-orange-100 border-orange-300 text-orange-700">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="roadmap" className="mt-6">
                  <div className="space-y-4">
                    {analysis.roadmap.map((step, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-white rounded-xl p-5 border border-slate-200 hover:shadow-lg transition-shadow"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-700 flex-shrink-0">
                            {idx + 1}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold mb-2">{step.step}</h4>
                            <div className="flex items-center gap-4 text-sm text-slate-600">
                              <span>📚 {step.estimateWeeks} weeks</span>
                              <a
                                href={step.resource}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline flex items-center gap-1"
                              >
                                <BookOpen className="w-4 h-4" />
                                View Resource
                              </a>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </motion.div>

            {/* AI Tools */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-8"
            >
              <h2 className="text-2xl font-bold mb-6">AI-Powered Tools</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {/* Resume Optimizer */}
                <Dialog>
                  <DialogTrigger asChild>
                    <Card className="cursor-pointer card-hover" data-testid="resume-tool-card">
                      <CardContent className="pt-6 text-center">
                        <FileText className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                        <h3 className="font-semibold mb-2">Optimize Resume</h3>
                        <p className="text-sm text-slate-600">Get AI-powered resume improvements</p>
                      </CardContent>
                    </Card>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Resume Optimizer</DialogTitle>
                      <DialogDescription>
                        Generate optimized resume content tailored to your target role
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="job-role">Target Job Role</Label>
                        <Input
                          id="job-role"
                          data-testid="job-role-input"
                          value={jobRole}
                          onChange={(e) => setJobRole(e.target.value)}
                          placeholder="Software Developer"
                          className="mt-2"
                        />
                      </div>
                      <Button
                        onClick={() => generateContent('resume')}
                        disabled={generating && contentType === 'resume'}
                        className="w-full"
                        data-testid="generate-resume-btn"
                      >
                        {generating && contentType === 'resume' ? (
                          <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</>
                        ) : (
                          'Generate'
                        )}
                      </Button>
                      {generatedContent && contentType === 'resume' && (
                        <Textarea
                          value={generatedContent}
                          readOnly
                          rows={10}
                          className="mt-4"
                          data-testid="generated-resume"
                        />
                      )}
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Cover Letter */}
                <Dialog>
                  <DialogTrigger asChild>
                    <Card className="cursor-pointer card-hover" data-testid="cover-letter-tool-card">
                      <CardContent className="pt-6 text-center">
                        <FileText className="w-12 h-12 text-teal-600 mx-auto mb-4" />
                        <h3 className="font-semibold mb-2">Cover Letter</h3>
                        <p className="text-sm text-slate-600">Create tailored cover letters</p>
                      </CardContent>
                    </Card>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Cover Letter Generator</DialogTitle>
                      <DialogDescription>
                        Generate a personalized cover letter for your job application
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="company">Company</Label>
                          <Input
                            id="company"
                            data-testid="company-input"
                            value={company}
                            onChange={(e) => setCompany(e.target.value)}
                            placeholder="Google"
                            className="mt-2"
                          />
                        </div>
                        <div>
                          <Label htmlFor="position">Position</Label>
                          <Input
                            id="position"
                            data-testid="position-input"
                            value={position}
                            onChange={(e) => setPosition(e.target.value)}
                            placeholder="Software Engineer"
                            className="mt-2"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="job-desc">Job Description (Optional)</Label>
                        <Textarea
                          id="job-desc"
                          data-testid="job-desc-input"
                          value={jobDescription}
                          onChange={(e) => setJobDescription(e.target.value)}
                          placeholder="Paste the job description here..."
                          className="mt-2"
                          rows={4}
                        />
                      </div>
                      <Button
                        onClick={() => generateContent('cover_letter')}
                        disabled={generating && contentType === 'cover_letter'}
                        className="w-full"
                        data-testid="generate-cover-letter-btn"
                      >
                        {generating && contentType === 'cover_letter' ? (
                          <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</>
                        ) : (
                          'Generate'
                        )}
                      </Button>
                      {generatedContent && contentType === 'cover_letter' && (
                        <Textarea
                          value={generatedContent}
                          readOnly
                          rows={10}
                          className="mt-4"
                          data-testid="generated-cover-letter"
                        />
                      )}
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Cold Email */}
                <Dialog>
                  <DialogTrigger asChild>
                    <Card className="cursor-pointer card-hover" data-testid="cold-email-tool-card">
                      <CardContent className="pt-6 text-center">
                        <Mail className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                        <h3 className="font-semibold mb-2">Cold Email</h3>
                        <p className="text-sm text-slate-600">Reach out to recruiters effectively</p>
                      </CardContent>
                    </Card>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Cold Email Generator</DialogTitle>
                      <DialogDescription>
                        Generate a professional cold email for recruiter outreach
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="recruiter">Recruiter Name (Optional)</Label>
                        <Input
                          id="recruiter"
                          data-testid="recruiter-input"
                          value={recruiterName}
                          onChange={(e) => setRecruiterName(e.target.value)}
                          placeholder="Sarah Johnson"
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label htmlFor="target-company">Target Company</Label>
                        <Input
                          id="target-company"
                          data-testid="target-company-input"
                          value={company}
                          onChange={(e) => setCompany(e.target.value)}
                          placeholder="Microsoft"
                          className="mt-2"
                        />
                      </div>
                      <Button
                        onClick={() => generateContent('cold_email')}
                        disabled={generating && contentType === 'cold_email'}
                        className="w-full"
                        data-testid="generate-email-btn"
                      >
                        {generating && contentType === 'cold_email' ? (
                          <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</>
                        ) : (
                          'Generate'
                        )}
                      </Button>
                      {generatedContent && contentType === 'cold_email' && (
                        <Textarea
                          value={generatedContent}
                          readOnly
                          rows={8}
                          className="mt-4"
                          data-testid="generated-email"
                        />
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}
