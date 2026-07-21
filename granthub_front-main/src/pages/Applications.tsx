import { useCallback, useEffect, useState } from 'react'
import { FileText, Send, PencilLine, Lock, Trash2, ArrowUpRight, Calendar, MapPin, Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuthContext } from '../context/AuthContext'
import {
    fetchApplications, updateApplication, deleteApplication,
    type ApplicationEntry, type ApplicationStatus,
} from '../services/api'
import { typeLabels } from '../types'

const meta: Record<ApplicationStatus, { title: string; icon: React.ElementType; empty: string }> = {
    active:    { title: 'Активные заявки',  icon: FileText,   empty: 'Здесь появятся заявки, над которыми вы работаете' },
    submitted: { title: 'Поданные заявки',  icon: Send,       empty: 'Здесь появятся заявки, которые вы уже отправили' },
    draft:     { title: 'Черновики',        icon: PencilLine, empty: 'Здесь появятся сохранённые черновики заявок' },
}

// куда можно перевести заявку из текущего статуса
const transitions: Record<ApplicationStatus, { to: ApplicationStatus; label: string }[]> = {
    draft:     [{ to: 'active', label: 'В работу' }, { to: 'submitted', label: 'Отметить поданной' }],
    active:    [{ to: 'submitted', label: 'Отметить поданной' }, { to: 'draft', label: 'В черновики' }],
    submitted: [{ to: 'active', label: 'Вернуть в работу' }],
}

export default function Applications({ status }: { status: ApplicationStatus }) {
    const { isAuthenticated, token } = useAuthContext()
    const [items, setItems]     = useState<ApplicationEntry[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError]     = useState<string | null>(null)
    const [busyId, setBusyId]   = useState<number | null>(null)

    const load = useCallback(async () => {
        if (!token) return
        setLoading(true)
        setError(null)
        try {
            setItems(await fetchApplications(token, status))
        } catch {
            setError('Не удалось загрузить заявки — проверьте, что бэкенд запущен')
        } finally {
            setLoading(false)
        }
    }, [token, status])

    useEffect(() => { if (isAuthenticated) load() }, [isAuthenticated, load])

    async function move(id: number, to: ApplicationStatus) {
        if (!token) return
        setBusyId(id)
        try {
            await updateApplication(token, id, { status: to })
            setItems(prev => prev.filter(i => i.id !== id)) // ушла в другой статус — убираем из текущего списка
        } catch {
            setError('Не удалось изменить статус')
        } finally {
            setBusyId(null)
        }
    }

    async function remove(id: number) {
        if (!token) return
        setBusyId(id)
        try {
            await deleteApplication(token, id)
            setItems(prev => prev.filter(i => i.id !== id))
        } catch {
            setError('Не удалось удалить заявку')
        } finally {
            setBusyId(null)
        }
    }

    if (!isAuthenticated) return <NotAuthenticated />

    const { title, icon: Icon, empty } = meta[status]

    return (
        <div className="flex-1 overflow-y-auto bg-[#07111f]">
            <div className="px-8 pt-8 pb-4">
                <div className="flex items-center gap-2 mb-1">
                    <div className="w-7 h-7 bg-[rgba(0,198,167,0.12)] rounded-lg flex items-center justify-center">
                        <Icon size={14} className="text-[#00c6a7]" />
                    </div>
                    <h1 className="text-[26px] font-bold text-white tracking-tight"
                        style={{ fontFamily: "'Instrument Serif', serif" }}>
                        {title}
                    </h1>
                </div>
                <p className="text-[14px] text-[#3d5a72]">
                    {items.length > 0
                        ? <><span className="text-white font-medium">{items.length}</span> {items.length === 1 ? 'заявка' : 'заявок'}</>
                        : 'Список пуст'}
                </p>
            </div>

            <div className="px-8 pb-10">
                {error && (
                    <div className="px-4 py-3 bg-red-900/20 border border-red-800/40 rounded-xl text-[13px] text-red-400 mb-4">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="text-center py-20 text-[#3d5a72] text-[14px]">Загрузка…</div>
                ) : items.length > 0 ? (
                    <div className="flex flex-col gap-3">
                        {items.map(a => (
                            <ApplicationRow
                                key={a.id}
                                entry={a}
                                busy={busyId === a.id}
                                onMove={move}
                                onRemove={remove}
                            />
                        ))}
                    </div>
                ) : !error && (
                    <EmptyState icon={Icon} text={empty} />
                )}
            </div>
        </div>
    )
}

