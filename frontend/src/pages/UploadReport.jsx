import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Loader2, FileText, AlertCircle } from "lucide-react";
import Layout from "@/components/Layout";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";

const UploadReport = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const { toast } = useToast();

  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result?.toString() || "");
      };
      reader.readAsDataURL(file);

      setResults(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select a medical report to upload",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("file", selectedFile);

    const token = localStorage.getItem("token");

    try {
      // ✅ FastAPI upload (OCR + AI)
      const response = await axios.post(
        `${import.meta.env.VITE_FASTAPI_URL}/upload`,

        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setResults(response.data);

      // ✅ Save history (Node backend)
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/save-history`,
        {
          image: preview,
          explanation: response.data.explanation,
          ocr_text: response.data.ocr_text,
          caption: response.data.caption,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast({
        title: "Analysis complete!",
        description: "Your medical report has been analyzed successfully",
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to analyze the report. Please try again.",
        variant: "destructive",
      });
      console.error("Upload error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Upload Medical Report
          </h1>
          <p className="text-muted-foreground">
            Upload your medical images or PDF reports for AI analysis
          </p>
        </div>

        {!results ? (
          <Card className="bg-card/80 backdrop-blur-sm border-2">
            <CardContent className="p-8">
              <div className="flex flex-col items-center gap-6">
                <div className="w-full max-w-md">
                  <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-primary rounded-2xl cursor-pointer hover:bg-secondary/50 transition-colors bg-secondary/20">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="h-16 w-16 text-primary mb-4" />
                      <p className="mb-2 text-lg font-semibold text-foreground">
                        Click to upload medical report
                      </p>
                      <p className="text-sm text-muted-foreground">
                        PNG, JPG, PDF (MAX. 10MB)
                      </p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*,.pdf"
                      onChange={handleFileSelect}
                    />
                  </label>
                </div>

                {preview && (
                  <div className="w-full max-w-md">
                    <p className="text-sm font-medium text-foreground mb-3">
                      Preview:
                    </p>
                    <div className="relative rounded-xl overflow-hidden border-2 border-border">
                      <img
                        src={preview}
                        alt="Preview"
                        className="w-full h-auto"
                      />
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      {selectedFile?.name}
                    </p>
                  </div>
                )}

                <Button
                  onClick={handleUpload}
                  disabled={!selectedFile || loading}
                  size="lg"
                  className="w-full max-w-md h-14 text-lg font-semibold"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Analyzing Report...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-5 w-5" />
                      Analyze Report
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Uploaded Report
                </CardTitle>
              </CardHeader>
              <CardContent>
                <img
                  src={preview}
                  alt="Medical Report"
                  className="w-full rounded-xl border border-border"
                />
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="bg-card/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>AI Analysis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-2 text-primary">
                      Explanation:
                    </h3>
                    <p className="text-foreground whitespace-pre-wrap">
                      {results.explanation}
                    </p>
                  </div>

                  {results.precautions && (
                    <div>
                      <h3 className="font-semibold text-lg mb-2 text-primary flex items-center gap-2">
                        <AlertCircle className="h-5 w-5" />
                        Precautions:
                      </h3>
                      <p className="text-foreground whitespace-pre-wrap">
                        {results.precautions}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default UploadReport;
