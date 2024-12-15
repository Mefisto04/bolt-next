// // src/components/StepsList.tsx
// import React from "react";
// import { CheckCircle, Circle, Clock } from "lucide-react";
// import { Step } from "../types";

// interface StepsListProps {
//   steps: Step[];
//   currentStep: number;
//   onStepClick: (stepId: number) => void;
// }

// const StepsList: React.FC<StepsListProps> = ({
//   steps,
//   currentStep,
//   onStepClick,
// }) => {
//   return (
//     <div className="bg-gray-900 rounded-lg shadow-lg p-4 h-full overflow-auto">
//       <h2 className="text-lg font-semibold mb-4 text-gray-100">Build Steps</h2>
//       <div className="space-y-4">
//         {steps.map((step) => (
//           <div
//             key={step.id}
//             className={`p-1 rounded-lg cursor-pointer transition-colors ${
//               currentStep === step.id
//                 ? "bg-gray-800 border border-gray-700"
//                 : "hover:bg-gray-800"
//             }`}
//             onClick={() => onStepClick(step.id)}
//           >
//             <div className="flex items-center gap-2">
//               {step.status === "completed" ? (
//                 <CheckCircle className="w-5 h-5 text-green-500" />
//               ) : step.status === "in-progress" ? (
//                 <Clock className="w-5 h-5 text-blue-400" />
//               ) : (
//                 <Circle className="w-5 h-5 text-gray-600" />
//               )}
//               <h3 className="font-medium text-gray-100">{step.title}</h3>
//             </div>
//             <p className="text-sm text-gray-400 mt-2">{step.description}</p>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default StepsList;

import React from "react";
import { CheckCircle, Circle, Clock, Terminal } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Step } from "../types";

interface StepsListProps {
  steps: Step[];
  currentStep: number;
  onStepClick: (stepId: number) => void;
}

const StepsList: React.FC<StepsListProps> = ({
  steps,
  currentStep,
  onStepClick,
}) => {
  return (
    <div className="h-full bg-black">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Terminal className="h-5 w-5" />
          Build Steps
        </h2>
      </div>
      <ScrollArea className="h-[calc(100vh-10rem)]">
        <div className="p-4 space-y-4">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`p-1rounded-lg cursor-pointer transition-colors ${
                currentStep === step.id
                  ? "bg-gray-800 border border-gray-700"
                  : "hover:bg-gray-800"
              }`}
              onClick={() => onStepClick(step.id)}
            >
              <div className="flex items-center space-x-2">
                {step.status === "completed" ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : step.status === "in-progress" ? (
                  <Clock className="w-5 h-5 text-blue-400" />
                ) : (
                  <Circle className="w-5 h-5 text-gray-600" />
                )}
                <div className="flex-1">
                  <code className="text-sm bg-gray-800/50 px-2 py-1 rounded text-white">
                    {step.title}
                  </code>
                </div>
              </div>
              <p className="text-sm text-gray-400 mt-2 pl-7">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default StepsList;
