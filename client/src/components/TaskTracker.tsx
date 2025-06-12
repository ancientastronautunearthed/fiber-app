import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Circle } from "lucide-react";

interface TaskTrackerProps {
  data: {
    completedTasks: string[];
    totalTasks: number;
  } | undefined;
  isLoading: boolean;
}

export default function TaskTracker({ data, isLoading }: TaskTrackerProps) {
  const tasks = [
    { id: 'food_log', label: 'Morning Meal Log', category: 'nutrition' },
    { id: 'symptom_log', label: 'Morning Symptom Log', category: 'health' },
    { id: 'sleep_log', label: 'Sleep Quality (Last Night)', category: 'health' },
    { id: 'riddle_answer', label: 'Monster Riddle', category: 'fun' },
    { id: 'supplement_log', label: 'Supplements Taken', category: 'nutrition' },
    { id: 'afternoon_meal', label: 'Lunch Entry', category: 'nutrition' },
    { id: 'afternoon_symptoms', label: 'Afternoon Check-in', category: 'health' },
    { id: 'sun_exposure', label: 'Sun Exposure Log', category: 'health' },
    { id: 'community_interaction', label: 'Community Interaction', category: 'social' },
    { id: 'evening_symptoms', label: 'Evening Symptom Review', category: 'health' },
  ];

  const completedTasks = data?.completedTasks || [];
  const totalTasks = data?.totalTasks || 10;
  const completedCount = completedTasks.length;
  const progressPercentage = (completedCount / totalTasks) * 100;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Today's Health Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                <div key={i} className="h-12 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Today's Health Tasks
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Progress:</span>
            <Progress value={progressPercentage} className="w-24" />
            <Badge variant="secondary" className="bg-secondary/10 text-secondary">
              {completedCount}/{totalTasks}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {tasks.map((task) => {
            const isCompleted = completedTasks.includes(task.id);
            return (
              <div
                key={task.id}
                className={`flex items-center p-3 rounded-lg border transition-colors ${
                  isCompleted
                    ? 'bg-success/10 border-success/20'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle className="h-5 w-5 text-success mr-3 flex-shrink-0" />
                ) : (
                  <Circle className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
                )}
                <span className={`text-sm font-medium ${
                  isCompleted ? 'text-gray-900' : 'text-gray-600'
                }`}>
                  {task.label}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
