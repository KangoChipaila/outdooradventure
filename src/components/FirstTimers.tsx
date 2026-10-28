import Navbar from "./Navbar";
import Cart from "./Cart";
import chevron from "../assets/Chevron.png";
import triangle from "../assets/triangle.png";

function FirstTimers(){

    return(
        <>
            <Navbar />
                <section
                    className="relative h-[80vh] bg-cover bg-no-repeat bg-center w-full flex flex-col gap-30 items-center justify-center"
                    style={{backgroundImage: `url(${chevron})`}}>
                        <div className="relative text-white text-4xl font-bold tracking-wide">
                            WELCOME
                        </div>
                        <div className="relative text-black text-3xl font-bold">
                            LET'S GET YOU STARTED
                        </div>
                </section>

                <section className="flex flex-col justify-center items-center pt-9 gap-5">
                    <div className="text-black text-2xl">HELP US HELP YOU BY ANSWERING A FEW QUESTIONS</div>
                    <img src={triangle} sizes="sm"/>
                </section>

                <form className="w-3/4 h-[50vh] flex flex-col items-center justify-center" method="POST" action="">
                    <label htmlFor="activity-type">What type of activity do you plan on doing?</label>
                    <input id="activity-type" name="activity-type" type="text" />
                    
                    <label htmlFor="budget">What is your budget range? </label>
                    <input id="budget" name="budget" type="number" />

                    <label htmlFor="terrain-type">What kind of terrain will you be experiencing?</label>
                    <input id="expected-terrain" name="expected-terrain" type="text"></input>
                </form>
            <Cart />
        </>
    );

}

export default FirstTimers;