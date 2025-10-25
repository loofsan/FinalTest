"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Clock, Users } from "lucide-react";
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

  const composedPrompt = `${scenario?.basePrompt ?? ''}${
    extraDetails.trim() ? `\n\nExtra details from user:\n${extraDetails.trim()}` : ''
  }`;

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
                  Upload material (PDF or PPTX)
                </Label>
                <Input
                  id="material"
                  type="file"
                  accept=".pdf,application/pdf,.pptx,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
                />
                {selectedFile && (
                  <p className="text-sm text-gray-600 mt-2">
                    Selected: <span className="font-medium">{selectedFile.name}</span> ({Math.ceil(selectedFile.size / 1024)} KB)
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  Extraction and analysis will be added in later steps.
                </p>
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
                Updates live as you edit extra details
              </div>
              <div className="bg-gray-50 border rounded p-3 text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                {composedPrompt || 'Base prompt will appear here'}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
