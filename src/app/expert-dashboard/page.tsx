"use client";

import { useState, useEffect } from "react";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  FileText,
  User,
  Star,
  TrendingUp,
  Calendar,
  DollarSign,
  Award,
  MessageSquare,
  Download,
  Filter,
  Search
} from "lucide-react";
import { AnalysisReportWithDetails } from "@/lib/database.types";

export default function ExpertDashboard() {
  const [reports, setReports] = useState<AnalysisReportWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<AnalysisReportWithDetails | null>(null);
  const [expertAnalysis, setExpertAnalysis] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState<'pending' | 'completed' | 'all'>('pending');
  const [userRole, setUserRole] = useState<'expert' | 'admin' | null>(null);

  useEffect(() => {
    fetchUserRole();
    fetchReports();
  }, []);

  const fetchUserRole = async () => {
    try {
      const response = await fetch('/api/user/role');
      if (response.ok) {
        const data = await response.json();
        setUserRole(data.role);
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
    }
  };

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/expert/reports');
      if (response.ok) {
        const data = await response.json();
        setReports(data.reports || []);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitExpertAnalysis = async () => {
    if (!selectedReport || !expertAnalysis.trim()) return;

    try {
      setSubmitting(true);
      const response = await fetch(`/api/reports/${selectedReport.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          expert_analysis_content: expertAnalysis,
          status: 'completed'
        }),
      });

      if (response.ok) {
        // Refresh reports and reset form
        await fetchReports();
        setSelectedReport(null);
        setExpertAnalysis("");
      } else {
        throw new Error('Failed to submit expert analysis');
      }
    } catch (error) {
      console.error('Error submitting expert analysis:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredReports = reports.filter(report => {
    if (filter === 'all') return true;
    if (filter === 'pending') return report.status === 'pending_expert_review';
    if (filter === 'completed') return report.status === 'completed';
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_expert_review':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending_expert_review':
        return <Clock className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'processing':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  if (!userRole || !['expert', 'admin'].includes(userRole)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">Access Restricted</h3>
              <p className="text-muted-foreground">
                This dashboard is only available to expert consultants and administrators.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Award className="h-8 w-8 text-purple-600" />
              Expert Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Review and enhance AI-generated business analyses
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant={userRole === 'admin' ? 'default' : 'secondary'}>
              {userRole === 'admin' ? 'Administrator' : 'Expert Consultant'}
            </Badge>
            <UserButton />
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {reports.filter(r => r.status === 'pending_expert_review').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Reviews</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {reports.filter(r => r.status === 'completed' && r.expert_analysis_content).length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
              <FileText className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{reports.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Viability Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {reports.length > 0
                  ? Math.round(
                      reports.reduce((sum, r) => sum + (r.business_viability_score || 0), 0) / reports.length
                    )
                  : 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Reports List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Business Analysis Reports</CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant={filter === 'pending' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilter('pending')}
                    >
                      Pending
                    </Button>
                    <Button
                      variant={filter === 'completed' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilter('completed')}
                    >
                      Completed
                    </Button>
                    <Button
                      variant={filter === 'all' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilter('all')}
                    >
                      All
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-3"></div>
                    <p className="text-sm text-muted-foreground">Loading reports...</p>
                  </div>
                ) : filteredReports.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">
                      {filter === 'pending' ? 'No pending reviews' : 'No reports found'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredReports.map((report) => (
                      <Card
                        key={report.id}
                        className={`cursor-pointer transition-colors ${
                          selectedReport?.id === report.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                        }`}
                        onClick={() => setSelectedReport(report)}
                      >
                        <CardContent className="pt-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-medium">{report.business_input.business_name}</h4>
                                <Badge className={getStatusColor(report.status)}>
                                  <div className="flex items-center gap-1">
                                    {getStatusIcon(report.status)}
                                    {report.status.replace('_', ' ')}
                                  </div>
                                </Badge>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Building className="h-3 w-3" />
                                  {report.business_input.business_type}
                                </span>
                                <span className="flex items-center gap-1">
                                  <DollarSign className="h-3 w-3" />
                                  ${(report.business_input.budget || 0).toLocaleString()}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {new Date(report.generated_at).toLocaleDateString()}
                                </span>
                                {report.business_viability_score && (
                                  <span className="flex items-center gap-1">
                                    <Star className="h-3 w-3 text-yellow-500" />
                                    {report.business_viability_score}/100
                                  </span>
                                )}
                              </div>
                            </div>
                            <Button variant="ghost" size="sm">
                              <FileText className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Expert Analysis Panel */}
          <div className="lg:col-span-1">
            {selectedReport ? (
              <Card className="sticky top-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Expert Review
                  </CardTitle>
                  <CardDescription>
                    {selectedReport.business_input.business_name}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* AI Analysis Summary */}
                  {selectedReport.ai_content && (
                    <div>
                      <h4 className="font-medium mb-2">AI Analysis Summary</h4>
                      <div className="p-3 bg-gray-50 rounded-lg text-sm">
                        <p className="mb-2">
                          <strong>Viability Score:</strong> {selectedReport.business_viability_score}/100
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Generated on {new Date(selectedReport.generated_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Expert Analysis Form */}
                  {selectedReport.status === 'pending_expert_review' ? (
                    <div>
                      <h4 className="font-medium mb-2">Your Expert Analysis</h4>
                      <Textarea
                        placeholder="Provide your expert review, corrections, and additional insights based on your industry experience..."
                        value={expertAnalysis}
                        onChange={(e) => setExpertAnalysis(e.target.value)}
                        rows={8}
                        className="mb-3"
                      />
                      <div className="flex gap-2">
                        <Button
                          onClick={handleSubmitExpertAnalysis}
                          disabled={!expertAnalysis.trim() || submitting}
                          className="flex-1"
                        >
                          {submitting ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Submitting...
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              Submit Review
                            </>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setSelectedReport(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : selectedReport.expert_analysis_content ? (
                    <div>
                      <h4 className="font-medium mb-2">Previous Expert Review</h4>
                      <div className="p-3 bg-green-50 rounded-lg text-sm">
                        <p className="whitespace-pre-wrap">{selectedReport.expert_analysis_content}</p>
                        <p className="text-xs text-green-600 mt-2">
                          Reviewed on {new Date(selectedReport.expert_reviewed_at || '').toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        This report has already been processed or doesn't require expert review.
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-4 border-t">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <FileText className="h-4 w-4 mr-2" />
                      Full Report
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">
                    Select a report from the list to review and provide expert analysis
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}