function ApplicationRow({ entry, busy, onMove, onRemove }: {
    entry: ApplicationEntry
    busy: boolean
    onMove: (id: number, to: ApplicationStatus) => void
    onRemove: (id: number) => void
}) {
    const navigate = useNavigate()
    const o = entry.opportunity
    const deadline = o?.deadline ? new Date(o.deadline).toLocaleDateString('ru-RU') : 'Без дедлайна'

    return (
        <div className={`bg-[#0c1e33] border border-[rgba(255,255,255,0.06)] rounded-xl p-5 flex flex-col gap-3 transition-opacity ${busy ? 'opacity-50 pointer-events-none' : ''}`}>
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-white/[0.05] text-[#7a9bb5]">
                        {typeLabels[entry.item_type]}
                    </span>
                    <h3
                        onClick={() => o && navigate(`/opportunity/${entry.item_type}/${entry.item_id}`)}
                        className={`text-[14.5px] font-semibold text-white leading-snug mt-2 line-clamp-2 ${o ? 'cursor-pointer hover:text-[#00c6a7]' : ''} transition-colors`}
                    >
                        {o?.title ?? `Возможность #${entry.item_id} (недоступна)`}
                    </h3>
                    {o && <p className="text-[12px] text-[#3d5a72] mt-0.5 truncate">{o.provider}</p>}
                </div>
                <button
                    onClick={() => onRemove(entry.id)}
                    aria-label="Удалить заявку"
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-[rgba(255,255,255,0.08)] text-[#3d5a72] hover:text-red-400 hover:border-red-800/50 hover:bg-red-900/10 transition-all flex-shrink-0"
                >
                    {busy ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                </button>
            </div>

            {o && (
                <div className="flex items-center gap-4 text-[12px] text-[#3d5a72]">
                    <span className="flex items-center gap-1.5"><Calendar size={12} />{deadline}</span>
                    {o.country && <span className="flex items-center gap-1.5"><MapPin size={12} />{o.country}</span>}
                </div>
            )}

            {entry.note && <p className="text-[12.5px] text-[#7a9bb5] italic">«{entry.note}»</p>}

            <div className="flex items-center justify-between gap-2 pt-2.5 border-t border-white/[0.05] flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                    {transitions[entry.status].map(t => (
                        <button
                            key={t.to}
                            onClick={() => onMove(entry.id, t.to)}
                            className="px-3 py-1.5 text-[12px] font-medium rounded-lg border border-[rgba(255,255,255,0.08)] text-[#7a9bb5] hover:border-[rgba(0,198,167,0.3)] hover:text-[#00c6a7] transition-all"
                        >
                            {t.label}
                        </button>
                    ))}
                </div>
                {o && (
                    <button
                        onClick={() => window.open(o.source_url, '_blank', 'noopener,noreferrer')}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 text-[12px] font-bold rounded-lg bg-[#00c6a7] text-[#07111f] hover:bg-[#00ddb9] active:scale-95 transition-all"
                    >
                        Открыть <ArrowUpRight size={12} />
                    </button>
                )}
            </div>
        </div>
    )
}

function EmptyState({ icon: Icon, text }: { icon: React.ElementType; text: string }) {
    const navigate = useNavigate()
    return (
        <div className="flex flex-col items-center justify-center py-24 gap-5 text-center">
            <div className="w-16 h-16 bg-[#0c1e33] border border-[rgba(255,255,255,0.06)] rounded-2xl flex items-center justify-center">
                <Icon size={24} className="text-[#3d5a72]" />
            </div>
            <div>
                <p className="text-white font-semibold text-[16px]">Пока пусто</p>
                <p className="text-[#3d5a72] text-[13px] mt-1 max-w-xs">{text}</p>
            </div>
            <button
                onClick={() => navigate('/dashboard')}
                className="px-6 py-2.5 bg-[#00c6a7] text-[#07111f] font-bold rounded-xl hover:bg-[#00ddb9] active:scale-95 transition-all text-[14px]"
            >
                Перейти к возможностям
            </button>
        </div>
    )
}

function NotAuthenticated() {
    const navigate = useNavigate()
    return (
        <div className="flex-1 flex flex-col items-center justify-center bg-[#07111f] gap-5">
            <div className="w-16 h-16 bg-[#0c1e33] border border-[rgba(255,255,255,0.06)] rounded-2xl flex items-center justify-center">
                <Lock size={24} className="text-[#3d5a72]" />
            </div>
            <div className="text-center">
                <p className="text-white font-semibold text-[16px]">Войдите, чтобы видеть заявки</p>
                <p className="text-[#3d5a72] text-[13px] mt-1 max-w-xs">Заявки привязаны к вашему аккаунту</p>
            </div>
            <button
                onClick={() => navigate('/auth')}
                className="px-6 py-2.5 bg-[#00c6a7] text-[#07111f] font-bold rounded-xl hover:bg-[#00ddb9] active:scale-95 transition-all text-[14px]"
            >
                Войти или зарегистрироваться
            </button>
        </div>
    )
}
