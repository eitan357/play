import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "../utils";
import { Script } from "../entities/all";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  ArrowLeft,
  Play,
  Users,
  FileText,
  Calendar,
  Image as ImageIcon,
} from "lucide-react";
import { motion } from "framer-motion";

export default function ScriptDetail() {
  const navigate = useNavigate();
  const [script, setScript] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCharacter, setSelectedCharacter] = useState("");

  const loadScript = useCallback(
    async (scriptId) => {
      try {
        const scripts = await Script.list();
        const foundScript = scripts.find((s) => s.id === scriptId);
        if (foundScript) {
          setScript(foundScript);
          if (foundScript.characters?.length > 0) {
            setSelectedCharacter(foundScript.characters[0]);
          }
        } else {
          navigate(createPageUrl("Scripts"));
        }
      } catch (error) {
        console.error("Error loading script:", error);
        navigate(createPageUrl("Scripts"));
      } finally {
        setIsLoading(false);
      }
    },
    [navigate]
  );

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const scriptId = urlParams.get("id");
    if (scriptId) {
      loadScript(scriptId);
    } else {
      navigate(createPageUrl("Scripts"));
    }
  }, [navigate, loadScript]);

  const startRehearsal = () => {
    if (script && selectedCharacter) {
      navigate(
        createPageUrl(
          `Rehearsal?scriptId=${script.id}&character=${selectedCharacter}`
        )
      );
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getCharacterLines = (character) => {
    return (
      script?.dialogue_lines?.filter((line) => line.character === character) ||
      []
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-8"></div>
            <div className="h-12 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="space-y-6">
              <div className="h-64 bg-gray-200 rounded"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!script) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-8"
        >
          <Button
            variant="outline"
            onClick={() => navigate(createPageUrl("Scripts"))}
            className="hover:bg-gray-50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Scripts
          </Button>
        </motion.div>

        {/* Script Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {script.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-gray-600">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>Uploaded {formatDate(script.created_date)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{script.characters?.length || 0} characters</span>
            </div>
            <div className="flex items-center gap-1">
              <FileText className="w-4 h-4" />
              <span>{script.dialogue_lines?.length || 0} lines</span>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Character Selection & Rehearsal */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Play className="w-6 h-6 text-green-600" />
                  Start Rehearsal
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-3 block">
                    Choose your character:
                  </label>
                  <div className="space-y-2">
                    {script.characters?.map((character) => (
                      <motion.button
                        key={character}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedCharacter(character)}
                        className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                          selectedCharacter === character
                            ? "border-blue-500 bg-blue-50 text-blue-700"
                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-semibold">{character}</span>
                          <Badge variant="outline">
                            {getCharacterLines(character).length} lines
                          </Badge>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={startRehearsal}
                  disabled={!selectedCharacter}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Start Rehearsal as {selectedCharacter}
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Script Preview */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <ImageIcon className="w-6 h-6 text-purple-600" />
                  Original Script
                </CardTitle>
              </CardHeader>
              <CardContent>
                {script.original_image_url ? (
                  <div className="rounded-xl overflow-hidden border">
                    <img
                      src={script.original_image_url}
                      alt="Original script"
                      className="w-full h-auto max-h-96 object-contain bg-gray-50"
                    />
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Original image not available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Dialogue Preview */}
        {script.dialogue_lines && script.dialogue_lines.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8"
          >
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <FileText className="w-6 h-6 text-blue-600" />
                  Script Dialogue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {script.dialogue_lines.map((line, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border-l-4 ${
                        line.character === selectedCharacter
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-300 bg-gray-50"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <Badge
                          variant={
                            line.character === selectedCharacter
                              ? "default"
                              : "outline"
                          }
                          className="mt-1"
                        >
                          {line.character}
                        </Badge>
                        <p className="flex-1 text-gray-800">{line.line}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
