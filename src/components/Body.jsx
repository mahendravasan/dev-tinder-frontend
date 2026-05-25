import React from "react"
import NavBar from "./NavBar"
import { Outlet } from "react-router-dom"
import Footer from "./Footer"

const Body = () => {
    return (
        <div className="flex flex-col min-h-screen">
            <NavBar />
            <main className="grow">
                <Outlet />
            </main>
            <Footer />
        </div>
    )
}

export default Body