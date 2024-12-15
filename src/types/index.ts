// Enum for different step types in a project workflow
export enum StepType {
    CreateFile,
    CreateFolder,
    EditFile,
    DeleteFile,
    RunScript,
}

// Interface for a single step in the project workflow
export interface Step {
    id: number;
    title: string;
    description: string;
    type: StepType;
    status: 'pending' | 'in-progress' | 'completed';
    code?: string; // Optional code associated with the step
    path?: string; // Optional file path for the step
}

// Interface representing a project with a prompt and associated steps
export interface Project {
    prompt: string;
    steps: Step[];
}

// Interface for a file or folder item in the file structure
export interface FileItem {
    name: string;
    type: 'file' | 'folder';
    children?: FileItem[]; // Optional child items for folders
    content?: string; // Optional content for files
    path: string; // File or folder path
}

// Props for the FileViewer component
export interface FileViewerProps {
    file: FileItem | null; // Selected file to view
    onClose: () => void;   // Callback function to handle closing the viewer
}
