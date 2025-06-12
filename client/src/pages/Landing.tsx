import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Users, Trophy, Sparkles } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Heart className="h-8 w-8 text-primary mr-2" />
              <span className="text-2xl font-bold text-gray-900">Fiber Friends</span>
            </div>
            <Button onClick={handleLogin} className="bg-primary hover:bg-primary/90">
              Login with Replit
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Track Your Health Journey with
            <span className="text-primary block">AI-Powered Companions</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Join the Fiber Friends community and take control of your Morgellons health journey. Track symptoms, log nutrition, and connect with others while your AI companion supports you every step of the way.
          </p>
          <Button onClick={handleLogin} size="lg" className="bg-primary hover:bg-primary/90 text-lg px-8 py-3">
            Start Your Journey
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-20">
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <Sparkles className="h-12 w-12 text-monster mx-auto mb-4" />
              <CardTitle className="text-xl">AI Monster Companion</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Create your unique AI-generated monster companion that reacts to your health choices and motivates your journey.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <Heart className="h-12 w-12 text-danger mx-auto mb-4" />
              <CardTitle className="text-xl">Comprehensive Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Log symptoms, food, sleep, sun exposure, and medications with AI-powered insights and nutrition analysis.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <Users className="h-12 w-12 text-secondary mx-auto mb-4" />
              <CardTitle className="text-xl">Supportive Community</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Connect with others on similar journeys, share experiences, and find support in our caring community.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <Trophy className="h-12 w-12 text-accent mx-auto mb-4" />
              <CardTitle className="text-xl">Gamified Experience</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Earn points, solve daily riddles, and unlock achievements as you build healthy habits.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-20">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Ready to Take Control of Your Health?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Join thousands of others who are already on their path to better health with Fiber Friends.
          </p>
          <Button onClick={handleLogin} size="lg" className="bg-primary hover:bg-primary/90 text-lg px-8 py-3">
            Get Started Free
          </Button>
        </div>
      </div>
    </div>
  );
}
