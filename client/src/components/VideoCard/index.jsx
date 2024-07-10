// import anujPhoto from "../../assets/anuj-photo.jpg";
// import menu2 from "../../assets/menu2.svg";
const VideoCard = () => {
  return (
    <>
      <article className="VideoCardContainer">
        <a href="#" data-duration="12:24">
          <img
            src="http://unsplash.it/250/150?gravity=center"
            alt="thumbnail"
          />
        </a>
        <div>
          <a href="#">
            <img src="http://unsplash.it/36/36?gravity=center" alt="" />
          </a>
          <div>
            <a href="#">Video Title</a>
            <a href="#">Channel Name</a>
            <div>
              <span>12K Views</span>
              {/* <span>&middot;</span> */}⦁<span>1 Week Ago</span>
            </div>
          </div>
        </div>
      </article>
    </>
  );
};

export default VideoCard;
