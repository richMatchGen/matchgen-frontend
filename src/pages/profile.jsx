// @mui material components
import Grid from "@mui/material/Grid";
import Divider from "@mui/material/Divider";

// @mui icons
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import InstagramIcon from "@mui/icons-material/Instagram";

// Material Dashboard 2 React components
import MDBox from "../components/MDBox";
import MDTypography from "../components/Typography";

// Material Dashboard 2 React example components
import DashboardLayout from "../examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "../examples/Navbars/DashboardNavbar";
import Footer from "../examples/Footer";
import ProfileInfoCard from "../examples/Cards/InfoCards/ProfileInfoCard";
import ProfilesList from "../examples/Lists/ProfilesList";
import DefaultProjectCard from "../examples/Cards/ProjectCards/DefaultProjectCard";

// Overview page components
import Header from "../components/ProfileHeader";
import PlatformSettings from "../components/PlatformSettings";

// Data
import profilesListData from "../layouts/profile/data/profilesListData";

// Images
import homeDecor1 from "../assets/images/home-decor-1.jpg";
import homeDecor2 from "../assets/images/home-decor-2.jpg";
import homeDecor3 from "../assets/images/home-decor-3.jpg";
import homeDecor4 from "../assets/images/home-decor-4.jpeg";
import team1 from "../assets/images/team-1.jpg";
import team2 from "../assets/images/team-2.jpg";
import team3 from "../assets/images/team-3.jpg";
import team4 from "../assets/images/team-4.jpg";

function Overview() {
    return (
        <MDBox>
          <MDBox mt={5} mb={3}>
            <Grid container spacing={1}>
              <Grid item xs={12} md={6} xl={4}>
                <PlatformSettings />
              </Grid>
              <Grid item xs={12} md={6} xl={4} sx={{ display: "flex" }}>
                <Divider orientation="vertical" sx={{ ml: -2, mr: 1 }} />
                <ProfileInfoCard
                  title="profile information"
                  description="Hi, I’m Alec Thompson, Decisions: If you can’t decide, the answer is no..."
                  info={{
                    fullName: "Alec M. Thompson",
                    mobile: "(44) 123 1234 123",
                    email: "alecthompson@mail.com",
                    location: "USA",
                  }}
                  social={[
                    { link: "https://www.facebook.com/CreativeTim/", icon: <FacebookIcon />, color: "facebook" },
                    { link: "https://twitter.com/creativetim", icon: <TwitterIcon />, color: "twitter" },
                    { link: "https://www.instagram.com/creativetimofficial/", icon: <InstagramIcon />, color: "instagram" },
                  ]}
                  action={{ route: "", tooltip: "Edit Profile" }}
                  shadow={false}
                />
                <Divider orientation="vertical" sx={{ mx: 0 }} />
              </Grid>
              <Grid item xs={12} xl={4}>
                <ProfilesList title="conversations" profiles={profilesListData} shadow={false} />
              </Grid>
            </Grid>
          </MDBox>
    
          <MDBox pt={2} px={2} lineHeight={1.25}>
            <MDTypography variant="h6" fontWeight="medium">
              Projects
            </MDTypography>
            <MDBox mb={1}>
              <MDTypography variant="button" color="text">
                Architects design houses
              </MDTypography>
            </MDBox>
          </MDBox>
    
          <MDBox p={2}>
            <Grid container spacing={6}>
              {[homeDecor1, homeDecor2, homeDecor3, homeDecor4].map((image, index) => (
                <Grid item xs={12} md={6} xl={3} key={index}>
                  <DefaultProjectCard
                    image={image}
                    label={`project #${index + 1}`}
                    title={["modern", "scandinavian", "minimalist", "gothic"][index]}
                    description={[
                      "As Uber works through a huge amount of internal management turmoil.",
                      "Music is something that everyone has their own specific opinion about.",
                      "Different people have different taste, and various types of music.",
                      "Why would anyone pick blue over pink? Pink is obviously a better color.",
                    ][index]}
                    action={{
                      type: "internal",
                      route: "/pages/profile/profile-overview",
                      color: "info",
                      label: "view project",
                    }}
                    authors={[
                      { image: team1, name: "Elena Morison" },
                      { image: team2, name: "Ryan Milly" },
                      { image: team3, name: "Nick Daniel" },
                      { image: team4, name: "Peterson" },
                    ]}
                  />
                </Grid>
              ))}
            </Grid>
          </MDBox>
        </MDBox>
      );
    }

export default Overview;
