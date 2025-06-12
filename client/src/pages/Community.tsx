import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Heart, MessageCircle, Users, Plus } from "lucide-react";

export default function Community() {
  const [showNewPost, setShowNewPost] = useState(false);
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    category: "",
    isAnonymous: false,
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: posts, isLoading } = useQuery({
    queryKey: ["/api/community/posts"],
  });

  const createPostMutation = useMutation({
    mutationFn: async (postData: typeof newPost) => {
      return await apiRequest("POST", "/api/community/posts", postData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/community/posts"] });
      setNewPost({ title: "", content: "", category: "", isAnonymous: false });
      setShowNewPost(false);
      toast({
        title: "Post created!",
        description: "Your post has been shared with the community.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmitPost = () => {
    if (!newPost.title || !newPost.content || !newPost.category) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    createPostMutation.mutate(newPost);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'success_story':
        return 'bg-success text-success-foreground';
      case 'question':
        return 'bg-primary text-primary-foreground';
      case 'tip':
        return 'bg-accent text-accent-foreground';
      case 'support':
        return 'bg-monster text-monster-foreground';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'success_story':
        return 'Success Story';
      case 'question':
        return 'Question';
      case 'tip':
        return 'Tip';
      case 'support':
        return 'Support';
      default:
        return category;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Users className="h-8 w-8 text-primary mr-3" />
                Community Center
              </h1>
              <p className="text-gray-600 mt-2">
                Connect with others, share experiences, and find support in your health journey.
              </p>
            </div>
            <Button
              onClick={() => setShowNewPost(true)}
              className="bg-primary hover:bg-primary/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Post
            </Button>
          </div>
        </div>

        {/* New Post Form */}
        {showNewPost && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Create New Post</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                  placeholder="Enter post title..."
                />
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Select onValueChange={(value) => setNewPost({ ...newPost, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="success_story">Success Story</SelectItem>
                    <SelectItem value="question">Question</SelectItem>
                    <SelectItem value="tip">Tip</SelectItem>
                    <SelectItem value="support">Support</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  placeholder="Share your experience, ask a question, or offer support..."
                  rows={4}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="anonymous"
                  checked={newPost.isAnonymous}
                  onCheckedChange={(checked) => 
                    setNewPost({ ...newPost, isAnonymous: checked as boolean })
                  }
                />
                <Label htmlFor="anonymous">Post anonymously</Label>
              </div>

              <div className="flex space-x-3">
                <Button
                  onClick={handleSubmitPost}
                  disabled={createPostMutation.isPending}
                  className="bg-primary hover:bg-primary/90"
                >
                  {createPostMutation.isPending ? "Posting..." : "Post"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowNewPost(false)}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Posts List */}
        <div className="space-y-6">
          {isLoading ? (
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                      <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                      <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : posts?.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No posts yet
                </h3>
                <p className="text-gray-600 mb-4">
                  Be the first to share your experience with the community!
                </p>
                <Button
                  onClick={() => setShowNewPost(true)}
                  className="bg-primary hover:bg-primary/90"
                >
                  Create First Post
                </Button>
              </CardContent>
            </Card>
          ) : (
            posts?.map((post: any) => (
              <Card key={post.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <Badge className={getCategoryColor(post.category)}>
                        {getCategoryLabel(post.category)}
                      </Badge>
                      <h3 className="text-lg font-semibold text-gray-900 mt-2 mb-2">
                        {post.title}
                      </h3>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <span>{post.isAnonymous ? 'Anonymous' : 'Community Member'}</span>
                      <span>•</span>
                      <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 leading-relaxed mb-4">
                    {post.content}
                  </p>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <button className="flex items-center space-x-1 hover:text-danger transition-colors">
                      <Heart className="h-4 w-4" />
                      <span>{post.likes || 0} likes</span>
                    </button>
                    <button className="flex items-center space-x-1 hover:text-primary transition-colors">
                      <MessageCircle className="h-4 w-4" />
                      <span>Reply</span>
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
