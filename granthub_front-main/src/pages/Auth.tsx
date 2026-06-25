import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Sparkles, ArrowRight, Mail, Lock, User, Github } from 'lucide-react'

type Mode = 'login' | 'register'

export default function Auth() {
    const navigate = useNavigate()
    const [mode, setMode] = useState<Mode>('login')
    const [showPass, setShowPass] = useState(false)
    const [loading, setLoading] = useState(false)
    const [form, setForm] = useState({ name: '', email: '', password: '' })

    const handleSubmit = () => {
        setLoading(true)
        setTimeout(() => {
            setLoading(false)
            navigate('/')
        }, 1500)
    }

    const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm(prev => ({ ...prev, [key]: e.target.value }))

    return (
        <div className="min-h-screen bg-[#07111f] flex overflow-hidden">

            <div className="hidden lg:flex w-[52%] relative flex-col justify-between p-12 overflow-hidden">

                <div className="absolute inset-0"
                     style={{
                         backgroundImage: `linear-gradient(rgba(0,198,167,0.04) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(0,198,167,0.04) 1px, transparent 1px)`,
                         backgroundSize: '48px 48px'
                     }}
                />

                <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] rounded-full"
                     style={{ background: 'radial-gradient(circle, rgba(0,198,167,0.08) 0%, transparent 70%)' }}
                />
                <div className="absolute bottom-[-100px] right-[-50px] w-[400px] h-[400px] rounded-full"
                     style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)' }}
                />

                <div className="relative flex items-center gap-3">
                    <div className="w-9 h-9 bg-[#00c6a7] rounded-xl flex items-center justify-center text-[#07111f] font-bold text-lg"
                         style={{ fontFamily: "'Instrument Serif', serif" }}>
                        G
                    </div>
                    <span className="text-xl text-white font-bold"
                          style={{ fontFamily: "'Instrument Serif', serif" }}>
            Grant<span className="text-[#00c6a7]">Hub</span>.AI
          </span>
                </div>

                     <div className="relative">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[rgba(0,198,167,0.2)] bg-[rgba(0,198,167,0.06)] text-[#00c6a7] text-xs font-semibold mb-6">
                        <Sparkles size={11} />
                        Платформа с AI-поиском грантов
                    </div>

                    <h1 className="text-5xl font-bold text-white leading-tight mb-6"
                        style={{ fontFamily: "'Instrument Serif', serif", letterSpacing: '-1.5px' }}>
                        Найди грант,<br />
                        <span className="text-[#00c6a7]">который тебя</span><br />
                        ждёт
                    </h1>

                    <p className="text-[#7a9bb5] text-base leading-relaxed max-w-sm">
                        ИИ анализирует твой профиль и подбирает лучшие гранты, стипендии
                        и стажировки из 12 000+ возможностей.
                    </p>

                    <div className="flex gap-8 mt-10">
                        {[
                            { val: '12K+',  label: 'Грантов' },
                            { val: '94%',   label: 'Точность AI' },
                            { val: '3 мин', label: 'До первой заявки' },
                        ].map(({ val, label }) => (
                            <div key={label}>
                                <div className="text-2xl font-bold text-white"
                                     style={{ fontFamily: "'Instrument Serif', serif" }}>
                                    {val}
                                </div>
                                <div className="text-xs text-[#3d5a72] mt-0.5">{label}</div>
                            </div>
                        ))}
                    </div>
                </div>



            </div>

            <div className="flex-1 flex items-center justify-center px-8 py-12 relative">
                <div className="absolute inset-0 bg-[#050e1a]" />

                <div className="relative w-full max-w-sm">

                    <div className="mb-8">
                        <div className="flex lg:hidden items-center gap-2 mb-8">
                            <div className="w-8 h-8 bg-[#00c6a7] rounded-lg flex items-center justify-center text-[#07111f] font-bold text-sm">G</div>
                            <span className="text-lg font-bold text-white" style={{ fontFamily: "'Instrument Serif', serif" }}>
                Grant<span className="text-[#00c6a7]">Hub</span>.AI
              </span>
                        </div>

                        <h2 className="text-2xl font-bold text-white mb-1"
                            style={{ fontFamily: "'Instrument Serif', serif" }}>
                            {mode === 'login' ? 'С возвращением' : 'Создать аккаунт'}
                        </h2>
                        <p className="text-sm text-[#3d5a72]">
                            {mode === 'login'
                                ? 'Войдите, чтобы продолжить поиск грантов'
                                : 'Зарегистрируйтесь бесплатно — это займёт минуту'}
                        </p>
                    </div>

                    <div className="flex gap-3 mb-6">
                        <button className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-[rgba(255,255,255,0.08)] rounded-lg text-sm text-[#7a9bb5] hover:bg-[#0c1e33] hover:text-white transition-all">
                            <svg width="16" height="16" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                            Google
                        </button>
                        <button className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-[rgba(255,255,255,0.08)] rounded-lg text-sm text-[#7a9bb5] hover:bg-[#0c1e33] hover:text-white transition-all">
                            <Github size={16} />
                            GitHub
                        </button>
                    </div>


                    <div className="flex items-center gap-3 mb-6">
                        <div className="flex-1 h-px bg-[rgba(255,255,255,0.06)]" />
                        <span className="text-xs text-[#3d5a72]">или через email</span>
                        <div className="flex-1 h-px bg-[rgba(255,255,255,0.06)]" />
                    </div>

                    <div className="flex flex-col gap-4">

                        {mode === 'register' && (
                            <div>
                                <label className="block text-xs font-semibold text-[#7a9bb5] mb-1.5 uppercase tracking-wider">
                                    Имя
                                </label>
                                <div className="relative">
                                    <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3d5a72]" />
                                    <input
                                        type="text"
                                        value={form.name}
                                        onChange={set('name')}
                                        placeholder="Алуа Нурмагамбетова"
                                        className="w-full pl-10 pr-4 py-3 bg-[#0c1e33] border border-[rgba(255,255,255,0.08)] rounded-xl text-[13.5px] text-white placeholder-[#3d5a72] focus:outline-none focus:ring-2 focus:ring-[rgba(0,198,167,0.25)] focus:border-[#00c6a7] transition-all"
                                    />
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-semibold text-[#7a9bb5] mb-1.5 uppercase tracking-wider">
                                Email
                            </label>
                            <div className="relative">
                                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3d5a72]" />
                                <input
                                    type="email"
                                    value={form.email}
                                    onChange={set('email')}
                                    placeholder="alua@gmail.com"
                                    className="w-full pl-10 pr-4 py-3 bg-[#0c1e33] border border-[rgba(255,255,255,0.08)] rounded-xl text-[13.5px] text-white placeholder-[#3d5a72] focus:outline-none focus:ring-2 focus:ring-[rgba(0,198,167,0.25)] focus:border-[#00c6a7] transition-all"
                                />
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between mb-1.5">
                                <label className="block text-xs font-semibold text-[#7a9bb5] uppercase tracking-wider">
                                    Пароль
                                </label>
                                {mode === 'login' && (
                                    <button className="text-xs text-[#00c6a7] hover:text-white transition-colors">
                                        Забыли пароль?
                                    </button>
                                )}
                            </div>
                            <div className="relative">
                                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3d5a72]" />
                                <input
                                    type={showPass ? 'text' : 'password'}
                                    value={form.password}
                                    onChange={set('password')}
                                    placeholder="••••••••"
                                    className="w-full pl-10 pr-10 py-3 bg-[#0c1e33] border border-[rgba(255,255,255,0.08)] rounded-xl text-[13.5px] text-white placeholder-[#3d5a72] focus:outline-none focus:ring-2 focus:ring-[rgba(0,198,167,0.25)] focus:border-[#00c6a7] transition-all"
                                />
                                <button
                                    onClick={() => setShowPass(!showPass)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#3d5a72] hover:text-[#7a9bb5] transition-colors"
                                >
                                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                                </button>
                            </div>

                            {mode === 'register' && form.password.length > 0 && (
                                <div className="mt-2">
                                    <div className="flex gap-1">
                                        {[1,2,3,4].map(i => (
                                            <div key={i} className="flex-1 h-1 rounded-full transition-all duration-300"
                                                 style={{
                                                     background: i <= Math.min(4, Math.floor(form.password.length / 3))
                                                         ? (form.password.length < 6 ? '#f5a623' : form.password.length < 10 ? '#00c6a7' : '#22c55e')
                                                         : 'rgba(255,255,255,0.06)'
                                                 }}
                                            />
                                        ))}
                                    </div>
                                    <p className="text-[10px] text-[#3d5a72] mt-1">
                                        {form.password.length < 6 ? 'Слабый пароль' : form.password.length < 10 ? 'Хороший пароль' : 'Надёжный пароль ✓'}
                                    </p>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#00c6a7] text-[#07111f] font-bold rounded-xl hover:bg-[#00ddb9] active:scale-[0.98] transition-all text-[15px] mt-1 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-[#07111f] border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>
                                    {mode === 'login' ? 'Войти' : 'Создать аккаунт'}
                                    <ArrowRight size={16} />
                                </>
                            )}
                        </button>
                    </div>

                    <p className="text-center text-sm text-[#3d5a72] mt-6">
                        {mode === 'login' ? 'Нет аккаунта?' : 'Уже есть аккаунт?'}{' '}
                        <button
                            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                            className="text-[#00c6a7] font-semibold hover:text-white transition-colors"
                        >
                            {mode === 'login' ? 'Зарегистрироваться' : 'Войти'}
                        </button>
                    </p>

                    {mode === 'register' && (
                        <p className="text-center text-[11px] text-[#3d5a72] mt-4 leading-relaxed">
                            Регистрируясь, вы соглашаетесь с{' '}
                            <span className="text-[#00c6a7] cursor-pointer hover:underline">Условиями использования</span>
                            {' '}и{' '}
                            <span className="text-[#00c6a7] cursor-pointer hover:underline">Политикой конфиденциальности</span>
                        </p>
                    )}
                </div>
            </div>
        </div>
    )
}