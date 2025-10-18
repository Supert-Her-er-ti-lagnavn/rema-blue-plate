import React from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, MapPin, Navigation } from "lucide-react";

export const ShoppingMode: React.FC = () => {
  return (
    <>
      {/* CONTENT WRAPPER */}
      <div className="max-w-7xl mx-auto px-4 py-16 pb-24 space-y-16">
        
        {/* SECTION 1: SHOPPING NAVIGATION - Easy to replace */}
        <section>
          {/* Shopping Navigation Square */}
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
              
              {/* Navigation Grid */}
              <div className="relative w-full h-96 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center">
                
                {/* Center Position Indicator */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-lg">
                    <MapPin size={24} />
                  </div>
                </div>

                {/* Directional Arrows */}
                {/* Up Arrow */}
                <button className="absolute top-4 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110">
                  <ArrowUp size={20} />
                </button>

                {/* Down Arrow */}
                <button className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110">
                  <ArrowDown size={20} />
                </button>

                {/* Left Arrow */}
                <button className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110">
                  <ArrowLeft size={20} />
                </button>

                {/* Right Arrow */}
                <button className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110">
                  <ArrowRight size={20} />
                </button>

                {/* Corner Arrows for Diagonal Movement */}
                {/* Top-Left */}
                <button className="absolute top-8 left-8 w-10 h-10 bg-blue-400 hover:bg-blue-500 text-white rounded-full flex items-center justify-center shadow-md transition-all duration-200 hover:scale-110">
                  <div className="transform -rotate-45">
                    <ArrowUp size={16} />
                  </div>
                </button>

                {/* Top-Right */}
                <button className="absolute top-8 right-8 w-10 h-10 bg-blue-400 hover:bg-blue-500 text-white rounded-full flex items-center justify-center shadow-md transition-all duration-200 hover:scale-110">
                  <div className="transform rotate-45">
                    <ArrowUp size={16} />
                  </div>
                </button>

                {/* Bottom-Left */}
                <button className="absolute bottom-8 left-8 w-10 h-10 bg-blue-400 hover:bg-blue-500 text-white rounded-full flex items-center justify-center shadow-md transition-all duration-200 hover:scale-110">
                  <div className="transform rotate-45">
                    <ArrowDown size={16} />
                  </div>
                </button>

                {/* Bottom-Right */}
                <button className="absolute bottom-8 right-8 w-10 h-10 bg-blue-400 hover:bg-blue-500 text-white rounded-full flex items-center justify-center shadow-md transition-all duration-200 hover:scale-110">
                  <div className="transform -rotate-45">
                    <ArrowDown size={16} />
                  </div>
                </button>

                {/* Instruction Text */}
                <div className="absolute bottom-0 left-0 right-0 text-center text-gray-500 text-sm mb-2">
                  Click arrows to navigate through the store
                </div>
              </div>

              {/* Shopping Status */}
              <div className="mt-6 text-center">
                <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span>Current Position</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span>Available Directions</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex gap-4 justify-center">
                <button className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2">
                  <Navigation size={16} />
                  Start Shopping
                </button>
                <button className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors">
                  View Shopping List
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: SHOPPING INFO CARDS - Easy to replace */}
        <section>
          <div className="max-w-2xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 text-center">
                <div className="text-2xl mb-2">📍</div>
                <h3 className="font-semibold text-gray-900">Current Aisle</h3>
                <p className="text-sm text-gray-600">Entrance</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 text-center">
                <div className="text-2xl mb-2">🛒</div>
                <h3 className="font-semibold text-gray-900">Items Left</h3>
                <p className="text-sm text-gray-600">12 items</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 text-center">
                <div className="text-2xl mb-2">⏱️</div>
                <h3 className="font-semibold text-gray-900">Est. Time</h3>
                <p className="text-sm text-gray-600">15 minutes</p>
              </div>
            </div>
          </div>
        </section>

        {/* 
        NEW SECTIONS CAN BE ADDED HERE
        Just copy-paste new <section> blocks:
        
        <section>
          <YourNewShoppingComponent />
        </section>
        */}
        
      </div>
    </>
  );
};