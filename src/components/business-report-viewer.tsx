"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Target,
  DollarSign,
  Users,
  Calendar,
  Download,
  Share2,
  BookOpen,
  Award,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Star,
  BarChart3,
  PieChart,
  Building,
  MapPin,
  Briefcase,
  Lightbulb,
  Shield,
  Zap,
  Eye,
  FileText
} from "lucide-react";
import { AIAnalysisContent, AnalysisReport } from "@/lib/database.types";

interface ReportViewerProps {
  report: AnalysisReport & {
    business_input: {
      business_name: string;
      business_type: string;
      budget: number;
      location: string;
    };
    user: {
      full_name: string | null;
      subscription_status: string;
    };
  };
}

interface ScoreIndicatorProps {
  score: number;
  label: string;
  size?: "sm" | "md" | "lg";
}

function ScoreIndicator({ score, label, size = "md" }: ScoreIndicatorProps) {
  const getColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    if (score >= 40) return "text-orange-600";
    return "text-red-600";
  };

  const getBgColor = (score: number) => {
    if (score >= 80) return "bg-green-100";
    if (score >= 60) return "bg-yellow-100";
    if (score >= 40) return "bg-orange-100";
    return "bg-red-100";
  };

  const getSizeClasses = (size: string) => {
    switch (size) {
      case "sm":
        return "text-2xl font-bold";
      case "lg":
        return "text-6xl font-bold";
      default:
        return "text-4xl font-bold";
    }
  };

  return (
    <div className="text-center">
      <div className={`inline-flex items-center justify-center rounded-full p-4 ${getBgColor(score)}`}>
        <span className={`${getSizeClasses(size)} ${getColor(score)}`}>
          {score}
        </span>
      </div>
      <p className="text-sm text-muted-foreground mt-2">{label}</p>
    </div>
  );
}

interface RiskBadgeProps {
  probability: "low" | "medium" | "high";
  impact: "low" | "medium" | "high";
}

