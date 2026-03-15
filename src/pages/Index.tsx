import { useEffect } from "react";

const Index = () => {
  useEffect(() => {
    window.location.replace("/pookie-and-i.html");
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <p className="text-muted-foreground">Loading…</p>
    </div>
  );
};

export default Index;
