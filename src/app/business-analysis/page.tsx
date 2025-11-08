"use client";

import { useState } from "react";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import BusinessInputForm from "@/components/business-input-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, TrendingUp, BarChart3, Target, Lightbulb, Shield, CheckCircle } from "lucide-react";
import Link from "next/link";
import { BusinessInput } from "@/lib/schemas";
import { useRouter } from "next/navigation";

export default function BusinessAnalysisPage() {
  const [currentAnalysisId, setCurrentAnalysisId] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const router = useRouter();

  const handleSubmit = async (data: BusinessInput) => {
    try {
      const response = await fetch("/api/business-analysis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.code === "INSUFFICIENT_CREDITS") {
          throw new Error("You've run out of credits. Upgrade to premium for unlimited analyses!");
        }
        throw new Error(errorData.error || "Failed to submit analysis request");
      }

      const result = await response.json();
      setCurrentAnalysisId(result.report_id);
      setAnalysisResult(result);

      // Show success message and redirect to report view
      console.log("Analysis completed:", result);

      // Auto-redirect to report after a short delay
      setTimeout(() => {
        router.push(`/reports/${result.report_id}`);
      }, 3000);

    } catch (error) {
      console.error("Analysis submission error:", error);
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            AI Business Consultation Platform
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get comprehensive AI-powered business analysis including market insights,
            competitor analysis, monetization strategies, and risk assessment.
          </p>
        </div>

        <SignedOut>
          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <CardTitle>Sign In Required</CardTitle>
              <CardDescription>
                Please sign in to access the AI Business Consultation Platform
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <SignInButton mode="modal">
                <Button size="lg">
                  Sign In to Get Started
                </Button>
              </SignInButton>
            </CardContent>
          </Card>
        </SignedOut>

        <SignedIn>
          {/* Features Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="text-center">
              <CardHeader>
                <BarChart3 className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <CardTitle className="text-lg">Market Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Comprehensive market overview, trends, and opportunity identification
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Target className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <CardTitle className="text-lg">Competitor Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Detailed competitor analysis and positioning strategies
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Lightbulb className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <CardTitle className="text-lg">AI-Powered Strategy</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Actionable recommendations and monetization strategies
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Success Message */}
          {analysisResult && (
            <Card className="mb-8 border-green-200 bg-green-50 dark:bg-green-900/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  <div>
                    <h3 className="font-semibold text-green-800 dark:text-green-200">
                      Analysis Complete!
                    </h3>
                    <p className="text-green-700 dark:text-green-300">
                      {analysisResult.message}
                    </p>
                    <div className="mt-2 text-sm text-green-600 dark:text-green-400">
                      <strong>Viability Score:</strong> {analysisResult.business_viability_score}/100 •
                      <strong> Processing Time:</strong> {analysisResult.processing_time_seconds}s
                    </div>
                    <div className="mt-3">
                      <p className="text-sm text-green-600 dark:text-green-400">
                        {analysisResult.next_steps}
                      </p>
                      <p className="text-xs text-green-500 dark:text-green-400 mt-1">
                        Redirecting to your report in 3 seconds...
                      </p>
                      <div className="flex gap-2 mt-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            router.push(`/reports/${analysisResult.report_id}`);
                          }}
                        >
                          View Report Now
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            // Reset to allow new analysis
                            setAnalysisResult(null);
                            setCurrentAnalysisId(null);
                          }}
                        >
                          Create New Analysis
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Business Input Form */}
          {!analysisResult && (
            <div className="mb-8">
              <BusinessInputForm onSubmit={handleSubmit} loading={false} />
            </div>
          )}

          {/* Premium Features CTA */}
          <Card className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-6 w-6" />
                Premium Features Available
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <h4 className="font-semibold mb-2">Expert Review</h4>
                  <p className="text-sm opacity-90">
                    Get your AI analysis reviewed and enhanced by business experts
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Live Coaching</h4>
                  <p className="text-sm opacity-90">
                    Schedule 1-on-1 sessions with business consultants
                  </p>
                </div>
              </div>
              <Button variant="secondary" size="lg">
                Upgrade to Premium
              </Button>
            </CardContent>
          </Card>
        </SignedIn>
      </div>
    </div>
  );
}