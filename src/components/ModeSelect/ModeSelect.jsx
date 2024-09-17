import { useColorScheme } from "@mui/material/styles";
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Box from "@mui/material/Box";
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import SystemModeIcon from '@mui/icons-material/Brightness4';

function ModeSelect() {
    const { mode, setMode } = useColorScheme();
    if (!mode) {
      return null;
    }
    return (
    <FormControl sx={{ minWidth: 131.95}} size="small">
      <InputLabel id="label-select-light-dark-mode">Mode</InputLabel>
        <Select value={mode} label="Mode" onChange={(event) => setMode(event.target.value)}>
          <MenuItem value="system"><Box sx={{ display:'flex', alignItems:'center', gap: 1}}><SystemModeIcon/>System</Box></MenuItem>
          <MenuItem value="light"><Box sx={{ display:'flex', alignItems:'center', gap: 1}}><LightModeIcon/>Light</Box></MenuItem>
          <MenuItem value="dark"><Box sx={{ display:'flex', alignItems:'center', gap: 1}}><DarkModeIcon/>Dark</Box></MenuItem>
        </Select>
      </FormControl>
    );
  }  

export default ModeSelect
