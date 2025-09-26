import { Button } from "@/components/ui/button";
import React from "react";

export default function FormButton({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Button
      className="w-full mt-6 py-4 rounded-xl font-semibold cursor-pointer"
      variant="default"
    >
      {children}
    </Button>
  );
}
