import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Wand2, Mic, MicOff } from "lucide-react";

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionResults {
  [index: number]: SpeechRecognitionAlternative[];
  length: number;
  item(index: number): SpeechRecognitionAlternative[];
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResults;
  resultIndex: number;
  interpretation: unknown;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface ISpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onerror:
    | ((this: ISpeechRecognition, ev: SpeechRecognitionErrorEvent) => void)
    | null;
  onend: ((this: ISpeechRecognition, ev: Event) => void) | null;
  onresult:
    | ((this: ISpeechRecognition, ev: SpeechRecognitionEvent) => void)
    | null;
}

// Extend Window interface to include WebkitSpeechRecognition
declare global {
  interface Window {
    webkitSpeechRecognition: new () => ISpeechRecognition;
    SpeechRecognition: new () => ISpeechRecognition;
  }
}

const Home = () => {
  const [prompt, setPrompt] = useState<string>("");
  const [isListening, setIsListening] = useState<boolean>(false);
  const [recognition, setRecognition] = useState<ISpeechRecognition | null>(null);
  const router = useRouter();

  useEffect(() => {
    if ("SpeechRecognition" in window || "webkitSpeechRecognition" in window) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance: ISpeechRecognition = new SpeechRecognition();

      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;

      recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = Array.from(event.results)
          .map((result) => result[0])
          .map((result) => result.transcript)
          .join("");

        setPrompt(transcript);
      };

      recognitionInstance.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    }
  }, []);

  const toggleListening = (): void => {
    if (!recognition) {
      alert("Speech recognition is not supported in your browser");
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      recognition.start();
      setIsListening(true);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (prompt.trim()) {
      router.push({
        pathname: "/builder",
        query: { prompt },
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Wand2 className="w-12 h-12 text-blue-400" />
          </div>
          <h1 className="text-4xl font-bold text-gray-100 mb-4">
            Website Builder AI
          </h1>
          <p className="text-lg text-gray-300">
            Describe your dream website, and we'll help you build it step by
            step
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-gray-900 rounded-lg shadow-sm shadow-white p-6">
            <div className="relative">
              <textarea
                value={prompt}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setPrompt(e.target.value)
                }
                placeholder="Describe the website you want to build..."
                className="w-full h-32 p-4 bg-gray-950 text-gray-100 border border-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none placeholder-gray-500"
              />
              <button
                type="button"
                onClick={toggleListening}
                className="absolute top-2 right-2 p-2 rounded-full hover:bg-gray-800 transition-colors"
                title={isListening ? "Stop recording" : "Start recording"}
              >
                {isListening ? (
                  <Mic className="w-6 h-6 text-red-500 animate-pulse" />
                ) : (
                  <MicOff className="w-6 h-6 text-gray-400" />
                )}
              </button>
            </div>
            <button
              type="submit"
              className="w-full mt-4 bg-indigo-900 text-gray-100 py-3 px-6 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              Generate Website Plan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Home;
