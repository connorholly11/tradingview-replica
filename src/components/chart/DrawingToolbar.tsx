'use client';

import { useState } from 'react';
import { 
  FiPenTool, 
  FiType, 
  FiTrendingUp, 
  FiCircle, 
  FiSquare, 
  FiArrowRight, 
  FiPocket,
  FiZoomIn,
  FiTrash,
  FiMinus
} from 'react-icons/fi';

type DrawingTool =
  | 'cursor'
  | 'line'
  | 'horizontal'
  | 'vertical'
  | 'rectangle'
  | 'circle'
  | 'arrow'
  | 'text'
  | 'fibonacci'
  | 'brush'
  | 'none';

interface DrawingToolbarProps {
  onToolSelect: (tool: DrawingTool) => void;
}

export default function DrawingToolbar({ onToolSelect }: DrawingToolbarProps) {
  const [activeTool, setActiveTool] = useState<DrawingTool>('none');

  const handleToolSelect = (tool: DrawingTool) => {
    const newTool = tool === activeTool ? 'none' : tool;
    setActiveTool(newTool);
    onToolSelect(newTool);
  };

  return (
    // Now we style it as a vertical sidebar
    <div className="absolute top-0 left-0 w-12 h-full bg-[#131722] border-r border-[#2A2E39] flex flex-col items-center py-2 z-20">
      <button
        className={`p-2 rounded-md mb-2 ${
          activeTool === 'cursor' ? 'bg-[#2A2E39]' : 'hover:bg-[#2A2E39] text-gray-400'
        }`}
        onClick={() => handleToolSelect('cursor')}
        title="Cursor"
      >
        <FiZoomIn size={20} />
      </button>

      <button
        className={`p-2 rounded-md mb-2 ${
          activeTool === 'line' ? 'bg-[#2A2E39]' : 'hover:bg-[#2A2E39] text-gray-400'
        }`}
        onClick={() => handleToolSelect('line')}
        title="Line"
      >
        <FiTrendingUp size={20} />
      </button>

      <button
        className={`p-2 rounded-md mb-2 ${
          activeTool === 'horizontal' ? 'bg-[#2A2E39]' : 'hover:bg-[#2A2E39] text-gray-400'
        }`}
        onClick={() => handleToolSelect('horizontal')}
        title="Horizontal Line"
      >
        <FiMinus size={20} />
      </button>

      <button
        className={`p-2 rounded-md mb-2 ${
          activeTool === 'vertical' ? 'bg-[#2A2E39]' : 'hover:bg-[#2A2E39] text-gray-400'
        }`}
        onClick={() => handleToolSelect('vertical')}
        title="Vertical Line"
      >
        <div className="transform rotate-90">
          <FiMinus size={20} />
        </div>
      </button>

      <button
        className={`p-2 rounded-md mb-2 ${
          activeTool === 'rectangle' ? 'bg-[#2A2E39]' : 'hover:bg-[#2A2E39] text-gray-400'
        }`}
        onClick={() => handleToolSelect('rectangle')}
        title="Rectangle"
      >
        <FiSquare size={20} />
      </button>

      <button
        className={`p-2 rounded-md mb-2 ${
          activeTool === 'circle' ? 'bg-[#2A2E39]' : 'hover:bg-[#2A2E39] text-gray-400'
        }`}
        onClick={() => handleToolSelect('circle')}
        title="Circle"
      >
        <FiCircle size={20} />
      </button>

      <button
        className={`p-2 rounded-md mb-2 ${
          activeTool === 'arrow' ? 'bg-[#2A2E39]' : 'hover:bg-[#2A2E39] text-gray-400'
        }`}
        onClick={() => handleToolSelect('arrow')}
        title="Arrow"
      >
        <FiArrowRight size={20} />
      </button>

      <button
        className={`p-2 rounded-md mb-2 ${
          activeTool === 'text' ? 'bg-[#2A2E39]' : 'hover:bg-[#2A2E39] text-gray-400'
        }`}
        onClick={() => handleToolSelect('text')}
        title="Text"
      >
        <FiType size={20} />
      </button>

      <button
        className={`p-2 rounded-md mb-2 ${
          activeTool === 'fibonacci' ? 'bg-[#2A2E39]' : 'hover:bg-[#2A2E39] text-gray-400'
        }`}
        onClick={() => handleToolSelect('fibonacci')}
        title="Fibonacci Retracement"
      >
        <FiPocket size={20} />
      </button>

      <button
        className={`p-2 rounded-md mb-2 ${
          activeTool === 'brush' ? 'bg-[#2A2E39]' : 'hover:bg-[#2A2E39] text-gray-400'
        }`}
        onClick={() => handleToolSelect('brush')}
        title="Brush"
      >
        <FiPenTool size={20} />
      </button>

      <div className="mt-auto">
        <button
          className="p-2 text-gray-400 hover:text-white rounded-md hover:bg-[#2A2E39]"
          onClick={() => {
            setActiveTool('none');
            // Potentially clear drawings if we had that logic
          }}
          title="Clear All Drawings"
        >
          <FiTrash size={20} />
        </button>
      </div>
    </div>
  );
}
