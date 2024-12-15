// // src/components/CodeEditor.tsx
// import React from "react";
// import dynamic from "next/dynamic";
// import { FileItem } from "../types";

// // Dynamically import MonacoEditor to prevent server-side rendering issues
// const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

// interface CodeEditorProps {
//   file: FileItem | null;
// }

// const CodeEditor: React.FC<CodeEditorProps> = ({ file }) => {
//   if (!file) {
//     return (
//       <div className="h-full flex items-center justify-center text-gray-400">
//         Select a file to view its contents
//       </div>
//     );
//   }

//   return (
//     <MonacoEditor
//       height="100%"
//       defaultLanguage="typescript"
//       theme="vs-dark"
//       value={file.content || ""}
//       options={{
//         readOnly: true,
//         minimap: { enabled: false },
//         fontSize: 14,
//         wordWrap: "on",
//         scrollBeyondLastLine: false,
//       }}
//     />
//   );
// };

// export default CodeEditor;

import React from "react";
import dynamic from "next/dynamic";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileItem } from "../types";

// Dynamically import MonacoEditor to prevent server-side rendering issues
const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
});

interface CodeEditorProps {
  file: FileItem | null;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ file }) => {
  return (
    <div className="h-full bg-black w-full">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold text-white">Code Editor</h2>
      </div>
      <div className="p-4 border-b border-gray-800">
        <h2 className="text-lg font-semibold text-white">
          {file ? file.name : "Code Editor"}
        </h2>
      </div>
      <ScrollArea className="h-[calc(100vh-10rem)]">
        <div className="p-4">
          {!file ? (
            <div className="p-4 rounded-lg bg-gray-900 text-gray-400">
              Select a file to view its contents
            </div>
          ) : (
            <div className="rounded-lg bg-gray-900 overflow-hidden">
              <MonacoEditor
                height="calc(100vh - 14rem)"
                defaultLanguage="typescript"
                theme="vs-dark"
                value={file.content || ""}
                options={{
                  readOnly: true,
                  minimap: { enabled: false },
                  fontSize: 14,
                  wordWrap: "on",
                  scrollBeyondLastLine: false,
                  padding: { top: 16, bottom: 16 },
                  contextmenu: true,
                  lineNumbers: "on",
                  renderLineHighlight: "line",
                  automaticLayout: true,
                }}
              />
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default CodeEditor;
