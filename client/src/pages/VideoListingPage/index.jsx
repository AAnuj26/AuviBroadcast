import { CategoryPills, VideoCard } from "../../components";

export default function VideoListingPage() {
  return (
    <>
      <div className="VideoListingPageContainer">
        <h1 className="vid">Video Listing Page</h1>
        <CategoryPills />
        <VideoCard />
      </div>
    </>
  );
}
