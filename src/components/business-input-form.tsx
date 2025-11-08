"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Plus, X, Loader2, TrendingUp, MapPin, DollarSign, Building } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { businessInputSchema, businessTypes, type BusinessInput } from "@/lib/schemas";

interface DynamicCriteriaProps {
  criteria: Record<string, any>;
  onChange: (criteria: Record<string, any>) => void;
}

function DynamicCriteria({ criteria, onChange }: DynamicCriteriaProps) {
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");

  const addCriterion = () => {
    if (newKey.trim() && newValue.trim()) {
      onChange({
        ...criteria,
        [newKey.trim()]: newValue.trim(),
      });
      setNewKey("");
      setNewValue("");
    }
  };

  const removeCriterion = (key: string) => {
    const newCriteria = { ...criteria };
    delete newCriteria[key];
    onChange(newCriteria);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {Object.entries(criteria).map(([key, value]) => (
          <Badge key={key} variant="secondary" className="flex items-center gap-1">
            {key}: {String(value)}
            <button
              type="button"
              onClick={() => removeCriterion(key)}
              className="ml-1 hover:text-destructive"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        {Object.keys(criteria).length === 0 && (
          <span className="text-sm text-muted-foreground">No additional criteria added</span>
        )}
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="Criterion name"
          value={newKey}
          onChange={(e) => setNewKey(e.target.value)}
          className="flex-1"
        />
        <Input
          placeholder="Value"
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          className="flex-1"
        />
        <Button
          type="button"
          onClick={addCriterion}
          size="sm"
          variant="outline"
          disabled={!newKey.trim() || !newValue.trim()}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

interface BusinessInputFormProps {
  onSubmit: (data: BusinessInput) => Promise<void>;
  loading?: boolean;
}

export default function BusinessInputForm({ onSubmit, loading = false }: BusinessInputFormProps) {
  const [otherCriteria, setOtherCriteria] = useState<Record<string, any>>({});
  const { toast } = useToast();

  const form = useForm<BusinessInput>({
    resolver: zodResolver(businessInputSchema),
    defaultValues: {
      business_name: "",
      business_type: "",
      budget: 0,
      location: "",
      other_criteria: {},
    },
  });

  const handleSubmit = async (data: BusinessInput) => {
    try {
      const submissionData = {
        ...data,
        other_criteria: otherCriteria,
      };
      await onSubmit(submissionData);
      form.reset();
      setOtherCriteria({});
      toast({
        title: "Success!",
        description: "Your business analysis request has been submitted.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit business analysis",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-2xl">
          <TrendingUp className="h-6 w-6 text-blue-600" />
          AI Business Analysis
        </CardTitle>
        <CardDescription>
          Get comprehensive AI-powered business insights and recommendations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="business_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      Business Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your business name"
                        {...field}
                        disabled={loading}
                      />
                    </FormControl>
                    <FormDescription>
                      The official name of your business or business idea
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="business_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={loading}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select business type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {businessTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Choose the category that best describes your business
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="budget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Initial Budget ($)
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="10000"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        disabled={loading}
                      />
                    </FormControl>
                    <FormDescription>
                      Your available starting capital or investment amount
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Location
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="New York, NY or Remote"
                        {...field}
                        disabled={loading}
                      />
                    </FormControl>
                    <FormDescription>
                      Your business location or target market area
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <div>
                <FormLabel className="text-base font-medium">Additional Criteria</FormLabel>
                <FormDescription className="mb-4">
                  Add any specific requirements, preferences, or constraints for your business analysis
                </FormDescription>
                <DynamicCriteria
                  criteria={otherCriteria}
                  onChange={setOtherCriteria}
                />
              </div>
            </div>

            {loading && (
              <div className="flex items-center gap-2 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                <span className="text-sm text-blue-700 dark:text-blue-300">
                  Generating your comprehensive business analysis... This may take a few moments.
                </span>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={loading || !form.formState.isValid}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Analysis...
                </>
              ) : (
                <>
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Generate Business Analysis
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}