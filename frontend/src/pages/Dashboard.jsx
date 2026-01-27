import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, History, MessageSquare } from "lucide-react";
import Layout from "../components/Layout";

const Dashboard = () => {
  const cards = [
    {
      title: "Upload Medical Report",
      description: "Upload your medical images or reports for AI analysis",
      icon: Upload,
      link: "/upload",
      gradient: "from-blue-500 to-blue-600",
    },
    {
      title: "View History",
      description: "Access your previously analyzed medical reports",
      icon: History,
      link: "/history",
      gradient: "from-cyan-500 to-cyan-600",
    },
    {
      title: "Ask MedLense AI",
      description: "Chat with our AI assistant about your medical reports",
      icon: MessageSquare,
      link: "/chat",
      gradient: "from-teal-500 to-teal-600",
    },
  ];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* Welcome Section */}
        <div className="text-center mb-12 animate-in fade-in duration-700">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Welcome to MedLense AI
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Your intelligent medical report analysis assistant. Upload, analyze,
            and understand your medical reports with AI-powered insights.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {cards.map((card, index) => (
            <Link
              key={index}
              to={card.link}
              className="group animate-in fade-in slide-in-from-bottom duration-700"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <Card className="h-full border-2 hover:border-primary transition-all duration-300 hover:shadow-xl hover:-translate-y-2 bg-card/80 backdrop-blur-sm">
                <CardContent className="p-8 flex flex-col items-center text-center gap-6">
                  <div
                    className={`p-6 rounded-2xl bg-gradient-to-br ${card.gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}
                  >
                    <card.icon className="h-12 w-12 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-foreground mb-3">
                      {card.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {card.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Info Section */}
        <div className="mt-16 p-8 bg-card/80 backdrop-blur-sm rounded-2xl border border-border shadow-lg animate-in fade-in duration-1000">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">
                AI-Powered
              </div>
              <p className="text-muted-foreground">
                Advanced analysis using cutting-edge AI.
              </p>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">Secure</div>
              <p className="text-muted-foreground">
                Your medical data is encrypted and safe.
              </p>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">Fast</div>
              <p className="text-muted-foreground">
                Instant insights powered by AI models.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
