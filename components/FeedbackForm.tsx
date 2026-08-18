import React from "react";
import { Star } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { UserFeedback } from "./types";

interface FeedbackFormProps {
  feedbackForm: { ratingUi: number; ratingSpeed: number; ratingCost: number; comment: string };
  setFeedbackForm: (form: any) => void;
  submitFeedback: (e: React.FormEvent) => void;
  feedbackList: UserFeedback[];
}

export default function FeedbackForm({
  feedbackForm,
  setFeedbackForm,
  submitFeedback,
  feedbackList,
}: FeedbackFormProps) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-6 backdrop-blur-xl shadow-2xl">
      <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 mb-1">
        <Star className="h-4.5 w-4.5 text-yellow-400" />
        Corridor Feedback System
      </h4>
      <p className="text-[10px] text-slate-400 leading-normal mb-4">
        Submit usability feedback to satisfy Level 5 product validation metrics.
      </p>

      <form onSubmit={submitFeedback} className="space-y-3">
        <div className="space-y-1">
          <div className="flex justify-between text-[9px] font-bold text-slate-500 uppercase">
            <span>User Interface</span>
            <span className="text-white">{feedbackForm.ratingUi}/5</span>
          </div>
          <input 
            type="range" min="1" max="5" 
            value={feedbackForm.ratingUi}
            onChange={(e) => setFeedbackForm({...feedbackForm, ratingUi: parseInt(e.target.value)})}
            className="w-full accent-indigo-500 bg-slate-900 rounded-lg appearance-none h-1"
          />
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-[9px] font-bold text-slate-500 uppercase">
            <span>Settlement Speed</span>
            <span className="text-white">{feedbackForm.ratingSpeed}/5</span>
          </div>
          <input 
            type="range" min="1" max="5" 
            value={feedbackForm.ratingSpeed}
            onChange={(e) => setFeedbackForm({...feedbackForm, ratingSpeed: parseInt(e.target.value)})}
            className="w-full accent-indigo-500 bg-slate-900 rounded-lg appearance-none h-1"
          />
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-[9px] font-bold text-slate-500 uppercase">
            <span>Transfer Cost</span>
            <span className="text-white">{feedbackForm.ratingCost}/5</span>
          </div>
          <input 
            type="range" min="1" max="5" 
            value={feedbackForm.ratingCost}
            onChange={(e) => setFeedbackForm({...feedbackForm, ratingCost: parseInt(e.target.value)})}
            className="w-full accent-indigo-500 bg-slate-900 rounded-lg appearance-none h-1"
          />
        </div>

        <div className="space-y-1 pt-1">
          <Input 
            placeholder="Short comments or review..."
            value={feedbackForm.comment}
            onChange={(e) => setFeedbackForm({...feedbackForm, comment: e.target.value})}
            className="bg-slate-950/80 border-slate-900 text-xs text-slate-300"
          />
        </div>

        <Button type="submit" size="sm" variant="outline" className="w-full text-xs mt-1">
          Submit Feedback
        </Button>
      </form>

      {/* Feedback list */}
      <div className="mt-4 pt-4 border-t border-slate-900/60 space-y-3 max-h-[160px] overflow-y-auto">
        <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold">
          <span>RECENT FEEDBACK</span>
          <span className="text-yellow-400">★ 4.9 Average</span>
        </div>
        {feedbackList.map((item, idx) => (
          <div key={idx} className="p-2.5 rounded-lg border border-slate-900 bg-slate-950/20 space-y-1 text-[10px]">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[9px] text-indigo-400">{item.userAddress}</span>
              <span className="text-slate-500">{item.date}</span>
            </div>
            <p className="text-slate-300 italic leading-relaxed">"{item.comment}"</p>
            <div className="flex gap-2 text-[8px] text-slate-500 uppercase font-bold">
              <span>UI: {item.ratingUi}/5</span>
              <span>Speed: {item.ratingSpeed}/5</span>
              <span>Cost: {item.ratingCost}/5</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
