import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from '../layout'
import App from '../App'
import Records from '../pages/records'
import SignUp from '@/pages/signUp'
import SignIn from '@/pages/signin'
import LoadingSamples from '@/pages/loadingSamples'

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<App />} />
          <Route path="records" element={<Records />} />
          <Route path="sign-up" element={<SignUp />} />
          <Route path="sign-in" element={<SignIn />} />
          <Route path="loading-samples" element={<LoadingSamples />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
