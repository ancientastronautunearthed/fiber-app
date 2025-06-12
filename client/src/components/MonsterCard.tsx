import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Heart, Gamepad2, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function MonsterCard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: monster, isLoading } = useQuery({
    queryKey: ["/api/monster/active"],
  });

  const feedMonsterMutation = useMutation({
    mutationFn: async () => {
      // Simulate feeding monster - in real app this would be more complex
      const newHealth = Math.min(100, (monster?.health || 0) + 5);
      return { health: newHealth };
    },
    onSuccess: (data) => {
      // Update monster health in cache
      queryClient.setQueryData(["/api/monster/active"], (old: any) => ({
        ...old,
        health: data.health,
      }));
      toast({
        title: "Monster fed!",
        description: "Your monster gained 5 health points! 💚",
      });
    },
  });

  const playWithMonsterMutation = useMutation({
    mutationFn: async () => {
      // Simulate playing with monster
      return { message: "Your monster enjoyed playing with you!" };
    },
    onSuccess: (data) => {
      toast({
        title: "Playtime!",
        description: data.message,
      });
    },
  });

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-monster to-purple-700 text-white">
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-white/20 rounded mb-4"></div>
            <div className="h-20 w-20 bg-white/20 rounded-full mx-auto mb-4"></div>
            <div className="h-4 bg-white/20 rounded mb-2"></div>
            <div className="h-4 bg-white/20 rounded w-2/3 mx-auto"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!monster) {
    return (
      <Card className="bg-gradient-to-br from-gray-400 to-gray-600 text-white">
        <CardContent className="p-6 text-center">
          <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold mb-2">No Monster Companion</h3>
          <p className="text-sm opacity-90 mb-4">
            Complete your profile to create your monster companion!
          </p>
        </CardContent>
      </Card>
    );
  }

  const healthPercentage = monster.health || 0;
  const descriptiveWords = Array.isArray(monster.descriptiveWords) 
    ? monster.descriptiveWords 
    : [];

  // Generate a monster message based on health
  const getMonsterMessage = (health: number) => {
    if (health >= 90) return "I'm feeling fantastic! Thanks for taking such good care of yourself! ✨";
    if (health >= 70) return "Doing great! Keep up the healthy habits! 😊";
    if (health >= 50) return "I'm okay, but could use some better nutrition and rest. 💙";
    if (health >= 30) return "I'm not feeling my best. Maybe we should focus on healthier choices? 😔";
    return "I'm really struggling. Please take better care of yourself - I believe in you! 💜";
  };

  return (
    <Card className="bg-gradient-to-br from-monster to-purple-700 text-white">
      <CardHeader>
        <CardTitle className="text-center">Your Companion</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <Avatar className="h-24 w-24 mx-auto mb-3 border-2 border-white/30">
            <AvatarImage src={monster.imageUrl} alt={monster.name} />
            <AvatarFallback className="bg-white/20 text-white text-xl">
              {monster.name?.[0] || "M"}
            </AvatarFallback>
          </Avatar>
          <h4 className="font-semibold text-lg">{monster.name}</h4>
          {descriptiveWords.length > 0 && (
            <div className="flex flex-wrap justify-center gap-1 mt-2">
              {descriptiveWords.map((word: string, index: number) => (
                <Badge key={index} variant="secondary" className="bg-white/20 text-white border-white/30 text-xs">
                  {word}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Health Bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Health</span>
            <span className="text-sm font-medium">{monster.health}/100</span>
          </div>
          <Progress
            value={healthPercentage}
            className="w-full bg-white/20"
          />
        </div>

        {/* Monster Message */}
        <div className="bg-white/10 rounded-lg p-3">
          <p className="text-sm text-center">
            "{getMonsterMessage(monster.health)}"
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="secondary"
            className="bg-white/20 hover:bg-white/30 border-white/20 text-white"
            onClick={() => feedMonsterMutation.mutate()}
            disabled={feedMonsterMutation.isPending}
          >
            <Heart className="h-4 w-4 mr-1" />
            Feed
          </Button>
          <Button
            variant="secondary"
            className="bg-white/20 hover:bg-white/30 border-white/20 text-white"
            onClick={() => playWithMonsterMutation.mutate()}
            disabled={playWithMonsterMutation.isPending}
          >
            <Gamepad2 className="h-4 w-4 mr-1" />
            Play
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
