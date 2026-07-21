import { useEffect, useState } from 'react'
import { ClipboardList, Check, Loader2 } from 'lucide-react'
import { useAuthContext } from '../context/AuthContext'
import {
    fetchApplications, createApplication, updateApplication, deleteApplication,
    type ApplicationEntry, type ApplicationStatus,
} from '../services/api'
import type { OpportunityType } from '../types'

const STAGES: { value: ApplicationStatus; label: string }[] = [
    { value: 'draft',     label: 'Черновик' },
    { value: 'active',    label: 'В работе' },
    { value: 'submitted', label: 'Подана'   },
]

// Блок «Моя заявка» на странице возможности: создать заявку, переключать
// статус (черновик → в работе → подана) или убрать. Именно отсюда заявки
// попадают на страницы «Активные / Поданные / Черновики».
export default function ApplicationTracker({ type, itemId }: { type: OpportunityType; itemId: number }) {
    const { isAuthenticated, token } = useAuthContext()
    const [entry, setEntry]     = useState<ApplicationEntry | null>(null)
    const [loading, setLoading] = useState(true)
    const [busy, setBusy]       = useState(false)
    const [error, setError]     = useState<string | null>(null)

    useEffect(() => {
        if (!token) { setLoading(false); return }
        let alive = true
        setLoading(true)
        fetchApplications(token)
            .then(list => {
                if (!alive) return
                setEntry(list.find(a => a.item_type === type && a.item_id === itemId) ?? null)
            })
            .catch(() => { if (alive) setError('Не удалось загрузить статус заявки') })
            .finally(() => { if (alive) setLoading(false) })
        return () => { alive = false }
    }, [token, type, itemId])

    async function reload() {
        if (!token) return
        const list = await fetchApplications(token)
        setEntry(list.find(a => a.item_type === type && a.item_id === itemId) ?? null)
    }

    async function add() {
        if (!token) return
        setBusy(true); setError(null)
        try {
            await createApplication(token, { item_type: type, item_id: itemId, status: 'draft' })
            await reload()
        } catch { setError('Не удалось создать заявку') }
        finally { setBusy(false) }
    }

    async function setStage(status: ApplicationStatus) {
        if (!token || !entry) return
        setBusy(true); setError(null)
        try {
            await updateApplication(token, entry.id, { status })
            await reload()
        } catch { setError('Не удалось изменить статус') }
        finally { setBusy(false) }
    }

    async function remove() {
        if (!token || !entry) return
        setBusy(true); setError(null)
        try {
            await deleteApplication(token, entry.id)
            setEntry(null)
        } catch { setError('Не удалось убрать заявку') }
        finally { setBusy(false) }
    }

    if (!isAuthenticated) return null

    return (
        <div className="bg-[#0c1e33] border border-[rgba(255,255,255,0.06)] rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
                <ClipboardList size={14} className="text-[#00c6a7]" />
                <h2 className="text-[13px] font-semibold text-[#7a9bb5] uppercase tracking-wider">Моя заявка</h2>
                {(loading || busy) && <Loader2 size={13} className="text-[#3d5a72] animate-spin ml-auto" />}
            </div>

            {error && <p className="text-[12px] text-red-400 mb-2">{error}</p>}

            {loading ? (
                <p className="text-[12.5px] text-[#3d5a72]">Проверяем статус…</p>
            ) : !entry ? (
                <button
                    onClick={add}
                    disabled={busy}
                    className="w-full py-2.5 rounded-lg bg-[rgba(0,198,167,0.12)] border border-[rgba(0,198,167,0.3)] text-[#00c6a7] text-[13px] font-semibold hover:bg-[rgba(0,198,167,0.18)] transition-all disabled:opacity-50"
                >
                    Добавить в заявки
                </button>
            ) : (
                <>
                    <div className="flex gap-1.5 mb-3">
                        {STAGES.map(s => {
                            const active = entry.status === s.value
                            return (
                                <button
                                    key={s.value}
                                    onClick={() => !active && setStage(s.value)}
                                    disabled={busy}
                                    className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-[12px] font-medium transition-all disabled:opacity-50
                                        ${active
                                            ? 'bg-[rgba(0,198,167,0.15)] border border-[rgba(0,198,167,0.4)] text-[#00c6a7]'
                                            : 'border border-[rgba(255,255,255,0.08)] text-[#7a9bb5] hover:text-white hover:border-[rgba(0,198,167,0.2)]'
                                        }`}
                                >
                                    {active && <Check size={11} />}
                                    {s.label}
                                </button>
                            )
                        })}
                    </div>
                    <button
                        onClick={remove}
                        disabled={busy}
                        className="w-full py-2 rounded-lg text-[12px] text-[#3d5a72] hover:text-red-400 transition-colors disabled:opacity-50"
                    >
                        Убрать из заявок
                    </button>
                </>
            )}
        </div>
    )
}
