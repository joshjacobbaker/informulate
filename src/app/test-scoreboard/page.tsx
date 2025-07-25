"use client";

import React, { useState } from "react";
import LiveScoreboard from "@/components/LiveScoreboard/LiveScoreboard";

export default function ScoreboardTest() {
  const [sessionId] = useState("3bc2cdbf-cf78-49fc-9b74-8128ea8ada93");

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-center">Scoreboard Component Test</h1>
        
        <div className="grid lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-bold mb-4">Full Scoreboard</h2>
            <LiveScoreboard sessionId={sessionId} />
          </div>
          
          <div>
            <h2 className="text-xl font-bold mb-4">Compact Scoreboard</h2>
            <LiveScoreboard sessionId={sessionId} compact={true} />
          </div>
        </div>
        
        <div className="text-center">
          <p className="text-gray-600">Session ID: {sessionId}</p>
          <p className="text-sm text-gray-500 mt-2">
            Check console for debugging information
          </p>
        </div>
      </div>
    </div>
  );
}
