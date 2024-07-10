import { useRoutes } from "react-router-dom";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar/Navbar.jsx";
import SideBar from "../components/SideBar";
import { VideoListingPage, ChannelPage } from "../pages";

const Layout = () => {
  return (
    <>
      <header>
        <Navbar />
      </header>
      <main>
        <SideBar />
        <Outlet />
      </main>
    </>
  );
};

const ProjectRoutes = () => {
  let element = useRoutes([
    {
      path: "/",
      element: <Layout />,
      children: [
        {
          path: "/",
          element: <VideoListingPage />,
        },

        {
          path: "/channel",
          element: <ChannelPage />,
        },
      ],
    },
  ]);

  return element;
};

export default ProjectRoutes;
