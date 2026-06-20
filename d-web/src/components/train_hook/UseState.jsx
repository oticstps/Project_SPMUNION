import React, { useState } from "react";

const UseState = () => {
  const [count, setCount] = useState(1);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-lg rounded-xl p-6 w-80 text-center">
        
        
        <h1 className="text-2xl font-bold text-gray-700 mb-6">
          UseState Hook
        </h1>

        <div className="flex items-center justify-between">
          <button
            onMouseMove={() => setCount(count - 1)}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
          >
            −
          </button>

          <span className="text-3xl font-semibold text-gray-800">
            {count}
          </span>

          <button
            onMouseMove={() => setCount(count + 1)}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
};

export default UseState;
