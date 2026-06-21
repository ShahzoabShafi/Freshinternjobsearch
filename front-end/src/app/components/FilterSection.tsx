import React from "react";

export default function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
    return (
      <div className="mb-5">
        <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-2.5">
          {title}
        </h4>
        {children}
      </div>
    );
  }