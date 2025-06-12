import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Brain, Heart } from "lucide-react";

export default function HealthInsights() {
  const { data: insights, isLoading } = useQuery({
    queryKey: ["/api/insights"],
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Health Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!insights) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Health Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-4">
            Log more health data to get personalized insights
          </p>
        </CardContent>
      </Card>
    );
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'declining':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Heart className="h-4 w-4 text-blue-500" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving':
        return 'bg-green-100 text-green-800';
      case 'declining':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          AI Health Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Disease Progress */}
        {insights.diseaseProgress && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Disease Control Progress</span>
              <Badge className={getTrendColor(insights.diseaseProgress.trend)}>
                {getTrendIcon(insights.diseaseProgress.trend)}
                {insights.diseaseProgress.trend}
              </Badge>
            </div>
            <Progress value={insights.diseaseProgress.controlLevel} className="h-2" />
            <p className="text-xs text-gray-600">{insights.diseaseProgress.summary}</p>
          </div>
        )}

        {/* Key Patterns */}
        {insights.patterns && insights.patterns.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-1">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Patterns Identified
            </h4>
            {insights.patterns.map((pattern: any, index: number) => (
              <div key={index} className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-sm text-amber-800">{pattern.description}</p>
                {pattern.recommendation && (
                  <p className="text-xs text-amber-600 mt-1">
                    💡 {pattern.recommendation}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Positive Changes */}
        {insights.positiveChanges && insights.positiveChanges.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-1">
              <CheckCircle className="h-4 w-4 text-green-500" />
              What's Working
            </h4>
            {insights.positiveChanges.map((change: any, index: number) => (
              <div key={index} className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm text-green-800">{change.description}</p>
                <p className="text-xs text-green-600 mt-1">
                  Keep it up! This is helping weaken your disease.
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Weekly Summary */}
        {insights.weeklySummary && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium mb-2">This Week's Summary</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Logging Streak:</span>
                <span className="font-medium ml-1">{insights.weeklySummary.loggingDays}/7 days</span>
              </div>
              <div>
                <span className="text-gray-600">Disease Strength:</span>
                <span className="font-medium ml-1">
                  {insights.weeklySummary.avgDiseaseStrength}/100
                </span>
              </div>
              <div>
                <span className="text-gray-600">Best Day:</span>
                <span className="font-medium ml-1">{insights.weeklySummary.bestDay}</span>
              </div>
              <div>
                <span className="text-gray-600">Focus Area:</span>
                <span className="font-medium ml-1">{insights.weeklySummary.focusArea}</span>
              </div>
            </div>
          </div>
        )}

        {/* Action Items */}
        {insights.actionItems && insights.actionItems.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Recommended Actions</h4>
            <ul className="space-y-1">
              {insights.actionItems.map((item: string, index: number) => (
                <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}