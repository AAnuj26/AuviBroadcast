import VideoCard from "../../components/VideoCard/VideoCard";
import Styles from "./videoListingPage.module.scss";
import SideBar from "../../components/Sidebar/Sidebar";
const VideoListingPage = () => {
  return (
    <>
      <div className={Styles.Categories}>
        <section className={Styles.CategoryButtons}>
          <button className="active"> All</button>
          <button> Category 1</button>
          <button> Category 2</button>
          <button> Category 3</button>
          <button> Category 4</button>
          <button> Category 5</button>
          <button> Category 6</button>
          <button> Category 7</button>
          <button> Category 8</button>
          <button> Category 9 </button>
        </section>
      </div>
      <div>
        <section className={Styles.VideoListingPage}>
          <VideoCard />
          <VideoCard />
          <VideoCard />
          <VideoCard />
          <VideoCard />
          <VideoCard />
          <VideoCard />
          <VideoCard />
        </section>
      </div>
    </>
  );
};

export default VideoListingPage;
