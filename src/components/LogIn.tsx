import { useState } from "react";
import { Link } from "react-router-dom";
import loginBackground from "../assets/colin-moldenhauer-RMhgATUx0Cc-unsplash.jpg";

function LogIn(){

    interface LogInForm{
        username: string;
        password: string;
    }

    const [logInData, setLogInData] = useState<LogInForm>({
        username: "",
        password: ""
    });

    return(
        <div className="min-h-screen w-full flex">
            
            <div className="flex flex-col items-center justify-center min-h-full w-full text-white text-3xl font-bold before:absolute before:inset-0 before:bg-black/40 bg-cover"
                style={{backgroundImage: `url(${loginBackground})`}}>
                <p className="relative z-10"></p>
            
                <form action="" className="relative z-10 flex flex-col gap-10 items-center justify-center bg-white/10 backdrop-blur-xs backdrop-saturate-150 text-white font-normal p-5 pt-10 ms-auto me-10 h-3/4 w-1/3 text-sm shadow rounded rounded-2xl">
                    <h2 className="mx-auto font-bold text-3xl mb-10">Log In</h2>
                    <div className="w-3/4 h-1/10 flex flex-col gap-2">
                        <label htmlFor="username"className="me-auto text-lg">Username</label>
                        <input id="username" name="username" type="string" placeholder="Enter your username" className="h-full border-b border-green-300 hover:border-green-400 w-full" />
                    </div>

                    <div className="w-3/4 h-1/10 flex flex-col gap-2">
                        <label htmlFor="password" className="me-auto text-lg">Password</label>
                        <input id="password" name="password" type="password" maxLength={10} placeholder="**********" className="h-full border-b border-green-300 hover:border-green-400 w-full" />
                    </div>
                    <button id="submit" name="submit" type="submit" className="border border-white rounded rounded-lg text-black font-semibold bg-white h-1/12 w-3/7 mx-auto transition duration:700 ease-in-out hover:-translate-y-0.5">Log In</button>
                    <p>Don't have an account? <Link to="/signup" className="font-bold hover:underline">Register here</Link></p>
                </form>
            </div>
        </div>
    );
}

export default LogIn;