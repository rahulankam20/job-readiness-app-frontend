import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { toast } from 'sonner';
import { Plus, X, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function OnboardingPage({ user }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    roles: [],
    interests: [],
    skills: [],
    experience_years: 0,
    projects: [],
    education: [],
    location: '',
    resume_file: null
  });

  const [currentSkill, setCurrentSkill] = useState({ name: '', years: 0, last_used: '', level: 5 });
  const [currentProject, setCurrentProject] = useState({ title: '', description: '', stack: [] });
  const [currentEducation, setCurrentEducation] = useState({ degree: '', institution: '', year: '' });
  const [currentRole, setCurrentRole] = useState('');
  const [currentInterest, setCurrentInterest] = useState('');
  const [currentStackItem, setCurrentStackItem] = useState('');

  const addSkill = () => {
    if (!currentSkill.name) {
      toast.error('Please enter a skill name');
      return;
    }
    if (!currentSkill.years || currentSkill.years <= 0) {
      toast.error('Please enter years of experience (greater than 0)');
      return;
    }

    setFormData(prev => ({
      ...prev,
      skills: [...prev.skills, { ...currentSkill }]
    }));
    setCurrentSkill({ name: '', years: 0, last_used: '', level: 5 });
    toast.success('Skill added successfully');
  };

  const addProject = () => {
    if (!currentProject.title) {
      toast.error('Please enter a project title');
      return;
    }
    if (!currentProject.description) {
      toast.error('Please enter a project description');
      return;
    }

    setFormData(prev => ({
      ...prev,
      projects: [...prev.projects, { ...currentProject }]
    }));
    setCurrentProject({ title: '', description: '', stack: [] });
    toast.success('Project added successfully');
  };

  const addEducation = () => {
    if (!currentEducation.degree) {
      toast.error('Please enter a degree');
      return;
    }
    if (!currentEducation.institution) {
      toast.error('Please enter an institution');
      return;
    }

    setFormData(prev => ({
      ...prev,
      education: [...prev.education, { ...currentEducation }]
    }));
    setCurrentEducation({ degree: '', institution: '', year: '' });
    toast.success('Education added successfully');
  };

  const handleSubmit = async () => {
    if (formData.skills.length === 0) {
      toast.error('Please add at least one skill');
      return;
    }

    setLoading(true);
    try {
      // Create FormData for file upload
      const form = new FormData();

      // Add all form fields except resume_file
      const { resume_file, ...profileData } = formData;
      form.append('profile_data', JSON.stringify(profileData));

      // Add resume file if present
      if (resume_file) {
        form.append('resume_file', resume_file);
      }

      await axios.post(`${API}/profile`, form, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Profile created successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Profile creation error:', error);
      toast.error(error.response?.data?.detail || 'Failed to create profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-3xl p-8 shadow-2xl"
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Tell Us About Yourself</h1>
            <p className="text-slate-600">Help us understand your background to provide personalized insights</p>
          </div>

          {/* Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-600">Step {step} of 4</span>
              <span className="text-sm font-medium text-slate-600">{Math.round((step / 4) * 100)}%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${(step / 4) * 100}%` }} />
            </div>
          </div>

          {/* Step 1: Basic Info */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  data-testid="name-input"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="John Doe"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="experience">Years of Experience</Label>
                <Input
                  id="experience"
                  data-testid="experience-input"
                  type="number"
                  min="0"
                  step="0.5"
                  value={formData.experience_years}
                  onChange={(e) => setFormData(prev => ({ ...prev, experience_years: parseFloat(e.target.value) }))}
                  placeholder="3.5"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="location">Location (Optional)</Label>
                <Input
                  id="location"
                  data-testid="location-input"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="San Francisco, CA"
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Roles Interested In</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    value={currentRole}
                    onChange={(e) => setCurrentRole(e.target.value)}
                    placeholder="e.g., Frontend Developer"
                    data-testid="role-input"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && currentRole) {
                        setFormData(prev => ({ ...prev, roles: [...prev.roles, currentRole] }));
                        setCurrentRole('');
                      }
                    }}
                  />
                  <Button
                    onClick={() => {
                      if (currentRole) {
                        setFormData(prev => ({ ...prev, roles: [...prev.roles, currentRole] }));
                        setCurrentRole('');
                      }
                    }}
                    data-testid="add-role-btn"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {formData.roles.map((role, idx) => (
                    <span key={idx} className="skill-badge flex items-center gap-2">
                      {role}
                      <X
                        className="w-3 h-3 cursor-pointer"
                        onClick={() => setFormData(prev => ({
                          ...prev,
                          roles: prev.roles.filter((_, i) => i !== idx)
                        }))}
                      />
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <Label>Domain Interests</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    value={currentInterest}
                    onChange={(e) => setCurrentInterest(e.target.value)}
                    placeholder="e.g., Web Development, Cloud"
                    data-testid="interest-input"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && currentInterest) {
                        setFormData(prev => ({ ...prev, interests: [...prev.interests, currentInterest] }));
                        setCurrentInterest('');
                      }
                    }}
                  />
                  <Button
                    onClick={() => {
                      if (currentInterest) {
                        setFormData(prev => ({ ...prev, interests: [...prev.interests, currentInterest] }));
                        setCurrentInterest('');
                      }
                    }}
                    data-testid="add-interest-btn"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {formData.interests.map((interest, idx) => (
                    <span key={idx} className="skill-badge flex items-center gap-2">
                      {interest}
                      <X
                        className="w-3 h-3 cursor-pointer"
                        onClick={() => setFormData(prev => ({
                          ...prev,
                          interests: prev.interests.filter((_, i) => i !== idx)
                        }))}
                      />
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: Skills */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <h3 className="font-semibold text-blue-900 mb-4">Add Your Skills</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="skill-name">Skill Name</Label>
                    <Input
                      id="skill-name"
                      data-testid="skill-name-input"
                      value={currentSkill.name}
                      onChange={(e) => setCurrentSkill(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., React"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="skill-years">Years of Experience</Label>
                    <Input
                      id="skill-years"
                      data-testid="skill-years-input"
                      type="number"
                      min="0"
                      step="0.5"
                      value={currentSkill.years}
                      onChange={(e) => setCurrentSkill(prev => ({ ...prev, years: parseFloat(e.target.value) }))}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="skill-last-used">Last Used (Optional)</Label>
                    <Input
                      id="skill-last-used"
                      data-testid="skill-last-used-input"
                      type="month"
                      value={currentSkill.last_used}
                      onChange={(e) => setCurrentSkill(prev => ({ ...prev, last_used: e.target.value }))}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="skill-level">Proficiency (1-10)</Label>
                    <Input
                      id="skill-level"
                      data-testid="skill-level-input"
                      type="number"
                      min="1"
                      max="10"
                      value={currentSkill.level}
                      onChange={(e) => setCurrentSkill(prev => ({ ...prev, level: parseInt(e.target.value) }))}
                      className="mt-2"
                    />
                  </div>
                </div>
                <Button onClick={addSkill} className="mt-4" data-testid="add-skill-btn">
                  <Plus className="w-4 h-4 mr-2" /> Add Skill
                </Button>
              </div>

              <div className="space-y-2">
                {formData.skills.map((skill, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-white rounded-xl p-4 border border-slate-200">
                    <div>
                      <span className="font-semibold">{skill.name}</span>
                      <span className="text-sm text-slate-600 ml-3">{skill.years} years • Level {skill.level}/10</span>
                    </div>
                    <X
                      className="w-5 h-5 cursor-pointer text-red-500"
                      onClick={() => setFormData(prev => ({
                        ...prev,
                        skills: prev.skills.filter((_, i) => i !== idx)
                      }))}
                    />
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 3: Projects */}
          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="bg-teal-50 border border-teal-200 rounded-xl p-4">
                <h3 className="font-semibold text-teal-900 mb-4">Add Your Projects</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="project-title">Project Title</Label>
                    <Input
                      id="project-title"
                      data-testid="project-title-input"
                      value={currentProject.title}
                      onChange={(e) => setCurrentProject(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="E-commerce Platform"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="project-desc">Description</Label>
                    <Textarea
                      id="project-desc"
                      data-testid="project-desc-input"
                      value={currentProject.description}
                      onChange={(e) => setCurrentProject(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Built a full-stack e-commerce platform with payment integration..."
                      className="mt-2"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label>Tech Stack</Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        value={currentStackItem}
                        onChange={(e) => setCurrentStackItem(e.target.value)}
                        placeholder="e.g., React, Node.js"
                        data-testid="stack-input"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && currentStackItem) {
                            setCurrentProject(prev => ({ ...prev, stack: [...prev.stack, currentStackItem] }));
                            setCurrentStackItem('');
                          }
                        }}
                      />
                      <Button
                        onClick={() => {
                          if (currentStackItem) {
                            setCurrentProject(prev => ({ ...prev, stack: [...prev.stack, currentStackItem] }));
                            setCurrentStackItem('');
                          }
                        }}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {currentProject.stack.map((tech, idx) => (
                        <span key={idx} className="skill-badge flex items-center gap-2">
                          {tech}
                          <X
                            className="w-3 h-3 cursor-pointer"
                            onClick={() => setCurrentProject(prev => ({
                              ...prev,
                              stack: prev.stack.filter((_, i) => i !== idx)
                            }))}
                          />
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <Button onClick={addProject} className="mt-4" data-testid="add-project-btn">
                  <Plus className="w-4 h-4 mr-2" /> Add Project
                </Button>
              </div>

              <div className="space-y-2">
                {formData.projects.map((project, idx) => (
                  <div key={idx} className="bg-white rounded-xl p-4 border border-slate-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">{project.title}</h4>
                        <p className="text-sm text-slate-600 mb-2">{project.description}</p>
                        <div className="flex flex-wrap gap-2">
                          {project.stack.map((tech, techIdx) => (
                            <span key={techIdx} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                      <X
                        className="w-5 h-5 cursor-pointer text-red-500 ml-4"
                        onClick={() => setFormData(prev => ({
                          ...prev,
                          projects: prev.projects.filter((_, i) => i !== idx)
                        }))}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 4: Education & Resume */}
          {step === 4 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <h3 className="font-semibold text-slate-900 mb-4">Add Education</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="degree">Degree</Label>
                    <Input
                      id="degree"
                      data-testid="degree-input"
                      value={currentEducation.degree}
                      onChange={(e) => setCurrentEducation(prev => ({ ...prev, degree: e.target.value }))}
                      placeholder="B.S. Computer Science"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="institution">Institution</Label>
                    <Input
                      id="institution"
                      data-testid="institution-input"
                      value={currentEducation.institution}
                      onChange={(e) => setCurrentEducation(prev => ({ ...prev, institution: e.target.value }))}
                      placeholder="Stanford University"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="year">Year (Optional)</Label>
                    <Input
                      id="year"
                      data-testid="year-input"
                      value={currentEducation.year}
                      onChange={(e) => setCurrentEducation(prev => ({ ...prev, year: e.target.value }))}
                      placeholder="2020"
                      className="mt-2"
                    />
                  </div>
                </div>
                <Button onClick={addEducation} className="mt-4" data-testid="add-education-btn">
                  <Plus className="w-4 h-4 mr-2" /> Add Education
                </Button>
              </div>

              <div className="space-y-2">
                {formData.education.map((edu, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-white rounded-xl p-4 border border-slate-200">
                    <div>
                      <span className="font-semibold">{edu.degree}</span>
                      <span className="text-sm text-slate-600 ml-3">{edu.institution} {edu.year && `• ${edu.year}`}</span>
                    </div>
                    <X
                      className="w-5 h-5 cursor-pointer text-red-500"
                      onClick={() => setFormData(prev => ({
                        ...prev,
                        education: prev.education.filter((_, i) => i !== idx)
                      }))}
                    />
                  </div>
                ))}
              </div>

              <div>
                <Label htmlFor="resume">Upload Resume (Optional)</Label>
                <p className="text-sm text-slate-500 mt-1 mb-2">Upload your resume in PDF or Word format for better analysis</p>
                <div className="mt-2">
                  <input
                    id="resume"
                    type="file"
                    accept=".pdf,.docx,.doc"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setFormData(prev => ({ ...prev, resume_file: file }));
                        toast.success(`File "${file.name}" selected`);
                      }
                    }}
                    className="block w-full text-sm text-slate-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-lg file:border-0
                      file:text-sm file:font-semibold
                      file:bg-blue-50 file:text-blue-700
                      hover:file:bg-blue-100
                      cursor-pointer"
                  />
                  {formData.resume_file && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-slate-600">
                      <span className="font-medium">Selected:</span>
                      <span>{formData.resume_file.name}</span>
                      <X
                        className="w-4 h-4 cursor-pointer text-red-500 ml-2"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, resume_file: null }));
                          document.getElementById('resume').value = '';
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t border-slate-200">
            <Button
              variant="outline"
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1}
              data-testid="prev-step-btn"
            >
              Previous
            </Button>

            {step < 4 ? (
              <Button
                onClick={() => setStep(Math.min(4, step + 1))}
                data-testid="next-step-btn"
              >
                Next <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={loading}
                data-testid="submit-profile-btn"
                className="btn-primary"
              >
                {loading ? 'Creating Profile...' : 'Complete Setup'}
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