function RiskBadge({ probability, impact }: RiskBadgeProps) {
  const getSeverity = () => {
    const score = (probability === "high" ? 3 : probability === "medium" ? 2 : 1) +
                  (impact === "high" ? 3 : impact === "medium" ? 2 : 1);
    if (score >= 5) return { color: "destructive", label: "High Risk" };
    if (score >= 3) return { color: "secondary", label: "Medium Risk" };
    return { color: "outline", label: "Low Risk" };
  };

  const severity = getSeverity();

  return (
    <Badge variant={severity.color as any}>
      {severity.label}
    </Badge>
  );
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function FinancialProjections({ projections }: { projections: any }) {
  if (!projections) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-sm font-medium text-muted-foreground">Year 1</p>
            <p className="text-2xl font-bold text-blue-600">
              {formatCurrency(projections.year1_revenue || 0)}
            </p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-sm font-medium text-muted-foreground">Year 3</p>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(projections.year3_revenue || 0)}
            </p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-sm font-medium text-muted-foreground">Year 5</p>
            <p className="text-2xl font-bold text-purple-600">
              {formatCurrency(projections.year5_revenue || 0)}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function CompetitorCard({ competitor }: { competitor: any }) {
  if (!competitor) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{competitor.name}</CardTitle>
        <CardDescription>{competitor.market_position}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <h4 className="font-medium text-green-700 mb-1">Strengths</h4>
            <ul className="text-sm space-y-1">
              {competitor.strengths?.map((strength: string, idx: number) => (
                <li key={idx} className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                  {strength}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-red-700 mb-1">Weaknesses</h4>
            <ul className="text-sm space-y-1">
              {competitor.weaknesses?.map((weakness: string, idx: number) => (
                <li key={idx} className="flex items-center gap-2">
                  <AlertCircle className="h-3 w-3 text-red-500" />
                  {weakness}
                </li>
              ))}
            </ul>
          </div>
          <div className="pt-2 border-t">
            <p className="text-sm">
              <span className="font-medium">Estimated Revenue:</span>{" "}
              <span className="font-bold text-blue-600">{competitor.estimated_revenue}</span>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function RiskCard({ risk }: { risk: any }) {
  if (!risk) return null;

  return (
    <Card className="border-l-4 border-l-orange-400">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{risk.risk_category}</CardTitle>
          <RiskBadge probability={risk.probability_level} impact={risk.impact_level} />
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-3">{risk.risk_description}</p>
        <div>
          <h4 className="font-medium text-blue-700 mb-2">Mitigation Strategies</h4>
          <ul className="text-sm space-y-1">
            {risk.mitigation_strategies?.map((strategy: string, idx: number) => (
              <li key={idx} className="flex items-center gap-2">
                <Shield className="h-3 w-3 text-blue-500" />
                {strategy}
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ReportViewer({ report }: ReportViewerProps) {
  const [aiContent, setAiContent] = useState<AIAnalysisContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (report.ai_content) {
      try {
        const parsed = JSON.parse(report.ai_content);
        setAiContent(parsed);
      } catch (error) {
        console.error("Error parsing AI content:", error);
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, [report.ai_content]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading report...</p>
        </div>
      </div>
    );
  }

  if (!aiContent) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold mb-2">Report Not Available</h3>
          <p className="text-muted-foreground">
            {report.status === 'processing'
              ? "Your analysis is still being processed. Please check back soon."
              : "The report content is not available at this time."
            }
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Report Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <FileText className="h-6 w-6" />
                {report.business_input.business_name}
              </CardTitle>
              <CardDescription className="flex items-center gap-4 mt-2">
                <span className="flex items-center gap-1">
                  <Building className="h-4 w-4" />
                  {report.business_input.business_type}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {report.business_input.location}
                </span>
                <span className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  {formatCurrency(report.business_input.budget)}
                </span>
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Viability Score */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Business Viability Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center">
            <ScoreIndicator score={aiContent.business_viability_score} label="Overall Score" size="lg" />
          </div>
          {aiContent.executive_summary && (
            <div className="mt-6 text-center">
              <p className="text-lg font-medium">{aiContent.executive_summary.overall_assessment}</p>
              <p className="text-sm text-muted-foreground mt-2">
                Success Probability: {aiContent.executive_summary.success_probability}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="market">Market</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="operations">Operations</TabsTrigger>
          <TabsTrigger value="strategy">Strategy</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Executive Summary */}
          {aiContent.executive_summary && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Executive Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-green-700 mb-2">Key Strengths</h4>
                    <ul className="space-y-1">
                      {aiContent.executive_summary.key_strengths?.map((strength: string, idx: number) => (
                        <li key={idx} className="flex items-center gap-2 text-sm">
                          <TrendingUp className="h-3 w-3 text-green-500" />
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-orange-700 mb-2">Main Challenges</h4>
                    <ul className="space-y-1">
                      {aiContent.executive_summary.main_challenges?.map((challenge: string, idx: number) => (
                        <li key={idx} className="flex items-center gap-2 text-sm">
                          <AlertTriangle className="h-3 w-3 text-orange-500" />
                          {challenge}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Success Metrics */}
          {aiContent.success_metrics && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Success Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Key Performance Indicators</h4>
                    <div className="flex flex-wrap gap-2">
                      {aiContent.success_metrics.key_performance_indicators?.map((kpi: string, idx: number) => (
                        <Badge key={idx} variant="secondary">{kpi}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-1">Success Timeline</h4>
                      <p className="text-sm text-muted-foreground">
                        {aiContent.success_metrics.success_timeline}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">Measurement Methods</h4>
                      <ul className="text-sm space-y-1">
                        {aiContent.success_metrics.measurement_methods?.map((method: string, idx: number) => (
                          <li key={idx}>• {method}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="market" className="space-y-4">
          {/* Market Overview */}
          {aiContent.market_overview && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Market Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="text-center">
                    <p className="text-sm font-medium text-muted-foreground">Market Size</p>
                    <p className="text-lg font-bold text-blue-600">{aiContent.market_overview.market_size}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-muted-foreground">Growth Rate</p>
                    <p className="text-lg font-bold text-green-600">{aiContent.market_overview.market_growth_rate}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-muted-foreground">Target Segment</p>
                    <p className="text-sm font-medium">{aiContent.market_overview.target_market_segment}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Current Trends</h4>
                    <div className="flex flex-wrap gap-2">
                      {aiContent.market_overview.current_trends?.map((trend: string, idx: number) => (
                        <Badge key={idx} variant="outline">{trend}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Market Opportunities</h4>
                    <ul className="text-sm space-y-1">
                      {aiContent.market_overview.market_opportunities?.map((opportunity: string, idx: number) => (
                        <li key={idx} className="flex items-center gap-2">
                          <Lightbulb className="h-3 w-3 text-yellow-500" />
                          {opportunity}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Competitor Analysis */}
          {aiContent.competitor_analysis && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Competitor Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Competitive Landscape</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      {aiContent.competitor_analysis.competitive_landscape}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Top Competitors</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {aiContent.competitor_analysis.top_competitors?.map((competitor: any, idx: number) => (
                        <CompetitorCard key={idx} competitor={competitor} />
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-2">Your Competitive Advantages</h4>
                    <ul className="text-sm space-y-1">
                      {aiContent.competitor_analysis.competitive_advantages?.map((advantage: string, idx: number) => (
                        <li key={idx} className="flex items-center gap-2">
                          <Award className="h-3 w-3 text-blue-500" />
                          {advantage}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="financial" className="space-y-4">
          {/* Financial Projections */}
          {aiContent.monetization_strategy && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Financial Projections
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-2">Revenue Streams</h4>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {aiContent.monetization_strategy.primary_revenue_streams?.map((stream: string, idx: number) => (
                        <Badge key={idx} variant="secondary">{stream}</Badge>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-1">Pricing Strategy</h4>
                      <p className="text-sm text-muted-foreground">
                        {aiContent.monetization_strategy.pricing_strategy}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">Revenue Model</h4>
                      <p className="text-sm text-muted-foreground">
                        {aiContent.monetization_strategy.revenue_model}
                      </p>
                    </div>
                  </div>

                  {aiContent.monetization_strategy.financial_projections && (
                    <div>
                      <h4 className="font-medium mb-4">Revenue Projections</h4>
                      <FinancialProjections projections={aiContent.monetization_strategy.financial_projections} />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div className="text-center">
                          <p className="text-sm font-medium text-muted-foreground">Profit Margins</p>
                          <p className="text-lg font-bold text-green-600">
                            {aiContent.monetization_strategy.financial_projections.profit_margins}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium text-muted-foreground">Break-even Timeline</p>
                          <p className="text-lg font-bold text-blue-600">
                            {aiContent.monetization_strategy.financial_projections.break_even_timeline}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Financial Requirements */}
          {aiContent.financial_requirements && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Financial Requirements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {aiContent.financial_requirements.startup_costs && (
                    <div>
                      <h4 className="font-medium mb-3">Startup Costs Breakdown</h4>
                      <div className="space-y-2">
                        {Object.entries(aiContent.financial_requirements.startup_costs).map(([category, cost]) => (
                          <div key={category} className="flex justify-between items-center">
                            <span className="text-sm capitalize">{category.replace('_', ' ')}</span>
                            <span className="font-medium">{formatCurrency(cost as number)}</span>
                          </div>
                        ))}
                        <div className="pt-2 border-t flex justify-between items-center font-bold">
                          <span>Total Startup Costs</span>
                          <span className="text-blue-600">
                            {formatCurrency(Object.values(aiContent.financial_requirements.startup_costs).reduce((sum, cost) => sum + (cost as number), 0))}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-1">Funding Requirements</h4>
                      <p className="text-sm text-muted-foreground">
                        {aiContent.financial_requirements.funding_requirements}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">Break-even Analysis</h4>
                      <p className="text-sm text-muted-foreground">
                        {aiContent.financial_requirements.break_even_analysis}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="operations" className="space-y-4">
          {/* MVP Roadmap */}
          {aiContent.mvp_roadmap && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  MVP Roadmap
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {Object.entries(aiContent.mvp_roadmap).map(([phase, details]: [string, any]) => (
                    <Card key={phase} className="border-l-4 border-l-blue-500">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg capitalize">
                          Phase {phase.replace('phase', '')}: {phase.replace('phase', 'Phase ')}
                        </CardTitle>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {details.timeline}
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            {formatCurrency(details.budget_required)}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div>
                            <h5 className="font-medium mb-2">Key Features</h5>
                            <ul className="text-sm space-y-1">
                              {details.features?.map((feature: string, idx: number) => (
                                <li key={idx} className="flex items-center gap-2">
                                  <Zap className="h-3 w-3 text-blue-500" />
                                  {feature}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h5 className="font-medium mb-2">Key Milestones</h5>
                            <ul className="text-sm space-y-1">
                              {details.key_milestones?.map((milestone: string, idx: number) => (
                                <li key={idx} className="flex items-center gap-2">
                                  <Target className="h-3 w-3 text-green-500" />
                                  {milestone}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Operational Requirements */}
          {aiContent.operational_requirements && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Operational Requirements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {aiContent.operational_requirements.team_structure && (
                    <div>
                      <h4 className="font-medium mb-3">Team Structure</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center">
                          <p className="text-sm font-medium text-muted-foreground">Initial Team Size</p>
                          <p className="text-2xl font-bold text-blue-600">
                            {aiContent.operational_requirements.team_structure.initial_team_size} people
                          </p>
                        </div>
                        <div className="md:col-span-2">
                          <h5 className="font-medium mb-2">Key Roles Needed</h5>
                          <div className="flex flex-wrap gap-2">
                            {aiContent.operational_requirements.team_structure.key_roles_needed?.map((role: string, idx: number) => (
                              <Badge key={idx} variant="outline">{role}</Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="mt-3">
                        <p className="text-sm text-muted-foreground">
                          <strong>Hiring Timeline:</strong> {aiContent.operational_requirements.team_structure.hiring_timeline}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Technology Requirements</h4>
                      <ul className="text-sm space-y-1">
                        {aiContent.operational_requirements.technology_requirements?.map((tech: string, idx: number) => (
                          <li key={idx} className="flex items-center gap-2">
                            <BookOpen className="h-3 w-3 text-blue-500" />
                            {tech}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Physical Infrastructure</h4>
                      <ul className="text-sm space-y-1">
                        {aiContent.operational_requirements.physical_infrastructure?.map((infra: string, idx: number) => (
                          <li key={idx} className="flex items-center gap-2">
                            <Building className="h-3 w-3 text-green-500" />
                            {infra}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="strategy" className="space-y-4">
          {/* Marketing Strategy */}
          {aiContent.marketing_strategy && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Marketing Strategy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-2">Target Audience</h4>
                    <div className="flex flex-wrap gap-2">
                      {aiContent.marketing_strategy.target_audience?.map((audience: string, idx: number) => (
                        <Badge key={idx} variant="secondary">{audience}</Badge>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-1">Value Proposition</h4>
                      <p className="text-sm text-muted-foreground">
                        {aiContent.marketing_strategy.value_proposition}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">Customer Acquisition Strategy</h4>
                      <p className="text-sm text-muted-foreground">
                        {aiContent.marketing_strategy.customer_acquisition_strategy}
                      </p>
                    </div>
                  </div>

                  {aiContent.marketing_strategy.marketing_channels && (
                    <div>
                      <h4 className="font-medium mb-2">Marketing Channels</h4>
                      <div className="flex flex-wrap gap-2">
                        {aiContent.marketing_strategy.marketing_channels?.map((channel: string, idx: number) => (
                          <Badge key={idx} variant="outline">{channel}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Risks */}
          {aiContent.potential_risks && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Risk Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {aiContent.potential_risks?.map((risk: any, idx: number) => (
                    <RiskCard key={idx} risk={risk} />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recommendations */}
          {aiContent.recommendations && (
            <Card className="border-l-4 border-l-green-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-3 text-red-700">Immediate Actions (First 30 Days)</h4>
                    <ul className="text-sm space-y-1">
                      {aiContent.recommendations.immediate_actions?.map((action: string, idx: number) => (
                        <li key={idx} className="flex items-center gap-2">
                          <Zap className="h-3 w-3 text-red-500" />
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3 text-yellow-700">Short-term Priorities (3-6 Months)</h4>
                    <ul className="text-sm space-y-1">
                      {aiContent.recommendations.short_term_priorities?.map((priority: string, idx: number) => (
                        <li key={idx} className="flex items-center gap-2">
                          <Calendar className="h-3 w-3 text-yellow-500" />
                          {priority}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3 text-blue-700">Long-term Strategies (1+ Years)</h4>
                    <ul className="text-sm space-y-1">
                      {aiContent.recommendations.long_term_strategies?.map((strategy: string, idx: number) => (
                        <li key={idx} className="flex items-center gap-2">
                          <Target className="h-3 w-3 text-blue-500" />
                          {strategy}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3 text-green-700">Critical Success Factors</h4>
                    <ul className="text-sm space-y-1">
                      {aiContent.recommendations.critical_success_factors?.map((factor: string, idx: number) => (
                        <li key={idx} className="flex items-center gap-2">
                          <Star className="h-3 w-3 text-green-500" />
                          {factor}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Expert Analysis (if available) */}
      {report.expert_analysis_content && report.user.subscription_status === 'premium' && (
        <Card className="border-l-4 border-l-purple-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-purple-600" />
              Expert Analysis
            </CardTitle>
            <CardDescription>
              Professional review and insights from business experts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              {report.expert_analysis_content.split('\n').map((paragraph, idx) => (
                <p key={idx} className="mb-3">{paragraph}</p>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}