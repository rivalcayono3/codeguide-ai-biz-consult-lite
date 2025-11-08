"use client";

import { useState, useEffect } from "react";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
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
  TrendingUp,
  FileText,
  Star,
  Calendar,
  DollarSign,
  Users,
  CreditCard,
  Award,
  BarChart3,
  Download,
  Eye,
  Plus,
  Crown,
  Zap
} from "lucide-react";
import Link from "next/link";
import { AnalysisReportWithDetails } from "@/lib/database.types";

interface UserStats {
  total_reports: number;
  avg_viability_score: number;
  credits_remaining: number;
  subscription_status: string;
}

export default function DashboardPage() {
  const [reports, setReports] = useState<AnalysisReportWithDetails[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchUserData();
    fetchReports();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/user/role');
      if (response.ok) {
        const data = await response.json();
        setUserStats({
          total_reports: 0, // Will be calculated from reports
          avg_viability_score: 0, // Will be calculated from reports
          credits_remaining: data.user.credits_remaining,
          subscription_status: data.user.subscription_status
        });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/business-analysis');
      if (response.ok) {
        const data = await response.json();
        const reportsData = data.reports || [];
        setReports(reportsData);

        // Calculate stats
        if (reportsData.length > 0) {
          const avgScore = reportsData.reduce((sum: number, report: any) =>
            sum + (report.business_viability_score || 0), 0) / reportsData.length;

          setUserStats(prev => prev ? {
            ...prev,
            total_reports: reportsData.length,
            avg_viability_score: Math.round(avgScore)
          } : null);
        }
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending_expert_review':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSubscriptionBadge = (status: string) => {
    if (status === 'premium') {
      return (
        <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
          <Crown className="h-3 w-3 mr-1" />
          Premium
        </Badge>
      );
    }
    return (
      <Badge variant="outline">
        <CreditCard className="h-3 w-3 mr-1" />
        Free Plan
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading your dashboard...</p>
            </div>
          </div>
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
            <h1 className="text-3xl font-bold">Your Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Manage your business analyses and subscription
            </p>
          </div>
          <div className="flex items-center gap-4">
            {userStats && getSubscriptionBadge(userStats.subscription_status)}
            <UserButton />
          </div>
        </div>

        {/* Stats Overview */}
        {userStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
                <FileText className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userStats.total_reports}</div>
                <p className="text-xs text-muted-foreground">
                  Business analyses completed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg. Viability Score</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {userStats.avg_viability_score || 0}/100
                </div>
                <p className="text-xs text-muted-foreground">
                  Across all reports
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Credits Remaining</CardTitle>
                <CreditCard className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {userStats.credits_remaining}
                </div>
                <p className="text-xs text-muted-foreground">
                  {userStats.subscription_status === 'free' ? 'Available for analysis' : 'Unlimited with premium'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Subscription</CardTitle>
                <Award className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold capitalize text-purple-600">
                  {userStats.subscription_status}
                </div>
                <p className="text-xs text-muted-foreground">
                  {userStats.subscription_status === 'free' ? 'Basic features' : 'Full access'}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="reports">My Reports</TabsTrigger>
            <TabsTrigger value="upgrade">Upgrade Plan</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    New Analysis
                  </CardTitle>
                  <CardDescription>
                    Start a new AI-powered business analysis
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/business-analysis">
                    <Button className="w-full">
                      <Zap className="h-4 w-4 mr-2" />
                      Create Analysis
                    </Button>
                  </Link>
                  {userStats?.subscription_status === 'free' && userStats.credits_remaining === 0 && (
                    <AlertCircle className="h-4 w-4 text-yellow-600 inline-block ml-2" />
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Premium Features
                  </CardTitle>
                  <CardDescription>
                    Unlock expert reviews and unlimited analyses
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/dashboard?tab=upgrade">
                    <Button variant="outline" className="w-full">
                      <Crown className="h-4 w-4 mr-2" />
                      Upgrade to Premium
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>

            {/* Recent Reports */}
            {reports.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Recent Reports</CardTitle>
                  <CardDescription>
                    Your latest business analysis reports
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {reports.slice(0, 3).map((report) => (
                      <div key={report.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium">{report.business_input.business_name}</h4>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                            <span>{report.business_input.business_type}</span>
                            <span>•</span>
                            <span>{new Date(report.generated_at).toLocaleDateString()}</span>
                            {report.business_viability_score && (
                              <>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <Star className="h-3 w-3 text-yellow-500" />
                                  {report.business_viability_score}/100
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(report.status)}>
                            {report.status.replace('_', ' ')}
                          </Badge>
                          <Link href={`/reports/${report.id}`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                  {reports.length > 3 && (
                    <div className="text-center mt-4">
                      <Link href="/dashboard?tab=reports">
                        <Button variant="outline">
                          View All Reports ({reports.length})
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Your Business Analysis Reports</CardTitle>
                <CardDescription>
                  Complete history of your AI-generated business analyses
                </CardDescription>
              </CardHeader>
              <CardContent>
                {reports.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground mb-4">
                      You haven't created any business analysis reports yet
                    </p>
                    <Link href="/business-analysis">
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Your First Analysis
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Business Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Viability Score</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reports.map((report) => (
                        <TableRow key={report.id}>
                          <TableCell className="font-medium">
                            {report.business_input.business_name}
                          </TableCell>
                          <TableCell>{report.business_input.business_type}</TableCell>
                          <TableCell>
                            {report.business_viability_score ? (
                              <div className="flex items-center gap-1">
                                <Star className="h-3 w-3 text-yellow-500" />
                                {report.business_viability_score}/100
                              </div>
                            ) : (
                              '-'
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(report.status)}>
                              {report.status.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(report.generated_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Link href={`/reports/${report.id}`}>
                                <Button variant="ghost" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Button variant="ghost" size="sm">
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="upgrade" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Current Plan */}
              <Card className={userStats?.subscription_status === 'free' ? 'border-gray-200' : 'border-purple-500'}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Free Plan
                    </CardTitle>
                    {userStats?.subscription_status === 'free' && (
                      <Badge variant="default">Current Plan</Badge>
                    )}
                  </div>
                  <CardDescription>Basic AI business analysis features</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-3xl font-bold">$0<span className="text-lg font-normal text-muted-foreground">/month</span></div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span className="text-sm">3 AI reports per month</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Basic analysis features</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span className="text-sm">30-day report history</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <X className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-muted-foreground">Expert review</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <X className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-muted-foreground">Live coaching sessions</span>
                    </div>
                  </div>

                  {userStats?.credits_remaining !== undefined && (
                    <div className="pt-4 border-t">
                      <div className="flex justify-between text-sm mb-2">
                        <span>Credits Remaining</span>
                        <span>{userStats.credits_remaining}</span>
                      </div>
                      <Progress value={(userStats.credits_remaining / 3) * 100} className="h-2" />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Premium Plan */}
              <Card className="border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Crown className="h-5 w-5 text-purple-600" />
                      Premium Plan
                    </CardTitle>
                    {userStats?.subscription_status === 'premium' && (
                      <Badge className="bg-purple-600 text-white">Current Plan</Badge>
                    )}
                  </div>
                  <CardDescription>Full access with expert reviews and coaching</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-3xl font-bold">$49<span className="text-lg font-normal text-muted-foreground">/month</span></div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Unlimited AI reports</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Expert analysis & review</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span className="text-sm">4 coaching sessions/month</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Unlimited report history</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Priority support</span>
                    </div>
                  </div>

                  {userStats?.subscription_status !== 'premium' ? (
                    <Button className="w-full mt-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                      <Crown className="h-4 w-4 mr-2" />
                      Upgrade to Premium
                    </Button>
                  ) : (
                    <div className="pt-4 border-t">
                      <p className="text-sm text-green-600 text-center">
                        ✨ You're enjoying all premium features!
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Feature Comparison */}
            <Card>
              <CardHeader>
                <CardTitle>Feature Comparison</CardTitle>
                <CardDescription>
                  See how Premium compares to Free plan
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Feature</TableHead>
                      <TableHead className="text-center">Free</TableHead>
                      <TableHead className="text-center">Premium</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>AI Reports per Month</TableCell>
                      <TableCell className="text-center">3</TableCell>
                      <TableCell className="text-center font-bold text-green-600">Unlimited</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Expert Review</TableCell>
                      <TableCell className="text-center">
                        <X className="h-4 w-4 text-gray-400 mx-auto" />
                      </TableCell>
                      <TableCell className="text-center">
                        <CheckCircle2 className="h-4 w-4 text-green-600 mx-auto" />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Live Coaching Sessions</TableCell>
                      <TableCell className="text-center">
                        <X className="h-4 w-4 text-gray-400 mx-auto" />
                      </TableCell>
                      <TableCell className="text-center font-bold">4 per month</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Report History</TableCell>
                      <TableCell className="text-center">30 days</TableCell>
                      <TableCell className="text-center font-bold text-green-600">Unlimited</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Priority Support</TableCell>
                      <TableCell className="text-center">
                        <X className="h-4 w-4 text-gray-400 mx-auto" />
                      </TableCell>
                      <TableCell className="text-center">
                        <CheckCircle2 className="h-4 w-4 text-green-600 mx-auto" />
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

import { X } from "lucide-react";