import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Utensils, Activity, Smile, Clock, Pill, Sun } from "lucide-react";

interface QuickLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'mood' | 'food' | 'symptoms';
}

export default function QuickLogModal({ isOpen, onClose, type }: QuickLogModalProps) {
  const [activeTab, setActiveTab] = useState(type);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mood log state
  const [moodRating, setMoodRating] = useState<number>(5);
  const [moodNotes, setMoodNotes] = useState("");

  // Food log state
  const [foodData, setFoodData] = useState({
    mealType: "",
    foodItems: "",
    date: new Date().toISOString().split('T')[0],
  });

  // Symptom log state
  const [symptomData, setSymptomData] = useState({
    timeOfDay: "",
    symptoms: [] as any[],
    customSymptoms: "",
    mood: 5,
    overallFeeling: 5,
    notes: "",
    date: new Date().toISOString().split('T')[0],
  });

  // Common Morgellons symptoms
  const commonSymptoms = [
    { id: 'itching', label: 'Itching', severity: 1 },
    { id: 'crawling_sensation', label: 'Crawling sensation', severity: 1 },
    { id: 'skin_lesions', label: 'Skin lesions', severity: 1 },
    { id: 'fatigue', label: 'Fatigue', severity: 1 },
    { id: 'brain_fog', label: 'Brain fog', severity: 1 },
    { id: 'joint_pain', label: 'Joint pain', severity: 1 },
    { id: 'muscle_pain', label: 'Muscle pain', severity: 1 },
    { id: 'memory_issues', label: 'Memory issues', severity: 1 },
    { id: 'mood_changes', label: 'Mood changes', severity: 1 },
    { id: 'sleep_disturbance', label: 'Sleep disturbance', severity: 1 },
  ];

  // Submit mutations
  const submitMoodMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/symptom-log", {
        date: new Date().toISOString().split('T')[0],
        timeOfDay: "quick_log",
        symptoms: [],
        mood: moodRating,
        overallFeeling: moodRating,
        notes: moodNotes,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      toast({
        title: "Mood logged!",
        description: "Your mood has been recorded successfully.",
      });
      handleClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const submitFoodMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/food-log", foodData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      queryClient.invalidateQueries({ queryKey: ["/api/monster/active"] });
      toast({
        title: "Food logged!",
        description: "Your meal has been recorded and analyzed.",
      });
      handleClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const submitSymptomMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/symptom-log", symptomData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      queryClient.invalidateQueries({ queryKey: ["/api/monster/active"] });
      toast({
        title: "Symptoms logged!",
        description: "Your symptoms have been recorded.",
      });
      handleClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleClose = () => {
    // Reset form states
    setMoodRating(5);
    setMoodNotes("");
    setFoodData({
      mealType: "",
      foodItems: "",
      date: new Date().toISOString().split('T')[0],
    });
    setSymptomData({
      timeOfDay: "",
      symptoms: [],
      customSymptoms: "",
      mood: 5,
      overallFeeling: 5,
      notes: "",
      date: new Date().toISOString().split('T')[0],
    });
    onClose();
  };

  const toggleSymptom = (symptomId: string, checked: boolean) => {
    if (checked) {
      setSymptomData(prev => ({
        ...prev,
        symptoms: [...prev.symptoms, { id: symptomId, severity: 3 }]
      }));
    } else {
      setSymptomData(prev => ({
        ...prev,
        symptoms: prev.symptoms.filter(s => s.id !== symptomId)
      }));
    }
  };

  const updateSymptomSeverity = (symptomId: string, severity: number) => {
    setSymptomData(prev => ({
      ...prev,
      symptoms: prev.symptoms.map(s => 
        s.id === symptomId ? { ...s, severity } : s
      )
    }));
  };

  const handleSubmit = () => {
    if (activeTab === 'mood') {
      submitMoodMutation.mutate();
    } else if (activeTab === 'food') {
      if (!foodData.mealType || !foodData.foodItems) {
        toast({
          title: "Missing information",
          description: "Please fill in meal type and food items.",
          variant: "destructive",
        });
        return;
      }
      submitFoodMutation.mutate();
    } else if (activeTab === 'symptoms') {
      if (!symptomData.timeOfDay) {
        toast({
          title: "Missing information",
          description: "Please select the time of day.",
          variant: "destructive",
        });
        return;
      }
      submitSymptomMutation.mutate();
    }
  };

  const isSubmitting = submitMoodMutation.isPending || submitFoodMutation.isPending || submitSymptomMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Quick Health Log</DialogTitle>
        </DialogHeader>

        {/* Tab Navigation */}
        <div className="flex space-x-1 p-1 bg-gray-100 rounded-lg">
          <Button
            variant={activeTab === 'mood' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('mood')}
            className="flex-1"
          >
            <Smile className="h-4 w-4 mr-2" />
            Mood
          </Button>
          <Button
            variant={activeTab === 'food' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('food')}
            className="flex-1"
          >
            <Utensils className="h-4 w-4 mr-2" />
            Food
          </Button>
          <Button
            variant={activeTab === 'symptoms' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('symptoms')}
            className="flex-1"
          >
            <Activity className="h-4 w-4 mr-2" />
            Symptoms
          </Button>
        </div>

        {/* Mood Tab */}
        {activeTab === 'mood' && (
          <div className="space-y-4">
            <div>
              <Label className="text-base font-medium">How are you feeling right now?</Label>
              <div className="grid grid-cols-5 gap-2 mt-3">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <Button
                    key={rating}
                    variant={moodRating === rating ? 'default' : 'outline'}
                    className="flex flex-col items-center p-4 h-auto"
                    onClick={() => setMoodRating(rating)}
                  >
                    <div className="text-2xl mb-1">
                      {rating === 1 ? '😢' : rating === 2 ? '😕' : rating === 3 ? '😐' : rating === 4 ? '🙂' : '😊'}
                    </div>
                    <div className="text-xs">{rating}</div>
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="mood-notes">Additional notes (optional)</Label>
              <Textarea
                id="mood-notes"
                value={moodNotes}
                onChange={(e) => setMoodNotes(e.target.value)}
                placeholder="Any thoughts, feelings, or observations..."
                rows={3}
              />
            </div>
          </div>
        )}

        {/* Food Tab */}
        {activeTab === 'food' && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="meal-type">Meal Type</Label>
              <Select onValueChange={(value) => setFoodData(prev => ({ ...prev, mealType: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select meal type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="breakfast">Breakfast</SelectItem>
                  <SelectItem value="lunch">Lunch</SelectItem>
                  <SelectItem value="dinner">Dinner</SelectItem>
                  <SelectItem value="snack">Snack</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="food-items">What did you eat?</Label>
              <Textarea
                id="food-items"
                value={foodData.foodItems}
                onChange={(e) => setFoodData(prev => ({ ...prev, foodItems: e.target.value }))}
                placeholder="Describe your meal... (e.g., grilled salmon with quinoa and steamed broccoli)"
                rows={3}
              />
            </div>
          </div>
        )}

        {/* Symptoms Tab */}
        {activeTab === 'symptoms' && (
          <div className="space-y-4">
            <div>
              <Label>Time of Day</Label>
              <Select onValueChange={(value) => setSymptomData(prev => ({ ...prev, timeOfDay: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select time of day" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">Morning</SelectItem>
                  <SelectItem value="afternoon">Afternoon</SelectItem>
                  <SelectItem value="evening">Evening</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-base font-medium">Current Symptoms</Label>
              <Card className="mt-2">
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {commonSymptoms.map((symptom) => {
                      const isSelected = symptomData.symptoms.some(s => s.id === symptom.id);
                      const selectedSymptom = symptomData.symptoms.find(s => s.id === symptom.id);
                      
                      return (
                        <div key={symptom.id} className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={symptom.id}
                              checked={isSelected}
                              onCheckedChange={(checked) => toggleSymptom(symptom.id, checked as boolean)}
                            />
                            <Label htmlFor={symptom.id} className="text-sm">
                              {symptom.label}
                            </Label>
                          </div>
                          {isSelected && (
                            <div className="ml-6">
                              <Label className="text-xs text-gray-600">Severity (1-5)</Label>
                              <div className="flex space-x-1 mt-1">
                                {[1, 2, 3, 4, 5].map((severity) => (
                                  <Button
                                    key={severity}
                                    variant={selectedSymptom?.severity === severity ? 'default' : 'outline'}
                                    size="sm"
                                    className="w-8 h-8 p-0 text-xs"
                                    onClick={() => updateSymptomSeverity(symptom.id, severity)}
                                  >
                                    {severity}
                                  </Button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <Label htmlFor="custom-symptoms">Other symptoms or notes</Label>
              <Textarea
                id="custom-symptoms"
                value={symptomData.customSymptoms}
                onChange={(e) => setSymptomData(prev => ({ ...prev, customSymptoms: e.target.value }))}
                placeholder="Describe any other symptoms or observations..."
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Overall Feeling (1-10)</Label>
                <Select onValueChange={(value) => setSymptomData(prev => ({ ...prev, overallFeeling: parseInt(value) }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Rate 1-10" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
                      <SelectItem key={rating} value={rating.toString()}>
                        {rating} - {rating <= 3 ? 'Poor' : rating <= 6 ? 'Fair' : rating <= 8 ? 'Good' : 'Excellent'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Mood (1-10)</Label>
                <Select onValueChange={(value) => setSymptomData(prev => ({ ...prev, mood: parseInt(value) }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Rate 1-10" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
                      <SelectItem key={rating} value={rating.toString()}>
                        {rating} - {rating <= 3 ? 'Low' : rating <= 6 ? 'Moderate' : rating <= 8 ? 'Good' : 'Great'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-4">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 bg-primary hover:bg-primary/90"
          >
            {isSubmitting ? "Logging..." : "Log Entry"}
          </Button>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
