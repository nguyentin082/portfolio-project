import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Github, ExternalLink, Bot, Brain, Eye, LogIn } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import Link from "next/link"

const projects = [
  {
    id: 1,
    title: "Face Recognition AI",
    description: "Advanced face detection and recognition system using computer vision",
    image: "/placeholder.svg?height=200&width=300&text=Face+Recognition",
    tags: ["Computer Vision", "Python", "OpenCV"],
    github: "https://github.com/username/face-recognition",
    demo: "/playground?model=face-recognition",
    icon: Eye,
  },
  {
    id: 2,
    title: "Vexere Assistant Chatbot",
    description: "Intelligent chatbot for travel booking and customer support",
    image: "/placeholder.svg?height=200&width=300&text=Chatbot+Assistant",
    tags: ["NLP", "Chatbot", "Travel Tech"],
    github: "https://github.com/username/vexere-chatbot",
    demo: "/playground?model=vexere-assistant",
    icon: Bot,
  },
  {
    id: 3,
    title: "AI Text Generator",
    description: "Creative text generation using transformer models",
    image: "/placeholder.svg?height=200&width=300&text=Text+Generator",
    tags: ["NLP", "Transformers", "GPT"],
    github: "https://github.com/username/text-generator",
    demo: "/playground?model=text-generator",
    icon: Brain,
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">AI Portfolio</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href="/guide">Guide</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/login">
                <LogIn className="w-4 h-4 mr-2" />
                Login
              </Link>
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12 space-y-16">
        {/* Hero Section */}
        <section className="text-center space-y-8">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium">
              <Bot className="w-4 h-4" />
              AI Developer & Researcher
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              AI Portfolio & Playground
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Explore cutting-edge AI models and experiment with them in an interactive playground. From computer vision
              to natural language processing.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8 py-6" asChild>
              <Link href="/playground">
                <Bot className="w-5 h-5 mr-2" />
                Try AI Playground
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-6 bg-transparent" asChild>
              <Link href="/guide">View Documentation</Link>
            </Button>
          </div>
        </section>

        {/* About Section */}
        <section className="space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold">About Me</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Passionate about building AI solutions that solve real-world problems
            </p>
          </div>
          <Card className="max-w-5xl mx-auto border-border/50">
            <CardContent className="p-8 md:p-12">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                  <h3 className="text-2xl md:text-3xl font-semibold">AI Developer & Researcher</h3>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    Specialized in computer vision, natural language processing, and building practical AI solutions. I
                    focus on creating intelligent systems that enhance user experiences and solve complex challenges
                    across various industries.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Badge variant="secondary" className="px-3 py-1">
                      Machine Learning
                    </Badge>
                    <Badge variant="secondary" className="px-3 py-1">
                      Computer Vision
                    </Badge>
                    <Badge variant="secondary" className="px-3 py-1">
                      NLP
                    </Badge>
                    <Badge variant="secondary" className="px-3 py-1">
                      Python
                    </Badge>
                    <Badge variant="secondary" className="px-3 py-1">
                      TensorFlow
                    </Badge>
                    <Badge variant="secondary" className="px-3 py-1">
                      PyTorch
                    </Badge>
                  </div>
                </div>
                <div className="flex justify-center">
                  <div className="w-64 h-64 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent rounded-2xl flex items-center justify-center border border-border/50">
                    <Bot className="w-32 h-32 text-primary" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Projects Section */}
        <section className="space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold">Featured AI Projects</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Explore my latest AI models and try them in the interactive playground
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project) => (
              <Card
                key={project.id}
                className="group overflow-hidden border-border/50 hover:border-primary/50 transition-all duration-300"
              >
                <div className="aspect-video relative overflow-hidden">
                  <img
                    src={project.image || "/placeholder.svg"}
                    alt={project.title}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4">
                    <div className="bg-background/80 backdrop-blur-sm rounded-full p-3 border border-border/50">
                      <project.icon className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                </div>
                <CardHeader className="space-y-3">
                  <CardTitle className="text-xl">{project.title}</CardTitle>
                  <CardDescription className="text-base leading-relaxed">{project.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" size="sm" className="flex-1 bg-transparent" asChild>
                      <a href={project.github} target="_blank" rel="noopener noreferrer">
                        <Github className="w-4 h-4 mr-2" />
                        Code
                      </a>
                    </Button>
                    <Button size="sm" className="flex-1" asChild>
                      <Link href={project.demo}>
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Try Demo
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center space-y-8 py-16">
          <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">Ready to Explore AI?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Jump into the interactive playground and start experimenting with cutting-edge AI models
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8 py-6" asChild>
              <Link href="/playground">
                <Bot className="w-5 h-5 mr-2" />
                Start Playing
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-6 bg-transparent" asChild>
              <Link href="/guide">Read Documentation</Link>
            </Button>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-background/95">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              <span className="font-semibold">AI Portfolio</span>
            </div>
            <p className="text-sm text-muted-foreground">© 2024 AI Portfolio. Built with Next.js and shadcn/ui.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
