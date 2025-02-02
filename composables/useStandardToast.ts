import type { Notification } from "#ui/types";
import type { StandardToastType } from "~/types/toast";

export function useStandardToast(type: StandardToastType, options?: Partial<Notification>)
{
    const toast = useToast();

    switch (type)
    {
        case "error":
            toast.add({
                title: "Error",
                description: "An error occured. Please try again or contact an administrator.",
                color: "red",
                ...options
            });
            break;
        case "warning":
            toast.add({
                title: "Warning",
                color: "orange",
                ...options
            });
            break;
        case "info":
            toast.add({
                title: "Information",
                color: "primary",
                ...options
            });
            break;
        case "success":
            toast.add({
                title: "Success",
                color: "green",
                ...options
            });
            break;
        case "unauthorized":
            toast.add({
                title: "Error",
                description: "You must be authenticated to access this ressource.",
                color: "red",
                ...options
            });
            break;
    }
}
