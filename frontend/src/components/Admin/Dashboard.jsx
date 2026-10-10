import { useEffect, useState } from 'react';
import Sidebar from './Sidebar/Sidebar';
import MenuIcon from '@mui/icons-material/Menu';

const Dashboard = ({ activeTab, children }) => {

    const [onMobile, setOnMobile] = useState(false);
    const [toggleSidebar, setToggleSidebar] = useState(false);

    useEffect(() => {
        const updateLayout = () => {
            const mobile = window.innerWidth < 640;
            setOnMobile(mobile);
            if (!mobile) setToggleSidebar(false);
        };

        updateLayout();
        window.addEventListener('resize', updateLayout);
        return () => window.removeEventListener('resize', updateLayout);
    }, []);

    return (
        <>
            <main className="flex min-h-screen mt-14 sm:min-w-full">

                {!onMobile && <Sidebar activeTab={activeTab} />}
                {toggleSidebar && <Sidebar activeTab={activeTab} setToggleSidebar={setToggleSidebar}/>}

                <div className="w-full min-w-0 sm:ml-[20%] sm:w-4/5 min-h-screen">
                    <div className="flex min-w-0 flex-col gap-6 p-2 pb-6 sm:p-8">
                        <button onClick={() => setToggleSidebar(true)} aria-expanded={toggleSidebar} className="sm:hidden bg-gray-700 w-10 h-10 rounded-full shadow text-white flex items-center justify-center"><MenuIcon /></button>
                        {children}
                    </div>
                </div>
            </main>
        </>
    );
};

export default Dashboard;
