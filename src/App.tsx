import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from '@/components/Layout'
import Home from '@/pages/Home'
import Reception from '@/pages/Reception'
import Profile from '@/pages/Profile'
import Risk from '@/pages/Risk'
import Triage from '@/pages/Triage'
import Review from '@/pages/Review'

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/reception" element={<Reception />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/risk" element={<Risk />} />
          <Route path="/triage" element={<Triage />} />
          <Route path="/review" element={<Review />} />
        </Route>
      </Routes>
    </Router>
  )
}
