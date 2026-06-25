export type Grant = {
    id: number
    title: string
    provider: string
    amount: string
    currency: string
    deadline: string
    daysLeft: number
    country: string
    category: string
    tags: string[]
    matchScore: number
    status: 'open' | 'closing' | 'new'
    description: string
}

export const grants: Grant[] = [
    {
        id: 1,
        title: 'EU Horizon Research Grant 2025',
        provider: 'European Commission',
        amount: '50 000',
        currency: '€',
        deadline: '30 апр 2025',
        daysLeft: 3,
        country: 'ЕС',
        category: 'Наука',
        tags: ['Research', 'Science', 'EU'],
        matchScore: 94,
        status: 'closing',
        description: 'Финансирование научных исследований в области технологий и инноваций.'
    },
    {
        id: 2,
        title: 'Стипендия Болашак',
        provider: 'МОН Казахстан',
        amount: '25 000',
        currency: '$',
        deadline: '15 мая 2025',
        daysLeft: 18,
        country: 'Казахстан',
        category: 'Образование',
        tags: ['Стипендия', 'Казахстан', 'Образование'],
        matchScore: 87,
        status: 'open',
        description: 'Государственная стипендия для обучения за рубежом по приоритетным специальностям.'
    },
    {
        id: 3,
        title: 'Google.org Impact Challenge',
        provider: 'Google.org',
        amount: '100 000',
        currency: '$',
        deadline: '1 июн 2025',
        daysLeft: 35,
        country: 'Международный',
        category: 'IT / Tech',
        tags: ['Tech', 'Social Impact', 'Startup'],
        matchScore: 79,
        status: 'new',
        description: 'Поддержка технологических проектов с социальным воздействием.'
    },
    {
        id: 4,
        title: 'USAID Innovation Fund',
        provider: 'USAID',
        amount: '75 000',
        currency: '$',
        deadline: '20 июн 2025',
        daysLeft: 54,
        country: 'США / Международный',
        category: 'Инновации',
        tags: ['Innovation', 'Development', 'NGO'],
        matchScore: 71,
        status: 'open',
        description: 'Финансирование инновационных решений в области развития.'
    },
    {
        id: 5,
        title: 'Фонд Сорос — Open Society',
        provider: 'Open Society Foundations',
        amount: '30 000',
        currency: '$',
        deadline: '10 июл 2025',
        daysLeft: 74,
        country: 'Международный',
        category: 'Общество',
        tags: ['Civil Society', 'Democracy', 'Education'],
        matchScore: 65,
        status: 'open',
        description: 'Поддержка гражданского общества и демократических институтов.'
    },
    {
        id: 6,
        title: 'Erasmus+ Partnership Grant',
        provider: 'European Union',
        amount: '200 000',
        currency: '€',
        deadline: '5 авг 2025',
        daysLeft: 100,
        country: 'ЕС',
        category: 'Образование',
        tags: ['Education', 'Partnership', 'EU'],
        matchScore: 58,
        status: 'open',
        description: 'Грант для образовательных партнёрств между организациями EU.'
    },
]