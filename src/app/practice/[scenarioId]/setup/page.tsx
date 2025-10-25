"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Clock, Users, FileText, Image, Presentation } from "lucide-react";
import { getScenarioById } from "@/lib/scenarios";

interface SetupPageProps {
  params: Promise<{ scenarioId: string }>;
}

export default function SetupPage({ params }: SetupPageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const scenario = getScenarioById(resolvedParams.scenarioId);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [extraDetails, setExtraDetails] = useState<string>("");
  const [timeLimitMinutes, setTimeLimitMinutes] = useState<number>(() => {
    const s = scenario?.duration ?? 0; // seconds
    return Math.max(0, Math.floor(s / 60));
  });

  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionError, setExtractionError] = useState<string | null>(null);
  const [extracted, setExtracted] = useState<
    | { text: string; meta: { pages: number; chars: number; fileType?: string; processedBy?: string } }
    | null
  >(null);

  const handleFileChange = async (file: File | null) => {
    setSelectedFile(file);
    setExtracted(null);
    setExtractionError(null);

    if (!file) return;

    try {
      setIsExtracting(true);
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/extract-text", {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (!res.ok) {
        setExtractionError(data?.error || "Failed to extract text");
        return;
      }
      setExtracted(data);
    } catch (err) {
      setExtractionError("Network error while extracting text");
    } finally {
      setIsExtracting(false);
    }
  };

  const composedPrompt = `${scenario?.basePrompt ?? ''}${
    extraDetails.trim() ? `\n\nExtra details from user:\n${extraDetails.trim()}` : ''
  }${
    extracted ? `\n\nDocument content:\n${extracted.text.slice(0, 2000)}${extracted.text.length > 2000 ? '...' : ''}` : ''
  }`;

  const getFileIcon = (file: File) => {
    const type = file.type;
    const name = file.name.toLowerCase();
    
    if (type === "application/pdf" || name.endsWith('.pdf')) {
      return <FileText className="w-4 h-4" />;
    } else if (type.includes("presentation") || name.endsWith('.pptx')) {
      return <Presentation className="w-4 h-4" />;
    } else if (type.startsWith("image/")) {
      return <Image className="w-4 h-4" />;
    } else {
      return <FileText className="w-4 h-4" />;
    }
  };

  if (!scenario) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Scenario not found</h1>
          <Button onClick={() => router.push("/scenarios")}>Back to Scenarios</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/scenarios">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Scenarios
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Setup: {scenario.title}</h1>
          <p className="text-gray-600">Configure your session before starting practice</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: Form */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Context and Preferences</CardTitle>
              <CardDescription>
                Upload optional material, add extra details, and set a time limit.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Document upload */}
              <div>
                <Label htmlFor="material" className="block mb-2">
                  Upload material (PDF, PPTX, Images, or Text)
                </Label>
                <Input
                  id="material"
                  type="file"
                  accept=".pdf,.pptx,.ppt,.txt,.md,.csv,.jpg,.jpeg,.png,.gif,.webp,application/pdf,application/vnd.openxmlformats-officedocument.presentationml.presentation,text/*,image/*"
                  onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
                />
                {selectedFile && (
                  <div className="text-sm text-gray-600 mt-2 flex items-center">
                    {getFileIcon(selectedFile)}
                    <span className="ml-2">
                      <span className="font-medium">{selectedFile.name}</span> ({Math.ceil(selectedFile.size / 1024)} KB)
                    </span>
                  </div>
                )}
                {isExtracting && (
                  <p className="text-xs text-gray-500 mt-2">Processing document with Gemini AI…</p>
                )}
                {extractionError && (
                  <p className="text-xs text-red-600 mt-2">{extractionError}</p>
                )}
                {!isExtracting && extracted && (
                  <div className="mt-4 border rounded-md p-3 bg-gray-50">
                    <div className="text-sm font-medium mb-1">Extraction Summary</div>
                    <div className="text-xs text-gray-600 mb-2 space-y-1">
                      <div>Type: <span className="font-semibold capitalize">{extracted.meta.fileType || 'document'}</span></div>
                      <div>Characters: <span className="font-semibold">{extracted.meta.chars.toLocaleString()}</span></div>
                      {extracted.meta.pages > 1 && (
                        <div>Est. Pages: <span className="font-semibold">{extracted.meta.pages}</span></div>
                      )}
                      {extracted.meta.processedBy && (
                        <div className="text-xs text-blue-600">Powered by Gemini AI</div>
                      )}
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Preview (first 800 chars)</div>
                      <div className="text-sm whitespace-pre-wrap leading-relaxed max-h-64 overflow-auto bg-white border rounded p-2">
                        {extracted.text.slice(0, 800)}
                        {extracted.meta.chars > 800 ? "…" : ""}
                      </div>
                    </div>
                  </div>
                )}
                {!selectedFile && (
                  <div className="text-xs text-gray-500 mt-2 space-y-1">
                    <p>Optional: Upload any document for AI-powered text extraction</p>
                    <p className="text-blue-600">✨ Now supports: PDF, PowerPoint, Images, and Text files with Gemini AI</p>
                  </div>
                )}
              </div>

              {/* Extra scenario details */}
              <div>
                <Label htmlFor="details" className="block mb-2">
                  Extra scenario details (optional)
                </Label>
                <Textarea
                  id="details"
                  placeholder="Add specifics (e.g., audience, goals, constraints)..."
                  value={extraDetails}
                  onChange={(e) => setExtraDetails(e.target.value)}
                  className="min-h-[120px]"
                />
                <div className="text-xs text-gray-500 mt-1">{extraDetails.length} characters</div>
              </div>

              {/* Time limit */}
              <div>
                <Label htmlFor="time-limit" className="block mb-2">
                  Time limit (minutes)
                </Label>
                <div className="flex items-center space-x-3">
                  <Input
                    id="time-limit"
                    type="number"
                    inputMode="numeric"
                    min={0}
                    step={1}
                    value={timeLimitMinutes}
                    onChange={(e) => {
                      const next = Number(e.target.value);
                      if (Number.isNaN(next) || next < 0) return;
                      setTimeLimitMinutes(next);
                    }}
                    className="w-32"
                  />
                  <span className="text-sm text-gray-500">0 disables the timer</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 space-y-3 sm:space-y-0 pt-2">
                <Button disabled className="w-full sm:w-auto">Start Practice</Button>
                <Link href={`/practice/${scenario.id}`} className="text-sm text-blue-600 hover:underline">
                  Skip setup and start now
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Right: Scenario summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Scenario</span>
                <span className="text-3xl">{scenario.icon}</span>
              </CardTitle>
              <CardDescription>{scenario.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-gray-600">
                    <Users className="w-4 h-4 mr-2" /> Participants
                  </div>
                  <div>{scenario.participantCount}</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-gray-600">
                    <Clock className="w-4 h-4 mr-2" /> Default duration
                  </div>
                  <div>{Math.floor((scenario.duration ?? 0) / 60)} min</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-gray-600">Vibe</div>
                  <div className="capitalize">{scenario.vibe}</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-gray-600">Presentational</div>
                  <div>{scenario.presentational ? 'Yes' : 'No'}</div>
                </div>
                <div className="pt-2 text-xs text-gray-500">
                  The timer you set in this setup replaces the default duration.
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Right: Prompt preview */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Prompt Preview</CardTitle>
              <CardDescription>
                Base prompt combined with your extra details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-gray-500 mb-2">
                Updates live as you edit details or upload documents
              </div>
              <div className="bg-gray-50 border rounded p-3 text-sm text-gray-800 whitespace-pre-wrap leading-relaxed max-h-96 overflow-auto">
                {composedPrompt || 'Base prompt will appear here'}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}