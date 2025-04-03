import { useState } from "react";

// @mui material components
import Card from "@mui/material/Card";
import Switch from "@mui/material/Switch";

// Material Dashboard 2 React components
import MDBox from "../components/MDBox";
import Typography from "../components/Typography";

function PlatformSettings() {
  const [followsMe, setFollowsMe] = useState(true);
  const [answersPost, setAnswersPost] = useState(false);
  const [mentionsMe, setMentionsMe] = useState(true);
  const [newLaunches, setNewLaunches] = useState(false);
  const [productUpdate, setProductUpdate] = useState(true);
  const [newsletter, setNewsletter] = useState(false);

  return (
    <Card sx={{ boxShadow: "none" }}>
      <MDBox p={2}>
        <Typography variant="h6" fontWeight="medium" textTransform="capitalize">
          platform settings
        </Typography>
      </MDBox>
      <MDBox pt={1} pb={2} px={2} lineHeight={1.25}>
        <Typography variant="caption" fontWeight="bold" color="text" textTransform="uppercase">
          account
        </Typography>

        <MDBox display="flex" alignItems="center" mb={0.5} ml={-1.5}>
          <MDBox mt={0.5}>
            <Switch checked={followsMe} onChange={() => setFollowsMe(!followsMe)} />
          </MDBox>
          <MDBox width="80%" ml={0.5}>
            <Typography variant="button" fontWeight="regular" color="text">
              Email me when someone follows me
            </Typography>
          </MDBox>
        </MDBox>

        <MDBox display="flex" alignItems="center" mb={0.5} ml={-1.5}>
          <MDBox mt={0.5}>
            <Switch checked={answersPost} onChange={() => setAnswersPost(!answersPost)} />
          </MDBox>
          <MDBox width="80%" ml={0.5}>
            <Typography variant="button" fontWeight="regular" color="text">
              Email me when someone answers on my post
            </Typography>
          </MDBox>
        </MDBox>

        <MDBox display="flex" alignItems="center" mb={0.5} ml={-1.5}>
          <MDBox mt={0.5}>
            <Switch checked={mentionsMe} onChange={() => setMentionsMe(!mentionsMe)} />
          </MDBox>
          <MDBox width="80%" ml={0.5}>
            <Typography variant="button" fontWeight="regular" color="text">
              Email me when someone mentions me
            </Typography>
          </MDBox>
        </MDBox>

        <MDBox mt={3}>
          <Typography variant="caption" fontWeight="bold" color="text" textTransform="uppercase">
            application
          </Typography>
        </MDBox>

        <MDBox display="flex" alignItems="center" mb={0.5} ml={-1.5}>
          <MDBox mt={0.5}>
            <Switch checked={newLaunches} onChange={() => setNewLaunches(!newLaunches)} />
          </MDBox>
          <MDBox width="80%" ml={0.5}>
            <Typography variant="button" fontWeight="regular" color="text">
              New launches and projects
            </Typography>
          </MDBox>
        </MDBox>

        <MDBox display="flex" alignItems="center" mb={0.5} ml={-1.5}>
          <MDBox mt={0.5}>
            <Switch checked={productUpdate} onChange={() => setProductUpdate(!productUpdate)} />
          </MDBox>
          <MDBox width="80%" ml={0.5}>
            <Typography variant="button" fontWeight="regular" color="text">
              Monthly product updates
            </Typography>
          </MDBox>
        </MDBox>

        <MDBox display="flex" alignItems="center" mb={0.5} ml={-1.5}>
          <MDBox mt={0.5}>
            <Switch checked={newsletter} onChange={() => setNewsletter(!newsletter)} />
          </MDBox>
          <MDBox width="80%" ml={0.5}>
            <Typography variant="button" fontWeight="regular" color="text">
              Subscribe to newsletter
            </Typography>
          </MDBox>
        </MDBox>
      </MDBox>
    </Card>
  );
}

export default PlatformSettings;
