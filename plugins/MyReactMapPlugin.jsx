import React from 'react';

const MyReactMapPlugin = () => {
    return (
        <div>
            {/* Embed your React project or use an iframe */}
            <iframe 
                src="http://localhost:3000" 
                title="My React Map"
                style={{ width: "100%", height: "100%", border: "none" }}
            ></iframe>
        </div>
    );
};

export default MyReactMapPlugin;
