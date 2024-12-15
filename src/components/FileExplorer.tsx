// "use-client";
// import React, { useState } from "react";
// import { FolderTree, File, ChevronRight, ChevronDown } from "lucide-react";
// import { FileItem } from "../types";

// interface FileExplorerProps {
//   files: FileItem[];
//   onFileSelect: (file: FileItem) => void;
// }

// interface FileNodeProps {
//   item: FileItem;
//   depth: number;
//   onFileClick: (file: FileItem) => void;
// }

// const FileNode: React.FC<FileNodeProps> = ({ item, depth, onFileClick }) => {
//   const [isExpanded, setIsExpanded] = useState(false);

//   const handleClick = () => {
//     if (item.type === "folder") {
//       setIsExpanded(!isExpanded);
//     } else {
//       onFileClick(item);
//     }
//   };

//   return (
//     <div className="select-none">
//       <div
//         className="flex items-center gap-2 p-2 hover:bg-gray-800 rounded-md cursor-pointer transition-colors duration-150"
//         style={{ paddingLeft: `${depth * 1.5}rem` }}
//         onClick={handleClick}
//       >
//         {item.type === "folder" && (
//           <span className="text-gray-400">
//             {isExpanded ? (
//               <ChevronDown className="w-4 h-4" />
//             ) : (
//               <ChevronRight className="w-4 h-4" />
//             )}
//           </span>
//         )}
//         {item.type === "folder" ? (
//           <FolderTree className="w-4 h-4 text-blue-400" />
//         ) : (
//           <File className="w-4 h-4 text-gray-400" />
//         )}
//         <span className="text-gray-200">{item.name}</span>
//       </div>
//       {item.type === "folder" && isExpanded && item.children && (
//         <div>
//           {item.children.map((child, index) => (
//             <FileNode
//               key={`${child.path}-${index}`}
//               item={child}
//               depth={depth + 1}
//               onFileClick={onFileClick}
//             />
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// const FileExplorer: React.FC<FileExplorerProps> = ({ files, onFileSelect }) => {
//   return (
//     <div className="bg-gray-900 rounded-lg shadow-lg p-4 h-full overflow-auto">
//       <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-100">
//         <FolderTree className="w-5 h-5" />
//         File Explorer
//       </h2>
//       <div className="space-y-1">
//         {files.map((file, index) => (
//           <FileNode
//             key={`${file.path}-${index}`}
//             item={file}
//             depth={0}
//             onFileClick={onFileSelect}
//           />
//         ))}
//       </div>
//     </div>
//   );
// };

// export default FileExplorer;

import React, { useState } from "react";
import { FolderTree, File, ChevronRight, ChevronDown } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileItem } from "../types";

interface FileExplorerProps {
  files: FileItem[];
  onFileSelect: (file: FileItem) => void;
}

interface FileNodeProps {
  item: FileItem;
  depth: number;
  onFileClick: (file: FileItem) => void;
}

const FileNode: React.FC<FileNodeProps> = ({ item, depth, onFileClick }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleClick = () => {
    if (item.type === "folder") {
      setIsExpanded(!isExpanded);
    } else {
      onFileClick(item);
    }
  };

  return (
    <div className="select-none">
      <button
        className={`flex items-center w-full hover:bg-gray-800 px-2 py-1 rounded-sm text-sm text-white ${
          item.type !== "folder" ? "pl-6" : ""
        }`}
        style={{ paddingLeft: `${depth * 12}px` }}
        onClick={handleClick}
      >
        {item.type === "folder" && (
          <span className="text-gray-400 mr-1">
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </span>
        )}
        {item.type === "folder" ? (
          <FolderTree className="h-4 w-4 mr-2 text-blue-400" />
        ) : (
          <File className="h-4 w-4 mr-2 text-gray-400" />
        )}
        <span>{item.name}</span>
      </button>
      {item.type === "folder" && isExpanded && item.children && (
        <div>
          {item.children.map((child, index) => (
            <FileNode
              key={`${child.path}-${index}`}
              item={child}
              depth={depth + 1}
              onFileClick={onFileClick}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const FileExplorer: React.FC<FileExplorerProps> = ({ files, onFileSelect }) => {
  return (
    <div className="h-full bg-black">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <FolderTree className="w-5 h-5" />
          File Explorer
        </h2>
      </div>
      <ScrollArea className="h-[calc(100vh-10rem)]">
        <div className="p-4 space-y-1">
          {files.map((file, index) => (
            <FileNode
              key={`${file.path}-${index}`}
              item={file}
              depth={0}
              onFileClick={onFileSelect}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default FileExplorer;
