import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, Bot, Brain, Play, Settings, Users, ArrowLeft } from "lucide-react"
import Link from "next/link"

const guideContent = [
  {
    title: "Getting Started",
    icon: Play,
    content: [
      "Sign up for an account to access the AI playground",
      "Navigate to the playground and create a new session",
      "Select an AI model from the dropdown menu",
      "Enter your input and click 'Run AI Model'",
      "View the results in the output section",
    ],
  },
  {
    title: "Face Recognition AI",
    icon: Eye,
    content: [
      "Upload an image URL or describe the image you want to analyze",
      "The AI will detect faces and provide confidence scores",
      "Results include number of faces found and processing time",
      "Best results with clear, well-lit images",
      "Supports multiple face detection in a single image",
    ],
  },
  {
    title: "Vexere Assistant Chatbot",
    icon: Bot,
    content: [
      "Ask questions about travel booking and schedules",
      "Use natural language to inquire about bus routes",
      "Request information about prices and departure times",
      "Get assistance with booking procedures",
      "Example: 'What buses are available from Ho Chi Minh to Da Lat?'",
    ],
  },
  {
    title: "AI Text Generator",
    icon: Brain,
    content: [
      "Provide a creative prompt for text generation",
      "The AI will generate coherent and creative text",
      "Works well with story prompts, descriptions, and creative writing",
      "Try different prompt styles for varied results",
      "Example: 'Write a short story about a robot learning to paint'",
    ],
  },
  {
    title: "Tips & Best Practices",
    icon: Settings,
    content: [
      "Be specific with your prompts for better results",
      "Experiment with different input styles",
      "Check the model guide before using each AI model",
      "Save interesting results by creating new sessions",
      "Report any issues or unexpected behavior",
    ],
  },
  {
    title: "Session Management",
    icon: Users,
    content: [
      "Create new playground sessions for different experiments",
      "Rename sessions to organize your work",
      "Delete old sessions to keep your workspace clean",
      "Sessions are automatically saved in your browser",
      "Each session maintains its own history and context",
    ],
  },
]

export default function GuidePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" />
            Back to Portfolio
          </Link>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href="/playground">Try Playground</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/login">Login</Link>
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12 space-y-12">
        <div className="text-center space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">AI Playground Guide</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Learn how to use the AI playground and get the most out of each AI model. From getting started to advanced
            techniques.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {guideContent.map((section, index) => (
            <Card key={index} className="h-fit border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <section.icon className="w-5 h-5 text-primary" />
                  </div>
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {section.content.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Start Section */}
        <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-border/50">
          <CardHeader>
            <CardTitle className="text-2xl">Quick Start Checklist</CardTitle>
            <CardDescription className="text-lg">
              Follow these steps to get started with the AI playground
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                    1
                  </Badge>
                  <span className="text-sm">Create an account and sign in</span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                    2
                  </Badge>
                  <span className="text-sm">Navigate to the playground</span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                    3
                  </Badge>
                  <span className="text-sm">Create a new playground session</span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                    4
                  </Badge>
                  <span className="text-sm">Select your first AI model</span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                    5
                  </Badge>
                  <span className="text-sm">Read the model guide and try examples</span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                    6
                  </Badge>
                  <span className="text-sm">Experiment and have fun!</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-2xl">Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            <div>
              <h4 className="font-medium mb-3 text-lg">Do I need an account to use the playground?</h4>
              <p className="text-muted-foreground leading-relaxed">
                Yes, you need to create an account and sign in to access the AI playground features and save your
                sessions.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-3 text-lg">How do playground sessions work?</h4>
              <p className="text-muted-foreground leading-relaxed">
                Sessions are like individual workspaces where you can experiment with different AI models. Each session
                maintains its own history and can be renamed or deleted as needed.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-3 text-lg">Are there usage limits?</h4>
              <p className="text-muted-foreground leading-relaxed">
                Currently, there are no strict usage limits, but we may implement fair usage policies in the future to
                ensure good performance for all users.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-3 text-lg">How accurate are the AI models?</h4>
              <p className="text-muted-foreground leading-relaxed">
                Model accuracy varies by use case. These are demonstration models designed for experimentation and
                learning, and may not be suitable for production use.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <div className="text-center space-y-6 py-12">
          <h2 className="text-3xl font-bold">Ready to Start Experimenting?</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Jump into the playground and start exploring the capabilities of our AI models
          </p>
          <Button size="lg" className="text-lg px-8 py-6" asChild>
            <Link href="/playground">
              <Bot className="w-5 h-5 mr-2" />
              Open Playground
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
