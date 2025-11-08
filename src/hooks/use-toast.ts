import { toast as sonnerToast } from "sonner";

interface ToastOptions {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
}

export const useToast = () => {
  const toast = ({ title, description, variant = "default" }: ToastOptions) => {
    const message = title && description ? `${title}: ${description}` : title || description || "";

    if (variant === "destructive") {
      sonnerToast.error(message);
    } else {
      sonnerToast.success(message);
    }
  };

  return { toast };
};