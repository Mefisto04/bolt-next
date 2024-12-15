import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import StepsList from "@/components/StepsList";
import FileExplorer from "@/components/FileExplorer";
import TabView from "@/components/TabView";
import CodeEditor from "@/components/CodeEditors";
// import { PreviewFrame } from "../components/PreviewFrame";
import { Step, FileItem, StepType } from "../types";
import axios from "axios";
import { parseXml } from "@/lib/parseXml";
// import { useWebContainer } from "@/hooks/useWebContainers";
// import { FileNode } from "@webcontainer/api";
import Loader from "@/components/Loader";

export default function Builder() {
  const router = useRouter();
  const { prompt } = router.query;
  const initializationRef = useRef(false);
  const [userPrompt, setPrompt] = useState("");
  const [llmMessages, setLlmMessages] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [templateSet, setTemplateSet] = useState(false);
  //   const webcontainer = useWebContainer();

  const [currentStep, setCurrentStep] = useState(1);
  const [activeTab, setActiveTab] = useState<"code" | "preview">("code");
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);

  const [steps, setSteps] = useState<Step[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);

  useEffect(() => {
    let originalFiles = [...files];
    let updateHappened = false;
    steps
      .filter(({ status }) => status === "pending")
      .map((step) => {
        updateHappened = true;
        if (step?.type === StepType.CreateFile) {
          let parsedPath = step.path?.split("/") ?? []; // ["src", "components", "App.tsx"]
          let currentFileStructure = [...originalFiles]; // {}
          const finalAnswerRef = currentFileStructure;

          let currentFolder = "";
          while (parsedPath.length) {
            currentFolder = `${currentFolder}/${parsedPath[0]}`;
            const currentFolderName = parsedPath[0];
            parsedPath = parsedPath.slice(1);

            if (!parsedPath.length) {
              // final file
              const file = currentFileStructure.find(
                (x) => x.path === currentFolder
              );
              if (!file) {
                currentFileStructure.push({
                  name: currentFolderName,
                  type: "file",
                  path: currentFolder,
                  content: step.code,
                });
              } else {
                file.content = step.code;
              }
            } else {
              /// in a folder
              const folder = currentFileStructure.find(
                (x) => x.path === currentFolder
              );
              if (!folder) {
                // create the folder
                currentFileStructure.push({
                  name: currentFolderName,
                  type: "folder",
                  path: currentFolder,
                  children: [],
                });
              }

              currentFileStructure = currentFileStructure.find(
                (x) => x.path === currentFolder
              )!.children!;
            }
          }
          originalFiles = finalAnswerRef;
        }
      });

    if (updateHappened) {
      setFiles(originalFiles);
      setSteps((steps) =>
        steps.map((s: Step) => {
          return {
            ...s,
            status: "completed",
          };
        })
      );
    }
  }, [steps, files]);

  //   useEffect(() => {
  //     const createMountStructure = (
  //       files: FileItem[]
  //     ): Record<string, unknown> => {
  //       const mountStructure: Record<string, unknown> = {};

  //       const processFile = (file: FileItem, isRootFolder: boolean) => {
  //         if (file.type === "folder") {
  //           mountStructure[file.name] = {
  //             directory: file.children
  //               ? Object.fromEntries(
  //                   file.children.map((child) => [
  //                     child.name,
  //                     processFile(child, false),
  //                   ])
  //                 )
  //               : {},
  //           };
  //         } else if (file.type === "file") {
  //           if (isRootFolder) {
  //             mountStructure[file.name] = {
  //               file: {
  //                 contents: file.content || "",
  //               },
  //             };
  //           } else {
  //             return {
  //               file: {
  //                 contents: file.content || "",
  //               },
  //             };
  //           }
  //         }

  //         return mountStructure[file.name];
  //       };

  //       files.forEach((file) => processFile(file, true));
  //       return mountStructure;
  //     };

  //     const mountStructure = createMountStructure(files);
  //     // webcontainer?.mount(mountStructure);
  //   }, [files, webcontainer]);

  // async function init() {
  //   if (!prompt) return;

  //   const response = await axios.post(`/api/template`, {
  //     prompt: prompt.toString().trim(),
  //   });
  //   setTemplateSet(true);

  //   const { prompts, uiPrompts } = response.data;

  //   setSteps(
  //     parseXml(uiPrompts[0]).map((x: Step) => ({
  //       ...x,
  //       status: "pending",
  //     }))
  //   );

  //   setLoading(true);
  //   const stepsResponse = await axios.post(`/api/chat`, {
  //     messages: [...prompts, prompt].map((content) => ({
  //       role: "user",
  //       content,
  //     })),
  //   });

  //   setLoading(false);

  //   setSteps((s) => [
  //     ...s,
  //     ...parseXml(stepsResponse.data.response).map((x) => ({
  //       ...x,
  //       status: "pending" as const,
  //     })),
  //   ]);

  //   setLlmMessages(
  //     [...prompts, prompt].map((content) => ({
  //       role: "user",
  //       content,
  //     }))
  //   );

  //   setLlmMessages((x) => [
  //     ...x,
  //     { role: "assistant", content: stepsResponse.data.response },
  //   ]);
  // }

  // useEffect(() => {
  //   if (prompt && !templateSet) {
  //     init();
  //   }
  // }, [prompt]);

  async function init() {
    if (!prompt || typeof prompt !== "string" || initializationRef.current)
      return;

    try {
      setLoading(true);
      initializationRef.current = true;

      // Only make the template call if not already set
      if (!templateSet) {
        const response = await axios.post(`/api/template`, {
          prompt: prompt.trim(),
        });

        const { prompts, uiPrompts } = response.data;

        setSteps(
          parseXml(uiPrompts[0]).map((x: Step) => ({
            ...x,
            status: "pending",
          }))
        );

        const stepsResponse = await axios.post(`/api/chat`, {
          messages: [...prompts, prompt].map((content) => ({
            role: "user",
            content,
          })),
        });

        setSteps((s) => [
          ...s,
          ...parseXml(stepsResponse.data.response).map((x) => ({
            ...x,
            status: "pending" as const,
          })),
        ]);

        setLlmMessages(
          [...prompts, prompt].map((content) => ({
            role: "user",
            content,
          }))
        );

        setLlmMessages((x) => [
          ...x,
          { role: "assistant", content: stepsResponse.data.response },
        ]);

        setTemplateSet(true);
      }
    } catch (error) {
      console.error("Initialization error:", error);
      initializationRef.current = false;
    } finally {
      setLoading(false);
    }
  }

  // Single initialization effect
  useEffect(() => {
    if (router.isReady && prompt && !initializationRef.current) {
      init();
    }
  }, [router.isReady, prompt, templateSet]);

  return (
    // <div className="min-h-screen bg-gray-950 flex flex-col">
    //   <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
    //     <h1 className="text-xl font-semibold text-gray-100">Website Builder</h1>
    //     <p className="text-sm text-gray-400 mt-1">Prompt: {prompt}</p>
    //   </header>

    //   <div className="flex-1 overflow-hidden">
    //     <div className="h-full grid grid-cols-4 gap-6 p-6">
    //       <div className="col-span-1 space-y-6 overflow-auto">
    //         <div>
    //           <div className="max-h-[75vh] overflow-scroll">
    //             <StepsList
    //               steps={steps}
    //               currentStep={currentStep}
    //               onStepClick={setCurrentStep}
    //             />
    //           </div>
    //           <div>
    //             <div className="flex">
    //               <br />
    //               {(loading || !templateSet) && <Loader />}
    //               {!(loading || !templateSet) && (
    //                 <div className="flex">
    //                   <textarea
    //                     value={userPrompt}
    //                     onChange={(e) => {
    //                       setPrompt(e.target.value);
    //                     }}
    //                     className="p-2 w-full"
    //                   ></textarea>
    //                   <button
    //                     onClick={async () => {
    //                       const newMessage = {
    //                         role: "user" as const,
    //                         content: userPrompt,
    //                       };

    //                       setLoading(true);
    //                       const stepsResponse = await axios.post(`/api/chat`, {
    //                         messages: [...llmMessages, newMessage],
    //                       });
    //                       setLoading(false);

    //                       setLlmMessages((x) => [...x, newMessage]);
    //                       setLlmMessages((x) => [
    //                         ...x,
    //                         {
    //                           role: "assistant",
    //                           content: stepsResponse.data.response,
    //                         },
    //                       ]);

    //                       setSteps((s) => [
    //                         ...s,
    //                         ...parseXml(stepsResponse.data.response).map(
    //                           (x) => ({
    //                             ...x,
    //                             status: "pending" as const,
    //                           })
    //                         ),
    //                       ]);
    //                     }}
    //                     className="bg-purple-400 px-4"
    //                   >
    //                     Send
    //                   </button>
    //                 </div>
    //               )}
    //             </div>
    //           </div>
    //         </div>
    //       </div>
    //       <div className="col-span-1">
    //         <FileExplorer files={files} onFileSelect={setSelectedFile} />
    //       </div>
    //       <div className="col-span-2 bg-gray-900 rounded-lg shadow-lg p-4 h-[calc(100vh-8rem)]">
    //         <TabView activeTab={activeTab} onTabChange={setActiveTab} />
    //         <div className="h-[calc(100%-4rem)]">
    //           {activeTab === "code" ? (
    //             <CodeEditor file={selectedFile} />
    //           ) : (
    //             <div className="flex flex-col items-center justify-center">
    //               <div className="text-center">
    //                 <h1 className="text-4xl font-bold text-gray-100 mb-4">
    //                   Website Builder AI
    //                 </h1>
    //               </div>
    //             </div>
    //           )}
    //         </div>
    //       </div>
    //     </div>
    //   </div>
    // </div>

    <div className="min-h-screen bg-black flex flex-col">
      {/* Header Section */}
      <div className="border-b border-gray-800">
        <div className="container mx-auto py-6 px-4">
          <h1 className="text-4xl font-bold text-center mb-2 text-white">
            Website Builder
          </h1>
          <p className="text-gray-400 text-center mb-2">Prompt: {prompt}</p>

          {/* Prompt Input Section */}
          {!(loading || !templateSet) && (
            <div className="max-w-3xl mx-auto flex gap-2">
              <textarea
                value={userPrompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full p-1 bg-gray-800 text-white rounded-lg border border-gray-700 focus:outline-none focus:border-purple-500"
                rows={3}
              />
              <button
                onClick={async () => {
                  const newMessage = {
                    role: "user" as const,
                    content: userPrompt,
                  };

                  setLoading(true);
                  const stepsResponse = await axios.post(`/api/chat`, {
                    messages: [...llmMessages, newMessage],
                  });
                  setLoading(false);

                  setLlmMessages((x) => [...x, newMessage]);
                  setLlmMessages((x) => [
                    ...x,
                    {
                      role: "assistant",
                      content: stepsResponse.data.response,
                    },
                  ]);

                  setSteps((s) => [
                    ...s,
                    ...parseXml(stepsResponse.data.response).map((x) => ({
                      ...x,
                      status: "pending" as const,
                    })),
                  ]);
                }}
                className="px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Send
              </button>
            </div>
          )}
          {(loading || !templateSet) && (
            <div className="flex justify-center">
              <Loader/>
            </div>
          )}
        </div>
      </div>

      {/* Three Column Layout */}
      <div className="flex-1 grid grid-cols-5 divide-x divide-gray-800">
        {/* Steps Column */}
        <div className="h-[calc(100vh-12rem)] col-span-1">
          <StepsList
            steps={steps}
            currentStep={currentStep}
            onStepClick={setCurrentStep}
          />
        </div>

        {/* File Explorer Column */}
        <div className="h-[calc(100vh-12rem)] col-span-1">
          <FileExplorer files={files} onFileSelect={setSelectedFile} />
        </div>

        {/* Code Editor Column */}
        <div className="h-[calc(100vh-12rem)] col-span-3">
          <div className="h-full bg-black">
            {/* <TabView activeTab={activeTab} onTabChange={setActiveTab} /> */}
            <div className="h-[calc(100%-2.5rem)]">
              {activeTab === "code" ? (
                <CodeEditor file={selectedFile} />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <h1 className="text-4xl font-bold text-white mb-4">
                      Website Builder AI
                    </h1>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
