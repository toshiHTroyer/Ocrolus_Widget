import { useEffect } from 'react'
import { Box } from '@mui/material'
import Sidebar from 'Components/Sidebar'
import IncomePrompt from 'Components/IncomePrompt'
import './App.css'
import Module from 'Components/Module'

declare global {
   interface Window {
       getAuthToken?: () => Promise<string>;
       ocrolus_script: any;
   }
}

function App() {
   // Set up getAuthToken
   useEffect(() => {
       window.getAuthToken = async function() {
           const response = await fetch("http://localhost:8000/token", {
               method: "POST"
           });
           const json = await response.json();
           return json.accessToken;
       };

       return () => {
           delete window.getAuthToken;
       }
   }, []);

   // Initialize widget
   useEffect(() => {
       if (window.ocrolus_script) {
           window.ocrolus_script('init');
       }
   }, []);

   return (
       <Box sx={{ display: 'flex' }}>
           <Sidebar />
           <Box component="main" className="content-column" sx={{ flexGrow: 1, p: 3 }}>
               <IncomePrompt />
               <Module>
                   <Box id="ocrolus-widget-frame"></Box>
               </Module>
           </Box>
       </Box>
   )
}

export default App