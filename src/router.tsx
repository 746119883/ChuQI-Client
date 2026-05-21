import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from '@/components/Layout'
import ProtectedRoute from '@/components/ProtectedRoute'
import Login from '@/pages/Login'
import Register from '@/pages/Register'
import Feed from '@/pages/Feed'
import NoteList from '@/pages/NoteList'
import NoteDetail from '@/pages/NoteDetail'
import NoteForm from '@/pages/NoteForm'
import Photos from '@/pages/Photos'
import AlbumDetail from '@/pages/AlbumDetail'
import Lists from '@/pages/Lists'
import ListDetail from '@/pages/ListDetail'
import Calendar from '@/pages/Calendar'
import Vault from '@/pages/Vault'

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route index element={<Feed />} />
          <Route path="notes" element={<NoteList />} />
          <Route path="notes/new" element={<NoteForm />} />
          <Route path="notes/:id" element={<NoteDetail />} />
          <Route path="notes/:id/edit" element={<NoteForm />} />
          <Route path="photos" element={<Photos />} />
          <Route path="photos/albums/:id" element={<AlbumDetail />} />
          <Route path="lists" element={<Lists />} />
          <Route path="lists/:id" element={<ListDetail />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="vault" element={<Vault />} />
          <Route path="vault/folders/:id" element={<Vault />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
