export interface User {
  id: number
  username: string
}

export interface Note {
  id: number
  title: string
  content: string
  author: User
  created_at: string
  updated_at: string
}

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export interface MomentImage {
  id: number
  image: string
  order: number
}

export type Visibility = 'family' | 'private'

export interface Moment {
  id: number
  author: User
  content: string
  visibility: Visibility
  images: MomentImage[]
  reactions_count: number
  comments_count: number
  liked_by_me: boolean
  created_at: string
  updated_at: string
}

export interface Comment {
  id: number
  author: User
  content: string
  created_at: string
}

export interface Album {
  id: number
  name: string
  description: string
  owner: User
  cover_thumbnail: string | null
  photo_count: number
  video_count: number
  created_at: string
  updated_at: string
}

export interface Photo {
  type: 'photo'
  id: number
  uploader: User
  album: number | null
  image: string
  thumbnail: string
  width: number
  height: number
  size_bytes: number
  caption: string
  taken_at: string | null
  uploaded_at: string
}

export interface Video {
  type: 'video'
  id: number
  uploader: User
  album: number | null
  file: string
  poster: string
  width: number
  height: number
  duration: number
  size_bytes: number
  caption: string
  taken_at: string | null
  uploaded_at: string
}

export type MediaItem = Photo | Video

export interface TaskList {
  id: number
  name: string
  description: string
  is_shared: boolean
  owner: User
  total: number
  done: number
  created_at: string
  updated_at: string
}

export interface Task {
  id: number
  list: number
  title: string
  completed: boolean
  completed_at: string | null
  completed_by: User | null
  created_by: User | null
  created_at: string
  updated_at: string
}

export type EventType = 'general' | 'birthday' | 'anniversary' | 'memorial' | 'holiday'

export interface CalendarEvent {
  id: number
  owner: User
  title: string
  description: string
  event_type: EventType
  color: string
  visibility: Visibility
  is_lunar: boolean
  date_year: number | null
  date_month: number
  date_day: number
  all_day: boolean
  start_time: string | null
  end_time: string | null
  yearly_recurring: boolean
  remind_days_before: number | null
  created_at: string
  updated_at: string
}

export interface EventOccurrence {
  date: string         // YYYY-MM-DD 公历
  lunar_label: string  // 例如 "五月初一"
  event: CalendarEvent
}

export interface VaultFolderBrief {
  id: number
  name: string
}

export interface VaultFolder {
  id: number
  name: string
  parent: number | null
  visibility: Visibility
  description: string
  owner: User
  item_count: number
  ancestors: VaultFolderBrief[]
  created_at: string
  updated_at: string
}

export interface VaultFile {
  id: number
  uploader: User
  folder: number | null
  file: string
  name: string
  size_bytes: number
  mime_type: string
  is_important: boolean
  visibility: Visibility
  description: string
  expires_at: string | null
  created_at: string
  updated_at: string
}
