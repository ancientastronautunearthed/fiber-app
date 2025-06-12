import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/Navigation";
import TaskTracker from "@/components/TaskTracker";
import MonsterCard from "@/components/MonsterCard";
import QuickLogModal from "@/components/QuickLogModal";
import HealthInsights from "@/components/HealthInsights";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Utensils, Activity, Smile } from "lucide-react";
import { useState } from "react";

export default function Dashboard() {
  const [showQuickLog, setShowQuickLog] = useState(false);
  const [quickLogType, setQuickLogType] = useState<'mood' | 'food' | 'symptoms'>('mood');

  const { data: dashboardData, isLoading: dashboardLoading } = useQuery({
    queryKey: ["/api/dashboard"],
  });

  const { data: activities, isLoading: activitiesLoading } = useQuery({
    queryKey: ["/api/activities"],
  });

  const { data: communityPosts, isLoading: communityLoading } = useQuery({
    queryKey: ["/api/community/posts"],
  });

  const { data: todaysRiddle } = useQuery({
    queryKey: ["/api/riddle/today"],
  });

  const openQuickLog = (type: 'mood' | 'food' | 'symptoms') => {
    setQuickLogType(type);
    setShowQuickLog(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Daily Tasks Dashboard */}
            <TaskTracker data={dashboardData} isLoading={dashboardLoading} />

            {/* Quick Log Entry */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Log Entry</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button
                    variant="outline"
                    className="flex flex-col items-center p-6 h-auto border-2 border-dashed hover:border-primary hover:bg-primary/5"
                    onClick={() => openQuickLog('food')}
                  >
                    <Utensils className="h-8 w-8 text-gray-400 mb-2" />
                    <span className="text-sm font-medium text-gray-600">Log Meal</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="flex flex-col items-center p-6 h-auto border-2 border-dashed hover:border-primary hover:bg-primary/5"
                    onClick={() => openQuickLog('symptoms')}
                  >
                    <Activity className="h-8 w-8 text-gray-400 mb-2" />
                    <span className="text-sm font-medium text-gray-600">Log Symptoms</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="flex flex-col items-center p-6 h-auto border-2 border-dashed hover:border-primary hover:bg-primary/5"
                    onClick={() => openQuickLog('mood')}
                  >
                    <Smile className="h-8 w-8 text-gray-400 mb-2" />
                    <span className="text-sm font-medium text-gray-600">Log Mood</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity Feed */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {activitiesLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : activities?.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No activities yet. Start logging your health data to see your activity feed!
                  </p>
                ) : (
                  <div className="space-y-4">
                    {activities?.map((activity: any) => (
                      <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-secondary/20 rounded-full flex items-center justify-center">
                            <Activity className="h-4 w-4 text-secondary" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900">
                            <span className="font-medium">{activity.action}:</span> {activity.description}
                          </p>
                          <p className="text-xs text-gray-600">
                            {new Date(activity.createdAt).toLocaleString()}
                            {activity.pointsEarned > 0 && (
                              <span className="ml-2 text-accent">
                                • Earned {activity.pointsEarned} points!
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Monster Companion Panel */}
            <MonsterCard />
            
            {/* AI Health Insights */}
            <HealthInsights />

            {/* Today's Riddle */}
            {todaysRiddle && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <span className="text-accent mr-2">🧩</span>
                    Monster's Riddle
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <p className="text-sm text-gray-700 mb-3">
                      {todaysRiddle.question}
                    </p>
                    <div className="space-y-2">
                      {todaysRiddle.options?.map((option: string, index: number) => (
                        <Button
                          key={index}
                          variant="outline"
                          className="w-full justify-start text-left hover:border-primary hover:bg-primary/5"
                          size="sm"
                        >
                          {String.fromCharCode(65 + index)}) {option}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <Button className="w-full bg-accent hover:bg-accent/90 text-white">
                    Submit Answer
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Community Highlights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Community Highlights
                  <Button variant="link" className="text-sm">View All</Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {communityLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : communityPosts?.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    No community posts yet.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {communityPosts?.slice(0, 3).map((post: any) => (
                      <div key={post.id} className="border-l-4 border-l-secondary pl-3">
                        <h4 className="text-sm font-medium text-gray-900 mb-1">
                          {post.category === 'success_story' ? 'Success Story' : 
                           post.category === 'question' ? 'Question' : 'Tip'}
                        </h4>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {post.content}
                        </p>
                        <div className="flex items-center text-xs text-gray-500">
                          <span>{post.isAnonymous ? 'Anonymous' : 'Community Member'}</span>
                          <span className="mx-1">•</span>
                          <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                          {post.likes > 0 && (
                            <>
                              <span className="mx-1">•</span>
                              <span>❤️ {post.likes}</span>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Weekly Progress */}
            <Card>
              <CardHeader>
                <CardTitle>This Week's Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Logging Streak</span>
                    <div className="flex items-center">
                      <span className="text-lg font-semibold text-secondary mr-1">
                        {dashboardData?.weeklyProgress.loggingStreak || 0}
                      </span>
                      <span className="text-sm text-gray-600">days</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Monster Health Avg</span>
                    <div className="flex items-center">
                      <span className="text-lg font-semibold text-monster mr-1">
                        {dashboardData?.weeklyProgress.monsterHealthAvg || 100}
                      </span>
                      <span className="text-sm text-gray-600">/100</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Points Earned</span>
                    <div className="flex items-center">
                      <span className="text-lg font-semibold text-accent mr-1">
                        {dashboardData?.weeklyProgress.pointsEarned || 0}
                      </span>
                      <span className="text-accent">🪙</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <Button
        onClick={() => setShowQuickLog(true)}
        className="fixed bottom-6 right-6 bg-primary hover:bg-primary/90 w-14 h-14 rounded-full shadow-lg"
        size="icon"
      >
        <Plus className="h-6 w-6" />
      </Button>

      {/* Quick Log Modal */}
      <QuickLogModal
        isOpen={showQuickLog}
        onClose={() => setShowQuickLog(false)}
        type={quickLogType}
      />
    </div>
  );
}
