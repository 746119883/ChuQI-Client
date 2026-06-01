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
import VaultShared from '@/pages/VaultShared'
import Profile from '@/pages/Profile'
import Family from '@/pages/Family'
import Recipes from '@/pages/Recipes'
import RecipeDetail from '@/pages/RecipeDetail'
import RecipeForm from '@/pages/RecipeForm'
import Ledger from '@/pages/Ledger'
import Trips from '@/pages/Trips'
import TripDetail from '@/pages/TripDetail'
import TripForm from '@/pages/TripForm'
import Timeline from '@/pages/Timeline'
import Meals from '@/pages/Meals'
import Stories from '@/pages/Stories'
import StoryDetail from '@/pages/StoryDetail'
import StoryForm from '@/pages/StoryForm'
import Health from '@/pages/Health'
import HealthProfilePage from '@/pages/HealthProfilePage'
import HealthProfileEditPage from '@/pages/HealthProfileEditPage'
import HealthSnapshotPage from '@/pages/HealthSnapshotPage'
import CheckupsPage from '@/pages/CheckupsPage'
import CheckupResultPage from '@/pages/CheckupResultPage'
import MetricsHistoryPage from '@/pages/MetricsHistoryPage'
import VaccinesPage from '@/pages/VaccinesPage'
import VaccineRecordPage from '@/pages/VaccineRecordPage'
import VisitsPage from '@/pages/VisitsPage'
import VisitFormPage from '@/pages/VisitFormPage'
import VisitDetailPage from '@/pages/VisitDetailPage'
import HealthSettingsPage from '@/pages/HealthSettingsPage'

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/register/:code" element={<Register />} />

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
          <Route path="vault/shared" element={<VaultShared />} />
          <Route path="vault/shared/folders/:id" element={<VaultShared />} />
          <Route path="meals" element={<Meals />} />
          <Route path="recipes" element={<Recipes />} />
          <Route path="recipes/new" element={<RecipeForm />} />
          <Route path="recipes/:id" element={<RecipeDetail />} />
          <Route path="recipes/:id/edit" element={<RecipeForm />} />
          <Route path="ledger" element={<Ledger />} />
          <Route path="trips" element={<Trips />} />
          <Route path="trips/new" element={<TripForm />} />
          <Route path="trips/:id" element={<TripDetail />} />
          <Route path="trips/:id/edit" element={<TripForm />} />
          <Route path="stories" element={<Stories />} />
          <Route path="stories/new" element={<StoryForm />} />
          <Route path="stories/:id" element={<StoryDetail />} />
          <Route path="timeline" element={<Timeline />} />
          <Route path="health" element={<Health />} />
          <Route path="health/settings" element={<HealthSettingsPage />} />
          <Route path="health/:userId" element={<HealthProfilePage />} />
          <Route path="health/:userId/edit" element={<HealthProfileEditPage />} />
          <Route path="health/:userId/snapshot" element={<HealthSnapshotPage />} />
          <Route path="health/:userId/checkups" element={<CheckupsPage />} />
          <Route path="health/:userId/checkups/:planId/result" element={<CheckupResultPage />} />
          <Route path="health/:userId/metrics" element={<MetricsHistoryPage />} />
          <Route path="health/:userId/vaccines" element={<VaccinesPage />} />
          <Route path="health/:userId/vaccines/:planId/record" element={<VaccineRecordPage />} />
          <Route path="health/:userId/visits" element={<VisitsPage />} />
          <Route path="health/:userId/visits/new" element={<VisitFormPage />} />
          <Route path="health/:userId/visits/:visitId" element={<VisitDetailPage />} />
          <Route path="health/:userId/visits/:visitId/edit" element={<VisitFormPage />} />
          <Route path="profile" element={<Profile />} />
          <Route path="family" element={<Family />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
