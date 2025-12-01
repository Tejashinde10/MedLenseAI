import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Loader2 } from "lucide-react";
import Layout from "@/components/Layout";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";

const HistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await axios.get("http://localhost:8000/history/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!cancelled) setHistory(response.data || []);
      } catch (error) {
        // If unauthorized, force user to login
        const status = error?.response?.status;
        if (status === 401 || status === 403) {
          toast({
            title: "Unauthorized",
            description: "Please sign in to view your reports",
            variant: "destructive",
          });
          navigate("/login");
        } else {
          toast({
            title: "Error",
            description: "Failed to load your report history",
            variant: "destructive",
          });
          console.error("History fetch error:", error);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchHistory();

    return () => {
      cancelled = true;
    };
  }, [navigate, toast]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Report History
          </h1>
          <p className="text-muted-foreground">
            View and access your previously analyzed medical reports
          </p>
        </div>

        {history.length === 0 ? (
          <Card className="bg-card/80 backdrop-blur-sm border-2">
            <CardContent className="p-12 text-center">
              <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No reports yet
              </h3>
              <p className="text-muted-foreground mb-6">
                Upload your first medical report to get started
              </p>
              <Link to="/upload">
                <Button size="lg">Upload Report</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {history.map((item, index) => {
              const explanation =
                item?.explanation || "No explanation available";
              const when = item?.timestamp
                ? new Date(item.timestamp).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "Unknown date";
              // fallback image (if you want a placeholder, replace with path)
              const imgSrc = item?.image || "/mendlense-logo.png";

              return (
                <Card
                  key={item._id || index}
                  className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-card/80 backdrop-blur-sm border-2 hover:border-primary animate-in fade-in slide-in-from-bottom"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardContent className="p-0">
                    <div className="aspect-video relative overflow-hidden rounded-t-xl">
                      <img
                        src={imgSrc}
                        alt="Medical Report"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    <div className="p-6 space-y-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {when}
                        </p>

                        <p className="text-foreground line-clamp-3">
                          {explanation.length > 120
                            ? `${explanation.slice(0, 120)}...`
                            : explanation}
                        </p>
                      </div>

                      <Link to={`/report/${item._id}`}>
                        <Button className="w-full" variant="default">
                          View Full Report
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default HistoryPage;
