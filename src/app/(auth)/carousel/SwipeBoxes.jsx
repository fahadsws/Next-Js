"use client";
import { useRef, useState } from "react";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";

export default function SwipeBoxes() {
  const [boxes, setBoxes] = useState([
    {
      id: 1,
      title: "Amazing Catchy Title Goes Right Here!",
      description: "Your amazing description goes here.",
      color: "#edf7f5",
      showTitle: true,
      showDescription: true,
    },
  ]);

  const [selectedBox, setSelectedBox] = useState(0);
  const [editingBoxId, setEditingBoxId] = useState(null);
  const [activeFilterBoxId, setActiveFilterBoxId] = useState(null);

  const swiperRef = useRef(null);

  const scrollBy = (direction) => {
    if (swiperRef.current) {
      const scrollAmount = swiperRef.current.offsetWidth * 0.8;
      swiperRef.current.scrollBy({
        left: direction * scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const addBox = () => {
    const newBox = {
      id: boxes.length + 1,
      title: `Title ${boxes.length}`,
      description: `Description ${boxes.length}`,
      color: "#edf7f5",
      showTitle: true,
      showDescription: true,
    };
    setBoxes([...boxes, newBox]);
  };

  const deleteBox = (id) => {
    setBoxes(boxes.filter((box) => box.id !== id));
    if (selectedBox >= boxes.length - 1) {
      setSelectedBox(Math.max(0, boxes.length - 2));
    }
  };

  const updateBox = (id, field, value) => {
    setBoxes(
      boxes.map((box) => (box.id === id ? { ...box, [field]: value } : box))
    );
  };

  const toggleVisibility = (id, field) => {
    setBoxes((prev) =>
      prev.map((box) =>
        box.id === id ? { ...box, [field]: !box[field] } : box
      )
    );
  };

 const downloadPDF = async () => {
  document.body.classList.add("downloading-pdf");

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "px",
    format: [400, 500], // match box dimensions
  });
  for (let i = 0; i < boxes.length; i++) {
    const box = boxes[i];
    const parent = document.getElementById(`box-${box.id}`);
    const element = parent?.querySelector(".snap-center");

    if (!element) continue;

    const canvas = await html2canvas(element, {
      scale: 2,
      backgroundColor: null, // use computed styles
      useCORS: true,
    });

    const imgData = canvas.toDataURL("image/png");

    if (i > 0) pdf.addPage();

    pdf.addImage(imgData, "PNG", 0, 0, 400, 500);
  }

  pdf.save("swipe-boxes.pdf");
  document.body.classList.remove("downloading-pdf");
};


  return (
    <div className="space-y-8">
      <div className="relative bg-white shadow-xl p-5 mt-5 rounded-md">
        {/* Left Scroll Button */}
        <button
          onClick={() => scrollBy(-1)}
          className="rounded-full absolute left-[-20px] top-1/2 -translate-y-1/2 z-10 bg-blue-500 shadow px-3 py-3 hover:bg-blue-600 text-white"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 19.5 8.25 12l7.5-7.5"
            />
          </svg>
        </button>

        {/* Swiper Flex */}
        <div
          ref={swiperRef}
          className="flex overflow-x-auto pb-4 snap-x snap-mandatory scroll-smooth"
        >
          {boxes.map((box, index) => (
            <div key={box.id} id={`box-${box.id}`} className="relative">
              {/* Top Toolbar */}
              <div className="flex items-center justify-end space-x-3 mb-4 bg-white relative">
                {/* Filter Icon */}
                <svg
                  onClick={() =>
                    setActiveFilterBoxId(
                      activeFilterBoxId === box.id ? null : box.id
                    )
                  }
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5 text-gray-700 cursor-pointer"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75"
                  />
                </svg>

                {/* Filter Dropdown */}
                {activeFilterBoxId === box.id && (
                  <div className="absolute top-6 right-0 bg-white border rounded-md shadow p-4 z-20 w-48">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-700">
                        Show Title
                      </span>
                      <label className="inline-flex relative items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={box.showTitle}
                          onChange={() => toggleVisibility(box.id, "showTitle")}
                        />
                        <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-500 transition-all duration-300"></div>
                        <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow transform peer-checked:translate-x-5 transition-transform duration-300"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">
                        Show Description
                      </span>
                      <label className="inline-flex relative items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={box.showDescription}
                          onChange={() =>
                            toggleVisibility(box.id, "showDescription")
                          }
                        />
                        <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-500 transition-all duration-300"></div>
                        <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow transform peer-checked:translate-x-5 transition-transform duration-300"></div>
                      </label>
                    </div>
                  </div>
                )}

                {/* Delete */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5 text-red-500 cursor-pointer"
                  onClick={() => deleteBox(box?.id)}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                  />
                </svg>

                {/* Add */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5 text-green-500 cursor-pointer"
                  onClick={addBox}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                  />
                </svg>
              </div>

              <div
                className="snap-center border-r-2 border-dashed border-[#b7d9d1] w-[400px] h-[500px] flex-shrink-0 p-8 flex flex-col justify-between bg-[#edf7f5] text-[#1a3c3d] shadow-md transition-all duration-200"
                onClick={() => setSelectedBox(index)}
              >
                <div className="space-y-4">
                  {box.showTitle && (
                    <h2
                      className={`text-[36px] font-bold leading-tight break-words outline-none p-4 ${
                        editingBoxId === `title-${box.id}`
                          ? "border-2 border-dashed border-[#b7d9d1]"
                          : "border-2 border-transparent"
                      }`}
                      contentEditable
                      suppressContentEditableWarning
                      onFocus={() => setEditingBoxId(`title-${box.id}`)}
                      onBlur={(e) => {
                        updateBox(box.id, "title", e.target.innerText);
                        setEditingBoxId(null);
                      }}
                    >
                      {box.title}
                    </h2>
                  )}

                  {box.showDescription && (
                    <p
                      className={`text-lg mt-4 outline-none p-4 ${
                        editingBoxId === `desc-${box.id}`
                          ? "border-2 border-dashed border-[#b7d9d1]"
                          : "border-2 border-transparent"
                      }`}
                      contentEditable
                      suppressContentEditableWarning
                      onFocus={() => setEditingBoxId(`desc-${box.id}`)}
                      onBlur={(e) => {
                        updateBox(box.id, "description", e.target.innerText);
                        setEditingBoxId(null);
                      }}
                    >
                      {box.description}
                    </p>
                  )}
                </div>

                {index === 0 && (
                  <div className="flex items-center justify-between mt-8">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-[#846359] flex items-center justify-center text-white font-semibold">
                        S
                      </div>
                      <div className="text-sm">
                        <p className="font-medium">Alex</p>
                        <p className="text-xs opacity-70">
                          Co-founder at Typegrow
                        </p>
                      </div>
                    </div>
                    <button className="bg-[#4db6ac] text-white text-sm px-4 py-2 rounded-full">
                      Swipe ➤
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Right Scroll Button */}
        <button
          onClick={() => scrollBy(1)}
          className="rounded-full absolute right-[-20px] top-1/2 -translate-y-1/2 z-10 bg-blue-500 shadow px-3 py-3  hover:bg-blue-600 text-white"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m8.25 4.5 7.5 7.5-7.5 7.5"
            />
          </svg>
        </button>
      </div>

      <div className="flex gap-5">
        <button className=" hover:bg-[#3f6fff25] text-[#3f6fff] border-2 border-[#3f6fff] text-sm font-semibold rounded-md px-10 py-3 flex gap-2 items-center ">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.5 3.75V16.5L12 14.25 7.5 16.5V3.75m9 0H18A2.25 2.25 0 0 1 20.25 6v12A2.25 2.25 0 0 1 18 20.25H6A2.25 2.25 0 0 1 3.75 18V6A2.25 2.25 0 0 1 6 3.75h1.5m9 0h-9"
            />
          </svg>
          Save Progress
        </button>
        <button className="bg-[#f60] hover:bg-[#e65c00] text-white text-sm font-semibold rounded-md px-10 py-3 flex gap-2 items-center ">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z"
            />
          </svg>
          Schedule
        </button>
        <button
          onClick={downloadPDF}
          className="bg-[#3f6fff] hover:bg-[#3fa2ff] text-white text-sm font-semibold rounded-md px-10 py-3 flex gap-2 items-center "
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
            />
          </svg>
          Download Carousel
        </button>
      </div>
    </div>
  );
}
