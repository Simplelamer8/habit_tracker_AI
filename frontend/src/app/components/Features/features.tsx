import React from "react";

export default function Features() {
  return (
    <ul className="px-5 bg-white">
      <li className="flex flex-col items-center md:mb-20">
        <h2 className="text-xl md:text-center">
          1. Stay Organized and Focused
        </h2>
        <p className="text-center my-5 md:w-1/3">
          Our habit tracker app helps you organize your daily routines and stay
          focused on your goals. By tracking your habits, you can visualize your
          progress and stay motivated to achieve your objectives.
        </p>
      </li>
      <li className="flex flex-col items-center md:mb-20">
        <h2 className="text-xl md:text-center">
          2. Daily Ratings for Better Insights
        </h2>
        <p className="text-center my-5  md:w-1/3">
          With our unique rating system, you can rate your habit development
          each day from 1 to 5. This allows you to gain deeper insights into
          your progress and identify areas where you can improve.
        </p>
      </li>
      <li className="flex flex-col items-center md:mb-20">
        <h2 className="text-xl md:text-center">
          3. Consistent Progress Tracking
        </h2>
        <p className="text-center my-5 md:w-1/3">
          Our app ensures that your habit ratings are saved daily, providing a
          clear and comprehensive view of your progress over time. Even as days
          pass, your habits are carried forward, enabling consistent tracking
          and development.
        </p>
      </li>
    </ul>
  );
}
