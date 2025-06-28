import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Script } from "@/entities/all";
import {
  UploadFile,
  ExtractDataFromUploadedFile,
  InvokeLLM,
} from "@/integrations/Core";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Upload as UploadIcon,
  Camera,
  FileText,
  Loader2,
  CheckCircle,
  AlertCircle,
  Image as ImageIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Upload() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [scriptTitle, setScriptTitle] = useState("");
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState("");
  const [error, setError] = useState(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (file) => {
    if (
      file &&
      (file.type.startsWith("image/") || file.type === "application/pdf")
    ) {
      setSelectedFile(file);
      if (!scriptTitle) {
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
        setScriptTitle(nameWithoutExt);
      }
      setError(null);
    } else {
      setError("Please select an image file (PNG, JPG) or PDF.");
    }
  };

  const handleFileInput = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const processScript = async () => {
    if (!selectedFile || !scriptTitle.trim()) {
      setError("Please select a file and enter a script title.");
      return;
    }

    setProcessing(true);
    setProgress(10);
    setProgressMessage("Uploading image...");
    setError(null);

    try {
      // Upload file
      const { file_url } = await UploadFile({ file: selectedFile });
      setProgress(30);
      setProgressMessage("Extracting text from script...");

      // Extract text using OCR
      const extractResult = await ExtractDataFromUploadedFile({
        file_url,
        json_schema: {
          type: "object",
          properties: {
            full_text: {
              type: "string",
              description: "All text extracted from the script",
            },
          },
        },
      });

      if (
        extractResult.status !== "success" ||
        !extractResult.output?.full_text
      ) {
        throw new Error(
          "Could not extract text from the image. Please ensure the image is clear and contains readable text."
        );
      }

      setProgress(60);
      setProgressMessage("Analyzing characters and dialogue...");

      // Parse characters and dialogue using LLM
      const parseResult = await InvokeLLM({
        prompt: `Analyze this theater script text and extract the characters and their dialogue lines. 
                
Script text:
${extractResult.output.full_text}

Please identify:
1. All character names that speak in this script
2. Parse each line of dialogue with the speaking character and their exact words
3. Number each dialogue line sequentially

Return the data in the specified JSON format. Character names should be in ALL CAPS as they typically appear in scripts (e.g., "HAMLET", "OPHELIA"). Exclude stage directions and focus only on spoken dialogue.`,
        response_json_schema: {
          type: "object",
          properties: {
            characters: {
              type: "array",
              items: { type: "string" },
              description: "List of character names in ALL CAPS",
            },
            dialogue_lines: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  character: { type: "string" },
                  line: { type: "string" },
                  line_number: { type: "number" },
                },
              },
            },
          },
        },
      });

      setProgress(90);
      setProgressMessage("Saving script...");

      // Create script record
      const scriptData = {
        title: scriptTitle.trim(),
        original_image_url: file_url,
        extracted_text: extractResult.output.full_text,
        characters: parseResult.characters || [],
        dialogue_lines: parseResult.dialogue_lines || [],
        status: "ready",
      };

      const script = await Script.create(scriptData);

      setProgress(100);
      setProgressMessage("Complete!");

      setTimeout(() => {
        navigate(createPageUrl(`ScriptDetail?id=${script.id}`));
      }, 500);
    } catch (error) {
      console.error("Error processing script:", error);
      setError(
        error.message ||
          "An error occurred while processing the script. Please try again."
      );
      setProcessing(false);
      setProgress(0);
      setProgressMessage("");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Upload Your Script
          </h1>
          <p className="text-lg text-gray-600">
            Take a photo or upload an image of your script page to get started
          </p>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6"
          >
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {!processing ? (
            <motion.div
              key="upload-form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* File Upload Area */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <FileText className="w-6 h-6 text-blue-600" />
                    Script Image
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    className={`relative border-2 border-dashed rounded-xl p-8 transition-all duration-300 ${
                      dragActive
                        ? "border-blue-500 bg-blue-50"
                        : selectedFile
                        ? "border-green-500 bg-green-50"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={handleFileInput}
                      className="hidden"
                    />

                    <div className="text-center">
                      {selectedFile ? (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="space-y-4"
                        >
                          <CheckCircle className="w-16 h-16 text-green-600 mx-auto" />
                          <div>
                            <h3 className="text-lg font-semibold text-green-800">
                              File Selected
                            </h3>
                            <p className="text-green-600">
                              {selectedFile.name}
                            </p>
                            <p className="text-sm text-gray-500 mt-2">
                              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </motion.div>
                      ) : (
                        <>
                          <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-semibold text-gray-700 mb-2">
                            Drop your script image here
                          </h3>
                          <p className="text-gray-500 mb-6">
                            Supports PNG, JPG, and PDF files
                          </p>
                          <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Button
                              onClick={() => fileInputRef.current?.click()}
                              variant="outline"
                              className="border-2 hover:bg-blue-50"
                            >
                              <UploadIcon className="w-4 h-4 mr-2" />
                              Choose File
                            </Button>
                            <Button
                              onClick={() => {
                                const input = document.createElement("input");
                                input.type = "file";
                                input.accept = "image/*";
                                input.capture = "environment";
                                input.onchange = (e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleFileSelect(file);
                                };
                                input.click();
                              }}
                              variant="outline"
                              className="border-2 hover:bg-purple-50"
                            >
                              <Camera className="w-4 h-4 mr-2" />
                              Take Photo
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Script Title */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-lg font-semibold">
                      Script Title
                    </Label>
                    <Input
                      id="title"
                      value={scriptTitle}
                      onChange={(e) => setScriptTitle(e.target.value)}
                      placeholder="e.g., Hamlet Act 1 Scene 1"
                      className="text-lg py-3"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Process Button */}
              <div className="text-center">
                <Button
                  onClick={processScript}
                  disabled={!selectedFile || !scriptTitle.trim()}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <FileText className="w-5 h-5 mr-2" />
                  Process Script
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="processing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="text-center py-12"
            >
              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-2xl max-w-md mx-auto">
                <CardContent className="pt-8 pb-8">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="mb-6"
                  >
                    <Loader2 className="w-16 h-16 text-blue-600 mx-auto" />
                  </motion.div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Processing Your Script
                  </h3>
                  <p className="text-gray-600 mb-6">{progressMessage}</p>
                  <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                    <motion.div
                      className="bg-gradient-to-r from-blue-600 to-purple-600 h-3 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                  <p className="text-sm text-gray-500">{progress}% complete</p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
