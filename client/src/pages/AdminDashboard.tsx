import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRequireAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import ExperienceModal from "@/components/experience-modal";
import EducationModal from "@/components/education-modal";
import CaseStudyModal from "@/components/case-study-modal";
import { Experience, Profile, Education, CaseStudy } from "@shared/schema";
import { Plus, Edit, Trash2, ExternalLink, Eye, FileText } from "lucide-react";

// API Functions
async function fetchExperiences(): Promise<Experience[]> {
  const response = await fetch("/api/admin/experiences", { credentials: 'include' });
  if (!response.ok) throw new Error("Failed to fetch experiences");
  return response.json();
}

async function fetchProfile(): Promise<Profile> {
  const response = await fetch("/api/profile");
  if (!response.ok) throw new Error("Failed to fetch profile");
  return response.json();
}

async function createExperience(data: any): Promise<Experience> {
  const response = await fetch("/api/admin/experiences", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to create experience");
  return response.json();
}

async function updateExperience(id: number, data: any): Promise<Experience> {
  const response = await fetch(`/api/admin/experiences/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to update experience");
  return response.json();
}

async function deleteExperience(id: number): Promise<void> {
  const response = await fetch(`/api/admin/experiences/${id}`, {
    method: "DELETE",
    credentials: 'include',
  });
  if (!response.ok) throw new Error("Failed to delete experience");
}

// Education API Functions
async function fetchEducation(): Promise<Education[]> {
  const response = await fetch("/api/admin/education", { credentials: 'include' });
  if (!response.ok) throw new Error("Failed to fetch education");
  return response.json();
}

async function createEducation(data: any): Promise<Education> {
  const response = await fetch("/api/admin/education", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to create education");
  return response.json();
}

async function updateEducation(id: number, data: any): Promise<Education> {
  const response = await fetch(`/api/admin/education/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to update education");
  return response.json();
}

async function deleteEducation(id: number): Promise<void> {
  const response = await fetch(`/api/admin/education/${id}`, {
    method: "DELETE",
    credentials: 'include',
  });
  if (!response.ok) throw new Error("Failed to delete education");
}

// Case Study API Functions
async function fetchCaseStudies(): Promise<CaseStudy[]> {
  const response = await fetch("/api/admin/case-studies", { credentials: 'include' });
  if (!response.ok) throw new Error("Failed to fetch case studies");
  return response.json();
}

async function createCaseStudy(data: any): Promise<CaseStudy> {
  const response = await fetch("/api/admin/case-studies", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to create case study");
  return response.json();
}

async function updateCaseStudy(id: number, data: any): Promise<CaseStudy> {
  const response = await fetch(`/api/admin/case-studies/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to update case study");
  return response.json();
}

async function deleteCaseStudy(id: number): Promise<void> {
  const response = await fetch(`/api/admin/case-studies/${id}`, {
    method: "DELETE",
    credentials: 'include',
  });
  if (!response.ok) throw new Error("Failed to delete case study");
}

export default function AdminDashboard() {
  const auth = useRequireAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState<'profile' | 'experiences' | 'education' | 'case-studies'>('experiences');
  const [isExperienceModalOpen, setIsExperienceModalOpen] = useState(false);
  const [editingExperience, setEditingExperience] = useState<Experience | undefined>();
  const [isEducationModalOpen, setIsEducationModalOpen] = useState(false);
  const [editingEducation, setEditingEducation] = useState<Education | undefined>();
  const [isCaseStudyModalOpen, setIsCaseStudyModalOpen] = useState(false);
  const [editingCaseStudy, setEditingCaseStudy] = useState<CaseStudy | undefined>();

  // Queries
  const { data: experiences = [], isLoading: experiencesLoading } = useQuery({
    queryKey: ["admin-experiences"],
    queryFn: fetchExperiences,
    enabled: activeTab === 'experiences',
    retry: 1,
  });


  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: fetchProfile,
    enabled: activeTab === 'profile',
  });

  const { data: education = [], isLoading: educationLoading } = useQuery({
    queryKey: ["admin-education"],
    queryFn: fetchEducation,
    enabled: activeTab === 'education',
  });

  const { data: caseStudies = [], isLoading: caseStudiesLoading } = useQuery({
    queryKey: ["admin-case-studies"],
    queryFn: fetchCaseStudies,
    enabled: activeTab === 'case-studies',
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: createExperience,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-experiences"] });
      queryClient.invalidateQueries({ queryKey: ["experiences"] }); // Refresh public data
      toast({ title: "Success!", description: "Experience created successfully." });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => updateExperience(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-experiences"] });
      queryClient.invalidateQueries({ queryKey: ["experiences"] }); // Refresh public data
      toast({ title: "Success!", description: "Experience updated successfully." });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteExperience,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-experiences"] });
      queryClient.invalidateQueries({ queryKey: ["experiences"] }); // Refresh public data
      toast({ title: "Success!", description: "Experience deleted successfully." });
    },
  });

  // Education Mutations
  const createEducationMutation = useMutation({
    mutationFn: createEducation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-education"] });
      queryClient.invalidateQueries({ queryKey: ["education"] }); // Refresh public data
      toast({ title: "Success!", description: "Education created successfully." });
    },
  });

  const updateEducationMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => updateEducation(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-education"] });
      queryClient.invalidateQueries({ queryKey: ["education"] }); // Refresh public data
      toast({ title: "Success!", description: "Education updated successfully." });
    },
  });

  const deleteEducationMutation = useMutation({
    mutationFn: deleteEducation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-education"] });
      queryClient.invalidateQueries({ queryKey: ["education"] }); // Refresh public data
      toast({ title: "Success!", description: "Education deleted successfully." });
    },
  });

  // Case Study Mutations
  const createCaseStudyMutation = useMutation({
    mutationFn: createCaseStudy,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-case-studies"] });
      queryClient.invalidateQueries({ queryKey: ["case-studies"] }); // Refresh public data
      toast({ title: "Success!", description: "Case study created successfully." });
    },
  });

  const updateCaseStudyMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => updateCaseStudy(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-case-studies"] });
      queryClient.invalidateQueries({ queryKey: ["case-studies"] }); // Refresh public data
      toast({ title: "Success!", description: "Case study updated successfully." });
    },
  });

  const deleteCaseStudyMutation = useMutation({
    mutationFn: deleteCaseStudy,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-case-studies"] });
      queryClient.invalidateQueries({ queryKey: ["case-studies"] }); // Refresh public data
      toast({ title: "Success!", description: "Case study deleted successfully." });
    },
  });

  const handleCreateExperience = () => {
    setEditingExperience(undefined);
    setIsExperienceModalOpen(true);
  };

  const handleEditExperience = (experience: Experience) => {
    setEditingExperience(experience);
    setIsExperienceModalOpen(true);
  };

  const handleDeleteExperience = async (experience: Experience) => {
    if (window.confirm(`Are you sure you want to delete "${experience.jobTitle}" experience?`)) {
      try {
        await deleteMutation.mutateAsync(experience.id);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete experience. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleSaveExperience = async (data: any) => {
    if (editingExperience) {
      await updateMutation.mutateAsync({ id: editingExperience.id, data });
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  // Education handlers
  const handleCreateEducation = () => {
    setEditingEducation(undefined);
    setIsEducationModalOpen(true);
  };

  const handleEditEducation = (education: Education) => {
    setEditingEducation(education);
    setIsEducationModalOpen(true);
  };

  const handleDeleteEducation = async (education: Education) => {
    if (window.confirm(`Are you sure you want to delete "${education.name}" education?`)) {
      try {
        await deleteEducationMutation.mutateAsync(education.id);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete education. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleSaveEducation = async (data: any) => {
    if (editingEducation) {
      await updateEducationMutation.mutateAsync({ id: editingEducation.id, data });
    } else {
      await createEducationMutation.mutateAsync(data);
    }
  };

  // Case Study handlers
  const handleCreateCaseStudy = () => {
    setEditingCaseStudy(undefined);
    setIsCaseStudyModalOpen(true);
  };

  const handleEditCaseStudy = (caseStudy: CaseStudy) => {
    setEditingCaseStudy(caseStudy);
    setIsCaseStudyModalOpen(true);
  };

  const handleDeleteCaseStudy = async (caseStudy: CaseStudy) => {
    if (window.confirm(`Are you sure you want to delete "${caseStudy.title}" case study?`)) {
      try {
        await deleteCaseStudyMutation.mutateAsync(caseStudy.id);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete case study. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleSaveCaseStudy = async (data: any) => {
    if (editingCaseStudy) {
      await updateCaseStudyMutation.mutateAsync({ id: editingCaseStudy.id, data });
    } else {
      await createCaseStudyMutation.mutateAsync(data);
    }
  };

  const handleLogout = async () => {
    try {
      await auth.logout();
      window.location.href = '/admin/login';
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to logout. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (auth.isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-apercu">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="font-baron text-2xl tracking-wider">ADMIN DASHBOARD</h1>
            <div className="flex items-center gap-4">
              <span className="text-gray-600">Welcome, {auth.user?.username}</span>
              <Button
                variant="outline"
                onClick={handleLogout}
                disabled={auth.isLoading}
              >
                {auth.isLoading ? "Logging out..." : "Logout"}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Tab Navigation */}
        <div className="flex gap-4 mb-8">
          <Button
            variant={activeTab === 'profile' ? 'default' : 'outline'}
            onClick={() => setActiveTab('profile')}
          >
            Profile Settings
          </Button>
          <Button
            variant={activeTab === 'experiences' ? 'default' : 'outline'}
            onClick={() => setActiveTab('experiences')}
          >
            Manage Experiences
          </Button>
          <Button
            variant={activeTab === 'education' ? 'default' : 'outline'}
            onClick={() => setActiveTab('education')}
          >
            Manage Education
          </Button>
          <Button
            variant={activeTab === 'case-studies' ? 'default' : 'outline'}
            onClick={() => setActiveTab('case-studies')}
          >
            Manage Case Studies
          </Button>
        </div>

        {/* Tab Content */}
        <div className="bg-gray-50 rounded-lg p-8">
          {activeTab === 'profile' && (
            <div>
              <h2 className="font-baron text-xl tracking-wide mb-6">PROFILE SETTINGS</h2>
              {profile ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Name</h3>
                    <p className="text-gray-700">{profile.name}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Brief Introduction</h3>
                    <p className="text-gray-700">{profile.briefIntro}</p>
                  </div>
                  <div className="pt-4">
                    <Button disabled>Edit Profile (Coming Soon)</Button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-600">Loading profile...</p>
              )}
            </div>
          )}

          {activeTab === 'experiences' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-baron text-xl tracking-wide">MANAGE EXPERIENCES</h2>
                <Button onClick={handleCreateExperience}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Experience
                </Button>
              </div>

              {experiencesLoading ? (
                <div>Loading experiences...</div>
              ) : experiences.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600 mb-4">No experiences yet.</p>
                  <Button onClick={handleCreateExperience}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Experience
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {experiences.map((experience) => (
                    <div key={experience.id} className="bg-white p-6 rounded-lg border border-gray-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-baron text-lg tracking-wide mb-1">
                            {experience.jobTitle.toUpperCase()}
                          </h3>
                          <p className="text-sollo-red font-medium mb-1">{experience.company}</p>
                          <p className="text-sollo-gold font-medium mb-1">{experience.industry}</p>
                          <p className="text-sm text-gray-600">
                            {experience.startDate} - {experience.isCurrentJob ? 'Present' : experience.endDate}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditExperience(experience)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteExperience(experience)}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'education' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-baron text-xl tracking-wide">MANAGE EDUCATION</h2>
                <Button onClick={handleCreateEducation}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Education
                </Button>
              </div>

              {educationLoading ? (
                <div>Loading education...</div>
              ) : education.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600 mb-4">No education entries yet.</p>
                  <Button onClick={handleCreateEducation}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Education
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {education.map((edu) => (
                    <div key={edu.id} className="bg-white p-6 rounded-lg border border-gray-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-baron text-lg tracking-wide mb-1">
                            {edu.name.toUpperCase()}
                          </h3>
                          <p className="text-sollo-gold font-medium mb-1">{edu.category}</p>
                          {edu.date && (
                            <p className="text-sm text-gray-600 mb-2">{edu.date}</p>
                          )}
                          {edu.link && (
                            <a 
                              href={edu.link} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              View Certificate
                            </a>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditEducation(edu)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteEducation(edu)}
                            disabled={deleteEducationMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'case-studies' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-baron text-xl tracking-wide">MANAGE CASE STUDIES</h2>
                <Button onClick={handleCreateCaseStudy}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Case Study
                </Button>
              </div>

              {caseStudiesLoading ? (
                <div>Loading case studies...</div>
              ) : caseStudies.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600 mb-4">No case studies yet.</p>
                  <Button onClick={handleCreateCaseStudy}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Case Study
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {caseStudies.map((caseStudy) => (
                    <div key={caseStudy.id} className="bg-white p-6 rounded-lg border border-gray-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-baron text-lg tracking-wide">
                              {caseStudy.title.toUpperCase()}
                            </h3>
                            {caseStudy.isPublished && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <Eye className="h-3 w-3 mr-1" />
                                Published
                              </span>
                            )}
                            {caseStudy.isFeatured && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                Featured
                              </span>
                            )}
                          </div>
                          <p className="text-gray-600 mb-2">{caseStudy.description}</p>
                          <p className="text-sm text-gray-500">Slug: /{caseStudy.slug}</p>
                          {caseStudy.tags && caseStudy.tags.length > 0 && (
                            <div className="flex gap-1 mt-2">
                              {caseStudy.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {caseStudy.isPublished && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(`/case-studies/${caseStudy.slug}`, '_blank')}
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditCaseStudy(caseStudy)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteCaseStudy(caseStudy)}
                            disabled={deleteCaseStudyMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Experience Modal */}
      <ExperienceModal
        isOpen={isExperienceModalOpen}
        onClose={() => setIsExperienceModalOpen(false)}
        onSave={handleSaveExperience}
        experience={editingExperience}
        title={editingExperience ? "Edit Experience" : "Add Experience"}
      />

      {/* Education Modal */}
      <EducationModal
        isOpen={isEducationModalOpen}
        onClose={() => setIsEducationModalOpen(false)}
        onSave={handleSaveEducation}
        education={editingEducation}
        title={editingEducation ? "Edit Education" : "Add Education"}
      />

      {/* Case Study Modal */}
      <CaseStudyModal
        isOpen={isCaseStudyModalOpen}
        onClose={() => setIsCaseStudyModalOpen(false)}
        onSave={handleSaveCaseStudy}
        caseStudy={editingCaseStudy}
        title={editingCaseStudy ? "Edit Case Study" : "Add Case Study"}
      />
    </div>
  );
}