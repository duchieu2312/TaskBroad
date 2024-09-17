import Box from "@mui/material/Box";
import ModeSelect from "~/components/ModeSelect/ModeSelect";
import AppsIcon from '@mui/icons-material/Apps';
import ListAltIcon from '@mui/icons-material/ListAlt';
import Typography from "@mui/material/Typography";
import Workspaces from "./Menus/Workspaces";
import Recent from "./Menus/Recent";
import Templates from "./Menus/Templates";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Badge from '@mui/material/Badge';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import Tooltip from '@mui/material/Tooltip';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import Profile from "./Menus/Profiles";
import LibraryAddIcon from '@mui/icons-material/LibraryAdd';

function AppBar() {
  return (
    <Box sx={{
      width: '100%',
      height: (theme) => theme.taskbroad.appBarHeight,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 2,
      paddingX: 2,
      overflowX: 'auto',
      bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#000000' : '#fffffff')
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2}}>
        <AppsIcon sx={{color: 'primary.main', cursor: "pointer"}}/>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25}}>
          <ListAltIcon sx={{color: 'primary.main'}}/>
          <Typography variant="span" sx={{fontSize: '1.2rem', fontWeight: 'bold', color: 'primary.main'}}>
            TaskBoard
          </Typography>
        </Box>
        <Box sx={{ display: {xs: 'none', md: 'flex'}, gap: 1}}>
          <Workspaces />
          <Recent />
          <Templates />
          <Button variant="outlined" startIcon={<LibraryAddIcon />}>Create</Button>
        </Box>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2}}>
        <TextField id="outlined-search" label="Search field" type="search" size="small" sx={{minWidth: '120px'}}/>
        <ModeSelect />
        <Tooltip title="Notification">
          <Badge color="secondary" variant="dot" sx={{color:"primary.main", cursor: "pointer"}}>
            <NotificationsNoneIcon />
          </Badge>
        </Tooltip>
        <Tooltip title="Help">
          <HelpOutlineIcon sx={{color:"primary.main", cursor: "pointer"}}/>
        </Tooltip>
        <Profile />
      </Box>
    </Box>
  )
}

export default AppBar
