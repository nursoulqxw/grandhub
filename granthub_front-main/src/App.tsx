import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useState } from 'react'
import Sidebar from './components/Sidebar'
import TopBar from './components/TopBar'
import Dashboard from './pages/Dashboard'
import Auth from './pages/Auth'
import Profile from './pages/Profile'
import Landing from "./pages/Landing.tsx";

export default function App() {
    const [search, setSearch] = useState('')

    return (
        <BrowserRouter>
            <Routes>

                <Route path="/"      element={<Landing />} />
                <Route path="/auth"  element={<Auth />} />

                <Route path="/*" element={
                    <div className="flex h-screen bg-[#07111f] overflow-hidden">
                        <Sidebar />
                        <div className="flex-1 flex flex-col overflow-hidden">
                            <TopBar search={search} onSearch={setSearch} />
                            <Routes>
                                <Route path="/dashboard"  element={<Dashboard search={search} />} />
                                <Route path="/profile"    element={<Profile />} />
                            </Routes>
                        </div>
                    </div>
                } />

            </Routes>
        </BrowserRouter>
    )
}