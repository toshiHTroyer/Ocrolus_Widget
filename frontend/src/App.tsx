import { useEffect, useState } from 'react'
import { Box, Input, Button } from '@mui/material'
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
    const [userKey, setUserKey] = useState('default-user')
    const [bookName, setBookName] = useState('Widget Book')

    // Set up getAuthToken immediately
    useEffect(() => {
        window.getAuthToken = async function() {
            const response = await fetch("http://localhost:8000/token", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: userKey,
                    bookName: bookName
                })
            });

            const json = await response.json();
            return json.access_token;
        };

        return () => {
            delete window.getAuthToken;
        };
    }, [userKey, bookName]);

    const handleRefreshToken = async () => {
        try {
            if (window.getAuthToken) {
                const token = await window.getAuthToken();
                console.log('Token refreshed:', token);
            }
        } catch (error) {
            console.error('Error refreshing token:', error);
        }
    };

    return (
        <Box sx={{ display: 'flex' }}>
            <Sidebar />
            <Box component="main" className="content-column" sx={{ flexGrow: 1, p: 3 }}>
                <IncomePrompt />
                <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                    <Input
                        style={{ marginRight: '15px' }}
                        type="text"
                        placeholder="Enter User Key"
                        value={userKey}
                        onChange={(e) => setUserKey(e.target.value)}
                    />
                    <Input
                        style={{ marginRight: '15px' }}
                        type="text"
                        placeholder="Enter Book Name"
                        value={bookName}
                        onChange={(e) => setBookName(e.target.value)}
                    />
                    <Button 
                        onClick={handleRefreshToken}
                        variant="contained"
                    >
                        Refresh Token
                    </Button>
                </Box>
                <Module>
                    <Box 
                        id="ocrolus-widget-frame" 
                        sx={{ 
                            width: '100%',
                            height: '500px',
                            border: '1px solid #e0e0e0',
                            borderRadius: '4px'
                        }}
                    />
                </Module>
            </Box>
        </Box>
    )
}

export default App