import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Heart, Sparkles } from "lucide-react";

const registrationSchema = z.object({
  height: z.number().min(36).max(96),
  weight: z.number().min(50).max(500),
  age: z.number().min(13).max(120),
  gender: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  diagnosisStatus: z.enum(["diagnosed", "suspect"]),
  misdiagnoses: z.string().optional(),
  descriptiveWords: z.array(z.string()).length(5),
});

type RegistrationForm = z.infer<typeof registrationSchema>;

export default function Registration() {
  const [step, setStep] = useState(1);
  const [descriptiveWords, setDescriptiveWords] = useState<string[]>(["", "", "", "", ""]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<RegistrationForm>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      height: 0,
      weight: 0,
      age: 0,
      gender: "",
      city: "",
      state: "",
      diagnosisStatus: "suspect",
      misdiagnoses: "",
      descriptiveWords: ["", "", "", "", ""],
    },
  });

  const profileMutation = useMutation({
    mutationFn: async (data: Partial<RegistrationForm>) => {
      return await apiRequest("PATCH", "/api/user/profile", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      if (step === 1) {
        setStep(2);
      } else {
        setStep(3);
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const monsterMutation = useMutation({
    mutationFn: async (words: string[]) => {
      return await apiRequest("POST", "/api/monster/create", { descriptiveWords: words });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Welcome to Fiber Friends!",
        description: "Your monster companion has been created successfully!",
      });
      // Redirect to dashboard
      window.location.href = "/";
    },
    onError: (error) => {
      toast({
        title: "Error creating monster",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmitProfile = (data: RegistrationForm) => {
    const { descriptiveWords, ...profileData } = data;
    profileMutation.mutate(profileData);
  };

  const onSubmitMonster = () => {
    const validWords = descriptiveWords.filter(word => word.trim() !== "");
    if (validWords.length !== 5) {
      toast({
        title: "Invalid words",
        description: "Please provide exactly 5 descriptive words for your monster.",
        variant: "destructive",
      });
      return;
    }
    monsterMutation.mutate(validWords);
  };

  const updateDescriptiveWord = (index: number, value: string) => {
    const newWords = [...descriptiveWords];
    newWords[index] = value;
    setDescriptiveWords(newWords);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Heart className="h-8 w-8 text-primary mr-2" />
            <span className="text-2xl font-bold text-gray-900">Fiber Friends</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Complete Your Profile</h1>
          <p className="text-gray-600 mt-2">
            {step === 1 && "Let's get to know you better"}
            {step === 2 && "Tell us about your health journey"}
            {step === 3 && "Create your monster companion"}
          </p>
        </div>

        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(onSubmitProfile)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="height">Height (inches)</Label>
                    <Input
                      id="height"
                      type="number"
                      {...form.register("height", { valueAsNumber: true })}
                      placeholder="e.g., 65"
                    />
                    {form.formState.errors.height && (
                      <p className="text-sm text-red-600">{form.formState.errors.height.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="weight">Weight (lbs)</Label>
                    <Input
                      id="weight"
                      type="number"
                      {...form.register("weight", { valueAsNumber: true })}
                      placeholder="e.g., 150"
                    />
                    {form.formState.errors.weight && (
                      <p className="text-sm text-red-600">{form.formState.errors.weight.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    {...form.register("age", { valueAsNumber: true })}
                    placeholder="e.g., 35"
                  />
                  {form.formState.errors.age && (
                    <p className="text-sm text-red-600">{form.formState.errors.age.message}</p>
                  )}
                </div>

                <div>
                  <Label>Gender</Label>
                  <Select onValueChange={(value) => form.setValue("gender", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="non-binary">Non-binary</SelectItem>
                      <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.gender && (
                    <p className="text-sm text-red-600">{form.formState.errors.gender.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      {...form.register("city")}
                      placeholder="e.g., Los Angeles"
                    />
                    {form.formState.errors.city && (
                      <p className="text-sm text-red-600">{form.formState.errors.city.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      {...form.register("state")}
                      placeholder="e.g., CA"
                    />
                    {form.formState.errors.state && (
                      <p className="text-sm text-red-600">{form.formState.errors.state.message}</p>
                    )}
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-primary/90"
                  disabled={profileMutation.isPending}
                >
                  {profileMutation.isPending ? "Saving..." : "Continue"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Health Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(onSubmitProfile)} className="space-y-4">
                <div>
                  <Label>Morgellons Status</Label>
                  <RadioGroup
                    onValueChange={(value) => form.setValue("diagnosisStatus", value as "diagnosed" | "suspect")}
                    defaultValue="suspect"
                    className="mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="diagnosed" id="diagnosed" />
                      <Label htmlFor="diagnosed">Officially diagnosed</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="suspect" id="suspect" />
                      <Label htmlFor="suspect">Suspect I have it</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label htmlFor="misdiagnoses">Previous Misdiagnoses (Optional)</Label>
                  <Textarea
                    id="misdiagnoses"
                    {...form.register("misdiagnoses")}
                    placeholder="List any previous misdiagnoses or conditions you were told you had..."
                    rows={3}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-primary/90"
                  disabled={profileMutation.isPending}
                >
                  {profileMutation.isPending ? "Saving..." : "Continue"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Sparkles className="h-5 w-5 text-monster mr-2" />
                Create Your Monster Companion
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-600">
                  Describe your monster companion with 5 words. Our AI will generate a unique creature based on your descriptions!
                </p>
                
                <div className="space-y-3">
                  {[0, 1, 2, 3, 4].map((index) => (
                    <div key={index}>
                      <Label htmlFor={`word-${index}`}>Word {index + 1}</Label>
                      <Input
                        id={`word-${index}`}
                        value={descriptiveWords[index]}
                        onChange={(e) => updateDescriptiveWord(index, e.target.value)}
                        placeholder="e.g., gentle, wise, colorful..."
                        maxLength={20}
                      />
                    </div>
                  ))}
                </div>

                <Button 
                  onClick={onSubmitMonster}
                  className="w-full bg-monster hover:bg-monster/90"
                  disabled={monsterMutation.isPending}
                >
                  {monsterMutation.isPending ? "Creating your monster..." : "Create My Monster"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
