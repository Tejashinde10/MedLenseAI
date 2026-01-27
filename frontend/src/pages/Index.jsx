import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, History, MessageSquare, ArrowRight } from "lucide-react";
import Layout from "@/components/Layout";

const Index = () => {
  return (
    <Layout>
      <div className="max-w-7xl mx-auto py-12">
        {/* Hero Section */}
        <div className="text-center mb-16 animate-in fade-in duration-700">
          <h1 className="text-5xl font-extrabold tracking-tight text-foreground mb-4">
            MedLense AI
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            AI-powered medical report analysis. Upload, analyze, and understand
            your medical images with advanced medical AI models.
          </p>

          <Link to="/upload">
            <button className="mt-6 px-8 py-3 bg-primary text-primary-foreground rounded-xl text-lg font-medium hover:opacity-90 transition">
              Get Started
            </button>
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          <Link to="/upload">
            <Card className="h-full border-2 hover:border-primary transition-all hover:shadow-xl hover:-translate-y-1 bg-card/80 backdrop-blur-sm">
              <CardContent className="p-8 text-center space-y-4">
                <Upload className="h-12 w-12 text-primary mx-auto" />
                <h3 className="text-2xl font-bold text-foreground">
                  Upload Report
                </h3>
                <p className="text-muted-foreground">
                  Upload your medical images or reports for AI analysis.
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/history">
            <Card className="h-full border-2 hover:border-primary transition-all hover:shadow-xl hover:-translate-y-1 bg-card/80 backdrop-blur-sm">
              <CardContent className="p-8 text-center space-y-4">
                <History className="h-12 w-12 text-primary mx-auto" />
                <h3 className="text-2xl font-bold text-foreground">
                  View History
                </h3>
                <p className="text-muted-foreground">
                  Access your previously analyzed medical reports.
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/chat">
            <Card className="h-full border-2 hover:border-primary transition-all hover:shadow-xl hover:-translate-y-1 bg-card/80 backdrop-blur-sm">
              <CardContent className="p-8 text-center space-y-4">
                <MessageSquare className="h-12 w-12 text-primary mx-auto" />
                <h3 className="text-2xl font-bold text-foreground">
                  Chat with AI
                </h3>
                <p className="text-muted-foreground">
                  Ask MedLense AI any question about your reports.
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Info Section */}
        <div className="mt-10 p-10 bg-card/80 backdrop-blur-sm border border-border rounded-2xl shadow-lg">
          <h2 className="text-3xl font-bold text-center mb-6">Why MedLense?</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
            <div>
              <h3 className="text-2xl font-semibold text-primary mb-2">
                AI Precision
              </h3>
              <p className="text-muted-foreground">
                Medical-grade AI models trained on real imaging datasets.
              </p>
            </div>

            <div>
              <h3 className="text-2xl font-semibold text-primary mb-2">
                Instant Insights
              </h3>
              <p className="text-muted-foreground">
                Get explanations, OCR extraction, and diagnosis summaries in
                seconds.
              </p>
            </div>

            <div>
              <h3 className="text-2xl font-semibold text-primary mb-2">
                Fully Secure
              </h3>
              <p className="text-muted-foreground">
                Your medical data stays private and protected.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
