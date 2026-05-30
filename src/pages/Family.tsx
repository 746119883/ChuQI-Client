import { useState, type FormEvent } from 'react'
import {
  useCreateInvitation,
  useInvitations,
  useMe,
  useMembers,
  useRevokeInvitation,
  useUpdateMember,
} from '@/hooks/useAuth'
import type { Role } from '@/lib/types'

const ROLE_LABEL: Record<Role, string> = {
  admin: '家长',
  member: '成员',
  elder: '老人',
}

const STATUS_LABEL: Record<string, { text: string; cls: string }> = {
  active: { text: '可用', cls: 'bg-emerald-50 text-emerald-700' },
  used: { text: '已使用', cls: 'bg-slate-100 text-slate-500' },
  revoked: { text: '已撤销', cls: 'bg-rose-50 text-rose-600' },
  expired: { text: '已过期', cls: 'bg-amber-50 text-amber-700' },
}

export default function Family() {
  const { data: me } = useMe()
  const isAdmin = me?.profile?.role === 'admin'

  const { data: members = [] } = useMembers()
  const { data: invitations = [] } = useInvitations()

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-xl font-semibold text-slate-900 mb-4">家庭成员</h1>
        <div className="bg-white rounded-2xl shadow-sm divide-y">
          {members.map((m) => (
            <MemberRow key={m.id} member={m} isAdmin={isAdmin} selfId={me?.id} />
          ))}
        </div>
      </section>

      {isAdmin && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-slate-900">邀请管理</h2>
          </div>
          <InviteForm />
          <div className="mt-4 bg-white rounded-2xl shadow-sm divide-y">
            {invitations.length === 0 && (
              <div className="p-4 text-sm text-slate-500">还没有邀请</div>
            )}
            {invitations.map((inv) => (
              <InvitationRow key={inv.id} inv={inv} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function MemberRow({
  member,
  isAdmin,
  selfId,
}: {
  member: import('@/lib/types').Member
  isAdmin: boolean
  selfId?: number
}) {
  const update = useUpdateMember()
  const isSelf = member.id === selfId
  const canEdit = isAdmin && !isSelf && !member.is_superuser

  return (
    <div className="p-4 flex items-center gap-4">
      <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center text-slate-500">
        {member.avatar_url ? (
          <img src={member.avatar_url} alt="" className="w-full h-full object-cover" />
        ) : (
          member.display_name.slice(0, 1)
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-slate-900 truncate">
          {member.display_name}
          {member.is_superuser && (
            <span className="ml-2 text-xs text-amber-600">superuser</span>
          )}
          {!member.is_active && (
            <span className="ml-2 text-xs text-rose-600">已禁用</span>
          )}
        </div>
        <div className="text-xs text-slate-500">
          @{member.username} · {ROLE_LABEL[member.profile?.role ?? 'member']}
          {member.profile?.relation && ` · ${member.profile.relation}`}
        </div>
      </div>
      {canEdit && (
        <div className="flex items-center gap-2">
          <select
            value={member.profile?.role ?? 'member'}
            onChange={(e) =>
              update.mutate({ id: member.id, role: e.target.value as Role })
            }
            disabled={update.isPending}
            className="text-xs border border-slate-200 rounded px-2 py-1"
          >
            <option value="admin">家长</option>
            <option value="member">成员</option>
            <option value="elder">老人</option>
          </select>
          <button
            type="button"
            onClick={() =>
              update.mutate({ id: member.id, is_active: !member.is_active })
            }
            disabled={update.isPending}
            className="text-xs text-slate-500 hover:text-rose-600"
          >
            {member.is_active ? '禁用' : '启用'}
          </button>
        </div>
      )}
    </div>
  )
}

function InviteForm() {
  const create = useCreateInvitation()
  const [role, setRole] = useState<Role>('member')
  const [nickname, setNickname] = useState('')
  const [note, setNote] = useState('')

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    create.mutate(
      { role, default_nickname: nickname, note },
      {
        onSuccess: () => {
          setNickname('')
          setNote('')
        },
      },
    )
  }

  return (
    <form
      onSubmit={onSubmit}
      className="bg-white rounded-2xl shadow-sm p-4 grid grid-cols-1 sm:grid-cols-4 gap-3 items-end"
    >
      <div>
        <label className="text-xs text-slate-500 block">角色</label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as Role)}
          className="w-full mt-1 text-sm border border-slate-200 rounded px-2 py-1.5"
        >
          <option value="member">成员</option>
          <option value="admin">家长</option>
          <option value="elder">老人</option>
        </select>
      </div>
      <div>
        <label className="text-xs text-slate-500 block">预填昵称</label>
        <input
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          maxLength={50}
          placeholder="妈妈"
          className="w-full mt-1 text-sm border border-slate-200 rounded px-2 py-1.5"
        />
      </div>
      <div>
        <label className="text-xs text-slate-500 block">备注</label>
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={100}
          placeholder="给妈妈的"
          className="w-full mt-1 text-sm border border-slate-200 rounded px-2 py-1.5"
        />
      </div>
      <button
        type="submit"
        disabled={create.isPending}
        className="px-3 py-2 bg-slate-900 text-white text-sm rounded hover:bg-slate-700 disabled:opacity-50"
      >
        {create.isPending ? '生成中...' : '生成邀请码'}
      </button>
    </form>
  )
}

function InvitationRow({ inv }: { inv: import('@/lib/types').Invitation }) {
  const revoke = useRevokeInvitation()
  const status = STATUS_LABEL[inv.status] ?? STATUS_LABEL.active
  const link = `${window.location.origin}/register/${inv.code}`
  const [copied, setCopied] = useState(false)

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="p-4 flex items-center gap-4">
      <div className="font-mono text-base tracking-widest text-slate-900">
        {inv.code}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs text-slate-500 truncate">
          {ROLE_LABEL[inv.role]}
          {inv.default_nickname && ` · 昵称: ${inv.default_nickname}`}
          {inv.note && ` · ${inv.note}`}
        </div>
        <div className="text-xs text-slate-400 mt-0.5">
          {inv.status === 'used' && inv.used_by
            ? `已被 ${inv.used_by.display_name ?? inv.used_by.username} 使用`
            : `${new Date(inv.expires_at).toLocaleString()} 过期`}
        </div>
      </div>
      <span className={`text-xs px-2 py-0.5 rounded ${status.cls}`}>
        {status.text}
      </span>
      {inv.status === 'active' && (
        <>
          <button
            type="button"
            onClick={onCopy}
            className="text-xs text-blue-600 hover:underline"
          >
            {copied ? '已复制' : '复制链接'}
          </button>
          <button
            type="button"
            onClick={() => {
              if (confirm(`撤销邀请码 ${inv.code}?`)) revoke.mutate(inv.id)
            }}
            disabled={revoke.isPending}
            className="text-xs text-rose-600 hover:underline"
          >
            撤销
          </button>
        </>
      )}
    </div>
  )
}
