'use client';
import { useState } from 'react';

const tabs = ['Branding', 'Design', 'Settings'];

export default function Settings() {
  const [activeTab, setActiveTab] = useState('Branding');
  const [showHeadshot, setShowHeadshot] = useState(true);
  const [showAuthor, setShowAuthor] = useState(true);
  const [showCompany, setShowCompany] = useState(true);
  const [introOnly, setIntroOnly] = useState(false);
  const [author, setAuthor] = useState('Alex');
  const [company, setCompany] = useState('Co-founder at Typegrow');

  return (
    <div className="max-w-4xl mx-auto mt-10 border rounded-md shadow bg-white">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-40 border-r">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`w-full px-4 py-3 text-left hover:bg-gray-50 ${
                activeTab === tab ? 'bg-blue-50 text-blue-600 font-medium' : ''
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Panel Content */}
        <div className="flex-1 p-6">
          {activeTab === 'Branding' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Branding</h2>

              {/* Headshot */}
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={showHeadshot}
                    onChange={(e) => setShowHeadshot(e.target.checked)}
                  />
                  Headshot
                </label>

                {showHeadshot && (
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-[#8c5d46] text-white flex items-center justify-center rounded-md font-semibold">
                      S
                    </div>
                    <button className="bg-white px-4 py-1 border rounded-full hover:bg-gray-100">
                      Select image
                    </button>
                    <button className="text-red-600 hover:underline text-sm">🗑️</button>
                  </div>
                )}
              </div>

              {/* Author */}
              <div>
                <label className="flex items-center gap-2 mb-1">
                  <input
                    type="checkbox"
                    checked={showAuthor}
                    onChange={(e) => setShowAuthor(e.target.checked)}
                  />
                  Author
                </label>
                {showAuthor && (
                  <input
                    type="text"
                    className="w-full border rounded px-3 py-2"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                  />
                )}
              </div>

              {/* Company */}
              <div>
                <label className="flex items-center gap-2 mb-1">
                  <input
                    type="checkbox"
                    checked={showCompany}
                    onChange={(e) => setShowCompany(e.target.checked)}
                  />
                  Handle / Company
                </label>
                {showCompany && (
                  <input
                    type="text"
                    className="w-full border rounded px-3 py-2"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                  />
                )}
              </div>

              {/* Intro Only Toggle */}
              <div>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={introOnly}
                    onChange={(e) => setIntroOnly(e.target.checked)}
                  />
                  Show only in Intro and Outro slides
                </label>
              </div>
            </div>
          )}

          {activeTab === 'Design' && (
            <div className="text-gray-500 text-sm">Design tab content...</div>
          )}

          {activeTab === 'Settings' && (
            <div className="text-gray-500 text-sm">Settings tab content...</div>
          )}
        </div>
      </div>

      {/* Footer Buttons */}
      <div className="flex justify-end gap-3 p-4 border-t">
        <button className="px-4 py-2 border rounded text-blue-600 hover:bg-blue-50">
          Save Progress
        </button>
        <button className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600">
          📅 Schedule Post
        </button>
        <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          ⬇️ Download Carousel
        </button>
      </div>
    </div>
  );
}
