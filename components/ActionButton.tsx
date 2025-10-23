import { ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface ActionButtonProps {
  icon: ReactNode;
  loadingIcon?: ReactNode;
  onClick: () => void;
  title: string;
  loading?: boolean;
  className?: string;
}

export function ActionButton({
  icon,
  loadingIcon,
  onClick,
  title,
  loading = false,
  className = "",
}: ActionButtonProps) {
  return (
    <Button
      variant="ghost"
      onClick={onClick}
      title={title}
      disabled={loading}
      className={`p-1 h-auto w-auto transition ${loading ? "opacity-50 cursor-wait" : `hover:bg-gray-200 ${className}`}`}
    >
      {loading ? (loadingIcon || <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>) : icon}
    </Button>
  );
}
