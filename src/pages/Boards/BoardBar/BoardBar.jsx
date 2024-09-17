/* eslint-disable react/prop-types */
import Box from "@mui/material/Box";
import Chip from '@mui/material/Chip';
import DashboardIcon from '@mui/icons-material/Dashboard';
import VpnLockIcon from '@mui/icons-material/VpnLock';
import AddToDriveIcon from '@mui/icons-material/AddToDrive';
import BoltIcon from '@mui/icons-material/Bolt';
import FilterListIcon from '@mui/icons-material/FilterList';
import Avatar from '@mui/material/Avatar';
import AvatarGroup from '@mui/material/AvatarGroup';
import Tooltip from "@mui/material/Tooltip";
import Button from "@mui/material/Button";
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { capitalizeFirstLetter } from "~/utils/formatters";

const MENU_STYLES = {
  color: 'primary.main', 
  bgcolor: 'transparent', 
  border: 'none', 
  paddingX: '5px', 
  borderRadius: '4px', 
  '& .MuiSvgIcon-root': {
    color: 'primary.main'
  },
  '&:hover':{
    bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#2f3640' : 'primary.50')
  }
}

function BoardBar({ board }) {

  return (
    <Box sx={{
      width: '100%',
      height: (theme) => theme.taskbroad.boardBarHeight,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 2,
      paddingX: 2,
      overflowX: 'auto',
      bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#1f1f1f' : '#f2f2f2')

    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2}}>
        <Chip 
        icon={<DashboardIcon />} 
        label={board?.title}
        sx={MENU_STYLES}
        clickable/>
        <Chip 
        icon={<VpnLockIcon />} 
        label={capitalizeFirstLetter(board?.type)}
        sx={MENU_STYLES}
        clickable/>
        <Chip 
        icon={<AddToDriveIcon />} 
        label="Add To Google Drive" 
        sx={MENU_STYLES}
        clickable/>
        <Chip 
        icon={<BoltIcon />} 
        label="Automation" 
        sx={MENU_STYLES}
        clickable/>
        <Chip 
        icon={<FilterListIcon />} 
        label="Filters" 
        sx={MENU_STYLES}
        clickable/>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2}}>
        <Button variant="outlined" startIcon={<PersonAddIcon />}>Invite</Button>
        <AvatarGroup 
        max={4}
        sx={{
          gap: '10px',
          '& .MuiAvatar-root': {
            width: '34px',
            height: '34px',
            fontSize: '16',
            color: 'white',
            cursor: 'pointer',
            '&:first-of-type': { bgcolor: '#9c27b0' }
          },
        }}
        >
          <Tooltip title="DucHieu">
            <Avatar alt="DucHieu" src="https://static.topcv.vn/user_avatars/FE71NtYJRczqPB69Niym_66d82b44d4450_av.jpg" />
          </Tooltip>
          <Tooltip title="Remy Sharp">
            <Avatar alt="Remy Sharp" src="https://bestfriends.org/sites/default/files/styles/hero_mobile/public/hero-dash/Asana3808_Dashboard_Standard.jpg?h=ebad9ecf&itok=cWevo33k" />
          </Tooltip>
          <Tooltip title="Travis Howard">
            <Avatar alt="Travis Howard" src="https://www.thesprucepets.com/thmb/hxWjs7evF2hP1Fb1c1HAvRi_Rw0=/2765x0/filters:no_upscale():strip_icc()/chinese-dog-breeds-4797219-hero-2a1e9c5ed2c54d00aef75b05c5db399c.jpg" />
          </Tooltip>
          <Avatar alt="Cindy Baker" src="/static/images/avatar/3.jpg" />
          <Avatar alt="Agnes Walker" src="/static/images/avatar/4.jpg" />
          <Avatar alt="Trevor Henderson" src="/static/images/avatar/5.jpg" />
        </AvatarGroup>
      </Box>
    </Box>
  )
}

export default BoardBar
