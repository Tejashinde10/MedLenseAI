import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ArrowLeft,
  AlertCircle,
  FileText,
  ChevronDown,
  Loader2,
} from "lucide-react";
import Layout from "@/components/Layout";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";

const FullReport = () => {
  const { id } = useParams(); // <-- correct param
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ocrOpen, setOcrOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchReport();
  }, [id]);

  const fetchReport = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(`http://localhost:8000/history/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`, // <-- REQUIRED
        },
      });

      setReport(response.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load report",
        variant: "destructive",
      });
      console.error("Report fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!report) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Report not found
          </h2>
          <Link to="/history">
            <Button>Back to History</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <Link to="/history">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to History
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Medical Image */}
          <Card className="bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Medical Report
              </CardTitle>
            </CardHeader>
            <CardContent>
              <img
                src={report.image}
                alt="Medical Report"
                className="w-full rounded-xl border border-border shadow-lg"
              />
              <p className="text-sm text-muted-foreground mt-4">
                Analyzed on {new Date(report.timestamp).toLocaleString()}
              </p>
            </CardContent>
          </Card>

          {/* Analysis Results */}
          <div className="space-y-6">
            <Card className="bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>AI Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold text-lg mb-3 text-primary">
                    Detailed Explanation
                  </h3>
                  <div className="prose prose-sm max-w-none">
                    <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                      {report.explanation}
                    </p>
                  </div>
                </div>

                {report.precautions && (
                  <div className="pt-6 border-t border-border">
                    <h3 className="font-semibold text-lg mb-3 text-primary flex items-center gap-2">
                      <AlertCircle className="h-5 w-5" />
                      Medical Precautions
                    </h3>
                    <div className="bg-secondary/50 p-4 rounded-lg">
                      <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                        {report.precautions}
                      </p>
                    </div>
                  </div>
                )}

                {report.caption && (
                  <div className="pt-6 border-t border-border">
                    <h3 className="font-semibold text-lg mb-3 text-primary">
                      Summary
                    </h3>
                    <p className="text-muted-foreground italic">
                      {report.caption}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* OCR Text */}
            {report.ocr_text && (
              <Card className="bg-card/80 backdrop-blur-sm">
                <Collapsible open={ocrOpen} onOpenChange={setOcrOpen}>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-secondary/50 transition-colors rounded-t-xl">
                      <CardTitle className="flex items-center justify-between">
                        <span>Extracted Text (OCR)</span>
                        <ChevronDown
                          className={`h-5 w-5 transition-transform ${
                            ocrOpen ? "rotate-180" : ""
                          }`}
                        />
                      </CardTitle>
                    </CardHeader>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <CardContent>
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <p className="text-sm text-foreground font-mono whitespace-pre-wrap">
                          {report.ocr_text}
                        </p>
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default FullReport;
