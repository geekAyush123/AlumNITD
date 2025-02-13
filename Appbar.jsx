// export const Appbar = () => {
//     return (
//         <div className="shadow h-14 flex justify-between items-center bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-4">
//             <div className="text-2xl font-bold tracking-wider">
//                 PayWal
//             </div>
//             <div className="flex items-center space-x-4">
//                 <div className="text-lg">
//                     Hey
//                 </div>
//                 <div className="rounded-full h-12 w-12 bg-slate-200 text-gray-800 flex justify-center items-center text-xl shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer">
//                     U
//                 </div>
//             </div>
//         </div>
//     );
// }

import { useState, useEffect } from "react";
import axios from "axios";

export const Appbar = () => {
    const [firstName, setFirstName] = useState("U");

    useEffect(() => {
        const fetchUserDetails = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    console.log("No token found. User is not authenticated.");
                    return;
                }

                const response = await axios.get('http://localhost:3000/api/v1/user/me', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                setFirstName(response.data.firstName);

            } catch (error) {
                console.error("Failed to fetch user details:", error);
            }
        };

        fetchUserDetails();
    }, []);

    return (
        <div className="shadow h-14 flex justify-between items-center bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-4">
            <div className="text-2xl font-bold tracking-wider">
                PayWal
            </div>
            <div className="flex items-center space-x-4">
                <div className="text-lg">
                    Hey
                </div>
                <div className="rounded-full h-12 w-12 bg-slate-200 text-gray-800 flex justify-center items-center text-xl shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer">
                    {firstName[0].toUpperCase()+firstName[1]+firstName[2]}
                </div>
            </div>
        </div>
    );
}
