"""Populate the local development database with demo internships."""
import asyncio

from app.db.main import AsyncSessionLocal
from app.schemes.internship import InternshipCreate
from app.services.internshipService import InternshipService


INTERNSHIPS = [
    {
        "title": "AI Research Intern",
        "description": "Paid remote internship in machine learning, data analysis and experimental AI research.",
        "source_url": "https://example.com/internships/ai-research",
        "provider": "GrantHub Demo Lab",
        "country": "Kazakhstan", "region": "Remote", "language": "en", "duration": "12 weeks", "paid": True,
    },
    {
        "title": "Backend Engineering Intern",
        "description": "Paid Python backend internship building APIs, databases and cloud services.",
        "source_url": "https://example.com/internships/backend",
        "provider": "GrantHub Demo Lab",
        "country": "Kazakhstan", "region": "Almaty", "language": "en", "duration": "10 weeks", "paid": True,
    },
    {
        "title": "Data Analyst Intern",
        "description": "Internship in analytics, SQL, dashboards and data science for students.",
        "source_url": "https://example.com/internships/data-analyst",
        "provider": "Data Insights Studio",
        "country": "Kazakhstan", "region": "Astana", "language": "en", "duration": "8 weeks", "paid": True,
    },
    {
        "title": "Cybersecurity Intern",
        "description": "Hands-on internship in application security, threat analysis and secure systems.",
        "source_url": "https://example.com/internships/cybersecurity",
        "provider": "Secure Future",
        "country": "Kazakhstan", "region": "Remote", "language": "en", "duration": "12 weeks", "paid": True,
    },
    {
        "title": "UX Research Intern",
        "description": "User research internship with usability testing and product discovery.",
        "source_url": "https://example.com/internships/ux-research",
        "provider": "Product Lab",
        "country": "Kazakhstan", "region": "Almaty", "language": "en", "duration": "8 weeks", "paid": False,
    },
    {
        "title": "Climate Tech Intern",
        "description": "Internship for students interested in clean energy, sustainability and climate technology.",
        "source_url": "https://example.com/internships/climate-tech",
        "provider": "Green Innovation Hub",
        "country": "Kazakhstan", "region": "Remote", "language": "en", "duration": "12 weeks", "paid": True,
    },
]


async def main() -> None:
    async with AsyncSessionLocal() as session:
        service = InternshipService()
        ids = [
            (await service.create_internship(InternshipCreate(**item), session)).id
            for item in INTERNSHIPS
        ]
    print({"internship_ids": ids})


if __name__ == "__main__":
    asyncio.run(main())
