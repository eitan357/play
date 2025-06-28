import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "../utils";
import { Script, RehearsalSession } from "../entities/all";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Progress } from "../components/ui/progress";
import { Badge } from "../components/ui/badge";
import {
  ArrowLeft,
  Play,
  Pause,
  Mic,
  MicOff,
  RotateCcw,
  CheckCircle,
  XCircle,
  Volume2,
  VolumeX,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Rehearsal() {
  const navigate = useNavigate();
  const [script, setScript] = useState(null);
  const [character, setCharacter] = useState("");
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [isRehearsing, setIsRehearsing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [sessionStats, setSessionStats] = useState({
    totalLines: 0,
    correctLines: 0,
    attempts: 0,
  });
  const [lineRecordings, setLineRecordings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentSpeaker, setCurrentSpeaker] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [manualMode, setManualMode] = useState(false);
  const [speechRecognitionAvailable, setSpeechRecognitionAvailable] =
    useState(true);

  const recognitionRef = useRef(null);
  const synthRef = useRef(null);

  const loadScript = useCallback(
    async (scriptId, characterParam) => {
      console.log(
        "loadScript called with scriptId:",
        scriptId,
        "characterParam:",
        characterParam
      );
      try {
        const scripts = await Script.list();
        console.log("All scripts:", scripts);
        const foundScript = scripts.find((s) => s.id === scriptId);
        console.log("Found script:", foundScript);

        if (foundScript) {
          setScript(foundScript);
          if (
            characterParam &&
            foundScript.characters?.includes(characterParam)
          ) {
            setCharacter(characterParam);
          } else if (foundScript.characters?.length > 0) {
            setCharacter(foundScript.characters[0]);
          }
          console.log(
            "Set character to:",
            characterParam || foundScript.characters[0]
          );

          const userLines =
            foundScript.dialogue_lines?.filter(
              (line) =>
                line.character === (characterParam || foundScript.characters[0])
            ) || [];
          console.log("User lines:", userLines);
          setSessionStats((prev) => ({
            ...prev,
            totalLines: userLines.length,
          }));
        } else {
          console.error("Script not found with ID:", scriptId);
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

  const calculateSimilarity = (str1, str2) => {
    const words1 = str1.split(" ");
    const words2 = str2.split(" ");
    const maxLength = Math.max(words1.length, words2.length);

    let matches = 0;
    for (let i = 0; i < Math.min(words1.length, words2.length); i++) {
      if (words1[i] === words2[i]) {
        matches++;
      }
    }

    return matches / maxLength;
  };

  const completeRehearsal = useCallback(async () => {
    setIsRehearsing(false);

    const accuracy =
      sessionStats.totalLines > 0
        ? (sessionStats.correctLines / sessionStats.totalLines) * 100
        : 0;

    try {
      await RehearsalSession.create({
        script_id: script.id,
        character_name: character,
        session_date: new Date().toISOString(),
        total_lines: sessionStats.totalLines,
        correct_lines: sessionStats.correctLines,
        accuracy_percentage: Math.round(accuracy),
        line_recordings: lineRecordings,
        duration_minutes: 5, // Estimate - could be tracked more accurately
      });
    } catch (error) {
      console.error("Error saving session:", error);
    }

    setFeedback({
      type: "success",
      message: `Rehearsal complete! Accuracy: ${Math.round(accuracy)}%`,
    });
  }, [script, character, sessionStats, lineRecordings]);

  const startListening = () => {
    console.log("startListening called");
    console.log("recognitionRef.current:", recognitionRef.current);
    console.log("manualMode:", manualMode);

    if (manualMode) {
      console.log("Manual mode active, not starting speech recognition");
      setFeedback({
        type: "info",
        message:
          "Manual mode active. Practice your line and use the buttons below.",
      });
      return;
    }

    if (!recognitionRef.current) {
      console.error("Speech recognition not initialized");
      setSpeechRecognitionAvailable(false);
      setManualMode(true);
      setFeedback({
        type: "info",
        message:
          "Speech recognition not available. Using manual practice mode.",
      });
      return;
    }

    setIsListening(true);
    setUserInput("");
    setFeedback(null);

    try {
      console.log("Starting speech recognition...");
      recognitionRef.current.start();
    } catch (error) {
      console.error("Error starting recognition:", error);
      setIsListening(false);
      setSpeechRecognitionAvailable(false);
      setManualMode(true);
      setFeedback({
        type: "info",
        message: "Speech recognition failed. Using manual practice mode.",
      });
    }
  };

  const speakLine = useCallback(
    (text, characterName) => {
      if (!audioEnabled || !synthRef.current) return;

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = characterName === character ? 1.0 : 0.8; // Different pitch for other characters

      utterance.onstart = () => {
        setIsSpeaking(true);
        setCurrentSpeaker(characterName);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        setCurrentSpeaker("");

        // Check if next line is user's turn
        const nextLine = script.dialogue_lines[currentLineIndex + 1];
        if (nextLine && nextLine.character === character) {
          setTimeout(() => {
            setCurrentLineIndex((prev) => prev + 1);
            startListening();
          }, 500);
        } else {
          // Continue to next line automatically
          setTimeout(() => {
            moveToNextLine();
          }, 1000);
        }
      };

      synthRef.current.speak(utterance);
    },
    [audioEnabled, character, script, currentLineIndex, startListening]
  );

  const moveToNextLine = useCallback(() => {
    const nextIndex = currentLineIndex + 1;
    if (nextIndex >= script.dialogue_lines.length) {
      // Rehearsal complete
      completeRehearsal();
      return;
    }

    setCurrentLineIndex(nextIndex);
    setFeedback(null);
    setUserInput("");

    const nextLine = script.dialogue_lines[nextIndex];
    if (nextLine.character === character) {
      // User's turn
      setTimeout(() => startListening(), 500);
    } else {
      // Other character's turn
      setTimeout(() => speakLine(nextLine.line, nextLine.character), 500);
    }
  }, [
    currentLineIndex,
    script,
    character,
    completeRehearsal,
    startListening,
    speakLine,
  ]);

  useEffect(() => {
    console.log("Rehearsal useEffect running");
    const urlParams = new URLSearchParams(window.location.search);
    const scriptId = urlParams.get("scriptId");
    const characterParam = urlParams.get("character");

    console.log(
      "URL params - scriptId:",
      scriptId,
      "character:",
      characterParam
    );
    console.log("Current URL:", window.location.href);

    if (scriptId) {
      loadScript(scriptId, characterParam);
    } else {
      console.error("No scriptId in URL, navigating to Scripts");
      navigate(createPageUrl("Scripts"));
    }

    // Initialize speech synthesis
    synthRef.current = window.speechSynthesis;

    // Check for microphone permissions and initialize speech recognition
    const initializeSpeechRecognition = async () => {
      try {
        // Request microphone permission first
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        stream.getTracks().forEach((track) => track.stop()); // Stop the stream after getting permission

        // Initialize speech recognition
        if (
          "webkitSpeechRecognition" in window ||
          "SpeechRecognition" in window
        ) {
          const SpeechRecognition =
            window.webkitSpeechRecognition || window.SpeechRecognition;
          recognitionRef.current = new SpeechRecognition();
          recognitionRef.current.continuous = false;
          recognitionRef.current.interimResults = false;
          recognitionRef.current.lang = "en-US";

          recognitionRef.current.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setUserInput(transcript);
            // Call processUserInput directly here instead of through dependency
            const currentLine = script?.dialogue_lines?.[currentLineIndex];
            if (!currentLine) return;

            const expected = currentLine.line.toLowerCase().trim();
            const spoken = transcript.toLowerCase().trim();
            const similarity = calculateSimilarity(expected, spoken);
            const isCorrect = similarity > 0.8;

            setSessionStats((prev) => ({
              ...prev,
              attempts: prev.attempts + 1,
              correctLines: isCorrect
                ? prev.correctLines + 1
                : prev.correctLines,
            }));

            const recording = {
              line_number: currentLine.line_number,
              original_line: currentLine.line,
              spoken_line: transcript,
              was_correct: isCorrect,
              attempts: 1,
            };

            setLineRecordings((prev) => [...prev, recording]);

            if (isCorrect) {
              setFeedback({
                type: "success",
                message: "Perfect! Moving to the next line.",
              });
              setTimeout(() => {
                moveToNextLine();
              }, 1500);
            } else {
              setFeedback({
                type: "error",
                message: `Not quite right. Expected: "${currentLine.line}"`,
              });
            }
          };

          recognitionRef.current.onend = () => {
            setIsListening(false);
          };

          recognitionRef.current.onerror = (event) => {
            console.error("Speech recognition error:", event.error);
            console.log("Switching to manual mode due to error:", event.error);
            setIsListening(false);

            // Immediately switch to manual mode for network errors
            if (
              event.error === "network" ||
              event.error === "service-not-allowed" ||
              event.error === "not-allowed" ||
              event.error === "audio-capture"
            ) {
              setSpeechRecognitionAvailable(false);
              setManualMode(true);
              setFeedback({
                type: "info",
                message:
                  "Speech recognition unavailable. Using manual practice mode.",
              });
              return;
            }

            let errorMessage = "Speech recognition error. Please try again.";

            switch (event.error) {
              case "no-speech":
                errorMessage =
                  "No speech detected. Please speak clearly and try again.";
                break;
              default:
                errorMessage = `Speech recognition error: ${event.error}. Switching to manual practice mode.`;
                setSpeechRecognitionAvailable(false);
                setManualMode(true);
            }

            setFeedback({
              type: "info",
              message: errorMessage,
            });
          };

          recognitionRef.current.onstart = () => {
            console.log("Speech recognition started");
            setIsListening(true);
          };

          console.log("Speech recognition initialized successfully");
        } else {
          console.warn("Speech recognition not supported in this browser");
          setSpeechRecognitionAvailable(false);
          setManualMode(true);
          setFeedback({
            type: "info",
            message:
              "Speech recognition not available. Using manual practice mode.",
          });
        }
      } catch (error) {
        console.error("Error getting microphone permission:", error);
        setSpeechRecognitionAvailable(false);
        setManualMode(true);
        setFeedback({
          type: "info",
          message: "Microphone access denied. Using manual practice mode.",
        });
      }
    };

    initializeSpeechRecognition();

    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [navigate, loadScript]); // Removed processUserInput from dependencies

  const startRehearsal = () => {
    console.log("startRehearsal called");
    console.log("script:", script);
    console.log("character:", character);
    console.log("script.dialogue_lines:", script?.dialogue_lines);
    console.log("manualMode:", manualMode);

    if (
      !script ||
      !script.dialogue_lines ||
      script.dialogue_lines.length === 0
    ) {
      console.error("No script or dialogue lines available");
      setFeedback({
        type: "error",
        message: "No script data available. Please try again.",
      });
      return;
    }

    setIsRehearsing(true);
    setCurrentLineIndex(0);
    setSessionStats({
      totalLines:
        script.dialogue_lines?.filter((line) => line.character === character)
          .length || 0,
      correctLines: 0,
      attempts: 0,
    });
    setLineRecordings([]);

    // Start with first line
    const firstLine = script.dialogue_lines[0];
    console.log("firstLine:", firstLine);

    if (firstLine.character === character) {
      console.log("User's turn first");
      if (manualMode) {
        console.log("Manual mode - showing practice interface");
        setFeedback({
          type: "info",
          message: "Practice your line and use the buttons below.",
        });
      } else {
        console.log("Auto mode - starting listening in 1 second");
        setTimeout(() => startListening(), 1000);
      }
    } else {
      console.log("Other character's turn first, speaking line in 1 second");
      setTimeout(() => speakLine(firstLine.line, firstLine.character), 1000);
    }
  };

  const pauseRehearsal = () => {
    setIsRehearsing(false);
    setIsListening(false);
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const resetRehearsal = () => {
    pauseRehearsal();
    setCurrentLineIndex(0);
    setFeedback(null);
    setUserInput("");
  };

  const handleManualNext = () => {
    const currentLine = script?.dialogue_lines?.[currentLineIndex];
    if (!currentLine) return;

    // In manual mode, we assume the actor practiced the line
    setSessionStats((prev) => ({
      ...prev,
      attempts: prev.attempts + 1,
      correctLines: prev.correctLines + 1, // Assume correct in manual mode
    }));

    const recording = {
      line_number: currentLine.line_number,
      original_line: currentLine.line,
      spoken_line: "[Manual practice - line spoken]",
      was_correct: true,
      attempts: 1,
    };

    setLineRecordings((prev) => [...prev, recording]);

    setFeedback({
      type: "success",
      message: "Great! Moving to the next line.",
    });

    setTimeout(() => {
      moveToNextLine();
    }, 1500);
  };

  const handleManualRetry = () => {
    const currentLine = script?.dialogue_lines?.[currentLineIndex];
    if (!currentLine) return;

    setSessionStats((prev) => ({
      ...prev,
      attempts: prev.attempts + 1,
    }));

    setFeedback({
      type: "info",
      message: "Take your time and try again.",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-8"></div>
            <div className="h-64 bg-gray-200 rounded mb-8"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!script) return null;

  const currentLine = script.dialogue_lines?.[currentLineIndex];
  const progress =
    script.dialogue_lines?.length > 0
      ? (currentLineIndex / script.dialogue_lines.length) * 100
      : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() =>
                navigate(createPageUrl(`ScriptDetail?id=${script.id}`))
              }
              className="hover:bg-gray-50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {script.title}
              </h1>
              <p className="text-gray-600">Playing as {character}</p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => setAudioEnabled(!audioEnabled)}
            className="hover:bg-gray-50"
          >
            {audioEnabled ? (
              <Volume2 className="w-4 h-4" />
            ) : (
              <VolumeX className="w-4 h-4" />
            )}
          </Button>
          {speechRecognitionAvailable && (
            <Button
              variant="outline"
              onClick={() => setManualMode(!manualMode)}
              className="hover:bg-gray-50"
            >
              {manualMode ? "Auto Mode" : "Manual Mode"}
            </Button>
          )}
        </motion.div>

        {/* Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="pt-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-600">
                  Progress
                </span>
                <span className="text-sm text-gray-600">
                  {currentLineIndex + 1} / {script.dialogue_lines?.length || 0}{" "}
                  lines
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Rehearsal Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Rehearsal Stage</span>
                <div className="flex gap-2">
                  {!isRehearsing ? (
                    <Button
                      onClick={() => {
                        console.log("Start button clicked!");
                        console.log(
                          "Button state - isRehearsing:",
                          isRehearsing
                        );
                        console.log("Button state - script:", script);
                        startRehearsal();
                      }}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Start
                    </Button>
                  ) : (
                    <>
                      <Button onClick={pauseRehearsal} variant="outline">
                        <Pause className="w-4 h-4 mr-2" />
                        Pause
                      </Button>
                      <Button onClick={resetRehearsal} variant="outline">
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Reset
                      </Button>
                    </>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {currentLine && (
                <div className="text-center">
                  <Badge
                    variant={
                      currentLine.character === character
                        ? "default"
                        : "outline"
                    }
                    className="mb-4"
                  >
                    {currentLine.character}
                    {isSpeaking && currentSpeaker === currentLine.character && (
                      <Volume2 className="w-3 h-3 ml-1 animate-pulse" />
                    )}
                  </Badge>
                  <div
                    className={`p-6 rounded-xl border-2 ${
                      currentLine.character === character
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-300 bg-gray-50"
                    }`}
                  >
                    <p className="text-lg text-gray-800">{currentLine.line}</p>
                  </div>
                </div>
              )}

              {/* Voice Input Area */}
              {isRehearsing &&
                currentLine?.character === character &&
                !manualMode && (
                  <div className="text-center">
                    <motion.div
                      animate={{ scale: isListening ? 1.1 : 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Button
                        onClick={isListening ? undefined : startListening}
                        disabled={isListening}
                        className={`w-20 h-20 rounded-full ${
                          isListening
                            ? "bg-red-600 hover:bg-red-700 animate-pulse"
                            : "bg-blue-600 hover:bg-blue-700"
                        }`}
                      >
                        {isListening ? (
                          <MicOff className="w-8 h-8" />
                        ) : (
                          <Mic className="w-8 h-8" />
                        )}
                      </Button>
                    </motion.div>
                    <p className="mt-4 text-gray-600">
                      {isListening
                        ? "Listening... Speak your line"
                        : "Click to speak your line"}
                    </p>
                    {userInput && (
                      <p className="mt-2 text-sm text-gray-500">
                        You said: "{userInput}"
                      </p>
                    )}
                  </div>
                )}

              {/* Manual Practice Area */}
              {isRehearsing &&
                currentLine?.character === character &&
                manualMode && (
                  <div className="text-center space-y-4">
                    <div className="p-6 bg-blue-50 rounded-xl border-2 border-blue-200">
                      <p className="text-lg font-semibold text-blue-800 mb-2">
                        Practice Your Line
                      </p>
                      <p className="text-blue-700">
                        Speak your line out loud, then click the buttons below
                      </p>
                    </div>

                    <div className="flex gap-4 justify-center">
                      <Button
                        onClick={handleManualRetry}
                        variant="outline"
                        className="bg-yellow-50 hover:bg-yellow-100 border-yellow-300 text-yellow-800"
                      >
                        Try Again
                      </Button>
                      <Button
                        onClick={handleManualNext}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Got It Right
                      </Button>
                    </div>

                    <p className="text-sm text-gray-600">
                      Practice speaking your line clearly, then indicate if you
                      got it right
                    </p>
                  </div>
                )}

              {/* Feedback */}
              <AnimatePresence>
                {feedback && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`p-4 rounded-lg flex items-center gap-3 ${
                      feedback.type === "success"
                        ? "bg-green-50 text-green-800 border border-green-200"
                        : "bg-red-50 text-red-800 border border-red-200"
                    }`}
                  >
                    {feedback.type === "success" ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <XCircle className="w-5 h-5" />
                    )}
                    <p>{feedback.message}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Session Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-blue-600">
                    {sessionStats.totalLines}
                  </p>
                  <p className="text-sm text-gray-600">Total Lines</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">
                    {sessionStats.correctLines}
                  </p>
                  <p className="text-sm text-gray-600">Correct</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-600">
                    {sessionStats.totalLines > 0
                      ? Math.round(
                          (sessionStats.correctLines /
                            sessionStats.totalLines) *
                            100
                        )
                      : 0}
                    %
                  </p>
                  <p className="text-sm text-gray-600">Accuracy</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
