// src/hooks/webContainers.ts

import { useEffect, useState } from "react";
import { WebContainer } from "@webcontainer/api";

export function useWebContainer() {
    const [webcontainer, setWebcontainer] = useState<WebContainer | null>(null);

    useEffect(() => {
        // Ensure WebContainer is only initialized in the browser
        if (typeof window !== "undefined") {
            const initWebContainer = async () => {
                const webcontainerInstance = await WebContainer.boot();
                setWebcontainer(webcontainerInstance);
            };
            initWebContainer();
        }
    }, []);

    return webcontainer;
}
