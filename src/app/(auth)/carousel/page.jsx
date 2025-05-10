import Settings from "./Settings";
import SwipeBoxes from "./SwipeBoxes";

export default function CarouselMain() {
  return (
    <div className="my-8 mx-20 bg-white">
      <div className="mb-10">
        <h1 className="font-bold text-3xl text-black">Carousel Maker</h1>
        <p className=" text-md text-gray-700">
          Create and schedule high-performing LinkedIn carousel posts in
          seconds.
        </p>
      </div>

      <SwipeBoxes />
      {/* <Settings /> */}
    </div>
  );
}
