import React, { useState } from "react";
import BasicRating from "../Rating/Rating";

export default function HabitCard({
  title,
  description,
  goal,
  time_frame,
  rating,
  setRating,
}: {
  title: string;
  description: string;
  goal: string;
  time_frame: number | null;
  rating: number | null;
  setRating: React.Dispatch<React.SetStateAction<number | null>>;
}) {
  const [showDescription, setShowDescription] = useState(false);
  return (
    <div className="mb-5 flex flex-col w-full bg-slate-800 rounded-xl pl-5 text-slate-200 py-3 md:w-2/3">
      <div
        onClick={() => {
          setShowDescription((prev) => !prev);
        }}
        className="flex items-center justify-between px-5"
      >
        <h5 className="text-2xl flex items-center">{title}</h5>
        <div className="bg-slate-100 h-[100%]">
          <BasicRating rating={rating} setRating={setRating} />
        </div>
      </div>
      {showDescription && (
        <div className="mt-5">
          {/* <p>description: </p> */}
          <p className="text-center mb-5">{description}</p>

          <p className="text-center">
            🚀
            {goal}
          </p>
          <p className="text-center">
            🕒 {time_frame}
            <span className="ml-1">days</span>
          </p>
        </div>
      )}
    </div>
  );
}
